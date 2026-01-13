import { Outlet } from 'react-router-dom';
import TransparencySidebar from './components/TransparencySidebar';

export default function TransparencyLayout() {
  return (
    <div className='container mx-auto px-4 py-6 md:py-12'>
      <header className='text-center mb-8 md:mb-12'>
        <h1 className='text-3xl md:text-4xl font-bold text-gray-900 mb-4 tracking-tight'>
          Budget & Financial Transparency
        </h1>
        <p className='text-base md:text-lg text-gray-600 max-w-2xl mx-auto'>
          Track municipal finances and projects for accountability
        </p>
      </header>

      <div className='flex flex-col md:flex-row md:gap-8 items-start'>
        <TransparencySidebar />

        <main className='flex-1 min-w-0'>
          <Outlet />
        </main>
      </div>
    </div>
  );
}
