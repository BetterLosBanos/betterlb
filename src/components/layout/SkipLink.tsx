import { FC } from 'react';

export const SkipLink: FC = () => {
  return (
    <a
      href='#main-content'
      className='bg-kapwa-bg-surface text-kapwa-text-strong ring-kapwa-border-focus fixed top-4 left-4 z-100 rounded-md px-4 py-2 ring-2 transition-transform -translate-y-[200%] focus:translate-y-0 focus:outline-none'
    >
      Skip to main content
    </a>
  );
};

export default SkipLink;
