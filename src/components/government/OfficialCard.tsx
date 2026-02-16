import { LucideIcon, UserIcon } from 'lucide-react';

import { Badge } from '@/components/ui/Badge';
import { Card, CardContent } from '@/components/ui/Card';

import { toTitleCase } from '@/lib/stringUtils';

interface OfficialCardProps {
  official: {
    name: string;
    role?: string;
  };
  role: string;
  icon: LucideIcon;
}

export function OfficialCard({
  official,
  role,
  icon: Icon,
}: OfficialCardProps) {
  return (
    <Card
      hover
      className='group focus-within:ring-kapwa-border-focus h-20 transition-all focus-within:ring-2 focus-within:ring-offset-2'
    >
      <CardContent className='flex h-full items-center gap-3 px-4 py-0'>
        <Icon
          aria-hidden='true'
          className='text-kapwa-text-support group-hover:text-kapwa-text-brand h-5 w-5 shrink-0 transition-colors'
        />
        <div className='min-w-0 flex-1'>
          <h3 className='text-kapwa-text-strong truncate text-sm font-bold'>
            {toTitleCase(official.name)}
          </h3>
          <Badge
            variant='secondary'
            className='mt-0.5'
            aria-label={`Position: ${role}`}
          >
            {role}
          </Badge>
        </div>
      </CardContent>
    </Card>
  );
}

interface PunongBarangayCardProps {
  official: {
    name: string;
  };
}

export function PunongBarangayCard({ official }: PunongBarangayCardProps) {
  return (
    <Card className='border-kapwa-border-brand h-30' variant='default'>
      <CardContent className='flex h-full flex-col items-center justify-center gap-2 px-6 py-4 text-center'>
        <div className='bg-kapwa-bg-brand-weak text-kapwa-text-brand border-kapwa-border-brand flex h-12 w-12 items-center justify-center rounded-full border-2'>
          <UserIcon aria-hidden='true' className='h-6 w-6' />
        </div>
        <div className='min-w-0'>
          <h2 className='text-kapwa-text-strong text-lg font-black'>
            Hon. {toTitleCase(official.name)}
          </h2>
          <Badge
            variant='primary'
            className='mt-1'
            aria-label='Position: Punong Barangay'
          >
            Punong Barangay
          </Badge>
        </div>
      </CardContent>
    </Card>
  );
}
