import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Github, LogOut, Shield } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/Card';
import Button from '@/components/ui/Button';

interface GitHubUser {
  id: number;
  login: string;
  name: string;
  email: string | null;
  avatar_url: string;
}

interface AuthContextType {
  user: GitHubUser | null;
  loading: boolean;
  authenticated: boolean;
  login: () => void;
  logout: () => void;
  checkAuth: () => Promise<boolean>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function useAdminAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAdminAuth must be used within AdminAuthProvider');
  }
  return context;
}

interface AdminAuthProviderProps {
  children: ReactNode;
}

export function AdminAuthProvider({ children }: AdminAuthProviderProps) {
  const [user, setUser] = useState<GitHubUser | null>(null);
  const [loading, setLoading] = useState(true);

  const checkAuth = async (): Promise<boolean> => {
    try {
      const response = await fetch('/api/admin/auth/session');
      if (response.ok) {
        const data = await response.json();
        if (data.authenticated) {
          setUser(data.user);
          return true;
        }
      }
      setUser(null);
      return false;
    } catch (error) {
      console.error('Auth check failed:', error);
      setUser(null);
      return false;
    } finally {
      setLoading(false);
    }
  };

  const login = () => {
    // Redirect to GitHub OAuth
    window.location.href = '/api/admin/auth/login';
  };

  const logout = async () => {
    try {
      await fetch('/api/admin/auth/logout', { method: 'POST' });
      setUser(null);
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  useEffect(() => {
    checkAuth();
  }, []);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-slate-300 border-t-primary-500" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50 px-4">
        <Card variant="default" className="w-full max-w-md">
          <CardContent className="space-y-6 p-8">
            <div className="text-center">
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary-100">
                <Shield className="h-8 w-8 text-primary-600" />
              </div>
              <h1 className="text-2xl font-bold text-slate-900">
                Admin Access Required
              </h1>
              <p className="mt-2 text-slate-600">
                You need to authenticate with GitHub to access the admin dashboard.
              </p>
            </div>

            <div className="space-y-3">
              <Button
                variant="primary"
                fullWidth
                size="lg"
                leftIcon={<Github className="h-5 w-5" />}
                onClick={login}
              >
                Sign in with GitHub
              </Button>
            </div>

            <div className="rounded-md bg-slate-50 p-4 text-sm text-slate-600">
              <p className="font-bold text-slate-900">Authorized users only</p>
              <p className="mt-1">
                Only authorized GitHub users can access this area. Contact the repository
                maintainer to request access.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <AuthContext.Provider value={{ user, loading, authenticated: !!user, login, logout, checkAuth }}>
      <div className="border-b border-slate-200 bg-white">
        <div className="mx-auto max-w-7xl px-4 py-3 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <img
                src={user.avatar_url}
                alt={user.login}
                className="h-8 w-8 rounded-full"
              />
              <div>
                <p className="text-sm font-bold text-slate-900">{user.name || user.login}</p>
                <p className="text-xs text-slate-500">@{user.login}</p>
              </div>
            </div>
            <Button
              variant="ghost"
              size="sm"
              leftIcon={<LogOut className="h-4 w-4" />}
              onClick={logout}
            >
              Logout
            </Button>
          </div>
        </div>
      </div>
      {children}
    </AuthContext.Provider>
  );
}
