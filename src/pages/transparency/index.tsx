import { Link } from 'react-router-dom';

import {
  ChevronRight,
  ExternalLink,
  FileText,
  HardHat,
  HeartHandshake,
  Landmark,
  Search,
  ShoppingBag,
  Users,
} from 'lucide-react';

import { DetailSection, ModuleHeader } from '@/components/layout/PageLayouts';
import { Badge } from '@/components/ui/Badge';
import { Card, CardContent } from '@/components/ui/CardList';

export default function TransparencyIndex() {
  const sections = [
    {
      title: 'Public Funds',
      description:
        'Independent visualization of municipal income and where your taxes are being allocated.',
      icon: Landmark,
      href: '/transparency/financial',
      color: 'blue',
      badge: 'Financials',
    },
    {
      title: 'Public Works',
      description:
        'Community tracking of road repairs, building constructions, and local infrastructure projects.',
      icon: HardHat,
      href: '/transparency/infrastructure-projects',
      color: 'orange',
      badge: 'Monitoring',
    },
    {
      title: 'Procurement',
      description:
        'Audit of municipal bidding and awarded contracts to ensure fair and open competition.',
      icon: ShoppingBag,
      href: '/transparency/procurement',
      color: 'blue',
      badge: 'Contracts',
    },
  ];

  return (
    <div className='animate-in fade-in mx-auto max-w-5xl space-y-10 pb-20 duration-500'>
      <ModuleHeader
        title='Transparency & Oversight'
        description='A community-led initiative to make Los Baños public data accessible, readable, and verifiable for every citizen.'
      />

      {/* 1. Grassroots Mission Box - Uses Brand Orange to signify "Community" */}
      <div className='flex flex-col items-center gap-6 rounded-3xl border-2 border-orange-100 bg-orange-50 p-6 shadow-sm md:flex-row'>
        <div className='text-secondary-600 rounded-2xl bg-white p-4 shadow-md'>
          <HeartHandshake className='h-8 w-8' />
        </div>
        <div className='flex-1 space-y-2 text-center md:text-left'>
          <h3 className='text-[10px] font-bold tracking-widest text-orange-900 uppercase'>
            Independent Grassroots Initiative
          </h3>
          <p className='text-sm leading-relaxed text-orange-800'>
            Better LB is <strong>not an official government portal</strong>. We
            are a volunteer movement mirroring public records to empower
            citizens with the information they need to engage in local
            governance.
          </p>
        </div>
      </div>

      {/* 2. The Three Pillars of Oversight */}
      <div className='grid grid-cols-1 gap-6 md:grid-cols-3' role='list'>
        {sections.map(section => (
          <Link
            key={section.href}
            to={section.href}
            className='group'
            role='listitem'
          >
            <Card hover className='flex h-full flex-col border-slate-200'>
              <CardContent className='flex h-full flex-col p-6'>
                <div className='mb-6 flex items-start justify-between'>
                  <div
                    className={`rounded-2xl p-3 shadow-sm transition-all ${
                      section.color === 'blue'
                        ? 'bg-primary-50 text-primary-600 group-hover:bg-primary-600 group-hover:text-white'
                        : 'bg-secondary-50 text-secondary-600 group-hover:bg-secondary-600 group-hover:text-white'
                    }`}
                  >
                    <section.icon className='h-6 w-6' />
                  </div>
                  <Badge
                    variant={section.color === 'blue' ? 'primary' : 'secondary'}
                    dot
                  >
                    {section.badge}
                  </Badge>
                </div>

                <div className='flex-1 space-y-2'>
                  <h4 className='group-hover:text-primary-600 text-lg font-extrabold text-slate-900 transition-colors'>
                    {section.title}
                  </h4>
                  <p className='text-xs leading-relaxed text-slate-500'>
                    {section.description}
                  </p>
                </div>

                <div className='mt-8 flex items-center justify-between border-t border-slate-50 pt-4 transition-transform group-hover:translate-x-1'>
                  <span className='text-primary-600 text-[10px] font-black tracking-widest uppercase'>
                    Analyze Data
                  </span>
                  <ChevronRight className='h-4 w-4 text-slate-300' />
                </div>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>

      {/* 3. Community Engagement Block */}
      <div className='grid grid-cols-1 gap-8 md:grid-cols-2'>
        <DetailSection
          title='Help Our Audit'
          icon={Search}
          className='border-slate-200 bg-slate-50'
        >
          <p className='mb-6 text-sm leading-relaxed text-slate-600'>
            Our data depends on volunteers like you. If you find a project that
            is missing or an expense that seems incorrect, please let us know.
          </p>
          <Link
            to='/contribute'
            className='hover:border-primary-500 hover:text-primary-600 inline-flex min-h-[44px] items-center gap-2 rounded-xl border border-slate-200 bg-white px-6 py-3 text-xs font-bold text-slate-700 shadow-sm transition-all hover:bg-white'
          >
            <Users className='h-4 w-4' /> Join the Community Audit
          </Link>
        </DetailSection>

        <DetailSection title='Data Sources' icon={FileText}>
          <div className='space-y-3'>
            <p className='mb-2 text-[11px] font-medium text-slate-400 italic'>
              We mirror and verify data from the following platforms:
            </p>
            <a
              href='https://transparency.bettergov.ph'
              target='_blank'
              rel='noreferrer'
              className='group flex items-center justify-between rounded-lg border border-slate-100 p-3 transition-colors hover:bg-slate-50'
            >
              <span className='text-xs font-bold text-slate-700'>
                BetterGov National Database
              </span>
              <ExternalLink className='group-hover:text-primary-600 h-3.5 w-3.5 text-slate-300' />
            </a>
            <a
              href='https://losbanos.gov.ph/full_disclosure_transparency'
              target='_blank'
              rel='noreferrer'
              className='group flex items-center justify-between rounded-lg border border-slate-100 p-3 transition-colors hover:bg-slate-50'
            >
              <span className='text-xs font-bold text-slate-700'>
                Official LGU FDP Files
              </span>
              <ExternalLink className='group-hover:text-primary-600 h-3.5 w-3.5 text-slate-300' />
            </a>
          </div>
        </DetailSection>
      </div>
    </div>
  );
}
