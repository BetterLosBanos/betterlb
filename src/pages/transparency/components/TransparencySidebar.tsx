import { Link, useLocation } from 'react-router-dom';

const sections = [
  { name: 'Budget & Finances', slug: 'financial' },
  { name: 'Infrastructure Projects', slug: 'infrastructure-projects' },
  { name: 'DPWH Projects', slug: 'dpwh-projects' },
];

export default function TransparencySidebar() {
  const location = useLocation();

  return (
    <nav className='bg-white rounded-lg shadow-sm border border-gray-200 p-4 sticky top-24 w-full md:w-64'>
      <h2 className='font-semibold text-gray-900 mb-4 text-lg'>Transparency</h2>
      <ul className='space-y-1'>
        {sections.map(section => {
          const isActive = location.pathname.endsWith(section.slug);
          return (
            <li key={section.slug}>
              <Link
                to={`/transparency/${section.slug}`}
                className={`w-full block text-left px-3 py-2 rounded-md text-sm transition-all ${
                  isActive
                    ? 'bg-primary-50 text-primary-700 font-semibold border-l-2 border-primary-600'
                    : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900 border-l-2 border-transparent'
                }`}
                aria-current={isActive ? 'true' : undefined}
              >
                {section.name}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
