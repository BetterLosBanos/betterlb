import { Link, useParams } from 'react-router-dom';
import { format } from 'date-fns';
import {
  CheckCircle2Icon,
  ExternalLink,
  Clock,
  Banknote,
  Users,
  Calendar,
  FileText,
  CalendarCheck,
  ClipboardList,
  FileCheck,
  HelpCircle,
  Building2,
  LayoutGrid,
  MapPin,
  Phone,
  Globe,
  ArrowLeft,
} from 'lucide-react';

import {
  Card,
  CardContent,
  CardList,
  CardGrid,
} from '../../components/ui/CardList';

import servicesData from '../../data/services/services.json';
import departmentsData from '../../data/directory/departments.json';

interface Service {
  id: string;
  service: string;
  slug?: string;
  url?: string;
  officeSlug?: string;
  category: { name: string; slug: string };
  steps?: string[];
  requirements?: string[];
  faqs?: { question: string; answer: string }[];
  relatedServices?: string[];
  quickInfo?: Record<string, string>;
  createdAt?: string;
  updatedAt?: string;
  [key: string]: unknown;
}

interface Department {
  slug: string;
  office_name: string;
  address?: string;
  trunkline?: string | string[];
  website?: string;
  [key: string]: unknown;
}

const QUICK_INFO_CONFIG: Record<
  string,
  { label: string; icon: React.ElementType }
> = {
  processingTime: { label: 'Processing Time', icon: Clock },
  fee: { label: 'Fee', icon: Banknote },
  whoCanApply: { label: 'Who Can Apply', icon: Users },
  appointmentType: { label: 'Appointment Type', icon: Calendar },
  validity: { label: 'Validity Period', icon: CalendarCheck },
  documents: { label: 'Documents Required', icon: FileText },
};

const allServices = servicesData as Service[];

const loadedDepartments = departmentsData as unknown as Department[];

const departmentMap: Record<string, Department> = Object.fromEntries(
  loadedDepartments.map(d => [d.slug, d])
);

export default function ServiceDetail() {
  const { service: serviceSlug } = useParams<{ service: string }>();

  const service = allServices.find(
    s => s.slug === decodeURIComponent(serviceSlug || '')
  );

  if (!service) {
    return (
      <div className='bg-white rounded-lg border p-8 text-center h-full flex flex-col items-center justify-center'>
        <h2 className='text-2xl font-semibold mb-4'>Service not found</h2>
        <p className='text-gray-800'>Please select a service from the list.</p>
        <Link
          to='/services'
          className='mt-4 text-primary-600 hover:underline inline-flex items-center gap-2'
        >
          <ArrowLeft className='h-4 w-4' /> Back to Services
        </Link>
      </div>
    );
  }

  const {
    service: serviceName,
    category,
    steps,
    requirements,
    faqs,
    relatedServices,
    quickInfo,
    officeSlug,
    updatedAt,
    url,
  } = service;

  const office = officeSlug ? departmentMap[officeSlug] : null;

  // Prepare Quick Info with Icons
  const quickInfoArray = quickInfo
    ? Object.entries(quickInfo).map(([key, value]) => {
        const config = QUICK_INFO_CONFIG[key];
        return {
          label: config ? config.label : key,
          icon: config ? config.icon : FileText, // Default icon
          value,
        };
      })
    : [];

  return (
    <div className='@container space-y-6 p-4 md:p-8'>
      {/* Breadcrumb */}
      <Link
        to='/services'
        className='inline-flex items-center text-sm text-gray-500 hover:text-primary-600 transition-colors'
      >
        <ArrowLeft className='w-4 h-4 mr-1.5' />
        Back to Services
      </Link>

      {/* Header */}
      <div className='text-center'>
        <h1 className='text-3xl md:text-4xl font-bold text-gray-900'>
          {serviceName}
        </h1>
        <div className='flex items-center justify-center gap-2 mt-2 text-gray-600 text-sm'>
          <span className='bg-gray-100 px-2 py-0.5 rounded text-gray-700 font-medium'>
            {category?.name}
          </span>
        </div>

        {/* External URL Button */}
        {url && (
          <div className='mt-5 flex justify-center'>
            <a
              href={url}
              target='_blank'
              rel='noopener noreferrer'
              className='inline-flex items-center gap-2 px-4 py-2 bg-primary-600 text-white text-sm font-medium rounded-lg hover:bg-primary-700 transition-colors shadow-sm'
            >
              Visit Service Website
              <ExternalLink className='h-4 w-4' />
            </a>
          </div>
        )}
      </div>

      {/* Quick Info Grid */}
      {quickInfoArray.length > 0 && (
        <CardGrid className='md:grid-cols-2 lg:grid-cols-4 gap-4'>
          {quickInfoArray.map((info, idx) => {
            const Icon = info.icon;
            return (
              <Card key={idx} className='border-l-4 border-l-primary-500'>
                <CardContent className='flex items-start gap-3 pt-5'>
                  <div className='p-2 bg-primary-50 rounded-full text-primary-600'>
                    <Icon className='h-5 w-5' />
                  </div>
                  <div>
                    <h4 className='font-semibold text-xs text-gray-500 uppercase tracking-wide'>
                      {info.label}
                    </h4>
                    <p className='text-gray-900 font-medium mt-0.5'>
                      {info.value}
                    </p>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </CardGrid>
      )}

      {/* Step-by-Step */}
      {steps && steps.length > 0 && (
        <CardList>
          <Card>
            <CardContent>
              <div className='flex items-center gap-2 mb-4 border-b pb-2'>
                <ClipboardList className='h-5 w-5 text-primary-600' />
                <h2 className='text-xl font-semibold text-gray-900'>
                  Step-by-Step Process
                </h2>
              </div>
              <ol className='relative border-l border-gray-200 ml-3 space-y-6'>
                {steps.map((step, idx) => (
                  <li key={idx} className='mb-2 ml-6'>
                    <span className='absolute flex items-center justify-center w-6 h-6 bg-primary-100 rounded-full -left-3 ring-4 ring-white text-primary-800 text-xs font-bold'>
                      {idx + 1}
                    </span>
                    <p className='text-gray-700 leading-relaxed'>{step}</p>
                  </li>
                ))}
              </ol>
            </CardContent>
          </Card>
        </CardList>
      )}

      {/* Requirements */}
      {requirements && requirements.length > 0 && (
        <CardList>
          <Card>
            <CardContent>
              <div className='flex items-center gap-2 mb-4 border-b pb-2'>
                <FileCheck className='h-5 w-5 text-primary-600' />
                <h2 className='text-xl font-semibold text-gray-900'>
                  Requirements
                </h2>
              </div>
              <ul className='grid grid-cols-1 md:grid-cols-1 gap-x-4 gap-y-2'>
                {requirements.map((req, idx) => (
                  <li key={idx} className='flex items-start gap-2'>
                    <span className='mt-1.5 h-1.5 w-1.5 rounded-full bg-primary-500 flex-shrink-0' />
                    <span className='text-gray-700'>{req}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        </CardList>
      )}

      {/* FAQs */}
      {faqs && faqs.length > 0 && (
        <CardList>
          {faqs.map((faq, idx) => (
            <Card key={idx}>
              <CardContent>
                <div className='flex gap-3'>
                  <HelpCircle className='h-5 w-5 text-primary-600 flex-shrink-0 mt-1' />
                  <div>
                    <p className='font-semibold text-gray-900 mb-1'>
                      {faq.question}
                    </p>
                    <p className='text-gray-600 text-sm leading-relaxed'>
                      {faq.answer}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </CardList>
      )}

      {/* Office Information */}
      {office && (
        <CardList>
          <Card>
            <CardContent>
              <div className='flex items-center gap-2 mb-4 border-b pb-2'>
                <Building2 className='h-5 w-5 text-primary-600' />
                <h2 className='text-xl font-semibold text-gray-900'>
                  Office Information
                </h2>
              </div>

              <div className='space-y-4'>
                <Link
                  to={`/departments/${office.slug}`}
                  className='text-lg font-semibold text-primary-700 hover:underline block'
                >
                  {office.office_name}
                </Link>

                <div className='grid md:grid-cols-2 gap-4'>
                  {/* Address */}
                  {office.address && (
                    <div className='flex items-start gap-3'>
                      <MapPin className='h-5 w-5 text-gray-400 mt-0.5' />
                      <div>
                        <span className='block text-xs font-semibold text-gray-500 uppercase'>
                          Address
                        </span>
                        <p className='text-gray-900 text-sm'>
                          {office.address}
                        </p>
                      </div>
                    </div>
                  )}

                  {/* Trunkline */}
                  {office.trunkline && (
                    <div className='flex items-start gap-3'>
                      <Phone className='h-5 w-5 text-gray-400 mt-0.5' />
                      <div>
                        <span className='block text-xs font-semibold text-gray-500 uppercase'>
                          Trunkline
                        </span>
                        <p className='text-gray-900 text-sm'>
                          {Array.isArray(office.trunkline)
                            ? office.trunkline.join(', ')
                            : office.trunkline}
                        </p>
                      </div>
                    </div>
                  )}

                  {/* Website */}
                  {office.website && (
                    <div className='flex items-start gap-3 md:col-span-2'>
                      <Globe className='h-5 w-5 text-gray-400 mt-0.5' />
                      <div>
                        <span className='block text-xs font-semibold text-gray-500 uppercase'>
                          Website
                        </span>
                        <a
                          href={office.website}
                          target='_blank'
                          rel='noopener noreferrer'
                          className='text-primary-600 hover:underline text-sm inline-flex items-center gap-1'
                        >
                          Visit Office Website
                          <ExternalLink className='h-3 w-3' />
                        </a>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </CardList>
      )}

      {/* Related Services */}
      {relatedServices && relatedServices.length > 0 && (
        <CardList>
          <Card>
            <CardContent>
              <div className='flex items-center gap-2 mb-4'>
                <LayoutGrid className='h-5 w-5 text-primary-600' />
                <h2 className='text-xl font-semibold text-gray-900'>
                  Related Services
                </h2>
              </div>
              <ul className='grid sm:grid-cols-2 gap-2'>
                {relatedServices.map(rel => {
                  const relService = allServices.find(
                    s => s.slug === rel || s.service === rel
                  );
                  if (!relService) return null;

                  return (
                    <li key={relService.slug}>
                      <Link
                        to={`/services/${relService.slug}`}
                        className='flex items-center gap-2 text-primary-600 hover:text-primary-800 hover:bg-primary-50 px-3 py-2 rounded-md transition-colors text-sm font-medium'
                      >
                        <ArrowLeft className='h-3 w-3 rotate-180' />
                        {relService.service}
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </CardContent>
          </Card>
        </CardList>
      )}

      {/* Footer / Last Verified */}
      {updatedAt && (
        <div className='flex items-center gap-2 text-sm text-gray-500 mt-8 pt-6 border-t border-gray-100'>
          <CheckCircle2Icon className='h-4 w-4 text-success-500' />
          <time dateTime={updatedAt}>
            Last verified: {format(new Date(updatedAt), 'd MMM yyyy')}
          </time>
        </div>
      )}
    </div>
  );
}
