/**
 * Mock Admin Auth Provider for local development
 * Bypasses GitHub OAuth and simulates an authenticated user
 */
import {
  ReactNode,
  createContext,
  useContext,
  useEffect,
  useState,
} from 'react';

interface MockUser {
  id: string;
  login: string;
  name: string;
  email: string;
  avatar_url: string;
}

interface AdminAuthContextType {
  user: MockUser | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  isAuthorized: boolean;
  login: () => void;
  logout: () => void;
}

const AdminAuthContext = createContext<AdminAuthContextType | undefined>(
  undefined
);

export function useAdminAuth() {
  const context = useContext(AdminAuthContext);
  if (context === undefined) {
    throw new Error('useAdminAuth must be used within an AdminAuthProvider');
  }
  return context;
}

interface AdminAuthProviderProps {
  children: ReactNode;
  mockMode?: boolean;
}

export function MockAdminAuthProvider({
  children,
  mockMode = true,
}: AdminAuthProviderProps) {
  const [user, setUser] = useState<MockUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (mockMode) {
      // Simulate authenticated user in mock mode
      setTimeout(() => {
        setUser({
          id: 'mock-user-1',
          login: 'mock-user',
          name: 'Mock User',
          email: 'mock@example.com',
          avatar_url: 'https://github.com/github.png',
        });
        setIsLoading(false);
      }, 100);
    } else {
      // Check real session
      checkSession();
    }
  }, [mockMode]);

  const checkSession = async () => {
    try {
      const response = await fetch('/api/admin/auth/session');
      if (response.ok) {
        const data = await response.json();
        setUser(data.user);
      }
    } catch (error) {
      console.error('Session check failed:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const login = () => {
    if (mockMode) {
      setUser({
        id: 'mock-user-1',
        login: 'mock-user',
        name: 'Mock User',
        email: 'mock@example.com',
        avatar_url: 'https://github.com/github.png',
      });
    } else {
      // Redirect to real GitHub OAuth
      window.location.href = '/api/admin/auth/login';
    }
  };

  const logout = async () => {
    if (mockMode) {
      setUser(null);
    } else {
      await fetch('/api/admin/auth/logout', { method: 'POST' });
      setUser(null);
    }
  };

  // In mock mode, always authorized. In real mode, check against authorized users
  const isAuthorized = mockMode ? !!user : true; // Add real authorization logic

  return (
    <AdminAuthContext.Provider
      value={{
        user,
        isLoading,
        isAuthenticated: !!user,
        isAuthorized,
        login,
        logout,
      }}
    >
      {children}
    </AdminAuthContext.Provider>
  );
}
