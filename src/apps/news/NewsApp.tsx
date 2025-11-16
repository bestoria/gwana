import React from 'react';
import NewsDeskNew from '@/src/shared/components/NewsDeskNew';
import type { NewsArticle } from '@/src/core/types';

interface NewsAppProps {
  articles: NewsArticle[];
  onArticleSelect?: (article: NewsArticle) => void;
}

export const NewsApp: React.FC<NewsAppProps> = ({ articles, onArticleSelect }) => {
  return (
    <div className="h-full w-full overflow-auto">
      <NewsDeskNew />
    </div>
  );
};
