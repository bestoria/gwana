import React, { useState, useEffect } from 'react';
import { ErrorBoundary } from './components/ErrorBoundary';
import { LiveAPIProvider } from './contexts/LiveAPIContext';
import { useAuth } from './hooks/useAuth';
import { useWindowManager } from './shared/hooks/useWindowManager';
import { Desktop } from './core/shell/Desktop';
import { Mobile } from './core/shell/Mobile';
import { WindowManager } from './core/shell/WindowManager';
import { APP_REGISTRY, getAppById } from './apps/registry';
import { ChatApp } from './apps/chat/ChatApp';
import { StudyApp } from './apps/study/StudyApp';
import { NewsApp } from './apps/news/NewsApp';
import { SettingsApp } from './apps/settings/SettingsApp';
import { CalendarApp } from './apps/calendar/CalendarApp';
import LoginScreen from './components/LoginScreen';
import ApiKeyWarning from './components/ApiKeyWarning';
import DashboardScreen from './components/DashboardScreen';
import AppDrawer from './components/AppDrawer';
import SharedContentViewer from './components/SharedContentViewer';
import DesktopAssistant from './components/DesktopAssistant';
import { Loader } from 'lucide-react';
import { audioManager } from './lib/utils';
import { DEFAULT_SETTINGS } from './lib/constants';
import { useMessages } from './shared/hooks/useMessages';
import type { AiMode, View, Persona, Message, Settings, CallRecord, NewsArticle, WhiteboardElement } from './core/types';

// Utility functions for URL encoding
const urlSafeBtoA = (str: string) => {
  return btoa(unescape(encodeURIComponent(str)))
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=/g, '');
};

const urlSafeAtoB = (str: string) => {
  let base64 = str.replace(/-/g, '+').replace(/_/g, '/');
  while (base64.length % 4) {
    base64 += '=';
  }
  try {
    const binaryString = atob(base64);
    const bytes = new Uint8Array(binaryString.length);
    for (let i = 0; i < binaryString.length; i++) {
      bytes[i] = binaryString.charCodeAt(i);
    }
    return decodeURIComponent(escape(String.fromCharCode.apply(null, Array.from(bytes))));
  } catch (e) {
    console.error('URL decode error:', e);
    return '';
  }
};

interface KwararruCoreProps {
  currentUser: any;
  isSubscribed: boolean;
  updateCurrentUser: (user: any) => void;
  logout: () => void;
}

const KwararruCore: React.FC<KwararruCoreProps> = ({ currentUser, isSubscribed, updateCurrentUser, logout }) => {
  // State management
  const [aiMode, setAiMode] = useState<AiMode>('chat');
  const [view, setView] = useState<View>('dashboard');
  const [persona, setPersona] = useState<Persona>('default');
  const [settings, setSettings] = useState<Settings>(DEFAULT_SETTINGS);
  const [isAssistantOpen, setIsAssistantOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  const [callHistory, setCallHistory] = useState<CallRecord[]>([]);
  const [whiteboardElements, setWhiteboardElements] = useState<WhiteboardElement[]>([]);
  const [speakerNames, setSpeakerNames] = useState<Record<string, string>>({});
  const [showMeetingModal, setShowMeetingModal] = useState(false);
  const [language, setLanguage] = useState('en-NG');
  const [sessionNewsHistory, setSessionNewsHistory] = useState<NewsArticle[]>([]);
  const [isMultiAgentMode, setIsMultiAgentMode] = useState(false);

  // Window management
  const windowManager = useWindowManager();

  // Message handling
  const {
    messages,
    addMessage,
    appendMessageText,
    updateMessageText,
    clearChat,
    exportChat
  } = useMessages(aiMode);

  // Responsive handling
  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener('resize', handleResize);
    audioManager.init();
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // View change handler
  const handleViewChange = (newView: View) => {
    setView(newView);
    audioManager.playSound('click');
  };

  // Mode change handler
  const handleModeChange = (mode: AiMode) => {
    setAiMode(mode);
    setView('chat');
    audioManager.playSound('click');
  };

  // Settings update
  const handleSettingChange = (key: keyof Settings, value: any) => {
    setSettings(prev => ({ ...prev, [key]: value }));
  };

  // Open app in window (desktop only)
  const handleOpenApp = (appId: string) => {
    if (isMobile) {
      const app = getAppById(appId);
      if (app) {
        setView(app.view);
        if (app.mode) setAiMode(app.mode);
      }
    } else {
      const app = getAppById(appId);
      if (app) {
        windowManager.openWindow(appId, app.name);
      }
    }
  };

  // Render app content for windows
  const renderWindowContent = (appId: string) => {
    switch (appId) {
      case 'chat':
        return (
          <ChatApp
            messages={messages}
            aiMode={aiMode}
            persona={persona}
            settings={settings}
            onSendMessage={(text) => addMessage({ text, sender: 'user' })}
            onClearChat={clearChat}
          />
        );
      case 'study-hub':
        return <StudyApp />;
      case 'news':
        return <NewsApp articles={sessionNewsHistory} />;
      case 'settings':
        return (
          <SettingsApp
            settings={settings}
            currentUser={currentUser}
            onSettingChange={handleSettingChange}
            onLogout={logout}
          />
        );
      case 'calendar':
        return <CalendarApp />;
      default:
        return <div className="p-4 text-white">App: {appId}</div>;
    }
  };

  // Render main content based on view
  const renderMainContent = () => {
    if (view === 'dashboard') {
      return <DashboardScreen onNavigate={handleViewChange} />;
    }
    if (view === 'appDrawer') {
      return <AppDrawer apps={APP_REGISTRY} onAppSelect={handleOpenApp} onClose={() => setView('dashboard')} />;
    }
    if (view === 'chat') {
      return (
        <ChatApp
          messages={messages}
          aiMode={aiMode}
          persona={persona}
          settings={settings}
          onSendMessage={(text) => addMessage({ text, sender: 'user' })}
          onClearChat={clearChat}
        />
      );
    }
    if (view === 'studyHub') {
      return <StudyApp />;
    }
    if (view === 'settings') {
      return (
        <SettingsApp
          settings={settings}
          currentUser={currentUser}
          onSettingChange={handleSettingChange}
          onLogout={logout}
        />
      );
    }
    if (view === 'calendar') {
      return <CalendarApp />;
    }
    return <div className="p-4 text-white">View: {view}</div>;
  };

  // Desktop or Mobile shell
  const Shell = isMobile ? Mobile : Desktop;

  return (
    <LiveAPIProvider
      currentUser={currentUser}
      subscriptionIsActive={isSubscribed}
      updateFreeUsage={(seconds) => updateCurrentUser({
        ...currentUser,
        subscription: {
          ...currentUser.subscription,
          freeMinutesUsedToday: (currentUser.subscription?.freeMinutesUsedToday || 0) + seconds
        }
      })}
      persona={persona}
      setPersona={setPersona}
      settings={settings}
      aiMode={aiMode}
      view={view}
      setToastMessage={(msg) => console.log('Toast:', msg)}
      setCallHistory={setCallHistory}
      onModeChangeByAI={handleModeChange}
      setAiMode={handleModeChange}
      switchToChatView={() => setView('chat')}
      addMessageToChat={(msg) => addMessage(msg)}
      appendMessageText={appendMessageText}
      updateMessageText={updateMessageText}
      setView={handleViewChange}
      updateSettings={handleSettingChange}
      clearChat={clearChat}
      exportChat={exportChat}
      speakerNames={speakerNames}
      setSpeakerNames={setSpeakerNames}
      setShowMeetingModal={setShowMeetingModal}
      language={language}
      sessionNewsHistory={sessionNewsHistory}
      isMultiAgentMode={isMultiAgentMode}
      setWhiteboardElements={setWhiteboardElements}
    >
      <Shell
        activeMode={aiMode}
        setAiMode={handleModeChange}
        activeView={view}
        setView={handleViewChange}
        persona={persona}
        callState="idle"
        toggleAssistant={() => setIsAssistantOpen(!isAssistantOpen)}
      >
        {renderMainContent()}
      </Shell>

      {/* Desktop: Window Manager */}
      {!isMobile && (
        <WindowManager
          windows={windowManager.windows}
          onCloseWindow={windowManager.closeWindow}
          onMinimizeWindow={windowManager.minimizeWindow}
          onMaximizeWindow={windowManager.maximizeWindow}
          onFocusWindow={windowManager.focusWindow}
          renderWindowContent={renderWindowContent}
        />
      )}

      {/* Desktop Assistant */}
      {isAssistantOpen && (
        <DesktopAssistant onClose={() => setIsAssistantOpen(false)} />
      )}
    </LiveAPIProvider>
  );
};

export default function App() {
  const { currentUser, isSubscribed, isLoading, login, signup, logout, updateCurrentUser } = useAuth();
  const [contentToShare, setContentToShare] = useState<Message | null>(null);

  useEffect(() => {
    audioManager.init();
    const urlParams = new URLSearchParams(window.location.search);
    const contentParam = urlParams.get('content');

    if (contentParam) {
      try {
        const decodedContent = JSON.parse(urlSafeAtoB(contentParam));
        setContentToShare(decodedContent);
      } catch (e) {
        console.error("Failed to parse shared content from URL", e);
      }
    }
  }, []);

  // Shared content viewer
  if (contentToShare) {
    return (
      <ErrorBoundary>
        <SharedContentViewer message={contentToShare} />
      </ErrorBoundary>
    );
  }

  // Loading state
  if (isLoading) {
    return (
      <div className="h-screen w-screen flex items-center justify-center bg-[var(--bg-primary)]">
        <Loader size={48} className="animate-spin text-cyan-400" />
      </div>
    );
  }

  // Login screen
  if (!currentUser) {
    return <LoginScreen onLogin={login} onSignup={signup} />;
  }

  // API key check
  if (!process.env.API_KEY && !localStorage.getItem('gemini_api_key')) {
    return <ApiKeyWarning />;
  }

  return (
    <ErrorBoundary>
      <KwararruCore
        currentUser={currentUser}
        isSubscribed={isSubscribed}
        updateCurrentUser={updateCurrentUser}
        logout={logout}
      />
    </ErrorBoundary>
  );
}
