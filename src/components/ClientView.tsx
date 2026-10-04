import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { useStore } from '../context/StoreContext';
import type { Product, OrderItem, CategoryType } from '../types';
import { SandwichModal } from './SandwichModal';
import { calculateDistanceKm, estimateTravelMinutes } from '../utils/geo';
import {
  ShoppingBag,
  Clock,
  CheckCircle2,
  AlertCircle,
  Plus,
  Trash2,
  ArrowRight,
  Sparkles,
  ShieldCheck,
  RotateCcw,
  MapPin,
  Phone,
  Navigation,
  RefreshCw,
  AlertTriangle,
} from 'lucide-react';
import confetti from 'canvas-confetti';

type GeoStatus = 'prompt' | 'locating' | 'authorized' | 'too_far' | 'denied' | 'unsupported';

const INITIAL_PAGE_SIZE = 8;
const PAGE_SIZE_INCREMENT = 6;

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
  const [clientPhone, setClientPhone] = useState('');

  // Infinite scroll state
  const [visibleCount, setVisibleCount] = useState<number>(INITIAL_PAGE_SIZE);
  const observerTargetRef = useRef<HTMLDivElement | null>(null);

  // Geolocation state
  const [geoStatus, setGeoStatus] = useState<GeoStatus>('prompt');
  const [userDistanceKm, setUserDistanceKm] = useState<number | null>(null);
  const [userTravelMins, setUserTravelMins] = useState<number | null>(null);

  // Geolocation check function
  const checkGeolocation = useCallback(() => {
    if (!config.geoRestrictionEnabled) {
      setGeoStatus('authorized');
      return;
    }

    if (!('geolocation' in navigator)) {
      setGeoStatus('unsupported');
      return;
    }

    setGeoStatus('locating');

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const userLat = position.coords.latitude;
        const userLng = position.coords.longitude;
        const distKm = calculateDistanceKm(
          userLat,
          userLng,
          config.storeLat || 50.6845078,
          config.storeLng || 2.8655871
        );
        const mins = estimateTravelMinutes(distKm);

        setUserDistanceKm(distKm);
        setUserTravelMins(mins);

        const maxDist = config.maxDistanceKm ?? 8;
        if (distKm <= maxDist) {
          setGeoStatus('authorized');
        } else {
          setGeoStatus('too_far');
        }
      },
      (error) => {
        console.warn('Erreur de géolocalisation:', error.message);
        setGeoStatus('denied');
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 60000,
      }
    );
  }, [config.geoRestrictionEnabled, config.storeLat, config.storeLng, config.maxDistanceKm]);

  // Request geolocation on initial load if restriction enabled
  useEffect(() => {
    checkGeolocation();
  }, [checkGeolocation]);

  // Reset infinite scroll count when category changes
  useEffect(() => {
    setVisibleCount(INITIAL_PAGE_SIZE);
  }, [activeCategory]);

  // Haptic feedback & celebration trigger when order turns ready
  useEffect(() => {
    if (currentClientOrder?.status === 'ready') {
      if ('vibrate' in navigator) {
        try {
          navigator.vibrate(250);
        } catch {
          // ignore
        }
      }
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

  const isOrderAllowed = !config.geoRestrictionEnabled || geoStatus === 'authorized';

  const handleCheckout = (e: React.FormEvent) => {
    e.preventDefault();
    if (cart.length === 0) return;

    if (!isOrderAllowed) {
      if (geoStatus === 'too_far') {
        alert(
          `Vous êtes situé à ~${userDistanceKm} km (~${userTravelMins} min) de la boutique. Les commandes à emporter sont réservées aux clients à moins de 15 min (~${config.maxDistanceKm} km) pour garantir la fraîcheur et la qualité des sandwichs au retrait.`
        );
      } else {
        alert('Veuillez activer la géolocalisation pour valider que vous êtes à proximité de la boulangerie (160 Rue Jules Lebleu, Armentières).');
      }
      return;
    }

    if (!clientName.trim()) {
      alert('Veuillez renseigner votre prénom pour appeler votre commande au comptoir.');
      return;
    }

    const cleanPhone = clientPhone.replace(/\s+/g, '');
    if (!cleanPhone || cleanPhone.length < 8) {
      alert('Veuillez renseigner un numéro de téléphone valide afin que la cuisine puisse vous joindre en cas de besoin.');
      return;
    }

    createOrder(clientName.trim(), clientPhone.trim(), cart);
    setIsCartOpen(false);
  };

  // Filtrage selon catégorie
  const filteredProducts = useMemo(() => {
    if (activeCategory === 'formules') {
      return products.filter((p) => p.category === 'froids' || p.category === 'chauds');
    }
    return products.filter((p) => p.category === activeCategory);
  }, [products, activeCategory]);

  const displayedProducts = useMemo(() => {
    return filteredProducts.slice(0, visibleCount);
  }, [filteredProducts, visibleCount]);

  const hasMoreProducts = visibleCount < filteredProducts.length;

  // Infinite scroll intersection observer
  useEffect(() => {
    const sentinel = observerTargetRef.current;
    if (!sentinel) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMoreProducts) {
          setVisibleCount((prev) => Math.min(prev + PAGE_SIZE_INCREMENT, filteredProducts.length));
        }
      },
      { root: null, rootMargin: '200px', threshold: 0.1 }
    );

    observer.observe(sentinel);
    return () => observer.disconnect();
  }, [hasMoreProducts, filteredProducts.length]);

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

      {/* Bannière Géolocalisation (Rayon 15 min - 160 Rue Jules Lebleu, Armentières) */}
      {config.geoRestrictionEnabled && (
        <div className="border-b px-4 py-2 text-xs backdrop-blur-xs transition-all" style={{ borderColor: 'var(--color-border)', backgroundColor: 'var(--color-card)' }}>
          <div className="max-w-2xl mx-auto flex items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <MapPin className="w-4 h-4 shrink-0 text-amber-600" />
              {geoStatus === 'locating' && (
                <span className="flex items-center gap-1.5 text-amber-800 dark:text-amber-300 font-medium">
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                  <span>Calcul de votre distance à la boulangerie (160 Rue Jules Lebleu)...</span>
                </span>
              )}

              {geoStatus === 'authorized' && (
                <span className="text-emerald-700 dark:text-emerald-400 font-semibold flex items-center gap-1.5">
                  <span className="inline-block w-2 h-2 rounded-full bg-emerald-500"></span>
                  <span>
                    Vous êtes à {userDistanceKm !== null ? `~${userDistanceKm} km (~${userTravelMins} min)` : 'proximité'} d'Armentières • <strong>Commande autorisée</strong>
                  </span>
                </span>
              )}

              {geoStatus === 'too_far' && (
                <span className="text-red-700 dark:text-red-400 font-semibold flex items-center gap-1.5">
                  <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
                  <span>
                    Vous êtes à ~{userDistanceKm} km (~{userTravelMins} min). Commandes limitées à 15 min (~{config.maxDistanceKm} km).
                  </span>
                </span>
              )}

              {geoStatus === 'denied' && (
                <span className="text-amber-800 dark:text-amber-300 font-medium">
                  Géolocalisation requise pour commander à emporter (rayon 15 min).
                </span>
              )}

              {geoStatus === 'unsupported' && (
                <span className="text-zinc-600 font-medium">
                  Boulangerie : 160 Rue Jules Lebleu, Armentières
                </span>
              )}
            </div>

            {/* Bouton rafraîchir la position */}
            {(geoStatus === 'too_far' || geoStatus === 'denied') && (
              <button
                type="button"
                onClick={checkGeolocation}
                className="shrink-0 px-2 py-1 rounded-lg text-[11px] font-bold bg-amber-500/15 text-amber-800 dark:text-amber-300 hover:bg-amber-500/25 flex items-center gap-1 cursor-pointer"
              >
                <Navigation className="w-3 h-3" />
                <span>Actualiser</span>
              </button>
            )}
          </div>
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
                {config.subtitle} • {config.storeAddress}
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
              Service actif • Retrait comptoir
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

      {/* Navigation Onglets Menu Dynamiques */}
      <div
        className="sticky top-0 z-20 px-4 py-2.5 border-b backdrop-blur-md"
        style={{
          backgroundColor: 'rgba(var(--color-card), 0.95)',
          borderColor: 'var(--color-border)',
        }}
      >
        <div className="max-w-2xl mx-auto flex gap-2 overflow-x-auto no-scrollbar py-0.5">
          {/* Onglet Fixe Formules */}
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
            <span>Formules Midi</span>
          </button>

          {/* Catégories configurables du magasin */}
          {(config.categories || []).map((cat) => {
            const isActive = activeCategory === cat.id;
            return (
              <button
                key={cat.id}
                onClick={() => setActiveCategory(cat.id)}
                className={`px-3.5 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all flex items-center gap-1.5 cursor-pointer ${
                  isActive
                    ? 'bg-amber-600 text-white shadow-sm'
                    : 'hover:bg-black/5 dark:hover:bg-white/5'
                }`}
                style={{
                  backgroundColor: isActive ? 'var(--color-primary)' : 'transparent',
                  color: isActive ? '#ffffff' : 'var(--color-text)',
                }}
              >
                {cat.icon && <span>{cat.icon}</span>}
                <span>{cat.name}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Liste des Produits (Infinite Scrolling & Load as you scroll) */}
      <main className="max-w-2xl mx-auto px-4 py-5 space-y-4">
        {/* En-tête de section */}
        <div className="flex items-center justify-between">
          <h2 className="text-base font-bold capitalize flex items-center gap-2" style={{ color: 'var(--color-text)' }}>
            <span>
              {activeCategory === 'formules'
                ? 'Nos Formules Sandwich + Boisson + Dessert'
                : (config.categories?.find((c) => c.id === activeCategory)?.name || activeCategory)}
            </span>
          </h2>
          <span className="text-xs" style={{ color: 'var(--color-text-muted)' }}>
            {displayedProducts.length} sur {filteredProducts.length} produit(s)
          </span>
        </div>

        {/* Grille des cartes de produits */}
        {displayedProducts.length === 0 ? (
          <div className="text-center py-12 border rounded-2xl border-dashed" style={{ borderColor: 'var(--color-border)' }}>
            <p className="text-xs font-medium" style={{ color: 'var(--color-text-muted)' }}>
              Aucun produit disponible dans cette catégorie pour le moment.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {displayedProducts.map((product) => {
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
                    <p className="text-xs mt-1 leading-snug line-clamp-2" style={{ color: 'var(--color-text-muted)' }}>
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
                          <span className="text-sm font-black text-amber-700">
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

                    <div className="flex items-center gap-1.5">
                      {!product.inStock ? (
                        <span className="text-[11px] font-bold text-red-600 px-2 py-1 rounded-lg bg-red-500/10">
                          Épuisé
                        </span>
                      ) : isSandwich ? (
                        <button
                          type="button"
                          onClick={() => handleOpenProduct(product, activeCategory === 'formules' ? 'drink' : 'single')}
                          disabled={config.isRushPaused}
                          className="px-3 py-1.5 rounded-xl text-white text-xs font-bold flex items-center gap-1 shadow-sm transition-transform active:scale-95 cursor-pointer disabled:opacity-50"
                          style={{ backgroundColor: 'var(--color-primary)' }}
                        >
                          <Plus className="w-3.5 h-3.5" />
                          <span>{activeCategory === 'formules' ? 'Choisir formule' : 'Personnaliser'}</span>
                        </button>
                      ) : (
                        <button
                          type="button"
                          onClick={() => handleOpenProduct(product, 'single')}
                          disabled={config.isRushPaused}
                          className="p-2 rounded-xl text-white text-xs font-bold flex items-center gap-1 shadow-sm transition-transform active:scale-95 cursor-pointer disabled:opacity-50"
                          style={{ backgroundColor: 'var(--color-primary)' }}
                          title="Ajouter au panier"
                        >
                          <Plus className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Sentinel pour Infinite Scrolling / Load as you scroll */}
        <div ref={observerTargetRef} className="py-4 text-center">
          {hasMoreProducts ? (
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-2xl bg-black/5 dark:bg-white/5 text-xs font-medium" style={{ color: 'var(--color-text-muted)' }}>
              <RefreshCw className="w-3.5 h-3.5 animate-spin text-amber-600" />
              <span>Chargement automatique au défilement ({displayedProducts.length}/{filteredProducts.length})...</span>
            </div>
          ) : filteredProducts.length > INITIAL_PAGE_SIZE ? (
            <span className="text-[11px] font-medium" style={{ color: 'var(--color-text-muted)' }}>
              ✓ Vous avez consulté tous les articles de cette catégorie
            </span>
          ) : null}
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
            className="w-full max-w-md rounded-t-3xl sm:rounded-3xl max-h-[92vh] flex flex-col shadow-2xl border overflow-hidden animate-in slide-in-from-bottom"
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

              {/* Formulaire Coordonnées (Prénom + Numéro de Téléphone Cuisine) */}
              <form onSubmit={handleCheckout} className="space-y-3 pt-2">
                <div>
                  <label className="text-xs font-bold uppercase tracking-wider block mb-1" style={{ color: 'var(--color-text-muted)' }}>
                    Votre prénom (Pour vous appeler au comptoir) *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Ex: Sarah, Sofiane, Maxime..."
                    value={clientName}
                    onChange={(e) => setClientName(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border text-sm font-semibold focus:outline-hidden focus:ring-2 focus:ring-amber-500"
                    style={{
                      borderColor: 'var(--color-border)',
                      backgroundColor: 'var(--color-card)',
                      color: 'var(--color-text)',
                    }}
                  />
                </div>

                <div>
                  <label className="text-xs font-bold uppercase tracking-wider block mb-1 flex items-center gap-1.5" style={{ color: 'var(--color-text-muted)' }}>
                    <Phone className="w-3.5 h-3.5 text-amber-600" />
                    <span>Numéro de téléphone portable (Appel cuisine si besoin) *</span>
                  </label>
                  <input
                    type="tel"
                    required
                    placeholder="Ex: 06 12 34 56 78"
                    value={clientPhone}
                    onChange={(e) => setClientPhone(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border text-sm font-semibold focus:outline-hidden focus:ring-2 focus:ring-amber-500"
                    style={{
                      borderColor: 'var(--color-border)',
                      backgroundColor: 'var(--color-card)',
                      color: 'var(--color-text)',
                    }}
                  />
                  <span className="text-[10px] mt-1 block" style={{ color: 'var(--color-text-muted)' }}>
                    Ce numéro sert exclusivement à l'équipe en cuisine pour vous prévenir quand c'est prêt. 0 publicité.
                  </span>
                </div>

                {/* Feedback Géolocalisation dans le panier */}
                {config.geoRestrictionEnabled && (
                  <div className={`p-3 rounded-2xl border text-xs ${
                    geoStatus === 'authorized'
                      ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-800 dark:text-emerald-300'
                      : geoStatus === 'too_far'
                      ? 'bg-red-500/10 border-red-500/20 text-red-800 dark:text-red-300'
                      : 'bg-amber-500/10 border-amber-500/20 text-amber-800 dark:text-amber-300'
                  }`}>
                    <div className="font-bold flex items-center gap-1.5">
                      <MapPin className="w-4 h-4 shrink-0" />
                      <span>
                        {geoStatus === 'authorized' && `Position validée (~${userDistanceKm ?? 0} km / ~${userTravelMins ?? 1} min)`}
                        {geoStatus === 'too_far' && `Hors du rayon autorisé (~${userDistanceKm} km)`}
                        {geoStatus === 'locating' && 'Vérification de votre position géographique...'}
                        {geoStatus === 'denied' && 'Localisation non autorisée'}
                      </span>
                    </div>
                    <div className="text-[11px] mt-0.5">
                      {geoStatus === 'authorized' && 'Votre localisation permet le retrait rapide de sandwichs frais et chauds.'}
                      {geoStatus === 'too_far' && `Vous êtes situé à plus de 15 min (~${config.maxDistanceKm} km max). La commande est bloquée pour préserver la qualité de nos produits au retrait.`}
                      {geoStatus === 'denied' && 'Pour valider votre commande à emporter, activez la localisation de votre téléphone.'}
                    </div>
                  </div>
                )}

                {/* Note Paiement au comptoir */}
                <div className="p-3 rounded-2xl border bg-black/5 dark:bg-white/5 space-y-1" style={{ borderColor: 'var(--color-border)' }}>
                  <div className="text-xs font-bold flex items-center gap-1.5 text-amber-700">
                    <span>💶 Règlement au comptoir lors du retrait</span>
                  </div>
                  <div className="text-[11px]" style={{ color: 'var(--color-text-muted)' }}>
                    Aucun paiement en ligne requis. Réglez simplement en Espèces ou Carte Bancaire lors du retrait de votre commande.
                  </div>
                </div>

                <div className="p-3 rounded-2xl bg-black/5 dark:bg-white/5 space-y-1 text-xs">
                  <div className="flex justify-between font-bold text-sm">
                    <span>Total à régler au retrait</span>
                    <span className="text-amber-700">{cartTotal.toFixed(2)} €</span>
                  </div>
                  <div className="text-[11px]" style={{ color: 'var(--color-text-muted)' }}>
                    Prix TTC transparents, sans frais supplémentaires ni surprise.
                  </div>
                </div>

                {/* Bouton de confirmation */}
                <button
                  type="submit"
                  disabled={!isOrderAllowed}
                  className={`w-full py-4 rounded-2xl text-white font-black text-sm shadow-xl flex items-center justify-center gap-2 transition-transform active:scale-98 ${
                    !isOrderAllowed ? 'opacity-50 cursor-not-allowed bg-zinc-500' : 'cursor-pointer'
                  }`}
                  style={{ backgroundColor: isOrderAllowed ? 'var(--color-primary)' : undefined }}
                >
                  <CheckCircle2 className="w-5 h-5" />
                  <span>
                    {!isOrderAllowed
                      ? geoStatus === 'too_far'
                        ? 'Trop éloigné (Périmètre > 15 min)'
                        : 'Localisation requise pour commander'
                      : `Confirmer la commande (${cartTotal.toFixed(2)} €)`}
                  </span>
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
              {currentClientOrder.clientPhone && (
                <span className="block text-xs font-normal text-zinc-500 mt-0.5">
                  📞 {currentClientOrder.clientPhone}
                </span>
              )}
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
