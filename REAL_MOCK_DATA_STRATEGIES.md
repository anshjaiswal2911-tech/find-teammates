# 🔄 Strategies for Using Real + Mock Data Together

## Overview

Combining real and mock data is essential for development, testing, and demoing. This guide shows proven strategies for your CollabNest app.

---

## 1. Environment-Based Strategy

### Concept
Switch between real and mock data based on environment variables.

### Implementation

Create a data source manager:

```typescript
// src/app/lib/dataSource.ts
import { dbService } from './dbService';
import { mockUsers, mockCurrentUser, mockMatches } from './mockData';
import { User, Match, Conversation } from './types';

const USE_MOCK = import.meta.env.VITE_USE_MOCK_DATA === 'true';

export const dataSource = {
  async getUsers(): Promise<User[]> {
    if (USE_MOCK) {
      console.log('Using MOCK users');
      return mockUsers;
    }
    console.log('Using REAL users from Supabase');
    return await dbService.getAllProfiles();
  },

  async getCurrentUser(): Promise<User> {
    if (USE_MOCK) {
      console.log('Using MOCK current user');
      return mockCurrentUser;
    }
    console.log('Using REAL user from Supabase');
    const sessionData = await dbService.getProfile('current-user-id');
    return sessionData || mockCurrentUser; // Fallback
  },

  async getMatches(): Promise<Match[]> {
    if (USE_MOCK) {
      console.log('Using MOCK matches');
      return mockMatches;
    }
    console.log('Using REAL matches from Supabase');
    return await dbService.getMatches();
  },

  async getConversations() {
    if (USE_MOCK) {
      console.log('Using MOCK conversations');
      return mockConversations;
    }
    console.log('Using REAL conversations from Supabase');
    return await dbService.getConversations();
  },
};
```

### Environment Configuration

```typescript
// .env.local or .env.development
VITE_USE_MOCK_DATA=true

// .env.production
VITE_USE_MOCK_DATA=false
```

### Usage in Components

```typescript
// src/app/pages/Dashboard.tsx
import { dataSource } from '../lib/dataSource';

export function Dashboard() {
  const [users, setUsers] = useState<User[]>([]);

  useEffect(() => {
    const loadUsers = async () => {
      // Automatically uses mock or real based on env
      const data = await dataSource.getUsers();
      setUsers(data);
    };
    loadUsers();
  }, []);

  return (
    <div>
      <h1>Users ({users.length})</h1>
      {users.map(user => (
        <UserCard key={user.id} user={user} />
      ))}
    </div>
  );
}
```

### Advantages
✅ Single source of truth
✅ Easy environment switching
✅ Minimal code changes
✅ Great for CI/CD

### Disadvantages
❌ All-or-nothing switching
❌ Can't mix real + mock in same session

---

## 2. Feature Flag Strategy

### Concept
Use granular flags to control which features use real vs mock data.

### Implementation

```typescript
// src/app/lib/featureFlags.ts
export const featureFlags = {
  // Chat features
  useRealMessaging: import.meta.env.VITE_REAL_MESSAGES === 'true',
  useRealMatching: import.meta.env.VITE_REAL_MATCHING === 'true',
  
  // Data features
  useRealProfiles: import.meta.env.VITE_REAL_PROFILES === 'true',
  useRealConversations: import.meta.env.VITE_REAL_CONVERSATIONS === 'true',
  
  // UI features
  showDebugPanel: import.meta.env.VITE_DEBUG_PANEL === 'true',
};

export const mixedDataSource = {
  async getUsers(): Promise<User[]> {
    if (!featureFlags.useRealProfiles) {
      return mockUsers;
    }
    return await dbService.getAllProfiles();
  },

  async getMessages(conversationId: string): Promise<Message[]> {
    if (!featureFlags.useRealMessaging) {
      return mockMessages.filter(m => m.conversationId === conversationId);
    }
    return await dbService.getMessages(conversationId);
  },

  async sendMessage(conversationId: string, text: string): Promise<Message> {
    if (!featureFlags.useRealMessaging) {
      const mockMsg: Message = {
        id: `mock-${Date.now()}`,
        conversationId,
        senderId: 'current-user',
        text,
        createdAt: new Date().toISOString(),
      };
      console.log('Mock: Message sent locally only', mockMsg);
      return mockMsg;
    }
    return await dbService.sendMessage(conversationId, text);
  },
};
```

### Environment Configuration

```typescript
// .env.development
VITE_REAL_MESSAGES=false
VITE_REAL_MATCHING=false
VITE_REAL_PROFILES=true
VITE_REAL_CONVERSATIONS=false
VITE_DEBUG_PANEL=true

// .env.production
VITE_REAL_MESSAGES=true
VITE_REAL_MATCHING=true
VITE_REAL_PROFILES=true
VITE_REAL_CONVERSATIONS=true
VITE_DEBUG_PANEL=false
```

### Usage

```typescript
// Works with real profiles, mock messages
const users = await mixedDataSource.getUsers(); // REAL
const messages = await mixedDataSource.getMessages(convId); // MOCK
```

### Advantages
✅ Fine-grained control
✅ Can mix real + mock
✅ Easy to enable features incrementally
✅ Great for A/B testing

### Disadvantages
⚠️ More environment variables
⚠️ Complexity with many flags

---

## 3. Fallback Strategy

### Concept
Use real data when available, fall back to mock when it fails.

### Implementation

```typescript
// src/app/lib/intelligentDataSource.ts
export const intelligentDataSource = {
  async getUsers(): Promise<User[]> {
    try {
      console.log('Trying to fetch REAL users...');
      const realUsers = await dbService.getAllProfiles();
      if (realUsers && realUsers.length > 0) {
        console.log('✅ Got REAL users:', realUsers.length);
        return realUsers;
      }
    } catch (error) {
      console.warn('⚠️ Failed to fetch real users:', error);
    }

    console.log('📦 Falling back to MOCK users');
    return mockUsers;
  },

  async getConversations(): Promise<Conversation[]> {
    try {
      console.log('Trying to fetch REAL conversations...');
      const realConvs = await dbService.getConversations();
      if (realConvs && realConvs.length > 0) {
        console.log('✅ Got REAL conversations:', realConvs.length);
        return realConvs;
      }
    } catch (error) {
      console.warn('⚠️ Failed to fetch conversations:', error);
    }

    console.log('📦 Falling back to MOCK conversations');
    return mockConversations;
  },

  async sendMessage(
    conversationId: string,
    text: string
  ): Promise<Message | null> {
    try {
      console.log('Trying to send REAL message...');
      const message = await dbService.sendMessage(conversationId, text);
      console.log('✅ Message sent to Supabase');
      return message;
    } catch (error) {
      console.warn('⚠️ Failed to save to database:', error);
    }

    // Show to user locally
    console.log('📦 Message will display locally (offline mode)');
    return {
      id: `offline-${Date.now()}`,
      conversationId,
      senderId: 'current-user',
      text,
      createdAt: new Date().toISOString(),
    };
  },
};
```

### Usage

```typescript
// Automatically tries real, falls back to mock
const users = await intelligentDataSource.getUsers();

// Great for offline support
const message = await intelligentDataSource.sendMessage(convId, 'Hello');
// If offline: shows locally
// If online: saves to Supabase
```

### Advantages
✅ Automatic offline support
✅ User-friendly
✅ No extra configuration
✅ Great for reliability

### Disadvantages
❌ May hide errors
❌ Hard to know which data is which

---

## 4. User Control Strategy

### Concept
Let users toggle between real and mock data via UI.

### Implementation

```typescript
// src/app/contexts/DataSourceContext.tsx
import { createContext, useContext, useState } from 'react';

interface DataSourceContextType {
  useMockData: boolean;
  setUseMockData: (value: boolean) => void;
  currentSource: 'real' | 'mock';
}

const DataSourceContext = createContext<DataSourceContextType | null>(null);

export function DataSourceProvider({ children }: { children: React.ReactNode }) {
  const [useMockData, setUseMockData] = useState(
    import.meta.env.VITE_USE_MOCK_DATA === 'true'
  );

  return (
    <DataSourceContext.Provider
      value={{
        useMockData,
        setUseMockData,
        currentSource: useMockData ? 'mock' : 'real',
      }}
    >
      {children}
    </DataSourceContext.Provider>
  );
}

export function useDataSource() {
  const context = useContext(DataSourceContext);
  if (!context) {
    throw new Error('useDataSource must be used within DataSourceProvider');
  }
  return context;
}
```

### Debug Panel Component

```typescript
// src/app/components/DebugPanel.tsx
import { useDataSource } from '../contexts/DataSourceContext';

export function DebugPanel() {
  const { useMockData, setUseMockData, currentSource } = useDataSource();

  if (!import.meta.env.VITE_DEBUG_PANEL) return null;

  return (
    <div className="fixed bottom-4 right-4 p-4 bg-gray-900 text-white rounded-lg text-sm">
      <h3 className="font-bold mb-2">🔍 Debug Panel</h3>
      
      <div className="mb-3">
        <p>Current Source: <span className="font-bold">{currentSource.toUpperCase()}</span></p>
      </div>

      <button
        onClick={() => setUseMockData(!useMockData)}
        className={`px-3 py-1 rounded font-semibold ${
          useMockData 
            ? 'bg-blue-600 hover:bg-blue-700' 
            : 'bg-green-600 hover:bg-green-700'
        }`}
      >
        Switch to {useMockData ? 'REAL' : 'MOCK'} Data
      </button>

      <div className="mt-3 text-xs text-gray-400">
        <p>Toggle to instantly switch data sources</p>
      </div>
    </div>
  );
}
```

### Usage

```typescript
// src/app/App.tsx
import { DataSourceProvider } from './contexts/DataSourceContext';
import { DebugPanel } from './components/DebugPanel';

export default function App() {
  return (
    <DataSourceProvider>
      <DashboardLayout>
        {/* Your app routes */}
        <DebugPanel />
      </DashboardLayout>
    </DataSourceProvider>
  );
}
```

### Advantages
✅ Real-time switching
✅ No server restart needed
✅ Great for testing
✅ User-friendly

### Disadvantages
⚠️ Context overhead
⚠️ Need to wire up all components
⚠️ Can cause confusion in production

---

## 5. Hybrid Strategy (Recommended)

### Concept
Combine multiple strategies for maximum flexibility.

### Implementation

```typescript
// src/app/lib/hybridDataSource.ts
import { useDataSource } from '../contexts/DataSourceContext';
import { featureFlags } from './featureFlags';

export function createHybridDataSource() {
  const { useMockData } = useDataSource();

  return {
    async getUsers() {
      // Check both context and feature flags
      const shouldUseMock = useMockData || !featureFlags.useRealProfiles;
      
      if (shouldUseMock) {
        console.log('Using MOCK users (override or flag)');
        return mockUsers;
      }

      // Try real with fallback
      try {
        const users = await dbService.getAllProfiles();
        return users.length > 0 ? users : mockUsers;
      } catch (error) {
        console.warn('Falling back to mock:', error);
        return mockUsers;
      }
    },

    async getMessages(conversationId: string) {
      const shouldUseMock = 
        useMockData || 
        !featureFlags.useRealMessaging;

      if (shouldUseMock) {
        return mockMessages.filter(
          m => m.conversationId === conversationId
        );
      }

      try {
        const messages = await dbService.getMessages(conversationId);
        return messages.length > 0 ? messages : mockMessages;
      } catch (error) {
        console.warn('Falling back to mock messages:', error);
        return mockMessages.filter(
          m => m.conversationId === conversationId
        );
      }
    },

    // Add more methods...
  };
}
```

### Complete Setup

```typescript
// src/app/App.tsx
import { DataSourceProvider } from './contexts/DataSourceContext';
import { DebugPanel } from './components/DebugPanel';

export default function App() {
  return (
    <DataSourceProvider>
      <DashboardLayout>
        {/* Your routes */}
        {import.meta.env.VITE_DEBUG_PANEL === 'true' && <DebugPanel />}
      </DashboardLayout>
    </DataSourceProvider>
  );
}
```

### Usage in Components

```typescript
// src/app/pages/Messages.tsx
import { useDataSource } from '../contexts/DataSourceContext';
import { createHybridDataSource } from '../lib/hybridDataSource';

export function Messages() {
  const dataSource = createHybridDataSource();
  const { currentSource } = useDataSource();
  const [messages, setMessages] = useState<Message[]>([]);

  useEffect(() => {
    const loadMessages = async () => {
      const msgs = await dataSource.getMessages(conversationId);
      setMessages(msgs);
    };
    loadMessages();
  }, [conversationId]);

  return (
    <div>
      <div className="text-sm text-gray-500">
        Data: {currentSource.toUpperCase()}
      </div>
      {messages.map(msg => (
        <Message key={msg.id} message={msg} />
      ))}
    </div>
  );
}
```

### Advantages
✅ Maximum flexibility
✅ Combines all benefits
✅ Easy to debug
✅ Great for all scenarios

### Disadvantages
⚠️ Most complex
⚠️ Requires careful maintenance

---

## 6. Testing Strategy

### Concept
Use different data for unit tests, integration tests, and E2E tests.

### Implementation

```typescript
// src/app/lib/__tests__/dataSource.test.ts
import { describe, it, expect, vi } from 'vitest';
import { dataSource } from '../dataSource';
import * as dbService from '../dbService';

vi.mock('../dbService');

describe('dataSource', () => {
  it('should return mock users when USE_MOCK is true', async () => {
    // Set env var
    import.meta.env.VITE_USE_MOCK_DATA = 'true';

    const users = await dataSource.getUsers();
    expect(users.length).toBeGreaterThan(0);
    expect(dbService.getAllProfiles).not.toHaveBeenCalled();
  });

  it('should fetch real users when USE_MOCK is false', async () => {
    import.meta.env.VITE_USE_MOCK_DATA = 'false';
    vi.mocked(dbService.getAllProfiles).mockResolvedValue([
      { id: '1', name: 'Test User' },
    ]);

    const users = await dataSource.getUsers();
    expect(users).toHaveLength(1);
    expect(dbService.getAllProfiles).toHaveBeenCalled();
  });
});
```

### Integration Tests

```typescript
// src/app/lib/__tests__/messages.integration.test.ts
import { describe, it, expect, beforeEach } from 'vitest';
import { intelligentDataSource } from '../intelligentDataSource';

describe('Messages Integration', () => {
  beforeEach(() => {
    // Reset state
    vi.clearAllMocks();
  });

  it('should handle offline scenario gracefully', async () => {
    // Simulate offline
    vi.stubGlobal('fetch', () => {
      throw new Error('Network error');
    });

    const message = await intelligentDataSource.sendMessage(
      'conv-1',
      'Hello'
    );

    expect(message).toBeDefined();
    expect(message?.id).toContain('offline-');
  });
});
```

---

## 7. Best Practices & Tips

### ✅ Do's

1. **Log Data Source**
   ```typescript
   console.log(`📦 Using ${useMockData ? 'MOCK' : 'REAL'} data for users`);
   ```

2. **Show to User (Dev)**
   ```typescript
   // In debug panel or UI
   <div className="text-xs">
     Data: <span className="font-bold">{currentSource}</span>
   </div>
   ```

3. **Keep Mock Data Fresh**
   ```typescript
   // Mock data should mirror real schema
   export const mockUser: User = {
     id: 'mock-1',
     name: 'Test User',
     email: 'test@example.com',
     // All required fields
   };
   ```

4. **Separate Concerns**
   ```typescript
   // dataSource.ts - handles switching
   // dbService.ts - only real DB
   // mockData.ts - only mock data
   ```

5. **Environment-Based Defaults**
   ```typescript
   const isDev = import.meta.env.MODE === 'development';
   const defaultUseMock = isDev && 
     import.meta.env.VITE_USE_MOCK_DATA !== 'false';
   ```

### ❌ Don'ts

1. ❌ Don't hardcode mock/real toggles
2. ❌ Don't mix mock data with real in production
3. ❌ Don't forget to test both paths
4. ❌ Don't create stale mock data
5. ❌ Don't expose data source details to users

---

## 8. Configuration Examples

### For Development

```bash
# .env.development
VITE_USE_MOCK_DATA=true
VITE_DEBUG_PANEL=true
VITE_REAL_MESSAGES=false
VITE_REAL_PROFILES=true
```

### For Staging

```bash
# .env.staging
VITE_USE_MOCK_DATA=false
VITE_DEBUG_PANEL=true
VITE_REAL_MESSAGES=true
VITE_REAL_PROFILES=true
```

### For Production

```bash
# .env.production
VITE_USE_MOCK_DATA=false
VITE_DEBUG_PANEL=false
VITE_REAL_MESSAGES=true
VITE_REAL_PROFILES=true
```

---

## 9. Quick Reference

| Strategy | When to Use | Complexity | Flexibility |
|----------|-------------|-----------|------------|
| **Environment-Based** | Simple projects | ⭐ Low | ⭐ Low |
| **Feature Flags** | Growing projects | ⭐⭐ Medium | ⭐⭐ Medium |
| **Fallback** | Need reliability | ⭐⭐ Medium | ⭐⭐ Medium |
| **User Control** | Need testing | ⭐⭐ Medium | ⭐⭐⭐ High |
| **Hybrid** | Enterprise | ⭐⭐⭐ High | ⭐⭐⭐ High |

---

## 10. Migration Path

### Phase 1: Start Simple
Use **Environment-Based** strategy

### Phase 2: Add Granularity
Add **Feature Flags**

### Phase 3: Improve UX
Add **User Control** via debug panel

### Phase 4: Increase Reliability
Add **Fallback** logic

### Phase 5: Production Ready
Implement **Hybrid** strategy for all features

---

## Conclusion

Choose the strategy that fits your needs:
- **Small app?** → Environment-Based
- **Multiple features?** → Feature Flags
- **Need offline?** → Fallback
- **Heavy development?** → User Control
- **Enterprise?** → Hybrid

Start simple, add complexity as needed! 🚀
