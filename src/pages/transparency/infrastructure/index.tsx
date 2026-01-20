import { useEffect, useMemo, useState } from 'react';

import { useNavigate } from 'react-router-dom';

import {
  AlertCircle,
  BarChart3,
  CalendarCheck,
  ExternalLink,
  FileText,
  HardHat,
  Layers,
  MapPin,
  TrendingUp,
  Wallet,
} from 'lucide-react';

import { StatsCard } from '@/components/data-display/StatsUI';
import { ModuleHeader } from '@/components/layout/PageLayouts';
import { Badge } from '@/components/ui/Badge';
import { CardGrid } from '@/components/ui/Card';
import { EmptyState } from '@/components/ui/EmptyState';
import { PaginationControls } from '@/components/ui/Pagination';
import SearchInput from '@/components/ui/SearchInput';
import SelectPicker from '@/components/ui/SelectPicker';

import { formatPesoAdaptive } from '@/lib/format';
import { DPWHProject, INDICES, client } from '@/lib/meilisearch';

export default function InfrastructurePage() {
  const navigate = useNavigate();

  //  Filters & Search
  const [query, setQuery] = useState('');
  const [selectedStatuses, setSelectedStatuses] = useState<string[]>([]);
  const [results, setResults] = useState<DPWHProject[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  const STATUS_OPTIONS = [
    { label: 'Active', value: 'On-Going' },
    { label: 'Completed', value: 'Completed' },
    { label: 'For Procurement', value: 'For Procurement' },
    { label: 'Not Yet Started', value: 'Not Yet Started' },
    { label: 'Terminated', value: 'Terminated' },
  ];

  // Reset to page 1 when filters change
  useEffect(() => setCurrentPage(1), [query, selectedStatuses]);

  //  Compute Stats
  const stats = useMemo(() => {
    if (results.length === 0) {
      return {
        totalBudget: 0,
        avgProgress: 0,
        count: 0,
        infraYear: null,
      };
    }

    // Total budget
    const totalBudget = results.reduce(
      (sum, item) => sum + (Number(item.budget) || 0),
      0
    );

    // Average progress
    const avgProgress =
      results.reduce((sum, item) => sum + (Number(item.progress) || 0), 0) /
      results.length;

    // Most recent year
    const infraYear = Math.max(
      ...results.map(item => Number(item.infraYear) || 0)
    );

    return {
      totalBudget,
      avgProgress,
      count: results.length,
      infraYear,
    };
  }, [results]);

  //  Fetch Data
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(false);
      try {
        const index = client.index(INDICES.DPWH);

        const filterConditions: string[] = [
          'location.region = "Region IV-A"',
          `(location.province = "Laguna 2nd DEO" OR location.province = "Laguna")`,
          selectedStatuses.length > 0
            ? `(${selectedStatuses.map(s => `status = "${s}"`).join(' OR ')})`
            : '',
        ].filter(Boolean);

        let searchString = 'Los Baños';
        if (query) searchString += ` ${query}`;

        const response = await index.search(searchString, {
          filter: filterConditions.join(' AND '),
          sort: ['infraYear:desc', 'budget:desc'],
          limit: 200,
        });

        const hits = response.hits as unknown as DPWHProject[];
        const exactMatches = hits.filter(h => {
          const mun = h.location.municipality?.toLowerCase() || '';
          const desc = h.description?.toLowerCase() || '';
          const target = ['los baños', 'los banos'];
          return target.some(t => mun.includes(t) || desc.includes(t));
        });

        setResults(exactMatches);
      } catch (err) {
        console.error('Search Error:', err);
        setError(true);
      } finally {
        setLoading(false);
      }
    };

    const timer = setTimeout(fetchData, 400);
    return () => clearTimeout(timer);
  }, [query, selectedStatuses]);

  //  Pagination helpers
  const [resultsPerPage, setResultsPerPage] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);

  const totalPages = Math.ceil(results.length / resultsPerPage);
  const paginatedResults = results.slice(
    (currentPage - 1) * resultsPerPage,
    (currentPage - 1) * resultsPerPage + resultsPerPage
  );

  return (
    <div className='animate-in fade-in mx-auto max-w-full space-y-8 px-4 pb-20 duration-500 md:px-8'>
      {/* Header + Search + Status Toggle  */}
      <ModuleHeader
        title='Infrastructure Projects'
        description='Monitoring of national DPWH infrastructure projects within Los Baños.'
      >
        <div className='flex w-full flex-col items-center gap-4 md:w-auto md:flex-row'>
          <SearchInput
            value={query}
            onChangeValue={setQuery}
            placeholder='Search projects...'
            className='md:w-72'
          />
          <SelectPicker
            options={STATUS_OPTIONS}
            selectedValues={selectedStatuses}
            onSelect={selected =>
              setSelectedStatuses(selected.map(opt => opt.value))
            }
            placeholder='Select status...'
            className='md:w-56'
            searchable={false}
            clearable={true}
          />
        </div>
      </ModuleHeader>

      {/* Stats Grid  */}
      <CardGrid columns={4}>
        <StatsCard
          label='Total Allocation'
          value={stats.totalBudget}
          subtext='Current List'
          variant='primary'
          icon={Wallet}
        />

        <StatsCard
          label='Avg Progress'
          value={`${stats.avgProgress.toFixed(1)}%`}
          subtext='Completion Rate'
          variant='primary'
          icon={TrendingUp}
        />

        <StatsCard
          label='Project Count'
          value={stats.count}
          subtext='Projects Found'
          variant='slate'
          icon={FileText}
        />

        <StatsCard
          label='Fiscal Year'
          value={stats.infraYear || 'N/A'}
          subtext='Most Recent'
          variant='slate'
          icon={CalendarCheck}
        />
      </CardGrid>

      {/*  Table List  */}
      {loading ? (
        <div className='space-y-4'>
          {[1, 2, 3].map(i => (
            <div
              key={i}
              className='h-16 animate-pulse rounded-xl bg-slate-50'
            />
          ))}
        </div>
      ) : error ? (
        <EmptyState
          title='Unavailable'
          message='Could not connect to transparency engine.'
          icon={AlertCircle}
        />
      ) : results.length === 0 ? (
        <EmptyState
          title={
            selectedStatuses[0] === 'On-Going'
              ? 'No Active Projects'
              : 'No Records Found'
          }
          message={
            selectedStatuses[0] === 'On-Going'
              ? 'There are no reported on-going DPWH projects in this area.'
              : 'Try adjusting your search.'
          }
          icon={HardHat}
        />
      ) : (
        <div className='overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm'>
          <div className='overflow-x-auto'>
            <table className='w-full text-left text-sm'>
              <thead className='border-b border-slate-200 bg-slate-50 text-xs font-bold tracking-wider text-slate-500 uppercase'>
                <tr>
                  <th className='hidden w-32 px-6 py-4 md:table-cell'>
                    Contract ID
                  </th>
                  <th className='px-6 py-4'>Description</th>
                  <th className='px-6 py-4 text-right'>Budget</th>
                  <th className='hidden px-6 py-4 text-center md:table-cell'>
                    Progress
                  </th>
                  <th className='px-6 py-4 text-center'>Status</th>
                </tr>
              </thead>
              <tbody className='divide-y divide-slate-100'>
                {paginatedResults.map(item => (
                  <tr
                    key={item.contractId}
                    onClick={() =>
                      navigate(
                        `/transparency/infrastructure/${item.contractId}`
                      )
                    }
                    className='group cursor-pointer transition-colors hover:bg-slate-50/50'
                  >
                    <td className='group-hover:text-primary-600 hidden px-6 py-4 font-mono text-xs text-slate-500 transition-colors md:table-cell'>
                      {item.contractId}
                    </td>
                    <td className='px-6 py-4'>
                      <p className='group-hover:text-primary-700 mb-1 line-clamp-2 leading-snug font-bold text-slate-900 transition-colors'>
                        {item.description}
                      </p>
                      <div className='flex flex-wrap items-center gap-2'>
                        <Badge
                          variant='slate'
                          className='h-4 border-slate-200 bg-slate-50 px-1.5 py-0 text-[9px] text-slate-500'
                        >
                          {item.category}
                        </Badge>
                        <span className='flex items-center gap-1 text-xs text-slate-500'>
                          <MapPin className='h-3 w-3 text-slate-300' />
                          {item.location.barangay
                            ? `${item.location.barangay}, `
                            : ''}
                          {item.location.municipality || 'Los Baños'}
                        </span>
                      </div>
                    </td>
                    <td className='px-6 py-4 text-right font-mono font-bold text-slate-900'>
                      {formatPesoAdaptive(item.budget).fullString}
                    </td>
                    <td className='hidden w-32 px-6 py-4 text-center md:table-cell'>
                      <div className='flex flex-col items-center'>
                        <span className='mb-1 text-xs font-bold text-slate-700'>
                          {item.progress.toFixed(1)}%
                        </span>
                        <div className='h-1.5 w-full overflow-hidden rounded-xl bg-slate-100'>
                          <div
                            className={`h-full ${item.progress >= 100 ? 'bg-emerald-500' : 'bg-primary-500'}`}
                            style={{
                              width: `${Math.min(item.progress, 100)}%`,
                            }}
                          />
                        </div>
                      </div>
                    </td>
                    <td className='px-6 py-4 text-center'>
                      <Badge
                        variant={item.progress >= 100 ? 'success' : 'primary'}
                        className='text-[10px]'
                      >
                        {item.status ||
                          (item.progress >= 100 ? 'Completed' : 'On-Going')}
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

      {/*  External Links Footer  */}
      <div className='grid grid-cols-1 gap-4 md:grid-cols-2'>
        <div className='hover:border-primary-200 flex h-full flex-col justify-between rounded-xl border border-slate-200 bg-white p-6 shadow-sm transition-all'>
          <div className='mb-4 flex items-start gap-4'>
            <div className='shrink-0 rounded-xl bg-blue-50 p-3 text-blue-600'>
              <BarChart3 className='h-6 w-6' />
            </div>
            <div>
              <h4 className='mb-1 font-bold text-slate-900'>
                Data & Analytics
              </h4>
              <p className='text-xs leading-relaxed text-slate-500'>
                View detailed budget breakdowns, regional comparisons, and
                contractor performance charts on the BetterGov Transparency
                Dashboard.
              </p>
            </div>
          </div>
          <a
            href='https://transparency.bettergov.ph/dpwh?q=los+ba%C3%B1os&regions=Region+IV-A&provinces=Region+IV-A%2CLaguna+2nd+DEO'
            target='_blank'
            rel='noreferrer'
            className='inline-flex w-full items-center justify-center gap-2 rounded-lg bg-blue-50 px-4 py-2.5 text-xs font-bold text-blue-700 transition-colors hover:bg-blue-100'
          >
            Open Transparency Dashboard <ExternalLink className='h-3 w-3' />
          </a>
        </div>

        <div className='hover:border-primary-200 flex h-full flex-col justify-between rounded-xl border border-slate-200 bg-white p-6 shadow-sm transition-all'>
          <div className='mb-4 flex items-start gap-4'>
            <div className='shrink-0 rounded-xl bg-slate-900 p-3 text-white'>
              <Layers className='h-6 w-6' />
            </div>
            <div>
              <h4 className='mb-1 font-bold text-slate-900'>
                Citizen Verification
              </h4>
              <p className='text-xs leading-relaxed text-slate-500'>
                Report issues, upload photos, and verify the actual physical
                progress of infrastructure projects in your barangay on
                Bisto.ph.
              </p>
            </div>
          </div>
          <a
            href='https://bisto.ph/projects?search=los+ba%C3%B1os&region=Region+IV-A&province=LAGUNA'
            target='_blank'
            rel='noreferrer'
            className='inline-flex w-full items-center justify-center gap-2 rounded-lg bg-slate-900 px-4 py-2.5 text-xs font-bold text-white transition-colors hover:bg-slate-800'
          >
            Visit Bisto.ph <ExternalLink className='h-3 w-3' />
          </a>
        </div>
      </div>
    </div>
  );
}
