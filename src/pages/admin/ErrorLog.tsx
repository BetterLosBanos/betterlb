import { useEffect, useState } from 'react';
import { AlertTriangle, FileText, ExternalLink, RefreshCw } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import Button from '@/components/ui/Button';
import { EmptyState } from '@/components/ui/EmptyState';

interface ParseError {
  id: string;
  document_number?: string;
  pdf_url: string;
  error_type: string;
  error_message: string;
  timestamp: string;
  stage: 'scrape' | 'download' | 'parse' | 'extract' | 'migrate';
}

interface ErrorResponse {
  errors: ParseError[];
  total: number;
}

export default function ErrorLog() {
  const [errors, setErrors] = useState<ParseError[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<string>('all');

  useEffect(() => {
    fetchErrors();
  }, [filter]);

  const fetchErrors = async () => {
    setLoading(true);
    try {
      const url = filter === 'all'
        ? '/api/admin/errors'
        : `/api/admin/errors?stage=${filter}`;
      const response = await fetch(url);
      if (!response.ok) throw new Error('Failed to fetch errors');
      const data: ErrorResponse = await response.json();
      setErrors(data.errors || []);
    } catch (error) {
      console.error('Error fetching errors:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStageBadge = (stage: ParseError['stage']) => {
    const variants = {
      scrape: 'error',
      download: 'error',
      parse: 'warning',
      extract: 'warning',
      migrate: 'primary',
    } as const;

    return <Badge variant={variants[stage]}>{stage}</Badge>;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <RefreshCw className="h-8 w-8 animate-spin text-slate-400" />
      </div>
    );
  }

  if (errors.length === 0) {
    return (
      <EmptyState
        title="No errors found"
        message="All documents processed successfully!"
        icon={AlertTriangle}
      />
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">Parse Errors</h2>
          <p className="text-slate-600">
            Documents that failed during pipeline processing
          </p>
        </div>
        <div className="flex items-center gap-3">
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="rounded-md border border-slate-300 bg-white px-3 py-2 text-sm"
          >
            <option value="all">All Stages</option>
            <option value="scrape">Scrape</option>
            <option value="download">Download</option>
            <option value="parse">Parse</option>
            <option value="extract">Extract</option>
            <option value="migrate">Migrate</option>
          </select>
          <Button
            variant="outline"
            size="sm"
            leftIcon={<RefreshCw className="h-4 w-4" />}
            onClick={fetchErrors}
          >
            Refresh
          </Button>
        </div>
      </div>

      {/* Errors List */}
      <div className="space-y-4">
        {errors.map((error) => (
          <Card key={error.id} variant="default" className="border-l-4 border-l-rose-500">
            <CardContent className="p-5">
              <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                <div className="flex-1 space-y-3">
                  {/* Header */}
                  <div className="flex items-center gap-3">
                    {getStageBadge(error.stage)}
                    <span className="text-xs text-slate-500">
                      {new Date(error.timestamp).toLocaleString()}
                    </span>
                  </div>

                  {/* Document Info */}
                  <div>
                    <h3 className="font-bold text-slate-900">
                      {error.document_number || 'Unknown Document'}
                    </h3>
                    <a
                      href={error.pdf_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="mt-1 inline-flex items-center gap-1 text-sm text-primary-600 hover:underline"
                    >
                      <FileText className="h-3 w-3" />
                      View PDF
                      <ExternalLink className="h-3 w-3" />
                    </a>
                  </div>

                  {/* Error Details */}
                  <div className="rounded-md bg-rose-50 p-3">
                    <p className="text-xs font-bold text-rose-900 uppercase">
                      {error.error_type}
                    </p>
                    <p className="mt-1 text-sm text-rose-700">
                      {error.error_message}
                    </p>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      /* TODO: Open review modal */
                    }}
                  >
                    Review
                  </Button>
                  <Button
                    variant="primary"
                    size="sm"
                    onClick={() => {
                      /* TODO: Retry processing */
                    }}
                  >
                    Retry
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
