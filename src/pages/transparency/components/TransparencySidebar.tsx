import { CreditCard, Hammer, Truck } from 'lucide-react';
import {
  SidebarContainer,
  SidebarItem,
} from '@/components/ui/SidebarNavigation';

const sections = [
  {
    name: 'Budget & Finances',
    slug: 'transparency/financial',
    icon: CreditCard,
  },
  {
    name: 'Procurement',
    slug: 'https://transparency.bettergov.ph/organizations/MUNICIPALITY%20OF%20LOS%20BA%C3%91OS%2C%20LAGUNA',
    icon: Hammer,
  },
  {
    name: 'DPWH Projects',
    slug: 'https://bisto.ph/?search=los+ba%C3%B1os&region=Region+IV-A&province=LAGUNA',
    icon: Truck,
  },
];

export default function TransparencySidebar() {
  return (
    <SidebarContainer title='Transparency'>
      {sections.map(section => (
        <SidebarItem
          key={section.slug}
          label={section.name}
          icon={section.icon}
          path={`${section.slug}`}
        />
      ))}
    </SidebarContainer>
  );
}
