import { FC } from 'react';

import { Button } from '@bettergov/kapwa';
import {
  AwardIcon,
  BuildingIcon,
  ExternalLinkIcon,
  GlobeIcon,
  MailIcon,
  PhoneIcon,
} from 'lucide-react';

import {
  Card,
  CardContent,
  CardHeader,
  CardImage,
} from '../components/ui/Card';

const ColorBlock = ({
  color,
  name,
  value,
}: {
  color: string;
  name: string;
  value: string;
}) => (
  <div className='flex items-center space-x-2'>
    <div className={`h-12 w-12 rounded-sm ${color}`} />
    <div>
      <div className='font-medium'>{name}</div>
      <div className='text-kapwa-text-support text-sm'>{value}</div>
    </div>
  </div>
);

const TypographyExample = ({
  className,
  label,
}: {
  className: string;
  label: string;
}) => (
  <div className='mb-4'>
    <div className={className}>The quick brown fox jumps over the lazy dog</div>
    <div className='text-kapwa-text-support mt-1 text-sm'>{label}</div>
  </div>
);

const DesignGuide: FC = () => {
  const searchResults = [
    { id: 1, title: 'National ID Registration', category: 'Citizenship' },
    { id: 2, title: 'Business Permit Application', category: 'Business' },
    { id: 3, title: 'Passport Renewal', category: 'Travel' },
  ];

  const tableData = [
    { id: 1, name: 'John Doe', email: 'john@example.com', status: 'Active' },
    { id: 2, name: 'Jane Smith', email: 'jane@example.com', status: 'Pending' },
    {
      id: 3,
      name: 'Bob Johnson',
      email: 'bob@example.com',
      status: 'Inactive',
    },
  ];

  const achievements = [
    'Led the implementation of digital transformation initiatives across government agencies',
    'Established international partnerships for economic cooperation',
    'Launched nationwide infrastructure development programs',
    'Reformed tax collection systems for improved efficiency',
  ];

  const education = [
    {
      degree: 'Bachelor of Arts in Political Science',
      institution: 'University of Oxford',
      year: '1975',
    },
    {
      degree: 'Master in Business Administration',
      institution: 'Wharton School of Business',
      year: '1979',
    },
  ];

  return (
    <div className='bg-kapwa-bg-surface-raised min-h-screen py-12'>
      <div className='container mx-auto px-4'>
        <h1 className='text-kapwa-text-strong mb-8 text-3xl font-bold'>
          Design Guidelines
        </h1>

        {/* Typography Section */}
        <Card className='mb-8'>
          <CardHeader>
            <h2 className='text-2xl font-semibold'>Typography</h2>
            <p className='text-gray-800'>
              Inter is our primary font family for clean, modern readability
            </p>
          </CardHeader>
          <CardContent>
            <TypographyExample
              className='text-4xl font-bold'
              label='Heading 1 - text-4xl font-bold'
            />
            <TypographyExample
              className='text-3xl font-semibold'
              label='Heading 2 - text-3xl font-semibold'
            />
            <TypographyExample
              className='text-2xl font-medium'
              label='Heading 3 - text-2xl font-medium'
            />
            <TypographyExample
              className='text-xl'
              label='Heading 4 - text-xl'
            />
            <TypographyExample className='text-base' label='Body - text-base' />
            <TypographyExample className='text-sm' label='Small - text-sm' />
          </CardContent>
        </Card>

        {/* Colors Section */}
        <Card className='mb-8'>
          <CardHeader>
            <h2 className='text-2xl font-semibold'>Colors</h2>
            <p className='text-gray-800'>Our color palette</p>
          </CardHeader>
          <CardContent>
            <div className='grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4'>
              <div>
                <h3 className='mb-4 font-medium'>Primary (Blue)</h3>
                <div className='space-y-4'>
                  <ColorBlock
                    color='bg-primary-500'
                    name='Primary 500'
                    value='#3b82f6'
                  />
                  <ColorBlock
                    color='bg-primary-600'
                    name='Primary 600'
                    value='#2563eb'
                  />
                  <ColorBlock
                    color='bg-primary-700'
                    name='Primary 700'
                    value='#1d4ed8'
                  />
                </div>
              </div>
              <div>
                <h3 className='mb-4 font-medium'>CivicTech (Orange)</h3>
                <div className='space-y-4'>
                  <ColorBlock
                    color='bg-orange-500'
                    name='Orange 500'
                    value='#f97316'
                  />
                  <ColorBlock
                    color='bg-orange-600'
                    name='Orange 600'
                    value='#ea580c'
                  />
                  <ColorBlock
                    color='bg-red-500'
                    name='Red 500'
                    value='#ef4444'
                  />
                </div>
              </div>
              <div>
                <h3 className='mb-4 font-medium'>Accent (Pink)</h3>
                <div className='space-y-4'>
                  <ColorBlock
                    color='bg-pink-500'
                    name='Pink 500'
                    value='#ec4899'
                  />
                  <ColorBlock
                    color='bg-pink-600'
                    name='Pink 600'
                    value='#db2777'
                  />
                  <ColorBlock
                    color='bg-purple-600'
                    name='Purple 600'
                    value='#9333ea'
                  />
                </div>
              </div>
              <div>
                <h3 className='mb-4 font-medium'>Neutral</h3>
                <div className='space-y-4'>
                  <ColorBlock
                    color='bg-gray-500'
                    name='Gray 500'
                    value='#6b7280'
                  />
                  <ColorBlock
                    color='bg-gray-700'
                    name='Gray 700'
                    value='#374151'
                  />
                  <ColorBlock
                    color='bg-gray-900'
                    name='Gray 900'
                    value='#111827'
                  />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Lists Section */}
        <Card className='mb-8'>
          <CardHeader>
            <h2 className='text-2xl font-semibold'>Lists</h2>
            <p className='text-gray-800'>
              Different list styles and search results
            </p>
          </CardHeader>
          <CardContent>
            <div className='space-y-8'>
              {/* Search Results List */}
              <div>
                <h3 className='mb-4 font-medium'>Search Results</h3>
                <div className='space-y-4'>
                  {searchResults.map(result => (
                    <div
                      key={result.id}
                      className='hover:border-kapwa-border-brand border-kapwa-border-weak bg-kapwa-bg-surface rounded-lg border p-4 transition-colors'
                    >
                      <div className='flex items-start justify-between'>
                        <div>
                          <h4 className='text-kapwa-text-strong text-lg font-medium'>
                            {result.title}
                          </h4>
                          <span className='bg-kapwa-bg-hover text-kapwa-text-support mt-2 inline-block rounded-sm px-2 py-1 text-xs font-medium'>
                            {result.category}
                          </span>
                        </div>
                        <Button variant='ghost' size='sm'>
                          View
                          <ExternalLinkIcon className='ml-2 h-4 w-4' />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Tables Section */}
        <Card className='mb-8'>
          <CardHeader>
            <h2 className='text-2xl font-semibold'>Tables</h2>
            <p className='text-gray-800'>Table styles for data presentation</p>
          </CardHeader>
          <CardContent>
            <div className='overflow-x-auto'>
              <table className='min-w-full divide-y divide-gray-200'>
                <thead className='bg-gray-50'>
                  <tr>
                    <th className='text-kapwa-text-support px-6 py-3 text-left text-xs font-medium tracking-wider uppercase'>
                      Name
                    </th>
                    <th className='text-kapwa-text-support px-6 py-3 text-left text-xs font-medium tracking-wider uppercase'>
                      Email
                    </th>
                    <th className='text-kapwa-text-support px-6 py-3 text-left text-xs font-medium tracking-wider uppercase'>
                      Status
                    </th>
                    <th className='text-kapwa-text-support px-6 py-3 text-right text-xs font-medium tracking-wider uppercase'>
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className='bg-kapwa-bg-surface divide-y divide-gray-200'>
                  {tableData.map(row => (
                    <tr key={row.id} className='hover:bg-kapwa-bg-surface-raised'>
                      <td className='px-6 py-4 whitespace-nowrap'>
                        <div className='text-kapwa-text-strong text-sm font-medium'>
                          {row.name}
                        </div>
                      </td>
                      <td className='px-6 py-4 whitespace-nowrap'>
                        <div className='text-kapwa-text-support text-sm'>
                          {row.email}
                        </div>
                      </td>
                      <td className='px-6 py-4 whitespace-nowrap'>
                        <span
                          className={`inline-flex rounded-full px-2 py-1 text-xs font-medium ${
                            row.status === 'Active'
                              ? 'bg-green-100 text-green-800'
                              : row.status === 'Pending'
                                ? 'bg-yellow-100 text-yellow-800'
                                : 'bg-red-100 text-red-800'
                          }`}
                        >
                          {row.status}
                        </span>
                      </td>
                      <td className='px-6 py-4 text-right text-sm font-medium whitespace-nowrap'>
                        <Button variant='ghost' size='sm'>
                          Edit
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>

        {/* Article Components */}
        <Card className='mb-8'>
          <CardHeader>
            <h2 className='text-2xl font-semibold'>Article Components</h2>
            <p className='text-gray-800'>Article cards and content styles</p>
          </CardHeader>
          <CardContent>
            <div className='space-y-8'>
              {/* Article Card */}
              <div>
                <h3 className='mb-4 font-medium'>Article Card</h3>
                <div className='grid grid-cols-1 gap-6 md:grid-cols-2'>
                  <Card>
                    <CardImage
                      src='https://images.pexels.com/photos/2774556/pexels-photo-2774556.jpeg'
                      alt='Article thumbnail'
                    />
                    <CardContent>
                      <span className='bg-primary-100 text-kapwa-text-brand-bold mb-2 inline-block rounded-sm px-2 py-1 text-xs font-medium'>
                        News
                      </span>
                      <h3 className='mb-2 text-xl font-semibold'>
                        Digital Government Initiatives
                      </h3>
                      <p className='text-kapwa-text-support mb-4'>
                        Latest updates on the government&apos;s digital
                        transformation projects and e-services.
                      </p>
                      <Button variant='link'>Read More</Button>
                    </CardContent>
                  </Card>

                  <Card>
                    <div className='relative'>
                      <CardImage
                        src='https://images.pexels.com/photos/1268855/pexels-photo-1268855.jpeg'
                        alt='Article with overlay'
                      />
                      <div className='absolute inset-0 flex items-end bg-linear-to-t from-black/75 to-transparent p-6'>
                        <div className='text-white'>
                          <span className='bg-kapwa-bg-surface/20 mb-2 inline-block rounded-sm px-2 py-1 text-xs font-medium'>
                            Tourism
                          </span>
                          <h3 className='mb-2 text-xl font-semibold'>
                            Exploring Philippine Islands
                          </h3>
                          <p className='text-white/80'>
                            Discover the beauty of the Philippine archipelago.
                          </p>
                        </div>
                      </div>
                    </div>
                  </Card>
                </div>
              </div>

              {/* Article Content */}
              <div>
                <h3 className='mb-4 font-medium'>Article Content</h3>
                <div className='prose max-w-none'>
                  <h1 className='mb-4 text-3xl font-bold'>Article Title</h1>
                  <p className='text-kapwa-text-support mb-6'>
                    Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed
                    do eiusmod tempor incididunt ut labore et dolore magna
                    aliqua.
                  </p>
                  <h2 className='mb-3 text-2xl font-semibold'>
                    Section Heading
                  </h2>
                  <p className='text-kapwa-text-support mb-4'>
                    Ut enim ad minim veniam, quis nostrud exercitation ullamco
                    laboris nisi ut aliquip ex ea commodo consequat.
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* CivicTech Components */}
        <Card className='mb-8'>
          <CardHeader>
            <h2 className='text-2xl font-semibold'>CivicTech Components</h2>
            <p className='text-gray-800'>
              Banner and call-to-action components for community engagement
            </p>
          </CardHeader>
          <CardContent>
            <div className='space-y-8'>
              {/* Strip Banner */}
              <div>
                <h3 className='mb-4 font-medium'>Strip Banner</h3>
                <div className='text-kapwa-text-inverse relative overflow-hidden rounded-lg bg-linear-to-r from-orange-500 via-red-500 to-pink-500 py-3'>
                  <div className='container mx-auto px-4'>
                    <div className='flex flex-col items-center justify-between gap-2 sm:flex-row'>
                      <div className='flex items-center gap-3'>
                        <span className='text-sm font-bold'>
                          🚀 Join the #CivicTech Revolution
                        </span>
                        <span className='hidden text-sm text-orange-100 md:inline'>
                          Help build the future of the Philippines and
                          governance through technology
                        </span>
                      </div>
                      <div className='flex items-center gap-3'>
                        <button className='bg-kapwa-bg-hover text-kapwa-text-support hover:bg-kapwa-bg-active rounded-full px-4 py-1.5 text-sm font-semibold'>
                          Join Now
                        </button>
                        <span className='text-xs text-orange-200 underline'>
                          Discord
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Full Banner */}
              <div>
                <h3 className='mb-4 font-medium'>Full CivicTech Banner</h3>
                <div className='text-kapwa-text-inverse relative overflow-hidden rounded-lg bg-linear-to-br from-orange-500 via-red-500 to-pink-600 py-12'>
                  <div className='container mx-auto px-4 text-center'>
                    <h2 className='mb-4 text-2xl font-bold md:text-3xl'>
                      Join the{' '}
                      <span className='text-yellow-200'>#CivicTech</span>{' '}
                      Revolution
                    </h2>
                    <p className='mx-auto mb-6 max-w-2xl text-lg text-orange-100'>
                      Help build the future of the Philippines and governance
                      through technology.
                      <strong className='text-yellow-200'>
                        {' '}
                        Volunteer-led. Open source. Community-driven.
                      </strong>
                    </p>
                    <div className='flex flex-col justify-center gap-4 sm:flex-row'>
                      <button className='bg-kapwa-bg-surface text-kapwa-text-strong hover:bg-kapwa-bg-hover rounded-lg px-6 py-3 font-bold'>
                        Join Our Movement
                      </button>
                      <button className='text-kapwa-text-inverse hover:bg-kapwa-bg-surface hover:text-kapwa-text-strong rounded-lg border-2 border-white px-6 py-3 font-semibold'>
                        Join Discord
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Updated Profile Section */}
        <Card>
          <CardHeader>
            <h2 className='text-2xl font-semibold'>Official Biography</h2>
            <p className='text-gray-800'>
              Government official profile and biography layout
            </p>
          </CardHeader>
          <CardContent>
            <div className='mx-auto max-w-4xl'>
              <div className='bg-kapwa-bg-surface overflow-hidden rounded-xl shadow-xs'>
                {/* Header Section */}
                <div className='bg-primary-700 relative h-64'>
                  <div className='absolute inset-0'>
                    <img
                      src='https://images.pexels.com/photos/1714455/pexels-photo-1714455.jpeg'
                      alt='Office'
                      className='h-full w-full object-cover opacity-20'
                    />
                  </div>
                  <div className='from-primary-900/50 to-primary-900/90 absolute inset-0 bg-linear-to-b' />
                  <div className='relative container mx-auto flex h-full items-center px-6'>
                    <div className='flex items-center space-x-8'>
                      <img
                        src='https://images.pexels.com/photos/2379005/pexels-photo-2379005.jpeg'
                        alt='Ferdinand Marcos Jr.'
                        className='h-40 w-40 rounded-full border-4 border-white object-cover shadow-xl'
                      />
                      <div className='text-white'>
                        <div className='text-primary-200 mb-1 text-sm font-medium'>
                          17th President of the Republic of the Philippines
                        </div>
                        <h1 className='mb-2 text-4xl font-bold'>
                          Ferdinand Marcos Jr.
                        </h1>
                        <p className='text-primary-100'>
                          Serving since June 30, 2022
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Content Section */}
                <div className='container mx-auto px-6 py-8'>
                  <div className='grid grid-cols-1 gap-8 lg:grid-cols-3'>
                    {/* Left Column - Contact & Basic Info */}
                    <div className='space-y-6'>
                      <div className='bg-kapwa-bg-surface-raised rounded-lg p-6'>
                        <h3 className='mb-4 text-lg font-semibold'>
                          Contact Information
                        </h3>
                        <div className='space-y-4'>
                          <div className='text-kapwa-text-support flex items-center'>
                            <BuildingIcon className='text-primary-600 mr-3 h-5 w-5' />
                            <div>
                              <div className='font-medium'>Office</div>
                              <div className='text-sm'>
                                Malacañang Palace, Manila
                              </div>
                            </div>
                          </div>
                          <div className='text-kapwa-text-support flex items-center'>
                            <PhoneIcon className='text-primary-600 mr-3 h-5 w-5' />
                            <div>
                              <div className='font-medium'>Phone</div>
                              <div className='text-sm'>+63 (2) 8736 8645</div>
                            </div>
                          </div>
                          <div className='text-kapwa-text-support flex items-center'>
                            <MailIcon className='text-primary-600 mr-3 h-5 w-5' />
                            <div>
                              <div className='font-medium'>Email</div>
                              <div className='text-sm'>op@president.gov.ph</div>
                            </div>
                          </div>
                          <div className='text-kapwa-text-support flex items-center'>
                            <GlobeIcon className='text-primary-600 mr-3 h-5 w-5' />
                            <div>
                              <div className='font-medium'>Website</div>
                              <div className='text-sm'>
                                www.president.gov.ph
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className='bg-kapwa-bg-surface-raised rounded-lg p-6'>
                        <h3 className='mb-4 text-lg font-semibold'>
                          Education
                        </h3>
                        <div className='space-y-4'>
                          {education.map((edu, index) => (
                            <div
                              key={index}
                              className='border-primary-500 border-l-2 pl-4'
                            >
                              <div className='font-medium'>{edu.degree}</div>
                              <div className='text-kapwa-text-support text-sm'>
                                {edu.institution}
                              </div>
                              <div className='text-kapwa-text-support text-sm'>
                                {edu.year}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>

                    {/* Right Column - Bio & Achievements */}
                    <div className='space-y-6 lg:col-span-2'>
                      <div>
                        <h3 className='mb-4 text-xl font-semibold'>
                          Biography
                        </h3>
                        <div className='prose max-w-none'>
                          <p className='text-kapwa-text-support leading-relaxed'>
                            Ferdinand &ldquo;Bongbong&rdquo; Romualdez Marcos
                            Jr. serves as the 17th President of the Philippines,
                            assuming office on June 30, 2022. As the
                            country&apos;s chief executive, he leads the
                            implementation of laws and policies aimed at
                            national development and public welfare.
                          </p>
                          <p className='text-kapwa-text-support mt-4 leading-relaxed'>
                            Prior to his presidency, he served in various
                            government positions including as a Senator of the
                            Philippines from 2010 to 2016, and as Governor of
                            Ilocos Norte. His administration focuses on economic
                            recovery, infrastructure development, and digital
                            transformation of government services.
                          </p>
                        </div>
                      </div>

                      <div>
                        <h3 className='mb-4 text-xl font-semibold'>
                          Key Achievements
                        </h3>
                        <div className='grid gap-4'>
                          {achievements.map((achievement, index) => (
                            <div key={index} className='flex items-start'>
                              <AwardIcon className='text-primary-600 mt-1 mr-3 h-5 w-5 flex-shrink-0' />
                              <p className='text-gray-800'>{achievement}</p>
                            </div>
                          ))}
                        </div>
                      </div>

                      <div className='mt-8 flex space-x-4'>
                        <Button className='bg-primary-600 hover:bg-kapwa-bg-brand-hover text-kapwa-text-inverse'>
                          <MailIcon className='mr-2 h-4 w-4' />
                          Contact Office
                        </Button>
                        <Button
                          variant='outline'
                          className='text-kapwa-text-support hover:bg-kapwa-bg-surface-raised border-gray-300'
                        >
                          <GlobeIcon className='mr-2 h-4 w-4' />
                          Visit Website
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default DesignGuide;
