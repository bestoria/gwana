# UNigeria Platform Architecture

## Overview
UNigeria is built as an application-centric operating system that provides a desktop-like experience on large screens and a mobile-native experience on small screens. The architecture is designed for scalability, maintainability, and clear separation of concerns.

## Folder Structure

```
src/
├── core/                    # Core OS functionality
│   ├── types.ts            # Core type definitions
│   ├── shell/              # OS shell components
│   │   ├── Desktop.tsx     # Desktop shell wrapper
│   │   ├── Mobile.tsx      # Mobile shell wrapper
│   │   └── WindowManager.tsx # Window management system
│   └── system/             # System services
│       ├── NotificationService.ts
│       ├── VoiceService.ts
│       └── SearchService.ts
│
├── apps/                    # Individual applications
│   ├── registry.ts         # Central app registry
│   ├── chat/              # Chat application
│   │   └── ChatApp.tsx
│   ├── study/             # Study Hub application
│   │   └── StudyApp.tsx
│   ├── news/              # News Desk application
│   │   └── NewsApp.tsx
│   ├── calendar/          # Calendar application
│   │   └── CalendarApp.tsx
│   └── settings/          # Settings application
│       └── SettingsApp.tsx
│
├── shared/                 # Shared resources
│   ├── components/        # Reusable UI components
│   ├── hooks/             # Shared hooks
│   │   ├── useWindowManager.ts
│   │   ├── useNotifications.ts
│   │   ├── useVoice.ts
│   │   ├── useSearch.ts
│   │   └── useMessages.ts
│   ├── services/          # Shared services
│   ├── types/             # Shared type definitions
│   └── utils/             # Shared utilities
│
├── features/              # Cross-app features
│   ├── ai/               # AI assistant features
│   ├── auth/             # Authentication features
│   └── emergency/        # Emergency features
│
├── components/            # Legacy components (to be migrated)
├── contexts/             # React contexts
├── hooks/                # Legacy hooks (to be migrated)
├── lib/                  # Core libraries and utilities
├── services/             # Legacy services (to be migrated)
├── data/                 # Static data files
└── AppNew.tsx            # New main app entry point
```

## Key Architectural Concepts

### 1. Application Registry
All applications are defined in `src/apps/registry.ts`. This central registry:
- Defines app metadata (name, icon, category, description)
- Maps apps to views and modes
- Specifies window properties for desktop mode
- Enables dynamic app discovery and loading

### 2. Window Manager
The Window Manager (`src/core/shell/WindowManager.tsx`):
- Manages multiple open application windows (desktop only)
- Handles window state (minimized, maximized, focused)
- Provides z-index management for window layering
- Renders window chrome (title bar, controls)

### 3. Shell System
Two shells provide platform-specific experiences:
- **Desktop Shell**: Sidebar navigation + taskbar + multi-window support
- **Mobile Shell**: Bottom navigation + full-screen apps + drawer navigation

### 4. System Services
Singleton services provide centralized functionality:
- **NotificationService**: System-wide notifications
- **VoiceService**: Speech recognition and synthesis
- **SearchService**: Universal search across all content

### 5. Application Structure
Each app is self-contained with:
- Main component (`[App]App.tsx`)
- App-specific components (future: in subdirectories)
- App-specific hooks (future)
- App-specific services (future)
- App-specific types (future)

## Data Flow

```
User Interaction
    ↓
Shell (Desktop/Mobile)
    ↓
App Registry → Route to App
    ↓
Application Component
    ↓
System Services / Shared Hooks
    ↓
State Management (Context/Hooks)
    ↓
UI Update
```

## Responsive Design

The platform adapts between desktop and mobile:

**Desktop (≥768px)**:
- Three-column layout (sidebar, main, optional right panel)
- Multi-window support for apps
- Taskbar at bottom
- Mouse/keyboard-optimized interactions

**Mobile (<768px)**:
- Single-column, full-screen layout
- Bottom navigation bar
- Drawer for additional navigation
- Touch-optimized interactions
- No window system (full-screen apps only)

## State Management

State is managed at multiple levels:

1. **Global State**: User, auth, theme (React Context)
2. **System State**: Notifications, voice, search (System Services)
3. **Shell State**: Active view, mode, window states
4. **App State**: App-specific state within each application

## Adding a New Application

1. Create app folder: `src/apps/[app-name]/`
2. Create main component: `[App]App.tsx`
3. Register in `src/apps/registry.ts`:
   ```typescript
   {
     id: 'my-app',
     name: 'My App',
     icon: MyIcon,
     category: 'productivity',
     description: 'App description',
     view: 'myApp',
     windowProps: { /* window config */ }
   }
   ```
4. Add view type to `src/core/types.ts` if needed
5. Add routing in main App component

## Migration Status

### ✅ Completed
- Core types and app registry
- Window Manager system
- Desktop and Mobile shells
- System services (notifications, voice, search)
- Shared hooks
- First set of apps (Chat, Study, News, Settings, Calendar)

### 🚧 In Progress
- Migrating remaining components to shared/
- Creating feature modules
- Refactoring individual apps

### 📋 Pending
- Extract emergency features to feature module
- Extract AI assistant to feature module
- Complete component library in shared/
- Add comprehensive testing
- Performance optimization

## Best Practices

1. **Separation of Concerns**: Each app is independent
2. **Reusable Components**: Shared UI in `shared/components/`
3. **Type Safety**: Strong typing throughout
4. **Service Abstraction**: System services for cross-cutting concerns
5. **Responsive First**: Design for both desktop and mobile
6. **Accessibility**: WCAG compliant, keyboard navigation, screen readers
7. **Performance**: Lazy loading, code splitting, optimized rendering

## Future Enhancements

- Plugin system for third-party apps
- App permissions and sandboxing
- Inter-app communication
- Persistent app state
- App marketplace
- Progressive Web App features
- Offline functionality
