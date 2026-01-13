import { Scale, Scroll, Signature, LayoutGrid } from 'lucide-react';
import {
  SidebarContainer,
  SidebarItem,
} from '@/components/ui/SidebarNavigation';

interface LegislationSidebarProps {
  filterType: string;
  setFilterType: (type: Person | DocumentItem | Session) => void;
}

export default function LegislationSidebar({
  filterType,
  setFilterType,
}: LegislationSidebarProps) {
  const categories = [
    { id: 'all', label: 'All Documents', icon: LayoutGrid },
    { id: 'ordinance', label: 'Ordinances', icon: Scale },
    { id: 'resolution', label: 'Resolutions', icon: Scroll },
    { id: 'executive_order', label: 'Executive Orders', icon: Signature },
  ];

  return (
    <SidebarContainer title='Document Types'>
      {categories.map(cat => (
        <SidebarItem
          key={cat.id}
          label={cat.label}
          icon={cat.icon}
          isActive={filterType === cat.id}
          onClick={() => setFilterType(cat.id)}
        />
      ))}
    </SidebarContainer>
  );
}
