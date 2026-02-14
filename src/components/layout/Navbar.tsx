import { FC } from 'react';

import { Navbar as SharedNavbar } from '@betterlb/ui';
import { useTranslation } from 'react-i18next';

import { config } from '@/lib/lguConfig';

import { mainNavigation } from '../../data/navigation';
import { LANGUAGES } from '../../i18n/languages';

const Navbar: FC = () => {
  const { t } = useTranslation('common');

  // Transform mainNavigation to add translated labels
  const translatedNavigation = mainNavigation.map(item => ({
    ...item,
    label: t(`navbar.${item.label.toLowerCase()}`),
    children: item.children?.map(child => ({
      ...child,
      // Keep child labels as-is since they're already in the desired format
    })),
  }));

  return (
    <SharedNavbar
      config={config}
      mainNavigation={translatedNavigation}
      languages={LANGUAGES}
    />
  );
};

export default Navbar;
