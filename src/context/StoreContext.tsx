import React, { createContext, useContext, useState, useEffect } from 'react';
import type { Product, Order, RestaurantConfig, ThemeType, OrderItem, OrderStatus } from '../types';
import { INITIAL_CONFIG, PRODUCTS_LIST } from '../data/menuData';

interface StoreContextType {
  config: RestaurantConfig;
  updateConfig: (updater: Partial<RestaurantConfig>) => void;
  products: Product[];
  toggleProductStock: (productId: string) => void;
  orders: Order[];
  currentClientOrder: Order | null;
  setCurrentClientOrder: (order: Order | null) => void;
  createOrder: (clientName: string, items: OrderItem[]) => Order;
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
  CONFIG: 'ma_boulangerie_config_v1',
  PRODUCTS: 'ma_boulangerie_products_v1',
  ORDERS: 'ma_boulangerie_orders_v1',
  CLIENT_ORDER_ID: 'ma_boulangerie_client_order_id_v1',
};

const broadcastChannel = typeof window !== 'undefined' && 'BroadcastChannel' in window 
  ? new BroadcastChannel('ma_boulangerie_sync_channel') 
  : null;

export const StoreProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Config
  const [config, setConfig] = useState<RestaurantConfig>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.CONFIG);
      return saved ? JSON.parse(saved) : INITIAL_CONFIG;
    } catch {
      return INITIAL_CONFIG;
    }
  });

  // Products with Stock
  const [products, setProducts] = useState<Product[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.PRODUCTS);
      return saved ? JSON.parse(saved) : PRODUCTS_LIST;
    } catch {
      return PRODUCTS_LIST;
    }
  });

  // Orders
  const [orders, setOrders] = useState<Order[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.ORDERS);
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  // Cart
  const [cart, setCart] = useState<OrderItem[]>([]);

  // Current client order ID
  const [clientOrderId, setClientOrderId] = useState<string | null>(() => {
    return localStorage.getItem(STORAGE_KEYS.CLIENT_ORDER_ID);
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

  const createOrder = (clientName: string, items: OrderItem[]): Order => {
    // Generate order number #001 to #999 based on day's sequence
    const nextNum = (orders.length % 999) + 1;
    const formattedNum = `#${nextNum.toString().padStart(3, '0')}`;

    const totalAmount = items.reduce((sum, item) => sum + item.unitPrice * item.quantity, 0);

    const newOrder: Order = {
      id: `ord_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      orderNumber: formattedNum,
      clientName: clientName.trim() || 'Client',
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
        clientName: 'Younès (Favori midi)',
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
