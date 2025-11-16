import { MessageSquare, BookOpen, Newspaper, Calendar, Phone, Mic, Code, Users, AlertCircle, Settings } from 'lucide-react';
import type { Application } from '@/src/core/types';

export const APP_REGISTRY: Application[] = [
  {
    id: 'chat',
    name: 'AI Chat',
    icon: MessageSquare,
    category: 'communication',
    description: 'Intelligent conversational assistant for civic questions and guidance',
    view: 'chat',
    mode: 'chat',
    windowProps: {
      defaultWidth: '90vw',
      defaultHeight: '85vh',
      resizable: true
    }
  },
  {
    id: 'study-hub',
    name: 'Study Hub',
    icon: BookOpen,
    category: 'education',
    description: 'Interactive civic education courses, quizzes, and learning paths',
    view: 'studyHub',
    mode: 'study',
    windowProps: {
      defaultWidth: '85vw',
      defaultHeight: '90vh',
      resizable: true
    }
  },
  {
    id: 'news',
    name: 'News Desk',
    icon: Newspaper,
    category: 'civic',
    description: 'Real-time civic updates, policy changes, and government news',
    view: 'news',
    mode: 'news',
    windowProps: {
      defaultWidth: '80vw',
      defaultHeight: '85vh',
      resizable: true
    }
  },
  {
    id: 'calendar',
    name: 'Civic Calendar',
    icon: Calendar,
    category: 'productivity',
    description: 'Track civic events, deadlines, and important dates',
    view: 'calendar',
    windowProps: {
      defaultWidth: '75vw',
      defaultHeight: '80vh',
      resizable: true
    }
  },
  {
    id: 'translator',
    name: 'Translator',
    icon: Code,
    category: 'communication',
    description: 'Translate between Nigerian languages and English',
    view: 'chat',
    mode: 'translate',
    windowProps: {
      defaultWidth: '70vw',
      defaultHeight: '75vh',
      resizable: true
    }
  },
  {
    id: 'voice-journal',
    name: 'Voice Journal',
    icon: Mic,
    category: 'productivity',
    description: 'Record and organize your civic learning journey',
    view: 'chat',
    mode: 'voice-journal',
    windowProps: {
      defaultWidth: '65vw',
      defaultHeight: '70vh',
      resizable: true
    }
  },
  {
    id: 'debate',
    name: 'Debate Arena',
    icon: Users,
    category: 'education',
    description: 'Explore different perspectives on civic issues',
    view: 'chat',
    mode: 'debate',
    windowProps: {
      defaultWidth: '85vw',
      defaultHeight: '85vh',
      resizable: true
    }
  },
  {
    id: 'emergency',
    name: 'Emergency Hub',
    icon: AlertCircle,
    category: 'civic',
    description: 'Quick access to emergency contacts and urgent civic alerts',
    view: 'dashboard',
    isSystem: true,
    windowProps: {
      defaultWidth: '60vw',
      defaultHeight: '65vh',
      resizable: false
    }
  },
  {
    id: 'settings',
    name: 'Settings',
    icon: Settings,
    category: 'system',
    description: 'Customize your UNigeria experience',
    view: 'settings',
    isSystem: true,
    windowProps: {
      defaultWidth: '70vw',
      defaultHeight: '80vh',
      resizable: true
    }
  }
];

export const getAppById = (id: string): Application | undefined => {
  return APP_REGISTRY.find(app => app.id === id);
};

export const getAppsByCategory = (category: Application['category']): Application[] => {
  return APP_REGISTRY.filter(app => app.category === category);
};

export const getAppByView = (view: string): Application | undefined => {
  return APP_REGISTRY.find(app => app.view === view);
};
