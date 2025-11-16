import React from 'react';

// Universal search service
export interface SearchResult {
  id: string;
  title: string;
  description: string;
  category: 'app' | 'content' | 'leader' | 'course' | 'emergency';
  relevance: number;
  action: () => void;
  icon?: React.ComponentType<{ size?: number }>;
}

class SearchServiceClass {
  private searchableItems: SearchResult[] = [];
  private listeners: Set<(results: SearchResult[]) => void> = new Set();

  registerSearchable(item: SearchResult) {
    this.searchableItems.push(item);
  }

  registerSearchables(items: SearchResult[]) {
    this.searchableItems.push(...items);
  }

  clearSearchables() {
    this.searchableItems = [];
  }

  search(query: string): SearchResult[] {
    if (!query.trim()) return [];

    const lowerQuery = query.toLowerCase();
    
    const results = this.searchableItems
      .map(item => {
        const titleMatch = item.title.toLowerCase().includes(lowerQuery);
        const descMatch = item.description.toLowerCase().includes(lowerQuery);
        
        let relevance = 0;
        if (titleMatch) relevance += 10;
        if (descMatch) relevance += 5;
        
        // Exact matches get higher score
        if (item.title.toLowerCase() === lowerQuery) relevance += 20;
        
        return { ...item, relevance };
      })
      .filter(item => item.relevance > 0)
      .sort((a, b) => b.relevance - a.relevance)
      .slice(0, 10); // Top 10 results

    this.notifyListeners(results);
    return results;
  }

  subscribe(callback: (results: SearchResult[]) => void) {
    this.listeners.add(callback);
    return () => this.listeners.delete(callback);
  }

  private notifyListeners(results: SearchResult[]) {
    this.listeners.forEach(callback => callback(results));
  }
}

export const SearchService = new SearchServiceClass();
