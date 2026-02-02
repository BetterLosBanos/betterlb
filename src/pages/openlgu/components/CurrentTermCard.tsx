import { Link } from 'react-router-dom';
import { BookOpen, Calendar, ChevronRight, FileText, ScrollText } from 'lucide-react';
import { Badge } from '@/components/ui/Badge';
import { Card, CardContent } from '@/components/ui/Card';
import type { DocumentItem, Term } from '@/lib/openlgu';

interface CurrentTermCardProps {
  term: Term | null;
  documents: DocumentItem[];
}

export default function CurrentTermCard({ term, documents }: CurrentTermCardProps) {
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
  const eoCount = termDocuments.filter(d => d.type === 'executive_order').length;

  return (
    <Link to={`/openlgu/term/${term.id}`} className='block group'>
      <Card variant='default' hover={true}>
        <CardContent className='p-5'>
          <div className='flex justify-between items-center mb-4'>
            <Badge variant='primary' dot>{term.ordinal} Term</Badge>
            <ChevronRight className='w-5 h-5 transition-colors text-slate-300 group-hover:text-primary-600' />
                    </div>
          <h3 className='mb-1 text-lg font-extrabold text-slate-900'>{term.name}</h3>
          <p className='flex gap-2 items-center mb-4 text-xs font-medium text-slate-500'>
            <Calendar className='h-3.5 w-3.5' />
            {term.year_range}
          </p>
          <div className='grid grid-cols-3 gap-3'>
            <div className='flex flex-col gap-1 items-center p-3 rounded-xl border bg-primary-50 border-primary-100'>
              <FileText className='w-5 h-5 text-primary-600' />
              <span className='text-lg font-black text-primary-700'>{ordCount}</span>
              <span className='text-primary-500 text-[9px] font-bold tracking-wider uppercase'>
                Ordinances
              </span>
                    </div>
            <div className='flex flex-col gap-1 items-center p-3 rounded-xl border bg-secondary-50 border-secondary-100'>
              <BookOpen className='w-5 h-5 text-secondary-600' />
              <span className='text-lg font-black text-secondary-700'>{resCount}</span>
              <span className='text-secondary-500 text-[9px] font-bold tracking-wider uppercase'>
                Resolutions
              </span>
            </div>
            <div className='flex flex-col gap-1 items-center p-3 bg-purple-50 rounded-xl border border-purple-100'>
              <ScrollText className='w-5 h-5 text-purple-600' />
              <span className='text-lg font-black text-purple-700'>{eoCount}</span>
              <span className='text-purple-500 text-[9px] font-bold tracking-wider uppercase'>
                Exec. Orders
              </span>
            </div>
                  </div>
                </CardContent>
              </Card>
            </Link>
          );
}