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
  QrCode,
  Copy,
  Check,
  ExternalLink,
  Printer,
  Zap,
} from 'lucide-react';

interface ManagerViewProps {
  onOpenConfig: () => void;
}

export const ManagerView: React.FC<ManagerViewProps> = ({ onOpenConfig }) => {
  const {
    config,
    updateConfig,
    orders,
    products,
    toggleProductStock,
    resetDailySales,
    simulateRushOrders,
  } = useStore();
  const [activeTab, setActiveTab] = useState<'finance' | 'stock' | 'links'>('finance');
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

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

  const baseUrl = typeof window !== 'undefined' ? window.location.origin + window.location.pathname : 'https://younesah15.github.io/ma-boulangerie/';
  const cleanBase = baseUrl.endsWith('/') ? baseUrl : baseUrl + '/';
  const clientUrl = `${cleanBase}?view=client`;
  const merchantUrl = `${cleanBase}?view=cuisine`;
  const managerUrl = `${cleanBase}?view=gerant`;

  const handleCopy = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
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
        <div className="flex rounded-2xl bg-black/5 dark:bg-white/5 p-1 border overflow-x-auto no-scrollbar" style={{ borderColor: 'var(--color-border)' }}>
          <button
            onClick={() => setActiveTab('finance')}
            className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer whitespace-nowrap px-2 ${
              activeTab === 'finance'
                ? 'bg-white dark:bg-zinc-800 shadow-sm text-amber-700'
                : 'opacity-70'
            }`}
          >
            <DollarSign className="w-3.5 h-3.5" />
            <span>Recettes</span>
          </button>

          <button
            onClick={() => setActiveTab('stock')}
            className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer whitespace-nowrap px-2 ${
              activeTab === 'stock'
                ? 'bg-white dark:bg-zinc-800 shadow-sm text-amber-700'
                : 'opacity-70'
            }`}
          >
            <Package className="w-3.5 h-3.5" />
            <span>Ruptures</span>
          </button>

          <button
            onClick={() => setActiveTab('links')}
            className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer whitespace-nowrap px-2 ${
              activeTab === 'links'
                ? 'bg-white dark:bg-zinc-800 shadow-sm text-amber-700'
                : 'opacity-70'
            }`}
          >
            <QrCode className="w-3.5 h-3.5 text-amber-600" />
            <span>Liens & QR Code</span>
          </button>
        </div>

        {activeTab === 'finance' && (
          <div className="space-y-5">
            {/* Outil de Simulation de Rush (Pour tester sur PC ou devant le gérant) */}
            <div
              className="p-4 rounded-3xl border shadow-sm space-y-2.5"
              style={{
                backgroundColor: 'rgba(var(--color-primary-rgb, 200, 109, 59), 0.06)',
                borderColor: 'var(--color-primary)',
              }}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="p-1.5 rounded-xl bg-amber-600 text-white">
                    <Zap className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-xs font-black uppercase tracking-wider text-amber-900 dark:text-amber-200">
                      Simulateur de Rush Déjeuner (Test PC & Démo)
                    </h4>
                    <p className="text-[11px]" style={{ color: 'var(--color-text-muted)' }}>
                      Injecte 12 commandes réalistes (Tenders, Poulet Croque, Kefta, Thon...) pour tester le flux en direct.
                    </p>
                  </div>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-2 pt-1">
                <button
                  type="button"
                  onClick={simulateRushOrders}
                  className="px-3.5 py-2 rounded-xl text-xs font-black text-white shadow-sm flex items-center gap-1.5 cursor-pointer hover:opacity-95 transition-all"
                  style={{ backgroundColor: 'var(--color-primary)' }}
                >
                  <Zap className="w-3.5 h-3.5" />
                  <span>⚡ Lancer un Rush (12 Commandes)</span>
                </button>

                {orders.length > 0 && (
                  <button
                    type="button"
                    onClick={resetDailySales}
                    className="px-3 py-2 rounded-xl text-xs font-bold border hover:bg-red-50 text-red-700 dark:hover:bg-red-950/20 cursor-pointer flex items-center gap-1 transition-all"
                    style={{ borderColor: 'var(--color-border)' }}
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    <span>Réinitialiser</span>
                  </button>
                )}
              </div>
            </div>

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
        )}

        {/* Onglet Gestion Rapide des Ruptures */}
        {activeTab === 'stock' && (
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

        {/* Onglet Liens Directs & QR Code */}
        {activeTab === 'links' && (
          <div className="space-y-5">
            {/* Bannière Nom de Domaine Cible Commercial */}
            <div className="p-4 rounded-3xl bg-linear-to-r from-amber-700 to-amber-900 text-white shadow-md relative overflow-hidden">
              <div className="relative z-10">
                <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full bg-white/20 text-amber-100 inline-block mb-1">
                  Nom de Domaine Proposé au Client
                </span>
                <h3 className="text-xl font-black tracking-tight">amidupain.fr</h3>
                <p className="text-xs text-amber-100/90 mt-1 max-w-md">
                  Une adresse courte, évidente et mémorisable pour les clients de la boulangerie. Simple à retenir, sans aucun sous-domaine technique.
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 mt-3 text-xs font-mono">
                  <div className="bg-black/25 px-2.5 py-1.5 rounded-xl border border-white/10">
                    <span className="text-[10px] block opacity-75 font-sans font-bold">Client :</span>
                    amidupain.fr
                  </div>
                  <div className="bg-black/25 px-2.5 py-1.5 rounded-xl border border-white/10">
                    <span className="text-[10px] block opacity-75 font-sans font-bold">Cuisine :</span>
                    amidupain.fr/cuisine
                  </div>
                  <div className="bg-black/25 px-2.5 py-1.5 rounded-xl border border-white/10">
                    <span className="text-[10px] block opacity-75 font-sans font-bold">Gérant :</span>
                    amidupain.fr/gerant
                  </div>
                </div>
              </div>
            </div>

            {/* Carte QR Code Client amidupain.fr */}
            <div
              className="p-5 rounded-3xl border text-center shadow-sm"
              style={{
                backgroundColor: 'var(--color-card)',
                borderColor: 'var(--color-border)',
              }}
            >
              <div className="inline-block p-1 rounded-2xl bg-amber-500/15 text-amber-700 mb-2">
                <QrCode className="w-5 h-5 m-1.5" />
              </div>
              <h3 className="font-black text-sm text-amber-900 dark:text-amber-200">
                QR Code Vitrine Officiel (amidupain.fr)
              </h3>
              <p className="text-xs mt-1 max-w-sm mx-auto" style={{ color: 'var(--color-text-muted)' }}>
                Ce QR Code est intégré sur l'affiche A4 de vitrine. Il redirige instantanément vers <strong>amidupain.fr</strong> sans aucun intermédiaire.
              </p>

              <div className="my-4 inline-block p-3 bg-white rounded-2xl border shadow-sm">
                <img
                  src="./qr_amidupain.svg"
                  alt="QR Code amidupain.fr"
                  className="w-44 h-44 object-contain"
                />
              </div>

              <div className="text-xs font-mono break-all px-3 py-2 rounded-xl bg-black/5 dark:bg-white/5 border border-dashed text-amber-800 dark:text-amber-300 font-bold">
                https://amidupain.fr
              </div>
            </div>

            {/* Liste des 3 URLs de Test Actuelles (GitHub Pages) */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-black uppercase tracking-wider text-amber-800 dark:text-amber-300">
                  Accès de Test Immédiats (Sur vos smartphones aujourd'hui)
                </h4>
              </div>

              {/* Rôle 1: Client */}
              <div
                className="p-3.5 rounded-2xl border space-y-2"
                style={{ backgroundColor: 'var(--color-card)', borderColor: 'var(--color-border)' }}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 inline-block"></span>
                    <strong className="text-xs">1. Vue Client (Commande Express)</strong>
                  </div>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-800">
                    Accessible au public
                  </span>
                </div>
                <div className="text-[11px]" style={{ color: 'var(--color-text-muted)' }}>
                  Interface simplifiée en 3 clics, paiement exclusif au comptoir.
                </div>
                <div className="flex items-center gap-2 pt-1">
                  <button
                    type="button"
                    onClick={() => handleCopy(clientUrl, 'client')}
                    className="flex-1 py-1.5 px-3 rounded-xl border text-xs font-bold flex items-center justify-center gap-1.5 cursor-pointer hover:bg-black/5"
                  >
                    {copiedKey === 'client' ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copiedKey === 'client' ? 'URL Copiée !' : 'Copier le lien Client'}</span>
                  </button>
                  <a
                    href={clientUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="p-1.5 rounded-xl border hover:bg-black/5 cursor-pointer text-amber-700"
                    title="Ouvrir dans un nouvel onglet"
                  >
                    <ExternalLink className="w-4 h-4" />
                  </a>
                </div>
              </div>

              {/* Rôle 2: Restaurateur / Cuisine */}
              <div
                className="p-3.5 rounded-2xl border space-y-2"
                style={{ backgroundColor: 'var(--color-card)', borderColor: 'var(--color-border)' }}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-amber-500 inline-block"></span>
                    <strong className="text-xs">2. Vue Restaurateur (Cuisine / Préparation)</strong>
                  </div>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-800">
                    Personnel cuisine
                  </span>
                </div>
                <div className="text-[11px]" style={{ color: 'var(--color-text-muted)' }}>
                  Affichage des tickets en direct à 1 main, 1 clic "PRÊTE !", recettes masquées.
                </div>
                <div className="flex items-center gap-2 pt-1">
                  <button
                    type="button"
                    onClick={() => handleCopy(merchantUrl, 'merchant')}
                    className="flex-1 py-1.5 px-3 rounded-xl border text-xs font-bold flex items-center justify-center gap-1.5 cursor-pointer hover:bg-black/5"
                  >
                    {copiedKey === 'merchant' ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copiedKey === 'merchant' ? 'URL Copiée !' : 'Copier le lien Cuisine'}</span>
                  </button>
                  <a
                    href={merchantUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="p-1.5 rounded-xl border hover:bg-black/5 cursor-pointer text-amber-700"
                    title="Ouvrir dans un nouvel onglet"
                  >
                    <ExternalLink className="w-4 h-4" />
                  </a>
                </div>
              </div>

              {/* Rôle 3: Gérant */}
              <div
                className="p-3.5 rounded-2xl border space-y-2"
                style={{ backgroundColor: 'var(--color-card)', borderColor: 'var(--color-border)' }}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-purple-500 inline-block"></span>
                    <strong className="text-xs">3. Vue Gérant (Direction, Caisse & Paramètres)</strong>
                  </div>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-purple-500/10 text-purple-800">
                    Patron / Gérant
                  </span>
                </div>
                <div className="text-[11px]" style={{ color: 'var(--color-text-muted)' }}>
                  Total recette, nombre de sandwichs vendus, temps d'attente rush et ruptures.
                </div>
                <div className="flex items-center gap-2 pt-1">
                  <button
                    type="button"
                    onClick={() => handleCopy(managerUrl, 'manager')}
                    className="flex-1 py-1.5 px-3 rounded-xl border text-xs font-bold flex items-center justify-center gap-1.5 cursor-pointer hover:bg-black/5"
                  >
                    {copiedKey === 'manager' ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copiedKey === 'manager' ? 'URL Copiée !' : 'Copier le lien Gérant'}</span>
                  </button>
                  <a
                    href={managerUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="p-1.5 rounded-xl border hover:bg-black/5 cursor-pointer text-amber-700"
                    title="Ouvrir dans un nouvel onglet"
                  >
                    <ExternalLink className="w-4 h-4" />
                  </a>
                </div>
              </div>
            </div>

            {/* Documents Imprimables */}
            <div
              className="p-4 rounded-3xl border space-y-3"
              style={{ backgroundColor: 'var(--color-card)', borderColor: 'var(--color-border)' }}
            >
              <div className="flex items-center gap-2 text-xs font-black text-amber-800 dark:text-amber-300">
                <Printer className="w-4 h-4" />
                <span>Documents Prêts à Imprimer (Format A4)</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                <a
                  href="./affiche_a4_vitrine_qr_code.html"
                  target="_blank"
                  rel="noreferrer"
                  className="p-3 rounded-2xl border text-xs font-bold flex items-center justify-between hover:bg-black/5 text-amber-800 dark:text-amber-200"
                >
                  <span>🖼️ Affiche Vitrine A4 (QR Code)</span>
                  <ExternalLink className="w-3.5 h-3.5 opacity-60" />
                </a>

                <a
                  href="./tutoriel_imprimable_gerant_et_client.html"
                  target="_blank"
                  rel="noreferrer"
                  className="p-3 rounded-2xl border text-xs font-bold flex items-center justify-between hover:bg-black/5 text-amber-800 dark:text-amber-200"
                >
                  <span>📋 Tutoriel 3 Fiches (A4)</span>
                  <ExternalLink className="w-3.5 h-3.5 opacity-60" />
                </a>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};
