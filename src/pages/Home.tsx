import { FC } from 'react';

// import InfoWidgets from '../components/home/InfoWidgets';
// import PromotionBanner from '../components/home/PromotionBanner';
// import JoinUsBanner from '../components/home/JoinUsBanner';
import GovernmentSection from '../components/home/GovernmentSection';
import Hero from '../components/home/Hero';
// import JoinUsStrip from '../components/home/JoinUsStrip';
import ServicesSection from '../components/home/ServicesSection';

const Home: FC = () => {
  return (
    <main className='grow'>
      {/* <JoinUsStrip /> */}
      <Hero />
      <ServicesSection />
      {/* <NewsSection /> */}
      {/* <InfoWidgets /> */}
      {/* <JoinUsBanner /> */}
      {/* <PromotionBanner /> */}
      <GovernmentSection />
    </main>
  );
};

export default Home;
