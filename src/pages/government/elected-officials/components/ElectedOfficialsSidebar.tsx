import { BookOpenIcon, BuildingIcon } from 'lucide-react';

import {
  SidebarContainer,
  SidebarGroup,
  SidebarItem,
} from '@/components/navigation/SidebarNavigation';

export default function ElectedOfficialsSidebar() {
  const groups = [
    {
      title: 'Officials',
      items: [
        {
          label: 'Elected Officials',
          icon: BuildingIcon,
          path: '/government/elected-officials',
        },
      ],
    },
    {
      title: 'Legislative',
      items: [
        {
          label: 'Standing Committees',
          icon: BookOpenIcon,
          path: '/government/elected-officials/committees',
        },
      ],
    },
  ];

  return (
    <SidebarContainer title='Municipal Government'>
      {groups.map(group => (
        <SidebarGroup key={group.title} title={group.title}>
          {group.items.map(item => (
            <SidebarItem key={item.path} {...item} />
          ))}
        </SidebarGroup>
      ))}
    </SidebarContainer>
  );
}
