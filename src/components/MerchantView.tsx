import React, { useState } from 'react';
import { useStore } from '../context/StoreContext';
import {
  Clock,
  CheckCircle2,
  AlertCircle,
  Pause,
  Play,
  ChefHat,
  History,
} from 'lucide-react';

export const MerchantView: React.FC = () => {
  const { config, updateConfig, orders, updateOrderStatus } = useStore();
  const [activeTab, setActiveTab] = useState<'active' | 'history'>('active');

  const activeOrders = orders.filter((o) => o.status === 'in_progress');
  const completedOrders = orders.filter((o) => o.status === 'ready' || o.status === 'completed');

  const handleSetRushMinutes = (min: number) => {
    updateConfig({ rushEstimatedMinutes: min });
  };

  const handleToggleRushPause = () => {
    updateConfig({ isRushPaused: !config.isRushPaused });
  };

  return (
    <div className="min-h-screen pb-24">
      {/* Barre Rush Contrôle Cuisine (Sticky) */}
      <div
        className="sticky top-0 z-30 p-3 border-b shadow-sm backdrop-blur-md"
        style={{
          backgroundColor: 'var(--color-card)',
          borderColor: 'var(--color-border)',
        }}
      >
        <div className="max-w-xl mx-auto flex items-center justify-between gap-2">
          {/* Pause d'urgence */}
          <button
            type="button"
            onClick={handleToggleRushPause}
            className={`px-3 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
              config.isRushPaused
                ? 'bg-amber-500 text-amber-950 ring-2 ring-amber-600 animate-pulse'
                : 'bg-black/5 dark:bg-white/10 hover:bg-black/10'
            }`}
          >
            {config.isRushPaused ? <Play className="w-4 h-4" /> : <Pause className="w-4 h-4" />}
            <span>{config.isRushPaused ? 'Reprendre' : 'Pause Rush'}</span>
          </button>

          {/* Sélecteur de temps d'attente */}
          <div className="flex items-center gap-1 bg-black/5 dark:bg-white/5 p-1 rounded-xl">
            <span className="text-[10px] uppercase font-bold px-1.5" style={{ color: 'var(--color-text-muted)' }}>
              Attente :
            </span>
            {[5, 10, 15, 20].map((mins) => (
              <button
                key={mins}
                onClick={() => handleSetRushMinutes(mins)}
                className={`px-2 py-1 rounded-lg text-xs font-black transition-all cursor-pointer ${
                  config.rushEstimatedMinutes === mins
                    ? 'bg-amber-600 text-white shadow-xs'
                    : 'hover:bg-black/10'
                }`}
                style={{
                  backgroundColor: config.rushEstimatedMinutes === mins ? 'var(--color-primary)' : 'transparent',
                }}
              >
                {mins}m
              </button>
            ))}
          </div>

          <div className="flex items-center gap-1 text-xs font-semibold px-2 py-1 rounded-lg bg-amber-500/10 text-amber-800">
            <ChefHat className="w-4 h-4" />
            <span className="hidden sm:inline">Cuisine</span>
          </div>
        </div>
      </div>

      {/* Navigation Onglets : À préparer vs Historique récent */}
      <div className="max-w-xl mx-auto px-4 pt-4">
        <div className="flex rounded-2xl bg-black/5 dark:bg-white/5 p-1 border" style={{ borderColor: 'var(--color-border)' }}>
          <button
            onClick={() => setActiveTab('active')}
            className={`flex-1 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer ${
              activeTab === 'active'
                ? 'bg-white dark:bg-zinc-800 shadow-sm text-amber-700'
                : 'opacity-70'
            }`}
          >
            <ChefHat className="w-3.5 h-3.5" />
            <span>À préparer</span>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-amber-500/20 text-amber-800">
              {activeOrders.length}
            </span>
          </button>

          <button
            onClick={() => setActiveTab('history')}
            className={`flex-1 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer ${
              activeTab === 'history'
                ? 'bg-white dark:bg-zinc-800 shadow-sm text-emerald-700'
                : 'opacity-70'
            }`}
          >
            <History className="w-3.5 h-3.5" />
            <span>Historique du service</span>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-emerald-500/20 text-emerald-800">
              {completedOrders.length}
            </span>
          </button>
        </div>
      </div>

      {/* Contenu principal */}
      <main className="max-w-xl mx-auto px-4 py-4 space-y-4">
        {activeTab === 'active' ? (
          <>
            {activeOrders.length === 0 ? (
              <div className="text-center py-16 px-4 border rounded-3xl border-dashed" style={{ borderColor: 'var(--color-border)' }}>
                <div className="text-4xl mb-2">👨‍🍳</div>
                <h3 className="font-bold text-base">Aucune commande en attente</h3>
                <p className="text-xs mt-1" style={{ color: 'var(--color-text-muted)' }}>
                  Dès qu'un client passe commande, sa fiche apparaît ici instantanément.
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {activeOrders.map((order) => {
                  const elapsedMins = Math.floor((Date.now() - order.createdAt) / 60000);

                  return (
                    <div
                      key={order.id}
                      className="p-4 rounded-3xl border shadow-md flex flex-col justify-between transition-all"
                      style={{
                        backgroundColor: 'var(--color-card)',
                        borderColor: 'var(--color-border)',
                      }}
                    >
                      {/* Top Header Commande */}
                      <div className="flex items-start justify-between pb-3 border-b" style={{ borderColor: 'var(--color-border)' }}>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="text-2xl font-black text-amber-700">
                              {order.orderNumber}
                            </span>
                            <span className="font-bold text-base capitalize">
                              {order.clientName}
                            </span>
                          </div>
                          <div className="flex items-center gap-1.5 text-xs text-amber-800 font-medium mt-0.5">
                            <Clock className="w-3.5 h-3.5" />
                            <span>Reçue il y a {elapsedMins} min</span>
                          </div>
                        </div>

                        {/* Badge de paiement au comptoir */}
                        <div className="text-right">
                          <span className="inline-block px-2.5 py-1 rounded-xl text-xs font-black bg-amber-100 text-amber-900 border border-amber-300">
                            💶 À encaisser
                          </span>
                          <div className="font-bold text-sm mt-0.5 text-amber-800">
                            {order.totalAmount.toFixed(2)} €
                          </div>
                        </div>
                      </div>

                      {/* Liste détaillée des articles de la commande */}
                      <div className="py-3 space-y-3">
                        {order.items.map((item, idx) => (
                          <div
                            key={idx}
                            className="p-3 rounded-2xl bg-black/5 dark:bg-white/5 border text-xs space-y-1.5"
                            style={{ borderColor: 'var(--color-border)' }}
                          >
                            <div className="flex items-center justify-between font-bold text-sm">
                              <span>
                                {item.quantity}x {item.productName}
                              </span>
                              {item.formulaType !== 'single' && (
                                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-800">
                                  {item.formulaType === 'drink' ? 'Formule Boisson' : item.formulaType === 'full' ? 'Formule Complète' : 'Maxi'}
                                </span>
                              )}
                            </div>

                            {/* Sauces */}
                            {item.selectedSauces.length > 0 && (
                              <div className="font-semibold text-amber-900 dark:text-amber-300">
                                🥣 Sauces : <strong>{item.selectedSauces.join(' + ')}</strong>
                              </div>
                            )}

                            {/* Crudités : Alerte visible si exclusions ! */}
                            {item.excludedCrudites.length > 0 ? (
                              <div className="px-2 py-1 rounded-lg bg-red-500/10 text-red-700 font-bold flex items-center gap-1">
                                <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                                <span>⚠️ SANS : {item.excludedCrudites.join(', ')}</span>
                              </div>
                            ) : (
                              <div className="text-[11px] text-emerald-700 font-medium">
                                ✓ Toutes crudités incluses
                              </div>
                            )}

                            {/* Boisson & Pâtisserie si formule */}
                            {item.selectedDrink && (
                              <div className="font-medium text-[11px]">
                                🥤 Boisson : <strong>{item.selectedDrink}</strong>
                              </div>
                            )}
                            {item.selectedPastry && (
                              <div className="font-medium text-[11px]">
                                🍰 Pâtisserie : <strong>{item.selectedPastry}</strong>
                              </div>
                            )}

                            {/* Extras */}
                            {item.selectedSupplements.length > 0 && (
                              <div className="font-medium text-[11px] text-amber-800">
                                ⭐ Extras : {item.selectedSupplements.map((s) => s.name).join(', ')}
                              </div>
                            )}
                          </div>
                        ))}
                      </div>

                      {/* Bouton d'action 1-Tap : PRÊTE ! */}
                      <div className="pt-2">
                        <button
                          type="button"
                          onClick={() => updateOrderStatus(order.id, 'ready')}
                          className="w-full py-4 rounded-2xl text-white font-black text-sm flex items-center justify-center gap-2 shadow-lg transition-transform active:scale-98 cursor-pointer"
                          style={{ backgroundColor: 'var(--color-accent, #22c55e)' }}
                        >
                          <CheckCircle2 className="w-5 h-5" />
                          <span>✅ PRÊTE ! (Alerter le client)</span>
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </>
        ) : (
          /* Onglet Historique Simple pour le restaurateur (sans stats financières) */
          <div className="space-y-3">
            <div className="text-xs font-bold uppercase tracking-wider px-1" style={{ color: 'var(--color-text-muted)' }}>
              Commandes traitées aujourd'hui ({completedOrders.length})
            </div>

            {completedOrders.length === 0 ? (
              <div className="text-center py-10 text-xs" style={{ color: 'var(--color-text-muted)' }}>
                Aucune commande servie pour l'instant.
              </div>
            ) : (
              completedOrders.map((ord) => (
                <div
                  key={ord.id}
                  className="p-3.5 rounded-2xl border text-xs flex items-center justify-between"
                  style={{ borderColor: 'var(--color-border)', backgroundColor: 'var(--color-card)' }}
                >
                  <div>
                    <div className="flex items-center gap-2 font-bold text-sm">
                      <span className="text-amber-700">{ord.orderNumber}</span>
                      <span>•</span>
                      <span>{ord.clientName}</span>
                    </div>
                    <div className="text-[11px] mt-1" style={{ color: 'var(--color-text-muted)' }}>
                      {ord.items.map((i) => `${i.quantity}x ${i.productName}`).join(', ')}
                    </div>
                  </div>
                  <span className="px-2.5 py-1 rounded-xl text-xs font-bold bg-emerald-500/15 text-emerald-800">
                    ✓ Prête
                  </span>
                </div>
              ))
            )}
          </div>
        )}
      </main>
    </div>
  );
};
