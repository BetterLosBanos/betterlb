import { ReactNode } from 'react';

import { Link, useLocation } from 'react-router-dom';

import { LucideIcon } from 'lucide-react';

// 1. The Outer Wrapper
export function SidebarContainer({
  children,
  title,
}: {
  children: ReactNode;
  title?: string;
}) {
  return (
    <aside className='w-full shrink-0 md:w-64'>
      <div className='sticky top-32 overflow-hidden rounded-lg border border-gray-200 bg-white shadow-sm'>
        {title && (
          <div className='border-b border-gray-100 bg-gray-50/50 px-4 py-3'>
            <h2 className='text-[11px] font-semibold tracking-widest text-gray-900 uppercase'>
              {title}
            </h2>
          </div>
        )}
        <nav className='scrollbar-thin max-h-[calc(100vh-200px)] overflow-y-auto p-2'>
          {children}
        </nav>
      </div>
    </aside>
  );
}

// 2. The Group Heading
export function SidebarGroup({
  title,
  children,
}: {
  title: string;
  children: ReactNode;
}) {
  return (
    <div className='mb-4 last:mb-0'>
      <h3 className='px-3 py-2 text-[10px] font-bold tracking-widest text-gray-400 uppercase'>
        {title}
      </h3>
      <ul className='space-y-1'>{children}</ul>
    </div>
  );
}

// 3. The Item Component
interface SidebarItemProps {
  label: string; // The "Clean" name (e.g., "Agriculture")
  tooltip?: string; // The "Full" name (e.g., "DEPARTMENT OF AGRICULTURE")
  icon?: LucideIcon;
  path?: string;
  onClick?: () => void;
  isActive?: boolean;
  description?: string;
}

export function SidebarItem({
  label,
  tooltip,
  icon: Icon,
  path,
  onClick,
  isActive,
  description,
}: SidebarItemProps) {
  const location = useLocation();
  const active = isActive ?? (path ? location.pathname === path : false);

  const baseStyles = `
    w-full flex items-start gap-3 px-3 py-2 rounded-md text-sm transition-all group
    border-l-2 
    ${
      active
        ? 'bg-primary-50 text-primary-700 font-semibold border-primary-600'
        : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900 border-transparent'
    }
  `;

  const content = (
    <>
      {Icon && (
        <Icon
          className={`mt-0.5 h-4 w-4 shrink-0 ${active ? 'text-primary-600' : 'text-gray-400 group-hover:text-gray-600'}`}
        />
      )}
      <div className='flex flex-col overflow-hidden text-left'>
        <span className='truncate'>{label}</span>
        {description && (
          <span
            className={`text-[11px] leading-tight ${active ? 'text-primary-600/70' : 'text-gray-400'}`}
          >
            {description}
          </span>
        )}
      </div>
    </>
  );

  // Use tooltip if provided, otherwise fallback to label
  const hoverTitle = tooltip || label;

  if (path) {
    return (
      <li>
        <Link
          to={path}
          title={hoverTitle}
          className={baseStyles}
          state={{ scrollToContent: true }}
          aria-current={active ? 'page' : undefined}
        >
          {content}
        </Link>
      </li>
    );
  }

  return (
    <li>
      <button
        type='button'
        onClick={onClick}
        title={hoverTitle}
        className={baseStyles}
        aria-current={active ? 'page' : undefined}
      >
        {content}
      </button>
    </li>
  );
}
