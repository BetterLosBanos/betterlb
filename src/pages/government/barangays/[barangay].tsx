import {
  ExternalLinkIcon,
  MapPinIcon,
  PhoneIcon,
  MailIcon,
} from 'lucide-react';
import { useParams } from 'react-router-dom';
import barangaysData from '../../../data/directory/barangays.json';
import {
  Card,
  CardAvatar,
  CardContactInfo,
  CardContent,
  CardDescription,
  // CardDivider,
  CardGrid,
  CardList,
  CardTitle,
} from '../../../components/ui/CardList';

interface Official {
  role: string;
  name: string;
  contact?: string;
}

interface Barangay {
  barangay_name: string;
  address?: string;
  trunkline?: string[];
  website?: string;
  email?: string;
  officials?: Official[];
  [key: string]: unknown;
}

export default function BarangayDetail() {
  const { barangay: barangaySlug } = useParams<{ barangay: string }>();
  const barangay = (barangaysData as Barangay[]).find(
    b => b.slug === decodeURIComponent(barangaySlug || '')
  );

  if (!barangay) {
    return (
      <div className='bg-white rounded-lg border p-8 text-center h-full flex flex-col items-center justify-center'>
        <h2 className='text-2xl font-semibold mb-4'>Barangay not found</h2>
        <p className='text-gray-800'>
          Please select a barangay from the sidebar.
        </p>
      </div>
    );
  }

  const {
    barangay_name,
    address,
    trunkline,
    website,
    email,
    officials = [],
  } = barangay;

  // Separate officials by role
  const punongBarangay = officials.find(o =>
    o.role.includes('Punong Barangay')
  );
  const barangaySecretary = officials.find(o =>
    o.role.includes('Barangay Secretary')
  );
  const sbMembers = officials.filter(o => o.role.includes('SB Member'));
  const skChair = officials.find(o => o.role.includes('SK Chair'));
  const skSecretary = officials.find(o => o.role.includes('SK Secretary'));
  const skMembers = officials.filter(o => o.role.includes('SK Member'));

  return (
    <div className='@container space-y-6'>
      {/* Barangay Header */}
      <div className='border-b pb-4'>
        <h1 className='text-2xl font-bold text-gray-900'>{barangay_name}</h1>
        {address && (
          <p className='mt-1 text-gray-800 flex items-start text-sm'>
            <MapPinIcon className='h-4 w-4 text-gray-400 mr-2 mt-0.5 flex-shrink-0' />
            {address}
          </p>
        )}
        {website && (
          <a
            href={website.startsWith('http') ? website : `https://${website}`}
            target='_blank'
            rel='noopener noreferrer'
            className='inline-flex items-center text-primary-600 hover:text-primary-800 text-sm'
          >
            <ExternalLinkIcon className='h-4 w-4 mr-1' />
            {website}
          </a>
        )}
        {trunkline && (
          <div className='flex items-center text-gray-800 text-sm'>
            <PhoneIcon className='h-4 w-4 text-gray-800 mr-1 flex-shrink-0' />
            {trunkline}
          </div>
        )}
        {email && (
          <a
            href={`mailto:${email}`}
            className='flex items-center text-gray-800 hover:text-primary-600 text-sm'
          >
            <MailIcon className='h-4 w-4 text-gray-800 mr-1 flex-shrink-0' />
            {email}
          </a>
        )}
      </div>

      {/* Officials */}
      <CardList>
        {/* Punong Barangay + Secretary */}
        {(punongBarangay || barangaySecretary) && (
          <Card variant='featured'>
            <CardContent className='flex flex-col items-center text-center space-y-4'>
              {punongBarangay && (
                <>
                  <CardAvatar name={punongBarangay.name} size='lg' />
                  <CardTitle>{punongBarangay.name}</CardTitle>
                  <CardDescription className='text-primary-600 font-medium'>
                    {punongBarangay.role}
                  </CardDescription>
                </>
              )}
              {barangaySecretary && (
                <>
                  <CardAvatar name={barangaySecretary.name} size='md' />
                  <CardTitle>{barangaySecretary.name}</CardTitle>
                  <CardDescription className='text-gray-600 font-medium'>
                    {barangaySecretary.role}
                  </CardDescription>
                </>
              )}
            </CardContent>
          </Card>
        )}

        {/* SB Members */}
        {sbMembers.length > 0 && (
          <CardGrid columns={1} className='@lg:grid-cols-2 @3xl:grid-cols-3'>
            {sbMembers.map(member => (
              <Card key={member.name}>
                <CardContent className='flex flex-col items-center text-center space-y-2'>
                  <CardAvatar name={member.name} />
                  <CardTitle>{member.name}</CardTitle>
                  <CardDescription>{member.role}</CardDescription>
                  {member.contact && (
                    <CardContactInfo
                      contact={{ phone: member.contact }}
                      compact
                    />
                  )}
                </CardContent>
              </Card>
            ))}
          </CardGrid>
        )}

        {/* SK Chair + SK Secretary */}
        {(skChair || skSecretary) && (
          <Card variant='featured'>
            <CardContent className='flex flex-col items-center text-center space-y-4'>
              {skChair && (
                <>
                  <CardAvatar name={skChair.name} size='lg' />
                  <CardTitle>{skChair.name}</CardTitle>
                  <CardDescription className='text-primary-600 font-medium'>
                    {skChair.role}
                  </CardDescription>
                </>
              )}
              {skSecretary && (
                <>
                  <CardAvatar name={skSecretary.name} size='md' />
                  <CardTitle>{skSecretary.name}</CardTitle>
                  <CardDescription className='text-gray-600 font-medium'>
                    {skSecretary.role}
                  </CardDescription>
                </>
              )}
            </CardContent>
          </Card>
        )}

        {/* SK Members */}
        {skMembers.length > 0 && (
          <CardGrid columns={1} className='@lg:grid-cols-2 @3xl:grid-cols-3'>
            {skMembers.map(member => (
              <Card key={member.name}>
                <CardContent className='flex flex-col items-center text-center space-y-2'>
                  <CardAvatar name={member.name} />
                  <CardTitle>{member.name}</CardTitle>
                  <CardDescription>{member.role}</CardDescription>
                  {member.contact && (
                    <CardContactInfo
                      contact={{ phone: member.contact }}
                      compact
                    />
                  )}
                </CardContent>
              </Card>
            ))}
          </CardGrid>
        )}
      </CardList>
    </div>
  );
}
