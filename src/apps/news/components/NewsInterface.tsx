import React, { useState } from 'react';
import { NewsFeedPanel } from './NewsFeedPanel';
import { NewsControlPanel } from './NewsControlPanel';
import { NewsArticleViewer } from './NewsArticleViewer';
import type { NewsArticle } from '@/src/core/types';

interface NewsInterfaceProps {
  articles?: NewsArticle[];
  onArticleSelect?: (article: NewsArticle) => void;
}

export const NewsInterface: React.FC<NewsInterfaceProps> = ({
  articles = [],
  onArticleSelect
}) => {
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedArticle, setSelectedArticle] = useState<NewsArticle | null>(null);
  const [isBroadcasting, setIsBroadcasting] = useState(false);

  const handleArticleClick = (article: NewsArticle) => {
    setSelectedArticle(article);
    onArticleSelect?.(article);
  };

  return (
    <div className="flex h-full bg-background">
      <NewsFeedPanel
        articles={articles}
        selectedCategory={selectedCategory}
        selectedArticle={selectedArticle}
        onArticleClick={handleArticleClick}
      />
      
      <div className="flex-1 flex flex-col">
        <NewsControlPanel
          isBroadcasting={isBroadcasting}
          selectedCategory={selectedCategory}
          onCategoryChange={setSelectedCategory}
          onToggleBroadcast={() => setIsBroadcasting(!isBroadcasting)}
        />
        
        <NewsArticleViewer article={selectedArticle} />
      </div>
    </div>
  );
};
