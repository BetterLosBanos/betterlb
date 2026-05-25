/**
 * Legislation Documents API
 * GET /api/legislation/documents - List all documents with filtering
 * GET /api/legislation/documents/:id - Get document details
 */
import { Env } from '../../types';
import { cachedJson } from '../../utils/cache';
import { formatSessionOrdinal } from '../../utils/formatters';
import { CACHE_TTL, createKVCache } from '../../utils/kv-cache';
import {
  addRateLimitHeaders,
  checkRateLimit,
  createRateLimitResponse,
  getClientIdentifier,
} from '../../utils/rate-limit';
import {
  parsePaginationParam,
  PAGINATION_LIMITS,
} from '../../utils/pagination';

export async function onRequestGet(context: { request: Request; env: Env }) {
  const url = new URL(context.request.url);
  const pathParts = url.pathname.split('/').filter(Boolean);
  const isDetailRequest = pathParts.length > 3 && pathParts[3] !== 'documents';

  if (isDetailRequest) {
    return getDocumentDetail(context);
  }

  return getDocumentsList(context);
}

/**
 * GET /api/legislation/documents
 */
async function getDocumentsList(context: { request: Request; env: Env }) {
  const { env, request } = context;
  const url = new URL(context.request.url);

  const clientId = getClientIdentifier(request);
  const rateLimitResult = await checkRateLimit(
    env.WEATHER_KV,
    `api:documents:${clientId}`,
    {
      limit: 100,
      window: 60,
    }
  );

  if (!rateLimitResult.allowed) {
    return createRateLimitResponse(rateLimitResult, 100);
  }

  const type = url.searchParams.get('type');
  const termId = url.searchParams.get('term');
  const sessionId = url.searchParams.get('session_id');
  const query = url.searchParams.get('q');
  const limit = parsePaginationParam(url.searchParams.get('limit'), 100, 200);
  const offset = parsePaginationParam(
    url.searchParams.get('offset'),
    PAGINATION_LIMITS.DEFAULT_OFFSET,
    Number.MAX_SAFE_INTEGER
  );

  if (query && query.length > 100) {
    return cachedJson(
      { error: 'Query too long (max 100 characters)' },
      'none',
      400
    );
  }

  const sanitizedQuery = query
    ? query.replace(/\\/g, '\\\\').replace(/%/g, '\\%').replace(/_/g, '\\_')
    : null;

  const kvCache = createKVCache(env);
  const cacheKey = kvCache.documentsKey({
    type: type || undefined,
    term: termId || undefined,
    session_id: sessionId || undefined,
    q: query || undefined,
    limit,
    offset,
  });

  try {
    const result = await kvCache.get(
      cacheKey,
      async () => {
        let sql = `
          SELECT
            d.id, d.type, d.number, d.title, d.session_id,
            d.publication_status, d.verification_state, d.source_type,
            d.date_enacted, d.pdf_url, d.term_id,
            d.created_at, d.updated_at,
            s.number as session_number, s.type as session_type,
            s.date as session_date
          FROM documents d
          LEFT JOIN sessions s ON d.session_id = s.id
          WHERE 1=1
        `;

        const params: string[] = [];
        let paramIndex = 1;

        if (type) {
          sql += ` AND d.type = ?${paramIndex++}`;
          params.push(type);
        }

        if (sessionId) {
          sql += ` AND d.session_id = ?${paramIndex++}`;
          params.push(sessionId);
        }

        if (sanitizedQuery) {
          sql += ` AND d.title LIKE ?${paramIndex++} ESCAPE '\\'`;
          params.push(`%${sanitizedQuery}%`);
        }

        if (termId) {
          sql += ` AND d.term_id = ?${paramIndex++}`;
          params.push(termId);
        }

        sql += ` ORDER BY d.date_enacted DESC LIMIT ?${paramIndex++} OFFSET ?${paramIndex++}`;
        params.push(limit.toString(), offset.toString());

        const result = await env.BETTERLB_DB.prepare(sql)
          .bind(...params)
          .all();

        const documentIds = result.results
          .map((r: { id: string }) => r.id)
          .filter(Boolean);

        const authorIdsMap = new Map<string, string[]>();
        if (documentIds.length > 0) {
          const BATCH_SIZE = 100;
          for (let i = 0; i < documentIds.length; i += BATCH_SIZE) {
            const batch = documentIds.slice(i, i + BATCH_SIZE);
            const placeholders = batch.map((_, idx) => `?${idx + 1}`).join(',');

            const authorsSql = `
              SELECT document_id, person_id
              FROM document_authors
              WHERE document_id IN (${placeholders})
              ORDER BY document_id, person_id
            `;

            const authorsResult = await env.BETTERLB_DB.prepare(authorsSql)
              .bind(...batch)
              .all();

            for (const row of authorsResult.results) {
              const rowTyped = row as {
                document_id: string;
                person_id: string;
              };
              if (!authorIdsMap.has(rowTyped.document_id)) {
                authorIdsMap.set(rowTyped.document_id, []);
              }
              authorIdsMap.get(rowTyped.document_id)!.push(rowTyped.person_id);
            }
          }
        }

        let countSql = 'SELECT COUNT(*) as count FROM documents WHERE 1=1';
        let countParamIndex = 1;
        const countParams: string[] = [];

        if (type) {
          countSql += ` AND type = ?${countParamIndex++}`;
          countParams.push(type);
        }
        if (sessionId) {
          countSql += ` AND session_id = ?${countParamIndex++}`;
          countParams.push(sessionId);
        }
        if (sanitizedQuery) {
          countSql += ` AND title LIKE ?${countParamIndex++} ESCAPE '\\'`;
          countParams.push(`%${sanitizedQuery}%`);
        }
        if (termId) {
          countSql += ` AND term_id = ?${countParamIndex++}`;
          countParams.push(termId);
        }

        const countResult = await env.BETTERLB_DB.prepare(countSql)
          .bind(...countParams)
          .first<{ count: number }>();
        const total = countResult?.count || 0;

        interface DocumentRow {
          id: string;
          type: string;
          number: string;
          title: string;
          session_id: string | null;
          publication_status: string;
          verification_state: string;
          source_type: string;
          date_enacted: string;
          pdf_url: string;
          term_id: string | null;
          session_number: number | null;
          session_type: string | null;
          session_date: string | null;
        }

        const documents = result.results.map((row: DocumentRow) => ({
          id: row.id,
          type: row.type,
          number: row.number,
          title: row.title,
          session_id: row.session_id,
          publication_status: row.publication_status,
          verification_state: row.verification_state,
          source_type: row.source_type,
          date_enacted: row.date_enacted,
          pdf_url: row.pdf_url,
          link: row.pdf_url,
          author_ids: authorIdsMap.get(row.id) || [],
          term_id: row.term_id,
          session: row.session_id
            ? {
                id: row.session_id,
                number: row.session_number,
                type: row.session_type,
                date: row.session_date,
                ordinal_number: formatSessionOrdinal(
                  row.session_number,
                  row.session_type
                ),
                term_id: row.term_id,
              }
            : null,
        }));

        return {
          documents,
          pagination: {
            total,
            limit,
            offset,
            has_more: offset + limit < total,
          },
        };
      },
      CACHE_TTL.list
    );

    return addRateLimitHeaders(
      cachedJson(result, 'list'),
      rateLimitResult,
      100
    );
  } catch (error) {
    console.error('Error fetching documents:', error);
    return cachedJson({ error: 'Failed to fetch documents' }, 'none', 500);
  }
}

/**
 * GET /api/legislation/documents/:id
 */
async function getDocumentDetail(context: { request: Request; env: Env }) {
  const { env } = context;
  const url = new URL(context.request.url);
  const pathParts = url.pathname.split('/').filter(Boolean);
  const documentId = pathParts[3];

  const kvCache = createKVCache(env);
  const cacheKey = kvCache.documentKey(documentId);

  try {
    const result = await kvCache.get(
      cacheKey,
      async () => {
        const sql = `
          SELECT
            d.id, d.type, d.number, d.title, d.session_id,
            d.publication_status, d.verification_state, d.source_type,
            d.date_enacted, d.pdf_url, d.term_id,
            d.created_at, d.updated_at,
            s.number as session_number, s.type as session_type,
            s.date as session_date
          FROM documents d
          LEFT JOIN sessions s ON d.session_id = s.id
          WHERE d.id = ?
        `;

        interface DocResult {
          id: string;
          type: string;
          number: string;
          title: string;
          session_id: string | null;
          publication_status: string;
          verification_state: string;
          source_type: string;
          date_enacted: string;
          pdf_url: string;
          term_id: string | null;
          created_at: string;
          updated_at: string;
          session_number: number | null;
          session_type: string | null;
          session_date: string | null;
        }

        const doc = await env.BETTERLB_DB.prepare(sql)
          .bind(documentId)
          .first<DocResult>();

        if (!doc) {
          return { error: 'Document not found' };
        }

        const authorsSql = `
          SELECT p.id, p.first_name, p.middle_name, p.last_name, da.author_type
          FROM document_authors da
          JOIN persons p ON da.person_id = p.id
          WHERE da.document_id = ?
        `;
        interface AuthorResult {
          id: string;
          first_name: string;
          middle_name: string | null;
          last_name: string;
          author_type: string;
        }
        const authorsResult = await env.BETTERLB_DB.prepare(authorsSql)
          .bind(documentId)
          .all<AuthorResult>();
        const authors = authorsResult.results.map(row => ({
          id: row.id,
          first_name: row.first_name,
          middle_name: row.middle_name,
          last_name: row.last_name,
          author_type: row.author_type,
        }));

        const subjectsSql = `
          SELECT s.id, s.name
          FROM document_subjects ds
          JOIN subjects s ON ds.subject_id = s.id
          WHERE ds.document_id = ?
        `;
        interface SubjectResult {
          name: string;
        }
        const subjectsResult = await env.BETTERLB_DB.prepare(subjectsSql)
          .bind(documentId)
          .all<SubjectResult>();
        const subjects = subjectsResult.results.map(row => row.name);

        return {
          id: doc.id,
          type: doc.type,
          number: doc.number,
          title: doc.title,
          session_id: doc.session_id,
          publication_status: doc.publication_status,
          verification_state: doc.verification_state,
          source_type: doc.source_type,
          date_enacted: doc.date_enacted,
          pdf_url: doc.pdf_url,
          term_id: doc.term_id,
          created_at: doc.created_at,
          updated_at: doc.updated_at,
          session: doc.session_id
            ? {
                id: doc.session_id,
                number: doc.session_number,
                type: doc.session_type,
                date: doc.session_date,
                ordinal_number: formatSessionOrdinal(
                  doc.session_number,
                  doc.session_type
                ),
                term_id: doc.term_id,
              }
            : null,
          authors,
          subjects,
        };
      },
      CACHE_TTL.detail
    );

    if ((result as { error?: string }).error === 'Document not found') {
      return cachedJson(result, 'none', 404);
    }

    return cachedJson(result, 'detail');
  } catch (error) {
    console.error('Error fetching document detail:', error);
    return cachedJson({ error: 'Failed to fetch document' }, 'none', 500);
  }
}
