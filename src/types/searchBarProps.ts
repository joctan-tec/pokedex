export interface SearchBarProps {
  onSearch?: (query: string) => void;
  onDebouncedSearch?: (query: string) => void;
}