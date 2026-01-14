import { useMemo, useState } from 'react';
import { useForm } from 'react-hook-form';
import { useSearchParams } from 'react-router-dom';
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
} from 'lucide-react';

// UI & Layouts
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

// Data & Utils
import servicesData from '@/data/services/services.json';
import departmentsData from '@/data/directory/departments.json';
import categoryData from '@/data/service_categories.json';
import { toTitleCase } from '@/lib/stringUtils';
import { cn } from '@/lib/utils';

interface ContributionFormData {
  service: string;
  description: string;
  type: 'transaction' | 'information';
  categorySlug: string;
  officeSlug: string[]; // Changed to array
  steps: string;
  requirements: string;
  url: string;
  source: string;
  notes: string;
}

export default function ContributePage() {
  const [searchParams] = useSearchParams();
  const [officeSearch, setOfficeSearch] = useState('');
  const editSlug = searchParams.get('edit');

  const existingService = useMemo(
    () => servicesData.find(s => s.slug === editSlug),
    [editSlug]
  );

  const { register, handleSubmit, watch, reset, setValue } =
    useForm<ContributionFormData>({
      defaultValues: useMemo(() => {
        if (existingService) {
          return {
            service: existingService.service,
            description: existingService.description,
            type: existingService.type as 'transaction' | 'information',
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
        };
      }, [existingService]),
    });

  const formData = watch();
  const selectedOffices = watch('officeSlug') || [];

  // Helper to handle multi-office selection
  const toggleOffice = (slug: string) => {
    const current = [...selectedOffices];
    const index = current.indexOf(slug);
    if (index > -1) {
      current.splice(index, 1);
    } else {
      current.push(slug);
    }
    setValue('officeSlug', current);
  };

  const filteredOffices = departmentsData.filter(d =>
    d.office_name.toLowerCase().includes(officeSearch.toLowerCase())
  );

  const onSubmit = (data: ContributionFormData) => {
    const selectedCategory = categoryData.categories.find(
      c => c.slug === data.categorySlug
    );

    const jsonBlock = JSON.stringify(
      {
        service: data.service,
        slug:
          existingService?.slug ||
          data.service
            .toLowerCase()
            .trim()
            .replace(/[^\w\s-]/g, '')
            .replace(/[\s_-]+/g, '-')
            .replace(/^-+|-+$/g, ''),
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
      },
      null,
      2
    );

    const issueBody = `
### Proposed ${existingService ? 'Update' : 'Addition'}
<!-- DATA_START -->
\`\`\`json
${jsonBlock}
\`\`\`
<!-- DATA_END -->

**Reason for change:**
${data.notes || 'No notes provided.'}

**Proof / Official Source:**
${data.source || 'No source provided.'}

---
*Generated via Better LB Contribution Portal*`;

    const githubUrl = `https://github.com/bettergovph/betterlb/issues/new?title=${encodeURIComponent((existingService ? 'Update: ' : 'New: ') + data.service)}&body=${encodeURIComponent(issueBody)}&labels=contribution`;

    window.open(githubUrl, '_blank');
  };

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
              {existingService ? 'Suggest Edit' : 'Contribute Data'}
            </BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      <ModuleHeader
        title={existingService ? 'Suggest an Edit' : 'Contribute New Data'}
        description={
          existingService
            ? `Helping improve the information for &quot;${existingService.service}&quot;`
            : "Help us map the Science and Nature City's services."
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
                    Service Name
                  </label>
                  <input
                    id='service'
                    {...register('service', { required: true })}
                    className='p-3 w-full rounded-xl border transition-all outline-none border-slate-200 focus:ring-4 focus:ring-primary-500/5'
                  />
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

              {/* MULTI-OFFICE SELECTOR */}
              <div className='space-y-3'>
                <label className='block heading-label'>
                  Responsible Offices
                </label>
                <div className='relative mb-2'>
                  <Search className='absolute left-3 top-1/2 w-4 h-4 -translate-y-1/2 text-slate-400' />
                  <input
                    type='text'
                    placeholder='Filter offices...'
                    className='py-2 pr-4 pl-10 w-full text-sm italic border-b outline-none border-slate-100'
                    onChange={e => setOfficeSearch(e.target.value)}
                  />
                </div>
                <div className='grid overflow-y-auto grid-cols-1 gap-2 p-4 max-h-64 rounded-2xl border md:grid-cols-2 bg-slate-50 border-slate-200 scrollbar-thin'>
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
                <div className='flex justify-end pt-2'>
                  <Badge variant='primary'>
                    {selectedOffices.length} Office(s) Selected
                  </Badge>
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
                  Short Description
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
                    Steps (New line per step)
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

          <DetailSection title='Source & Audit' icon={Globe}>
            <div className='space-y-4'>
              <div>
                <label className='block mb-2 heading-label' htmlFor='source'>
                  Source URL (FB/Website)
                </label>
                <input
                  id='source'
                  {...register('source', { required: true })}
                  className='p-3 w-full text-sm rounded-xl border outline-none border-slate-200'
                  placeholder='Required for verification'
                />
              </div>
              <div>
                <label className='block mb-2 heading-label' htmlFor='notes'>
                  Contribution Notes
                </label>
                <textarea
                  id='notes'
                  {...register('notes')}
                  className='p-3 w-full h-20 text-sm rounded-xl border outline-none border-slate-200'
                  placeholder='Anything else our auditors should know?'
                />
              </div>
            </div>
          </DetailSection>

          <div className='flex flex-col gap-4 sm:flex-row'>
            <button
              type='submit'
              className='flex-1 py-4 bg-primary-600 text-white rounded-2xl font-bold flex items-center justify-center gap-2 hover:bg-primary-700 shadow-xl transition-all min-h-[48px]'
            >
              Review on GitHub <Github className='w-4 h-4' />
            </button>
            <button
              type='button'
              onClick={() => reset()}
              className='flex gap-2 justify-center items-center px-6 py-4 rounded-2xl border transition-all border-slate-200 text-slate-400 hover:bg-slate-50'
            >
              <RotateCcw className='w-4 h-4' /> Reset
            </button>
          </div>
        </form>

        {/* --- PREVIEW COLUMN --- */}
        <div className='space-y-6 lg:col-span-5 lg:sticky lg:top-32 h-fit'>
          <h3 className='flex gap-2 items-center heading-label'>
            <Eye className='w-3 h-3' /> Live Preview
          </h3>
          <div className='p-8 rounded-3xl bg-slate-900 text-white shadow-2xl relative overflow-hidden ring-4 ring-primary-500/10 min-h-[200px]'>
            <div className='relative z-10 space-y-4'>
              <div className='flex gap-2'>
                <Badge variant='primary'>
                  {categoryData.categories.find(
                    c => c.slug === formData.categorySlug
                  )?.name || 'Category'}
                </Badge>
                <Badge variant='success' dot>
                  Audit Pending
                </Badge>
              </div>
              <h4 className='text-2xl font-bold leading-tight'>
                {formData.service || 'Service Title'}
              </h4>
              <p className='text-sm italic leading-relaxed text-slate-400'>
                &quot;
                {formData.description ||
                  'Describe the service to see the preview...'}
                &quot;
              </p>
            </div>
          </div>

          <div className='flex gap-4 p-5 bg-amber-50 rounded-2xl border border-amber-100'>
            <AlertTriangle className='w-6 h-6 text-amber-600 shrink-0' />
            <p className='text-xs leading-relaxed text-amber-800'>
              <strong>Public Trust Notice:</strong> All submissions must include
              an official source link. Our auditors will verify the data before
              it appears on the live site.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
