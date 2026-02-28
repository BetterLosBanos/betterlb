import { Link } from 'react-router-dom';
import { FileText, ArrowRightIcon } from 'lucide-react';
import { Requirement } from '@/types/citizens-charter';

interface RequirementCardProps {
  requirement: Requirement;
}

export function RequirementCard({ requirement }: RequirementCardProps) {
  const {
    requirement: title,
    where_to_secure,
    copies,
    serviceSlug,
  } = requirement;
  const isClickable = !!serviceSlug;

  const CardContent = () => (
    <div
      data-testid='requirement-card'
      className={`border-kapwa-border-weak bg-kapwa-bg-surface rounded-xl border p-4 transition-all ${
        isClickable
          ? 'hover:border-kapwa-border-brand hover:bg-kapwa-bg-surface-raised cursor-pointer group'
          : ''
      }`}
    >
      <div className='flex items-start gap-3'>
        <div className='text-kapwa-text-brand bg-kapwa-bg-surface-raised rounded-lg p-2'>
          <FileText className='h-4 w-4' />
        </div>
        <div className='flex-1'>
          <h4 className='text-kapwa-text-strong text-sm font-semibold'>
            {title}
          </h4>
          <p className='text-kapwa-text-support mt-1 text-xs'>
            from: {where_to_secure}
          </p>
          {copies && (
            <p className='text-kapwa-text-brand mt-1 text-xs font-medium'>
              {copies}
            </p>
          )}
          {isClickable && (
            <span className='text-kapwa-text-brand mt-2 inline-flex items-center gap-1 text-xs font-bold group-hover:underline'>
              View Service <ArrowRightIcon className='h-3 w-3' />
            </span>
          )}
        </div>
      </div>
    </div>
  );

  if (isClickable) {
    return (
      <Link to={`/services/${serviceSlug}`}>
        <CardContent />
      </Link>
    );
  }

  return <CardContent />;
}
