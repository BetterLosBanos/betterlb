import { ExternalLink, Info, ShoppingBag } from 'lucide-react';

import { DetailSection, ModuleHeader } from '@/components/layout/PageLayouts';
import {
  Breadcrumb,
  BreadcrumbHome,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/Breadcrumb';
import { SeamlessIframe } from '@/components/ui/SeamlessIframe';

export default function ProcurementPage() {
  const procurementUrl =
    'https://transparency.bettergov.ph/organizations/MUNICIPALITY%20OF%20LOS%20BA%C3%91OS%2C%20LAGUNA';

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
            <BreadcrumbPage>Procurement</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      <ModuleHeader
        title='Local Procurement & Contracts'
        description='Public records of municipal bidding, awards, and procurement contracts via PhilGEPS.'
      >
        <a
          href={procurementUrl}
          target='_blank'
          rel='noopener noreferrer'
          className='bg-primary-600 hover:bg-primary-700 inline-flex min-h-[48px] items-center gap-2 rounded-xl px-6 py-3 font-bold text-white shadow-lg transition-all'
        >
          View on BetterGov.ph <ExternalLink className='h-4 w-4' />
        </a>
      </ModuleHeader>

      <DetailSection title='PhilGEPS Data Mirror' icon={ShoppingBag}>
        <div className='space-y-6'>
          <div className='text-primary-800 flex items-start gap-3 rounded-xl border border-blue-100 bg-blue-50 p-4'>
            <Info className='mt-0.5 h-5 w-5 shrink-0' />
            <p className='text-sm leading-relaxed font-medium'>
              The dashboard below provides a live view of municipal bidding and
              awards.
            </p>
          </div>

          <SeamlessIframe
            src={procurementUrl}
            title='Official Procurement Registry'
            height='800px'
          />
        </div>
      </DetailSection>
    </div>
  );
}
