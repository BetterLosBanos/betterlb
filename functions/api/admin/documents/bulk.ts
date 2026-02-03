/**
 * Admin Documents Bulk API
 * POST /api/admin/documents/bulk - Bulk create documents with authors
 */

import { Env } from '../../../types';
import { withAuth, AuthContext } from '../../../utils/admin-auth';

/**
 * Bulk Create Request Interface
 */
interface BulkCreateRequest {
  session_id: string;
  documents: Array<{
    type: 'ordinance' | 'resolution' | 'executive_order';
    number: string;
    title: string;
    authors: Array<{ person_id: string; is_new?: boolean; name?: string }>;
    seconded_by?: string;  // person_id or null
    moved_by?: string;     // person_id or null
  }>;
  skip_duplicates?: boolean; // If true, skip duplicates instead of erroring
}

interface ExistingDocument {
  id: string;
  type: string;
  number: string;
  title: string;
  date_enacted: string;
  status: string;
  session_id: string;
}

interface BulkCreateResponse {
  success: boolean;
  created: Array<{ document_id: string; number: string }>;
  duplicates: Array<{
    index: number;
    existing: ExistingDocument;
    proposed: {
      type: string;
      number: string;
      title: string;
    };
  }>;
  errors: Array<{ index: number; message: string }>;
}

/**
 * POST /api/admin/documents/bulk
 * Bulk create documents with authors
 */
async function handleBulkCreateDocuments(context: {
  request: Request;
  env: Env;
  auth: AuthContext;
}) {
  const { request, env } = context;

  try {
    const body = await request.json() as BulkCreateRequest;

    if (!body.session_id || !body.documents || body.documents.length === 0) {
      return Response.json(
        { error: 'Missing required fields: session_id, documents' },
        { status: 400 }
      );
    }

    const created: Array<{ document_id: string; number: string }> = [];
    const duplicates: Array<{
      index: number;
      existing: ExistingDocument;
      proposed: { type: string; number: string; title: string };
    }> = [];
    const errors: Array<{ index: number; message: string }> = [];

    // Process each document
    for (let i = 0; i < body.documents.length; i++) {
      const doc = body.documents[i];

      try {
        // Validate required fields
        if (!doc.type || !doc.number || !doc.title) {
          errors.push({ index: i, message: 'Missing required fields: type, number, title' });
          continue;
        }

        // Check if document with this number already exists
        const existing = await env.BETTERLB_DB.prepare(
          `SELECT id, type, number, title, date_enacted, status, session_id
             FROM documents WHERE number = ?1`
        ).bind(doc.number).first<ExistingDocument>();

        if (existing) {
          // Duplicate detected
          duplicates.push({
            index: i,
            existing,
            proposed: {
              type: doc.type,
              number: doc.number,
              title: doc.title,
            },
          });

          // If skip_duplicates is true, don't add to errors
          if (!body.skip_duplicates) {
            errors.push({ index: i, message: `Document ${doc.number} already exists` });
          }
          continue;
        }

        // Generate document ID
        const documentId = `doc_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

        // Insert document
        await env.BETTERLB_DB.prepare(
          `INSERT INTO documents (id, type, number, title, session_id, status, source_type, moved_by, seconded_by, processed)
           VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7, ?8, ?9, ?10)`
        ).bind(
          documentId,
          doc.type,
          doc.number,
          doc.title,
          body.session_id,
          'pending',
          'facebook',
          doc.moved_by || null,
          doc.seconded_by || null,
          0
        ).run();

        // Insert authors
        if (doc.authors && doc.authors.length > 0) {
          for (const author of doc.authors) {
            if (author.person_id && !author.is_new) {
              await env.BETTERLB_DB.prepare(
                `INSERT INTO document_authors (document_id, person_id, author_type)
                 VALUES (?1, ?2, ?3)`
              ).bind(documentId, author.person_id, 'primary').run();
            }
          }
        }

        created.push({ document_id: documentId, number: doc.number });
      } catch (error) {
        console.error(`Error creating document at index ${i}:`, error);
        errors.push({ index: i, message: error instanceof Error ? error.message : 'Unknown error' });
      }
    }

    return Response.json({
      success: true,
      created,
      duplicates,
      errors,
    } satisfies BulkCreateResponse);
  } catch (error) {
    console.error('Error in bulk create:', error);
    return Response.json({ error: 'Failed to bulk create documents' }, { status: 500 });
  }
}

export const onRequestPost = withAuth(handleBulkCreateDocuments);
