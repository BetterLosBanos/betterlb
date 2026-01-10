import { Link } from 'react-router-dom';
import executiveData from '../../../data/directory/executive.json';
import {
  Card,
  CardContent,
  CardAvatar,
  CardTitle,
  CardDescription,
} from '../../../components/ui/CardList';

export default function ExecutiveIndex() {
  // Filter only Mayor and Vice Mayor
  const topOfficials = executiveData.filter(
    office =>
      office.slug === 'office-of-the-mayor' ||
      office.slug === 'office-of-the-vice-mayor'
  );

  return (
    <div className='space-y-8 @container'>
      <div>
        <h1 className='text-3xl font-bold text-gray-900 mb-2'>
          Executive Officials
        </h1>
        <p className='text-gray-800 max-w-3xl'></p>
      </div>

      <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
        {topOfficials.map(office => (
          <Link key={office.slug} to={`/government/executive/${office.slug}`}>
            <Card
              variant='featured'
              className='cursor-pointer hover:bg-primary-500/10'
            >
              <CardContent>
                <div className='flex flex-col items-center text-center'>
                  <CardAvatar
                    name={office.officials[0].name}
                    size='lg'
                    className='mb-4'
                  />
                  <CardTitle level='h2' className='text-xl'>
                    {office.officials[0].name}
                  </CardTitle>
                  <CardDescription className='text-primary-600 font-medium text-base'>
                    {office.officials[0].role}
                  </CardDescription>
                </div>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}
