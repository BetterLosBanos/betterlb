import { FC } from 'react';

import { Link } from 'react-router-dom';

import { Button } from '@bettergov/kapwa/button';
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

import { Card, CardContent } from '@/components/ui/Card';

const AboutPage: FC = () => {
  const { t } = useTranslation('about');
  return (
    <div className='bg-kapwa-bg-surface-raised min-h-screen'>
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
        <div className='bg-kapwa-bg-surface mt-4 rounded-lg border p-6 shadow-xs md:p-8 md:py-24'>
          <div className='mx-auto max-w-3xl'>
            <h1 className='text-kapwa-text-strong mb-6 text-3xl font-bold md:text-4xl'>
              {t('title')}
            </h1>

            <div className='prose prose-lg max-w-none'>
              <section className='mb-10'>
                <h2 className='text-kapwa-text-support mb-4 flex items-center text-2xl font-bold'>
                  <TargetIcon className='text-kapwa-text-brand mr-2 h-6 w-6' />
                  {t('mission.title')}
                </h2>
                <div className='bg-kapwa-bg-surface-brand/30 mb-6 rounded-xl p-6 md:p-8'>
                  <p className='text-kapwa-text-support mb-4 text-lg leading-relaxed'>
                    BetterGov is a{' '}
                    <strong>volunteer-led tech initiative</strong> committed to
                    creating
                    <span className='bg-kapwa-bg-brand-default text-kapwa-text-inverse mx-2 inline-flex items-center rounded-full px-3 py-1 text-sm font-semibold'>
                      <ZapIcon className='mr-1 h-4 w-4' />
                      #civictech
                    </span>
                    projects aimed at making government more transparent,
                    efficient, and accessible to citizens.
                  </p>
                  <p className='text-kapwa-text-support mb-4 text-lg leading-relaxed'>
                    Our goal is to{' '}
                    <strong>support, promote, consolidate, and empower</strong>{' '}
                    citizen builders!
                  </p>
                </div>
              </section>

              <section className='mb-10'>
                <h2 className='text-kapwa-text-support mb-4 flex items-center text-2xl font-bold'>
                  <RocketIcon className='text-kapwa-text-brand mr-2 h-6 w-6' />
                  {t('mission.goalsIntro')}
                </h2>

                <ul className='text-kapwa-text-support mb-6 list-disc pl-6'>
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
                <h2 className='text-kapwa-text-support mb-4 flex items-center text-2xl font-bold'>
                  <RocketIcon className='text-kapwa-text-brand mr-2 h-6 w-6' />
                  What We Provide
                </h2>
                <p className='text-kapwa-text-support mb-6'>
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
                    <Card key={index} hover className='bg-kapwa-bg-surface'>
                      <CardContent className='p-5'>
                        <div className='bg-kapwa-bg-surface-brand-weak mb-3 flex h-12 w-12 items-center justify-center rounded-lg'>
                          <item.icon className='text-kapwa-text-brand h-6 w-6' />
                        </div>
                        <h3 className='text-kapwa-text-strong mb-2 text-base font-semibold'>
                          {item.title}
                        </h3>
                        <p className='text-kapwa-text-on-disabled text-sm'>
                          {item.desc}
                        </p>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </section>

              <section className='mb-10'>
                <h2 className='text-kapwa-text-support mb-4 text-2xl font-bold'>
                  {t('whyBuilding.title')}
                </h2>
                <p className='text-kapwa-text-support mb-4'>
                  {t('whyBuilding.intro')}
                  <a
                    href='https://www.gov.ph'
                    className='text-kapwa-text-brand mx-1 hover:opacity-80'
                  >
                    {t('whyBuilding.govPhLink')}
                  </a>
                  {t('whyBuilding.challenges')}
                </p>
                <ul className='text-kapwa-text-support mb-6 list-disc pl-6 leading-relaxed'>
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
                <p className='text-kapwa-text-support'>
                  {t('whyBuilding.conclusion')}
                </p>
              </section>

              {/* Our Commitment Section */}
              <section className='mb-10'>
                <h2 className='text-kapwa-text-support mb-4 flex items-center text-2xl font-bold'>
                  <ZapIcon className='text-kapwa-text-warning mr-2 h-6 w-6' />
                  Our Commitment
                </h2>
                <div className='border-kapwa-border-brand bg-gradient-to-r from-kapwa-bg-danger-weak via-kapwa-bg-accent-orange-weak to-kapwa-bg-warning-weak rounded-xl border-l-4 p-6 md:p-8'>
                  <div className='text-kapwa-text-support space-y-4'>
                    <p className='text-kapwa-text-brand text-lg font-bold'>
                      WE&apos;RE DONE WAITING.
                    </p>
                    <p className='text-base leading-relaxed'>
                      We&apos;re angry. You&apos;re angry. But we can contribute
                      in our own ways —{' '}
                      <strong>no matter how little it is</strong>.
                    </p>
                    <p className='text-base leading-relaxed'>
                      We can do <strong>amazing things</strong> together.{' '}
                      <span className='text-kapwa-text-brand font-semibold'>
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
                    <div className='border-kapwa-border-brand mt-6 border-t-2 pt-4'>
                      <p className='text-kapwa-text-brand text-lg font-bold'>
                        WE&apos;RE LOOKING FOR PEOPLE SMARTER THAN US!
                      </p>
                    </div>
                  </div>
                </div>
              </section>
              <section>
                <h2 className='text-kapwa-text-support mb-4 text-2xl font-bold'>
                  {t('license.title')}
                </h2>
                <p className='text-kapwa-text-support mb-4'>
                  {t('license.description')}
                  <a
                    href='https://creativecommons.org/publicdomain/zero/1.0/'
                    className='text-kapwa-text-brand mx-1 hover:opacity-80'
                  >
                    {t('license.ccLink')}
                  </a>
                  {t('license.explanation')}
                </p>
              </section>
            </div>

            {/* Call to Action */}
            <div className='bg-kapwa-bg-brand-default mt-8 rounded-lg p-8 text-center'>
              <h3 className='text-kapwa-text-inverse mb-4 text-2xl font-bold'>
                Ready to Make a Difference?
              </h3>
              <p className='text-kapwa-text-inverse mx-auto mb-6 max-w-2xl opacity-90'>
                Join our community of builders, dreamers, and changemakers.
              </p>
              <div className='flex flex-col justify-center gap-4 sm:flex-row'>
                <Link to='/contact'>
                  <Button
                    className='bg-kapwa-bg-accent-yellow-default hover:bg-kapwa-accent-yellow-hover text-kapwa-text-brand hover:opacity-90'
                    size='lg'
                    leftIcon={<MessageCircleIcon className='h-5 w-5' />}
                  >
                    Contacts
                  </Button>
                </Link>
                <span className='text-kapwa-text-inverse flex items-center justify-center'>
                  or
                </span>
                <Link to='/join-us'>
                  <Button
                    className='text-kapwa-text-inverse border-kapwa-border-inverse hover:bg-kapwa-bg-surface hover:border-kapwa-border-weak hover:text-kapwa-text-brand hover:opacity-80'
                    size='lg'
                    variant='outline'
                    leftIcon={<LightbulbIcon className='h-5 w-5' />}
                  >
                    Join Us
                  </Button>
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
