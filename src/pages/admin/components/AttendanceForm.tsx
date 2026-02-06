import { useEffect, useState } from 'react';

import { Calendar, Check, RefreshCw, Users, X } from 'lucide-react';

import { Badge } from '@/components/ui/Badge';
import Button from '@/components/ui/Button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { EmptyState } from '@/components/ui/EmptyState';

interface Person {
  id: string;
  person_id: string;
  first_name: string;
  middle_name: string | null;
  last_name: string;
  role?: string;
}

interface Session {
  id: string;
  term_id: string;
  session_type: 'regular' | 'special' | 'inaugural';
  ordinal: number | null;
  date: string;
}

interface AttendanceFormProps {
  sessionId: string;
  onSave: (absentPersonIds: string[]) => Promise<void>;
  onCancel: () => void;
}

export default function AttendanceForm({
  sessionId,
  onSave,
  onCancel,
}: AttendanceFormProps) {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [session, setSession] = useState<Session | null>(null);
  const [members, setMembers] = useState<Person[]>([]);
  const [absentPersonIds, setAbsentPersonIds] = useState<Set<string>>(
    new Set()
  );

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      try {
        // Load session details
        const sessionResponse = await fetch(`/api/admin/sessions/${sessionId}`);
        if (!sessionResponse.ok) throw new Error('Failed to load session');

        const sessionData = await sessionResponse.json();
        setSession(sessionData);
        setMembers(sessionData.members || []);

        // Set initial absences
        const absentIds = new Set(
          (sessionData.absences || []).map(
            (a: { person_id: string }) => a.person_id
          )
        );
        setAbsentPersonIds(absentIds);
      } catch (error) {
        console.error('Error loading session data:', error);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [sessionId]);

  const toggleAttendance = (personId: string) => {
    const newAbsentIds = new Set(absentPersonIds);
    if (newAbsentIds.has(personId)) {
      newAbsentIds.delete(personId);
    } else {
      newAbsentIds.add(personId);
    }
    setAbsentPersonIds(newAbsentIds);
  };

  const markAllPresent = () => {
    setAbsentPersonIds(new Set());
  };

  const markAllAbsent = () => {
    setAbsentPersonIds(new Set(members.map(m => m.person_id)));
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await onSave(Array.from(absentPersonIds));
    } finally {
      setSaving(false);
    }
  };

  const presentCount = members.length - absentPersonIds.size;
  const absentCount = absentPersonIds.size;

  if (loading) {
    return (
      <div className='flex items-center justify-center py-12'>
        <RefreshCw className='h-8 w-8 animate-spin text-slate-400' />
      </div>
    );
  }

  if (!session) {
    return (
      <EmptyState
        title='Session not found'
        message='Unable to load session details.'
        icon={Users}
      />
    );
  }

  return (
    <div className='space-y-6'>
      {/* Session Info */}
      <Card variant='default'>
        <CardHeader>
          <CardTitle className='flex items-center gap-2'>
            <Calendar className='h-5 w-5' />
            Session Information
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className='flex flex-wrap gap-4'>
            <div>
              <p className='text-xs text-slate-500'>Session Type</p>
              <p className='font-medium text-slate-900 capitalize'>
                {session.session_type}
              </p>
            </div>
            {session.ordinal && (
              <div>
                <p className='text-xs text-slate-500'>Number</p>
                <p className='font-medium text-slate-900'>{session.ordinal}</p>
              </div>
            )}
            <div>
              <p className='text-xs text-slate-500'>Date</p>
              <p className='font-medium text-slate-900'>
                {new Date(session.date).toLocaleDateString()}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Attendance List */}
      <Card variant='default'>
        <CardHeader>
          <CardTitle className='flex items-center gap-2'>
            <Users className='h-5 w-5' />
            Council Members
          </CardTitle>
        </CardHeader>
        <CardContent className='space-y-4'>
          {/* Summary */}
          <div className='flex items-center justify-between rounded-md bg-slate-50 p-4'>
            <div className='flex gap-4'>
              <div>
                <p className='text-xs text-slate-500'>Total Members</p>
                <p className='text-lg font-bold text-slate-900'>
                  {members.length}
                </p>
              </div>
              <div>
                <p className='text-xs text-slate-500'>Present</p>
                <p className='text-lg font-bold text-emerald-600'>
                  {presentCount}
                </p>
              </div>
              <div>
                <p className='text-xs text-slate-500'>Absent</p>
                <p className='text-lg font-bold text-amber-600'>
                  {absentCount}
                </p>
              </div>
            </div>
            <div className='flex gap-2'>
              <Button variant='outline' size='sm' onClick={markAllPresent}>
                All Present
              </Button>
              <Button variant='outline' size='sm' onClick={markAllAbsent}>
                All Absent
              </Button>
            </div>
          </div>

          {/* Member List */}
          {members.length === 0 ? (
            <EmptyState
              title='No members found'
              message='No council members found for this session.'
              icon={Users}
            />
          ) : (
            <div className='max-h-96 space-y-2 overflow-y-auto'>
              {members.map(member => {
                const isAbsent = absentPersonIds.has(member.person_id);
                return (
                  <div
                    key={member.person_id}
                    className={`flex cursor-pointer items-center justify-between rounded-md border p-3 transition-colors ${
                      isAbsent
                        ? 'border-amber-200 bg-amber-50'
                        : 'border-emerald-200 bg-emerald-50'
                    }`}
                    onClick={() => toggleAttendance(member.person_id)}
                  >
                    <div className='flex items-center gap-3'>
                      <div
                        className={`flex h-10 w-10 items-center justify-center rounded-full ${
                          isAbsent ? 'bg-amber-200' : 'bg-emerald-200'
                        }`}
                      >
                        {isAbsent ? (
                          <X className='h-5 w-5 text-amber-700' />
                        ) : (
                          <Check className='h-5 w-5 text-emerald-700' />
                        )}
                      </div>
                      <div>
                        <p className='text-sm font-medium text-slate-900'>
                          {member.first_name} {member.middle_name}{' '}
                          {member.last_name}
                        </p>
                        {member.role && (
                          <p className='text-xs text-slate-500'>
                            {member.role}
                          </p>
                        )}
                      </div>
                    </div>
                    <Badge variant={isAbsent ? 'warning' : 'success'}>
                      {isAbsent ? 'Absent' : 'Present'}
                    </Badge>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Actions */}
      <div className='flex justify-end gap-3'>
        <Button variant='outline' onClick={onCancel} disabled={saving}>
          Cancel
        </Button>
        <Button variant='primary' onClick={handleSave} disabled={saving}>
          {saving ? 'Saving...' : 'Save Attendance'}
        </Button>
      </div>
    </div>
  );
}
