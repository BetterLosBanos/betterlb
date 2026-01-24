import { FC } from 'react';

// import InfoWidgets from '../components/home/InfoWidgets';
// import PromotionBanner from '../components/home/PromotionBanner';
// import JoinUsBanner from '../components/home/JoinUsBanner';
import GovernmentSection from '@/components/home/GovernmentSection';
import Hero from '@/components/home/Hero';
// import JoinUsStrip from '../components/home/JoinUsStrip';
import ServicesSection from '@/components/home/ServicesSection';
import TimelineSection from '@/components/home/TimelineSection';
import WeatherMapSection from '@/components/home/WeatherMapSection';

const Home: FC = () => {
  return (
    <main className='grow'>
      {/* <JoinUsStrip /> */}
      <Hero />
      <ServicesSection />
      <TimelineSection />
      <WeatherMapSection />
      {/* <NewsSection /> */}
      {/* <InfoWidgets /> */}
      {/* <JoinUsBanner /> */}
      {/* <PromotionBanner /> */}
      <GovernmentSection />
    </main>
  );
};

export default Home;
