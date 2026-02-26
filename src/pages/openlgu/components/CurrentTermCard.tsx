import { Link } from 'react-router-dom';

import {
  BookOpen,
  Calendar,
  ChevronRight,
  FileText,
  ScrollText,
} from 'lucide-react';

import { Badge } from '@/components/ui/Badge';
import { Card, CardContent } from '@/components/ui/Card';

import type { DocumentItem, Term } from '@/lib/openlgu';

interface CurrentTermCardProps {
  term: Term | null;
  documents: DocumentItem[];
}

export default function CurrentTermCard({
  term,
  documents,
}: CurrentTermCardProps) {
  if (!term) {
    return null;
  }

  // Calculate statistics for the current term
  const termDocuments = documents.filter(doc => {
    if (!doc.session_id) return false;
    return doc.session_id.startsWith(term.id) || doc.term_id === term.id;
  });

  const ordCount = termDocuments.filter(d => d.type === 'ordinance').length;
  const resCount = termDocuments.filter(d => d.type === 'resolution').length;
  const eoCount = termDocuments.filter(
    d => d.type === 'executive_order'
  ).length;

  return (
    <Link to={`/openlgu/term/${term.id}`} className='group block'>
      <Card variant='default' hover={true}>
        <CardContent className='p-5'>
          <div className='mb-4 flex items-center justify-between'>
            <Badge variant='primary' dot>
              {term.ordinal} Term
            </Badge>
            <ChevronRight className='group-hover:text-kapwa-text-brand text-kapwa-text-support h-5 w-5 transition-colors' />
          </div>
          <h3 className='text-kapwa-text-strong mb-1 text-lg font-extrabold'>
            {term.name}
          </h3>
          <p className='text-kapwa-text-disabled mb-4 flex items-center gap-2 text-xs font-medium'>
            <Calendar className='h-3.5 w-3.5' />
            {term.year_range}
          </p>
          <div className='flex flex-col gap-2'>
            <div className='border-kapwa-brand-600 bg-kapwa-brand-50 flex items-center gap-3 rounded-lg border p-3'>
              <FileText className='text-kapwa-brand-700 h-5 w-5 shrink-0' />
              <div className='flex-1'>
                <span className='text-kapwa-brand-700 text-lg font-black'>
                  {ordCount}
                </span>
                <span className='text-kapwa-brand-700 ml-2 text-xs font-bold uppercase'>
                  Ordinances
                </span>
              </div>
            </div>
            <div className='border-kapwa-border-accent-orange bg-kapwa-bg-accent-orange-weak flex items-center gap-3 rounded-lg border p-3'>
              <BookOpen className='text-kapwa-text-accent-orange h-5 w-5 shrink-0' />
              <div className='flex-1'>
                <span className='text-kapwa-text-accent-orange text-lg font-black'>
                  {resCount}
                </span>
                <span className='text-kapwa-text-accent-orange ml-2 text-xs font-bold uppercase'>
                  Resolutions
                </span>
              </div>
            </div>
            <div className='border-kapwa-border-warning bg-kapwa-bg-warning-weak flex items-center gap-3 rounded-lg border p-3'>
              <ScrollText className='text-kapwa-text-warning h-5 w-5 shrink-0' />
              <div className='flex-1'>
                <span className='text-kapwa-text-warning text-lg font-black'>
                  {eoCount}
                </span>
                <span className='text-kapwa-text-warning ml-2 text-xs font-bold uppercase'>
                  Exec. Orders
                </span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
