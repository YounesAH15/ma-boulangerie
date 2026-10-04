import React, { useState } from 'react';
import { useStore } from '../context/StoreContext';
import type { ThemeType } from '../types';
import {
  X,
  Sliders,
  Check,
  Trash2,
  Plus,
  MapPin,
  ShieldCheck,
  Tag,
  Key,
  RotateCcw,
  Sparkles,
  ShoppingBag,
  Clock,
  Layers,
  CheckCircle2,
} from 'lucide-react';

interface AdminConfigModalProps {
  onClose: () => void;
}

type ConfigTab = 'products' | 'categories' | 'customization' | 'geo' | 'rush' | 'store';

export const AdminConfigModal: React.FC<AdminConfigModalProps> = ({ onClose }) => {
  const {
    config,
    updateConfig,
    products,
    toggleProductStock,
    addProduct,
    deleteProduct,
    addCategory,
    deleteCategory,
    addCrudite,
    deleteCrudite,
    toggleCruditeDefault,
    addSauce,
    deleteSauce,
    addSupplement,
    deleteSupplement,
    resetDailySales,
    activeTheme,
    setTheme,
  } = useStore();

  const [activeTab, setActiveTab] = useState<ConfigTab>('products');

  // Formulaire Produit Express
  const [newProdName, setNewProdName] = useState('');
  const [newProdCategory, setNewProdCategory] = useState(config.categories?.[0]?.id || 'froids');
  const [newProdDesc, setNewProdDesc] = useState('');
  const [newProdPriceSingle, setNewProdPriceSingle] = useState('6.50');
  const [newProdPriceDrink, setNewProdPriceDrink] = useState('7.50');
  const [newProdPriceFull, setNewProdPriceFull] = useState('8.50');
  const [newProdPriceMaxi, setNewProdPriceMaxi] = useState('');
  const [newProdPopular, setNewProdPopular] = useState(false);
  const [showProductSuccess, setShowProductSuccess] = useState(false);

  // Formulaire Catégorie
  const [newCatName, setNewCatName] = useState('');
  const [newCatIcon, setNewCatIcon] = useState('🥪');

  // Formulaires Personnalisation
  const [newCruditeName, setNewCruditeName] = useState('');
  const [newCruditeDefault, setNewCruditeDefault] = useState(true);
  const [newSauceName, setNewSauceName] = useState('');
  const [newSupName, setNewSupName] = useState('');
  const [newSupPrice, setNewSupPrice] = useState('0.80');

  // Feedback notifications
  const [savedFeedback, setSavedFeedback] = useState<string | null>(null);

  const showSavedMessage = (msg: string) => {
    setSavedFeedback(msg);
    setTimeout(() => setSavedFeedback(null), 2500);
  };

  const handleAddProductSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newProdName.trim()) return;

    const single = parseFloat(newProdPriceSingle.replace(',', '.')) || 0;
    const drink = newProdPriceDrink ? parseFloat(newProdPriceDrink.replace(',', '.')) : undefined;
    const full = newProdPriceFull ? parseFloat(newProdPriceFull.replace(',', '.')) : undefined;
    const maxi = newProdPriceMaxi ? parseFloat(newProdPriceMaxi.replace(',', '.')) : undefined;

    addProduct({
      name: newProdName.trim(),
      category: newProdCategory,
      description: newProdDesc.trim() || 'Préparé sur place chaque matin.',
      priceSingle: single,
      priceDrink: drink,
      priceFull: full,
      priceMaxi: maxi,
      inStock: true,
      isPopular: newProdPopular,
    });

    setNewProdName('');
    setNewProdDesc('');
    setShowProductSuccess(true);
    setTimeout(() => setShowProductSuccess(false), 3000);
  };

  const handleAddCategorySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCatName.trim()) return;
    addCategory(newCatName.trim(), newCatIcon.trim() || '🏷️');
    setNewCatName('');
    showSavedMessage('Catégorie ajoutée au menu !');
  };

  const handleAddCruditeSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCruditeName.trim()) return;
    addCrudite(newCruditeName.trim(), newCruditeDefault);
    setNewCruditeName('');
    showSavedMessage('Crudité ajoutée !');
  };

  const handleAddSauceSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSauceName.trim()) return;
    addSauce(newSauceName.trim());
    setNewSauceName('');
    showSavedMessage('Sauce ajoutée !');
  };

  const handleAddSupplementSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSupName.trim()) return;
    const price = parseFloat(newSupPrice.replace(',', '.')) || 0.5;
    addSupplement(newSupName.trim(), price);
    setNewSupName('');
    showSavedMessage('Supplément ajouté !');
  };

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
      desc: 'Ardoise sombre & bois ambré. Ambiance coffee-shop moderne.',
      colors: ['#1E232A', '#8D5B4C', '#E5A93C'],
    },
    {
      id: 'nature',
      name: '🥗 Fresh & Nature',
      desc: 'Vert végétal & lin clair. Accentue la fraîcheur des crudités.',
      colors: ['#2D6A4F', '#F8FAF7', '#E76F51'],
    },
    {
      id: 'express',
      name: '⚡ Street Food Express',
      desc: 'Rouge gourmand & jaune moutarde. Idéal pour service ultra-rapide.',
      colors: ['#D90429', '#FAFAFA', '#FFB703'],
    },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/60 backdrop-blur-xs">
      <div
        className="w-full max-w-3xl rounded-3xl max-h-[94vh] flex flex-col shadow-2xl border overflow-hidden"
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
              <h2 className="font-bold text-base">Panneau de Configuration Général</h2>
              <p className="text-xs" style={{ color: 'var(--color-text-muted)' }}>
                Personnalisation totale des produits, catégories, ingrédients, géolocalisation et PIN
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

        {/* Message de confirmation discret */}
        {savedFeedback && (
          <div className="bg-emerald-600 text-white text-xs px-4 py-2 font-bold flex items-center gap-2 animate-in fade-in">
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            <span>{savedFeedback}</span>
          </div>
        )}

        {/* Onglets de navigation */}
        <div className="px-4 pt-3 pb-2 border-b flex gap-1.5 overflow-x-auto no-scrollbar" style={{ borderColor: 'var(--color-border)' }}>
          <button
            type="button"
            onClick={() => setActiveTab('products')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'products'
                ? 'bg-amber-600 text-white shadow-sm'
                : 'hover:bg-black/5 dark:hover:bg-white/5'
            }`}
            style={{
              backgroundColor: activeTab === 'products' ? 'var(--color-primary)' : 'transparent',
              color: activeTab === 'products' ? '#ffffff' : 'var(--color-text)',
            }}
          >
            <ShoppingBag className="w-3.5 h-3.5" />
            <span>Produits & Menus</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('categories')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'categories'
                ? 'bg-amber-600 text-white shadow-sm'
                : 'hover:bg-black/5 dark:hover:bg-white/5'
            }`}
            style={{
              backgroundColor: activeTab === 'categories' ? 'var(--color-primary)' : 'transparent',
              color: activeTab === 'categories' ? '#ffffff' : 'var(--color-text)',
            }}
          >
            <Tag className="w-3.5 h-3.5" />
            <span>Catégories</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('customization')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'customization'
                ? 'bg-amber-600 text-white shadow-sm'
                : 'hover:bg-black/5 dark:hover:bg-white/5'
            }`}
            style={{
              backgroundColor: activeTab === 'customization' ? 'var(--color-primary)' : 'transparent',
              color: activeTab === 'customization' ? '#ffffff' : 'var(--color-text)',
            }}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>Crudités & Sauces</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('geo')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'geo'
                ? 'bg-amber-600 text-white shadow-sm'
                : 'hover:bg-black/5 dark:hover:bg-white/5'
            }`}
            style={{
              backgroundColor: activeTab === 'geo' ? 'var(--color-primary)' : 'transparent',
              color: activeTab === 'geo' ? '#ffffff' : 'var(--color-text)',
            }}
          >
            <MapPin className="w-3.5 h-3.5" />
            <span>Géoloc 15 min</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('rush')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'rush'
                ? 'bg-amber-600 text-white shadow-sm'
                : 'hover:bg-black/5 dark:hover:bg-white/5'
            }`}
            style={{
              backgroundColor: activeTab === 'rush' ? 'var(--color-primary)' : 'transparent',
              color: activeTab === 'rush' ? '#ffffff' : 'var(--color-text)',
            }}
          >
            <Clock className="w-3.5 h-3.5" />
            <span>Rush & Délais</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('store')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'store'
                ? 'bg-amber-600 text-white shadow-sm'
                : 'hover:bg-black/5 dark:hover:bg-white/5'
            }`}
            style={{
              backgroundColor: activeTab === 'store' ? 'var(--color-primary)' : 'transparent',
              color: activeTab === 'store' ? '#ffffff' : 'var(--color-text)',
            }}
          >
            <Key className="w-3.5 h-3.5" />
            <span>Boutique & PIN</span>
          </button>
        </div>

        {/* Contenu Défilant */}
        <div className="p-4 overflow-y-auto space-y-5">
          {/* TAB 1 : PRODUITS & MENUS (AJOUT RAPIDE EN 15s + GESTION DU CATALOGUE) */}
          {activeTab === 'products' && (
            <div className="space-y-5">
              {/* Formulaire Express Ajout Produit */}
              <div className="p-4 rounded-3xl border shadow-xs" style={{ borderColor: 'var(--color-border)', backgroundColor: 'var(--color-bg)' }}>
                <div className="flex items-center gap-2 mb-3">
                  <Sparkles className="w-4 h-4 text-amber-600" />
                  <h3 className="font-bold text-sm">Ajout Express d'un Produit ou Menu (Mise en vente en 15 sec)</h3>
                </div>

                {showProductSuccess && (
                  <div className="p-3 mb-3 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-800 dark:text-emerald-300 text-xs font-bold flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Produit ajouté avec succès et immédiatement disponible à la vente !</span>
                  </div>
                )}

                <form onSubmit={handleAddProductSubmit} className="space-y-3">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="text-[11px] font-bold block mb-1">Nom du produit / sandwich *</label>
                      <input
                        type="text"
                        required
                        placeholder="Ex: Baguette Poulet Curry, Wrap Nordique..."
                        value={newProdName}
                        onChange={(e) => setNewProdName(e.target.value)}
                        className="w-full px-3 py-2 rounded-xl border text-xs font-medium"
                        style={{ borderColor: 'var(--color-border)', backgroundColor: 'var(--color-card)' }}
                      />
                    </div>

                    <div>
                      <label className="text-[11px] font-bold block mb-1">Rayon / Catégorie *</label>
                      <select
                        value={newProdCategory}
                        onChange={(e) => setNewProdCategory(e.target.value)}
                        className="w-full px-3 py-2 rounded-xl border text-xs font-medium cursor-pointer"
                        style={{ borderColor: 'var(--color-border)', backgroundColor: 'var(--color-card)' }}
                      >
                        {(config.categories || []).map((cat) => (
                          <option key={cat.id} value={cat.id}>
                            {cat.icon || '🏷️'} {cat.name}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="text-[11px] font-bold block mb-1">Description courte (Ingrédients)</label>
                    <input
                      type="text"
                      placeholder="Ex: Émincé de poulet rôti mariné, sauce curry maison, salade croquante..."
                      value={newProdDesc}
                      onChange={(e) => setNewProdDesc(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl border text-xs font-medium"
                      style={{ borderColor: 'var(--color-border)', backgroundColor: 'var(--color-card)' }}
                    />
                  </div>

                  {/* Grille Tarifs */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                    <div>
                      <label className="text-[10px] font-bold block mb-1">Prix Seul (€) *</label>
                      <input
                        type="text"
                        required
                        placeholder="6.50"
                        value={newProdPriceSingle}
                        onChange={(e) => setNewProdPriceSingle(e.target.value)}
                        className="w-full px-2.5 py-1.5 rounded-xl border text-xs font-bold"
                        style={{ borderColor: 'var(--color-border)', backgroundColor: 'var(--color-card)' }}
                      />
                    </div>

                    <div>
                      <label className="text-[10px] font-bold block mb-1">Formule Boisson (€)</label>
                      <input
                        type="text"
                        placeholder="7.50"
                        value={newProdPriceDrink}
                        onChange={(e) => setNewProdPriceDrink(e.target.value)}
                        className="w-full px-2.5 py-1.5 rounded-xl border text-xs font-bold"
                        style={{ borderColor: 'var(--color-border)', backgroundColor: 'var(--color-card)' }}
                      />
                    </div>

                    <div>
                      <label className="text-[10px] font-bold block mb-1">Formule Complète (€)</label>
                      <input
                        type="text"
                        placeholder="8.50"
                        value={newProdPriceFull}
                        onChange={(e) => setNewProdPriceFull(e.target.value)}
                        className="w-full px-2.5 py-1.5 rounded-xl border text-xs font-bold"
                        style={{ borderColor: 'var(--color-border)', backgroundColor: 'var(--color-card)' }}
                      />
                    </div>

                    <div>
                      <label className="text-[10px] font-bold block mb-1">Maxi Version (€)</label>
                      <input
                        type="text"
                        placeholder="9.90 (Optionnel)"
                        value={newProdPriceMaxi}
                        onChange={(e) => setNewProdPriceMaxi(e.target.value)}
                        className="w-full px-2.5 py-1.5 rounded-xl border text-xs font-bold"
                        style={{ borderColor: 'var(--color-border)', backgroundColor: 'var(--color-card)' }}
                      />
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-1">
                    <label className="flex items-center gap-2 text-xs font-bold cursor-pointer">
                      <input
                        type="checkbox"
                        checked={newProdPopular}
                        onChange={(e) => setNewProdPopular(e.target.checked)}
                        className="w-4 h-4 rounded-sm text-amber-600 focus:ring-amber-500 cursor-pointer"
                      />
                      <span>Mettre en avant ("Top Vente")</span>
                    </label>

                    <button
                      type="submit"
                      className="px-4 py-2 rounded-xl text-white font-bold text-xs flex items-center gap-1.5 shadow-sm transition-transform active:scale-95 cursor-pointer"
                      style={{ backgroundColor: 'var(--color-primary)' }}
                    >
                      <Plus className="w-4 h-4" />
                      <span>Ajouter immédiatement à la vente</span>
                    </button>
                  </div>
                </form>
              </div>

              {/* Liste des produits existants */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-bold text-xs uppercase tracking-wider" style={{ color: 'var(--color-text-muted)' }}>
                    Catalogue Actuel ({products.length} articles)
                  </h4>
                  <span className="text-[11px]" style={{ color: 'var(--color-text-muted)' }}>
                    Gérez les stocks ou supprimez des articles
                  </span>
                </div>

                <div className="divide-y rounded-2xl border overflow-hidden" style={{ borderColor: 'var(--color-border)', backgroundColor: 'var(--color-card)' }}>
                  {products.map((p) => (
                    <div key={p.id} className="p-3 flex items-center justify-between gap-3 text-xs">
                      <div>
                        <div className="font-bold flex items-center gap-2">
                          <span>{p.name}</span>
                          {p.isPopular && (
                            <span className="text-[9px] px-1.5 py-0.5 rounded-md bg-amber-500/20 text-amber-800 font-black">
                              TOP
                            </span>
                          )}
                        </div>
                        <div className="text-[11px] capitalize" style={{ color: 'var(--color-text-muted)' }}>
                          {p.category} • {p.priceSingle.toFixed(2)} €
                          {p.priceDrink && ` | Formule ${p.priceDrink.toFixed(2)} €`}
                          {p.priceFull && ` | Complète ${p.priceFull.toFixed(2)} €`}
                        </div>
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        <button
                          type="button"
                          onClick={() => toggleProductStock(p.id)}
                          className={`px-2.5 py-1 rounded-xl text-[11px] font-bold transition-all cursor-pointer ${
                            p.inStock
                              ? 'bg-emerald-500/15 text-emerald-800 border border-emerald-500/30'
                              : 'bg-red-500/15 text-red-800 border border-red-500/30'
                          }`}
                        >
                          {p.inStock ? '✓ En Stock' : '✕ Épuisé'}
                        </button>

                        <button
                          type="button"
                          onClick={() => {
                            if (confirm(`Supprimer définitivement "${p.name}" du catalogue ?`)) {
                              deleteProduct(p.id);
                              showSavedMessage('Article supprimé');
                            }
                          }}
                          className="p-1.5 rounded-lg text-red-500 hover:bg-red-500/10 cursor-pointer transition-colors"
                          title="Supprimer cet article"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* TAB 2 : GESTION DES CATÉGORIES */}
          {activeTab === 'categories' && (
            <div className="space-y-4">
              <div className="text-xs p-3 rounded-2xl bg-amber-500/10 text-amber-900 dark:text-amber-300 border border-amber-500/20">
                Créez ou personnalisez les rayons de votre boutique. Chaque catégorie apparaît sous forme d'onglet pour vos clients.
              </div>

              {/* Formulaire Ajout Catégorie */}
              <form onSubmit={handleAddCategorySubmit} className="p-3.5 rounded-2xl border flex flex-col sm:flex-row items-center gap-2" style={{ borderColor: 'var(--color-border)', backgroundColor: 'var(--color-bg)' }}>
                <div className="w-16">
                  <input
                    type="text"
                    placeholder="🥪"
                    maxLength={3}
                    value={newCatIcon}
                    onChange={(e) => setNewCatIcon(e.target.value)}
                    className="w-full text-center px-2 py-2 rounded-xl border text-sm font-bold"
                    style={{ borderColor: 'var(--color-border)', backgroundColor: 'var(--color-card)' }}
                    title="Emoji ou icône"
                  />
                </div>

                <div className="flex-1 w-full">
                  <input
                    type="text"
                    required
                    placeholder="Nom de la catégorie (ex: Paninis, Viennoiseries, Salades...)"
                    value={newCatName}
                    onChange={(e) => setNewCatName(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border text-xs font-semibold"
                    style={{ borderColor: 'var(--color-border)', backgroundColor: 'var(--color-card)' }}
                  />
                </div>

                <button
                  type="submit"
                  className="w-full sm:w-auto px-4 py-2 rounded-xl text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-sm cursor-pointer shrink-0"
                  style={{ backgroundColor: 'var(--color-primary)' }}
                >
                  <Plus className="w-4 h-4" />
                  <span>Ajouter la catégorie</span>
                </button>
              </form>

              {/* Liste des catégories existantes */}
              <div className="divide-y rounded-2xl border overflow-hidden" style={{ borderColor: 'var(--color-border)', backgroundColor: 'var(--color-card)' }}>
                {(config.categories || []).map((cat) => (
                  <div key={cat.id} className="p-3 flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2.5 font-bold">
                      <span className="text-lg">{cat.icon || '🏷️'}</span>
                      <span>{cat.name}</span>
                      <span className="text-[10px] text-zinc-400 font-mono">({cat.id})</span>
                    </div>

                    <button
                      type="button"
                      onClick={() => {
                        if (confirm(`Supprimer la catégorie "${cat.name}" ? Les produits associés ne seront pas supprimés.`)) {
                          deleteCategory(cat.id);
                          showSavedMessage('Catégorie retirée');
                        }
                      }}
                      className="p-1.5 rounded-lg text-red-500 hover:bg-red-500/10 cursor-pointer"
                      title="Supprimer la catégorie"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 3 : PERSONNALISATION (CRUDITÉS, SAUCES, SUPPLÉMENTS) */}
          {activeTab === 'customization' && (
            <div className="space-y-6">
              {/* Section Crudités */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <h4 className="font-bold text-xs uppercase tracking-wider text-amber-800 dark:text-amber-300">
                    🥗 Crudités Proposées aux Clients
                  </h4>
                  <span className="text-[11px]" style={{ color: 'var(--color-text-muted)' }}>
                    Cliquez sur "Inclus" pour basculer la présence par défaut
                  </span>
                </div>

                <form onSubmit={handleAddCruditeSubmit} className="flex gap-2">
                  <input
                    type="text"
                    required
                    placeholder="Nouvelle crudité (ex: Concombre, Maïs, Piments...)"
                    value={newCruditeName}
                    onChange={(e) => setNewCruditeName(e.target.value)}
                    className="flex-1 px-3 py-1.5 rounded-xl border text-xs"
                    style={{ borderColor: 'var(--color-border)', backgroundColor: 'var(--color-card)' }}
                  />
                  <label className="flex items-center gap-1.5 text-xs font-bold px-2.5 py-1.5 rounded-xl border cursor-pointer" style={{ borderColor: 'var(--color-border)' }}>
                    <input
                      type="checkbox"
                      checked={newCruditeDefault}
                      onChange={(e) => setNewCruditeDefault(e.target.checked)}
                      className="w-3.5 h-3.5 rounded-sm"
                    />
                    <span>Par défaut</span>
                  </label>
                  <button
                    type="submit"
                    className="px-3 py-1.5 rounded-xl text-white font-bold text-xs flex items-center gap-1 cursor-pointer shrink-0"
                    style={{ backgroundColor: 'var(--color-primary)' }}
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Ajouter</span>
                  </button>
                </form>

                <div className="flex flex-wrap gap-2 pt-1">
                  {(config.crudites || []).map((c) => (
                    <div
                      key={c.id}
                      className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl border text-xs"
                      style={{ borderColor: 'var(--color-border)', backgroundColor: 'var(--color-card)' }}
                    >
                      <button
                        type="button"
                        onClick={() => toggleCruditeDefault(c.id)}
                        className={`font-semibold cursor-pointer ${
                          c.defaultIncluded ? 'text-emerald-700 dark:text-emerald-400' : 'text-zinc-400 line-through'
                        }`}
                        title="Cliquez pour changer le statut par défaut"
                      >
                        {c.name} {c.defaultIncluded ? '(Inclus)' : '(Optionnel)'}
                      </button>
                      <button
                        type="button"
                        onClick={() => deleteCrudite(c.id)}
                        className="text-red-500 hover:text-red-700 cursor-pointer"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Section Sauces */}
              <div className="space-y-2 border-t pt-4" style={{ borderColor: 'var(--color-border)' }}>
                <h4 className="font-bold text-xs uppercase tracking-wider text-amber-800 dark:text-amber-300">
                  🥣 Sauces Disponibles
                </h4>

                <form onSubmit={handleAddSauceSubmit} className="flex gap-2">
                  <input
                    type="text"
                    required
                    placeholder="Nouvelle sauce (ex: Andalouse, Poivre, Cheesy...)"
                    value={newSauceName}
                    onChange={(e) => setNewSauceName(e.target.value)}
                    className="flex-1 px-3 py-1.5 rounded-xl border text-xs"
                    style={{ borderColor: 'var(--color-border)', backgroundColor: 'var(--color-card)' }}
                  />
                  <button
                    type="submit"
                    className="px-3 py-1.5 rounded-xl text-white font-bold text-xs flex items-center gap-1 cursor-pointer shrink-0"
                    style={{ backgroundColor: 'var(--color-primary)' }}
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Ajouter sauce</span>
                  </button>
                </form>

                <div className="flex flex-wrap gap-2 pt-1">
                  {(config.sauces || []).map((s) => (
                    <div
                      key={s.id}
                      className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl border text-xs"
                      style={{ borderColor: 'var(--color-border)', backgroundColor: 'var(--color-card)' }}
                    >
                      <span className="font-semibold">{s.name}</span>
                      <button
                        type="button"
                        onClick={() => deleteSauce(s.id)}
                        className="text-red-500 hover:text-red-700 cursor-pointer"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Section Suppléments / Extras */}
              <div className="space-y-2 border-t pt-4" style={{ borderColor: 'var(--color-border)' }}>
                <h4 className="font-bold text-xs uppercase tracking-wider text-amber-800 dark:text-amber-300">
                  ⭐ Suppléments Payants (Fromage, Double Viande...)
                </h4>

                <form onSubmit={handleAddSupplementSubmit} className="flex gap-2">
                  <input
                    type="text"
                    required
                    placeholder="Nom du supplément (ex: Cheddar fondu, Oeuf...)"
                    value={newSupName}
                    onChange={(e) => setNewSupName(e.target.value)}
                    className="flex-1 px-3 py-1.5 rounded-xl border text-xs"
                    style={{ borderColor: 'var(--color-border)', backgroundColor: 'var(--color-card)' }}
                  />
                  <input
                    type="text"
                    required
                    placeholder="Prix (€)"
                    value={newSupPrice}
                    onChange={(e) => setNewSupPrice(e.target.value)}
                    className="w-20 px-2 py-1.5 rounded-xl border text-xs text-center font-bold"
                    style={{ borderColor: 'var(--color-border)', backgroundColor: 'var(--color-card)' }}
                  />
                  <button
                    type="submit"
                    className="px-3 py-1.5 rounded-xl text-white font-bold text-xs flex items-center gap-1 cursor-pointer shrink-0"
                    style={{ backgroundColor: 'var(--color-primary)' }}
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Ajouter</span>
                  </button>
                </form>

                <div className="flex flex-wrap gap-2 pt-1">
                  {(config.supplements || []).map((sup) => (
                    <div
                      key={sup.id}
                      className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl border text-xs"
                      style={{ borderColor: 'var(--color-border)', backgroundColor: 'var(--color-card)' }}
                    >
                      <span className="font-semibold">{sup.name}</span>
                      <span className="text-amber-700 font-bold">+{sup.price.toFixed(2)} €</span>
                      <button
                        type="button"
                        onClick={() => deleteSupplement(sup.id)}
                        className="text-red-500 hover:text-red-700 cursor-pointer"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* TAB 4 : GÉOLOCALISATION & PÉRIMÈTRE 15 MIN */}
          {activeTab === 'geo' && (
            <div className="space-y-4">
              <div className="p-4 rounded-3xl border space-y-3" style={{ borderColor: 'var(--color-border)', backgroundColor: 'var(--color-bg)' }}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <MapPin className="w-5 h-5 text-amber-600" />
                    <div>
                      <h4 className="font-bold text-sm">Restriction Géographique des Commandes</h4>
                      <p className="text-[11px]" style={{ color: 'var(--color-text-muted)' }}>
                        Exige que le client soit à moins de 15 minutes pour valider sa commande
                      </p>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => {
                      updateConfig({ geoRestrictionEnabled: !config.geoRestrictionEnabled });
                      showSavedMessage(config.geoRestrictionEnabled ? 'Restriction désactivée' : 'Restriction activée');
                    }}
                    className={`px-3 py-1.5 rounded-xl text-xs font-black transition-all cursor-pointer ${
                      config.geoRestrictionEnabled
                        ? 'bg-emerald-600 text-white'
                        : 'bg-zinc-200 dark:bg-zinc-700 text-zinc-700 dark:text-zinc-300'
                    }`}
                  >
                    {config.geoRestrictionEnabled ? '✓ ACTIVÉE' : '✕ DÉSACTIVÉE'}
                  </button>
                </div>

                <div className="text-xs p-3 rounded-2xl bg-black/5 dark:bg-white/5 space-y-1">
                  <div className="font-semibold text-amber-800 dark:text-amber-300">
                    📍 Adresse officielle de référence :
                  </div>
                  <div className="font-bold">
                    {config.storeAddress}
                  </div>
                  <div className="text-[11px] text-zinc-500">
                    Coordonnées GPS : {config.storeLat.toFixed(4)}, {config.storeLng.toFixed(4)}
                  </div>
                </div>

                {/* Réglage du Rayon Max en km */}
                <div className="space-y-2 pt-2">
                  <div className="flex items-center justify-between text-xs">
                    <label className="font-bold">Rayon maximal de commande :</label>
                    <span className="font-black text-amber-700 bg-amber-500/15 px-2.5 py-0.5 rounded-lg">
                      {config.maxDistanceKm} km (~15 min en voiture)
                    </span>
                  </div>
                  <input
                    type="range"
                    min="2"
                    max="25"
                    step="1"
                    value={config.maxDistanceKm}
                    onChange={(e) => updateConfig({ maxDistanceKm: parseInt(e.target.value, 10) })}
                    className="w-full accent-amber-600 cursor-pointer"
                  />
                  <div className="flex justify-between text-[10px] text-zinc-400">
                    <span>2 km (~4 min)</span>
                    <span>8 km (~15 min - Recommandé)</span>
                    <span>25 km (~45 min)</span>
                  </div>
                </div>
              </div>

              <div className="text-xs p-3 rounded-2xl border bg-black/5 dark:bg-white/5 space-y-1" style={{ borderColor: 'var(--color-border)' }}>
                <div className="font-bold flex items-center gap-1.5 text-emerald-700">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Règle commerciale islamique & éthique :</span>
                </div>
                <p className="text-[11px]" style={{ color: 'var(--color-text-muted)' }}>
                  En limitant les commandes aux clients à proximité (15 min), vous éliminez le gaspillage alimentaire (nourriture préparée abandonnée) et vous garantissez que le client reçoit son produit parfaitement chaud et croustillant sans surprise (conformité avec l'interdiction du <em>gharar</em>).
                </p>
              </div>
            </div>
          )}

          {/* TAB 5 : RUSH & DÉLAIS */}
          {activeTab === 'rush' && (
            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-xs font-bold block" style={{ color: 'var(--color-text-muted)' }}>
                  Temps d'attente estimé au comptoir (affiché au client) :
                </label>
                <div className="flex gap-2">
                  {[5, 10, 15, 20, 30].map((min) => (
                    <button
                      key={min}
                      type="button"
                      onClick={() => {
                        updateConfig({ rushEstimatedMinutes: min });
                        showSavedMessage(`Délai réglé sur ${min} min`);
                      }}
                      className={`flex-1 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                        config.rushEstimatedMinutes === min
                          ? 'bg-amber-600 text-white shadow-sm'
                          : 'border hover:bg-black/5'
                      }`}
                      style={{
                        borderColor: 'var(--color-border)',
                        backgroundColor: config.rushEstimatedMinutes === min ? 'var(--color-primary)' : 'transparent',
                      }}
                    >
                      {min} min
                    </button>
                  ))}
                </div>
              </div>

              {/* Pause Urgence */}
              <div className="p-4 rounded-3xl border space-y-2" style={{ borderColor: 'var(--color-border)', backgroundColor: 'var(--color-bg)' }}>
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-bold text-sm">Pause d'Urgence du Service</h4>
                    <p className="text-xs" style={{ color: 'var(--color-text-muted)' }}>
                      Bloque temporairement les prises de commande si la cuisine est débordée
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => updateConfig({ isRushPaused: !config.isRushPaused })}
                    className={`px-4 py-2 rounded-xl text-xs font-black transition-all cursor-pointer ${
                      config.isRushPaused
                        ? 'bg-red-600 text-white'
                        : 'bg-emerald-600 text-white'
                    }`}
                  >
                    {config.isRushPaused ? 'EN PAUSE' : 'EN SERVICE'}
                  </button>
                </div>
              </div>

              {/* Message d'annonce */}
              <div className="space-y-1">
                <label className="text-xs font-bold block" style={{ color: 'var(--color-text-muted)' }}>
                  Message d'annonce en haut de la carte :
                </label>
                <input
                  type="text"
                  value={config.announcementText}
                  onChange={(e) => updateConfig({ announcementText: e.target.value })}
                  placeholder="Ex: Baguettes fraîches sorties du four à 11h45..."
                  className="w-full px-3 py-2 rounded-xl border text-xs"
                  style={{ borderColor: 'var(--color-border)', backgroundColor: 'var(--color-card)' }}
                />
              </div>
            </div>
          )}

          {/* TAB 6 : BOUTIQUE, SÉCURITÉ & CODE PIN */}
          {activeTab === 'store' && (
            <div className="space-y-5">
              {/* Code PIN Gérant */}
              <div className="p-4 rounded-3xl border space-y-2" style={{ borderColor: 'var(--color-border)', backgroundColor: 'var(--color-bg)' }}>
                <div className="flex items-center gap-2">
                  <Key className="w-4 h-4 text-amber-600" />
                  <h4 className="font-bold text-sm">Code PIN de Direction (Actuel : 1996)</h4>
                </div>
                <p className="text-xs" style={{ color: 'var(--color-text-muted)' }}>
                  Ce code protège l'accès à vos chiffres financiers, marges et configurations.
                </p>
                <div className="flex gap-2 pt-1 max-w-xs">
                  <input
                    type="text"
                    maxLength={8}
                    value={config.managerPin || '1996'}
                    onChange={(e) => updateConfig({ managerPin: e.target.value })}
                    className="px-3 py-2 rounded-xl border text-sm font-mono font-bold tracking-widest text-center"
                    style={{ borderColor: 'var(--color-border)', backgroundColor: 'var(--color-card)' }}
                  />
                  <button
                    type="button"
                    onClick={() => showSavedMessage('Code PIN mis à jour !')}
                    className="px-4 py-2 rounded-xl text-white font-bold text-xs cursor-pointer"
                    style={{ backgroundColor: 'var(--color-primary)' }}
                  >
                    Enregistrer
                  </button>
                </div>
              </div>

              {/* Infos Magasin */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-[11px] font-bold block mb-1">Nom de l'établissement</label>
                  <input
                    type="text"
                    value={config.name}
                    onChange={(e) => updateConfig({ name: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border text-xs font-semibold"
                    style={{ borderColor: 'var(--color-border)', backgroundColor: 'var(--color-card)' }}
                  />
                </div>

                <div>
                  <label className="text-[11px] font-bold block mb-1">Sous-titre / Spécialité</label>
                  <input
                    type="text"
                    value={config.subtitle}
                    onChange={(e) => updateConfig({ subtitle: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border text-xs"
                    style={{ borderColor: 'var(--color-border)', backgroundColor: 'var(--color-card)' }}
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="text-[11px] font-bold block mb-1">Adresse de la boulangerie</label>
                  <input
                    type="text"
                    value={config.storeAddress}
                    onChange={(e) => updateConfig({ storeAddress: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border text-xs"
                    style={{ borderColor: 'var(--color-border)', backgroundColor: 'var(--color-card)' }}
                  />
                </div>

                <div>
                  <label className="text-[11px] font-bold block mb-1">Téléphone de la boutique</label>
                  <input
                    type="text"
                    value={config.phone || '03 20 77 00 00'}
                    onChange={(e) => updateConfig({ phone: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border text-xs font-semibold"
                    style={{ borderColor: 'var(--color-border)', backgroundColor: 'var(--color-card)' }}
                  />
                </div>

                <div className="flex items-center">
                  <label className="flex items-center gap-2 text-xs font-bold cursor-pointer pt-4">
                    <input
                      type="checkbox"
                      checked={config.halalCertified}
                      onChange={(e) => updateConfig({ halalCertified: e.target.checked })}
                      className="w-4 h-4 rounded-sm text-emerald-600 focus:ring-emerald-500 cursor-pointer"
                    />
                    <span className="flex items-center gap-1">
                      <ShieldCheck className="w-4 h-4 text-emerald-600" />
                      <span>Viandes certifiées 100% Halal</span>
                    </span>
                  </label>
                </div>
              </div>

              {/* Sélection du Thème Visuel */}
              <div className="space-y-2 border-t pt-4" style={{ borderColor: 'var(--color-border)' }}>
                <h4 className="font-bold text-xs uppercase tracking-wider text-amber-800 dark:text-amber-300">
                  🎨 Ambiance Visuelle de la Boutique
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {themesList.map((t) => {
                    const isSelected = activeTheme === t.id;
                    return (
                      <button
                        key={t.id}
                        type="button"
                        onClick={() => {
                          setTheme(t.id);
                          showSavedMessage(`Thème "${t.name}" appliqué !`);
                        }}
                        className={`p-3 rounded-2xl border text-left transition-all cursor-pointer ${
                          isSelected ? 'ring-2 ring-amber-600 shadow-sm' : 'hover:bg-black/5'
                        }`}
                        style={{ borderColor: 'var(--color-border)', backgroundColor: 'var(--color-card)' }}
                      >
                        <div className="flex items-center justify-between mb-1">
                          <span className="font-bold text-xs">{t.name}</span>
                          {isSelected && <Check className="w-4 h-4 text-amber-600" />}
                        </div>
                        <p className="text-[10px]" style={{ color: 'var(--color-text-muted)' }}>
                          {t.desc}
                        </p>
                        <div className="flex gap-1.5 mt-2">
                          {t.colors.map((c, i) => (
                            <span key={i} className="w-4 h-4 rounded-full border border-black/10" style={{ backgroundColor: c }} />
                          ))}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Clôture de Caisse */}
              <div className="p-4 rounded-3xl border border-red-500/20 bg-red-500/5 space-y-2">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-bold text-xs text-red-700">Clôture du Service / Remise à zéro</h4>
                    <p className="text-[11px] text-red-600/80">
                      Efface l'historique des commandes du jour pour préparer le service suivant.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      if (confirm('Voulez-vous clôturer la caisse et réinitialiser toutes les ventes du jour ?')) {
                        resetDailySales();
                        showSavedMessage('Caisse réinitialisée');
                      }
                    }}
                    className="px-3 py-1.5 rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold text-xs flex items-center gap-1 cursor-pointer shrink-0"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    <span>Clôturer</span>
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
