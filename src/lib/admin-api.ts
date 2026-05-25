/**
 * Admin API Client
 *
 * Centralized API client for admin operations.
 * Provides consistent error handling, CSRF token management, and loading states.
 *
 * @example
 * ```tsx
 * // Fetch documents
 * const { data, error } = await adminApi.documents.list({ limit: 20 });
 *
 * // Create document
 * const result = await adminApi.documents.create({ title: '...' });
 *
 * // With React hook
 * const { data, loading, error, refresh } = useAdminApi(
 *   () => adminApi.documents.list({ limit: 20 })
 * );
 * ```
 */

// Base URL for admin API endpoints
const ADMIN_BASE_URL = '/api/admin';

// Standard error response from backend
interface ApiError {
  error: string;
  code?: string;
  details?: unknown;
}

// Standard paginated response
interface PaginatedResponse<T> {
  items: T[];
  pagination: {
    total: number;
    limit: number;
    offset: number;
    has_more: boolean;
  };
}

/**
 * Get CSRF token from meta tag
 */
function getCsrfToken(): string {
  const metaTag = document.querySelector('meta[name="csrf-token"]');
  return metaTag?.getAttribute('content') || '';
}

/**
 * Build query string from params
 */
function buildQueryString(
  params: Record<string, string | number | boolean | undefined>
): string {
  const searchParams = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) {
    if (value !== undefined) {
      searchParams.set(key, String(value));
    }
  }
  return searchParams.toString();
}

/**
 * Core fetch wrapper with error handling
 */
async function fetchApi<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const url = `${ADMIN_BASE_URL}${endpoint}`;

  const response = await fetch(url, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      'X-CSRF-Token': getCsrfToken(),
      ...options.headers,
    },
  });

  if (!response.ok) {
    let errorMessage = `HTTP ${response.status}: ${response.statusText}`;
    try {
      const errorData = (await response.json()) as ApiError;
      errorMessage = errorData.error || errorMessage;
    } catch {
      // Use default error message
    }
    throw new Error(errorMessage);
  }

  return response.json() as Promise<T>;
}

/**
 * Documents API
 */
export const documentsApi = {
  /**
   * List documents with optional filters
   */
  list: (
    params: {
      limit?: number;
      offset?: number;
      type?: string;
      status?: string;
      term?: string;
    } = {}
  ) => {
    const queryString = buildQueryString(params);
    return fetchApi<PaginatedResponse<unknown>>(`/documents?${queryString}`);
  },

  /**
   * Get single document
   */
  get: (id: string) => {
    return fetchApi<unknown>(`/documents/${id}`);
  },

  /**
   * Create document
   */
  create: (data: unknown) => {
    return fetchApi<{ success: boolean; id?: string }>('/documents', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  /**
   * Update document
   */
  update: (id: string, data: unknown) => {
    return fetchApi<{ success: boolean }>(`/documents/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  },

  /**
   * Delete document
   */
  delete: (id: string) => {
    return fetchApi<{ success: boolean }>(`/documents/${id}`, {
      method: 'DELETE',
    });
  },

  /**
   * Bulk create documents
   */
  bulkCreate: (documents: unknown[]) => {
    return fetchApi<{ success: boolean; count: number }>('/documents/bulk', {
      method: 'POST',
      body: JSON.stringify({ documents }),
    });
  },

  /**
   * Resolve duplicate document
   */
  resolveDuplicate: (data: { keep_id: string; remove_id: string }) => {
    return fetchApi<{ success: boolean }>('/documents/resolve-duplicate', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },
};

/**
 * Persons API
 */
export const personsApi = {
  /**
   * List persons with optional filters
   */
  list: (
    params: {
      limit?: number;
      offset?: number;
      search?: string;
      committee_id?: string;
      term_id?: string;
    } = {}
  ) => {
    const queryString = buildQueryString(params);
    return fetchApi<PaginatedResponse<unknown>>(`/persons?${queryString}`);
  },

  /**
   * Get single person
   */
  get: (id: string) => {
    return fetchApi<unknown>(`/persons/${id}`);
  },

  /**
   * Find potential duplicates
   */
  findDuplicates: (
    params: {
      limit?: number;
      offset?: number;
    } = {}
  ) => {
    const queryString = buildQueryString(params);
    return fetchApi<PaginatedResponse<unknown>>(
      `/persons/duplicates?${queryString}`
    );
  },

  /**
   * Merge persons
   */
  merge: (data: { keep_id: string; remove_ids: string[] }) => {
    return fetchApi<{ success: boolean }>('/persons/merge', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },
};

/**
 * Sessions API
 */
export const sessionsApi = {
  /**
   * List sessions
   */
  list: (
    params: {
      limit?: number;
      offset?: number;
      term_id?: string;
    } = {}
  ) => {
    const queryString = buildQueryString(params);
    return fetchApi<PaginatedResponse<unknown>>(`/sessions?${queryString}`);
  },

  /**
   * Get single session
   */
  get: (id: string) => {
    return fetchApi<unknown>(`/sessions/${id}`);
  },

  /**
   * Create session
   */
  create: (data: unknown) => {
    return fetchApi<{ success: boolean; id?: string }>('/sessions', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  /**
   * Update session
   */
  update: (id: string, data: unknown) => {
    return fetchApi<{ success: boolean }>(`/sessions/${id}`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },
};

/**
 * Review Queue API
 */
export const reviewQueueApi = {
  /**
   * List review queue items
   */
  list: (
    params: {
      limit?: number;
      offset?: number;
      status?: string;
      item_type?: string;
    } = {}
  ) => {
    const queryString = buildQueryString(params);
    return fetchApi<PaginatedResponse<unknown>>(`/review-queue?${queryString}`);
  },

  /**
   * Create review item
   */
  create: (data: {
    item_type: string;
    item_id: string;
    issue_type: string;
    description?: string;
    source_type?: string;
    source_url?: string;
  }) => {
    return fetchApi<{ success: boolean; item: unknown }>('/review-queue', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },
};

/**
 * Stats API
 */
export const statsApi = {
  /**
   * Get dashboard stats
   */
  get: () => {
    return fetchApi<Record<string, number>>('/stats');
  },
};

/**
 * Reconcile API
 */
export const reconcileApi = {
  /**
   * List conflicts
   */
  list: (
    params: {
      limit?: number;
      offset?: number;
      status?: string;
    } = {}
  ) => {
    const queryString = buildQueryString(params);
    return fetchApi<PaginatedResponse<unknown>>(`/reconcile?${queryString}`);
  },

  /**
   * Resolve conflict
   */
  resolve: (data: {
    conflict_id: string;
    resolved_value: string;
    notes?: string;
  }) => {
    return fetchApi<{ success: boolean }>('/reconcile', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },
};

/**
 * Admin API client - all endpoints
 */
export const adminApi = {
  documents: documentsApi,
  persons: personsApi,
  sessions: sessionsApi,
  reviewQueue: reviewQueueApi,
  stats: statsApi,
  reconcile: reconcileApi,
};

// Re-export fetchWithCache for general use
export { fetchWithCache } from './api';
