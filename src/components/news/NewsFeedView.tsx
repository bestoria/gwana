import React, { useState } from 'react';
import { Newspaper, Clock, ExternalLink, Bookmark, BookmarkCheck, TrendingUp, AlertCircle } from 'lucide-react';

interface NewsArticle {
  id: string;
  title: string;
  source: string;
  category: string;
  timestamp: string;
  url: string;
  summary: string;
  imageUrl?: string;
  isBookmarked?: boolean;
  readingTime?: number;
}

interface NewsFeedViewProps {
  articles: NewsArticle[];
  onArticleClick: (article: NewsArticle) => void;
  onBookmark: (articleId: string) => void;
  selectedCategory: string;
}

const NewsFeedView: React.FC<NewsFeedViewProps> = ({
  articles,
  onArticleClick,
  onBookmark,
  selectedCategory
}) => {
  const [viewMode, setViewMode] = useState<'list' | 'grid'>('list');

  const getCategoryColor = (category: string) => {
    const colors: Record<string, string> = {
      tech: 'cyan',
      business: 'green',
      world: 'blue',
      general: 'purple',
      politics: 'red',
      science: 'pink',
      entertainment: 'amber',
      sports: 'orange'
    };
    return colors[category.toLowerCase()] || 'gray';
  };

  const formatTimeAgo = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    if (diffMins < 60) return `${diffMins}m ago`;
    const diffHours = Math.floor(diffMins / 60);
    if (diffHours < 24) return `${diffHours}h ago`;
    const diffDays = Math.floor(diffHours / 24);
    return `${diffDays}d ago`;
  };

  if (articles.length === 0) {
    return (
      <div className="h-full flex flex-col items-center justify-center text-center p-8">
        <Newspaper size={64} className="text-gray-600 mb-4" />
        <h3 className="text-xl font-semibold text-gray-400 mb-2">No Articles Found</h3>
        <p className="text-sm text-gray-500">Try selecting a different category or check back later.</p>
      </div>
    );
  }

  return (
    <div className="h-full overflow-y-auto p-4 space-y-3">
      {/* View Mode Toggle */}
      <div className="flex items-center justify-between mb-4">
        <div className="text-sm text-cyan-300 font-mono flex items-center gap-2">
          <TrendingUp size={16} />
          {selectedCategory.toUpperCase()} NEWS
        </div>
        <div className="flex gap-1 bg-black/40 border border-[var(--border-color)] rounded p-1">
          <button
            onClick={() => setViewMode('list')}
            className={`px-3 py-1 rounded text-xs font-mono transition-all ${
              viewMode === 'list'
                ? 'bg-cyan-400/30 text-cyan-300 border border-cyan-400'
                : 'text-gray-400 hover:text-gray-300'
            }`}
          >
            LIST
          </button>
          <button
            onClick={() => setViewMode('grid')}
            className={`px-3 py-1 rounded text-xs font-mono transition-all ${
              viewMode === 'grid'
                ? 'bg-cyan-400/30 text-cyan-300 border border-cyan-400'
                : 'text-gray-400 hover:text-gray-300'
            }`}
          >
            GRID
          </button>
        </div>
      </div>

      {/* Articles */}
      <div className={viewMode === 'grid' ? 'grid grid-cols-2 gap-3' : 'space-y-3'}>
        {articles.map((article) => {
          const categoryColor = getCategoryColor(article.category);
          return (
            <div
              key={article.id}
              className="bg-black/40 border border-[var(--border-color)] rounded-md overflow-hidden hover:border-cyan-400 hover:shadow-[0_0_20px_rgba(0,255,255,0.2)] transition-all group cursor-pointer"
            >
              {/* Thumbnail (if grid mode or has image) */}
              {(viewMode === 'grid' || article.imageUrl) && article.imageUrl && (
                <div className="w-full h-32 bg-black/60 overflow-hidden">
                  <img
                    src={article.imageUrl}
                    alt={article.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                </div>
              )}

              <div className="p-3">
                {/* Category Badge & Time */}
                <div className="flex items-center justify-between mb-2">
                  <span
                    className={`text-[10px] px-2 py-0.5 rounded font-mono border`}
                    style={{
                      color: `var(--accent-${categoryColor})`,
                      borderColor: `var(--accent-${categoryColor})`,
                      background: `rgba(${categoryColor === 'cyan' ? '0,255,255' : categoryColor === 'green' ? '0,255,0' : '255,0,255'},0.1)`
                    }}
                  >
                    {article.category.toUpperCase()}
                  </span>
                  <span className="text-[10px] text-gray-500 font-mono flex items-center gap-1">
                    <Clock size={10} />
                    {formatTimeAgo(article.timestamp)}
                  </span>
                </div>

                {/* Title */}
                <h3
                  onClick={() => onArticleClick(article)}
                  className="text-sm font-semibold text-gray-200 group-hover:text-cyan-300 transition-colors line-clamp-2 mb-2 cursor-pointer"
                >
                  {article.title}
                </h3>

                {/* Source & Reading Time */}
                <div className="flex items-center justify-between text-[10px] text-gray-500 font-mono mb-2">
                  <span>{article.source}</span>
                  {article.readingTime && (
                    <span>{article.readingTime} min read</span>
                  )}
                </div>

                {/* Summary (list mode only) */}
                {viewMode === 'list' && (
                  <p className="text-xs text-gray-400 line-clamp-2 mb-3">
                    {article.summary}
                  </p>
                )}

                {/* Actions */}
                <div className="flex items-center gap-2">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onBookmark(article.id);
                    }}
                    className="flex-1 bg-black/50 border border-gray-700 hover:border-cyan-400 px-2 py-1.5 rounded text-[10px] text-gray-400 hover:text-cyan-300 transition-all flex items-center justify-center gap-1"
                  >
                    {article.isBookmarked ? (
                      <>
                        <BookmarkCheck size={12} />
                        SAVED
                      </>
                    ) : (
                      <>
                        <Bookmark size={12} />
                        SAVE
                      </>
                    )}
                  </button>
                  <button
                    onClick={() => window.open(article.url, '_blank')}
                    className="flex-1 bg-black/50 border border-gray-700 hover:border-cyan-400 px-2 py-1.5 rounded text-[10px] text-gray-400 hover:text-cyan-300 transition-all flex items-center justify-center gap-1"
                  >
                    <ExternalLink size={12} />
                    OPEN
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Breaking News Banner */}
      <div className="sticky bottom-0 bg-red-500/20 border border-red-500 p-2 rounded-md flex items-center gap-2 animate-pulse">
        <AlertCircle size={16} className="text-red-400" />
        <span className="text-xs text-red-300 font-mono">
          BREAKING: Major technology announcement expected today
        </span>
      </div>
    </div>
  );
};

export default NewsFeedView;
