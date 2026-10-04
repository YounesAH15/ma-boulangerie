import React, { createContext, useContext, useState, useEffect } from 'react';
import type { Product, Order, RestaurantConfig, ThemeType, OrderItem, OrderStatus } from '../types';
import { INITIAL_CONFIG, PRODUCTS_LIST } from '../data/menuData';

interface StoreContextType {
  config: RestaurantConfig;
  updateConfig: (updater: Partial<RestaurantConfig>) => void;
  products: Product[];
  toggleProductStock: (productId: string) => void;
  addProduct: (product: Omit<Product, 'id'>) => void;
  updateProduct: (id: string, product: Partial<Product>) => void;
  deleteProduct: (id: string) => void;
  addCategory: (name: string, icon?: string) => void;
  deleteCategory: (id: string) => void;
  addCrudite: (name: string, defaultIncluded?: boolean) => void;
  deleteCrudite: (id: string) => void;
  toggleCruditeDefault: (id: string) => void;
  addSauce: (name: string) => void;
  deleteSauce: (id: string) => void;
  addSupplement: (name: string, price: number) => void;
  deleteSupplement: (id: string) => void;
  orders: Order[];
  currentClientOrder: Order | null;
  setCurrentClientOrder: (order: Order | null) => void;
  createOrder: (clientName: string, clientPhoneOrItems: string | OrderItem[], maybeItems?: OrderItem[]) => Order;
  updateOrderStatus: (orderId: string, status: OrderStatus) => void;
  resetDailySales: () => void;
  simulateRushOrders: () => void;
  cart: OrderItem[];
  addToCart: (item: OrderItem) => void;
  removeFromCart: (index: number) => void;
  clearCart: () => void;
  activeTheme: ThemeType;
  setTheme: (theme: ThemeType) => void;
}

const StoreContext = createContext<StoreContextType | null>(null);

const STORAGE_KEYS = {
  CONFIG: 'ma_boulangerie_config_v2',
  PRODUCTS: 'ma_boulangerie_products_v2',
  ORDERS: 'ma_boulangerie_orders_v2',
  CLIENT_ORDER_ID: 'ma_boulangerie_client_order_id_v2',
};

const broadcastChannel = typeof window !== 'undefined' && 'BroadcastChannel' in window 
  ? new BroadcastChannel('ma_boulangerie_sync_channel') 
  : null;

export const StoreProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Config with automatic schema migration and fallback
  const [config, setConfig] = useState<RestaurantConfig>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.CONFIG) || localStorage.getItem('ma_boulangerie_config_v1');
      if (!saved) return INITIAL_CONFIG;
      const parsed = JSON.parse(saved);
      return {
        ...INITIAL_CONFIG,
        ...parsed,
        managerPin: parsed.managerPin === '1234' || !parsed.managerPin ? '1996' : parsed.managerPin,
        storeAddress: parsed.storeAddress || INITIAL_CONFIG.storeAddress,
        storeLat: parsed.storeLat || INITIAL_CONFIG.storeLat,
        storeLng: parsed.storeLng || INITIAL_CONFIG.storeLng,
        maxDistanceKm: parsed.maxDistanceKm ?? INITIAL_CONFIG.maxDistanceKm,
        geoRestrictionEnabled: parsed.geoRestrictionEnabled ?? INITIAL_CONFIG.geoRestrictionEnabled,
        categories: parsed.categories && parsed.categories.length > 0 ? parsed.categories : INITIAL_CONFIG.categories,
        crudites: parsed.crudites && parsed.crudites.length > 0 ? parsed.crudites : INITIAL_CONFIG.crudites,
        sauces: parsed.sauces && parsed.sauces.length > 0 ? parsed.sauces : INITIAL_CONFIG.sauces,
        supplements: parsed.supplements && parsed.supplements.length > 0 ? parsed.supplements : INITIAL_CONFIG.supplements,
      };
    } catch {
      return INITIAL_CONFIG;
    }
  });

  // Products with Stock
  const [products, setProducts] = useState<Product[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.PRODUCTS) || localStorage.getItem('ma_boulangerie_products_v1');
      return saved ? JSON.parse(saved) : PRODUCTS_LIST;
    } catch {
      return PRODUCTS_LIST;
    }
  });

  // Orders
  const [orders, setOrders] = useState<Order[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.ORDERS) || localStorage.getItem('ma_boulangerie_orders_v1');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  // Cart
  const [cart, setCart] = useState<OrderItem[]>([]);

  // Current client order ID
  const [clientOrderId, setClientOrderId] = useState<string | null>(() => {
    return localStorage.getItem(STORAGE_KEYS.CLIENT_ORDER_ID) || localStorage.getItem('ma_boulangerie_client_order_id_v1');
  });

  // Theme
  const [activeTheme, setActiveThemeState] = useState<ThemeType>(config.activeTheme || 'artisan');

  // Apply theme to DOM
  const setTheme = (newTheme: ThemeType) => {
    setActiveThemeState(newTheme);
    document.documentElement.setAttribute('data-theme', newTheme);
    updateConfig({ activeTheme: newTheme });
  };

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', activeTheme);
  }, [activeTheme]);

  // Sync to localStorage
  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.CONFIG, JSON.stringify(config));
  }, [config]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.PRODUCTS, JSON.stringify(products));
  }, [products]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.ORDERS, JSON.stringify(orders));
  }, [orders]);

  useEffect(() => {
    if (clientOrderId) {
      localStorage.setItem(STORAGE_KEYS.CLIENT_ORDER_ID, clientOrderId);
    } else {
      localStorage.removeItem(STORAGE_KEYS.CLIENT_ORDER_ID);
    }
  }, [clientOrderId]);

  // Broadcast channel listener for real-time multi-tab sync
  useEffect(() => {
    if (!broadcastChannel) return;

    const handleMessage = (event: MessageEvent) => {
      const { type, payload } = event.data || {};
      if (type === 'SYNC_ORDERS') {
        setOrders(payload);
      } else if (type === 'SYNC_CONFIG') {
        setConfig(payload);
        if (payload.activeTheme) {
          setActiveThemeState(payload.activeTheme);
          document.documentElement.setAttribute('data-theme', payload.activeTheme);
        }
      } else if (type === 'SYNC_PRODUCTS') {
        setProducts(payload);
      }
    };

    broadcastChannel.addEventListener('message', handleMessage);
    return () => {
      broadcastChannel.removeEventListener('message', handleMessage);
    };
  }, []);

  const updateConfig = (updater: Partial<RestaurantConfig>) => {
    setConfig((prev) => {
      const next = { ...prev, ...updater };
      broadcastChannel?.postMessage({ type: 'SYNC_CONFIG', payload: next });
      return next;
    });
  };

  const toggleProductStock = (productId: string) => {
    setProducts((prev) => {
      const next = prev.map((p) => (p.id === productId ? { ...p, inStock: !p.inStock } : p));
      broadcastChannel?.postMessage({ type: 'SYNC_PRODUCTS', payload: next });
      return next;
    });
  };

  const addProduct = (prod: Omit<Product, 'id'>) => {
    const newProduct: Product = {
      ...prod,
      id: `prod_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
    };
    setProducts((prev) => {
      const next = [newProduct, ...prev];
      broadcastChannel?.postMessage({ type: 'SYNC_PRODUCTS', payload: next });
      return next;
    });
  };

  const updateProduct = (id: string, partial: Partial<Product>) => {
    setProducts((prev) => {
      const next = prev.map((p) => (p.id === id ? { ...p, ...partial } : p));
      broadcastChannel?.postMessage({ type: 'SYNC_PRODUCTS', payload: next });
      return next;
    });
  };

  const deleteProduct = (id: string) => {
    setProducts((prev) => {
      const next = prev.filter((p) => p.id !== id);
      broadcastChannel?.postMessage({ type: 'SYNC_PRODUCTS', payload: next });
      return next;
    });
  };

  const addCategory = (name: string, icon = '🏷️') => {
    const trimmed = name.trim();
    if (!trimmed) return;
    const id = trimmed.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9]/g, '_');
    const existing = config.categories || [];
    if (existing.some((c) => c.id === id)) return;
    updateConfig({
      categories: [...existing, { id, name: trimmed, icon }]
    });
  };

  const deleteCategory = (id: string) => {
    updateConfig({
      categories: (config.categories || []).filter((c) => c.id !== id)
    });
  };

  const addCrudite = (name: string, defaultIncluded = true) => {
    const trimmed = name.trim();
    if (!trimmed) return;
    const id = `crud_${Date.now()}`;
    updateConfig({
      crudites: [...(config.crudites || []), { id, name: trimmed, defaultIncluded }]
    });
  };

  const deleteCrudite = (id: string) => {
    updateConfig({
      crudites: (config.crudites || []).filter((c) => c.id !== id)
    });
  };

  const toggleCruditeDefault = (id: string) => {
    updateConfig({
      crudites: (config.crudites || []).map((c) => c.id === id ? { ...c, defaultIncluded: !c.defaultIncluded } : c)
    });
  };

  const addSauce = (name: string) => {
    const trimmed = name.trim();
    if (!trimmed) return;
    const id = `sauce_${Date.now()}`;
    updateConfig({
      sauces: [...(config.sauces || []), { id, name: trimmed }]
    });
  };

  const deleteSauce = (id: string) => {
    updateConfig({
      sauces: (config.sauces || []).filter((s) => s.id !== id)
    });
  };

  const addSupplement = (name: string, price: number) => {
    const trimmed = name.trim();
    if (!trimmed) return;
    const id = `supp_${Date.now()}`;
    updateConfig({
      supplements: [...(config.supplements || []), { id, name: trimmed, price: Number(price) || 0 }]
    });
  };

  const deleteSupplement = (id: string) => {
    updateConfig({
      supplements: (config.supplements || []).filter((s) => s.id !== id)
    });
  };

  const createOrder = (
    clientName: string,
    clientPhoneOrItems: string | OrderItem[],
    maybeItems?: OrderItem[]
  ): Order => {
    let clientPhone = '';
    let items: OrderItem[] = [];

    if (typeof clientPhoneOrItems === 'string') {
      clientPhone = clientPhoneOrItems;
      items = maybeItems || [];
    } else {
      items = clientPhoneOrItems;
    }

    const nextNum = (orders.length % 999) + 1;
    const formattedNum = `#${nextNum.toString().padStart(3, '0')}`;
    const totalAmount = items.reduce((sum, item) => sum + item.unitPrice * item.quantity, 0);

    const newOrder: Order = {
      id: `ord_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      orderNumber: formattedNum,
      clientName: clientName.trim() || 'Client',
      clientPhone: clientPhone.trim() || undefined,
      items,
      totalAmount,
      paymentMethod: 'counter',
      status: 'in_progress',
      createdAt: Date.now(),
    };

    const nextOrders = [newOrder, ...orders];
    setOrders(nextOrders);
    setClientOrderId(newOrder.id);
    setCart([]);
    broadcastChannel?.postMessage({ type: 'SYNC_ORDERS', payload: nextOrders });

    return newOrder;
  };

  const updateOrderStatus = (orderId: string, status: OrderStatus) => {
    setOrders((prev) => {
      const next = prev.map((ord) => {
        if (ord.id === orderId) {
          return {
            ...ord,
            status,
            completedAt: status === 'ready' || status === 'completed' ? Date.now() : ord.completedAt,
          };
        }
        return ord;
      });
      broadcastChannel?.postMessage({ type: 'SYNC_ORDERS', payload: next });
      return next;
    });
  };

  const resetDailySales = () => {
    setOrders([]);
    broadcastChannel?.postMessage({ type: 'SYNC_ORDERS', payload: [] });
  };

  const simulateRushOrders = () => {
    const rushMockOrders: Order[] = [
      {
        id: `ord_sim_1`,
        orderNumber: '#038',
        clientName: 'Younès',
        clientPhone: '06 12 34 56 78',
        items: [
          {
            id: 'item_1',
            productId: 'tenders',
            productName: 'Tenders Croustillants',
            formulaType: 'drink',
            selectedDrink: 'Coca-Cola Cherry 33cl',
            selectedSauces: ['Samouraï', 'Algérienne'],
            excludedCrudites: [],
            selectedSupplements: [],
            unitPrice: 5.00,
            quantity: 1,
          },
        ],
        totalAmount: 5.00,
        paymentMethod: 'counter',
        status: 'in_progress',
        createdAt: Date.now() - 14 * 60 * 1000,
      },
      {
        id: `ord_sim_2`,
        orderNumber: '#039',
        clientName: 'Karim',
        clientPhone: '06 98 76 54 32',
        items: [
          {
            id: 'item_2',
            productId: 'poulet_croque',
            productName: 'Poulet Croque',
            formulaType: 'full',
            selectedDrink: 'Oasis Tropical 33cl',
            selectedPastry: 'Tartelette aux Pommes',
            selectedSauces: ['Sauce Blanche'],
            excludedCrudites: ['Oignons Frits', 'Oignons Frais'],
            selectedSupplements: [],
            unitPrice: 7.00,
            quantity: 1,
          },
        ],
        totalAmount: 7.00,
        paymentMethod: 'counter',
        status: 'in_progress',
        createdAt: Date.now() - 12 * 60 * 1000,
      },
      {
        id: `ord_sim_3`,
        orderNumber: '#040',
        clientName: 'Sarah',
        clientPhone: '07 11 22 33 44',
        items: [
          {
            id: 'item_3',
            productId: 'thon',
            productName: 'Thon Mayonnaise',
            formulaType: 'single',
            selectedSauces: ['Mayonnaise'],
            excludedCrudites: ['Tomate'],
            selectedSupplements: [],
            unitPrice: 2.80,
            quantity: 1,
          },
        ],
        totalAmount: 2.80,
        paymentMethod: 'counter',
        status: 'in_progress',
        createdAt: Date.now() - 10 * 60 * 1000,
      },
      {
        id: `ord_sim_4`,
        orderNumber: '#041',
        clientName: 'Thomas',
        clientPhone: '06 55 44 33 22',
        items: [
          {
            id: 'item_4',
            productId: 'mexicanos',
            productName: 'Mexicanos',
            formulaType: 'maxi',
            selectedDrink: 'Sprite 33cl',
            selectedSauces: ['Andalouse'],
            excludedCrudites: [],
            selectedSupplements: [{ name: 'Supplément Fromage', price: 0.50 }],
            unitPrice: 6.80,
            quantity: 1,
          },
        ],
        totalAmount: 6.80,
        paymentMethod: 'counter',
        status: 'in_progress',
        createdAt: Date.now() - 9 * 60 * 1000,
      },
      {
        id: `ord_sim_5`,
        orderNumber: '#042',
        clientName: 'Léa',
        clientPhone: '06 88 99 00 11',
        items: [
          {
            id: 'item_5',
            productId: 'dinde_marine',
            productName: 'Dinde Mariné',
            formulaType: 'drink',
            selectedDrink: 'Eau Cristaline 50cl',
            selectedSauces: ['Sans sauce'],
            excludedCrudites: ['Oignons Frits', 'Olives'],
            selectedSupplements: [],
            unitPrice: 5.00,
            quantity: 1,
          },
        ],
        totalAmount: 5.00,
        paymentMethod: 'counter',
        status: 'in_progress',
        createdAt: Date.now() - 7 * 60 * 1000,
      },
      {
        id: `ord_sim_6`,
        orderNumber: '#043',
        clientName: 'Alexandre',
        clientPhone: '07 66 55 44 33',
        items: [
          {
            id: 'item_6',
            productId: 'kefta',
            productName: 'Kefta Épicé',
            formulaType: 'full',
            selectedDrink: 'Fanta Orange 33cl',
            selectedPastry: 'Éclair au Chocolat',
            selectedSauces: ['Sauce Blanche', 'Harissa'],
            excludedCrudites: [],
            selectedSupplements: [{ name: 'Supplément Fromage', price: 0.50 }],
            unitPrice: 7.50,
            quantity: 1,
          },
        ],
        totalAmount: 7.50,
        paymentMethod: 'counter',
        status: 'in_progress',
        createdAt: Date.now() - 6 * 60 * 1000,
      },
      {
        id: `ord_sim_7`,
        orderNumber: '#044',
        clientName: 'Sofia',
        clientPhone: '06 22 33 44 55',
        items: [
          {
            id: 'item_7',
            productId: 'crudites_feta',
            productName: 'Crudités Féta',
            formulaType: 'drink',
            selectedDrink: 'Fuze Tea Pêche 33cl',
            selectedSauces: ['Sauce Blanche'],
            excludedCrudites: [],
            selectedSupplements: [],
            unitPrice: 3.80,
            quantity: 1,
          },
        ],
        totalAmount: 3.80,
        paymentMethod: 'counter',
        status: 'in_progress',
        createdAt: Date.now() - 5 * 60 * 1000,
      },
      {
        id: `ord_sim_8`,
        orderNumber: '#045',
        clientName: 'Mehdi',
        clientPhone: '06 77 88 99 00',
        items: [
          {
            id: 'item_8',
            productId: 'cordon_bleu',
            productName: 'Cordon Bleu',
            formulaType: 'single',
            selectedSauces: ['Algérienne', 'Samouraï'],
            excludedCrudites: [],
            selectedSupplements: [{ name: 'Supplément Fromage', price: 0.50 }],
            unitPrice: 4.50,
            quantity: 1,
          },
        ],
        totalAmount: 4.50,
        paymentMethod: 'counter',
        status: 'in_progress',
        createdAt: Date.now() - 4 * 60 * 1000,
      },
      {
        id: `ord_sim_9`,
        orderNumber: '#046',
        clientName: 'Chloé',
        clientPhone: '07 99 88 77 66',
        items: [
          {
            id: 'item_9',
            productId: 'poulet_roti',
            productName: 'Poulet Rôti',
            formulaType: 'full',
            selectedDrink: 'Coca-Cola Zéro 33cl',
            selectedPastry: 'Flan Pâtissier',
            selectedSauces: ['Mayonnaise'],
            excludedCrudites: ['Olives'],
            selectedSupplements: [],
            unitPrice: 5.80,
            quantity: 1,
          },
        ],
        totalAmount: 5.80,
        paymentMethod: 'counter',
        status: 'in_progress',
        createdAt: Date.now() - 3 * 60 * 1000,
      },
      {
        id: `ord_sim_10`,
        orderNumber: '#047',
        clientName: 'Julien',
        clientPhone: '06 44 33 22 11',
        items: [
          {
            id: 'item_10',
            productId: 'fricadelle',
            productName: 'Fricadelles',
            formulaType: 'drink',
            selectedDrink: 'Tropico 33cl',
            selectedSauces: ['Américaine', 'Ketchup'],
            excludedCrudites: [],
            selectedSupplements: [],
            unitPrice: 5.00,
            quantity: 1,
          },
        ],
        totalAmount: 5.00,
        paymentMethod: 'counter',
        status: 'in_progress',
        createdAt: Date.now() - 2 * 60 * 1000,
      },
      {
        id: `ord_sim_11`,
        orderNumber: '#048',
        clientName: 'Emma',
        clientPhone: '07 22 11 00 99',
        items: [
          {
            id: 'item_11',
            productId: 'fromage',
            productName: 'Fromage Emmental',
            formulaType: 'single',
            selectedSauces: ['Sans sauce'],
            excludedCrudites: ['Oignons Frits', 'Oignons Frais', 'Olives'],
            selectedSupplements: [],
            unitPrice: 2.80,
            quantity: 1,
          },
        ],
        totalAmount: 2.80,
        paymentMethod: 'counter',
        status: 'in_progress',
        createdAt: Date.now() - 1 * 60 * 1000,
      },
      {
        id: `ord_sim_12`,
        orderNumber: '#049',
        clientName: 'Lucas',
        clientPhone: '06 33 22 11 00',
        items: [
          {
            id: 'item_12',
            productId: 'nuggets',
            productName: 'Nuggets Poulet',
            formulaType: 'drink',
            selectedDrink: 'Coca-Cola Original 33cl',
            selectedSauces: ['Barbecue', 'Mayonnaise'],
            excludedCrudites: [],
            selectedSupplements: [],
            unitPrice: 5.00,
            quantity: 1,
          },
        ],
        totalAmount: 5.00,
        paymentMethod: 'counter',
        status: 'in_progress',
        createdAt: Date.now(),
      },
    ];

    setOrders((prev) => {
      const next = [...rushMockOrders, ...prev];
      broadcastChannel?.postMessage({ type: 'SYNC_ORDERS', payload: next });
      return next;
    });
  };

  const addToCart = (item: OrderItem) => {
    setCart((prev) => [...prev, item]);
  };

  const removeFromCart = (index: number) => {
    setCart((prev) => prev.filter((_, i) => i !== index));
  };

  const clearCart = () => {
    setCart([]);
  };

  const currentClientOrder = orders.find((o) => o.id === clientOrderId) || null;

  return (
    <StoreContext.Provider
      value={{
        config,
        updateConfig,
        products,
        toggleProductStock,
        addProduct,
        updateProduct,
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
        orders,
        currentClientOrder,
        setCurrentClientOrder: (o) => setClientOrderId(o ? o.id : null),
        createOrder,
        updateOrderStatus,
        resetDailySales,
        simulateRushOrders,
        cart,
        addToCart,
        removeFromCart,
        clearCart,
        activeTheme,
        setTheme,
      }}
    >
      {children}
    </StoreContext.Provider>
  );
};

export const useStore = () => {
  const ctx = useContext(StoreContext);
  if (!ctx) throw new Error('useStore must be used within StoreProvider');
  return ctx;
};
