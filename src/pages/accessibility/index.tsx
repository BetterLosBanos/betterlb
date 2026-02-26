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
  PhoneIcon,
  SmartphoneIcon,
  Volume2Icon,
} from 'lucide-react';

import {
  PageHeader,
  SectionAlternator,
  SectionBlock,
} from '@/components/layout';
import { SEO } from '@/components/layout/SEO';

const AccessibilityPage: FC = () => {
  const accessibilityFeatures = [
    {
      icon: <EyeIcon className='h-6 w-6' />,
      title: 'Visual Accessibility',
      features: [
        'High contrast color schemes',
        'Scalable text and UI elements',
        'Alternative text for all images',
        'Clear visual hierarchy and layout',
        'Support for screen readers',
      ],
    },
    {
      icon: <KeyboardIcon className='h-6 w-6' />,
      title: 'Keyboard Navigation',
      features: [
        'Full keyboard navigation support',
        'Visible focus indicators',
        'Logical tab order',
        'Skip links for main content',
        'Keyboard shortcuts for common actions',
      ],
    },
    {
      icon: <Volume2Icon className='h-6 w-6' />,
      title: 'Audio & Screen Reader Support',
      features: [
        'Compatible with NVDA, JAWS, and VoiceOver',
        'Proper heading structure',
        'Descriptive link text',
        'Form labels and instructions',
        'Live region announcements',
      ],
    },
    {
      icon: <MousePointerIcon className='h-6 w-6' />,
      title: 'Motor Accessibility',
      features: [
        'Large click targets (minimum 44px)',
        'Drag and drop alternatives',
        'Timeout extensions available',
        'Error prevention and correction',
        'Multiple ways to complete tasks',
      ],
    },
    {
      icon: <SmartphoneIcon className='h-6 w-6' />,
      title: 'Mobile Accessibility',
      features: [
        'Responsive design for all devices',
        'Touch-friendly interface',
        'Zoom support up to 200%',
        'Portrait and landscape orientation',
        'Voice input compatibility',
      ],
    },
    {
      icon: <GlobeIcon className='h-6 w-6' />,
      title: 'Language & Cognitive Support',
      features: [
        'Clear and simple language',
        'Consistent navigation patterns',
        'Multiple language support',
        'Content structure with headings',
        'Help and documentation available',
      ],
    },
  ];

  const wcagCompliance = [
    {
      level: 'WCAG 2.1 Level AA',
      status: 'compliant',
      description:
        'We strive to meet WCAG 2.1 Level AA standards for web accessibility.',
    },
    {
      level: 'Section 508',
      status: 'compliant',
      description:
        'Our website follows Section 508 guidelines for federal accessibility requirements.',
    },
    {
      level: 'EN 301 549',
      status: 'partial',
      description:
        'We are working towards full compliance with European accessibility standards.',
    },
  ];

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'compliant':
        return <CheckCircleIcon className='text-kapwa-text-success h-5 w-5' />;
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
      case 'partial':
        return 'bg-kapwa-bg-warning-weak border-kapwa-border-warning';
      default:
        return 'bg-kapwa-bg-info-weak border-kapwa-border-info';
    }
  };

  return (
    <div className='min-h-screen'>
      <SEO
        title='Accessibility Statement | BetterGov.ph'
        description="Learn about BetterGov.ph's commitment to web accessibility, including WCAG compliance, accessibility features, and how to request assistance."
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
        description='BetterGov.ph is committed to ensuring digital accessibility for people with disabilities. We are continually improving the user experience for everyone and applying the relevant accessibility standards.'
        autoBreadcrumbs={true}
      />

      <SectionAlternator>
        {/* Commitment Section */}
        <SectionBlock title='Our Commitment' icon={CheckCircleIcon}>
          <div className='mx-auto max-w-4xl space-y-4'>
            <p className='text-kapwa-text-support text-lg'>
              We believe that everyone should have equal access to government
              information and services. Our website is designed to be accessible
              to all users, including those who rely on assistive technologies
              such as screen readers, voice recognition software, and keyboard
              navigation.
            </p>
            <p className='text-kapwa-text-support text-lg'>
              We are committed to providing an inclusive experience that allows
              all users to access Philippine government information, services,
              and resources with ease and independence.
            </p>
          </div>
        </SectionBlock>

        {/* Accessibility Features */}
        <SectionBlock title='Accessibility Features' icon={EyeIcon}>
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

        {/* Standards Compliance */}
        <SectionBlock title='Standards Compliance' icon={InfoIcon}>
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

        {/* Keyboard Shortcuts */}
        <SectionBlock title='Keyboard Shortcuts' icon={KeyboardIcon}>
          <div className='mx-auto max-w-4xl grid grid-cols-1 gap-4 md:grid-cols-2'>
            <div className='space-y-3'>
              <div className='bg-kapwa-bg-surface-raised flex items-center justify-between rounded-lg p-3'>
                <span className='text-kapwa-text-strong font-medium'>
                  Skip to main content
                </span>
                <kbd className='bg-kapwa-bg-active rounded-sm px-2 py-1 font-mono text-sm'>
                  Tab
                </kbd>
              </div>
              <div className='bg-kapwa-bg-surface-raised flex items-center justify-between rounded-lg p-3'>
                <span className='text-kapwa-text-strong font-medium'>
                  Navigate links
                </span>
                <kbd className='bg-kapwa-bg-active rounded-sm px-2 py-1 font-mono text-sm'>
                  Tab / Shift+Tab
                </kbd>
              </div>
              <div className='bg-kapwa-bg-surface-raised flex items-center justify-between rounded-lg p-3'>
                <span className='text-kapwa-text-strong font-medium'>
                  Activate link/button
                </span>
                <kbd className='bg-kapwa-bg-active rounded-sm px-2 py-1 font-mono text-sm'>
                  Enter / Space
                </kbd>
              </div>
            </div>
            <div className='space-y-3'>
              <div className='bg-kapwa-bg-surface-raised flex items-center justify-between rounded-lg p-3'>
                <span className='text-kapwa-text-strong font-medium'>
                  Search
                </span>
                <kbd className='bg-kapwa-bg-active rounded-sm px-2 py-1 font-mono text-sm'>
                  Ctrl+K
                </kbd>
              </div>
              <div className='bg-kapwa-bg-surface-raised flex items-center justify-between rounded-lg p-3'>
                <span className='text-kapwa-text-strong font-medium'>
                  Close modal/menu
                </span>
                <kbd className='bg-kapwa-bg-active rounded-sm px-2 py-1 font-mono text-sm'>
                  Escape
                </kbd>
              </div>
              <div className='bg-kapwa-bg-surface-raised flex items-center justify-between rounded-lg p-3'>
                <span className='text-kapwa-text-strong font-medium'>
                  Navigate menu items
                </span>
                <kbd className='bg-kapwa-bg-active rounded-sm px-2 py-1 font-mono text-sm'>
                  Arrow Keys
                </kbd>
              </div>
            </div>
          </div>
        </SectionBlock>

        {/* Feedback and Support */}
        <SectionBlock title='Feedback and Support' icon={MailIcon}>
          <div className='mx-auto max-w-4xl'>
            <p className='text-kapwa-text-support mb-6 text-lg'>
              We welcome your feedback on the accessibility of BetterGov.ph. If
              you encounter accessibility barriers or have suggestions for
              improvement, please let us know.
            </p>

            <div className='grid grid-cols-1 gap-6 md:grid-cols-2'>
              <div className='border-kapwa-border-weak bg-kapwa-bg-surface rounded-lg border p-6'>
                <div className='mb-4 flex items-center'>
                  <MailIcon className='text-kapwa-text-brand mr-3 h-6 w-6' />
                  <h3 className='text-kapwa-text-strong text-lg font-semibold'>
                    Email Support
                  </h3>
                </div>
                <p className='text-kapwa-text-support mb-3'>
                  Send us your accessibility feedback or request assistance.
                </p>
                <a
                  href='mailto:accessibility@bettergov.ph'
                  className='text-kapwa-text-brand hover:text-kapwa-text-brand font-medium'
                >
                  accessibility@bettergov.ph
                </a>
              </div>

              <div className='border-kapwa-border-weak bg-kapwa-bg-surface rounded-lg border p-6'>
                <div className='mb-4 flex items-center'>
                  <PhoneIcon className='text-kapwa-text-brand mr-3 h-6 w-6' />
                  <h3 className='text-kapwa-text-strong text-lg font-semibold'>
                    Phone Support
                  </h3>
                </div>
                <p className='text-kapwa-text-support mb-3'>
                  Call us for immediate accessibility assistance.
                </p>
                <a
                  href='tel:+63-2-8888-1000'
                  className='text-kapwa-text-brand hover:text-kapwa-text-brand font-medium'
                >
                  +63 (2) 8888-1000
                </a>
              </div>
            </div>
          </div>
        </SectionBlock>

        {/* Alternative Formats */}
        <SectionBlock variant='default' className='!py-8'>
          <div className='mx-auto max-w-4xl text-center'>
            <p className='text-kapwa-text-support text-sm'>
              This accessibility statement was last updated on{' '}
              <time dateTime='2025-09-08'>September 8, 2025</time>.
            </p>
            <p className='text-kapwa-text-support mt-2 text-sm'>
              We review and update this statement regularly to ensure it remains
              accurate and current.
            </p>
          </div>
        </SectionBlock>
      </SectionAlternator>
    </div>
  );
};

export default AccessibilityPage;
