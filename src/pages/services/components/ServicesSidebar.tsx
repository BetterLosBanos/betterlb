import { Link } from 'react-router-dom';

import { FileText, PlusCircle } from 'lucide-react';

import {
  SidebarContainer,
  SidebarItem,
} from '@/components/navigation/SidebarNavigation';

import { scrollToTop } from '@/lib/scrollUtils';
import { getCategoryIconBySlug } from '@/lib/serviceIcons';

import serviceCategories from '@/data/service_categories.json';

interface ServicesSidebarProps {
  selectedCategorySlug: string;
  handleCategoryChange: (slug: string) => void;
}

export default function ServicesSidebar({
  selectedCategorySlug,
  handleCategoryChange,
}: ServicesSidebarProps) {
  return (
    <div className='space-y-6'>
      <SidebarContainer title='Categories'>
        {/* Special "All Services" item */}
        <SidebarItem
          label='All Services'
          icon={FileText}
          isActive={selectedCategorySlug === 'all'}
          onClick={() => {
            scrollToTop();
            handleCategoryChange('all');
          }}
        />

        {/* Dynamic Categories */}
        {serviceCategories.categories.map(category => (
          <SidebarItem
            key={category.slug}
            label={category.name}
            icon={getCategoryIconBySlug(category.slug)}
            isActive={selectedCategorySlug === category.slug}
            onClick={() => {
              scrollToTop();
              handleCategoryChange(category.slug);
            }}
          />
        ))}
      </SidebarContainer>
      <div className='p-5 mt-8 space-y-4 rounded-2xl border-2 shadow-sm border-kapwa-orange-100 bg-kapwa-bg-accent-orange-weak/30'>
        <div className='flex gap-3 items-center'>
          <div className='p-2 rounded-lg bg-kapwa-bg-accent-orange-weak text-kapwa-text-accent-orange'>
            <PlusCircle className='w-5 h-5' />
          </div>
          <h4 className='text-sm font-bold leading-tight text-kapwa-text-strong'>
            Missing a service?
          </h4>
        </div>

        <p className='text-xs leading-relaxed text-kapwa-text-on-disabled'>
          Better LB is community-maintained. Help your fellow citizens by
          suggesting a new service directory.
        </p>

        <Link
          to='/contribute'
          onClick={() => console.log('Link was clicked!')}
          className='bg-kapwa-bg-accent-orange-default hover:bg-kapwa-orange-700 shadow-md text-kapwa-text-inverse flex min-h-[44px] w-full items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-xs font-bold transition-all'
        >
          Suggest New Service
        </Link>
      </div>
    </div>
  );
}
