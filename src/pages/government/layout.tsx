import React from 'react'
import { Outlet, Link, useLocation } from 'react-router-dom'
import {
  Building2,
  Landmark,
  GalleryVertical,
  Globe,
  BookOpen,
  MapPin,
} from 'lucide-react'

interface GovernmentLayoutProps {
  title: string
  description?: string
  children?: React.ReactNode
}

interface BranchCardProps {
  title: string
  description: string
  icon: React.ReactNode
  path: string
  color: string
}

const BranchCard: React.FC<BranchCardProps> = ({
  title,
  description,
  icon,
  path,
  color,
}) => (
  <Link
    to={path}
    className={`flex flex-col h-full bg-white border rounded-lg shadow-sm hover:shadow-md transition-shadow overflow-hidden`}
  >
    <div className={`p-4 ${color} text-white flex items-center`}>
      <div className="mr-3">{icon}</div>
      <h3 className="text-lg font-semibold">{title}</h3>
    </div>
    <div className="p-4 flex-grow">
      <p className="text-gray-600 text-sm">{description}</p>
    </div>
  </Link>
)

export default function GovernmentLayout({ children }: GovernmentLayoutProps) {
  // Get current path to highlight active tab
  const location = useLocation()
  const currentPath = location.pathname

  // Define branch data
  const branches = [
    {
      title: 'Executive Branch',
      description:
        'The President, Vice President, and the Cabinet members who implement and enforce laws.',
      icon: <Landmark className="h-4 w-4" />,
      path: '/government/executive',
      color: 'bg-blue-600',
      hoverColor: 'hover:bg-blue-700',
      textColor: 'text-blue-600',
    },
    {
      title: 'Executive Departments',
      description:
        'Government departments and agencies responsible for specific areas of governance.',
      icon: <Building2 className="h-4 w-4" />,
      path: '/government/departments',
      color: 'bg-green-600',
      hoverColor: 'hover:bg-green-700',
      textColor: 'text-green-600',
    },
    {
      title: 'Constitutional Bodies',
      description:
        'Independent bodies created by the Constitution with specific mandates.',
      icon: <BookOpen className="h-4 w-4" />,
      path: '/government/constitutional',
      color: 'bg-purple-600',
      hoverColor: 'hover:bg-purple-700',
      textColor: 'text-purple-600',
    },
    {
      title: 'Legislative Branch',
      description:
        'The Senate and House of Representatives that make laws and policies.',
      icon: <GalleryVertical className="h-4 w-4" />,
      path: '/government/legislative',
      color: 'bg-amber-600',
      hoverColor: 'hover:bg-amber-700',
      textColor: 'text-amber-600',
    },
    {
      title: 'Local Government Units',
      description: 'Local government units of the Philippines.',
      icon: <MapPin className="h-4 w-4" />,
      path: '/government/local',
      color: 'bg-pink-600',
      hoverColor: 'hover:bg-pink-700',
      textColor: 'text-pink-600',
    },
    {
      title: 'Diplomatic Missions',
      description:
        'Philippine embassies, consulates, and diplomatic missions around the world.',
      icon: <Globe className="h-4 w-4" />,
      path: '/government/diplomatic',
      color: 'bg-red-600',
      hoverColor: 'hover:bg-red-700',
      textColor: 'text-red-600',
    },
  ]

  // Check if we're on the main government page
  const isMainPage =
    currentPath === '/government' || currentPath === '/government/'

  return (
    <div className="container mx-auto">
      <div className="px-8 py-12 text-center flex flex-col justify-center">
        <h2 className="text-4xl font-bold text-gray-800 mb-4">
          The Philippine Government Directory
        </h2>
        <p className="text-gray-600">
          Explore the different branches and agencies of the Philippine
          government
        </p>
      </div>

      {/* Card Tabs Navigation */}
      <div className="mb-12 overflow-x-auto flex justify-center">
        <div className="grid grid-cols-3 gap-2">
          {branches.map((branch) => {
            const isActive = currentPath.includes(branch.path)
            return (
              <Link
                key={branch.path}
                to={branch.path}
                className={`flex flex-col px-4 py-4 xrounded-md transition-all rounded-md shadow-sm ${
                  isActive
                    ? `${branch.color} text-white`
                    : `bg-white border ${branch.textColor} ${branch.hoverColor} hover:text-white`
                }`}
              >
                <div className="flex items-center gap-1 mb-1">
                  <div className="mr-2 text-xs">{branch.icon}</div>
                  <span className="font-medium text-sm">{branch.title}</span>
                </div>
                <div className="text-xs text-gray-800">
                  {branch.description}
                </div>
              </Link>
            )
          })}
        </div>
      </div>

      {/* Main Content */}
      <div className="">
        {isMainPage ? (
          <div className="space-y-6">
            <div>
              <h1 className="text-2xl font-bold mb-2">Philippine Government</h1>
              <p className="text-gray-600">
                Explore the different branches and agencies of the Philippine
                government
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {branches.map((branch) => (
                <BranchCard
                  key={branch.path}
                  title={branch.title}
                  description={branch.description}
                  icon={branch.icon}
                  path={branch.path}
                  color={branch.color}
                />
              ))}
            </div>
          </div>
        ) : (
          children || <Outlet />
        )}
      </div>
    </div>
  )
}
