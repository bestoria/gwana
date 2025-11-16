import React, { useState } from 'react';
import TwoPanelLayout from './layouts/TwoPanelLayout';
import NewsFeedView from './news/NewsFeedView';
import NewsControlPanel from './news/NewsControlPanel';
import { useLiveAPIContext } from '../contexts/LiveAPIContext';

const MOCK_ARTICLES = [
  {
    id: '1',
    title: 'Major breakthrough in AI technology announced',
    source: 'TechCrunch',
    category: 'tech',
    timestamp: new Date().toISOString(),
    url: 'https://example.com/article1',
    summary: 'Scientists unveil revolutionary AI system...',
    readingTime: 5
  }
];

const NewsDeskNew: React.FC = () => {
  const { callState, startCall, endCall } = useLiveAPIContext();
  const [selectedCategory, setSelectedCategory] = useState('tech');
  const [articles, setArticles] = useState(MOCK_ARTICLES);

  const isBroadcasting = callState === 'connected';

  const handleStartBroadcast = () => {
    const systemInstruction = `You are a professional news anchor delivering live news about ${selectedCategory}.`;
    startCall(undefined, undefined, systemInstruction);
  };

  const handleArticleClick = (article: any) => {
    console.log('Opening article:', article);
  };

  const handleBookmark = (articleId: string) => {
    console.log('Bookmarking:', articleId);
  };

  return (
    <TwoPanelLayout
      leftContent={
        <NewsFeedView
          articles={articles}
          onArticleClick={handleArticleClick}
          onBookmark={handleBookmark}
          selectedCategory={selectedCategory}
        />
      }
      rightControls={
        <NewsControlPanel
          isBroadcasting={isBroadcasting}
          onStartBroadcast={handleStartBroadcast}
          onStopBroadcast={endCall}
          selectedCategory={selectedCategory}
          onCategoryChange={setSelectedCategory}
          onSearchArticles={(query) => console.log('Searching:', query)}
        />
      }
    />
  );
};

export default NewsDeskNew;
