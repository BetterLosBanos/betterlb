import { useMemo, useState } from 'react';
import { useForm } from 'react-hook-form';
import { useSearchParams, Link } from 'react-router-dom';
import {
  ClipboardList,
  Eye,
  AlertTriangle,
  RotateCcw,
  Github,
  Globe,
  FileText,
  CheckSquare,
  Square,
  Search,
  Loader2,
  AlertCircle,
  CheckCircle2,
} from 'lucide-react';

import { ModuleHeader, DetailSection } from '@/components/layout/PageLayouts';
import { Badge } from '@/components/ui/Badge';
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
  BreadcrumbHome,
} from '@/components/ui/Breadcrumb';

import servicesData from '@/data/services/services.json';
import departmentsData from '@/data/directory/departments.json';
import categoryData from '@/data/service_categories.json';
import { toTitleCase } from '@/lib/stringUtils';
import { cn } from '@/lib/utils';

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
      <div className='py-20 mx-auto max-w-2xl text-center duration-500 animate-in zoom-in-95'>
        <div className='flex justify-center mb-6'>
          <div className='p-4 bg-emerald-50 rounded-full ring-8 ring-emerald-50/50'>
            <CheckCircle2 className='w-12 h-12 text-emerald-600' />
          </div>
        </div>
        <h2 className='mb-4 text-3xl font-extrabold text-slate-900'>
          Submission Received
        </h2>
        <p className='mb-10 text-lg leading-relaxed text-slate-600'>
          Thank you for helping improve Better LB. Your contribution has been
          sent to our auditors for verification.
        </p>
        <div className='flex flex-col gap-4 justify-center sm:flex-row'>
          <Link
            to='/services'
            className='px-8 py-3 bg-primary-600 text-white rounded-xl font-bold shadow-lg hover:bg-primary-700 transition-all min-h-[48px] flex items-center justify-center'
          >
            Back to Services
          </Link>
          <button
            onClick={() => {
              setStatus('idle');
              reset();
            }}
            className='px-8 py-3 bg-white border border-slate-200 text-slate-600 rounded-xl font-bold hover:bg-slate-50 transition-all min-h-[48px]'
          >
            Submit Another
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className='px-4 pb-20 mx-auto space-y-6 max-w-7xl duration-500 animate-in fade-in md:px-0'>
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
                  <label className='block mb-2 heading-label' htmlFor='service'>
                    Service Name <span className='text-secondary-600'>*</span>
                  </label>
                  <input
                    id='service'
                    {...register('service', { required: 'Name is required' })}
                    className={cn(
                      'p-3 w-full rounded-xl border outline-none transition-all',
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
                  <label className='block mb-2 heading-label' htmlFor='type'>
                    Type
                  </label>
                  <select
                    id='type'
                    {...register('type')}
                    className='p-3 w-full bg-white rounded-xl border outline-none border-slate-200'
                  >
                    <option value='transaction'>Transactional</option>
                    <option value='information'>Informational</option>
                  </select>
                </div>
                <div>
                  <label
                    className='block mb-2 heading-label'
                    htmlFor='categorySlug'
                  >
                    Category
                  </label>
                  <select
                    id='categorySlug'
                    {...register('categorySlug')}
                    className='p-3 w-full bg-white rounded-xl border outline-none border-slate-200'
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
                <label className='block heading-label'>
                  Responsible Offices{' '}
                  <span className='text-secondary-600'>*</span>
                </label>
                <div className='relative mb-2'>
                  <Search className='absolute left-3 top-1/2 w-4 h-4 -translate-y-1/2 text-slate-400' />
                  <input
                    type='text'
                    placeholder='Search departments...'
                    className='py-2 pr-4 pl-10 w-full text-sm italic bg-transparent border-b outline-none border-slate-100'
                    onChange={e => setOfficeSearch(e.target.value)}
                  />
                </div>
                <div
                  className={cn(
                    'grid overflow-y-auto grid-cols-1 gap-2 p-4 max-h-64 rounded-2xl border md:grid-cols-2 bg-slate-50 border-slate-200 scrollbar-thin',
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
                          'flex gap-3 items-center p-3 text-left rounded-xl border transition-all min-h-[44px]',
                          isChecked
                            ? 'bg-white ring-2 shadow-sm border-primary-600 ring-primary-500/5'
                            : 'bg-transparent border-slate-200 hover:border-slate-300'
                        )}
                      >
                        {isChecked ? (
                          <CheckSquare className='w-4 h-4 text-primary-600 shrink-0' />
                        ) : (
                          <Square className='w-4 h-4 text-slate-300 shrink-0' />
                        )}
                        <span
                          className={cn(
                            'text-xs font-bold leading-tight',
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
                  className='block mb-2 heading-label'
                  htmlFor='description'
                >
                  Description
                </label>
                <textarea
                  id='description'
                  {...register('description')}
                  className='p-3 w-full h-24 text-sm rounded-xl border outline-none border-slate-200'
                />
              </div>
              <div className='grid grid-cols-1 gap-4 md:grid-cols-2'>
                <div>
                  <label className='block mb-2 heading-label' htmlFor='steps'>
                    Steps (New line per item)
                  </label>
                  <textarea
                    id='steps'
                    {...register('steps')}
                    className='p-3 w-full h-48 font-mono text-xs rounded-xl border outline-none border-slate-200'
                  />
                </div>
                <div>
                  <label
                    className='block mb-2 heading-label'
                    htmlFor='requirements'
                  >
                    Requirements (New line per item)
                  </label>
                  <textarea
                    id='requirements'
                    {...register('requirements')}
                    className='p-3 w-full h-48 font-mono text-xs rounded-xl border outline-none border-slate-200'
                  />
                </div>
              </div>
            </div>
          </DetailSection>

          <DetailSection title='Verification Info' icon={Globe}>
            <div className='space-y-4'>
              <div>
                <label className='block mb-2 heading-label' htmlFor='source'>
                  Official Source Link{' '}
                  <span className='text-secondary-600'>*</span>
                </label>
                <input
                  id='source'
                  {...register('source', { required: 'Link required' })}
                  className={cn(
                    'p-3 w-full text-sm rounded-xl border outline-none border-slate-200',
                    errors.source && 'border-rose-500'
                  )}
                />
              </div>
              <div>
                <label className='block mb-2 heading-label' htmlFor='notes'>
                  Internal Notes
                </label>
                <textarea
                  id='notes'
                  {...register('notes')}
                  className='p-3 w-full h-20 text-sm rounded-xl border outline-none border-slate-200'
                />
              </div>
            </div>
          </DetailSection>

          <div className='flex flex-col gap-4 sm:flex-row'>
            <button
              type='submit'
              disabled={status === 'loading'}
              className='flex-1 py-4 bg-primary-600 text-white rounded-2xl font-bold flex items-center justify-center gap-2 hover:bg-primary-700 shadow-xl transition-all min-h-[48px] disabled:opacity-50'
            >
              {status === 'loading' ? (
                <>
                  <Loader2 className='w-4 h-4 animate-spin' /> Sending...
                </>
              ) : (
                <>
                  <Github className='w-4 h-4' /> Submit to Audit
                </>
              )}
            </button>
            <button
              type='button'
              onClick={() => reset()}
              className='flex gap-2 justify-center items-center px-6 py-4 rounded-2xl border transition-all border-slate-200 text-slate-400 hover:bg-slate-50 min-h-[48px]'
            >
              <RotateCcw className='w-4 h-4' /> Reset
            </button>
          </div>

          {status === 'error' && (
            <div className='flex gap-3 items-center p-4 text-rose-800 bg-rose-50 rounded-xl border border-rose-100'>
              <AlertCircle className='w-5 h-5 shrink-0' />
              <p className='text-sm font-bold'>
                Error: {errorMessage || 'Submission failed'}
              </p>
            </div>
          )}
        </form>

        <aside className='space-y-6 lg:col-span-5 lg:sticky lg:top-32 h-fit'>
          <h3 className='flex gap-2 items-center heading-label'>
            <Eye className='w-3 h-3' /> Live Preview
          </h3>
          <div className='p-8 text-white rounded-3xl ring-4 shadow-2xl bg-slate-900 ring-primary-500/10 min-h-[200px]'>
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
              <h4 className='text-2xl font-bold leading-tight'>
                {previewService || 'Service Title'}
              </h4>
              <p className='text-sm italic leading-relaxed text-slate-400'>
                &quot;{previewDescription || 'Description preview...'}&quot;
              </p>
            </div>
          </div>
          <div className='flex gap-4 p-5 bg-amber-50 rounded-2xl border border-amber-100'>
            <AlertTriangle className='w-6 h-6 text-amber-600 shrink-0' />
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
