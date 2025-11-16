import { useState, useCallback, useEffect } from 'react';
import { SearchService, SearchResult } from '@/src/core/system/SearchService';

export const useSearch = () => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);

  useEffect(() => {
    const unsubscribe = SearchService.subscribe(setResults);
    return unsubscribe;
  }, []);

  const search = useCallback((searchQuery: string) => {
    setQuery(searchQuery);
    const searchResults = SearchService.search(searchQuery);
    setResults(searchResults);
  }, []);

  const clearSearch = useCallback(() => {
    setQuery('');
    setResults([]);
  }, []);

  return {
    query,
    results,
    search,
    clearSearch
  };
};
