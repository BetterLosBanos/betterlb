import { FC } from 'react';

import { Link } from 'react-router-dom';

import {
  BuildingIcon,
  GlobeIcon,
  HeartIcon,
  LightbulbIcon,
  MessageCircleIcon,
  RocketIcon,
  ServerIcon,
  StarIcon,
  TargetIcon,
  UsersIcon,
  ZapIcon,
} from 'lucide-react';
import { Helmet } from 'react-helmet-async';
import { useTranslation } from 'react-i18next';

const AboutPage: FC = () => {
  const { t } = useTranslation('about');
  return (
    <div className='min-h-screen bg-gray-50'>
      <Helmet>
        <title>About | BetterGov.ph</title>
        <meta
          name='description'
          content='BetterGov is a volunteer-led tech initiative committed to creating #civictech projects aimed at making government more transparent, efficient, and accessible to citizens.'
        />
        <meta
          name='keywords'
          content='government projects, civic tech, transparency, accountability, Philippines, innovation'
        />
        <link rel='canonical' href='https://bettergov.ph/about' />

        {/* Open Graph / Social */}
        <meta property='og:title' content='About | BetterGov.ph' />
        <meta
          property='og:description'
          content='BetterGov is a volunteer-led tech initiative committed to creating #civictech projects aimed at making government more transparent, efficient, and accessible to citizens.'
        />
        <meta property='og:type' content='website' />
        <meta property='og:url' content='https://bettergov.ph/about' />
        <meta property='og:image' content='https://bettergov.ph/ph-logo.png' />
      </Helmet>
      <div className='container mx-auto px-4 py-6 md:py-8'>
        <div className='mt-4 rounded-lg border bg-white p-6 shadow-xs md:p-8 md:py-24'>
          <div className='mx-auto max-w-3xl'>
            <h1 className='mb-6 text-3xl font-bold text-gray-900 md:text-4xl'>
              {t('title')}
            </h1>

            <div className='prose prose-lg max-w-none'>
              <section className='mb-10'>
                <h2 className='mb-4 flex items-center text-2xl font-bold text-gray-800'>
                  <TargetIcon className='text-primary-600 mr-2 h-6 w-6' />
                  {t('mission.title')}
                </h2>
                <div className='from-primary-50 mb-6 rounded-xl bg-gradient-to-r to-blue-50 p-6 md:p-8'>
                  <p className='mb-4 text-lg leading-relaxed text-gray-800'>
                    BetterGov is a{' '}
                    <strong>volunteer-led tech initiative</strong> committed to
                    creating
                    <span className='bg-primary-600 mx-2 inline-flex items-center rounded-full px-3 py-1 text-sm font-semibold text-white'>
                      <ZapIcon className='mr-1 h-4 w-4' />
                      #civictech
                    </span>
                    projects aimed at making government more transparent,
                    efficient, and accessible to citizens.
                  </p>
                  <p className='mb-4 text-lg leading-relaxed text-gray-800'>
                    Our goal is to{' '}
                    <strong>support, promote, consolidate, and empower</strong>{' '}
                    citizen builders!
                  </p>
                </div>
              </section>

              <section className='mb-10'>
                <h2 className='mb-4 flex items-center text-2xl font-bold text-gray-800'>
                  <RocketIcon className='text-primary-600 mr-2 h-6 w-6' />
                  {t('mission.goalsIntro')}
                </h2>

                <ul className='mb-6 list-disc pl-6 text-gray-700'>
                  {(
                    t('mission.goalsList', { returnObjects: true }) as string[]
                  ).map((goal: string, index: number) => (
                    <li key={index} className='mb-2'>
                      {goal}
                    </li>
                  ))}
                </ul>
              </section>

              {/* What We Provide Section */}
              <section className='mb-10'>
                <h2 className='mb-4 flex items-center text-2xl font-bold text-gray-800'>
                  <RocketIcon className='text-primary-600 mr-2 h-6 w-6' />
                  What We Provide
                </h2>
                <p className='mb-6 text-gray-700'>
                  To support citizen builders in building impactful civic tech
                  projects:
                </p>
                <div className='mb-6 grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3'>
                  {[
                    {
                      icon: ServerIcon,
                      title: 'Infrastructure & Tools',
                      desc: 'Servers, AI credits, development tools, and more!',
                    },
                    {
                      icon: UsersIcon,
                      title: 'Tech Hackathons',
                      desc: 'Regular events to collaborate and build together',
                    },
                    {
                      icon: GlobeIcon,
                      title: 'Data & APIs',
                      desc: 'Access to government data and API endpoints',
                    },
                    {
                      icon: HeartIcon,
                      title: 'Find Your Team',
                      desc: 'Connect with the right people and resource persons',
                    },
                    {
                      icon: StarIcon,
                      title: 'Industry Mentorship',
                      desc: 'Guidance from seasoned tech and startup veterans',
                    },
                    {
                      icon: BuildingIcon,
                      title: 'Office Space',
                      desc: 'Physical workspace for collaboration and meetings',
                    },
                  ].map((item, index) => (
                    <div
                      key={index}
                      className='rounded-lg border bg-white p-5 transition-all hover:shadow-md'
                    >
                      <div className='bg-primary-100 mb-3 flex h-12 w-12 items-center justify-center rounded-lg'>
                        <item.icon className='text-primary-600 h-6 w-6' />
                      </div>
                      <h3 className='mb-2 text-base font-semibold text-gray-900'>
                        {item.title}
                      </h3>
                      <p className='text-sm text-gray-600'>{item.desc}</p>
                    </div>
                  ))}
                </div>
              </section>

              <section className='mb-10'>
                <h2 className='mb-4 text-2xl font-bold text-gray-800'>
                  {t('whyBuilding.title')}
                </h2>
                <p className='mb-4 text-gray-700'>
                  {t('whyBuilding.intro')}
                  <a
                    href='https://www.gov.ph'
                    className='mx-1 text-blue-600 hover:text-blue-800'
                  >
                    {t('whyBuilding.govPhLink')}
                  </a>
                  {t('whyBuilding.challenges')}
                </p>
                <ul className='mb-6 list-disc pl-6 leading-relaxed text-gray-700'>
                  {(
                    t('whyBuilding.challengesList', {
                      returnObjects: true,
                    }) as string[]
                  ).map((challenge: string, index: number) => (
                    <li key={index} className='mb-2'>
                      {challenge}
                    </li>
                  ))}
                </ul>
                <p className='text-gray-700'>{t('whyBuilding.conclusion')}</p>
              </section>

              {/* Our Commitment Section */}
              <section className='mb-10'>
                <h2 className='mb-4 flex items-center text-2xl font-bold text-gray-800'>
                  <ZapIcon className='mr-2 h-6 w-6 text-yellow-500' />
                  Our Commitment
                </h2>
                <div className='border-primary-600 rounded-xl border-l-4 bg-gradient-to-r from-red-50 via-orange-50 to-yellow-50 p-6 md:p-8'>
                  <div className='space-y-4 text-gray-800'>
                    <p className='text-primary-700 text-lg font-bold'>
                      WE&apos;RE DONE WAITING.
                    </p>
                    <p className='text-base leading-relaxed'>
                      We&apos;re angry. You&apos;re angry. But we can contribute
                      in our own ways —{' '}
                      <strong>no matter how little it is</strong>.
                    </p>
                    <p className='text-base leading-relaxed'>
                      We can do <strong>amazing things</strong> together.{' '}
                      <span className='text-primary-700 font-semibold'>
                        Grassroots style. Open source. No permission needed.
                      </span>
                    </p>
                    <p className='text-base leading-relaxed'>
                      We are committed to putting{' '}
                      <strong>time, resources, and money</strong> into this
                      initiative. We will keep building{' '}
                      <strong>relentlessly</strong> without anyone&apos;s
                      permission. Open source, public,{' '}
                      <strong>high quality</strong> sites.
                    </p>
                    <div className='border-primary-200 mt-6 border-t-2 pt-4'>
                      <p className='text-primary-700 text-lg font-bold'>
                        WE&apos;RE LOOKING FOR PEOPLE SMARTER THAN US!
                      </p>
                    </div>
                  </div>
                </div>
              </section>
              <section>
                <h2 className='mb-4 text-2xl font-bold text-gray-800'>
                  {t('license.title')}
                </h2>
                <p className='mb-4 text-gray-700'>
                  {t('license.description')}
                  <a
                    href='https://creativecommons.org/publicdomain/zero/1.0/'
                    className='mx-1 text-blue-600 hover:text-blue-800'
                  >
                    {t('license.ccLink')}
                  </a>
                  {t('license.explanation')}
                </p>
              </section>
            </div>

            {/* Call to Action */}
            <div className='mt-8 rounded-lg bg-blue-600 p-8 text-center'>
              <h3 className='mb-4 text-2xl font-bold text-white'>
                Ready to Make a Difference?
              </h3>
              <p className='mx-auto mb-6 max-w-2xl text-blue-100'>
                Join our community of builders, dreamers, and changemakers.
              </p>
              <div className='flex flex-col justify-center gap-4 sm:flex-row'>
                <Link
                  to='/contact'
                  className='inline-flex items-center rounded-lg bg-yellow-400 px-6 py-3 font-semibold text-blue-900 transition-colors hover:bg-yellow-500'
                >
                  <MessageCircleIcon className='mr-2 h-5 w-5' />
                  Contacts
                </Link>
                <span className='flex items-center justify-center text-white'>
                  or
                </span>
                <Link
                  to='/join-us'
                  className='inline-flex items-center rounded-lg border-2 border-white bg-transparent px-6 py-3 font-semibold text-white transition-colors hover:bg-white hover:text-blue-600'
                >
                  <LightbulbIcon className='mr-2 h-5 w-5' />
                  Join Us
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AboutPage;
