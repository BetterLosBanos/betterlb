import { Outlet } from 'react-router-dom';
import { Shield } from 'lucide-react';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import { Badge } from '@/components/ui/Badge';
import { AdminAuthProvider } from './components/AdminAuthProvider';
import { MockAdminAuthProvider } from './components/MockAdminAuthProvider';

// Use mock mode for local development (set VITE_ADMIN_MOCK_MODE=true in .env)
const USE_MOCK_AUTH = import.meta.env.VITE_ADMIN_MOCK_MODE === 'true';

function AdminContent() {
  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />
      <div className="mx-auto w-full max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <div className="mb-2 flex items-center gap-3">
              <Shield className="h-8 w-8 text-primary-500" />
              <h1 className="text-3xl font-extrabold text-slate-900">
                Admin Dashboard
              </h1>
              <Badge variant={USE_MOCK_AUTH ? 'info' : 'warning'}>
                {USE_MOCK_AUTH ? 'Mock Mode' : 'Admin Only'}
              </Badge>
            </div>
            <p className="text-slate-600">
              Review and manage legislative data pipeline issues
            </p>
          </div>
        </div>
        <Outlet />
      </div>
      <Footer />
    </div>
  );
}

export default function AdminLayout() {
  const AuthProvider = USE_MOCK_AUTH ? MockAdminAuthProvider : AdminAuthProvider;

  return (
    <AuthProvider mockMode={USE_MOCK_AUTH}>
      <AdminContent />
    </AuthProvider>
  );
}
