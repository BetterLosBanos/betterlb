import { CreditCard, Hammer, Truck } from 'lucide-react';
import {
  SidebarContainer,
  SidebarItem,
} from '@/components/ui/SidebarNavigation';

const sections = [
  { name: 'Budget & Finances', slug: 'financial', icon: CreditCard },
  {
    name: 'Infrastructure Projects',
    slug: 'infrastructure-projects',
    icon: Hammer,
  },
  { name: 'DPWH Projects', slug: 'dpwh-projects', icon: Truck },
];

export default function TransparencySidebar() {
  return (
    <SidebarContainer title='Transparency'>
      {sections.map(section => (
        <SidebarItem
          key={section.slug}
          label={section.name}
          icon={section.icon}
          path={`/transparency/${section.slug}`}
        />
      ))}
    </SidebarContainer>
  );
}
