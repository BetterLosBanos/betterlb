import { useMemo, useState } from 'react';

import { Link } from 'react-router-dom';

import { Crown, Shield, User } from 'lucide-react';

import { PageLoadingState } from '@/components/ui';
import { Badge } from '@/components/ui/Badge';
import { Card, CardContent } from '@/components/ui/Card';

import { getPersonName } from '@/lib/openlgu';
import type { Person, Term } from '@/lib/openlgu';
import { isExecutiveRole, isLegislativeRole } from '@/lib/roleHelpers';

interface OfficialsTeaserProps {
  persons: Person[];
  term: Term | null;
  isLoading?: boolean;
}

export default function OfficialsTeaser({
  persons,
  term,
  isLoading,
}: OfficialsTeaserProps) {
  // Session-based seed for stable randomness during navigation
  const [sessionSeed] = useState(() => Math.random());

  // Get mayor
  const mayor = useMemo(() => {
    if (!term?.id || !Array.isArray(persons) || persons.length === 0)
      return null;
    return (
      persons.find(p =>
        p?.memberships?.some(
          m =>
            m?.term_id === term.id &&
            isExecutiveRole(m?.chamber) &&
            m?.role?.toLowerCase().includes('mayor') &&
            !m?.role?.toLowerCase().includes('vice')
        )
      ) ?? null
    );
  }, [persons, term]);

  // Get vice mayor
  const viceMayor = useMemo(() => {
    if (!term?.id || !Array.isArray(persons) || persons.length === 0)
      return null;
    return (
      persons.find(p =>
        p?.memberships?.some(
          m => m?.term_id === term.id && m?.role?.includes('Vice Mayor')
        )
      ) ?? null
    );
  }, [persons, term]);

  // Pick 2 random councilors (stable per session, changes per reload)
  const randomCouncilors = useMemo(() => {
    if (!term?.id || !Array.isArray(persons) || persons.length === 0) return [];

    const currentCouncilors = persons.filter(p =>
      p?.memberships?.some(
        m =>
          m?.term_id === term.id &&
          isLegislativeRole(m?.chamber) &&
          !m?.role?.includes('Vice Mayor')
      )
    );

    if (currentCouncilors.length <= 2) return currentCouncilors;

    // Combine term.id with session seed for session-stable randomness
    const shuffled = [...currentCouncilors];
    let seed =
      term.id.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0) +
      sessionSeed * 10000;

    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(seed % (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
      seed = Math.floor(seed * 1.1 + 1);
    }

    return shuffled.slice(0, 2);
  }, [persons, term, sessionSeed]);

  // Combine: mayor, vice mayor, then 2 random councilors, max 4 cards
  const featuredPersons = useMemo(() => {
    const featured = [];
    if (mayor) featured.push(mayor);
    if (viceMayor) featured.push(viceMayor);
    featured.push(...randomCouncilors);
    return featured.slice(0, 4);
  }, [mayor, viceMayor, randomCouncilors]);

  // Show loading state while data is being fetched
  if (isLoading) {
    return <PageLoadingState message='Loading officials...' />;
  }

  // Early return if data is not available
  if (!term || !Array.isArray(persons) || persons.length === 0) {
    return null;
  }

  // Early return if no featured persons
  if (featuredPersons.length === 0) {
    return null;
  }

  const getRoleBadge = (person: Person) => {
    if (!term?.id) return null;
    const membership = person?.memberships?.find(m => m?.term_id === term.id);
    if (!membership) return null;

    const role = membership.role?.toLowerCase() ?? '';
    if (role.includes('mayor') && !role.includes('vice')) {
      return (
        <Badge variant='warning' dot>
          Mayor
        </Badge>
      );
    }
    if (role.includes('vice mayor')) {
      return (
        <Badge variant='secondary' dot>
          Vice Mayor
        </Badge>
      );
    }
    return <Badge variant='slate'>{membership.role}</Badge>;
  };

  const getRoleIcon = (person: Person) => {
    if (!term?.id) return User;
    const membership = person?.memberships?.find(m => m?.term_id === term.id);
    if (!membership) return User;

    const role = membership.role?.toLowerCase() ?? '';
    if (role.includes('mayor') && !role.includes('vice')) return Crown;
    if (role.includes('vice mayor')) return Shield;
    return User;
  };

  return (
    <div className='space-y-4'>
      <div className='flex items-center justify-between'>
        <h2 className='text-sm font-bold tracking-widest text-slate-400 uppercase'>
          Officials
        </h2>
        <Link
          to='/openlgu/officials'
          className='text-primary-600 hover:text-primary-700 text-xs font-bold'
        >
          View all →
        </Link>
      </div>
      <div className='grid grid-cols-2 gap-3'>
        {featuredPersons.map(person => {
          const RoleIcon = getRoleIcon(person);
          const initials = `${person?.first_name?.[0] ?? ''}${person?.last_name?.[0] ?? ''}`;

          return (
            <Link
              key={person.id}
              to={`/openlgu/person/${person.id}`}
              className='group'
            >
              <Card variant='slate' hover={true} className='h-full'>
                <CardContent className='p-4'>
                  <div className='flex items-start gap-3'>
                    <div className='from-primary-500 to-primary-600 flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-linear-to-br text-sm font-bold text-white shadow-sm'>
                      {initials}
                    </div>
                    <div className='min-w-0 flex-1'>
                      <div className='mb-1'>{getRoleBadge(person)}</div>
                      <p className='group-hover:text-primary-600 truncate text-sm font-bold text-slate-900 transition-colors'>
                        {getPersonName(person)}
                      </p>
                    </div>
                    <RoleIcon
                      className='group-hover:text-primary-600 h-4 w-4 shrink-0 text-slate-300 transition-colors'
                      aria-hidden='true'
                    />
                  </div>
                </CardContent>
              </Card>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
