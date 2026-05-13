import { ExternalLink } from 'lucide-react';
import { Link } from 'react-router-dom';

import {
  Breadcrumb,
  BreadcrumbHome,
  BreadcrumbItem,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/navigation/Breadcrumb';
import { ModuleHeader } from '@/components/layout/PageLayouts';
import { config } from '@/lib/lguConfig';

const GITHUB_ISSUE_URL = `${config.portal.githubUrl}/issues/new?template=contribution.yml`;

export default function ContributePage() {
  return (
    <div className='animate-in fade-in mx-auto max-w-4xl space-y-8 px-4 pb-20 duration-500 md:px-0'>
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbHome href='/' />
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage>Contribute</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      <ModuleHeader
        title='Contribute to BetterLB'
        description='Help us keep the service directory accurate and up-to-date.'
      />

      <div className='grid grid-cols-1 gap-8 md:grid-cols-2'>
        <div className='space-y-6'>
          <div className='space-y-3'>
            <h3 className='text-kapwa-text-strong text-lg font-bold'>
              How it works
            </h3>
            <ol className='text-kapwa-text-support space-y-3 text-sm leading-relaxed'>
              <li className='flex gap-3'>
                <span className='bg-kapwa-bg-brand-default text-kapwa-text-inverse flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-xs font-bold'>
                  1
                </span>
                <span>
                  Click the button below to open a contribution form on GitHub.
                  You&apos;ll need a free GitHub account.
                </span>
              </li>
              <li className='flex gap-3'>
                <span className='bg-kapwa-bg-brand-default text-kapwa-text-inverse flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-xs font-bold'>
                  2
                </span>
                <span>
                  Fill in the service name, steps, requirements, and an official
                  source link.
                </span>
              </li>
              <li className='flex gap-3'>
                <span className='bg-kapwa-bg-brand-default text-kapwa-text-inverse flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-xs font-bold'>
                  3
                </span>
                <span>
                  Our team reviews your submission and adds it to the directory.
                </span>
              </li>
            </ol>
          </div>

          <a
            href={GITHUB_ISSUE_URL}
            target='_blank'
            rel='noopener noreferrer'
            className='bg-kapwa-bg-brand-default hover:bg-kapwa-bg-brand-hover text-kapwa-text-inverse flex min-h-[48px] items-center justify-center gap-2 rounded-2xl px-8 py-4 font-bold shadow-xl transition-all'
          >
            Open Contribution Form <ExternalLink className='h-4 w-4' />
          </a>

          <div className='flex gap-4 rounded-2xl border border-kapwa-border-weak bg-kapwa-bg-surface p-5'>
            <p className='text-kapwa-text-support text-xs leading-relaxed'>
              <strong>Why GitHub?</strong> Using GitHub ensures all
              contributions are attributed to real accounts, helps prevent spam,
              and lets us track the review process transparently.
            </p>
          </div>
        </div>

        <aside className='space-y-6'>
          <div className='space-y-3'>
            <h3 className='text-kapwa-text-strong text-lg font-bold'>
              What you can contribute
            </h3>
            <ul className='text-kapwa-text-support space-y-2 text-sm'>
              <li className='flex gap-2'>
                <span className='text-kapwa-text-success'>&#10003;</span>
                New services not yet in the directory
              </li>
              <li className='flex gap-2'>
                <span className='text-kapwa-text-success'>&#10003;</span>
                Corrections to outdated information
              </li>
              <li className='flex gap-2'>
                <span className='text-kapwa-text-success'>&#10003;</span>
                Updated steps or requirements
              </li>
              <li className='flex gap-2'>
                <span className='text-kapwa-text-success'>&#10003;</span>
                New office or department listings
              </li>
            </ul>
          </div>

          <div className='flex gap-4 rounded-2xl border border-kapwa-border-warning bg-kapwa-bg-warning-weak p-5'>
            <p className='text-xs leading-relaxed text-kapwa-text-warning'>
              <strong>Note:</strong> All submissions are reviewed manually.
              Provide an official source link to avoid rejection.
            </p>
          </div>

          <Link
            to='/services'
            className='text-kapwa-text-brand hover:text-kapwa-text-brand-bold flex items-center gap-1 text-sm font-bold transition-colors'
          >
            &larr; Back to Services
          </Link>
        </aside>
      </div>
    </div>
  );
}
