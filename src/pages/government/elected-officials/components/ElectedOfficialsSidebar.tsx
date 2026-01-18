import { BookOpenIcon, BuildingIcon, UsersIcon } from 'lucide-react';

import {
  SidebarContainer,
  SidebarGroup,
  SidebarItem,
} from '@/components/navigation/SidebarNavigation';

export default function ElectedOfficialsSidebar() {
  const groups = [
    {
      title: 'Executive',
      items: [
        {
          label: 'Leadership & Management',
          icon: BuildingIcon,
          path: '/government/elected-officials/executive-branch',
        },
      ],
    },
    {
      title: 'Legislative',
      items: [
        {
          label: 'Municipal Council',
          icon: UsersIcon,
          path: '/government/elected-officials/12th-sangguniang-bayan',
        },
        {
          label: 'Standing Committees',
          icon: BookOpenIcon,
          path: '/government/elected-officials/municipal-committees',
        },
      ],
    },
  ];

  return (
    <SidebarContainer title='Elected Officials'>
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
