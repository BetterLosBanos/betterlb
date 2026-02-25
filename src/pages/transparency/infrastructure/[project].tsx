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
        className='flex justify-between items-center p-3 rounded-xl border transition-all group hover:border-kapwa-border-brand border-kapwa-border-weak bg-kapwa-bg-surface hover:bg-kapwa-bg-surface-raised'
      >
        <div className='flex gap-3 items-center'>
          <div className='p-2 rounded-lg border transition-colors group-hover:text-kapwa-text-brand border-kapwa-border-weak bg-kapwa-bg-surface-raised text-kapwa-text-disabled'>
            <FileText className='w-4 h-4' />
          </div>
          <span className='text-sm font-bold text-kapwa-text-support group-hover:text-kapwa-text-strong'>
            {label}
          </span>
        </div>
        <ExternalLink className='group-hover:text-kapwa-text-brand-600 text-kapwa-text-support h-3.5 w-3.5 transition-colors' />
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
      <label className='text-kapwa-text-disabled mb-1 block text-[10px] font-bold tracking-widest uppercase'>
        {label}
      </label>
      <p className='text-sm font-bold text-kapwa-text-strong wrap-break-word'>
        {value || 'N/A'}
      </p>
    </div>
  );

  if (loading)
    return (
      <div className='container px-4 pt-20 mx-auto space-y-8 min-h-screen animate-in fade-in'>
        <div className='w-1/3 h-8 rounded animate-pulse bg-kapwa-bg-hover' />
        <div className='w-full h-64 rounded-3xl animate-pulse bg-kapwa-bg-hover' />
      </div>
    );

  if (error || !project)
    return (
      <div className='container px-4 pt-20 mx-auto min-h-screen animate-in fade-in'>
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
    <div className='pb-20 mx-auto space-y-8 max-w-7xl duration-500 animate-in fade-in'>
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
          className='inline-flex gap-2 items-center mb-6 text-xs font-bold tracking-widest uppercase transition-colors hover:text-kapwa-text-brand text-kapwa-text-disabled'
        >
          <ArrowLeft className='w-4 h-4' /> Return to List
        </Link>

        <div className='flex flex-col gap-6'>
          <div className='max-w-4xl'>
            <div className='flex flex-wrap gap-3 items-center mb-4'>
              <Badge
                variant={getStatusVariant(project.status)}
                className='gap-1.5 px-2.5 py-1 text-[10px]'
              >
                {project.status}
              </Badge>
              <span className='border-kapwa-border-weak bg-kapwa-bg-surface-raised text-kapwa-text-disabled rounded border px-2 py-0.5 font-mono text-xs font-medium'>
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
            <h1 className='text-2xl font-black leading-tight text-kapwa-text-strong md:text-3xl'>
              {project.description}
            </h1>
          </div>
        </div>
      </div>

      {/* 3. Key Stats Grid */}
      <div className='grid grid-cols-1 gap-4 mb-8 sm:grid-cols-2 lg:grid-cols-4'>
        <Card className='shadow-sm border-kapwa-border-weak'>
          <CardContent className='flex flex-col justify-between p-5 h-full'>
            <div className='flex gap-2 items-center mb-2'>
              <div className='border-kapwa-border-weak bg-kapwa-bg-surface-raised text-kapwa-text-disabled rounded-md border p-1.5'>
                <DollarSign className='w-4 h-4' />
              </div>
              <span className='text-kapwa-text-disabled text-[10px] font-bold tracking-widest uppercase'>
                Total Budget
              </span>
            </div>
            <div>
              <p
                className='text-2xl font-black truncate text-kapwa-text-strong'
                title={formatPesoAdaptive(project.budget).fullString}
              >
                {formatPesoAdaptive(project.budget).fullString}
              </p>
              <p className='text-kapwa-text-disabled mt-0.5 text-xs font-medium'>
                Allocated
              </p>
            </div>
          </CardContent>
        </Card>

        <Card className='shadow-sm border-kapwa-border-weak'>
          <CardContent className='flex flex-col justify-between p-5 h-full'>
            <div className='flex gap-2 items-center mb-2'>
              <div className='border-kapwa-border-weak bg-kapwa-bg-surface-raised text-kapwa-text-disabled rounded-md border p-1.5'>
                <Coins className='w-4 h-4' />
              </div>
              <span className='text-kapwa-text-disabled text-[10px] font-bold tracking-widest uppercase'>
                Paid Amount
              </span>
            </div>
            <div>
              <p
                className='text-2xl font-black truncate text-kapwa-text-strong'
                title={formatPesoAdaptive(project.amountPaid).fullString}
              >
                {formatPesoAdaptive(project.amountPaid).fullString}
              </p>
              <p className='text-kapwa-text-disabled mt-0.5 text-xs font-medium'>
                {project.budget > 0
                  ? ((project.amountPaid / project.budget) * 100).toFixed(1)
                  : 0}
                % disbursed
              </p>
            </div>
          </CardContent>
        </Card>

        <Card className='shadow-sm bg-kapwa-bg-surface-raised/50 border-kapwa-border-weak'>
          <CardContent className='flex flex-col justify-between p-5 h-full'>
            <div className='flex gap-2 items-center mb-2'>
              <div className='border-kapwa-border-weak bg-kapwa-bg-surface text-kapwa-text-disabled rounded-md border p-1.5'>
                <TrendingUp className='w-4 h-4' />
              </div>
              <span className='text-kapwa-text-disabled text-[10px] font-bold tracking-widest uppercase'>
                Progress
              </span>
            </div>
            <div>
              <p className='mb-2 text-2xl font-black text-kapwa-text-brand'>
                {project.progress.toFixed(1)}%
              </p>
              <div className='overflow-hidden w-full h-2 rounded-full bg-kapwa-bg-active'>
                <div
                  className='h-full rounded-full transition-all bg-kapwa-bg-brand-default'
                  style={{ width: `${Math.min(project.progress, 100)}%` }}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className='shadow-sm border-kapwa-border-weak'>
          <CardContent className='flex flex-col justify-between p-5 h-full'>
            <div className='flex gap-2 items-center mb-2'>
              <div className='border-kapwa-border-weak bg-kapwa-bg-surface-raised text-kapwa-text-disabled rounded-md border p-1.5'>
                <Calendar className='w-4 h-4' />
              </div>
              <span className='text-kapwa-text-disabled text-[10px] font-bold tracking-widest uppercase'>
                Fiscal Year
              </span>
            </div>
            <div>
              <p className='text-2xl font-black text-kapwa-text-strong'>
                {project.infraYear}
              </p>
              <p className='text-kapwa-text-disabled mt-0.5 truncate text-xs font-medium'>
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
                <div className='p-3 rounded-lg border border-kapwa-border-weak bg-kapwa-bg-surface-raised sm:col-span-2'>
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
                  <p className='mt-1 text-xs text-kapwa-text-disabled'>
                    Winner: {project.winnerNames}
                  </p>
                )}
              </div>

              {project.bidders && project.bidders.length > 0 && (
                <div>
                  <label className='text-kapwa-text-disabled mb-3 block text-[10px] font-bold tracking-widest uppercase'>
                    Participating Bidders
                  </label>
                  <div className='space-y-2'>
                    {project.bidders.map((bidder, i) => (
                      <div
                        key={i}
                        className={`flex items-center justify-between rounded-lg border p-3 ${bidder.isWinner ? 'border-kapwa-border-success bg-kapwa-bg-success-weak' : 'bg-kapwa-bg-surface border-kapwa-border-weak'}`}
                      >
                        <div>
                          <p
                            className={`text-sm font-bold ${bidder.isWinner ? 'text-kapwa-text-success' : 'text-kapwa-text-support'}`}
                          >
                            {bidder.name}
                          </p>
                          {bidder.pcabId && (
                            <p className='text-xs text-kapwa-text-disabled'>
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
                          <p className='font-mono text-xs text-kapwa-text-disabled'>
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
                <div className='grid grid-cols-1 gap-4 pt-4 border-t border-kapwa-border-weak sm:grid-cols-3'>
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
                    className='p-4 rounded-xl border border-kapwa-border-weak bg-kapwa-bg-surface-raised'
                  >
                    <div className='flex justify-between items-start mb-2'>
                      <h4 className='text-sm font-bold text-kapwa-text-strong'>
                        Component {idx + 1}
                      </h4>
                      <span className='border-kapwa-border-weak bg-kapwa-bg-surface text-kapwa-text-disabled rounded border px-1.5 py-0.5 font-mono text-[10px]'>
                        {comp.componentId}
                      </span>
                    </div>
                    <p className='mb-3 text-xs leading-relaxed text-kapwa-text-support'>
                      {comp.description}
                    </p>
                    <div className='grid grid-cols-2 gap-2 text-xs'>
                      <p>
                        <span className='text-kapwa-text-disabled'>Type:</span>{' '}
                        <span className='font-medium text-kapwa-text-strong'>
                          {comp.infraType}
                        </span>
                      </p>
                      <p>
                        <span className='text-kapwa-text-disabled'>Work:</span>{' '}
                        <span className='font-medium text-kapwa-text-strong'>
                          {comp.typeOfWork}
                        </span>
                      </p>
                      <p>
                        <span className='text-kapwa-text-disabled'>
                          Coords:
                        </span>{' '}
                        <span className='font-mono text-kapwa-text-support'>
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
              <div className='p-4 text-center rounded-xl border border-dashed border-kapwa-border-weak bg-kapwa-bg-surface-raised'>
                <p className='text-xs font-medium text-kapwa-text-disabled'>
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
                  <div className='border-kapwa-border-weak bg-kapwa-bg-surface-raised text-kapwa-text-disabled rounded border p-2 text-center font-mono text-[10px]'>
                    {project.latitude.toFixed(6)},{' '}
                    {project.longitude.toFixed(6)}
                  </div>
                  <a
                    href={`https://www.google.com/maps?q=${project.latitude},${project.longitude}`}
                    target='_blank'
                    rel='noopener noreferrer'
                    className='hover:border-kapwa-border-brand hover:text-kapwa-text-brand border-kapwa-border-weak bg-kapwa-bg-surface text-kapwa-text-support flex w-full items-center justify-center gap-2 rounded-xl border py-2.5 text-xs font-bold shadow-sm transition-all'
                  >
                    View on Google Maps <ExternalLink className='w-3 h-3' />
                  </a>
                </>
              ) : (
                <div className='p-4 text-center rounded-xl border border-dashed border-kapwa-border-weak bg-kapwa-bg-surface-raised'>
                  <MapPin className='mx-auto mb-2 w-6 h-6 text-kapwa-text-support' />
                  <p className='text-xs text-kapwa-text-disabled'>
                    No coordinates available
                  </p>
                </div>
              )}
            </div>
          </DetailSection>

          {/* Images */}
          {project.imageSummary && (
            <DetailSection title='Images' icon={ImageIcon}>
              <div className='flex justify-between items-center'>
                <span className='text-sm text-kapwa-text-support'>
                  Total Images
                </span>
                <span className='font-bold text-kapwa-text-strong'>
                  {project.imageSummary.totalImages}
                </span>
              </div>
              {project.imageSummary.latestImageDate && (
                <div className='flex justify-between items-center pt-2 mt-2 border-t border-kapwa-border-weak'>
                  <span className='text-xs text-kapwa-text-disabled'>
                    Latest
                  </span>
                  <span className='text-xs font-medium text-kapwa-text-support'>
                    {formatDate(project.imageSummary.latestImageDate)}
                  </span>
                </div>
              )}
            </DetailSection>
          )}

          {/* Live Stream */}
          {project.isLive && project.livestreamUrl && (
            <div className='p-5 rounded-2xl border-2 border-kapwa-border-danger bg-kapwa-bg-danger-weak'>
              <div className='flex gap-2 items-center mb-3 text-kapwa-text-danger'>
                <Video className='w-5 h-5 animate-pulse' />
                <span className='font-bold'>Live Feed</span>
              </div>
              <a
                href={project.livestreamUrl}
                target='_blank'
                rel='noreferrer'
                className='flex gap-2 justify-center items-center py-3 w-full font-bold rounded-xl shadow-lg transition-colors bg-kapwa-bg-danger-default text-kapwa-text-inverse hover:bg-kapwa-bg-danger-default'
              >
                Watch Stream <ExternalLink className='w-4 h-4' />
              </a>
            </div>
          )}

          {/* Bisto Link */}
          <div className='p-4 rounded-xl border border-kapwa-border-weak bg-kapwa-bg-surface-raised'>
            <p className='mb-3 text-xs leading-relaxed text-kapwa-text-disabled'>
              Verify status on national platform.
            </p>
            <a
              href={`https://bisto.ph/project/${encodeURIComponent(project.contractId)}`} //waiting for bisto.ph PR
              target='_blank'
              rel='noreferrer'
              className='hover:border-kapwa-border-brand hover:text-kapwa-text-brand border-kapwa-border-weak bg-kapwa-bg-surface text-kapwa-text-support flex w-full items-center justify-center gap-2 rounded-xl border py-2.5 text-xs font-bold shadow-sm transition-all'
            >
              Search on Bisto.ph <Search className='w-3 h-3' />
            </a>
          </div>
        </div>
      </div>

      <div className='pt-8 text-center'>
        <p className='text-xs text-kapwa-text-disabled'>
          Source:{' '}
          <a
            href='https://transparency.bettergov.ph/dpwh/'
            target='_blank'
            rel='noopener noreferrer'
            className='inline-flex gap-1 items-center font-bold transition-colors text-kapwa-text-brand hover:text-kapwa-text-brand-bold hover:underline'
          >
            DPWH Infrastructure Transparency Interface via BetterGov.ph
            <ExternalLink className='w-3 h-3' />
          </a>
        </p>
      </div>
    </div>
  );
}
