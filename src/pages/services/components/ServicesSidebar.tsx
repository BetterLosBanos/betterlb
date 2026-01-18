import { Link } from 'react-router-dom';

import {
  BookOpen,
  Briefcase,
  DollarSign,
  FileText,
  Hammer,
  Heart,
  Leaf,
  LucideIcon,
  PlusCircle,
  Shield,
  Users,
} from 'lucide-react';

import {
  SidebarContainer,
  SidebarItem,
} from '@/components/navigation/SidebarNavigation';

import { scrollToTop } from '@/lib/scrollUtils';

import serviceCategories from '@/data/service_categories.json';

const categoryIcons: Record<string, LucideIcon> = {
  'certificates-vital-records': FileText,
  'business-licensing': Briefcase,
  'taxation-assessment': DollarSign,
  'infrastructure-engineering': Hammer,
  'social-services': Users,
  'health-wellness': Heart,
  'agriculture-livelihood': Leaf,
  'environment-waste': Leaf,
  'education-scholarship': BookOpen,
  'public-safety': Shield,
};

interface ServicesSidebarProps {
  selectedCategorySlug: string;
  handleCategoryChange: (slug: string) => void;
  sidebarOpen?: boolean; // Keep for mobile logic
}

export default function ServicesSidebar({
  selectedCategorySlug,
  handleCategoryChange,
  sidebarOpen,
}: ServicesSidebarProps) {
  return (
    // We wrap the container in a div that handles the mobile "sidebarOpen" toggle
    <div
      className={`${sidebarOpen ? 'block' : 'hidden'} mb-6 w-full md:mb-0 md:block`}
    >
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
            icon={categoryIcons[category.slug] || FileText}
            isActive={selectedCategorySlug === category.slug}
            onClick={() => {
              scrollToTop();
              handleCategoryChange(category.slug);
            }}
          />
        ))}
      </SidebarContainer>
      <div className='border-secondary-100 bg-secondary-50/30 mt-8 space-y-4 rounded-2xl border-2 p-5 shadow-sm'>
        <div className='flex items-center gap-3'>
          <div className='bg-secondary-100 text-secondary-600 rounded-lg p-2'>
            <PlusCircle className='h-5 w-5' />
          </div>
          <h4 className='text-sm leading-tight font-bold text-slate-900'>
            Missing a service?
          </h4>
        </div>

        <p className='text-xs leading-relaxed text-slate-600'>
          Better LB is community-maintained. Help your fellow citizens by
          suggesting a new service directory.
        </p>

        <Link
          to='/contribute'
          onClick={() => console.log('Link was clicked!')}
          className='bg-secondary-600 hover:bg-secondary-700 shadow-secondary-900/10 flex min-h-[44px] w-full items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-xs font-bold text-white shadow-md transition-all'
        >
          Suggest New Service
        </Link>
      </div>
    </div>
  );
}
