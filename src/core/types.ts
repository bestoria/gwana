import React from 'react';

// Core OS types
export type View = 'dashboard' | 'chat' | 'settings' | 'studyHub' | 'calendar' | 'appDrawer' | 'news';
export type AiMode = 'chat' | 'news' | 'study' | 'translate' | 'debate' | 'code' | 'call' | 'voice-journal';
export type CallState = 'idle' | 'standby' | 'ringing' | 'connecting' | 'connected' | 'ended';
export type Persona = 'default' | 'professional' | 'friendly' | 'scholar' | 'activist';

// Application types
export interface Application {
  id: string;
  name: string;
  icon: React.ComponentType<{ size?: number }>;
  category: 'productivity' | 'education' | 'communication' | 'civic' | 'system';
  description: string;
  view: View;
  mode?: AiMode;
  isSystem?: boolean;
  windowProps?: {
    defaultWidth?: string;
    defaultHeight?: string;
    minWidth?: string;
    minHeight?: string;
    resizable?: boolean;
  };
}

// Window management
export interface WindowState {
  id: string;
  appId: string;
  title: string;
  isMaximized: boolean;
  isMinimized: boolean;
  position?: { x: number; y: number };
  size?: { width: number; height: number };
  zIndex: number;
}

// Message types
export interface Message {
  id: number;
  text: string;
  sender: 'user' | 'ai' | 'system';
  timestamp: Date;
  persona?: Persona;
  toolsUsed?: string[];
  suggestions?: AiSuggestion[];
  isStreaming?: boolean;
}

export interface AiSuggestion {
  label: string;
  prompt: string;
}

// Settings
export interface Settings {
  theme: 'dark' | 'light' | 'system';
  language: string;
  voiceEnabled: boolean;
  linkPreview: boolean;
  soundEffects: boolean;
  notifications: boolean;
  autoSave: boolean;
  fontSize: 'small' | 'medium' | 'large';
  highContrast: boolean;
}

// User profile
export interface UserProfile {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  createdAt: Date;
  preferences: Settings;
}

// Other types from original
export interface CallRecord {
  id: string;
  startTime: Date;
  endTime: Date;
  duration: number;
  transcript: string;
  mode: AiMode;
}

export interface LiveReportData {
  topics: string[];
  summary: string;
  participants: number;
}

export interface Flashcard {
  id: string;
  front: string;
  back: string;
  category: string;
  difficulty: 'easy' | 'medium' | 'hard';
}

export interface NewsArticle {
  id: string;
  title: string;
  summary: string;
  source: string;
  publishedAt: Date;
  category: string;
}

export interface WhiteboardElement {
  id: string;
  type: 'rect' | 'circle' | 'line' | 'text';
  x: number;
  y: number;
  width?: number;
  height?: number;
  color?: string;
  text?: string;
}
