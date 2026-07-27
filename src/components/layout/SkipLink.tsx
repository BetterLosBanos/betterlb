import { FC } from 'react';

export const SkipLink: FC = () => {
  return (
    <a
      href='#main-content'
      className='focus:bg-kapwa-bg-surface focus:text-kapwa-text-strong focus:ring-kapwa-border-focus sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50 focus:rounded-md focus:px-4 focus:py-2 focus:ring-2'
    >
      Skip to main content
    </a>
  );
};

export default SkipLink;
