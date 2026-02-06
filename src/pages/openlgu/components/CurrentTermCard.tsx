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
            <ChevronRight className='group-hover:text-primary-600 h-5 w-5 text-slate-300 transition-colors' />
          </div>
          <h3 className='mb-1 text-lg font-extrabold text-slate-900'>
            {term.name}
          </h3>
          <p className='mb-4 flex items-center gap-2 text-xs font-medium text-slate-500'>
            <Calendar className='h-3.5 w-3.5' />
            {term.year_range}
          </p>
          <div className='grid grid-cols-3 gap-3'>
            <div className='bg-primary-50 border-primary-100 flex flex-col items-center gap-1 rounded-xl border p-3'>
              <FileText className='text-primary-600 h-5 w-5' />
              <span className='text-primary-700 text-lg font-black'>
                {ordCount}
              </span>
              <span className='text-primary-500 text-[9px] font-bold tracking-wider uppercase'>
                Ordinances
              </span>
            </div>
            <div className='bg-secondary-50 border-secondary-100 flex flex-col items-center gap-1 rounded-xl border p-3'>
              <BookOpen className='text-secondary-600 h-5 w-5' />
              <span className='text-secondary-700 text-lg font-black'>
                {resCount}
              </span>
              <span className='text-secondary-500 text-[9px] font-bold tracking-wider uppercase'>
                Resolutions
              </span>
            </div>
            <div className='flex flex-col items-center gap-1 rounded-xl border border-purple-100 bg-purple-50 p-3'>
              <ScrollText className='h-5 w-5 text-purple-600' />
              <span className='text-lg font-black text-purple-700'>
                {eoCount}
              </span>
              <span className='text-[9px] font-bold tracking-wider text-purple-500 uppercase'>
                Exec. Orders
              </span>
            </div>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
