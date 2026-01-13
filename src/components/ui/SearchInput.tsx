// src/components/ui/SearchInput.tsx
import { SearchIcon, XIcon } from 'lucide-react';
import { InputHTMLAttributes, ReactNode } from 'react';
import { cn } from '../../lib/utils';

interface SearchInputProps
  extends Omit<InputHTMLAttributes<HTMLInputElement>, 'size'> {
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
  icon = <SearchIcon className='h-4 w-4 text-gray-400' />,
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
      <div className='absolute inset-y-0 left-0 flex items-center pl-4 pointer-events-none'>
        {icon}
      </div>
      <input
        type='text'
        value={value}
        onChange={e => onChangeValue(e.target.value)}
        className={cn(
          'w-full rounded-xl border border-gray-200 bg-gray-50/50 transition-all duration-200',
          'placeholder:text-gray-400 text-gray-900',
          'focus:bg-white focus:border-primary-300 focus:ring-4 focus:ring-primary-500/5 outline-none',
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
          className='absolute inset-y-0 right-0 flex items-center pr-3 text-gray-400 hover:text-gray-600 transition-colors'
          onClick={handleClear}
        >
          <XIcon className='h-4 w-4' />
        </button>
      )}
    </div>
  );
};

export default SearchInput;
