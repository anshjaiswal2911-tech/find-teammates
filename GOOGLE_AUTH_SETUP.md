# Google Authentication with Supabase - Complete Setup Guide

## Overview
This guide helps you set up Google Authentication with Supabase for the CollabNest application.

## Changes Made

### 1. **Installed Dependencies**
```bash
npm install @react-oauth/google
```

### 2. **Updated Files**

#### `src/app/App.tsx`
- Added `GoogleOAuthProvider` wrapper
- Reads `VITE_GOOGLE_CLIENT_ID` from environment variables

#### `src/app/contexts/AuthContext.tsx`
- Enhanced with proper Supabase authentication
- Added `userDetails` state to store full user information from Supabase
- Implemented email/password login with Supabase
- Improved Google OAuth flow
- Better error handling

#### `src/app/components/UserDetailsCard.tsx` (New)
- Displays user authentication information
- Shows email, user ID, college, experience, availability
- Displays skills and interests
- Shows account creation and last login dates
- Includes logout button

#### `src/app/pages/Profile.tsx`
- Integrated `UserDetailsCard` at the top
- Shows user details after login

#### `.env`
- Added `VITE_GOOGLE_CLIENT_ID` variable

## Setup Instructions

### Step 1: Get Google Client ID
1. Go to [Google Cloud Console](https://console.cloud.google.com)
2. Create a new project or select existing one
3. Enable "Google+ API"
4. Create OAuth 2.0 credentials (Web application)
5. Add authorized redirect URIs:
   - `http://localhost:5173` (for local development)
   - `http://localhost:3000` (alternative)
   - Your production domain
6. Copy the Client ID

### Step 2: Update Environment Variables
Add your Google Client ID to `.env`:
```env
VITE_GOOGLE_CLIENT_ID=your_google_client_id_here
```

### Step 3: Configure Supabase
1. Go to Supabase Dashboard
2. Navigate to **Authentication > Providers**
3. Enable **Google** provider
4. Add the same Google Client ID
5. Set redirect URL to: `https://dpgeiimjwxnkzshbaupj.supabase.co/auth/v1/callback`

### Step 4: Update Supabase Database Schema
```sql
-- Users can login via email/password or Google OAuth
-- The `user_metadata` field stores:
-- - full_name: User's full name
-- - college: College/University name
-- - avatar_url: Profile picture from Google
-- - skills: Array of programming skills
-- - interests: Array of interests
-- - experience: Experience level (Beginner/Intermediate/Expert)
-- - availability: Availability (Weekends/Weekdays/Both)
-- - bio: User biography
```

## Features

### Authentication Methods
1. **Email & Password**: Traditional login
2. **Google OAuth**: One-click login with Google account
3. **LinkedIn**: OAuth integration (already configured)

### User Details Page
After login, users see their profile with:
- Avatar and name
- Email address
- User ID
- College information
- Experience level
- Availability
- Skills and interests
- Account creation date
- Last login date
- Provider information (Google/Email/LinkedIn)

### Security Features
- OAuth 2.0 authentication
- Secure session management
- User metadata encryption by Supabase
- Logout functionality

## Usage

### For Users to Login:
1. Navigate to `/login`
2. Choose authentication method:
   - Enter email & password, OR
   - Click "Google Account" button, OR
   - Click "LinkedIn Account" button
3. After successful login, redirected to `/match` page
4. Visit `/profile` to see full user details

### Access User Information in Components:
```typescript
import { useAuth } from './contexts/AuthContext';

export function MyComponent() {
  const { user, userDetails, isAuthenticated } = useAuth();
  
  if (isAuthenticated) {
    console.log(user.name);        // User name
    console.log(user.email);       // User email
    console.log(userDetails);      // Full Supabase user object
  }
}
```

## Troubleshooting

### Google Login Not Working
1. Check if Google Client ID is correctly set in `.env`
2. Verify Google Cloud Console credentials
3. Check browser console for errors
4. Ensure redirect URLs match in Google Console

### User Details Not Showing
1. Verify Supabase connection
2. Check if user metadata is properly stored
3. Look at browser network tab for API errors
4. Check Supabase auth logs

### Session Persisting Issues
1. Clear browser localStorage
2. Check if Supabase session is valid
3. Verify auth context initialization

## Files Structure
```
src/app/
├── App.tsx (with GoogleOAuthProvider)
├── contexts/
│   └── AuthContext.tsx (authentication logic)
├── components/
│   └── UserDetailsCard.tsx (displays user info)
└── pages/
    └── Profile.tsx (integrates UserDetailsCard)
```

## Environment Variables
```
VITE_SUPABASE_URL=https://dpgeiimjwxnkzshbaupj.supabase.co
VITE_SUPABASE_ANON_KEY=your_anon_key
VITE_GOOGLE_CLIENT_ID=your_google_client_id
```

## Next Steps
1. Update Google Client ID in `.env`
2. Configure Supabase Google OAuth
3. Test login flow in development
4. Deploy to production with production URLs

---
Last Updated: March 31, 2026
