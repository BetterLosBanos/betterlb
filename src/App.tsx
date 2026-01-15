import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from 'react-router-dom';
import { NuqsAdapter } from 'nuqs/adapters/react-router/v6';

// --- Layouts ---
import Navbar from '@/components/layout/Navbar';
import Ticker from '@/components/ui/Ticker';
import Footer from '@/components/layout/Footer';
import SEO from '@/components/SEO';
import ScrollToTop from '@/components/ui/ScrollToTop';

import GovernmentLayout from '@/pages/government/layout';
import ElectedOfficialsLayout from '@/pages/government/elected-officials/layout';
import DepartmentsLayout from '@/pages/government/departments/layout';
import BarangaysLayout from '@/pages/government/barangays/layout';
import ServicesLayout from '@/pages/services/layout';
import StatisticsLayout from '@/pages/statistics/layout';
import LegislationLayout from '@/pages/legislation/layout';
import TransparencyLayout from '@/pages/transparency/layout';

// --- Pages ---
import Home from '@/pages/Home';
import AboutPage from '@/pages/about';
import AccessibilityPage from '@/pages/accessibility';
import ContactUs from '@/pages/ContactUs';
import SearchPage from '@/pages/Search';
import SitemapPage from '@/pages/sitemap';
import Ideas from '@/pages/Ideas';
import JoinUs from '@/pages/JoinUs';
import TermsOfService from '@/pages/TermsOfService';
import Discord from '@/pages/Discord';
import NotFound from '@/pages/NotFound';
import ContributePage from './pages/contribute';

// --- Data Pages ---
import WeatherPage from '@/pages/data/weather';
import ForexPage from '@/pages/data/forex';

// --- Directory Modules ---
import ElectedOfficialsIndex from './pages/government/elected-officials';
import ExecutiveBranchPage from '@/pages/government/elected-officials/executive-branch';
import LegislativeChamber from '@/pages/government/elected-officials/[chamber]';
import MunicipalCommitteesPage from '@/pages/government/elected-officials/municipal-committees';

import DepartmentsIndex from '@/pages/government/departments';
import DepartmentDetail from '@/pages/government/departments/[department]';

import BarangaysIndex from '@/pages/government/barangays';
import BarangayDetail from '@/pages/government/barangays/[barangay]';

// --- Services & Legislation ---
import Services from '@/pages/services';
import ServiceDetail from '@/pages/services/[service]';

import LegislationIndex from '@/pages/legislation/index';
import LegislationDetail from '@/pages/legislation/[document]';
import SessionDetail from '@/pages/legislation/[session]';
import PersonDetail from '@/pages/legislation/[person]';
import TermDetail from '@/pages/legislation/[term]';

import TransparencyIndex from '@/pages/transparency/index';
import FinancialPage from '@/pages/transparency/financial';

import PopulationPage from './pages/statistics/PopulationPage';
import CompetitivenessPage from './pages/statistics/CompetitivenessPage';
import MunicipalIncomePage from './pages/statistics/MunicipalIncomePage';
import InfrastructurePage from './pages/transparency/infrastructure';
import ProcurementPage from './pages/transparency/procurement';

function App() {
  return (
    <Router>
      <NuqsAdapter>
        <div className='flex flex-col min-h-screen'>
          <SEO />
          <Navbar />
          <Ticker />
          <ScrollToTop />

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
            <Route path='/discord' Component={Discord} />

            {/* Data Utilities */}
            <Route path='/data/weather' element={<WeatherPage />} />
            <Route path='/data/forex' element={<ForexPage />} />

            {/* Services Module (Detail nested in Layout for Sidebar persistence) */}
            <Route path='/services' element={<ServicesLayout />}>
              <Route index element={<Services />} />
              <Route path=':service' element={<ServiceDetail />} />
            </Route>

            {/* Government Directory Hub */}
            <Route
              path='/government'
              element={<GovernmentLayout title='Government' />}
            >
              <Route
                index
                element={<Navigate to='elected-officials' replace />}
              />

              {/* 1. Elected Officials & Executive Branch */}
              <Route
                path='elected-officials'
                element={<ElectedOfficialsLayout />}
              >
                <Route index element={<ElectedOfficialsIndex />} />

                {/* Unified Executive Route */}
                <Route
                  path='executive-branch'
                  element={<ExecutiveBranchPage />}
                />

                {/* Legislative Chamber Details */}
                <Route path=':chamber' element={<LegislativeChamber />} />
                <Route
                  path='municipal-committees'
                  element={<MunicipalCommitteesPage />}
                />

                {/* Legacy Redirection for old bookmarks */}
                <Route
                  path='office-of-the-mayor'
                  element={<Navigate to='../executive' replace />}
                />
                <Route
                  path='office-of-the-vice-mayor'
                  element={<Navigate to='../executive' replace />}
                />
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
            </Route>

            {/* Statistics Dashboard */}
            <Route path='statistics' element={<StatisticsLayout />}>
              <Route index element={<PopulationPage />} />
              <Route path='population' element={<PopulationPage />} />
              <Route
                path='municipal-income'
                element={<MunicipalIncomePage />}
              />
              <Route path='competitiveness' element={<CompetitivenessPage />} />
            </Route>

            {/* Legislation Archive */}
            <Route path='legislation' element={<LegislationLayout />}>
              <Route index element={<LegislationIndex />} />
              <Route path=':type/:document' element={<LegislationDetail />} />
              <Route path='session/:sessionId' element={<SessionDetail />} />
              <Route path='person/:personId' element={<PersonDetail />} />
              <Route path='term/:termId' element={<TermDetail />} />
            </Route>

            {/* Transparency Portal */}
            <Route path='/transparency' element={<TransparencyLayout />}>
              <Route index element={<TransparencyIndex />} />
              <Route path='financial' element={<FinancialPage />} />
              <Route path='procurement' element={<ProcurementPage />} />
              <Route path='infrastructure' element={<InfrastructurePage />} />
            </Route>

            {/* Community Contribution Flow */}
            <Route path='contribute' element={<ContributePage />} />

            {/* Catch-all 404 */}
            <Route path='*' element={<NotFound />} />
          </Routes>

          <Footer />
        </div>
      </NuqsAdapter>
    </Router>
  );
}

export default App;
