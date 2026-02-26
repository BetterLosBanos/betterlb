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

import { DetailSection } from '@/components/layout/PageLayouts';
import { Badge } from '@/components/ui/Badge';
import { Card, CardContent, CardGrid } from '@/components/ui/Card';

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
    <div className='animate-in fade-in duration-500'>
      {/* 1. Grassroots Mission Box - Uses Brand Orange to signify "Community" */}
      <div className='mb-10'>
        <div className='bg-kapwa-orange-50 flex flex-col items-center gap-6 rounded-3xl border-0 p-6 shadow-sm md:flex-row'>
          <div className='text-kapwa-orange-600 bg-kapwa-bg-surface rounded-2xl p-4 shadow-md'>
            <HeartHandshake className='h-8 w-8' />
          </div>
          <div className='flex-1 space-y-2 text-center md:text-left'>
            <h3 className='text-[10px] font-bold tracking-widest text-kapwa-orange-600 uppercase'>
              Independent Grassroots Initiative
            </h3>
            <p className='text-sm leading-relaxed text-kapwa-orange-600'>
              Better LB is <strong>not an official government portal</strong>.
              We are a volunteer movement mirroring public records to empower
              citizens with the information they need to engage in local
              governance.
            </p>
          </div>
        </div>
      </div>

      {/* 2. The Three Pillars of Oversight - Using CardGrid */}
      <CardGrid columns={3}>
        {sections.map(section => (
          <Link
            key={section.href}
            to={section.href}
            className='group'
            role='listitem'
          >
            <Card
              hover
              className='border-kapwa-border-weak flex h-full flex-col'
            >
              <CardContent className='flex h-full flex-col p-6'>
                <div className='mb-6 flex items-start justify-between'>
                  <div
                    className={`rounded-2xl p-3 shadow-sm transition-all ${
                      section.color === 'blue'
                        ? 'bg-kapwa-bg-surface text-kapwa-text-brand group-hover:bg-kapwa-bg-brand-default group-hover:text-kapwa-text-inverse'
                        : 'bg-kapwa-orange-50 text-kapwa-orange-600 group-hover:bg-kapwa-orange-100 group-hover:text-kapwa-text-inverse'
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
                  <h4 className='group-hover:text-kapwa-text-brand text-kapwa-text-strong text-lg font-extrabold transition-colors'>
                    {section.title}
                  </h4>
                  <p className='text-kapwa-text-disabled text-xs leading-relaxed'>
                    {section.description}
                  </p>
                </div>

                <div className='mt-8 flex items-center justify-between border-t border-kapwa-border-weak pt-4 transition-transform group-hover:translate-x-1'>
                  <span className='text-kapwa-text-brand text-[10px] font-black tracking-widest uppercase'>
                    Analyze Data
                  </span>
                  <ChevronRight className='text-kapwa-text-support h-4 w-4' />
                </div>
              </CardContent>
            </Card>
          </Link>
        ))}
      </CardGrid>

      {/* 3. Community Engagement Block */}
      <div className='mt-10 grid grid-cols-1 gap-8 md:grid-cols-2'>
        <DetailSection
          title='Help Our Audit'
          icon={Search}
          className='bg-kapwa-bg-surface-raised border-kapwa-border-weak flex h-full flex-col'
        >
          <div className='flex h-full flex-col justify-between'>
            <p className='text-kapwa-text-support mb-6 text-sm leading-relaxed'>
              Our data depends on volunteers like you. If you find a project
              that is missing or an expense that seems incorrect, please let us
              know.
            </p>
            <a
              href='https://github.com/BetterLosBanos/betterlb/issues'
              target='_blank'
              rel='noreferrer'
              className='text-kapwa-text-inverse bg-kapwa-brand-600 hover:bg-kapwa-brand-700 inline-flex w-full items-center justify-center gap-2 rounded-lg px-4 py-2.5 text-xs font-bold transition-colors'
            >
              <Users className='h-4 w-4' /> Report an Issue
            </a>
          </div>
        </DetailSection>

        <DetailSection
          title='Data Sources'
          icon={FileText}
          className='flex h-full flex-col'
        >
          <div className='flex h-full flex-col justify-between'>
            <p className='text-kapwa-text-disabled mb-6 text-[11px] font-medium italic'>
              We mirror and verify data from the following platforms:
            </p>
            <div className='flex flex-col gap-3'>
              <a
                href='https://transparency.bettergov.ph'
                target='_blank'
                rel='noreferrer'
                className='text-kapwa-text-inverse bg-kapwa-brand-600 hover:bg-kapwa-brand-700 inline-flex w-full items-center justify-center gap-2 rounded-lg px-4 py-2.5 text-xs font-bold transition-colors'
              >
                Transparency Dashboard <ExternalLink className='h-3 w-3' />
              </a>
              <a
                href='https://data.bettergov.ph/'
                target='_blank'
                rel='noreferrer'
                className='text-kapwa-text-inverse bg-kapwa-brand-600 hover:bg-kapwa-brand-700 inline-flex w-full items-center justify-center gap-2 rounded-lg px-4 py-2.5 text-xs font-bold transition-colors'
              >
                BetterGov Data Portal <ExternalLink className='h-3 w-3' />
              </a>
            </div>
          </div>
        </DetailSection>
      </div>
    </div>
  );
}
