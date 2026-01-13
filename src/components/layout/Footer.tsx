import {
  SiDiscord,
  SiFacebook,
  SiInstagram,
  SiX,
  SiYoutube,
} from '@icons-pack/react-simple-icons';
import { CheckCircle2 } from 'lucide-react';
import { FC, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { footerNavigation } from '../../data/navigation';
import versionData from '../../version.json';

type Version = {
  head_commit: string;
};

const Footer: FC = () => {
  const { t } = useTranslation('common');
  const [version, setVersion] = useState<string | null>(null);

  useEffect(() => {
    try {
      const version = versionData as Version;
      if (version?.head_commit) {
        setVersion(version.head_commit.substring(0, 6)); // only first 6 chars
      }
    } catch (err) {
      console.error('Error loading version.json:', err);
    }
  }, []);

  const getSocialIcon = (label: string) => {
    switch (label) {
      case 'Facebook':
        return <SiFacebook className='w-5 h-5' />;
      case 'Twitter':
        return <SiX className='w-5 h-5' />;
      case 'Instagram':
        return <SiInstagram className='w-5 h-5' />;
      case 'YouTube':
        return <SiYoutube className='w-5 h-5' />;
      case 'Discord':
        return <SiDiscord className='w-5 h-5' />;
      default:
        return null;
    }
  };

  return (
    <footer className='text-white bg-gray-900'>
      <div className='container px-4 pt-12 pb-8 mx-auto'>
        <div className='grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-6'>
          <div className='col-span-1 md:col-span-2'>
            <div className='flex items-center mb-4'>
              <CheckCircle2 className='mr-3 w-12 h-12' />
              {/* <img
                src='/logos/svg/BetterGov_Icon-White.svg'
                alt='BetterGov Logo'
                className='mr-3 w-12 h-12'
              /> */}

              <div>
                <div className='font-bold'>Better Philippines</div>
                <div className='text-xs text-gray-400'>BetterGov.ph Portal</div>
              </div>
            </div>
            <p className='mb-4 text-sm text-gray-400'>
              A community portal providing Philippine citizens, businesses, and
              visitors with information and services.
            </p>
            <div className='flex space-x-4'>
              {footerNavigation.socialLinks.map(link => (
                <Link
                  key={link.label}
                  to={link.href}
                  className='text-gray-400 transition-colors hover:text-white'
                  target='_blank'
                  rel='noopener noreferrer'
                >
                  {getSocialIcon(link.label)}
                </Link>
              ))}
            </div>
          </div>

          {footerNavigation.mainSections.map(section => (
            <div key={section.title}>
              <h3 className='mb-4 text-lg font-semibold'>{section.title}</h3>
              <ul className='space-y-2'>
                {section.links.map(link => (
                  <li key={link.label}>
                    <Link
                      to={link.href}
                      className='text-sm text-gray-400 transition-colors hover:text-white'
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* <div className='flex justify-center my-24'>
          <p className='p-4 px-12 text-sm text-white bg-gray-800 rounded-full border border-gray-700 md:text-lg md:px-8'>
            Cost to build this site to date:{' '}
            <span className='text-red-500 animate-pulse'>₱3,000</span>. Cost to
            the People of the Philippines:{' '}
            <span className='text-green-500'>₱0</span>.
          </p>
        </div> */}

        <div className='pt-8 mt-8 border-t border-gray-800'>
          <div className='flex flex-col justify-between items-center md:flex-row'>
            <p className='mb-4 text-sm text-gray-400 md:mb-0'>
              {version && (
                <span className='mr-4 text-gray-400'>Ver. {version}</span>
              )}
              {t('footer.copyright')}
            </p>
            <div className='flex space-x-6'>
              <Link
                to='https://github.com/miconficker/betterlb'
                className='text-sm text-gray-400 transition-colors hover:text-white'
              >
                Contribute at GitHub
              </Link>
              <Link
                to='/sitemap'
                className='text-sm text-gray-400 transition-colors hover:text-white'
              >
                Sitemap
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
