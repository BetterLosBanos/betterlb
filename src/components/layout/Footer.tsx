import React from 'react';
import { Facebook, Twitter, Instagram, Youtube } from 'lucide-react';
import { useLanguage } from '../../contexts/LanguageContext';
import { footerNavigation } from '../../data/navigation';

const Footer: React.FC = () => {
  const { translate } = useLanguage();

  const getSocialIcon = (label: string) => {
    switch (label) {
      case 'Facebook':
        return <Facebook className="h-5 w-5" />;
      case 'Twitter':
        return <Twitter className="h-5 w-5" />;
      case 'Instagram':
        return <Instagram className="h-5 w-5" />;
      case 'YouTube':
        return <Youtube className="h-5 w-5" />;
      default:
        return null;
    }
  };

  return (
    <footer className="bg-gray-900 text-white">
      <div className="container mx-auto px-4 pt-12 pb-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          <div>
            <div className="flex items-center mb-4">
              <img src="/ph-logo.png" alt="Philippines Coat of Arms" className="h-12 w-12 mr-3" />
              <div>
                <div className="font-bold">Republic of the Philippines</div>
                <div className="text-xs text-gray-400">BetterGov.ph Portal</div>
              </div>
            </div>
            <p className="text-gray-400 text-sm mb-4">
              The unofficial portal of the Philippine government, providing citizens, businesses, and visitors with information and services.
            </p>
            <div className="flex space-x-4">
              {footerNavigation.socialLinks.map((link) => (
                <a
                  key={link.label}
                  href={link.href}
                  className="text-gray-400 hover:text-white transition-colors"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  {getSocialIcon(link.label)}
                </a>
              ))}
            </div>
          </div>

          {footerNavigation.mainSections.map((section) => (
            <div key={section.title}>
              <h3 className="text-lg font-semibold mb-4">{section.title}</h3>
              <ul className="space-y-2">
                {section.links.map((link) => (
                  <li key={link.label}>
                    <a
                      href={link.href}
                      className="text-gray-400 hover:text-white text-sm transition-colors"
                    >
                      {link.label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="border-t border-gray-800 mt-8 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <p className="text-gray-400 text-sm mb-4 md:mb-0">
              {translate('footer.copyright')}
            </p>
            <div className="flex space-x-4">
              <a href="/privacy" className="text-gray-400 hover:text-white text-sm transition-colors">
                Privacy Policy
              </a>
              <a href="/terms" className="text-gray-400 hover:text-white text-sm transition-colors">
                Terms of Use
              </a>
              <a href="/accessibility" className="text-gray-400 hover:text-white text-sm transition-colors">
                Accessibility
              </a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;