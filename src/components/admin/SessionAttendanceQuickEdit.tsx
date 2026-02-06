import { useCallback, useEffect, useState } from 'react';

import { AlertCircle, UserCheck, UserX } from 'lucide-react';

import { Badge } from '@/components/ui/Badge';
import Button from '@/components/ui/Button';

interface Person {
  id: string;
  first_name: string;
  middle_name: string | null;
  last_name: string;
  suffix?: string | null;
}

interface TermMember extends Person {
  role?: string;
  chamber?: string;
}

interface SessionAttendanceQuickEditProps {
  sessionId: string;
  termId: string;
  absentPersonIds: string[];
  onAbsentChange: (personId: string, isAbsent: boolean) => void;
  disabled?: boolean;
}

export default function SessionAttendanceQuickEdit({
  termId,
  absentPersonIds,
  onAbsentChange,
  disabled = false,
}: SessionAttendanceQuickEditProps) {
  const [members, setMembers] = useState<TermMember[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchTermMembers = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const isMockMode = import.meta.env.VITE_ADMIN_MOCK_MODE === 'true';

      if (isMockMode) {
        // Mock data for development
        const mockMembers: TermMember[] = [
          {
            id: 'person_1',
            first_name: 'Juan',
            middle_name: null,
            last_name: 'Dela Cruz',
            suffix: null,
            role: 'Councilor',
            chamber: 'Sangguniang Bayan',
          },
          {
            id: 'person_2',
            first_name: 'Maria',
            middle_name: 'Santos',
            last_name: 'Reyes',
            suffix: null,
            role: 'Councilor',
            chamber: 'Sangguniang Bayan',
          },
          {
            id: 'person_3',
            first_name: 'Jose',
            middle_name: null,
            last_name: 'Mendoza',
            suffix: null,
            role: 'Councilor',
            chamber: 'Sangguniang Bayan',
          },
          {
            id: 'person_4',
            first_name: 'Ana',
            middle_name: null,
            last_name: 'Garcia',
            suffix: null,
            role: 'Vice Mayor',
            chamber: 'Sangguniang Bayan',
          },
          {
            id: 'person_5',
            first_name: 'Carlos',
            middle_name: 'P',
            last_name: 'Santos',
            suffix: 'Jr',
            role: 'Councilor',
            chamber: 'Sangguniang Bayan',
          },
        ];
        setMembers(mockMembers);
        return;
      }

      const response = await fetch(`/api/admin/terms/${termId}`);
      if (!response.ok) {
        throw new Error(
          `Failed to fetch term members (HTTP ${response.status})`
        );
      }
      const data = await response.json();
      setMembers(data.members || []);
    } catch (err) {
      console.error('Error fetching term members:', err);
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  }, [termId]);

  useEffect(() => {
    fetchTermMembers();
  }, [fetchTermMembers]);

  const handleMarkAllPresent = () => {
    // Remove all absences
    absentPersonIds.forEach(id => {
      onAbsentChange(id, false);
    });
  };

  const handleMarkAllAbsent = () => {
    // Mark all non-mayor members as absent (mayors don't attend sessions)
    members.forEach(member => {
      if (member.role !== 'Mayor' && !absentPersonIds.includes(member.id)) {
        onAbsentChange(member.id, true);
      }
    });
  };

  const toggleAbsent = (personId: string) => {
    const isAbsent = absentPersonIds.includes(personId);
    onAbsentChange(personId, !isAbsent);
  };

  if (loading) {
    return (
      <div className='flex items-center justify-center py-8'>
        <div className='border-t-primary-500 h-6 w-6 animate-spin rounded-full border-3 border-slate-300' />
      </div>
    );
  }

  if (error) {
    return (
      <div className='flex items-center gap-2 rounded-md border border-amber-200 bg-amber-50 p-4 text-amber-800'>
        <AlertCircle className='h-4 w-4 flex-shrink-0' />
        <span className='text-sm'>Unable to load attendance: {error}</span>
      </div>
    );
  }

  if (members.length === 0) {
    return (
      <div className='py-8 text-center text-sm text-slate-500'>
        No members found for this term.
      </div>
    );
  }

  // Filter out mayors - they don't attend council sessions
  const nonMayorMembers = members.filter(m => m.role !== 'Mayor');
  const eligibleMemberIds = nonMayorMembers.map(m => m.id);

  // Count attendance among eligible members (excluding mayors)
  const absentEligibleCount = absentPersonIds.filter(id =>
    eligibleMemberIds.includes(id)
  ).length;
  const presentCount = nonMayorMembers.length - absentEligibleCount;
  const absentCount = absentEligibleCount;

  return (
    <div className='space-y-4'>
      {/* Attendance Summary */}
      <div className='flex items-center justify-between'>
        <div className='flex gap-4 text-sm'>
          <span className='flex items-center gap-1.5'>
            <UserCheck className='h-4 w-4 text-green-600' />
            <span className='font-medium text-green-700'>
              {presentCount} Present
            </span>
          </span>
          <span className='flex items-center gap-1.5'>
            <UserX className='h-4 w-4 text-red-600' />
            <span className='font-medium text-red-700'>
              {absentCount} Absent
            </span>
          </span>
        </div>

        {/* Quick Actions */}
        <div className='flex gap-2'>
          <Button
            variant='outline'
            size='sm'
            onClick={handleMarkAllPresent}
            disabled={disabled || absentCount === 0}
            className='text-xs'
          >
            All Present
          </Button>
          <Button
            variant='outline'
            size='sm'
            onClick={handleMarkAllAbsent}
            disabled={disabled || absentCount === nonMayorMembers.length}
            className='text-xs'
          >
            All Absent
          </Button>
        </div>
      </div>

      {/* Member List */}
      <div className='max-h-64 divide-y overflow-y-auto rounded-md border'>
        {/* Filter out mayors - they don't attend council sessions */}
        {members
          .filter(m => m.role !== 'Mayor')
          .map(member => {
            const isAbsent = absentPersonIds.includes(member.id);
            return (
              <div
                key={member.id}
                className={`flex items-center justify-between p-3 transition-colors hover:bg-slate-50 ${
                  isAbsent ? 'bg-red-50' : ''
                }`}
              >
                <div className='flex-1'>
                  <div className='text-sm font-medium text-slate-900'>
                    {member.first_name}
                    {member.middle_name && ` ${member.middle_name}`}
                    {` ${member.last_name}`}
                    {member.suffix && ` ${member.suffix}`}
                  </div>
                  {member.role && (
                    <div className='text-xs text-slate-500'>{member.role}</div>
                  )}
                </div>

                <Badge
                  variant={isAbsent ? 'error' : 'success'}
                  className='cursor-pointer select-none'
                  onClick={() => !disabled && toggleAbsent(member.id)}
                >
                  {isAbsent ? (
                    <>
                      <UserX className='mr-1 h-3 w-3' />
                      Absent
                    </>
                  ) : (
                    <>
                      <UserCheck className='mr-1 h-3 w-3' />
                      Present
                    </>
                  )}
                </Badge>
              </div>
            );
          })}
      </div>

      {disabled && (
        <p className='text-center text-xs text-slate-500'>
          Save the document to enable attendance editing.
        </p>
      )}
    </div>
  );
}
