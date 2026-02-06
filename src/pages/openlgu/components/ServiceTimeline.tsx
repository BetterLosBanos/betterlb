import { Calendar, FileText, Users } from 'lucide-react';

import { Badge } from '@/components/ui/Badge';

import type {
  DocumentItem,
  Person,
  PersonMembership,
  Session,
  Term,
} from '@/lib/openlgu';

interface ServiceTimelineProps {
  person: Person;
  memberships: PersonMembership[];
  terms: Term[];
  sessions: Session[];
  documents: DocumentItem[];
}

export default function ServiceTimeline({
  person,
  memberships,
  terms,
  sessions,
  documents,
}: ServiceTimelineProps) {
  // Sort memberships by term number (most recent first)
  const sortedMemberships = [...memberships].sort((a, b) => {
    const termA = terms.find(t => t.id === a.term_id);
    const termB = terms.find(t => t.id === b.term_id);
    return (termB?.term_number || 0) - (termA?.term_number || 0);
  });

  // Calculate attendance rate for a specific term
  const calculateAttendanceForTerm = (termId: string): number => {
    const termSessions = sessions.filter(s => s.term_id === termId);
    if (termSessions.length === 0) return 0;

    const presentCount = termSessions.filter(s =>
      s.present.includes(person.id)
    ).length;
    return Math.round((presentCount / termSessions.length) * 100);
  };

  // Count documents authored/co-authored for a specific term
  const countDocumentsForTerm = (termId: string): number => {
    return documents.filter(
      doc => doc.term_id === termId && doc.author_ids.includes(person.id)
    ).length;
  };

  // Count executive orders signed as mayor for a specific term
  const countExecOrdersForTerm = (termId: string): number => {
    return documents.filter(
      doc =>
        doc.term_id === termId &&
        doc.type === 'executive_order' &&
        doc.mayor_id === person.id
    ).length;
  };

  // Get role badge variant based on role
  const getRoleVariant = (
    role: string
  ): 'primary' | 'secondary' | 'warning' | 'slate' => {
    const lowerRole = role.toLowerCase();
    if (lowerRole.includes('mayor')) return 'primary';
    if (lowerRole.includes('vice mayor')) return 'secondary';
    if (lowerRole.includes('councilor')) return 'slate';
    return 'slate';
  };

  if (sortedMemberships.length === 0) {
    return (
      <div className='py-4 text-center text-sm text-slate-500'>
        No service history available
      </div>
    );
  }

  return (
    <div className='space-y-3'>
      {sortedMemberships.map(membership => {
        const term = terms.find(t => t.id === membership.term_id);
        if (!term) return null;

        const attendanceRate = calculateAttendanceForTerm(term.id);
        const docsCount = countDocumentsForTerm(term.id);
        const execOrdersCount = countExecOrdersForTerm(term.id);
        const isExecutive = membership.chamber === 'executive';

        return (
          <div
            key={membership.term_id}
            className='relative border-l-2 border-slate-200 pb-4 pl-6 last:border-0 last:pb-0'
          >
            {/* Timeline dot */}
            <div className='border-primary-500 absolute top-1.5 left-0 h-3 w-3 -translate-x-[5px] rounded-full border-2 bg-white' />

            <div className='space-y-2'>
              {/* Term header */}
              <div className='flex flex-wrap items-center gap-2'>
                <span className='text-sm font-bold text-slate-900'>
                  {term.year_range}
                </span>
              </div>

              {/* Role badge */}
              <Badge variant={getRoleVariant(membership.role)}>
                {membership.role}
              </Badge>

              {/* Stats row */}
              <div className='flex flex-wrap gap-4 text-xs text-slate-600'>
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

              {/* Committees */}
              {membership.committees && membership.committees.length > 0 && (
                <div className='flex flex-wrap gap-1 pt-1'>
                  {membership.committees.map(committee => (
                    <span
                      key={committee.id}
                      className='inline-flex items-center gap-1 rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-medium text-slate-600'
                    >
                      <Users className='h-2.5 w-2.5' />
                      {committee.role}
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
