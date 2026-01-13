import { Users, Trophy, Wallet } from 'lucide-react';
import {
  SidebarContainer,
  SidebarItem,
} from '@/components/ui/SidebarNavigation';

export default function StatisticsSidebar() {
  const sections = [
    {
      path: '/statistics',
      label: 'Demographics',
      icon: Users,
      description: 'Population growth',
    },
    {
      path: '/statistics/competitiveness',
      label: 'Competitiveness',
      icon: Trophy,
      description: 'CMCI Index & rankings',
    },
    {
      path: '/statistics/municipal-income',
      label: 'Municipal Income',
      icon: Wallet,
      description: 'Revenue sources',
    },
  ];

  return (
    <SidebarContainer title='City Statistics'>
      <ul className='space-y-1'>
        {sections.map(section => (
          <SidebarItem key={section.path} {...section} />
        ))}
      </ul>
    </SidebarContainer>
  );
}
