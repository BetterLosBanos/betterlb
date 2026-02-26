import {
  CheckCircle2Icon,
  ChevronDown,
  ChevronUp,
  FileText,
  Info,
  AlertCircle,
  ChevronRight,
} from 'lucide-react';
import { useState } from 'react';
import { SupportingDocumentsDetail as SupportingDocumentsDetailType } from '@/types/citizens-charter';

interface SupportingDocumentsDetailProps {
  detail: SupportingDocumentsDetailType;
}

export function SupportingDocumentsDetail({
  detail,
}: SupportingDocumentsDetailProps) {
  const [isExpanded, setIsExpanded] = useState(true);
  const [showAdditional, setShowAdditional] = useState(false);
  const [showConditional, setShowConditional] = useState(false);

  return (
    <div className='border-kapwa-border-weak bg-kapwa-bg-surface-raised/50 rounded-xl border p-5'>
      {/* Header with expand/collapse */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className='flex w-full items-center justify-between text-left transition-colors hover:bg-kapwa-bg-surface-raised -mx-2 -mt-2 px-2 py-2 rounded-lg'
        aria-expanded={isExpanded}
      >
        <div className='flex items-center gap-3'>
          <div className='text-kapwa-text-brand bg-kapwa-bg-surface rounded-lg p-2'>
            <FileText className='h-4 w-4' />
          </div>
          <div>
            <h3 className='text-kapwa-text-strong text-sm font-bold'>
              Supporting Documents Details
            </h3>
            <p className='text-kapwa-text-disabled text-[10px] font-medium'>
              Click to {isExpanded ? 'collapse' : 'expand'}
            </p>
          </div>
        </div>
        {isExpanded ? (
          <ChevronUp className='text-kapwa-text-support h-4 w-4' />
        ) : (
          <ChevronDown className='text-kapwa-text-support h-4 w-4' />
        )}
      </button>

      {isExpanded && (
        <div className='mt-4 space-y-5'>
          {/* Mandatory Requirements */}
          {detail.mandatory_requirements && (
            <div>
              <h4 className='text-kapwa-text-strong mb-3 flex items-center gap-2 text-xs font-bold uppercase tracking-wider'>
                <AlertCircle className='text-kapwa-text-warning h-3.5 w-3.5' />
                Mandatory Requirements
              </h4>
              <p className='text-kapwa-text-support mb-3 text-xs italic'>
                {detail.mandatory_requirements.instruction}
              </p>
              <div className='space-y-2'>
                {detail.mandatory_requirements.documents.map((doc, idx) => (
                  <div
                    key={idx}
                    className='border-kapwa-border-warning bg-kapwa-bg-warning-weak/10 flex items-start gap-3 rounded-lg border p-3'
                  >
                    <div className='text-kapwa-text-warning bg-kapwa-bg-warning-weak/30 flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-[10px] font-bold'>
                      {idx + 1}
                    </div>
                    <div className='flex-1'>
                      <p className='text-kapwa-text-strong text-xs font-semibold'>
                        {doc.document}
                      </p>
                      <p className='text-kapwa-text-support mt-0.5 text-[11px]'>
                        from:{' '}
                        <span className='font-medium'>
                          {doc.where_to_secure}
                        </span>
                      </p>
                      {doc.copies && (
                        <p className='text-kapwa-text-brand mt-1 text-[11px] font-medium'>
                          {doc.copies}
                        </p>
                      )}
                      {doc.note && (
                        <p className='text-kapwa-text-disabled mt-1 text-[10px] italic'>
                          {doc.note}
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Main instruction (for primary documents) */}
          {detail.primary_documents && detail.primary_documents.length > 0 && (
            <div className='border-kapwa-border-brand bg-kapwa-bg-brand-weak/20 flex items-start gap-3 rounded-lg border p-3'>
              <CheckCircle2Icon className='text-kapwa-text-brand h-4 w-4 shrink-0 mt-0.5' />
              <p className='text-kapwa-text-support text-xs leading-relaxed'>
                {detail.instruction}
              </p>
            </div>
          )}

          {/* Primary documents */}
          {detail.primary_documents && detail.primary_documents.length > 0 && (
            <div>
              <h4 className='text-kapwa-text-strong mb-3 text-xs font-bold uppercase tracking-wider'>
                Choose Any Two (2):
              </h4>
              <div className='space-y-2'>
                {detail.primary_documents.map((doc, idx) => (
                  <div
                    key={idx}
                    className='border-kapwa-border-weak bg-kapwa-bg-surface flex items-start gap-3 rounded-lg border p-3'
                  >
                    <div className='text-kapwa-text-disabled bg-kapwa-bg-surface-raised flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-[10px] font-bold'>
                      {idx + 1}
                    </div>
                    <div className='flex-1'>
                      <p className='text-kapwa-text-strong text-xs font-semibold'>
                        {doc.document}
                      </p>
                      <p className='text-kapwa-text-support mt-0.5 text-[11px]'>
                        from:{' '}
                        <span className='font-medium'>
                          {doc.where_to_secure}
                        </span>
                      </p>
                      {doc.copies && (
                        <p className='text-kapwa-text-brand mt-1 text-[11px] font-medium'>
                          {doc.copies}
                        </p>
                      )}
                      {doc.note && (
                        <p className='text-kapwa-text-disabled mt-1 text-[10px] italic'>
                          {doc.note}
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Additional documents */}
          {detail.additional_documents && (
            <div>
              <button
                onClick={() => setShowAdditional(!showAdditional)}
                className='flex w-full items-center justify-between text-left transition-colors hover:bg-kapwa-bg-surface-raised -mx-2 px-2 py-2 rounded-lg'
                aria-expanded={showAdditional}
              >
                <div className='flex items-center gap-2'>
                  <Info className='text-kapwa-text-accent-orange h-4 w-4' />
                  <h4 className='text-kapwa-text-strong text-xs font-bold uppercase tracking-wider'>
                    Additional Documents (if applicable)
                  </h4>
                </div>
                {showAdditional ? (
                  <ChevronUp className='text-kapwa-text-support h-3.5 w-3.5' />
                ) : (
                  <ChevronDown className='text-kapwa-text-support h-3.5 w-3.5' />
                )}
              </button>

              {showAdditional && (
                <div className='mt-3 space-y-2'>
                  <p className='text-kapwa-text-support text-xs italic'>
                    {detail.additional_documents.instruction}
                  </p>
                  <div className='space-y-2'>
                    {detail.additional_documents.documents.map((doc, idx) => (
                      <div
                        key={idx}
                        className='border-kapwa-border-weak bg-kapwa-bg-surface flex items-start gap-3 rounded-lg border p-3'
                      >
                        <div className='text-kapwa-text-disabled bg-kapwa-bg-surface-raised flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-[10px] font-bold'>
                          {idx + 1}
                        </div>
                        <div className='flex-1'>
                          <p className='text-kapwa-text-support text-xs font-medium'>
                            {doc.document}
                          </p>
                          <p className='text-kapwa-text-disabled mt-0.5 text-[11px]'>
                            from: {doc.where_to_secure}
                          </p>
                          {doc.copies && (
                            <p className='text-kapwa-text-brand mt-1 text-[11px] font-medium'>
                              {doc.copies}
                            </p>
                          )}
                          {doc.note && (
                            <p className='text-kapwa-text-disabled mt-1 text-[10px] italic'>
                              {doc.note}
                            </p>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Conditional Requirements */}
          {detail.conditional_requirements && (
            <div>
              <button
                onClick={() => setShowConditional(!showConditional)}
                className='flex w-full items-center justify-between text-left transition-colors hover:bg-kapwa-bg-surface-raised -mx-2 px-2 py-2 rounded-lg'
                aria-expanded={showConditional}
              >
                <div className='flex items-center gap-2'>
                  <AlertCircle className='text-kapwa-text-brand h-4 w-4' />
                  <h4 className='text-kapwa-text-strong text-xs font-bold uppercase tracking-wider'>
                    Conditional Requirements
                  </h4>
                </div>
                {showConditional ? (
                  <ChevronUp className='text-kapwa-text-support h-3.5 w-3.5' />
                ) : (
                  <ChevronDown className='text-kapwa-text-support h-3.5 w-3.5' />
                )}
              </button>

              {showConditional && (
                <div className='mt-3 space-y-3'>
                  <p className='text-kapwa-text-support text-xs italic'>
                    {detail.conditional_requirements.instruction}
                  </p>
                  <div className='space-y-3'>
                    {detail.conditional_requirements.options.map(
                      (option, idx) => (
                        <div
                          key={idx}
                          className='border-kapwa-border-brand bg-kapwa-bg-brand-weak/10 rounded-lg border p-4'
                        >
                          <div className='flex items-start gap-2'>
                            <ChevronRight className='text-kapwa-text-brand h-4 w-4 shrink-0 mt-0.5' />
                            <div className='flex-1'>
                              <p className='text-kapwa-text-strong mb-2 text-xs font-semibold'>
                                {option.document}
                              </p>
                              <p className='text-kapwa-text-brand mb-1 text-[11px] font-medium'>
                                {option.condition}
                              </p>
                              <p className='text-kapwa-text-support text-[11px]'>
                                from: {option.where_to_secure}
                              </p>
                              {option.copies && (
                                <p className='text-kapwa-text-brand mt-1 text-[11px] font-medium'>
                                  {option.copies}
                                </p>
                              )}
                              {option.note && (
                                <p className='text-kapwa-text-disabled mt-1 text-[10px] italic'>
                                  {option.note}
                                </p>
                              )}
                              {option.if_unavailable &&
                                option.if_unavailable.length > 0 && (
                                  <div className='mt-2 border-t border-kapwa-border-weak pt-2'>
                                    <p className='text-kapwa-text-disabled mb-1 text-[10px] font-semibold uppercase'>
                                      If unavailable:
                                    </p>
                                    {option.if_unavailable.map(
                                      (alt, altIdx) => (
                                        <p
                                          key={altIdx}
                                          className='text-kapwa-text-support text-[10px] italic'
                                        >
                                          • {alt}
                                        </p>
                                      )
                                    )}
                                  </div>
                                )}
                            </div>
                          </div>
                        </div>
                      )
                    )}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Note */}
          {detail.note && (
            <div className='border-kapwa-border-warning bg-kapwa-bg-warning-weak/20 flex items-start gap-3 rounded-lg border p-3'>
              <Info className='text-kapwa-text-warning h-4 w-4 shrink-0 mt-0.5' />
              <p className='text-kapwa-text-support text-[11px] leading-relaxed'>
                <span className='font-semibold'>Note:</span> {detail.note}
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
