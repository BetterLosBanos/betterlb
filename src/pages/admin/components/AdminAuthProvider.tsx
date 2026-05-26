import {
  ReactNode,
  createContext,
  useContext,
  useEffect,
  useState,
} from 'react';

import { Button } from '@bettergov/kapwa/button';
import { Github, LogOut, Shield } from 'lucide-react';

import { Card, CardContent } from '@/components/ui/Card';

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
  loginWithGithub: () => void;
  logout: () => void;
  checkAuth: () => Promise<boolean>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// eslint-disable-next-line react-refresh/only-export-components
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

  const loginWithGithub = () => {
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
      <div className='flex min-h-screen items-center justify-center'>
        <div className='border-t-primary-500 border-kapwa-border-weak h-8 w-8 animate-spin rounded-full border-4' />
      </div>
    );
  }

  if (!user) {
    return (
      <div className='bg-kapwa-bg-surface-raised flex min-h-screen items-center justify-center px-4'>
        <Card variant='default' className='w-full max-w-md'>
          <CardContent className='space-y-6 p-8'>
            <div className='text-center'>
              <div className='bg-kapwa-bg-brand-weak mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full'>
                <Shield className='text-kapwa-text-brand h-8 w-8' />
              </div>
              <h1 className='text-kapwa-text-strong kapwa-heading-xl font-extrabold'>
                Admin Access Required
              </h1>
              <p className='text-kapwa-text-support mt-2'>
                You need to authenticate to access the admin dashboard.
              </p>
            </div>

            <div className='space-y-3'>
              <Button
                variant='primary'
                fullWidth
                size='lg'
                leftIcon={<Github className='h-5 w-5' />}
                onClick={loginWithGithub}
              >
                Sign in with GitHub
              </Button>
            </div>

            <div className='bg-kapwa-bg-surface-raised text-kapwa-text-support rounded-md p-4 text-sm'>
              <p className='text-kapwa-text-strong font-bold'>
                Authorized users only
              </p>
              <p className='mt-1'>
                Only authorized GitHub users can access this area. Contact the
                repository maintainer to request access.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        authenticated: !!user,
        loginWithGithub,
        logout,
        checkAuth,
      }}
    >
      <div className='border-kapwa-border-weak bg-kapwa-bg-surface border-b'>
        <div className='mx-auto max-w-7xl px-4 py-3 sm:px-6 lg:px-8'>
          <div className='flex items-center justify-between'>
            <div className='flex items-center gap-3'>
              <img
                src={user.avatar_url}
                alt={user.login}
                className='h-8 w-8 rounded-full'
              />
              <div>
                <p className='text-kapwa-text-strong text-sm font-bold'>
                  {user.name || user.login}
                </p>
                <p className='text-kapwa-text-disabled text-xs'>
                  {user.email || user.login}
                </p>
              </div>
            </div>
            <Button
              variant='ghost'
              size='sm'
              leftIcon={<LogOut className='h-4 w-4' />}
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
