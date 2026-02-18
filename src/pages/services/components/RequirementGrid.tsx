import { FileText } from 'lucide-react';
import { DetailSection } from '@/components/layout/PageLayouts';
import { RequirementCard } from './RequirementCard';
import { Requirement } from '@/types/citizens-charter';

interface RequirementGridProps {
  requirements: Requirement[];
}

export function RequirementGrid({ requirements }: RequirementGridProps) {
  if (!requirements || requirements.length === 0) {
    return null;
  }

  return (
    <DetailSection title='Requirements' icon={FileText}>
      <div className='grid grid-cols-1 gap-3 md:grid-cols-2 lg:grid-cols-3'>
        {requirements.map((req, idx) => (
          <RequirementCard key={idx} requirement={req} />
        ))}
      </div>
    </DetailSection>
  );
}
