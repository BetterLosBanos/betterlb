import { FC } from 'react';

import { Link } from 'react-router-dom';

import {
  SiDiscord,
  SiFacebook,
  SiGithub,
  SiInstagram,
  SiYoutube,
} from '@icons-pack/react-simple-icons';
import { useTranslation } from 'react-i18next';

import { config } from '@/lib/lguConfig';

import { footerNavigation } from '../../data/navigation';

const Footer: FC = () => {
  const { t } = useTranslation('common');

  const getSocialIcon = (label: string) => {
    switch (label) {
      case 'Facebook':
        return <SiFacebook className='h-5 w-5' />;
      case 'Instagram':
        return <SiInstagram className='h-5 w-5' />;
      case 'YouTube':
        return <SiYoutube className='h-5 w-5' />;
      case 'Discord':
        return <SiDiscord className='h-5 w-5' />;
      case 'GitHub':
        return <SiGithub className='h-5 w-5' />;
      default:
        return null;
    }
  };

  return (
    <footer className='selection:bg-kapwa-bg-brand-default bg-kapwa-bg-surface-bold text-kapwa-text-inverse selection:text-kapwa-text-inverse'>
      <div className='container mx-auto px-4 pt-16 pb-12'>
        <div className='grid grid-cols-1 gap-x-8 gap-y-12 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6'>
          {/* Brand Column */}
          <div className='col-span-2 space-y-6 md:col-span-3 lg:col-span-2'>
            <div className='flex items-center'>
              <img
                src={config.portal.logoWhitePath}
                alt='BetterLB'
                className='mr-4 h-12 w-12'
              />
              <div>
                <div className='text-xl font-black tracking-tighter'>
                  {config.portal.footerBrandName}
                </div>
                <div className='text-[10px] font-bold tracking-widest text-kapwa-text-disabled uppercase'>
                  {config.portal.footerTagline}
                </div>
              </div>
            </div>
            <p className='max-w-sm text-sm leading-relaxed text-kapwa-text-disabled'>
              An open-source initiative providing transparent access to
              municipal services, local legislation, and public data for the
              people of {config.lgu.name}.
            </p>
            <div className='flex space-x-4'>
              {footerNavigation.socialLinks.map(link => (
                <Link
                  key={link.label}
                  to={link.href}
                  className='text-kapwa-text-disabled transition-colors hover:text-kapwa-text-inverse'
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
              <h3 className='mb-6 text-[10px] font-bold tracking-[0.2em] text-kapwa-text-disabled uppercase'>
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
                        className='hover:text-kapwa-text-link-hover flex items-center gap-1 text-sm text-kapwa-text-support transition-colors'
                      >
                        {link.label}
                      </a>
                    ) : (
                      <Link
                        to={link.href}
                        className='hover:text-kapwa-text-link-hover text-sm text-kapwa-text-support transition-colors'
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
        <div className='mt-20 flex justify-center'>
          <div className='inline-flex flex-col items-center gap-2 rounded-full border border-kapwa-border-strong bg-kapwa-bg-surface-raised/50 px-6 py-4 text-center md:flex-row md:gap-4'>
            <p className='text-xs font-medium text-kapwa-text-support md:text-sm'>
              Built by the community for the community.
            </p>
            <span className='hidden h-1 w-1 rounded-full bg-kapwa-border-strong md:block' />
            <p className='text-xs font-bold md:text-sm'>
              Cost to the People of Los Baños ={' '}
              <span className='text-kapwa-text-success'>₱0</span>
            </p>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className='mt-16 flex flex-col items-center justify-between gap-6 border-t border-kapwa-border-strong pt-8 md:flex-row'>
          <p className='text-[10px] font-bold tracking-widest text-kapwa-text-disabled uppercase'>
            {t('footer.copyright')}
          </p>
          <div className='flex gap-6'>
            <a
              href='https://github.com/BetterLosBanos/betterlb'
              target='_blank'
              rel='noreferrer'
              className='text-[10px] font-bold tracking-widest text-kapwa-text-disabled uppercase hover:text-kapwa-text-inverse'
            >
              GitHub
            </a>
            <Link
              to='/sitemap'
              className='text-[10px] font-bold tracking-widest text-kapwa-text-disabled uppercase hover:text-kapwa-text-inverse'
            >
              Sitemap
            </Link>
            {/* <Link to='/accessibility' className='text-[10px] font-bold text-kapwa-text-disabled hover:text-kapwa-text-inverse uppercase tracking-widest'>Accessibility</Link> */}
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
