import { LucideIcon } from 'lucide-react';

interface ContactItemProps {
  icon: LucideIcon;
  label: string;
  value?: string | string[];
  href?: string;
}

export function ContactItem({
  icon: Icon,
  label,
  value,
  href,
}: ContactItemProps) {
  if (!value || (Array.isArray(value) && value.length === 0)) return null;

  const content = (
    <div className='hover:border-primary-200 hover:bg-primary-50/30 group flex items-start gap-3 rounded-lg border border-gray-100 p-3 transition-all'>
      <div className='group-hover:bg-primary-100 group-hover:text-primary-600 rounded-md bg-gray-50 p-2 text-gray-400 transition-colors'>
        <Icon className='h-4 w-4' />
      </div>
      <div>
        <p className='mb-1 text-[10px] leading-none font-bold tracking-widest text-gray-400 uppercase'>
          {label}
        </p>
        <div className='text-sm font-semibold text-gray-700'>
          {Array.isArray(value) ? value.join(', ') : value}
        </div>
      </div>
    </div>
  );

  return href ? (
    <a href={href} className='block'>
      {content}
    </a>
  ) : (
    content
  );
}
