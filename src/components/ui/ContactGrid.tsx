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
    <div className='flex items-start gap-3 p-3 rounded-lg border border-gray-100 hover:border-primary-200 hover:bg-primary-50/30 transition-all group'>
      <div className='p-2 bg-gray-50 rounded-md group-hover:bg-primary-100 text-gray-400 group-hover:text-primary-600 transition-colors'>
        <Icon className='w-4 h-4' />
      </div>
      <div>
        <p className='text-[10px] font-bold text-gray-400 uppercase tracking-widest leading-none mb-1'>
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
