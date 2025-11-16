import React from 'react';
import { ExternalLink, Rss, Zap } from 'lucide-react';
import type { NewsContent } from '@/src/lib/types';
import HolographicPanel from './cyberpunk/HolographicPanel';
import HolographicText from './cyberpunk/HolographicText';
import DataStreamEffect from './cyberpunk/DataStreamEffect';

interface NewsDisplayProps {
  news: NewsContent;
}

const NewsDisplay: React.FC<NewsDisplayProps> = ({ news }) => {
    if (!news || news.articles.length === 0) {
        return null;
    }

    return (
        <div className="mt-2 max-w-xl relative">
            <HolographicPanel glowColor="cyan" withGrid withScanlines withCorners className="p-4">
                <DataStreamEffect color="cyan" density={15} />
                
                <HolographicText className="text-sm font-bold flex items-center gap-2 mb-4" glowColor="cyan">
                    <Rss size={16} className="animate-pulse" /> 
                    <span className="font-mono tracking-wider">LIVE NEWS FEED</span>
                    <Zap size={12} className="animate-pulse" />
                </HolographicText>

                <div className="space-y-3 relative z-10">
                    {news.articles.slice(0, 10).map((article, index) => (
                        <div 
                            key={index}
                            className="relative group animate-glitch-in"
                            style={{ animationDelay: `${index * 0.05}s` }}
                        >
                            <div className="relative backdrop-blur-sm bg-gradient-to-r from-black/60 to-black/40 p-3 rounded-md border border-cyan-500/30 hover:border-cyan-500 transition-all duration-300 overflow-hidden hover:scale-102"
                                 style={{
                                   boxShadow: '0 0 0 rgba(0, 255, 255, 0)',
                                   transition: 'all 0.3s ease'
                                 }}
                                 onMouseEnter={(e) => {
                                   e.currentTarget.style.boxShadow = '0 0 20px rgba(0, 255, 255, 0.4), inset 0 0 20px rgba(0, 255, 255, 0.1)';
                                 }}
                                 onMouseLeave={(e) => {
                                   e.currentTarget.style.boxShadow = '0 0 0 rgba(0, 255, 255, 0)';
                                 }}
                            >
                                {/* Holographic accent line */}
                                <div className="absolute top-0 left-0 w-1 h-full bg-gradient-to-b from-cyan-500 via-cyan-400 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                                
                                <div className="flex items-start gap-2">
                                    <span className="text-cyan-400 font-mono text-xs mt-0.5 opacity-70">#{String(index + 1).padStart(2, '0')}</span>
                                    <div className="flex-1">
                                        <p className="font-bold text-gray-100 group-hover:text-cyan-300 transition-colors text-sm leading-snug font-mono">
                                            {article.title}
                                        </p>
                                        
                                        {article.summary && (
                                            <p className="text-gray-400 group-hover:text-gray-300 mt-2 text-xs leading-relaxed">
                                                {article.summary}
                                            </p>
                                        )}

                                        <a 
                                            href={article.uri} 
                                            target="_blank" 
                                            rel="noopener noreferrer"
                                            className="flex items-center gap-1.5 text-cyan-400 hover:text-cyan-300 mt-2 text-xs font-mono group/link"
                                            style={{ textShadow: '0 0 10px rgba(0, 255, 255, 0.5)' }}
                                        >
                                            <span className="group-hover/link:underline">
                                                {article.source || (article.uri && new URL(article.uri).hostname)}
                                            </span>
                                            <ExternalLink size={12} className="group-hover/link:translate-x-1 transition-transform" />
                                        </a>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </HolographicPanel>
        </div>
    );
};

export default NewsDisplay;