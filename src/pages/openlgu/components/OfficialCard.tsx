import { Calendar, ChevronDown, ChevronRight, FileText } from 'lucide-react';

import { Badge } from '@/components/ui/Badge';
import { Card, CardContent } from '@/components/ui/Card';

import type {
  DocumentItem,
  Person,
  PersonMembership,
  Session,
  Term,
} from '@/lib/openlgu';
import { getPersonName } from '@/lib/openlgu';

import ServiceTimeline from './ServiceTimeline';

interface OfficialCardProps {
  person: Person;
  latestMembership: PersonMembership;
  latestTerm: Term;
  allTerms: Term[];
  sessions: Session[];
  documents: DocumentItem[];
  isExpanded: boolean;
  onToggle: () => void;
}

export default function OfficialCard({
  person,
  latestMembership,
  latestTerm,
  allTerms,
  sessions,
  documents,
  isExpanded,
  onToggle,
}: OfficialCardProps) {
  const personName = getPersonName(person);
  const initials =
    `${person.first_name[0]}${person.last_name[0]}`.toUpperCase();

  // Calculate stats for the latest term
  const calculateAttendanceRate = (): number => {
    const termSessions = sessions.filter(s => s.term_id === latestTerm.id);
    if (termSessions.length === 0) return 0;
    const presentCount = termSessions.filter(s =>
      s.present.includes(person.id)
    ).length;
    return Math.round((presentCount / termSessions.length) * 100);
  };

  const countDocuments = (): number => {
    return documents.filter(
      doc => doc.term_id === latestTerm.id && doc.author_ids.includes(person.id)
    ).length;
  };

  const countExecOrders = (): number => {
    return documents.filter(
      doc =>
        doc.term_id === latestTerm.id &&
        doc.type === 'executive_order' &&
        doc.mayor_id === person.id
    ).length;
  };

  // Get avatar color based on role
  const getAvatarColor = (): string => {
    const role = latestMembership.role.toLowerCase();
    if (role.includes('mayor')) {
      return 'bg-gradient-to-br from-primary-500 to-primary-600';
    }
    if (role.includes('vice mayor')) {
      return 'bg-gradient-to-br from-secondary-500 to-secondary-600';
    }
    return 'bg-gradient-to-br from-slate-500 to-slate-600';
  };

  // Get role badge variant
  const getRoleVariant = (): 'primary' | 'secondary' | 'warning' | 'slate' => {
    const role = latestMembership.role.toLowerCase();
    if (role.includes('mayor')) return 'primary';
    if (role.includes('vice mayor')) return 'secondary';
    return 'slate';
  };

  const attendanceRate = calculateAttendanceRate();
  const docsCount = countDocuments();
  const execOrdersCount = countExecOrders();
  const isExecutive = latestMembership.chamber === 'executive';
  const totalTermsServed = person.memberships.length;

  return (
    <Card
      variant={isExpanded ? 'featured' : 'default'}
      hover={!isExpanded}
      className='group'
    >
      {/* Collapsed Card Content */}
      <button
        onClick={onToggle}
        className='w-full text-left'
        aria-expanded={isExpanded}
        aria-label={`Toggle details for ${personName}`}
      >
        <CardContent className='flex items-center gap-4 p-4'>
          {/* Avatar with initials */}
          <div
            className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl text-lg font-bold text-white shadow-sm ${getAvatarColor()}`}
          >
            {initials}
          </div>

          {/* Main content */}
          <div className='min-w-0 flex-1'>
            {/* Name */}
            <p className='truncate font-semibold text-slate-800'>
              {personName}
            </p>

            {/* Term and Role Badge */}
            <div className='mt-1 flex flex-wrap items-center gap-2'>
              <Badge variant={getRoleVariant()}>
                {latestTerm.year_range} | {latestMembership.role}
              </Badge>
            </div>

            {/* Mini stats row */}
            <div className='mt-2 flex flex-wrap items-center gap-3 text-xs text-slate-600'>
              {!isExecutive && (
                <div className='flex items-center gap-1'>
                  <Calendar className='h-3 w-3' />
                  <span
                    className={
                      attendanceRate >= 90
                        ? 'font-semibold text-emerald-600'
                        : attendanceRate >= 70
                          ? 'text-slate-600'
                          : 'text-amber-600'
                    }
                  >
                    {attendanceRate}% attendance
                  </span>
                </div>
              )}
              {!isExecutive && docsCount > 0 && (
                <div className='flex items-center gap-1'>
                  <FileText className='h-3 w-3' />
                  <span>
                    {docsCount} document{docsCount !== 1 ? 's' : ''}
                  </span>
                </div>
              )}
              {isExecutive && execOrdersCount > 0 && (
                <div className='flex items-center gap-1'>
                  <FileText className='h-3 w-3' />
                  <span>
                    {execOrdersCount} executive order
                    {execOrdersCount !== 1 ? 's' : ''}
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Expand/collapse indicator */}
          <div className='flex items-center gap-2 text-slate-400'>
            {!isExpanded && (
              <span className='hidden text-xs text-slate-400 sm:inline'>
                {totalTermsServed > 1
                  ? `served in ${totalTermsServed} term${totalTermsServed > 1 ? 's' : ''}`
                  : 'view details'}
              </span>
            )}
            {isExpanded ? (
              <ChevronDown className='text-primary-500 h-5 w-5' />
            ) : (
              <ChevronRight className='h-5 w-5 transition-colors group-hover:text-slate-500' />
            )}
          </div>
        </CardContent>
      </button>

      {/* Expanded Service Timeline */}
      {isExpanded && (
        <CardContent className='animate-in fade-in slide-in-from-top-2 border-t border-slate-200 bg-slate-50/50 p-4 duration-200'>
          <div className='mb-3 text-xs font-semibold tracking-wide text-slate-500 uppercase'>
            Service History
          </div>
          <ServiceTimeline
            person={person}
            memberships={person.memberships}
            terms={allTerms}
            sessions={sessions}
            documents={documents}
          />
        </CardContent>
      )}
    </Card>
  );
}
