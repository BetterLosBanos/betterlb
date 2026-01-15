import { ExternalLink, HardHat, AlertCircle } from 'lucide-react';
import { ModuleHeader, DetailSection } from '@/components/layout/PageLayouts';
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
  BreadcrumbHome,
} from '@/components/ui/Breadcrumb';
import { SeamlessIframe } from '@/components/ui/SeamlessIframe';

export default function InfrastructurePage() {
  const bistoUrl =
    'https://bisto.ph/projects?search=los+ba%C3%B1os&region=Region+IV-A&province=LAGUNA';

  return (
    <div className='pb-20 mx-auto space-y-6 max-w-7xl duration-500 animate-in fade-in'>
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbHome href='/' />
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbLink href='/transparency'>Transparency</BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage>DPWH Projects</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      <ModuleHeader
        title='Infrastructure Projects'
        description='Monitoring the progress and budget of local engineering and DPWH projects in Los Baños.'
      >
        <a
          href={bistoUrl}
          target='_blank'
          rel='noopener noreferrer'
          className='inline-flex items-center gap-2 px-6 py-3 font-bold text-white transition-all bg-secondary-600 rounded-xl shadow-lg hover:bg-secondary-700 min-h-[48px]'
        >
          View on Bisto.ph <ExternalLink className='w-4 h-4' />
        </a>
      </ModuleHeader>

      <DetailSection
        title='Project Tracking'
        icon={HardHat}
        className='border-l-4 border-l-secondary-600'
      >
        <div className='space-y-6'>
          <div className='flex gap-3 items-start p-4 text-orange-800 bg-orange-50 rounded-xl border border-orange-100'>
            <AlertCircle className='w-5 h-5 shrink-0 mt-0.5' />
            <p className='text-sm font-medium leading-relaxed'>
              Interactive monitoring of ongoing local and national projects in
              the municipality.
            </p>
          </div>

          <SeamlessIframe
            src={bistoUrl}
            title='Bisto.ph Infrastructure Map'
            height='800px'
          />
        </div>
      </DetailSection>
    </div>
  );
}
