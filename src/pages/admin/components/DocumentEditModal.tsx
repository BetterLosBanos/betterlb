import { useCallback, useEffect, useState } from 'react';

import { Banner } from '@/kapwa/banner';
import {
  AlertCircle,
  Calendar,
  ExternalLink,
  FileText,
  Save,
  User,
  X,
} from 'lucide-react';

import PersonSearchAutocomplete from '@/components/admin/PersonSearchAutocomplete';
import SessionAttendanceQuickEdit from '@/components/admin/SessionAttendanceQuickEdit';
import SubjectSearchAutocomplete from '@/components/admin/SubjectSearchAutocomplete';
import { Badge } from '@/components/ui/Badge';
import Button from '@/components/ui/Button';
import { Card, CardContent } from '@/components/ui/Card';
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/Dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/Tabs';

interface Person {
  id: string;
  first_name: string;
  middle_name: string | null;
  last_name: string;
}

interface SessionData {
  id: string;
  term_id: string;
  session_type: string;
  ordinal: number | null;
  date: string;
  source_url: string | null;
  members: Array<{
    id: string;
    person_id: string;
    first_name: string;
    middle_name: string | null;
    last_name: string;
    role?: string;
  }>;
  absences: Array<{
    id: string;
    person_id: string;
    first_name: string;
    middle_name: string | null;
    last_name: string;
  }>;
}

interface DocumentData {
  id: string;
  type: 'ordinance' | 'resolution' | 'executive_order';
  number: string;
  title: string;
  session_id: string;
  status: string;
  date_enacted: string;
  pdf_url: string;
  content_preview: string | null;
  source_type: string;
  needs_review: number;
  review_notes: string | null;
  processed: number;
  authors: Person[];
  subjects: string[];
}

interface DocumentEditModalProps {
  documentId: string;
  open: boolean;
  onClose: () => void;
  onSave: (data: Partial<DocumentData>) => Promise<void>;
}

type TabValue = 'document' | 'session';

export default function DocumentEditModal({
  documentId,
  open,
  onClose,
  onSave,
}: DocumentEditModalProps) {
  const [document, setDocument] = useState<DocumentData | null>(null);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState<Partial<DocumentData>>({});

  // Banner state for notifications
  const [banner, setBanner] = useState<{
    message: string;
    type: 'success' | 'warning' | 'error' | 'info';
  } | null>(null);

  // Tab state
  const [activeTab, setActiveTab] = useState<TabValue>('document');

  // Session data state
  const [sessionData, setSessionData] = useState<SessionData | null>(null);
  const [sessionLoading, setSessionLoading] = useState(false);
  const [sessionError, setSessionError] = useState<string | null>(null);

  // Attendance state
  const [absentPersonIds, setAbsentPersonIds] = useState<string[]>([]);

  // Session form state for editing
  const [sessionForm, setSessionForm] = useState<
    Partial<{
      session_type: string;
      date: string;
      ordinal: number | null;
    }>
  >({});

  const fetchSessionData = useCallback(async (sessionId: string) => {
    setSessionLoading(true);
    setSessionError(null);
    try {
      const isMockMode = import.meta.env.VITE_ADMIN_MOCK_MODE === 'true';

      if (isMockMode) {
        // Mock session data
        const mockSession: SessionData = {
          id: sessionId,
          term_id: 'term_12',
          session_type: 'Regular',
          ordinal: 1,
          date: '2024-01-15',
          source_url: null,
          members: [
            {
              id: 'm1',
              person_id: 'person_1',
              first_name: 'Juan',
              middle_name: null,
              last_name: 'Dela Cruz',
              role: 'Councilor',
            },
            {
              id: 'm2',
              person_id: 'person_2',
              first_name: 'Maria',
              middle_name: 'Santos',
              last_name: 'Reyes',
              role: 'Councilor',
            },
            {
              id: 'm3',
              person_id: 'person_3',
              first_name: 'Jose',
              middle_name: null,
              last_name: 'Mendoza',
              role: 'Councilor',
            },
          ],
          absences: [
            {
              id: 'a1',
              person_id: 'person_3',
              first_name: 'Jose',
              middle_name: null,
              last_name: 'Mendoza',
            },
          ],
        };
        setSessionData(mockSession);
        setAbsentPersonIds(mockSession.absences.map(a => a.person_id));
        // Initialize session form for mock mode
        setSessionForm({
          session_type: mockSession.session_type,
          date: mockSession.date,
          ordinal: mockSession.ordinal,
        });
        return;
      }

      const response = await fetch(`/api/admin/sessions/${sessionId}`);
      if (!response.ok) {
        throw new Error(`Failed to fetch session (HTTP ${response.status})`);
      }
      const data: SessionData = await response.json();
      setSessionData(data);
      setAbsentPersonIds(data.absences.map(a => a.person_id));
      // Initialize session form
      setSessionForm({
        session_type: data.session_type,
        date: data.date,
        ordinal: data.ordinal,
      });
    } catch (error) {
      console.error('Error fetching session:', error);
      setSessionError(error instanceof Error ? error.message : 'Unknown error');
    } finally {
      setSessionLoading(false);
    }
  }, []);

  const fetchDocument = useCallback(async () => {
    setLoading(true);
    try {
      // Check if mock mode is enabled
      const isMockMode = import.meta.env.VITE_ADMIN_MOCK_MODE === 'true';

      if (isMockMode) {
        // Use mock data for local development
        const mockData: DocumentData = {
          id: documentId,
          type: 'ordinance',
          number: '2024-001',
          title: 'AN ORDINANCE ENACTING THE SUPPLEMENTAL BUDGET FOR FY 2024',
          session_id: 'session_123',
          status: 'Approved',
          date_enacted: '2024-01-15T00:00:00Z',
          pdf_url: 'https://example.com/document.pdf',
          content_preview: 'Sample content preview...',
          source_type: 'pdf',
          needs_review: 1,
          review_notes: null,
          processed: 0,
          authors: [
            {
              id: 'person_1',
              first_name: 'Juan',
              middle_name: null,
              last_name: 'Dela Cruz',
            },
            {
              id: 'person_2',
              first_name: 'Maria',
              middle_name: 'Santos',
              last_name: 'Reyes',
            },
          ],
          subjects: ['Budget', 'Finance'],
        };
        setDocument(mockData);
        setFormData(mockData);

        // Fetch session data for mock mode
        fetchSessionData(mockData.session_id);
        return;
      }

      const response = await fetch(`/api/admin/documents/${documentId}`);
      if (!response.ok) {
        let errorMsg = `Failed to fetch document (HTTP ${response.status})`;
        try {
          const error = await response.json();
          errorMsg = error.error || errorMsg;
        } catch {
          // Response body is empty or not JSON
          const text = await response.text();
          if (text) errorMsg += `: ${text}`;
        }
        throw new Error(errorMsg);
      }
      const data: DocumentData = await response.json();
      setDocument(data);
      setFormData(data);

      // Fetch session data if session_id exists
      if (data.session_id) {
        fetchSessionData(data.session_id);
      }
    } catch (error) {
      console.error('Error fetching document:', error);
      setBanner({
        message: `Failed to load document: ${error instanceof Error ? error.message : 'Unknown error'}`,
        type: 'error',
      });
    } finally {
      setLoading(false);
    }
  }, [documentId, fetchSessionData]);

  useEffect(() => {
    if (open && documentId) {
      fetchDocument();
    }
  }, [open, documentId, fetchDocument]);

  const handleSave = async () => {
    setSaving(true);
    try {
      // Save document data
      await onSave(formData);

      // Save session data and attendance if we have session data
      if (sessionData) {
        const isMockMode = import.meta.env.VITE_ADMIN_MOCK_MODE === 'true';

        // Save session details (type, date, ordinal) if changed
        const sessionChanged =
          (sessionForm.session_type !== undefined &&
            sessionForm.session_type !== sessionData.session_type) ||
          (sessionForm.date !== undefined &&
            sessionForm.date !== sessionData.date) ||
          (sessionForm.ordinal !== undefined &&
            sessionForm.ordinal !== sessionData.ordinal);

        if (sessionChanged && !isMockMode) {
          try {
            await fetch(`/api/admin/sessions/${sessionData.id}`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify(sessionForm),
            });
          } catch (error) {
            console.error('Error saving session:', error);
            // Continue anyway - document was saved
          }
        }

        // Save attendance if absences have changed
        const currentAbsenceIds = sessionData.absences.map(a => a.person_id);
        const absencesChanged =
          absentPersonIds.length !== currentAbsenceIds.length ||
          absentPersonIds.some(id => !currentAbsenceIds.includes(id)) ||
          currentAbsenceIds.some(id => !absentPersonIds.includes(id));

        if (absencesChanged && !isMockMode) {
          try {
            await fetch(`/api/admin/attendance/${sessionData.id}`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ absent_person_ids: absentPersonIds }),
            });
          } catch (error) {
            console.error('Error saving attendance:', error);
            // Continue anyway - document was saved
          }
        }
      }

      onClose();
    } catch (error) {
      console.error('Error saving document:', error);
      setBanner({
        message: `Failed to save document: ${error instanceof Error ? error.message : 'Unknown error'}`,
        type: 'error',
      });
    } finally {
      setSaving(false);
    }
  };

  const removeAuthor = (authorId: string) => {
    if (formData.authors) {
      setFormData({
        ...formData,
        authors: formData.authors.filter(a => a.id !== authorId),
      });
    }
  };

  const removeSubject = (subject: string) => {
    if (formData.subjects) {
      setFormData({
        ...formData,
        subjects: formData.subjects.filter(s => s !== subject),
      });
    }
  };

  const handleAbsentChange = (personId: string, isAbsent: boolean) => {
    setAbsentPersonIds(prevIds => {
      if (isAbsent) {
        return [...prevIds, personId];
      } else {
        return prevIds.filter(id => id !== personId);
      }
    });
  };

  if (loading || !document) {
    return (
      <Dialog
        open={open}
        onOpenChange={isOpen => {
          if (!isOpen) onClose();
        }}
      >
        <DialogContent className='max-w-3xl'>
          <DialogHeader>
            <DialogTitle>Edit Document</DialogTitle>
          </DialogHeader>
          <div className='flex items-center justify-center py-12'>
            <div className='border-t-primary-500 h-8 w-8 animate-spin rounded-full border-4 border-slate-300' />
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  const hasLinkedSession = !!document.session_id;

  return (
    <Dialog
      open={open}
      onOpenChange={isOpen => {
        if (!isOpen) onClose();
      }}
    >
      <DialogContent className='flex max-h-[90vh] max-w-3xl flex-col overflow-hidden'>
        <DialogHeader>
          <div>
            <DialogTitle>Edit Document</DialogTitle>
            <div className='mt-2 flex items-center gap-2'>
              <Badge
                variant={
                  document.type === 'ordinance' ? 'primary' : 'secondary'
                }
              >
                {document.type}
              </Badge>
              <span className='font-mono text-sm text-slate-600'>
                {document.number}
              </span>
            </div>
          </div>
        </DialogHeader>

        {/* Notifications */}
        {banner && (
          <div className='mb-4'>
            <Banner
              type={banner.type}
              description={banner.message}
              onDismiss={() => setBanner(null)}
            />
          </div>
        )}

        {/* Tabs */}
        <Tabs
          value={activeTab}
          onValueChange={v => setActiveTab(v as TabValue)}
          className='flex flex-1 flex-col overflow-hidden'
        >
          <TabsList className='w-full'>
            <TabsTrigger value='document' className='flex-1'>
              <FileText className='mr-2 h-4 w-4' />
              Document
            </TabsTrigger>
            <TabsTrigger
              value='session'
              className='flex-1'
              disabled={!hasLinkedSession}
            >
              <Calendar className='mr-2 h-4 w-4' />
              Session & Attendance
            </TabsTrigger>
          </TabsList>

          {/* Document Tab */}
          <TabsContent
            value='document'
            className='-mx-1 flex-1 overflow-y-auto px-1'
          >
            <div className='space-y-6 py-4'>
              {/* Basic Info */}
              <Card variant='default'>
                <CardContent className='space-y-4 p-4'>
                  <div>
                    <label className='mb-1 block text-sm font-medium text-slate-700'>
                      Title
                    </label>
                    <input
                      type='text'
                      value={formData.title || ''}
                      onChange={e =>
                        setFormData({ ...formData, title: e.target.value })
                      }
                      className='w-full rounded-md border border-slate-300 px-3 py-2 text-sm'
                    />
                  </div>

                  <div className='grid gap-4 sm:grid-cols-2'>
                    <div>
                      <label className='mb-1 block text-sm font-medium text-slate-700'>
                        Document Number
                      </label>
                      <input
                        type='text'
                        value={formData.number || ''}
                        onChange={e =>
                          setFormData({ ...formData, number: e.target.value })
                        }
                        className='w-full rounded-md border border-slate-300 px-3 py-2 text-sm'
                      />
                    </div>
                    <div>
                      <label className='mb-1 block text-sm font-medium text-slate-700'>
                        Date Enacted
                      </label>
                      <input
                        type='date'
                        value={formData.date_enacted?.split('T')[0] || ''}
                        onChange={e =>
                          setFormData({
                            ...formData,
                            date_enacted: e.target.value,
                          })
                        }
                        className='w-full rounded-md border border-slate-300 px-3 py-2 text-sm'
                      />
                    </div>
                  </div>

                  <div className='grid gap-4 sm:grid-cols-2'>
                    <div>
                      <label className='mb-1 block text-sm font-medium text-slate-700'>
                        Status
                      </label>
                      <select
                        value={formData.status || ''}
                        onChange={e =>
                          setFormData({ ...formData, status: e.target.value })
                        }
                        className='w-full rounded-md border border-slate-300 px-3 py-2 text-sm'
                      >
                        <option value='Approved'>Approved</option>
                        <option value='Pending'>Pending</option>
                        <option value='Withdrawn'>Withdrawn</option>
                        <option value='Vetoed'>Vetoed</option>
                      </select>
                    </div>
                    <div>
                      <label className='mb-1 block text-sm font-medium text-slate-700'>
                        Type
                      </label>
                      <select
                        value={formData.type || ''}
                        onChange={e =>
                          setFormData({
                            ...formData,
                            type: e.target.value as
                              | 'ordinance'
                              | 'resolution'
                              | 'executive_order',
                          })
                        }
                        className='w-full rounded-md border border-slate-300 px-3 py-2 text-sm'
                      >
                        <option value='ordinance'>Ordinance</option>
                        <option value='resolution'>Resolution</option>
                        <option value='executive_order'>Executive Order</option>
                      </select>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Authors */}
              <Card variant='default' className='overflow-visible'>
                <CardContent className='space-y-4 overflow-visible p-4'>
                  <h4 className='font-bold text-slate-900'>Authors</h4>
                  <div className='flex flex-wrap gap-2'>
                    {formData.authors?.map(author => (
                      <Badge key={author.id} variant='slate'>
                        <User className='mr-1 h-3 w-3' />
                        {author.first_name} {author.last_name}
                        <button
                          type='button'
                          onClick={() => removeAuthor(author.id)}
                          className='ml-1 hover:text-red-500'
                        >
                          <X className='h-3 w-3' />
                        </button>
                      </Badge>
                    ))}
                  </div>
                  <PersonSearchAutocomplete
                    onSelect={result => {
                      if ('isNew' in result) {
                        // Create new person (temporary)
                        const nameParts = result.name.split(' ');
                        const person: Person = {
                          id: `temp_${Date.now()}`,
                          first_name: nameParts[0] || result.name,
                          middle_name: null,
                          last_name: nameParts.slice(1).join(' ') || '',
                        };
                        setFormData({
                          ...formData,
                          authors: [...(formData.authors || []), person],
                        });
                      } else {
                        // Add existing person
                        setFormData({
                          ...formData,
                          authors: [...(formData.authors || []), result],
                        });
                      }
                    }}
                    excludeIds={formData.authors?.map(a => a.id) || []}
                    placeholder='Search for a person or type name to add...'
                  />
                </CardContent>
              </Card>

              {/* Subjects */}
              <Card variant='default' className='overflow-visible'>
                <CardContent className='space-y-4 overflow-visible p-4'>
                  <h4 className='font-bold text-slate-900'>Subjects</h4>
                  <div className='flex flex-wrap gap-2'>
                    {formData.subjects?.map(subject => (
                      <Badge key={subject} variant='primary'>
                        {subject}
                        <button
                          type='button'
                          onClick={() => removeSubject(subject)}
                          className='ml-1 hover:text-red-500'
                        >
                          <X className='h-3 w-3' />
                        </button>
                      </Badge>
                    ))}
                  </div>
                  <SubjectSearchAutocomplete
                    onSelect={result => {
                      if ('isNew' in result) {
                        // Create new subject
                        setFormData({
                          ...formData,
                          subjects: [...(formData.subjects || []), result.name],
                        });
                      } else {
                        // Add existing subject
                        setFormData({
                          ...formData,
                          subjects: [...(formData.subjects || []), result.name],
                        });
                      }
                    }}
                    excludeNames={formData.subjects || []}
                    placeholder='Search for a subject or type name to add...'
                  />
                </CardContent>
              </Card>

              {/* Review Notes */}
              <Card variant='default'>
                <CardContent className='space-y-4 p-4'>
                  <h4 className='font-bold text-slate-900'>Review Notes</h4>
                  <textarea
                    value={formData.review_notes || ''}
                    onChange={e =>
                      setFormData({ ...formData, review_notes: e.target.value })
                    }
                    placeholder='Add notes about this correction...'
                    rows={3}
                    className='w-full rounded-md border border-slate-300 px-3 py-2 text-sm'
                  />
                  <div className='flex items-center gap-2'>
                    <input
                      type='checkbox'
                      id='needsReview'
                      checked={formData.needs_review === 1}
                      onChange={e =>
                        setFormData({
                          ...formData,
                          needs_review: e.target.checked ? 1 : 0,
                        })
                      }
                    />
                    <label
                      htmlFor='needsReview'
                      className='text-sm text-slate-700'
                    >
                      Flag for further review
                    </label>
                  </div>
                </CardContent>
              </Card>

              {/* PDF Link */}
              {formData.pdf_url && (
                <Card variant='slate'>
                  <CardContent className='flex items-center gap-3 p-4'>
                    <FileText className='h-5 w-5 text-slate-500' />
                    <a
                      href={formData.pdf_url}
                      target='_blank'
                      rel='noopener noreferrer'
                      className='text-primary-600 text-sm hover:underline'
                    >
                      View Original PDF
                    </a>
                  </CardContent>
                </Card>
              )}
            </div>
          </TabsContent>

          {/* Session & Attendance Tab */}
          <TabsContent
            value='session'
            className='-mx-1 flex-1 overflow-y-auto px-1'
          >
            <div className='space-y-6 py-4'>
              {!hasLinkedSession ? (
                <Card variant='slate'>
                  <CardContent className='flex items-center gap-3 p-4'>
                    <AlertCircle className='h-5 w-5 text-amber-500' />
                    <p className='text-sm text-slate-600'>
                      This document is not linked to a session.
                    </p>
                  </CardContent>
                </Card>
              ) : sessionLoading ? (
                <div className='flex items-center justify-center py-12'>
                  <div className='border-t-primary-500 h-8 w-8 animate-spin rounded-full border-4 border-slate-300' />
                </div>
              ) : sessionError ? (
                <Card variant='slate'>
                  <CardContent className='flex items-center gap-3 p-4'>
                    <AlertCircle className='h-5 w-5 text-red-500' />
                    <p className='text-sm text-slate-600'>
                      Error loading session: {sessionError}
                    </p>
                  </CardContent>
                </Card>
              ) : sessionData ? (
                <>
                  {/* Session Info - EDITABLE */}
                  <Card variant='default'>
                    <CardContent className='space-y-4 p-4'>
                      <div className='flex items-center justify-between'>
                        <h4 className='font-bold text-slate-900'>
                          Session Details
                        </h4>
                        <a
                          href={`/admin/sessions/${sessionData.id}`}
                          target='_blank'
                          rel='noopener noreferrer'
                          className='text-primary-600 inline-flex items-center gap-1 text-sm hover:underline'
                        >
                          Open full session editor
                          <ExternalLink className='h-3 w-3' />
                        </a>
                      </div>

                      {/* Session Type Dropdown */}
                      <div>
                        <label className='mb-1 block text-sm font-medium text-slate-700'>
                          Session Type
                        </label>
                        <select
                          value={
                            sessionForm.session_type ||
                            sessionData.session_type ||
                            'Regular'
                          }
                          onChange={e =>
                            setSessionForm({
                              ...sessionForm,
                              session_type: e.target.value,
                            })
                          }
                          disabled={saving}
                          className='w-full rounded-md border border-slate-300 px-3 py-2 text-sm disabled:opacity-50 sm:w-auto'
                        >
                          <option value='Regular'>Regular</option>
                          <option value='Inaugural'>Inaugural</option>
                          <option value='Special'>Special</option>
                        </select>
                      </div>

                      {/* Date and Ordinal Row */}
                      <div className='grid gap-4 sm:grid-cols-2'>
                        {/* Date Input */}
                        <div>
                          <label className='mb-1 block text-sm font-medium text-slate-700'>
                            Date
                          </label>
                          <input
                            type='date'
                            value={sessionForm.date || sessionData.date || ''}
                            onChange={e =>
                              setSessionForm({
                                ...sessionForm,
                                date: e.target.value,
                              })
                            }
                            disabled={saving}
                            className='w-full rounded-md border border-slate-300 px-3 py-2 text-sm disabled:opacity-50'
                          />
                        </div>

                        {/* Ordinal (Session Number) */}
                        <div>
                          <label className='mb-1 block text-sm font-medium text-slate-700'>
                            Session Number
                          </label>
                          <input
                            type='number'
                            value={
                              sessionForm.ordinal ?? sessionData.ordinal ?? ''
                            }
                            onChange={e =>
                              setSessionForm({
                                ...sessionForm,
                                ordinal: e.target.value
                                  ? parseInt(e.target.value) || null
                                  : null,
                              })
                            }
                            disabled={saving}
                            placeholder='Optional'
                            className='w-full rounded-md border border-slate-300 px-3 py-2 text-sm disabled:opacity-50'
                          />
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Attendance */}
                  <Card variant='default'>
                    <CardContent className='space-y-4 p-4'>
                      <h4 className='font-bold text-slate-900'>Attendance</h4>
                      <SessionAttendanceQuickEdit
                        sessionId={sessionData.id}
                        termId={sessionData.term_id}
                        absentPersonIds={absentPersonIds}
                        onAbsentChange={handleAbsentChange}
                        disabled={saving}
                      />
                    </CardContent>
                  </Card>
                </>
              ) : null}
            </div>
          </TabsContent>
        </Tabs>

        <DialogFooter>
          <DialogClose asChild>
            <Button variant='outline' disabled={saving}>
              Cancel
            </Button>
          </DialogClose>
          <Button
            variant='primary'
            onClick={handleSave}
            isLoading={saving}
            leftIcon={<Save className='h-4 w-4' />}
          >
            Save Changes
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
