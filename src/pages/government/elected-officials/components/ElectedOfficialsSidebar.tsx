import {
  BuildingIcon,
  UserCheckIcon,
  UsersIcon,
  BookOpenIcon,
} from 'lucide-react';
import {
  SidebarContainer,
  SidebarGroup,
  SidebarItem,
} from '@/components/ui/SidebarNavigation';

export default function ElectedOfficialsSidebar() {
  const groups = [
    {
      title: 'Executive',
      items: [
        {
          label: 'Office of the Mayor',
          icon: BuildingIcon,
          path: '/government/elected-officials/office-of-the-mayor',
        },
        {
          label: 'Office of the Vice Mayor',
          icon: UserCheckIcon,
          path: '/government/elected-officials/office-of-the-vice-mayor',
        },
      ],
    },
    {
      title: 'Legislative',
      items: [
        {
          label: '12th Sangguniang Bayan',
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
