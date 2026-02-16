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

import SEO from '@/components/layout/SEO';

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
        return (
          <CheckCircleIcon
            style={{ color: 'var(--color-kapwa-green-600)' }}
            className='h-5 w-5'
          />
        );
      case 'partial':
        return (
          <AlertCircleIcon
            style={{ color: 'var(--color-kapwa-yellow-600)' }}
            className='h-5 w-5'
          />
        );
      default:
        return (
          <InfoIcon
            style={{ color: 'var(--color-kapwa-blue-600)' }}
            className='h-5 w-5'
          />
        );
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'compliant':
        return 'bg-green-50 border-green-200';
      case 'partial':
        return 'bg-yellow-50 border-yellow-200';
      default:
        return 'bg-blue-50 border-blue-200';
    }
  };

  return (
    <div className='bg-kapwa-bg-surface-raised min-h-screen py-12'>
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

      <div className='container mx-auto px-4'>
        <div className='mx-auto max-w-4xl'>
          {/* Header */}
          <div className='bg-kapwa-bg-surface mb-8 overflow-hidden rounded-xl shadow-xs'>
            <div className='border-kapwa-border-weak border-b p-6 md:p-8'>
              <h1 className='text-kapwa-text-strong mb-4 text-3xl font-bold'>
                Accessibility Statement
              </h1>
              <p className='text-kapwa-text-support text-lg'>
                BetterGov.ph is committed to ensuring digital accessibility for
                people with disabilities. We are continually improving the user
                experience for everyone and applying the relevant accessibility
                standards.
              </p>
            </div>
          </div>

          {/* Commitment Section */}
          <div className='bg-kapwa-bg-surface mb-8 overflow-hidden rounded-xl shadow-xs'>
            <div className='p-6 md:p-8'>
              <h2 className='text-kapwa-text-strong mb-4 text-2xl font-bold'>
                Our Commitment
              </h2>
              <div className='prose prose-lg text-kapwa-text-support'>
                <p>
                  We believe that everyone should have equal access to
                  government information and services. Our website is designed
                  to be accessible to all users, including those who rely on
                  assistive technologies such as screen readers, voice
                  recognition software, and keyboard navigation.
                </p>
                <p>
                  We are committed to providing an inclusive experience that
                  allows all users to access Philippine government information,
                  services, and resources with ease and independence.
                </p>
              </div>
            </div>
          </div>

          {/* Accessibility Features */}
          <div className='bg-kapwa-bg-surface mb-8 overflow-hidden rounded-xl shadow-xs'>
            <div className='p-6 md:p-8'>
              <h2 className='text-kapwa-text-strong mb-6 text-2xl font-bold'>
                Accessibility Features
              </h2>
              <div className='grid grid-cols-1 gap-6 md:grid-cols-2'>
                {accessibilityFeatures.map((feature, index) => (
                  <div
                    key={index}
                    className='border-kapwa-border-weak rounded-lg border p-6'
                  >
                    <div className='mb-4 flex items-center'>
                      <div className='bg-kapwa-bg-surface text-kapwa-text-brand mr-3 rounded-md p-2'>
                        {feature.icon}
                      </div>
                      <h3 className='text-kapwa-text-strong text-lg font-semibold'>
                        {feature.title}
                      </h3>
                    </div>
                    <ul className='space-y-2'>
                      {feature.features.map((item, itemIndex) => (
                        <li key={itemIndex} className='flex items-start'>
                          <CheckCircleIcon className='text-kapwa-text-kapwa-text-success mt-0.5 mr-2 h-4 w-4 flex-shrink-0' />
                          <span className='text-kapwa-text-support text-sm'>
                            {item}
                          </span>
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Standards Compliance */}
          <div className='bg-kapwa-bg-surface mb-8 overflow-hidden rounded-xl shadow-xs'>
            <div className='p-6 md:p-8'>
              <h2 className='text-kapwa-text-strong mb-6 text-2xl font-bold'>
                Standards Compliance
              </h2>
              <div className='space-y-4'>
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
                    <p className='text-kapwa-text-strong'>
                      {standard.description}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Keyboard Shortcuts */}
          <div className='bg-kapwa-bg-surface mb-8 overflow-hidden rounded-xl shadow-xs'>
            <div className='p-6 md:p-8'>
              <h2 className='text-kapwa-text-strong mb-6 text-2xl font-bold'>
                Keyboard Shortcuts
              </h2>
              <div className='grid grid-cols-1 gap-4 md:grid-cols-2'>
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
            </div>
          </div>

          {/* Feedback and Support */}
          <div className='bg-kapwa-bg-surface mb-8 overflow-hidden rounded-xl shadow-xs'>
            <div className='p-6 md:p-8'>
              <h2 className='text-kapwa-text-strong mb-6 text-2xl font-bold'>
                Feedback and Support
              </h2>
              <div className='prose prose-lg text-kapwa-text-support mb-6'>
                <p>
                  We welcome your feedback on the accessibility of BetterGov.ph.
                  If you encounter accessibility barriers or have suggestions
                  for improvement, please let us know.
                </p>
              </div>

              <div className='grid grid-cols-1 gap-6 md:grid-cols-2'>
                <div className='border-kapwa-border-weak rounded-lg border p-6'>
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

                <div className='border-kapwa-border-weak rounded-lg border p-6'>
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
          </div>

          {/* Alternative Formats */}
          <div className='bg-kapwa-bg-surface mb-8 overflow-hidden rounded-xl shadow-xs'>
            <div className='p-6 md:p-8'>
              <h2 className='text-kapwa-text-strong mb-6 text-2xl font-bold'>
                Alternative Formats
              </h2>
              <div className='prose prose-lg text-kapwa-text-support'>
                <p>
                  If you need information from this website in an alternative
                  format, such as:
                </p>
                <ul>
                  <li>Large print documents</li>
                  <li>Audio recordings</li>
                  <li>Braille format</li>
                  <li>Easy-read versions</li>
                  <li>Different language translations</li>
                </ul>
                <p>
                  Please contact us using the information above, and we will
                  work to provide the content in a format that meets your needs
                  within a reasonable timeframe.
                </p>
              </div>
            </div>
          </div>

          {/* Last Updated */}
          <div className='bg-kapwa-bg-surface overflow-hidden rounded-xl shadow-xs'>
            <div className='p-6 text-center md:p-8'>
              <p className='text-kapwa-text-support text-sm'>
                This accessibility statement was last updated on{' '}
                <time dateTime='2025-09-08'>September 8, 2025</time>.
              </p>
              <p className='text-kapwa-text-support mt-2 text-sm'>
                We review and update this statement regularly to ensure it
                remains accurate and current.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AccessibilityPage;
