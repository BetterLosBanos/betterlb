import { ReactNode } from 'react';

import { Link, Outlet, useLocation } from 'react-router-dom';

import {
  Building2Icon,
  GalleryVerticalIcon,
  LandmarkIcon,
  // GlobeIcon,
  // BookOpenIcon,
  MapPinIcon,
} from 'lucide-react';

import { cn } from '../../lib/utils';

interface GovernmentLayoutProps {
  title: string;
  description?: string;
  children?: ReactNode;
}

export default function GovernmentLayout({ children }: GovernmentLayoutProps) {
  // Get current path to highlight active tab
  const location = useLocation();
  const currentPath = location.pathname;

  // Define branch data
  const branches = [
    {
      title: 'Executive Branch',
      description:
        'The President, Vice Mayor, and the Cabinet members who implement and enforce laws.',
      icon: <LandmarkIcon className='h-4 w-4' />,
      path: '/government/executive',
    },
    {
      title: 'Municipal Departments',
      description:
        'Government departments and agencies responsible for specific areas of governance.',
      icon: <Building2Icon className='h-4 w-4' />,
      path: '/government/departments',
    },
    {
      title: 'Barangays of Los Baños',
      description:
        'The local barangays of Los Baños and their elected officials responsible for community governance and services.',
      icon: <MapPinIcon className='h-4 w-4' />,
      path: '/government/barangays',
    },
    // {
    //   title: 'Constitutional Bodies',
    //   description:
    //     'Independent bodies created by the Constitution with specific mandates.',
    //   icon: <BookOpenIcon className='h-4 w-4' />,
    //   path: '/government/constitutional',
    // },
    {
      title: 'Legislative Branch',
      description:
        'The Senate and House of Representatives that make laws and policies.',
      icon: <GalleryVerticalIcon className='h-4 w-4' />,
      path: '/government/legislative',
    },
    // {
    //   title: 'Local Government Units',
    //   description: 'Local government units of the Philippines.',
    //   icon: <MapPinIcon className='h-4 w-4' />,
    //   path: '/government/local',
    // },
    // {
    //   title: 'Diplomatic Missions',
    //   description:
    //     'Philippine embassies, consulates, and diplomatic missions around the world.',
    //   icon: <GlobeIcon className='h-4 w-4' />,
    //   path: '/government/diplomatic',
    // },
  ];

  // Check if we're on the main government page
  const isMainPage =
    currentPath === '/government' || currentPath === '/government/';

  return (
    <div className='container mx-auto px-4 md:px-0'>
      <div className='flex flex-col justify-center py-8 text-center md:py-12'>
        <h2 className='mb-4 text-3xl font-bold text-gray-800 md:text-4xl'>
          The Philippine Government Directory
        </h2>
        <p className='text-sm text-gray-800 md:text-base'>
          Explore the different branches and agencies of the Philippine
          government
        </p>
      </div>

      {/* Card Tabs Navigation */}
      <div className='mb-8 overflow-x-auto md:mb-12'>
        <div className='inline-grid min-w-full grid-cols-1 gap-3 px-4 py-2 md:min-w-0 md:grid-cols-2 lg:grid-cols-3'>
          {branches.map(branch => {
            const isActive = currentPath.includes(branch.path);
            return (
              <Link
                key={branch.path}
                to={branch.path}
                className={cn(
                  'group flex flex-col rounded-md p-3 shadow-sm ring-1 ring-neutral-300 md:p-4',
                  'hover:bg-primary-500/95',
                  isActive && 'bg-primary-500 text-neutral-50'
                )}
                state={{ scrollToContent: true }}
              >
                <div className='mb-1 flex items-center gap-1 group-hover:text-neutral-200'>
                  <div className='mr-2 text-xs md:text-sm'>{branch.icon}</div>
                  {branch.title}
                </div>
                <div
                  className={cn(
                    'text-xs text-neutral-500 group-hover:text-neutral-200 md:text-sm',
                    isActive && 'text-neutral-200'
                  )}
                >
                  {branch.description}
                </div>
              </Link>
            );
          })}
        </div>
      </div>

      {!isMainPage && (
        <div className='px-4 pb-12 md:px-0'>{children || <Outlet />}</div>
      )}
    </div>
  );
}
