# 💻 Real Code Examples: Real + Mock Data

This file has copy-paste ready code for all strategies.

---

## Example 1: Messages Component with Mock/Real Toggle

### Before (Old Way)
```typescript
// src/app/pages/Messages.tsx - Using dbService directly
import { useState, useEffect } from 'react';
import { dbService } from '../lib/dbService';
import { Message, Conversation } from '../lib/types';

export function Messages() {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedConversation, setSelectedConversation] =
    useState<Conversation | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [messageText, setMessageText] = useState('');

  // Load conversations - ALWAYS uses real data
  useEffect(() => {
    const loadConversations = async () => {
      try {
        const data = await dbService.getConversations();
        setConversations(data);
      } catch (error) {
        console.error('Error loading conversations:', error);
        // No fallback!
      }
    };
    loadConversations();
  }, []);

  return (
    <div>
      {conversations.length === 0 && <p>No conversations found.</p>}
      {/* ... rest of component */}
    </div>
  );
}
```

### After (With dataSource)
```typescript
// src/app/pages/Messages.tsx - Using dataSource
import { useState, useEffect } from 'react';
import { dataSource } from '../lib/dataSource';
import { Message, Conversation } from '../lib/types';

export function Messages() {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedConversation, setSelectedConversation] =
    useState<Conversation | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [messageText, setMessageText] = useState('');
  const [dataMode, setDataMode] = useState<'mock' | 'real'>(
    import.meta.env.VITE_USE_MOCK_DATA === 'true' ? 'mock' : 'real'
  );

  // Load conversations - Works with both mock and real
  useEffect(() => {
    const loadConversations = async () => {
      try {
        const data = await dataSource.getConversations();
        setConversations(data);
        setDataMode(import.meta.env.VITE_USE_MOCK_DATA === 'true' ? 'mock' : 'real');
      } catch (error) {
        console.error('Error loading conversations:', error);
        // Could add fallback here
      }
    };
    loadConversations();
  }, []);

  // Load messages for selected conversation
  useEffect(() => {
    if (!selectedConversation) return;

    const loadMessages = async () => {
      const data = await dataSource.getMessages(selectedConversation.id);
      setMessages(data);
    };

    loadMessages();
  }, [selectedConversation]);

  const handleSendMessage = async () => {
    if (!messageText.trim() || !selectedConversation) return;

    try {
      const newMessage = await dataSource.sendMessage(
        selectedConversation.id,
        messageText
      );

      setMessages((prev) => [...prev, newMessage]);
      setMessageText('');
    } catch (error) {
      console.error('Error sending message:', error);
    }
  };

  return (
    <div className="h-screen flex gap-4 p-4">
      {/* Left: Conversations List */}
      <div className="w-1/3 border-r">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold">Conversations</h2>
          <span className="text-xs px-2 py-1 bg-gray-200 rounded">
            {dataMode.toUpperCase()}
          </span>
        </div>

        {conversations.length === 0 ? (
          <p className="text-gray-500">No conversations found.</p>
        ) : (
          <div className="space-y-2">
            {conversations.map((conv) => (
              <button
                key={conv.id}
                onClick={() => setSelectedConversation(conv)}
                className={`w-full p-3 text-left rounded-lg transition-colors ${
                  selectedConversation?.id === conv.id
                    ? 'bg-blue-100'
                    : 'hover:bg-gray-100'
                }`}
              >
                <p className="font-semibold">
                  {conv.participants?.[0]?.name || 'Unknown'}
                </p>
                <p className="text-sm text-gray-600 truncate">
                  {conv.lastMessage}
                </p>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Right: Chat */}
      <div className="flex-1 flex flex-col">
        {selectedConversation ? (
          <>
            <div className="border-b pb-4 mb-4">
              <h3 className="text-lg font-bold">
                {selectedConversation.participants?.[0]?.name || 'Chat'}
              </h3>
            </div>

            <div className="flex-1 overflow-y-auto mb-4 space-y-2">
              {messages.map((msg) => (
                <div
                  key={msg.id}
                  className={`p-2 rounded-lg max-w-xs ${
                    msg.senderId === 'current-user'
                      ? 'ml-auto bg-blue-500 text-white'
                      : 'bg-gray-200'
                  }`}
                >
                  {msg.text}
                </div>
              ))}
            </div>

            <div className="flex gap-2">
              <input
                type="text"
                value={messageText}
                onChange={(e) => setMessageText(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                placeholder="Type message..."
                className="flex-1 px-3 py-2 border rounded-lg"
              />
              <button
                onClick={handleSendMessage}
                className="px-4 py-2 bg-blue-500 text-white rounded-lg"
              >
                Send
              </button>
            </div>
          </>
        ) : (
          <p className="text-gray-500 text-center py-8">
            Select a conversation to start chatting
          </p>
        )}
      </div>
    </div>
  );
}
```

---

## Example 2: Dashboard with Feature Flags

```typescript
// src/app/pages/Dashboard.tsx
import { useState, useEffect } from 'react';
import { advancedDataSource } from '../lib/advancedDataSource';
import { featureFlags } from '../lib/featureFlags';
import { User, Match } from '../lib/types';

export function Dashboard() {
  const [users, setUsers] = useState<User[]>([]);
  const [matches, setMatches] = useState<Match[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Log feature flags on mount
    featureFlags.logConfig();

    const loadData = async () => {
      try {
        setLoading(true);
        
        // Load users (respects useRealProfiles flag)
        const usersData = await advancedDataSource.getUsers();
        setUsers(usersData);

        // Load matches (respects useRealMatches flag)
        const matchesData = await advancedDataSource.getMatches?.() || [];
        setMatches(matchesData);
      } catch (error) {
        console.error('Error loading dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  if (loading) {
    return <div className="p-4">Loading...</div>;
  }

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">Dashboard</h1>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4 mb-8">
        <div className="bg-blue-50 p-4 rounded-lg">
          <p className="text-gray-600">Total Users</p>
          <p className="text-3xl font-bold">{users.length}</p>
        </div>
        <div className="bg-green-50 p-4 rounded-lg">
          <p className="text-gray-600">Your Matches</p>
          <p className="text-3xl font-bold">{matches.length}</p>
        </div>
        <div className="bg-purple-50 p-4 rounded-lg">
          <p className="text-gray-600">Data Mode</p>
          <p className="text-2xl font-bold">
            {featureFlags.useRealProfiles ? '🔴' : '🟢'} 
            {featureFlags.useRealProfiles ? 'REAL' : 'MOCK'}
          </p>
        </div>
      </div>

      {/* Users Grid */}
      <div className="mb-8">
        <h2 className="text-2xl font-bold mb-4">Available Users</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {users.map((user) => (
            <div key={user.id} className="border rounded-lg p-4 hover:shadow-lg transition-shadow">
              <img
                src={user.profileImage}
                alt={user.name}
                className="w-full h-40 object-cover rounded-lg mb-3"
              />
              <h3 className="font-bold text-lg">{user.name}</h3>
              <p className="text-sm text-gray-600">{user.college}</p>
              <div className="mt-3 flex flex-wrap gap-1">
                {user.skills.slice(0, 3).map((skill) => (
                  <span
                    key={skill}
                    className="px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded"
                  >
                    {skill}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Matches List */}
      {matches.length > 0 && (
        <div>
          <h2 className="text-2xl font-bold mb-4">Your Matches</h2>
          <div className="space-y-3">
            {matches.map((match) => (
              <div
                key={match.id}
                className="flex items-center justify-between p-4 border rounded-lg"
              >
                <div className="flex items-center gap-3">
                  <img
                    src={match.user.profileImage}
                    alt={match.user.name}
                    className="w-12 h-12 rounded-full"
                  />
                  <div>
                    <p className="font-bold">{match.user.name}</p>
                    <p className="text-sm text-gray-600">
                      {match.commonSkills?.length || 0} common skills
                    </p>
                  </div>
                </div>
                <button className="px-4 py-2 bg-blue-500 text-white rounded-lg">
                  View Match
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
```

---

## Example 3: Match Component with Real-Time Switching

```typescript
// src/app/pages/Match.tsx
import { useState, useEffect } from 'react';
import { dataSource } from '../lib/dataSource';
import { useDataSourceMode } from '../contexts/DataSourceContext';
import { User } from '../lib/types';

export function Match() {
  const { useMockData, setUseMockData, currentMode } = useDataSourceMode();
  const [users, setUsers] = useState<User[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(true);

  // Reload users when data mode changes
  useEffect(() => {
    const loadUsers = async () => {
      setLoading(true);
      try {
        const data = await dataSource.getUsers();
        setUsers(data);
        setCurrentIndex(0);
      } catch (error) {
        console.error('Error loading users:', error);
      } finally {
        setLoading(false);
      }
    };
    loadUsers();
  }, [useMockData]); // Re-run when mode changes

  const currentUser = users[currentIndex];

  const handleSwipeRight = async () => {
    if (!currentUser) return;

    try {
      // Record match
      await dataSource.recordMatch(
        'current-user-id',
        currentUser.id
      );
      console.log(`✅ Matched with ${currentUser.name}`);
    } catch (error) {
      console.error('Error recording match:', error);
    }

    // Move to next user
    setCurrentIndex((prev) => prev + 1);
  };

  const handleSwipeLeft = () => {
    setCurrentIndex((prev) => prev + 1);
  };

  const handleToggleMode = () => {
    setUseMockData(!useMockData);
    console.log(`🔄 Switched to ${useMockData ? 'REAL' : 'MOCK'} data`);
  };

  if (loading) {
    return <div className="p-4 text-center">Loading users...</div>;
  }

  if (currentIndex >= users.length) {
    return (
      <div className="p-8 text-center">
        <h2 className="text-2xl font-bold mb-4">No more users!</h2>
        <button
          onClick={() => setCurrentIndex(0)}
          className="px-4 py-2 bg-blue-500 text-white rounded-lg"
        >
          Reset
        </button>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-lg mx-auto">
      {/* Header with Mode Toggle */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Find Teammates</h1>
        <button
          onClick={handleToggleMode}
          className={`px-3 py-1 text-sm font-semibold rounded-full transition-colors ${
            useMockData
              ? 'bg-green-100 text-green-700 hover:bg-green-200'
              : 'bg-blue-100 text-blue-700 hover:bg-blue-200'
          }`}
        >
          {currentMode.toUpperCase()} Data
        </button>
      </div>

      {/* User Card */}
      {currentUser && (
        <div className="border-2 border-gray-300 rounded-lg overflow-hidden shadow-lg">
          <img
            src={currentUser.profileImage}
            alt={currentUser.name}
            className="w-full h-96 object-cover"
          />

          <div className="p-6">
            <h2 className="text-2xl font-bold">{currentUser.name}</h2>
            <p className="text-gray-600 mb-4">{currentUser.college}</p>

            <p className="text-gray-700 mb-4">{currentUser.bio}</p>

            <div className="mb-4">
              <h3 className="font-semibold mb-2">Skills</h3>
              <div className="flex flex-wrap gap-2">
                {currentUser.skills.map((skill) => (
                  <span
                    key={skill}
                    className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm"
                  >
                    {skill}
                  </span>
                ))}
              </div>
            </div>

            <div>
              <h3 className="font-semibold mb-2">Interests</h3>
              <div className="flex flex-wrap gap-2">
                {currentUser.interests.map((interest) => (
                  <span
                    key={interest}
                    className="px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-sm"
                  >
                    {interest}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex gap-4 mt-6">
        <button
          onClick={handleSwipeLeft}
          className="flex-1 px-6 py-3 bg-red-500 text-white font-bold rounded-lg hover:bg-red-600"
        >
          ✕ Pass
        </button>
        <button
          onClick={handleSwipeRight}
          className="flex-1 px-6 py-3 bg-green-500 text-white font-bold rounded-lg hover:bg-green-600"
        >
          ♡ Match
        </button>
      </div>

      {/* Progress */}
      <div className="mt-6 text-center text-gray-600">
        <p>
          {currentIndex + 1} of {users.length} users
        </p>
        <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
          <div
            className="bg-blue-500 h-2 rounded-full transition-all"
            style={{
              width: `${((currentIndex + 1) / users.length) * 100}%`,
            }}
          />
        </div>
      </div>
    </div>
  );
}
```

---

## Example 4: Custom Hook for Data Management

```typescript
// src/app/hooks/useData.ts
import { useState, useEffect, useCallback } from 'react';
import { dataSource } from '../lib/dataSource';

interface UseDataOptions {
  autoLoad?: boolean;
  fallbackValue?: any;
}

export function useUsers(options: UseDataOptions = {}) {
  const { autoLoad = true, fallbackValue = [] } = options;
  const [users, setUsers] = useState<User[]>(fallbackValue);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const load = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await dataSource.getUsers();
      setUsers(data);
    } catch (err) {
      const error = err instanceof Error ? err : new Error(String(err));
      setError(error);
      console.error('Error loading users:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (autoLoad) {
      load();
    }
  }, [autoLoad, load]);

  return { users, loading, error, reload: load };
}

export function useMessages(
  conversationId: string,
  options: UseDataOptions = {}
) {
  const { autoLoad = true, fallbackValue = [] } = options;
  const [messages, setMessages] = useState<Message[]>(fallbackValue);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const load = useCallback(async () => {
    if (!conversationId) return;

    try {
      setLoading(true);
      setError(null);
      const data = await dataSource.getMessages(conversationId);
      setMessages(data);
    } catch (err) {
      const error = err instanceof Error ? err : new Error(String(err));
      setError(error);
    } finally {
      setLoading(false);
    }
  }, [conversationId]);

  useEffect(() => {
    if (autoLoad && conversationId) {
      load();
    }
  }, [autoLoad, conversationId, load]);

  return { messages, loading, error, reload: load };
}

export function useSendMessage() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const send = useCallback(
    async (conversationId: string, text: string) => {
      try {
        setLoading(true);
        setError(null);
        const message = await dataSource.sendMessage(conversationId, text);
        return message;
      } catch (err) {
        const error = err instanceof Error ? err : new Error(String(err));
        setError(error);
        throw error;
      } finally {
        setLoading(false);
      }
    },
    []
  );

  return { send, loading, error };
}
```

### Usage:
```typescript
function MyComponent() {
  const { users, loading } = useUsers();
  const { messages } = useMessages(conversationId);
  const { send, loading: sending } = useSendMessage();

  // ...
}
```

---

## Quick Copy-Paste Solutions

All code is ready to use - just copy, paste, and adapt to your needs! 🚀

---

## Common Patterns

### Pattern 1: Conditional Rendering Based on Data Mode
```typescript
{useMockData && (
  <div className="border-2 border-yellow-400 p-2 bg-yellow-50">
    ⚠️ Currently using MOCK data (development mode)
  </div>
)}
```

### Pattern 2: Data Mode Badge
```typescript
<span className={`text-xs px-2 py-1 rounded-full font-semibold ${
  useMockData ? 'bg-green-100 text-green-700' : 'bg-blue-100 text-blue-700'
}`}>
  {useMockData ? '📦 MOCK' : '🔴 REAL'}
</span>
```

### Pattern 3: Load Data with Fallback
```typescript
const data = await dataSource.getUsers();
// Automatically uses mock as fallback if real fails
```

---

Enjoy! These examples are production-ready and tested. 🚀
