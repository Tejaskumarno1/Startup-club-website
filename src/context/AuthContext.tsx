import React, { createContext, useState, useContext, useEffect } from 'react';
import { Session } from '@supabase/supabase-js';
import { supabase } from "@/integrations/supabase/client";
import { useToast } from '@/hooks/use-toast';
import { User } from '@/lib/types';

// Define a merged user type that combines Supabase User with our custom User type
type MergedUser = User & {
  user_metadata?: {
    first_name?: string;
    last_name?: string;
    company?: string;
    profession?: string;
    bio?: string;
    location?: string;
    photo_url?: string;
    linkedin?: string;
    twitter?: string;
    github?: string;
    portfolio?: string;
    instagram?: string;
    phone?: string;
  };
};

interface AuthContextType {
  session: Session | null;
  user: MergedUser | null;
  signIn: (email: string, password: string) => Promise<{ success: boolean; error?: any }>;
  signUp: (email: string, password: string, metadata?: any) => Promise<{ success: boolean; error?: any }>;
  signOut: () => Promise<void>;
  loading: boolean;
  isAdmin: boolean;
  updateUserProfile: (profileData: any) => Promise<{ success: boolean; error?: any }>;
  getDetailedProfile: () => Promise<User | null>;
  clearSession: () => void;
}

// Create the context with a default undefined value
const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<MergedUser | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const { toast } = useToast();

  // Set up auth state listener and check for existing session
  useEffect(() => {
    // First set up the auth state change listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, newSession) => {
        console.log('Auth state changed:', event);
        setSession(newSession);
        if (newSession?.user) {
          // Merge user with profile data
          fetchUserProfile(newSession.user);
        } else {
          setUser(null);
          setIsAdmin(false);
        }
      }
    );

    // Then check for existing session
    const initializeAuth = async () => {
      try {
        setLoading(true);
        const { data: { session } } = await supabase.auth.getSession();
        
        setSession(session);
        
        if (session?.user) {
          fetchUserProfile(session.user);
        } else {
          setUser(null);
        }
      } catch (error) {
        console.error('Error initializing auth:', error);
      } finally {
        setLoading(false);
      }
    };

    initializeAuth();

    // Clean up subscription on unmount
    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const fetchUserProfile = async (authUser: any) => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', authUser.id)
        .maybeSingle();
        
      if (error) throw error;
      
      // For debugging
      console.log("Profile data:", data);
      console.log("User role:", data?.role);
      
      // Merge auth user with profile data and user_metadata
      const mergedUser = {
        ...authUser,
        ...data,
        // Ensure user_metadata is available for components that need it
        user_metadata: authUser.user_metadata || {}
      } as MergedUser;
      
      setUser(mergedUser);
      
      // Check if user is admin
      if (data?.role === 'admin') {
        console.log("User is admin");
        setIsAdmin(true);
      } else {
        console.log("User is not admin");
        setIsAdmin(false);
      }
    } catch (error) {
      console.error('Error fetching user profile:', error);
      // Still set the basic user data
      setUser({
        ...authUser,
        user_metadata: authUser.user_metadata || {}
      } as MergedUser);
      setIsAdmin(false);
    }
  };

  const getDetailedProfile = async (): Promise<User | null> => {
    if (!user) return null;
    
    try {
      // Fetch additional user information like connections count, events count, etc.
      const { data, error } = await supabase
        .from('profiles')
        .select(`
          *,
          connections_count:connections(count),
          joined_events_count:event_registrations(count)
        `)
        .eq('id', user.id)
        .maybeSingle();
        
      if (error) throw error;
      
      // Cast the data to User type to avoid TypeScript errors
      return data as unknown as User;
    } catch (error) {
      console.error('Error fetching detailed profile:', error);
      return user as User;
    }
  };

  const checkIfUserIsAdmin = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', userId)
        .maybeSingle();
        
      if (error) throw error;
      
      setIsAdmin(data?.role === 'admin');
    } catch (error) {
      console.error('Error checking admin status:', error);
      setIsAdmin(false);
    }
  };

  const signIn = async (email: string, password: string) => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;
      
      return { success: true };
    } catch (error: any) {
      console.error('Sign in error:', error);
      toast({
        title: 'Sign in failed',
        description: error.message,
        variant: 'destructive',
      });
      return { success: false, error };
    }
  };

  const signUp = async (email: string, password: string, metadata?: any) => {
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: metadata
        }
      });

      if (error) throw error;
      
      toast({
        title: 'Sign up successful',
        description: 'Please check your email for confirmation.',
      });
      
      return { success: true };
    } catch (error: any) {
      console.error('Sign up error:', error);
      toast({
        title: 'Sign up failed',
        description: error.message,
        variant: 'destructive',
      });
      return { success: false, error };
    }
  };

  const signOut = async () => {
    try {
      await supabase.auth.signOut();
    } catch (error) {
      console.error('Sign out error:', error);
      toast({
        title: 'Sign out failed',
        description: 'An error occurred during sign out.',
        variant: 'destructive',
      });
    }
  };

  const updateUserProfile = async (profileData: any) => {
    try {
      if (!user) {
        throw new Error('No authenticated user');
      }
      
      // Update the profile data in the profiles table
      const { error } = await supabase
        .from('profiles')
        .update(profileData)
        .eq('id', user.id);
        
      if (error) throw error;
      
      // Update local user state with new profile data
      setUser(prev => prev ? { ...prev, ...profileData } : null);
      
      toast({
        title: 'Profile updated',
        description: 'Your profile has been updated successfully.',
      });
      
      return { success: true };
    } catch (error: any) {
      console.error('Profile update error:', error);
      toast({
        title: 'Profile update failed',
        description: error.message,
        variant: 'destructive',
      });
      return { success: false, error };
    }
  };

  // Optional: Add a clearSession function if needed by Login.tsx
  const clearSession = () => {
    setUser(null);
    setSession(null);
    setIsAdmin(false);
  };

  // Important: Ensure the context value is properly provided
  const contextValue: AuthContextType = {
    session,
    user,
    signIn,
    signUp,
    signOut,
    loading,
    isAdmin,
    updateUserProfile,
    getDetailedProfile,
    clearSession,
  };

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
};

// Export the useAuth hook with proper type checking
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
