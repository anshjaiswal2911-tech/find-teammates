# 🛠️ Implementation Guide: Real + Mock Data Strategy

## Quick Start: Choose Your Strategy

Based on your project status, here's what to implement:

---

## Strategy 1️⃣: Simple Environment-Based (Recommended for Now)

### Step 1: Create Data Source Manager

```typescript
// src/app/lib/dataSource.ts
import { dbService } from './dbService';
import {
  mockCurrentUser,
  mockUsers,
  mockMatches,
  mockConversations,
  mockMessages,
} from './mockData';
import { User, Match, Conversation, Message } from './types';

const USE_MOCK = import.meta.env.VITE_USE_MOCK_DATA === 'true';

export const dataSource = {
  // Users
  async getUsers(): Promise<User[]> {
    if (USE_MOCK) {
      console.log('📦 Using MOCK users');
      return mockUsers;
    }
    console.log('🔄 Fetching REAL users from Supabase');
    return await dbService.getAllProfiles();
  },

  async getCurrentUser(): Promise<User> {
    if (USE_MOCK) {
      console.log('📦 Using MOCK current user');
      return mockCurrentUser;
    }
    console.log('🔄 Fetching REAL current user');
    // Get from session or auth context
    const user = await dbService.getProfile('current-user-id');
    return user || mockCurrentUser;
  },

  async getProfile(id: string): Promise<User | null> {
    if (USE_MOCK) {
      console.log(`📦 Using MOCK profile for user ${id}`);
      return mockUsers.find(u => u.id === id) || null;
    }
    console.log(`🔄 Fetching REAL profile for user ${id}`);
    return await dbService.getProfile(id);
  },

  // Matches
  async getMatches(): Promise<Match[]> {
    if (USE_MOCK) {
      console.log('📦 Using MOCK matches');
      return mockMatches;
    }
    console.log('🔄 Fetching REAL matches');
    return await dbService.getMatches?.() || [];
  },

  async recordMatch(userId: string, targetId: string): Promise<void> {
    if (USE_MOCK) {
      console.log(`📦 Mock: Recorded match between ${userId} and ${targetId}`);
      return;
    }
    console.log(`🔄 Recording REAL match`);
    // Implementation depends on your schema
  },

  // Conversations & Messages
  async getConversations(): Promise<Conversation[]> {
    if (USE_MOCK) {
      console.log('📦 Using MOCK conversations');
      return mockConversations;
    }
    console.log('🔄 Fetching REAL conversations');
    return await dbService.getConversations();
  },

  async getMessages(conversationId: string): Promise<Message[]> {
    if (USE_MOCK) {
      console.log(`📦 Using MOCK messages for conversation ${conversationId}`);
      return mockMessages.filter(m => m.conversationId === conversationId);
    }
    console.log(`🔄 Fetching REAL messages`);
    return await dbService.getMessages(conversationId);
  },

  async sendMessage(conversationId: string, text: string): Promise<Message> {
    if (USE_MOCK) {
      const mockMsg: Message = {
        id: `mock-${Date.now()}`,
        conversationId,
        senderId: 'current-user',
        text,
        createdAt: new Date().toISOString(),
      };
      console.log('📦 Mock: Message created locally only', mockMsg);
      return mockMsg;
    }
    console.log('🔄 Sending REAL message');
    return await dbService.sendMessage(conversationId, text);
  },
};
```

### Step 2: Update .env Files

```bash
# .env.development
VITE_USE_MOCK_DATA=true

# .env.production
VITE_USE_MOCK_DATA=false
```

### Step 3: Update Components to Use dataSource

#### Before:
```typescript
// Dashboard.tsx
const [users, setUsers] = useState<User[]>([]);

useEffect(() => {
  const loadUsers = async () => {
    const data = await dbService.getAllProfiles();
    setUsers(data);
  };
  loadUsers();
}, []);
```

#### After:
```typescript
// Dashboard.tsx
import { dataSource } from '../lib/dataSource';

const [users, setUsers] = useState<User[]>([]);

useEffect(() => {
  const loadUsers = async () => {
    const data = await dataSource.getUsers();
    setUsers(data);
  };
  loadUsers();
}, []);
```

---

## Strategy 2️⃣: Advanced With Feature Flags

### Step 1: Create Feature Flags

```typescript
// src/app/lib/featureFlags.ts
export const featureFlags = {
  // Data source flags
  useRealProfiles: import.meta.env.VITE_REAL_PROFILES === 'true',
  useRealMatches: import.meta.env.VITE_REAL_MATCHES === 'true',
  useRealMessages: import.meta.env.VITE_REAL_MESSAGES === 'true',
  useRealConversations: import.meta.env.VITE_REAL_CONVERSATIONS === 'true',

  // Feature flags
  enableOfflineMode: import.meta.env.VITE_OFFLINE_MODE === 'true',
  enableDebugPanel: import.meta.env.VITE_DEBUG_PANEL === 'true',

  // Log current config
  logConfig() {
    console.log('🚩 Feature Flags:', {
      profiles: this.useRealProfiles ? '🔴 REAL' : '🟢 MOCK',
      matches: this.useRealMatches ? '🔴 REAL' : '🟢 MOCK',
      messages: this.useRealMessages ? '🔴 REAL' : '🟢 MOCK',
      conversations: this.useRealConversations ? '🔴 REAL' : '🟢 MOCK',
    });
  },
};
```

### Step 2: Create Advanced Data Source

```typescript
// src/app/lib/advancedDataSource.ts
import { featureFlags } from './featureFlags';
import { dataSource } from './dataSource';

export const advancedDataSource = {
  async getUsers() {
    if (!featureFlags.useRealProfiles) {
      return (await dataSource.getUsers());
    }

    try {
      return await dbService.getAllProfiles();
    } catch (error) {
      console.warn('⚠️ Failed to fetch real profiles, using mock:', error);
      return (await dataSource.getUsers());
    }
  },

  async getMessages(conversationId: string) {
    if (!featureFlags.useRealMessages) {
      return (await dataSource.getMessages(conversationId));
    }

    try {
      return await dbService.getMessages(conversationId);
    } catch (error) {
      console.warn('⚠️ Failed to fetch real messages, using mock:', error);
      return (await dataSource.getMessages(conversationId));
    }
  },

  async sendMessage(conversationId: string, text: string) {
    if (!featureFlags.useRealMessages) {
      return (await dataSource.sendMessage(conversationId, text));
    }

    try {
      return await dbService.sendMessage(conversationId, text);
    } catch (error) {
      console.warn('⚠️ Failed to send real message:', error);
      // Still create local message for display
      return (await dataSource.sendMessage(conversationId, text));
    }
  },
};
```

### Step 3: Environment Config

```bash
# .env.development (All Mock)
VITE_REAL_PROFILES=false
VITE_REAL_MATCHES=false
VITE_REAL_MESSAGES=false
VITE_REAL_CONVERSATIONS=false
VITE_DEBUG_PANEL=true

# .env.testing (Mixed)
VITE_REAL_PROFILES=true
VITE_REAL_MATCHES=true
VITE_REAL_MESSAGES=false
VITE_REAL_CONVERSATIONS=false
VITE_DEBUG_PANEL=true

# .env.production (All Real)
VITE_REAL_PROFILES=true
VITE_REAL_MATCHES=true
VITE_REAL_MESSAGES=true
VITE_REAL_CONVERSATIONS=true
VITE_DEBUG_PANEL=false
```

---

## Strategy 3️⃣: With Debug Panel (Ultimate Flexibility)

### Step 1: Create Data Source Context

```typescript
// src/app/contexts/DataSourceContext.tsx
import { createContext, useContext, useState, useEffect } from 'react';

interface DataSourceState {
  useMockData: boolean;
  setUseMockData: (value: boolean) => void;
  currentMode: 'mock' | 'real' | 'hybrid';
}

const DataSourceContext = createContext<DataSourceState | undefined>(
  undefined
);

export function DataSourceProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [useMockData, setUseMockData] = useState(() => {
    // Check localStorage first for persistence
    const stored = localStorage.getItem('useMockData');
    if (stored !== null) {
      return stored === 'true';
    }
    // Fall back to env var
    return import.meta.env.VITE_USE_MOCK_DATA === 'true';
  });

  const currentMode = useMockData ? 'mock' : 'real';

  // Persist preference
  useEffect(() => {
    localStorage.setItem('useMockData', String(useMockData));
    console.log(`🔄 Data mode switched to: ${currentMode}`);
  }, [useMockData, currentMode]);

  return (
    <DataSourceContext.Provider
      value={{
        useMockData,
        setUseMockData,
        currentMode,
      }}
    >
      {children}
    </DataSourceContext.Provider>
  );
}

export function useDataSourceMode() {
  const context = useContext(DataSourceContext);
  if (!context) {
    throw new Error(
      'useDataSourceMode must be used within DataSourceProvider'
    );
  }
  return context;
}
```

### Step 2: Create Debug Panel

```typescript
// src/app/components/DebugPanel.tsx
import { useDataSourceMode } from '../contexts/DataSourceContext';
import { featureFlags } from '../lib/featureFlags';

export function DebugPanel() {
  const { useMockData, setUseMockData, currentMode } = useDataSourceMode();

  // Only show in development
  if (!import.meta.env.DEV) return null;

  return (
    <div className="fixed bottom-4 right-4 z-50">
      <div className="bg-gray-900 text-white rounded-lg shadow-lg overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-3">
          <h3 className="font-bold text-sm">🔍 Debug Panel</h3>
        </div>

        {/* Content */}
        <div className="p-4 space-y-3 text-sm">
          {/* Current Mode */}
          <div>
            <p className="text-gray-400">Current Mode:</p>
            <div className="flex items-center gap-2 mt-1">
              <div
                className={`w-3 h-3 rounded-full ${
                  useMockData ? 'bg-green-500' : 'bg-blue-500'
                }`}
              />
              <span className="font-mono font-bold uppercase">
                {currentMode}
              </span>
            </div>
          </div>

          {/* Toggle Button */}
          <button
            onClick={() => setUseMockData(!useMockData)}
            className={`w-full py-2 px-3 rounded font-semibold transition-colors ${
              useMockData
                ? 'bg-blue-600 hover:bg-blue-700'
                : 'bg-green-600 hover:bg-green-700'
            }`}
          >
            Switch to {useMockData ? 'REAL' : 'MOCK'} Data
          </button>

          {/* Feature Flags */}
          {featureFlags.enableDebugPanel && (
            <div className="border-t border-gray-700 pt-3">
              <p className="text-gray-400 mb-2">Feature Flags:</p>
              <div className="space-y-1 text-xs font-mono">
                <div>
                  Profiles:{' '}
                  <span className={featureFlags.useRealProfiles ? 'text-blue-400' : 'text-green-400'}>
                    {featureFlags.useRealProfiles ? '🔴' : '🟢'}
                  </span>
                </div>
                <div>
                  Messages:{' '}
                  <span className={featureFlags.useRealMessages ? 'text-blue-400' : 'text-green-400'}>
                    {featureFlags.useRealMessages ? '🔴' : '🟢'}
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* Info */}
          <div className="border-t border-gray-700 pt-3 text-xs text-gray-400">
            <p>💡 Click button to toggle data source</p>
            <p>🔴 = Real Data | 🟢 = Mock Data</p>
          </div>
        </div>
      </div>
    </div>
  );
}
```

### Step 3: Add to App

```typescript
// src/app/App.tsx
import { DataSourceProvider } from './contexts/DataSourceContext';
import { DebugPanel } from './components/DebugPanel';

export default function App() {
  return (
    <DataSourceProvider>
      <DashboardLayout>
        {/* Routes */}
        <DebugPanel />
      </DashboardLayout>
    </DataSourceProvider>
  );
}
```

---

## Quick Comparison

| Feature | Strategy 1 | Strategy 2 | Strategy 3 |
|---------|-----------|-----------|-----------|
| **Setup Time** | 5 min | 15 min | 30 min |
| **Flexibility** | ⭐ | ⭐⭐ | ⭐⭐⭐ |
| **Runtime Switching** | ❌ | ❌ | ✅ |
| **Component Code Changes** | ✅ | ✅ | ✅ |
| **Best For** | Simple projects | Growing projects | Heavy development |

---

## Implementation Checklist

### Strategy 1: Environment-Based

- [ ] Create `src/app/lib/dataSource.ts`
- [ ] Update `.env.development` and `.env.production`
- [ ] Find all `dbService` calls in components
- [ ] Replace with `dataSource` calls
- [ ] Test with `VITE_USE_MOCK_DATA=true`
- [ ] Test with `VITE_USE_MOCK_DATA=false`

### Strategy 2: Feature Flags

- [ ] Create `src/app/lib/featureFlags.ts`
- [ ] Create `src/app/lib/advancedDataSource.ts`
- [ ] Update environment files with flags
- [ ] Test each feature flag individually
- [ ] Add logging for flag values

### Strategy 3: Debug Panel

- [ ] Create `src/app/contexts/DataSourceContext.tsx`
- [ ] Create `src/app/components/DebugPanel.tsx`
- [ ] Wrap app with `DataSourceProvider`
- [ ] Add `DebugPanel` component to main layout
- [ ] Test toggle functionality
- [ ] Verify localStorage persistence

---

## Testing Your Implementation

### Test 1: Mock Mode Works
```bash
VITE_USE_MOCK_DATA=true npm run dev
# Should show "📦 Using MOCK" in console
```

### Test 2: Real Mode Works
```bash
VITE_USE_MOCK_DATA=false npm run dev
# Should show "🔄 Fetching REAL" in console
```

### Test 3: Fallback Works
```typescript
// Temporarily break dbService
const error = new Error('Network error');
// Should fall back to mock gracefully
```

---

## Next Steps

1. **Choose your strategy** (Recommend Strategy 1 first)
2. **Implement data source manager**
3. **Update your 3-5 most-used components**
4. **Test thoroughly**
5. **Document for your team**
6. **Gradually convert remaining components**

---

## File Structure After Implementation

```
src/app/
├── lib/
│   ├── dataSource.ts .................. (New)
│   ├── featureFlags.ts ............... (New, if Strategy 2)
│   ├── advancedDataSource.ts ......... (New, if Strategy 2)
│   ├── dbService.ts .................. (Existing)
│   └── mockData.ts ................... (Existing)
├── contexts/
│   └── DataSourceContext.tsx ......... (New, if Strategy 3)
├── components/
│   └── DebugPanel.tsx ................ (New, if Strategy 3)
└── pages/
    ├── Dashboard.tsx ................. (Updated)
    ├── Messages.tsx .................. (Updated)
    └── Match.tsx ..................... (Updated)
```

---

Good luck with implementation! 🚀
