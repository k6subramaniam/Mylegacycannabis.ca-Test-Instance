import React, { createContext, useContext, useState, useCallback } from 'react';
import { WELCOME_BONUS } from '@/lib/data';

export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
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
  register: (data: { email: string; password: string; firstName: string; lastName: string; birthday?: string }) => Promise<boolean>;
  logout: () => void;
  updateProfile: (data: Partial<User>) => void;
  submitIdVerification: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const DEMO_USER: User = {
  id: 'u1',
  email: 'demo@mylegacycannabis.ca',
  firstName: 'Alex',
  lastName: 'Thompson',
  phone: '(416) 555-1234',
  birthday: '1995-06-15',
  idVerified: true,
  idVerificationStatus: 'approved',
  rewardsPoints: 475,
  rewardsHistory: [
    { id: 'rh1', date: '2026-03-15', type: 'earned', points: 150, description: 'Order #MLG-1042 — $150.00 purchase' },
    { id: 'rh2', date: '2026-03-10', type: 'earned', points: 85, description: 'Order #MLG-1038 — $85.00 purchase' },
    { id: 'rh3', date: '2026-03-05', type: 'bonus', points: 100, description: 'Birthday Bonus' },
    { id: 'rh4', date: '2026-02-28', type: 'earned', points: 65, description: 'Order #MLG-1031 — $65.00 purchase' },
    { id: 'rh5', date: '2026-02-20', type: 'redeemed', points: -100, description: 'Redeemed Starter reward — $5 OFF' },
    { id: 'rh6', date: '2026-02-15', type: 'earned', points: 120, description: 'Order #MLG-1025 — $120.00 purchase' },
    { id: 'rh7', date: '2026-02-10', type: 'bonus', points: 10, description: 'Product Review — Purple Kush' },
    { id: 'rh8', date: '2026-02-01', type: 'bonus', points: 50, description: 'Referral Bonus — Friend signed up' },
    { id: 'rh9', date: '2026-01-20', type: 'bonus', points: 25, description: 'Welcome Bonus' },
    { id: 'rh10', date: '2026-01-20', type: 'earned', points: 70, description: 'Order #MLG-1012 — $70.00 purchase' },
  ],
  referralCode: 'ALEX2026',
  orders: [
    { id: 'MLG-1042', date: '2026-03-15', status: 'delivered', total: 160, items: [{ name: 'Purple Kush', quantity: 2, price: 35 }, { name: 'Mixed Fruit Gummies', quantity: 2, price: 15 }, { name: 'OG Kush Vape Cart', quantity: 1, price: 45 }], trackingNumber: 'CP123456789CA' },
    { id: 'MLG-1038', date: '2026-03-10', status: 'shipped', total: 95, items: [{ name: 'Blue Dream', quantity: 1, price: 38 }, { name: 'Infused Pre-Roll King', quantity: 2, price: 18 }, { name: 'Rolling Paper Bundle', quantity: 1, price: 10 }], trackingNumber: 'CP987654321CA' },
    { id: 'MLG-1031', date: '2026-03-05', status: 'delivered', total: 75, items: [{ name: 'Gelato', quantity: 1, price: 44 }, { name: 'Indica Pre-Roll Pack', quantity: 1, price: 25 }] },
  ],
};

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(() => {
    try {
      const saved = localStorage.getItem('mlc-user');
      return saved ? JSON.parse(saved) : null;
    } catch { return null; }
  });

  const login = useCallback(async (_email: string, _password: string) => {
    // Demo: always succeeds
    setUser(DEMO_USER);
    localStorage.setItem('mlc-user', JSON.stringify(DEMO_USER));
    return true;
  }, []);

  const register = useCallback(async (data: { email: string; password: string; firstName: string; lastName: string; birthday?: string }) => {
    const newUser: User = {
      id: 'u' + Date.now(),
      email: data.email,
      firstName: data.firstName,
      lastName: data.lastName,
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
  }, []);

  const logout = useCallback(() => {
    setUser(null);
    localStorage.removeItem('mlc-user');
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
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
}
