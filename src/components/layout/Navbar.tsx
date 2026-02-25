import { FC, useState } from 'react';

import { Link, useLocation } from 'react-router-dom';

import { ChevronDownIcon, MenuIcon, SearchIcon, XIcon } from 'lucide-react';
import { useTranslation } from 'react-i18next';

import { Button } from '@bettergov/kapwa';

import { config } from '@/lib/lguConfig';
import { cn } from '@/lib/utils';

import { mainNavigation } from '../../data/navigation';
import { LANGUAGES } from '../../i18n/languages';
import { LanguageType } from '../../types';

export const Navbar: FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [activeMobileSubmenu, setActiveMobileSubmenu] = useState<string | null>(
    null
  );
  const [hoveredDropdown, setHoveredDropdown] = useState<string | null>(null);
  const { t, i18n } = useTranslation('common');
  const location = useLocation();

  const toggleMenu = () => {
    setIsOpen(!isOpen);
    if (isOpen) setActiveMobileSubmenu(null);
  };

  const closeMenu = () => {
    setIsOpen(false);
    setActiveMobileSubmenu(null);
    setHoveredDropdown(null);
  };

  const changeLanguage = (newLanguage: LanguageType) => {
    i18n.changeLanguage(newLanguage);
  };

  const isActiveRoute = (href: string) => {
    const path = location.pathname.replace(/\/$/, '');
    const target = href.replace(/\/$/, '');
    return path === target || (target !== '' && path.startsWith(target + '/'));
  };

  return (
    <nav
      className='sticky top-0 z-50 border-b border-kapwa-border-weak bg-kapwa-bg-surface shadow-xs'
      role='navigation'
    >
      {/* 1. TOP BAR: Responsive & Aligned Right */}
      <div className='border-b border-kapwa-border-weak bg-kapwa-bg-surface-raised'>
        <div className='container mx-auto px-4'>
          <div className='flex h-10 items-center justify-end gap-3 sm:gap-4 md:gap-6'>
            <Link
              to='/join-us'
              className='text-kapwa-text-brand hover:text-kapwa-text-link-hover hidden text-[10px] font-bold tracking-widest whitespace-nowrap uppercase md:inline-flex md:text-xs'
            >
              🚀 Join Us
            </Link>
            <Link
              to='/about'
              className='hover:text-kapwa-text-brand hidden text-[10px] font-bold tracking-widest whitespace-nowrap text-kapwa-text-support uppercase md:inline-flex md:text-xs'
            >
              About
            </Link>
            <a
              href={config.lgu.officialWebsite}
              target='_blank'
              rel='noreferrer'
              className='hover:text-kapwa-text-brand inline-flex text-[9px] font-bold tracking-widest whitespace-nowrap text-kapwa-text-support uppercase sm:text-[10px] md:text-xs'
            >
              <span className='inline sm:hidden'>Gov.ph</span>
              <span className='hidden sm:inline'>Official Gov.ph</span>
            </a>
            <Link
              to='https://hotlines.bettergov.ph/'
              className='hover:text-kapwa-text-brand inline-flex text-[9px] font-bold tracking-widest whitespace-nowrap text-kapwa-text-support uppercase sm:text-[10px] md:text-xs'
            >
              Hotlines
            </Link>
            <div className='flex shrink-0 items-center border-l border-kapwa-border-weak pl-2'>
              <select
                aria-label='Select Language'
                value={i18n.language}
                onChange={e => changeLanguage(e.target.value as LanguageType)}
                className='cursor-pointer bg-transparent text-[9px] font-bold tracking-widest text-kapwa-text-support uppercase outline-none sm:text-[10px] md:text-xs'
              >
                {Object.entries(LANGUAGES).map(([code, lang]) => (
                  <option key={code} value={code}>
                    {lang.nativeName}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* 2. MAIN NAV: Desktop Dropdowns + Mobile Toggle */}
      <div className='container mx-auto px-4'>
        <div className='flex h-16 items-center justify-between md:h-20'>
          {/* Brand/Logo Section (Constrained) */}
          <Link
            to='/'
            className='group flex max-w-[60%] min-w-0 items-center md:max-w-md'
            onClick={closeMenu}
          >
            <img
              src='/logos/webp/betterlb-blue-outline.webp'
              alt='BetterLB Logo'
              className='mr-3 h-10 w-10 shrink-0 transition-transform group-hover:scale-105 md:h-12 md:w-12'
            />
            <div className='flex min-w-0 flex-col justify-center'>
              <div className='text-lg leading-none font-black tracking-tighter text-kapwa-text-strong md:text-xl'>
                {config.portal.name}
              </div>
              <div className='line-clamp-2 text-[9px] leading-tight font-medium text-kapwa-text-support md:line-clamp-1 md:text-xs md:leading-normal'>
                A Community-run portal for the Municipality of Los Baños
              </div>
            </div>
          </Link>

          {/* Desktop Menu */}
          <div className='hidden items-center space-x-1 lg:flex xl:space-x-4'>
            {mainNavigation.map(item => {
              const active = isActiveRoute(item.href);
              const hasChildren = item.children && item.children.length > 0;

              return (
                <div
                  key={item.label}
                  className='relative flex h-full items-center'
                  onMouseEnter={() =>
                    hasChildren && setHoveredDropdown(item.label)
                  }
                  onMouseLeave={() => setHoveredDropdown(null)}
                >
                  <Link
                    to={item.href}
                    className={cn(
                      'flex items-center gap-1 border-b-2 px-3 py-2 text-sm font-bold tracking-widest uppercase transition-all',
                      active
                        ? 'text-kapwa-text-brand border-kapwa-border-brand'
                        : 'hover:text-kapwa-text-brand border-transparent text-kapwa-text-strong'
                    )}
                  >
                    {t(`navbar.${item.label.toLowerCase()}`)}
                    {hasChildren && (
                      <ChevronDownIcon
                        className={cn(
                          'h-3 w-3 transition-transform',
                          hoveredDropdown === item.label && 'rotate-180'
                        )}
                      />
                    )}
                  </Link>

                  {/* Desktop Dropdown Menu */}
                  {hasChildren && hoveredDropdown === item.label && (
                    <div className='animate-in fade-in slide-in-from-top-2 absolute top-full left-0 w-64 rounded-b-xl border border-kapwa-border-weak bg-kapwa-bg-surface py-2 shadow-xl duration-200'>
                      {item.children?.map(child => (
                        <Link
                          key={child.label}
                          to={child.href}
                          className='hover:bg-kapwa-bg-surface-raised hover:text-kapwa-text-link-hover block px-5 py-3 text-xs font-bold tracking-wider text-kapwa-text-strong uppercase transition-colors'
                          onClick={closeMenu}
                        >
                          {child.label}
                        </Link>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
            <Link
              to='/search'
              className='hover:text-kapwa-text-brand ml-4 p-3 text-kapwa-text-strong transition-colors'
              aria-label='Search'
            >
              <SearchIcon className='h-5 w-5' />
            </Link>
          </div>

          {/* Mobile Buttons */}
          <div className='flex items-center gap-1 lg:hidden'>
            <Link
              to='/search'
              className='p-3 text-kapwa-text-strong'
              aria-label='Search'
            >
              <SearchIcon className='h-6 w-6' />
            </Link>
            <Button
              onClick={toggleMenu}
              variant='ghost'
              aria-label='Toggle Menu'
              className='rounded-xl bg-kapwa-bg-surface-raised p-3 text-kapwa-text-strong'
            >
              {isOpen ? (
                <XIcon className='h-6 w-6' />
              ) : (
                <MenuIcon className='h-6 w-6' />
              )}
            </Button>
          </div>
        </div>
      </div>

      {/* 3. MOBILE MENU OVERLAY: RESTORED NESTING */}
      {isOpen && (
        <div className='animate-in slide-in-from-right fixed inset-0 top-[104px] z-40 overflow-y-auto bg-kapwa-bg-surface duration-300 lg:hidden'>
          <div className='flex flex-col p-4 pb-20'>
            {mainNavigation.map(item => {
              const hasChildren = item.children && item.children.length > 0;
              const isSubOpen = activeMobileSubmenu === item.label;

              return (
                <div
                  key={item.label}
                  className='border-b border-kapwa-border-weak last:border-0'
                >
                  <div className='flex items-center'>
                    <Link
                      to={item.href}
                      onClick={closeMenu}
                      className={cn(
                        'flex-1 p-4 text-lg font-bold transition-colors',
                        isActiveRoute(item.href)
                          ? 'text-kapwa-text-brand'
                          : 'text-kapwa-text-strong'
                      )}
                    >
                      {t(`navbar.${item.label.toLowerCase()}`)}
                    </Link>
                    {hasChildren && (
                      <Button
                        onClick={e => {
                          e.preventDefault();
                          setActiveMobileSubmenu(isSubOpen ? null : item.label);
                        }}
                        variant='ghost'
                        className='p-4 text-kapwa-text-disabled'
                      >
                        <ChevronDownIcon
                          className={cn(
                            'h-6 w-6 transition-transform',
                            isSubOpen && 'rotate-180'
                          )}
                        />
                      </Button>
                    )}
                  </div>

                  {/* Mobile Submenu Items */}
                  {hasChildren && isSubOpen && (
                    <div className='animate-in slide-in-from-top-2 mx-2 mb-2 overflow-hidden rounded-2xl bg-kapwa-bg-surface-raised'>
                      {item.children?.map(child => (
                        <Link
                          key={child.label}
                          to={child.href}
                          onClick={closeMenu}
                          className='block border-b border-kapwa-bg-surface p-4 text-sm font-bold text-kapwa-text-strong last:border-0'
                        >
                          {child.label}
                        </Link>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}

            {/* Mobile-only additional links */}
            <div className='mt-4 space-y-1 border-t border-kapwa-border-weak pt-4'>
              <Link
                to='/join-us'
                onClick={closeMenu}
                className='text-kapwa-text-brand block p-4 text-xs font-black tracking-widest uppercase'
              >
                🚀 Join the Revolution
              </Link>
              <Link
                to='/about'
                onClick={closeMenu}
                className='block p-4 text-xs font-bold tracking-widest text-kapwa-text-support uppercase'
              >
                About Better LB
              </Link>
              <Link
                to='/contact'
                onClick={closeMenu}
                className='block p-4 text-xs font-bold tracking-widest text-kapwa-text-support uppercase'
              >
                Contact Us
              </Link>
            </div>
          </div>
        </div>
      )}
    </nav>
  );
};
