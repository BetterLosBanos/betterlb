import { Outlet } from 'react-router-dom';

import TransparencySidebar from './components/TransparencySidebar';

export default function TransparencyLayout() {
  return (
    <div className='container mx-auto px-4 py-6 md:py-12'>
      <header className='mb-8 text-center md:mb-12'>
        <h1 className='mb-4 text-3xl font-bold tracking-tight text-gray-900 md:text-4xl'>
          Budget & Financial Transparency
        </h1>
        <p className='mx-auto max-w-2xl text-base text-gray-600 md:text-lg'>
          Track municipal finances and projects for accountability
        </p>
      </header>

      <div className='flex flex-col items-start md:flex-row md:gap-8'>
        <TransparencySidebar />

        <main className='min-w-0 flex-1'>
          <Outlet />
        </main>
      </div>
    </div>
  );
}
