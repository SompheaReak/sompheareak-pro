export type Currency = 'USD' | 'KHR';
export type Language = 'en' | 'km';

export interface Category {
  id: string;
  name: string;
  kh: string;
  en: string;
  icon: string;
  grad: string;
  sort_order: number;
  description: string;
}

export type ToyRarity = 'Common' | 'Rare' | 'Super Rare' | 'Legendary' | 'Limited Edition';

export interface Product {
  id: string;
  code?: string; // Product Code / SKU (e.g. SPK-1001)
  name: string;
  nameKh: string;
  cat: string;
  price: number; // in USD
  discount: number; // percentage (e.g. 15 for 15% off)
  stock: number;
  pt: number; // Reward points earned
  image: string;
  images?: string[]; // Multiple photos for left/right carousel gallery
  bio: string;
  bioKh: string;
  rarity?: ToyRarity;
  rating?: number;
  reviewsCount?: number;
  featured?: boolean;
  isNew?: boolean;
  free_delivery?: boolean;
  ageRecommendation?: string;
  colorScheme?: string[];
  dimensions?: string;
}

export interface Charm {
  id: string;
  code?: string; // Very short unique charm code e.g. "C01", "GF1", "CAT"
  name: string;
  nameKh: string;
  category: 'emblem' | 'letter' | 'stone' | 'cute' | 'anime' | string;
  price: number;
  image: string;
  plateImage?: string;
  isPopular?: boolean;
  description?: string;
}

export interface CustomBraceletLink {
  slot: number;
  charmId: string | null;
  finish: 'silver' | 'gold' | 'rose' | 'black';
}

export interface CustomBraceletItem {
  id: string;
  styleId: string;
  finish: 'silver' | 'gold' | 'rose' | 'black';
  sizeLinks: number;
  charms: { slot: number; charm: Charm }[];
  packaging: 'basic' | 'premium';
  unitPrice: number;
  quantity: number;
  points: number;
}

export interface CartItem {
  id: string;
  product?: Product;
  customBracelet?: CustomBraceletItem;
  quantity: number;
  isCustom?: boolean;
}

export interface Voucher {
  code: string;
  discountPct: number;
  fixedDiscountUsd?: number;
  discountType: 'percentage' | 'fixed';
  pointsCost: number;
  minSpend: number;
  description: string;
  descriptionKh: string;
  badge?: string;
  colorGrad?: string;
}

export interface UserProfile {
  name: string;
  phone: string;
  telegramUsername: string;
  points: number;
  savedVouchers: string[];
}

export interface CustomerAccount {
  id: string;
  name: string;
  phone: string;
  telegramHandle: string;
  province?: string;
  address?: string;
  rememberMe?: boolean;
  createdAt: string;
}

export type OrderStatus = 'pending' | 'confirmed' | 'packaging' | 'shipped' | 'delivered' | 'cancelled' | 'rejected';

export interface CustomerOrder {
  id: string;
  orderRef: string;
  customerName: string;
  customerPhone: string;
  telegramHandle: string;
  province: string;
  address: string;
  notes?: string;
  paymentMethod: 'cod' | 'khqr' | 'wing';
  items: CartItem[];
  subtotalUsd: number;
  discountUsd: number;
  deliveryFeeUsd: number;
  totalUsd: number;
  totalKhr: number;
  pointsEarned: number;
  voucherCodeApplied?: string | null;
  status: OrderStatus;
  pointsAwarded?: boolean;
  stockDeducted?: boolean;
  createdAt: string;
}

export interface OrderNotification {
  id: string;
  orderRef: string;
  title: string;
  message: string;
  type: 'order_placed' | 'order_confirmed' | 'order_shipped' | 'order_delivered' | 'order_rejected' | 'system';
  read: boolean;
  createdAt: string;
}

export interface StorefrontConfig {
  announcementText: string;
  heroBadge: string;
  heroTitlePrefix: string;
  heroTitleHighlight: string;
  heroTitleSuffix: string;
  heroSubtitle: string;
  freeDeliveryThreshold: number;
}

export interface CategoryBox {
  id: string;
  title: string;
  titleKh?: string;
  subtitle?: string;
  image: string;
  actionType: "link" | "category";
  actionValue: string;
  span: "full" | "half";
  badge?: string;
  order: number;
  active: boolean;
}



