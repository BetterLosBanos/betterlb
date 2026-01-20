import { useEffect, useState } from 'react';

import { Link, useParams } from 'react-router-dom';

import {
  AlertCircle,
  ArrowLeft,
  Calendar,
  Coins,
  DollarSign,
  Download,
  ExternalLink,
  FileText,
  Gavel,
  ImageIcon,
  Layers,
  MapPin,
  Search,
  TrendingUp,
  Users,
  Video,
} from 'lucide-react';

// --- Components ---
import { DetailSection } from '@/components/layout/PageLayouts';
import {
  Breadcrumb,
  BreadcrumbHome,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/navigation/Breadcrumb';
import { Badge } from '@/components/ui/Badge';
import { Card, CardContent } from '@/components/ui/Card';
import { EmptyState } from '@/components/ui/EmptyState';

import { formatPesoAdaptive } from '@/lib/format';

// --- Strict Types (Matched to API Response) ---
interface ProjectComponent {
  componentId: string;
  description: string;
  infraType: string;
  typeOfWork: string;
  region: string;
  province: string;
  coordinates?: {
    latitude: number;
    longitude: number;
    source?: string;
    locationVerified?: boolean;
  };
}

interface ProjectBidder {
  name: string;
  pcabId?: string;
  participation: number;
  isWinner: boolean;
}

interface DPWHProjectDetail {
  contractId: string;
  description: string;
  category: string;
  status: string;
  budget: number;
  amountPaid: number;
  progress: number;
  location: {
    region: string;
    province: string;
    municipality?: string; // Sometimes flattened in API
    infraType: string;
    coordinates: {
      latitude: number;
      longitude: number;
      verified: boolean;
    };
  };
  infraType: string;
  contractor: string;
  startDate: string;
  completionDate?: string | null;
  infraYear: string;
  contractEffectivityDate?: string;
  expiryDate?: string;
  nysReason?: string | null;
  programName: string;
  sourceOfFunds: string;
  isVerifiedByDpwh: boolean;
  isVerifiedByPublic: boolean;
  isLive: boolean;
  livestreamUrl?: string | null;
  latitude: number;
  longitude: number;
  components?: ProjectComponent[];
  winnerNames?: string;
  bidders?: ProjectBidder[];
  procurement?: {
    contractName: string;
    abc: string;
    status: string;
    fundingInstrument: string;
    advertisementDate: string;
    bidSubmissionDeadline: string;
    dateOfAward: string;
    awardAmount: string;
  };
  links?: {
    advertisement?: string;
    contractAgreement?: string;
    noticeOfAward?: string;
    noticeToProceed?: string;
    programOfWork?: string;
    engineeringDesign?: string;
  };
  imageSummary?: {
    totalImages: number;
    latestImageDate: string;
    hasImages: boolean;
  };
}

// --- Helpers ---
const formatDate = (dateString?: string | null) => {
  if (!dateString) return 'N/A';
  try {
    return new Date(dateString).toLocaleDateString('en-PH', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  } catch {
    return 'N/A';
  }
};

const formatDateTime = (dateString?: string | null) => {
  if (!dateString) return 'N/A';
  try {
    return new Date(dateString).toLocaleString('en-PH', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  } catch {
    return 'N/A';
  }
};

const getStatusVariant = (
  status: string
): 'success' | 'warning' | 'error' | 'primary' | 'slate' => {
  switch (status) {
    case 'Completed':
      return 'success';
    case 'On-Going':
      return 'primary';
    case 'For Procurement':
      return 'warning';
    case 'Not Started':
      return 'slate';
    case 'Terminated':
      return 'error';
    default:
      return 'slate';
  }
};

export default function InfrastructureDetail() {
  const { contractId } = useParams<{ contractId: string }>();
  const [project, setProject] = useState<DPWHProjectDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadProjectDetail = async () => {
      if (!contractId) return;
      setLoading(true);
      setError(null);

      try {
        // USE API DIRECTLY FOR FULL DETAILS
        const response = await fetch(
          `https://api.dpwh.bettergov.ph/projects/${contractId}`
        );

        if (!response.ok) {
          throw new Error(`Failed to load project: ${response.status}`);
        }

        const result = await response.json();
        setProject(result.data);
      } catch (err) {
        console.error('Error loading project detail:', err);
        setError('Project not found or service unavailable.');
      } finally {
        setLoading(false);
      }
    };

    loadProjectDetail();
  }, [contractId]);

  // --- Sub-components for Cleaner Render ---
  const DocumentRow = ({ label, url }: { label: string; url?: string }) => {
    if (!url) return null;
    return (
      <a
        href={url}
        target='_blank'
        rel='noopener noreferrer'
        className='group hover:border-primary-200 flex items-center justify-between rounded-xl border border-slate-100 bg-white p-3 transition-all hover:bg-slate-50'
      >
        <div className='flex items-center gap-3'>
          <div className='group-hover:text-primary-600 rounded-lg border border-slate-100 bg-slate-50 p-2 text-slate-400 transition-colors'>
            <FileText className='h-4 w-4' />
          </div>
          <span className='text-sm font-bold text-slate-700 group-hover:text-slate-900'>
            {label}
          </span>
        </div>
        <ExternalLink className='group-hover:text-primary-400 h-3.5 w-3.5 text-slate-300 transition-colors' />
      </a>
    );
  };

  const InfoRow = ({
    label,
    value,
  }: {
    label: string;
    value?: string | number | null;
  }) => (
    <div>
      <label className='mb-1 block text-[10px] font-bold tracking-widest text-slate-400 uppercase'>
        {label}
      </label>
      <p className='text-sm font-bold wrap-break-word text-slate-900'>
        {value || 'N/A'}
      </p>
    </div>
  );

  if (loading)
    return (
      <div className='animate-in fade-in container mx-auto min-h-screen space-y-8 px-4 pt-20'>
        <div className='h-8 w-1/3 animate-pulse rounded bg-slate-100' />
        <div className='h-64 w-full animate-pulse rounded-3xl bg-slate-100' />
      </div>
    );

  if (error || !project)
    return (
      <div className='animate-in fade-in container mx-auto min-h-screen px-4 pt-20'>
        <EmptyState
          title='Project Unavailable'
          message={error || 'Project not found'}
          actionHref='/transparency/infrastructure'
          actionLabel='Return to List'
          icon={AlertCircle}
        />
      </div>
    );

  const hasDocuments =
    project.links && Object.values(project.links).some(link => !!link);

  return (
    <div className='animate-in fade-in mx-auto max-w-7xl space-y-8 pb-20 duration-500'>
      {/* 1. Breadcrumb */}
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbHome href='/' />
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbLink href='/transparency/infrastructure'>
              Infrastructure
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage>{project.contractId}</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      {/* 2. Header Section */}
      <div className='mb-8'>
        <Link
          to='/transparency/infrastructure'
          className='hover:text-primary-600 mb-6 inline-flex items-center gap-2 text-xs font-bold tracking-widest text-slate-400 uppercase transition-colors'
        >
          <ArrowLeft className='h-4 w-4' /> Return to List
        </Link>

        <div className='flex flex-col gap-6'>
          <div className='max-w-4xl'>
            <div className='mb-4 flex flex-wrap items-center gap-3'>
              <Badge
                variant={getStatusVariant(project.status)}
                className='gap-1.5 px-2.5 py-1 text-[10px]'
              >
                {project.status}
              </Badge>
              <span className='rounded border border-slate-200 bg-slate-50 px-2 py-0.5 font-mono text-xs font-medium text-slate-400'>
                {project.contractId}
              </span>
              {project.isLive && (
                <Badge variant='error' className='animate-pulse'>
                  Live Stream
                </Badge>
              )}
              {project.isVerifiedByDpwh && (
                <Badge variant='success'>DPWH Verified</Badge>
              )}
            </div>
            <h1 className='text-2xl leading-tight font-black text-slate-900 md:text-3xl'>
              {project.description}
            </h1>
          </div>
        </div>
      </div>

      {/* 3. Key Stats Grid */}
      <div className='mb-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4'>
        <Card className='border-slate-200 shadow-sm'>
          <CardContent className='flex h-full flex-col justify-between p-5'>
            <div className='mb-2 flex items-center gap-2'>
              <div className='rounded-md border border-slate-100 bg-slate-50 p-1.5 text-slate-500'>
                <DollarSign className='h-4 w-4' />
              </div>
              <span className='text-[10px] font-bold tracking-widest text-slate-400 uppercase'>
                Total Budget
              </span>
            </div>
            <div>
              <p
                className='truncate text-2xl font-black text-slate-900'
                title={formatPesoAdaptive(project.budget).fullString}
              >
                {formatPesoAdaptive(project.budget).fullString}
              </p>
              <p className='mt-0.5 text-xs font-medium text-slate-400'>
                Allocated
              </p>
            </div>
          </CardContent>
        </Card>

        <Card className='border-slate-200 shadow-sm'>
          <CardContent className='flex h-full flex-col justify-between p-5'>
            <div className='mb-2 flex items-center gap-2'>
              <div className='rounded-md border border-slate-100 bg-slate-50 p-1.5 text-slate-500'>
                <Coins className='h-4 w-4' />
              </div>
              <span className='text-[10px] font-bold tracking-widest text-slate-400 uppercase'>
                Paid Amount
              </span>
            </div>
            <div>
              <p
                className='truncate text-2xl font-black text-slate-900'
                title={formatPesoAdaptive(project.amountPaid).fullString}
              >
                {formatPesoAdaptive(project.amountPaid).fullString}
              </p>
              <p className='mt-0.5 text-xs font-medium text-slate-400'>
                {project.budget > 0
                  ? ((project.amountPaid / project.budget) * 100).toFixed(1)
                  : 0}
                % disbursed
              </p>
            </div>
          </CardContent>
        </Card>

        <Card className='border-slate-200 bg-slate-50/50 shadow-sm'>
          <CardContent className='flex h-full flex-col justify-between p-5'>
            <div className='mb-2 flex items-center gap-2'>
              <div className='rounded-md border border-slate-200 bg-white p-1.5 text-slate-500'>
                <TrendingUp className='h-4 w-4' />
              </div>
              <span className='text-[10px] font-bold tracking-widest text-slate-400 uppercase'>
                Progress
              </span>
            </div>
            <div>
              <p className='text-primary-600 mb-2 text-2xl font-black'>
                {project.progress.toFixed(1)}%
              </p>
              <div className='h-2 w-full overflow-hidden rounded-full bg-slate-200'>
                <div
                  className='bg-primary-600 h-full rounded-full transition-all'
                  style={{ width: `${Math.min(project.progress, 100)}%` }}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className='border-slate-200 shadow-sm'>
          <CardContent className='flex h-full flex-col justify-between p-5'>
            <div className='mb-2 flex items-center gap-2'>
              <div className='rounded-md border border-slate-100 bg-slate-50 p-1.5 text-slate-500'>
                <Calendar className='h-4 w-4' />
              </div>
              <span className='text-[10px] font-bold tracking-widest text-slate-400 uppercase'>
                Fiscal Year
              </span>
            </div>
            <div>
              <p className='text-2xl font-black text-slate-900'>
                {project.infraYear}
              </p>
              <p className='mt-0.5 truncate text-xs font-medium text-slate-400'>
                {project.programName}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* 4. Main Two-Column Layout */}
      <div className='grid grid-cols-1 gap-8 lg:grid-cols-3'>
        {/* LEFT: MAIN INFO */}
        <div className='space-y-8 lg:col-span-2'>
          {/* Project Information */}
          <DetailSection title='Project Information' icon={FileText}>
            <div className='grid grid-cols-1 gap-6 sm:grid-cols-2'>
              <InfoRow label='Contract ID' value={project.contractId} />
              <InfoRow label='Category' value={project.category} />
              <InfoRow label='Infra Type' value={project.location.infraType} />
              <InfoRow label='Program' value={project.programName} />
              <div className='sm:col-span-2'>
                <InfoRow
                  label='Source of Funds'
                  value={project.sourceOfFunds}
                />
              </div>
            </div>
          </DetailSection>

          {/* Timeline */}
          <DetailSection title='Timeline' icon={Calendar}>
            <div className='grid grid-cols-1 gap-6 sm:grid-cols-2'>
              <InfoRow
                label='Start Date'
                value={formatDate(project.startDate)}
              />
              <InfoRow
                label='Completion Date'
                value={formatDate(project.completionDate)}
              />
              <InfoRow
                label='Contract Effectivity'
                value={formatDate(project.contractEffectivityDate)}
              />
              <InfoRow
                label='Expiry Date'
                value={formatDate(project.expiryDate)}
              />
              {project.nysReason && (
                <div className='rounded-lg border border-slate-100 bg-slate-50 p-3 sm:col-span-2'>
                  <InfoRow
                    label='Reason for Delay (NYS)'
                    value={project.nysReason}
                  />
                </div>
              )}
            </div>
          </DetailSection>

          {/* Contractor & Bidders (New Section!) */}
          <DetailSection title='Contractor Information' icon={Users}>
            <div className='space-y-6'>
              <div>
                <InfoRow
                  label='Primary Contractor'
                  value={project.contractor}
                />
                {project.winnerNames && (
                  <p className='mt-1 text-xs text-slate-500'>
                    Winner: {project.winnerNames}
                  </p>
                )}
              </div>

              {project.bidders && project.bidders.length > 0 && (
                <div>
                  <label className='mb-3 block text-[10px] font-bold tracking-widest text-slate-400 uppercase'>
                    Participating Bidders
                  </label>
                  <div className='space-y-2'>
                    {project.bidders.map((bidder, i) => (
                      <div
                        key={i}
                        className={`flex items-center justify-between rounded-lg border p-3 ${bidder.isWinner ? 'border-emerald-100 bg-emerald-50' : 'border-slate-100 bg-slate-50'}`}
                      >
                        <div>
                          <p
                            className={`text-sm font-bold ${bidder.isWinner ? 'text-emerald-900' : 'text-slate-700'}`}
                          >
                            {bidder.name}
                          </p>
                          {bidder.pcabId && (
                            <p className='text-xs text-slate-500'>
                              PCAB: {bidder.pcabId}
                            </p>
                          )}
                        </div>
                        <div className='text-right'>
                          {bidder.isWinner && (
                            <Badge variant='success' className='mb-1'>
                              Winner
                            </Badge>
                          )}
                          <p className='font-mono text-xs text-slate-500'>
                            {bidder.participation}%
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </DetailSection>

          {/* Procurement Details (New Section!) */}
          {project.procurement && (
            <DetailSection title='Procurement Details' icon={Gavel}>
              <div className='space-y-6'>
                <InfoRow
                  label='Contract Name'
                  value={project.procurement.contractName}
                />
                <div className='grid grid-cols-1 gap-6 sm:grid-cols-2'>
                  <InfoRow label='ABC' value={project.procurement.abc} />
                  <InfoRow
                    label='Award Amount'
                    value={project.procurement.awardAmount}
                  />
                  <InfoRow
                    label='Status Code'
                    value={project.procurement.status}
                  />
                  <InfoRow
                    label='Funding Instrument'
                    value={project.procurement.fundingInstrument}
                  />
                </div>
                <div className='grid grid-cols-1 gap-4 border-t border-slate-100 pt-4 sm:grid-cols-3'>
                  <InfoRow
                    label='Advertisement'
                    value={formatDateTime(
                      project.procurement.advertisementDate
                    )}
                  />
                  <InfoRow
                    label='Bid Submission'
                    value={formatDateTime(
                      project.procurement.bidSubmissionDeadline
                    )}
                  />
                  <InfoRow
                    label='Award Date'
                    value={formatDateTime(project.procurement.dateOfAward)}
                  />
                </div>
              </div>
            </DetailSection>
          )}

          {/* Project Components (New Section!) */}
          {project.components && project.components.length > 0 && (
            <DetailSection
              title={`Components (${project.components.length})`}
              icon={Layers}
            >
              <div className='space-y-3'>
                {project.components.map((comp, idx) => (
                  <div
                    key={idx}
                    className='rounded-xl border border-slate-200 bg-slate-50 p-4'
                  >
                    <div className='mb-2 flex items-start justify-between'>
                      <h4 className='text-sm font-bold text-slate-900'>
                        Component {idx + 1}
                      </h4>
                      <span className='rounded border border-slate-200 bg-white px-1.5 py-0.5 font-mono text-[10px] text-slate-400'>
                        {comp.componentId}
                      </span>
                    </div>
                    <p className='mb-3 text-xs leading-relaxed text-slate-600'>
                      {comp.description}
                    </p>
                    <div className='grid grid-cols-2 gap-2 text-xs'>
                      <p>
                        <span className='text-slate-400'>Type:</span>{' '}
                        <span className='font-medium text-slate-800'>
                          {comp.infraType}
                        </span>
                      </p>
                      <p>
                        <span className='text-slate-400'>Work:</span>{' '}
                        <span className='font-medium text-slate-800'>
                          {comp.typeOfWork}
                        </span>
                      </p>
                      <p>
                        <span className='text-slate-400'>Coords:</span>{' '}
                        <span className='font-mono text-slate-600'>
                          {comp.coordinates?.latitude.toFixed(5)},{' '}
                          {comp.coordinates?.longitude.toFixed(5)}
                        </span>
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </DetailSection>
          )}
        </div>

        {/* RIGHT: ACTIONS & MEDIA */}
        <div className='space-y-6'>
          {/* Documents */}
          <DetailSection title='Documents' icon={Download}>
            {hasDocuments ? (
              <div className='space-y-2'>
                <DocumentRow
                  label='Advertisement'
                  url={project.links?.advertisement}
                />
                <DocumentRow
                  label='Notice of Award'
                  url={project.links?.noticeOfAward}
                />
                <DocumentRow
                  label='Contract Agreement'
                  url={project.links?.contractAgreement}
                />
                <DocumentRow
                  label='Notice to Proceed'
                  url={project.links?.noticeToProceed}
                />
                <DocumentRow
                  label='Program of Work'
                  url={project.links?.programOfWork}
                />
                <DocumentRow
                  label='Engineering Design'
                  url={project.links?.engineeringDesign}
                />
              </div>
            ) : (
              <div className='rounded-xl border border-dashed border-slate-200 bg-slate-50 p-4 text-center'>
                <p className='text-xs font-medium text-slate-400'>
                  No public documents available.
                </p>
              </div>
            )}
          </DetailSection>

          {/* Location */}
          <DetailSection title='Location' icon={MapPin}>
            <div className='space-y-4'>
              <div>
                <InfoRow
                  label='Region / Province'
                  value={`${project.location.region}, ${project.location.province}`}
                />
              </div>

              {project.latitude && project.longitude ? (
                <>
                  <div className='rounded border border-slate-100 bg-slate-50 p-2 text-center font-mono text-[10px] text-slate-500'>
                    {project.latitude.toFixed(6)},{' '}
                    {project.longitude.toFixed(6)}
                  </div>
                  <a
                    href={`https://www.google.com/maps?q=${project.latitude},${project.longitude}`}
                    target='_blank'
                    rel='noopener noreferrer'
                    className='hover:border-primary-300 hover:text-primary-600 flex w-full items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white py-2.5 text-xs font-bold text-slate-700 shadow-sm transition-all'
                  >
                    View on Google Maps <ExternalLink className='h-3 w-3' />
                  </a>
                </>
              ) : (
                <div className='rounded-xl border border-dashed border-slate-200 bg-slate-50 p-4 text-center'>
                  <MapPin className='mx-auto mb-2 h-6 w-6 text-slate-300' />
                  <p className='text-xs text-slate-400'>
                    No coordinates available
                  </p>
                </div>
              )}
            </div>
          </DetailSection>

          {/* Images */}
          {project.imageSummary && (
            <DetailSection title='Images' icon={ImageIcon}>
              <div className='flex items-center justify-between'>
                <span className='text-sm text-slate-600'>Total Images</span>
                <span className='font-bold text-slate-900'>
                  {project.imageSummary.totalImages}
                </span>
              </div>
              {project.imageSummary.latestImageDate && (
                <div className='mt-2 flex items-center justify-between border-t border-slate-100 pt-2'>
                  <span className='text-xs text-slate-500'>Latest</span>
                  <span className='text-xs font-medium text-slate-700'>
                    {formatDate(project.imageSummary.latestImageDate)}
                  </span>
                </div>
              )}
            </DetailSection>
          )}

          {/* Live Stream */}
          {project.isLive && project.livestreamUrl && (
            <div className='rounded-2xl border-2 border-red-100 bg-red-50 p-5'>
              <div className='mb-3 flex items-center gap-2 text-red-800'>
                <Video className='h-5 w-5 animate-pulse' />
                <span className='font-bold'>Live Feed</span>
              </div>
              <a
                href={project.livestreamUrl}
                target='_blank'
                rel='noreferrer'
                className='flex w-full items-center justify-center gap-2 rounded-xl bg-red-600 py-3 font-bold text-white shadow-lg transition-colors hover:bg-red-700'
              >
                Watch Stream <ExternalLink className='h-4 w-4' />
              </a>
            </div>
          )}

          {/* Bisto Link */}
          <div className='rounded-xl border border-slate-200 bg-slate-50 p-4'>
            <p className='mb-3 text-xs leading-relaxed text-slate-500'>
              Verify status on national platform.
            </p>
            <a
              href={`https://bisto.ph/?q=${encodeURIComponent(project.contractId)}`} //waiting for bisto.ph PR
              target='_blank'
              rel='noreferrer'
              className='flex w-full items-center justify-center gap-2 rounded-lg bg-slate-900 py-2 text-xs font-bold text-white shadow-md transition-all hover:bg-slate-800'
            >
              Search on Bisto.ph <Search className='h-3 w-3' />
            </a>
          </div>
        </div>
      </div>

      <div className='pt-8 text-center'>
        <p className='text-xs text-slate-400'>
          Source:{' '}
          <a
            href='https://transparency.bettergov.ph/dpwh/'
            target='_blank'
            rel='noopener noreferrer'
            className='text-primary-600 hover:text-primary-800 inline-flex items-center gap-1 font-bold transition-colors hover:underline'
          >
            DPWH Infrastructure Transparency Interface via BetterGov.ph
            <ExternalLink className='h-3 w-3' />
          </a>
        </p>
      </div>
    </div>
  );
}
