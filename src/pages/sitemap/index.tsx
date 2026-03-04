import { FC, ReactNode } from 'react';

import { Link } from 'react-router-dom';

import {
  Briefcase,
  Building2,
  ChevronRight,
  FileCheck,
  FileText,
  Globe,
  Home,
  Waves,
} from 'lucide-react';

import { SEO } from '@/components/layout/SEO';

interface SitemapSection {
  title: string;
  icon: ReactNode;
  links: {
    title: string;
    url: string;
    description?: string;
  }[];
}

const SitemapPage: FC = () => {
  const sitemapSections: SitemapSection[] = [
    {
      title: 'Main Pages',
      icon: <Home className='w-5 h-5' />,
      links: [
        { title: 'Home', url: '/', description: 'Main landing page' },
        { title: 'About', url: '/about', description: 'About BetterGov.ph' },
        {
          title: 'Accessibility',
          url: '/accessibility',
          description: 'Accessibility statement and features',
        },
        {
          title: 'Search',
          url: '/search',
          description: 'Search the entire site',
        },
      ],
    },
    {
      title: 'Philippines',
      icon: <Globe className='w-5 h-5' />,
      links: [
        {
          title: 'About the Philippines',
          url: '/philippines/about',
          description: 'General information about the Philippines',
        },
        {
          title: 'History',
          url: '/philippines/history',
          description: 'Historical timeline of the Philippines',
        },
        {
          title: 'Culture',
          url: '/philippines/culture',
          description: 'Cultural heritage and traditions',
        },
        {
          title: 'Regions',
          url: '/philippines/regions',
          description: 'Administrative regions of the Philippines',
        },
        {
          title: 'Map',
          url: '/philippines/map',
          description: 'Interactive map of the Philippines',
        },
        {
          title: 'Public Holidays',
          url: '/philippines/holidays',
          description: 'Official holidays in the Philippines',
        },
        {
          title: 'Hotlines',
          url: 'https://hotlines.bettergov.ph/?city=los%20baños&province=laguna',
          description: 'Emergency and important contact numbers',
        },
      ],
    },
    {
      title: 'Government',
      icon: <Building2 className='w-5 h-5' />,
      links: [
        {
          title: 'Executive Branch',
          url: '/government/executive',
          description: 'Office of the President and executive offices',
        },
        {
          title: 'Office of the Mayor',
          url: '/government/executive/office-of-the-mayor',
          description: 'Information about the Office of the President',
        },
        {
          title: 'Office of the Vice Mayor',
          url: '/government/executive/office-of-the-vice-mayor',
          description: 'Information about the Office of the Vice Mayor',
        },
        {
          title: 'Presidential Communications Office',
          url: '/government/executive/presidential-communications-office',
          description:
            'Information about the Presidential Communications Office',
        },
        {
          title: 'Other Executive Offices',
          url: '/government/executive/other-executive-offices',
          description: 'Other offices under the Executive branch',
        },
        {
          title: 'Departments',
          url: '/government/departments',
          description: 'Government departments and agencies',
        },
        {
          title: 'Constitutional Bodies',
          url: '/government/constitutional',
          description: 'Constitutional commissions and offices',
        },
        {
          title: 'GOCCs',
          url: '/government/constitutional/goccs',
          description: 'Government-Owned and Controlled Corporations',
        },
        {
          title: 'SUCs',
          url: '/government/constitutional/sucs',
          description: 'State Universities and Colleges',
        },
        {
          title: 'Legislative Branch',
          url: '/government/legislative',
          description: 'Senate and House of Representatives',
        },
        {
          title: 'Municipal Council Committees',
          url: '/government/legislative/municipal-committees',
          description: 'Committees in the Municipal Council',
        },
        {
          title: 'House Members',
          url: '/government/legislative/house-members',
          description: 'Members of the House of Representatives',
        },
        {
          title: 'Diplomatic Missions',
          url: '/government/diplomatic/missions',
          description: 'Philippine diplomatic missions abroad',
        },
        {
          title: 'Consulates',
          url: '/government/diplomatic/consulates',
          description: 'Philippine consulates',
        },
        {
          title: 'International Organizations',
          url: '/government/diplomatic/organizations',
          description: 'International organizations in the Philippines',
        },
        {
          title: 'Local Government',
          url: '/government/local',
          description: 'Local government units by region',
        },
      ],
    },
    {
      title: 'Services',
      icon: <FileText className='w-5 h-5' />,
      links: [
        {
          title: 'All Services',
          url: '/services',
          description: 'Browse all government services',
        },
        {
          title: 'Government Websites Directory',
          url: '/services/websites',
          description: 'Directory of official government websites',
        },
        {
          title: 'Business & Trade',
          url: '/services?category=business-trade',
          description: 'Business registration, permits, and trade services',
        },
        {
          title: 'Certificates & IDs',
          url: '/services?category=certificates-ids',
          description: 'Birth certificates, IDs, and other documents',
        },
        {
          title: 'Contributions',
          url: '/services?category=contributions',
          description: 'SSS, PhilHealth, and other contribution services',
        },
        {
          title: 'Disaster & Weather',
          url: '/services?category=disaster-weather',
          description: 'Disaster preparedness and weather information',
        },
        {
          title: 'Education',
          url: '/services?category=education',
          description: 'Educational services and scholarships',
        },
        {
          title: 'Employment',
          url: '/services?category=employment',
          description: 'Job search and employment services',
        },
        {
          title: 'Health',
          url: '/services?category=health',
          description: 'Health services and medical assistance',
        },
        {
          title: 'Housing',
          url: '/services?category=housing',
          description: 'Housing loans and property services',
        },
        {
          title: 'Passport & Travel',
          url: '/services?category=passport-travel',
          description: 'Passport application and travel documents',
        },
        {
          title: 'Social Services',
          url: '/services?category=social-services',
          description: 'Social welfare and assistance programs',
        },
        {
          title: 'Tax',
          url: '/services?category=tax',
          description: 'Tax filing and payment services',
        },
        {
          title: 'Transport & Driving',
          url: '/services?category=transport-driving',
          description: "Driver's license and transportation services",
        },
      ],
    },
    {
      title: 'Travel',
      icon: <Briefcase className='w-5 h-5' />,
      links: [
        {
          title: 'Visa Information',
          url: '/travel/visa',
          description: 'Visa requirements for the Philippines',
        },
        {
          title: 'Visa Types',
          url: '/travel/visa-types',
          description: 'Different types of Philippine visas',
        },
        {
          title: 'Special Work Permit',
          url: '/travel/visa-types/swp-c',
          description: 'Information about Special Work Permits',
        },
      ],
    },
    {
      title: 'Data Services',
      icon: <FileCheck className='w-5 h-5' />,
      links: [
        {
          title: 'Weather',
          url: '/data/weather',
          description: 'Real-time weather information',
        },
        {
          title: 'Foreign Exchange Rates',
          url: '/data/forex',
          description: 'Current foreign exchange rates',
        },
      ],
    },
    {
      title: 'Infrastructure',
      icon: <Waves className='w-5 h-5' />,
      links: [
        {
          title: 'Flood Control Projects',
          url: '/flood-control-projects',
          description: 'Overview of flood control infrastructure projects',
        },
        {
          title: 'Projects Table View',
          url: '/flood-control-projects/table',
          description: 'Detailed table view of all flood control projects',
        },
        {
          title: 'Projects Map View',
          url: '/flood-control-projects/map',
          description:
            'Interactive map showing flood control project locations',
        },
        {
          title: 'Contractors Directory',
          url: '/flood-control-projects/contractors',
          description:
            'Directory of contractors working on flood control projects',
        },
      ],
    },
  ];

  return (
    <div className='py-12 min-h-screen bg-kapwa-bg-surface-raised'>
      <SEO
        title='Sitemap | BetterGov.ph'
        description='Complete sitemap of BetterGov.ph - Find all pages and services available on the Philippine Government Portal.'
        keywords={[
          'sitemap',
          'navigation',
          'government services',
          'philippines government',
          'website map',
        ]}
      />

      <div className='container px-4 mx-auto'>
        <div className='mx-auto max-w-5xl'>
          <div className='overflow-hidden rounded-xl bg-kapwa-bg-surface shadow-xs'>
            <div className='p-6 border-b border-kapwa-border-weak md:p-8'>
              <h1 className='text-3xl font-bold text-kapwa-text-strong'>
                Sitemap
              </h1>
              <p className='mt-2 text-kapwa-text-support'>
                A complete guide to all pages and services available on
                BetterGov.ph
              </p>
            </div>

            <div className='p-6 md:p-8'>
              <div className='space-y-12'>
                {sitemapSections.map((section, index) => (
                  <div key={index}>
                    <div className='flex items-center mb-4'>
                      <div className='p-2 mr-3 rounded-md bg-kapwa-bg-surface text-kapwa-text-brand'>
                        {section.icon}
                      </div>
                      <h2 className='text-xl font-bold text-kapwa-text-strong'>
                        {section.title}
                      </h2>
                    </div>

                    <div className='grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3'>
                      {section.links.map((link, linkIndex) => (
                        <Link
                          key={linkIndex}
                          to={link.url}
                          className='flex flex-col p-4 rounded-lg border transition-colors group hover:border-kapwa-border-brand hover:bg-kapwa-bg-surface-brand border-kapwa-border-weak'
                        >
                          <div className='flex justify-between items-center mb-2'>
                            <h3 className='font-medium group-hover:text-kapwa-text-brand text-kapwa-text-strong'>
                              {link.title}
                            </h3>
                            <ChevronRight className='w-4 h-4 group-hover:text-kapwa-text-link text-kapwa-text-disabled' />
                          </div>
                          {link.description && (
                            <p className='text-sm text-kapwa-text-support'>
                              {link.description}
                            </p>
                          )}
                        </Link>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className='mt-8 text-sm text-center text-kapwa-text-support'>
            <p>
              Can&apos;t find what you&apos;re looking for? Try using our{' '}
              <Link
                to='/search'
                className='text-kapwa-text-brand hover:underline'
              >
                search feature
              </Link>
              .
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SitemapPage;
