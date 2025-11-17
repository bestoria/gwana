import React from 'react';
import { ExternalLink, Share2 } from 'lucide-react';
import type { NewsArticle } from '@/src/core/types';

interface NewsArticleViewerProps {
  article: NewsArticle | null;
}

export const NewsArticleViewer: React.FC<NewsArticleViewerProps> = ({ article }) => {
  if (!article) {
    return (
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="text-center text-muted-foreground">
          <p>Select an article to read</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto p-8">
      <article className="max-w-3xl mx-auto">
        <div className="mb-6">
          <span className="inline-block px-3 py-1 rounded-full bg-primary/10 text-primary text-sm font-medium mb-3">
            {article.category}
          </span>
          <h1 className="text-3xl font-bold text-foreground mb-3">
            {article.title}
          </h1>
          <div className="flex items-center gap-4 text-sm text-muted-foreground">
            <span>{article.source}</span>
            <span>•</span>
            <span>{new Date(article.timestamp).toLocaleDateString()}</span>
            {article.readingTime && (
              <>
                <span>•</span>
                <span>{article.readingTime} min read</span>
              </>
            )}
          </div>
        </div>

        <div className="prose prose-invert max-w-none">
          <p className="text-lg text-muted-foreground mb-6">{article.summary}</p>
          {article.content && (
            <div className="text-foreground" dangerouslySetInnerHTML={{ __html: article.content }} />
          )}
        </div>

        <div className="mt-8 pt-6 border-t border-border flex gap-3">
          {article.url && (
            <a
              href={article.url}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 px-4 py-2 rounded-md bg-accent hover:bg-accent/80 text-accent-foreground transition-colors"
            >
              <ExternalLink size={16} />
              Read Original
            </a>
          )}
          <button className="flex items-center gap-2 px-4 py-2 rounded-md bg-accent hover:bg-accent/80 text-accent-foreground transition-colors">
            <Share2 size={16} />
            Share
          </button>
        </div>
      </article>
    </div>
  );
};
