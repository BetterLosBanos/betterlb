import { Link } from 'react-router-dom';

import { AlertTriangleIcon, HomeIcon } from 'lucide-react';
import { Helmet } from 'react-helmet-async';

import Button from '../components/ui/Button';

export default function NotFound() {
  return (
    <div className='min-h-screen bg-gradient-to-br from-blue-600 via-blue-700 to-blue-800'>
      <Helmet>
        <title>Page Not Found! | BetterGov.ph</title>
        <meta
          name='description'
          content='You might be lost, like some of our government (ghost) services..'
        />
        <meta name='keywords' content='Not Found, 404, Page Not Found' />
        <link rel='canonical' href='https://bettergov.ph/not-found' />

        {/* Open Graph / Social */}
        <meta property='og:title' content='Page Not Found! | BetterGov.ph' />
        <meta
          property='og:description'
          content='You might be lost, like some of our government (ghost) services..'
        />
        <meta property='og:type' content='website' />
        <meta property='og:url' content='https://bettergov.ph/not-found' />
        <meta property='og:image' content='https://bettergov.ph/ph-logo.png' />
      </Helmet>

      <div className='relative'>
        <div className='relative mx-auto max-w-6xl px-4 pt-16 pb-10 sm:px-6 lg:px-8'>
          {/* 404 Section */}
          <div className='mb-16 text-center'>
            <div className='mb-8 inline-flex h-24 w-24 items-center justify-center rounded-full bg-white/20 backdrop-blur-sm'>
              <AlertTriangleIcon className='h-12 w-12 text-white' />
            </div>
            <h1 className='mb-4 text-6xl font-bold tracking-tight text-white md:text-8xl'>
              404
            </h1>
            <div className='mb-8 space-y-4'>
              <h2 className='text-2xl font-semibold text-white md:text-3xl'>
                Lost in the Digital Bureaucracy?
              </h2>
              <p className='mx-auto max-w-2xl text-lg leading-relaxed text-blue-100'>
                Relax, even the best systems have their maze-like moments. This
                page seems to have gotten stuck in processing... probably
                waiting for approval from three (or more) different departments.
              </p>
            </div>
            {/* Actions */}
            <div className='flex flex-col items-center justify-center gap-4 sm:flex-row'>
              <Link to='/'>
                <Button
                  size='lg'
                  className='bg-white px-8 font-semibold text-blue-600 hover:bg-blue-50'
                >
                  <HomeIcon className='mr-2 h-5 w-5' />
                  Return to Homepage
                </Button>
              </Link>
              <Button
                variant='outline'
                size='lg'
                className='border-white px-8 text-white hover:bg-white/10'
                onClick={() => window.history.back()}
              >
                Go Back
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
