# 🎯 Google Authentication - Quick Reference Guide

## 📱 User Flow Diagram

```
┌─────────────────────────────────────────────────────────────┐
│                    COLLABBNEST LOGIN                         │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│   ┌──────────────────────────────────────────────────┐     │
│   │           CollabNest Login Page                   │     │
│   ├──────────────────────────────────────────────────┤     │
│   │                                                  │     │
│   │  Email:  [________________]                      │     │
│   │  Pass:   [________________]                      │     │
│   │  [Sign In Button]                               │     │
│   │                                                  │     │
│   │  ─── OR continue with ───                       │     │
│   │                                                  │     │
│   │  [🔵 Google Account  ] ← CLICK HERE!            │     │
│   │  [🔵 LinkedIn Account]                          │     │
│   │                                                  │     │
│   └──────────────────────────────────────────────────┘     │
│                                                              │
└─────────────────────────────────────────────────────────────┘
                           ↓
                    [Google OAuth]
                           ↓
┌─────────────────────────────────────────────────────────────┐
│                  GOOGLE LOGIN SCREEN                         │
│   (User logs in with their Google account)                  │
└─────────────────────────────────────────────────────────────┘
                           ↓
                     [Authenticated]
                           ↓
┌─────────────────────────────────────────────────────────────┐
│                    REDIRECT TO /match                       │
│                  (User is now logged in)                    │
└─────────────────────────────────────────────────────────────┘
                           ↓
                 [Visit /profile page]
                           ↓
┌─────────────────────────────────────────────────────────────┐
│                  USER DETAILS DISPLAY                       │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│   👤 Avatar + Name                                          │
│   ┌────────────────────────────────────────────────────┐   │
│   │ Email:      user@gmail.com                         │   │
│   │ User ID:    550e8400-e29b-41d4-a716-446655440000   │   │
│   │ College:    IIT Delhi                              │   │
│   │ Experience: Intermediate                           │   │
│   │ Skills:     [JavaScript] [React] [Node.js]         │   │
│   │ Last Login: 2024-03-31                             │   │
│   │ Provider:   🔵 Google Account                       │   │
│   │                                                     │   │
│   │                        [Logout Button]              │   │
│   └────────────────────────────────────────────────────┘   │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

---

## 🔧 Setup Steps Visual

```
Step 1: Get Google Client ID
┌─────────────────────────────────────┐
│ Google Cloud Console                │
│ → Create Project                    │
│ → Enable Google+ API                │
│ → Create OAuth Credentials          │
│ → Copy Client ID                    │
└─────────────────────────────────────┘
          ↓
          💾 Copy to .env file

Step 2: Configure Supabase
┌─────────────────────────────────────┐
│ Supabase Dashboard                  │
│ → Authentication                    │
│ → Providers                         │
│ → Enable Google                     │
│ → Paste Client ID                   │
│ → Note Callback URL                 │
└─────────────────────────────────────┘

Step 3: Run Development
┌─────────────────────────────────────┐
│ npm run dev                         │
│ Open http://localhost:5173          │
│ Click Google Login                  │
│ ✓ Should Work!                      │
└─────────────────────────────────────┘
```

---

## 📦 Component Architecture

```
App.tsx
│
├─ GoogleOAuthProvider (wraps entire app)
│
├─ AuthProvider
│  │
│  └─ AuthContext (manages auth state)
│
└─ Routes
   │
   ├─ Login Page
   │  └─ Google OAuth Button
   │
   ├─ Profile Page
   │  └─ UserDetailsCard
   │     ├─ Avatar
   │     ├─ User Info
   │     ├─ Skills List
   │     ├─ Interests List
   │     └─ Logout Button
   │
   └─ Protected Routes
      └─ Check: isAuthenticated
```

---

## 🔐 Authentication Flow

```
User Action          │  Component    │  Service      │  Result
─────────────────────┼───────────────┼───────────────┼──────────────
Click Google Button  │  Login.tsx    │  OAuth lib    │  Dialog opens
Login with Google    │  OAuth Dialog │  Google Auth  │  Token received
Send Token to Server │  AuthContext  │  Supabase     │  Session created
Store Session        │  AuthContext  │  localStorage │  User logged in
Redirect to /match   │  AuthContext  │  Router       │  Page loads
Show User Details    │  Profile.tsx  │  AuthContext  │  Details display
Click Logout         │  CardDetails  │  AuthContext  │  Session cleared
```

---

## 📊 Data Structure

```
┌──────────────────────────────────────────┐
│        SUPABASE USER OBJECT              │
├──────────────────────────────────────────┤
│                                          │
│  id: "550e8400-e29b-41d4-a716..."  [UUID]
│  email: "user@gmail.com"           [From Google]
│  user_metadata: {                  [Custom Data]
│    full_name: "John Doe"
│    avatar_url: "https://..."       [Google Image]
│    college: "IIT Delhi"
│    skills: ["React", "Node.js"]
│    interests: ["Web Dev", "AI"]
│    experience: "Intermediate"
│    availability: "Weekends"
│    bio: "Love coding..."
│  }
│  app_metadata: {                   [Auth Info]
│    provider: "google"
│    providers: ["google"]
│  }
│  created_at: "2024-03-31T10:00Z"
│  last_sign_in_at: "2024-03-31T15:30Z"
│                                          │
└──────────────────────────────────────────┘
        ↓
    ┌─────────────┐
    │ AuthContext │
    ├─────────────┤
    │ user: User  │ (simplified)
    │ userDetails │ (full object)
    │ isAuth: bool│
    │ logout: fn  │
    └─────────────┘
        ↓
    ┌──────────────────┐
    │ Components can   │
    │ access all data  │
    │ via useAuth()    │
    └──────────────────┘
```

---

## 🎨 UI Component Map

```
PAGE: /profile
│
├─ Header
│  ├─ Title: "Your Profile"
│  └─ Subtitle: "View and manage your profile"
│
├─ USER DETAILS CARD (Component)
│  ├─ Header
│  │  ├─ Title: "Profile Information"
│  │  └─ Logout Button 🔘
│  │
│  └─ Card Body
│     ├─ Avatar + Name
│     ├─ Provider Badge (Google/Email)
│     │
│     ├─ Details Grid (2 columns)
│     │  ├─ Email Card
│     │  ├─ User ID Card
│     │  ├─ College Card
│     │  ├─ Experience Card
│     │  ├─ Availability Card
│     │  ├─ Skills Card
│     │  ├─ Interests Card
│     │  └─ Metadata Cards
│     │
│     └─ Timestamps
│        ├─ Account Created
│        └─ Last Sign In
│
└─ Profile Edit Section (below)
   ├─ Basic Information
   ├─ Skills Management
   └─ Interests Management
```

---

## 🔐 Security Features Implemented

```
┌─────────────────────────────────────────┐
│        SECURITY LAYERS                  │
├─────────────────────────────────────────┤
│                                         │
│ 1. OAuth 2.0 Protocol                  │
│    ✓ Industry standard                 │
│    ✓ No password stored                │
│                                         │
│ 2. PKCE Flow                           │
│    ✓ Prevents auth code interception   │
│                                         │
│ 3. Supabase Session Management         │
│    ✓ Secure token storage              │
│    ✓ Automatic expiry                  │
│                                         │
│ 4. User Metadata Encryption            │
│    ✓ End-to-end encrypted              │
│    ✓ Transparent to app                │
│                                         │
│ 5. Environment Variables               │
│    ✓ Secrets in .env (not committed)   │
│    ✓ TypeScript type-safe              │
│                                         │
│ 6. Logout                              │
│    ✓ Clears session                    │
│    ✓ Clears localStorage               │
│    ✓ Redirects to login                │
│                                         │
└─────────────────────────────────────────┘
```

---

## 🚀 Quick Command Reference

```bash
# Install dependencies
npm install @react-oauth/google

# Start development server
npm run dev

# Build for production
npm run build

# Run tests
npm run test

# Check types
npm run type-check
```

---

## 📋 Environment Variables Checklist

```
.env file should contain:
├─ VITE_SUPABASE_URL        ✓ From Supabase
├─ VITE_SUPABASE_ANON_KEY   ✓ From Supabase
└─ VITE_GOOGLE_CLIENT_ID    ✓ From Google Cloud Console

.env.production (optional, if different):
├─ VITE_SUPABASE_URL        (production Supabase)
├─ VITE_SUPABASE_ANON_KEY   (production key)
└─ VITE_GOOGLE_CLIENT_ID    (production client ID)
```

---

## 🎯 Success Indicators

```
✓ You'll know it's working when:

1. Google button appears on login page
2. Clicking it opens Google login
3. After login, redirects to /match
4. /profile page shows user details
5. Email, name, avatar all display
6. Logout button works
7. Refreshing keeps you logged in
8. Skills and interests show
9. Account dates display
10. Provider badge shows "Google Account"
```

---

## 📞 Quick Troubleshooting

| Problem | Solution |
|---------|----------|
| Button missing | Check VITE_GOOGLE_CLIENT_ID in .env |
| Blank after login | Verify Supabase OAuth enabled |
| No user details | Check Supabase connection + metadata |
| Session lost | Clear cookies, check token expiry |
| TypeScript errors | Ensure vite-env.d.ts exists |

---

## 🎓 Learning Path

```
Week 1: Setup
│
├─ Get Google Client ID
├─ Configure .env
├─ Enable Supabase OAuth
└─ Test basic login

Week 2: Features
│
├─ Customize user details display
├─ Add profile editing
├─ Implement profile picture upload
└─ Add more OAuth providers

Week 3: Advanced
│
├─ Role-based access control
├─ Email verification
├─ Two-factor authentication
└─ Advanced user metadata
```

---

**Status: ✅ Ready to Use**  
**Last Updated: March 31, 2026**
