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
    </div>
  );
}
