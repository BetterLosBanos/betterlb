import { useEffect, useMemo, useState } from 'react';

import {
  BarChart3,
  Briefcase,
  Building2,
  Download,
  ExternalLink,
  FileText,
  Search,
  Tags,
  TrendingUp,
} from 'lucide-react';

import { StatsCard } from '@/components/data-display/StatsUI';
import { ModuleHeader } from '@/components/layout/PageLayouts';
import { Badge } from '@/components/ui/Badge';
import Button from '@/components/ui/Button';
import { CardGrid } from '@/components/ui/Card';
import { EmptyState } from '@/components/ui/EmptyState';
import { PaginationControls } from '@/components/ui/Pagination';
import SearchInput from '@/components/ui/SearchInput';

import { formatPesoAdaptive } from '@/lib/format';
import { INDICES, PhilgepsDoc, client } from '@/lib/meilisearch';

// Helper Interface for Aggregate Data (matching BetterGov structure)
interface AggregateStats {
  count: number;
  total: number;
}

export default function ProcurementPage() {
  // --- State (Aligned with EnhancedSearchInterface) ---
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<PhilgepsDoc[]>([]);
  const [loading, setLoading] = useState(true);

  // Pagination
  const [resultsPerPage, setResultsPerPage] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);

  const totalPages = Math.ceil(results.length / resultsPerPage);
  const paginatedResults = results.slice(
    (currentPage - 1) * resultsPerPage,
    (currentPage - 1) * resultsPerPage + resultsPerPage
  );

  // Statistics
  const [precomputedStats, setPrecomputedStats] =
    useState<AggregateStats | null>(null);
  const [chartDataResults, setChartDataResults] = useState<
    Partial<PhilgepsDoc>[]
  >([]); // Full dataset for charts

  // Constants
  const ORG_NAME = 'MUNICIPALITY OF LOS BAÑOS, LAGUNA';
  const ORG_FILTER = `organization_name = "${ORG_NAME}"`;

  // --- Data Loading ---
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);

      try {
        const index = client.index(INDICES.PHILGEPS);
        const orgIndex = client.index(INDICES.PHILGEPS_ORGS);

        // 1. Search Documents (Paginated)
        const searchPromise = index.search(query, {
          filter: ORG_FILTER,
          sort: ['award_date:desc'],
          limit: resultsPerPage,
          offset: (currentPage - 1) * resultsPerPage,
        });

        // 2. Fetch Precomputed Stats (Fast Total)
        const statsPromise =
          !precomputedStats && !query
            ? orgIndex.search(ORG_NAME, { limit: 1 })
            : Promise.resolve(null);

        // 3. Fetch Data for Visualizations
        // We need a larger dataset to calculate the "Unique Categories" and "Average Cost" accurately
        const chartPromise = index.search(query, {
          filter: ORG_FILTER,
          attributesToRetrieve: ['contract_amount', 'business_category'],
          limit: 5000,
        });

        const [searchRes, statsRes, chartRes] = await Promise.all([
          searchPromise,
          statsPromise,
          chartPromise,
        ]);

        setResults(searchRes.hits as unknown as PhilgepsDoc[]);

        if (statsRes && statsRes.hits.length > 0) {
          setPrecomputedStats(statsRes.hits[0] as unknown as AggregateStats);
        }

        setChartDataResults(
          chartRes.hits as {
            contract_amount: number;
            business_category: string;
          }[]
        );
      } catch (err) {
        console.error('Search error:', err);
      } finally {
        setLoading(false);
      }
    };

    const timer = setTimeout(fetchData, 400);
    return () => clearTimeout(timer);
  }, [query, currentPage, resultsPerPage]);

  // --- Derived Statistics ---
  const detailedStats = useMemo(() => {
    // Use precomputed totals if available (more accurate), otherwise sum the deep fetch
    const totalContractAmount =
      precomputedStats?.total ||
      chartDataResults.reduce(
        (sum, item) => sum + Number(item.contract_amount || 0),
        0
      );
    const totalContractCount =
      precomputedStats?.count || chartDataResults.length;

    // Calculate Averages
    const averageCost =
      totalContractCount > 0 ? totalContractAmount / totalContractCount : 0;

    // Unique Categories
    const uniqueCategories = new Set(
      chartDataResults.map(i => i.business_category).filter(Boolean)
    );

    return {
      uniqueCategories: uniqueCategories.size,
      totalContractAmount,
      totalContractCount,
      averageCost,
    };
  }, [chartDataResults, precomputedStats]);

  // --- Helpers ---
  const formatDate = (dateStr: string) =>
    dateStr
      ? new Date(dateStr).toLocaleDateString('en-PH', {
          month: 'short',
          day: 'numeric',
          year: 'numeric',
        })
      : '-';

  const downloadCSV = () => {
    const headers = [
      'Reference',
      'Title',
      'Awardee',
      'Amount',
      'Date',
      'Status',
    ];
    const rows = results.map(r => [
      r.reference_id,
      `"${r.notice_title?.replace(/"/g, '""')}"`,
      `"${r.awardee_name?.replace(/"/g, '""')}"`,
      r.contract_amount,
      r.award_date,
      r.award_status,
    ]);
    const csv = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `philgeps-search-results.csv`;
    a.click();
  };

  return (
    <div className='animate-in fade-in mx-auto max-w-full space-y-8 px-4 pb-20 duration-500 md:px-8'>
      <ModuleHeader
        title='Procurement Transparency'
        description='Real-time database of bids and awards from the Municipality of Los Baños.'
      >
        <div className='flex w-full flex-col items-center gap-4 md:w-auto md:flex-row'>
          <SearchInput
            value={query}
            onChangeValue={setQuery}
            placeholder='Search contracts...'
            className='w-full md:w-80'
          />
          <div className='flex shrink-0 gap-2'>
            <Button
              variant='outline'
              onClick={downloadCSV}
              className='h-11 px-3'
              title='Download CSV'
            >
              <Download className='h-4 w-4' />
            </Button>
          </div>
        </div>
      </ModuleHeader>

      {/* --- STATS GRID --- */}
      <CardGrid columns={4}>
        <StatsCard
          icon={Tags}
          iconBg='bg-slate-100'
          label='Categories'
          value={detailedStats.uniqueCategories}
          subtext='Business Sectors'
        />

        <StatsCard
          icon={Briefcase}
          iconBg='bg-slate-100'
          label='Total Value'
          value={
            formatPesoAdaptive(detailedStats.totalContractAmount).fullString
          }
          subtext='Accumulated Contract Value'
        />

        <StatsCard
          icon={TrendingUp}
          iconBg='bg-slate-100'
          label='Average'
          value={formatPesoAdaptive(detailedStats.averageCost).fullString}
          subtext='Per Contract'
        />

        <StatsCard
          icon={FileText}
          iconBg='bg-slate-100'
          label='Volume'
          value={detailedStats.totalContractCount.toLocaleString()}
          subtext='Total Contracts'
        />
      </CardGrid>

      {/* --- RESULTS TABLE --- */}
      {loading ? (
        <div className='space-y-4'>
          {[1, 2, 3, 4, 5].map(i => (
            <div
              key={i}
              className='h-16 animate-pulse rounded-xl bg-slate-50'
            />
          ))}
        </div>
      ) : results.length === 0 ? (
        <EmptyState
          title='No Records Found'
          message='Try adjusting your search terms.'
          icon={Search}
        />
      ) : (
        <div className='overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm'>
          <div className='overflow-x-auto'>
            <table className='w-full text-left text-sm'>
              <thead className='border-b border-slate-200 bg-slate-50 text-xs font-bold tracking-wider text-slate-500 uppercase'>
                <tr>
                  <th className='hidden w-32 px-6 py-4 md:table-cell'>
                    Ref ID
                  </th>
                  <th className='px-6 py-4'>Contract Title</th>
                  <th className='px-6 py-4 text-right'>Amount</th>
                  <th className='hidden px-6 py-4 md:table-cell'>Date</th>
                  <th className='px-6 py-4 text-center'>Status</th>
                </tr>
              </thead>
              <tbody className='divide-y divide-slate-100'>
                {paginatedResults.map(row => (
                  <tr
                    key={row.id}
                    className='group transition-colors hover:bg-slate-50/50'
                  >
                    <td className='group-hover:text-primary-600 hidden px-6 py-4 font-mono text-xs text-slate-500 transition-colors md:table-cell'>
                      {row.reference_id}
                    </td>
                    <td className='px-6 py-4'>
                      <p
                        className='line-clamp-2 leading-snug font-bold text-slate-900'
                        title={row.notice_title}
                      >
                        {row.notice_title}
                      </p>
                      <div className='mt-1 flex items-center gap-2'>
                        <Badge
                          variant='slate'
                          className='h-4 border-slate-200 bg-slate-50 px-1.5 py-0 text-[9px] text-slate-500'
                        >
                          {row.business_category}
                        </Badge>
                        {row.awardee_name && (
                          <span
                            className='max-w-[200px] truncate text-xs text-slate-500'
                            title={row.awardee_name}
                          >
                            • {row.awardee_name}
                          </span>
                        )}
                      </div>
                    </td>
                    <td className='px-6 py-4 text-right font-mono font-bold text-slate-900'>
                      {formatPesoAdaptive(row.contract_amount).fullString}
                    </td>
                    <td className='hidden px-6 py-4 text-xs whitespace-nowrap text-slate-600 md:table-cell'>
                      {formatDate(row.award_date)}
                    </td>
                    <td className='px-6 py-4 text-center'>
                      <Badge
                        variant={
                          row.award_status === 'Awarded' ? 'success' : 'slate'
                        }
                        className='text-[10px]'
                      >
                        {row.award_status}
                      </Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <PaginationControls
            currentPage={currentPage}
            totalPages={totalPages}
            resultsPerPage={resultsPerPage}
            totalItems={results.length}
            onPageChange={setCurrentPage}
            onResultsPerPageChange={limit => {
              setResultsPerPage(limit);
              setCurrentPage(1);
            }}
          />
        </div>
      )}

      {/* --- EXTERNAL LINKS FOOTER --- */}
      <div className='grid grid-cols-1 gap-4 md:grid-cols-2'>
        {/* Link 1: Local Analytics */}
        <div className='hover:border-primary-200 flex h-full flex-col justify-between rounded-xl border border-slate-200 bg-white p-6 shadow-sm transition-all'>
          <div className='mb-4 flex items-start gap-4'>
            <div className='shrink-0 rounded-xl bg-blue-50 p-3 text-blue-600'>
              <BarChart3 className='h-6 w-6' />
            </div>
            <div>
              <h4 className='mb-1 font-bold text-slate-900'>
                Advanced Analytics
              </h4>
              <p className='text-xs leading-relaxed text-slate-500'>
                View detailed spending charts, top supplier breakdowns, and
                historical procurement trends for Los Baños.
              </p>
            </div>
          </div>
          <a
            href='https://transparency.bettergov.ph/organizations/MUNICIPALITY%20OF%20LOS%20BA%C3%91OS%2C%20LAGUNA'
            target='_blank'
            rel='noreferrer'
            className='inline-flex w-full items-center justify-center gap-2 rounded-lg bg-blue-50 px-4 py-2.5 text-xs font-bold text-blue-700 transition-colors hover:bg-blue-100'
          >
            View Los Baños Charts <ExternalLink className='h-3 w-3' />
          </a>
        </div>

        {/* Link 2: National Comparison */}
        <div className='hover:border-primary-200 flex h-full flex-col justify-between rounded-xl border border-slate-200 bg-white p-6 shadow-sm transition-all'>
          <div className='mb-4 flex items-start gap-4'>
            <div className='shrink-0 rounded-xl bg-slate-900 p-3 text-white'>
              <Building2 className='h-6 w-6' />
            </div>
            <div>
              <h4 className='mb-1 font-bold text-slate-900'>
                Transparency Dashboard
              </h4>
              <p className='text-xs leading-relaxed text-slate-500'>
                Access the full Philippine procurement database to compare local
                spending against national averages.
              </p>
            </div>
          </div>
          <a
            href='https://transparency.bettergov.ph/procurement'
            target='_blank'
            rel='noreferrer'
            className='inline-flex w-full items-center justify-center gap-2 rounded-lg bg-slate-900 px-4 py-2.5 text-xs font-bold text-white transition-colors hover:bg-slate-800'
          >
            Open National Engine <ExternalLink className='h-3 w-3' />
          </a>
        </div>
      </div>
    </div>
  );
}
