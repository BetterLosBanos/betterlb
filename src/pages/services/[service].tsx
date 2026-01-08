import { Link, useParams } from 'react-router-dom';
import {
  Card,
  CardContent,
  CardList,
  CardGrid,
} from '../../components/ui/CardList';
import businessTradeServices from '../../data/services/business-trade.json';
import certificatesIdsServices from '../../data/services/certificates-ids.json';
import contributionsServices from '../../data/services/contributions.json';
import disasterWeatherServices from '../../data/services/disaster-weather.json';
import educationServices from '../../data/services/education.json';
import employmentServices from '../../data/services/employment.json';
import healthServices from '../../data/services/health.json';
import housingServices from '../../data/services/housing.json';
import passportTravelServices from '../../data/services/passport-travel.json';
import socialServices from '../../data/services/social-services.json';
import taxServices from '../../data/services/tax.json';
import transportDrivingServices from '../../data/services/transport-driving.json';
import uncategorizedServices from '../../data/services/uncategorized.json';

const allServices = [
  ...businessTradeServices,
  ...certificatesIdsServices,
  ...contributionsServices,
  ...disasterWeatherServices,
  ...educationServices,
  ...employmentServices,
  ...healthServices,
  ...housingServices,
  ...passportTravelServices,
  ...socialServices,
  ...taxServices,
  ...transportDrivingServices,
  ...uncategorizedServices,
];

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
      </div>
    );
  }

  const {
    service: serviceName,
    category,
    subcategory,
    steps,
    requirements,
    faqs,
    office,
    relatedServices,
    quickInfo,
  } = service;

  // Convert quickInfo object to array of {label, value}
  const quickInfoArray = quickInfo
    ? Object.entries(quickInfo).map(([label, value]) => ({ label, value }))
    : [];

  return (
    <div className='@container space-y-6 p-4 md:p-8'>
      <Link to='/services' className='text-sm text-primary-600 hover:underline'>
        ← Back to Services
      </Link>

      <h1 className='text-3xl font-bold'>{serviceName}</h1>
      <p className='text-gray-700 mb-4'>
        Category: {category.name} / {subcategory.name}
      </p>

      {/* Quick Info Cards */}
      {quickInfoArray.length > 0 && (
        <CardGrid
          columns={1}
          className='md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6'
        >
          {quickInfoArray.map((info, idx) => (
            <Card key={idx}>
              <CardContent>
                <h4 className='font-semibold text-sm'>{info.label}</h4>
                <p className='text-gray-900 text-sm'>{info.value}</p>
              </CardContent>
            </Card>
          ))}
        </CardGrid>
      )}

      {/* Steps */}
      {Array.isArray(steps) && steps.length > 0 && (
        <CardList>
          <Card>
            <CardContent>
              <h2 className='text-xl font-semibold mb-2'>
                Step-by-Step Process
              </h2>
              <ol className='list-decimal pl-5 space-y-1'>
                {steps.map((step, idx) => (
                  <li key={idx}>{step}</li>
                ))}
              </ol>
            </CardContent>
          </Card>
        </CardList>
      )}

      {/* Requirements */}
      {Array.isArray(requirements) && requirements.length > 0 && (
        <CardList>
          <Card>
            <CardContent>
              <h2 className='text-xl font-semibold mb-2'>Requirements</h2>
              <ul className='list-disc pl-5 space-y-1'>
                {requirements.map((req, idx) => (
                  <li key={idx}>{req}</li>
                ))}
              </ul>
            </CardContent>
          </Card>
        </CardList>
      )}

      {/* FAQs */}
      {Array.isArray(faqs) && faqs.length > 0 && (
        <CardList>
          {faqs.map((faq, idx) => (
            <Card key={idx}>
              <CardContent>
                <p className='font-medium'>{faq.question}</p>
                <p className='text-gray-700'>{faq.answer}</p>
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
              <h2 className='text-xl font-semibold mb-2'>Office Information</h2>
              <p>{office.name}</p>
              <p>{office.address}</p>
              {office.phone && <p>Phone: {office.phone}</p>}
              {office.email && <p>Email: {office.email}</p>}
            </CardContent>
          </Card>
        </CardList>
      )}

      {/* Related Services */}
      {Array.isArray(relatedServices) && relatedServices.length > 0 && (
        <CardList>
          <Card>
            <CardContent>
              <h2 className='text-xl font-semibold mb-2'>Related Services</h2>
              <ul className='list-disc pl-5 space-y-1'>
                {relatedServices.map(relSlug => {
                  const relService = allServices.find(
                    s => s.service === relSlug || s.slug === relSlug
                  );
                  if (!relService) return null;
                  return (
                    <li key={relService.slug}>
                      <Link
                        to={`/services/${relService.slug}`}
                        className='text-primary-600 hover:underline'
                      >
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
    </div>
  );
}
