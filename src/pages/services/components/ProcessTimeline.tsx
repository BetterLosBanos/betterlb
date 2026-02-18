import { ClipboardList } from 'lucide-react';
import { DetailSection } from '@/components/layout/PageLayouts';
import { ClientStep } from '@/types/citizens-charter';

interface ProcessTimelineProps {
  steps: ClientStep[];
}

export function ProcessTimeline({ steps }: ProcessTimelineProps) {
  if (!steps || steps.length === 0) {
    return null;
  }

  return (
    <DetailSection title='How to Apply' icon={ClipboardList}>
      <div className='space-y-4'>
        {steps.map((step, idx) => (
          <div key={idx} className='flex gap-4'>
            <div className='flex h-8 w-8 shrink-0 items-center justify-center rounded-full border-2 border-kapwa-border-brand bg-kapwa-bg-surface text-sm font-bold text-kapwa-text-brand'>
              {step.step}
            </div>
            <div className='flex-1 pb-4'>
              <p className='text-kapwa-text-support text-sm leading-relaxed'>
                {step.action}
              </p>
            </div>
          </div>
        ))}
      </div>
    </DetailSection>
  );
}
