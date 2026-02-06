import { useCallback, useEffect, useRef, useState } from 'react';

import { Plus, Search, User } from 'lucide-react';

interface Person {
  id: string;
  first_name: string;
  middle_name: string | null;
  last_name: string;
  suffix?: string | null;
  full_name: string;
}

interface PersonSearchAutocompleteProps {
  onSelect: (person: Person | { isNew: true; name: string }) => void;
  excludeIds?: string[];
  placeholder?: string;
}

export default function PersonSearchAutocomplete({
  onSelect,
  excludeIds = [],
  placeholder = 'Search for a person...',
}: PersonSearchAutocompleteProps) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<Person[]>([]);
  const [loading, setLoading] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);

  const inputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const searchTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Debounced search
  const searchPersons = useCallback(
    async (searchQuery: string) => {
      if (searchQuery.length < 2) {
        setResults([]);
        setShowDropdown(false);
        return;
      }

      setLoading(true);
      try {
        const isMockMode = import.meta.env.VITE_ADMIN_MOCK_MODE === 'true';

        if (isMockMode) {
          // Mock data for development
          const mockPersons: Person[] = [
            {
              id: 'person_1',
              first_name: 'Juan',
              middle_name: null,
              last_name: 'Dela Cruz',
              full_name: 'Juan Dela Cruz',
            },
            {
              id: 'person_2',
              first_name: 'Maria',
              middle_name: 'Santos',
              last_name: 'Reyes',
              full_name: 'Maria Santos Reyes',
            },
            {
              id: 'person_3',
              first_name: 'Jose',
              middle_name: 'Rizal',
              last_name: 'Mercado',
              full_name: 'Jose Rizal Mercado',
            },
          ];

          const filtered = mockPersons.filter(
            p =>
              !excludeIds.includes(p.id) &&
              p.full_name.toLowerCase().includes(searchQuery.toLowerCase())
          );
          setResults(filtered);
        } else {
          const response = await fetch(
            `/api/admin/persons-search?q=${encodeURIComponent(searchQuery)}`
          );
          if (!response.ok) throw new Error('Failed to search persons');

          const data = await response.json();
          const filtered = (data.persons || []).filter(
            (p: Person) => !excludeIds.includes(p.id)
          );
          setResults(filtered);
        }
        setShowDropdown(true);
        setSelectedIndex(-1);
      } catch (error) {
        console.error('Error searching persons:', error);
        setResults([]);
      } finally {
        setLoading(false);
      }
    },
    [excludeIds]
  );

  useEffect(() => {
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }

    searchTimeoutRef.current = setTimeout(() => {
      searchPersons(query);
    }, 300);

    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
    };
  }, [query, searchPersons]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setShowDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelect = (person: Person) => {
    onSelect(person);
    setQuery('');
    setResults([]);
    setShowDropdown(false);
    inputRef.current?.focus();
  };

  const handleCreateNew = () => {
    if (query.trim().length < 2) return;
    onSelect({ isNew: true, name: query.trim() });
    setQuery('');
    setResults([]);
    setShowDropdown(false);
    inputRef.current?.focus();
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!showDropdown || results.length === 0) return;

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setSelectedIndex(i => (i < results.length - 1 ? i + 1 : i));
        break;
      case 'ArrowUp':
        e.preventDefault();
        setSelectedIndex(i => (i > 0 ? i - 1 : -1));
        break;
      case 'Enter':
        e.preventDefault();
        if (selectedIndex >= 0) {
          handleSelect(results[selectedIndex]);
        } else if (results.length === 0 || query.length >= 2) {
          handleCreateNew();
        }
        break;
      case 'Escape':
        setShowDropdown(false);
        setSelectedIndex(-1);
        break;
    }
  };

  const hasNoResults = query.length >= 2 && results.length === 0 && !loading;

  return (
    <div ref={containerRef} className='relative z-50'>
      <div className='relative'>
        <input
          ref={inputRef}
          type='text'
          value={query}
          onChange={e => setQuery(e.target.value)}
          onKeyDown={handleKeyDown}
          onFocus={() => {
            if (query.length >= 2 && results.length > 0) {
              setShowDropdown(true);
            }
          }}
          placeholder={placeholder}
          className='focus:border-primary-500 focus:ring-primary-500/20 w-full rounded-md border border-slate-300 px-3 py-2 pr-10 text-sm focus:ring-2 focus:outline-none'
        />
        <div className='absolute top-1/2 right-3 -translate-y-1/2 text-slate-400'>
          {loading ? (
            <div className='border-t-primary-500 h-4 w-4 animate-spin rounded-full border-2 border-slate-300' />
          ) : (
            <Search className='h-4 w-4' />
          )}
        </div>
      </div>

      {showDropdown && (
        <div
          ref={dropdownRef}
          className='absolute z-50 mt-1 max-h-60 w-full rounded-md border border-slate-200 bg-white shadow-lg'
        >
          {results.length > 0 ? (
            <ul className='max-h-60 overflow-y-auto py-1'>
              {results.map((person, index) => (
                <li
                  key={person.id}
                  onClick={() => handleSelect(person)}
                  className={`cursor-pointer px-3 py-2 text-sm transition-colors ${
                    index === selectedIndex
                      ? 'bg-primary-100 text-primary-700'
                      : 'hover:bg-slate-50'
                  }`}
                >
                  <div className='flex items-center gap-2'>
                    <User className='h-4 w-4 text-slate-400' />
                    <span>{person.full_name}</span>
                  </div>
                  <div className='ml-6 text-xs text-slate-500'>
                    {person.first_name} {person.middle_name} {person.last_name}
                    {person.suffix && `, ${person.suffix}`}
                  </div>
                </li>
              ))}
            </ul>
          ) : hasNoResults ? (
            <div className='py-1'>
              <div className='px-3 py-2 text-sm text-slate-500'>
                No existing persons found
              </div>
              <button
                onClick={handleCreateNew}
                className='text-primary-600 hover:bg-primary-50 flex w-full items-center gap-2 px-3 py-2 text-sm transition-colors'
              >
                <Plus className='h-4 w-4' />
                <span>Create new person: &quot;{query}&quot;</span>
              </button>
            </div>
          ) : (
            <div className='px-3 py-2 text-center text-sm text-slate-500'>
              {query.length < 2
                ? 'Type at least 2 characters to search'
                : 'No results'}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
