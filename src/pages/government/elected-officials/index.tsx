import { Link } from 'react-router-dom';
import {
  Gavel,
  ChevronRight,
  Landmark,
  BookOpen,
  Users,
  Mail,
  Phone,
} from 'lucide-react';
import { ModuleHeader } from '@/components/layout/PageLayouts';
import { CardAvatar } from '@/components/ui/CardList';
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
  BreadcrumbHome,
} from '@/components/ui/Breadcrumb';

// Data Imports
import executiveData from '@/data/directory/executive.json';
import legislativeData from '@/data/directory/legislative.json';

export default function ElectedOfficialsIndex() {
  // 1. Extract Executive Data
  const mayorOffice = executiveData.find(o => o.slug === 'office-of-the-mayor');
  const mayor = mayorOffice?.officials[0];

  const viceMayorOffice = executiveData.find(
    o => o.slug === 'office-of-the-vice-mayor'
  );
  const viceMayor = viceMayorOffice?.officials[0];

  // 2. Extract Legislative Data
  const sbChamber = legislativeData.find(
    o => o.slug === '12th-sangguniang-bayan'
  );
  const committeeCount = sbChamber?.permanent_committees?.length || 0;

  return (
    <div className='mx-auto space-y-6 max-w-7xl duration-500 animate-in fade-in'>
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbHome href='/' />
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage>Elected Officials</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      <ModuleHeader
        title='Elected Officials'
        description='Meet the current leadership of the Municipal Government of Los Baños.'
      />

      <div className='grid grid-cols-1 gap-8 pt-4 lg:grid-cols-2'>
        {/* --- EXECUTIVE BRANCH --- */}
        <div className='flex relative flex-col p-8 rounded-3xl border-2 border-blue-100 bg-blue-50/30 group'>
          <Landmark className='absolute right-[-10px] bottom-[-10px] w-48 h-48 opacity-5 -rotate-12 pointer-events-none' />

          <div className='relative z-10 flex-1'>
            <h2 className='flex gap-2 items-center mb-6 text-xs font-bold tracking-widest text-blue-600 uppercase'>
              <span className='w-8 h-px bg-blue-200' /> Executive Branch
            </h2>

            <div className='mb-8 space-y-4'>
              {/* Mayor Card */}
              <Link
                to='/government/elected-officials/office-of-the-mayor'
                className='flex flex-col p-5 bg-white rounded-2xl border border-blue-100 shadow-sm transition-all hover:shadow-md hover:border-blue-300 group/item'
              >
                <div className='flex gap-4 items-center mb-4'>
                  <CardAvatar
                    name={mayor?.name || 'Mayor'}
                    size='md'
                    className='ring-2 ring-blue-50 shadow-inner'
                  />
                  <div className='flex-1 min-w-0'>
                    <p className='text-[10px] font-bold text-blue-500 uppercase tracking-widest'>
                      Municipal Mayor
                    </p>
                    <h3 className='text-lg font-bold text-gray-900 truncate group-hover/item:text-blue-700'>
                      {mayor?.name}
                    </h3>
                  </div>
                  <div className='p-2 text-blue-600 bg-blue-50 rounded-lg transition-colors group-hover/item:bg-blue-600 group-hover/item:text-white'>
                    <ChevronRight className='w-4 h-4' />
                  </div>
                </div>

                {/* Dynamic Contact Row from JSON */}
                <div className='flex flex-wrap items-center gap-x-6 gap-y-2 pt-4 border-t border-gray-50 text-[11px] font-medium text-gray-500'>
                  <div className='flex items-center gap-1.5'>
                    <Mail className='w-3 h-3 text-blue-400' />
                    <span>
                      {/* {mayorOffice?.email || 'officeofthemayor@losbanos.gov.ph'} */}
                    </span>
                  </div>
                  <div className='flex items-center gap-1.5'>
                    <Phone className='w-3 h-3 text-blue-400' />
                    <span>
                      {Array.isArray(mayorOffice?.trunkline)
                        ? mayorOffice.trunkline[0]
                        : mayorOffice?.trunkline}
                    </span>
                  </div>
                </div>
              </Link>

              {/* Vice Mayor Card */}
              <Link
                to='/government/elected-officials/office-of-the-vice-mayor'
                className='flex flex-col p-5 bg-white rounded-2xl border border-blue-100 shadow-sm transition-all hover:shadow-md hover:border-blue-300 group/item'
              >
                <div className='flex gap-4 items-center mb-4'>
                  <CardAvatar
                    name={viceMayor?.name || 'Vice Mayor'}
                    size='md'
                    className='ring-2 ring-blue-50 shadow-inner'
                  />
                  <div className='flex-1 min-w-0'>
                    <p className='text-[10px] font-bold text-blue-500 uppercase tracking-widest'>
                      Municipal Vice Mayor
                    </p>
                    <h3 className='text-lg font-bold text-gray-900 truncate group-hover/item:text-blue-700'>
                      {viceMayor?.name}
                    </h3>
                  </div>
                  <div className='p-2 text-blue-600 bg-blue-50 rounded-lg transition-colors group-hover/item:bg-blue-600 group-hover/item:text-white'>
                    <ChevronRight className='w-4 h-4' />
                  </div>
                </div>

                <div className='flex flex-wrap items-center gap-x-6 gap-y-2 pt-4 border-t border-gray-50 text-[11px] font-medium text-gray-500'>
                  <div className='flex items-center gap-1.5'>
                    <Mail className='w-3 h-3 text-blue-400' />
                    <span>
                      {viceMayorOffice?.email || 'vmo@losbanos.gov.ph'}
                    </span>
                  </div>
                  <div className='flex items-center gap-1.5'>
                    <Phone className='w-3 h-3 text-blue-400' />
                    <span>
                      {Array.isArray(viceMayorOffice?.trunkline)
                        ? viceMayorOffice.trunkline[0]
                        : viceMayorOffice?.trunkline}
                    </span>
                  </div>
                </div>
              </Link>
            </div>
          </div>
        </div>

        {/* --- LEGISLATIVE BRANCH --- */}
        <div className='flex relative flex-col p-8 rounded-3xl border-2 border-indigo-100 bg-indigo-50/30 group'>
          <Gavel className='absolute right-[-10px] bottom-[-10px] w-48 h-48 opacity-5 -rotate-12 pointer-events-none' />

          <div className='relative z-10 flex-1'>
            <h2 className='flex gap-2 items-center mb-6 text-xs font-bold tracking-widest text-indigo-600 uppercase'>
              <span className='w-8 h-px bg-indigo-200' /> Legislative Branch
            </h2>

            <div className='mb-8 space-y-4'>
              {/* Sangguniang Bayan Link */}
              <Link
                to='/government/elected-officials/12th-sangguniang-bayan'
                className='flex gap-4 items-center p-6 bg-white rounded-2xl border border-indigo-100 shadow-sm transition-all hover:shadow-md hover:border-indigo-300 group/item'
              >
                <div className='flex justify-center items-center w-12 h-12 text-white bg-indigo-600 rounded-xl shadow-lg'>
                  <Users className='w-6 h-6' />
                </div>
                <div className='flex-1'>
                  <h3 className='text-lg font-bold text-gray-900 group-hover/item:text-indigo-700'>
                    12th Sangguniang Bayan
                  </h3>
                  <p className='text-xs text-gray-500'>
                    Official Council Members & Sangguniang Bayan Secretary
                  </p>
                </div>
                <ChevronRight className='w-5 h-5 text-gray-300 group-hover/item:text-indigo-600' />
              </Link>

              {/* Committees Link */}
              <Link
                to='/government/elected-officials/municipal-committees'
                className='flex gap-4 items-center p-6 bg-white rounded-2xl border border-indigo-100 shadow-sm transition-all hover:shadow-md hover:border-indigo-300 group/item'
              >
                <div className='flex justify-center items-center w-12 h-12 text-indigo-600 bg-indigo-100 rounded-xl border border-indigo-200'>
                  <BookOpen className='w-6 h-6' />
                </div>
                <div className='flex-1'>
                  <h3 className='text-lg font-bold text-gray-900 group-hover/item:text-indigo-700'>
                    Municipal Committees
                  </h3>
                  <p className='text-xs text-gray-500'>
                    View {committeeCount} Standing Committees & Chairpersons
                  </p>
                </div>
                <ChevronRight className='w-5 h-5 text-gray-300 group-hover/item:text-indigo-600' />
              </Link>
            </div>

            <p className='mt-auto text-xs italic font-medium text-indigo-600/70'>
              Headed by the Presiding Officer, the SB is responsible for local
              legislation.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
