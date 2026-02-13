import { useEffect, useState } from 'react';

import { Banner } from '@/kapwa/banner';
import {
  AlertCircle,
  CheckCircle,
  RefreshCw,
  RotateCcw,
  Trash2,
  Users,
} from 'lucide-react';

import Button from '@/components/ui/Button';
import { Card, CardContent } from '@/components/ui/Card';
import { EmptyState } from '@/components/ui/EmptyState';

interface Person {
  id: string;
  first_name: string;
  middle_name: string | null;
  last_name: string;
  suffix?: string | null;
  deleted_at: string;
  full_name: string;
  deleted_by?: string;
}

interface QueueResponse {
  persons: Person[];
}

interface ActionResponse {
  success: boolean;
  error?: string;
  restored_count?: number;
  deleted_count?: number;
  error_count?: number;
  errors?: Array<{ id: string; reason: string }>;
}

export default function DeletionQueue() {
  const [persons, setPersons] = useState<Person[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [actionResult, setActionResult] = useState<string | null>(null);

  // Banner state for error notifications
  const [banner, setBanner] = useState<{
    message: string;
    type: 'success' | 'warning' | 'error' | 'info';
  } | null>(null);

  useEffect(() => {
    fetchQueue();
  }, []);

  const fetchQueue = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/admin/persons-deletion-queue');
      if (!response.ok) throw new Error('Failed to fetch deletion queue');

      const data: QueueResponse = await response.json();
      setPersons(data.persons || []);
    } catch (error) {
      console.error('Error fetching deletion queue:', error);
    } finally {
      setLoading(false);
    }
  };

  const restorePerson = async (personId: string) => {
    setActionLoading(true);
    setActionResult(null);

    try {
      const response = await fetch(
        '/api/admin/persons-deletion-queue?action=restore',
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ person_id: personId }),
        }
      );

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to restore person');
      }

      await fetchQueue();
      setActionResult(`Restored person successfully`);
      setTimeout(() => setActionResult(null), 3000);
    } catch (error) {
      console.error('Error restoring person:', error);
      setBanner({
        message:
          error instanceof Error ? error.message : 'Failed to restore person',
        type: 'error',
      });
    } finally {
      setActionLoading(false);
    }
  };

  const permanentDelete = async (personId: string) => {
    setActionLoading(true);
    setActionResult(null);

    try {
      const response = await fetch(
        '/api/admin/persons-deletion-queue?action=permanent-delete',
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ person_id: personId }),
        }
      );

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to permanently delete person');
      }

      await fetchQueue();
      setSelectedIds(prev => {
        const next = new Set(prev);
        next.delete(personId);
        return next;
      });
      setActionResult(`Permanently deleted person successfully`);
      setTimeout(() => setActionResult(null), 3000);
    } catch (error) {
      console.error('Error permanently deleting person:', error);
      setBanner({
        message:
          error instanceof Error
            ? error.message
            : 'Failed to permanently delete person',
        type: 'error',
      });
    } finally {
      setActionLoading(false);
    }
  };

  const bulkRestore = async () => {
    if (selectedIds.size === 0) return;

    setActionLoading(true);
    setActionResult(null);

    try {
      const response = await fetch(
        '/api/admin/persons-deletion-queue?action=bulk-restore',
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ person_ids: Array.from(selectedIds) }),
        }
      );

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to bulk restore');
      }

      const data: ActionResponse = await response.json();
      await fetchQueue();
      setSelectedIds(new Set());
      setActionResult(`Restored ${data.restored_count} person(s) successfully`);
      setTimeout(() => setActionResult(null), 3000);
    } catch (error) {
      console.error('Error bulk restoring:', error);
      setBanner({
        message:
          error instanceof Error ? error.message : 'Failed to bulk restore',
        type: 'error',
      });
    } finally {
      setActionLoading(false);
    }
  };

  const bulkPermanentDelete = async () => {
    if (selectedIds.size === 0) return;

    setActionLoading(true);
    setActionResult(null);

    try {
      const response = await fetch(
        '/api/admin/persons-deletion-queue?action=bulk-permanent-delete',
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ person_ids: Array.from(selectedIds) }),
        }
      );

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to bulk permanently delete');
      }

      const data: ActionResponse = await response.json();
      await fetchQueue();
      setSelectedIds(new Set());

      if (data.error_count && data.error_count > 0) {
        setActionResult(
          `Deleted ${data.deleted_count} person(s). ${data.error_count} failed (have remaining references).`
        );
      } else {
        setActionResult(
          `Permanently deleted ${data.deleted_count} person(s) successfully`
        );
      }
      setTimeout(() => setActionResult(null), 5000);
    } catch (error) {
      console.error('Error bulk permanently deleting:', error);
      setBanner({
        message:
          error instanceof Error
            ? error.message
            : 'Failed to bulk permanently delete',
        type: 'error',
      });
    } finally {
      setActionLoading(false);
    }
  };

  const toggleSelection = (id: string) => {
    setSelectedIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const selectAll = () => {
    setSelectedIds(new Set(persons.map(p => p.id)));
  };

  const clearSelection = () => {
    setSelectedIds(new Set());
  };

  if (loading) {
    return (
      <div className='flex items-center justify-center py-12'>
        <RefreshCw className='h-8 w-8 animate-spin text-slate-400' />
      </div>
    );
  }

  if (persons.length === 0) {
    return (
      <EmptyState
        title='Deletion Queue Empty'
        message='No persons are currently flagged for deletion.'
        icon={Users}
      />
    );
  }

  return (
    <div className='space-y-6'>
      {/* Header */}
      <div className='flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between'>
        <div>
          <h2 className='text-2xl font-bold text-slate-900'>Deletion Queue</h2>
          <p className='text-slate-600'>
            {persons.length} person{persons.length !== 1 ? 's' : ''} flagged for
            deletion
            {selectedIds.size > 0 && ` (${selectedIds.size} selected)`}
          </p>
        </div>
        <Button
          variant='outline'
          size='sm'
          leftIcon={<RefreshCw className='h-4 w-4' />}
          onClick={fetchQueue}
          disabled={actionLoading}
        >
          Refresh
        </Button>
      </div>

      {/* Action Result Message */}
      {/* Notifications */}
      {banner && (
        <div className='mb-4'>
          <Banner
            type={banner.type}
            description={banner.message}
            onDismiss={() => setBanner(null)}
          />
        </div>
      )}
      {actionResult && (
        <div className='flex items-center gap-2 rounded-md bg-emerald-50 p-3 text-sm'>
          <CheckCircle className='h-4 w-4 text-emerald-600' />
          <span className='font-medium text-emerald-900'>{actionResult}</span>
        </div>
      )}

      {/* Bulk Actions */}
      {selectedIds.size > 0 && (
        <div className='flex flex-col gap-3 rounded-md border border-slate-200 bg-slate-50 p-4 sm:flex-row sm:items-center sm:justify-between'>
          <div className='flex items-center gap-3'>
            <span className='font-medium text-slate-900'>
              {selectedIds.size} item{selectedIds.size !== 1 ? 's' : ''}{' '}
              selected
            </span>
            <button
              onClick={clearSelection}
              className='hover:text-primary-600 text-sm text-slate-600'
            >
              Clear selection
            </button>
          </div>
          <div className='flex items-center gap-2'>
            <Button
              variant='outline'
              size='sm'
              leftIcon={<RotateCcw className='h-4 w-4' />}
              onClick={bulkRestore}
              disabled={actionLoading}
            >
              Restore Selected
            </Button>
            <Button
              variant='outline'
              size='sm'
              leftIcon={<Trash2 className='h-4 w-4' />}
              onClick={bulkPermanentDelete}
              disabled={actionLoading}
              className='text-red-600 hover:border-red-300 hover:bg-red-50'
            >
              Permanently Delete
            </Button>
          </div>
        </div>
      )}

      {/* Select All Bar */}
      <div className='flex items-center gap-2 text-sm text-slate-600'>
        <button
          onClick={selectAll}
          className='hover:text-primary-600 flex items-center gap-1'
        >
          <input
            type='checkbox'
            checked={selectedIds.size === persons.length && persons.length > 0}
            onChange={selectAll}
            className='text-primary-600 focus:ring-primary-500 h-4 w-4 rounded border-slate-300'
            readOnly
          />
          Select all ({persons.length})
        </button>
        <span>•</span>
        <button onClick={clearSelection} className='hover:text-primary-600'>
          Clear selection
        </button>
      </div>

      {/* Person List */}
      <div className='space-y-3'>
        {persons.map(person => {
          const isSelected = selectedIds.has(person.id);

          return (
            <Card
              key={person.id}
              variant={isSelected ? 'default' : 'default'}
              className={`transition-all ${
                isSelected
                  ? 'border-l-primary-500 bg-primary-50 border-l-4'
                  : ''
              }`}
            >
              <CardContent className='flex flex-col gap-4 p-4 sm:flex-row sm:items-center sm:justify-between'>
                <div className='flex items-start gap-3'>
                  <input
                    type='checkbox'
                    checked={isSelected}
                    onChange={() => toggleSelection(person.id)}
                    className='text-primary-600 focus:ring-primary-500 mt-1 h-4 w-4 rounded border-slate-300'
                  />
                  <div>
                    <h3 className='font-medium text-slate-900'>
                      {person.full_name}
                    </h3>
                    <div className='mt-1 flex flex-wrap gap-3 text-xs text-slate-500'>
                      <span>ID: {person.id}</span>
                      <span>•</span>
                      <span>
                        Flagged{' '}
                        {new Date(person.deleted_at).toLocaleDateString()}
                      </span>
                      {person.deleted_by && (
                        <>
                          <span>•</span>
                          <span>By {person.deleted_by}</span>
                        </>
                      )}
                    </div>
                  </div>
                </div>

                <div className='flex items-center gap-2 sm:self-center'>
                  <Button
                    variant='outline'
                    size='sm'
                    leftIcon={<RotateCcw className='h-4 w-4' />}
                    onClick={() => restorePerson(person.id)}
                    disabled={actionLoading}
                  >
                    Restore
                  </Button>
                  <Button
                    variant='outline'
                    size='sm'
                    leftIcon={<Trash2 className='h-4 w-4' />}
                    onClick={() => permanentDelete(person.id)}
                    disabled={actionLoading}
                    className='text-red-600 hover:border-red-300 hover:bg-red-50'
                  >
                    Delete
                  </Button>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Help Text */}
      <div className='rounded-md border border-amber-200 bg-amber-50 p-4'>
        <div className='flex items-start gap-3'>
          <AlertCircle className='mt-0.5 h-5 w-5 flex-shrink-0 text-amber-600' />
          <div className='text-sm'>
            <p className='font-medium text-amber-900'>
              About the Deletion Queue
            </p>
            <p className='mt-1 text-amber-800'>
              These persons were flagged for deletion during merge operations.
              You can restore them if needed, or permanently delete them once
              you&apos;ve verified they&apos;re no longer needed. Persons with
              remaining references (memberships, document authorships) cannot be
              permanently deleted.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
