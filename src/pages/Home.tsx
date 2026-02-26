import { FC } from 'react';

// import InfoWidgets from '../components/home/InfoWidgets';
// import PromotionBanner from '../components/home/PromotionBanner';
// import JoinUsBanner from '../components/home/JoinUsBanner';
import GovernmentSection from '@/components/home/GovernmentSection';
import Hero from '@/components/home/Hero';
import NewsSection from '@/components/home/NewsSection';
// import JoinUsStrip from '../components/home/JoinUsStrip';
import ServicesSection from '@/components/home/ServicesSection';
import TimelineSection from '@/components/home/TimelineSection';
import WeatherMapSection from '@/components/home/WeatherMapSection';

const Home: FC = () => {
  return (
    <main className='grow'>
      {/* Documented animation pattern: animate-in fade-in */}
      <div className='animate-in fade-in duration-700'>
        <Hero />

        {/* Using space-y-16 for consistent section spacing per design system */}
        <div className='space-y-16 py-12'>
          <ServicesSection />

          <TimelineSection />

          <WeatherMapSection />

          <NewsSection />

          <GovernmentSection />
        </div>
      </div>
    </main>
  );
};

export default Home;
