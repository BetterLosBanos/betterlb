import { useMemo } from 'react';
import { Link, useOutletContext } from 'react-router-dom';

import { Calendar, ChevronRight, Crown, Users } from 'lucide-react';

import { DetailSection } from '@/components/layout/PageLayouts';
import {
  Breadcrumb,
  BreadcrumbHome,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/navigation/Breadcrumb';
import { Badge } from '@/components/ui/Badge';
import { EmptyState, PageLoadingState } from '@/components/ui';

import type { Person, Session } from '@/lib/openlgu';
import { getPersonName } from '@/lib/openlgu';
import { isExecutiveRole, isLegislativeRole } from '@/lib/roleHelpers';

interface LegislationContext {
  persons: Person[];
  sessions: Session[];
  searchQuery: string;
  isLoading: boolean;
}

export default function OfficialsIndex() {
  const { persons, sessions, searchQuery, isLoading } = useOutletContext<LegislationContext>();

  const filteredPersons = useMemo(() => {
    if (!searchQuery) return persons;
    const query = searchQuery.toLowerCase();
    return persons.filter(p =>
      getPersonName(p).toLowerCase().includes(query) ||
      p.roles.some(r => r.toLowerCase().includes(query))
    );
  }, [persons, searchQuery]);

  const executiveOfficials = useMemo(() => {
    return filteredPersons.filter(p =>
      p.memberships.some(m => isExecutiveRole(m.chamber))
    );
  }, [filteredPersons]);

  const legislativeOfficials = useMemo(() => {
    return filteredPersons.filter(p =>
      p.memberships.some(m => isLegislativeRole(m.chamber))
    ).sort((a, b) => {
      const memA = a.memberships.find(m => isLegislativeRole(m.chamber));
      const memB = b.memberships.find(m => isLegislativeRole(m.chamber));
      const isVMA = memA?.role.includes('Vice Mayor');
      const isVMB = memB?.role.includes('Vice Mayor');
      if (isVMA && !isVMB) return -1;
      if (!isVMA && isVMB) return 1;
      return (memA?.rank || 99) - (memB?.rank || 99);
    });
  }, [filteredPersons]);

  const calculateAttendanceRate = (personId: string): number => {
    const relevantSessions = sessions.filter(s =>
      s.present.includes(personId) || s.absent.includes(personId)
    );
    if (relevantSessions.length === 0) return 0;
    const presentCount = relevantSessions.filter(s => s.present.includes(personId)).length;
    return Math.round((presentCount / relevantSessions.length) * 100);
  };

  return (
    <div className='animate-in fade-in mx-auto max-w-5xl space-y-8 pb-20 duration-500'>
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbHome href='/' />
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbLink href='/openlgu'>OpenLGU</BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage>Officials</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      <header className='rounded-2xl border-l-8 border-primary-600 bg-white p-6 shadow-sm md:p-10'>
        <h1 className='text-2xl font-extrabold text-slate-900 md:text-3xl'>
          Municipal Officials
        </h1>
        <p className='mt-2 text-slate-600'>
          Browse all elected and appointed officials of Los Baños.
        </p>
      </header>

      {isLoading ? (
        <PageLoadingState message="Loading officials..." />
      ) : filteredPersons.length === 0 ? (
        <EmptyState
          title='No officials found'
          message={`We couldn't find any officials matching "${searchQuery}"`}
          icon={Users}
        />
      ) : (
        <div className='space-y-8'>
          {/* Executive Officials */}
          {executiveOfficials.length > 0 && (
            <DetailSection title='Executive Branch' icon={Crown}>
              <div className='grid gap-4 sm:grid-cols-2 lg:grid-cols-3'>
                {executiveOfficials.map(person => {
                  const membership = person.memberships.find(m => isExecutiveRole(m.chamber));
                  return (
                    <Link
                      key={person.id}
                      to={`/openlgu/person/${person.id}`}
                      className='group flex items-center gap-4 rounded-xl bg-gradient-to-r from-primary-50 to-white p-4 border border-primary-100 hover:border-primary-200 hover:shadow-sm transition-all'
                    >
                      <div className='bg-gradient-to-br from-primary-500 to-primary-600 flex h-12 w-12 shrink-0 items-center justify-center rounded-xl text-lg font-bold text-white shadow-sm'>
                        {person.first_name[0]}
                        {person.last_name[0]}
                      </div>
                      <div className='flex-1 min-w-0'>
                        <p className='font-semibold text-slate-800'>
                          {getPersonName(person)}
                        </p>
                        <p className='text-xs font-medium text-primary-600 uppercase tracking-wide truncate'>
                          {membership?.role || 'Executive Official'}
                        </p>
                      </div>
                      <ChevronRight className='h-5 w-5 text-slate-300 group-hover:text-primary-600 transition-colors shrink-0' />
                    </Link>
                  );
                })}
              </div>
            </DetailSection>
          )}

          {/* Legislative Officials */}
          {legislativeOfficials.length > 0 && (
            <DetailSection title='Legislative Branch' icon={Users}>
              <div className='grid gap-4 sm:grid-cols-2 lg:grid-cols-3'>
                {legislativeOfficials.map(person => {
                  const membership = person.memberships.find(m => isLegislativeRole(m.chamber));
                  const isVM = membership?.role.includes('Vice Mayor');
                  const attendanceRate = calculateAttendanceRate(person.id);

                  return (
                    <Link
                      key={person.id}
                      to={`/openlgu/person/${person.id}`}
                      className='group rounded-xl border border-slate-100 bg-slate-50/50 p-4 hover:border-slate-200 hover:bg-white transition-all'
                    >
                      <div className='flex items-center gap-3 mb-3'>
                        <div
                          className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg text-sm font-bold ${isVM ? 'bg-primary-600 text-white' : 'bg-slate-200 text-slate-600'}`}
                        >
                          {person.first_name[0]}
                          {person.last_name[0]}
                        </div>
                        <div className='flex-1 min-w-0'>
                          <p className='text-sm font-bold text-slate-800 truncate'>
                            {getPersonName(person)}
                          </p>
                          <p className='text-xs font-medium text-slate-500 truncate'>
                            {membership?.role || 'Legislative Official'}
                          </p>
                        </div>
                      </div>
                      {attendanceRate > 0 && (
                        <div className='flex items-center gap-2 text-xs border-t border-slate-100 pt-2'>
                          <Calendar className='h-3 w-3 text-slate-400' />
                          <span className={attendanceRate >= 90 ? 'font-semibold text-emerald-600' : 'text-slate-600'}>
                            {attendanceRate}% attendance
                          </span>
                        </div>
                      )}
                    </Link>
                  );
                })}
              </div>
            </DetailSection>
          )}
        </div>
      )}
    </div>
  );
}
