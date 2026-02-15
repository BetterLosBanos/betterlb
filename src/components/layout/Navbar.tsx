import { FC } from 'react';

import { Navbar as SharedNavbar } from '@betterlb/ui';

import { config } from '@/lib/lguConfig';

import { mainNavigation } from '../../data/navigation';
import { LANGUAGES } from '../../i18n/languages';

const Navbar: FC = () => {
  return (
    <SharedNavbar
      config={config}
      mainNavigation={mainNavigation}
      languages={LANGUAGES}
    />
  );
};

export default Navbar;
