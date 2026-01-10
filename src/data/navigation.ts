import { NavigationItem } from '../types';
import serviceCategories from './service_categories.json';

interface Category {
  name: string;
  slug: string;
  description?: string;
}

export const ourProjects = [
  {
    label: 'Our Projects',
    href: '#',
    children: [
      {
        label: '2026 Budget Tracker',
        href: 'https://2026-budget.bettergov.ph',
        target: '_blank',
      },
      {
        label: 'Budget Tracker',
        href: 'https://budget.bettergov.ph',
        target: '_blank',
      },
      {
        label: 'Transparency Portal',
        href: 'https://transparency.bettergov.ph',
        target: '_blank',
      },
      {
        label: 'Open Data Portal',
        href: 'https://data.bettergov.ph',
        target: '_blank',
      },
      {
        label: 'Petitions',
        href: 'https://petition.ph',
        target: '_blank',
      },
      {
        label: 'Tax Directory',
        href: 'https://taxdirectory.bettergov.ph',
        target: '_blank',
      },
      {
        label: 'Philgeps',
        href: 'https://philgeps.bettergov.ph',
        target: '_blank',
      },
      {
        label: 'SALN Tracker',
        href: 'https://saln.bettergov.ph',
        target: '_blank',
      },
      {
        label: 'Hotlines',
        href: 'https://hotlines.bettergov.ph',
        target: '_blank',
      },
      {
        label: 'Open Bayan',
        href: 'https://www.openbayan.org',
        target: '_blank',
      },
      {
        label: 'Open Congress API',
        href: 'https://open-congress-api.bettergov.ph',
        target: '_blank',
      },
      {
        label: 'OpenGov Blockchain',
        href: 'https://govchain.bettergov.ph',
        target: '_blank',
      },
      {
        label: 'Research & Visualizations',
        href: 'https://visualizations.bettergov.ph/',
        target: '_blank',
      },
    ],
  },
];

export const mainNavigation: NavigationItem[] = [
  {
    label: 'Services',
    href: '/services',
    children: (serviceCategories.categories as Category[]).map(category => ({
      label: category.name,
      href: `/services?category=${category.slug}`,
    })),
  },
  {
    label: 'Government',
    href: '/government',
    children: [
      { label: 'Executive', href: '/government/executive' },
      { label: 'Legislative', href: '/government/legislative' },
      { label: 'Departments', href: '/government/departments' },
      { label: 'Barangays', href: '/government/barangays' },
    ],
  },
  {
    label: 'Statistics',
    href: '/statistics',
    children: [
      // { label: 'Executive', href: '/government/executive' },
      // { label: 'Departments', href: '/government/departments' },
      // // { label: 'Constitutional', href: '/government/constitutional' },
      // { label: 'Legislative', href: '/government/legislative' },
      // { label: 'Local Government', href: '/government/local' },
      // { label: 'Diplomatic', href: '/government/diplomatic' },
      // { label: 'Salary Grades', href: '/government/salary-grade' },
    ],
  },
  {
    label: 'Legislation',
    href: '/legislation',
    children: [
      { label: 'Ordinances', href: '/legislation?type=ordinance' },
      { label: 'Resolutions', href: '/legislation?type=resolution' },
      { label: 'Executive Orders', href: '/legislation?type=executive_order' },
    ],
  },
  {
    label: 'Transparency',
    href: '/transparency',
    children: [
      // { label: 'Bids and Awards', href: '/government/executive' },
      // { label: 'Budget', href: '/government/departments' },
      // // { label: 'Constitutional', href: '/government/constitutional' },
      // { label: 'Legislative', href: '/government/legislative' },
      // // { label: 'Local Government', href: '/government/local' },
      // // { label: 'Diplomatic', href: '/government/diplomatic' },
      // // { label: 'Salary Grades', href: '/government/salary-grade' },
    ],
  },
  {
    label: 'Contact',
    href: '/contact',
  },
  // {
  //   label: 'Flood Control Projects',
  //   href: '/flood-control-projects',
  //   children: [
  //     { label: 'Charts', href: '/flood-control-projects' },
  //     { label: 'Table', href: '/flood-control-projects/table' },
  //     { label: 'Map', href: '/flood-control-projects/map' },
  //     { label: 'Contractors', href: '/flood-control-projects/contractors' },
  //   ],
  // },
  // ...ourProjects,
];

export const footerNavigation = {
  mainSections: [
    {
      title: 'About',
      links: [
        { label: 'About the Portal', href: '/about' },
        { label: 'Documentation', href: 'https://docs.bettergov.ph/' },
        { label: 'Project Ideas', href: '/ideas' },
        { label: 'Accessibility', href: '/accessibility' },
        { label: 'Terms of Use', href: '/terms-of-service' },
        { label: 'Contact Us', href: '/contact' },
      ],
    },
    {
      title: 'Services',
      links: [
        { label: 'All Services', href: '/services' },
        { label: 'Service Directory', href: '/services' },
        { label: 'Websites', href: '/services/websites' },
        { label: 'Forex', href: '/data/forex' },
        { label: 'Weather', href: '/data/weather' },
        { label: 'Hotlines', href: '/philippines/hotlines' },
        { label: 'Holidays', href: '/philippines/holidays' },
        { label: 'Flood Control Projects', href: '/flood-control-projects' },
      ],
    },
    {
      title: 'BetterGov.ph Projects',
      links: ourProjects[0].children,
    },
    {
      title: 'Government',
      links: [
        { label: 'Official Gov.ph', href: 'https://www.gov.ph' },
        { label: 'Open Data', href: 'https://data.gov.ph' },
        { label: 'Freedom of Information', href: 'https://www.foi.gov.ph' },
        {
          label: 'Contact Center',
          href: 'https://contactcenterngbayan.gov.ph',
        },
        {
          label: 'Official Gazette',
          href: 'https://www.officialgazette.gov.ph',
        },
      ],
    },
  ],
  socialLinks: [
    { label: 'Facebook', href: 'https://facebook.com/bettergovph' },
    { label: 'Discord', href: '/discord' },
    // { label: 'Instagram', href: 'https://instagram.com/govph' },
    // { label: 'YouTube', href: 'https://youtube.com/govph' },
  ],
};
