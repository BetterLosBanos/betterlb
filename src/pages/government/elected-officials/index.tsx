import { Link } from 'react-router-dom';
import {
  ArrowRightIcon,
  BookOpenIcon,
  Building2Icon,
  GavelIcon,
  UsersIcon,
  LandmarkIcon,
  ChevronRightIcon,
} from 'lucide-react';
import executiveData from '../../../data/directory/executive.json';
import legislativeData from '../../../data/directory/legislative.json';
import {
  Card,
  CardContent,
  CardAvatar,
  CardTitle,
  CardDescription,
} from '../../../components/ui/CardList';

export default function ElectedOfficialsIndex() {
  // 1. Get Executive Data (Mayor & Vice Mayor)
  const mayor = executiveData.find(o => o.slug === 'office-of-the-mayor');
  const viceMayor = executiveData.find(
    o => o.slug === 'office-of-the-vice-mayor'
  );

  // 2. Get Legislative Data
  const sbData = legislativeData.find(d => d.slug === '12th-sangguniang-bayan');
  const committeeCount = sbData?.permanent_committees?.length || 0;
  const memberCount = sbData?.officials?.length || 0;

  return (
    <div className='space-y-12 @container animate-in fade-in duration-500'>
      {/* --- Executive Branch Section --- */}
      <section>
        <div className='flex items-center gap-3 mb-6'>
          <div className='p-2 bg-blue-100 rounded-lg'>
            <Building2Icon className='h-6 w-6 text-blue-700' />
          </div>
          <div>
            <h2 className='text-2xl font-bold text-gray-900'>
              Executive Branch
            </h2>
            <p className='text-gray-600 text-sm'>
              Local Chief Executive and the Presiding Officer
            </p>
          </div>
        </div>

        <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
          {/* Mayor Card */}
          {mayor && (
            <Link
              to={`/government/elected-officials/${mayor.slug}`}
              state={{ scrollToContent: true }}
              className='group'
            >
              <Card
                variant='featured'
                className='h-full border-blue-100 hover:border-blue-300 transition-all duration-300 hover:shadow-md'
              >
                <CardContent className='flex flex-col items-center text-center justify-center h-full py-8'>
                  <div className='relative'>
                    <CardAvatar
                      name={mayor.officials[0].name}
                      size='lg'
                      className='mb-4 ring-4 ring-blue-50'
                    />
                    <div className='absolute -bottom-1 -right-1 bg-blue-600 rounded-full p-1.5 border-2 border-white'>
                      <LandmarkIcon className='h-3.5 w-3.5 text-white' />
                    </div>
                  </div>
                  <CardTitle
                    level='h3'
                    className='text-xl group-hover:text-blue-700 transition-colors'
                  >
                    {mayor.officials[0].name}
                  </CardTitle>
                  <CardDescription className='text-primary-600 font-bold uppercase tracking-wide text-sm mt-1'>
                    {mayor.officials[0].role}
                  </CardDescription>
                  <div className='mt-4 flex items-center text-sm text-gray-500 group-hover:text-blue-600'>
                    <span>Visit Office</span>
                    <ArrowRightIcon className='ml-1 h-4 w-4 transition-transform group-hover:translate-x-1' />
                  </div>
                </CardContent>
              </Card>
            </Link>
          )}

          {/* Vice Mayor Card */}
          {viceMayor && (
            <Link
              to={`/government/elected-officials/${viceMayor.slug}`}
              state={{ scrollToContent: true }}
              className='group'
            >
              <Card
                variant='featured'
                className='h-full border-blue-100 hover:border-blue-300 transition-all duration-300 hover:shadow-md'
              >
                <CardContent className='flex flex-col items-center text-center justify-center h-full py-8'>
                  <div className='relative'>
                    <CardAvatar
                      name={viceMayor.officials[0].name}
                      size='lg'
                      className='mb-4 ring-4 ring-blue-50'
                    />
                    <div className='absolute -bottom-1 -right-1 bg-indigo-600 rounded-full p-1.5 border-2 border-white'>
                      <GavelIcon className='h-3.5 w-3.5 text-white' />
                    </div>
                  </div>
                  <CardTitle
                    level='h3'
                    className='text-xl group-hover:text-indigo-700 transition-colors'
                  >
                    {viceMayor.officials[0].name}
                  </CardTitle>
                  <CardDescription className='text-primary-600 font-bold uppercase tracking-wide text-sm mt-1'>
                    {viceMayor.officials[0].role}
                  </CardDescription>
                  <div className='mt-4 flex items-center text-sm text-gray-500 group-hover:text-indigo-600'>
                    <span>Visit Office</span>
                    <ArrowRightIcon className='ml-1 h-4 w-4 transition-transform group-hover:translate-x-1' />
                  </div>
                </CardContent>
              </Card>
            </Link>
          )}
        </div>
      </section>

      {/* --- Legislative Branch Section --- */}
      <section>
        <div className='flex items-center gap-3 mb-6'>
          <div className='p-2 bg-amber-100 rounded-lg'>
            <UsersIcon className='h-6 w-6 text-amber-700' />
          </div>
          <div>
            <h2 className='text-2xl font-bold text-gray-900'>
              Legislative Branch
            </h2>
            <p className='text-gray-600 text-sm'>
              Sangguniang Bayan Members and Committees
            </p>
          </div>
        </div>

        <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
          {/* Sangguniang Bayan Main Link */}
          <Link
            to='/government/elected-officials/12th-sangguniang-bayan'
            state={{ scrollToContent: true }}
            className='group relative overflow-hidden bg-white border border-gray-200 rounded-xl p-6 hover:shadow-md transition-all duration-300 hover:border-amber-300'
          >
            <div className='absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity'>
              <UsersIcon className='h-24 w-24 text-amber-600' />
            </div>

            <div className='relative z-10'>
              <div className='flex justify-between items-start mb-4'>
                <div className='p-3 bg-amber-50 rounded-lg group-hover:bg-amber-100 transition-colors'>
                  <LandmarkIcon className='h-6 w-6 text-amber-600' />
                </div>
                <ChevronRightIcon className='h-5 w-5 text-gray-400 group-hover:text-amber-600' />
              </div>

              <h3 className='text-lg font-bold text-gray-900 group-hover:text-amber-700 mb-2'>
                12th Sangguniang Bayan
              </h3>
              <p className='text-gray-600 text-sm mb-4 line-clamp-2'>
                The local legislative body of Los Baños responsible for passing
                ordinances and resolutions.
              </p>

              <div className='inline-flex items-center text-xs font-medium text-amber-700 bg-amber-50 px-2.5 py-1 rounded-full'>
                <UsersIcon className='h-3 w-3 mr-1.5' />
                {memberCount} Members
              </div>
            </div>
          </Link>

          {/* Committees Link */}
          <Link
            to='/government/elected-officials/municipal-committees'
            state={{ scrollToContent: true }}
            className='group relative overflow-hidden bg-white border border-gray-200 rounded-xl p-6 hover:shadow-md transition-all duration-300 hover:border-emerald-300'
          >
            <div className='absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity'>
              <BookOpenIcon className='h-24 w-24 text-emerald-600' />
            </div>

            <div className='relative z-10'>
              <div className='flex justify-between items-start mb-4'>
                <div className='p-3 bg-emerald-50 rounded-lg group-hover:bg-emerald-100 transition-colors'>
                  <BookOpenIcon className='h-6 w-6 text-emerald-600' />
                </div>
                <ChevronRightIcon className='h-5 w-5 text-gray-400 group-hover:text-emerald-600' />
              </div>

              <h3 className='text-lg font-bold text-gray-900 group-hover:text-emerald-700 mb-2'>
                Legislative Committees
              </h3>
              <p className='text-gray-600 text-sm mb-4 line-clamp-2'>
                Standing committees responsible for studying and deliberating
                upon measures and concerns.
              </p>

              <div className='inline-flex items-center text-xs font-medium text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full'>
                <GavelIcon className='h-3 w-3 mr-1.5' />
                {committeeCount} Standing Committees
              </div>
            </div>
          </Link>
        </div>
      </section>
    </div>
  );
}
