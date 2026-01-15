import { FC } from 'react';

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
    <div className='min-h-screen bg-linear-to-br from-blue-50 via-white to-purple-50'>
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
      <section className='from-primary-600 relative overflow-hidden bg-linear-to-r via-blue-700 to-purple-700 text-white'>
        <div className='absolute inset-0 bg-black opacity-10'></div>
        <div className='relative z-10 container mx-auto px-4 py-16 md:py-24'>
          <div className='mx-auto max-w-4xl text-center'>
            <div className='mb-6 flex justify-center'>
              <div className='rounded-full bg-white/20 p-4 backdrop-blur-sm'>
                <UsersIcon className='h-12 w-12 text-white' />
              </div>
            </div>
            <h1 className='mb-6 text-4xl leading-tight font-bold md:text-6xl'>
              Join the <span className='text-yellow-300'>#CivicTech</span>{' '}
              Revolution
            </h1>
            <p className='mb-8 text-xl leading-relaxed text-blue-100 md:text-2xl'>
              Together with industry veterans, we&apos;re building{' '}
              <strong>BetterGov.ph</strong> — making government transparent,
              efficient, and accessible to every Filipino.
            </p>
            <div className='flex flex-col justify-center gap-4 sm:flex-row'>
              <a
                href='https://discord.gg/mHtThpN8bT'
                target='_blank'
                rel='noreferrer'
                className='inline-flex transform items-center justify-center rounded-lg bg-yellow-400 px-8 py-4 font-bold text-gray-900 shadow-lg transition-all hover:scale-105 hover:bg-yellow-300'
              >
                <MessageCircleIcon className='mr-2 h-5 w-5' />
                Join Our Discord
              </a>
              <a
                href='#mission'
                className='hover:text-primary-600 inline-flex items-center justify-center rounded-lg border-2 border-white px-8 py-4 font-semibold text-white transition-all hover:bg-white'
              >
                Learn More
                <ArrowRightIcon className='ml-2 h-5 w-5' />
              </a>
            </div>
          </div>
        </div>
        {/* Decorative elements */}
        <div className='absolute top-20 left-10 opacity-20'>
          <CodeIcon className='h-24 w-24 text-white' />
        </div>
        <div className='absolute right-10 bottom-20 opacity-20'>
          <RocketIcon className='h-32 w-32 text-white' />
        </div>
      </section>

      {/* Mission Section */}
      <section id='mission' className='bg-white py-16 md:py-20'>
        <div className='container mx-auto px-4'>
          <div className='mb-12 text-center'>
            <div className='bg-primary-100 mb-4 inline-flex items-center justify-center rounded-full p-3'>
              <TargetIcon className='text-primary-600 h-8 w-8' />
            </div>
            <h2 className='mb-4 text-3xl font-bold text-gray-900 md:text-4xl'>
              Our Mission
            </h2>
            <p className='mx-auto max-w-3xl text-xl text-gray-600'>
              We&apos;re not just building websites — we&apos;re building the
              future of governance in the Philippines.
            </p>
          </div>

          <div className='mx-auto max-w-4xl'>
            <div className='from-primary-50 mb-8 rounded-2xl bg-linear-to-r to-blue-50 p-8 md:p-12'>
              <p className='mb-6 text-lg leading-relaxed text-gray-800'>
                BetterGov is a <strong>volunteer-led tech initiative</strong>{' '}
                committed to creating
                <span className='bg-primary-600 mx-2 inline-flex items-center rounded-full px-3 py-1 text-sm font-semibold text-white'>
                  <ZapIcon className='mr-1 h-4 w-4' />
                  #civictech
                </span>
                projects aimed at making government more transparent, efficient,
                and accessible to citizens.
              </p>
              <p className='text-lg leading-relaxed text-gray-800'>
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
      <section className='bg-gray-50 py-16 md:py-20'>
        <div className='container mx-auto px-4'>
          <div className='mb-12 text-center'>
            <h2 className='mb-4 text-3xl font-bold text-gray-900 md:text-4xl'>
              What We Provide
            </h2>
            <p className='text-xl text-gray-600'>
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
                className='transform rounded-xl bg-white p-6 shadow-xs transition-all hover:-translate-y-1 hover:shadow-md'
              >
                <div className='bg-primary-100 mb-4 flex h-12 w-12 items-center justify-center rounded-lg'>
                  <item.icon className='text-primary-600 h-6 w-6' />
                </div>
                <h3 className='mb-2 text-lg font-semibold text-gray-900'>
                  {item.title}
                </h3>
                <p className='text-gray-600'>{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Personal Message Section */}
      <section className='relative overflow-hidden bg-linear-to-r from-red-900 via-gray-900 to-purple-900 py-16 text-white md:py-20'>
        <div className='absolute inset-0 bg-black/30'></div>
        <div className='relative z-10 container mx-auto px-4'>
          <div className='mx-auto max-w-5xl text-center'>
            <div className='mb-8 flex justify-center'>
              <div className='rounded-full bg-gradient-to-r from-yellow-400 to-orange-400 p-6 shadow-2xl'>
                <ZapIcon className='h-12 w-12 text-gray-900' />
              </div>
            </div>
            <h2 className='mb-12 bg-linear-to-r from-yellow-300 via-orange-300 to-red-300 bg-clip-text text-4xl font-black text-transparent md:text-6xl'>
              WE&apos;RE DONE WAITING
            </h2>
            <div className='rounded-3xl border border-white/20 bg-linear-to-r from-white/20 to-white/10 p-10 shadow-2xl backdrop-blur-lg md:p-16'>
              <blockquote className='space-y-8 text-center text-xl leading-relaxed font-bold md:text-3xl'>
                <p className='text-2xl font-black tracking-wider text-yellow-300 uppercase md:text-4xl'>
                  &ldquo;WE&apos;RE ANGRY. YOU&apos;RE ANGRY.&rdquo;
                </p>
                <p className='text-xl text-white md:text-2xl'>
                  But we can contribute in our own ways —{' '}
                  <strong className='text-yellow-300'>
                    NO MATTER HOW LITTLE IT IS.
                  </strong>
                </p>
                <p className='text-xl text-white md:text-2xl'>
                  We can do{' '}
                  <span className='bg-linear-to-r from-yellow-300 to-orange-300 bg-clip-text text-2xl font-black text-transparent md:text-3xl'>
                    AMAZING THINGS
                  </span>{' '}
                  together.
                </p>
                <p className='text-xl font-black text-orange-300 uppercase md:text-2xl'>
                  GRASSROOTS STYLE. OPEN SOURCE. NO PERMISSION NEEDED.
                </p>
                <p className='text-lg text-white md:text-xl'>
                  We are committed to putting{' '}
                  <strong>TIME, RESOURCES, AND MONEY</strong> into this
                  initiative.
                </p>
                <p className='text-lg text-white md:text-xl'>
                  We will keep building{' '}
                  <strong className='text-yellow-300'>RELENTLESSLY</strong>{' '}
                  without anyone&apos;s permission. Open source, public,{' '}
                  <strong>HIGH QUALITY</strong> sites.
                </p>
              </blockquote>
              <div className='border-gradient-to-r mt-12 border-t-2 from-yellow-300 to-orange-300 pt-8'>
                <p className='text-xl font-black tracking-wide text-yellow-300 uppercase md:text-2xl'>
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
          <CodeIcon className='h-40 w-40 -rotate-12 transform text-orange-400' />
        </div>
      </section>

      {/* Call to Action Section */}
      <section className='from-primary-600 bg-linear-to-r to-blue-600 py-16 md:py-20'>
        <div className='container mx-auto px-4 text-center'>
          <div className='mx-auto max-w-3xl'>
            <h2 className='mb-6 text-3xl font-bold text-white md:text-4xl'>
              Ready to Make a Difference?
            </h2>
            <p className='mb-8 text-xl text-blue-100'>
              Join our community of builders, dreamers, and changemakers.
              Together, we&apos;ll create the government technology the
              Philippines deserves.
            </p>

            <div className='flex flex-col items-center justify-center gap-6 sm:flex-row'>
              <a
                href='https://discord.gg/mHtThpN8bT'
                target='_blank'
                rel='noreferrer'
                className='inline-flex transform items-center justify-center rounded-lg bg-yellow-400 px-8 py-4 text-lg font-bold text-gray-900 shadow-lg transition-all hover:scale-105 hover:bg-yellow-300'
              >
                <MessageCircleIcon className='mr-3 h-6 w-6' />
                Join Our Discord Community
              </a>

              <div className='font-medium text-white'>or</div>

              <a
                href='https://bettergov.ph/ideas'
                target='_blank'
                rel='noreferrer'
                className='hover:text-primary-600 inline-flex items-center justify-center rounded-lg border-2 border-white px-8 py-4 font-semibold text-white transition-all hover:bg-white'
              >
                <LightbulbIcon className='mr-2 h-5 w-5' />
                Explore Project Ideas
              </a>
            </div>

            <div className='mt-8 border-t border-white/20 pt-6'>
              <p className='text-sm text-blue-100'>
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
