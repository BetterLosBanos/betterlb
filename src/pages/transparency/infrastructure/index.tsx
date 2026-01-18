import { AlertCircle, ExternalLink, HardHat } from 'lucide-react';

import { SeamlessIframe } from '@/components/data-display/SeamlessIframe';
import { DetailSection, ModuleHeader } from '@/components/layout/PageLayouts';
import {
  Breadcrumb,
  BreadcrumbHome,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/navigation/Breadcrumb';

export default function InfrastructurePage() {
  const bistoUrl =
    'https://bisto.ph/projects?search=los+ba%C3%B1os&region=Region+IV-A&province=LAGUNA';

  return (
    <div className='animate-in fade-in mx-auto max-w-7xl space-y-6 pb-20 duration-500'>
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
          className='bg-secondary-600 hover:bg-secondary-700 inline-flex min-h-[48px] items-center gap-2 rounded-xl px-6 py-3 font-bold text-white shadow-lg transition-all'
        >
          View on Bisto.ph <ExternalLink className='h-4 w-4' />
        </a>
      </ModuleHeader>

      <DetailSection
        title='Project Tracking'
        icon={HardHat}
        className='border-l-secondary-600 border-l-4'
      >
        <div className='space-y-6'>
          <div className='flex items-start gap-3 rounded-xl border border-orange-100 bg-orange-50 p-4 text-orange-800'>
            <AlertCircle className='mt-0.5 h-5 w-5 shrink-0' />
            <p className='text-sm leading-relaxed font-medium'>
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
