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
import { config } from '@/lib/lguConfig';
import { DPWHProject, INDICES, client } from '@/lib/meilisearch';

export default function InfrastructurePage() {
  const navigate = useNavigate();

  // Get config for infrastructure filters

  // Filters & Search
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

        const provinceFilter = config.lgu.districtEngineeringOffice
          ? `location.province = "${config.lgu.districtEngineeringOffice}" OR location.province = "${config.lgu.province}"`
          : `location.province = "${config.lgu.province}"`;

        const filterConditions: string[] = [
          `location.region = "${config.lgu.region}"`,
          provinceFilter,
          selectedStatuses.length > 0
            ? `(${selectedStatuses.map(s => `status = "${s}"`).join(' OR ')})`
            : '',
        ].filter(Boolean);

        let searchString = config.transparency.infrastructure.searchString;
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
          const target = config.transparency.infrastructure.exactMatchTargets;
          return target.some(
            (t: string) => mun.includes(t) || desc.includes(t)
          );
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
  }, [query, selectedStatuses, config]);

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
              className='bg-kapwa-bg-surface-raised h-16 animate-pulse rounded-xl'
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
        <div className='border-kapwa-border-weak bg-kapwa-bg-surface overflow-hidden rounded-xl border shadow-sm'>
          <div className='overflow-x-auto'>
            <table className='w-full text-left text-sm'>
              <thead className='border-kapwa-border-weak bg-kapwa-bg-surface-raised text-kapwa-text-disabled border-b text-xs font-bold tracking-wider uppercase'>
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
                    className='group hover:bg-kapwa-bg-surface-raised/50 cursor-pointer transition-colors'
                  >
                    <td className='group-hover:text-kapwa-text-brand text-kapwa-text-disabled hidden px-6 py-4 font-mono text-xs transition-colors md:table-cell'>
                      {item.contractId}
                    </td>
                    <td className='px-6 py-4'>
                      <p className='group-hover:text-kapwa-text-brand text-kapwa-text-strong mb-1 line-clamp-2 leading-snug font-bold transition-colors'>
                        {item.description}
                      </p>
                      <div className='flex flex-wrap items-center gap-2'>
                        <Badge
                          variant='slate'
                          className='border-kapwa-border-weak bg-kapwa-bg-surface-raised text-kapwa-text-disabled h-4 px-1.5 py-0 text-[9px]'
                        >
                          {item.category}
                        </Badge>
                        <span className='text-kapwa-text-disabled flex items-center gap-1 text-xs'>
                          <MapPin className='text-kapwa-text-support h-3 w-3' />
                          {item.location.barangay
                            ? `${item.location.barangay}, `
                            : ''}
                          {item.location.municipality || 'Los Baños'}
                        </span>
                      </div>
                    </td>
                    <td className='text-kapwa-text-strong px-6 py-4 text-right font-mono font-bold'>
                      {formatPesoAdaptive(item.budget).fullString}
                    </td>
                    <td className='hidden w-32 px-6 py-4 text-center md:table-cell'>
                      <div className='flex flex-col items-center'>
                        <span className='text-kapwa-text-support mb-1 text-xs font-bold'>
                          {item.progress.toFixed(1)}%
                        </span>
                        <div className='bg-kapwa-bg-hover h-1.5 w-full overflow-hidden rounded-xl'>
                          <div
                            className={`h-full ${item.progress >= 100 ? 'bg-emerald-500' : 'bg-kapwa-bg-brand-weak0'}`}
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
        <div className='hover:border-kapwa-border-brand border-kapwa-border-weak bg-kapwa-bg-surface flex h-full flex-col justify-between rounded-xl border p-6 shadow-sm transition-all'>
          <div className='mb-4 flex items-start gap-4'>
            <div className='bg-kapwa-bg-info-weak text-kapwa-text-info shrink-0 rounded-xl p-3'>
              <BarChart3 className='h-6 w-6' />
            </div>
            <div>
              <h4 className='text-kapwa-text-strong mb-1 font-bold'>
                Data & Analytics
              </h4>
              <p className='text-kapwa-text-disabled text-xs leading-relaxed'>
                View detailed budget breakdowns, regional comparisons, and
                contractor performance charts on BetterGov Transparency
                Dashboard.
              </p>
            </div>
          </div>
          <a
            href='https://transparency.bettergov.ph/dpwh?q=los+ba%C3%B1os&regions=Region+IV-A&provinces=Region+IV-A%2CLaguna+2nd+DEO'
            target='_blank'
            rel='noreferrer'
            className='bg-kapwa-bg-info-weak text-kapwa-text-info hover:bg-kapwa-bg-info-weak inline-flex w-full items-center justify-center gap-2 rounded-lg px-4 py-2.5 text-xs font-bold transition-colors'
          >
            Open Transparency Dashboard <ExternalLink className='h-3 w-3' />
          </a>
        </div>

        <div className='hover:border-kapwa-border-brand border-kapwa-border-weak bg-kapwa-bg-surface flex h-full flex-col justify-between rounded-xl border p-6 shadow-sm transition-all'>
          <div className='mb-4 flex items-start gap-4'>
            <div className='text-kapwa-text-inverse bg-kapwa-bg-gray-900 shrink-0 rounded-xl p-3'>
              <Layers className='h-6 w-6' />
            </div>
            <div>
              <h4 className='text-kapwa-text-strong mb-1 font-bold'>
                Citizen Verification
              </h4>
              <p className='text-kapwa-text-disabled text-xs leading-relaxed'>
                Report issues, upload photos, and verify actual physical
                progress of infrastructure projects in your barangay on
                Bisto.ph.
              </p>
            </div>
          </div>
          <a
            href='https://bisto.ph/projects?search=los+ba%C3%B1os&region=Region+IV-A&province=LAGUNA'
            target='_blank'
            rel='noreferrer'
            className='text-kapwa-text-inverse bg-kapwa-bg-gray-900 hover:bg-kapwa-bg-gray-800 inline-flex w-full items-center justify-center gap-2 rounded-lg px-4 py-2.5 text-xs font-bold transition-colors'
          >
            Visit Bisto.ph <ExternalLink className='h-3 w-3' />
          </a>
        </div>
      </div>
    </div>
  );
}
