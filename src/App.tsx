import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from 'react-router-dom';
import { NuqsAdapter } from 'nuqs/adapters/react-router/v6';
import Navbar from './components/layout/Navbar';
import Ticker from './components/ui/Ticker';
import Footer from './components/layout/Footer';
import SEO from './components/SEO';
import Home from './pages/Home';
import DesignGuide from './pages/DesignGuide';

// Services Imports
import Services from './pages/services';
import ServiceDetail from './pages/services/[service]';
import ServicesLayout from './pages/services/layout';

import AboutPage from './pages/about';
import AccessibilityPage from './pages/accessibility';
import AboutPhilippines from './pages/philippines/about';
import PhilippinesHistory from './pages/philippines/history';
import PhilippinesCulture from './pages/philippines/culture';
import PhilippinesRegions from './pages/philippines/regions';
import PhilippinesMap from './pages/philippines/map';
import PublicHolidays from './pages/philippines/holidays';
import ContactUs from './pages/ContactUs';
import Hotlines from './pages/philippines/Hotlines';
import ExecutiveDirectory from './pages/government/executive';
import ExecutiveLayout from './pages/government/executive/layout';
import DepartmentsIndex from './pages/government/departments';
import DepartmentDetail from './pages/government/departments/[department]';
import DepartmentsLayout from './pages/government/departments/layout';
import GovernmentLayout from './pages/government/layout';

// Legislative Branch
import LegislativeLayout from './pages/government/legislative/layout';
import LegislativeIndex from './pages/government/legislative/index';
import LegislativeChamber from './pages/government/legislative/[chamber]';
import HouseMembersPage from './pages/government/legislative/house-members';
import PartyListMembersPage from './pages/government/legislative/party-list-members';
import SenateCommitteesPage from './pages/government/legislative/senate-committees';

import OfficeOfTheMayor from './pages/government/executive/office-of-the-mayor';
import ExecutiveOfficials from './pages/government/executive/executive-officials';
import OfficeOfTheViceMayor from './pages/government/executive/office-of-the-vice-mayor';
import BarangaysIndex from './pages/government/barangays';
import BarangayDetail from './pages/government/barangays/[barangay]';
import BarangaysLayout from './pages/government/barangays/layout';
// Search Page
import SearchPage from './pages/Search';

// Data Pages
import WeatherPage from './pages/data/weather';
import ForexPage from './pages/data/forex';
import FloodControlProjects from './pages/flood-control-projects';
import FloodControlProjectsTable from './pages/flood-control-projects/table';
import FloodControlProjectsMap from './pages/flood-control-projects/map';
import FloodControlProjectsContractors from './pages/flood-control-projects/contractors';
import ContractorDetail from './pages/flood-control-projects/contractors/[contractor-name]';

// Legislation Pages
import LegislationLayout from './pages/legislation/layout';
import LegislationIndex from './pages/legislation/index';
import LegislationDetail from './pages/legislation/[document]';
import SessionDetail from './pages/legislation/[session]';
import PersonDetail from './pages/legislation/[person]';
import TermDetail from './pages/legislation/[term]';

// Sitemap Page
import SitemapPage from './pages/sitemap';
import Ideas from './pages/Ideas';
import JoinUs from './pages/JoinUs';
import TermsOfService from './pages/TermsOfService';
import ScrollToTop from './components/ui/ScrollToTop';
import Discord from './pages/Discord';
import SalaryGradePage from './pages/government/salary-grade/index';
import NotFound from './pages/NotFound';

function App() {
  return (
    <Router>
      <NuqsAdapter>
        <div className='min-h-screen flex flex-col'>
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

            <Route path='/philippines'>
              <Route index element={<Navigate to='about' replace />} />
              <Route path='about' element={<AboutPhilippines />} />
              <Route path='history' element={<PhilippinesHistory />} />
              <Route path='culture' element={<PhilippinesCulture />} />
              <Route path='regions' element={<PhilippinesRegions />} />
              <Route path='map' element={<PhilippinesMap />} />
              <Route path='holidays' element={<PublicHolidays />} />
              <Route path='hotlines' element={<Hotlines />} />
            </Route>

            {/* Data Routes */}
            <Route path='/data/weather' element={<WeatherPage />} />
            <Route path='/data/forex' element={<ForexPage />} />
            <Route
              path='/flood-control-projects'
              element={<FloodControlProjects />}
            />
            <Route
              path='/flood-control-projects/table'
              element={<FloodControlProjectsTable />}
            />
            <Route
              path='/flood-control-projects/map'
              element={<FloodControlProjectsMap />}
            />
            <Route
              path='/flood-control-projects/contractors'
              element={<FloodControlProjectsContractors />}
            />
            <Route
              path='/flood-control-projects/contractors/:contractor-name'
              element={<ContractorDetail />}
            />

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
              <Route path='salary-grade' element={<SalaryGradePage />} />

              <Route path='executive' element={<ExecutiveLayout />}>
                <Route index element={<ExecutiveDirectory />} />
                <Route
                  path='executive-officials'
                  element={<ExecutiveOfficials />}
                />
                <Route
                  path='office-of-the-mayor'
                  element={<OfficeOfTheMayor />}
                />
                <Route
                  path='office-of-the-vice-mayor'
                  element={<OfficeOfTheViceMayor />}
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

              <Route path='legislative' element={<LegislativeLayout />}>
                <Route index element={<LegislativeIndex />} />
                <Route path=':chamber' element={<LegislativeChamber />} />
                <Route path='house-members' element={<HouseMembersPage />} />
                <Route
                  path='party-list-members'
                  element={<PartyListMembersPage />}
                />
                <Route
                  path='senate-committees'
                  element={<SenateCommitteesPage />}
                />
              </Route>
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
