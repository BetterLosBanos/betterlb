import React, { useState } from 'react';
import { X, Menu, ChevronDown, Globe } from 'lucide-react';
import Button from '../ui/Button';
import { useLanguage } from '../../contexts/LanguageContext';
import { mainNavigation } from '../../data/navigation';
import { LanguageType } from '../../types';

const Navbar: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [activeMenu, setActiveMenu] = useState<string | null>(null);
  const { language, setLanguage, translate } = useLanguage();

  const toggleMenu = () => {
    setIsOpen(!isOpen);
    if (isOpen) {
      setActiveMenu(null);
    }
  };

  const toggleSubmenu = (label: string) => {
    setActiveMenu(activeMenu === label ? null : label);
  };

  const changeLanguage = (newLanguage: LanguageType) => {
    setLanguage(newLanguage);
  };

  return (
    <nav className="bg-white shadow-sm sticky top-0 z-50">
      {/* Top bar with language switcher and additional links */}
      <div className="border-b border-gray-200">
        <div className="container mx-auto px-4 flex justify-between items-center h-10">
          <div className="text-xs text-gray-600">The Unofficial Government Portal</div>
          <div className="flex items-center space-x-4">
            <a href="/transparency" className="text-xs text-gray-600 hover:text-primary-600 transition-colors">
              Transparency
            </a>
            <a href="/contact" className="text-xs text-gray-600 hover:text-primary-600 transition-colors">
              Contact
            </a>
            <div className="relative">
              <button 
                className="flex items-center text-xs text-gray-600 hover:text-primary-600 transition-colors"
                onClick={() => changeLanguage(language === 'en' ? 'fil' : 'en')}
              >
                <Globe className="h-3 w-3 mr-1" />
                {language === 'en' ? 'English' : 'Filipino'}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main navigation */}
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center py-4">
          <div className="flex items-center">
            <a href="/" className="flex items-center">
              <img src="/ph-logo.svg" alt="Philippines Coat of Arms" className="h-12 w-12 mr-3" />
              <div>
                <div className="font-bold text-primary-700">BetterGov.ph</div>
                <div className="text-xs text-gray-600">Unofficial Government Portal</div>
              </div>
            </a>
          </div>

          {/* Desktop navigation */}
          <div className="hidden md:flex items-center space-x-8">
            {mainNavigation.map((item) => (
              <div key={item.label} className="relative group">
                <a
                  href={item.href}
                  className="flex items-center text-gray-700 hover:text-primary-600 font-medium transition-colors"
                >
                  {translate(`navbar.${item.label.toLowerCase()}`)}
                  {item.children && (
                    <ChevronDown className="ml-1 h-4 w-4 text-gray-500 group-hover:text-primary-600 transition-colors" />
                  )}
                </a>
                {item.children && (
                  <div className="absolute left-0 mt-2 w-56 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
                    <div className="py-1" role="menu" aria-orientation="vertical">
                      {item.children.map((child) => (
                        <a
                          key={child.label}
                          href={child.href}
                          className="block px-4 py-2 text-sm text-gray-700 hover:bg-primary-50 hover:text-primary-600"
                          role="menuitem"
                        >
                          {child.label}
                        </a>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden flex items-center">
            <button
              onClick={toggleMenu}
              className="inline-flex items-center justify-center p-2 rounded-md text-gray-700 hover:text-primary-500 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-primary-500"
            >
              <span className="sr-only">Open main menu</span>
              {isOpen ? (
                <X className="block h-6 w-6" aria-hidden="true" />
              ) : (
                <Menu className="block h-6 w-6" aria-hidden="true" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      <div className={`md:hidden ${isOpen ? 'block' : 'hidden'}`}>
        <div className="pt-2 pb-4 space-y-1 border-t border-gray-200 bg-white">
          {mainNavigation.map((item) => (
            <div key={item.label}>
              <button
                onClick={() => toggleSubmenu(item.label)}
                className="w-full flex justify-between items-center px-4 py-2 text-base font-medium text-gray-700 hover:bg-gray-50 hover:text-primary-500"
              >
                {translate(`navbar.${item.label.toLowerCase()}`)}
                {item.children && (
                  <ChevronDown className={`h-5 w-5 transition-transform ${activeMenu === item.label ? 'transform rotate-180' : ''}`} />
                )}
              </button>
              {item.children && activeMenu === item.label && (
                <div className="pl-6 py-2 space-y-1 bg-gray-50">
                  {item.children.map((child) => (
                    <a
                      key={child.label}
                      href={child.href}
                      className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 hover:text-primary-500"
                    >
                      {child.label}
                    </a>
                  ))}
                </div>
              )}
            </div>
          ))}
          <div className="px-4 py-3 border-t border-gray-200">
            <div className="flex items-center">
              <Globe className="h-5 w-5 text-gray-500 mr-2" />
              <div className="space-x-2">
                <button
                  onClick={() => changeLanguage('en')}
                  className={`text-sm ${language === 'en' ? 'font-semibold text-primary-600' : 'text-gray-600'}`}
                >
                  English
                </button>
                <span className="text-gray-400">|</span>
                <button
                  onClick={() => changeLanguage('fil')}
                  className={`text-sm ${language === 'fil' ? 'font-semibold text-primary-600' : 'text-gray-600'}`}
                >
                  Filipino
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;