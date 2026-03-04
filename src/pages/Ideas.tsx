import { FC, ReactNode, useState } from 'react';

import { useNavigate } from 'react-router-dom';

import { Button } from '@bettergov/kapwa/button';
import {
  GithubIcon,
  LightbulbIcon,
  PlusIcon,
  StarIcon,
  TrendingUpIcon,
  UsersIcon,
} from 'lucide-react';
import { Helmet } from 'react-helmet-async';

import { Card, CardContent } from '../components/ui/Card';

interface ProjectIdea {
  id: string;
  title: string;
  description: string;
  category: string;
  icon: ReactNode;
  priority: 'high' | 'medium' | 'low';
  complexity: 'simple' | 'moderate' | 'complex';
  upvotes: number;
  downvotes: number;
}

const initialProjectIdeas: ProjectIdea[] = [
  {
    id: '1',
    title: 'Blockchain powered community government project reporting app',
    description:
      'A transparent, immutable platform where citizens can report and track government projects in their communities. Uses blockchain technology to ensure data integrity and prevent tampering with project reports and progress updates.',
    category: 'Transparency & Accountability',
    icon: <TrendingUpIcon className='h-6 w-6' />,
    priority: 'high',
    complexity: 'complex',
    upvotes: 42,
    downvotes: 3,
  },
  {
    id: '2',
    title: 'Glassdoor for government agencies',
    description:
      'An anonymous review platform where government employees and citizens can rate and review government agencies, departments, and services. Provides insights into workplace culture, service quality, and areas for improvement.',
    category: 'Public Feedback',
    icon: <StarIcon className='h-6 w-6' />,
    priority: 'high',
    complexity: 'moderate',
    upvotes: 38,
    downvotes: 7,
  },
  {
    id: '3',
    title: 'Design guidelines for Bettergov.ph',
    description:
      'Comprehensive design system and guidelines for the BetterGov.ph platform. Includes UI components, color schemes, typography, accessibility standards, and best practices for government web services.',
    category: 'Platform Development',
    icon: <LightbulbIcon className='h-6 w-6' />,
    priority: 'medium',
    complexity: 'simple',
    upvotes: 25,
    downvotes: 2,
  },
  {
    id: '4',
    title: 'Rate the politicians',
    description:
      'A citizen-driven platform to rate and review elected officials based on their performance, campaign promises, voting records, and public service delivery. Includes fact-checking and transparency features.',
    category: 'Political Accountability',
    icon: <UsersIcon className='h-6 w-6' />,
    priority: 'high',
    complexity: 'moderate',
    upvotes: 56,
    downvotes: 12,
  },
];

const getPriorityColor = (priority: string) => {
  switch (priority) {
    case 'high':
      return 'bg-kapwa-bg-danger-weak text-kapwa-text-danger';
    case 'medium':
      return 'bg-kapwa-bg-warning-weak text-kapwa-text-warning';
    case 'low':
      return 'bg-kapwa-bg-success-weak text-kapwa-text-success';
    default:
      return 'bg-kapwa-bg-surface-raised text-kapwa-text-strong';
  }
};

const getComplexityColor = (complexity: string) => {
  switch (complexity) {
    case 'simple':
      return 'bg-kapwa-bg-info-weak text-kapwa-text-info';
    case 'moderate':
      return 'bg-kapwa-bg-accent-purple-weak text-kapwa-text-accent-purple';
    case 'complex':
      return 'bg-kapwa-bg-accent-orange-weak text-kapwa-text-accent-orange';
    default:
      return 'bg-kapwa-bg-surface-raised text-kapwa-text-strong';
  }
};

const Ideas: FC = () => {
  const [projectIdeas] = useState<ProjectIdea[]>(initialProjectIdeas);
  const navigate = useNavigate();

  const handleSubmitIdea = () => {
    const githubUrl =
      'https://github.com/bettergovph/bettergov/issues/new?assignees=&labels=enhancement%2Cidea&projects=&template=idea-submission.md&title=%5BIDEA%5D+';
    window.open(githubUrl, '_blank');
  };

  const handleSubmitPR = () => {
    const githubUrl = 'https://github.com/bettergovph/bettergov/contribute';
    window.open(githubUrl, '_blank');
  };
  return (
    <div className='bg-kapwa-bg-surface-raised min-h-screen'>
      <Helmet>
        <title>Project Ideas | BetterGov.ph</title>
        <meta
          name='description'
          content='Explore innovative project ideas to improve government transparency, accountability, and citizen engagement in the Philippines.'
        />
        <meta
          name='keywords'
          content='government projects, civic tech, transparency, accountability, Philippines, innovation'
        />
        <link rel='canonical' href='https://bettergov.ph/ideas' />

        {/* Open Graph / Social */}
        <meta property='og:title' content='Project Ideas | BetterGov.ph' />
        <meta
          property='og:description'
          content='Explore innovative project ideas to improve government transparency, accountability, and citizen engagement in the Philippines.'
        />
        <meta property='og:type' content='website' />
        <meta property='og:url' content='https://bettergov.ph/ideas' />
        <meta property='og:image' content='https://bettergov.ph/ph-logo.png' />
      </Helmet>

      <div className='container mx-auto px-4 py-6 md:py-12'>
        {/* Header */}
        <header className='mb-8 text-center md:mb-12'>
          <div className='mb-4 flex items-center justify-center'>
            <div className='bg-kapwa-bg-surface text-kapwa-text-brand mr-4 rounded-full p-3'>
              <LightbulbIcon className='h-8 w-8' />
            </div>
            <h1 className='text-kapwa-text-strong text-3xl font-bold md:text-4xl'>
              Project Ideas
            </h1>
          </div>
          <p className='text-kapwa-text-support mx-auto max-w-3xl text-sm md:text-lg'>
            Innovative concepts to enhance government transparency,
            accountability, and citizen engagement. These ideas aim to bridge
            the gap between citizens and government through technology and
            better design.
          </p>
        </header>

        {/* Stats */}
        <div className='mb-8 grid grid-cols-2 gap-4 md:mb-12 md:grid-cols-5'>
          <div className='bg-kapwa-bg-surface rounded-lg p-4 text-center shadow-xs'>
            <div className='text-kapwa-text-brand text-2xl font-bold'>
              {projectIdeas.length}
            </div>
            <div className='text-kapwa-text-on-disabled text-sm'>
              Total Ideas
            </div>
          </div>
          <div className='bg-kapwa-bg-surface rounded-lg p-4 text-center shadow-xs'>
            <div className='text-kapwa-text-danger text-2xl font-bold'>
              {projectIdeas.filter(idea => idea.priority === 'high').length}
            </div>
            <div className='text-kapwa-text-on-disabled text-sm'>
              High Priority
            </div>
          </div>
          <div className='bg-kapwa-bg-surface rounded-lg p-4 text-center shadow-xs'>
            <div className='text-kapwa-text-info text-2xl font-bold'>
              {new Set(projectIdeas.map(idea => idea.category)).size}
            </div>
            <div className='text-kapwa-text-on-disabled text-sm'>
              Categories
            </div>
          </div>
          <div className='bg-kapwa-bg-surface rounded-lg p-4 text-center shadow-xs'>
            <div className='text-kapwa-text-success text-2xl font-bold'>
              {projectIdeas.filter(idea => idea.complexity === 'simple').length}
            </div>
            <div className='text-kapwa-text-on-disabled text-sm'>
              Simple Projects
            </div>
          </div>
          <div className='bg-kapwa-bg-surface rounded-lg p-4 text-center shadow-xs'>
            <div className='text-kapwa-text-accent-purple text-2xl font-bold'>
              {projectIdeas.reduce((sum, idea) => sum + idea.upvotes, 0)}
            </div>
            <div className='text-kapwa-text-on-disabled text-sm'>
              Total Votes
            </div>
          </div>
        </div>

        {/* Submit New Idea Button */}
        <div className='mb-8 flex justify-center'>
          <div className='flex flex-col gap-3 sm:flex-row'>
            <Button
              onClick={handleSubmitIdea}
              variant='primary'
              leftIcon={<GithubIcon className='h-5 w-5' />}
            >
              Submit Idea
            </Button>
            <Button
              onClick={handleSubmitPR}
              variant='outline'
              leftIcon={<PlusIcon className='h-5 w-5' />}
            >
              Contribute a Pull Request
            </Button>
          </div>
        </div>

        {/* Project Ideas List */}
        <main>
          <h2 className='text-kapwa-text-strong mb-6 text-2xl font-bold'>
            All Project Ideas
          </h2>
          <div className='grid grid-cols-1 gap-6 lg:grid-cols-2'>
            {projectIdeas
              .sort(
                (a, b) => b.upvotes - b.downvotes - (a.upvotes - a.downvotes)
              )
              .map(idea => (
                <Card
                  key={idea.id}
                  hoverable
                  className='bg-kapwa-bg-surface h-full'
                >
                  <CardContent className='p-6'>
                    <div className='mb-4 flex items-start justify-between'>
                      <div className='flex flex-1 items-center'>
                        <div className='bg-kapwa-bg-surface text-kapwa-text-brand mr-3 rounded-lg p-2'>
                          {idea.icon}
                        </div>
                        <div className='flex-1'>
                          <h3 className='text-kapwa-text-strong mb-1 text-xl font-semibold'>
                            {idea.title}
                          </h3>
                          <span className='bg-kapwa-bg-hover text-kapwa-text-support inline-block rounded-sm px-2 py-1 text-xs font-medium'>
                            {idea.category}
                          </span>
                        </div>
                      </div>
                    </div>

                    <p className='text-kapwa-text-support mb-4 leading-relaxed'>
                      {idea.description}
                    </p>

                    <div className='mb-3 flex flex-wrap gap-2'>
                      <span
                        className={`inline-block rounded px-2 py-1 text-xs font-medium ${getPriorityColor(
                          idea.priority
                        )}`}
                      >
                        {idea.priority.charAt(0).toUpperCase() +
                          idea.priority.slice(1)}{' '}
                        Priority
                      </span>
                      <span
                        className={`inline-block rounded px-2 py-1 text-xs font-medium ${getComplexityColor(
                          idea.complexity
                        )}`}
                      >
                        {idea.complexity.charAt(0).toUpperCase() +
                          idea.complexity.slice(1)}{' '}
                        Complexity
                      </span>
                    </div>
                  </CardContent>
                </Card>
              ))}
          </div>
        </main>

        {/* Call to Action */}
        <section className='bg-kapwa-bg-surface mt-12 rounded-lg p-8 text-center shadow-xs'>
          <h2 className='text-kapwa-text-strong mb-4 text-2xl font-bold'>
            Have an Idea?
          </h2>
          <p className='text-kapwa-text-support mx-auto mb-6 max-w-2xl'>
            We&apos;re always looking for innovative ways to improve government
            services and citizen engagement. Submit your ideas via GitHub or
            learn more about our mission.
          </p>
          <div className='flex flex-col justify-center gap-4 sm:flex-row'>
            <Button
              onClick={handleSubmitIdea}
              variant='primary'
              leftIcon={<GithubIcon className='h-5 w-5' />}
            >
              Submit via GitHub
            </Button>
            <Button
              onClick={() => navigate('/about')}
              variant='outline'
              size='default'
            >
              Learn More About Us
            </Button>
          </div>
        </section>
      </div>
    </div>
  );
};

export default Ideas;
