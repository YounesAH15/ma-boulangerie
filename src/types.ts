export type CategoryType = string;

export type ThemeType = 'artisan' | 'bistro' | 'nature' | 'express';

export type OrderStatus = 'in_progress' | 'ready' | 'completed' | 'cancelled';

export type PaymentMethod = 'counter';

export interface CategoryItem {
  id: string;
  name: string;
  icon?: string;
}

export interface Crudite {
  id: string;
  name: string;
  defaultIncluded: boolean;
}

export interface Sauce {
  id: string;
  name: string;
}

export interface Supplement {
  id: string;
  name: string;
  price: number;
}

export interface Product {
  id: string;
  name: string;
  description: string;
  category: string;
  priceSingle: number;
  priceDrink?: number; // Formule avec boisson 33cl
  priceFull?: number;  // Formule complète (+ boisson + pâtisserie)
  priceMaxi?: number;  // Version Maxi
  inStock: boolean;
  image?: string;
  isPopular?: boolean;
}

export interface OrderItem {
  id: string;
  productId: string;
  productName: string;
  formulaType: 'single' | 'drink' | 'full' | 'maxi';
  selectedDrink?: string;
  selectedPastry?: string;
  selectedSauces: string[];
  excludedCrudites: string[];
  selectedSupplements: { name: string; price: number }[];
  unitPrice: number;
  quantity: number;
}

export interface Order {
  id: string;
  orderNumber: string; // Ex: "#042"
  clientName: string;
  clientPhone?: string; // Téléphone du client pour appel cuisine si besoin
  items: OrderItem[];
  totalAmount: number;
  paymentMethod: PaymentMethod;
  status: OrderStatus;
  createdAt: number;
  completedAt?: number;
}

export interface RestaurantConfig {
  name: string;
  subtitle: string;
  phone: string;
  storeAddress: string;
  storeLat: number;
  storeLng: number;
  maxDistanceKm: number; // Rayon max de commande (défaut : 8 km = ~15 min)
  geoRestrictionEnabled: boolean; // Activation/Désactivation de la restriction géographique
  rushEstimatedMinutes: number;
  isRushPaused: boolean;
  activeTheme: ThemeType;
  announcementText: string;
  halalCertified: boolean;
  managerPin: string; // Code PIN de direction (défaut : '1996')
  categories: CategoryItem[];
  crudites: Crudite[];
  sauces: Sauce[];
  supplements: Supplement[];
}
