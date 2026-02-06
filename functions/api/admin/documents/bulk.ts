/**
 * Admin Documents Bulk API
 * POST /api/admin/documents/bulk - Bulk create documents with authors
 */
import { Env } from '../../../types';
import { AuthContext, withAuth } from '../../../utils/admin-auth';
import { parseJsonBody, validateJsonContentType } from '../../../utils/request';

const MAX_BATCH_SIZE = 100;

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
    seconded_by?: string; // person_id or null
    moved_by?: string; // person_id or null
  }>;
  skip_duplicates?: boolean; // If true, skip duplicates instead of erroring
}

interface DocumentAuthor {
  person_id: string;
  first_name: string;
  last_name: string;
  full_name: string;
}

interface ExistingDocument {
  id: string;
  type: string;
  number: string;
  title: string;
  date_enacted: string;
  status: string;
  session_id: string;
  authors: DocumentAuthor[];
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
  const { request, env, auth } = context;

  // Validate Content-Type
  if (!validateJsonContentType(request)) {
    return Response.json(
      { error: 'Content-Type must be application/json' },
      { status: 415 }
    );
  }

  try {
    const body = await parseJsonBody<BulkCreateRequest>(request, 1_000_000);

    if (!body.session_id || !body.documents || body.documents.length === 0) {
      return Response.json(
        { error: 'Missing required fields: session_id, documents' },
        { status: 400 }
      );
    }

    // Validate array size to prevent DoS
    if (body.documents.length > MAX_BATCH_SIZE) {
      return Response.json(
        {
          error: `Cannot process more than ${MAX_BATCH_SIZE} documents at once`,
        },
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
          errors.push({
            index: i,
            message: 'Missing required fields: type, number, title',
          });
          continue;
        }

        // Check if document with this number already exists
        const existing = await env.BETTERLB_DB.prepare(
          `SELECT id, type, number, title, date_enacted, status, session_id
             FROM documents WHERE number = ?1`
        )
          .bind(doc.number)
          .first<Omit<ExistingDocument, 'authors'>>();

        if (existing) {
          // Fetch authors for the existing document
          const authorsResult = await env.BETTERLB_DB.prepare(
            `SELECT p.id, p.first_name, p.last_name, p.first_name || ' ' || p.last_name as full_name
               FROM document_authors da
               JOIN persons p ON da.person_id = p.id
               WHERE da.document_id = ?1`
          )
            .bind(existing.id)
            .all();

          const existingWithAuthors: ExistingDocument = {
            ...existing,
            authors: authorsResult.results.map(row => ({
              person_id: row.id,
              first_name: row.first_name,
              last_name: row.last_name,
              full_name: row.full_name,
            })),
          };

          if (body.skip_duplicates) {
            duplicates.push({
              index: i,
              existing: existingWithAuthors,
              proposed: {
                type: doc.type,
                number: doc.number,
                title: doc.title,
              },
            });
          } else {
            errors.push({
              index: i,
              message: `Document ${doc.number} already exists`,
            });
          }
          continue;
        }

        // Generate document ID
        const documentId = `doc_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

        // Insert document with success checking
        const insertResult = await env.BETTERLB_DB.prepare(
          `INSERT INTO documents (id, type, number, title, session_id, status, source_type, moved_by, seconded_by, processed)
           VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7, ?8, ?9, ?10)`
        )
          .bind(
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
          )
          .run();

        if (!insertResult.success || insertResult.meta.changes === 0) {
          throw new Error(`Failed to insert document ${doc.number}`);
        }

        // Insert authors
        if (doc.authors && doc.authors.length > 0) {
          for (const author of doc.authors) {
            if (author.person_id && !author.is_new) {
              const authorResult = await env.BETTERLB_DB.prepare(
                `INSERT INTO document_authors (document_id, person_id, author_type)
                 VALUES (?1, ?2, ?3)`
              )
                .bind(documentId, author.person_id, 'primary')
                .run();

              if (!authorResult.success) {
                console.error(
                  `Failed to insert author ${author.person_id} for document ${doc.number}`
                );
              }
            }
          }
        }

        created.push({ document_id: documentId, number: doc.number });
      } catch (error) {
        console.error(`Error creating document at index ${i}:`, error);
        errors.push({
          index: i,
          message: error instanceof Error ? error.message : 'Unknown error',
        });
      }
    }

    // Log to audit trail
    try {
      await env.BETTERLB_DB.prepare(
        `INSERT INTO admin_audit_log (action, performed_by, target_type, target_id, details, created_at)
         VALUES (?1, ?2, ?3, ?4, ?5, datetime('now'))`
      )
        .bind(
          'bulk_create_documents',
          auth.user.login,
          'batch',
          body.session_id,
          JSON.stringify({
            created_count: created.length,
            duplicate_count: duplicates.length,
            error_count: errors.length,
          })
        )
        .run();
    } catch (logError) {
      console.error('Failed to write audit log:', logError);
    }

    return Response.json({
      success: true,
      created,
      duplicates,
      errors,
    } satisfies BulkCreateResponse);
  } catch (error) {
    console.error('Error in bulk create:', error);
    if (error instanceof Error && error.message.includes('JSON')) {
      return Response.json(
        { error: 'Invalid JSON in request body' },
        { status: 400 }
      );
    }
    return Response.json(
      { error: 'Failed to bulk create documents' },
      { status: 500 }
    );
  }
}

export const onRequestPost = withAuth(handleBulkCreateDocuments);
