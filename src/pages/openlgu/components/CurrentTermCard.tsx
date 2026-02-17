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
          <div className='grid grid-cols-3 gap-3'>
            <div className='bg-kapwa-bg-surface border-kapwa-border-brand flex flex-col items-center gap-1 rounded-xl border p-3'>
              <FileText className='text-kapwa-text-brand h-5 w-5' />
              <span className='text-kapwa-text-brand-bold text-lg font-black'>
                {ordCount}
              </span>
              <span className='text-kapwa-text-brand text-[9px] font-bold tracking-wider uppercase'>
                Ordinances
              </span>
            </div>
            <div className='bg-kapwa-bg-accent-orange-weak border-kapwa-border-weak flex flex-col items-center gap-1 rounded-xl border p-3'>
              <BookOpen className='text-kapwa-text-accent-orange h-5 w-5' />
              <span className='text-kapwa-text-accent-orange text-lg font-black'>
                {resCount}
              </span>
              <span className='text-kapwa-text-accent-orange text-[9px] font-bold tracking-wider uppercase'>
                Resolutions
              </span>
            </div>
            <div className='flex flex-col items-center gap-1 rounded-xl border border-purple-100 bg-kapwa-bg-accent-purple-weak p-3'>
              <ScrollText className='text-kapwa-text-accent-purple h-5 w-5' />
              <span className='text-kapwa-text-accent-purple text-lg font-black'>
                {eoCount}
              </span>
              <span className='text-[9px] font-bold tracking-wider text-kapwa-text-accent-purple uppercase'>
                Exec. Orders
              </span>
            </div>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
