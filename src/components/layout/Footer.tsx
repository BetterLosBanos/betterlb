import { FC } from 'react';

import { Footer as SharedFooter } from '@betterlb/ui';

import { config } from '@/lib/lguConfig';

import { footerNavigation } from '../../data/navigation';

const Footer: FC = () => {
  return <SharedFooter config={config} navigation={footerNavigation} />;
};

export default Footer;
