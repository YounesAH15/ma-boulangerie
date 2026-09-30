import { useState, useEffect } from 'react';
import { StoreProvider } from './context/StoreContext';
import { Navbar, type AppViewMode } from './components/Navbar';
import { ClientView } from './components/ClientView';
import { MerchantView } from './components/MerchantView';
import { ManagerView } from './components/ManagerView';
import { AdminConfigModal } from './components/AdminConfigModal';

const getInitialView = (): AppViewMode => {
  if (typeof window === 'undefined') return 'client';
  const params = new URLSearchParams(window.location.search);
  const viewParam = params.get('view') || params.get('role');
  const hash = window.location.hash.replace('#', '').toLowerCase();

  const target = (viewParam || hash || '').toLowerCase();
  if (target === 'merchant' || target === 'cuisine' || target === 'restaurateur') {
    return 'merchant';
  }
  if (target === 'manager' || target === 'gerant' || target === 'admin') {
    return 'manager';
  }
  return 'client';
};

function MainApp() {
  const [currentView, setCurrentView] = useState<AppViewMode>(getInitialView);
  const [isConfigOpen, setIsConfigOpen] = useState(false);

  // Sync with browser back/forward buttons
  useEffect(() => {
    const handlePopState = () => {
      setCurrentView(getInitialView());
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  const handleSelectView = (view: AppViewMode) => {
    setCurrentView(view);
    try {
      const url = new URL(window.location.href);
      url.searchParams.set('view', view);
      window.history.pushState({}, '', url.toString());
    } catch {
      // fallback if URL API fails
    }
  };

  return (
    <div className="min-h-screen flex flex-col font-sans transition-colors duration-200">
      <Navbar
        currentView={currentView}
        onSelectView={handleSelectView}
        onOpenConfig={() => setIsConfigOpen(true)}
      />

      <div className="flex-1">
        {currentView === 'client' && <ClientView />}
        {currentView === 'merchant' && <MerchantView />}
        {currentView === 'manager' && (
          <ManagerView onOpenConfig={() => setIsConfigOpen(true)} />
        )}
      </div>

      {isConfigOpen && (
        <AdminConfigModal onClose={() => setIsConfigOpen(false)} />
      )}
    </div>
  );
}

export default function App() {
  return (
    <StoreProvider>
      <MainApp />
    </StoreProvider>
  );
}
