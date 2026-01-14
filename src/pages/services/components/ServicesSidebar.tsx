import {
  FileText,
  Briefcase,
  DollarSign,
  Hammer,
  Users,
  Heart,
  Leaf,
  BookOpen,
  Shield,
  LucideIcon,
  Link,
  PlusCircle,
} from 'lucide-react';
import {
  SidebarContainer,
  SidebarItem,
} from '@/components/ui/SidebarNavigation';
import serviceCategories from '@/data/service_categories.json';
import { scrollToTop } from '@/lib/scrollUtils';

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
      className={`${sidebarOpen ? 'block' : 'hidden'} md:block w-full mb-6 md:mb-0`}
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
      <div className='p-5 mt-8 space-y-4 rounded-2xl border-2 shadow-sm border-secondary-100 bg-secondary-50/30'>
        <div className='flex gap-3 items-center'>
          <div className='p-2 rounded-lg bg-secondary-100 text-secondary-600'>
            <PlusCircle className='w-5 h-5' />
          </div>
          <h4 className='text-sm font-bold leading-tight text-slate-900'>
            Missing a service?
          </h4>
        </div>

        <p className='text-xs leading-relaxed text-slate-600'>
          Better LB is community-maintained. Help your fellow citizens by
          suggesting a new service directory.
        </p>

        <Link
          to='contribute'
          onClick={() => console.log('Link was clicked!')}
          className='flex items-center justify-center w-full gap-2 px-4 py-2.5 text-xs font-bold transition-all bg-secondary-600 text-white rounded-xl hover:bg-secondary-700 shadow-md shadow-secondary-900/10 min-h-[44px]'
        >
          Suggest New Service
        </Link>
      </div>
    </div>
  );
}
