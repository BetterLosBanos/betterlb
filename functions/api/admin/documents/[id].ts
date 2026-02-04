/**
 * Admin Documents API
 * GET /api/admin/documents/:id - Get document details for editing
 * PATCH /api/admin/documents/:id - Update document data
 */
import { Env } from '../../../types';
import { AuthContext, withAuth } from '../../../utils/admin-auth';

interface Person {
  id: string;
  first_name: string;
  middle_name: string | null;
  last_name: string;
}

interface DocumentUpdateData {
  type?: 'ordinance' | 'resolution' | 'executive_order';
  number?: string;
  title?: string;
  status?: string;
  date_enacted?: string;
  moved_by?: string;
  seconded_by?: string;
  review_notes?: string;
  needs_review?: number;
  authors?: Person[];
  subjects?: string[];
}

/**
 * PATCH /api/admin/documents/:id
 * Update a document's data
 */
async function handlePatchDocument(context: {
  request: Request;
  env: Env;
  auth: AuthContext;
}) {
  const { request, env } = context;
  const url = new URL(request.url);
  const pathParts = url.pathname.split('/').filter(Boolean);
  const documentId = pathParts[pathParts.length - 1];

  if (!documentId) {
    return Response.json({ error: 'Missing document id' }, { status: 400 });
  }

  try {
    const body = (await request.json()) as DocumentUpdateData;

    // Update main document fields
    const updateFields: string[] = [];
    const updateValues: (string | number)[] = [];
    let paramIndex = 1;

    if (body.title !== undefined) {
      updateFields.push(`title = ?${paramIndex++}`);
      updateValues.push(body.title);
    }
    if (body.number !== undefined) {
      updateFields.push(`number = ?${paramIndex++}`);
      updateValues.push(body.number);
    }
    if (body.type !== undefined) {
      updateFields.push(`type = ?${paramIndex++}`);
      updateValues.push(body.type);
    }
    if (body.status !== undefined) {
      updateFields.push(`status = ?${paramIndex++}`);
      updateValues.push(body.status);
    }
    if (body.date_enacted !== undefined) {
      updateFields.push(`date_enacted = ?${paramIndex++}`);
      updateValues.push(body.date_enacted);
    }
    if (body.moved_by !== undefined) {
      updateFields.push(`moved_by = ?${paramIndex++}`);
      updateValues.push(body.moved_by);
    }
    if (body.seconded_by !== undefined) {
      updateFields.push(`seconded_by = ?${paramIndex++}`);
      updateValues.push(body.seconded_by);
    }
    if (body.review_notes !== undefined) {
      updateFields.push(`review_notes = ?${paramIndex++}`);
      updateValues.push(body.review_notes);
    }
    if (body.needs_review !== undefined) {
      updateFields.push(`needs_review = ?${paramIndex++}`);
      updateValues.push(body.needs_review);
    }

    updateFields.push(`updated_at = ?${paramIndex++}`);
    updateValues.push(new Date().toISOString());

    if (updateFields.length > 0) {
      updateValues.push(documentId);
      const updateSql = `
        UPDATE documents
        SET ${updateFields.join(', ')}
        WHERE id = ?${paramIndex}
      `;

      await env.BETTERLB_DB.prepare(updateSql)
        .bind(...updateValues)
        .run();
    }

    // Update authors if provided
    if (body.authors !== undefined) {
      // Delete existing authors
      await env.BETTERLB_DB.prepare(
        `DELETE FROM document_authors WHERE document_id = ?1`
      )
        .bind(documentId)
        .run();

      // Add new authors
      for (const author of body.authors) {
        // Check if person exists, create if not
        let personId = author.id;

        if (!personId || personId.startsWith('temp_')) {
          // Try to find existing person
          const existingPerson = await env.BETTERLB_DB.prepare(
            `SELECT id FROM persons WHERE first_name = ?1 AND last_name = ?2`
          )
            .bind(author.first_name, author.last_name)
            .first();

          if (existingPerson) {
            personId = existingPerson.id;
          } else {
            // Create new person
            personId = `person_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
            await env.BETTERLB_DB.prepare(
              `INSERT INTO persons (id, first_name, middle_name, last_name) VALUES (?1, ?2, ?3, ?4)`
            )
              .bind(
                personId,
                author.first_name,
                author.middle_name || null,
                author.last_name
              )
              .run();
          }
        }

        // Add document-author relationship
        await env.BETTERLB_DB.prepare(
          `INSERT OR IGNORE INTO document_authors (document_id, person_id) VALUES (?1, ?2)`
        )
          .bind(documentId, personId)
          .run();
      }
    }

    // Update subjects if provided
    if (body.subjects !== undefined) {
      // Delete existing subjects
      await env.BETTERLB_DB.prepare(
        `DELETE FROM document_subjects WHERE document_id = ?1`
      )
        .bind(documentId)
        .run();

      // Add new subjects
      for (const subjectName of body.subjects) {
        // Find or create subject
        let subject = await env.BETTERLB_DB.prepare(
          `SELECT id FROM subjects WHERE name = ?1`
        )
          .bind(subjectName)
          .first();

        if (!subject) {
          const subjectId = `subject_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
          await env.BETTERLB_DB.prepare(
            `INSERT INTO subjects (id, name) VALUES (?1, ?2)`
          )
            .bind(subjectId, subjectName)
            .run();
          subject = { id: subjectId };
        }

        // Add document-subject relationship
        await env.BETTERLB_DB.prepare(
          `INSERT OR IGNORE INTO document_subjects (document_id, subject_id) VALUES (?1, ?2)`
        )
          .bind(documentId, subject.id)
          .run();
      }
    }

    // Fetch and return updated document
    const doc = await env.BETTERLB_DB.prepare(
      `SELECT * FROM documents WHERE id = ?1`
    )
      .bind(documentId)
      .first<any>();

    return Response.json({
      success: true,
      document: doc,
    });
  } catch (error) {
    console.error('Error updating document:', error);
    return Response.json(
      { error: 'Failed to update document' },
      { status: 500 }
    );
  }
}

/**
 * GET /api/admin/documents/:id
 * Get document details for editing
 */
async function handleGetDocument(context: {
  request: Request;
  env: Env;
  auth: AuthContext;
}) {
  const { env, request } = context;
  const url = new URL(request.url);
  const pathParts = url.pathname.split('/').filter(Boolean);
  const documentId = pathParts[pathParts.length - 1];

  if (!documentId) {
    return Response.json({ error: 'Missing document id' }, { status: 400 });
  }

  try {
    const sql = `
      SELECT
        d.id, d.type, d.number, d.title, d.session_id, d.status,
        d.date_enacted, d.date_filed, d.pdf_url,
        d.moved_by, d.seconded_by, d.source_type,
        d.needs_review, d.review_notes, d.processed,
        d.created_at, d.updated_at
      FROM documents d
      WHERE d.id = ?
    `;

    const doc = await env.BETTERLB_DB.prepare(sql)
      .bind(documentId)
      .first<any>();

    if (!doc) {
      return Response.json({ error: 'Document not found' }, { status: 404 });
    }

    // Get authors
    const authorsSql = `
      SELECT p.id, p.first_name, p.middle_name, p.last_name
      FROM document_authors da
      JOIN persons p ON da.person_id = p.id
      WHERE da.document_id = ?
    `;
    const authorsResult = await env.BETTERLB_DB.prepare(authorsSql)
      .bind(documentId)
      .all();
    const authors = authorsResult.results.map((row: any) => ({
      id: row.id,
      first_name: row.first_name,
      middle_name: row.middle_name,
      last_name: row.last_name,
    }));

    // Get subjects
    const subjectsSql = `
      SELECT s.name
      FROM document_subjects ds
      JOIN subjects s ON ds.subject_id = s.id
      WHERE ds.document_id = ?
    `;
    const subjectsResult = await env.BETTERLB_DB.prepare(subjectsSql)
      .bind(documentId)
      .all();
    const subjects = subjectsResult.results.map((row: any) => row.name);

    return Response.json({
      id: doc.id,
      type: doc.type,
      number: doc.number,
      title: doc.title,
      session_id: doc.session_id,
      status: doc.status,
      date_enacted: doc.date_enacted,
      date_filed: doc.date_filed,
      pdf_url: doc.pdf_url,
      moved_by: doc.moved_by,
      seconded_by: doc.seconded_by,
      source_type: doc.source_type,
      needs_review: doc.needs_review,
      review_notes: doc.review_notes,
      processed: doc.processed,
      created_at: doc.created_at,
      updated_at: doc.updated_at,
      authors,
      subjects,
    });
  } catch (error) {
    console.error('Error fetching document:', error);
    return Response.json(
      { error: 'Failed to fetch document' },
      { status: 500 }
    );
  }
}

export const onRequestGet = (context: { request: Request; env: Env }) =>
  withAuth(handleGetDocument as any)(context as any);

export const onRequestPatch = (context: { request: Request; env: Env }) =>
  withAuth(handlePatchDocument as any)(context as any);
