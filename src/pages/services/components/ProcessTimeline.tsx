import { ClipboardList, ExternalLink } from 'lucide-react';
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
      <div className='space-y-6' data-testid='process-timeline'>
        {steps.map((step, idx) => (
          <div key={idx} className='group'>
            <div className='flex gap-4'>
              <div className='flex h-8 w-8 shrink-0 items-center justify-center rounded-full border-2 border-kapwa-border-brand bg-kapwa-bg-surface text-sm font-bold text-kapwa-text-brand'>
                {idx + 1}
              </div>
              <div className='flex-1'>
                <div className='flex items-start justify-between gap-4'>
                  <p className='text-kapwa-text-support text-sm leading-relaxed flex-1'>
                    {step.action}
                  </p>
                  {step.url && (
                    <a
                      href={step.url}
                      target='_blank'
                      rel='noreferrer'
                      className='text-kapwa-text-brand hover:text-kapwa-text-accent-orange flex shrink-0 items-center gap-1 text-xs font-bold transition-colors'
                    >
                      Visit Portal
                      <ExternalLink className='h-3 w-3' />
                    </a>
                  )}
                </div>

                {/* Sub-steps with letter labels */}
                {step.sub_steps && step.sub_steps.length > 0 && (
                  <div className='mt-3 ml-4 space-y-2'>
                    {step.sub_steps.map((subStep, subIdx) => (
                      <div
                        key={subIdx}
                        className='border-l-2 border-kapwa-border-weak pl-4'
                      >
                        <div className='flex items-start gap-2'>
                          <span className='text-kapwa-text-brand bg-kapwa-bg-brand-weak/20 flex h-5 w-5 shrink-0 items-center justify-center rounded text-xs font-bold'>
                            {subStep.letter}
                          </span>
                          <p className='text-kapwa-text-support text-xs leading-relaxed flex-1'>
                            {subStep.action}
                          </p>
                        </div>

                        {/* Detail items with roman numerals */}
                        {subStep.details && subStep.details.length > 0 && (
                          <div className='mt-2 ml-7 space-y-1'>
                            {subStep.details.map((detail, detailIdx) => (
                              <div
                                key={detailIdx}
                                className='flex items-start gap-2'
                              >
                                <span className='text-kapwa-text-disabled text-xs font-medium'>
                                  {detailIdx + 1 === 1
                                    ? 'i.'
                                    : detailIdx + 1 === 2
                                      ? 'ii.'
                                      : detailIdx + 1 === 3
                                        ? 'iii.'
                                        : detailIdx + 1 === 4
                                          ? 'iv.'
                                          : detailIdx + 1 === 5
                                            ? 'v.'
                                            : `${detailIdx + 1}.`}
                                </span>
                                <p className='text-kapwa-text-support text-xs'>
                                  {detail}
                                </p>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}

                {/* Processing time for this step */}
                {step.processing_time && (
                  <div className='mt-2 ml-4 flex items-center gap-2'>
                    <span className='text-kapwa-text-disabled text-[10px] font-bold uppercase tracking-wider'>
                      Time:
                    </span>
                    <span className='text-kapwa-text-support text-xs'>
                      {step.processing_time}
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </DetailSection>
  );
}
