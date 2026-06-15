/**
 * Workbench Staged Documents Endpoint
 * GET /api/admin/workbench/staged-documents - List documents
 * GET /api/admin/workbench/staged-documents/:id - Get single document
 */

import { Env } from '../../../types';
import { AuthContext, withAuth } from '../../../utils/admin-auth';
import {
  queryStagedDocuments,
  queryDecoratedDocument,
  type QueryStagedDocumentsParams,
} from './utils';
import {
  parsePaginationParam,
  PAGINATION_LIMITS,
} from '../../../utils/pagination';
import { Permission } from '../../../utils/rbac';

export async function handleGetStagedDocuments(context: {
  request: Request;
  env: Env;
  auth: AuthContext;
}) {
  const { request, env } = context;
  const url = new URL(request.url);

  // Check if this is a single document request (path ends with /:id)
  const pathParts = url.pathname.split('/').filter(Boolean);
  const lastPart = pathParts[pathParts.length - 1];

  // If last path segment is not a known query param, treat it as an ID
  if (
    pathParts.length >= 5 &&
    lastPart !== 'staged-documents' &&
    lastPart !== 'workbench' &&
    !url.searchParams.has('tab')
  ) {
    const id = decodeURIComponent(lastPart);
    if (id) {
      const doc = await queryDecoratedDocument(env.BETTERLB_DB, id);
      if (!doc) {
        return Response.json(
          { error: 'Staged document not found' },
          { status: 404 }
        );
      }
      return Response.json(doc);
    }
  }

  // List view
  const tab = (url.searchParams.get('tab') ||
    'missing_dates') as QueryStagedDocumentsParams['tab'];
  const status = (url.searchParams.get('status') ||
    'active') as QueryStagedDocumentsParams['status'];
  const page = Math.max(1, parseInt(url.searchParams.get('page') || '1', 10));
  const limit = parsePaginationParam(
    url.searchParams.get('limit'),
    50,
    PAGINATION_LIMITS.MAX_LIMIT
  );
  const search = (url.searchParams.get('search') || '').trim();

  const result = await queryStagedDocuments(env.BETTERLB_DB, {
    tab,
    status,
    page,
    limit,
    search,
  });

  return Response.json(result);
}

export const onRequestGet = withAuth(handleGetStagedDocuments, {
  requirePermission: Permission.WORKBENCH_READ,
});
