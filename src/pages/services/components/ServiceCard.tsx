import { Link } from 'react-router-dom';

import { format, isValid } from 'date-fns';
import {
  AlertCircle,
  ArrowRightIcon,
  BookOpenIcon,
  BriefcaseIcon,
  ClockIcon,
  DollarSignIcon,
  FileTextIcon,
  HammerIcon,
  HeartIcon,
  LeafIcon,
  LucideIcon,
  ShieldCheck,
  ShieldIcon,
  UsersIcon,
} from 'lucide-react';

import { Badge } from '@/components/ui/Badge';
import { Card, CardContent } from '@/components/ui/Card';

import type { Service } from '@/types/servicesTypes';

// Icons
const categoryIcons: Record<string, LucideIcon> = {
  'certificates-vital-records': FileTextIcon,
  'business-licensing': BriefcaseIcon,
  'taxation-assessment': DollarSignIcon,
  'infrastructure-engineering': HammerIcon,
  'social-services': UsersIcon,
  'health-wellness': HeartIcon,
  'agriculture-livelihood': LeafIcon,
  'environment-waste': LeafIcon,
  'education-scholarship': BookOpenIcon,
  'public-safety': ShieldIcon,
  'other-municipal': FileTextIcon,
};

interface ServiceCardProps {
  service: Service;
}

export default function ServiceCard({ service }: ServiceCardProps) {
  const CategoryIcon = categoryIcons[service.category.slug] || FileTextIcon;
  const hasValidDate =
    service.updatedAt && isValid(new Date(service.updatedAt));
  const isOfficialSource = service.source === 'citizens-charter';
  const needsVerification = service.needsVerification === true;
  const isTransaction = service.type === 'transaction';

  return (
    <Link
      to={`/services/${service.slug}`}
      className='group min-h-[200px]'
      data-testid='service-card'
      data-service-slug={service.slug}
      aria-label={`View details for ${service.plainLanguageName || service.service}`}
    >
      <Card
        hover
        className='border-kapwa-border-weak flex h-full flex-col shadow-sm'
      >
        <CardContent className='flex h-full flex-col p-6'>
          {/* Icon & Status Badges */}
          <div className='mb-4 flex items-start justify-between gap-2'>
            <div className='bg-kapwa-bg-surface text-kapwa-text-brand border-kapwa-border-brand rounded-xl border p-2.5 shadow-xs'>
              <CategoryIcon className='h-5 w-5' />
            </div>
            <div className='flex flex-wrap items-center justify-end gap-1.5'>
              {/* Source Badge */}
              <Badge variant={isOfficialSource ? 'success' : 'secondary'} dot>
                {isOfficialSource ? 'Official' : 'Community'}
              </Badge>
              {/* Online/Walk-in Badge */}
              {service.url ? (
                <Badge variant='success' dot>
                  Online
                </Badge>
              ) : isTransaction ? (
                <Badge variant='slate' dot>
                  Walk-in
                </Badge>
              ) : null}
            </div>
          </div>

          {/* Service Number (for Citizens Charter services) */}
          {service.serviceNumber && (
            <div className='mb-2'>
              <span className='text-kapwa-text-disabled text-[10px] font-bold tracking-widest uppercase'>
                Service No. {service.serviceNumber}
              </span>
            </div>
          )}

          {/* Title & Category Label */}
          <div className='flex-1'>
            <h3 className='group-hover:text-kapwa-text-brand text-kapwa-text-strong mb-1 leading-snug font-bold transition-colors'>
              {service.plainLanguageName || service.service}
            </h3>
            <p className='text-kapwa-text-disabled text-[10px] font-bold tracking-widest uppercase'>
              {service.category.name}
            </p>
            {/* Office Division (for Citizens Charter services) */}
            {service.officeDivision && (
              <p className='text-kapwa-text-support mt-1 text-[11px] font-medium leading-tight'>
                {service.officeDivision}
              </p>
            )}
          </div>

          {/* Footer Row */}
          <div className='mt-6 flex items-center justify-between border-t border-kapwa-border-weak pt-4'>
            {/* Verification / Data Status */}
            <div className='flex items-center gap-1.5 text-[10px] font-bold tracking-widest uppercase'>
              {needsVerification ? (
                <>
                  <AlertCircle className='h-3 w-3 text-kapwa-text-warning' />
                  <span className='text-kapwa-text-warning'>
                    Pending Verification
                  </span>
                </>
              ) : hasValidDate ? (
                <>
                  <ClockIcon className='h-3 w-3 text-kapwa-text-success' />
                  <span className='text-kapwa-text-strong0'>
                    {format(new Date(service.updatedAt!), 'MMM yyyy')}
                  </span>
                </>
              ) : isOfficialSource ? (
                <>
                  <ShieldCheck className='h-3 w-3 text-kapwa-text-success' />
                  <span className='text-kapwa-text-success'>Official Data</span>
                </>
              ) : (
                <>
                  <span className='bg-kapwa-bg-disabled h-1.5 w-1.5 shrink-0 rounded-full' />
                  <span className='text-kapwa-text-inverse-subtle italic'>
                    Unverified
                  </span>
                </>
              )}
            </div>

            {/* View Link */}
            <span className='text-kapwa-text-brand flex items-center gap-1 text-xs font-bold transition-transform group-hover:translate-x-1'>
              View <ArrowRightIcon className='h-3 w-3' />
            </span>
          </div>

          {/* Classification Badge (for Citizens Charter services) */}
          {service.classification && (
            <div className='mt-3 border-t border-kapwa-border-weak pt-3'>
              <Badge variant='outline' className='text-[9px]'>
                {service.classification} Transaction
              </Badge>
            </div>
          )}
        </CardContent>
      </Card>
    </Link>
  );
}
