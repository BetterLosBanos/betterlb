import { FC } from 'react';

import { Link } from 'react-router-dom';

import { AlertCircleIcon, ChevronRightIcon, PhoneIcon } from 'lucide-react';

import hotlinesData from '../../data/philippines_hotlines.json';

interface Hotline {
  name: string;
  category: string;
  numbers: string[];
  description?: string;
}

interface CriticalHotlinesWidgetProps {
  maxItems?: number;
}

const CriticalHotlinesWidget: FC<CriticalHotlinesWidgetProps> = ({
  maxItems = 4,
}) => {
  const displayedHotlines = (hotlinesData.criticalHotlines as Hotline[]).slice(
    0,
    maxItems
  );

  return (
    <div className='border-kapwa-border-weak bg-kapwa-bg-surface overflow-hidden rounded-lg border shadow-md'>
      <div className='bg-kapwa-bg-danger-default flex items-center justify-between px-4 py-3'>
        <div className='flex items-center'>
          <AlertCircleIcon className='text-kapwa-text-inverse mr-2 h-5 w-5' />
          <h3 className='text-kapwa-text-inverse font-bold'>
            Critical Emergency Hotlines
          </h3>
        </div>
        <Link
          to='https://hotlines.bettergov.ph/'
          className='text-kapwa-text-inverse flex items-center text-sm hover:underline'
        >
          View all <ChevronRightIcon className='ml-1 h-4 w-4' />
        </Link>
      </div>

      <div className='p-4'>
        <div className='grid grid-cols-1 gap-4 sm:grid-cols-2'>
          {displayedHotlines.map((hotline, index) => (
            <div key={index} className='flex flex-col'>
              <span className='text-kapwa-text-strong font-medium'>
                {hotline.name}
              </span>
              <div className='mt-1 space-y-1'>
                {hotline.numbers.map((number, idx) => (
                  <a
                    key={idx}
                    href={`tel:${number.replace(/\D/g, '')}`}
                    className='text-kapwa-text-info flex items-center hover:underline'
                  >
                    <PhoneIcon className='mr-1 h-3 w-3' />
                    <span className='text-sm'>{number}</span>
                  </a>
                ))}
              </div>
            </div>
          ))}
        </div>

        <div className='border-kapwa-border-weak mt-4 border-t pt-3 text-center'>
          <Link
            to='/philippines/hotlines'
            className='text-kapwa-text-info inline-flex items-center text-sm font-medium hover:text-blue-800'
          >
            See all emergency hotlines
            <ChevronRightIcon className='ml-1 h-4 w-4' />
          </Link>
        </div>
      </div>
    </div>
  );
};

export default CriticalHotlinesWidget;
