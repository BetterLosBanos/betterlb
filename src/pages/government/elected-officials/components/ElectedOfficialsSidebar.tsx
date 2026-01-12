import {
  BookOpenIcon,
  BuildingIcon,
  UserCheckIcon,
  UsersIcon, // Added for Sangguniang Bayan
} from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import StandardSidebar from '@/components/ui/StandardSidebar';

export default function ElectedOfficialsSidebar() {
  const location = useLocation();

  const isActive = (path: string) => {
    return location.pathname === path;
  };

  const menuGroups = [
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
          label: 'Committees',
          icon: BookOpenIcon,
          path: '/government/elected-officials/municipal-committees',
        },
      ],
    },
  ];

  return (
    <StandardSidebar>
      <nav className='p-2 space-y-6 pt-4'>
        {menuGroups.map(group => (
          <div key={group.title}>
            <h3 className='px-3 text-xs font-medium text-gray-800 uppercase tracking-wider mb-2'>
              {group.title}
            </h3>
            <ul className='space-y-1'>
              {group.items.map(({ label, icon: Icon, path }) => (
                <li key={path}>
                  <Link
                    to={path}
                    title={label}
                    state={{ scrollToContent: true }}
                    className={`flex items-center px-3 py-2 text-sm rounded-md transition-colors ${
                      isActive(path)
                        ? 'bg-primary-50 text-primary-700 font-medium'
                        : 'text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    <Icon className='h-4 w-4 mr-2 text-gray-400 flex-shrink-0' />
                    <span>{label}</span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </nav>
    </StandardSidebar>
  );
}
