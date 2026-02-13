import { config } from '../lib/lguConfig';
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
    label: 'OpenLGU',
    href: '/openlgu',
    children: [
      { label: 'Ordinances', href: '/openlgu?type=ordinance' },
      { label: 'Resolutions', href: '/openlgu?type=resolution' },
      { label: 'Executive Orders', href: '/openlgu?type=executive_order' },
    ],
  },
  {
    label: 'Transparency',
    href: '/transparency',
    children: [
      { label: 'Financial Reports', href: '/transparency/financial' },
      {
        label: 'Procurement',
        href: '/transparency/procurement',
      },
      {
        label: 'DPWH Projects',
        href: '/transparency/infrastructure',
      },
    ],
  },
];

export const footerNavigation = {
  // Brand Section (Matches the Solano/Bacolod mission-style text)
  brand: {
    title: config.portal.name,
    description: `An open-source civic tech initiative making government information and municipal services accessible for the people of ${config.lgu.name}.`,
    cost: `Cost to the People of ${config.lgu.fullName} = ₱0`,
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
        { label: 'OpenLGU Portal', href: '/openlgu' },
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
          label: `${config.lgu.name} Gov.ph`,
          href: config.lgu.officialWebsite,
          target: '_blank',
        },
        // {
        //   label: 'Official Gazette',
        //   href: 'https://www.officialgazette.gov.ph',
        //   target: '_blank',
        // },
        {
          label: 'Freedom of Information',
          href: 'https://www.foi.gov.ph',
          target: '_blank',
        },
        {
          label: `Province of ${config.lgu.province}`,
          href: config.lgu.provinceWebsite,
          target: '_blank',
        },
        // { label: 'Privacy Policy', href: '/privacy' },
        // { label: 'Accessibility', href: '/accessibility' },
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
      href: 'https://github.com/BetterLosBanos/betterlb',
      target: '_blank',
    },
  ],
};
