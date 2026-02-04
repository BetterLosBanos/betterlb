/**
 * Admin Person Deletion Queue API
 * GET /api/admin/persons-deletion-queue - List soft-deleted persons
 * POST /api/admin/persons-deletion-queue/restore - Restore a soft-deleted person
 * POST /api/admin/persons-deletion-queue/permanent-delete - Permanently delete a person
 */
import { Env } from '../../types';
import { AuthContext, withAuth } from '../../utils/admin-auth';

interface Person {
  id: string;
  first_name: string;
  middle_name: string | null;
  last_name: string;
  suffix?: string | null;
  deleted_at: string;
}

interface QueueResponse {
  persons: Array<Person & { full_name: string; deleted_by?: string }>;
}

/**
 * GET /api/admin/persons-deletion-queue
 * Returns list of soft-deleted (flagged) persons
 */
async function handleGetQueue(context: {
  request: Request;
  env: Env;
  auth: AuthContext;
}) {
  const { request, env } = context;

  try {
    const url = new URL(request.url);
    const limit = parseInt(url.searchParams.get('limit') || '50');

    const sql = `
      SELECT
        p.id, p.first_name, p.middle_name, p.last_name, p.suffix, p.deleted_at,
        al.performed_by as deleted_by
      FROM persons p
      LEFT JOIN admin_audit_log al ON al.action = 'merge_persons'
        AND al.target_id = p.id
      WHERE p.deleted_at IS NOT NULL
      ORDER BY p.deleted_at DESC
      LIMIT ?1
    `;

    const results = await env.BETTERLB_DB.prepare(sql).bind(limit).all();

    const persons: Array<Person & { full_name: string; deleted_by?: string }> =
      [];

    for (const row of results.results as Array<
      typeof results.results extends (infer T)[] ? T : never
    >) {
      const parts = [row.first_name, row.middle_name, row.last_name];
      if (row.suffix) parts.push(row.suffix);
      persons.push({
        id: row.id,
        first_name: row.first_name,
        middle_name: row.middle_name,
        last_name: row.last_name,
        suffix: row.suffix,
        deleted_at: row.deleted_at,
        full_name: parts.filter(Boolean).join(' '),
        deleted_by: row.deleted_by,
      });
    }

    return Response.json({ persons } satisfies QueueResponse);
  } catch (error) {
    console.error('Error fetching deletion queue:', error);
    return Response.json(
      { error: 'Failed to fetch deletion queue' },
      { status: 500 }
    );
  }
}

interface RestoreRequest {
  person_id: string;
}

/**
 * POST /api/admin/persons-deletion-queue/restore
 * Restore a soft-deleted person
 */
async function handleRestore(context: {
  request: Request;
  env: Env;
  auth: AuthContext;
}) {
  const { request, env, auth } = context;

  try {
    const body = (await request.json()) as RestoreRequest;
    const { person_id } = body;

    if (!person_id) {
      return Response.json({ error: 'Missing person_id' }, { status: 400 });
    }

    // Check if person exists and is soft-deleted
    const person = await env.BETTERLB_DB.prepare(
      `SELECT id, deleted_at FROM persons WHERE id = ?1`
    )
      .bind(person_id)
      .first();

    if (!person) {
      return Response.json({ error: 'Person not found' }, { status: 404 });
    }

    if (!person.deleted_at) {
      return Response.json(
        { error: 'Person is not flagged for deletion' },
        { status: 400 }
      );
    }

    // Restore the person
    await env.BETTERLB_DB.prepare(
      `UPDATE persons SET deleted_at = NULL WHERE id = ?1`
    )
      .bind(person_id)
      .run();

    // Log the action
    await env.BETTERLB_DB.prepare(
      `INSERT INTO admin_audit_log (action, performed_by, target_type, target_id, details, created_at)
       VALUES ('restore_person', ?1, 'person', ?2, ?3, datetime('now'))`
    )
      .bind(
        auth.user.login,
        person_id,
        JSON.stringify({ restored_at: new Date().toISOString() })
      )
      .run();

    return Response.json({ success: true });
  } catch (error) {
    console.error('Error restoring person:', error);
    return Response.json(
      { error: 'Failed to restore person' },
      { status: 500 }
    );
  }
}

interface PermanentDeleteRequest {
  person_id: string;
}

/**
 * POST /api/admin/persons-deletion-queue/permanent-delete
 * Permanently delete a person
 */
async function handlePermanentDelete(context: {
  request: Request;
  env: Env;
  auth: AuthContext;
}) {
  const { request, env, auth } = context;

  try {
    const body = (await request.json()) as PermanentDeleteRequest;
    const { person_id } = body;

    if (!person_id) {
      return Response.json({ error: 'Missing person_id' }, { status: 400 });
    }

    // Check if person exists
    const person = await env.BETTERLB_DB.prepare(
      `SELECT id FROM persons WHERE id = ?1`
    )
      .bind(person_id)
      .first();

    if (!person) {
      return Response.json({ error: 'Person not found' }, { status: 404 });
    }

    // Check for remaining references
    const memberCount = await env.BETTERLB_DB.prepare(
      `SELECT COUNT(*) as count FROM memberships WHERE person_id = ?1`
    )
      .bind(person_id)
      .first<{ count: number }>();

    const authorCount = await env.BETTERLB_DB.prepare(
      `SELECT COUNT(*) as count FROM document_authors WHERE person_id = ?1`
    )
      .bind(person_id)
      .first<{ count: number }>();

    if ((memberCount?.count || 0) > 0 || (authorCount?.count || 0) > 0) {
      return Response.json(
        {
          error: 'Cannot delete person with remaining references',
          details: {
            memberships: memberCount?.count || 0,
            document_authors: authorCount?.count || 0,
          },
        },
        { status: 400 }
      );
    }

    // Permanently delete the person
    await env.BETTERLB_DB.prepare(`DELETE FROM persons WHERE id = ?1`)
      .bind(person_id)
      .run();

    // Log the action
    await env.BETTERLB_DB.prepare(
      `INSERT INTO admin_audit_log (action, performed_by, target_type, target_id, details, created_at)
       VALUES ('permanent_delete_person', ?1, 'person', ?2, ?3, datetime('now'))`
    )
      .bind(
        auth.user.login,
        person_id,
        JSON.stringify({ deleted_at: new Date().toISOString() })
      )
      .run();

    return Response.json({ success: true });
  } catch (error) {
    console.error('Error permanently deleting person:', error);
    return Response.json(
      { error: 'Failed to permanently delete person' },
      { status: 500 }
    );
  }
}

interface BulkRestoreRequest {
  person_ids: string[];
}

/**
 * POST /api/admin/persons-deletion-queue/bulk-restore
 * Bulk restore soft-deleted persons
 */
async function handleBulkRestore(context: {
  request: Request;
  env: Env;
  auth: AuthContext;
}) {
  const { request, env, auth } = context;

  try {
    const body = (await request.json()) as BulkRestoreRequest;
    const { person_ids } = body;

    if (!person_ids || person_ids.length === 0) {
      return Response.json({ error: 'Missing person_ids' }, { status: 400 });
    }

    let restoredCount = 0;

    for (const person_id of person_ids) {
      await env.BETTERLB_DB.prepare(
        `UPDATE persons SET deleted_at = NULL WHERE id = ?1 AND deleted_at IS NOT NULL`
      )
        .bind(person_id)
        .run();

      restoredCount++;
    }

    // Log the action
    await env.BETTERLB_DB.prepare(
      `INSERT INTO admin_audit_log (action, performed_by, target_type, target_id, details, created_at)
       VALUES ('bulk_restore_persons', ?1, 'person', ?2, ?3, datetime('now'))`
    )
      .bind(
        auth.user.login,
        'bulk',
        JSON.stringify({ restored_count: restoredCount, ids: person_ids })
      )
      .run();

    return Response.json({ success: true, restored_count: restoredCount });
  } catch (error) {
    console.error('Error bulk restoring persons:', error);
    return Response.json(
      { error: 'Failed to bulk restore persons' },
      { status: 500 }
    );
  }
}

interface BulkPermanentDeleteRequest {
  person_ids: string[];
}

/**
 * POST /api/admin/persons-deletion-queue/bulk-permanent-delete
 * Bulk permanently delete persons
 */
async function handleBulkPermanentDelete(context: {
  request: Request;
  env: Env;
  auth: AuthContext;
}) {
  const { request, env, auth } = context;

  try {
    const body = (await request.json()) as BulkPermanentDeleteRequest;
    const { person_ids } = body;

    if (!person_ids || person_ids.length === 0) {
      return Response.json({ error: 'Missing person_ids' }, { status: 400 });
    }

    let deletedCount = 0;
    const errors: Array<{ id: string; reason: string }> = [];

    for (const person_id of person_ids) {
      // Check for remaining references
      const memberCount = await env.BETTERLB_DB.prepare(
        `SELECT COUNT(*) as count FROM memberships WHERE person_id = ?1`
      )
        .bind(person_id)
        .first<{ count: number }>();

      const authorCount = await env.BETTERLB_DB.prepare(
        `SELECT COUNT(*) as count FROM document_authors WHERE person_id = ?1`
      )
        .bind(person_id)
        .first<{ count: number }>();

      if ((memberCount?.count || 0) > 0 || (authorCount?.count || 0) > 0) {
        errors.push({
          id: person_id,
          reason: `Has ${memberCount?.count || 0} memberships and ${authorCount?.count || 0} document authorships`,
        });
        continue;
      }

      // Permanently delete the person
      await env.BETTERLB_DB.prepare(`DELETE FROM persons WHERE id = ?1`)
        .bind(person_id)
        .run();

      deletedCount++;
    }

    // Log the action
    await env.BETTERLB_DB.prepare(
      `INSERT INTO admin_audit_log (action, performed_by, target_type, target_id, details, created_at)
       VALUES ('bulk_permanent_delete_persons', ?1, 'person', ?2, ?3, datetime('now'))`
    )
      .bind(
        auth.user.login,
        'bulk',
        JSON.stringify({ deleted_count: deletedCount, errors, ids: person_ids })
      )
      .run();

    return Response.json({
      success: true,
      deleted_count: deletedCount,
      error_count: errors.length,
      errors,
    });
  } catch (error) {
    console.error('Error bulk permanently deleting persons:', error);
    return Response.json(
      { error: 'Failed to bulk permanently delete persons' },
      { status: 500 }
    );
  }
}

export const onRequestGet = withAuth(handleGetQueue);
export const onRequestPost = withAuth(async context => {
  const { request } = context;
  const url = new URL(request.url);
  const action = url.searchParams.get('action');

  switch (action) {
    case 'restore':
      return handleRestore(context);
    case 'permanent-delete':
      return handlePermanentDelete(context);
    case 'bulk-restore':
      return handleBulkRestore(context);
    case 'bulk-permanent-delete':
      return handleBulkPermanentDelete(context);
    default:
      return Response.json({ error: 'Invalid action' }, { status: 400 });
  }
});
