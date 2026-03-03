/**
 * Admin Documents Duplicate Resolution API
 * POST /api/admin/documents/resolve-duplicate - Resolve/merge duplicate documents
 */
import { Env } from '../../../types';
import { AuthContext, withAuth } from '../../../utils/admin-auth';

/**
 * Resolution Actions:
 * - keep_existing: Keep the existing document, ignore the new one
 * - replace_existing: Replace existing with new data (update)
 * - merge: Merge data from both documents (keep existing, add missing authors, update fields if provided)
 */
type ResolutionAction = 'keep_existing' | 'replace_existing' | 'merge';

interface ResolveDuplicateRequest {
  existing_document_id: string;
  new_document: {
    type: 'ordinance' | 'resolution' | 'executive_order';
    number: string;
    title: string;
    authors: Array<{ person_id: string; is_new?: boolean; name?: string }>;
    seconded_by?: string;
    moved_by?: string;
    session_id?: string;
  };
  action: ResolutionAction;
  // For merge/replace, which fields to update
  update_fields?: {
    title?: boolean;
    authors?: boolean;
    session_id?: boolean;
    moved_by?: boolean;
    seconded_by?: boolean;
  };
}

interface ResolveDuplicateResponse {
  success: boolean;
  action_taken: ResolutionAction;
  document_id: string;
  message: string;
}

/**
 * POST /api/admin/documents/resolve-duplicate
 * Resolve/merge duplicate documents
 */
async function handleResolveDuplicate(context: {
  request: Request;
  env: Env;
  auth: AuthContext;
}) {
  const { request, env } = context;

  try {
    const body = (await request.json()) as ResolveDuplicateRequest;

    if (!body.existing_document_id || !body.new_document || !body.action) {
      return Response.json(
        {
          error:
            'Missing required fields: existing_document_id, new_document, action',
        },
        { status: 400 }
      );
    }

    // Get existing document
    const existing = await env.BETTERLB_DB.prepare(
      `SELECT id, type, number, title, session_id, moved_by, seconded_by
         FROM documents WHERE id = ?1`
    )
      .bind(body.existing_document_id)
      .first<{
        id: string;
        type: string;
        number: string;
        title: string;
        session_id: string | null;
        moved_by: string | null;
        seconded_by: string | null;
      }>();

    if (!existing) {
      return Response.json(
        { error: 'Existing document not found' },
        { status: 404 }
      );
    }

    const updateFields = body.update_fields || {};

    if (body.action === 'keep_existing') {
      // Do nothing, just confirm
      return Response.json({
        success: true,
        action_taken: 'keep_existing',
        document_id: existing.id,
        message: 'Kept existing document, ignored new data',
      } satisfies ResolveDuplicateResponse);
    }

    if (body.action === 'replace_existing') {
      // Update existing document with new data
      const updates: string[] = [];
      const params: (string | null)[] = [];
      let paramIndex = 1;

      if (updateFields.title) {
        updates.push(`title = ?${paramIndex++}`);
        params.push(body.new_document.title);
      }
      if (updateFields.session_id && body.new_document.session_id) {
        updates.push(`session_id = ?${paramIndex++}`);
        params.push(body.new_document.session_id);
      }
      if (updateFields.moved_by !== undefined) {
        updates.push(`moved_by = ?${paramIndex++}`);
        params.push(body.new_document.moved_by || null);
      }
      if (updateFields.seconded_by !== undefined) {
        updates.push(`seconded_by = ?${paramIndex++}`);
        params.push(body.new_document.seconded_by || null);
      }

      if (updates.length > 0) {
        updates.push(`updated_at = datetime('now')`);
        params.push(existing.id);

        await env.BETTERLB_DB.prepare(
          `UPDATE documents SET ${updates.join(', ')} WHERE id = ?${paramIndex}`
        )
          .bind(...params)
          .run();
      }

      // Replace authors if requested
      if (updateFields.authors) {
        // Delete existing authors
        await env.BETTERLB_DB.prepare(
          `DELETE FROM document_authors WHERE document_id = ?1`
        )
          .bind(existing.id)
          .run();

        // Add new authors
        if (body.new_document.authors && body.new_document.authors.length > 0) {
          for (const author of body.new_document.authors) {
            if (author.person_id && !author.is_new) {
              await env.BETTERLB_DB.prepare(
                `INSERT INTO document_authors (document_id, person_id, author_type)
                 VALUES (?1, ?2, ?3)`
              )
                .bind(existing.id, author.person_id, 'primary')
                .run();
            }
          }
        }
      }

      return Response.json({
        success: true,
        action_taken: 'replace_existing',
        document_id: existing.id,
        message: 'Updated existing document with new data',
      } satisfies ResolveDuplicateResponse);
    }

    if (body.action === 'merge') {
      // Merge: update fields if they're missing in existing, add missing authors
      const updates: string[] = [];
      const params: (string | null)[] = [];
      let paramIndex = 1;

      // Update title if existing is empty or generic
      if (
        updateFields.title &&
        (!existing.title || existing.title.length < 20)
      ) {
        updates.push(`title = ?${paramIndex++}`);
        params.push(body.new_document.title);
      }

      // Update session_id if existing doesn't have one
      if (
        updateFields.session_id &&
        body.new_document.session_id &&
        !existing.session_id
      ) {
        updates.push(`session_id = ?${paramIndex++}`);
        params.push(body.new_document.session_id);
      }

      // Update moved_by if existing doesn't have one
      if (
        updateFields.moved_by &&
        body.new_document.moved_by &&
        !existing.moved_by
      ) {
        updates.push(`moved_by = ?${paramIndex++}`);
        params.push(body.new_document.moved_by);
      }

      // Update seconded_by if existing doesn't have one
      if (
        updateFields.seconded_by &&
        body.new_document.seconded_by &&
        !existing.seconded_by
      ) {
        updates.push(`seconded_by = ?${paramIndex++}`);
        params.push(body.new_document.seconded_by);
      }

      if (updates.length > 0) {
        updates.push(`updated_at = datetime('now')`);
        params.push(existing.id);

        await env.BETTERLB_DB.prepare(
          `UPDATE documents SET ${updates.join(', ')} WHERE id = ?${paramIndex}`
        )
          .bind(...params)
          .run();
      }

      // Merge authors if requested (add missing ones)
      if (
        updateFields.authors &&
        body.new_document.authors &&
        body.new_document.authors.length > 0
      ) {
        // Get existing authors
        const existingAuthors = await env.BETTERLB_DB.prepare(
          `SELECT person_id FROM document_authors WHERE document_id = ?1`
        )
          .bind(existing.id)
          .all<{ person_id: string }>();

        const existingAuthorIds = new Set(
          existingAuthors.results.map(a => a.person_id)
        );

        // Add new authors that don't exist
        for (const author of body.new_document.authors) {
          if (
            author.person_id &&
            !author.is_new &&
            !existingAuthorIds.has(author.person_id)
          ) {
            await env.BETTERLB_DB.prepare(
              `INSERT INTO document_authors (document_id, person_id, author_type)
               VALUES (?1, ?2, ?3)`
            )
              .bind(existing.id, author.person_id, 'primary')
              .run();
          }
        }
      }

      return Response.json({
        success: true,
        action_taken: 'merge',
        document_id: existing.id,
        message: 'Merged new data into existing document',
      } satisfies ResolveDuplicateResponse);
    }

    return Response.json({ error: 'Invalid action' }, { status: 400 });
  } catch (error) {
    console.error('Error resolving duplicate:', error);
    return Response.json(
      { error: 'Failed to resolve duplicate' },
      { status: 500 }
    );
  }
}

export const onRequestPost = withAuth(handleResolveDuplicate);
