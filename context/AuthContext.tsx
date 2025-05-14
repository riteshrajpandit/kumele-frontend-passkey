"use client";

import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { useRouter } from 'next/navigation';

// Define the user data type based on the API response
export interface UserData {
  user_token: string;
  referral_code: string;
  name: string;
  email: string;
  username?: string;
  dob?: string;
  gender?: string;
  picture_url?: string;
  above_legal_age: boolean;
  terms_and_conditions: boolean;
  hobbies?: any[];
  qr_code_url?: string;
  next_step?: string;
  sound_notification?: boolean;
  email_notification?: boolean;
}

interface AuthContextProps {
  user: UserData | null;
  loading: boolean;
  login: (userData: UserData) => void;
  logout: () => void;
  updateUser: (userData: Partial<UserData>) => void;
}

const AuthContext = createContext<AuthContextProps | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    // Load user data from localStorage on app initialization
    const loadUser = () => {
      const storedUser = localStorage.getItem('userInfo');
      if (storedUser) {
        try {
          const parsedUser = JSON.parse(storedUser);
          setUser(parsedUser);
        } catch (error) {
          console.error('Failed to parse user data from localStorage', error);
          localStorage.removeItem('userInfo');
        }
      }
      setLoading(false);
    };

    loadUser();
  }, []);

  const login = (userData: UserData) => {
    localStorage.setItem('userInfo', JSON.stringify(userData));
    setUser(userData);
  };

  const logout = () => {
    localStorage.removeItem('userInfo');
    setUser(null);
    router.push('/login');
  };

  const updateUser = (userData: Partial<UserData>) => {
    if (user) {
      const updatedUser = { ...user, ...userData };
      localStorage.setItem('userInfo', JSON.stringify(updatedUser));
      setUser(updatedUser);
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, logout, updateUser }}>
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