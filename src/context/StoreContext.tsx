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
