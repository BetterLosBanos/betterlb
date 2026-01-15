import { useMemo, useState } from 'react';

import { Link, useSearchParams } from 'react-router-dom';

import {
  AlertCircle,
  AlertTriangle,
  CheckCircle2,
  CheckSquare,
  ClipboardList,
  Eye,
  FileText,
  Github,
  Globe,
  Loader2,
  RotateCcw,
  Search,
  Square,
} from 'lucide-react';
import { useForm } from 'react-hook-form';

import { DetailSection, ModuleHeader } from '@/components/layout/PageLayouts';
import { Badge } from '@/components/ui/Badge';
import {
  Breadcrumb,
  BreadcrumbHome,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/Breadcrumb';

import { toTitleCase } from '@/lib/stringUtils';
import { cn } from '@/lib/utils';

import departmentsData from '@/data/directory/departments.json';
import categoryData from '@/data/service_categories.json';
import servicesData from '@/data/services/services.json';

// --- Types ---
type SubmissionStatus = 'idle' | 'loading' | 'success' | 'error';

interface ContributionFormData {
  service: string;
  description: string;
  type: 'transaction' | 'information';
  categorySlug: string;
  officeSlug: string[];
  steps: string;
  requirements: string;
  url: string;
  source: string;
  notes: string;
}

export default function ContributePage() {
  const [searchParams] = useSearchParams();
  const [officeSearch, setOfficeSearch] = useState('');
  const [status, setStatus] = useState<SubmissionStatus>('idle');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const editSlug = searchParams.get('edit');

  const existingService = useMemo(
    () => servicesData.find(s => s.slug === editSlug),
    [editSlug]
  );

  const {
    register,
    handleSubmit,
    watch,
    reset,
    setValue,
    formState: { errors },
  } = useForm<ContributionFormData>({
    defaultValues: useMemo(() => {
      if (existingService) {
        return {
          service: existingService.service,
          description: existingService.description || '',
          type:
            (existingService.type as 'transaction' | 'information') ||
            'transaction',
          categorySlug: existingService.category.slug,
          officeSlug: Array.isArray(existingService.officeSlug)
            ? existingService.officeSlug
            : [existingService.officeSlug],
          steps: existingService.steps?.join('\n') || '',
          requirements: existingService.requirements?.join('\n') || '',
          url: existingService.url || '',
          source: '',
          notes: '',
        };
      }
      return {
        type: 'transaction',
        categorySlug: 'certificates-vital-records',
        officeSlug: ['municipal-hall'],
        url: '',
      };
    }, [existingService]),
  });

  // FIXED: Explicitly watching fields needed for the preview to satisfy ESLint
  const previewService = watch('service');
  const previewDescription = watch('description');
  const previewCategorySlug = watch('categorySlug');
  const selectedOffices = watch('officeSlug') || [];

  const toggleOffice = (slug: string) => {
    const current = [...selectedOffices];
    const index = current.indexOf(slug);
    if (index > -1) current.splice(index, 1);
    else current.push(slug);
    setValue('officeSlug', current);
  };

  const filteredOffices = departmentsData.filter(d =>
    d.office_name.toLowerCase().includes(officeSearch.toLowerCase())
  );

  const onSubmit = async (data: ContributionFormData) => {
    setStatus('loading');
    setErrorMessage(null);

    try {
      const selectedCategory = categoryData.categories.find(
        c => c.slug === data.categorySlug
      );

      const jsonBlock = {
        service: data.service,
        slug:
          existingService?.slug ||
          data.service
            .toLowerCase()
            .trim()
            .replace(/[^\w\s-]/g, '')
            .replace(/[\s_-]+/g, '-'),
        type: data.type,
        description: data.description,
        url: data.url,
        officeSlug: data.officeSlug,
        category: {
          name: selectedCategory?.name || 'General',
          slug: data.categorySlug,
        },
        steps: data.steps
          .split('\n')
          .map(s => s.trim())
          .filter(Boolean),
        requirements: data.requirements
          .split('\n')
          .map(s => s.trim())
          .filter(Boolean),
        updatedAt: new Date().toISOString(),
      };

      const content = `### Contribution Form Proposed ${existingService ? 'Update' : 'Addition'}\n<!-- DATA_START -->\n\`\`\`json\n${JSON.stringify(jsonBlock, null, 2)}\n\`\`\`\n<!-- DATA_END -->\n\n**Reason:** ${data.notes || 'N/A'}\n**Source:** ${data.source}`;

      const response = await fetch('/api/submit-contribution', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: `${existingService ? 'Update' : 'New'}: ${data.service}`,
          content,
        }),
      });

      const result = await response.json();

      if (response.status === 201 && result.success) {
        setStatus('success');
        window.scrollTo({ top: 0, behavior: 'smooth' });
      } else {
        throw new Error(result.error || 'The contribution could not be sent.');
      }
    } catch (err) {
      setErrorMessage(err instanceof Error ? err.message : 'Connection failed');
      setStatus('error');
    }
  };

  if (status === 'success') {
    return (
      <div className='animate-in zoom-in-95 mx-auto max-w-2xl py-20 text-center duration-500'>
        <div className='mb-6 flex justify-center'>
          <div className='rounded-full bg-emerald-50 p-4 ring-8 ring-emerald-50/50'>
            <CheckCircle2 className='h-12 w-12 text-emerald-600' />
          </div>
        </div>
        <h2 className='mb-4 text-3xl font-extrabold text-slate-900'>
          Submission Received
        </h2>
        <p className='mb-10 text-lg leading-relaxed text-slate-600'>
          Thank you for helping improve Better LB. Your contribution has been
          sent to our auditors for verification.
        </p>
        <div className='flex flex-col justify-center gap-4 sm:flex-row'>
          <Link
            to='/services'
            className='bg-primary-600 hover:bg-primary-700 flex min-h-[48px] items-center justify-center rounded-xl px-8 py-3 font-bold text-white shadow-lg transition-all'
          >
            Back to Services
          </Link>
          <button
            onClick={() => {
              setStatus('idle');
              reset();
            }}
            className='min-h-[48px] rounded-xl border border-slate-200 bg-white px-8 py-3 font-bold text-slate-600 transition-all hover:bg-slate-50'
          >
            Submit Another
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className='animate-in fade-in mx-auto max-w-7xl space-y-6 px-4 pb-20 duration-500 md:px-0'>
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbHome href='/' />
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbLink href='/services'>Services</BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage>
              {existingService ? 'Suggest Edit' : 'Contribute'}
            </BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      <ModuleHeader
        title={existingService ? 'Suggest an Edit' : 'Contribute New Data'}
        description={
          existingService
            ? `Improve the data for &quot;${existingService.service}&quot;`
            : 'Help us build a more accurate service directory.'
        }
      />

      <div className='grid grid-cols-1 gap-12 lg:grid-cols-12'>
        <form
          onSubmit={handleSubmit(onSubmit)}
          className='space-y-8 lg:col-span-7'
        >
          <DetailSection title='Core Information' icon={ClipboardList}>
            <div className='space-y-6'>
              <div className='grid grid-cols-1 gap-4 md:grid-cols-2'>
                <div className='md:col-span-2'>
                  <label className='heading-label mb-2 block' htmlFor='service'>
                    Service Name <span className='text-secondary-600'>*</span>
                  </label>
                  <input
                    id='service'
                    {...register('service', { required: 'Name is required' })}
                    className={cn(
                      'w-full rounded-xl border p-3 transition-all outline-none',
                      errors.service
                        ? 'border-rose-500 ring-rose-500/10'
                        : 'border-slate-200'
                    )}
                  />
                  {errors.service && (
                    <p className='mt-1 text-xs font-bold text-rose-600'>
                      {errors.service.message}
                    </p>
                  )}
                </div>
                <div>
                  <label className='heading-label mb-2 block' htmlFor='type'>
                    Type
                  </label>
                  <select
                    id='type'
                    {...register('type')}
                    className='w-full rounded-xl border border-slate-200 bg-white p-3 outline-none'
                  >
                    <option value='transaction'>Transactional</option>
                    <option value='information'>Informational</option>
                  </select>
                </div>
                <div>
                  <label
                    className='heading-label mb-2 block'
                    htmlFor='categorySlug'
                  >
                    Category
                  </label>
                  <select
                    id='categorySlug'
                    {...register('categorySlug')}
                    className='w-full rounded-xl border border-slate-200 bg-white p-3 outline-none'
                  >
                    {categoryData.categories.map(cat => (
                      <option key={cat.slug} value={cat.slug}>
                        {cat.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className='space-y-3'>
                <label className='heading-label block'>
                  Responsible Offices{' '}
                  <span className='text-secondary-600'>*</span>
                </label>
                <div className='relative mb-2'>
                  <Search className='absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-slate-400' />
                  <input
                    type='text'
                    placeholder='Search departments...'
                    className='w-full border-b border-slate-100 bg-transparent py-2 pr-4 pl-10 text-sm italic outline-none'
                    onChange={e => setOfficeSearch(e.target.value)}
                  />
                </div>
                <div
                  className={cn(
                    'scrollbar-thin grid max-h-64 grid-cols-1 gap-2 overflow-y-auto rounded-2xl border border-slate-200 bg-slate-50 p-4 md:grid-cols-2',
                    errors.officeSlug && 'border-rose-500'
                  )}
                >
                  <input
                    type='hidden'
                    {...register('officeSlug', {
                      validate: val =>
                        val.length > 0 || 'Select at least one office',
                    })}
                  />
                  {filteredOffices.map(dept => {
                    const isChecked = selectedOffices.includes(dept.slug);
                    return (
                      <button
                        key={dept.slug}
                        type='button'
                        onClick={() => toggleOffice(dept.slug)}
                        className={cn(
                          'flex min-h-[44px] items-center gap-3 rounded-xl border p-3 text-left transition-all',
                          isChecked
                            ? 'border-primary-600 ring-primary-500/5 bg-white shadow-sm ring-2'
                            : 'border-slate-200 bg-transparent hover:border-slate-300'
                        )}
                      >
                        {isChecked ? (
                          <CheckSquare className='text-primary-600 h-4 w-4 shrink-0' />
                        ) : (
                          <Square className='h-4 w-4 shrink-0 text-slate-300' />
                        )}
                        <span
                          className={cn(
                            'text-xs leading-tight font-bold',
                            isChecked ? 'text-primary-900' : 'text-slate-600'
                          )}
                        >
                          {toTitleCase(dept.office_name)}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          </DetailSection>

          <DetailSection title='Content & Details' icon={FileText}>
            <div className='space-y-4'>
              <div>
                <label
                  className='heading-label mb-2 block'
                  htmlFor='description'
                >
                  Description
                </label>
                <textarea
                  id='description'
                  {...register('description')}
                  className='h-24 w-full rounded-xl border border-slate-200 p-3 text-sm outline-none'
                />
              </div>
              <div className='grid grid-cols-1 gap-4 md:grid-cols-2'>
                <div>
                  <label className='heading-label mb-2 block' htmlFor='steps'>
                    Steps (New line per item)
                  </label>
                  <textarea
                    id='steps'
                    {...register('steps')}
                    className='h-48 w-full rounded-xl border border-slate-200 p-3 font-mono text-xs outline-none'
                  />
                </div>
                <div>
                  <label
                    className='heading-label mb-2 block'
                    htmlFor='requirements'
                  >
                    Requirements (New line per item)
                  </label>
                  <textarea
                    id='requirements'
                    {...register('requirements')}
                    className='h-48 w-full rounded-xl border border-slate-200 p-3 font-mono text-xs outline-none'
                  />
                </div>
              </div>
            </div>
          </DetailSection>

          <DetailSection title='Verification Info' icon={Globe}>
            <div className='space-y-4'>
              <div>
                <label className='heading-label mb-2 block' htmlFor='source'>
                  Official Source Link{' '}
                  <span className='text-secondary-600'>*</span>
                </label>
                <input
                  id='source'
                  {...register('source', { required: 'Link required' })}
                  className={cn(
                    'w-full rounded-xl border border-slate-200 p-3 text-sm outline-none',
                    errors.source && 'border-rose-500'
                  )}
                />
              </div>
              <div>
                <label className='heading-label mb-2 block' htmlFor='notes'>
                  Internal Notes
                </label>
                <textarea
                  id='notes'
                  {...register('notes')}
                  className='h-20 w-full rounded-xl border border-slate-200 p-3 text-sm outline-none'
                />
              </div>
            </div>
          </DetailSection>

          <div className='flex flex-col gap-4 sm:flex-row'>
            <button
              type='submit'
              disabled={status === 'loading'}
              className='bg-primary-600 hover:bg-primary-700 flex min-h-[48px] flex-1 items-center justify-center gap-2 rounded-2xl py-4 font-bold text-white shadow-xl transition-all disabled:opacity-50'
            >
              {status === 'loading' ? (
                <>
                  <Loader2 className='h-4 w-4 animate-spin' /> Sending...
                </>
              ) : (
                <>
                  <Github className='h-4 w-4' /> Submit to Audit
                </>
              )}
            </button>
            <button
              type='button'
              onClick={() => reset()}
              className='flex min-h-[48px] items-center justify-center gap-2 rounded-2xl border border-slate-200 px-6 py-4 text-slate-400 transition-all hover:bg-slate-50'
            >
              <RotateCcw className='h-4 w-4' /> Reset
            </button>
          </div>

          {status === 'error' && (
            <div className='flex items-center gap-3 rounded-xl border border-rose-100 bg-rose-50 p-4 text-rose-800'>
              <AlertCircle className='h-5 w-5 shrink-0' />
              <p className='text-sm font-bold'>
                Error: {errorMessage || 'Submission failed'}
              </p>
            </div>
          )}
        </form>

        <aside className='h-fit space-y-6 lg:sticky lg:top-32 lg:col-span-5'>
          <h3 className='heading-label flex items-center gap-2'>
            <Eye className='h-3 w-3' /> Live Preview
          </h3>
          <div className='ring-primary-500/10 min-h-[200px] rounded-3xl bg-slate-900 p-8 text-white shadow-2xl ring-4'>
            <div className='relative z-10 space-y-4'>
              <div className='flex gap-2'>
                <Badge variant='primary'>
                  {categoryData.categories.find(
                    c => c.slug === previewCategorySlug
                  )?.name || 'Category'}
                </Badge>
                <Badge variant='success' dot>
                  Audit Pending
                </Badge>
              </div>
              <h4 className='text-2xl leading-tight font-bold'>
                {previewService || 'Service Title'}
              </h4>
              <p className='text-sm leading-relaxed text-slate-400 italic'>
                &quot;{previewDescription || 'Description preview...'}&quot;
              </p>
            </div>
          </div>
          <div className='flex gap-4 rounded-2xl border border-amber-100 bg-amber-50 p-5'>
            <AlertTriangle className='h-6 w-6 shrink-0 text-amber-600' />
            <p className='text-xs leading-relaxed text-amber-800'>
              <strong>Note:</strong> All submissions are reviewed manually.
              Provide an official source link to avoid rejection.
            </p>
          </div>
        </aside>
      </div>
    </div>
  );
}
