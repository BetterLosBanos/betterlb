import {
  ChangeEvent,
  KeyboardEvent,
  MouseEvent as ReactMouseEvent,
  useEffect,
  useRef,
  useState,
} from 'react';

import { ChevronDownIcon, SearchIcon, XIcon } from 'lucide-react';

import { cn } from '../../lib/utils';

interface SelectPickerOption {
  label: string;
  value: string;
}

interface SelectPickerProps {
  options: SelectPickerOption[];
  onSelect: (options: SelectPickerOption[]) => void;
  placeholder?: string;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
  disabled?: boolean;
  searchable?: boolean;
  clearable?: boolean;
  selectedValues?: string[];
}

const SelectPicker = ({
  options,
  onSelect,
  placeholder = 'Select...',
  className,
  size = 'md',
  disabled = false,
  searchable = true,
  clearable = true,
  selectedValues = [],
  ...props
}: SelectPickerProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedOptions, setSelectedOptions] = useState<SelectPickerOption[]>(
    []
  );
  const [dropdownPosition, setDropdownPosition] = useState<'bottom' | 'top'>(
    'bottom'
  );

  const dropdownRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);

  // Sync with selectedValues prop
  useEffect(() => {
    const selected = options.filter(opt => selectedValues.includes(opt.value));
    setSelectedOptions(selected);
  }, [selectedValues, options]);

  const filteredOptions = options.filter(opt =>
    opt.label.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleSelect = (option: SelectPickerOption) => {
    let updated: SelectPickerOption[];
    if (selectedOptions.some(o => o.value === option.value)) {
      updated = selectedOptions.filter(o => o.value !== option.value);
    } else {
      updated = [...selectedOptions, option];
    }
    setSelectedOptions(updated);
    onSelect(updated);
  };

  const handleClear = (e: ReactMouseEvent) => {
    e.stopPropagation();
    setSelectedOptions([]);
    onSelect([]);
  };

  const checkDropdownPosition = () => {
    if (!triggerRef.current) return 'bottom';
    const rect = triggerRef.current.getBoundingClientRect();
    const spaceBelow = window.innerHeight - rect.bottom;
    const spaceAbove = rect.top;
    const dropdownHeight = 240;
    if (spaceBelow < dropdownHeight && spaceAbove > spaceBelow) return 'top';
    return 'bottom';
  };

  const handleToggle = () => {
    if (disabled) return;
    if (!isOpen) setDropdownPosition(checkDropdownPosition());
    setIsOpen(!isOpen);
    if (!isOpen && searchable)
      setTimeout(() => searchInputRef.current?.focus(), 0);
  };

  const handleSearchChange = (e: ChangeEvent<HTMLInputElement>) =>
    setSearchTerm(e.target.value);

  const handleSearchKeyDown = (e: KeyboardEvent) => {
    if (e.key === 'Escape') {
      setIsOpen(false);
      setSearchTerm('');
    }
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
        setSearchTerm('');
      }
    };
    const handleResizeOrScroll = () => {
      if (isOpen) setDropdownPosition(checkDropdownPosition());
    };
    document.addEventListener('mousedown', handleClickOutside);
    window.addEventListener('resize', handleResizeOrScroll);
    window.addEventListener('scroll', handleResizeOrScroll, true);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      window.removeEventListener('resize', handleResizeOrScroll);
      window.removeEventListener('scroll', handleResizeOrScroll, true);
    };
  }, [isOpen]);

  const sizes = { sm: 'h-9 text-sm', md: 'h-11 text-base', lg: 'h-14 text-lg' };

  return (
    <div
      className={cn('relative w-full', className)}
      ref={dropdownRef}
      {...props}
    >
      <button
        ref={triggerRef}
        type='button'
        className={cn(
          'flex w-full items-center justify-between rounded-lg border bg-white text-left transition-all',
          'focus:ring-primary-500/20 focus:border-primary-500 focus:ring-2',
          sizes[size],
          disabled
            ? 'cursor-not-allowed bg-gray-50 opacity-60'
            : 'hover:border-gray-400',
          isOpen && 'border-primary-500 ring-primary-500/20 ring-2',
          'px-3'
        )}
        onClick={handleToggle}
        disabled={disabled}
        aria-haspopup='listbox'
        aria-expanded={isOpen}
      >
        <span
          className={cn(
            'truncate',
            selectedOptions.length > 0 ? 'text-gray-900' : 'text-gray-500'
          )}
        >
          {selectedOptions.length > 0
            ? selectedOptions.map(o => o.label).join(', ')
            : placeholder}
        </span>
        <div className='flex items-center space-x-1'>
          {clearable && selectedOptions.length > 0 && !disabled && (
            <button
              type='button'
              className='rounded-full p-1 transition-colors hover:bg-gray-100'
              onClick={handleClear}
              aria-label='Clear selection'
            >
              <XIcon className='h-4 w-4 text-gray-500' />
            </button>
          )}
          <ChevronDownIcon
            className={cn(
              'h-4 w-4 text-gray-500 transition-transform duration-200',
              isOpen && 'rotate-180'
            )}
          />
        </div>
      </button>

      {isOpen && (
        <div
          className={cn(
            'absolute z-50 max-h-60 w-full overflow-hidden rounded-lg border bg-white shadow-lg',
            dropdownPosition === 'top' ? 'bottom-full mb-1' : 'top-full mt-1'
          )}
        >
          {searchable && (
            <div className='border-b border-gray-200 p-2'>
              <div className='relative'>
                <SearchIcon className='absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-gray-500' />
                <input
                  ref={searchInputRef}
                  type='text'
                  className='focus:ring-primary-500 focus:border-primary-500 w-full rounded-md border border-gray-300 py-2 pr-3 pl-9 text-sm focus:ring-2 focus:outline-none'
                  placeholder='Search options...'
                  value={searchTerm}
                  onChange={handleSearchChange}
                  onKeyDown={handleSearchKeyDown}
                />
              </div>
            </div>
          )}
          <div className='max-h-48 overflow-y-auto'>
            {filteredOptions.length > 0 ? (
              <ul role='listbox' className='py-1'>
                {filteredOptions.map(option => (
                  <li
                    key={option.value}
                    className={cn(
                      'cursor-pointer px-3 py-2 text-sm transition-colors',
                      'hover:bg-primary-50 hover:text-primary-700',
                      selectedOptions.some(o => o.value === option.value) &&
                        'bg-primary-100 text-primary-700'
                    )}
                    onClick={() => handleSelect(option)}
                    role='option'
                    aria-selected={selectedOptions.some(
                      o => o.value === option.value
                    )}
                  >
                    {option.label}
                  </li>
                ))}
              </ul>
            ) : (
              <div className='px-3 py-2 text-center text-sm text-gray-500'>
                No options found
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default SelectPicker;
