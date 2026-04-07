import { FC } from 'react';

import { Button } from '@bettergov/kapwa/button';
import {
  ArrowRightIcon,
  BuildingIcon,
  CodeIcon,
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

const JoinUs: FC = () => {
  return (
    <div className='min-h-screen bg-linear-to-br from-kapwa-blue-50 via-white to-kapwa-purple-50'>
      <Helmet>
        <title>Join Us | BetterGov.ph</title>
        <meta
          name='description'
          content='Join BetterGov.ph—A volunteer-led civic tech initiative building open-source tools to make government more transparent, efficient, and accessible.'
        />
        <link rel='canonical' href='https://bettergov.ph/join-us' />
        <meta property='og:title' content='Join Us | BetterGov.ph' />
        <meta
          property='og:description'
          content='Be part of a volunteer-led civic tech initiative building open-source projects for a better government.'
        />
        <meta property='og:type' content='website' />
        <meta property='og:url' content='https://bettergov.ph/join-us' />
        <meta property='og:image' content='https://bettergov.ph/ph-logo.webp' />
      </Helmet>

      {/* Hero Section */}
      <section className='from-kapwa-brand-600 text-kapwa-text-inverse relative overflow-hidden bg-linear-to-r via-kapwa-blue-700 to-kapwa-purple-700'>
        <div className='bg-kapwa-bg-surface-bold absolute inset-0 opacity-10'></div>
        <div className='relative z-10 container mx-auto px-4 py-16 md:py-24'>
          <div className='mx-auto max-w-4xl text-center'>
            <div className='mb-6 flex justify-center'>
              <div className='bg-kapwa-bg-surface/20 rounded-full p-4 backdrop-blur-sm'>
                <UsersIcon className='text-kapwa-text-inverse h-12 w-12' />
              </div>
            </div>
            <h1 className='mb-6 text-4xl leading-tight font-bold md:text-6xl'>
              Join the{' '}
              <span className='text-kapwa-text-accent-yellow'>#CivicTech</span>{' '}
              Revolution
            </h1>
            <p className='mb-8 kapwa-body leading-relaxed text-kapwa-text-inverse/80'>
              Together with industry veterans, we&apos;re building{' '}
              <strong>BetterGov.ph</strong> — making government transparent,
              efficient, and accessible to every Filipino.
            </p>
            <div className='flex flex-col justify-center gap-4 sm:flex-row'>
              <Button
                href='https://discord.gg/mHtThpN8bT'
                target='_blank'
                rel='noreferrer'
                variant='secondary'
                size='lg'
                leftIcon={<MessageCircleIcon className='h-5 w-5' />}
                className='text-kapwa-text-strong transform rounded-lg bg-kapwa-bg-accent-yellow-weak px-8 py-4 shadow-lg transition-all hover:scale-105'
              >
                Join Our Discord
              </Button>
              <Button
                href='#mission'
                variant='outline'
                size='lg'
                rightIcon={<ArrowRightIcon className='h-5 w-5' />}
                className='hover:text-kapwa-text-brand text-kapwa-text-inverse hover:bg-kapwa-bg-surface rounded-lg border-2 border-white px-8 py-4'
              >
                Learn More
              </Button>
            </div>
          </div>
        </div>
        {/* Decorative elements */}
        <div className='absolute top-20 left-10 opacity-20'>
          <CodeIcon className='text-kapwa-text-inverse h-24 w-24' />
        </div>
        <div className='absolute right-10 bottom-20 opacity-20'>
          <RocketIcon className='text-kapwa-text-inverse h-32 w-32' />
        </div>
      </section>

      {/* Mission Section */}
      <section id='mission' className='bg-kapwa-bg-surface py-16 md:py-20'>
        <div className='container mx-auto px-4'>
          <div className='mb-12 text-center'>
            <div className='bg-kapwa-bg-brand-weak mb-4 inline-flex items-center justify-center rounded-full p-3'>
              <TargetIcon className='text-kapwa-text-brand h-8 w-8' />
            </div>
            <h2 className='text-kapwa-text-strong mb-4 kapwa-heading-lg font-bold'>
              Our Mission
            </h2>
            <p className='text-kapwa-text-support mx-auto max-w-3xl text-xl'>
              We&apos;re not just building websites — we&apos;re building the
              future of governance in the Philippines.
            </p>
          </div>

          <div className='mx-auto max-w-4xl'>
            <div className='from-kapwa-brand-50 mb-8 rounded-2xl bg-linear-to-r to-kapwa-blue-50 p-8 md:p-12'>
              <p className='text-kapwa-text-support mb-6 text-lg leading-relaxed'>
                BetterGov is a <strong>volunteer-led tech initiative</strong>{' '}
                committed to creating
                <span className='bg-kapwa-bg-brand-default text-kapwa-text-inverse mx-2 inline-flex items-center rounded-full px-3 py-1 text-sm font-semibold'>
                  <ZapIcon className='mr-1 h-4 w-4' />
                  #civictech
                </span>
                projects aimed at making government more transparent, efficient,
                and accessible to citizens.
              </p>
              <p className='text-kapwa-text-support text-lg leading-relaxed'>
                We&apos;ve seen a surge of wonderful and impressive tech ideas
                being launched recently. Our goal is to{' '}
                <strong>support, promote, consolidate, and empower</strong>{' '}
                these builders!
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* What We Provide Section */}
      <section className='bg-kapwa-bg-surface py-16 md:py-20'>
        <div className='container mx-auto px-4'>
          <div className='mb-12 text-center'>
            <h2 className='text-kapwa-text-strong mb-4 kapwa-heading-lg font-bold'>
              What We Provide
            </h2>
            <p className='text-kapwa-text-support text-xl'>
              Everything you need to build impactful civic tech projects
            </p>
          </div>

          <div className='mx-auto grid max-w-6xl grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3'>
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
                className='bg-kapwa-bg-surface transform rounded-xl p-6 shadow-xs transition-all hover:-translate-y-1 hover:shadow-md'
              >
                <div className='bg-kapwa-bg-brand-weak mb-4 flex h-12 w-12 items-center justify-center rounded-lg'>
                  <item.icon className='text-kapwa-text-brand h-6 w-6' />
                </div>
                <h3 className='text-kapwa-text-strong mb-2 text-lg font-semibold'>
                  {item.title}
                </h3>
                <p className='text-kapwa-text-support'>{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Personal Message Section */}
      <section className='text-kapwa-text-inverse relative overflow-hidden bg-linear-to-r from-kapwa-red-900 via-kapwa-gray-900 to-kapwa-purple-900 py-16 md:py-20'>
        <div className='bg-kapwa-bg-surface-bold/30 absolute inset-0'></div>
        <div className='relative z-10 container mx-auto px-4'>
          <div className='mx-auto max-w-5xl text-center'>
            <div className='mb-8 flex justify-center'>
              <div className='rounded-full bg-linear-to-r from-kapwa-yellow-400 to-kapwa-orange-400 p-6 shadow-2xl'>
                <ZapIcon className='text-kapwa-text-strong h-12 w-12' />
              </div>
            </div>
            <h2 className='mb-12 bg-linear-to-r from-kapwa-yellow-300 via-kapwa-orange-300 to-kapwa-red-300 bg-clip-text text-4xl font-black text-transparent md:text-6xl'>
              WE&apos;RE DONE WAITING
            </h2>
            <div className='rounded-3xl border border-white/20 bg-linear-to-r from-white/20 to-white/10 p-10 shadow-2xl backdrop-blur-lg md:p-16'>
              <blockquote className='space-y-8 text-center kapwa-heading-lg leading-relaxed font-bold'>
                <p className='kapwa-heading-xl font-black tracking-wider text-kapwa-text-accent-yellow uppercase'>
                  &ldquo;WE&apos;RE ANGRY. YOU&apos;RE ANGRY.&rdquo;
                </p>
                <p className='text-kapwa-text-inverse text-xl md:text-2xl'>
                  But we can contribute in our own ways —{' '}
                  <strong className='text-kapwa-text-accent-yellow'>
                    NO MATTER HOW LITTLE IT IS.
                  </strong>
                </p>
                <p className='text-kapwa-text-inverse text-xl md:text-2xl'>
                  We can do{' '}
                  <span className='bg-linear-to-r from-kapwa-yellow-300 to-kapwa-orange-300 bg-clip-text text-2xl font-black text-transparent md:text-3xl'>
                    AMAZING THINGS
                  </span>{' '}
                  together.
                </p>
                <p className='text-xl font-black text-kapwa-text-accent-orange uppercase md:text-2xl'>
                  GRASSROOTS STYLE. OPEN SOURCE. NO PERMISSION NEEDED.
                </p>
                <p className='text-kapwa-text-inverse text-lg md:text-xl'>
                  We are committed to putting{' '}
                  <strong>TIME, RESOURCES, AND MONEY</strong> into this
                  initiative.
                </p>
                <p className='text-kapwa-text-inverse text-lg md:text-xl'>
                  We will keep building{' '}
                  <strong className='text-kapwa-text-accent-yellow'>
                    RELENTLESSLY
                  </strong>{' '}
                  without anyone&apos;s permission. Open source, public,{' '}
                  <strong>HIGH QUALITY</strong> sites.
                </p>
              </blockquote>
              <div className='mt-12 border-t-2 border-kapwa-border-accent-yellow pt-8'>
                <p className='text-xl font-black tracking-wide text-kapwa-text-accent-yellow uppercase md:text-2xl'>
                  WE&apos;RE LOOKING FOR PEOPLE SMARTER THAN US!
                </p>
              </div>
            </div>
          </div>
        </div>
        {/* Decorative elements */}
        <div className='absolute top-10 left-10 opacity-10'>
          <RocketIcon className='h-32 w-32 rotate-45 transform text-yellow-400' />
        </div>
        <div className='absolute right-10 bottom-10 opacity-10'>
          <CodeIcon className='h-40 w-40 -rotate-12 transform text-kapwa-orange-400' />
        </div>
      </section>

      {/* Call to Action Section */}
      <section className='from-kapwa-brand-600 bg-linear-to-r to-kapwa-blue-600 py-16 md:py-20'>
        <div className='container mx-auto px-4 text-center'>
          <div className='mx-auto max-w-3xl'>
            <h2 className='text-kapwa-text-inverse mb-6 kapwa-heading-lg font-bold'>
              Ready to Make a Difference?
            </h2>
            <p className='mb-8 text-xl text-kapwa-text-inverse/80'>
              Join our community of builders, dreamers, and changemakers.
              Together, we&apos;ll create the government technology the
              Philippines deserves.
            </p>

            <div className='flex flex-col items-center justify-center gap-6 sm:flex-row'>
              <Button
                href='https://discord.gg/mHtThpN8bT'
                target='_blank'
                rel='noreferrer'
                variant='secondary'
                size='lg'
                leftIcon={<MessageCircleIcon className='h-6 w-6' />}
                className='text-kapwa-text-strong transform rounded-lg bg-kapwa-bg-accent-yellow-weak px-8 py-4 text-lg shadow-lg transition-all hover:scale-105'
              >
                Join Our Discord Community
              </Button>

              <div className='text-kapwa-text-inverse font-medium'>or</div>

              <Button
                href='https://bettergov.ph/ideas'
                target='_blank'
                rel='noreferrer'
                variant='outline'
                size='lg'
                leftIcon={<LightbulbIcon className='h-5 w-5' />}
                className='hover:text-kapwa-text-brand text-kapwa-text-inverse hover:bg-kapwa-bg-surface rounded-lg border-2 border-white px-8 py-4'
              >
                Explore Project Ideas
              </Button>
            </div>

            <div className='mt-8 border-t border-white/20 pt-6'>
              <p className='text-sm text-kapwa-text-inverse/80'>
                Open source • Community-driven • Built with ❤️ for the
                Philippines
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default JoinUs;
