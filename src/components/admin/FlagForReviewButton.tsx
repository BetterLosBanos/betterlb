import { useState } from 'react';

import { Banner } from '@/kapwa/banner';
import { Input } from '@/kapwa/input';
import { Label } from '@/kapwa/label';
import { AlertTriangle, Check, Flag } from 'lucide-react';

import Button from '@/components/ui/Button';

interface BannerState {
  message: string;
  type: 'success' | 'warning' | 'error' | 'info' | 'default';
}

interface FlagForReviewButtonProps {
  itemType: 'document' | 'session' | 'attendance';
  itemId: string;
  itemTitle?: string;
  onSuccess?: () => void;
  variant?: 'default' | 'compact';
}

const issueTypeOptions = [
  { value: 'data_error', label: 'Data Error' },
  { value: 'missing_info', label: 'Missing Information' },
  { value: 'low_confidence', label: 'Low OCR/Data Confidence' },
  { value: 'conflicting_sources', label: 'Conflicting Sources' },
  { value: 'incorrect_categorization', label: 'Incorrect Categorization' },
  { value: 'other', label: 'Other' },
];

export default function FlagForReviewButton({
  itemType,
  itemId,
  itemTitle,
  onSuccess,
  variant = 'default',
}: FlagForReviewButtonProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [issueType, setIssueType] = useState('data_error');
  const [description, setDescription] = useState('');
  const [banner, setBanner] = useState<BannerState | null>(null);

  const showBanner = (message: string, type: BannerState['type']) => {
    setBanner({ message, type });
    // Auto-dismiss success banners after 3 seconds
    if (type === 'success') {
      setTimeout(() => setBanner(null), 3000);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setBanner(null); // Clear any existing banner

    try {
      const response = await fetch('/api/admin/review-queue', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          item_type: itemType,
          item_id: itemId,
          issue_type: issueType,
          description: description || undefined,
          source_type: 'manual',
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        if (response.status === 409) {
          showBanner('This item is already in the review queue.', 'warning');
        } else {
          throw new Error(data.error || 'Failed to flag for review');
        }
        return;
      }

      setSubmitted(true);
      showBanner('Item flagged for review successfully!', 'success');
      setTimeout(() => {
        setIsOpen(false);
        setSubmitted(false);
        setDescription('');
        setIssueType('data_error');
        setBanner(null);
        onSuccess?.();
      }, 1500);
    } catch (error) {
      console.error('Error flagging for review:', error);
      showBanner(
        'Failed to flag for review. You may need to authenticate first.',
        'error'
      );
    } finally {
      setSubmitting(false);
    }
  };

  if (variant === 'compact') {
    return (
      <>
        <Button
          variant='ghost'
          size='sm'
          leftIcon={<Flag className='h-4 w-4' />}
          onClick={() => setIsOpen(true)}
        >
          Flag
        </Button>

        {isOpen && (
          <div className='fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4'>
            <div className='w-full max-w-md rounded-lg bg-white p-6 shadow-lg'>
              {banner && (
                <div className='mb-4'>
                  <Banner
                    type={banner.type}
                    description={banner.message}
                    onDismiss={() => setBanner(null)}
                  />
                </div>
              )}
              <h3 className='mb-4 text-lg font-bold text-slate-900'>
                Flag for Review
              </h3>
              <form onSubmit={handleSubmit} className='space-y-4'>
                <div>
                  <Label htmlFor='issue-type-compact'>Issue Type</Label>
                  <select
                    id='issue-type-compact'
                    value={issueType}
                    onChange={e => setIssueType(e.target.value)}
                    className='w-full rounded-md border border-slate-300 px-3 py-2 text-sm'
                    disabled={submitting || submitted}
                  >
                    {issueTypeOptions.map(option => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <Label htmlFor='description-compact'>
                    Description (optional)
                  </Label>
                  <textarea
                    id='description-compact'
                    value={description}
                    onChange={e => setDescription(e.target.value)}
                    placeholder='Describe the issue...'
                    className='w-full rounded-md border border-slate-300 px-3 py-2 text-sm'
                    rows={3}
                    disabled={submitting || submitted}
                  />
                </div>

                <div className='flex justify-end gap-2'>
                  <Button
                    type='button'
                    variant='outline'
                    size='sm'
                    onClick={() => setIsOpen(false)}
                    disabled={submitting || submitted}
                  >
                    Cancel
                  </Button>
                  <Button
                    type='submit'
                    variant='primary'
                    size='sm'
                    disabled={submitting || submitted}
                    leftIcon={
                      submitted ? <Check className='h-4 w-4' /> : undefined
                    }
                  >
                    {submitted
                      ? 'Flagged!'
                      : submitting
                        ? 'Flagging...'
                        : 'Flag for Review'}
                  </Button>
                </div>
              </form>
            </div>
          </div>
        )}
      </>
    );
  }

  return (
    <>
      <Button
        variant='outline'
        size='sm'
        leftIcon={<Flag className='h-4 w-4' />}
        onClick={() => setIsOpen(true)}
      >
        Flag for Review
      </Button>

      {isOpen && (
        <div className='fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4'>
          <div className='w-full max-w-md rounded-lg bg-white p-6 shadow-lg'>
            <div className='mb-4 flex items-center gap-3'>
              <div className='flex h-10 w-10 items-center justify-center rounded-full bg-amber-100'>
                <AlertTriangle className='h-5 w-5 text-amber-600' />
              </div>
              <div>
                <h3 className='text-lg font-bold text-slate-900'>
                  Flag for Review
                </h3>
                {itemTitle && (
                  <p className='text-sm text-slate-500'>{itemTitle}</p>
                )}
              </div>
            </div>

            {banner && (
              <Banner
                type={banner.type}
                description={banner.message}
                onDismiss={() => setBanner(null)}
              />
            )}

            <form onSubmit={handleSubmit} className='space-y-4'>
              <div>
                <Label htmlFor='issue-type'>
                  Issue Type <span className='text-rose-500'>*</span>
                </Label>
                <select
                  id='issue-type'
                  value={issueType}
                  onChange={e => setIssueType(e.target.value)}
                  className='focus:border-primary-500 focus:ring-primary-500 w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:ring-1 focus:outline-none'
                  required
                  disabled={submitting || submitted}
                >
                  {issueTypeOptions.map(option => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <Label htmlFor='description'>Description</Label>
                <textarea
                  id='description'
                  value={description}
                  onChange={e => setDescription(e.target.value)}
                  placeholder='Please describe what needs to be reviewed...'
                  className='focus:border-primary-500 focus:ring-primary-500 w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:ring-1 focus:outline-none'
                  rows={3}
                  disabled={submitting || submitted}
                />
                <p className='mt-1 text-xs text-slate-500'>
                  Provide details about what needs to be reviewed or corrected.
                </p>
              </div>

              <div className='flex justify-end gap-3 pt-2'>
                <Button
                  type='button'
                  variant='outline'
                  onClick={() => setIsOpen(false)}
                  disabled={submitting || submitted}
                >
                  Cancel
                </Button>
                <Button
                  type='submit'
                  variant='primary'
                  disabled={submitting || submitted}
                  leftIcon={
                    submitted ? <Check className='h-4 w-4' /> : undefined
                  }
                  className={
                    submitted ? 'bg-emerald-600 hover:bg-emerald-700' : ''
                  }
                >
                  {submitted
                    ? 'Flagged for Review!'
                    : submitting
                      ? 'Flagging...'
                      : 'Flag for Review'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
