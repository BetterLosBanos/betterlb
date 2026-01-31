import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/Dialog';
import { Card, CardContent } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import Button from '@/components/ui/Button';
import { X, Save, FileText, User, Calendar } from 'lucide-react';

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
  moved_by: string | null;
  seconded_by: string | null;
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
  const [newAuthor, setNewAuthor] = useState('');
  const [newSubject, setNewSubject] = useState('');

  useEffect(() => {
    if (open && documentId) {
      fetchDocument();
    }
  }, [open, documentId]);

  const fetchDocument = async () => {
    setLoading(true);
    try {
      const response = await fetch(`/api/legislation/documents/${documentId}`);
      if (!response.ok) throw new Error('Failed to fetch document');
      const data: DocumentData = await response.json();
      setDocument(data);
      setFormData(data);
    } catch (error) {
      console.error('Error fetching document:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await onSave(formData);
      onClose();
    } catch (error) {
      console.error('Error saving document:', error);
    } finally {
      setSaving(false);
    }
  };

  const addAuthor = () => {
    if (newAuthor && formData.authors) {
      const person: Person = {
        id: `temp_${Date.now()}`,
        first_name: newAuthor.split(' ')[0] || newAuthor,
        middle_name: null,
        last_name: newAuthor.split(' ').slice(1).join(' ') || '',
      };
      setFormData({
        ...formData,
        authors: [...formData.authors, person],
      });
      setNewAuthor('');
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

  const addSubject = () => {
    if (newSubject && formData.subjects) {
      setFormData({
        ...formData,
        subjects: [...formData.subjects, newSubject],
      });
      setNewSubject('');
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
          <div className="flex items-center justify-center py-12">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-slate-300 border-t-primary-500" />
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={open}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-start justify-between">
            <div>
              <DialogTitle>Edit Document</DialogTitle>
              <div className="mt-2 flex items-center gap-2">
                <Badge variant={document.type === 'ordinance' ? 'primary' : 'secondary'}>
                  {document.type}
                </Badge>
                <span className="font-mono text-sm text-slate-600">
                  {document.number}
                </span>
              </div>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Basic Info */}
          <Card variant="default">
            <CardContent className="space-y-4 p-4">
              <div>
                <label className="mb-1 block text-sm font-medium text-slate-700">
                  Title
                </label>
                <input
                  type="text"
                  value={formData.title || ''}
                  onChange={(e) =>
                    setFormData({ ...formData, title: e.target.value })
                  }
                  className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
                />
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="mb-1 block text-sm font-medium text-slate-700">
                    Document Number
                  </label>
                  <input
                    type="text"
                    value={formData.number || ''}
                    onChange={(e) =>
                      setFormData({ ...formData, number: e.target.value })
                    }
                    className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-sm font-medium text-slate-700">
                    Date Enacted
                  </label>
                  <input
                    type="date"
                    value={formData.date_enacted?.split('T')[0] || ''}
                    onChange={(e) =>
                      setFormData({ ...formData, date_enacted: e.target.value })
                    }
                    className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
                  />
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="mb-1 block text-sm font-medium text-slate-700">
                    Status
                  </label>
                  <select
                    value={formData.status || ''}
                    onChange={(e) =>
                      setFormData({ ...formData, status: e.target.value })
                    }
                    className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
                  >
                    <option value="Approved">Approved</option>
                    <option value="Pending">Pending</option>
                    <option value="Withdrawn">Withdrawn</option>
                    <option value="Vetoed">Vetoed</option>
                  </select>
                </div>
                <div>
                  <label className="mb-1 block text-sm font-medium text-slate-700">
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
                    className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
                  >
                    <option value="ordinance">Ordinance</option>
                    <option value="resolution">Resolution</option>
                    <option value="executive_order">Executive Order</option>
                  </select>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Facebook Fields */}
          <Card variant="default">
            <CardContent className="space-y-4 p-4">
              <h4 className="font-bold text-slate-900">
                Facebook Source Fields
              </h4>
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="mb-1 block text-sm font-medium text-slate-700">
                    Moved By
                  </label>
                  <input
                    type="text"
                    value={formData.moved_by || ''}
                    onChange={(e) =>
                      setFormData({ ...formData, moved_by: e.target.value })
                    }
                    className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-sm font-medium text-slate-700">
                    Seconded By
                  </label>
                  <input
                    type="text"
                    value={formData.seconded_by || ''}
                    onChange={(e) =>
                      setFormData({ ...formData, seconded_by: e.target.value })
                    }
                    className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Authors */}
          <Card variant="default">
            <CardContent className="space-y-4 p-4">
              <h4 className="font-bold text-slate-900">
                Authors
              </h4>
              <div className="flex flex-wrap gap-2">
                {formData.authors?.map((author) => (
                  <Badge key={author.id} variant="slate">
                    <User className="mr-1 h-3 w-3" />
                    {author.first_name} {author.last_name}
                    <button
                      type="button"
                      onClick={() => removeAuthor(author.id)}
                      className="ml-1 hover:text-red-500"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </Badge>
                ))}
              </div>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={newAuthor}
                  onChange={(e) => setNewAuthor(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && addAuthor()}
                  placeholder="Add author (e.g., Juan Dela Cruz)"
                  className="flex-1 rounded-md border border-slate-300 px-3 py-2 text-sm"
                />
                <Button
                  variant="outline"
                  size="sm"
                  onClick={addAuthor}
                >
                  Add
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Subjects */}
          <Card variant="default">
            <CardContent className="space-y-4 p-4">
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
                      <X className="h-3 w-3" />
                    </button>
                  </Badge>
                ))}
              </div>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={newSubject}
                  onChange={(e) => setNewSubject(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && addSubject()}
                  placeholder="Add subject"
                  className="flex-1 rounded-md border border-slate-300 px-3 py-2 text-sm"
                />
                <Button
                  variant="outline"
                  size="sm"
                  onClick={addSubject}
                >
                  Add
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Review Notes */}
          <Card variant="default">
            <CardContent className="space-y-4 p-4">
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
                className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
              />
              <div className="flex items-center gap-2">
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
              <CardContent className="flex items-center gap-3 p-4">
                <FileText className="h-5 w-5 text-slate-500" />
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
          <Button
            variant="outline"
            onClick={onClose}
            disabled={saving}
          >
            Cancel
          </Button>
          <Button
            variant="primary"
            onClick={handleSave}
            isLoading={saving}
            leftIcon={<Save className="h-4 w-4" />}
          >
            Save Changes
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
