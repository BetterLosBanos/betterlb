import { LucideIcon, ExternalLink } from 'lucide-react';

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
    <div className='flex items-start gap-3 p-3 rounded-xl border border-gray-100 hover:border-primary-200 hover:bg-primary-50/30 transition-all group'>
      <div className='p-2 bg-gray-50 rounded-lg group-hover:bg-primary-100 text-gray-400 group-hover:text-primary-600 transition-colors'>
        <Icon className='w-4 h-4' />
      </div>
      <div className='min-w-0'>
        <p className='text-[10px] font-bold text-gray-400 uppercase tracking-widest leading-none mb-1'>
          {label}
        </p>
        <div className='text-sm font-semibold text-gray-700 truncate'>
          {Array.isArray(value) ? value[0] : value}
        </div>
      </div>
      {isExternal && (
        <ExternalLink className='w-3 h-3 ml-auto text-gray-300 group-hover:text-primary-400' />
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
