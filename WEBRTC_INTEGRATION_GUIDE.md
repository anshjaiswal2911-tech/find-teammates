# 🎬 WebRTC Integration Guide for CollabNest

## Quick Start - Implement Jitsi Meet (Recommended)

### Step 1: Install Dependency (5 minutes)
```bash
npm install @jitsi/react-sdk
```

### Step 2: Create Jitsi Component (20 minutes)

Create `src/app/components/JitsiMeeting.tsx`:

```typescript
import { useEffect, useRef } from 'react';
import { useAuth } from '../contexts/AuthContext';

interface JitsiMeetingProps {
  roomName: string;
  displayName: string;
  onClose: () => void;
}

export function JitsiMeeting({
  roomName,
  displayName,
  onClose,
}: JitsiMeetingProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const jitsiApi = useRef<any>(null);
  const { user } = useAuth();

  useEffect(() => {
    if (!containerRef.current) return;

    // Dynamically load Jitsi script
    const script = document.createElement('script');
    script.src = 'https://meet.jitsi.net/external_api.js';
    script.async = true;
    
    script.onload = () => {
      const options = {
        roomName: roomName,
        height: '100%',
        width: '100%',
        configOverwrite: {
          startWithAudioMuted: false,
          startWithVideoMuted: false,
          enableWelcomePage: false,
          disableSimulcast: false,
        },
        interfaceConfigOverwrite: {
          DISABLE_INVITE: false,
          DISABLE_JOIN_LEAVE_NOTIFICATIONS: false,
          SHOW_JITSI_WATERMARK: true,
        },
        parentNode: containerRef.current,
        userInfo: {
          displayName: displayName || user?.name || 'Guest',
          email: user?.email,
        },
      };

      // @ts-ignore
      const api = new window.JitsiMeetExternalAPI(
        'meet.jitsi.net',
        options
      );

      jitsiApi.current = api;

      // Handle events
      api.addEventListener('videoConferenceJoined', () => {
        console.log('User joined');
      });

      api.addEventListener('videoConferenceLeft', onClose);

      return () => {
        if (api) api.dispose();
      };
    };

    document.body.appendChild(script);

    return () => {
      if (jitsiApi.current) {
        jitsiApi.current.dispose();
      }
    };
  }, [roomName, displayName, user, onClose]);

  return (
    <div
      ref={containerRef}
      style={{
        width: '100%',
        height: '100%',
        backgroundColor: '#000',
      }}
    />
  );
}
```

### Step 3: Update MeetingRoom.tsx (30 minutes)

Replace the video interface section with Jitsi component:

```typescript
import { JitsiMeeting } from '../components/JitsiMeeting';

// In MeetingRoom component
if (activeMeeting) {
  return (
    <DashboardLayout>
      <div className="h-[calc(100vh-8rem)] flex flex-col">
        <div className="flex items-center justify-between mb-4 p-4">
          <div>
            <h1 className="text-xl md:text-2xl font-bold text-gray-900">
              {activeMeeting.title}
            </h1>
            <p className="text-xs md:text-sm text-gray-500">
              Live Video Session • WebRTC Powered
            </p>
          </div>
          <Badge className="bg-green-100 text-green-700">
            <span className="animate-pulse mr-1">●</span> Live
          </Badge>
        </div>

        {/* Jitsi Meeting Component */}
        <div className="flex-1">
          <JitsiMeeting
            roomName={activeMeeting.meetingId}
            displayName={user?.name || 'User'}
            onClose={handleEndMeeting}
          />
        </div>

        {/* Notification */}
        <AnimatePresence>
          {showNotification && (
            <motion.div
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -50 }}
              className="fixed bottom-4 right-4 bg-green-500 text-white px-4 py-3 rounded-lg shadow-lg"
            >
              {notificationMessage}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </DashboardLayout>
  );
}
```

### Step 4: Test Integration (15 minutes)

```bash
# Run development server
npm run dev

# Navigate to /meeting-room
# Create a meeting and test joining
# Test with another tab/device for two-person call
```

---

## Alternative: Simple.WebRTC (For Full Control)

### Setup (1 hour total)

#### Install
```bash
npm install simple-webrtc
```

#### Create Component

```typescript
import { useEffect, useRef, useState } from 'react';
import SimpleWebRTC from 'simplewebrtc';

export function SimpleWebRTCMeeting({
  roomName,
  displayName,
  onClose,
}: {
  roomName: string;
  displayName: string;
  onClose: () => void;
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const webrtcRef = useRef<any>(null);
  const [participants, setParticipants] = useState<any[]>([]);
  const [localStream, setLocalStream] = useState<any>(null);

  useEffect(() => {
    const webrtc = new SimpleWebRTC({
      url: process.env.REACT_APP_SIGNALING_SERVER || 'http://localhost:8888',
      localVideoEl: containerRef.current ? containerRef.current.querySelector('#localVideo') : null,
      remoteVideosEl: containerRef.current ? containerRef.current.querySelector('#remoteVideos') : null,
      autoRequestMedia: true,
      localScreenEl: containerRef.current ? containerRef.current.querySelector('#screenShare') : null,
      nick: displayName,
    });

    webrtcRef.current = webrtc;

    webrtc.on('readyToCall', () => {
      webrtc.joinRoom(roomName);
    });

    webrtc.on('videoAdded', (video: any, peer: any) => {
      console.log('Peer joined:', peer.nick);
      setParticipants(prev => [...prev, { id: peer.id, nick: peer.nick }]);
    });

    webrtc.on('videoRemoved', (video: any, peer: any) => {
      console.log('Peer left:', peer.nick);
      setParticipants(prev => prev.filter(p => p.id !== peer.id));
    });

    webrtc.on('localScreen', (stream: any) => {
      console.log('Screen sharing started');
    });

    return () => {
      webrtc.leaveRoom();
      webrtc.disconnect();
    };
  }, [roomName, displayName]);

  return (
    <div ref={containerRef} className="w-full h-full bg-black flex flex-col">
      {/* Local video */}
      <div className="flex-1 flex items-center justify-center">
        <video
          id="localVideo"
          autoPlay
          muted
          className="w-full h-full object-cover"
        />
      </div>

      {/* Remote videos */}
      <div
        id="remoteVideos"
        className="grid grid-cols-2 md:grid-cols-3 gap-2 p-4 bg-gray-900 max-h-1/3 overflow-y-auto"
      />

      {/* Screen share */}
      <div
        id="screenShare"
        className="hidden"
      />

      {/* Controls */}
      <div className="bg-gray-800 p-4 flex justify-center gap-4">
        <button
          onClick={() => webrtcRef.current?.toggleLocalAudio()}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded"
        >
          🎤 Mic
        </button>
        <button
          onClick={() => webrtcRef.current?.toggleLocalVideo()}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded"
        >
          📹 Camera
        </button>
        <button
          onClick={() => webrtcRef.current?.shareScreen()}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded"
        >
          📺 Share Screen
        </button>
        <button
          onClick={onClose}
          className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded"
        >
          ❌ Leave
        </button>
      </div>

      {/* Participants list */}
      <div className="bg-gray-900 text-white p-4 text-sm">
        <p>Participants: {participants.length + 1}</p>
        {participants.map(p => (
          <p key={p.id}>{p.nick}</p>
        ))}
      </div>
    </div>
  );
}
```

---

## Production Deployment

### Option 1: Jitsi Self-Hosted (Most Control)

#### Docker Setup
```yaml
# docker-compose.yml
version: '3.8'

services:
  jitsi:
    image: jitsi/web:stable
    environment:
      JITSI_HOST: your-domain.com
      JITSI_INTERNAL_IP_ADDRESS: 127.0.0.1
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./jitsi/config:/config
```

#### DNS Configuration
```
jitsi.yourdomain.com → Your Server IP
```

### Option 2: Jitsi Cloud (Easiest)
- No setup required
- Uses `meet.jitsi.net` (as in the example above)
- Unlimited free usage
- **Recommended for MVP**

### Option 3: Daily.co (Professional)
```typescript
import DailyIframe from '@daily-co/daily-js';

// Create room
const response = await fetch('https://api.daily.co/v1/rooms', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${process.env.DAILY_API_KEY}`,
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    properties: {
      max_participants: 100,
    },
  }),
});

const room = await response.json();
const iframe = DailyIframe.createFrame({
  iframeStyle: {
    position: 'fixed',
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
  },
  showLeaveButton: true,
  url: room.url,
});
```

---

## Performance Optimization

### Bandwidth Optimization
```typescript
// Auto-adjust quality based on connection
const configOverwrite = {
  resolution: navigator.connection?.effectiveType === '4g' ? 720 : 480,
  constraints: {
    video: {
      height: { max: 720 },
      bandwidth: 2500,
    },
  },
};
```

### Connection Check
```typescript
// Test before joining
async function checkNetworkQuality() {
  const connection = navigator.connection;
  if (!connection) return true;

  const downlink = connection.downlink;
  if (downlink < 2.5) {
    console.warn('Low bandwidth detected - may affect call quality');
  }
  return downlink >= 1;
}
```

---

## Database Schema for Recordings

```sql
-- Meeting recordings
CREATE TABLE meeting_recordings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  meeting_id UUID REFERENCES meetings(id) ON DELETE CASCADE,
  recording_url TEXT NOT NULL,
  duration_seconds INT,
  size_bytes BIGINT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  transcription TEXT,
);

-- Meeting events/logs
CREATE TABLE meeting_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  meeting_id UUID REFERENCES meetings(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id),
  event_type TEXT, -- 'joined', 'left', 'screenshare_started', etc.
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
);
```

---

## Security Considerations

### 1. Meeting Room Access Control
```typescript
// Only allow authorized users
const canJoinMeeting = async (meetingId: string, userId: string) => {
  const { data: meeting } = await supabase
    .from('meetings')
    .select('*')
    .eq('id', meetingId)
    .single();

  if (!meeting) return false;

  // Check if user is host or invited
  return (
    meeting.host_id === userId ||
    meeting.participants.includes(userId)
  );
};
```

### 2. Room Expiry
```typescript
// Auto-delete empty rooms after 24 hours
const cleanupEmptyRooms = async () => {
  const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
  
  await supabase
    .from('meetings')
    .delete()
    .eq('status', 'Ended')
    .lt('updated_at', oneDayAgo.toISOString());
};
```

### 3. Recording Consent
```typescript
// Track recording consent
<AlertDialog>
  <AlertDialogTrigger>Recording Enabled</AlertDialogTrigger>
  <AlertDialogContent>
    <AlertDialogTitle>
      This meeting will be recorded
    </AlertDialogTitle>
    <AlertDialogDescription>
      By joining, you consent to being recorded.
    </AlertDialogDescription>
  </AlertDialogContent>
</AlertDialog>
```

---

## Testing Checklist

- [ ] Audio working (mic + speakers)
- [ ] Video working (camera feed showing)
- [ ] Screen sharing (if using Simple.WebRTC)
- [ ] Chat messages in-call
- [ ] Participant list updating
- [ ] Join/leave notifications
- [ ] Mobile responsiveness
- [ ] Connection quality indicators
- [ ] Network failover
- [ ] Recording (if implemented)

---

## Monitoring & Analytics

### Track Important Metrics
```typescript
// Log meeting events to Supabase
const logMeetingEvent = async (
  meetingId: string,
  eventType: string,
  metadata?: any
) => {
  await supabase.from('meeting_events').insert({
    meeting_id: meetingId,
    user_id: user?.id,
    event_type: eventType,
    metadata: metadata,
  });
};

// Usage
logMeetingEvent(meetingId, 'user_joined', {
  browser: navigator.userAgent,
  bandwidth: navigator.connection?.downlink,
});
```

---

## Cost Analysis

| Solution | Setup Cost | Monthly Cost | Best For |
|----------|-----------|-------------|----------|
| Jitsi Cloud | $0 | $0 | MVP/Hobby |
| Jitsi Self-Hosted | $100 | $50+ | Scale/Control |
| Simple.WebRTC | $50 | $50+ (TURN server) | Custom features |
| Daily.co | $0 | $30-300+ | Professional SaaS |

---

## Migration Path

```
Phase 1 (Week 1): Integrate Jitsi Cloud
├─ Install package
├─ Create component
├─ Update MeetingRoom
└─ Test

Phase 2 (Week 2): Analytics & Database
├─ Add meeting_sessions table
├─ Track events
├─ Add recording support
└─ Implement analytics

Phase 3 (Week 3+): Optimization
├─ Network quality detection
├─ Auto-quality adjustment
├─ Performance monitoring
└─ User analytics dashboard
```

---

## Troubleshooting

### Issue: "Jitsi is not defined"
```typescript
// Solution: Make sure script loads before using
declare global {
  interface Window {
    JitsiMeetExternalAPI: any;
  }
}
```

### Issue: Microphone/Camera Permission Denied
```typescript
// Check permissions
const hasCameraPermission = async () => {
  try {
    const stream = await navigator.mediaDevices.getUserMedia({
      video: true,
      audio: true,
    });
    stream.getTracks().forEach(track => track.stop());
    return true;
  } catch (err) {
    console.error('Permission denied:', err);
    return false;
  }
};
```

### Issue: High Latency/Poor Quality
```typescript
// Reduce quality
const adjustQuality = () => {
  if (jitsiApi) {
    jitsiApi.setVideoQuality(360);
  }
};
```

---

## Summary

**Recommended:** Use **Jitsi Cloud** (meet.jitsi.net)
- No setup required
- Free unlimited usage
- Works immediately
- Full WebRTC support
- Recommended for MVP launch

**Timeline:** 1-2 days for complete integration

**Result:** Native in-app video calling replacing external MiroTalk service

---

Generated: March 31, 2026
