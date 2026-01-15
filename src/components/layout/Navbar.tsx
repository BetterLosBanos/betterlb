import { FC, useState } from 'react';

import { Link, useLocation } from 'react-router-dom';

import { ChevronDownIcon, MenuIcon, SearchIcon, XIcon } from 'lucide-react';
import { useTranslation } from 'react-i18next';

import { cn } from '@/lib/utils';

import { mainNavigation } from '../../data/navigation';
import { LANGUAGES } from '../../i18n/languages';
import { LanguageType } from '../../types';

const Navbar: FC = () => {
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
      className='sticky top-0 z-50 border-b border-slate-200 bg-white shadow-xs'
      role='navigation'
    >
      {/* 1. TOP BAR: Responsive & Aligned Right */}
      <div className='border-b border-slate-200 bg-slate-50'>
        <div className='container mx-auto px-4'>
          <div className='flex h-10 items-center justify-end gap-3 sm:gap-4 md:gap-6'>
            <Link
              to='/join-us'
              className='text-primary-600 hover:text-primary-700 hidden text-[10px] font-bold tracking-widest whitespace-nowrap uppercase md:inline-flex md:text-xs'
            >
              🚀 Join Us
            </Link>
            <Link
              to='/about'
              className='hover:text-primary-600 hidden text-[10px] font-bold tracking-widest whitespace-nowrap text-slate-500 uppercase md:inline-flex md:text-xs'
            >
              About
            </Link>
            <a
              href='https://losbanos.gov.ph'
              target='_blank'
              rel='noreferrer'
              className='hover:text-primary-600 inline-flex text-[9px] font-bold tracking-widest whitespace-nowrap text-slate-500 uppercase sm:text-[10px] md:text-xs'
            >
              <span className='inline sm:hidden'>Gov.ph</span>
              <span className='hidden sm:inline'>Official Gov.ph</span>
            </a>
            <Link
              to='/philippines/hotlines'
              className='hover:text-primary-600 inline-flex text-[9px] font-bold tracking-widest whitespace-nowrap text-slate-500 uppercase sm:text-[10px] md:text-xs'
            >
              Hotlines
            </Link>
            <div className='flex shrink-0 items-center border-l border-slate-200 pl-2'>
              <select
                aria-label='Select Language'
                value={i18n.language}
                onChange={e => changeLanguage(e.target.value as LanguageType)}
                className='cursor-pointer bg-transparent text-[9px] font-bold tracking-widest text-slate-500 uppercase outline-none sm:text-[10px] md:text-xs'
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
              <div className='text-lg leading-none font-black tracking-tighter text-slate-900 md:text-xl'>
                BetterLB
              </div>
              <div className='line-clamp-2 text-[9px] leading-tight font-medium text-slate-500 md:line-clamp-1 md:text-xs md:leading-normal'>
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
                        ? 'text-primary-600 border-primary-600'
                        : 'hover:text-primary-600 border-transparent text-slate-600'
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
                    <div className='animate-in fade-in slide-in-from-top-2 absolute top-full left-0 w-64 rounded-b-xl border border-slate-100 bg-white py-2 shadow-xl duration-200'>
                      {item.children?.map(child => (
                        <Link
                          key={child.label}
                          to={child.href}
                          className='hover:bg-primary-50 hover:text-primary-700 block px-5 py-3 text-xs font-bold tracking-wider text-slate-600 uppercase transition-colors'
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
              className='hover:text-primary-600 ml-4 p-3 text-slate-600 transition-colors'
              aria-label='Search'
            >
              <SearchIcon className='h-5 w-5' />
            </Link>
          </div>

          {/* Mobile Buttons */}
          <div className='flex items-center gap-1 lg:hidden'>
            <Link
              to='/search'
              className='p-3 text-slate-600'
              aria-label='Search'
            >
              <SearchIcon className='h-6 w-6' />
            </Link>
            <button
              onClick={toggleMenu}
              className='rounded-xl bg-slate-50 p-3 text-slate-900'
              aria-label='Toggle Menu'
            >
              {isOpen ? (
                <XIcon className='h-6 w-6' />
              ) : (
                <MenuIcon className='h-6 w-6' />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* 3. MOBILE MENU OVERLAY: RESTORED NESTING */}
      {isOpen && (
        <div className='animate-in slide-in-from-right fixed inset-0 top-[104px] z-40 overflow-y-auto bg-white duration-300 lg:hidden'>
          <div className='flex flex-col p-4 pb-20'>
            {mainNavigation.map(item => {
              const hasChildren = item.children && item.children.length > 0;
              const isSubOpen = activeMobileSubmenu === item.label;

              return (
                <div
                  key={item.label}
                  className='border-b border-slate-50 last:border-0'
                >
                  <div className='flex items-center'>
                    <Link
                      to={item.href}
                      onClick={closeMenu}
                      className={cn(
                        'flex-1 p-4 text-lg font-bold transition-colors',
                        isActiveRoute(item.href)
                          ? 'text-primary-600'
                          : 'text-slate-900'
                      )}
                    >
                      {t(`navbar.${item.label.toLowerCase()}`)}
                    </Link>
                    {hasChildren && (
                      <button
                        onClick={e => {
                          e.preventDefault();
                          setActiveMobileSubmenu(isSubOpen ? null : item.label);
                        }}
                        className='p-4 text-slate-400'
                      >
                        <ChevronDownIcon
                          className={cn(
                            'h-6 w-6 transition-transform',
                            isSubOpen && 'rotate-180'
                          )}
                        />
                      </button>
                    )}
                  </div>

                  {/* Mobile Submenu Items */}
                  {hasChildren && isSubOpen && (
                    <div className='animate-in slide-in-from-top-2 mx-2 mb-2 overflow-hidden rounded-2xl bg-slate-50'>
                      {item.children?.map(child => (
                        <Link
                          key={child.label}
                          to={child.href}
                          onClick={closeMenu}
                          className='block border-b border-white p-4 text-sm font-bold text-slate-600 last:border-0'
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
            <div className='mt-4 space-y-1 border-t border-slate-100 pt-4'>
              <Link
                to='/join-us'
                onClick={closeMenu}
                className='text-primary-600 block p-4 text-xs font-black tracking-widest uppercase'
              >
                🚀 Join the Revolution
              </Link>
              <Link
                to='/about'
                onClick={closeMenu}
                className='block p-4 text-xs font-bold tracking-widest text-slate-500 uppercase'
              >
                About Better LB
              </Link>
              <Link
                to='/contact'
                onClick={closeMenu}
                className='block p-4 text-xs font-bold tracking-widest text-slate-500 uppercase'
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

export default Navbar;
