import { useEffect, useState } from 'react';

import {
  AlertCircle,
  Check,
  ChevronLeft,
  ChevronRight,
  Edit3,
  Facebook,
  FileText,
  GitMerge,
  Globe,
  RefreshCw,
  Save,
  Undo,
  User,
  X,
} from 'lucide-react';

import { Badge } from '@/components/ui/Badge';
import Button from '@/components/ui/Button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { EmptyState } from '@/components/ui/EmptyState';
import SelectPicker from '@/components/ui/SelectPicker';

// Define the interface locally since it's not exported
interface SelectPickerOption {
  label: string;
  value: string;
}

type ReconcileStatus = 'unresolved' | 'resolved' | 'skipped';
type ConflictType = 'moved_by' | 'seconded_by' | 'authors' | 'title' | 'none';

interface ConflictRecord {
  id: string;
  document_id: string;
  conflict_type: ConflictType;
  facebook_value: string | null;
  govph_value: string | null;
  resolved_value: string | null;
  status: ReconcileStatus;
  notes: string | null;
  created_at: string;
  resolved_at: string | null;
  document?: {
    id: string;
    type: string;
    number: string;
    title: string;
    pdf_url: string;
  };
}

interface ReconcileResponse {
  items: ConflictRecord[];
  pagination: {
    total: number;
    limit: number;
    offset: number;
    has_more: boolean;
  };
}

interface DocumentDetail {
  id: string;
  type: string;
  number: string;
  title: string;
  moved_by: string | null;
  seconded_by: string | null;
  authors: Array<{
    id: string;
    first_name: string;
    last_name: string;
  }>;
  pdf_url: string;
}

const statusOptions: SelectPickerOption<ReconcileStatus | 'all'>[] = [
  { value: 'all', label: 'All Status' },
  { value: 'unresolved', label: 'Unresolved' },
  { value: 'resolved', label: 'Resolved' },
  { value: 'skipped', label: 'Skipped' },
];

const conflictTypeOptions: SelectPickerOption<ConflictType | 'all'>[] = [
  { value: 'all', label: 'All Conflicts' },
  { value: 'moved_by', label: 'Moved By' },
  { value: 'seconded_by', label: 'Seconded By' },
  { value: 'authors', label: 'Authors' },
  { value: 'title', label: 'Title' },
  { value: 'none', label: 'No Conflict' },
];

const statusBadgeVariant = (status: ReconcileStatus) => {
  switch (status) {
    case 'unresolved':
      return 'warning';
    case 'resolved':
      return 'success';
    case 'skipped':
      return 'slate';
    default:
      return 'slate';
  }
};

const conflictTypeLabel = (type: ConflictType) => {
  switch (type) {
    case 'moved_by':
      return 'Moved By';
    case 'seconded_by':
      return 'Seconded By';
    case 'authors':
      return 'Authors';
    case 'title':
      return 'Title';
    case 'none':
      return 'No Conflict';
    default:
      return type;
  }
};

export default function Reconcile() {
  const [items, setItems] = useState<ConflictRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<ReconcileStatus | 'all'>(
    'unresolved'
  );
  const [conflictTypeFilter, setConflictTypeFilter] = useState<
    ConflictType | 'all'
  >('all');
  const [page, setPage] = useState(0);
  const [pagination, setPagination] = useState({
    total: 0,
    limit: 20,
    offset: 0,
    has_more: false,
  });
  const [selectedItem, setSelectedItem] = useState<ConflictRecord | null>(null);
  const [documentDetail, setDocumentDetail] = useState<DocumentDetail | null>(
    null
  );
  const [editMode, setEditMode] = useState(false);
  const [editedValue, setEditedValue] = useState('');

  useEffect(() => {
    fetchConflicts();
  }, [statusFilter, conflictTypeFilter, page]);

  const fetchConflicts = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        limit: '20',
        offset: String(page * 20),
      });

      if (statusFilter !== 'all') {
        params.append('status', statusFilter);
      }
      if (conflictTypeFilter !== 'all') {
        params.append('conflict_type', conflictTypeFilter);
      }

      const response = await fetch(`/api/admin/reconcile?${params}`);
      if (!response.ok) throw new Error('Failed to fetch conflicts');

      const data: ReconcileResponse = await response.json();
      setItems(data.items || []);
      setPagination(data.pagination);
    } catch (error) {
      console.error('Error fetching conflicts:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchDocumentDetail = async (documentId: string) => {
    try {
      const response = await fetch(`/api/legislation/documents/${documentId}`);
      if (!response.ok) throw new Error('Failed to fetch document');
      const data = await response.json();
      setDocumentDetail(data);
    } catch (error) {
      console.error('Error fetching document:', error);
    }
  };

  const selectItem = async (item: ConflictRecord) => {
    setSelectedItem(item);
    setEditMode(false);
    setEditedValue(
      item.resolved_value || item.govph_value || item.facebook_value || ''
    );
    await fetchDocumentDetail(item.document_id);
  };

  const resolveConflict = async (
    itemId: string,
    resolvedValue: string,
    notes?: string
  ) => {
    try {
      const response = await fetch('/api/admin/reconcile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          conflict_id: itemId,
          resolved_value: resolvedValue,
          notes,
        }),
      });

      if (!response.ok) throw new Error('Failed to resolve conflict');
      fetchConflicts();
      if (selectedItem?.id === itemId) {
        setSelectedItem(null);
        setDocumentDetail(null);
      }
    } catch (error) {
      console.error('Error resolving conflict:', error);
    }
  };

  const skipConflict = async (itemId: string) => {
    try {
      const response = await fetch('/api/admin/reconcile/skip', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ conflict_id: itemId }),
      });

      if (!response.ok) throw new Error('Failed to skip conflict');
      fetchConflicts();
      if (selectedItem?.id === itemId) {
        setSelectedItem(null);
        setDocumentDetail(null);
      }
    } catch (error) {
      console.error('Error skipping conflict:', error);
    }
  };

  if (loading && items.length === 0) {
    return (
      <div className='flex items-center justify-center py-12'>
        <RefreshCw className='h-8 w-8 animate-spin text-slate-400' />
      </div>
    );
  }

  if (items.length === 0 && !loading) {
    return (
      <EmptyState
        title='No conflicts to reconcile'
        message={
          statusFilter !== 'all'
            ? `No conflicts with status "${statusFilter}"`
            : 'All data has been reconciled!'
        }
        icon={GitMerge}
      />
    );
  }

  return (
    <div className='space-y-6'>
      {/* Header */}
      <div className='flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between'>
        <div>
          <h2 className='text-2xl font-bold text-slate-900'>
            Data Reconciliation
          </h2>
          <p className='text-slate-600'>
            {pagination.total} conflicts between Facebook and gov.ph sources
          </p>
        </div>
        <div className='flex items-center gap-3'>
          <SelectPicker
            value={conflictTypeFilter}
            onChange={v => {
              setConflictTypeFilter(v as ConflictType | 'all');
              setPage(0);
            }}
            options={conflictTypeOptions}
            className='w-40'
          />
          <SelectPicker
            value={statusFilter}
            onChange={v => {
              setStatusFilter(v as ReconcileStatus | 'all');
              setPage(0);
            }}
            options={statusOptions}
            className='w-40'
          />
          <Button
            variant='outline'
            size='sm'
            leftIcon={<RefreshCw className='h-4 w-4' />}
            onClick={() => fetchConflicts()}
          >
            Refresh
          </Button>
        </div>
      </div>

      {/* Main Content Area */}
      <div className='grid gap-6 lg:grid-cols-3'>
        {/* Conflict List */}
        <div className='space-y-4 lg:col-span-1'>
          <h3 className='font-bold text-slate-900'>Conflicts</h3>
          <div className='space-y-3'>
            {items.map(item => (
              <Card
                key={item.id}
                variant='default'
                className={
                  selectedItem?.id === item.id
                    ? 'border-l-primary-500 bg-primary-50/30 border-l-4'
                    : item.status === 'unresolved'
                      ? 'border-l-4 border-l-amber-500'
                      : ''
                }
                hover
              >
                <CardContent className='p-4'>
                  <div className='flex cursor-pointer items-start justify-between'>
                    <div className='flex-1' onClick={() => selectItem(item)}>
                      <div className='mb-2 flex flex-wrap items-center gap-2'>
                        <Badge variant={statusBadgeVariant(item.status)}>
                          {item.status}
                        </Badge>
                        <Badge variant='outline'>
                          {conflictTypeLabel(item.conflict_type)}
                        </Badge>
                      </div>
                      {item.document && (
                        <>
                          <p className='text-sm font-bold text-slate-900'>
                            {item.document.type === 'ordinance' ? 'O' : 'R'} -{' '}
                            {item.document.number}
                          </p>
                          <p className='mt-1 line-clamp-2 text-xs text-slate-600'>
                            {item.document.title}
                          </p>
                        </>
                      )}
                    </div>
                    {item.status === 'unresolved' && (
                      <Button
                        variant='ghost'
                        size='sm'
                        onClick={e => {
                          e.stopPropagation();
                          resolveConflict(
                            item.id,
                            item.govph_value || item.facebook_value || ''
                          );
                        }}
                      >
                        <Check className='h-4 w-4' />
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Detail Panel */}
        <div className='lg:col-span-2'>
          {selectedItem ? (
            <div className='space-y-4'>
              {/* Document Info */}
              {documentDetail && (
                <Card variant='default'>
                  <CardHeader>
                    <CardTitle level='h3'>Document Details</CardTitle>
                  </CardHeader>
                  <CardContent className='space-y-3'>
                    <div className='flex items-center gap-3'>
                      <Badge
                        variant={
                          documentDetail.type === 'ordinance'
                            ? 'primary'
                            : 'secondary'
                        }
                      >
                        {documentDetail.type}
                      </Badge>
                      <span className='font-mono font-bold text-slate-700'>
                        {documentDetail.number}
                      </span>
                      <a
                        href={documentDetail.pdf_url}
                        target='_blank'
                        rel='noopener noreferrer'
                        className='text-primary-600 ml-auto text-sm hover:underline'
                      >
                        <FileText className='mr-1 inline h-4 w-4' />
                        View PDF
                      </a>
                    </div>
                    <p className='text-slate-700'>{documentDetail.title}</p>
                    {documentDetail.authors &&
                      documentDetail.authors.length > 0 && (
                        <div className='flex flex-wrap gap-2'>
                          {documentDetail.authors.map(author => (
                            <Badge
                              key={author.id}
                              variant='slate'
                              className='text-xs'
                            >
                              <User className='mr-1 h-3 w-3' />
                              {author.first_name} {author.last_name}
                            </Badge>
                          ))}
                        </div>
                      )}
                  </CardContent>
                </Card>
              )}

              {/* Conflict Comparison */}
              <Card variant='default' className='border-l-4 border-l-amber-500'>
                <CardHeader>
                  <div className='flex items-center justify-between'>
                    <CardTitle level='h3'>
                      Conflict: {conflictTypeLabel(selectedItem.conflict_type)}
                    </CardTitle>
                    {editMode ? (
                      <div className='flex gap-2'>
                        <Button
                          variant='ghost'
                          size='sm'
                          onClick={() => {
                            setEditMode(false);
                            setEditedValue(
                              selectedItem.resolved_value ||
                                selectedItem.govph_value ||
                                selectedItem.facebook_value ||
                                ''
                            );
                          }}
                        >
                          <Undo className='h-4 w-4' />
                        </Button>
                        <Button
                          variant='success'
                          size='sm'
                          onClick={() => {
                            resolveConflict(
                              selectedItem.id,
                              editedValue,
                              'Manual correction'
                            );
                            setEditMode(false);
                          }}
                        >
                          <Save className='h-4 w-4' />
                        </Button>
                      </div>
                    ) : (
                      <Button
                        variant='outline'
                        size='sm'
                        leftIcon={<Edit3 className='h-4 w-4' />}
                        onClick={() => setEditMode(true)}
                        disabled={selectedItem.status === 'resolved'}
                      >
                        Edit
                      </Button>
                    )}
                  </div>
                </CardHeader>
                <CardContent className='space-y-4'>
                  {/* Facebook Value */}
                  <div className='rounded-md bg-blue-50 p-4'>
                    <div className='mb-2 flex items-center gap-2'>
                      <Facebook className='h-4 w-4 text-blue-600' />
                      <span className='text-sm font-bold text-blue-900'>
                        Facebook Source
                      </span>
                    </div>
                    {editMode && selectedItem.conflict_type !== 'authors' ? (
                      <input
                        type='text'
                        value={
                          editedValue ||
                          selectedItem.resolved_value ||
                          selectedItem.facebook_value ||
                          ''
                        }
                        onChange={e => setEditedValue(e.target.value)}
                        className='w-full rounded-md border border-blue-300 bg-white px-3 py-2 text-sm'
                      />
                    ) : (
                      <p className='text-sm text-blue-800'>
                        {selectedItem.facebook_value || (
                          <span className='text-blue-400 italic'>
                            Not available
                          </span>
                        )}
                      </p>
                    )}
                  </div>

                  {/* gov.ph Value */}
                  <div className='rounded-md bg-emerald-50 p-4'>
                    <div className='mb-2 flex items-center gap-2'>
                      <Globe className='h-4 w-4 text-emerald-600' />
                      <span className='text-sm font-bold text-emerald-900'>
                        gov.ph Source
                      </span>
                    </div>
                    <p className='text-sm text-emerald-800'>
                      {selectedItem.govph_value || (
                        <span className='text-emerald-400 italic'>
                          Not available
                        </span>
                      )}
                    </p>
                  </div>

                  {/* Resolved Value */}
                  {selectedItem.resolved_value && (
                    <div className='rounded-md bg-slate-100 p-4'>
                      <div className='mb-2 flex items-center gap-2'>
                        <Check className='h-4 w-4 text-slate-600' />
                        <span className='text-sm font-bold text-slate-900'>
                          Resolved Value
                        </span>
                      </div>
                      <p className='text-sm text-slate-700'>
                        {selectedItem.resolved_value}
                      </p>
                    </div>
                  )}

                  {/* Actions */}
                  {selectedItem.status === 'unresolved' && !editMode && (
                    <div className='flex flex-wrap gap-2'>
                      <Button
                        variant='primary'
                        size='sm'
                        onClick={() =>
                          resolveConflict(
                            selectedItem.id,
                            selectedItem.facebook_value || '',
                            'Using Facebook value'
                          )
                        }
                        disabled={!selectedItem.facebook_value}
                      >
                        Use Facebook
                      </Button>
                      <Button
                        variant='success'
                        size='sm'
                        onClick={() =>
                          resolveConflict(
                            selectedItem.id,
                            selectedItem.govph_value || '',
                            'Using gov.ph value'
                          )
                        }
                        disabled={!selectedItem.govph_value}
                      >
                        Use gov.ph
                      </Button>
                      <Button
                        variant='outline'
                        size='sm'
                        onClick={() => skipConflict(selectedItem.id)}
                      >
                        Skip
                      </Button>
                    </div>
                  )}

                  {/* Notes */}
                  {selectedItem.notes && (
                    <div className='rounded-md bg-slate-50 p-3'>
                      <p className='text-xs font-bold text-slate-900 uppercase'>
                        Notes
                      </p>
                      <p className='mt-1 text-sm text-slate-600'>
                        {selectedItem.notes}
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          ) : (
            <Card variant='slate'>
              <CardContent className='py-12 text-center'>
                <GitMerge className='mx-auto mb-4 h-12 w-12 text-slate-400' />
                <p className='text-slate-600'>
                  Select a conflict from the list to view details and resolve
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      {/* Pagination */}
      {pagination.total > pagination.limit && (
        <div className='flex items-center justify-between'>
          <p className='text-sm text-slate-600'>
            Showing {pagination.offset + 1}-
            {Math.min(pagination.offset + pagination.limit, pagination.total)}{' '}
            of {pagination.total}
          </p>
          <div className='flex gap-2'>
            <Button
              variant='outline'
              size='sm'
              disabled={page === 0}
              onClick={() => setPage(p => p - 1)}
              leftIcon={<ChevronLeft className='h-4 w-4' />}
            >
              Previous
            </Button>
            <Button
              variant='outline'
              size='sm'
              disabled={!pagination.has_more}
              onClick={() => setPage(p => p + 1)}
              rightIcon={<ChevronRight className='h-4 w-4' />}
            >
              Next
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
