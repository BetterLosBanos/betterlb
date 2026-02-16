import { GlobeIcon, MapPinIcon, PhoneIcon } from 'lucide-react';

import {
  ContactContainer,
  ContactItem,
} from '@/components/data-display/ContactInfo';
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
      <ContactContainer variant='inline' className='gap-6 text-sm'>
        <ContactItem icon={PhoneIcon} label='' value={contactValue} inline />
        <ContactItem
          icon={GlobeIcon}
          label=''
          value={barangay.website ? 'Facebook' : undefined}
          href={barangay.website}
          isExternal
          inline
        />
      </ContactContainer>
    </header>
  );
}
