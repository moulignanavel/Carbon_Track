import { useState } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import Sidebar    from './Sidebar';
import TopBar     from './TopBar';
import BottomNav  from './BottomNav';
import ErrorBoundary from '@/components/errors/ErrorBoundary';
import ChatbotWidget from '@/components/chat/ChatbotWidget';
import DataNodeGrid from '@/components/landing/DataNodeGrid';

const PAGE_TITLES = {
  '/dashboard':  'Dashboard',
  '/activities': 'Activity Log',
  '/goals':      'Goals',
  '/reports':    'Reports',
  '/settings':   'Settings',
  '/admin':      'Admin',
  '/badges':     'Trophy Room',
};

export default function DashboardLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [hasScrolled, setHasScrolled] = useState(false);
  
  const { pathname } = useLocation();
  const title = PAGE_TITLES[pathname] ?? '';



  return (
    <div className="relative flex h-dvh overflow-hidden bg-slate-50 dark:bg-gradient-to-br dark:from-[#020617] dark:via-[#090d16] dark:to-[#020617]">
      {/* Subtle background nodes in dark mode */}
      <div className="absolute inset-0 pointer-events-none z-0 hidden dark:block opacity-35" aria-hidden="true">
        <DataNodeGrid />
      </div>

      {/* Sidebar — hidden on mobile, always visible on md+ */}
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      {/* Main column */}
      <div className="z-10 flex min-w-0 flex-1 flex-col overflow-hidden">
        <TopBar onMenuClick={() => setSidebarOpen(true)} title={title} hasScrolled={hasScrolled} />

        <main
          className="min-h-0 flex-1 overflow-x-hidden overflow-y-auto p-3 pb-20 md:p-4 md:pb-5"
          onScroll={(event) => setHasScrolled(event.currentTarget.scrollTop > 10)}
        >
          <ErrorBoundary>
            <Outlet />
          </ErrorBoundary>
        </main>
      </div>

      {/* Mobile bottom nav */}
      <BottomNav />

      {/* Global AI Chatbot */}
      <ChatbotWidget />

      <Toaster
        position="top-right"
        toastOptions={{
          duration: 4000,
          style: {
            background: '#fff',
            color: '#1e293b',
            borderRadius: '0.875rem',
            boxShadow: '0 4px 24px rgb(0 0 0 / .10)',
            fontSize: '0.875rem',
            padding: '12px 16px',
          },
          success: {
            iconTheme: { primary: '#16a34a', secondary: '#fff' },
          },
          error: {
            iconTheme: { primary: '#dc2626', secondary: '#fff' },
          },
        }}
      />
    </div>
  );
}
