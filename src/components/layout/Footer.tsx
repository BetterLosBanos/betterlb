import {
  SiDiscord,
  SiFacebook,
  SiInstagram,
  SiYoutube,
  SiGithub,
} from '@icons-pack/react-simple-icons';
import { FC } from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { footerNavigation } from '../../data/navigation';

const Footer: FC = () => {
  const { t } = useTranslation('common');

  const getSocialIcon = (label: string) => {
    switch (label) {
      case 'Facebook':
        return <SiFacebook className='w-5 h-5' />;
      case 'Instagram':
        return <SiInstagram className='w-5 h-5' />;
      case 'YouTube':
        return <SiYoutube className='w-5 h-5' />;
      case 'Discord':
        return <SiDiscord className='w-5 h-5' />;
      case 'GitHub':
        return <SiGithub className='w-5 h-5' />;
      default:
        return null;
    }
  };

  return (
    <footer className='text-white bg-gray-900 selection:bg-primary-500 selection:text-white'>
      <div className='container px-4 pt-16 pb-12 mx-auto'>
        <div className='grid grid-cols-1 gap-x-8 gap-y-12 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6'>
          {/* Brand Column */}
          <div className='col-span-2 space-y-6 md:col-span-3 lg:col-span-2'>
            <div className='flex items-center'>
              <img
                src='/logos/webp/betterlb-white-outline.webp'
                alt='BetterLB'
                className='mr-4 w-12 h-12'
              />
              <div>
                <div className='text-xl font-black tracking-tighter'>
                  Better Los Baños
                </div>
                <div className='text-[10px] font-bold text-slate-400 uppercase tracking-widest'>
                  Community Civic Portal
                </div>
              </div>
            </div>
            <p className='max-w-sm text-sm leading-relaxed text-slate-400'>
              An open-source initiative providing transparent access to
              municipal services, local legislation, and public data for the
              people of Los Baños.
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

          {/* Navigation Columns */}
          {footerNavigation.mainSections.map(section => (
            <div key={section.title} className='col-span-1'>
              <h3 className='text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] mb-6'>
                {section.title}
              </h3>
              <ul className='space-y-4'>
                {section.links.map(link => (
                  <li key={link.label}>
                    {link.href.startsWith('http') ? (
                      <a
                        href={link.href}
                        target='_blank'
                        rel='noreferrer'
                        className='flex gap-1 items-center text-sm transition-colors text-slate-300 hover:text-primary-400'
                      >
                        {link.label}
                      </a>
                    ) : (
                      <Link
                        to={link.href}
                        className='text-sm transition-colors text-slate-300 hover:text-primary-400'
                      >
                        {link.label}
                      </Link>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* 3. The Signature BetterGov "Cost Statement" */}
        <div className='flex justify-center mt-20'>
          <div className='inline-flex flex-col gap-2 items-center px-6 py-4 text-center rounded-full border md:flex-row md:gap-4 bg-slate-800/50 border-slate-800'>
            <p className='text-xs font-medium md:text-sm text-slate-300'>
              Built by the community for the community.
            </p>
            <span className='hidden w-1 h-1 rounded-full md:block bg-slate-600' />
            <p className='text-xs font-bold md:text-sm'>
              Cost to the People of Los Baños ={' '}
              <span className='text-green-500'>₱0</span>
            </p>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className='flex flex-col gap-6 justify-between items-center pt-8 mt-16 border-t border-slate-800 md:flex-row'>
          <p className='text-[10px] font-bold text-slate-400 uppercase tracking-widest'>
            {t('footer.copyright')}
          </p>
          <div className='flex gap-6'>
            <a
              href='https://github.com/BetterLosBanos/betterlb'
              target='_blank'
              rel='noreferrer'
              className='text-[10px] font-bold text-slate-400 hover:text-white uppercase tracking-widest'
            >
              GitHub
            </a>
            <Link
              to='/sitemap'
              className='text-[10px] font-bold text-slate-400 hover:text-white uppercase tracking-widest'
            >
              Sitemap
            </Link>
            {/* <Link to='/accessibility' className='text-[10px] font-bold text-slate-400 hover:text-white uppercase tracking-widest'>Accessibility</Link> */}
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
