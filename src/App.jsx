import React from 'react';
import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';
import Sidebar from './components/Sidebar';
import Home from './pages/Home';
import TickerDetail from './pages/TickerDetail';
import { Toaster } from 'react-hot-toast';
import { AnimatePresence } from 'framer-motion';

// Inner component to handle routing animations inside BrowserRouter
const MainLayout = () => {
  const location = useLocation();
  
  return (
    <div className="flex min-h-screen bg-[#0a0a0a] text-white selection:bg-neon-cyan/30">
      <Sidebar />
      <main className="flex-1 p-6 md:p-8 overflow-y-auto h-screen relative scroll-smooth">
        {/* Subtle background glow effect behind content */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-[800px] h-[500px] bg-neon-purple/5 blur-[120px] pointer-events-none rounded-full" />
        <div className="absolute bottom-0 right-0 w-[500px] h-[500px] bg-neon-cyan/5 blur-[120px] pointer-events-none rounded-full" />
        
        <div className="relative z-10 max-w-7xl mx-auto pb-12">
          <AnimatePresence mode="wait">
            <Routes location={location} key={location.pathname}>
              <Route path="/" element={<Home />} />
              <Route path="/ticker/:tickerId" element={<TickerDetail />} />
            </Routes>
          </AnimatePresence>
        </div>
      </main>
      
      {/* Global Toast Configuration */}
      <Toaster 
        position="bottom-right"
        toastOptions={{
          style: {
            background: 'rgba(20, 20, 20, 0.9)',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            backdropFilter: 'blur(10px)',
            color: '#fff',
            fontWeight: '600',
            letterSpacing: '0.02em',
          },
          success: {
            iconTheme: {
              primary: '#00e5ff',
              secondary: '#0a0a0a',
            },
          },
        }}
      />
    </div>
  );
};

function App() {
  return (
    <BrowserRouter>
      <MainLayout />
    </BrowserRouter>
  );
}

export default App;
