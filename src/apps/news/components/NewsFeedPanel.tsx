import React from 'react';
import { Newspaper, Clock, Bookmark } from 'lucide-react';
import type { NewsArticle } from '@/src/core/types';

interface NewsFeedPanelProps {
  articles: NewsArticle[];
  selectedCategory: string;
  selectedArticle: NewsArticle | null;
  onArticleClick: (article: NewsArticle) => void;
}

export const NewsFeedPanel: React.FC<NewsFeedPanelProps> = ({
  articles,
  selectedCategory,
  selectedArticle,
  onArticleClick
}) => {
  const filteredArticles = selectedCategory === 'all'
    ? articles
    : articles.filter(a => a.category === selectedCategory);

  return (
    <div className="w-80 border-r border-border overflow-y-auto bg-card">
      <div className="p-4 border-b border-border">
        <h2 className="text-lg font-semibold text-foreground flex items-center gap-2">
          <Newspaper size={20} className="text-primary" />
          News Feed
        </h2>
        <p className="text-xs text-muted-foreground mt-1">
          {filteredArticles.length} articles
        </p>
      </div>

      <div className="divide-y divide-border">
        {filteredArticles.map((article) => (
          <button
            key={article.id}
            onClick={() => onArticleClick(article)}
            className={`w-full p-4 text-left transition-colors ${
              selectedArticle?.id === article.id
                ? 'bg-accent'
                : 'hover:bg-accent/50'
            }`}
          >
            <div className="flex items-start justify-between gap-2 mb-2">
              <span className="inline-block px-2 py-0.5 rounded text-xs font-medium bg-primary/10 text-primary">
                {article.category}
              </span>
              <button className="text-muted-foreground hover:text-foreground">
                <Bookmark size={14} />
              </button>
            </div>
            
            <h3 className="font-medium text-sm text-foreground mb-1 line-clamp-2">
              {article.title}
            </h3>
            
            <p className="text-xs text-muted-foreground line-clamp-2 mb-2">
              {article.summary}
            </p>
            
            <div className="flex items-center gap-3 text-xs text-muted-foreground">
              <span>{article.source}</span>
              <span className="flex items-center gap-1">
                <Clock size={10} />
                {new Date(article.timestamp).toLocaleDateString()}
              </span>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
};
