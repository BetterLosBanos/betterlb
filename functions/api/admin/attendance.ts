/**
 * Admin Attendance API
 * POST /api/admin/attendance/:sessionId - Update attendance records for a session
 */
import { Env } from '../../types';
import { AuthContext, withAuth } from '../../utils/admin-auth';
import {
  logAudit,
  AuditActions,
  AuditTargetTypes,
} from '../../utils/audit-log';

interface AttendanceUpdateData {
  absent_person_ids: string[];
}

/**
 * POST /api/admin/attendance/:sessionId
 * Update attendance records for a session
 * Replaces all absences for the session with the provided list
 */
async function handleUpdateAttendance(context: {
  request: Request;
  env: Env;
  auth: AuthContext;
  params: { sessionId: string };
}) {
  const { request, env, params } = context;
  const sessionId = params.sessionId;

  try {
    const body = (await request.json()) as AttendanceUpdateData;
    const { absent_person_ids } = body;

    if (!Array.isArray(absent_person_ids)) {
      return Response.json(
        { error: 'absent_person_ids must be an array' },
        { status: 400 }
      );
    }

    // Use batch() for atomic transaction
    const statements: D1PreparedStatement[] = [];

    // 1. Delete all existing absences for this session
    statements.push(
      env.BETTERLB_DB.prepare(
        `DELETE FROM session_absences WHERE session_id = ?1`
      ).bind(sessionId)
    );

    // 2. Insert new absences (batch all inserts)
    if (absent_person_ids.length > 0) {
      const placeholders = absent_person_ids
        .map((_, index) => `(?${index * 2 + 1}, ?${index * 2 + 2})`)
        .join(', ');
      const values = absent_person_ids.flatMap(personId => [
        sessionId,
        personId,
      ]);

      statements.push(
        env.BETTERLB_DB.prepare(
          `INSERT INTO session_absences (session_id, person_id) VALUES ${placeholders}`
        ).bind(...values)
      );
    }

    // 3. Update the session's updated_at timestamp
    statements.push(
      env.BETTERLB_DB.prepare(
        `UPDATE sessions SET updated_at = ?1 WHERE id = ?2`
      ).bind(new Date().toISOString(), sessionId)
    );

    // Execute atomically
    await env.BETTERLB_DB.batch(statements);

    // 4. Log the audit entry
    await logAudit(env, {
      action: AuditActions.UPDATE_ATTENDANCE,
      performedBy: context.auth.user.login,
      targetType: AuditTargetTypes.SESSION,
      targetId: sessionId,
      details: {
        absent_count: absent_person_ids.length,
        absent_person_ids,
      },
    });

    return Response.json({
      success: true,
      absent_count: absent_person_ids.length,
    });
  } catch (error) {
    console.error('Error updating attendance:', error);
    return Response.json(
      { error: 'Failed to update attendance' },
      { status: 500 }
    );
  }
}

export async function onRequestPost(context: {
  request: Request;
  env: Env;
  params: { sessionId: string };
}) {
  return withAuth(handleUpdateAttendance, { requireCSRF: true })(context);
}
