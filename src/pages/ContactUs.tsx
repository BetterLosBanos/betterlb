import { FC, useState } from 'react';

import { Link } from 'react-router-dom';

import {
  ArrowRightIcon,
  ChevronDownIcon,
  ChevronUpIcon,
  GlobeIcon,
  HeartHandshakeIcon,
  MailIcon,
  MessageCircleIcon,
  UsersIcon,
} from 'lucide-react';
import { Helmet } from 'react-helmet-async';

const ContactUs: FC = () => {
  const contactMethods = [
    {
      icon: <MailIcon className='h-8 w-8' />,
      title: 'Email Us',
      description:
        'Send us an email for general inquiries and collaboration opportunities',
      contact: 'volunteers@bettergov.ph',
      action: 'mailto:volunteers@bettergov.ph',
      color: 'bg-blue-100 text-blue-600',
    },
    {
      icon: <MessageCircleIcon className='h-8 w-8' />,
      title: 'Discord Community',
      description:
        'Join our volunteer community for real-time discussions and support',
      contact: 'discord.gg/bettergov',
      action: 'https://discord.gg/mHtThpN8bT',
      color: 'bg-blue-100 text-blue-600',
    },
    {
      icon: <UsersIcon className='h-8 w-8' />,
      title: 'Volunteer With Us',
      description: 'Help us build better digital services for Filipinos',
      contact: 'Become a Volunteer',
      action: '/join-us',
      color: 'bg-blue-100 text-blue-600',
    },
    {
      icon: <GlobeIcon className='h-8 w-8' />,
      title: 'Report Issues',
      description: 'Found a bug or have a suggestion? Open an issue on GitHub',
      contact: 'GitHub Issues',
      action: 'https://github.com/bettergovph/bettergov/issues',
      color: 'bg-blue-100 text-blue-600',
    },
  ];

  const faqs = [
    {
      question: 'How can I volunteer for BetterGov?',
      answer:
        'We welcome volunteers with various skills! Check out our Join Us page to see current opportunities and fill out our volunteer form.',
      link: { text: 'Join Us page', href: '/join-us' },
    },
    {
      question: 'Is BetterGov affiliated with the Philippine government?',
      answer:
        'No, BetterGov is an independent volunteer-led initiative. We work alongside government agencies but are not officially part of the Philippine government.',
    },
    {
      question: 'How do I report a bug or request a feature?',
      answer:
        'The best way is to open an issue on our GitHub repository. This helps us track and prioritize all requests.',
      link: {
        text: 'GitHub repository',
        href: 'https://github.com/bettergovph/bettergov/issues',
      },
    },
    {
      question: 'Can I use BetterGov content for my project?',
      answer:
        'Yes! BetterGov is released under Creative Commons CC0, meaning our content is in the public domain and can be used freely for any purpose.',
    },
    {
      question: 'Where does the data on BetterGov come from?',
      answer:
        'Our data is aggregated from various publicly available government sources. We use custom scripts and tools to collect, process, and display this information in a way that is easy for citizens to access and understand.',
    },
  ];

  const [openFaq, setOpenFaq] = useState<number | null>(null);

  return (
    <div className='min-h-screen bg-gray-50'>
      <Helmet>
        <title>Contact Us | BetterGov.ph</title>
        <meta
          name='description'
          content='Contact the BetterGov.ph team. Get in touch with our volunteers, report issues, or join our community.'
        />
        <meta
          name='keywords'
          content='contact, bettergov, volunteer, feedback, support, philippines government'
        />
        <link rel='canonical' href='https://bettergov.ph/contact' />
        <meta property='og:title' content='Contact Us | BetterGov.ph' />
        <meta
          property='og:description'
          content='Contact the BetterGov.ph team. Get in touch with our volunteers, report issues, or join our community.'
        />
        <meta property='og:type' content='website' />
        <meta property='og:url' content='https://bettergov.ph/contact' />
        <meta property='og:image' content='https://bettergov.ph/ph-logo.png' />
      </Helmet>

      <div className='container mx-auto px-4 py-6 md:py-8'>
        {/* Header Section */}
        <div className='mt-4 rounded-lg border bg-white p-6 shadow-xs md:p-8 md:py-16'>
          <div className='mx-auto max-w-4xl text-center'>
            <div className='mb-6 flex justify-center'>
              <div className='rounded-full bg-blue-100 p-4'>
                <HeartHandshakeIcon className='h-12 w-12 text-blue-600' />
              </div>
            </div>
            <h1 className='mb-6 text-3xl font-bold text-gray-900 md:text-5xl'>
              Connect with Us
            </h1>
            <p className='mx-auto mb-8 max-w-3xl text-lg text-gray-600 md:text-xl'>
              We&apos;re a passionate community of volunteers, developers, and
              designers dedicated to improving digital public services in the
              Philippines. Whether you have a question, a suggestion, or want to
              join our mission, we&apos;d love to hear from you.
            </p>
          </div>
        </div>

        {/* Contact Methods Grid */}
        <div className='mt-8 grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4'>
          {contactMethods.map((method, index) => (
            <div
              key={index}
              className='rounded-lg border bg-white p-6 shadow-xs transition-shadow hover:shadow-md'
            >
              <div className={`${method.color} mb-4 w-fit rounded-lg p-3`}>
                {method.icon}
              </div>
              <h3 className='mb-2 text-lg font-semibold text-gray-900'>
                {method.title}
              </h3>
              <p className='mb-4 text-sm text-gray-600'>{method.description}</p>
              <a
                href={method.action}
                className='group inline-flex items-center text-sm font-medium text-blue-600 hover:text-blue-800'
                target={method.action.startsWith('http') ? '_blank' : '_self'}
                rel={
                  method.action.startsWith('http')
                    ? 'noopener noreferrer'
                    : undefined
                }
              >
                {method.contact}
                <ArrowRightIcon className='ml-1 h-4 w-4 transition-transform group-hover:translate-x-1' />
              </a>
            </div>
          ))}
        </div>

        {/* FAQ Section */}
        <div className='mt-8 rounded-lg border bg-white p-6 shadow-xs md:p-8'>
          <div className='mx-auto max-w-4xl'>
            <div className='mb-8 text-center'>
              <h2 className='mb-4 text-2xl font-bold text-gray-900 md:text-3xl'>
                Frequently Asked Questions
              </h2>
              <p className='text-gray-600'>
                Find answers to common questions about BetterGov
              </p>
            </div>

            <div className='space-y-4'>
              {faqs.map((faq, index) => (
                <div key={index} className='rounded-lg border'>
                  <button
                    onClick={() => setOpenFaq(openFaq === index ? null : index)}
                    className='flex w-full items-center justify-between p-4 text-left'
                  >
                    <h3 className='flex-1 font-semibold text-gray-800'>
                      {faq.question}
                    </h3>
                    {openFaq === index ? (
                      <ChevronUpIcon className='h-5 w-5 text-gray-500' />
                    ) : (
                      <ChevronDownIcon className='h-5 w-5 text-gray-500' />
                    )}
                  </button>
                  {openFaq === index && (
                    <div className='p-4 pt-0 text-sm leading-relaxed text-gray-600'>
                      <p>
                        {faq.answer}
                        {faq.link && (
                          <>
                            {' '}
                            <Link
                              to={faq.link.href}
                              className='font-medium text-blue-600 hover:text-blue-800'
                              target={
                                faq.link.href.startsWith('http')
                                  ? '_blank'
                                  : '_self'
                              }
                              rel={
                                faq.link.href.startsWith('http')
                                  ? 'noopener noreferrer'
                                  : undefined
                              }
                            >
                              {faq.link.text}
                            </Link>
                            .
                          </>
                        )}
                      </p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Call to Action */}
        <div className='mt-8 rounded-lg bg-gradient-to-r from-blue-600 to-purple-600 p-8 text-center'>
          <h3 className='mb-4 text-2xl font-bold text-white'>
            Ready to Make a Difference?
          </h3>
          <p className='mx-auto mb-6 max-w-2xl text-blue-100'>
            Join our community of volunteers building better digital services
            for the Philippines.
          </p>
          <Link
            to='/join-us'
            className='inline-flex items-center rounded-lg bg-white px-6 py-3 font-semibold text-blue-600 transition-colors hover:bg-gray-50'
          >
            Become a Volunteer
            <ArrowRightIcon className='ml-2 h-5 w-5' />
          </Link>
        </div>
      </div>
    </div>
  );
};

export default ContactUs;
