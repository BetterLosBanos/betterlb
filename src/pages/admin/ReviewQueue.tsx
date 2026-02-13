import { useCallback, useEffect, useState } from 'react';

import { Banner } from '@/kapwa/banner';
import {
  Calendar,
  Check,
  CheckSquare,
  ChevronLeft,
  ChevronRight,
  Edit3,
  FileText,
  RefreshCw,
  Square,
  User,
  Users,
} from 'lucide-react';

import { Badge } from '@/components/ui/Badge';
import Button from '@/components/ui/Button';
import { Card, CardContent } from '@/components/ui/Card';
import { EmptyState } from '@/components/ui/EmptyState';

import AttendanceForm from './components/AttendanceForm';
import DocumentEditModal from './components/DocumentEditModal';
import SessionDataForm from './components/SessionDataForm';

type ReviewStatus = 'pending' | 'in_progress' | 'resolved' | 'skipped';
type ItemType = 'document' | 'session' | 'attendance';

type StatusOption = { value: ReviewStatus | 'all'; label: string };
type TypeOption = { value: ItemType | 'all'; label: string };

const statusOptions: StatusOption[] = [
  { value: 'all', label: 'All Statuses' },
  { value: 'pending', label: 'Pending' },
  { value: 'in_progress', label: 'In Progress' },
  { value: 'resolved', label: 'Resolved' },
  { value: 'skipped', label: 'Skipped' },
];

const typeOptions: TypeOption[] = [
  { value: 'all', label: 'All Types' },
  { value: 'document', label: 'Documents' },
  { value: 'session', label: 'Sessions' },
  { value: 'attendance', label: 'Attendance' },
];

interface ReviewItem {
  id: string;
  item_type: ItemType;
  item_id: string;
  issue_type: string;
  description: string | null;
  source_type: 'pdf' | 'facebook' | 'manual' | 'other';
  source_url: string | null;
  status: ReviewStatus;
  assigned_to: string | null;
  resolution: string | null;
  created_at: string;
  resolved_at: string | null;
  // Additional fields for document items
  document?: {
    id: string;
    type: string;
    number: string;
    title: string;
    pdf_url: string;
  };
}

interface ReviewQueueResponse {
  items: ReviewItem[];
  pagination: {
    total: number;
    limit: number;
    offset: number;
    has_more: boolean;
  };
}

const statusBadgeVariant = (status: ReviewStatus) => {
  switch (status) {
    case 'pending':
      return 'warning';
    case 'in_progress':
      return 'primary';
    case 'resolved':
      return 'success';
    case 'skipped':
      return 'slate';
    default:
      return 'slate';
  }
};

export default function ReviewQueue() {
  const [items, setItems] = useState<ReviewItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<ReviewStatus | 'all'>(
    'pending'
  );
  const [typeFilter, setTypeFilter] = useState<ItemType | 'all'>('all');
  const [page, setPage] = useState(0);
  const [selectedItems, setSelectedItems] = useState<Set<string>>(new Set());
  const [bulkActionLoading, setBulkActionLoading] = useState(false);
  const [pagination, setPagination] = useState({
    total: 0,
    limit: 20,
    offset: 0,
    has_more: false,
  });

  // Banner state for error notifications
  const [banner, setBanner] = useState<{
    message: string;
    type: 'success' | 'warning' | 'error' | 'info';
  } | null>(null);

  const [editModalDocumentId, setEditModalDocumentId] = useState<string | null>(
    null
  );
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [sessionFormSessionId, setSessionFormSessionId] = useState<
    string | null
  >(null);
  const [sessionFormOpen, setSessionFormOpen] = useState(false);
  const [attendanceFormSessionId, setAttendanceFormSessionId] = useState<
    string | null
  >(null);
  const [attendanceFormOpen, setAttendanceFormOpen] = useState(false);

  const fetchQueue = useCallback(async () => {
    setLoading(true);
    try {
      // Check if mock mode is enabled
      const isMockMode = import.meta.env.VITE_ADMIN_MOCK_MODE === 'true';

      if (isMockMode) {
        // Use mock data for local development
        const mockData: ReviewItem[] = [
          {
            id: '1',
            item_type: 'document',
            item_id: 'resolution_sb_12_2024-001',
            issue_type: 'low_ocr_confidence',
            description: 'OCR confidence below 50% - manual review required',
            source_type: 'pdf',
            source_url: 'https://losbanos.gov.ph/resolutions/2024-001.pdf',
            status: 'pending',
            assigned_to: null,
            resolution: null,
            created_at: '2024-01-31T10:00:00Z',
            resolved_at: null,
            document: {
              id: 'resolution_sb_12_2024-001',
              type: 'resolution',
              number: '2024-001',
              title: 'AN ORDINANCE ENACTING THE SUPPLEMENTAL BUDGET',
              pdf_url: 'https://losbanos.gov.ph/resolutions/2024-001.pdf',
            },
          },
          {
            id: '2',
            item_type: 'document',
            item_id: 'ordinance_sb_12_2025-2460',
            issue_type: 'missing_author',
            description: 'Could not match author from extracted text',
            source_type: 'pdf',
            source_url: 'https://losbanos.gov.ph/ordinances/2025-2460.pdf',
            status: 'in_progress',
            assigned_to: 'mock-user',
            resolution: null,
            created_at: '2024-01-31T09:30:00Z',
            resolved_at: null,
            document: {
              id: 'ordinance_sb_12_2025-2460',
              type: 'ordinance',
              number: '2025-2460',
              title: 'SUPPLEMENTAL BUDGET FOR FY 2025',
              pdf_url: 'https://losbanos.gov.ph/ordinances/2025-2460.pdf',
            },
          },
          {
            id: '3',
            item_type: 'session',
            item_id: 'sb_12_2025-01-15',
            issue_type: 'attendance_mismatch',
            description: 'Absent count does not match between sources',
            source_type: 'pdf',
            source_url: 'https://losbanos.gov.ph/sessions/2025-01-15.pdf',
            status: 'pending',
            assigned_to: null,
            resolution: null,
            created_at: '2024-01-31T08:00:00Z',
            resolved_at: null,
          },
        ];

        // Filter mock data based on filters
        let filtered = mockData;
        if (statusFilter !== 'all') {
          filtered = filtered.filter(item => item.status === statusFilter);
        }
        if (typeFilter !== 'all') {
          filtered = filtered.filter(item => item.item_type === typeFilter);
        }

        // Pagination
        const offset = page * 20;
        const paginated = filtered.slice(offset, offset + 20);

        setItems(paginated);
        setPagination({
          total: filtered.length,
          limit: 20,
          offset,
          has_more: offset + 20 < filtered.length,
        });
        return;
      }

      const params = new URLSearchParams({
        limit: '20',
        offset: String(page * 20),
      });

      if (statusFilter !== 'all') {
        params.append('status', statusFilter);
      }
      if (typeFilter !== 'all') {
        params.append('item_type', typeFilter);
      }

      const response = await fetch(`/api/admin/review-queue?${params}`);
      if (!response.ok) throw new Error('Failed to fetch review queue');

      const data: ReviewQueueResponse = await response.json();
      setItems(data.items || []);
      setPagination(data.pagination);
    } catch (error) {
      console.error('Error fetching review queue:', error);
    } finally {
      setLoading(false);
    }
  }, [statusFilter, typeFilter, page]);

  useEffect(() => {
    fetchQueue();
  }, [fetchQueue]);

  const updateStatus = async (itemId: string, status: ReviewStatus) => {
    try {
      const response = await fetch('/api/admin/review-queue/status', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ item_id: itemId, status }),
      });

      if (!response.ok) {
        let errorMsg = `Failed to update status (HTTP ${response.status})`;
        try {
          const error = await response.json();
          errorMsg = error.error || errorMsg;
        } catch {
          // Response body is empty or not JSON
        }
        throw new Error(errorMsg);
      }
      fetchQueue();
    } catch (error) {
      console.error('Error updating status:', error);
      setBanner({
        message: `Failed to update status: ${error instanceof Error ? error.message : 'Unknown error'}`,
        type: 'error',
      });
    }
  };

  const assignToSelf = async (itemId: string) => {
    try {
      const response = await fetch('/api/admin/review-queue/assign', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ item_id: itemId }),
      });

      if (!response.ok) {
        let errorMsg = `Failed to assign (HTTP ${response.status})`;
        try {
          const error = await response.json();
          errorMsg = error.error || errorMsg;
        } catch {
          // Response body is empty or not JSON
        }
        throw new Error(errorMsg);
      }
      fetchQueue();
    } catch (error) {
      console.error('Error assigning item:', error);
      setBanner({
        message: `Failed to assign: ${error instanceof Error ? error.message : 'Unknown error'}`,
        type: 'error',
      });
    }
  };

  const openEditModal = (documentId: string) => {
    setEditModalDocumentId(documentId);
    setEditModalOpen(true);
  };

  const saveDocument = async (data: Record<string, unknown>) => {
    // Check if mock mode is enabled
    const isMockMode = import.meta.env.VITE_ADMIN_MOCK_MODE === 'true';

    if (isMockMode) {
      // Mock save - just log and simulate success
      console.log('Mock save document:', editModalDocumentId, data);
      return;
    }

    const response = await fetch(
      `/api/admin/documents/${editModalDocumentId}`,
      {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      }
    );
    if (!response.ok) {
      let errorMsg = `Failed to save document (HTTP ${response.status})`;
      try {
        const error = await response.json();
        errorMsg = error.error || errorMsg;
      } catch {
        // Response body is empty or not JSON
      }
      throw new Error(errorMsg);
    }
    fetchQueue();
  };

  const openSessionForm = (sessionId: string) => {
    setSessionFormSessionId(sessionId);
    setSessionFormOpen(true);
  };

  const saveSession = async (data: Record<string, unknown>) => {
    const url = sessionFormSessionId
      ? `/api/admin/sessions/${sessionFormSessionId}`
      : '/api/admin/sessions';
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!response.ok) throw new Error('Failed to save session');
    fetchQueue();
  };

  const openAttendanceForm = (sessionId: string) => {
    setAttendanceFormSessionId(sessionId);
    setAttendanceFormOpen(true);
  };

  const saveAttendance = async (absentPersonIds: string[]) => {
    const response = await fetch(
      `/api/admin/attendance/${attendanceFormSessionId}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ absent_person_ids: absentPersonIds }),
      }
    );
    if (!response.ok) throw new Error('Failed to save attendance');
    fetchQueue();
  };

  const toggleItemSelection = (itemId: string) => {
    setSelectedItems(prev => {
      const next = new Set(prev);
      if (next.has(itemId)) {
        next.delete(itemId);
      } else {
        next.add(itemId);
      }
      return next;
    });
  };

  const selectAllVisible = () => {
    setSelectedItems(new Set(items.map(item => item.id)));
  };

  const clearSelection = () => {
    setSelectedItems(new Set());
  };

  const bulkUpdateStatus = async (newStatus: ReviewStatus) => {
    if (selectedItems.size === 0) return;

    setBulkActionLoading(true);
    try {
      await Promise.all(
        Array.from(selectedItems).map(itemId =>
          fetch('/api/admin/review-queue/status', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ item_id: itemId, status: newStatus }),
          })
        )
      );
      setSelectedItems(new Set());
      fetchQueue();
    } catch (error) {
      console.error('Error updating status:', error);
    } finally {
      setBulkActionLoading(false);
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
        title='No items in review queue'
        message={
          statusFilter !== 'all'
            ? `No items with status "${statusFilter}"`
            : 'All items have been processed!'
        }
        icon={FileText}
      />
    );
  }

  return (
    <div className='space-y-6'>
      {/* Banner for error notifications */}
      {banner && (
        <Banner
          type={banner.type}
          description={banner.message}
          onDismiss={() => setBanner(null)}
        />
      )}
      {/* Header */}
      <div className='flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between'>
        <div>
          <h2 className='text-2xl font-bold text-slate-900'>Review Queue</h2>
          <p className='text-slate-600'>
            {pagination.total} items needing review
            {selectedItems.size > 0 && ` (${selectedItems.size} selected)`}
          </p>
        </div>
        <div className='flex items-center gap-3'>
          <select
            value={typeFilter}
            onChange={e => {
              setTypeFilter(e.target.value as ItemType | 'all');
              setPage(0);
            }}
            className='focus:border-primary-500 focus:ring-primary-500/20 h-9 rounded-md border border-slate-300 bg-white px-3 py-1 text-sm shadow-sm focus:ring-2 focus:outline-none'
          >
            {typeOptions.map(opt => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
          <select
            value={statusFilter}
            onChange={e => {
              setStatusFilter(e.target.value as ReviewStatus | 'all');
              setPage(0);
            }}
            className='focus:border-primary-500 focus:ring-primary-500/20 h-9 rounded-md border border-slate-300 bg-white px-3 py-1 text-sm shadow-sm focus:ring-2 focus:outline-none'
          >
            {statusOptions.map(opt => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
          <Button
            variant='outline'
            size='sm'
            leftIcon={<RefreshCw className='h-4 w-4' />}
            onClick={() => fetchQueue()}
          >
            Refresh
          </Button>
        </div>
      </div>

      {/* Bulk Actions Bar */}
      {selectedItems.size > 0 && (
        <div className='bg-primary-50 flex items-center justify-between rounded-md p-4'>
          <div className='flex items-center gap-3'>
            <span className='text-primary-900 font-medium'>
              {selectedItems.size} item{selectedItems.size !== 1 ? 's' : ''}{' '}
              selected
            </span>
            <Button variant='ghost' size='sm' onClick={clearSelection}>
              Clear selection
            </Button>
          </div>
          <div className='flex items-center gap-2'>
            <Button
              variant='outline'
              size='sm'
              onClick={() => bulkUpdateStatus('resolved')}
              disabled={bulkActionLoading}
            >
              Approve Selected
            </Button>
            <Button
              variant='outline'
              size='sm'
              onClick={() => bulkUpdateStatus('skipped')}
              disabled={bulkActionLoading}
            >
              Skip Selected
            </Button>
          </div>
        </div>
      )}

      {/* Select All Bar */}
      {items.length > 0 && (
        <div className='flex items-center gap-2 text-sm text-slate-600'>
          <button
            onClick={selectAllVisible}
            className='hover:text-primary-600 flex items-center gap-1'
          >
            <CheckSquare className='h-4 w-4' />
            Select all visible
          </button>
          <span>•</span>
          <button onClick={clearSelection} className='hover:text-primary-600'>
            Clear selection
          </button>
        </div>
      )}

      {/* Queue Items */}
      <div className='space-y-4'>
        {items.map(item => (
          <Card
            key={item.id}
            variant='default'
            className={
              item.status === 'pending'
                ? 'border-l-4 border-l-amber-500'
                : item.status === 'in_progress'
                  ? 'border-l-4 border-l-blue-500'
                  : ''
            }
          >
            <CardContent className='p-5'>
              <div className='flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between'>
                <div className='flex-1 space-y-3'>
                  {/* Header Row with Checkbox */}
                  <div className='flex flex-wrap items-center gap-3'>
                    <button
                      onClick={() => toggleItemSelection(item.id)}
                      className='hover:text-primary-600 flex-shrink-0 text-slate-400'
                    >
                      {selectedItems.has(item.id) ? (
                        <CheckSquare className='text-primary-600 h-5 w-5' />
                      ) : (
                        <Square className='h-5 w-5' />
                      )}
                    </button>
                    <Badge variant={statusBadgeVariant(item.status)}>
                      {item.status.replace('_', ' ')}
                    </Badge>
                    <Badge variant='slate'>{item.item_type}</Badge>
                    <Badge variant='outline'>{item.source_type}</Badge>
                    <span className='text-xs text-slate-500'>
                      ID: {item.item_id}
                    </span>
                  </div>

                  {/* Description */}
                  <div>
                    <h3 className='font-bold text-slate-900'>
                      {item.issue_type}
                    </h3>
                    {item.description && (
                      <p className='mt-1 text-sm text-slate-600'>
                        {item.description}
                      </p>
                    )}
                  </div>

                  {/* Document Details (if applicable) */}
                  {item.document && (
                    <div className='rounded-md bg-slate-50 p-3'>
                      <div className='flex items-center gap-2 text-sm'>
                        <Badge
                          variant={
                            item.document.type === 'ordinance'
                              ? 'primary'
                              : 'secondary'
                          }
                        >
                          {item.document.type}
                        </Badge>
                        <span className='font-mono font-bold text-slate-700'>
                          {item.document.number}
                        </span>
                      </div>
                      <p className='mt-1 text-sm text-slate-600'>
                        {item.document.title}
                      </p>
                      {item.document.pdf_url && (
                        <a
                          href={item.document.pdf_url}
                          target='_blank'
                          rel='noopener noreferrer'
                          className='text-primary-600 mt-2 inline-flex items-center gap-1 text-xs hover:underline'
                        >
                          <FileText className='h-3 w-3' />
                          View PDF
                        </a>
                      )}
                    </div>
                  )}

                  {/* Metadata */}
                  <div className='flex flex-wrap gap-4 text-xs text-slate-500'>
                    <div className='flex items-center gap-1'>
                      <Calendar className='h-3 w-3' />
                      Created {new Date(item.created_at).toLocaleString()}
                    </div>
                    {item.assigned_to && (
                      <div className='flex items-center gap-1'>
                        <User className='h-3 w-3' />
                        Assigned to {item.assigned_to}
                      </div>
                    )}
                    {item.source_url && (
                      <a
                        href={item.source_url}
                        target='_blank'
                        rel='noopener noreferrer'
                        className='text-primary-600 hover:underline'
                      >
                        Source
                      </a>
                    )}
                  </div>

                  {/* Resolution (if resolved) */}
                  {item.resolution && (
                    <div className='rounded-md bg-emerald-50 p-3'>
                      <p className='text-xs font-bold text-emerald-900 uppercase'>
                        Resolution
                      </p>
                      <p className='mt-1 text-sm text-emerald-700'>
                        {item.resolution}
                      </p>
                    </div>
                  )}
                </div>

                {/* Actions */}
                <div className='flex flex-col gap-2 lg:min-w-[140px]'>
                  {item.item_type === 'document' && item.document && (
                    <Button
                      variant='outline'
                      size='sm'
                      leftIcon={<Edit3 className='h-4 w-4' />}
                      onClick={() => openEditModal(item.document.id)}
                    >
                      Edit Document
                    </Button>
                  )}
                  {item.item_type === 'session' && (
                    <>
                      <Button
                        variant='outline'
                        size='sm'
                        leftIcon={<Edit3 className='h-4 w-4' />}
                        onClick={() => openSessionForm(item.item_id)}
                      >
                        Edit Session
                      </Button>
                      <Button
                        variant='outline'
                        size='sm'
                        leftIcon={<Users className='h-4 w-4' />}
                        onClick={() => openAttendanceForm(item.item_id)}
                      >
                        Attendance
                      </Button>
                    </>
                  )}
                  {item.item_type === 'attendance' && (
                    <Button
                      variant='outline'
                      size='sm'
                      leftIcon={<Users className='h-4 w-4' />}
                      onClick={() => openAttendanceForm(item.item_id)}
                    >
                      Edit Attendance
                    </Button>
                  )}
                  {item.status === 'pending' && (
                    <>
                      <Button
                        variant='primary'
                        size='sm'
                        onClick={() => {
                          updateStatus(item.id, 'in_progress');
                          assignToSelf(item.id);
                        }}
                      >
                        Start Review
                      </Button>
                      <Button
                        variant='outline'
                        size='sm'
                        onClick={() => updateStatus(item.id, 'skipped')}
                      >
                        Skip
                      </Button>
                    </>
                  )}
                  {item.status === 'in_progress' && (
                    <>
                      <Button
                        variant='success'
                        size='sm'
                        leftIcon={<Check className='h-4 w-4' />}
                        onClick={() => updateStatus(item.id, 'resolved')}
                      >
                        Approve
                      </Button>
                      <Button
                        variant='outline'
                        size='sm'
                        onClick={() => updateStatus(item.id, 'pending')}
                      >
                        Release
                      </Button>
                    </>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
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

      {/* Edit Modal */}
      {editModalDocumentId && (
        <DocumentEditModal
          documentId={editModalDocumentId}
          open={editModalOpen}
          onClose={() => {
            setEditModalOpen(false);
            setEditModalDocumentId(null);
          }}
          onSave={saveDocument}
        />
      )}

      {/* Session Form Modal */}
      {sessionFormSessionId && sessionFormOpen && (
        <div className='fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4'>
          <div className='max-h-[90vh] w-full max-w-3xl overflow-y-auto rounded-lg bg-white p-6'>
            <h2 className='mb-4 text-2xl font-bold text-slate-900'>
              {sessionFormSessionId ? 'Edit Session' : 'Create Session'}
            </h2>
            <SessionDataForm
              sessionId={sessionFormSessionId}
              termId='' // Will need to be determined from session data
              onSave={async data => {
                await saveSession(data);
                setSessionFormOpen(false);
                setSessionFormSessionId(null);
              }}
              onCancel={() => {
                setSessionFormOpen(false);
                setSessionFormSessionId(null);
              }}
            />
          </div>
        </div>
      )}

      {/* Attendance Form Modal */}
      {attendanceFormSessionId && attendanceFormOpen && (
        <div className='fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4'>
          <div className='max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-lg bg-white p-6'>
            <h2 className='mb-4 text-2xl font-bold text-slate-900'>
              Edit Attendance
            </h2>
            <AttendanceForm
              sessionId={attendanceFormSessionId}
              onSave={async absentPersonIds => {
                await saveAttendance(absentPersonIds);
                setAttendanceFormOpen(false);
                setAttendanceFormSessionId(null);
              }}
              onCancel={() => {
                setAttendanceFormOpen(false);
                setAttendanceFormSessionId(null);
              }}
            />
          </div>
        </div>
      )}
    </div>
  );
}
