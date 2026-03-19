import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { WELCOME_BONUS } from '@/lib/data';

export interface User {
  id: string;
  email: string;
  firstName?: string;
  lastName?: string;
  name?: string;
  phone?: string;
  birthday?: string;
  idVerified: boolean;
  idVerificationStatus: 'none' | 'pending' | 'approved' | 'rejected';
  rewardsPoints: number;
  rewardsHistory: RewardsHistoryEntry[];
  referralCode: string;
  orders: Order[];
}

export interface RewardsHistoryEntry {
  id: string;
  date: string;
  type: 'earned' | 'redeemed' | 'bonus';
  points: number;
  description: string;
}

export interface Order {
  id: string;
  date: string;
  status: 'processing' | 'shipped' | 'delivered' | 'cancelled';
  total: number;
  items: { name: string; quantity: number; price: number }[];
  trackingNumber?: string;
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<true | string>;
  register: (data: { email: string; password: string; firstName: string; lastName: string; phone: string; birthday: string }) => Promise<true | string>;
  logout: () => void;
  updateProfile: (data: Partial<User>) => void;
  submitIdVerification: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// tRPC with superjson requires the body wrapped in { json: ... }
function trpcBody(data: Record<string, unknown>) {
  return JSON.stringify({ json: data });
}

function transformBackendUser(userData: Record<string, unknown>, fallbackEmail?: string): User {
  const name = (userData.name as string) || '';
  return {
    id: userData.id?.toString() || 'u' + Date.now(),
    email: (userData.email as string) || fallbackEmail || '',
    firstName: name.split(' ')[0] || '',
    lastName: name.split(' ').slice(1).join(' ') || '',
    name,
    phone: (userData.phone as string) || '',
    birthday: (userData.birthday as string) || '',
    idVerified: (userData.idVerified as boolean) || false,
    idVerificationStatus: (userData.idVerificationStatus as User['idVerificationStatus']) || 'none',
    rewardsPoints: (userData.rewardsPoints as number) || 0,
    rewardsHistory: (userData.rewardsHistory as RewardsHistoryEntry[]) || [],
    referralCode: (userData.referralCode as string) || '',
    orders: (userData.orders as Order[]) || [],
  };
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(() => {
    try {
      const saved = localStorage.getItem('mlc-user');
      return saved ? JSON.parse(saved) : null;
    } catch { return null; }
  });

  // Fetch user from backend on mount — only for email-registered users (not Manus OAuth)
  useEffect(() => {
    // If we already have a user in localStorage, no need to re-fetch
    const saved = localStorage.getItem('mlc-user');
    if (saved) return;

    const fetchUser = async () => {
      try {
        const response = await fetch('/api/trpc/auth.me', { credentials: 'include' });
        if (response.ok) {
          const result = await response.json();
          const userData = result.result?.data;
          // Only restore session for email-registered users, not Manus OAuth users
          if (!userData || userData.authMethod !== 'email') return;
          const transformedUser = transformBackendUser(userData);
          setUser(transformedUser);
          localStorage.setItem('mlc-user', JSON.stringify(transformedUser));
        }
      } catch {
        // No active session — that's fine
      }
    };
    fetchUser();
  }, []);

  const login = useCallback(async (email: string, _password: string): Promise<true | string> => {
    try {
      const response = await fetch('/api/trpc/auth.loginEmail', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: trpcBody({ email }),
        credentials: 'include',
      });

      if (response.ok) {
        const result = await response.json();
        const data = result.result?.data;
        if (!data?.success || !data?.user) {
          return data?.error || 'Account not found. Please register first.';
        }
        const transformedUser = transformBackendUser(data.user, email);
        setUser(transformedUser);
        localStorage.setItem('mlc-user', JSON.stringify(transformedUser));
        return true;
      }
      return 'Login failed. Please try again.';
    } catch (error) {
      console.error('Login error:', error);
      return 'Login failed. Please try again.';
    }
  }, []);

  const register = useCallback(async (data: { email: string; password: string; firstName: string; lastName: string; phone: string; birthday: string }): Promise<true | string> => {
    try {
      const response = await fetch('/api/trpc/auth.register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: trpcBody({
          email: data.email,
          name: `${data.firstName} ${data.lastName}`,
          phone: data.phone,
          birthday: data.birthday,
        }),
        credentials: 'include',
      });

      if (response.ok) {
        const result = await response.json();
        const resData = result.result?.data;
        if (!resData?.success || !resData?.user) {
          return resData?.error || 'Registration failed. Please try again.';
        }
        const newUser: User = {
          ...transformBackendUser(resData.user, data.email),
          firstName: data.firstName,
          lastName: data.lastName,
          phone: data.phone,
          birthday: data.birthday,
          rewardsPoints: WELCOME_BONUS,
          rewardsHistory: [
            { id: 'rh-welcome', date: new Date().toISOString().split('T')[0], type: 'bonus', points: WELCOME_BONUS, description: 'Welcome Bonus — Thanks for joining!' },
          ],
          referralCode: data.firstName.toUpperCase().slice(0, 4) + Date.now().toString().slice(-4),
        };
        setUser(newUser);
        localStorage.setItem('mlc-user', JSON.stringify(newUser));
        return true;
      }
      return 'Registration failed. Please try again.';
    } catch (error) {
      console.error('Register error:', error);
      return 'Registration failed. Please try again.';
    }
  }, []);

  const logout = useCallback(() => {
    setUser(null);
    localStorage.removeItem('mlc-user');
    fetch('/api/trpc/auth.logout', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: trpcBody({}),
      credentials: 'include',
    }).catch(console.error);
  }, []);

  const updateProfile = useCallback((data: Partial<User>) => {
    setUser(prev => {
      if (!prev) return prev;
      const updated = { ...prev, ...data };
      localStorage.setItem('mlc-user', JSON.stringify(updated));
      return updated;
    });
  }, []);

  const submitIdVerification = useCallback(() => {
    setUser(prev => {
      if (!prev) return prev;
      const updated = { ...prev, idVerificationStatus: 'pending' as const };
      localStorage.setItem('mlc-user', JSON.stringify(updated));
      return updated;
    });
  }, []);

  return (
    <AuthContext.Provider value={{
      user,
      isAuthenticated: !!user,
      login,
      register,
      logout,
      updateProfile,
      submitIdVerification,
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
}
