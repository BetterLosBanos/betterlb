import { useCallback, useEffect, useState } from 'react';

import { Button } from '@bettergov/kapwa/button';
import { Download, FileText, RefreshCw } from 'lucide-react';

import { Badge } from '@/components/ui/Badge';
import { Card, CardContent } from '@/components/ui/Card';
import { EmptyState } from '@/components/ui/EmptyState';
import { PaginationControls } from '@/components/ui/Pagination';

interface AuditLogEntry {
  id: string;
  action: string;
  performedBy: string;
  targetType: string;
  targetId: string | null;
  details: Record<string, unknown> | null;
  createdAt: string;
}

interface AuditLogsResponse {
  logs: AuditLogEntry[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

type FilterState = {
  action?: string;
  performed_by?: string;
  target_type?: string;
  start_date?: string;
  end_date?: string;
};

export default function AuditLog() {
  const [logs, setLogs] = useState<AuditLogEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [filters, setFilters] = useState<FilterState>({});
  const [autoRefresh, setAutoRefresh] = useState(false);

  const limit = 50;

  const fetchLogs = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: limit.toString(),
        ...(filters.action && { action: filters.action }),
        ...(filters.performed_by && { performed_by: filters.performed_by }),
        ...(filters.target_type && { target_type: filters.target_type }),
        ...(filters.start_date && { start_date: filters.start_date }),
        ...(filters.end_date && { end_date: filters.end_date }),
      });

      const response = await fetch(`/api/admin/audit-logs?${params}`);
      if (!response.ok) throw new Error('Failed to fetch audit logs');
      const data: AuditLogsResponse = await response.json();
      setLogs(data.logs || []);
      setTotalPages(data.pagination.totalPages);
      setTotal(data.pagination.total);
    } catch (error) {
      console.error('Error fetching audit logs:', error);
    } finally {
      setLoading(false);
    }
  }, [currentPage, filters, limit]);

  useEffect(() => {
    fetchLogs();
  }, [fetchLogs]);

  // Auto-refresh every 30 seconds if enabled
  useEffect(() => {
    if (!autoRefresh) return;

    const interval = setInterval(() => {
      fetchLogs();
    }, 30000);

    return () => clearInterval(interval);
  }, [autoRefresh, fetchLogs]);

  const exportToCSV = () => {
    const headers = [
      'Timestamp',
      'User',
      'Action',
      'Target Type',
      'Target ID',
      'Details',
    ];
    const rows = logs.map(log => [
      log.createdAt,
      log.performedBy,
      log.action,
      log.targetType,
      log.targetId || '',
      log.details ? JSON.stringify(log.details) : '',
    ]);

    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.map(cell => `"${cell}"`).join(',')),
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `audit-logs-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const getActionBadge = (action: string) => {
    // Color-code actions by type
    if (action.includes('create') || action.includes('add')) {
      return <Badge variant='success'>{action}</Badge>;
    }
    if (action.includes('delete') || action.includes('remove')) {
      return <Badge variant='error'>{action}</Badge>;
    }
    if (action.includes('update') || action.includes('edit')) {
      return <Badge variant='warning'>{action}</Badge>;
    }
    return <Badge variant='primary'>{action}</Badge>;
  };

  const formatDetails = (details: Record<string, unknown> | null) => {
    if (!details) return '-';
    return (
      <div className='text-xs'>
        {Object.entries(details).map(([key, value]) => (
          <div key={key}>
            <span className='font-semibold'>{key}:</span>{' '}
            {typeof value === 'object' ? JSON.stringify(value) : String(value)}
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className='space-y-6'>
      <div className='flex items-center justify-between'>
        <div>
          <h1 className='kapwa-heading-lg mb-1'>Audit Logs</h1>
          <p className='kapwa-body-md text-kapwa-text-weak'>
            Track all administrative actions in the system
          </p>
        </div>
        <div className='flex gap-2'>
          <Button
            variant='secondary'
            size='sm'
            onClick={() => {
              setFilters({});
              setCurrentPage(1);
            }}
          >
            Clear Filters
          </Button>
          <Button
            variant={autoRefresh ? 'primary' : 'secondary'}
            size='sm'
            onClick={() => setAutoRefresh(!autoRefresh)}
          >
            {autoRefresh ? 'Auto-refresh On' : 'Auto-refresh Off'}
          </Button>
          <Button
            variant='primary'
            size='sm'
            onClick={fetchLogs}
            icon={<RefreshCw className='h-4 w-4' />}
          >
            Refresh
          </Button>
          <Button
            variant='secondary'
            size='sm'
            onClick={exportToCSV}
            icon={<Download className='h-4 w-4' />}
          >
            Export CSV
          </Button>
        </div>
      </div>

      {/* Filters */}
      <Card>
        <CardContent>
          <div className='grid grid-cols-1 md:grid-cols-5 gap-4'>
            <div>
              <label className='block kapwa-body-sm-strong mb-1'>Action</label>
              <input
                type='text'
                className='kapwa-input w-full'
                placeholder='e.g. create_document'
                value={filters.action || ''}
                onChange={e =>
                  setFilters({ ...filters, action: e.target.value })
                }
              />
            </div>
            <div>
              <label className='block kapwa-body-sm-strong mb-1'>User</label>
              <input
                type='text'
                className='kapwa-input w-full'
                placeholder='username'
                value={filters.performed_by || ''}
                onChange={e =>
                  setFilters({ ...filters, performed_by: e.target.value })
                }
              />
            </div>
            <div>
              <label className='block kapwa-body-sm-strong mb-1'>
                Target Type
              </label>
              <input
                type='text'
                className='kapwa-input w-full'
                placeholder='e.g. document'
                value={filters.target_type || ''}
                onChange={e =>
                  setFilters({ ...filters, target_type: e.target.value })
                }
              />
            </div>
            <div>
              <label className='block kapwa-body-sm-strong mb-1'>
                Start Date
              </label>
              <input
                type='date'
                className='kapwa-input w-full'
                value={filters.start_date || ''}
                onChange={e =>
                  setFilters({ ...filters, start_date: e.target.value })
                }
              />
            </div>
            <div>
              <label className='block kapwa-body-sm-strong mb-1'>
                End Date
              </label>
              <input
                type='date'
                className='kapwa-input w-full'
                value={filters.end_date || ''}
                onChange={e =>
                  setFilters({ ...filters, end_date: e.target.value })
                }
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Logs table */}
      {loading ? (
        <Card>
          <CardContent>
            <div className='flex items-center justify-center py-12'>
              <RefreshCw className='h-6 w-6 animate-spin text-kapwa-text-weak' />
              <span className='ml-2 kapwa-body-md text-kapwa-text-weak'>
                Loading audit logs...
              </span>
            </div>
          </CardContent>
        </Card>
      ) : logs.length === 0 ? (
        <EmptyState
          icon={<FileText className='h-12 w-12' />}
          title='No audit logs found'
          description={
            Object.keys(filters).length > 0
              ? 'Try adjusting your filters to see more results'
              : 'Audit logs will appear here when administrative actions are performed'
          }
        />
      ) : (
        <Card>
          <CardContent>
            <div className='overflow-x-auto'>
              <table className='w-full'>
                <thead>
                  <tr className='border-b border-kapwa-border-default'>
                    <th className='text-left py-3 px-4 kapwa-body-sm-strong'>
                      Timestamp
                    </th>
                    <th className='text-left py-3 px-4 kapwa-body-sm-strong'>
                      User
                    </th>
                    <th className='text-left py-3 px-4 kapwa-body-sm-strong'>
                      Action
                    </th>
                    <th className='text-left py-3 px-4 kapwa-body-sm-strong'>
                      Target Type
                    </th>
                    <th className='text-left py-3 px-4 kapwa-body-sm-strong'>
                      Target ID
                    </th>
                    <th className='text-left py-3 px-4 kapwa-body-sm-strong'>
                      Details
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {logs.map(log => (
                    <tr
                      key={log.id}
                      className='border-b border-kap-border-weak hover:bg-kapwa-bg-hover'
                    >
                      <td className='py-3 px-4 kapwa-body-sm'>
                        {new Date(log.createdAt).toLocaleString()}
                      </td>
                      <td className='py-3 px-4 kapwa-body-sm'>
                        {log.performedBy}
                      </td>
                      <td className='py-3 px-4'>
                        {getActionBadge(log.action)}
                      </td>
                      <td className='py-3 px-4 kapwa-body-sm'>
                        <Badge variant='secondary'>{log.targetType}</Badge>
                      </td>
                      <td className='py-3 px-4 kapwa-body-sm font-mono text-xs'>
                        {log.targetId || '-'}
                      </td>
                      <td className='py-3 px-4 kapwa-body-sm'>
                        {formatDetails(log.details)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            <div className='mt-4 flex items-center justify-between'>
              <div className='kapwa-body-sm text-kapwa-text-weak'>
                Showing {logs.length} of {total} logs
              </div>
              <PaginationControls
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={page => {
                  setCurrentPage(page);
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
              />
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
