import { useCallback, useEffect, useMemo, useState } from 'react';

import { Button } from '@bettergov/kapwa/button';
import {
  AlertTriangle,
  Calendar,
  CheckCircle2,
  ExternalLink,
  FileSearch,
  History,
  RefreshCw,
  Search,
} from 'lucide-react';

import { Badge } from '@/components/ui/Badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import {
  ReviewEvidence,
  WorkbenchDocument,
  WorkbenchStats,
  WorkbenchStatus,
  WorkbenchTab,
  WorkbenchTerm,
  workbenchApi,
} from '@/lib/workbench-api';

type ReviewField = 'date_enacted' | 'title' | 'term_id' | 'turnover_marker';

const tabs: Array<{ id: WorkbenchTab; label: string; field: ReviewField }> = [
  { id: 'missing_dates', label: 'Missing Dates', field: 'date_enacted' },
  { id: 'missing_titles', label: 'Missing Titles', field: 'title' },
  { id: 'missing_terms', label: 'Missing Terms', field: 'term_id' },
  {
    id: 'turnover_markers',
    label: 'Turnover Markers',
    field: 'turnover_marker',
  },
];

const statuses: WorkbenchStatus[] = ['active', 'resolved', 'blocked', 'all'];

function inferTerm(dateValue: string, terms: WorkbenchTerm[]) {
  if (!dateValue) return null;
  const time = Date.parse(dateValue);
  if (Number.isNaN(time)) return null;
  const matches = terms.filter(term => {
    const start = Date.parse(term.start_date);
    const end = Date.parse(term.end_date);
    return time >= start && time <= end;
  });
  return matches.length === 1 ? matches[0] : null;
}

function formatType(value: string) {
  return value.replace(/_/g, ' ');
}

function reviewFlags(item: WorkbenchDocument) {
  const flags = [];
  if (!item.date_enacted) flags.push('missing date');
  if (!item.title) flags.push('missing title');
  if (!item.term_id) flags.push('missing term');
  if (item.turnover_marker) flags.push('turnover');
  return flags;
}

function fieldLabel(field: ReviewField) {
  if (field === 'date_enacted') return 'Date enacted';
  if (field === 'title') return 'Title';
  if (field === 'term_id') return 'Term';
  return 'Turnover term';
}

function fieldInstruction(field: ReviewField) {
  if (field === 'date_enacted') {
    return 'Enter the enactment date visible in the official PDF or source evidence.';
  }
  if (field === 'title') {
    return 'Enter the official title exactly enough to identify the document.';
  }
  if (field === 'term_id') {
    return 'Choose the council term this document belongs to. Use the date or source evidence as justification.';
  }
  return 'Confirm which term the OLD/NEW turnover marker belongs to.';
}

function suggestedTurnoverTerm(
  item: WorkbenchDocument,
  terms: WorkbenchTerm[]
) {
  const year = Number(
    String(item.number || item.normalized_number).match(/\d{4}/)?.[0]
  );
  if (!year) return null;
  const haystack = [
    item.number,
    item.normalized_number,
    item.title,
    item.pdf_url,
    JSON.stringify(item.source_record?.raw_payload_json || {}),
  ].join(' ');
  const isOld = /\(old\)|\bold\b/i.test(haystack);
  const isNew = /\(new\)|\bnew\b/i.test(haystack);
  if (!isOld && !isNew) return null;

  return (
    terms.find(term => {
      const startYear = new Date(term.start_date).getFullYear();
      const endYear = new Date(term.end_date).getFullYear();
      return isOld ? endYear === year : startYear === year;
    }) || null
  );
}

function StatusBadge({ status }: { status: string }) {
  const variant =
    status === 'resolved'
      ? 'success'
      : status === 'blocked'
        ? 'warning'
        : 'slate';
  return <Badge variant={variant}>{status}</Badge>;
}

export default function OpenLguWorkbench() {
  const [stats, setStats] = useState<WorkbenchStats | null>(null);
  const [terms, setTerms] = useState<WorkbenchTerm[]>([]);
  const [items, setItems] = useState<WorkbenchDocument[]>([]);
  const [selected, setSelected] = useState<WorkbenchDocument | null>(null);
  const [tab, setTab] = useState<WorkbenchTab>('missing_dates');
  const [status, setStatus] = useState<WorkbenchStatus>('active');
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [serverError, setServerError] = useState<string | null>(null);

  const activeTab = tabs.find(candidate => candidate.id === tab) || tabs[0];

  const load = useCallback(async () => {
    setLoading(true);
    setServerError(null);
    try {
      const [statsData, termsData, docsData] = await Promise.all([
        workbenchApi.stats(),
        workbenchApi.terms(),
        workbenchApi.stagedDocuments({ tab, status, page, limit: 25, search }),
      ]);
      setStats(statsData);
      setTerms(termsData.items);
      setItems(docsData.items);
      setTotal(docsData.total);
      setSelected(current => {
        if (!current) return docsData.items[0] || null;
        return (
          docsData.items.find(item => item.id === current.id) ||
          docsData.items[0] ||
          null
        );
      });
    } catch (error) {
      setServerError(error instanceof Error ? error.message : String(error));
    } finally {
      setLoading(false);
    }
  }, [tab, status, page, search]);

  useEffect(() => {
    load();
  }, [load]);

  useEffect(() => {
    const handle = window.setTimeout(() => {
      setPage(1);
      load();
    }, 250);
    return () => window.clearTimeout(handle);
  }, [search, load]);

  async function reloadArtifacts() {
    await workbenchApi.reload();
    await load();
  }

  return (
    <div className='mt-8 space-y-6'>
      <section className='flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between'>
        <div>
          <div className='flex items-center gap-3'>
            <FileSearch className='text-kapwa-text-brand h-7 w-7' />
            <h2 className='text-kapwa-text-strong text-2xl font-bold'>
              OpenLGU Review Workbench
            </h2>
            {import.meta.env.DEV && <Badge variant='warning'>Local Only</Badge>}
          </div>
          <p className='text-kapwa-text-support mt-2 max-w-3xl text-sm'>
            Review staged source records and write append-only local decisions.
            Canonical D1 records are untouched.
          </p>
        </div>
        <Button
          variant='outline'
          size='sm'
          leftIcon={<RefreshCw className='h-4 w-4' />}
          onClick={reloadArtifacts}
        >
          Reload Artifacts
        </Button>
      </section>

      {serverError && (
        <div className='border-kapwa-border-danger bg-kapwa-bg-danger-weak text-kapwa-text-danger flex items-start gap-3 rounded-lg border p-4 text-sm'>
          <AlertTriangle className='mt-0.5 h-4 w-4 shrink-0' />
          <div>
            <p className='font-semibold'>Workbench server is not reachable</p>
            <p className='mt-1'>
              Start it with <code>npm run openlgu:review-server</code>. API:{' '}
              {workbenchApi.baseUrl}
            </p>
            <p className='mt-1'>{serverError}</p>
          </div>
        </div>
      )}

      <StatsStrip stats={stats} />

      <div className='flex flex-wrap items-center gap-2 border-b border-kapwa-border-weak pb-3'>
        {tabs.map(candidate => {
          const tabStats = stats?.[candidate.id];
          return (
            <button
              key={candidate.id}
              type='button'
              onClick={() => {
                setTab(candidate.id);
                setPage(1);
                setSelected(null);
              }}
              className={`rounded-md border px-3 py-2 text-sm font-semibold ${
                tab === candidate.id
                  ? 'border-kapwa-border-brand bg-kapwa-bg-brand-weak text-kapwa-text-brand'
                  : 'border-kapwa-border-weak bg-kapwa-bg-surface text-kapwa-text-support'
              }`}
            >
              {candidate.label}
              <span className='ml-2 text-xs'>{tabStats?.active ?? '--'}</span>
            </button>
          );
        })}
      </div>

      <div className='grid gap-6 xl:grid-cols-[minmax(0,1fr)_440px]'>
        <section className='space-y-4'>
          <div className='flex flex-col gap-3 md:flex-row md:items-center md:justify-between'>
            <div className='relative md:w-80'>
              <Search className='text-kapwa-text-muted absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2' />
              <input
                value={search}
                onChange={event => setSearch(event.target.value)}
                className='kapwa-input w-full pl-9'
                placeholder='Search number, title, source id'
              />
            </div>
            <div className='flex flex-wrap gap-2'>
              {statuses.map(candidate => (
                <button
                  key={candidate}
                  type='button'
                  onClick={() => {
                    setStatus(candidate);
                    setPage(1);
                  }}
                  className={`rounded-md border px-3 py-2 text-xs font-bold uppercase ${
                    status === candidate
                      ? 'border-kapwa-border-brand bg-kapwa-bg-brand-weak text-kapwa-text-brand'
                      : 'border-kapwa-border-weak text-kapwa-text-support'
                  }`}
                >
                  {candidate}
                </button>
              ))}
            </div>
          </div>

          <div className='space-y-3'>
            {loading && (
              <Card>
                <CardContent>
                  <p className='text-kapwa-text-support text-sm'>
                    Loading staged records…
                  </p>
                </CardContent>
              </Card>
            )}
            {!loading && items.length === 0 && (
              <Card>
                <CardContent>
                  <p className='text-kapwa-text-support text-sm'>
                    No records in this view.
                  </p>
                </CardContent>
              </Card>
            )}
            {items.map(item => (
              <DocumentRow
                key={item.id}
                item={item}
                field={activeTab.field}
                selected={selected?.id === item.id}
                onSelect={() => setSelected(item)}
              />
            ))}
          </div>

          <div className='flex items-center justify-between pt-2 text-sm'>
            <span className='text-kapwa-text-support'>
              Page {page} · {total.toLocaleString()} total
            </span>
            <div className='flex gap-2'>
              <Button
                variant='outline'
                size='sm'
                disabled={page <= 1}
                onClick={() => setPage(value => Math.max(1, value - 1))}
              >
                Previous
              </Button>
              <Button
                variant='outline'
                size='sm'
                disabled={page * 25 >= total}
                onClick={() => setPage(value => value + 1)}
              >
                Next
              </Button>
            </div>
          </div>
        </section>

        <ReviewPanel
          item={selected}
          field={activeTab.field}
          terms={terms}
          onSaved={async updated => {
            if (updated) setSelected(updated);
            await load();
          }}
        />
      </div>
    </div>
  );
}

function StatsStrip({ stats }: { stats: WorkbenchStats | null }) {
  const cards = [
    ['Staged', stats?.staged_documents],
    ['Needs Review', stats?.needs_review],
    ['Missing Dates', stats?.missing_dates.active],
    ['Missing Terms', stats?.missing_terms.active],
    ['Decisions', stats?.decisions],
  ];

  return (
    <div className='grid gap-3 md:grid-cols-5'>
      {cards.map(([label, value]) => (
        <div
          key={label}
          className='border-kapwa-border-weak bg-kapwa-bg-surface rounded-lg border p-4'
        >
          <p className='text-kapwa-text-muted text-xs font-bold uppercase'>
            {label}
          </p>
          <p className='text-kapwa-text-strong mt-1 text-2xl font-bold'>
            {typeof value === 'number' ? value.toLocaleString() : '--'}
          </p>
        </div>
      ))}
    </div>
  );
}

function DocumentRow({
  item,
  field,
  selected,
  onSelect,
}: {
  item: WorkbenchDocument;
  field: string;
  selected: boolean;
  onSelect: () => void;
}) {
  const fieldStatus = item.projected_fields[field]?.status || 'active';

  return (
    <button
      type='button'
      onClick={onSelect}
      className={`block w-full rounded-lg border p-4 text-left transition ${
        selected
          ? 'border-kapwa-border-brand bg-kapwa-bg-brand-weak'
          : 'border-kapwa-border-weak bg-kapwa-bg-surface hover:border-kapwa-border-brand'
      }`}
    >
      <div className='flex flex-wrap items-center gap-2'>
        <Badge variant='outline'>{formatType(item.document_type)}</Badge>
        <Badge variant='slate'>{item.number || 'no number'}</Badge>
        <StatusBadge status={fieldStatus} />
        {reviewFlags(item).map(flag => (
          <Badge
            key={flag}
            variant={flag === 'turnover' ? 'warning' : 'outline'}
          >
            {flag}
          </Badge>
        ))}
      </div>
      <h3 className='text-kapwa-text-strong mt-3 line-clamp-2 text-sm font-semibold'>
        {item.title || 'Missing title'}
      </h3>
      <p className='text-kapwa-text-muted mt-2 text-xs'>
        {item.source_record_id}
      </p>
    </button>
  );
}

function ReviewPanel({
  item,
  field,
  terms,
  onSaved,
}: {
  item: WorkbenchDocument | null;
  field: ReviewField;
  terms: WorkbenchTerm[];
  onSaved: (updated: WorkbenchDocument | null) => Promise<void>;
}) {
  const [value, setValue] = useState('');
  const [evidenceKind, setEvidenceKind] =
    useState<ReviewEvidence['kind']>('manual_inspection');
  const [note, setNote] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setValue('');
    setNote('');
    setError(null);
  }, [item?.id, field]);

  const inferredTerm = useMemo(
    () => (field === 'date_enacted' ? inferTerm(value, terms) : null),
    [field, terms, value]
  );
  const turnoverSuggestion = useMemo(
    () => (item ? suggestedTurnoverTerm(item, terms) : null),
    [item, terms]
  );

  async function save(
    decisionType: 'set_field' | 'cannot_determine' | 'confirm_turnover'
  ) {
    if (!item) return;
    setSaving(true);
    setError(null);
    try {
      const result = await workbenchApi.createDecision({
        source_record_id: item.source_record_id,
        staged_document_id: item.id,
        decision_type: decisionType,
        field,
        value,
        evidence: [
          {
            kind: evidenceKind,
            note:
              note ||
              (decisionType === 'confirm_turnover'
                ? `Confirmed turnover marker belongs to ${value}.`
                : field === 'term_id'
                  ? `Manually assigned document to ${value}.`
                  : ''),
            url: item.official_pdf_url || item.source_record?.source_url,
            local_path: item.local_mirror_path || undefined,
          },
        ],
      });
      await onSaved(result.item);
    } catch (saveError) {
      setError(
        saveError instanceof Error ? saveError.message : String(saveError)
      );
    } finally {
      setSaving(false);
    }
  }

  if (!item) {
    return (
      <Card className='xl:sticky xl:top-4'>
        <CardContent>
          <p className='text-kapwa-text-support text-sm'>
            Select a staged record to review.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className='xl:sticky xl:top-4 xl:max-h-[calc(100vh-2rem)] xl:overflow-auto'>
      <CardHeader>
        <div className='flex items-start justify-between gap-4'>
          <div>
            <CardTitle level='h3'>Review Evidence</CardTitle>
            <p className='text-kapwa-text-muted mt-1 text-xs'>
              {item.source_record_id}
            </p>
          </div>
          <StatusBadge
            status={item.projected_fields[field]?.status || 'active'}
          />
        </div>
      </CardHeader>
      <CardContent className='space-y-5'>
        <div>
          <div className='mb-2 flex flex-wrap gap-2'>
            <Badge variant='outline'>{formatType(item.document_type)}</Badge>
            <Badge variant='slate'>{item.number || 'no number'}</Badge>
            {item.term_id && <Badge variant='success'>{item.term_id}</Badge>}
          </div>
          <h3 className='text-kapwa-text-strong text-base font-semibold'>
            {item.title || 'Missing title'}
          </h3>
        </div>

        <div className='grid gap-2 text-sm'>
          <EvidenceLink label='Official PDF' href={item.official_pdf_url} />
          <EvidenceLink
            label='Source Page'
            href={item.source_record?.source_url || ''}
          />
          {item.local_mirror_path && (
            <p className='text-kapwa-text-support break-all text-xs'>
              Local mirror: {item.local_mirror_path}
            </p>
          )}
        </div>

        <div>
          <h4 className='text-kapwa-text-strong mb-2 text-sm font-bold'>
            Raw Payload
          </h4>
          <pre className='border-kapwa-border-weak bg-kapwa-bg-subtle max-h-56 overflow-auto rounded-lg border p-3 text-xs whitespace-pre-wrap'>
            {JSON.stringify(
              item.source_record?.raw_payload_json || {},
              null,
              2
            )}
          </pre>
        </div>

        <div className='border-kapwa-border-weak space-y-3 border-t pt-4'>
          <label className='block text-sm font-semibold text-kapwa-text-strong'>
            {fieldLabel(field)}
          </label>
          <p className='text-kapwa-text-support text-sm'>
            {fieldInstruction(field)}
          </p>
          {field === 'date_enacted' ? (
            <input
              type='date'
              value={value}
              onChange={event => setValue(event.target.value)}
              className='kapwa-input w-full'
            />
          ) : field === 'turnover_marker' || field === 'term_id' ? (
            <select
              value={value}
              onChange={event => setValue(event.target.value)}
              className='kapwa-input w-full'
            >
              <option value=''>
                {field === 'turnover_marker'
                  ? 'Select confirmed turnover term'
                  : 'Select term'}
              </option>
              {terms.map(term => (
                <option key={term.id} value={term.id}>
                  {term.id} · {term.start_date} to {term.end_date}
                </option>
              ))}
            </select>
          ) : (
            <input
              value={value}
              onChange={event => setValue(event.target.value)}
              className='kapwa-input w-full'
              placeholder='Resolved title'
            />
          )}
          {field === 'turnover_marker' && turnoverSuggestion && (
            <button
              type='button'
              onClick={() => setValue(turnoverSuggestion.id)}
              className='border-kapwa-border-warning bg-kapwa-bg-warning-weak text-kapwa-text-warning rounded-md border px-3 py-2 text-left text-sm font-semibold'
            >
              Suggested: {turnoverSuggestion.id} from OLD/NEW marker and
              document year
            </button>
          )}
          {field === 'date_enacted' && value && (
            <div className='flex items-center gap-2 text-sm'>
              <Calendar className='text-kapwa-text-muted h-4 w-4' />
              <span className='text-kapwa-text-support'>
                Inferred term:{' '}
                <strong>{inferredTerm ? inferredTerm.id : 'unmatched'}</strong>
              </span>
            </div>
          )}

          <select
            value={evidenceKind}
            onChange={event =>
              setEvidenceKind(event.target.value as ReviewEvidence['kind'])
            }
            className='kapwa-input w-full'
          >
            <option value='manual_inspection'>Manual inspection</option>
            <option value='pdf_text'>PDF text</option>
            <option value='website_table'>Website table</option>
            <option value='facebook_post'>Facebook post</option>
            <option value='filename_inference'>Filename inference</option>
          </select>
          <textarea
            value={note}
            onChange={event => setNote(event.target.value)}
            className='kapwa-input min-h-24 w-full'
            placeholder='Evidence note'
          />

          {error && <p className='text-kapwa-text-danger text-sm'>{error}</p>}

          <div className='flex flex-wrap gap-2'>
            <Button
              size='sm'
              leftIcon={<CheckCircle2 className='h-4 w-4' />}
              disabled={saving || !value}
              onClick={() =>
                save(
                  field === 'turnover_marker' ? 'confirm_turnover' : 'set_field'
                )
              }
            >
              {field === 'turnover_marker'
                ? 'Confirm Turnover Term'
                : field === 'term_id'
                  ? 'Assign Term'
                  : 'Save Decision'}
            </Button>
            <Button
              variant='outline'
              size='sm'
              leftIcon={<AlertTriangle className='h-4 w-4' />}
              disabled={saving}
              onClick={() => save('cannot_determine')}
            >
              Cannot Determine
            </Button>
          </div>
        </div>

        <div className='border-kapwa-border-weak border-t pt-4'>
          <div className='mb-2 flex items-center gap-2'>
            <History className='text-kapwa-text-muted h-4 w-4' />
            <h4 className='text-kapwa-text-strong text-sm font-bold'>
              History
            </h4>
          </div>
          {item.review_decisions.length === 0 ? (
            <p className='text-kapwa-text-support text-sm'>No decisions yet.</p>
          ) : (
            <div className='space-y-2'>
              {item.review_decisions.map(decision => (
                <div
                  key={decision.id}
                  className='border-kapwa-border-weak rounded-lg border p-3 text-xs'
                >
                  <div className='flex flex-wrap items-center gap-2'>
                    <Badge
                      variant={
                        decision.decision_type === 'set_field'
                          ? 'success'
                          : 'warning'
                      }
                    >
                      {decision.decision_type}
                    </Badge>
                    <span className='text-kapwa-text-support'>
                      {decision.field}
                    </span>
                    <span className='text-kapwa-text-muted'>
                      {new Date(decision.created_at).toLocaleString()}
                    </span>
                  </div>
                  {decision.value && (
                    <p className='text-kapwa-text-strong mt-2 font-semibold'>
                      {decision.value}
                    </p>
                  )}
                  {decision.derived?.term_id && (
                    <p className='text-kapwa-text-support mt-1'>
                      Term: {decision.derived.term_id}
                    </p>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

function EvidenceLink({ label, href }: { label: string; href: string }) {
  if (!href) {
    return (
      <p className='text-kapwa-text-muted text-xs'>{label}: unavailable</p>
    );
  }
  return (
    <a
      href={href}
      target='_blank'
      rel='noreferrer'
      className='text-kapwa-text-brand inline-flex items-center gap-1 break-all text-xs font-semibold'
    >
      <ExternalLink className='h-3.5 w-3.5 shrink-0' />
      {label}
    </a>
  );
}
