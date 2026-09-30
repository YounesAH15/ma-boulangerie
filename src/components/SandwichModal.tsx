import React, { useState } from 'react';
import type { Product, OrderItem } from '../types';
import { CRUDITES_LIST, SAUCES_LIST, SUPPLEMENTS_LIST, PRODUCTS_LIST } from '../data/menuData';
import { X, Check, Plus, Minus, Sparkles } from 'lucide-react';

interface SandwichModalProps {
  product: Product;
  onClose: () => void;
  onAddToCart: (item: OrderItem) => void;
  initialFormula?: 'single' | 'drink' | 'full' | 'maxi';
}

export const SandwichModal: React.FC<SandwichModalProps> = ({
  product,
  onClose,
  onAddToCart,
  initialFormula = 'single',
}) => {
  const [formulaType, setFormulaType] = useState<'single' | 'drink' | 'full' | 'maxi'>(initialFormula);
  const [quantity, setQuantity] = useState(1);

  // Crudités : Toutes cochées par défaut ! (User Story préférée)
  const [excludedCrudites, setExcludedCrudites] = useState<string[]>([]);

  // Sauces : jusqu'à 2 sauces gratuites
  const [selectedSauces, setSelectedSauces] = useState<string[]>(['samourai']);

  // Suppléments
  const [selectedSupplements, setSelectedSupplements] = useState<{ name: string; price: number }[]>([]);

  // Boissons et desserts si en formule
  const drinksList = PRODUCTS_LIST.filter((p) => p.category === 'boissons' && p.inStock);
  const dessertsList = PRODUCTS_LIST.filter((p) => p.category === 'desserts' && p.inStock);

  const [selectedDrink, setSelectedDrink] = useState<string>(drinksList[0]?.name || 'Coca-Cola 33cl');
  const [selectedPastry, setSelectedPastry] = useState<string>(dessertsList[0]?.name || 'Éclair au Chocolat');

  const toggleCrudite = (cruditeId: string) => {
    if (excludedCrudites.includes(cruditeId)) {
      setExcludedCrudites(excludedCrudites.filter((id) => id !== cruditeId));
    } else {
      setExcludedCrudites([...excludedCrudites, cruditeId]);
    }
  };

  const toggleSauce = (sauceId: string) => {
    if (sauceId === 'sans_sauce') {
      setSelectedSauces(['sans_sauce']);
      return;
    }

    if (selectedSauces.includes('sans_sauce')) {
      setSelectedSauces([sauceId]);
      return;
    }

    if (selectedSauces.includes(sauceId)) {
      setSelectedSauces(selectedSauces.filter((id) => id !== sauceId));
    } else {
      if (selectedSauces.length < 2) {
        setSelectedSauces([...selectedSauces, sauceId]);
      } else {
        // Remplace la première par la nouvelle
        setSelectedSauces([selectedSauces[1], sauceId]);
      }
    }
  };

  const toggleSupplement = (supp: { id: string; name: string; price: number }) => {
    const exists = selectedSupplements.some((s) => s.name === supp.name);
    if (exists) {
      setSelectedSupplements(selectedSupplements.filter((s) => s.name !== supp.name));
    } else {
      setSelectedSupplements([...selectedSupplements, { name: supp.name, price: supp.price }]);
    }
  };

  // Calcul du prix unitaire
  const getBasePrice = () => {
    if (formulaType === 'drink' && product.priceDrink) return product.priceDrink;
    if (formulaType === 'full' && product.priceFull) return product.priceFull;
    if (formulaType === 'maxi' && product.priceMaxi) return product.priceMaxi;
    return product.priceSingle;
  };

  const supplementsTotal = selectedSupplements.reduce((sum, s) => sum + s.price, 0);
  const unitPrice = getBasePrice() + supplementsTotal;
  const totalPrice = unitPrice * quantity;

  const handleAdd = () => {
    const item: OrderItem = {
      id: `item_${Date.now()}_${Math.random().toString(36).substring(2, 5)}`,
      productId: product.id,
      productName: product.name,
      formulaType,
      selectedDrink: formulaType === 'drink' || formulaType === 'full' ? selectedDrink : undefined,
      selectedPastry: formulaType === 'full' ? selectedPastry : undefined,
      selectedSauces: selectedSauces.map((id) => SAUCES_LIST.find((s) => s.id === id)?.name || id),
      excludedCrudites: excludedCrudites.map((id) => CRUDITES_LIST.find((c) => c.id === id)?.name || id),
      selectedSupplements,
      unitPrice,
      quantity,
    };
    onAddToCart(item);
    onClose();
  };

  const isSandwich = product.category === 'froids' || product.category === 'chauds';

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/60 backdrop-blur-xs">
      <div
        className="w-full max-w-lg rounded-t-3xl sm:rounded-3xl max-h-[90vh] flex flex-col shadow-2xl border overflow-hidden animate-in fade-in slide-in-from-bottom duration-200"
        style={{
          backgroundColor: 'var(--color-card)',
          borderColor: 'var(--color-border)',
          color: 'var(--color-text)',
        }}
      >
        {/* Header */}
        <div className="p-4 border-b flex items-center justify-between sticky top-0 z-10" style={{ borderColor: 'var(--color-border)', backgroundColor: 'var(--color-card)' }}>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-bold text-lg leading-tight">{product.name}</h3>
              {product.isPopular && (
                <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-700">
                  Préféré du midi
                </span>
              )}
            </div>
            <p className="text-xs mt-0.5" style={{ color: 'var(--color-text-muted)' }}>
              {product.description}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-full hover:bg-black/5 dark:hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="p-4 overflow-y-auto space-y-6">
          {/* Choix Formule */}
          {isSandwich && (
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold uppercase tracking-wider" style={{ color: 'var(--color-text-muted)' }}>
                  Format / Formule
                </span>
                <span className="text-xs font-semibold text-emerald-600 flex items-center gap-1">
                  <Sparkles className="w-3.5 h-3.5" /> Économique & Rapide
                </span>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setFormulaType('single')}
                  className={`p-3 rounded-2xl border text-left transition-all ${
                    formulaType === 'single'
                      ? 'border-amber-600 bg-amber-500/10 font-bold ring-1 ring-amber-500'
                      : 'hover:border-black/20'
                  }`}
                  style={{ borderColor: formulaType === 'single' ? 'var(--color-primary)' : 'var(--color-border)' }}
                >
                  <div className="text-sm font-semibold">Sandwich Seul</div>
                  <div className="text-xs text-amber-700 dark:text-amber-400 font-bold mt-1">
                    {product.priceSingle.toFixed(2)} €
                  </div>
                </button>

                {product.priceDrink && (
                  <button
                    type="button"
                    onClick={() => setFormulaType('drink')}
                    className={`p-3 rounded-2xl border text-left transition-all ${
                      formulaType === 'drink'
                        ? 'border-amber-600 bg-amber-500/10 font-bold ring-1 ring-amber-500'
                        : 'hover:border-black/20'
                    }`}
                    style={{ borderColor: formulaType === 'drink' ? 'var(--color-primary)' : 'var(--color-border)' }}
                  >
                    <div className="text-sm font-semibold flex items-center gap-1">
                      <span>+ Boisson 33cl</span>
                    </div>
                    <div className="text-xs text-amber-700 dark:text-amber-400 font-bold mt-1">
                      {product.priceDrink.toFixed(2)} €
                    </div>
                  </button>
                )}

                {product.priceFull && (
                  <button
                    type="button"
                    onClick={() => setFormulaType('full')}
                    className={`p-3 rounded-2xl border text-left transition-all col-span-2 sm:col-span-1 ${
                      formulaType === 'full'
                        ? 'border-amber-600 bg-amber-500/10 font-bold ring-1 ring-amber-500'
                        : 'hover:border-black/20'
                    }`}
                    style={{ borderColor: formulaType === 'full' ? 'var(--color-primary)' : 'var(--color-border)' }}
                  >
                    <div className="text-sm font-semibold flex items-center gap-1">
                      <span>🌟 Complète (+ Pâtisserie)</span>
                    </div>
                    <div className="text-xs text-amber-700 dark:text-amber-400 font-bold mt-1">
                      {product.priceFull.toFixed(2)} €
                    </div>
                  </button>
                )}

                {product.priceMaxi && (
                  <button
                    type="button"
                    onClick={() => setFormulaType('maxi')}
                    className={`p-3 rounded-2xl border text-left transition-all ${
                      formulaType === 'maxi'
                        ? 'border-amber-600 bg-amber-500/10 font-bold ring-1 ring-amber-500'
                        : 'hover:border-black/20'
                    }`}
                    style={{ borderColor: formulaType === 'maxi' ? 'var(--color-primary)' : 'var(--color-border)' }}
                  >
                    <div className="text-sm font-semibold">Maxi Sandwich</div>
                    <div className="text-xs text-amber-700 dark:text-amber-400 font-bold mt-1">
                      {product.priceMaxi.toFixed(2)} €
                    </div>
                  </button>
                )}
              </div>
            </div>
          )}

          {/* Choix Boisson si formule */}
          {(formulaType === 'drink' || formulaType === 'full') && (
            <div>
              <label className="text-xs font-bold uppercase tracking-wider block mb-2" style={{ color: 'var(--color-text-muted)' }}>
                Choisissez votre boisson 33cl (Incluse)
              </label>
              <div className="grid grid-cols-2 gap-2">
                {drinksList.map((drink) => (
                  <button
                    key={drink.id}
                    type="button"
                    onClick={() => setSelectedDrink(drink.name)}
                    className={`p-2.5 rounded-xl border text-xs font-medium text-left transition-all flex items-center justify-between ${
                      selectedDrink === drink.name
                        ? 'border-amber-600 bg-amber-500/15 font-bold'
                        : 'hover:border-black/20'
                    }`}
                    style={{ borderColor: selectedDrink === drink.name ? 'var(--color-primary)' : 'var(--color-border)' }}
                  >
                    <span>{drink.name}</span>
                    {selectedDrink === drink.name && <Check className="w-3.5 h-3.5 text-amber-700" />}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Choix Pâtisserie si formule complète */}
          {formulaType === 'full' && (
            <div>
              <label className="text-xs font-bold uppercase tracking-wider block mb-2" style={{ color: 'var(--color-text-muted)' }}>
                Choisissez votre pâtisserie artisanale (Incluse)
              </label>
              <div className="grid grid-cols-2 gap-2">
                {dessertsList.map((dessert) => (
                  <button
                    key={dessert.id}
                    type="button"
                    onClick={() => setSelectedPastry(dessert.name)}
                    className={`p-2.5 rounded-xl border text-xs font-medium text-left transition-all flex items-center justify-between ${
                      selectedPastry === dessert.name
                        ? 'border-amber-600 bg-amber-500/15 font-bold'
                        : 'hover:border-black/20'
                    }`}
                    style={{ borderColor: selectedPastry === dessert.name ? 'var(--color-primary)' : 'var(--color-border)' }}
                  >
                    <span>{dessert.name}</span>
                    {selectedPastry === dessert.name && <Check className="w-3.5 h-3.5 text-amber-700" />}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Sauces (jusqu'à 2) */}
          {isSandwich && (
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold uppercase tracking-wider" style={{ color: 'var(--color-text-muted)' }}>
                  Choix de vos sauces (Jusqu'à 2 gratuites)
                </span>
                <span className="text-[11px] font-semibold text-amber-700">
                  {selectedSauces.length}/2 sélectionnée(s)
                </span>
              </div>
              <div className="flex flex-wrap gap-2">
                {SAUCES_LIST.map((sauce) => {
                  const isChecked = selectedSauces.includes(sauce.id);
                  return (
                    <button
                      key={sauce.id}
                      type="button"
                      onClick={() => toggleSauce(sauce.id)}
                      className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-all flex items-center gap-1.5 ${
                        isChecked
                          ? 'border-amber-600 bg-amber-600 text-white font-bold shadow-xs'
                          : 'hover:border-black/20'
                      }`}
                      style={{
                        borderColor: isChecked ? 'var(--color-primary)' : 'var(--color-border)',
                        backgroundColor: isChecked ? 'var(--color-primary)' : 'transparent',
                      }}
                    >
                      {isChecked && <Check className="w-3 h-3 text-white" />}
                      <span>{sauce.name}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Crudités : Incluses par défaut ! Décocher pour retirer */}
          {isSandwich && (
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold uppercase tracking-wider" style={{ color: 'var(--color-text-muted)' }}>
                  Crudités (Toutes incluses par défaut)
                </span>
                <button
                  type="button"
                  onClick={() => {
                    if (excludedCrudites.length === 0) {
                      setExcludedCrudites(CRUDITES_LIST.map((c) => c.id));
                    } else {
                      setExcludedCrudites([]);
                    }
                  }}
                  className="text-[11px] font-semibold text-amber-700 hover:underline"
                >
                  {excludedCrudites.length === 0 ? 'Tout retirer' : 'Toutes les remettre'}
                </button>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {CRUDITES_LIST.map((crudite) => {
                  const isIncluded = !excludedCrudites.includes(crudite.id);
                  return (
                    <button
                      key={crudite.id}
                      type="button"
                      onClick={() => toggleCrudite(crudite.id)}
                      className={`p-2.5 rounded-xl border text-xs font-medium text-left transition-all flex items-center justify-between ${
                        isIncluded
                          ? 'border-emerald-600/40 bg-emerald-500/10 text-emerald-900 dark:text-emerald-300 font-semibold'
                          : 'border-red-300/40 bg-red-500/5 text-red-700 line-through opacity-70'
                      }`}
                    >
                      <span>{crudite.name}</span>
                      {isIncluded ? (
                        <Check className="w-3.5 h-3.5 text-emerald-600" />
                      ) : (
                        <span className="text-[10px] text-red-600 font-bold no-underline">SANS</span>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Suppléments Payants */}
          {isSandwich && (
            <div>
              <span className="text-xs font-bold uppercase tracking-wider block mb-2" style={{ color: 'var(--color-text-muted)' }}>
                Envie d'un extra ? (Optionnel)
              </span>
              <div className="space-y-2">
                {SUPPLEMENTS_LIST.map((supp) => {
                  const isChecked = selectedSupplements.some((s) => s.name === supp.name);
                  return (
                    <button
                      key={supp.id}
                      type="button"
                      onClick={() => toggleSupplement(supp)}
                      className={`w-full p-2.5 rounded-xl border text-xs font-medium flex items-center justify-between transition-all ${
                        isChecked
                          ? 'border-amber-600 bg-amber-500/10 font-bold'
                          : 'hover:border-black/20'
                      }`}
                      style={{ borderColor: isChecked ? 'var(--color-primary)' : 'var(--color-border)' }}
                    >
                      <div className="flex items-center gap-2">
                        <div
                          className={`w-4 h-4 rounded-md border flex items-center justify-center ${
                            isChecked ? 'bg-amber-600 border-amber-600 text-white' : ''
                          }`}
                        >
                          {isChecked && <Check className="w-3 h-3 text-white" />}
                        </div>
                        <span>{supp.name}</span>
                      </div>
                      <span className="font-bold text-amber-700">+{supp.price.toFixed(2)} €</span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Footer sticky avec quantité et bouton d'ajout */}
        <div className="p-4 border-t sticky bottom-0 z-10 flex items-center gap-3" style={{ borderColor: 'var(--color-border)', backgroundColor: 'var(--color-card)' }}>
          <div className="flex items-center border rounded-2xl p-1 shrink-0" style={{ borderColor: 'var(--color-border)' }}>
            <button
              type="button"
              onClick={() => setQuantity(Math.max(1, quantity - 1))}
              className="p-2 rounded-xl hover:bg-black/5 dark:hover:bg-white/10"
              disabled={quantity <= 1}
            >
              <Minus className="w-4 h-4" />
            </button>
            <span className="px-3 font-bold text-sm min-w-8 text-center">{quantity}</span>
            <button
              type="button"
              onClick={() => setQuantity(quantity + 1)}
              className="p-2 rounded-xl hover:bg-black/5 dark:hover:bg-white/10"
            >
              <Plus className="w-4 h-4" />
            </button>
          </div>

          <button
            type="button"
            onClick={handleAdd}
            className="flex-1 py-3.5 px-4 rounded-2xl text-white font-bold text-sm flex items-center justify-between shadow-lg transition-transform active:scale-[0.98]"
            style={{ backgroundColor: 'var(--color-primary)' }}
          >
            <span>Ajouter au panier</span>
            <span className="bg-black/20 px-2.5 py-1 rounded-xl text-xs">{totalPrice.toFixed(2)} €</span>
          </button>
        </div>
      </div>
    </div>
  );
};
