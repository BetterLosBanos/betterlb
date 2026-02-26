/**
 * Admin Sessions API - List and Create
 * GET /api/admin/sessions - List all sessions
 * POST /api/admin/sessions - Create new session
 */
import { Env } from '../../../types';
import { AuthContext, withAuth } from '../../../utils/admin-auth';

interface CreateSessionData {
  term_id: string;
  session_type?: string;
  ordinal?: number | null;
  date?: string;
  absent_person_ids?: string[];
}

/**
 * GET /api/admin/sessions
 * List all sessions with optional filtering
 */
async function handleListSessions(context: {
  request: Request;
  env: Env;
  auth: AuthContext;
}) {
  const { request, env } = context;
  const url = new URL(request.url);

  const termId = url.searchParams.get('term');
  const limit = parseInt(url.searchParams.get('limit') || '50');
  const offset = parseInt(url.searchParams.get('offset') || '0');

  try {
    let sql = `
      SELECT
        s.id, s.term_id, s.type, s.number, s.date, s.ordinal_number,
        s.created_at, s.updated_at
      FROM sessions s
      WHERE 1=1
    `;

    const params: string[] = [];
    let paramIndex = 1;

    if (termId) {
      sql += ` AND s.term_id = ?${paramIndex++}`;
      params.push(termId);
    }

    sql += ` ORDER BY s.date DESC LIMIT ?${paramIndex++} OFFSET ?${paramIndex++}`;
    params.push(limit.toString(), offset.toString());

    const result = await env.BETTERLB_DB.prepare(sql)
      .bind(...params)
      .all();

    return Response.json({
      sessions: result.results,
      pagination: {
        limit,
        offset,
        has_more: result.results.length === limit,
      },
    });
  } catch (error) {
    console.error('Error fetching sessions:', error);
    return Response.json(
      { error: 'Failed to fetch sessions' },
      { status: 500 }
    );
  }
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
    const body = (await request.json()) as CreateSessionData;

    if (!body.term_id || !body.date) {
      return Response.json(
        { error: 'Missing required fields: term_id, date' },
        { status: 400 }
      );
    }

    // Generate session ID using cryptographically secure randomness
    const generateCryptoId = (): string => {
      if (typeof crypto === 'undefined') {
        throw new Error(
          'Cryptographic random generator is not available in this environment'
        );
      }

      if ('randomUUID' in crypto && typeof crypto.randomUUID === 'function') {
        return crypto.randomUUID();
      }

      if (
        'getRandomValues' in crypto &&
        typeof crypto.getRandomValues === 'function'
      ) {
        const buf = new Uint8Array(16);
        crypto.getRandomValues(buf);
        return Array.from(buf)
          .map(b => b.toString(16).padStart(2, '0'))
          .join('');
      }

      throw new Error('No suitable cryptographic random function available');
    };

    const sessionId = `session_${generateCryptoId()}`;

    // Insert session - use correct column name 'type' and 'number'
    await env.BETTERLB_DB.prepare(
      `INSERT INTO sessions (id, term_id, type, number, date)
       VALUES (?1, ?2, ?3, ?4, ?5)`
    )
      .bind(
        sessionId,
        body.term_id,
        body.session_type || 'Regular',
        body.ordinal || null,
        body.date
      )
      .run();

    // Add absences if provided
    if (body.absent_person_ids && body.absent_person_ids.length > 0) {
      for (const personId of body.absent_person_ids) {
        await env.BETTERLB_DB.prepare(
          `INSERT INTO session_absences (session_id, person_id) VALUES (?1, ?2)`
        )
          .bind(sessionId, personId)
          .run();
      }
    }

    return Response.json({
      success: true,
      session_id: sessionId,
    });
  } catch (error) {
    console.error('Error creating session:', error);
    return Response.json(
      { error: 'Failed to create session' },
      { status: 500 }
    );
  }
}

export const onRequestGet = withAuth(handleListSessions);

export const onRequestPost = withAuth(handleCreateSession);
