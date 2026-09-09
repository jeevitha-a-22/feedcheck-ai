import React from 'react';
import Navbar from './Navbar';
import BottomNav from './BottomNav';

export const Layout = ({ children }) => {
  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900 antialiased selection:bg-brand-500 selection:text-white">
      {/* Desktop & Tablet Top Navigation */}
      <Navbar />
      
      {/* Main Content Area */}
      <main className="flex-1 max-w-6xl w-full mx-auto px-4 sm:px-6 py-6 pb-28 md:pb-12">
        {children}
      </main>

      {/* Mobile Bottom Navigation Bar */}
      <BottomNav />
    </div>
  );
};

export default Layout;
