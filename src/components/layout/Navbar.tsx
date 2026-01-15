import { ChevronDownIcon, MenuIcon, SearchIcon, XIcon } from 'lucide-react';
import { FC, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Link, useLocation } from 'react-router-dom';
import { mainNavigation } from '../../data/navigation';
import { LANGUAGES } from '../../i18n/languages';
import { LanguageType } from '../../types';
import { cn } from '@/lib/utils';

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
      className='sticky top-0 z-50 bg-white border-b border-slate-200 shadow-xs'
      role='navigation'
    >
      {/* 1. TOP BAR: Responsive & Aligned Right */}
      <div className='border-b bg-slate-50 border-slate-200'>
        <div className='container px-4 mx-auto'>
          <div className='flex gap-3 justify-end items-center h-10 sm:gap-4 md:gap-6'>
            <Link
              to='/join-us'
              className='hidden md:inline-flex text-[10px] md:text-xs font-bold uppercase tracking-widest text-primary-600 hover:text-primary-700 whitespace-nowrap'
            >
              🚀 Join Us
            </Link>
            <Link
              to='/about'
              className='hidden md:inline-flex text-[10px] md:text-xs font-bold uppercase tracking-widest text-slate-500 hover:text-primary-600 whitespace-nowrap'
            >
              About
            </Link>
            <a
              href='https://losbanos.gov.ph'
              target='_blank'
              rel='noreferrer'
              className='inline-flex text-[9px] sm:text-[10px] md:text-xs font-bold uppercase tracking-widest text-slate-500 hover:text-primary-600 whitespace-nowrap'
            >
              <span className='inline sm:hidden'>Gov.ph</span>
              <span className='hidden sm:inline'>Official Gov.ph</span>
            </a>
            <Link
              to='/philippines/hotlines'
              className='inline-flex text-[9px] sm:text-[10px] md:text-xs font-bold uppercase tracking-widest text-slate-500 hover:text-primary-600 whitespace-nowrap'
            >
              Hotlines
            </Link>
            <div className='flex items-center pl-2 border-l border-slate-200 shrink-0'>
              <select
                aria-label='Select Language'
                value={i18n.language}
                onChange={e => changeLanguage(e.target.value as LanguageType)}
                className='bg-transparent text-[9px] sm:text-[10px] md:text-xs font-bold uppercase tracking-widest text-slate-500 outline-none cursor-pointer'
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
      <div className='container px-4 mx-auto'>
        <div className='flex justify-between items-center h-16 md:h-20'>
          {/* Brand/Logo Section (Constrained) */}
          <Link
            to='/'
            className='flex items-center group min-w-0 max-w-[60%] md:max-w-md'
            onClick={closeMenu}
          >
            <img
              src='/logos/webp/betterlb-blue-outline.webp'
              alt='BetterLB Logo'
              className='mr-3 w-10 h-10 transition-transform shrink-0 md:w-12 md:h-12 group-hover:scale-105'
            />
            <div className='flex flex-col justify-center min-w-0'>
              <div className='text-lg font-black tracking-tighter leading-none md:text-xl text-slate-900'>
                BetterLB
              </div>
              <div className='text-[9px] md:text-xs text-slate-500 font-medium leading-tight md:leading-normal line-clamp-2 md:line-clamp-1'>
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
                  className='flex relative items-center h-full'
                  onMouseEnter={() =>
                    hasChildren && setHoveredDropdown(item.label)
                  }
                  onMouseLeave={() => setHoveredDropdown(null)}
                >
                  <Link
                    to={item.href}
                    className={cn(
                      'flex gap-1 items-center px-3 py-2 text-sm font-bold tracking-widest uppercase border-b-2 transition-all',
                      active
                        ? 'text-primary-600 border-primary-600'
                        : 'border-transparent text-slate-600 hover:text-primary-600'
                    )}
                  >
                    {t(`navbar.${item.label.toLowerCase()}`)}
                    {hasChildren && (
                      <ChevronDownIcon
                        className={cn(
                          'w-3 h-3 transition-transform',
                          hoveredDropdown === item.label && 'rotate-180'
                        )}
                      />
                    )}
                  </Link>

                  {/* Desktop Dropdown Menu */}
                  {hasChildren && hoveredDropdown === item.label && (
                    <div className='absolute left-0 top-full py-2 w-64 bg-white rounded-b-xl border shadow-xl duration-200 border-slate-100 animate-in fade-in slide-in-from-top-2'>
                      {item.children?.map(child => (
                        <Link
                          key={child.label}
                          to={child.href}
                          className='block px-5 py-3 text-xs font-bold tracking-wider uppercase transition-colors text-slate-600 hover:bg-primary-50 hover:text-primary-700'
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
              className='p-3 ml-4 transition-colors text-slate-600 hover:text-primary-600'
              aria-label='Search'
            >
              <SearchIcon className='w-5 h-5' />
            </Link>
          </div>

          {/* Mobile Buttons */}
          <div className='flex gap-1 items-center lg:hidden'>
            <Link
              to='/search'
              className='p-3 text-slate-600'
              aria-label='Search'
            >
              <SearchIcon className='w-6 h-6' />
            </Link>
            <button
              onClick={toggleMenu}
              className='p-3 rounded-xl text-slate-900 bg-slate-50'
              aria-label='Toggle Menu'
            >
              {isOpen ? (
                <XIcon className='w-6 h-6' />
              ) : (
                <MenuIcon className='w-6 h-6' />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* 3. MOBILE MENU OVERLAY: RESTORED NESTING */}
      {isOpen && (
        <div className='fixed inset-0 top-[104px] z-40 bg-white lg:hidden overflow-y-auto animate-in slide-in-from-right duration-300'>
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
                            'w-6 h-6 transition-transform',
                            isSubOpen && 'rotate-180'
                          )}
                        />
                      </button>
                    )}
                  </div>

                  {/* Mobile Submenu Items */}
                  {hasChildren && isSubOpen && (
                    <div className='overflow-hidden mx-2 mb-2 rounded-2xl bg-slate-50 animate-in slide-in-from-top-2'>
                      {item.children?.map(child => (
                        <Link
                          key={child.label}
                          to={child.href}
                          onClick={closeMenu}
                          className='block p-4 text-sm font-bold border-b border-white text-slate-600 last:border-0'
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
            <div className='pt-4 mt-4 space-y-1 border-t border-slate-100'>
              <Link
                to='/join-us'
                onClick={closeMenu}
                className='block p-4 text-xs font-black tracking-widest uppercase text-primary-600'
              >
                🚀 Join the Revolution
              </Link>
              <Link
                to='/about'
                onClick={closeMenu}
                className='block p-4 text-xs font-bold tracking-widest uppercase text-slate-500'
              >
                About Better LB
              </Link>
              <Link
                to='/contact'
                onClick={closeMenu}
                className='block p-4 text-xs font-bold tracking-widest uppercase text-slate-500'
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
