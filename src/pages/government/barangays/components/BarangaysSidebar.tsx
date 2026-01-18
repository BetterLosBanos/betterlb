// Changed icon for variety
import { useNavigate, useParams } from 'react-router-dom';

import { MapPinIcon } from 'lucide-react';

import {
  SidebarContainer,
  SidebarItem,
} from '@/components/navigation/SidebarNavigation';

import { formatGovName } from '@/lib/stringUtils';

import barangaysData from '@/data/directory/barangays.json';

export default function BarangaysSidebar() {
  const { barangay: activeSlug } = useParams(); // URL param: /barangays/:barangay
  const navigate = useNavigate();

  return (
    <SidebarContainer title='Barangays'>
      {barangaysData
        .sort((a, b) => a.barangay_name.localeCompare(b.barangay_name))
        .map(brgy => (
          <SidebarItem
            key={brgy.slug}
            label={formatGovName(brgy.barangay_name, 'barangay')}
            icon={MapPinIcon}
            isActive={activeSlug === brgy.slug}
            onClick={() =>
              navigate(`/government/barangays/${brgy.slug}`, {
                state: { scrollToContent: true },
              })
            }
          />
        ))}
    </SidebarContainer>
  );
}
