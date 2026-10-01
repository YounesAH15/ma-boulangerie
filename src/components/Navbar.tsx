import React from 'react';
import { useStore } from '../context/StoreContext';
import { ThemeSelector } from './ThemeSelector';
import { Smartphone, ChefHat, Sliders, Crown, Lock, ArrowLeft } from 'lucide-react';

export type AppViewMode = 'client' | 'merchant' | 'manager';

interface NavbarProps {
  currentView: AppViewMode;
  isManager: boolean;
  onSelectView: (view: AppViewMode) => void;
  onOpenConfig: () => void;
  onExitManager: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentView,
  isManager,
  onSelectView,
  onOpenConfig,
  onExitManager,
}) => {
  const { config, orders } = useStore();
  const activeOrdersCount = orders.filter((o) => o.status === 'in_progress').length;

  return (
    <>
      {/* Bandeau d'information quand le Gérant est en mode Aperçu (Client ou Cuisine) */}
      {isManager && currentView !== 'manager' && (
        <div className="bg-amber-600 text-white px-4 py-1.5 text-xs font-bold flex items-center justify-between shadow-sm z-50 sticky top-0">
          <div className="flex items-center gap-1.5">
            <Crown className="w-3.5 h-3.5 text-amber-200" />
            <span>
              Session Gérant : Aperçu {currentView === 'client' ? 'Client' : 'Cuisine'} actif
            </span>
          </div>
          <button
            type="button"
            onClick={() => onSelectView('manager')}
            className="px-2.5 py-0.5 rounded-lg bg-black/20 hover:bg-black/30 text-white font-extrabold flex items-center gap-1 cursor-pointer transition-all"
          >
            <ArrowLeft className="w-3 h-3" />
            <span>Revenir à l'Espace Gérant</span>
          </button>
        </div>
      )}

      <header
        className="border-b sticky top-0 z-40 backdrop-blur-md transition-colors"
        style={{
          backgroundColor: 'rgba(var(--color-card), 0.95)',
          borderColor: 'var(--color-border)',
        }}
      >
        <div className="max-w-4xl mx-auto px-4 py-2.5 flex items-center justify-between gap-2">
          {/* CÔTÉ GAUCHE : Dépend strictement du rôle */}
          {isManager ? (
            /* SEUL LE GÉRANT POSSÈDE LE SÉLECTEUR DE VUES */
            <div className="flex items-center gap-1.5">
              <div
                className="flex items-center rounded-2xl bg-black/5 dark:bg-white/5 p-1 border overflow-x-auto no-scrollbar"
                style={{ borderColor: 'var(--color-border)' }}
              >
                {/* Rôle 1 : Client */}
                <button
                  onClick={() => onSelectView('client')}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer whitespace-nowrap ${
                    currentView === 'client'
                      ? 'bg-white dark:bg-zinc-800 shadow-sm text-amber-700'
                      : 'opacity-70 hover:opacity-100'
                  }`}
                  title="Aperçu de la vue Client"
                >
                  <Smartphone className="w-3.5 h-3.5" />
                  <span>Client</span>
                </button>

                {/* Rôle 2 : Restaurateur (Cuisine) */}
                <button
                  onClick={() => onSelectView('merchant')}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer whitespace-nowrap ${
                    currentView === 'merchant'
                      ? 'bg-white dark:bg-zinc-800 shadow-sm text-amber-700'
                      : 'opacity-70 hover:opacity-100'
                  }`}
                  title="Aperçu de la vue Cuisine"
                >
                  <ChefHat className="w-3.5 h-3.5" />
                  <span>Restaurateur</span>
                  {activeOrdersCount > 0 && (
                    <span className="w-4 h-4 rounded-full bg-red-600 text-white text-[10px] font-black flex items-center justify-center animate-pulse">
                      {activeOrdersCount}
                    </span>
                  )}
                </button>

                {/* Rôle 3 : Gérant */}
                <button
                  onClick={() => onSelectView('manager')}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer whitespace-nowrap ${
                    currentView === 'manager'
                      ? 'bg-white dark:bg-zinc-800 shadow-sm text-amber-700'
                      : 'opacity-70 hover:opacity-100'
                  }`}
                  title="Espace Gérant (Direction, Caisse & Recettes)"
                >
                  <Crown className="w-3.5 h-3.5 text-amber-600" />
                  <span>Gérant</span>
                </button>
              </div>

              {/* Bouton Verrouillage pour quitter la session Gérant */}
              <button
                type="button"
                onClick={onExitManager}
                className="p-2 rounded-xl border hover:bg-red-50 dark:hover:bg-red-950/30 text-zinc-500 hover:text-red-600 transition-colors cursor-pointer"
                style={{ borderColor: 'var(--color-border)' }}
                title="Verrouiller et quitter la session Gérant"
              >
                <Lock className="w-3.5 h-3.5" />
              </button>
            </div>
          ) : currentView === 'client' ? (
            /* VUE CLIENT UNIQUE : AUCUN SÉLECTEUR DE VUES */
            <div className="flex items-center gap-2">
              <span className="text-2xl leading-none">🥖</span>
              <div>
                <h1 className="font-black text-sm tracking-tight leading-none text-amber-950 dark:text-amber-100">
                  {config.name}
                </h1>
                <span className="text-[10px] font-bold text-amber-700 dark:text-amber-400">
                  Boulangerie Artisanale • Commande Express
                </span>
              </div>
            </div>
          ) : (
            /* VUE RESTAURATEUR (CUISINE) UNIQUE : AUCUN SÉLECTEUR DE VUES */
            <div className="flex items-center gap-2">
              <div className="p-1.5 rounded-xl bg-amber-500/15 text-amber-700">
                <ChefHat className="w-5 h-5" />
              </div>
              <div>
                <h1 className="font-black text-sm tracking-tight leading-none">
                  Cuisine & Préparation
                </h1>
                <span className="text-[10px] text-zinc-500 font-medium">
                  {config.name}
                </span>
              </div>
              {activeOrdersCount > 0 && (
                <span className="ml-1.5 px-2 py-0.5 rounded-full bg-red-600 text-white text-[10px] font-black animate-pulse">
                  {activeOrdersCount} en cours
                </span>
              )}
            </div>
          )}

          {/* CÔTÉ DROIT : Thème + Bouton Paramètres (Réservé au Gérant) */}
          <div className="flex items-center gap-2">
            <ThemeSelector />

            {isManager && currentView === 'manager' && (
              <button
                onClick={onOpenConfig}
                className="p-2 rounded-xl border hover:bg-black/5 dark:hover:bg-white/5 transition-colors cursor-pointer"
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
    </>
  );
};
