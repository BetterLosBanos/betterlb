import { LayoutGrid, Landmark, Scale, Scroll, Signature, Users } from 'lucide-react';
import { SidebarContainer, SidebarGroup, SidebarItem } from '@/components/navigation/SidebarNavigation';

// Define strict type for the filter
type FilterType = 'all' | 'ordinance' | 'resolution' | 'executive_order';

interface OpenLGUSidebarProps {
  filterType: string;
  setFilterType: (type: FilterType) => void;
  terms: Array<{ id: string; ordinal: string; name: string; year_range: string; term_number: number }>;
  persons: Array<{ id: string }>;
}

export default function OpenLGUSidebar({
  filterType,
  setFilterType,
  terms,
  persons,
}: OpenLGUSidebarProps) {
  const categories = [
    { id: 'all', label: 'All Documents', icon: LayoutGrid },
    { id: 'ordinance', label: 'Ordinances', icon: Scale },
    { id: 'resolution', label: 'Resolutions', icon: Scroll },
    { id: 'executive_order', label: 'Executive Orders', icon: Signature },
  ];

  return (
    <SidebarContainer title='OpenLGU Portal'>
      {/* Group 1: Browse */}
      <SidebarGroup title='Browse'>
        <SidebarItem
          label='Legislative Terms'
          description={`${terms.length} terms`}
          path='/openlgu/terms'
          icon={Landmark}
        />
        <SidebarItem
          label='Officials'
          description={`${persons.length} officials`}
          path='/openlgu/officials'
          icon={Users}
        />
      </SidebarGroup>

      {/* Group 2: Document Types */}
      <SidebarGroup title='Document Types'>
        {categories.map(cat => (
          <SidebarItem
            key={cat.id}
            label={cat.label}
            icon={cat.icon}
            isActive={filterType === cat.id}
            onClick={() => setFilterType(cat.id as FilterType)}
          />
        ))}
      </SidebarGroup>
    </SidebarContainer>
  );
}
