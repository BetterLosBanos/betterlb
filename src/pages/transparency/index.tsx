import { Link } from 'react-router-dom';
import {
  Landmark,
  HardHat,
  ShoppingBag,
  ChevronRight,
  Search,
  FileText,
  ExternalLink,
  HeartHandshake,
  Users,
} from 'lucide-react';
import { ModuleHeader, DetailSection } from '@/components/layout/PageLayouts';
import { Card, CardContent } from '@/components/ui/CardList';
import { Badge } from '@/components/ui/Badge';

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
    <div className='pb-20 mx-auto space-y-10 max-w-5xl duration-500 animate-in fade-in'>
      <ModuleHeader
        title='Transparency & Oversight'
        description='A community-led initiative to make Los Baños public data accessible, readable, and verifiable for every citizen.'
      />

      {/* 1. Grassroots Mission Box - Uses Brand Orange to signify "Community" */}
      <div className='flex flex-col gap-6 items-center p-6 bg-orange-50 rounded-3xl border-2 border-orange-100 shadow-sm md:flex-row'>
        <div className='p-4 bg-white rounded-2xl shadow-md text-secondary-600'>
          <HeartHandshake className='w-8 h-8' />
        </div>
        <div className='flex-1 space-y-2 text-center md:text-left'>
          <h3 className='font-bold text-orange-900 uppercase tracking-widest text-[10px]'>
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
            <Card hover className='flex flex-col h-full border-slate-200'>
              <CardContent className='flex flex-col p-6 h-full'>
                <div className='flex justify-between items-start mb-6'>
                  <div
                    className={`p-3 rounded-2xl transition-all shadow-sm ${
                      section.color === 'blue'
                        ? 'bg-primary-50 text-primary-600 group-hover:bg-primary-600 group-hover:text-white'
                        : 'bg-secondary-50 text-secondary-600 group-hover:bg-secondary-600 group-hover:text-white'
                    }`}
                  >
                    <section.icon className='w-6 h-6' />
                  </div>
                  <Badge
                    variant={section.color === 'blue' ? 'primary' : 'secondary'}
                    dot
                  >
                    {section.badge}
                  </Badge>
                </div>

                <div className='flex-1 space-y-2'>
                  <h4 className='text-lg font-extrabold transition-colors text-slate-900 group-hover:text-primary-600'>
                    {section.title}
                  </h4>
                  <p className='text-xs leading-relaxed text-slate-500'>
                    {section.description}
                  </p>
                </div>

                <div className='flex justify-between items-center pt-4 mt-8 border-t transition-transform border-slate-50 group-hover:translate-x-1'>
                  <span className='text-[10px] font-black uppercase tracking-widest text-primary-600'>
                    Analyze Data
                  </span>
                  <ChevronRight className='w-4 h-4 text-slate-300' />
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
          className='bg-slate-50 border-slate-200'
        >
          <p className='mb-6 text-sm leading-relaxed text-slate-600'>
            Our data depends on volunteers like you. If you find a project that
            is missing or an expense that seems incorrect, please let us know.
          </p>
          <Link
            to='/contribute'
            className='inline-flex items-center gap-2 px-6 py-3 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-700 hover:bg-white hover:border-primary-500 hover:text-primary-600 transition-all shadow-sm min-h-[44px]'
          >
            <Users className='w-4 h-4' /> Join the Community Audit
          </Link>
        </DetailSection>

        <DetailSection title='Data Sources' icon={FileText}>
          <div className='space-y-3'>
            <p className='text-[11px] text-slate-400 font-medium italic mb-2'>
              We mirror and verify data from the following platforms:
            </p>
            <a
              href='https://transparency.bettergov.ph'
              target='_blank'
              rel='noreferrer'
              className='flex justify-between items-center p-3 rounded-lg border transition-colors border-slate-100 hover:bg-slate-50 group'
            >
              <span className='text-xs font-bold text-slate-700'>
                BetterGov National Database
              </span>
              <ExternalLink className='w-3.5 h-3.5 text-slate-300 group-hover:text-primary-600' />
            </a>
            <a
              href='https://losbanos.gov.ph/full_disclosure_transparency'
              target='_blank'
              rel='noreferrer'
              className='flex justify-between items-center p-3 rounded-lg border transition-colors border-slate-100 hover:bg-slate-50 group'
            >
              <span className='text-xs font-bold text-slate-700'>
                Official LGU FDP Files
              </span>
              <ExternalLink className='w-3.5 h-3.5 text-slate-300 group-hover:text-primary-600' />
            </a>
          </div>
        </DetailSection>
      </div>
    </div>
  );
}
