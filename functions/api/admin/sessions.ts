/**
 * Admin Sessions API
 * GET /api/admin/sessions/:id - Get session with attendees
 * POST /api/admin/sessions/:id - Update session data
 * POST /api/admin/sessions - Create new session
 */

import { Env } from '../../types';
import { withAuth, AuthContext } from '../../utils/admin-auth';

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
  session_type: 'regular' | 'special' | 'inaugural';
  ordinal: number | null;
  date: string;
  source_url: string | null;
  created_at: string;
  updated_at: string;
  members: SessionMember[];
  absences: {
    id: string;
    person_id: string;
    first_name: string;
    middle_name: string | null;
    last_name: string;
  }[];
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
    // Get session details
    const session = await env.BETTERLB_DB.prepare(
      `SELECT id, term_id, session_type, ordinal, date, source_url, created_at, updated_at
       FROM sessions WHERE id = ?1`
    ).bind(sessionId).first<any>();

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
    ).bind(session.term_id).all();

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
    ).bind(sessionId).all();

    const absences = absencesResult.results.map((row: any) => ({
      id: row.id,
      person_id: row.person_id,
      first_name: row.first_name,
      middle_name: row.middle_name,
      last_name: row.last_name,
    }));

    return Response.json({
      id: session.id,
      term_id: session.term_id,
      session_type: session.session_type,
      ordinal: session.ordinal,
      date: session.date,
      source_url: session.source_url,
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
  session_type?: 'regular' | 'special' | 'inaugural';
  ordinal?: number | null;
  date?: string;
  source_url?: string | null;
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
    const body = await request.json() as UpdateSessionData;

    const updateFields: string[] = [];
    const updateValues: (string | number | null)[] = [];
    let paramIndex = 1;

    if (body.session_type !== undefined) {
      updateFields.push(`session_type = ?${paramIndex++}`);
      updateValues.push(body.session_type);
    }
    if (body.ordinal !== undefined) {
      updateFields.push(`ordinal = ?${paramIndex++}`);
      updateValues.push(body.ordinal);
    }
    if (body.date !== undefined) {
      updateFields.push(`date = ?${paramIndex++}`);
      updateValues.push(body.date);
    }
    if (body.source_url !== undefined) {
      updateFields.push(`source_url = ?${paramIndex++}`);
      updateValues.push(body.source_url);
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

      await env.BETTERLB_DB.prepare(updateSql).bind(...updateValues).run();
    }

    // Fetch and return updated session
    const updated = await env.BETTERLB_DB.prepare(
      `SELECT * FROM sessions WHERE id = ?1`
    ).bind(sessionId).first();

    return Response.json({
      success: true,
      session: updated,
    });
  } catch (error) {
    console.error('Error updating session:', error);
    return Response.json({ error: 'Failed to update session' }, { status: 500 });
  }
}

interface CreateSessionData {
  term_id: string;
  session_type: 'regular' | 'special' | 'inaugural';
  ordinal: number | null;
  date: string;
  source_url?: string | null;
  absent_person_ids?: string[];
}

/**
 * POST /api/admin/sessions
 * Create new session
 */
async function handleCreateSession(context: {
  request: Request;
  env: Env;
  auth: AuthContext;
}) {
  const { request, env } = context;

  try {
    const body = await request.json() as CreateSessionData;

    if (!body.term_id || !body.session_type || !body.date) {
      return Response.json(
        { error: 'Missing required fields: term_id, session_type, date' },
        { status: 400 }
      );
    }

    // Generate session ID
    const sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    // Insert session
    await env.BETTERLB_DB.prepare(
      `INSERT INTO sessions (id, term_id, session_type, ordinal, date, source_url)
       VALUES (?1, ?2, ?3, ?4, ?5, ?6)`
    ).bind(
      sessionId,
      body.term_id,
      body.session_type,
      body.ordinal || null,
      body.date,
      body.source_url || null
    ).run();

    // Add absences if provided
    if (body.absent_person_ids && body.absent_person_ids.length > 0) {
      for (const personId of body.absent_person_ids) {
        await env.BETTERLB_DB.prepare(
          `INSERT INTO session_absences (session_id, person_id) VALUES (?1, ?2)`
        ).bind(sessionId, personId).run();
      }
    }

    return Response.json({
      success: true,
      session_id: sessionId,
    });
  } catch (error) {
    console.error('Error creating session:', error);
    return Response.json({ error: 'Failed to create session' }, { status: 500 });
  }
}

export const onRequestGet = withAuth(handleGetSession);

export async function onRequestPost(context: {
  request: Request;
  env: Env;
  params: { id: string };
}) {
  // If there's an id parameter, it's an update, otherwise it's a create
  if (context.params?.id) {
    return withAuth(handleUpdateSession)(context);
  }
  return withAuth(handleCreateSession)(context);
}
