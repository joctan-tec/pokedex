import { useState, useRef, KeyboardEvent, useEffect } from 'react';
import Image from 'next/image';
import { SearchBarProps } from '../../types/searchBarProps';

export function SearchBar({ onSearch, onDebouncedSearch }: SearchBarProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedQuery, setDebouncedQuery] = useState('');
  const searchInputRef = useRef<HTMLInputElement>(null);
  const searchContainerRef = useRef<HTMLDivElement>(null);

  // Debounce effect
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedQuery(searchQuery);
    }, 800);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Efecto para el debounced search
  useEffect(() => {
    if (onDebouncedSearch) {
      onDebouncedSearch(debouncedQuery);
    }
  }, [debouncedQuery, onDebouncedSearch]);

  const handleSearch = () => {
    if (onSearch) {
      onSearch(searchQuery);
    }
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  const toggleSearch = () => {
    if (!isOpen) {
      setIsOpen(true);
      setTimeout(() => searchInputRef.current?.focus(), 150);
    } else if (searchQuery) {
      handleSearch();
    } else {
      setIsOpen(false);
    }
  };

  return (
    <div 
      ref={searchContainerRef}
      className={`relative flex items-center  ${isOpen ? "bg-[#FEF2F2] rounded-lg": 'bg-transparent'} transition-colors duration-500 ease-[cubic-bezier(0.4,0,0.2,1)]`}
      onMouseEnter={() => setIsOpen(true)}
      onMouseLeave={() => !searchQuery && setIsOpen(false)}

    >
      <button
        onClick={toggleSearch}
        className="p-2 transition-colors duration-200"
        aria-label="Buscar"
      >
        <Image 
          src="/search.svg" 
          alt="Buscar" 
          width={32} 
          height={32} 
        />
      </button>

      <div className={`overflow-hidden transition-all duration-500 ease-[cubic-bezier(0.4,0,0.2,1)] ${isOpen ? 'ml-2' : 'ml-0'}`}>
        <input
          ref={searchInputRef}
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Search..."
          className={`py-1 px-3 text-black transition-all border-0 outline-0 duration-500 ease-[cubic-bezier(0.4,0,0.2,1)] ${isOpen ? 'w-48 opacity-100' : 'w-0 opacity-0'}`}
          style={{
            minWidth: isOpen ? '12rem' : '0',
          }}
        />
      </div>
    </div>
  );
};

