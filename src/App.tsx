import {
  Navigate,
  Route,
  BrowserRouter as Router,
  Routes,
  useLocation,
} from 'react-router-dom';

import { lazy, Suspense } from 'react';

import { NuqsAdapter } from 'nuqs/adapters/react-router/v6';

import { config } from '@/lib/lguConfig';
import { Footer } from '@/components/layout/Footer';
// --- Layouts ---
import { Navbar } from '@/components/layout/Navbar';
import { SEO } from '@/components/layout/SEO';
import { ScrollToTop } from '@/components/layout/ScrollToTop';
import Ticker from '@/components/ui/Ticker';

// --- Lazy-loaded Pages ---
const Home = lazy(() => import('@/pages/Home'));
const AboutPage = lazy(() => import('@/pages/about'));
const ContactUs = lazy(() => import('@/pages/ContactUs'));
const AccessibilityPage = lazy(() => import('@/pages/accessibility'));
const SearchPage = lazy(() => import('@/pages/Search'));
const Ideas = lazy(() => import('@/pages/Ideas'));
const JoinUs = lazy(() => import('@/pages/JoinUs'));
const TermsOfService = lazy(() => import('@/pages/TermsOfService'));
const SitemapPage = lazy(() => import('@/pages/sitemap'));
const Discord = lazy(() => import('@/pages/Discord'));

// Data Utilities
const WeatherPage = lazy(() => import('@/pages/data/weather'));
const ForexPage = lazy(() => import('@/pages/data/forex'));

// Services Module
const ServicesLayout = lazy(() => import('@/pages/services/layout'));
const Services = lazy(() => import('@/pages/services'));
const ServiceDetail = lazy(() => import('@/pages/services/[service]'));

// Government Directory
const GovernmentRootLayout = lazy(() => import('@/pages/government/layout'));
const ElectedOfficialsLayout = lazy(
  () => import('@/pages/government/elected-officials/layout')
);
const ElectedOfficialsIndex = lazy(
  () => import('@/pages/government/elected-officials')
);
const MunicipalCommitteesPage = lazy(
  () => import('@/pages/government/elected-officials/municipal-committees')
);
const DepartmentsLayout = lazy(
  () => import('@/pages/government/departments/layout')
);
const DepartmentsIndex = lazy(() => import('@/pages/government/departments'));
const DepartmentDetail = lazy(
  () => import('@/pages/government/departments/[department]')
);
const BarangaysLayout = lazy(
  () => import('@/pages/government/barangays/layout')
);
const BarangaysIndex = lazy(() => import('@/pages/government/barangays'));
const BarangayDetail = lazy(
  () => import('@/pages/government/barangays/[barangay]')
);
const ReferenceImplementationPage = lazy(
  () => import('@/pages/government/reference-implementation')
);

// Statistics Dashboard
const StatisticsLayout = lazy(() => import('@/pages/statistics/layout'));
const PopulationPage = lazy(() => import('@/pages/statistics/PopulationPage'));
const MunicipalIncomePage = lazy(
  () => import('@/pages/statistics/MunicipalIncomePage')
);
const CompetitivenessPage = lazy(
  () => import('@/pages/statistics/CompetitivenessPage')
);

// OpenLGU Portal
const OpenLGULayout = lazy(() => import('@/pages/openlgu/layout'));
const LegislationIndex = lazy(() => import('@/pages/openlgu/index'));
const OfficialsIndex = lazy(() => import('@/pages/openlgu/officials'));
const TermsIndex = lazy(() => import('@/pages/openlgu/terms'));
const LegacyDocumentRedirect = lazy(
  () => import('@/pages/openlgu/LegacyDocumentRedirect')
);
const LegislationDetail = lazy(() => import('@/pages/openlgu/[document]'));
const PersonDetail = lazy(() => import('@/pages/openlgu/[person]'));
const SessionDetail = lazy(() => import('@/pages/openlgu/[session]'));
const TermDetail = lazy(() => import('@/pages/openlgu/[term]'));

// Transparency Portal
const TransparencyLayout = lazy(() => import('@/pages/transparency/layout'));
const TransparencyIndex = lazy(() => import('@/pages/transparency/index'));
const FinancialPage = lazy(() => import('@/pages/transparency/financial'));
const ProcurementPage = lazy(() => import('@/pages/transparency/procurement'));
const InfrastructurePage = lazy(
  () => import('@/pages/transparency/infrastructure')
);
const InfrastructureDetail = lazy(
  () => import('@/pages/transparency/infrastructure/[project]')
);

// Community
const ContributePage = lazy(() => import('@/pages/contribute'));

// Admin
const AdminLayout = lazy(() => import('@/pages/admin/layout'));
const AdminDashboard = lazy(() => import('@/pages/admin/index'));
const AdminDocuments = lazy(() => import('@/pages/admin/Documents'));
const PersonMergeTool = lazy(
  () => import('@/pages/admin/components/PersonMergeTool')
);
const DeletionQueue = lazy(
  () => import('@/pages/admin/components/DeletionQueue')
);
const AdminErrorLog = lazy(() => import('@/pages/admin/ErrorLog'));
const AdminAuditLog = lazy(() => import('@/pages/admin/AuditLog'));
const AdminReviewQueue = lazy(() => import('@/pages/admin/ReviewQueue'));
const AdminReconcile = lazy(() => import('@/pages/admin/Reconcile'));
const AdminOpenLguWorkbench = lazy(
  () => import('@/pages/admin/OpenLguWorkbench')
);

// NotFound — keep eager, it's tiny and needs to render instantly
import NotFound from '@/pages/NotFound';

/** Minimal loading fallback for route transitions */
function PageLoader() {
  return (
    <div className='flex min-h-[40vh] items-center justify-center'>
      <div className='text-kapwa-text-muted text-sm'>Loading…</div>
    </div>
  );
}

function App() {
  return (
    <Router>
      <NuqsAdapter>
        <AppContent />
      </NuqsAdapter>
    </Router>
  );
}

function AppContent() {
  const location = useLocation();
  const isAdminRoute = location.pathname.startsWith('/admin');

  return (
    <div className='flex flex-col min-h-screen'>
      <SEO />
      {!isAdminRoute && <Navbar />}
      {!isAdminRoute && <Ticker />}
      <ScrollToTop />

      <Suspense fallback={<PageLoader />}>
        <Routes>
          {/* Standard Global Pages */}
          <Route path='/' element={<Home />} />
          <Route path='/about' element={<AboutPage />} />
          <Route path='/contact' element={<ContactUs />} />
          <Route path='/accessibility' element={<AccessibilityPage />} />
          <Route path='/search' element={<SearchPage />} />
          <Route path='/ideas' element={<Ideas />} />
          <Route path='/join-us' element={<JoinUs />} />
          <Route path='/terms-of-service' element={<TermsOfService />} />
          <Route path='/sitemap' element={<SitemapPage />} />
          <Route path='/discord' element={<Discord />} />

          {/* Data Utilities */}
          <Route path='/data/weather' element={<WeatherPage />} />
          <Route path='/data/forex' element={<ForexPage />} />

          {/* Services Module */}
          <Route path='/services' element={<ServicesLayout />}>
            <Route index element={<Services />} />
            <Route path=':service' element={<ServiceDetail />} />
          </Route>

          {/* Government Directory Hub */}
          <Route path='/government' element={<GovernmentRootLayout />}>
            <Route
              index
              element={<Navigate to='elected-officials' replace />}
            />

            {/* 1. Elected Officials */}
            <Route
              path='elected-officials'
              element={<ElectedOfficialsLayout />}
            >
              <Route index element={<ElectedOfficialsIndex />} />
              <Route path='committees' element={<MunicipalCommitteesPage />} />
            </Route>

            {/* 2. Municipal Departments */}
            <Route path='departments' element={<DepartmentsLayout />}>
              <Route index element={<DepartmentsIndex />} />
              <Route path=':department' element={<DepartmentDetail />} />
            </Route>

            {/* 3. Barangay Directory */}
            <Route path='barangays' element={<BarangaysLayout />}>
              <Route index element={<BarangaysIndex />} />
              <Route path=':barangay' element={<BarangayDetail />} />
            </Route>

            {/* 4. Reference Implementation */}
            <Route
              path='reference-implementation'
              element={<ReferenceImplementationPage />}
            />
          </Route>

          {/* Statistics Dashboard — feature gated */}
          {config.features.statistics && (
            <Route path='statistics' element={<StatisticsLayout />}>
              <Route index element={<PopulationPage />} />
              <Route path='population' element={<PopulationPage />} />
              <Route
                path='municipal-income'
                element={<MunicipalIncomePage />}
              />
              <Route path='competitiveness' element={<CompetitivenessPage />} />
            </Route>
          )}

          {/* OpenLGU Portal — feature gated */}
          {config.features.openLGU && (
            <Route path='openlgu' element={<OpenLGULayout />}>
              <Route index element={<LegislationIndex />} />
              <Route path='officials' element={<OfficialsIndex />} />
              <Route path='terms' element={<TermsIndex />} />
              {/* Legacy redirect for backward compatibility */}
              <Route
                path=':type/:document'
                element={<LegacyDocumentRedirect />}
              />
              {/* New unified document route */}
              <Route
                path='documents/:document'
                element={<LegislationDetail />}
              />
              <Route path='session/:sessionId' element={<SessionDetail />} />
              <Route path='person/:personId' element={<PersonDetail />} />
              <Route path='term/:termId' element={<TermDetail />} />
            </Route>
          )}

          {/* Transparency Portal — feature gated */}
          {config.features.transparency && (
            <Route path='/transparency' element={<TransparencyLayout />}>
              <Route index element={<TransparencyIndex />} />
              <Route path='financial' element={<FinancialPage />} />
              <Route path='procurement' element={<ProcurementPage />} />
              <Route path='/transparency/infrastructure'>
                <Route index element={<InfrastructurePage />} />
                <Route path=':contractId' element={<InfrastructureDetail />} />
              </Route>
            </Route>
          )}

          {/* Community Contribution Flow */}
          <Route path='contribute' element={<ContributePage />} />

          {/* Admin Routes */}
          <Route path='/admin' element={<AdminLayout />}>
            <Route index element={<AdminDashboard />} />
            <Route path='documents' element={<AdminDocuments />} />
            <Route path='persons/merge' element={<PersonMergeTool />} />
            <Route path='persons/deletion-queue' element={<DeletionQueue />} />
            <Route path='errors' element={<AdminErrorLog />} />
            <Route path='audit-logs' element={<AdminAuditLog />} />
            <Route path='review-queue' element={<AdminReviewQueue />} />
            <Route path='reconcile' element={<AdminReconcile />} />
            <Route
              path='openlgu/workbench'
              element={<AdminOpenLguWorkbench />}
            />
          </Route>

          {/* Catch-all 404 */}
          <Route path='*' element={<NotFound />} />
        </Routes>
      </Suspense>

      {!isAdminRoute && <Footer />}
    </div>
  );
}

export default App;
