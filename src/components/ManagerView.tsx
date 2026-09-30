import React, { useState } from 'react';
import { useStore } from '../context/StoreContext';
import {
  DollarSign,
  TrendingUp,
  ShoppingBag,
  RotateCcw,
  Sliders,
  Store,
  Pause,
  Play,
  Package,
} from 'lucide-react';

interface ManagerViewProps {
  onOpenConfig: () => void;
}

export const ManagerView: React.FC<ManagerViewProps> = ({ onOpenConfig }) => {
  const { config, updateConfig, orders, products, toggleProductStock, resetDailySales } = useStore();
  const [activeTab, setActiveTab] = useState<'finance' | 'stock'>('finance');

  const completedOrders = orders.filter((o) => o.status === 'ready' || o.status === 'completed');

  // Chiffres Clés (Réservés au Gérant)
  const totalSales = completedOrders.reduce((sum, o) => sum + o.totalAmount, 0);
  const totalSandwichesSold = completedOrders.reduce((sum, o) => {
    return sum + o.items.reduce((itemSum, item) => itemSum + item.quantity, 0);
  }, 0);
  const averageTicket = completedOrders.length > 0 ? totalSales / completedOrders.length : 0;

  const handleSetRushMinutes = (min: number) => {
    updateConfig({ rushEstimatedMinutes: min });
  };

  const handleToggleRushPause = () => {
    updateConfig({ isRushPaused: !config.isRushPaused });
  };

  return (
    <div className="min-h-screen pb-24">
      {/* Top Header Gérant */}
      <div
        className="sticky top-0 z-30 p-3.5 border-b shadow-sm backdrop-blur-md"
        style={{
          backgroundColor: 'var(--color-card)',
          borderColor: 'var(--color-border)',
        }}
      >
        <div className="max-w-2xl mx-auto flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-amber-500/15 text-amber-700">
              <Store className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-black text-sm leading-tight">Espace Direction & Caisse</h2>
              <span className="text-[11px]" style={{ color: 'var(--color-text-muted)' }}>
                {config.name} • Tableau de bord Gérant
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Bouton Pause */}
            <button
              type="button"
              onClick={handleToggleRushPause}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1 cursor-pointer ${
                config.isRushPaused
                  ? 'bg-red-600 text-white'
                  : 'bg-black/5 dark:bg-white/10 hover:bg-black/10'
              }`}
            >
              {config.isRushPaused ? <Play className="w-3.5 h-3.5" /> : <Pause className="w-3.5 h-3.5" />}
              <span className="hidden sm:inline">{config.isRushPaused ? 'Reprendre' : 'Pause'}</span>
            </button>

            {/* Bouton Paramètres Complets */}
            <button
              onClick={onOpenConfig}
              className="px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 text-white shadow-sm cursor-pointer"
              style={{ backgroundColor: 'var(--color-primary)' }}
            >
              <Sliders className="w-3.5 h-3.5" />
              <span>Paramètres</span>
            </button>
          </div>
        </div>
      </div>

      <main className="max-w-2xl mx-auto px-4 py-5 space-y-5">
        {/* Navigation Onglets Gérant */}
        <div className="flex rounded-2xl bg-black/5 dark:bg-white/5 p-1 border" style={{ borderColor: 'var(--color-border)' }}>
          <button
            onClick={() => setActiveTab('finance')}
            className={`flex-1 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer ${
              activeTab === 'finance'
                ? 'bg-white dark:bg-zinc-800 shadow-sm text-amber-700'
                : 'opacity-70'
            }`}
          >
            <DollarSign className="w-3.5 h-3.5" />
            <span>Chiffre d'Affaires & Ventes</span>
          </button>

          <button
            onClick={() => setActiveTab('stock')}
            className={`flex-1 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer ${
              activeTab === 'stock'
                ? 'bg-white dark:bg-zinc-800 shadow-sm text-amber-700'
                : 'opacity-70'
            }`}
          >
            <Package className="w-3.5 h-3.5" />
            <span>Gestion des Ruptures</span>
          </button>
        </div>

        {activeTab === 'finance' ? (
          <div className="space-y-5">
            {/* Blocs Métriques Financières (Exclusif Gérant) */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              <div
                className="p-4 rounded-3xl border col-span-2 sm:col-span-1 shadow-sm"
                style={{
                  backgroundColor: 'var(--color-card)',
                  borderColor: 'var(--color-border)',
                }}
              >
                <div className="flex items-center gap-1.5 text-xs text-amber-700 font-bold mb-1">
                  <DollarSign className="w-4 h-4" />
                  <span>Total Recette</span>
                </div>
                <div className="text-3xl font-black text-amber-700">
                  {totalSales.toFixed(2)} €
                </div>
                <div className="text-[11px] mt-1" style={{ color: 'var(--color-text-muted)' }}>
                  Encaissé au comptoir
                </div>
              </div>

              <div
                className="p-4 rounded-3xl border shadow-sm"
                style={{
                  backgroundColor: 'var(--color-card)',
                  borderColor: 'var(--color-border)',
                }}
              >
                <div className="flex items-center gap-1.5 text-xs text-emerald-700 font-bold mb-1">
                  <TrendingUp className="w-4 h-4" />
                  <span>Sandwichs Vendus</span>
                </div>
                <div className="text-2xl font-black">{totalSandwichesSold}</div>
                <div className="text-[11px] mt-1" style={{ color: 'var(--color-text-muted)' }}>
                  Sur {completedOrders.length} commande(s)
                </div>
              </div>

              <div
                className="p-4 rounded-3xl border shadow-sm"
                style={{
                  backgroundColor: 'var(--color-card)',
                  borderColor: 'var(--color-border)',
                }}
              >
                <div className="flex items-center gap-1.5 text-xs text-amber-700 font-bold mb-1">
                  <ShoppingBag className="w-4 h-4" />
                  <span>Panier Moyen</span>
                </div>
                <div className="text-2xl font-black">
                  {averageTicket.toFixed(2)} €
                </div>
                <div className="text-[11px] mt-1" style={{ color: 'var(--color-text-muted)' }}>
                  Par client servi
                </div>
              </div>
            </div>

            {/* Réglage du temps d'attente estimé affiché aux clients */}
            <div className="p-4 rounded-3xl border space-y-2.5" style={{ backgroundColor: 'var(--color-card)', borderColor: 'var(--color-border)' }}>
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-xs font-bold uppercase tracking-wider">Temps d'attente affiché aux clients</div>
                  <div className="text-[11px]" style={{ color: 'var(--color-text-muted)' }}>
                    Actuellement : ~{config.rushEstimatedMinutes} min
                  </div>
                </div>
                <div className="flex gap-1.5">
                  {[5, 10, 15, 20].map((m) => (
                    <button
                      key={m}
                      onClick={() => handleSetRushMinutes(m)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-black transition-all cursor-pointer ${
                        config.rushEstimatedMinutes === m
                          ? 'bg-amber-600 text-white shadow-xs'
                          : 'bg-black/5 dark:bg-white/10 hover:bg-black/10'
                      }`}
                      style={{ backgroundColor: config.rushEstimatedMinutes === m ? 'var(--color-primary)' : '' }}
                    >
                      {m}m
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Détail du Journal de Caisse */}
            <div className="space-y-3">
              <div className="flex items-center justify-between px-1">
                <span className="text-xs font-bold uppercase tracking-wider" style={{ color: 'var(--color-text-muted)' }}>
                  Journal des Commandes ({completedOrders.length})
                </span>
                {completedOrders.length > 0 && (
                  <button
                    onClick={() => {
                      if (confirm('Voulez-vous clôturer le service et remettre les totaux à zéro pour le prochain rush ?')) {
                        resetDailySales();
                      }
                    }}
                    className="text-xs text-red-600 font-bold hover:underline flex items-center gap-1 cursor-pointer"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    <span>Clôturer le service</span>
                  </button>
                )}
              </div>

              {completedOrders.length === 0 ? (
                <div className="text-center py-12 border rounded-3xl border-dashed text-xs" style={{ borderColor: 'var(--color-border)', color: 'var(--color-text-muted)' }}>
                  Aucune vente enregistrée pour ce service.
                </div>
              ) : (
                <div className="divide-y rounded-2xl border overflow-hidden" style={{ borderColor: 'var(--color-border)', backgroundColor: 'var(--color-card)' }}>
                  {completedOrders.map((ord) => (
                    <div key={ord.id} className="p-3.5 flex items-center justify-between text-xs">
                      <div>
                        <div className="flex items-center gap-2 font-bold">
                          <span className="text-amber-700">{ord.orderNumber}</span>
                          <span>{ord.clientName}</span>
                        </div>
                        <div className="text-[11px] mt-0.5" style={{ color: 'var(--color-text-muted)' }}>
                          {ord.items.map((i) => `${i.quantity}x ${i.productName}`).join(' + ')}
                        </div>
                      </div>
                      <div className="text-right">
                        <span className="font-black text-sm text-amber-800">{ord.totalAmount.toFixed(2)} €</span>
                        <div className="text-[10px] text-emerald-700 font-bold">Comptoir</div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        ) : (
          /* Onglet Gestion Rapide des Ruptures */
          <div className="space-y-3">
            <div className="text-xs p-3 rounded-2xl bg-amber-500/10 text-amber-900 dark:text-amber-300 border border-amber-500/20">
              Basculez un produit en <strong>"Épuisé"</strong> en 1 clic pour qu'il ne puisse plus être commandé par les clients.
            </div>

            <div className="divide-y rounded-2xl border overflow-hidden p-2" style={{ borderColor: 'var(--color-border)', backgroundColor: 'var(--color-card)' }}>
              {products.map((p) => (
                <div key={p.id} className="py-2.5 px-2 flex items-center justify-between">
                  <div>
                    <span className="font-bold text-xs">{p.name}</span>
                    <div className="text-[10px] capitalize" style={{ color: 'var(--color-text-muted)' }}>
                      {p.category} • {p.priceSingle.toFixed(2)} €
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => toggleProductStock(p.id)}
                    className={`px-3 py-1 rounded-xl text-xs font-black transition-all cursor-pointer ${
                      p.inStock
                        ? 'bg-emerald-500/15 text-emerald-800 border border-emerald-500/30'
                        : 'bg-red-500/15 text-red-800 border border-red-500/30'
                    }`}
                  >
                    {p.inStock ? '✓ En Stock' : '✕ Épuisé'}
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
      </main>
    </div>
  );
};
