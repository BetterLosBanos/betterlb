import React from 'react';
import { Search } from 'lucide-react';
import { useLanguage } from '../../contexts/LanguageContext';
import SearchInput from '../ui/SearchInput';
import Button from '../ui/Button';

const Hero: React.FC = () => {
  const { translate } = useLanguage();

  const handleSearch = (query: string) => {
    console.log('Searching for:', query);
    // Implementation for search functionality
  };

  const popularServices = [
    {
      label: 'National ID',
      href: '/services?category=Certificates+and+IDs&subcategory=ID',
    },
    {
      label: 'Birth Certificate',
      href: '/services?category=Certificates+and+IDs&subcategory=Certificates',
    },
    {
      label: 'Business Registration',
      href: '/services?category=Business+and+Trade&subcategory=Business+Registration%2C+Certificates+and+Compliance',
    },
  ];

  return (
    <div className="bg-gradient-to-r from-primary-600 to-primary-700 text-white py-12 md:py-24">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
          {/* Left section with title and search */}
          <div className="animate-fade-in">
            <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-4 leading-tight">
              {translate('hero.title')}
            </h1>
            <p className="text-lg opacity-90 mb-8 max-w-lg">
              {translate('hero.subtitle')}
            </p>
            <div className="bg-white rounded-lg p-1 shadow-lg">
              <SearchInput
                placeholder={translate('hero.search')}
                onSearch={handleSearch}
                size="lg"
                className="w-full"
                icon={<Search className="h-5 w-5 text-primary-500" />}
              />
            </div>
            <div className="mt-4 flex flex-wrap gap-2">
              {popularServices.map((service) => (
                <Button
                  key={service.label}
                  variant="outline"
                  className="bg-white/10 text-white border-white/20 hover:bg-white/20"
                  href={service.href}
                >
                  {service.label}
                </Button>
              ))}
            </div>
          </div>

          {/* Right section with quick access services */}
          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 shadow-lg animate-slide-in">
            <h2 className="text-2xl font-semibold mb-4">{translate('services.title')}</h2>
            <div className="grid grid-cols-2 gap-4">
              <a
                href="/services?category=Certificates+and+IDs"
                className="bg-white/10 hover:bg-white/20 rounded-lg p-4 transition-all duration-200 flex flex-col items-center text-center"
              >
                <div className="bg-primary-500 p-3 rounded-full mb-3">
                  <svg className="h-6 w-6 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                    <circle cx="12" cy="7" r="4"></circle>
                  </svg>
                </div>
                <span className="font-medium">Citizenship & ID</span>
              </a>
              <a
                href="/services?category=Business+and+Trade"
                className="bg-white/10 hover:bg-white/20 rounded-lg p-4 transition-all duration-200 flex flex-col items-center text-center"
              >
                <div className="bg-primary-500 p-3 rounded-full mb-3">
                  <svg className="h-6 w-6 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="2" y="7" width="20" height="14" rx="2" ry="2"></rect>
                    <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"></path>
                  </svg>
                </div>
                <span className="font-medium">Business</span>
              </a>
              <a
                href="/services?category=Education"
                className="bg-white/10 hover:bg-white/20 rounded-lg p-4 transition-all duration-200 flex flex-col items-center text-center"
              >
                <div className="bg-primary-500 p-3 rounded-full mb-3">
                  <svg className="h-6 w-6 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M22 10v6M2 10l10-5 10 5-10 5z"></path>
                    <path d="M6 12v5c0 2 2 3 6 3s6-1 6-3v-5"></path>
                  </svg>
                </div>
                <span className="font-medium">Education</span>
              </a>
              <a
                href="/services?category=Health"
                className="bg-white/10 hover:bg-white/20 rounded-lg p-4 transition-all duration-200 flex flex-col items-center text-center"
              >
                <div className="bg-primary-500 p-3 rounded-full mb-3">
                  <svg className="h-6 w-6 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M22 12h-4l-3 9L9 3l-3 9H2"></path>
                  </svg>
                </div>
                <span className="font-medium">Health</span>
              </a>
            </div>
            <div className="mt-4">
              <Button
                fullWidth
                className="bg-white text-primary-600 hover:bg-gray-100"
                href="/services"
              >
                View All Services
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Hero;