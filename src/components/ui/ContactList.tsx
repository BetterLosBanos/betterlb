import { ExternalLink, LucideIcon } from 'lucide-react';

interface ContactItemProps {
  icon: LucideIcon;
  label: string;
  value?: string | string[];
  href?: string;
  isExternal?: boolean;
}

export function ContactItem({
  icon: Icon,
  label,
  value,
  href,
  isExternal,
}: ContactItemProps) {
  if (!value || (Array.isArray(value) && value.length === 0)) return null;

  const content = (
    <div className='hover:border-primary-200 hover:bg-primary-50/30 group flex items-start gap-3 rounded-xl border border-gray-100 p-3 transition-all'>
      <div className='group-hover:bg-primary-100 group-hover:text-primary-600 rounded-lg bg-gray-50 p-2 text-gray-400 transition-colors'>
        <Icon className='h-4 w-4' />
      </div>
      <div className='min-w-0'>
        <p className='mb-1 text-[10px] leading-none font-bold tracking-widest text-gray-400 uppercase'>
          {label}
        </p>
        <div className='truncate text-sm font-semibold text-gray-700'>
          {Array.isArray(value) ? value[0] : value}
        </div>
      </div>
      {isExternal && (
        <ExternalLink className='group-hover:text-primary-400 ml-auto h-3 w-3 text-gray-300' />
      )}
    </div>
  );

  return href ? (
    <a
      href={href}
      target={isExternal ? '_blank' : undefined}
      rel='noreferrer'
      className='block'
    >
      {content}
    </a>
  ) : (
    <div className='block'>{content}</div>
  );
}

// Helper to wrap them
export function ContactGroup({ children }: { children: React.ReactNode }) {
  return <div className='space-y-3'>{children}</div>;
}
