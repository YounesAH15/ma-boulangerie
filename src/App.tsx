import { useState, useEffect } from 'react';
import { StoreProvider, useStore } from './context/StoreContext';
import { Navbar, type AppViewMode } from './components/Navbar';
import { ClientView } from './components/ClientView';
import { MerchantView } from './components/MerchantView';
import { ManagerView } from './components/ManagerView';
import { AdminConfigModal } from './components/AdminConfigModal';
import { ManagerPinModal } from './components/ManagerPinModal';

const parseUrlView = (): AppViewMode => {
  if (typeof window === 'undefined') return 'client';
  const params = new URLSearchParams(window.location.search);
  const viewParam = (params.get('view') || params.get('role') || '').toLowerCase();
  const hash = window.location.hash.replace('#', '').toLowerCase();
  const path = window.location.pathname.toLowerCase().replace(/\/$/, '');

  const isMerchant =
    viewParam === 'merchant' || viewParam === 'cuisine' || viewParam === 'restaurateur' ||
    hash === 'merchant' || hash === 'cuisine' || hash === 'restaurateur' ||
    path.endsWith('/cuisine') || path.endsWith('/merchant') || path.endsWith('/restaurateur');

  if (isMerchant) {
    return 'merchant';
  }

  const isManager =
    viewParam === 'manager' || viewParam === 'gerant' || viewParam === 'admin' ||
    hash === 'manager' || hash === 'gerant' || hash === 'admin' ||
    path.endsWith('/gerant') || path.endsWith('/manager') || path.endsWith('/admin');

  if (isManager) {
    return 'manager';
  }

  return 'client';
};

function MainApp() {
  const { config } = useStore();
  const [currentView, setCurrentView] = useState<AppViewMode>(parseUrlView);
  const [isManager, setIsManager] = useState<boolean>(() => {
    if (typeof window === 'undefined') return false;
    return sessionStorage.getItem('boulangerie_is_manager') === 'true';
  });
  const [isConfigOpen, setIsConfigOpen] = useState(false);
  const [isPinModalOpen, setIsPinModalOpen] = useState(false);

  // Check on mount if user directly opened ?view=gerant without active manager auth
  useEffect(() => {
    const initialTarget = parseUrlView();
    if (initialTarget === 'manager') {
      const auth = sessionStorage.getItem('boulangerie_is_manager') === 'true';
      if (!auth) {
        setIsPinModalOpen(true);
      } else {
        setIsManager(true);
      }
    }
  }, []);

  // Sync with browser back/forward buttons
  useEffect(() => {
    const handlePopState = () => {
      const target = parseUrlView();
      if (target === 'manager') {
        const auth = sessionStorage.getItem('boulangerie_is_manager') === 'true';
        if (!auth) {
          setIsPinModalOpen(true);
          return;
        }
      }
      setCurrentView(target);
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  const updateUrl = (param: string) => {
    try {
      const url = new URL(window.location.href);
      url.searchParams.set('view', param);
      window.history.pushState({}, '', url.toString());
    } catch {
      // fallback
    }
  };

  const handleSelectView = (view: AppViewMode) => {
    if (view === 'manager') {
      const auth = sessionStorage.getItem('boulangerie_is_manager') === 'true';
      if (!auth) {
        setIsPinModalOpen(true);
        return;
      }
      setIsManager(true);
      setCurrentView('manager');
      updateUrl('gerant');
      return;
    }

    if (view === 'merchant') {
      setCurrentView('merchant');
      updateUrl('cuisine');
      return;
    }

    if (view === 'client') {
      setCurrentView('client');
      updateUrl('client');
      return;
    }
  };

  const handleExitManager = () => {
    sessionStorage.removeItem('boulangerie_is_manager');
    setIsManager(false);
    setCurrentView('client');
    updateUrl('client');
  };

  const handlePinSuccess = () => {
    sessionStorage.setItem('boulangerie_is_manager', 'true');
    setIsManager(true);
    setCurrentView('manager');
    setIsPinModalOpen(false);
    updateUrl('gerant');
  };

  const handlePinCancel = () => {
    setIsPinModalOpen(false);
    if (currentView === 'manager' || parseUrlView() === 'manager') {
      setCurrentView('client');
      updateUrl('client');
    }
  };

  return (
    <div className="min-h-screen flex flex-col font-sans transition-colors duration-200">
      <Navbar
        currentView={currentView}
        isManager={isManager}
        onSelectView={handleSelectView}
        onOpenConfig={() => setIsConfigOpen(true)}
        onExitManager={handleExitManager}
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

      {isPinModalOpen && (
        <ManagerPinModal
          correctPin={config.managerPin || '1234'}
          onSuccess={handlePinSuccess}
          onCancel={handlePinCancel}
        />
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
