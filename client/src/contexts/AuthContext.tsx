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
  login: (email: string, password: string) => Promise<boolean>;
  register: (data: { email: string; password: string; firstName: string; lastName: string; phone: string; birthday?: string }) => Promise<boolean>;
  logout: () => void;
  updateProfile: (data: Partial<User>) => void;
  submitIdVerification: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(() => {
    try {
      const saved = localStorage.getItem('mlc-user');
      return saved ? JSON.parse(saved) : null;
    } catch { return null; }
  });

  // Fetch user from backend on mount
  useEffect(() => {
    const fetchUser = async () => {
      try {
        const response = await fetch('/api/trpc/auth.me', { credentials: 'include' });
        if (response.ok) {
          const result = await response.json();
          const userData = result.result?.data;
          if (!userData) return;
          
          // Transform backend user to frontend User format
          const transformedUser: User = {
            id: userData.id?.toString() || 'u' + Date.now(),
            email: userData.email || '',
            firstName: userData.name?.split(' ')[0] || '',
            lastName: userData.name?.split(' ').slice(1).join(' ') || '',
            name: userData.name || '',
            phone: userData.phone || '',
            birthday: userData.birthday || '',
            idVerified: userData.idVerified || false,
            idVerificationStatus: userData.idVerificationStatus || 'none',
            rewardsPoints: userData.rewardsPoints || 0,
            rewardsHistory: userData.rewardsHistory || [],
            referralCode: userData.referralCode || '',
            orders: userData.orders || [],
          };
          setUser(transformedUser);
          localStorage.setItem('mlc-user', JSON.stringify(transformedUser));
        }
      } catch (error) {
        console.log('No active session');
      }
    };
    fetchUser();
  }, []);

  const login = useCallback(async (email: string, _password: string) => {
    try {
      // Call backend tRPC endpoint to verify email and get user
      const response = await fetch('/api/trpc/auth.loginEmail', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
        credentials: 'include',
      });

      if (response.ok) {
        const result = await response.json();
        // tRPC wraps response in result object
        const userData = result.result?.data?.user;
        if (!userData) return false;
        
        const transformedUser: User = {
          id: userData.id?.toString() || 'u' + Date.now(),
          email: userData.email || email,
          firstName: userData.name?.split(' ')[0] || '',
          lastName: userData.name?.split(' ').slice(1).join(' ') || '',
          name: userData.name || '',
          phone: userData.phone || '',
          birthday: userData.birthday || '',
          idVerified: userData.idVerified || false,
          idVerificationStatus: userData.idVerificationStatus || 'none',
          rewardsPoints: userData.rewardsPoints || 0,
          rewardsHistory: userData.rewardsHistory || [],
          referralCode: userData.referralCode || '',
          orders: userData.orders || [],
        };
        setUser(transformedUser);
        localStorage.setItem('mlc-user', JSON.stringify(transformedUser));
        return true;
      }
      return false;
    } catch (error) {
      console.error('Login error:', error);
      return false;
    }
  }, []);

  const register = useCallback(async (data: { email: string; password: string; firstName: string; lastName: string; phone: string; birthday: string }) => {
    try {
      const response = await fetch('/api/trpc/auth.register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: data.email,
          name: `${data.firstName} ${data.lastName}`,
          phone: data.phone,
          birthday: data.birthday,
        }),
        credentials: 'include',
      });

      if (response.ok) {
        const result = await response.json();
        const userData = result.result?.data?.user;
        if (!userData) return false;
        
        const newUser: User = {
          id: userData.id?.toString() || 'u' + Date.now(),
          email: userData.email || data.email,
          firstName: data.firstName,
          lastName: data.lastName,
          name: `${data.firstName} ${data.lastName}`,
          phone: data.phone,
          birthday: data.birthday,
          idVerified: false,
          idVerificationStatus: 'none',
          rewardsPoints: WELCOME_BONUS,
          rewardsHistory: [
            { id: 'rh-welcome', date: new Date().toISOString().split('T')[0], type: 'bonus', points: WELCOME_BONUS, description: 'Welcome Bonus — Thanks for joining!' },
          ],
          referralCode: data.firstName.toUpperCase().slice(0, 4) + Date.now().toString().slice(-4),
          orders: [],
        };
        setUser(newUser);
        localStorage.setItem('mlc-user', JSON.stringify(newUser));
        return true;
      }
      return false;
    } catch (error) {
      console.error('Register error:', error);
      return false;
    }
  }, []);

  const logout = useCallback(() => {
    setUser(null);
    localStorage.removeItem('mlc-user');
    // Call backend logout
    fetch('/api/trpc/auth.logout', { method: 'POST', credentials: 'include' }).catch(console.error);
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
