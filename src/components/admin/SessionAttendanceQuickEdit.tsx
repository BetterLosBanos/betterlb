import { useState, useEffect, useCallback } from 'react';
import { Badge } from '@/components/ui/Badge';
import Button from '@/components/ui/Button';
import { UserCheck, UserX, AlertCircle } from 'lucide-react';

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
        throw new Error(`Failed to fetch term members (HTTP ${response.status})`);
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
    absentPersonIds.forEach((id) => {
      onAbsentChange(id, false);
    });
  };

  const handleMarkAllAbsent = () => {
    // Mark all members as absent
    members.forEach((member) => {
      if (!absentPersonIds.includes(member.id)) {
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
      <div className="flex justify-center items-center py-8">
        <div className="w-6 h-6 rounded-full border-3 animate-spin border-slate-300 border-t-primary-500" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center gap-2 p-4 rounded-md bg-amber-50 border border-amber-200 text-amber-800">
        <AlertCircle className="w-4 h-4 flex-shrink-0" />
        <span className="text-sm">Unable to load attendance: {error}</span>
      </div>
    );
  }

  if (members.length === 0) {
    return (
      <div className="text-center py-8 text-slate-500 text-sm">
        No members found for this term.
      </div>
    );
  }

  const presentCount = members.length - absentPersonIds.length;
  const absentCount = absentPersonIds.length;

  return (
    <div className="space-y-4">
      {/* Attendance Summary */}
      <div className="flex items-center justify-between">
        <div className="flex gap-4 text-sm">
          <span className="flex items-center gap-1.5">
            <UserCheck className="w-4 h-4 text-green-600" />
            <span className="font-medium text-green-700">{presentCount} Present</span>
          </span>
          <span className="flex items-center gap-1.5">
            <UserX className="w-4 h-4 text-red-600" />
            <span className="font-medium text-red-700">{absentCount} Absent</span>
          </span>
        </div>

        {/* Quick Actions */}
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleMarkAllPresent}
            disabled={disabled || absentCount === 0}
            className="text-xs"
          >
            All Present
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={handleMarkAllAbsent}
            disabled={disabled || absentCount === members.length}
            className="text-xs"
          >
            All Absent
          </Button>
        </div>
      </div>

      {/* Member List */}
      <div className="border rounded-md divide-y max-h-64 overflow-y-auto">
        {members.map((member) => {
          const isAbsent = absentPersonIds.includes(member.id);
          return (
            <div
              key={member.id}
              className={`flex items-center justify-between p-3 hover:bg-slate-50 transition-colors ${
                isAbsent ? 'bg-red-50' : ''
              }`}
            >
              <div className="flex-1">
                <div className="font-medium text-sm text-slate-900">
                  {member.first_name}
                  {member.middle_name && ` ${member.middle_name}`}
                  {` ${member.last_name}`}
                  {member.suffix && ` ${member.suffix}`}
                </div>
                {member.role && (
                  <div className="text-xs text-slate-500">{member.role}</div>
                )}
              </div>

              <Badge
                variant={isAbsent ? 'danger' : 'success'}
                className="cursor-pointer select-none"
                onClick={() => !disabled && toggleAbsent(member.id)}
              >
                {isAbsent ? (
                  <>
                    <UserX className="w-3 h-3 mr-1" />
                    Absent
                  </>
                ) : (
                  <>
                    <UserCheck className="w-3 h-3 mr-1" />
                    Present
                  </>
                )}
              </Badge>
            </div>
          );
        })}
      </div>

      {disabled && (
        <p className="text-xs text-slate-500 text-center">
          Save the document to enable attendance editing.
        </p>
      )}
    </div>
  );
}
