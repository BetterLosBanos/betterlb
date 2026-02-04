import { Outlet, useLocation } from 'react-router-dom';

import { Shield } from 'lucide-react';

import Footer from '@/components/layout/Footer';
import Navbar from '@/components/layout/Navbar';
import {
  Breadcrumb,
  BreadcrumbHome,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/navigation/Breadcrumb';
import { Badge } from '@/components/ui/Badge';

import { AdminAuthProvider } from './components/AdminAuthProvider';
import { MockAdminAuthProvider } from './components/MockAdminAuthProvider';

// Use mock mode for local development (set VITE_ADMIN_MOCK_MODE=true in .env)
const USE_MOCK_AUTH = import.meta.env.VITE_ADMIN_MOCK_MODE === 'true';

interface BreadcrumbRoute {
  path: string;
  title: string;
}

// Route to title mapping for breadcrumbs
const ADMIN_ROUTES: Record<string, string> = {
  '/admin': 'Admin',
  '/admin/documents': 'Documents',
  '/admin/errors': 'Error Log',
  '/admin/review-queue': 'Review Queue',
  '/admin/reconcile': 'Reconcile',
  '/admin/persons': 'Persons',
  '/admin/persons/merge': 'Merge',
  '/admin/persons/deletion-queue': 'Deletion Queue',
};

function getBreadcrumbs(pathname: string): BreadcrumbRoute[] {
  const breadcrumbs: BreadcrumbRoute[] = [];
  const segments = pathname.split('/').filter(Boolean);

  // Build up the path incrementally
  let currentPath = '';
  for (const segment of segments) {
    currentPath += `/${segment}`;
    const title = ADMIN_ROUTES[currentPath];
    if (title) {
      breadcrumbs.push({ path: currentPath, title });
    }
  }

  // If no routes matched, just show Admin
  if (breadcrumbs.length === 0) {
    breadcrumbs.push({ path: '/admin', title: 'Admin' });
  }

  return breadcrumbs;
}

function AdminContent() {
  const location = useLocation();
  const breadcrumbs = getBreadcrumbs(location.pathname);

  return (
    <div className='flex min-h-screen flex-col'>
      <Navbar />
      <div className='mx-auto w-full max-w-7xl px-4 py-8 sm:px-6 lg:px-8'>
        <div className='mb-8 flex items-center justify-between'>
          <div>
            <div className='mb-2 flex items-center gap-3'>
              <Shield className='text-primary-500 h-8 w-8' />
              <h1 className='text-3xl font-extrabold text-slate-900'>
                Admin Dashboard
              </h1>
              <Badge variant={USE_MOCK_AUTH ? 'info' : 'warning'}>
                {USE_MOCK_AUTH ? 'Mock Mode' : 'Admin Only'}
              </Badge>
            </div>
            <p className='text-slate-600'>
              Review and manage legislative data pipeline issues
            </p>
          </div>
        </div>

        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbHome href='/' />
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            {breadcrumbs.map((crumb, index) => (
              <div key={crumb.path} className='flex items-center gap-2'>
                <BreadcrumbItem>
                  {index === breadcrumbs.length - 1 ? (
                    <BreadcrumbPage>{crumb.title}</BreadcrumbPage>
                  ) : (
                    <BreadcrumbLink href={crumb.path}>
                      {crumb.title}
                    </BreadcrumbLink>
                  )}
                </BreadcrumbItem>
                {index < breadcrumbs.length - 1 && <BreadcrumbSeparator />}
              </div>
            ))}
          </BreadcrumbList>
        </Breadcrumb>

        <Outlet />
      </div>
      <Footer />
    </div>
  );
}

export default function AdminLayout() {
  const AuthProvider = USE_MOCK_AUTH
    ? MockAdminAuthProvider
    : AdminAuthProvider;

  return (
    <AuthProvider mockMode={USE_MOCK_AUTH}>
      <AdminContent />
    </AuthProvider>
  );
}
