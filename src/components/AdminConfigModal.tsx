import React, { useState } from 'react';
import { useStore } from '../context/StoreContext';
import type { ThemeType } from '../types';
import {
  X,
  Sliders,
  RotateCcw,
  Check,
} from 'lucide-react';

interface AdminConfigModalProps {
  onClose: () => void;
}

export const AdminConfigModal: React.FC<AdminConfigModalProps> = ({ onClose }) => {
  const { config, updateConfig, products, toggleProductStock, resetDailySales, activeTheme, setTheme } = useStore();
  const [activeTab, setActiveTab] = useState<'stock' | 'rush' | 'theme' | 'shop'>('stock');

  const themesList: { id: ThemeType; name: string; desc: string; colors: string[] }[] = [
    {
      id: 'artisan',
      name: '🥖 Artisan & Gourmand',
      desc: 'Pain doré, crème farine & sauge. Idéal pour l’authenticité boulangère.',
      colors: ['#C86D3B', '#FDFBF7', '#5B8266'],
    },
    {
      id: 'bistro',
      name: '☕ Bistro Chic & Urbain',
      desc: 'Ardoise sombre & bois ambré. Ambiance coffee-shop moderne et fort contraste.',
      colors: ['#1E232A', '#8D5B4C', '#E5A93C'],
    },
    {
      id: 'nature',
      name: '🥗 Fresh & Nature',
      desc: 'Vert végétal & lin clair. Accentue la fraîcheur des crudités et le fait-maison.',
      colors: ['#2D6A4F', '#F8FAF7', '#E76F51'],
    },
    {
      id: 'express',
      name: '⚡ Street Food Express',
      desc: 'Rouge gourmand & jaune moutarde. Idéal pour une sandwicherie rapide et percutante.',
      colors: ['#D90429', '#FAFAFA', '#FFB703'],
    },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-xs">
      <div
        className="w-full max-w-2xl rounded-3xl max-h-[92vh] flex flex-col shadow-2xl border overflow-hidden"
        style={{
          backgroundColor: 'var(--color-card)',
          borderColor: 'var(--color-border)',
          color: 'var(--color-text)',
        }}
      >
        {/* Header Modal */}
        <div className="p-4 border-b flex items-center justify-between sticky top-0 z-10" style={{ borderColor: 'var(--color-border)', backgroundColor: 'var(--color-card)' }}>
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-amber-500/15 text-amber-700">
              <Sliders className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-bold text-base">Configuration Gérant</h2>
              <p className="text-xs" style={{ color: 'var(--color-text-muted)' }}>
                Gestion simple des ruptures, temps d'attente, thèmes et boutique
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-full hover:bg-black/5 dark:hover:bg-white/10 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Onglets de navigation */}
        <div className="px-4 pt-3 pb-2 border-b flex gap-1.5 overflow-x-auto no-scrollbar" style={{ borderColor: 'var(--color-border)' }}>
          <button
            onClick={() => setActiveTab('stock')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
              activeTab === 'stock'
                ? 'bg-amber-600 text-white'
                : 'hover:bg-black/5 dark:hover:bg-white/5'
            }`}
            style={{
              backgroundColor: activeTab === 'stock' ? 'var(--color-primary)' : 'transparent',
              color: activeTab === 'stock' ? '#ffffff' : 'var(--color-text)',
            }}
          >
            🔴 Ruptures de Stock
          </button>

          <button
            onClick={() => setActiveTab('rush')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
              activeTab === 'rush'
                ? 'bg-amber-600 text-white'
                : 'hover:bg-black/5 dark:hover:bg-white/5'
            }`}
            style={{
              backgroundColor: activeTab === 'rush' ? 'var(--color-primary)' : 'transparent',
              color: activeTab === 'rush' ? '#ffffff' : 'var(--color-text)',
            }}
          >
            ⏱️ Paramètres Rush
          </button>

          <button
            onClick={() => setActiveTab('theme')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
              activeTab === 'theme'
                ? 'bg-amber-600 text-white'
                : 'hover:bg-black/5 dark:hover:bg-white/5'
            }`}
            style={{
              backgroundColor: activeTab === 'theme' ? 'var(--color-primary)' : 'transparent',
              color: activeTab === 'theme' ? '#ffffff' : 'var(--color-text)',
            }}
          >
            🎨 Thème Visuel
          </button>

          <button
            onClick={() => setActiveTab('shop')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
              activeTab === 'shop'
                ? 'bg-amber-600 text-white'
                : 'hover:bg-black/5 dark:hover:bg-white/5'
            }`}
            style={{
              backgroundColor: activeTab === 'shop' ? 'var(--color-primary)' : 'transparent',
              color: activeTab === 'shop' ? '#ffffff' : 'var(--color-text)',
            }}
          >
            🏪 Infos Boutique
          </button>
        </div>

        {/* Contenu Défilant */}
        <div className="p-4 overflow-y-auto space-y-4">
          {/* TAB 1 : RUPTURES DE STOCK */}
          {activeTab === 'stock' && (
            <div className="space-y-3">
              <div className="text-xs p-3 rounded-2xl bg-amber-500/10 text-amber-900 dark:text-amber-300 border border-amber-500/20">
                💡 <strong>Astuce néophyte :</strong> Si vous n'avez plus de baguette, de poulet ou de pâtisserie en cours de service, cliquez sur le bouton pour le marquer <strong>"Épuisé"</strong>. Les clients ne pourront plus le commander.
              </div>

              <div className="divide-y" style={{ borderColor: 'var(--color-border)' }}>
                {products.map((product) => (
                  <div key={product.id} className="py-2.5 flex items-center justify-between gap-2">
                    <div>
                      <div className="font-bold text-sm leading-tight">{product.name}</div>
                      <div className="text-[11px] capitalize" style={{ color: 'var(--color-text-muted)' }}>
                        {product.category} • {product.priceSingle.toFixed(2)} €
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => toggleProductStock(product.id)}
                      className={`px-3.5 py-1.5 rounded-xl text-xs font-black transition-all cursor-pointer ${
                        product.inStock
                          ? 'bg-emerald-500/15 text-emerald-800 border border-emerald-500/30'
                          : 'bg-red-500/15 text-red-800 border border-red-500/30'
                      }`}
                    >
                      {product.inStock ? '✓ En Stock' : '✕ Épuisé'}
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 2 : PARAMÈTRES RUSH */}
          {activeTab === 'rush' && (
            <div className="space-y-4">
              <div>
                <label className="text-xs font-bold uppercase tracking-wider block mb-2" style={{ color: 'var(--color-text-muted)' }}>
                  Temps d'attente estimé pour les clients (en minutes)
                </label>
                <div className="grid grid-cols-4 gap-2">
                  {[5, 10, 15, 20].map((mins) => (
                    <button
                      key={mins}
                      onClick={() => updateConfig({ rushEstimatedMinutes: mins })}
                      className={`py-3 rounded-2xl border text-center font-black text-sm transition-all cursor-pointer ${
                        config.rushEstimatedMinutes === mins
                          ? 'border-amber-600 bg-amber-500/15 text-amber-700 ring-2 ring-amber-500'
                          : 'hover:border-black/20'
                      }`}
                    >
                      ~{mins} min
                    </button>
                  ))}
                </div>
              </div>

              <div className="p-4 rounded-2xl border space-y-2" style={{ borderColor: 'var(--color-border)' }}>
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-bold text-sm">Pause d'urgence des commandes</div>
                    <div className="text-xs" style={{ color: 'var(--color-text-muted)' }}>
                      Bloque temporairement les nouveaux paniers si la cuisine est débordée
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => updateConfig({ isRushPaused: !config.isRushPaused })}
                    className={`px-4 py-2 rounded-xl text-xs font-black transition-all cursor-pointer ${
                      config.isRushPaused
                        ? 'bg-red-600 text-white'
                        : 'bg-black/10 dark:bg-white/10 text-emerald-700'
                    }`}
                  >
                    {config.isRushPaused ? '⏸️ Rush en Pause' : '▶️ Rush Actif'}
                  </button>
                </div>
              </div>

              <div>
                <label className="text-xs font-bold uppercase tracking-wider block mb-1.5" style={{ color: 'var(--color-text-muted)' }}>
                  Message d'annonce en haut de l'écran client
                </label>
                <input
                  type="text"
                  value={config.announcementText}
                  onChange={(e) => updateConfig({ announcementText: e.target.value })}
                  placeholder="Ex: Formule midi avec boisson et dessert maison !"
                  className="w-full px-3.5 py-2.5 rounded-xl border text-xs focus:ring-2 focus:ring-amber-500"
                  style={{
                    borderColor: 'var(--color-border)',
                    backgroundColor: 'var(--color-bg)',
                    color: 'var(--color-text)',
                  }}
                />
              </div>

              <div className="p-4 rounded-2xl bg-black/5 dark:bg-white/5 space-y-2">
                <div className="font-bold text-xs uppercase tracking-wider">Clôture du Service</div>
                <p className="text-xs" style={{ color: 'var(--color-text-muted)' }}>
                  Réinitialisez la file des commandes pour démarrer le prochain rush (soir ou lendemain).
                </p>
                <button
                  type="button"
                  onClick={() => {
                    if (confirm('Voulez-vous réinitialiser le compteur de commandes pour le prochain service ?')) {
                      resetDailySales();
                      alert('Service clôturé et réinitialisé avec succès.');
                    }
                  }}
                  className="px-4 py-2 rounded-xl bg-red-600 text-white text-xs font-bold flex items-center gap-1.5 cursor-pointer"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Réinitialiser pour le prochain service</span>
                </button>
              </div>
            </div>
          )}

          {/* TAB 3 : THÈME VISUEL */}
          {activeTab === 'theme' && (
            <div className="space-y-3">
              <div className="text-xs font-medium" style={{ color: 'var(--color-text-muted)' }}>
                Choisissez l'univers graphique que vous souhaitez présenter au gérant :
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {themesList.map((th) => {
                  const isSelected = activeTheme === th.id;
                  return (
                    <button
                      key={th.id}
                      onClick={() => setTheme(th.id)}
                      className={`p-4 rounded-2xl border text-left transition-all flex flex-col justify-between cursor-pointer ${
                        isSelected
                          ? 'border-amber-600 bg-amber-500/10 ring-2 ring-amber-500'
                          : 'hover:border-black/20'
                      }`}
                      style={{ borderColor: isSelected ? 'var(--color-primary)' : 'var(--color-border)' }}
                    >
                      <div>
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-sm">{th.name}</span>
                          {isSelected && <Check className="w-4 h-4 text-emerald-600" />}
                        </div>
                        <p className="text-xs mt-1 leading-snug" style={{ color: 'var(--color-text-muted)' }}>
                          {th.desc}
                        </p>
                      </div>
                      <div className="flex gap-1.5 mt-3">
                        {th.colors.map((c, i) => (
                          <span
                            key={i}
                            className="w-4 h-4 rounded-full border border-black/10 shadow-xs"
                            style={{ backgroundColor: c }}
                          />
                        ))}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* TAB 4 : INFOS BOUTIQUE & PAIEMENTS */}
          {activeTab === 'shop' && (
            <div className="space-y-4">
              <div>
                <label className="text-xs font-bold uppercase tracking-wider block mb-1" style={{ color: 'var(--color-text-muted)' }}>
                  Nom de l'établissement
                </label>
                <input
                  type="text"
                  value={config.name}
                  onChange={(e) => updateConfig({ name: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border text-sm font-bold focus:ring-2 focus:ring-amber-500"
                  style={{
                    borderColor: 'var(--color-border)',
                    backgroundColor: 'var(--color-bg)',
                    color: 'var(--color-text)',
                  }}
                />
              </div>

              <div>
                <label className="text-xs font-bold uppercase tracking-wider block mb-1" style={{ color: 'var(--color-text-muted)' }}>
                  Sous-titre / Spécialité
                </label>
                <input
                  type="text"
                  value={config.subtitle}
                  onChange={(e) => updateConfig({ subtitle: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border text-xs focus:ring-2 focus:ring-amber-500"
                  style={{
                    borderColor: 'var(--color-border)',
                    backgroundColor: 'var(--color-bg)',
                    color: 'var(--color-text)',
                  }}
                />
              </div>

              <div>
                <label className="text-xs font-bold uppercase tracking-wider block mb-1" style={{ color: 'var(--color-text-muted)' }}>
                  Code PIN de Sécurité Gérant (4 à 6 chiffres)
                </label>
                <input
                  type="text"
                  maxLength={6}
                  value={config.managerPin || '1234'}
                  onChange={(e) => updateConfig({ managerPin: e.target.value.replace(/\D/g, '') })}
                  className="w-full px-3.5 py-2.5 rounded-xl border text-sm font-mono tracking-widest font-bold focus:ring-2 focus:ring-amber-500"
                  style={{
                    borderColor: 'var(--color-border)',
                    backgroundColor: 'var(--color-bg)',
                    color: 'var(--color-text)',
                  }}
                />
                <span className="text-[10px] text-zinc-500 mt-1 block">
                  Ce code protège l'accès à la caisse, aux recettes et au changement de rôle.
                </span>
              </div>

              <div className="p-3 rounded-2xl border flex items-center justify-between" style={{ borderColor: 'var(--color-border)' }}>
                <div>
                  <div className="font-bold text-xs">Certification Viandes Halal</div>
                  <div className="text-[11px]" style={{ color: 'var(--color-text-muted)' }}>
                    Affiche le badge de confiance sur le menu
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => updateConfig({ halalCertified: !config.halalCertified })}
                  className={`px-3 py-1 rounded-xl text-xs font-bold cursor-pointer ${
                    config.halalCertified ? 'bg-emerald-600 text-white' : 'bg-black/10'
                  }`}
                >
                  {config.halalCertified ? 'Activé' : 'Désactivé'}
                </button>
              </div>

              <div className="p-3 rounded-2xl border space-y-1 bg-black/5 dark:bg-white/5" style={{ borderColor: 'var(--color-border)' }}>
                <div className="font-bold text-xs">Paiement 100% au comptoir au retrait</div>
                <div className="text-[11px]" style={{ color: 'var(--color-text-muted)' }}>
                  Les clients règlent directement à la caisse de votre boulangerie (espèces ou CB) lors de la remise de leur sachet. Zéro intermédiaire, zéro commission prélevée sur vos ventes.
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-3 border-t text-right" style={{ borderColor: 'var(--color-border)', backgroundColor: 'var(--color-card)' }}>
          <button
            onClick={onClose}
            className="px-5 py-2.5 rounded-xl text-white font-bold text-xs shadow-md cursor-pointer"
            style={{ backgroundColor: 'var(--color-primary)' }}
          >
            Enregistrer & Fermer
          </button>
        </div>
      </div>
    </div>
  );
};
