import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import api from '@/src/shared/lib/api';

export interface UserInfo {
  userId: number;
  email: string;
  nickname: string;
  profileImageUrl: string | null;
  userRole: 'USER' | 'ADMIN';
  hasClaimedPracticeCredit?: boolean;
}

interface AuthContextType {
  isLoggedIn: boolean;
  isLoading: boolean;
  isAdmin: boolean;
  user: UserInfo | null;
  checkAuth: () => Promise<boolean>;
}

const AuthContext = createContext<AuthContextType>({
  isLoggedIn: false,
  isLoading: true,
  isAdmin: false,
  user: null,
  checkAuth: async () => false,
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [user, setUser] = useState<UserInfo | null>(null);

  const checkAuth = useCallback(async (): Promise<boolean> => {
    try {
      const response = await api.get('/users/me');
      setIsLoggedIn(true);
      setUser(response.data);
      setIsAdmin(response.data.userRole === 'ADMIN');
      setIsLoading(false);
      return true;
    } catch {
      setIsLoggedIn(false);
      setUser(null);
      setIsAdmin(false);
      setIsLoading(false);
      return false;
    }
  }, []);

  useEffect(() => {
    checkAuth();

    const handleAuthChange = () => {
      checkAuth();
    };

    window.addEventListener('auth-change', handleAuthChange);
    return () => {
      window.removeEventListener('auth-change', handleAuthChange);
    };
  }, [checkAuth]);

  return (
    <AuthContext.Provider
      value={{
        isLoggedIn,
        isLoading,
        isAdmin,
        user,
        checkAuth,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
