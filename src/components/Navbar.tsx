import React from 'react';
import { useStore } from '../context/StoreContext';
import { ThemeSelector } from './ThemeSelector';
import { Smartphone, ChefHat, Sliders, Crown } from 'lucide-react';

export type AppViewMode = 'client' | 'merchant' | 'manager';

interface NavbarProps {
  currentView: AppViewMode;
  onSelectView: (view: AppViewMode) => void;
  onOpenConfig: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ currentView, onSelectView, onOpenConfig }) => {
  const { orders } = useStore();
  const activeOrdersCount = orders.filter((o) => o.status === 'in_progress').length;

  return (
    <header
      className="border-b sticky top-0 z-40 backdrop-blur-md transition-colors"
      style={{
        backgroundColor: 'rgba(var(--color-card), 0.95)',
        borderColor: 'var(--color-border)',
      }}
    >
      <div className="max-w-4xl mx-auto px-4 py-2.5 flex flex-wrap items-center justify-between gap-2">
        {/* Toggle 3 Rôles : Client / Restaurateur / Gérant */}
        <div className="flex items-center rounded-2xl bg-black/5 dark:bg-white/5 p-1 border overflow-x-auto no-scrollbar" style={{ borderColor: 'var(--color-border)' }}>
          {/* Rôle 1 : Client */}
          <button
            onClick={() => onSelectView('client')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer whitespace-nowrap ${
              currentView === 'client'
                ? 'bg-white dark:bg-zinc-800 shadow-sm text-amber-700'
                : 'opacity-70 hover:opacity-100'
            }`}
          >
            <Smartphone className="w-3.5 h-3.5" />
            <span>Client</span>
          </button>

          {/* Rôle 2 : Restaurateur (Cuisine / Préparation) */}
          <button
            onClick={() => onSelectView('merchant')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer whitespace-nowrap ${
              currentView === 'merchant'
                ? 'bg-white dark:bg-zinc-800 shadow-sm text-amber-700'
                : 'opacity-70 hover:opacity-100'
            }`}
            title="Vue Cuisine : Préparation rapide sans accès aux chiffres de caisse ni configuration"
          >
            <ChefHat className="w-3.5 h-3.5" />
            <span>Restaurateur</span>
            {activeOrdersCount > 0 && (
              <span className="w-4 h-4 rounded-full bg-red-600 text-white text-[10px] font-black flex items-center justify-center animate-pulse">
                {activeOrdersCount}
              </span>
            )}
          </button>

          {/* Rôle 3 : Gérant (Direction & Chiffres) */}
          <button
            onClick={() => onSelectView('manager')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer whitespace-nowrap ${
              currentView === 'manager'
                ? 'bg-white dark:bg-zinc-800 shadow-sm text-amber-700'
                : 'opacity-70 hover:opacity-100'
            }`}
            title="Espace Direction : Recettes, ventes, configuration et ruptures"
          >
            <Crown className="w-3.5 h-3.5 text-amber-600" />
            <span>Gérant</span>
          </button>
        </div>

        {/* Côté Droit : Sélecteur de Thème + Bouton Config (Réservé au Gérant) */}
        <div className="flex items-center gap-2">
          <ThemeSelector />

          {currentView === 'manager' && (
            <button
              onClick={onOpenConfig}
              className="p-2 rounded-full border hover:bg-black/5 dark:hover:bg-white/5 transition-colors cursor-pointer"
              style={{
                borderColor: 'var(--color-border)',
                color: 'var(--color-text)',
              }}
              title="Ouvrir la configuration complète"
            >
              <Sliders className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>
    </header>
  );
};
