import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from 'react-router-dom';
import { NuqsAdapter } from 'nuqs/adapters/react-router/v6';
import Navbar from '@/components/layout/Navbar';
import Ticker from '@/components/ui/Ticker';
import Footer from '@/components/layout/Footer';
import SEO from '@/components/SEO';
import Home from '@/pages/Home';
import DesignGuide from '@/pages/DesignGuide';

// Services Imports
import Services from '@/pages/services';
import ServiceDetail from '@/pages/services/[service]';
import ServicesLayout from '@/pages/services/layout';

import AboutPage from '@/pages/about';
import AccessibilityPage from '@/pages/accessibility';
import ContactUs from '@/pages/ContactUs';
import DepartmentsIndex from '@/pages/government/departments';
import DepartmentDetail from '@/pages/government/departments/[department]';
import DepartmentsLayout from '@/pages/government/departments/layout';
import GovernmentLayout from '@/pages/government/layout';

// Legislative Branch
import LegislativeChamber from '@/pages/government/elected-officials/[chamber]';
import MunicipalCommitteesPage from '@/pages/government/elected-officials/municipal-committees';

import ElectedOfficialsIndex from './pages/government/elected-officials';
import ElectedOfficialsLayout from './pages/government/elected-officials/layout';
import BarangaysIndex from '@/pages/government/barangays';
import BarangayDetail from '@/pages/government/barangays/[barangay]';
import BarangaysLayout from '@/pages/government/barangays/layout';
// Search Page
import SearchPage from '@/pages/Search';

// Data Pages
import WeatherPage from '@/pages/data/weather';
import ForexPage from '@/pages/data/forex';

// Statistics Pages

// Legislation Pages
import LegislationLayout from '@/pages/legislation/layout';
import LegislationIndex from '@/pages/legislation/index';
import LegislationDetail from '@/pages/legislation/[document]';
import SessionDetail from '@/pages/legislation/[session]';
import PersonDetail from '@/pages/legislation/[person]';
import TermDetail from '@/pages/legislation/[term]';

// Transparency Pages
import TransparencyLayout from '@/pages/transparency/layout';
import TransparencyIndex from '@/pages/transparency/index';
import FinancialPage from '@/pages/transparency/financial';

// Sitemap Page
import SitemapPage from '@/pages/sitemap';
import Ideas from '@/pages/Ideas';
import JoinUs from '@/pages/JoinUs';
import TermsOfService from '@/pages/TermsOfService';
import ScrollToTop from '@/components/ui/ScrollToTop';
import Discord from '@/pages/Discord';
import NotFound from '@/pages/NotFound';
import StatisticsLayout from './pages/statistics/layout';
import MunicipalIncomePage from './pages/statistics/MunicipalIncomePage';
import CompetitivenessPage from './pages/statistics/CompetitivenessPage';
import PopulationPage from './pages/statistics/PopulationPage';
import ExecutiveOfficePage from './pages/government/elected-officials/ExecutiveOfficePage';
import ContributePage from './pages/contribute';

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
            <Route path='/' element={<Home />} />
            <Route path='/design' element={<DesignGuide />} />
            <Route path='/about' element={<AboutPage />} />
            <Route path='/contact' element={<ContactUs />} />
            <Route path='/accessibility' element={<AccessibilityPage />} />
            <Route path='/search' element={<SearchPage />} />
            <Route path='/ideas' element={<Ideas />} />
            <Route path='/join-us' element={<JoinUs />} />
            <Route path='/terms-of-service' element={<TermsOfService />} />
            <Route path='/sitemap' element={<SitemapPage />} />
            <Route path='/discord' Component={Discord} />

            {/* Data Routes */}
            <Route path='/data/weather' element={<WeatherPage />} />
            <Route path='/data/forex' element={<ForexPage />} />

            {/* Services Routes */}
            <Route path='/services' element={<ServicesLayout />}>
              <Route index element={<Services />} />
            </Route>
            <Route path='/services/:service' element={<ServiceDetail />} />

            {/* Government Routes */}
            <Route
              path='/government'
              element={<GovernmentLayout title='Government' />}
            >
              <Route index element={<Navigate to='executive' replace />} />

              <Route
                path='elected-officials'
                element={<ElectedOfficialsLayout />}
              >
                <Route index element={<ElectedOfficialsIndex />} />

                {/* Executive Pages moved here */}
                <Route
                  path='office-of-the-mayor'
                  element={
                    <ExecutiveOfficePage officeType='OFFICE OF THE MAYOR' />
                  }
                />
                <Route
                  path='office-of-the-vice-mayor'
                  element={
                    <ExecutiveOfficePage officeType='OFFICE OF THE VICE MAYOR' />
                  }
                />
                <Route path=':chamber' element={<LegislativeChamber />} />
                <Route
                  path='municipal-committees'
                  element={<MunicipalCommitteesPage />}
                />
              </Route>

              <Route path='departments' element={<DepartmentsLayout />}>
                <Route index element={<DepartmentsIndex />} />
                <Route path=':department' element={<DepartmentDetail />} />
              </Route>

              <Route path='barangays' element={<BarangaysLayout />}>
                <Route index element={<BarangaysIndex />} />
                <Route path=':barangay' element={<BarangayDetail />} />
              </Route>
            </Route>
            <Route path='statistics' element={<StatisticsLayout />}>
              <Route index element={<PopulationPage />} />
              <Route path='population' element={<PopulationPage />} />
              <Route
                path='municipal-income'
                element={<MunicipalIncomePage />}
              />
              <Route path='competitiveness' element={<CompetitivenessPage />} />
            </Route>
            {/* Legislation section */}
            <Route path='legislation' element={<LegislationLayout />}>
              {/* List page */}
              <Route index element={<LegislationIndex />} />
              <Route path=':type/:document' element={<LegislationDetail />} />
              <Route path='session/:sessionId' element={<SessionDetail />} />
              <Route path='person/:personId' element={<PersonDetail />} />
              <Route path='term/:termId' element={<TermDetail />} />
            </Route>

            <Route path='/transparency' element={<TransparencyLayout />}>
              <Route index element={<TransparencyIndex />} />
              <Route path='financial' element={<FinancialPage />} />
            </Route>

            {/* Contribute Page */}
            <Route path='contribute' element={<ContributePage />} />

            {/*Not Found/404 Page */}
            <Route path='*' element={<NotFound />} />
          </Routes>
          <Footer />
        </div>
      </NuqsAdapter>
    </Router>
  );
}

export default App;
