import { ExternalLink, ShoppingBag, Info } from 'lucide-react';
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

export default function ProcurementPage() {
  const procurementUrl =
    'https://transparency.bettergov.ph/organizations/MUNICIPALITY%20OF%20LOS%20BA%C3%91OS%2C%20LAGUNA';

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
          className='inline-flex items-center gap-2 px-6 py-3 font-bold text-white transition-all bg-primary-600 rounded-xl shadow-lg hover:bg-primary-700 min-h-[48px]'
        >
          View on BetterGov.ph <ExternalLink className='w-4 h-4' />
        </a>
      </ModuleHeader>

      <DetailSection title='PhilGEPS Data Mirror' icon={ShoppingBag}>
        <div className='space-y-6'>
          <div className='flex gap-3 items-start p-4 bg-blue-50 rounded-xl border border-blue-100 text-primary-800'>
            <Info className='w-5 h-5 shrink-0 mt-0.5' />
            <p className='text-sm font-medium leading-relaxed'>
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
