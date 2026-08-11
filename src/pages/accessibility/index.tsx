import { FC } from 'react';

import {
  AlertCircleIcon,
  CheckCircleIcon,
  EyeIcon,
  GlobeIcon,
  InfoIcon,
  KeyboardIcon,
  MailIcon,
  MousePointerIcon,
  SmartphoneIcon,
  Volume2Icon,
} from 'lucide-react';

import {
  PageHeader,
  SectionAlternator,
  SectionBlock,
} from '@/components/layout';
import { SEO } from '@/components/layout/SEO';
import { config } from '@/lib/lguConfig';

const AccessibilityPage: FC = () => {
  const accessibilityFeatures = [
    {
      icon: <EyeIcon className='h-6 w-6' />,
      title: 'Visual Accessibility',
      features: [
        'Kapwa design tokens for text and surface contrast',
        'Text that scales with browser zoom',
        'Alt text on meaningful images where present',
        'Clear page headings and section structure',
        'Works with common screen readers (ongoing testing)',
      ],
    },
    {
      icon: <KeyboardIcon className='h-6 w-6' />,
      title: 'Keyboard Navigation',
      features: [
        'Core navigation and links are keyboard reachable',
        'Visible focus styles on interactive controls',
        'Skip link to jump past the header into main content',
        'Logical reading and tab order on primary pages',
        'Escape closes search overlays and menus where implemented',
      ],
    },
    {
      icon: <Volume2Icon className='h-6 w-6' />,
      title: 'Audio & Screen Reader Support',
      features: [
        'Semantic landmarks (header, main, footer)',
        'Heading hierarchy on key pages',
        'Descriptive link text in most navigation',
        'Labeled form fields and search inputs',
        'Status updates for hero search results',
      ],
    },
    {
      icon: <MousePointerIcon className='h-6 w-6' />,
      title: 'Motor Accessibility',
      features: [
        'Comfortable hit targets on primary buttons and nav items',
        'Pointer and keyboard alternatives for common actions',
        'No essential drag-and-drop on public pages',
        'Clear error states on forms we ship',
        'Multiple paths to services (search, categories, directory)',
      ],
    },
    {
      icon: <SmartphoneIcon className='h-6 w-6' />,
      title: 'Mobile Accessibility',
      features: [
        'Responsive layout across phone, tablet, and desktop',
        'Touch-friendly spacing on primary controls',
        'Browser zoom supported',
        'Works in portrait and landscape',
        'Standard mobile browser input methods',
      ],
    },
    {
      icon: <GlobeIcon className='h-6 w-6' />,
      title: 'Language & Cognitive Support',
      features: [
        'Plain-language service names where available',
        'Consistent navigation patterns',
        'English and Filipino interface strings',
        'Content grouped with clear headings',
        'Contact path for questions and feedback',
      ],
    },
  ];

  const wcagCompliance = [
    {
      level: 'WCAG 2.1 Level AA',
      status: 'in-progress',
      description:
        'We aim for WCAG 2.1 Level AA. This site is not yet fully audited or certified; we fix gaps as we find them.',
    },
    {
      level: 'Section 508',
      status: 'in-progress',
      description:
        'We follow Section 508 principles where they apply to a civic volunteer portal. Full conformance is not claimed.',
    },
    {
      level: 'EN 301 549',
      status: 'not-evaluated',
      description:
        'We have not evaluated against EN 301 549. European standards are a longer-term reference, not a current claim.',
    },
  ];

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'compliant':
        return <CheckCircleIcon className='text-kapwa-text-success h-5 w-5' />;
      case 'in-progress':
      case 'partial':
        return <AlertCircleIcon className='text-kapwa-text-warning h-5 w-5' />;
      default:
        return <InfoIcon className='text-kapwa-text-brand h-5 w-5' />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'compliant':
        return 'bg-kapwa-bg-success-weak border-kapwa-border-success';
      case 'in-progress':
      case 'partial':
        return 'bg-kapwa-bg-warning-weak border-kapwa-border-warning';
      default:
        return 'bg-kapwa-bg-info-weak border-kapwa-border-info';
    }
  };

  return (
    <div className='min-h-screen'>
      <SEO
        title='Accessibility Statement'
        description='Our commitment to web accessibility, current progress toward WCAG, features we support today, and how to request help.'
        keywords={[
          'accessibility',
          'WCAG',
          'screen reader',
          'keyboard navigation',
          'inclusive design',
          'disability support',
        ]}
      />

      <PageHeader
        variant='centered'
        title='Accessibility Statement'
        description={`${config.portal.name} is committed to making municipal information usable for people with disabilities. We improve the experience continuously and do not claim full certification.`}
        autoBreadcrumbs={true}
      />

      <SectionAlternator>
        <SectionBlock title='Our Commitment' icon={CheckCircleIcon}>
          <div className='mx-auto max-w-4xl space-y-4'>
            <p className='text-kapwa-text-support text-lg'>
              Everyone should be able to reach local government information and
              services. We design for assistive technologies such as screen
              readers and keyboard navigation, and we treat accessibility bugs
              as first-class defects.
            </p>
            <p className='text-kapwa-text-support text-lg'>
              This portal is volunteer-run. Features and audits improve over
              time; if something blocks you, tell us and we will prioritize a
              fix or provide an alternative.
            </p>
          </div>
        </SectionBlock>

        <SectionBlock title='What Works Today' icon={EyeIcon}>
          <div className='mx-auto max-w-4xl grid grid-cols-1 gap-6 md:grid-cols-2'>
            {accessibilityFeatures.map((feature, index) => (
              <div
                key={index}
                className='border-kapwa-border-weak bg-kapwa-bg-surface rounded-lg border p-6'
              >
                <div className='mb-4 flex items-center'>
                  <div className='bg-kapwa-bg-surface-raised text-kapwa-text-brand mr-3 rounded-md p-2'>
                    {feature.icon}
                  </div>
                  <h3 className='text-kapwa-text-strong text-lg font-semibold'>
                    {feature.title}
                  </h3>
                </div>
                <ul className='space-y-2'>
                  {feature.features.map((item, itemIndex) => (
                    <li key={itemIndex} className='flex items-start'>
                      <CheckCircleIcon className='text-kapwa-text-success mt-0.5 mr-2 h-4 w-4 flex-shrink-0' />
                      <span className='text-kapwa-text-support text-sm'>
                        {item}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </SectionBlock>

        <SectionBlock title='Standards Progress' icon={InfoIcon}>
          <div className='mx-auto max-w-4xl space-y-4'>
            {wcagCompliance.map((standard, index) => (
              <div
                key={index}
                className={`rounded-lg border p-4 ${getStatusColor(
                  standard.status
                )}`}
              >
                <div className='mb-2 flex items-center'>
                  {getStatusIcon(standard.status)}
                  <h3 className='text-kapwa-text-strong ml-2 text-lg font-semibold'>
                    {standard.level}
                  </h3>
                </div>
                <p className='text-kapwa-text-support'>
                  {standard.description}
                </p>
              </div>
            ))}
          </div>
        </SectionBlock>

        <SectionBlock title='Keyboard Basics' icon={KeyboardIcon}>
          <div className='mx-auto max-w-4xl grid grid-cols-1 gap-4 md:grid-cols-2'>
            <div className='space-y-3'>
              <div className='bg-kapwa-bg-surface-raised flex items-center justify-between rounded-lg p-3'>
                <span className='text-kapwa-text-strong font-medium'>
                  Skip to main content
                </span>
                <kbd className='bg-kapwa-bg-active rounded-sm px-2 py-1 font-mono text-sm'>
                  Tab (first focus)
                </kbd>
              </div>
              <div className='bg-kapwa-bg-surface-raised flex items-center justify-between rounded-lg p-3'>
                <span className='text-kapwa-text-strong font-medium'>
                  Move between controls
                </span>
                <kbd className='bg-kapwa-bg-active rounded-sm px-2 py-1 font-mono text-sm'>
                  Tab / Shift+Tab
                </kbd>
              </div>
              <div className='bg-kapwa-bg-surface-raised flex items-center justify-between rounded-lg p-3'>
                <span className='text-kapwa-text-strong font-medium'>
                  Activate link or button
                </span>
                <kbd className='bg-kapwa-bg-active rounded-sm px-2 py-1 font-mono text-sm'>
                  Enter / Space
                </kbd>
              </div>
            </div>
            <div className='space-y-3'>
              <div className='bg-kapwa-bg-surface-raised flex items-center justify-between rounded-lg p-3'>
                <span className='text-kapwa-text-strong font-medium'>
                  Close overlay or menu
                </span>
                <kbd className='bg-kapwa-bg-active rounded-sm px-2 py-1 font-mono text-sm'>
                  Escape
                </kbd>
              </div>
              <div className='bg-kapwa-bg-surface-raised rounded-lg p-3'>
                <p className='text-kapwa-text-support text-sm'>
                  There is no global Ctrl+K shortcut yet. Use the hero or site
                  search fields, or open Search from the navigation.
                </p>
              </div>
            </div>
          </div>
        </SectionBlock>

        <SectionBlock title='Feedback and Support' icon={MailIcon}>
          <div className='mx-auto max-w-4xl'>
            <p className='text-kapwa-text-support mb-6 text-lg'>
              If you hit an accessibility barrier on {config.portal.name}, email
              us. Include the page URL, what you tried, and the assistive
              technology you use if you can.
            </p>

            <div className='border-kapwa-border-weak bg-kapwa-bg-surface rounded-lg border p-6 max-w-lg'>
              <div className='mb-4 flex items-center'>
                <MailIcon className='text-kapwa-text-brand mr-3 h-6 w-6' />
                <h3 className='text-kapwa-text-strong text-lg font-semibold'>
                  Email
                </h3>
              </div>
              <p className='text-kapwa-text-support mb-3'>
                Accessibility feedback and accommodation requests.
              </p>
              <a
                href={`mailto:${config.portal.contactEmail}`}
                className='text-kapwa-text-brand hover:text-kapwa-text-brand font-medium'
              >
                {config.portal.contactEmail}
              </a>
            </div>
          </div>
        </SectionBlock>

        <SectionBlock variant='default' className='!py-8'>
          <div className='mx-auto max-w-4xl text-center'>
            <p className='text-kapwa-text-support text-sm'>
              This accessibility statement was last updated on{' '}
              <time dateTime='2026-07-27'>July 27, 2026</time>.
            </p>
            <p className='text-kapwa-text-support mt-2 text-sm'>
              We revise it when supported features or known gaps change.
            </p>
          </div>
        </SectionBlock>
      </SectionAlternator>
    </div>
  );
};

export default AccessibilityPage;
