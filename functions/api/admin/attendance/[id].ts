/**
 * Admin Attendance API
 * POST /api/admin/attendance/:id - Update attendance (absences) for a session
 */
import { Env } from '../../../types';
import { AuthContext, withAuth } from '../../../utils/admin-auth';

interface UpdateAttendanceData {
  absent_person_ids: string[];
}

/**
 * POST /api/admin/attendance/:id
 * Update attendance by replacing all absences for a session
 */
async function handleUpdateAttendance(context: {
  request: Request;
  env: Env;
  auth: AuthContext;
  params: { id: string };
}) {
  const { request, env, params } = context;
  const sessionId = params.id;

  try {
    const body = (await request.json()) as UpdateAttendanceData;
    const { absent_person_ids } = body;

    // Validate input
    if (!Array.isArray(absent_person_ids)) {
      return Response.json(
        { error: 'absent_person_ids must be an array' },
        { status: 400 }
      );
    }

    // Start a transaction-like operation
    // 1. Delete all existing absences for this session
    await env.BETTERLB_DB.prepare(
      `DELETE FROM session_absences WHERE session_id = ?1`
    )
      .bind(sessionId)
      .run();

    // 2. Insert new absences
    if (absent_person_ids.length > 0) {
      // Build INSERT statement with multiple values
      const placeholders = absent_person_ids
        .map((_, index) => `(?${index * 2 + 1}, ?${index * 2 + 2})`)
        .join(', ');
      const values = absent_person_ids.flatMap(personId => [
        sessionId,
        personId,
      ]);

      await env.BETTERLB_DB.prepare(
        `INSERT INTO session_absences (session_id, person_id) VALUES ${placeholders}`
      )
        .bind(...values)
        .run();
    }

    return Response.json({
      success: true,
      message: `Updated ${absent_person_ids.length} absences`,
    });
  } catch (error) {
    console.error('Error updating attendance:', error);
    return Response.json(
      { error: 'Failed to update attendance' },
      { status: 500 }
    );
  }
}

export const onRequestPost = (context: { request: Request; env: Env }) =>
  withAuth(handleUpdateAttendance as any)(context as any); // eslint-disable-line @typescript-eslint/no-explicit-any
