/**
 * Legislation Documents API
 * GET /api/legislation/documents - List all documents with filtering
 * GET /api/legislation/documents/:id - Get document details
 */
import { Env } from '../../types';
import { cachedJson } from '../../utils/cache';
import { CACHE_TTL, createKVCache } from '../../utils/kv-cache';
import {
  checkRateLimit,
  createRateLimitResponse,
  getClientIdentifier,
} from '../../utils/rate-limit';

export async function onRequestGet(context: { request: Request; env: Env }) {
  const url = new URL(context.request.url);

  // Check if this is a detail request (/:id)
  const pathParts = url.pathname.split('/').filter(Boolean);
  const isDetailRequest = pathParts.length > 3 && pathParts[3] !== 'documents';

  if (isDetailRequest) {
    return getDocumentDetail(context);
  }

  return getDocumentsList(context);
}

/**
 * GET /api/legislation/documents
 * Query parameters:
 * - type: ordinance|resolution|executive_order
 * - term: sb_12
 * - session_id: xxx
 * - q: search query (title search)
 * - needs_review: 0|1
 * - limit: number (default 100)
 * - offset: number (default 0)
 */
async function getDocumentsList(context: { request: Request; env: Env }) {
  const { env, request } = context;
  const url = new URL(context.request.url);

  // Apply rate limiting - 100 requests per minute per client
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
    return createRateLimitResponse(rateLimitResult);
  }

  const type = url.searchParams.get('type');
  const termId = url.searchParams.get('term');
  const sessionId = url.searchParams.get('session_id');
  const query = url.searchParams.get('q');
  const needsReview = url.searchParams.get('needs_review');
  const limit = parseInt(url.searchParams.get('limit') || '100');
  const offset = parseInt(url.searchParams.get('offset') || '0');

  // Input validation: Limit query length to prevent DoS
  if (query && query.length > 100) {
    return cachedJson(
      { error: 'Query too long (max 100 characters)' },
      'none',
      400
    );
  }

  // Sanitize LIKE wildcards to prevent SQL injection
  const sanitizedQuery = query
    ? query.replace(/\\/g, '\\\\').replace(/%/g, '\\%').replace(/_/g, '\\_')
    : null;

  const kvCache = createKVCache(env);
  const cacheKey = kvCache.documentsKey({
    type: type || undefined,
    term: termId || undefined,
    session_id: sessionId || undefined,
    q: query || undefined,
    needs_review: needsReview || undefined,
    limit,
    offset,
  });

  try {
    const result = await kvCache.get(
      cacheKey,
      async () => {
        // Build query - fetch documents without author_ids subquery first
        let sql = `
          SELECT
            d.id, d.type, d.number, d.title, d.session_id, d.status,
            d.date_enacted, d.pdf_url, d.moved_by, d.seconded_by,
            d.source_type, d.needs_review, d.processed, d.created_at, d.updated_at,
            s.id as session_id, s.number as session_number, s.type as session_type,
            s.date as session_date, s.ordinal_number as session_ordinal,
            s.term_id,
            t.mayor_id, t.vice_mayor_id
          FROM documents d
          LEFT JOIN sessions s ON d.session_id = s.id
          LEFT JOIN terms t ON s.term_id = t.id
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

        if (needsReview !== null) {
          sql += ` AND d.needs_review = ?${paramIndex++}`;
          params.push(needsReview);
        }

        // If filtering by term, join through sessions
        if (termId) {
          sql += ` AND s.term_id = ?${paramIndex++}`;
          params.push(termId);
        }

        sql += ` ORDER BY d.date_enacted DESC LIMIT ?${paramIndex++} OFFSET ?${paramIndex++}`;
        params.push(limit.toString(), offset.toString());

        const result = await env.BETTERLB_DB.prepare(sql)
          .bind(...params)
          .all();

        // Get document IDs for batch fetching author IDs
        const documentIds = result.results
          .map((r: { id: string }) => r.id)
          .filter(Boolean);

        // Batch fetch all author IDs with batching to avoid SQLite variable limit
        const authorIdsMap = new Map<string, string[]>();
        if (documentIds.length > 0) {
          // SQLite has a limit of 999 variables per query
          // Use a conservative batch size to stay under the limit
          const BATCH_SIZE = 100;

          // Process author IDs in batches
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

            // Group by document_id
            for (const row of authorsResult.results) {
              const rowTyped = row as {
                document_id: string;
                person_id: string;
              };
              const docId = rowTyped.document_id;
              const personId = rowTyped.person_id;
              if (!authorIdsMap.has(docId)) {
                authorIdsMap.set(docId, []);
              }
              authorIdsMap.get(docId)!.push(personId);
            }
          }
        }

        // Get count for pagination
        let countSql =
          'SELECT COUNT(*) as count FROM documents d LEFT JOIN sessions s ON d.session_id = s.id WHERE 1=1';
        let countParamIndex = 1;
        const countParams: string[] = [];

        if (type) {
          countSql += ` AND d.type = ?${countParamIndex++}`;
          countParams.push(type);
        }
        if (sessionId) {
          countSql += ` AND d.session_id = ?${countParamIndex++}`;
          countParams.push(sessionId);
        }
        if (sanitizedQuery) {
          countSql += ` AND d.title LIKE ?${countParamIndex++} ESCAPE '\\'`;
          countParams.push(`%${sanitizedQuery}%`);
        }
        if (needsReview !== null) {
          countSql += ` AND d.needs_review = ?${countParamIndex++}`;
          countParams.push(needsReview);
        }
        if (termId) {
          countSql += ` AND s.term_id = ?${countParamIndex++}`;
          countParams.push(termId);
        }

        const countResult = await env.BETTERLB_DB.prepare(countSql)
          .bind(...countParams)
          .first<{ count: number }>();
        const total = countResult?.count || 0;

        // Type for document row
        interface DocumentRow {
          id: string;
          type: string;
          number: string;
          title: string;
          session_id: string;
          status: string;
          date_enacted: string;
          pdf_url: string;
          moved_by: string | null;
          seconded_by: string | null;
          source_type: string;
          needs_review: number;
          processed: number;
          term_id: string;
          mayor_id: string;
          session_number: number;
          session_type: string;
          session_date: string;
          session_ordinal: string;
        }

        // Format results with author_ids from the map
        const documents = result.results.map((row: DocumentRow) => ({
          id: row.id,
          type: row.type,
          number: row.number,
          title: row.title,
          session_id: row.session_id,
          status: row.status,
          date_enacted: row.date_enacted,
          pdf_url: row.pdf_url,
          link: row.pdf_url, // Alias for frontend compatibility
          moved_by: row.moved_by,
          seconded_by: row.seconded_by,
          source_type: row.source_type,
          needs_review: row.needs_review,
          processed: row.processed,
          author_ids: authorIdsMap.get(row.id) || [],
          term_id: row.term_id,
          mayor_id: row.mayor_id,
          session: row.session_id
            ? {
                id: row.session_id,
                number: row.session_number,
                type: row.session_type,
                date: row.session_date,
                ordinal_number: row.session_ordinal,
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

    return cachedJson(result, 'list');
  } catch (error) {
    console.error('Error fetching documents:', error);
    return cachedJson({ error: 'Failed to fetch documents' }, 'none', 500);
  }
}

/**
 * GET /api/legislation/documents/:id
 * Get detailed document with authors
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
            d.id, d.type, d.number, d.title, d.session_id, d.status,
            d.date_enacted, d.pdf_url, d.content_preview,
            d.moved_by, d.seconded_by, d.source_type,
            d.needs_review, d.review_notes, d.processed,
            d.created_at, d.updated_at,
            s.id as session_id, s.number as session_number, s.type as session_type,
            s.date as session_date, s.ordinal_number as session_ordinal,
            s.term_id,
            t.mayor_id, t.vice_mayor_id
          FROM documents d
          LEFT JOIN sessions s ON d.session_id = s.id
          LEFT JOIN terms t ON s.term_id = t.id
          WHERE d.id = ?
        `;

        interface DocResult {
          id: string;
          type: string;
          number: string;
          title: string;
          session_id: string;
          status: string;
          date_enacted: string;
          pdf_url: string;
          content_preview: string | null;
          moved_by: string | null;
          seconded_by: string | null;
          source_type: string;
          needs_review: number;
          review_notes: string | null;
          processed: number;
          created_at: string;
          updated_at: string;
          term_id: string;
          mayor_id: string;
          session_number: number;
          session_type: string;
          session_date: string;
          session_ordinal: string;
        }

        const doc = await env.BETTERLB_DB.prepare(sql)
          .bind(documentId)
          .first<DocResult>();

        if (!doc) {
          return { error: 'Document not found' };
        }

        // Get authors
        const authorsSql = `
          SELECT p.id, p.first_name, p.middle_name, p.last_name
          FROM document_authors da
          JOIN persons p ON da.person_id = p.id
          WHERE da.document_id = ?
        `;
        interface AuthorResult {
          id: string;
          first_name: string;
          middle_name: string | null;
          last_name: string;
        }
        const authorsResult = await env.BETTERLB_DB.prepare(authorsSql)
          .bind(documentId)
          .all<AuthorResult>();
        const authors = authorsResult.results.map(row => ({
          id: row.id,
          first_name: row.first_name,
          middle_name: row.middle_name,
          last_name: row.last_name,
        }));

        // Get subjects (if any)
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
          status: doc.status,
          date_enacted: doc.date_enacted,
          pdf_url: doc.pdf_url,
          content_preview: doc.content_preview,
          moved_by: doc.moved_by,
          seconded_by: doc.seconded_by,
          source_type: doc.source_type,
          needs_review: doc.needs_review,
          review_notes: doc.review_notes,
          processed: doc.processed,
          created_at: doc.created_at,
          updated_at: doc.updated_at,
          term_id: doc.term_id,
          mayor_id: doc.mayor_id,
          session: doc.session_id
            ? {
                id: doc.session_id,
                number: doc.session_number,
                type: doc.session_type,
                date: doc.session_date,
                ordinal_number: doc.session_ordinal,
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
