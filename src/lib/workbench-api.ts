const WORKBENCH_API =
  import.meta.env.VITE_OPENLGU_REVIEW_API ||
  (import.meta.env.DEV
    ? 'http://127.0.0.1:8789/api/workbench'
    : '/api/admin/workbench');

export type WorkbenchTab =
  | 'missing_dates'
  | 'missing_titles'
  | 'missing_terms'
  | 'turnover_markers';
export type WorkbenchStatus = 'active' | 'resolved' | 'blocked' | 'all';

export interface WorkbenchStats {
  staged_documents: number;
  decisions: number;
  needs_review: number;
  missing_dates: WorkbenchTabStats;
  missing_titles: WorkbenchTabStats;
  missing_terms: WorkbenchTabStats;
  turnover_markers: WorkbenchTabStats;
}

export interface WorkbenchTabStats {
  total: number;
  active: number;
  resolved: number;
  blocked: number;
}

export interface WorkbenchTerm {
  id: string;
  label: string;
  start_date: string;
  end_date: string;
}

export interface ReviewDecision {
  id: string;
  source_record_id: string;
  staged_document_id: string | null;
  decision_type: 'set_field' | 'cannot_determine' | 'confirm_turnover';
  field: 'date_enacted' | 'title' | 'term_id' | 'turnover_marker';
  value: string | null;
  derived: { term_id: string | null; term_inference: string } | null;
  evidence: ReviewEvidence[];
  created_at: string;
  created_by: string;
  is_current_source_hash?: boolean;
}

export interface ReviewEvidence {
  kind:
    | 'pdf_text'
    | 'website_table'
    | 'facebook_post'
    | 'filename_inference'
    | 'manual_inspection';
  note: string;
  url?: string;
  local_path?: string;
  quote?: string;
}

export interface WorkbenchSourceRecord {
  id: string;
  source_key: string;
  source_url: string;
  content_hash: string;
  pdf_reachability: string;
  pdf_redirect_url: string | null;
  pdf_checked_at: string | null;
  raw_payload_json: Record<string, unknown>;
}

export interface WorkbenchDocument {
  id: string;
  source_record_id: string;
  candidate_document_id: string | null;
  document_type: string;
  number: string;
  normalized_number: string;
  title: string;
  date_enacted: string;
  pdf_url: string;
  term_id: string;
  staging_status: string;
  review_reason: string | null;
  turnover_marker: boolean;
  official_pdf_url: string;
  local_mirror_path: string;
  source_record: WorkbenchSourceRecord | null;
  projected_fields: Record<
    string,
    {
      status: 'active' | 'resolved' | 'blocked';
      decision: ReviewDecision | null;
    }
  >;
  review_decisions: ReviewDecision[];
}

interface ListResponse<T> {
  items: T[];
  total: number;
  page: number;
  limit: number;
  has_more: boolean;
}

async function fetchWorkbench<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const response = await fetch(`${WORKBENCH_API}${endpoint}`, {
    ...options,
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
  });

  if (!response.ok) {
    let message = `HTTP ${response.status}: ${response.statusText}`;
    try {
      const body = await response.json();
      message = body.error || message;
    } catch {
      // Keep default message.
    }
    throw new Error(message);
  }

  return response.json() as Promise<T>;
}

export const workbenchApi = {
  baseUrl: WORKBENCH_API,
  health: () =>
    fetchWorkbench<{
      ok: boolean;
      error: string | null;
      loaded_at: string | null;
      artifacts: Record<string, number>;
    }>('/health'),
  stats: () => fetchWorkbench<WorkbenchStats>('/stats'),
  terms: () => fetchWorkbench<{ items: WorkbenchTerm[] }>('/terms'),
  reload: () =>
    // Deployed workbench doesn't need reload — data lives in D1
    import.meta.env.DEV
      ? fetchWorkbench<{ ok: boolean; error: string | null }>('/reload', {
          method: 'POST',
        })
      : Promise.resolve({ ok: true, error: null } as {
          ok: boolean;
          error: string | null;
        }),
  stagedDocuments: (params: {
    tab: WorkbenchTab;
    status: WorkbenchStatus;
    page?: number;
    limit?: number;
    search?: string;
  }) => {
    const query = new URLSearchParams();
    query.set('tab', params.tab);
    query.set('status', params.status);
    query.set('page', String(params.page || 1));
    query.set('limit', String(params.limit || 25));
    if (params.search) query.set('search', params.search);
    return fetchWorkbench<ListResponse<WorkbenchDocument>>(
      `/staged-documents?${query.toString()}`
    );
  },
  createDecision: (body: {
    source_record_id: string;
    staged_document_id: string;
    decision_type: 'set_field' | 'cannot_determine' | 'confirm_turnover';
    field: 'date_enacted' | 'title' | 'term_id' | 'turnover_marker';
    value?: string;
    evidence: ReviewEvidence[];
  }) =>
    fetchWorkbench<{
      decision: ReviewDecision;
      item: WorkbenchDocument | null;
    }>('/review-decisions', {
      method: 'POST',
      body: JSON.stringify(body),
    }),
};
