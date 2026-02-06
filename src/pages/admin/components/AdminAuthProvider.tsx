import {
  ReactNode,
  createContext,
  useContext,
  useEffect,
  useState,
} from 'react';

import { Github, LogOut, Shield } from 'lucide-react';

import Button from '@/components/ui/Button';
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
  loginWithGoogle: () => void;
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

  const loginWithGithub = () => {
    // Redirect to GitHub OAuth
    window.location.href = '/api/admin/auth/login';
  };

  const loginWithGoogle = () => {
    // Redirect to Google OAuth
    window.location.href = '/api/admin/auth/google/login';
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
        <div className='border-t-primary-500 h-8 w-8 animate-spin rounded-full border-4 border-slate-300' />
      </div>
    );
  }

  if (!user) {
    return (
      <div className='flex min-h-screen items-center justify-center bg-slate-50 px-4'>
        <Card variant='default' className='w-full max-w-md'>
          <CardContent className='space-y-6 p-8'>
            <div className='text-center'>
              <div className='bg-primary-100 mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full'>
                <Shield className='text-primary-600 h-8 w-8' />
              </div>
              <h1 className='text-2xl font-bold text-slate-900'>
                Admin Access Required
              </h1>
              <p className='mt-2 text-slate-600'>
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
              <Button
                variant='secondary'
                fullWidth
                size='lg'
                leftIcon={
                  <svg
                    className='h-5 w-5'
                    viewBox='0 0 24 24'
                    xmlns='http://www.w3.org/2000/svg'
                  >
                    <path
                      d='M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z'
                      fill='#4285F4'
                    />
                    <path
                      d='M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z'
                      fill='#34A853'
                    />
                    <path
                      d='M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z'
                      fill='#FBBC05'
                    />
                    <path
                      d='M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z'
                      fill='#EA4335'
                    />
                  </svg>
                }
                onClick={loginWithGoogle}
              >
                Sign in with Google
              </Button>
            </div>

            <div className='rounded-md bg-slate-50 p-4 text-sm text-slate-600'>
              <p className='font-bold text-slate-900'>Authorized users only</p>
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
        loginWithGoogle,
        logout,
        checkAuth,
      }}
    >
      <div className='border-b border-slate-200 bg-white'>
        <div className='mx-auto max-w-7xl px-4 py-3 sm:px-6 lg:px-8'>
          <div className='flex items-center justify-between'>
            <div className='flex items-center gap-3'>
              <img
                src={user.avatar_url}
                alt={user.login}
                className='h-8 w-8 rounded-full'
              />
              <div>
                <p className='text-sm font-bold text-slate-900'>
                  {user.name || user.login}
                </p>
                <p className='text-xs text-slate-500'>
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
