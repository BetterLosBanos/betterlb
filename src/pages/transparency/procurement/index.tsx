import { useEffect, useMemo, useState } from 'react';

import { Button } from '@bettergov/kapwa/button';
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
import { CardGrid } from '@/components/ui/Card';
import { EmptyState } from '@/components/ui/EmptyState';
import { PaginationControls } from '@/components/ui/Pagination';
import SearchInput from '@/components/ui/SearchInput';

import { formatPesoAdaptive } from '@/lib/format';
import { config } from '@/lib/lguConfig';
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
  const ORG_NAME = config.transparency.procurement.organizationName;
  const ORG_FILTER = `organization_name = "${ORG_NAME}"`;
  const orgDashboardUrl = `${config.transparency.procurement.externalDashboard}${encodeURIComponent(ORG_NAME)}`;

  // Helper function to get badge variant based on award status
  const getAwardStatusBadgeVariant = (
    status: string | undefined
  ): 'success' | 'warning' | 'error' | 'slate' | 'primary' => {
    switch (status) {
      case 'Awarded':
        return 'success';
      case 'Failed':
      case 'Cancelled':
      case 'Disapproved':
      case 'Declined':
        return 'error';
      case 'Pending':
      case 'Under Review':
      case 'Published':
        return 'warning';
      default:
        return 'slate';
    }
  };

  // Helper function to get badge variant based on business category
  const getBusinessCategoryBadgeVariant = (
    category: string | undefined
  ): 'primary' | 'secondary' | 'warning' | 'success' => {
    if (!category) return 'slate';
    const cat = category.toLowerCase();
    if (
      cat.includes('construction') ||
      cat.includes('infrastructure') ||
      cat.includes('building')
    )
      return 'primary';
    if (
      cat.includes('service') ||
      cat.includes('consultancy') ||
      cat.includes('professional')
    )
      return 'secondary';
    if (
      cat.includes('supply') ||
      cat.includes('material') ||
      cat.includes('equipment')
    )
      return 'success';
    if (
      cat.includes('maintenance') ||
      cat.includes('repair') ||
      cat.includes('contract')
    )
      return 'warning';
    return 'primary';
  };

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
  }, [query, currentPage, resultsPerPage]); // eslint-disable-line react-hooks/exhaustive-deps -- ORG_NAME and ORG_FILTER are config-derived constants; precomputedStats is only read conditionally

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
          label='Categories'
          value={detailedStats.uniqueCategories}
          subtext='Business Sectors'
          iconBg='bg-kapwa-bg-surface-raised text-kapwa-text-strong'
        />

        <StatsCard
          icon={Briefcase}
          label='Total Value'
          value={
            formatPesoAdaptive(detailedStats.totalContractAmount).fullString
          }
          subtext='Accumulated Contract Value'
          iconBg='bg-kapwa-green-50 text-kapwa-green-600'
        />

        <StatsCard
          icon={TrendingUp}
          label='Average'
          value={formatPesoAdaptive(detailedStats.averageCost).fullString}
          subtext='Per Contract'
          iconBg='bg-kapwa-bg-brand-weak text-kapwa-text-brand'
        />

        <StatsCard
          icon={FileText}
          label='Volume'
          value={detailedStats.totalContractCount.toLocaleString()}
          subtext='Total Contracts'
          iconBg='bg-kapwa-bg-surface-raised text-kapwa-text-strong'
        />
      </CardGrid>

      {/* --- RESULTS TABLE --- */}
      {loading ? (
        <div className='space-y-4'>
          {[1, 2, 3, 4, 5].map(i => (
            <div
              key={i}
              className='bg-kapwa-bg-surface-raised h-16 animate-pulse rounded-xl'
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
        <div className='border-kapwa-border-weak bg-kapwa-bg-surface overflow-hidden rounded-xl border shadow-sm'>
          <div className='overflow-x-auto'>
            <table className='w-full text-left text-sm'>
              <thead className='border-kapwa-border-weak bg-kapwa-bg-surface-raised text-kapwa-text-disabled border-b text-xs font-bold tracking-wider uppercase'>
                <tr>
                  <th className='hidden w-32 px-3 py-3 md:table-cell md:px-6 md:py-4'>
                    Ref ID
                  </th>
                  <th className='px-3 py-3 sm:px-6 sm:py-4'>Contract Title</th>
                  <th className='px-3 py-3 text-right sm:px-6 sm:py-4'>
                    Amount
                  </th>
                  <th className='hidden px-3 py-3 md:table-cell md:px-6 md:py-4'>
                    Date
                  </th>
                  <th className='px-3 py-3 text-center sm:px-6 sm:py-4'>
                    Status
                  </th>
                </tr>
              </thead>
              <tbody className='divide-y divide-kapwa-border-weak'>
                {paginatedResults.map(row => (
                  <tr
                    key={row.id}
                    className='group hover:bg-kapwa-bg-surface-raised/50 transition-colors'
                  >
                    <td className='group-hover:text-kapwa-text-brand text-kapwa-text-disabled hidden px-3 py-3 font-mono text-xs transition-colors md:table-cell md:px-6 md:py-4'>
                      {row.reference_id}
                    </td>
                    <td className='px-3 py-3 sm:px-6 sm:py-4'>
                      <p
                        className='text-kapwa-text-strong line-clamp-2 leading-snug font-bold'
                        title={row.notice_title}
                      >
                        {row.notice_title}
                      </p>
                      <div className='mt-1 flex flex-wrap items-center gap-2'>
                        <Badge
                          variant={getBusinessCategoryBadgeVariant(
                            row.business_category
                          )}
                          className='max-w-full text-[9px] sm:h-4 sm:px-1.5 sm:py-0'
                        >
                          <span className='truncate max-w-[100px] sm:max-w-[150px]'>
                            {row.business_category}
                          </span>
                        </Badge>
                        {row.awardee_name && (
                          <span
                            className='text-kapwa-text-disabled max-w-[150px] truncate text-xs sm:max-w-[200px]'
                            title={row.awardee_name}
                          >
                            • {row.awardee_name}
                          </span>
                        )}
                      </div>
                    </td>
                    <td className='text-kapwa-text-strong px-3 py-3 text-right font-mono font-bold sm:px-6 sm:py-4'>
                      {formatPesoAdaptive(row.contract_amount).fullString}
                    </td>
                    <td className='text-kapwa-text-support hidden px-3 py-3 text-xs whitespace-nowrap md:table-cell md:px-6 md:py-4'>
                      {formatDate(row.award_date)}
                    </td>
                    <td className='px-3 py-4 text-center sm:px-6'>
                      <Badge
                        variant={getAwardStatusBadgeVariant(row.award_status)}
                        className='max-w-full text-[10px]'
                      >
                        <span className='truncate max-w-[80px] sm:max-w-[120px] inline-block align-bottom'>
                          {row.award_status}
                        </span>
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
        <div className='hover:border-kapwa-border-brand border-kapwa-border-weak bg-kapwa-bg-surface flex h-full flex-col justify-between rounded-xl border p-6 shadow-sm transition-all'>
          <div className='mb-4 flex items-start gap-4'>
            <div className='bg-kapwa-blue-50 text-kapwa-blue-600 shrink-0 rounded-xl p-3'>
              <BarChart3 className='h-6 w-6' />
            </div>
            <div>
              <h4 className='text-kapwa-text-strong mb-1 font-bold'>
                Advanced Analytics
              </h4>
              <p className='text-kapwa-text-disabled text-xs leading-relaxed'>
                View detailed spending charts, top supplier breakdowns, and
                historical procurement trends for Los Baños.
              </p>
            </div>
          </div>
          <a
            href={orgDashboardUrl}
            target='_blank'
            rel='noreferrer'
            className='text-kapwa-text-inverse bg-kapwa-brand-600 hover:bg-kapwa-brand-700 inline-flex w-full items-center justify-center gap-2 rounded-lg px-4 py-2.5 text-xs font-bold transition-colors'
          >
            View Los Baños Charts <ExternalLink className='h-3 w-3' />
          </a>
        </div>

        {/* Link 2: National Comparison */}
        <div className='hover:border-kapwa-border-brand border-kapwa-border-weak bg-kapwa-bg-surface flex h-full flex-col justify-between rounded-xl border p-6 shadow-sm transition-all'>
          <div className='mb-4 flex items-start gap-4'>
            <div className='text-kapwa-text-inverse bg-kapwa-brand-600 shrink-0 rounded-xl p-3'>
              <Building2 className='h-6 w-6' />
            </div>
            <div>
              <h4 className='text-kapwa-text-strong mb-1 font-bold'>
                Transparency Dashboard
              </h4>
              <p className='text-kapwa-text-disabled text-xs leading-relaxed'>
                Access the full Philippine procurement database to compare local
                spending against national averages.
              </p>
            </div>
          </div>
          <a
            href='https://transparency.bettergov.ph/procurement'
            target='_blank'
            rel='noreferrer'
            className='text-kapwa-text-inverse bg-kapwa-brand-600 hover:bg-kapwa-brand-700 inline-flex w-full items-center justify-center gap-2 rounded-lg px-4 py-2.5 text-xs font-bold transition-colors'
          >
            View Dashboard <ExternalLink className='h-3 w-3' />
          </a>
        </div>
      </div>
    </div>
  );
}
