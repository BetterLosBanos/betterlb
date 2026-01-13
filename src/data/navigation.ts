import { NavigationItem } from '../types';
import serviceCategories from './service_categories.json';

interface Category {
  name: string;
  slug: string;
}

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
      { label: 'Elected Officials', href: '/government/elected-officials' },
      { label: 'Departments', href: '/government/departments' },
      { label: 'Barangays', href: '/government/barangays' },
    ],
  },
  {
    label: 'Statistics',
    href: '/statistics',
    children: [
      { label: 'Demographics', href: '/statistics' },
      { label: 'Competitiveness', href: '/statistics/competitiveness' },
      { label: 'Municipal Income', href: '/statistics/municipal-income' },
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
      { label: 'Financial Reports', href: '/transparency/financial' },
      {
        label: 'Infrastructure Projects',
        href: '/transparency/infrastructure-projects',
      },
      { label: 'DPWH Projects', href: '/transparency/dpwh-projects' },
    ],
  },
];

export const footerNavigation = {
  // Brand Section (Matches the Solano/Bacolod mission-style text)
  brand: {
    title: 'Better LB',
    description:
      'An open-source civic tech initiative making government information and municipal services accessible for the people of Los Baños.',
    cost: 'Cost to the People of Los Baños = ₱0',
  },

  mainSections: [
    {
      title: 'Local Services',
      links: [
        { label: 'All Services', href: '/services' },
        {
          label: 'Business & Licensing',
          href: '/services?category=business-licensing',
        },
        {
          label: 'Health & Wellness',
          href: '/services?category=health-wellness',
        },
        { label: 'Social Welfare', href: '/services?category=social-services' },
        {
          label: 'Agriculture & Veterinary',
          href: '/services?category=agriculture-veterinary',
        },
      ],
    },
    {
      title: 'Local Government',
      links: [
        { label: 'Elected Officials', href: '/government/elected-officials' },
        { label: 'Departments', href: '/government/departments' },
        { label: 'Barangay Directory', href: '/government/barangays' },
        { label: 'Local Legislation', href: '/legislation' },
        { label: 'Transparency', href: '/transparency/financial' },
      ],
    },
    {
      title: 'BetterGov Network',
      links: [
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
          label: 'Petitions PH',
          href: 'https://petition.ph',
          target: '_blank',
        },
        {
          label: 'SALN Tracker',
          href: 'https://saln.bettergov.ph',
          target: '_blank',
        },
        {
          label: 'Budget Tracker',
          href: 'https://budget.bettergov.ph',
          target: '_blank',
        },
        {
          label: 'Philgeps Tracker',
          href: 'https://philgeps.bettergov.ph',
          target: '_blank',
        },
      ],
    },
    {
      title: 'Resources',
      links: [
        {
          label: 'Official Gov.ph',
          href: 'https://www.gov.ph',
          target: '_blank',
        },
        {
          label: 'Official Gazette',
          href: 'https://www.officialgazette.gov.ph',
          target: '_blank',
        },
        {
          label: 'Freedom of Information',
          href: 'https://www.foi.gov.ph',
          target: '_blank',
        },
        {
          label: 'Province of Laguna',
          href: 'https://laguna.gov.ph',
          target: '_blank',
        },
        { label: 'Privacy Policy', href: '/privacy' },
        { label: 'Accessibility', href: '/accessibility' },
      ],
    },
  ],
  socialLinks: [
    {
      label: 'Facebook',
      href: 'https://facebook.com/betterlb.org',
      target: '_blank',
    },
    {
      label: 'Discord',
      href: 'https://discord.gg/dA6tkU4FYS',
      target: '_blank',
    },
    {
      label: 'GitHub',
      href: 'https://github.com/miconficker/betterlb',
      target: '_blank',
    },
  ],
};
