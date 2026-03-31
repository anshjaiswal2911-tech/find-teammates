import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User } from '../lib/types';
import { mockCurrentUser } from '../lib/mockData';
import { supabase } from '../lib/supabase';
import { dbService } from '../lib/dbService';

console.log('AuthContext.tsx: File executing');

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<void>;
  signup: (name: string, email: string, password: string, college: string, initialData?: Partial<User>) => Promise<void>;
  loginWithGoogle: () => Promise<void>;
  loginWithLinkedIn: () => Promise<void>;
  logout: () => void;
  updateProfile: (updates: Partial<User>) => void;
  isAuthenticated: boolean;
  loading: boolean;
  userDetails: any; // Store full Supabase user details
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [userDetails, setUserDetails] = useState<any>(null);

  console.log('AuthProvider: Rendering, user:', user?.email, 'loading:', loading);

  useEffect(() => {
    console.log('AuthProvider: useEffect mount');
    
    // Check for existing session on mount
    const checkUser = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (error) {
          const storedUser = localStorage.getItem('collabNestUser');
          if (storedUser) setUser(JSON.parse(storedUser));
          return;
        }

        if (session?.user) {
          console.log('Session found, user:', session.user.email);
          setUserDetails(session.user); // Store full user details
          
          const appUser: User = {
            id: session.user.id,
            name: session.user.user_metadata.full_name || session.user.email?.split('@')[0] || 'User',
            email: session.user.email || '',
            college: session.user.user_metadata.college || '',
            skills: session.user.user_metadata.skills || [],
            interests: session.user.user_metadata.interests || [],
            experience: session.user.user_metadata.experience || 'Beginner',
            bio: session.user.user_metadata.bio || '',
            availability: session.user.user_metadata.availability || 'Weekends',
            profileImage: session.user.user_metadata.avatar_url || undefined,
          };
          setUser(appUser);
          // Sync to profiles table
          dbService.upsertProfile(appUser).catch(e => console.error('Sync error:', e));
        } else {
          const storedUser = localStorage.getItem('collabNestUser');
          if (storedUser) {
            setUser(JSON.parse(storedUser));
          }
        }
      } catch (err) {
        console.error('AuthProvider: error in checkUser:', err);
      } finally {
        setLoading(false);
      }
    };

    console.log('AuthProvider: Triggering checkUser');
    checkUser();

    // Fail-safe: Force loading false after 5s just in case Supabase hangs
    const timeout = setTimeout(() => {
      setLoading(curr => {
        if (curr) {
          console.warn('AuthProvider: Loading timed out after 5s, forcing false');
          return false;
        }
        return curr;
      });
    }, 5000);

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
      console.log('AuthProvider: Auth event:', _event, 'session:', session?.user?.email);
      if (session?.user) {
        console.log('AuthProvider: Session detected for', session.user.email);
        setUserDetails(session.user); // Store full user details
        
        // 1. Start with metadata values as defaults
        const metadata = session.user.user_metadata;
        const appUser: User = {
          id: session.user.id,
          name: metadata.full_name || metadata.name || session.user.email?.split('@')[0] || 'User',
          email: session.user.email || '',
          college: metadata.college || '',
          skills: metadata.skills || [],
          interests: metadata.interests || [],
          experience: metadata.experience || 'Beginner',
          bio: metadata.bio || '',
          availability: metadata.availability || 'Weekends',
          profileImage: metadata.avatar_url || metadata.picture || undefined,
        };

        // 2. Try to fetch existing profile from DB to get more complete data
        try {
          const dbProfile = await dbService.getProfile(session.user.id);
          if (dbProfile) {
            console.log('AuthProvider: Found existing DB profile, merging...');
            setUser({
              ...appUser,
              ...dbProfile,
              // Keep ID and Email from session just in case
              id: session.user.id,
              email: session.user.email || '',
            });
          } else {
            console.log('AuthProvider: No DB profile found, using metadata and upserting...');
            setUser(appUser);
            await dbService.upsertProfile(appUser);
          }
        } catch (err) {
          console.error('AuthProvider: Profile sync error:', err);
          setUser(appUser); // Fallback to metadata
        }
      } else {
        console.log('AuthProvider: No active session');
        setUser(null);
        setUserDetails(null);
      }
    });

    return () => {
      clearTimeout(timeout);
      console.log('AuthProvider: Unsubscribing from auth changes');
      subscription.unsubscribe();
    };
  }, []);

  const login = async (email: string, password: string) => {
    console.log('AuthProvider: login called');
    
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;

      if (data.session?.user) {
        setUserDetails(data.session.user);
        const appUser: User = {
          id: data.session.user.id,
          name: data.session.user.user_metadata?.full_name || email.split('@')[0] || 'User',
          email: data.session.user.email || '',
          college: data.session.user.user_metadata?.college || '',
          skills: data.session.user.user_metadata?.skills || [],
          interests: data.session.user.user_metadata?.interests || [],
          experience: data.session.user.user_metadata?.experience || 'Beginner',
          bio: data.session.user.user_metadata?.bio || '',
          availability: data.session.user.user_metadata?.availability || 'Weekends',
          profileImage: data.session.user.user_metadata?.avatar_url,
        };
        setUser(appUser);
        localStorage.setItem('collabNestUser', JSON.stringify(appUser));
      }
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  };

  const signup = async (name: string, email: string, password: string, college: string, initialData?: Partial<User>) => {
    console.log('AuthProvider: signup called');
    
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: name,
            college: college,
            skills: initialData?.skills || [],
            interests: initialData?.interests || [],
            experience: initialData?.experience || 'Beginner',
            bio: initialData?.bio || '',
            availability: initialData?.availability || 'Weekends',
          },
        },
      });

      if (error) throw error;

      if (data.user) {
        setUserDetails(data.user);
        const newUser: User = {
          id: data.user.id,
          name,
          email,
          college,
          skills: initialData?.skills || [],
          interests: initialData?.interests || [],
          experience: initialData?.experience || 'Beginner',
          bio: initialData?.bio || '',
          availability: initialData?.availability || 'Weekends',
          profileImage: initialData?.profileImage,
        };
        setUser(newUser);
        localStorage.setItem('collabNestUser', JSON.stringify(newUser));
      }
    } catch (error) {
      console.error('Signup error:', error);
      throw error;
    }
  };

  const loginWithGoogle = async () => {
    console.log('AuthProvider: loginWithGoogle called');
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/match`,
          queryParams: {
            access_type: 'offline',
            prompt: 'consent',
          },
        },
      });
      if (error) throw error;
    } catch (error) {
      console.error('Google login error:', error);
      throw error;
    }
  };
  
  const loginWithLinkedIn = async () => {
    console.log('AuthProvider: loginWithLinkedIn called');
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'linkedin_oidc',
        options: {
          redirectTo: `${window.location.origin}/match`,
        },
      });
      if (error) throw error;
    } catch (error) {
      console.error('LinkedIn login error:', error);
      throw error;
    }
  };

  const logout = async () => {
    console.log('AuthProvider: logout called');
    try {
      await supabase.auth.signOut();
      setUser(null);
      setUserDetails(null);
      localStorage.removeItem('collabNestUser');
    } catch (error) {
      console.error('Logout error:', error);
      throw error;
    }
  };

  const updateProfile = async (updates: Partial<User>) => {
    if (user) {
      const updatedUser = { ...user, ...updates };
      setUser(updatedUser);
      localStorage.setItem('collabNestUser', JSON.stringify(updatedUser));
      
      try {
        await dbService.upsertProfile(updatedUser);
        console.log('AuthProvider: Profile updated in DB');
      } catch (err) {
        console.error('AuthProvider: error updating profile in DB:', err);
      }
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        login,
        signup,
        loginWithGoogle,
        loginWithLinkedIn,
        logout,
        updateProfile,
        isAuthenticated: !!user,
        loading,
        userDetails,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}