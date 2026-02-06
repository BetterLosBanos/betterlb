/**
 * Admin Sessions API - Individual Session
 * GET /api/admin/sessions/:id - Get session with attendees and absences
 * POST /api/admin/sessions/:id - Update session data
 */
import { Env } from '../../../types';
import { AuthContext, withAuth } from '../../../utils/admin-auth';

interface SessionMember {
  id: string;
  person_id: string;
  first_name: string;
  middle_name: string | null;
  last_name: string;
  role?: string;
}

interface SessionDetails {
  id: string;
  term_id: string;
  session_type: string;
  ordinal: number | null;
  date: string;
  created_at: string;
  updated_at: string;
  members: SessionMember[];
  absences: Array<{
    id: string;
    person_id: string;
    first_name: string;
    middle_name: string | null;
    last_name: string;
  }>;
}

/**
 * GET /api/admin/sessions/:id
 * Get session details with attendees and absences
 */
async function handleGetSession(context: {
  request: Request;
  env: Env;
  auth: AuthContext;
  params: { id: string };
}) {
  const { env, params } = context;
  const sessionId = params.id;

  try {
    // Get session details - use correct column names from schema
    const session = await env.BETTERLB_DB.prepare(
      `SELECT id, term_id, type, number, date, ordinal_number, created_at, updated_at
       FROM sessions WHERE id = ?1`
    )
      .bind(sessionId)
      .first<any>();

    if (!session) {
      return Response.json({ error: 'Session not found' }, { status: 404 });
    }

    // Get all members for this term
    const membersResult = await env.BETTERLB_DB.prepare(
      `SELECT
        m.id,
        m.person_id,
        p.first_name,
        p.middle_name,
        p.last_name,
        m.role
       FROM memberships m
       JOIN persons p ON m.person_id = p.id
       WHERE m.term_id = ?1
       ORDER BY p.last_name, p.first_name`
    )
      .bind(session.term_id)
      .all();

    const members: SessionMember[] = membersResult.results.map((row: any) => ({
      id: row.id,
      person_id: row.person_id,
      first_name: row.first_name,
      middle_name: row.middle_name,
      last_name: row.last_name,
      role: row.role,
    }));

    // Get absences for this session
    const absencesResult = await env.BETTERLB_DB.prepare(
      `SELECT
        sa.id,
        sa.person_id,
        p.first_name,
        p.middle_name,
        p.last_name
       FROM session_absences sa
       JOIN persons p ON sa.person_id = p.id
       WHERE sa.session_id = ?1`
    )
      .bind(sessionId)
      .all();

    const absences = absencesResult.results.map((row: any) => ({
      id: row.id,
      person_id: row.person_id,
      first_name: row.first_name,
      middle_name: row.middle_name,
      last_name: row.last_name,
    }));

    // Map database column names to match expected interface
    // type -> session_type, number -> ordinal
    return Response.json({
      id: session.id,
      term_id: session.term_id,
      session_type: session.type, // Map 'type' to 'session_type'
      ordinal: session.number, // Map 'number' to 'ordinal'
      date: session.date,
      created_at: session.created_at,
      updated_at: session.updated_at,
      members,
      absences,
    } as SessionDetails);
  } catch (error) {
    console.error('Error fetching session:', error);
    return Response.json({ error: 'Failed to fetch session' }, { status: 500 });
  }
}

interface UpdateSessionData {
  session_type?: string;
  ordinal?: number | null;
  date?: string;
}

/**
 * POST /api/admin/sessions/:id
 * Update session data
 */
async function handleUpdateSession(context: {
  request: Request;
  env: Env;
  auth: AuthContext;
  params: { id: string };
}) {
  const { request, env, params } = context;
  const sessionId = params.id;

  try {
    const body = (await request.json()) as UpdateSessionData;

    const updateFields: string[] = [];
    const updateValues: (string | number | null)[] = [];
    let paramIndex = 1;

    if (body.session_type !== undefined) {
      updateFields.push(`type = ?${paramIndex++}`); // Map to 'type'
      updateValues.push(body.session_type);
    }
    if (body.ordinal !== undefined) {
      updateFields.push(`number = ?${paramIndex++}`); // Map to 'number'
      updateValues.push(body.ordinal);
    }
    if (body.date !== undefined) {
      updateFields.push(`date = ?${paramIndex++}`);
      updateValues.push(body.date);
    }

    if (updateFields.length > 0) {
      updateFields.push(`updated_at = ?${paramIndex++}`);
      updateValues.push(new Date().toISOString());
      updateValues.push(sessionId);

      const updateSql = `
        UPDATE sessions
        SET ${updateFields.join(', ')}
        WHERE id = ?${paramIndex}
      `;

      await env.BETTERLB_DB.prepare(updateSql)
        .bind(...updateValues)
        .run();
    }

    // Fetch and return updated session
    const updated = await env.BETTERLB_DB.prepare(
      `SELECT * FROM sessions WHERE id = ?1`
    )
      .bind(sessionId)
      .first();

    return Response.json({
      success: true,
      session: updated,
    });
  } catch (error) {
    console.error('Error updating session:', error);
    return Response.json(
      { error: 'Failed to update session' },
      { status: 500 }
    );
  }
}

export const onRequestGet = (context: { request: Request; env: Env }) =>
  withAuth(handleGetSession as any)(context as any);

export const onRequestPost = (context: { request: Request; env: Env }) =>
  withAuth(handleUpdateSession as any)(context as any);
