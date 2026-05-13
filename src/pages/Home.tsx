import { FC } from 'react';

// import InfoWidgets from '../components/home/InfoWidgets';
// import PromotionBanner from '../components/home/PromotionBanner';
// import JoinUsBanner from '../components/home/JoinUsBanner';
import GovernmentSection from '@/components/home/GovernmentSection';
import Hero from '@/components/home/Hero';
// import NewsSection from '@/components/home/NewsSection';
// import JoinUsStrip from '../components/home/JoinUsStrip';
import ServicesSection from '@/components/home/ServicesSection';
import TimelineSection from '@/components/home/TimelineSection';
import WeatherMapSection from '@/components/home/WeatherMapSection';
import { ErrorBoundary } from '@/components/ui/ErrorBoundary';

const Home: FC = () => {
  return (
    <main className='grow'>
      {/* Documented animation pattern: animate-in fade-in */}
      <div className='animate-in fade-in duration-700'>
        <ErrorBoundary name='Hero'>
          <Hero />
        </ErrorBoundary>

        {/* Using space-y-16 for consistent section spacing per design system */}
        <div className='space-y-16 py-12'>
          <ErrorBoundary name='Services'>
            <ServicesSection />
          </ErrorBoundary>

          <ErrorBoundary name='Timeline'>
            <TimelineSection />
          </ErrorBoundary>

          <ErrorBoundary name='WeatherMap'>
            <WeatherMapSection />
          </ErrorBoundary>

          {/* <NewsSection /> */}

          <ErrorBoundary name='Government'>
            <GovernmentSection />
          </ErrorBoundary>
        </div>
      </div>
    </main>
  );
};

export default Home;
