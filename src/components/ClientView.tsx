import React, { useState, useEffect } from 'react';
import { useStore } from '../context/StoreContext';
import type { Product, OrderItem, CategoryType } from '../types';
import { SandwichModal } from './SandwichModal';
import {
  ShoppingBag,
  Clock,
  CheckCircle2,
  AlertCircle,
  Plus,
  Trash2,
  ArrowRight,
  Flame,
  Sparkles,
  ShieldCheck,
  RotateCcw,
} from 'lucide-react';
import confetti from 'canvas-confetti';

export const ClientView: React.FC = () => {
  const {
    config,
    products,
    cart,
    addToCart,
    removeFromCart,
    createOrder,
    currentClientOrder,
    setCurrentClientOrder,
  } = useStore();

  const [activeCategory, setActiveCategory] = useState<CategoryType>('formules');
  const [selectedProductForModal, setSelectedProductForModal] = useState<Product | null>(null);
  const [modalInitialFormula, setModalInitialFormula] = useState<'single' | 'drink' | 'full' | 'maxi'>('single');
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [clientName, setClientName] = useState('');

  // Haptic feedback & celebration trigger when order turns ready
  useEffect(() => {
    if (currentClientOrder?.status === 'ready') {
      // Micro vibration discrète d'une demi-seconde
      if ('vibrate' in navigator) {
        try {
          navigator.vibrate(250);
        } catch {
          // ignore
        }
      }
      // Confetti doux
      try {
        confetti({
          particleCount: 40,
          spread: 60,
          origin: { y: 0.6 },
          colors: ['#22c55e', '#C86D3B', '#FFB703'],
        });
      } catch {
        // ignore
      }
    }
  }, [currentClientOrder?.status]);

  const cartTotal = cart.reduce((sum, item) => sum + item.unitPrice * item.quantity, 0);
  const cartItemsCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  const handleOpenProduct = (product: Product, formula: 'single' | 'drink' | 'full' | 'maxi' = 'single') => {
    if (!product.inStock || config.isRushPaused) return;

    if (product.category === 'froids' || product.category === 'chauds') {
      setSelectedProductForModal(product);
      setModalInitialFormula(formula);
    } else {
      // Direct add for drinks / desserts
      const item: OrderItem = {
        id: `item_${Date.now()}_${Math.random().toString(36).substring(2, 5)}`,
        productId: product.id,
        productName: product.name,
        formulaType: 'single',
        selectedSauces: [],
        excludedCrudites: [],
        selectedSupplements: [],
        unitPrice: product.priceSingle,
        quantity: 1,
      };
      addToCart(item);
    }
  };

  const handleCheckout = (e: React.FormEvent) => {
    e.preventDefault();
    if (cart.length === 0) return;
    if (!clientName.trim()) {
      alert('Veuillez renseigner votre prénom pour appeler votre commande au comptoir.');
      return;
    }
    createOrder(clientName.trim(), cart);
    setIsCartOpen(false);
  };

  // Filtrage selon catégorie
  const getFilteredProducts = () => {
    if (activeCategory === 'formules') {
      // Affiche les sandwichs stars avec l'accent sur la formule
      return products.filter((p) => p.category === 'froids' || p.category === 'chauds');
    }
    return products.filter((p) => p.category === activeCategory);
  };

  return (
    <div className="min-h-screen pb-28">
      {/* Bannière Pause Urgence */}
      {config.isRushPaused && (
        <div className="bg-amber-500 text-amber-950 px-4 py-3 text-center text-sm font-bold flex items-center justify-center gap-2 shadow-md">
          <AlertCircle className="w-5 h-5 shrink-0" />
          <span>
            Prise de commande momentanément suspendue pour fluidifier le rush. Réouverture imminente !
          </span>
        </div>
      )}

      {/* Header Boutique */}
      <header
        className="px-4 pt-6 pb-4 border-b"
        style={{
          backgroundColor: 'var(--color-card)',
          borderColor: 'var(--color-border)',
        }}
      >
        <div className="max-w-2xl mx-auto">
          <div className="flex items-start justify-between">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-2xl">🥖</span>
                <h1 className="text-2xl font-black tracking-tight" style={{ color: 'var(--color-text)' }}>
                  {config.name}
                </h1>
              </div>
              <p className="text-xs mt-0.5" style={{ color: 'var(--color-text-muted)' }}>
                {config.subtitle}
              </p>
            </div>

            {config.halalCertified && (
              <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-500/10 text-emerald-800 dark:text-emerald-300 border border-emerald-500/20 shrink-0">
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>Viandes 100% Halal</span>
              </div>
            )}
          </div>

          {/* Rush status pill */}
          <div className="mt-3 flex items-center justify-between text-xs py-2 px-3 rounded-2xl bg-black/5 dark:bg-white/5 border" style={{ borderColor: 'var(--color-border)' }}>
            <div className="flex items-center gap-1.5 font-medium">
              <Clock className="w-4 h-4 text-amber-600" />
              <span>Attente estimée au comptoir :</span>
              <strong className="text-amber-700 font-bold">~{config.rushEstimatedMinutes} min</strong>
            </div>
            <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-700">
              Service du midi actif
            </span>
          </div>

          {/* Announcement text */}
          {config.announcementText && (
            <div className="mt-2 text-xs italic px-1" style={{ color: 'var(--color-text-muted)' }}>
              {config.announcementText}
            </div>
          )}
        </div>
      </header>

      {/* Navigation Onglets Menu */}
      <div
        className="sticky top-0 z-20 px-4 py-2.5 border-b backdrop-blur-md"
        style={{
          backgroundColor: 'rgba(var(--color-card), 0.9)',
          borderColor: 'var(--color-border)',
        }}
      >
        <div className="max-w-2xl mx-auto flex gap-2 overflow-x-auto no-scrollbar py-0.5">
          <button
            onClick={() => setActiveCategory('formules')}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all flex items-center gap-1.5 cursor-pointer ${
              activeCategory === 'formules'
                ? 'bg-amber-600 text-white shadow-sm'
                : 'hover:bg-black/5 dark:hover:bg-white/5'
            }`}
            style={{
              backgroundColor: activeCategory === 'formules' ? 'var(--color-primary)' : 'transparent',
              color: activeCategory === 'formules' ? '#ffffff' : 'var(--color-text)',
            }}
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Formules du Midi</span>
          </button>

          <button
            onClick={() => setActiveCategory('chauds')}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all flex items-center gap-1.5 cursor-pointer ${
              activeCategory === 'chauds'
                ? 'bg-amber-600 text-white shadow-sm'
                : 'hover:bg-black/5 dark:hover:bg-white/5'
            }`}
            style={{
              backgroundColor: activeCategory === 'chauds' ? 'var(--color-primary)' : 'transparent',
              color: activeCategory === 'chauds' ? '#ffffff' : 'var(--color-text)',
            }}
          >
            <Flame className="w-3.5 h-3.5" />
            <span>Sandwichs Chauds</span>
          </button>

          <button
            onClick={() => setActiveCategory('froids')}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
              activeCategory === 'froids'
                ? 'bg-amber-600 text-white shadow-sm'
                : 'hover:bg-black/5 dark:hover:bg-white/5'
            }`}
            style={{
              backgroundColor: activeCategory === 'froids' ? 'var(--color-primary)' : 'transparent',
              color: activeCategory === 'froids' ? '#ffffff' : 'var(--color-text)',
            }}
          >
            Sandwichs Froids
          </button>

          <button
            onClick={() => setActiveCategory('boissons')}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
              activeCategory === 'boissons'
                ? 'bg-amber-600 text-white shadow-sm'
                : 'hover:bg-black/5 dark:hover:bg-white/5'
            }`}
            style={{
              backgroundColor: activeCategory === 'boissons' ? 'var(--color-primary)' : 'transparent',
              color: activeCategory === 'boissons' ? '#ffffff' : 'var(--color-text)',
            }}
          >
            Boissons
          </button>

          <button
            onClick={() => setActiveCategory('desserts')}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
              activeCategory === 'desserts'
                ? 'bg-amber-600 text-white shadow-sm'
                : 'hover:bg-black/5 dark:hover:bg-white/5'
            }`}
            style={{
              backgroundColor: activeCategory === 'desserts' ? 'var(--color-primary)' : 'transparent',
              color: activeCategory === 'desserts' ? '#ffffff' : 'var(--color-text)',
            }}
          >
            Pâtisseries
          </button>

          <button
            onClick={() => setActiveCategory('snacks')}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
              activeCategory === 'snacks'
                ? 'bg-amber-600 text-white shadow-sm'
                : 'hover:bg-black/5 dark:hover:bg-white/5'
            }`}
            style={{
              backgroundColor: activeCategory === 'snacks' ? 'var(--color-primary)' : 'transparent',
              color: activeCategory === 'snacks' ? '#ffffff' : 'var(--color-text)',
            }}
          >
            Snacks & Wings
          </button>
        </div>
      </div>

      {/* Liste des Produits */}
      <main className="max-w-2xl mx-auto px-4 py-5 space-y-4">
        {/* En-tête de section */}
        <div className="flex items-center justify-between">
          <h2 className="text-base font-bold capitalize" style={{ color: 'var(--color-text)' }}>
            {activeCategory === 'formules' ? 'Nos Formules Sandwich + Boisson + Dessert' : activeCategory}
          </h2>
          <span className="text-xs" style={{ color: 'var(--color-text-muted)' }}>
            {getFilteredProducts().length} produit(s)
          </span>
        </div>

        {/* Grille des cartes */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {getFilteredProducts().map((product) => {
            const isSandwich = product.category === 'froids' || product.category === 'chauds';

            return (
              <div
                key={product.id}
                className={`p-4 rounded-2xl border transition-all flex flex-col justify-between ${
                  !product.inStock || config.isRushPaused
                    ? 'opacity-60 bg-black/5'
                    : 'hover:shadow-md'
                }`}
                style={{
                  backgroundColor: 'var(--color-card)',
                  borderColor: 'var(--color-border)',
                }}
              >
                <div>
                  <div className="flex items-start justify-between gap-2">
                    <h3 className="font-bold text-sm leading-tight" style={{ color: 'var(--color-text)' }}>
                      {product.name}
                    </h3>
                    {product.isPopular && (
                      <span className="shrink-0 text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-700">
                        Top
                      </span>
                    )}
                  </div>
                  <p className="text-xs mt-1 leading-snug" style={{ color: 'var(--color-text-muted)' }}>
                    {product.description}
                  </p>
                </div>

                <div className="mt-4 pt-3 border-t flex items-center justify-between" style={{ borderColor: 'var(--color-border)' }}>
                  <div>
                    {activeCategory === 'formules' && product.priceDrink ? (
                      <div>
                        <span className="text-xs font-bold text-emerald-700 block">
                          Formule 33cl : {product.priceDrink.toFixed(2)} €
                        </span>
                        {product.priceFull && (
                          <span className="text-[11px]" style={{ color: 'var(--color-text-muted)' }}>
                            Complète : {product.priceFull.toFixed(2)} €
                          </span>
                        )}
                      </div>
                    ) : (
                      <div>
                        <span className="font-bold text-sm" style={{ color: 'var(--color-primary)' }}>
                          {product.priceSingle.toFixed(2)} €
                        </span>
                        {product.priceDrink && (
                          <span className="text-[10px] block" style={{ color: 'var(--color-text-muted)' }}>
                            Formule dès {product.priceDrink.toFixed(2)} €
                          </span>
                        )}
                      </div>
                    )}
                  </div>

                  {!product.inStock ? (
                    <span className="text-xs font-bold text-red-600 bg-red-100 dark:bg-red-950/40 px-2.5 py-1 rounded-xl">
                      Épuisé
                    </span>
                  ) : (
                    <button
                      type="button"
                      disabled={config.isRushPaused}
                      onClick={() => handleOpenProduct(product, activeCategory === 'formules' ? 'drink' : 'single')}
                      className="px-3 py-1.5 rounded-xl text-white font-bold text-xs flex items-center gap-1 shadow-sm transition-transform active:scale-95 cursor-pointer"
                      style={{ backgroundColor: 'var(--color-primary)' }}
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>{isSandwich ? 'Choisir' : 'Ajouter'}</span>
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </main>

      {/* Barre Fixe Panier Bas d'écran */}
      {cart.length > 0 && !currentClientOrder && (
        <div className="fixed bottom-4 inset-x-4 max-w-lg mx-auto z-30">
          <button
            onClick={() => setIsCartOpen(true)}
            className="w-full py-3.5 px-5 rounded-2xl text-white font-bold flex items-center justify-between shadow-2xl transition-transform active:scale-98 cursor-pointer"
            style={{ backgroundColor: 'var(--color-primary)' }}
          >
            <div className="flex items-center gap-2.5">
              <div className="relative">
                <ShoppingBag className="w-5 h-5" />
                <span className="absolute -top-1.5 -right-2 bg-white text-black text-[10px] font-black w-4 h-4 rounded-full flex items-center justify-center shadow-xs">
                  {cartItemsCount}
                </span>
              </div>
              <span className="text-sm">Voir ma commande</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="bg-black/20 px-2.5 py-1 rounded-xl text-sm font-black">
                {cartTotal.toFixed(2)} €
              </span>
              <ArrowRight className="w-4 h-4" />
            </div>
          </button>
        </div>
      )}

      {/* Modal Panier & Validation de Commande */}
      {isCartOpen && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/60 backdrop-blur-xs">
          <div
            className="w-full max-w-md rounded-t-3xl sm:rounded-3xl max-h-[90vh] flex flex-col shadow-2xl border overflow-hidden animate-in slide-in-from-bottom"
            style={{
              backgroundColor: 'var(--color-card)',
              borderColor: 'var(--color-border)',
              color: 'var(--color-text)',
            }}
          >
            <div className="p-4 border-b flex items-center justify-between" style={{ borderColor: 'var(--color-border)' }}>
              <div className="flex items-center gap-2">
                <ShoppingBag className="w-5 h-5 text-amber-600" />
                <h3 className="font-bold text-base">Récapitulatif de ma commande</h3>
              </div>
              <button
                onClick={() => setIsCartOpen(false)}
                className="text-xs font-semibold px-2.5 py-1 rounded-lg hover:bg-black/5 cursor-pointer"
              >
                Fermer
              </button>
            </div>

            <div className="p-4 overflow-y-auto space-y-4">
              {cart.map((item, index) => (
                <div
                  key={item.id}
                  className="p-3 rounded-2xl border flex items-start justify-between gap-3"
                  style={{ borderColor: 'var(--color-border)', backgroundColor: 'var(--color-bg)' }}
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-sm">{item.productName}</span>
                      {item.formulaType !== 'single' && (
                        <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-md bg-amber-500/20 text-amber-800">
                          {item.formulaType === 'drink' ? 'Formule Boisson' : item.formulaType === 'full' ? 'Formule Complète' : 'Maxi'}
                        </span>
                      )}
                    </div>

                    {item.selectedDrink && (
                      <div className="text-xs" style={{ color: 'var(--color-text-muted)' }}>
                        🥤 Boisson : {item.selectedDrink}
                      </div>
                    )}
                    {item.selectedPastry && (
                      <div className="text-xs" style={{ color: 'var(--color-text-muted)' }}>
                        🍰 Pâtisserie : {item.selectedPastry}
                      </div>
                    )}
                    {item.selectedSauces.length > 0 && (
                      <div className="text-xs" style={{ color: 'var(--color-text-muted)' }}>
                        Sauces : {item.selectedSauces.join(', ')}
                      </div>
                    )}
                    {item.excludedCrudites.length > 0 && (
                      <div className="text-xs text-red-600 font-semibold">
                        Sans : {item.excludedCrudites.join(', ')}
                      </div>
                    )}
                    {item.selectedSupplements.length > 0 && (
                      <div className="text-xs font-medium text-amber-700">
                        Extras : {item.selectedSupplements.map((s) => s.name).join(', ')}
                      </div>
                    )}
                    <div className="text-xs font-bold pt-1">
                      {item.unitPrice.toFixed(2)} € × {item.quantity}
                    </div>
                  </div>

                  <button
                    onClick={() => removeFromCart(index)}
                    className="p-2 rounded-xl text-red-600 hover:bg-red-50 cursor-pointer"
                    title="Supprimer cet article"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}

              {/* Formulaire Prénom & Règlement */}
              <form onSubmit={handleCheckout} className="space-y-4 pt-2">
                <div>
                  <label className="text-xs font-bold uppercase tracking-wider block mb-1.5" style={{ color: 'var(--color-text-muted)' }}>
                    Votre prénom (Pour vous appeler au comptoir) *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Ex: Yassine, Sarah, Julien..."
                    value={clientName}
                    onChange={(e) => setClientName(e.target.value)}
                    className="w-full px-3.5 py-3 rounded-xl border text-sm font-semibold focus:outline-hidden focus:ring-2 focus:ring-amber-500"
                    style={{
                      borderColor: 'var(--color-border)',
                      backgroundColor: 'var(--color-card)',
                      color: 'var(--color-text)',
                    }}
                  />
                </div>

                <div className="p-3 rounded-2xl border bg-black/5 dark:bg-white/5 space-y-1" style={{ borderColor: 'var(--color-border)' }}>
                  <div className="text-xs font-bold flex items-center gap-1.5 text-amber-700">
                    <span>💶 Règlement au comptoir lors du retrait</span>
                  </div>
                  <div className="text-[11px]" style={{ color: 'var(--color-text-muted)' }}>
                    Réglez simplement en Espèces ou Carte Bancaire au moment de récupérer votre commande.
                  </div>
                </div>

                <div className="p-3 rounded-2xl bg-black/5 dark:bg-white/5 space-y-1 text-xs">
                  <div className="flex justify-between font-bold text-sm">
                    <span>Total à régler</span>
                    <span className="text-amber-700">{cartTotal.toFixed(2)} €</span>
                  </div>
                  <div className="text-[11px]" style={{ color: 'var(--color-text-muted)' }}>
                    Prix TTC transparents, sans frais supplémentaires ni surprise.
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full py-4 rounded-2xl text-white font-black text-sm shadow-xl flex items-center justify-center gap-2 transition-transform active:scale-98 cursor-pointer"
                  style={{ backgroundColor: 'var(--color-primary)' }}
                >
                  <CheckCircle2 className="w-5 h-5" />
                  <span>Confirmer la commande ({cartTotal.toFixed(2)} €)</span>
                </button>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Écran de Suivi de Commande Client Live */}
      {currentClientOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
          <div
            className={`w-full max-w-md rounded-3xl p-6 shadow-2xl border text-center relative overflow-hidden transition-all ${
              currentClientOrder.status === 'ready' ? 'animate-soft-pulse border-emerald-500' : ''
            }`}
            style={{
              backgroundColor: 'var(--color-card)',
              borderColor: currentClientOrder.status === 'ready' ? '#22c55e' : 'var(--color-border)',
              color: 'var(--color-text)',
            }}
          >
            {/* Header Commande */}
            <div className="text-xs font-bold uppercase tracking-widest text-amber-700">
              Commande Enregistrée
            </div>
            <div className="text-5xl font-black my-2 tracking-tight" style={{ color: 'var(--color-primary)' }}>
              {currentClientOrder.orderNumber}
            </div>
            <div className="text-sm font-semibold">
              Client : <strong className="text-base">{currentClientOrder.clientName}</strong>
            </div>

            {/* Statut dynamique */}
            <div className="my-5 p-4 rounded-2xl border" style={{ borderColor: 'var(--color-border)' }}>
              {currentClientOrder.status === 'in_progress' && (
                <div className="space-y-2">
                  <div className="flex items-center justify-center gap-2 text-amber-700 font-bold text-sm">
                    <span className="animate-spin text-lg">⏳</span>
                    <span>En préparation en cuisine</span>
                  </div>
                  <p className="text-xs" style={{ color: 'var(--color-text-muted)' }}>
                    Attente estimée : ~{config.rushEstimatedMinutes} min. Votre numéro sera appelé dès que vos sandwichs seront prêts !
                  </p>
                </div>
              )}

              {currentClientOrder.status === 'ready' && (
                <div className="space-y-2">
                  <div className="flex items-center justify-center gap-2 text-emerald-600 font-black text-base">
                    <CheckCircle2 className="w-6 h-6" />
                    <span>🟢 COMMANDE PRÊTE !</span>
                  </div>
                  <p className="text-xs font-semibold text-emerald-800 dark:text-emerald-300">
                    Veuillez vous présenter au comptoir pour retirer votre commande fraîchement préparée.
                  </p>
                </div>
              )}
            </div>

            {/* Récapitulatif rapide */}
            <div className="text-left text-xs space-y-1.5 p-3 rounded-xl bg-black/5 dark:bg-white/5 mb-5 max-h-36 overflow-y-auto">
              <div className="font-bold text-[11px] uppercase tracking-wider mb-1" style={{ color: 'var(--color-text-muted)' }}>
                Détail des articles :
              </div>
              {currentClientOrder.items.map((item, idx) => (
                <div key={idx} className="flex justify-between">
                  <span>
                    {item.quantity}x {item.productName}
                    {item.selectedSauces.length > 0 && ` (${item.selectedSauces.join('/')})`}
                    {item.excludedCrudites.length > 0 && ` [Sans ${item.excludedCrudites.join('/')}]`}
                  </span>
                  <span className="font-semibold">{(item.unitPrice * item.quantity).toFixed(2)} €</span>
                </div>
              ))}
              <div className="border-t pt-1 flex justify-between font-bold" style={{ borderColor: 'var(--color-border)' }}>
                <span>Total (à régler au comptoir) :</span>
                <span className="text-amber-700">{currentClientOrder.totalAmount.toFixed(2)} €</span>
              </div>
            </div>

            {/* Bouton clôture / nouvelle commande */}
            <button
              onClick={() => setCurrentClientOrder(null)}
              className="w-full py-3 rounded-xl border text-xs font-bold flex items-center justify-center gap-1.5 hover:bg-black/5 cursor-pointer"
              style={{ borderColor: 'var(--color-border)' }}
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Passer une autre commande</span>
            </button>
          </div>
        </div>
      )}

      {/* Modal Personnalisation Sandwich */}
      {selectedProductForModal && (
        <SandwichModal
          product={selectedProductForModal}
          initialFormula={modalInitialFormula}
          onClose={() => setSelectedProductForModal(null)}
          onAddToCart={(item) => {
            addToCart(item);
            setSelectedProductForModal(null);
          }}
        />
      )}
    </div>
  );
};
