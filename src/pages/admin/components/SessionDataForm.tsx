import { useEffect, useState } from 'react';

import { Calendar, Check, FileText, Users } from 'lucide-react';
import { X } from 'lucide-react';

import { Badge } from '@/components/ui/Badge';
import Button from '@/components/ui/Button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { EmptyState } from '@/components/ui/EmptyState';

type SessionType = 'regular' | 'special' | 'inaugural';

interface Person {
  id: string;
  person_id: string;
  first_name: string;
  middle_name: string | null;
  last_name: string;
  role?: string;
}

interface ParsedSessionData {
  session_type: SessionType | null;
  ordinal: number | null;
  date: string | null;
  attendee_names: string[];
  confidence: {
    session_type: number;
    ordinal: number;
    date: number;
    attendees: number;
  };
}

interface MatchedAttendee {
  person_id: string;
  name: string;
  confidence: number;
}

interface SessionDataFormProps {
  sessionId?: string;
  termId: string;
  initialData?: {
    session_type: SessionType;
    ordinal: number | null;
    date: string;
    source_url: string | null;
  };
  onSave: (data: {
    session_type: SessionType;
    ordinal: number | null;
    date: string;
    source_url: string | null;
    absent_person_ids: string[];
  }) => Promise<void>;
  onCancel: () => void;
}

const sessionTypeOptions: { value: SessionType; label: string }[] = [
  { value: 'regular', label: 'Regular' },
  { value: 'special', label: 'Special' },
  { value: 'inaugural', label: 'Inaugural' },
];

export default function SessionDataForm({
  sessionId,
  termId,
  initialData,
  onSave,
  onCancel,
}: SessionDataFormProps) {
  const [sessionType, setSessionType] = useState<SessionType>(
    initialData?.session_type || 'regular'
  );
  const [ordinal, setOrdinal] = useState<number | null>(
    initialData?.ordinal || null
  );
  const [date, setDate] = useState(initialData?.date || '');
  const [sourceUrl, setSourceUrl] = useState(initialData?.source_url || '');
  const [facebookPost, setFacebookPost] = useState('');
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [members, setMembers] = useState<Person[]>([]);
  const [absentPersonIds, setAbsentPersonIds] = useState<Set<string>>(
    new Set()
  );
  const [parsedData, setParsedData] = useState<ParsedSessionData | null>(null);
  const [matchedAttendees, setMatchedAttendees] = useState<MatchedAttendee[]>(
    []
  );

  // Load members for this term
  useEffect(() => {
    const loadMembers = async () => {
      if (!termId) return;

      setLoading(true);
      try {
        const response = await fetch(`/api/terms/${termId}/members`);
        if (!response.ok) throw new Error('Failed to load members');

        const data = await response.json();
        setMembers(data.members || []);
      } catch (error) {
        console.error('Error loading members:', error);
      } finally {
        setLoading(false);
      }
    };

    loadMembers();
  }, [termId]);

  // Load existing absences if editing
  useEffect(() => {
    const loadAbsences = async () => {
      if (!sessionId) return;

      try {
        const response = await fetch(`/api/admin/sessions/${sessionId}`);
        if (!response.ok) throw new Error('Failed to load session');

        const data = await response.json();
        const absentIds = new Set(data.absences.map((a: any) => a.person_id));
        setAbsentPersonIds(absentIds);
      } catch (error) {
        console.error('Error loading absences:', error);
      }
    };

    loadAbsences();
  }, [sessionId]);

  const parseFacebookPost = async () => {
    if (!facebookPost.trim()) return;

    setLoading(true);
    try {
      const response = await fetch('/api/admin/parse-facebook-post', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: facebookPost }),
      });

      if (!response.ok) throw new Error('Failed to parse post');

      const data = await response.json();

      if (data.parsed) {
        setParsedData(data.parsed);

        // Auto-fill form fields with high confidence data
        if (
          data.parsed.session_type &&
          data.parsed.confidence.session_type > 0.8
        ) {
          setSessionType(data.parsed.session_type);
        }
        if (data.parsed.ordinal && data.parsed.confidence.ordinal > 0.8) {
          setOrdinal(data.parsed.ordinal);
        }
        if (data.parsed.date && data.parsed.confidence.date > 0.8) {
          setDate(data.parsed.date);
        }

        // Set matched attendees as present (everyone not matched is absent)
        if (data.matched_attendees && data.matched_attendees.length > 0) {
          setMatchedAttendees(data.matched_attendees);
          const presentIds = new Set(
            data.matched_attendees.map((a: MatchedAttendee) => a.person_id)
          );
          const newAbsentIds = new Set(
            members.map(m => m.person_id).filter(id => !presentIds.has(id))
          );
          setAbsentPersonIds(newAbsentIds);
        }
      }
    } catch (error) {
      console.error('Error parsing Facebook post:', error);
    } finally {
      setLoading(false);
    }
  };

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
      await onSave({
        session_type: sessionType,
        ordinal,
        date,
        source_url: sourceUrl || null,
        absent_person_ids: Array.from(absentPersonIds),
      });
    } finally {
      setSaving(false);
    }
  };

  // Get display value with proper fallback
  const getDisplayValue = (value: string | number): string => {
    if (typeof value === 'number') {
      return value.toLocaleString();
    }
    return value;
  };

  const presentCount = members.length - absentPersonIds.size;
  const absentCount = absentPersonIds.size;

  return (
    <div className='space-y-6'>
      {/* Facebook Post Parser */}
      <Card variant='default'>
        <CardHeader>
          <CardTitle className='flex items-center gap-2'>
            <FileText className='h-5 w-5' />
            Import from Facebook Post
          </CardTitle>
        </CardHeader>
        <CardContent className='space-y-4'>
          <div>
            <label className='mb-2 block text-sm font-medium text-slate-700'>
              Paste Facebook Post Content
            </label>
            <textarea
              value={facebookPost}
              onChange={e => setFacebookPost(e.target.value)}
              placeholder='Paste the Facebook post content here... The parser will extract session type, number, date, and attendees.'
              className='focus:border-primary-500 focus:ring-primary-500 w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:ring-1 focus:outline-none'
              rows={5}
            />
          </div>
          <Button
            variant='outline'
            size='sm'
            onClick={parseFacebookPost}
            disabled={!facebookPost.trim() || loading}
          >
            Parse Post
          </Button>

          {parsedData && (
            <div className='rounded-md bg-blue-50 p-4'>
              <p className='mb-2 text-sm font-bold text-blue-900'>
                Parsed Data:
              </p>
              <div className='space-y-1 text-sm text-blue-700'>
                <p>
                  Session Type: {parsedData.session_type || 'Not detected'} (
                  {Math.round(parsedData.confidence.session_type * 100)}%)
                </p>
                <p>
                  Ordinal: {parsedData.ordinal || 'Not detected'} (
                  {Math.round(parsedData.confidence.ordinal * 100)}%)
                </p>
                <p>
                  Date: {parsedData.date || 'Not detected'} (
                  {Math.round(parsedData.confidence.date * 100)}%)
                </p>
                <p>Attendees Found: {parsedData.attendee_names.length}</p>
                {matchedAttendees.length > 0 && (
                  <p>Matched to Database: {matchedAttendees.length}</p>
                )}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Session Details Form */}
      <Card variant='default'>
        <CardHeader>
          <CardTitle className='flex items-center gap-2'>
            <Calendar className='h-5 w-5' />
            Session Details
          </CardTitle>
        </CardHeader>
        <CardContent className='space-y-4'>
          <div className='grid gap-4 sm:grid-cols-2'>
            <div>
              <label className='mb-2 block text-sm font-medium text-slate-700'>
                Session Type
              </label>
              <select
                value={sessionType}
                onChange={e => setSessionType(e.target.value as SessionType)}
                className='focus:border-primary-500 focus:ring-primary-500 w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:ring-1 focus:outline-none'
              >
                {sessionTypeOptions.map(option => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className='mb-2 block text-sm font-medium text-slate-700'>
                Ordinal Number
              </label>
              <input
                type='number'
                value={ordinal || ''}
                onChange={e =>
                  setOrdinal(
                    e.target.value ? parseInt(e.target.value, 10) : null
                  )
                }
                placeholder='e.g., 100'
                className='focus:border-primary-500 focus:ring-primary-500 w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:ring-1 focus:outline-none'
              />
            </div>
          </div>

          <div>
            <label className='mb-2 block text-sm font-medium text-slate-700'>
              Date
            </label>
            <input
              type='date'
              value={date}
              onChange={e => setDate(e.target.value)}
              className='focus:border-primary-500 focus:ring-primary-500 w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:ring-1 focus:outline-none'
            />
          </div>

          <div>
            <label className='mb-2 block text-sm font-medium text-slate-700'>
              Source URL
            </label>
            <input
              type='url'
              value={sourceUrl}
              onChange={e => setSourceUrl(e.target.value)}
              placeholder='https://facebook.com/...'
              className='focus:border-primary-500 focus:ring-primary-500 w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:ring-1 focus:outline-none'
            />
          </div>
        </CardContent>
      </Card>

      {/* Attendance Form */}
      <Card variant='default'>
        <CardHeader>
          <CardTitle className='flex items-center gap-2'>
            <Users className='h-5 w-5' />
            Attendance
          </CardTitle>
        </CardHeader>
        <CardContent className='space-y-4'>
          <div className='flex items-center justify-between'>
            <div className='flex gap-2'>
              <Badge variant='success'>Present: {presentCount}</Badge>
              <Badge variant='warning'>Absent: {absentCount}</Badge>
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

          {loading ? (
            <div className='py-8 text-center text-slate-500'>
              Loading members...
            </div>
          ) : members.length === 0 ? (
            <EmptyState
              title='No members found'
              message='No council members found for this term.'
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
                        className={`flex h-8 w-8 items-center justify-center rounded-full ${
                          isAbsent ? 'bg-amber-200' : 'bg-emerald-200'
                        }`}
                      >
                        {isAbsent ? (
                          <X className='h-4 w-4 text-amber-700' />
                        ) : (
                          <Check className='h-4 w-4 text-emerald-700' />
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
        <Button
          variant='primary'
          onClick={handleSave}
          disabled={saving || !date}
        >
          {saving
            ? 'Saving...'
            : sessionId
              ? 'Update Session'
              : 'Create Session'}
        </Button>
      </div>
    </div>
  );
}
