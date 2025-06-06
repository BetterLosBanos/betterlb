import React from 'react'
import { Mail, AlertTriangle, Users, Heart } from 'lucide-react'

const AboutPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-6 md:py-8">
        <div className="bg-white rounded-lg border shadow-sm p-6 md:p-8 md:py-24 mt-4">
          <div className="max-w-3xl mx-auto">
            <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">
              About BetterGov.ph
            </h1>

            <div className="prose prose-lg max-w-none">
              <section className="mb-10">
                <h2 className="text-2xl font-bold text-gray-800 mb-4">
                  Why We're Building This Project
                </h2>
                <p className="mb-4 text-gray-700">
                  The current state of Philippine government websites,
                  particularly the main portal
                  <a
                    href="https://www.gov.ph"
                    className="text-blue-600 hover:text-blue-800 mx-1"
                  >
                    www.gov.ph
                  </a>
                  , presents numerous challenges for citizens:
                </p>
                <ul className="list-disc pl-6 mb-6 text-gray-700 leading-relaxed">
                  <li className="mb-2">
                    It would benefit from regular content updates to ensure
                    citizens have access to the most current information and
                    services.
                  </li>
                  <li className="mb-2">
                    There's an opportunity to improve user navigation by
                    reviewing and updating links, as well as streamlining
                    pathways to help visitors find what they need more easily.
                  </li>
                  <li className="mb-2">
                    Implementing consistent design standards and formatting
                    across all pages could create a more cohesive and
                    professional user experience.
                  </li>
                  <li className="mb-2">
                    Enhancing accessibility features and overall user experience
                    would make government services more inclusive and
                    user-friendly for all citizens.
                  </li>
                  <li className="mb-2">
                    These improvements could serve as a model for other
                    government agency websites, creating a more unified and
                    effective digital government presence.
                  </li>
                </ul>
                <p className="text-gray-700">
                  These issues create barriers for citizens trying to access
                  essential government services and information.
                </p>
              </section>

              <section className="mb-10">
                <h2 className="text-2xl font-bold text-gray-800 mb-4">
                  Our Mission
                </h2>
                <p className="mb-4 text-gray-700">
                  We are a volunteer-led initiative with a clear mission: to
                  provide a 'better' national website for the Philippines.
                </p>
                <p className="mb-4 text-gray-700">Our goals include:</p>
                <ul className="list-disc pl-6 mb-6 text-gray-700">
                  <li>
                    Building a volunteer-run national website that reflects
                    Filipino values and culture
                  </li>
                  <li>
                    Creating intuitive navigation and search functionality
                  </li>
                  <li>
                    Ensuring accessibility for all citizens, including those
                    with disabilities
                  </li>
                  <li>
                    Providing accurate, up-to-date information about government
                    services
                  </li>
                  <li>
                    Establishing a model for how government digital services can
                    and should work
                  </li>
                </ul>
              </section>

              <section className="mb-10">
                <h2 className="text-2xl font-bold text-gray-800 mb-4">
                  Features
                </h2>
                <ul className="list-disc pl-6 mb-6 text-gray-700">
                  <li>Modern, responsive design that works on all devices</li>
                  <li>
                    Comprehensive directory of government services and agencies
                  </li>
                  <li>User-friendly navigation and search</li>
                  <li>Accessibility features for users with disabilities</li>
                  <li>Regular updates and maintenance</li>
                </ul>
              </section>

              <section className="mb-10">
                <h2 className="flex items-center text-2xl font-bold text-gray-800 mb-4">
                  <Users className="mr-2 h-6 w-6 text-blue-600" />
                  Join Us as a Volunteer
                </h2>
                <p className="mb-4 text-gray-700">
                  We're always looking for passionate individuals to help
                  improve BetterGov.ph. We need volunteers with various skills:
                </p>
                <div className="grid md:grid-cols-2 gap-4 mb-6">
                  <div className="bg-blue-50 p-4 rounded-lg">
                    <h3 className="font-semibold text-gray-800 mb-2">
                      Technical
                    </h3>
                    <ul className="list-disc pl-6 text-gray-700">
                      <li>Frontend and backend developers</li>
                      <li>UX/UI designers</li>
                      <li>Accessibility experts</li>
                      <li>QA testers</li>
                    </ul>
                  </div>
                  <div className="bg-green-50 p-4 rounded-lg">
                    <h3 className="font-semibold text-gray-800 mb-2">
                      Content
                    </h3>
                    <ul className="list-disc pl-6 text-gray-700">
                      <li>Content writers and editors</li>
                      <li>
                        Translators (for Filipino and other local languages)
                      </li>
                      <li>Project managers</li>
                      <li>Researchers</li>
                    </ul>
                  </div>
                </div>
                <div className="bg-blue-100 p-6 rounded-lg flex items-start">
                  <Heart className="h-6 w-6 text-red-500 mr-3 flex-shrink-0 mt-1" />
                  <div>
                    <p className="font-medium text-gray-800 mb-2">
                      Ready to make a difference?
                    </p>
                    <p className="text-gray-700 mb-4">
                      If you're interested in contributing, please reach out to
                      us at
                      <a
                        href="mailto:volunteers@bettergov.ph"
                        className="text-blue-600 hover:text-blue-800 mx-1"
                      >
                        volunteers@bettergov.ph
                      </a>
                      or open an issue in our repository.
                    </p>
                  </div>
                </div>
              </section>

              <section className="mb-10">
                <h2 className="flex items-center text-2xl font-bold text-gray-800 mb-4">
                  <AlertTriangle className="mr-2 h-6 w-6 text-amber-500" />
                  Report a Bug
                </h2>
                <p className="mb-4 text-gray-700">
                  Found a problem with the website? Help us improve by reporting
                  it!
                </p>
                <ol className="list-decimal pl-6 mb-6 text-gray-700">
                  <li>Open an issue in our repository</li>
                  <li>Use the bug report template</li>
                  <li>
                    Provide as much detail as possible, including:
                    <ul className="list-disc pl-6 mt-2">
                      <li>What you were trying to do</li>
                      <li>What you expected to happen</li>
                      <li>What actually happened</li>
                      <li>Screenshots if applicable</li>
                    </ul>
                  </li>
                </ol>
                <div className="bg-amber-50 p-4 rounded-lg flex items-center">
                  <Mail className="h-5 w-5 text-amber-600 mr-2" />
                  <p className="text-gray-700">
                    Alternatively, email us at
                    <a
                      href="mailto:bugs@bettergov.ph"
                      className="text-blue-600 hover:text-blue-800 mx-1"
                    >
                      bugs@bettergov.ph
                    </a>
                  </p>
                </div>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-gray-800 mb-4">
                  License
                </h2>
                <p className="mb-4 text-gray-700">
                  This project is released under the
                  <a
                    href="https://creativecommons.org/publicdomain/zero/1.0/"
                    className="text-blue-600 hover:text-blue-800 mx-1"
                  >
                    Creative Commons CC0
                  </a>
                  dedication. This means the work is dedicated to the public
                  domain and can be freely used by anyone for any purpose
                  without restriction under copyright law.
                </p>
              </section>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default AboutPage
