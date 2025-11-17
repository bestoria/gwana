import React from 'react';
import { NewsInterface } from './components/NewsInterface';
import type { NewsArticle } from '@/src/core/types';

interface NewsAppProps {
  articles?: NewsArticle[];
  onArticleSelect?: (article: NewsArticle) => void;
}

export const NewsApp: React.FC<NewsAppProps> = (props) => {
  return (
    <div className="h-full w-full">
      <NewsInterface {...props} />
    </div>
  );
};
