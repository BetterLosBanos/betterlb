import { GlobeIcon, MapPinIcon, PhoneIcon } from 'lucide-react';

import { Badge } from '@/components/ui/Badge';

import { toTitleCase } from '@/lib/stringUtils';

interface BarangayHeaderProps {
  barangay: {
    barangay_name: string;
    address?: string;
    trunkline?: string[];
    website?: string;
  };
}

export function BarangayHeader({ barangay }: BarangayHeaderProps) {
  const contactValue = Array.isArray(barangay.trunkline)
    ? barangay.trunkline[0]
    : barangay.trunkline;

  return (
    <header
      className='bg-kapwa-bg-surface border-kapwa-border-weak rounded-xl border p-6 shadow-sm'
      role='banner'
      aria-label='Barangay information header'
    >
      {/* Top Row: Name + Badge */}
      <div className='mb-4 flex items-center justify-between gap-4'>
        <div className='flex items-center gap-3'>
          <MapPinIcon
            aria-hidden='true'
            className='text-kapwa-text-brand h-5 w-5'
          />
          <h1 className='kapwa-heading-lg text-kapwa-text-strong'>
            Barangay{' '}
            {toTitleCase(barangay.barangay_name.replace('BARANGAY', ''))}
          </h1>
        </div>
        <Badge variant='secondary' dot>
          Official Profile
        </Badge>
      </div>

      {/* Middle: Address */}
      {barangay.address && (
        <p className='text-kapwa-text-support mb-4 text-sm'>
          {barangay.address}, Los Baños, Laguna
        </p>
      )}

      {/* Bottom: Contact Row */}
      <div className='flex flex-col gap-4 text-sm md:flex-row md:gap-6'>
        {contactValue && (
          <a
            href={`tel:${contactValue}`}
            className='text-kapwa-text-support hover:text-kapwa-text-brand flex items-center gap-2 transition-colors'
          >
            <PhoneIcon aria-hidden='true' className='h-4 w-4' />
            <span>{contactValue}</span>
          </a>
        )}
        {barangay.website && (
          <a
            href={barangay.website}
            target='_blank'
            rel='noreferrer'
            className='text-kapwa-text-support hover:text-kapwa-text-brand flex items-center gap-2 transition-colors'
          >
            <GlobeIcon aria-hidden='true' className='h-4 w-4' />
            <span>Facebook</span>
          </a>
        )}
      </div>
    </header>
  );
}
