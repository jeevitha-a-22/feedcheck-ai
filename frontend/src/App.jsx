import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { TestProvider } from './context/TestContext';
import { LanguageProvider } from './context/LanguageContext';
import Layout from './components/Layout';
import Home from './pages/Home';
import NewTest from './pages/NewTest';
import Result from './pages/Result';
import History from './pages/History';
import Summary from './pages/Summary';
import HowItWorks from './pages/HowItWorks';
import Verify from './pages/Verify';

function App() {
  return (
    <BrowserRouter>
      <LanguageProvider>
        <TestProvider>
          <Layout>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/new-test" element={<NewTest />} />
            <Route path="/result/:id" element={<Result />} />
            <Route path="/result" element={<Result />} />
            <Route path="/verify/:id" element={<Verify />} />
            <Route path="/verify" element={<Verify />} />
            <Route path="/history" element={<History />} />
            <Route path="/summary" element={<Summary />} />
            <Route path="/how-it-works" element={<HowItWorks />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </Layout>
        </TestProvider>
      </LanguageProvider>
    </BrowserRouter>
  );
}

export default App;
