import React, { createContext, useContext, useEffect, useRef, useState } from 'react';
import { User, Session, AuthError } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  isLoading: boolean;
  isAdmin: boolean;
  signIn: (email: string, password: string) => Promise<{ error: any }>;
  signUp: (email: string, password: string) => Promise<{ error: any }>;
  sendPasswordReset: (email: string) => Promise<{ error: AuthError | null }>;
  updatePassword: (password: string) => Promise<{ error: AuthError | null }>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);

  // Bumped whenever the signed-in user changes, so a slow role check for an
  // earlier user can never overwrite the answer for the current one.
  const authGeneration = useRef(0);
  const roleCheckedFor = useRef<string | null>(null);

  const checkAdminStatus = async (userId: string): Promise<boolean> => {
    try {
      const { data, error } = await supabase
        .from('user_roles' as any)
        .select('role')
        .eq('user_id', userId)
        .eq('role', 'admin')
        .maybeSingle();
      return !error && !!data;
    } catch (error) {
      return false;
    }
  };

  useEffect(() => {
    // Stay "loading" until the admin role is known. Reporting a signed-in user
    // with isAdmin=false first made ProtectedRoute bounce admins off deep links
    // on every hard reload.
    const applySession = (session: Session | null) => {
      setSession(session);
      setUser(session?.user ?? null);
      const userId = session?.user?.id ?? null;
      // Token refreshes keep the same user; re-checking would flash the
      // loading state and unmount whatever admin page is open.
      if (userId && userId === roleCheckedFor.current) return;
      roleCheckedFor.current = userId;
      const generation = ++authGeneration.current;
      if (!session?.user) {
        setIsAdmin(false);
        setIsLoading(false);
        return;
      }
      setIsLoading(true);
      // Deferred: awaiting Supabase calls inside onAuthStateChange can deadlock the client.
      setTimeout(async () => {
        const admin = await checkAdminStatus(session.user.id);
        if (generation !== authGeneration.current) return;
        setIsAdmin(admin);
        setIsLoading(false);
      }, 0);
    };

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      applySession(session);
    });

    supabase.auth.getSession().then(({ data: { session } }) => {
      applySession(session);
    });

    return () => subscription.unsubscribe();
  }, []);

  const signIn = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    return { error };
  };

  const signUp = async (email: string, password: string) => {
    const redirectUrl = `${window.location.origin}/`;
    
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: redirectUrl
      }
    });
    return { error };
  };

  // The reset link is emailed by formula-admin-password-reset through Resend
  // (tickets@theformulaforum.com); Lovable Cloud's built-in auth mailer did not
  // deliver. The link lands on /admin/set-password, and index.html forwards any
  // recovery link there even if the auth service falls back to the site root.
  const sendPasswordReset = async (email: string): Promise<{ error: AuthError | null }> => {
    const key = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;
    try {
      const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/formula-admin-password-reset`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', apikey: key, Authorization: `Bearer ${key}` },
        body: JSON.stringify({ email }),
        credentials: 'omit',
      });
      if (response.ok) return { error: null };
      const body = await response.json().catch(() => null);
      return { error: new AuthError(response.status === 429 ? 'rate_limited' : String(body?.error ?? 'unavailable'), response.status) };
    } catch {
      return { error: new AuthError('unavailable', 0) };
    }
  };

  const updatePassword = async (password: string) => {
    const { error } = await supabase.auth.updateUser({ password });
    return { error };
  };

  const signOut = async () => {
    await supabase.auth.signOut();
  };

  const value = {
    user,
    session,
    isLoading,
    isAdmin,
    signIn,
    signUp,
    sendPasswordReset,
    updatePassword,
    signOut,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};