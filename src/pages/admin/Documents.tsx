import { Suspense, lazy, useCallback, useEffect, useState } from 'react';

import { Banner } from '@/kapwa/banner';
import {
  AlertCircle,
  CheckCircle,
  ExternalLink,
  Facebook,
  FileText,
  RefreshCw,
  Search,
} from 'lucide-react';

import { Badge } from '@/components/ui/Badge';
import Button from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { EmptyState } from '@/components/ui/EmptyState';

import { useAdminAuth } from './components/AdminAuthProvider';

const LegislativePostImporter = lazy(
  () => import('./components/LegislativePostImporter')
);

interface Document {
  id: string;
  type: string;
  number: string;
  title: string;
  date_enacted: string;
  status: string;
  processed: number;
  needs_review: number;
  pdf_url: string;
  created_at: string;
  updated_at: string;
}

interface DocumentsResponse {
  documents: Document[];
  pagination: {
    total: number;
    limit: number;
    offset: number;
    has_more: boolean;
  };
}

type StatusFilter = 'all' | 'active' | 'pending' | 'suspended' | 'inactive';
type TypeFilter = 'all' | 'ordinance' | 'resolution' | 'executive_order';
type ReviewFilter = 'all' | 'needs_review' | 'reviewed';

export default function AdminDocuments() {
  useAdminAuth();
  const [documents, setDocuments] = useState<Document[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');
  const [typeFilter, setTypeFilter] = useState<TypeFilter>('all');
  const [reviewFilter, setReviewFilter] = useState<ReviewFilter>('all');
  const [page, setPage] = useState(0);
  const [pagination, setPagination] = useState({
    total: 0,
    limit: 50,
    offset: 0,
    has_more: false,
  });

  // Legislative Post Importer state
  const [importerOpen, setImporterOpen] = useState(false);

  // Banner state for notifications
  const [banner, setBanner] = useState<{
    message: string;
    type: 'success' | 'warning' | 'error' | 'info';
  } | null>(null);

  const fetchDocuments = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        limit: '50',
        offset: String(page * 50),
      });

      if (statusFilter !== 'all') params.append('status', statusFilter);
      if (typeFilter !== 'all') params.append('type', typeFilter);
      if (reviewFilter === 'needs_review') params.append('needs_review', '1');
      if (reviewFilter === 'reviewed') params.append('needs_review', '0');

      if (searchQuery) params.append('search', searchQuery);

      const response = await fetch(`/api/admin/documents?${params}`);
      if (!response.ok) throw new Error('Failed to fetch documents');

      const data: DocumentsResponse = await response.json();
      setDocuments(data.documents || []);
      setPagination(data.pagination);
    } catch (error) {
      console.error('Error fetching documents:', error);
    } finally {
      setLoading(false);
    }
  }, [statusFilter, typeFilter, reviewFilter, page, searchQuery]);

  useEffect(() => {
    fetchDocuments();
  }, [fetchDocuments]);

  const handleImportSuccess = (created: number, skipped: number) => {
    // Refresh the documents list
    fetchDocuments();

    // Show a success message
    if (created > 0 || skipped > 0) {
      const message = [];
      if (created > 0)
        message.push(`${created} document${created !== 1 ? 's' : ''} created`);
      if (skipped > 0)
        message.push(`${skipped} duplicate${skipped !== 1 ? 's' : ''} skipped`);
      setBanner({
        message: `Import complete: ${message.join(', ')}`,
        type: 'success',
      });
      setTimeout(() => setBanner(null), 4000);
    }
  };

  const getStatusBadge = (doc: Document) => {
    if (doc.needs_review) {
      return <Badge variant='warning'>Needs Review</Badge>;
    }
    if (!doc.processed) {
      return <Badge variant='slate'>Unprocessed</Badge>;
    }
    return (
      <Badge variant={doc.status === 'active' ? 'success' : 'slate'}>
        {doc.status}
      </Badge>
    );
  };

  const filteredDocuments = documents.filter(doc => {
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      return (
        doc.number.toLowerCase().includes(query) ||
        doc.title.toLowerCase().includes(query)
      );
    }
    return true;
  });

  if (loading && documents.length === 0) {
    return (
      <div className='flex items-center justify-center py-12'>
        <RefreshCw className='h-8 w-8 animate-spin text-slate-400' />
      </div>
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
            Documents Management
          </h2>
          <p className='text-slate-600'>
            {pagination.total.toLocaleString()} total documents
          </p>
        </div>
        <Button
          variant='outline'
          size='sm'
          leftIcon={<RefreshCw className='h-4 w-4' />}
          onClick={fetchDocuments}
        >
          Refresh
        </Button>
        <Button
          variant='primary'
          size='sm'
          leftIcon={<Facebook className='h-4 w-4' />}
          onClick={() => setImporterOpen(true)}
        >
          Import from Facebook
        </Button>
      </div>

      {/* Filters */}
      <Card variant='default' className='p-4'>
        <div className='flex flex-wrap gap-4'>
          <div className='min-w-[200px] flex-1'>
            <div className='relative'>
              <Search className='absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-slate-400' />
              <input
                type='text'
                placeholder='Search by number or title...'
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && fetchDocuments()}
                className='focus:border-primary-500 focus:ring-primary-500 w-full rounded-md border border-slate-300 py-2 pr-4 pl-10 text-sm focus:ring-1 focus:outline-none'
              />
            </div>
          </div>

          <select
            value={typeFilter}
            onChange={e => {
              setTypeFilter(e.target.value as TypeFilter);
              setPage(0);
            }}
            className='rounded-md border border-slate-300 bg-white px-3 py-2 text-sm'
          >
            <option value='all'>All Types</option>
            <option value='ordinance'>Ordinances</option>
            <option value='resolution'>Resolutions</option>
            <option value='executive_order'>Executive Orders</option>
          </select>

          <select
            value={statusFilter}
            onChange={e => {
              setStatusFilter(e.target.value as StatusFilter);
              setPage(0);
            }}
            className='rounded-md border border-slate-300 bg-white px-3 py-2 text-sm'
          >
            <option value='all'>All Statuses</option>
            <option value='active'>Active</option>
            <option value='pending'>Pending</option>
            <option value='suspended'>Suspended</option>
            <option value='inactive'>Inactive</option>
          </select>

          <select
            value={reviewFilter}
            onChange={e => {
              setReviewFilter(e.target.value as ReviewFilter);
              setPage(0);
            }}
            className='rounded-md border border-slate-300 bg-white px-3 py-2 text-sm'
          >
            <option value='all'>All Review States</option>
            <option value='needs_review'>Needs Review</option>
            <option value='reviewed'>Reviewed</option>
          </select>
        </div>
      </Card>

      {/* Documents List */}
      {filteredDocuments.length === 0 ? (
        <EmptyState
          title='No documents found'
          message={
            searchQuery
              ? 'Try adjusting your search or filters'
              : 'No documents in the database'
          }
          icon={FileText}
        />
      ) : (
        <>
          <div className='overflow-hidden rounded-lg border border-slate-200'>
            <table className='w-full text-left text-sm'>
              <thead className='bg-slate-50'>
                <tr>
                  <th className='px-4 py-3 font-semibold text-slate-900'>
                    Type
                  </th>
                  <th className='px-4 py-3 font-semibold text-slate-900'>
                    Number
                  </th>
                  <th className='px-4 py-3 font-semibold text-slate-900'>
                    Title
                  </th>
                  <th className='px-4 py-3 font-semibold text-slate-900'>
                    Date
                  </th>
                  <th className='px-4 py-3 font-semibold text-slate-900'>
                    Status
                  </th>
                  <th className='px-4 py-3 font-semibold text-slate-900'>
                    Review
                  </th>
                  <th className='px-4 py-3 text-right font-semibold text-slate-900'>
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className='divide-y divide-slate-200'>
                {filteredDocuments.map(doc => (
                  <tr key={doc.id} className='hover:bg-slate-50'>
                    <td className='px-4 py-3'>
                      <Badge
                        variant={
                          doc.type === 'ordinance'
                            ? 'primary'
                            : doc.type === 'resolution'
                              ? 'secondary'
                              : 'slate'
                        }
                      >
                        {doc.type}
                      </Badge>
                    </td>
                    <td className='px-4 py-3'>
                      <span className='font-mono text-xs'>{doc.number}</span>
                    </td>
                    <td className='max-w-xs truncate px-4 py-3'>
                      <span className='font-medium text-slate-900'>
                        {doc.title}
                      </span>
                    </td>
                    <td className='px-4 py-3 text-slate-600'>
                      {doc.date_enacted || '-'}
                    </td>
                    <td className='px-4 py-3'>{getStatusBadge(doc)}</td>
                    <td className='px-4 py-3'>
                      <div className='flex items-center gap-2'>
                        {doc.needs_review ? (
                          <AlertCircle className='h-4 w-4 text-amber-500' />
                        ) : (
                          <CheckCircle className='h-4 w-4 text-emerald-500' />
                        )}
                        <span className='text-xs text-slate-600'>
                          {doc.needs_review ? 'Needs Review' : 'OK'}
                        </span>
                      </div>
                    </td>
                    <td className='px-4 py-3 text-right'>
                      <div className='flex justify-end gap-2'>
                        <a
                          href={`/openlgu/${doc.type}/${doc.number}`}
                          target='_blank'
                          rel='noopener noreferrer'
                          className='text-primary-600 hover:text-primary-700'
                          title='View public page'
                        >
                          <ExternalLink className='h-4 w-4' />
                        </a>
                        <a
                          href={doc.pdf_url}
                          target='_blank'
                          rel='noopener noreferrer'
                          className='text-slate-600 hover:text-slate-900'
                          title='View PDF'
                        >
                          <FileText className='h-4 w-4' />
                        </a>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {pagination.total > pagination.limit && (
            <div className='flex items-center justify-between'>
              <p className='text-sm text-slate-600'>
                Showing {pagination.offset + 1}-
                {Math.min(
                  pagination.offset + pagination.limit,
                  pagination.total
                )}{' '}
                of {pagination.total.toLocaleString()}
              </p>
              <div className='flex gap-2'>
                <button
                  onClick={() => setPage(p => Math.max(0, p - 1))}
                  disabled={page === 0}
                  className='rounded-md border border-slate-300 px-3 py-1 text-sm hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50'
                >
                  Previous
                </button>
                <button
                  onClick={() => setPage(p => p + 1)}
                  disabled={!pagination.has_more}
                  className='rounded-md border border-slate-300 px-3 py-1 text-sm hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50'
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </>
      )}

      {/* Legislative Post Importer Modal */}
      <Suspense fallback={null}>
        <LegislativePostImporter
          open={importerOpen}
          onClose={() => setImporterOpen(false)}
          onSuccess={handleImportSuccess}
        />
      </Suspense>
    </div>
  );
}
