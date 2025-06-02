import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { LanguageProvider } from './contexts/LanguageContext';
import Navbar from './components/layout/Navbar';
import Ticker from './components/ui/Ticker';
import Footer from './components/layout/Footer';
import Home from './pages/Home';
import DesignGuide from './pages/DesignGuide';
import Services from './pages/Services';

function App() {
  return (
    <LanguageProvider>
      <Router>
        <div className="min-h-screen flex flex-col">
          <Navbar />
          <Ticker />
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/design" element={<DesignGuide />} />
            <Route path="/services" element={<Services />} />
          </Routes>
          <Footer />
        </div>
      </Router>
    </LanguageProvider>
  );
}

export default App