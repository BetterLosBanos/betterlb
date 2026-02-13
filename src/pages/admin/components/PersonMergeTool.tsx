import { useEffect, useState } from 'react';

import { Banner } from '@/kapwa/banner';
import {
  CheckCircle,
  ChevronRight,
  Flag,
  GitMerge,
  RefreshCw,
  SkipForward,
  Trash2,
  Users,
} from 'lucide-react';

import { Badge } from '@/components/ui/Badge';
import Button from '@/components/ui/Button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { EmptyState } from '@/components/ui/EmptyState';

interface Person {
  id: string;
  first_name: string;
  middle_name: string | null;
  last_name: string;
  suffix?: string | null;
}

interface DuplicateGroup {
  person_ids: string[];
  persons: Person[];
  document_count: number;
  membership_count: number;
  committee_count: number;
}

interface MergeResponse {
  success: boolean;
  merged_count: number;
  updated_tables: {
    memberships?: number;
    document_authors?: number;
    session_absences?: number;
    committee_memberships?: number;
    committee_duplicates_removed?: number;
    absence_duplicates_removed?: number;
    membership_duplicates_removed?: number;
  };
  deleted_ids: string[];
}

type DeletionMode = 'delete' | 'flag' | 'skip';

const getPersonName = (person: Person) => {
  const parts = [person.first_name, person.middle_name, person.last_name];
  if (person.suffix) parts.push(person.suffix);
  return parts.filter(Boolean).join(' ');
};

export default function PersonMergeTool() {
  const [duplicates, setDuplicates] = useState<DuplicateGroup[]>([]);
  const [loading, setLoading] = useState(true);
  const [merging, setMerging] = useState(false);
  const [selectedGroup, setSelectedGroup] = useState<number | null>(null);
  const [keepPersonId, setKeepPersonId] = useState<string | null>(null);
  const [deletionMode, setDeletionMode] = useState<DeletionMode>('delete');
  const [mergeResults, setMergeResults] = useState<MergeResponse | null>(null);

  // Banner state for notifications
  const [banner, setBanner] = useState<{
    message: string;
    type: 'success' | 'warning' | 'error' | 'info';
  } | null>(null);

  useEffect(() => {
    fetchDuplicates();
  }, []);

  const fetchDuplicates = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/admin/persons-merge');
      if (!response.ok) throw new Error('Failed to fetch duplicates');

      const data = await response.json();
      setDuplicates(data.duplicates || []);
    } catch (error) {
      console.error('Error fetching duplicates:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleMerge = async (keepId: string, mergeIds: string[]) => {
    setMerging(true);
    setMergeResults(null);

    try {
      const response = await fetch('/api/admin/persons-merge', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          keep_person_id: keepId,
          merge_person_ids: mergeIds,
          merge_strategy: 'prefer_keep',
          deletion_mode: deletionMode,
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to merge persons');
      }

      const result: MergeResponse = await response.json();
      setMergeResults(result);

      // Refresh the duplicates list after successful merge
      if (result.success) {
        // Remove the merged group from the list
        setDuplicates(prev => prev.filter((_, idx) => idx !== selectedGroup));
        setSelectedGroup(null);
        setKeepPersonId(null);
        setDeletionMode('delete');
      }
    } catch (error) {
      console.error('Error merging persons:', error);
      setBanner({
        message:
          error instanceof Error ? error.message : 'Failed to merge persons',
        type: 'error',
      });
    } finally {
      setMerging(false);
    }
  };

  const currentGroup =
    selectedGroup !== null ? duplicates[selectedGroup] : null;

  if (loading) {
    return (
      <div className='flex items-center justify-center py-12'>
        <RefreshCw className='h-8 w-8 animate-spin text-slate-400' />
      </div>
    );
  }

  if (duplicates.length === 0) {
    return (
      <EmptyState
        title='No duplicate persons found'
        message='All person records are unique!'
        icon={Users}
      />
    );
  }

  return (
    <div className='space-y-6'>
      {/* Notifications */}
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
          <h2 className='text-2xl font-bold text-slate-900'>
            Person Merge Tool
          </h2>
          <p className='text-slate-600'>
            {duplicates.length} group{duplicates.length !== 1 ? 's' : ''} of
            duplicate person records found
          </p>
        </div>
        <Button
          variant='outline'
          size='sm'
          leftIcon={<RefreshCw className='h-4 w-4' />}
          onClick={fetchDuplicates}
          disabled={merging}
        >
          Refresh
        </Button>
      </div>

      {/* Selected Group Details */}
      {currentGroup ? (
        <Card variant='default' className='border-l-4 border-l-amber-500'>
          <CardHeader>
            <div className='flex items-center justify-between'>
              <CardTitle className='flex items-center gap-2'>
                <GitMerge className='h-5 w-5' />
                Merge Duplicate Persons
              </CardTitle>
              <Button
                variant='ghost'
                size='sm'
                onClick={() => {
                  setSelectedGroup(null);
                  setKeepPersonId(null);
                  setDeletionMode('delete');
                  setMergeResults(null);
                }}
                disabled={merging}
              >
                Cancel
              </Button>
            </div>
          </CardHeader>
          <CardContent className='space-y-6'>
            {/* Person Cards */}
            <div className='grid gap-4 sm:grid-cols-2'>
              {currentGroup.persons.map(person => {
                const isKeep = person.id === keepPersonId;
                const isMerge = currentGroup.person_ids.includes(person.id);

                return (
                  <div
                    key={person.id}
                    onClick={() => setKeepPersonId(person.id)}
                    className={`cursor-pointer rounded-lg border-2 p-4 transition-all ${
                      isKeep
                        ? 'border-primary-500 bg-primary-50 ring-primary-200 ring-2'
                        : isMerge
                          ? 'border-amber-300 bg-amber-50 hover:border-amber-400'
                          : 'border-slate-200 bg-white hover:border-slate-300'
                    }`}
                  >
                    <div className='mb-3 flex items-center justify-between'>
                      <span className='text-xs font-bold text-slate-500 uppercase'>
                        {person.id}
                      </span>
                      {isKeep && (
                        <Badge variant='primary' size='sm'>
                          <CheckCircle className='h-3 w-3' /> Keep
                        </Badge>
                      )}
                    </div>
                    <h3 className='font-bold text-slate-900'>
                      {getPersonName(person)}
                    </h3>
                    {person.suffix && (
                      <p className='text-xs text-slate-500'>
                        Suffix: {person.suffix}
                      </p>
                    )}
                    <div className='mt-2 text-xs text-slate-500'>
                      ID: {person.id}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Related Records Summary */}
            <div className='rounded-md bg-slate-50 p-4'>
              <h4 className='mb-3 text-sm font-bold text-slate-900'>
                Related Records
              </h4>
              <div className='grid gap-2 sm:grid-cols-2'>
                <div className='flex items-center gap-2 text-sm'>
                  <Users className='h-4 w-4 text-slate-500' />
                  <span>
                    Memberships:{' '}
                    <strong>{currentGroup.membership_count}</strong>
                  </span>
                </div>
                <div className='flex items-center gap-2 text-sm'>
                  <CheckCircle className='h-4 w-4 text-slate-500' />
                  <span>
                    Committee Memberships:{' '}
                    <strong>{currentGroup.committee_count}</strong>
                  </span>
                </div>
                <div className='flex items-center gap-2 text-sm'>
                  <Users className='h-4 w-4 text-slate-500' />
                  <span>
                    Documents Authored:{' '}
                    <strong>{currentGroup.document_count}</strong>
                  </span>
                </div>
              </div>
              <p className='mt-2 text-xs text-slate-500'>
                When merged, all records will be transferred to the person you
                select to keep.
              </p>
            </div>

            {/* Merge Strategy Selection */}
            <div>
              <label className='mb-2 block text-sm font-medium text-slate-700'>
                Merge Strategy
              </label>
              <select
                value='prefer_keep'
                disabled
                className='w-full rounded-md border border-slate-300 bg-slate-100 px-3 py-2 text-sm'
              >
                <option value='prefer_keep'>
                  Keep selected person&apos;s data (most conservative)
                </option>
              </select>
              <p className='mt-1 text-xs text-slate-500'>
                More strategies coming soon. Currently uses all data from the
                kept person record.
              </p>
            </div>

            {/* Deletion Mode Selection */}
            <div>
              <label className='mb-2 block text-sm font-medium text-slate-700'>
                Deletion Mode
              </label>
              <div className='space-y-2'>
                <label
                  className={`flex cursor-pointer items-start gap-3 rounded-md border p-3 transition-colors ${
                    deletionMode === 'delete'
                      ? 'border-red-300 bg-red-50'
                      : 'border-slate-200 hover:border-slate-300'
                  }`}
                >
                  <input
                    type='radio'
                    name='deletionMode'
                    value='delete'
                    checked={deletionMode === 'delete'}
                    onChange={() => setDeletionMode('delete')}
                    className='mt-0.5'
                  />
                  <div className='flex-1'>
                    <div className='flex items-center gap-2'>
                      <Trash2 className='h-4 w-4 text-red-600' />
                      <span className='font-medium text-slate-900'>
                        Delete immediately
                      </span>
                    </div>
                    <p className='mt-1 text-xs text-slate-600'>
                      Permanently remove merged person records from the
                      database. This cannot be undone.
                    </p>
                  </div>
                </label>

                <label
                  className={`flex cursor-pointer items-start gap-3 rounded-md border p-3 transition-colors ${
                    deletionMode === 'flag'
                      ? 'border-amber-300 bg-amber-50'
                      : 'border-slate-200 hover:border-slate-300'
                  }`}
                >
                  <input
                    type='radio'
                    name='deletionMode'
                    value='flag'
                    checked={deletionMode === 'flag'}
                    onChange={() => setDeletionMode('flag')}
                    className='mt-0.5'
                  />
                  <div className='flex-1'>
                    <div className='flex items-center gap-2'>
                      <Flag className='h-4 w-4 text-amber-600' />
                      <span className='font-medium text-slate-900'>
                        Flag for deletion
                      </span>
                    </div>
                    <p className='mt-1 text-xs text-slate-600'>
                      Mark records for later review and permanent deletion. They
                      won&apos;t appear in future duplicate checks.
                    </p>
                  </div>
                </label>

                <label
                  className={`flex cursor-pointer items-start gap-3 rounded-md border p-3 transition-colors ${
                    deletionMode === 'skip'
                      ? 'border-blue-300 bg-blue-50'
                      : 'border-slate-200 hover:border-slate-300'
                  }`}
                >
                  <input
                    type='radio'
                    name='deletionMode'
                    value='skip'
                    checked={deletionMode === 'skip'}
                    onChange={() => setDeletionMode('skip')}
                    className='mt-0.5'
                  />
                  <div className='flex-1'>
                    <div className='flex items-center gap-2'>
                      <SkipForward className='h-4 w-4 text-blue-600' />
                      <span className='font-medium text-slate-900'>
                        Skip deletion
                      </span>
                    </div>
                    <p className='mt-1 text-xs text-slate-600'>
                      Keep all records. Only updates foreign key references to
                      point to the kept person.
                    </p>
                  </div>
                </label>
              </div>
            </div>

            {/* Merge Action */}
            <div className='flex items-center justify-between rounded-md border border-slate-200 bg-slate-50 p-4'>
              <div className='text-sm text-slate-600'>
                {mergeResults ? (
                  <div className='space-y-1'>
                    <p className='font-bold text-emerald-700'>
                      Merge completed successfully!
                    </p>
                    <p className='text-xs text-slate-500'>
                      {mergeResults.merged_count} person(s) merged
                    </p>
                    {Object.entries(mergeResults.updated_tables).map(
                      ([table, count]) =>
                        count > 0 ? (
                          <p key={table} className='text-xs text-slate-500'>
                            {count} {table.replace('_', ' ')} updated
                          </p>
                        ) : null
                    )}
                  </div>
                ) : (
                  <p className='text-sm text-slate-600'>
                    Select the person record to keep, then click merge to
                    combine all records.
                  </p>
                )}
              </div>
              <Button
                variant='primary'
                size='lg'
                leftIcon={<GitMerge className='h-4 w-4' />}
                onClick={() =>
                  keepPersonId &&
                  handleMerge(
                    keepPersonId,
                    currentGroup.person_ids.filter(id => id !== keepPersonId)
                  )
                }
                disabled={!keepPersonId || merging}
              >
                {merging ? 'Merging...' : 'Merge Persons'}
              </Button>
            </div>

            {mergeResults?.deleted_ids && (
              <div className='rounded-md bg-emerald-50 p-3 text-sm'>
                <p className='font-bold text-emerald-900'>
                  Deleted IDs: {mergeResults.deleted_ids.join(', ')}
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      ) : (
        /* List of duplicate groups */
        <Card variant='default'>
          <CardHeader>
            <CardTitle>Select a Duplicate Group to Merge</CardTitle>
          </CardHeader>
          <CardContent className='space-y-3'>
            {duplicates.map((group, index) => (
              <div
                key={index}
                onClick={() => setSelectedGroup(index)}
                className='flex cursor-pointer items-center justify-between rounded-lg border border-slate-200 p-4 transition-all hover:border-slate-300 hover:bg-slate-50'
              >
                <div>
                  <p className='font-medium text-slate-900'>
                    {group.persons.map(p => getPersonName(p)).join(' vs ')}
                  </p>
                  <div className='mt-1 flex gap-3 text-xs text-slate-500'>
                    <span>{group.person_ids.length} records</span>
                    <span>•</span>
                    <span>{group.membership_count} memberships</span>
                    <span>•</span>
                    <span>{group.committee_count} committee memberships</span>
                    <span>•</span>
                    <span>{group.document_count} documents</span>
                  </div>
                </div>
                <ChevronRight className='h-5 w-5 text-slate-400' />
              </div>
            ))}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
