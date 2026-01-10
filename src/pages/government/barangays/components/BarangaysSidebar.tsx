import { Building2Icon } from 'lucide-react';
import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import StandardSidebar from '../../../../components/ui/StandardSidebar';
import barangaysData from '../../../../data/directory/barangays.json';

interface Barangay {
  slug: string;
  barangay_name: string;
  address?: string;
  trunkline?: string;
  website?: string;
  email?: string;
  [key: string]: unknown;
}

interface BarangaysSidebarProps {
  onBarangaySelect?: (barangay: Barangay) => void;
}

export default function BarangaysSidebar({
  onBarangaySelect,
}: BarangaysSidebarProps) {
  const [searchTerm] = useState('');
  const { barangay: barangayParam } = useParams();
  const navigate = useNavigate();
  const barangays = barangaysData as Barangay[];

  const filteredBarangays = barangays.filter(dept =>
    dept.barangay_name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleDeptSelect = (dept: Barangay) => {
    if (onBarangaySelect) {
      onBarangaySelect(dept);
    }
    navigate(`/government/barangays/${encodeURIComponent(dept.slug)}`, {
      state: { scrollToContent: true },
    });
  };

  return (
    <StandardSidebar>
      {filteredBarangays.length === 0 ? (
        <div className='p-4 text-center text-sm text-gray-800'>
          No barangays found
        </div>
      ) : (
        <nav className='p-1'>
          <h3 className='px-3 text-xs font-medium text-gray-800 uppercase tracking-wider mb-2'>
            Barangay
          </h3>
          <ul className='space-y-1'>
            {filteredBarangays
              .sort((a, b) => a.barangay_name.localeCompare(b.barangay_name))
              .map(dept => (
                <li key={dept.slug}>
                  <button
                    title={dept.barangay_name.replace('BARANGAY ', '')}
                    onClick={() => handleDeptSelect(dept)}
                    className={`w-full text-left px-4 py-3 text-sm rounded-md transition-colors cursor-pointer ${
                      barangayParam === dept.slug
                        ? 'bg-primary-50 text-primary-700 font-medium'
                        : 'text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    <div className='flex items-center'>
                      <Building2Icon className='h-4 w-4 mr-2 text-gray-400 flex-shrink-0' />
                      <span className='truncate'>
                        {dept.barangay_name.replace('DEPARTMENT OF ', '')}
                      </span>
                    </div>
                  </button>
                </li>
              ))}
          </ul>
        </nav>
      )}
    </StandardSidebar>
  );
}
