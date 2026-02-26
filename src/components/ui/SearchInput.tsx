// src/components/ui/SearchInput.tsx
import { InputHTMLAttributes, ReactNode } from 'react';

import { SearchIcon, XIcon } from 'lucide-react';

import { cn } from '../../lib/utils';

interface SearchInputProps extends Omit<
  InputHTMLAttributes<HTMLInputElement>,
  'size'
> {
  value: string; // Now required from parent
  onChangeValue: (value: string) => void; // Standardized callback
  className?: string;
  placeholder?: string;
  icon?: ReactNode;
  size?: 'sm' | 'md' | 'lg';
  clearable?: boolean;
}

const SearchInput = ({
  value,
  onChangeValue,
  className,
  placeholder = 'Search...',
  icon = <SearchIcon className='text-kapwa-text-disabled h-4 w-4' />,
  size = 'md',
  clearable = true,
  ...props
}: SearchInputProps) => {
  const handleClear = () => {
    onChangeValue('');
  };

  const sizes = {
    sm: 'h-9 text-sm',
    md: 'h-11 text-base',
    lg: 'h-14 text-lg',
  };

  return (
    <div className={cn('relative w-full', className)}>
      <div className='pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4'>
        {icon}
      </div>
      <input
        type='text'
        value={value}
        onChange={e => onChangeValue(e.target.value)}
        className={cn(
          'border-kapwa-border-weak bg-kapwa-bg-surface/50 w-full rounded-xl border transition-all duration-200',
          'text-kapwa-text-strong placeholder:text-kapwa-text-disabled',
          'focus:border-kapwa-border-brand focus:ring-kapwa-border-brand/5 focus:bg-kapwa-bg-surface outline-none focus:ring-4',
          sizes[size],
          'pl-11',
          clearable && value ? 'pr-10' : 'pr-4'
        )}
        placeholder={placeholder}
        {...props}
      />
      {clearable && value && (
        <button
          type='button'
          className='text-kapwa-text-disabled hover:text-kapwa-text-on-disabled absolute inset-y-0 right-0 flex items-center pr-3 transition-colors'
          onClick={handleClear}
        >
          <XIcon className='h-4 w-4' />
        </button>
      )}
    </div>
  );
};

export default SearchInput;
