import { useState, useEffect, useCallback } from 'react';
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
import PersonSearchAutocomplete from '@/components/admin/PersonSearchAutocomplete';
import SubjectSearchAutocomplete from '@/components/admin/SubjectSearchAutocomplete';
import { X, Save, FileText, User } from 'lucide-react';

interface Person {
  id: string;
  first_name: string;
  middle_name: string | null;
  last_name: string;
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
          session_id: 'sb_12_2024-01-15',
          status: 'Approved',
          date_enacted: '2024-01-15T00:00:00Z',
          pdf_url: 'https://example.com/document.pdf',
          content_preview: 'Sample content preview...',
          source_type: 'pdf',
          needs_review: 1,
          review_notes: null,
          processed: 0,
          authors: [
            { id: 'person_1', first_name: 'Juan', middle_name: null, last_name: 'Dela Cruz' },
            { id: 'person_2', first_name: 'Maria', middle_name: 'Santos', last_name: 'Reyes' },
          ],
          subjects: ['Budget', 'Finance'],
        };
        setDocument(mockData);
        setFormData(mockData);
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
    } catch (error) {
      console.error('Error fetching document:', error);
      alert(`Failed to load document: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setLoading(false);
    }
  }, [documentId]);

  useEffect(() => {
    if (open && documentId) {
      fetchDocument();
    }
  }, [open, documentId, fetchDocument]);

  const handleSave = async () => {
    setSaving(true);
    try {
      await onSave(formData);
      onClose();
    } catch (error) {
      console.error('Error saving document:', error);
      alert(`Failed to save document: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setSaving(false);
    }
  };

  const removeAuthor = (authorId: string) => {
    if (formData.authors) {
      setFormData({
        ...formData,
        authors: formData.authors.filter((a) => a.id !== authorId),
      });
    }
  };

  const removeSubject = (subject: string) => {
    if (formData.subjects) {
      setFormData({
        ...formData,
        subjects: formData.subjects.filter((s) => s !== subject),
      });
    }
  };

  if (loading || !document) {
    return (
      <Dialog open={open}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>Edit Document</DialogTitle>
          </DialogHeader>
          <div className="flex justify-center items-center py-12">
            <div className="w-8 h-8 rounded-full border-4 animate-spin border-slate-300 border-t-primary-500" />
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={open}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div>
            <DialogTitle>Edit Document</DialogTitle>
            <div className="flex gap-2 items-center mt-2">
              <Badge variant={document.type === 'ordinance' ? 'primary' : 'secondary'}>
                {document.type}
              </Badge>
              <span className="font-mono text-sm text-slate-600">
                {document.number}
              </span>
            </div>
          </div>
        </DialogHeader>

        <div className="py-4 space-y-6">
          {/* Basic Info */}
          <Card variant="default">
            <CardContent className="p-4 space-y-4">
              <div>
                <label className="block mb-1 text-sm font-medium text-slate-700">
                  Title
                </label>
                <input
                  type="text"
                  value={formData.title || ''}
                  onChange={(e) =>
                    setFormData({ ...formData, title: e.target.value })
                  }
                  className="px-3 py-2 w-full text-sm rounded-md border border-slate-300"
                />
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="block mb-1 text-sm font-medium text-slate-700">
                    Document Number
                  </label>
                  <input
                    type="text"
                    value={formData.number || ''}
                    onChange={(e) =>
                      setFormData({ ...formData, number: e.target.value })
                    }
                    className="px-3 py-2 w-full text-sm rounded-md border border-slate-300"
                  />
                </div>
                <div>
                  <label className="block mb-1 text-sm font-medium text-slate-700">
                    Date Enacted
                  </label>
                  <input
                    type="date"
                    value={formData.date_enacted?.split('T')[0] || ''}
                    onChange={(e) =>
                      setFormData({ ...formData, date_enacted: e.target.value })
                    }
                    className="px-3 py-2 w-full text-sm rounded-md border border-slate-300"
                  />
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="block mb-1 text-sm font-medium text-slate-700">
                    Status
                  </label>
                  <select
                    value={formData.status || ''}
                    onChange={(e) =>
                      setFormData({ ...formData, status: e.target.value })
                    }
                    className="px-3 py-2 w-full text-sm rounded-md border border-slate-300"
                  >
                    <option value="Approved">Approved</option>
                    <option value="Pending">Pending</option>
                    <option value="Withdrawn">Withdrawn</option>
                    <option value="Vetoed">Vetoed</option>
                  </select>
                </div>
                <div>
                  <label className="block mb-1 text-sm font-medium text-slate-700">
                    Type
                  </label>
                  <select
                    value={formData.type || ''}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        type: e.target.value as 'ordinance' | 'resolution' | 'executive_order',
                      })
                    }
                    className="px-3 py-2 w-full text-sm rounded-md border border-slate-300"
                  >
                    <option value="ordinance">Ordinance</option>
                    <option value="resolution">Resolution</option>
                    <option value="executive_order">Executive Order</option>
                  </select>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Authors */}
          <Card variant="default">
            <CardContent className="p-4 space-y-4">
              <h4 className="font-bold text-slate-900">
                Authors
              </h4>
              <div className="flex flex-wrap gap-2">
                {formData.authors?.map((author) => (
                  <Badge key={author.id} variant="slate">
                    <User className="mr-1 w-3 h-3" />
                    {author.first_name} {author.last_name}
                    <button
                      type="button"
                      onClick={() => removeAuthor(author.id)}
                      className="ml-1 hover:text-red-500"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </Badge>
                ))}
              </div>
              <div className="overflow-visible">
                <PersonSearchAutocomplete
                  onSelect={(result) => {
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
                  excludeIds={formData.authors?.map((a) => a.id) || []}
                  placeholder="Search for a person or type name to add..."
                />
              </div>
            </CardContent>
          </Card>

          {/* Subjects */}
          <Card variant="default">
            <CardContent className="p-4 space-y-4">
              <h4 className="font-bold text-slate-900">
                Subjects
              </h4>
              <div className="flex flex-wrap gap-2">
                {formData.subjects?.map((subject) => (
                  <Badge key={subject} variant="primary">
                    {subject}
                    <button
                      type="button"
                      onClick={() => removeSubject(subject)}
                      className="ml-1 hover:text-red-500"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </Badge>
                ))}
              </div>
              <div className="overflow-visible">
                <SubjectSearchAutocomplete
                onSelect={(result) => {
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
                placeholder="Search for a subject or type name to add..."
              />
              </div>
            </CardContent>
          </Card>

          {/* Review Notes */}
          <Card variant="default">
            <CardContent className="p-4 space-y-4">
              <h4 className="font-bold text-slate-900">
                Review Notes
              </h4>
              <textarea
                value={formData.review_notes || ''}
                onChange={(e) =>
                  setFormData({ ...formData, review_notes: e.target.value })
                }
                placeholder="Add notes about this correction..."
                rows={3}
                className="px-3 py-2 w-full text-sm rounded-md border border-slate-300"
              />
              <div className="flex gap-2 items-center">
                <input
                  type="checkbox"
                  id="needsReview"
                  checked={formData.needs_review === 1}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      needs_review: e.target.checked ? 1 : 0,
                    })
                  }
                />
                <label htmlFor="needsReview" className="text-sm text-slate-700">
                  Flag for further review
                </label>
              </div>
            </CardContent>
          </Card>

          {/* PDF Link */}
          {formData.pdf_url && (
            <Card variant="slate">
              <CardContent className="flex gap-3 items-center p-4">
                <FileText className="w-5 h-5 text-slate-500" />
                <a
                  href={formData.pdf_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-primary-600 hover:underline"
                >
                  View Original PDF
                </a>
              </CardContent>
            </Card>
          )}
        </div>

        <DialogFooter>
          <DialogClose asChild>
            <Button
              variant="outline"
              disabled={saving}
            >
              Cancel
            </Button>
          </DialogClose>
          <Button
            variant="primary"
            onClick={handleSave}
            isLoading={saving}
            leftIcon={<Save className="w-4 h-4" />}
          >
            Save Changes
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
