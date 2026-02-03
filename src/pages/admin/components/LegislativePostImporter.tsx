import { useState, useCallback, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogClose,
} from '@/components/ui/Dialog';
import { Card, CardContent } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import Button from '@/components/ui/Button';
import {
  AlertTriangle,
  User,
  Calendar,
  Trash2,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';

// Types
interface Person {
  id: string;
  first_name: string;
  middle_name: string | null;
  last_name: string;
  full_name: string;
}

interface Term {
  id: string;
  name: string;
  year_range: string;
}

interface ParsedLegislativeItem {
  type: 'ordinance' | 'resolution' | 'executive_order';
  number: string;
  title: string;
  authors: string[];
  co_authors: string[];
  seconded_by: string[];
  moved_by?: string;
  confidence: {
    type: number;
    number: number;
    title: number;
    authors: number;
  };
}

interface SessionInfo {
  type: 'regular' | 'special' | 'inaugural' | null;
  ordinal: number | null;
}

interface MatchedPerson {
  person_id: string;
  name: string;
  confidence: number;
}

interface ParseResponse {
  success: boolean;
  session_info: SessionInfo;
  items: ParsedLegislativeItem[];
  matched_persons: {
    [raw_name: string]: MatchedPerson | null;
  };
}

interface ExistingDocument {
  id: string;
  type: string;
  number: string;
  title: string;
  date_enacted: string;
  status: string;
  session_id: string;
}

interface DuplicateInfo {
  index: number;
  existing: ExistingDocument;
  proposed: {
    type: string;
    number: string;
    title: string;
  };
}

interface BulkCreateResponse {
  success: boolean;
  created: Array<{ document_id: string; number: string }>;
  duplicates: DuplicateInfo[];
  errors: Array<{ index: number; message: string }>;
}

interface EditedDocument {
  type: 'ordinance' | 'resolution' | 'executive_order';
  number: string;
  title: string;
  authors: Person[];
  seconded_by?: Person | null;
  moved_by?: Person | null;
  has_duplicate?: boolean;
  duplicate_info?: DuplicateInfo;
}

interface LegislativePostImporterProps {
  open: boolean;
  onClose: () => void;
  onSuccess: (created: number, skipped: number) => void;
}

type Step = 'paste' | 'review' | 'duplicates' | 'creating';

export default function LegislativePostImporter({
  open,
  onClose,
  onSuccess,
}: LegislativePostImporterProps) {
  const [step, setStep] = useState<Step>('paste');
  const [postContent, setPostContent] = useState('');
  const [parsedData, setParsedData] = useState<ParseResponse | null>(null);

  // Session info state (editable)
  const [sessionType, setSessionType] = useState<'Regular' | 'Special' | 'Inaugural'>('Regular');
  const [sessionOrdinal, setSessionOrdinal] = useState<number | null>(null);
  const [sessionDate, setSessionDate] = useState('');
  const [terms, setTerms] = useState<Term[]>([]);
  const [selectedTermId, setSelectedTermId] = useState<string | null>(null);
  const [termsLoading, setTermsLoading] = useState(false);

  const [editedDocuments, setEditedDocuments] = useState<EditedDocument[]>([]);
  const [creating, setCreating] = useState(false);
  const [createResult, setCreateResult] = useState<BulkCreateResponse | null>(null);
  const [expandedItems, setExpandedItems] = useState<Set<number>>(new Set());

  // Fetch terms when dialog opens
  useEffect(() => {
    if (open) {
      fetchTerms();
    }
  }, [open]);

  const fetchTerms = async () => {
    setTermsLoading(true);
    try {
      const response = await fetch('/api/admin/terms?limit=20');
      if (response.ok) {
        const data = await response.json();
        setTerms(data.terms || []);
        // Auto-select the most recent term
        if (data.terms && data.terms.length > 0) {
          setSelectedTermId(data.terms[0].id);
        }
      }
    } catch (error) {
      console.error('Error fetching terms:', error);
    } finally {
      setTermsLoading(false);
    }
  };

  // Parse the post content
  const handleParse = useCallback(async () => {
    if (!postContent.trim()) return;

    setCreating(true);
    try {
      const response = await fetch('/api/admin/parse-legislative-post', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: postContent }),
      });

      if (!response.ok) throw new Error('Failed to parse post');

      const data: ParseResponse = await response.json();
      setParsedData(data);

      // Populate session fields from parsed data
      if (data.session_info.type) {
        const capitalized = data.session_info.type.charAt(0).toUpperCase() + data.session_info.type.slice(1);
        if (capitalized === 'Regular' || capitalized === 'Special' || capitalized === 'Inaugural') {
          setSessionType(capitalized);
        }
      }
      if (data.session_info.ordinal) {
        setSessionOrdinal(data.session_info.ordinal);
      }

      // Convert parsed items to edited documents
      const docs: EditedDocument[] = data.items.map((item) => ({
        type: item.type,
        number: item.number,
        title: item.title,
        authors: item.authors
          .map((name) => {
            const matched = data.matched_persons[name];
            if (matched) {
              return {
                id: matched.person_id,
                first_name: matched.name.split(' ')[0],
                middle_name: null,
                last_name: matched.name.split(' ').slice(1).join(' '),
                full_name: matched.name,
              };
            }
            return null;
          })
          .filter((p): p is Person => p !== null),
        seconded_by: null,
        moved_by: null,
      }));
      setEditedDocuments(docs);
      setStep('review');
    } catch (error) {
      console.error('Error parsing post:', error);
      alert('Failed to parse post content');
    } finally {
      setCreating(false);
    }
  }, [postContent]);

  // Handle person selection for authors
  const handleAddAuthor = useCallback((docIndex: number, person: Person | { isNew: true; name: string }) => {
    setEditedDocuments((prev) => {
      const updated = [...prev];
      if ('isNew' in person) {
        const nameParts = person.name.split(' ');
        const tempPerson: Person = {
          id: `temp_${Date.now()}`,
          first_name: nameParts[0] || person.name,
          middle_name: null,
          last_name: nameParts.slice(1).join(' ') || '',
          full_name: person.name,
        };
        updated[docIndex].authors.push(tempPerson);
      } else {
        updated[docIndex].authors.push(person);
      }
      return updated;
    });
  }, []);

  const handleRemoveAuthor = useCallback((docIndex: number, authorId: string) => {
    setEditedDocuments((prev) => {
      const updated = [...prev];
      updated[docIndex].authors = updated[docIndex].authors.filter((a) => a.id !== authorId);
      return updated;
    });
  }, []);

  const handleRemoveDocument = useCallback((index: number) => {
    setEditedDocuments((prev) => prev.filter((_, i) => i !== index));
  }, []);

  const toggleExpanded = useCallback((index: number) => {
    setExpandedItems((prev) => {
      const next = new Set(prev);
      if (next.has(index)) {
        next.delete(index);
      } else {
        next.add(index);
      }
      return next;
    });
  }, []);

  // Create documents
  const handleCreate = useCallback(async () => {
    // Validate session fields
    if (!sessionDate) {
      alert('Please enter the session date');
      return;
    }
    if (!selectedTermId) {
      alert('Please select a term');
      return;
    }

    setCreating(true);
    setStep('creating');

    try {
      // First, try to find existing session or create a new one
      let sessionId: string;

      // Check if session with matching info exists
      const checkResponse = await fetch(`/api/admin/sessions?term=${selectedTermId}&limit=100`);
      if (checkResponse.ok) {
        const sessionsData = await checkResponse.json();
        const existingSession = sessionsData.sessions?.find((s: Session) =>
          s.type === sessionType &&
          s.number === sessionOrdinal &&
          s.date === sessionDate
        );

        if (existingSession) {
          sessionId = existingSession.id;
        } else {
          // Create new session
          const createSessionResponse = await fetch('/api/admin/sessions', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              term_id: selectedTermId,
              session_type: sessionType,
              ordinal: sessionOrdinal,
              date: sessionDate,
            }),
          });

          if (!createSessionResponse.ok) {
            throw new Error('Failed to create session');
          }

          const sessionResult = await createSessionResponse.json();
          sessionId = sessionResult.session_id;
        }
      } else {
        throw new Error('Failed to check existing sessions');
      }

      // Now create documents
      const response = await fetch('/api/admin/documents/bulk', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          session_id: sessionId,
          documents: editedDocuments.map((doc) => ({
            type: doc.type,
            number: doc.number,
            title: doc.title,
            authors: doc.authors.map((a) => ({
              person_id: a.id,
              is_new: a.id.startsWith('temp_'),
              name: a.full_name,
            })),
            seconded_by: doc.seconded_by?.id,
            moved_by: doc.moved_by?.id,
          })),
          skip_duplicates: false,
        }),
      });

      if (!response.ok) throw new Error('Failed to create documents');

      const result: BulkCreateResponse = await response.json();
      setCreateResult(result);

      // If there are duplicates, show them
      if (result.duplicates.length > 0) {
        setStep('duplicates');

        // Update edited documents with duplicate info
        setEditedDocuments((prev) => {
          const updated = [...prev];
          for (const dup of result.duplicates) {
            updated[dup.index] = {
              ...updated[dup.index],
              has_duplicate: true,
              duplicate_info: dup,
            };
          }
          return updated;
        });
        return;
      }

      // Success!
      onSuccess(result.created.length, 0);
      handleClose();
      return;
    } catch (error) {
      console.error('Error creating documents:', error);
      alert('Failed to create documents: ' + (error instanceof Error ? error.message : 'Unknown error'));
      setStep('review');
    } finally {
      setCreating(false);
    }
  }, [sessionType, sessionOrdinal, sessionDate, selectedTermId, editedDocuments, onSuccess]);

  // Skip duplicates and continue creating
  const handleSkipDuplicates = useCallback(async () => {
    // Validate session fields
    if (!sessionDate) {
      alert('Please enter the session date');
      return;
    }
    if (!selectedTermId) {
      alert('Please select a term');
      return;
    }

    setCreating(true);

    try {
      // First, try to find existing session or create a new one
      let sessionId: string;

      // Check if session with matching info exists
      const checkResponse = await fetch(`/api/admin/sessions?term=${selectedTermId}&limit=100`);
      if (checkResponse.ok) {
        const sessionsData = await checkResponse.json();
        const existingSession = sessionsData.sessions?.find((s: Session) =>
          s.type === sessionType &&
          s.number === sessionOrdinal &&
          s.date === sessionDate
        );

        if (existingSession) {
          sessionId = existingSession.id;
        } else {
          // Create new session
          const createSessionResponse = await fetch('/api/admin/sessions', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              term_id: selectedTermId,
              session_type: sessionType,
              ordinal: sessionOrdinal,
              date: sessionDate,
            }),
          });

          if (!createSessionResponse.ok) {
            throw new Error('Failed to create session');
          }

          const sessionResult = await createSessionResponse.json();
          sessionId = sessionResult.session_id;
        }
      } else {
        throw new Error('Failed to check existing sessions');
      }

      const documentsToCreate = editedDocuments.filter((doc) => !doc.has_duplicate);

      const response = await fetch('/api/admin/documents/bulk', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          session_id: sessionId,
          documents: documentsToCreate.map((doc) => ({
            type: doc.type,
            number: doc.number,
            title: doc.title,
            authors: doc.authors.map((a) => ({
              person_id: a.id,
              is_new: a.id.startsWith('temp_'),
              name: a.full_name,
            })),
            seconded_by: doc.seconded_by?.id,
            moved_by: doc.moved_by?.id,
          })),
          skip_duplicates: true,
        }),
      });

      if (!response.ok) throw new Error('Failed to create documents');

      const result: BulkCreateResponse = await response.json();

      onSuccess(result.created.length, editedDocuments.filter((doc) => doc.has_duplicate).length);
      handleClose();
    } catch (error) {
      console.error('Error creating documents:', error);
      alert('Failed to create documents');
    } finally {
      setCreating(false);
    }
  }, [sessionType, sessionOrdinal, sessionDate, selectedTermId, editedDocuments, onSuccess]);

  const handleClose = useCallback(() => {
    setStep('paste');
    setPostContent('');
    setParsedData(null);
    setSessionType('Regular');
    setSessionOrdinal(null);
    setSessionDate('');
    setSelectedTermId(null);
    setEditedDocuments([]);
    setCreateResult(null);
    setExpandedItems(new Set());
    onClose();
  }, [onClose]);

  const getDocumentTypeLabel = (type: string) => {
    switch (type) {
      case 'ordinance':
        return 'Ordinance';
      case 'resolution':
        return 'Resolution';
      case 'executive_order':
        return 'Executive Order';
      default:
        return type;
    }
  };

  return (
    <Dialog open={open} onOpenChange={(isOpen) => { if (!isOpen) handleClose(); }}>
      <DialogContent className="max-w-4xl max-h-screen overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Import Legislative Documents from Facebook</DialogTitle>
        </DialogHeader>

        <div className="py-4">
          {/* Step 1: Paste Post */}
          {step === 'paste' && (
            <div className="space-y-4 py-4">
              <Card variant="default">
                <CardContent className="p-4 space-y-4">
                  <div>
                    <label className="block mb-2 text-sm font-medium text-slate-700">
                      Paste Facebook Post Content
                    </label>
                    <textarea
                      value={postContent}
                      onChange={(e) => setPostContent(e.target.value)}
                      placeholder="Paste the Facebook post content here...
Example:
25TH REGULAR SESSION

1. ORDINANCE NO. 2026-2469
AN ORDINANCE INSTITUTIONALIZING...
Author: Hon. Rand Edouard R. De Jesus
Seconded By: Hon. Miko C. Pelegrina

2. ORDINANCE NO. 2026-2470
..."
                      className="w-full h-64 px-3 py-2 text-sm rounded-md border border-slate-300 font-mono"
                    />
                  </div>
                  <Button
                    variant="primary"
                    onClick={handleParse}
                    disabled={!postContent.trim() || creating}
                    fullWidth
                    isLoading={creating}
                  >
                    Parse Content
                  </Button>
                </CardContent>
              </Card>

              <Card variant="slate">
                <CardContent className="p-4">
                  <h4 className="font-semibold text-sm text-slate-900 mb-2">
                    Supported Format
                  </h4>
                  <p className="text-xs text-slate-600">
                    The parser expects numbered items with document type, number, title, and author information.
                    Session info should be at the top (e.g., &quot;25TH REGULAR SESSION&quot;).
                  </p>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Step 2: Review & Edit */}
          {step === 'review' && (
            <div className="space-y-4 py-4">
              {/* Session Info */}
              <Card variant="default">
                <CardContent className="p-4 space-y-4">
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-slate-500" />
                    <h4 className="font-semibold text-sm text-slate-900">
                      Session Information (Required)
                    </h4>
                  </div>
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div>
                      <label className="block mb-1 text-xs text-slate-600">Session Type</label>
                      <select
                        value={sessionType}
                        onChange={(e) => setSessionType(e.target.value as 'Regular' | 'Special' | 'Inaugural')}
                        className="w-full px-3 py-2 text-sm rounded-md border border-slate-300 bg-white"
                      >
                        <option value="Regular">Regular</option>
                        <option value="Special">Special</option>
                        <option value="Inaugural">Inaugural</option>
                      </select>
                    </div>
                    <div>
                      <label className="block mb-1 text-xs text-slate-600">Session Number (Ordinal)</label>
                      <input
                        type="number"
                        value={sessionOrdinal ?? ''}
                        onChange={(e) => setSessionOrdinal(e.target.value ? parseInt(e.target.value) : null)}
                        placeholder="e.g., 25"
                        className="w-full px-3 py-2 text-sm rounded-md border border-slate-300"
                      />
                    </div>
                    <div>
                      <label className="block mb-1 text-xs text-slate-600">Session Date</label>
                      <input
                        type="date"
                        value={sessionDate}
                        onChange={(e) => setSessionDate(e.target.value)}
                        className="w-full px-3 py-2 text-sm rounded-md border border-slate-300"
                        required
                      />
                    </div>
                    <div>
                      <label className="block mb-1 text-xs text-slate-600">Term</label>
                      <select
                        value={selectedTermId || ''}
                        onChange={(e) => setSelectedTermId(e.target.value || null)}
                        disabled={termsLoading}
                        className="w-full px-3 py-2 text-sm rounded-md border border-slate-300 bg-white disabled:bg-slate-100"
                      >
                        {terms.map((term) => (
                          <option key={term.id} value={term.id}>
                            {term.name} ({term.year_range})
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                  {parsedData?.session_info.type && (
                    <p className="text-xs text-slate-500">
                      Detected from post: {parsedData.session_info.ordinal}th {parsedData.session_info.type} session
                    </p>
                  )}
                </CardContent>
              </Card>

              {/* Documents List */}
              <div className="space-y-3">
                <h4 className="font-semibold text-sm text-slate-900">
                  Parsed Documents ({editedDocuments.length})
                </h4>

                {editedDocuments.map((doc, index) => (
                  <Card key={index} variant="default">
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-2">
                            <Badge variant={doc.type === 'ordinance' ? 'primary' : 'secondary'}>
                              {getDocumentTypeLabel(doc.type)}
                            </Badge>
                            <span className="font-mono text-xs text-slate-600">
                              {doc.number}
                            </span>
                          </div>
                          <p className="text-sm text-slate-900 font-medium line-clamp-2">
                            {doc.title}
                          </p>
                          <div className="flex flex-wrap gap-1 mt-2">
                            {doc.authors.map((author) => (
                              <Badge key={author.id} variant="slate" className="text-xs">
                                <User className="w-3 h-3 mr-1" />
                                {author.full_name}
                              </Badge>
                            ))}
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => toggleExpanded(index)}
                            className="p-1 text-slate-400 hover:text-slate-600"
                          >
                            {expandedItems.has(index) ? (
                              <ChevronUp className="w-4 h-4" />
                            ) : (
                              <ChevronDown className="w-4 h-4" />
                            )}
                          </button>
                          <button
                            onClick={() => handleRemoveDocument(index)}
                            className="p-1 text-red-400 hover:text-red-600"
                            title="Remove document"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>

                      {/* Expanded Details */}
                      {expandedItems.has(index) && (
                        <div className="mt-4 pt-4 border-t border-slate-200 space-y-4">
                          {/* Type */}
                          <div>
                            <label className="block mb-1 text-xs text-slate-600">Document Type</label>
                            <select
                              value={doc.type}
                              onChange={(e) => {
                                setEditedDocuments((prev) => {
                                  const updated = [...prev];
                                  updated[index].type = e.target.value as 'ordinance' | 'resolution' | 'executive_order';
                                  return updated;
                                });
                              }}
                              className="w-full px-3 py-2 text-sm rounded-md border border-slate-300"
                            >
                              <option value="ordinance">Ordinance</option>
                              <option value="resolution">Resolution</option>
                              <option value="executive_order">Executive Order</option>
                            </select>
                          </div>

                          {/* Number */}
                          <div>
                            <label className="block mb-1 text-xs text-slate-600">Document Number</label>
                            <input
                              type="text"
                              value={doc.number}
                              onChange={(e) => {
                                setEditedDocuments((prev) => {
                                  const updated = [...prev];
                                  updated[index].number = e.target.value;
                                  return updated;
                                });
                              }}
                              className="w-full px-3 py-2 text-sm rounded-md border border-slate-300 font-mono"
                            />
                          </div>

                          {/* Title */}
                          <div>
                            <label className="block mb-1 text-xs text-slate-600">Title</label>
                            <textarea
                              value={doc.title}
                              onChange={(e) => {
                                setEditedDocuments((prev) => {
                                  const updated = [...prev];
                                  updated[index].title = e.target.value;
                                  return updated;
                                });
                              }}
                              rows={3}
                              className="w-full px-3 py-2 text-sm rounded-md border border-slate-300"
                            />
                          </div>

                          {/* Authors */}
                          <div>
                            <label className="block mb-1 text-xs text-slate-600">Authors</label>
                            <div className="flex flex-wrap gap-2 mb-2">
                              {doc.authors.map((author) => (
                                <Badge key={author.id} variant="slate">
                                  <User className="w-3 h-3 mr-1" />
                                  {author.full_name}
                                  <button
                                    type="button"
                                    onClick={() => handleRemoveAuthor(index, author.id)}
                                    className="ml-1 hover:text-red-500"
                                  >
                                    ×
                                  </button>
                                </Badge>
                              ))}
                            </div>
                            <input
                              type="text"
                              placeholder="Add author (type name)..."
                              className="w-full px-3 py-2 text-sm rounded-md border border-slate-300"
                              onKeyDown={(e) => {
                                if (e.key === 'Enter' && e.currentTarget.value.trim()) {
                                  const name = e.currentTarget.value.trim();
                                  const nameParts = name.split(' ');
                                  const newPerson: Person = {
                                    id: `temp_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
                                    first_name: nameParts[0] || name,
                                    middle_name: null,
                                    last_name: nameParts.slice(1).join(' ') || '',
                                    full_name: name,
                                  };
                                  handleAddAuthor(index, newPerson);
                                  e.currentTarget.value = '';
                                }
                              }}
                            />
                          </div>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}

          {/* Step 3: Duplicates Found */}
          {step === 'duplicates' && (
            <div className="space-y-4 py-4">
              <Card variant="warning">
                <CardContent className="p-4">
                  <div className="flex items-start gap-3">
                    <AlertTriangle className="w-5 h-5 text-amber-500 flex-shrink-0 mt-0.5" />
                    <div>
                      <h4 className="font-semibold text-sm text-slate-900">
                        Duplicates Found
                      </h4>
                      <p className="text-xs text-slate-600 mt-1">
                        {createResult?.duplicates.length || 0} document(s) already exist in the database.
                        You can skip them or go back to edit the document numbers.
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <div className="space-y-3">
                {editedDocuments
                  .filter((doc) => doc.has_duplicate)
                  .map((doc) => {
                    const originalIndex = editedDocuments.indexOf(doc);
                    const dup = doc.duplicate_info;
                    return (
                      <Card key={originalIndex} variant="slate">
                        <CardContent className="p-4">
                          <div className="flex items-start justify-between gap-4">
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 mb-2">
                                <Badge variant="warning">Duplicate</Badge>
                                <span className="font-mono text-xs text-slate-600">
                                  {doc.number}
                                </span>
                              </div>
                              <div className="space-y-2 text-xs">
                                <div>
                                  <span className="font-medium text-slate-700">Existing: </span>
                                  <span className="text-slate-600">{dup?.existing.title}</span>
                                </div>
                                <div>
                                  <span className="font-medium text-slate-700">New: </span>
                                  <span className="text-slate-600">{doc.title}</span>
                                </div>
                              </div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    );
                  })}
              </div>

              <div className="flex gap-3">
                <Button
                  variant="outline"
                  onClick={() => setStep('review')}
                  fullWidth
                >
                  Go Back to Edit
                </Button>
                <Button
                  variant="primary"
                  onClick={handleSkipDuplicates}
                  disabled={creating}
                  fullWidth
                >
                  Skip Duplicates & Continue
                </Button>
              </div>
            </div>
          )}

          {/* Step 4: Creating */}
          {step === 'creating' && (
            <div className="flex flex-col items-center justify-center py-12 space-y-4">
              <div className="w-12 h-12 rounded-full border-4 border-slate-200 border-t-primary-500 animate-spin" />
              <p className="text-sm text-slate-600">Creating documents...</p>
            </div>
          )}
        </div>

        {/* Footer */}
        {step !== 'duplicates' && step !== 'creating' && (
          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline" disabled={creating}>
                Cancel
              </Button>
            </DialogClose>
            {step === 'review' && (
              <Button
                variant="primary"
                onClick={handleCreate}
                disabled={creating || editedDocuments.length === 0}
                isLoading={creating}
              >
                Create {editedDocuments.length} Document{editedDocuments.length !== 1 ? 's' : ''}
              </Button>
            )}
          </DialogFooter>
        )}
      </DialogContent>
    </Dialog>
  );
}
