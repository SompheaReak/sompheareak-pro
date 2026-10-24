"use client";

import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import {
  CartItem,
  Currency,
  Language,
  Product,
  CustomBraceletItem,
  Voucher,
  CustomerOrder,
  OrderStatus,
  OrderNotification,
  StorefrontConfig,
  CustomerAccount,
  Charm,
  CategoryBox,
  Category,
} from "@/types/store";
import { TRANSLATIONS } from "@/data/translations";
import { AVAILABLE_VOUCHERS } from "@/data/vouchers";
import { PRODUCTS } from "@/data/products";
import { CHARMS, ensureUniqueCharmCodes, generateUniqueCharmCode } from "@/data/charms";
import { DEFAULT_CATEGORY_BOXES } from "@/data/categoryBoxes";
import { CATEGORIES } from "@/data/categories";
import { sounds } from "@/utils/audio";
import confetti from "canvas-confetti";
import { neonGetKey, neonSetKey } from "@/lib/neonClient";

interface StoreContextType {
  currency: Currency;
  setCurrency: (c: Currency) => void;
  toggleCurrency: () => void;
  language: Language;
  setLanguage: (l: Language) => void;
  toggleLanguage: () => void;
  themeMode: "dark" | "light";
  toggleTheme: () => void;
  soundEnabled: boolean;
  toggleSound: () => void;

  cart: CartItem[];
  addToCart: (product: Product, quantity?: number) => void;
  addCustomBraceletToCart: (bracelet: CustomBraceletItem) => void;
  removeFromCart: (itemId: string) => void;
  updateQuantity: (itemId: string, delta: number) => void;
  clearCart: () => void;
  cartCount: number;

  cartDrawerOpen: boolean;
  setCartDrawerOpen: (open: boolean) => void;

  quickViewProduct: Product | null;
  setQuickViewProduct: (p: Product | null) => void;

  viewer3DProduct: Product | null;
  setViewer3DProduct: (p: Product | null) => void;

  rewardsModalOpen: boolean;
  setRewardsModalOpen: (open: boolean) => void;

  checkoutModalOpen: boolean;
  setCheckoutModalOpen: (open: boolean) => void;

  selectedCategory: string;
  setSelectedCategory: (cat: string) => void;

  searchQuery: string;
  setSearchQuery: (q: string) => void;

  sortBy: string;
  setSortBy: (s: string) => void;

  userPoints: number;
  addPoints: (pt: number) => void;
  redeemVoucherPoints: () => boolean;
  exchangePointsForVoucher: (voucher: Voucher) => boolean;
  claimedVouchers: string[];
  activeVoucher: Voucher | null;
  applyVoucherCode: (code: string) => boolean;
  removeVoucher: () => void;

  products: Product[];
  addProduct: (product: Omit<Product, "id">) => Product;
  updateProduct: (id: string, updates: Partial<Product>) => void;
  deleteProduct: (id: string) => void;
  resetProducts: () => void;
  wipeAllProducts: () => void;

  // Italy Modular Charms Management
  charms: Charm[];
  addCharm: (charm: Omit<Charm, "id">) => Charm;
  updateCharm: (id: string, updates: Partial<Charm>) => void;
  deleteCharm: (id: string) => void;
  resetCharms: () => void;
  clearCharms: () => void;

  orders: CustomerOrder[];
  saveOrder: (order: CustomerOrder) => void;
  updateOrderStatus: (orderId: string, status: OrderStatus) => void;
  updateOrder: (orderId: string, updates: Partial<CustomerOrder>) => void;
  deleteOrder: (orderId: string) => void;

  vouchers: Voucher[];
  addVoucher: (voucher: Voucher) => void;
  deleteVoucher: (code: string) => void;

  // Category Bento Boxes Management
  categoryBoxes: CategoryBox[];
  addCategoryBox: (box: Omit<CategoryBox, "id">) => CategoryBox;
  updateCategoryBox: (id: string, updates: Partial<CategoryBox>) => void;
  deleteCategoryBox: (id: string) => void;
  resetCategoryBoxes: () => void;
  reorderCategoryBoxes: (boxes: CategoryBox[]) => void;

  // Product Filter Categories
  categories: Category[];
  addCategory: (cat: Omit<Category, "id"> & { id?: string }) => Category;
  updateCategory: (id: string, updates: Partial<Category>) => void;
  deleteCategory: (id: string) => void;
  resetCategories: () => void;

  // Real-Time Testing Notifications
  notifications: OrderNotification[];
  unreadNotificationCount: number;
  markNotificationRead: (id: string) => void;
  clearNotifications: () => void;
  latestNotificationToast: OrderNotification | null;
  dismissNotificationToast: () => void;

  // Direct Live Storefront Editing
  isAdminLoggedIn: boolean;
  setIsAdminLoggedIn: (val: boolean) => void;
  isLiveEditMode: boolean;
  setLiveEditMode: (val: boolean) => void;
  storefrontConfig: StorefrontConfig;
  updateStorefrontConfig: (updates: Partial<StorefrontConfig>) => void;
  editingDirectProduct: Product | null;
  setEditingDirectProduct: (p: Product | null) => void;
  copyModalOpen: boolean;
  setCopyModalOpen: (val: boolean) => void;

  // Customer Account & Remember User System
  customerUser: CustomerAccount | null;
  isCustomerLoggedIn: boolean;
  loginCustomer: (data: Omit<CustomerAccount, "id" | "createdAt"> & { rememberMe?: boolean }) => void;
  logoutCustomer: () => void;
  updateCustomerProfile: (data: Partial<CustomerAccount>) => void;

  // History & Receipt Modals
  accountModalOpen: boolean;
  setAccountModalOpen: (open: boolean) => void;
  orderHistoryModalOpen: boolean;
  setOrderHistoryModalOpen: (open: boolean) => void;
  selectedReceiptOrder: CustomerOrder | null;
  setSelectedReceiptOrder: (order: CustomerOrder | null) => void;

  t: (key: keyof typeof TRANSLATIONS.en, params?: Record<string, string | number>) => string;
}

const DEFAULT_STOREFRONT_CONFIG: StorefrontConfig = {
  announcementText: "🚀 VIRAL TOY DROP: FLASH SALE UP TO 30% OFF · FREE PHNOM PENH DELIVERY OVER $25! 🇰🇭",
  heroBadge: "🔥 TOP DROPS OF 2026",
  heroTitlePrefix: "THE ULTIMATE",
  heroTitleHighlight: "TOY & CHARM",
  heroTitleSuffix: "UNIVERSE",
  heroSubtitle: "Explore viral minifigures, anti-gravity RC racers, surprise blind boxes, and genuine Italian modular stainless steel charm bracelets.",
  freeDeliveryThreshold: 25.0,
};

const INITIAL_DEMO_ORDERS: CustomerOrder[] = [];

const INITIAL_NOTIFICATIONS: OrderNotification[] = [];

// Compact cart items before writing to localStorage to prevent massive duplicate base64 images
export const compactCartForStorage = (cartItems: CartItem[]): CartItem[] => {
  if (!Array.isArray(cartItems)) return [];
  const seenCharmImages = new Set<string>();

  return cartItems.map((item) => {
    if (!item.customBracelet?.charms) return item;

    return {
      ...item,
      customBracelet: {
        ...item.customBracelet,
        charms: item.customBracelet.charms.map((slotItem) => {
          const c = slotItem.charm;
          if (!c) return slotItem;

          // If the charm has a heavy inline base64 data URL (>256 chars)
          const isLargeDataUrl = typeof c.image === "string" && c.image.startsWith("data:") && c.image.length > 256;

          if (isLargeDataUrl) {
            if (!seenCharmImages.has(c.id)) {
              seenCharmImages.add(c.id);
              // Keep first occurrence so custom uploaded charm is preserved
              return { slot: slotItem.slot, charm: { ...c, plateImage: undefined } };
            } else {
              // Reference the charm ID instead of duplicating the huge base64 string 16 times
              return { slot: slotItem.slot, charm: { ...c, image: `ref:${c.id}`, plateImage: undefined } };
            }
          }

          return { slot: slotItem.slot, charm: { ...c, plateImage: undefined } };
        }),
      },
    };
  });
};

// Hydrate cart items read from localStorage, resolving ref: charm images
export const hydrateCartFromStorage = (cartItems: CartItem[], allCharms: Charm[]): CartItem[] => {
  if (!Array.isArray(cartItems)) return [];
  const charmMap = new Map<string, Charm>();
  allCharms.forEach((c) => charmMap.set(c.id, c));

  // Collect unique inline images from the cart itself
  cartItems.forEach((it) => {
    if (it.customBracelet?.charms) {
      it.customBracelet.charms.forEach((slotItem) => {
        if (slotItem.charm?.image && !slotItem.charm.image.startsWith("ref:")) {
          charmMap.set(slotItem.charm.id, slotItem.charm);
        }
      });
    }
  });

  return cartItems.map((item) => {
    if (!item.customBracelet?.charms) return item;
    return {
      ...item,
      customBracelet: {
        ...item.customBracelet,
        charms: item.customBracelet.charms.map((slotItem) => {
          if (slotItem.charm?.image?.startsWith("ref:")) {
            const resolved = charmMap.get(slotItem.charm.id);
            if (resolved) {
              return {
                ...slotItem,
                charm: { ...slotItem.charm, image: resolved.image },
              };
            }
          }
          return slotItem;
        }),
      },
    };
  });
};

// Compact orders before writing to localStorage
export const compactOrdersForStorage = (orders: CustomerOrder[]): CustomerOrder[] => {
  if (!Array.isArray(orders)) return [];
  return orders.map((o) => ({
    ...o,
    items: compactCartForStorage(o.items || []),
  }));
};

// Hydrate orders read from localStorage
export const hydrateOrdersFromStorage = (orders: CustomerOrder[], allCharms: Charm[]): CustomerOrder[] => {
  if (!Array.isArray(orders)) return [];
  return orders.map((o) => ({
    ...o,
    items: hydrateCartFromStorage(o.items || [], allCharms),
  }));
};

// Safe localStorage helper to prevent QuotaExceededError from crashing the app
export const safeSetItem = (key: string, value: string): boolean => {
  if (typeof window === "undefined") return false;
  try {
    localStorage.setItem(key, value);
    return true;
  } catch (err) {
    console.warn(`[Storage] Failed writing key "${key}" to localStorage:`, err);
    try {
      if (key === "somphea_orders") {
        const parsed = JSON.parse(value);
        if (Array.isArray(parsed)) {
          const compacted = compactOrdersForStorage(parsed.slice(0, 5));
          localStorage.setItem(key, JSON.stringify(compacted));
          return true;
        }
      }
      if (key === "somphea_cart") {
        const parsed = JSON.parse(value);
        const compacted = compactCartForStorage(parsed);
        localStorage.setItem(key, JSON.stringify(compacted));
        return true;
      }
    } catch {
      console.warn(`[Storage] Operating in memory-only mode for "${key}".`);
    }
    return false;
  }
};

const StoreContext = createContext<StoreContextType | undefined>(undefined);

const ADMIN_API_BASE =
  process.env.NEXT_PUBLIC_ADMIN_URL || "https://sompheareak-admin.onrender.com";

// Resilient API fetcher: tries local API route first, then falls back to Admin API web service
async function apiFetch(endpoint: string, options?: RequestInit) {
  try {
    const res = await fetch(endpoint, {
      ...options,
      cache: "no-store",
    });
    const contentType = res.headers.get("content-type") || "";
    if (res.ok && contentType.includes("application/json")) {
      return await res.json();
    }
  } catch (err) {}

  if (ADMIN_API_BASE) {
    try {
      const fallbackUrl = `${ADMIN_API_BASE.replace(/\/$/, "")}${endpoint}`;
      const res = await fetch(fallbackUrl, {
        ...options,
        cache: "no-store",
      });
      if (res.ok) {
        return await res.json();
      }
    } catch (err) {
      console.warn("Fallback to admin API failed:", err);
    }
  }

  return null;
}

export const StoreProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currency, setCurrencyState] = useState<Currency>("USD");
  const [language, setLanguageState] = useState<Language>("en");
  const [themeMode, setThemeModeState] = useState<"dark" | "light">("dark");
  const [soundEnabled, setSoundEnabledState] = useState<boolean>(true);

  const [products, setProductsState] = useState<Product[]>(() => {
    if (typeof window !== "undefined") {
      try {
        const cached = localStorage.getItem("somphea_products");
        if (cached) return JSON.parse(cached);
      } catch {}
    }
    return [];
  });
  const [charms, setCharmsState] = useState<Charm[]>(() => {
    if (typeof window !== "undefined") {
      try {
        const cached = localStorage.getItem("somphea_charms");
        if (cached) return ensureUniqueCharmCodes(JSON.parse(cached));
      } catch {}
    }
    return [];
  });
  const [orders, setOrdersState] = useState<CustomerOrder[]>(INITIAL_DEMO_ORDERS);
  const [vouchers, setVouchersState] = useState<Voucher[]>(AVAILABLE_VOUCHERS);
  const [categoryBoxes, setCategoryBoxesState] = useState<CategoryBox[]>(DEFAULT_CATEGORY_BOXES);
  const [categories, setCategoriesState] = useState<Category[]>(CATEGORIES);

  const [cart, setCart] = useState<CartItem[]>([]);
  const [cartDrawerOpen, setCartDrawerOpen] = useState(false);
  const [quickViewProduct, setQuickViewProduct] = useState<Product | null>(null);
  const [viewer3DProduct, setViewer3DProduct] = useState<Product | null>(null);
  const [rewardsModalOpen, setRewardsModalOpen] = useState(false);
  const [checkoutModalOpen, setCheckoutModalOpen] = useState(false);

  const [selectedCategory, setSelectedCategory] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState("featured");

  const [userPoints, setUserPoints] = useState(25);
  const [activeVoucher, setActiveVoucher] = useState<Voucher | null>(null);
  const [claimedVouchers, setClaimedVouchers] = useState<string[]>([]);

  // Notifications State
  const [notifications, setNotifications] = useState<OrderNotification[]>(INITIAL_NOTIFICATIONS);
  const [latestNotificationToast, setLatestNotificationToast] = useState<OrderNotification | null>(null);

  // Live Storefront Direct Edit Mode
  const [isAdminLoggedIn, setIsAdminLoggedIn] = useState(false);
  const [isLiveEditMode, setLiveEditMode] = useState(false);
  const [storefrontConfig, setStorefrontConfig] = useState<StorefrontConfig>(DEFAULT_STOREFRONT_CONFIG);
  const [editingDirectProduct, setEditingDirectProduct] = useState<Product | null>(null);
  const [copyModalOpen, setCopyModalOpen] = useState(false);

  // Customer Account & Remember System
  const [customerUser, setCustomerUserState] = useState<CustomerAccount | null>(null);
  const [accountModalOpen, setAccountModalOpen] = useState(false);
  const [orderHistoryModalOpen, setOrderHistoryModalOpen] = useState(false);
  const [selectedReceiptOrder, setSelectedReceiptOrder] = useState<CustomerOrder | null>(null);

  // Load persisted settings and sync with testing backend DB
  useEffect(() => {
    try {
      const savedCurr = localStorage.getItem("somphea_currency") as Currency | null;
      if (savedCurr && (savedCurr === "USD" || savedCurr === "KHR")) setCurrencyState(savedCurr);

      const savedLang = localStorage.getItem("somphea_lang") as Language | null;
      if (savedLang && (savedLang === "en" || savedLang === "km")) setLanguageState(savedLang);

      const savedTheme = localStorage.getItem("somphea_theme") as "dark" | "light" | null;
      if (savedTheme) {
        setThemeModeState(savedTheme);
        if (savedTheme === "dark") {
          document.documentElement.classList.add("dark");
        } else {
          document.documentElement.classList.remove("dark");
        }
      } else {
        document.documentElement.classList.add("dark");
      }

      const savedSound = localStorage.getItem("somphea_sound");
      if (savedSound !== null) {
        const enabled = savedSound === "true";
        setSoundEnabledState(enabled);
        sounds.setEnabled(enabled);
      }

      const savedCart = localStorage.getItem("somphea_cart");
      if (savedCart) {
        try {
          const parsed = JSON.parse(savedCart);
          setCart(hydrateCartFromStorage(parsed, CHARMS));
        } catch {
          setCart([]);
        }
      }

      const savedPts = localStorage.getItem("somphea_points");
      if (savedPts) {
        setUserPoints(parseInt(savedPts, 10));
      }

      // Check admin status & query param
      if (typeof window !== "undefined") {
        const isAuth = sessionStorage.getItem("somphea_admin_auth") === "true";
        const params = new URLSearchParams(window.location.search);
        if (params.get("admin_mode") === "true") {
          sessionStorage.setItem("somphea_admin_auth", "true");
          setIsAdminLoggedIn(true);
          setLiveEditMode(true);
        } else if (isAuth) {
          setIsAdminLoggedIn(true);
        }

        // Hydrate remembered customer user
        const savedAccount = localStorage.getItem("somphea_customer_account");
        if (savedAccount) {
          try {
            setCustomerUserState(JSON.parse(savedAccount));
          } catch {}
        }

        // Direct real-time Neon PostgreSQL Database Synchronization
        const refreshFromNeon = () => {
          neonGetKey<Product[]>("products", []).then((prods) => {
            if (Array.isArray(prods)) {
              setProductsState(prods);
              safeSetItem("somphea_products", JSON.stringify(prods));
            }
          });

          neonGetKey<Charm[]>("charms", []).then((loadedCharms) => {
            if (Array.isArray(loadedCharms)) {
              const unique = ensureUniqueCharmCodes(loadedCharms);
              setCharmsState(unique);
              safeSetItem("somphea_charms", JSON.stringify(unique));
            }
          });

          neonGetKey<Category[]>("categories", CATEGORIES).then((cats) => {
            if (Array.isArray(cats) && cats.length > 0) {
              setCategoriesState(cats);
              safeSetItem("somphea_categories", JSON.stringify(cats));
            }
          });

          neonGetKey<CategoryBox[]>("categoryBoxes", DEFAULT_CATEGORY_BOXES).then((boxes) => {
            if (Array.isArray(boxes) && boxes.length > 0) {
              setCategoryBoxesState(boxes);
              safeSetItem("somphea_category_boxes", JSON.stringify(boxes));
            }
          });

          neonGetKey<StorefrontConfig>("storefrontConfig", DEFAULT_STOREFRONT_CONFIG).then((cfg) => {
            if (cfg) {
              setStorefrontConfig(cfg);
            }
          });

          neonGetKey<Voucher[]>("vouchers", AVAILABLE_VOUCHERS).then((loadedVouchers) => {
            if (Array.isArray(loadedVouchers)) {
              setVouchersState(loadedVouchers);
            }
          });

          neonGetKey<CustomerOrder[]>("orders", []).then((loadedOrders) => {
            if (Array.isArray(loadedOrders)) {
              const hydrated = hydrateOrdersFromStorage(loadedOrders, CHARMS);
              setOrdersState(hydrated);

              // Auto-credit points to customer account if their placed orders were confirmed by store
              if (typeof window !== "undefined") {
                try {
                  const myRefs: string[] = JSON.parse(localStorage.getItem("somphea_my_order_refs") || "[]");
                  const creditedRefs: string[] = JSON.parse(localStorage.getItem("somphea_credited_order_refs") || "[]");
                  let pointsToAdd = 0;
                  const newCredited = [...creditedRefs];

                  hydrated.forEach((ord) => {
                    const isMyOrder = myRefs.includes(ord.orderRef);
                    const isConfirmed = ["confirmed", "packaging", "shipped", "delivered"].includes(ord.status);
                    if (isMyOrder && isConfirmed && !creditedRefs.includes(ord.orderRef)) {
                      pointsToAdd += ord.pointsEarned || 0;
                      newCredited.push(ord.orderRef);
                    }
                  });

                  if (pointsToAdd > 0) {
                    setUserPoints((prev) => {
                      const next = prev + pointsToAdd;
                      safeSetItem("somphea_points", String(next));
                      return next;
                    });
                    safeSetItem("somphea_credited_order_refs", JSON.stringify(newCredited));
                    sounds.playFanfare();
                  }
                } catch {}
              }
            }
          });

          neonGetKey<OrderNotification[]>("notifications", []).then((loadedNotifs) => {
            if (Array.isArray(loadedNotifs)) {
              setNotifications(loadedNotifs);
            }
          });
        };

        // Initial sync from Neon DB
        refreshFromNeon();

        // Real-time synchronization: refresh on window focus and poll every 8 seconds
        window.addEventListener("focus", refreshFromNeon);
        const pollInterval = setInterval(refreshFromNeon, 8000);

        return () => {
          window.removeEventListener("focus", refreshFromNeon);
          clearInterval(pollInterval);
        };
      }
    } catch {
      // ignore SSR or storage exceptions
    }
  }, []);

  const setCurrency = useCallback((c: Currency) => {
    setCurrencyState(c);
    safeSetItem("somphea_currency", c);
  }, []);

  const toggleCurrency = useCallback(() => {
    setCurrencyState((prev) => {
      const next = prev === "USD" ? "KHR" : "USD";
      safeSetItem("somphea_currency", next);
      sounds.playPop();
      return next;
    });
  }, []);

  const setLanguage = useCallback((l: Language) => {
    setLanguageState(l);
    safeSetItem("somphea_lang", l);
  }, []);

  const toggleLanguage = useCallback(() => {
    setLanguageState((prev) => {
      const next = prev === "en" ? "km" : "en";
      safeSetItem("somphea_lang", next);
      sounds.playPop();
      return next;
    });
  }, []);

  const toggleTheme = useCallback(() => {
    setThemeModeState((prev) => {
      const next = prev === "dark" ? "light" : "dark";
      safeSetItem("somphea_theme", next);
      if (next === "dark") {
        document.documentElement.classList.add("dark");
      } else {
        document.documentElement.classList.remove("dark");
      }
      sounds.playPop();
      return next;
    });
  }, []);

  const toggleSound = useCallback(() => {
    setSoundEnabledState((prev) => {
      const next = !prev;
      sounds.setEnabled(next);
      safeSetItem("somphea_sound", String(next));
      if (next) sounds.playPop();
      return next;
    });
  }, []);

  // Cart operations
  const addToCart = useCallback((product: Product, quantity = 1) => {
    sounds.playCharmSnap();
    setCart((prev) => {
      const existing = prev.find((item) => item.product?.id === product.id);
      let updated: CartItem[];
      if (existing) {
        updated = prev.map((item) =>
          item.product?.id === product.id ? { ...item, quantity: item.quantity + quantity } : item
        );
      } else {
        updated = [...prev, { id: `cart-${product.id}-${Date.now()}`, product, quantity }];
      }
      safeSetItem("somphea_cart", JSON.stringify(compactCartForStorage(updated)));
      return updated;
    });
    setCartDrawerOpen(true);
  }, []);

  const addCustomBraceletToCart = useCallback((bracelet: CustomBraceletItem) => {
    sounds.playFanfare();
    confetti({
      particleCount: 80,
      spread: 70,
      origin: { y: 0.6 },
      colors: ["#10b981", "#fbbf24", "#6366f1", "#ec4899"],
    });

    const cartItem: CartItem = {
      id: `cart-bracelet-${Date.now()}`,
      customBracelet: bracelet,
      quantity: 1,
      isCustom: true,
    };

    setCart((prev) => {
      const updated = [...prev, cartItem];
      safeSetItem("somphea_cart", JSON.stringify(compactCartForStorage(updated)));
      return updated;
    });
    setCartDrawerOpen(true);
  }, []);

  const removeFromCart = useCallback((itemId: string) => {
    sounds.playPop();
    setCart((prev) => {
      const updated = prev.filter((item) => item.id !== itemId);
      safeSetItem("somphea_cart", JSON.stringify(compactCartForStorage(updated)));
      return updated;
    });
  }, []);

  const updateQuantity = useCallback((itemId: string, delta: number) => {
    sounds.playPop();
    setCart((prev) => {
      const updated = prev
        .map((item) => {
          if (item.id === itemId) {
            const newQ = item.quantity + delta;
            return newQ > 0 ? { ...item, quantity: newQ } : null;
          }
          return item;
        })
        .filter((item): item is CartItem => item !== null);
      safeSetItem("somphea_cart", JSON.stringify(compactCartForStorage(updated)));
      return updated;
    });
  }, []);

  const clearCart = useCallback(() => {
    setCart([]);
    localStorage.removeItem("somphea_cart");
  }, []);

  const cartCount = cart.reduce((total, item) => total + item.quantity, 0);

  // Points & Vouchers
  const addPoints = useCallback((pt: number) => {
    setUserPoints((prev) => {
      const next = prev + pt;
      safeSetItem("somphea_points", String(next));
      return next;
    });
  }, []);

  const redeemVoucherPoints = useCallback((): boolean => {
    if (userPoints >= 25) {
      sounds.playFanfare();
      setUserPoints((prev) => {
        const next = prev - 25;
        safeSetItem("somphea_points", String(next));
        return next;
      });
      const voucher: Voucher = {
        code: "VIP10OFF",
        discountPct: 10,
        discountType: "percentage",
        pointsCost: 25,
        minSpend: 0,
        description: "10% OFF VIP Reward Voucher",
        descriptionKh: "ប័ណ្ណបញ្ចុះតម្លៃ 10% សម្រាប់សមាជិក VIP",
      };
      setClaimedVouchers((prev) => Array.from(new Set([...prev, "VIP10OFF"])));
      setActiveVoucher(voucher);
      return true;
    }
    return false;
  }, [userPoints]);

  const exchangePointsForVoucher = useCallback((voucher: Voucher): boolean => {
    if (userPoints >= voucher.pointsCost) {
      sounds.playFanfare();
      confetti({
        particleCount: 65,
        spread: 80,
        origin: { y: 0.6 },
        colors: ["#f59e0b", "#ec4899", "#6366f1", "#10b981"],
      });
      setUserPoints((prev) => prev - voucher.pointsCost);
      setClaimedVouchers((prev) => Array.from(new Set([...prev, voucher.code])));
      setActiveVoucher(voucher);
      return true;
    }
    sounds.playPop();
    return false;
  }, [userPoints]);

  const applyVoucherCode = useCallback((code: string): boolean => {
    const clean = code.trim().toUpperCase();
    const matched = vouchers.find((v) => v.code === clean);
    if (matched) {
      sounds.playChime();
      setActiveVoucher(matched);
      return true;
    }
    if (clean === "WELCOME10" || clean === "KIDSTOY") {
      sounds.playChime();
      setActiveVoucher({
        code: clean,
        discountPct: 10,
        discountType: "percentage",
        pointsCost: 0,
        minSpend: 0,
        description: `10% OFF Voucher (${clean})`,
        descriptionKh: `ប័ណ្ណបញ្ចុះតម្លៃ 10% (${clean})`,
      });
      return true;
    } else if (clean === "SUPERKID20") {
      sounds.playChime();
      setActiveVoucher({
        code: clean,
        discountPct: 20,
        discountType: "percentage",
        pointsCost: 0,
        minSpend: 20,
        description: "20% OFF Super Kid Voucher (Orders > $20)",
        descriptionKh: "ប័ណ្ណបញ្ចុះតម្លៃ 20% (ការកុម្ម៉ង់លើសពី $20)",
      });
      return true;
    }
    return false;
  }, [vouchers]);

  const removeVoucher = useCallback(() => {
    sounds.playPop();
    setActiveVoucher(null);
  }, []);

  // Translation helper
  const t = useCallback(
    (key: keyof typeof TRANSLATIONS.en, params?: Record<string, string | number>): string => {
      const dict = TRANSLATIONS[language] || TRANSLATIONS.en;
      let text = (dict[key] || TRANSLATIONS.en[key] || key) as string;
      if (params) {
        Object.entries(params).forEach(([k, val]) => {
          text = text.replace(new RegExp(`\\{${k}\\}`, "g"), String(val));
        });
      }
      return text;
    },
    [language]
  );

  // Admin & Catalog Management with Testing Server DB Sync
  const addProduct = useCallback((newProd: Omit<Product, "id">): Product => {
    const id = `toy-${Date.now()}`;
    const product: Product = { ...newProd, id };

    setProductsState((prev) => {
      const filtered = prev.filter((p) => p.id !== id && (!p.code || p.code !== product.code));
      const updated = [product, ...filtered];
      safeSetItem("somphea_products", JSON.stringify(updated));
      neonSetKey("products", updated);
      return updated;
    });

    // Sync to testing backend server
    fetch("/api/products", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(product),
    }).catch(() => {});

    return product;
  }, []);

  const updateProduct = useCallback((id: string, updates: Partial<Product>) => {
    setProductsState((prev) => {
      const updated = prev.map((p) => (p.id === id ? { ...p, ...updates } : p));
      safeSetItem("somphea_products", JSON.stringify(updated));
      neonSetKey("products", updated);
      return updated;
    });

    // Sync to testing backend server
    fetch(`/api/products/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(updates),
    }).catch(() => {});
  }, []);

  const deleteProduct = useCallback((id: string) => {
    setProductsState((prev) => {
      const updated = prev.filter((p) => p.id !== id);
      safeSetItem("somphea_products", JSON.stringify(updated));
      neonSetKey("products", updated);
      return updated;
    });

    fetch(`/api/products/${id}`, { method: "DELETE" }).catch(() => {});
  }, []);

  const resetProducts = useCallback(() => {
    setProductsState(PRODUCTS);
    safeSetItem("somphea_products", JSON.stringify(PRODUCTS));
    neonSetKey("products", PRODUCTS);
    fetch("/api/products", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "reset" }),
    }).catch(() => {});
  }, []);

  const wipeAllProducts = useCallback(() => {
    setProductsState([]);
    if (typeof window !== "undefined") {
      try {
        localStorage.removeItem("somphea_products");
      } catch {}
    }
    neonSetKey("products", []);
    fetch("/api/products", {
      method: "DELETE",
    }).catch(() => {});
  }, []);

  // Italy Modular Charms Management Callbacks with guaranteed non-duplicating codes
  const addCharm = useCallback((newCharm: Omit<Charm, "id">): Charm => {
    const id = `charm-${Date.now()}`;
    const code = generateUniqueCharmCode(newCharm, charms);
    const charm: Charm = { ...newCharm, id, code };

    setCharmsState((prev) => {
      const updated = ensureUniqueCharmCodes([charm, ...prev]);
      safeSetItem("somphea_charms", JSON.stringify(updated));
      neonSetKey("charms", updated);
      return updated;
    });

    fetch("/api/charms", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(charm),
    }).catch(() => {});

    return charm;
  }, [charms]);

  const updateCharm = useCallback((id: string, updates: Partial<Charm>) => {
    setCharmsState((prev) => {
      const target = prev.find((c) => c.id === id);
      if (!target) return prev;
      let newCode = updates.code !== undefined ? updates.code : target.code;
      if (newCode) {
        newCode = generateUniqueCharmCode({ ...target, ...updates, id, code: newCode }, prev);
      }
      const updated = prev.map((c) =>
        c.id === id ? { ...c, ...updates, ...(newCode ? { code: newCode } : {}) } : c
      );
      const guaranteed = ensureUniqueCharmCodes(updated);
      safeSetItem("somphea_charms", JSON.stringify(guaranteed));
      neonSetKey("charms", guaranteed);
      return guaranteed;
    });

    fetch(`/api/charms/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(updates),
    }).catch(() => {});
  }, []);

  const deleteCharm = useCallback((id: string) => {
    setCharmsState((prev) => {
      const updated = prev.filter((c) => c.id !== id);
      safeSetItem("somphea_charms", JSON.stringify(updated));
      neonSetKey("charms", updated);
      return updated;
    });

    fetch(`/api/charms/${id}`, { method: "DELETE" }).catch(() => {});
  }, []);

  const resetCharms = useCallback(() => {
    const unique = ensureUniqueCharmCodes(CHARMS);
    setCharmsState(unique);
    safeSetItem("somphea_charms", JSON.stringify(unique));
    neonSetKey("charms", unique);
    fetch("/api/charms", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "reset" }),
    }).catch(() => {});
  }, []);

  const clearCharms = useCallback(() => {
    setCharmsState([]);
    safeSetItem("somphea_charms", JSON.stringify([]));
    neonSetKey("charms", []);
    fetch("/api/charms", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "clear" }),
    }).catch(() => {});
  }, []);

  // Customer Orders Management with Direct Neon DB Persistence
  const saveOrder = useCallback((order: CustomerOrder) => {
    setOrdersState((prev) => {
      const updated = [order, ...prev];
      safeSetItem("somphea_orders", JSON.stringify(compactOrdersForStorage(updated)));
      neonGetKey<CustomerOrder[]>("orders", []).then((current) => {
        const nextOrders = [order, ...(Array.isArray(current) ? current.filter((o) => o.id !== order.id) : [])];
        neonSetKey("orders", nextOrders);
      });
      return updated;
    });

    // Trigger confirmation notification immediately
    const notif: OrderNotification = {
      id: `notif-${Date.now()}`,
      orderRef: order.orderRef,
      title: `🎉 Order Confirmed: #${order.orderRef}`,
      message: `Thank you ${order.customerName}! Your order of $${order.totalUsd.toFixed(2)} (${order.paymentMethod.toUpperCase()}) is confirmed. Express dispatch underway.`,
      type: "order_confirmed",
      read: false,
      createdAt: new Date().toISOString(),
    };

    setNotifications((prev) => {
      const nextNotifs = [notif, ...prev];
      neonSetKey("notifications", nextNotifs);
      return nextNotifs;
    });
    setLatestNotificationToast(notif);

    // Sync to backend DB
    apiFetch("/api/orders", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(order),
    }).catch(() => {});
  }, []);

  const updateOrderStatus = useCallback((orderId: string, status: OrderStatus) => {
    let orderRef = "SR-ORDER";
    setOrdersState((prev) => {
      const targetOrder = prev.find((o) => o.id === orderId);
      if (!targetOrder) return prev;

      orderRef = targetOrder.orderRef;
      const willConfirm = status === "confirmed" || status === "packaging" || status === "shipped" || status === "delivered";
      const isReversal = status === "rejected" || status === "cancelled";

      let nextStockDeducted = targetOrder.stockDeducted;
      let nextPointsAwarded = targetOrder.pointsAwarded;

      // 1. DEDUCT STOCK ONLY WHEN ORDER IS CONFIRMED
      if (willConfirm && !targetOrder.stockDeducted) {
        setProductsState((currentProds) => {
          let changed = false;
          const nextProds = currentProds.map((prod) => {
            let totalQty = 0;
            targetOrder.items.forEach((it) => {
              if (it.product && it.product.id === prod.id) {
                totalQty += it.quantity;
              }
            });
            if (totalQty > 0) {
              changed = true;
              return {
                ...prod,
                stock: Math.max(0, (prod.stock || 0) - totalQty),
              };
            }
            return prod;
          });

          if (changed) {
            safeSetItem("somphea_products", JSON.stringify(nextProds));
            neonSetKey("products", nextProds);
          }
          return nextProds;
        });
        nextStockDeducted = true;
      } else if (isReversal && targetOrder.stockDeducted) {
        // Restore stock if previously confirmed order was cancelled/rejected
        setProductsState((currentProds) => {
          let changed = false;
          const nextProds = currentProds.map((prod) => {
            let totalQty = 0;
            targetOrder.items.forEach((it) => {
              if (it.product && it.product.id === prod.id) {
                totalQty += it.quantity;
              }
            });
            if (totalQty > 0) {
              changed = true;
              return {
                ...prod,
                stock: (prod.stock || 0) + totalQty,
              };
            }
            return prod;
          });

          if (changed) {
            safeSetItem("somphea_products", JSON.stringify(nextProds));
            neonSetKey("products", nextProds);
          }
          return nextProds;
        });
        nextStockDeducted = false;
      }

      // 2. AWARD VIP POINTS ONLY WHEN ORDER IS CONFIRMED
      if (willConfirm && !targetOrder.pointsAwarded && (targetOrder.pointsEarned || 0) > 0) {
        setUserPoints((curPts) => {
          const nextPts = curPts + targetOrder.pointsEarned;
          safeSetItem("somphea_points", String(nextPts));
          return nextPts;
        });
        if (typeof window !== "undefined") {
          try {
            const credited = JSON.parse(localStorage.getItem("somphea_credited_order_refs") || "[]");
            if (!credited.includes(targetOrder.orderRef)) {
              localStorage.setItem("somphea_credited_order_refs", JSON.stringify([...credited, targetOrder.orderRef]));
            }
          } catch {}
        }
        nextPointsAwarded = true;
      } else if (isReversal && targetOrder.pointsAwarded && (targetOrder.pointsEarned || 0) > 0) {
        setUserPoints((curPts) => {
          const nextPts = Math.max(0, curPts - targetOrder.pointsEarned);
          safeSetItem("somphea_points", String(nextPts));
          return nextPts;
        });
        if (typeof window !== "undefined") {
          try {
            const credited = JSON.parse(localStorage.getItem("somphea_credited_order_refs") || "[]");
            localStorage.setItem(
              "somphea_credited_order_refs",
              JSON.stringify(credited.filter((r: string) => r !== targetOrder.orderRef))
            );
          } catch {}
        }
        nextPointsAwarded = false;
      }

      const updated = prev.map((o) =>
        o.id === orderId
          ? { ...o, status, stockDeducted: nextStockDeducted, pointsAwarded: nextPointsAwarded }
          : o
      );
      const compacted = compactOrdersForStorage(updated);
      safeSetItem("somphea_orders", JSON.stringify(compacted));
      neonSetKey("orders", compacted);
      return updated;
    });

    // Dispatch status alert notification
    const notif: OrderNotification = {
      id: `notif-${Date.now()}`,
      orderRef,
      title:
        status === "rejected"
          ? `❌ Order #${orderRef} Rejected`
          : status === "confirmed"
          ? `🎉 Order #${orderRef} Confirmed!`
          : `Order #${orderRef} Updated: ${status.toUpperCase()}`,
      message:
        status === "rejected"
          ? `Order #${orderRef} was rejected. Please contact shop support via Telegram (@Somphea_reak).`
          : status === "confirmed"
          ? `Order #${orderRef} for store delivery has been verified and confirmed! Stock deducted & VIP points credited.`
          : `Warehouse tracking updated status to ${status.toUpperCase()} for order #${orderRef}.`,
      type:
        status === "delivered"
          ? "order_delivered"
          : status === "shipped"
          ? "order_shipped"
          : status === "rejected"
          ? "order_rejected"
          : "order_confirmed",
      read: false,
      createdAt: new Date().toISOString(),
    };

    setNotifications((prev) => {
      const nextNotifs = [notif, ...prev];
      neonSetKey("notifications", nextNotifs);
      return nextNotifs;
    });
    setLatestNotificationToast(notif);

    // Sync to testing server DB
    fetch(`/api/orders/${orderId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    }).catch(() => {});
  }, []);

  const deleteOrder = useCallback((orderId: string) => {
    setOrdersState((prev) => {
      const updated = prev.filter((o) => o.id !== orderId);
      const compacted = compactOrdersForStorage(updated);
      safeSetItem("somphea_orders", JSON.stringify(compacted));
      neonSetKey("orders", compacted);
      return updated;
    });
    fetch(`/api/orders/${orderId}`, { method: "DELETE" }).catch(() => {});
  }, []);

  const updateOrder = useCallback((orderId: string, updates: Partial<CustomerOrder>) => {
    setOrdersState((prev) => {
      const updated = prev.map((o) => (o.id === orderId ? { ...o, ...updates } : o));
      const compacted = compactOrdersForStorage(updated);
      safeSetItem("somphea_orders", JSON.stringify(compacted));
      neonSetKey("orders", compacted);
      return updated;
    });

    setSelectedReceiptOrder((prev) => (prev && prev.id === orderId ? { ...prev, ...updates } : prev));

    fetch(`/api/orders/${orderId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(updates),
    }).catch(() => {});
  }, []);

  // Notifications helpers
  const markNotificationRead = useCallback((id: string) => {
    setNotifications((prev) => {
      const updated = prev.map((n) => (n.id === id ? { ...n, read: true } : n));
      neonSetKey("notifications", updated);
      return updated;
    });
    fetch("/api/notifications", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id }),
    }).catch(() => {});
  }, []);

  const clearNotifications = useCallback(() => {
    setNotifications([]);
    neonSetKey("notifications", []);
    fetch("/api/notifications", { method: "DELETE" }).catch(() => {});
  }, []);

  const dismissNotificationToast = useCallback(() => {
    setLatestNotificationToast(null);
  }, []);

  const unreadNotificationCount = notifications.filter((n) => !n.read).length;

  // Voucher Management
  const addVoucher = useCallback((voucher: Voucher) => {
    setVouchersState((prev) => {
      const updated = [voucher, ...prev.filter((v) => v.code !== voucher.code)];
      safeSetItem("somphea_vouchers", JSON.stringify(updated));
      neonSetKey("vouchers", updated);
      return updated;
    });
    fetch("/api/vouchers", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(voucher),
    }).catch(() => {});
  }, []);

  const deleteVoucher = useCallback((code: string) => {
    setVouchersState((prev) => {
      const updated = prev.filter((v) => v.code !== code);
      safeSetItem("somphea_vouchers", JSON.stringify(updated));
      neonSetKey("vouchers", updated);
      return updated;
    });
    fetch(`/api/vouchers?code=${encodeURIComponent(code)}`, { method: "DELETE" }).catch(() => {});
  }, []);

  // Storefront Config Live Editing
  const updateStorefrontConfig = useCallback((updates: Partial<StorefrontConfig>) => {
    setStorefrontConfig((prev) => {
      const next = { ...prev, ...updates };
      safeSetItem("somphea_storefront_config", JSON.stringify(next));
      neonSetKey("storefrontConfig", next);
      return next;
    });
    fetch("/api/store-config", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(updates),
    }).catch(() => {});
  }, []);

  // Category Bento Boxes Operations
  const addCategoryBox = useCallback((newBox: Omit<CategoryBox, "id">): CategoryBox => {
    const id = `box-${Date.now()}`;
    const box: CategoryBox = { ...newBox, id };
    setCategoryBoxesState((prev) => {
      const updated = [...prev, box];
      safeSetItem("somphea_category_boxes", JSON.stringify(updated));
      neonSetKey("categoryBoxes", updated);
      return updated;
    });
    fetch("/api/category-boxes", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(box),
    }).catch(() => {});
    return box;
  }, []);

  const updateCategoryBox = useCallback((id: string, updates: Partial<CategoryBox>) => {
    setCategoryBoxesState((prev) => {
      const updated = prev.map((b) => (b.id === id ? { ...b, ...updates } : b));
      safeSetItem("somphea_category_boxes", JSON.stringify(updated));
      neonSetKey("categoryBoxes", updated);
      return updated;
    });
    fetch(`/api/category-boxes/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(updates),
    }).catch(() => {});
  }, []);

  const deleteCategoryBox = useCallback((id: string) => {
    setCategoryBoxesState((prev) => {
      const updated = prev.filter((b) => b.id !== id);
      safeSetItem("somphea_category_boxes", JSON.stringify(updated));
      neonSetKey("categoryBoxes", updated);
      return updated;
    });
    fetch(`/api/category-boxes/${id}`, { method: "DELETE" }).catch(() => {});
  }, []);

  const resetCategoryBoxes = useCallback(() => {
    setCategoryBoxesState(DEFAULT_CATEGORY_BOXES);
    safeSetItem("somphea_category_boxes", JSON.stringify(DEFAULT_CATEGORY_BOXES));
    neonSetKey("categoryBoxes", DEFAULT_CATEGORY_BOXES);
    fetch("/api/category-boxes", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "reset" }),
    }).catch(() => {});
  }, []);

  const reorderCategoryBoxes = useCallback((boxes: CategoryBox[]) => {
    setCategoryBoxesState(boxes);
    safeSetItem("somphea_category_boxes", JSON.stringify(boxes));
    neonSetKey("categoryBoxes", boxes);
    fetch("/api/category-boxes", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "reorder", boxes }),
    }).catch(() => {});
  }, []);

  // Product Filter Categories Operations
  const addCategory = useCallback((newCat: Omit<Category, "id"> & { id?: string }): Category => {
    const slug = (newCat.id && newCat.id.trim())
      ? newCat.id.trim().toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "")
      : newCat.name.trim().toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "") || `cat-${Date.now()}`;

    const category: Category = {
      id: slug,
      name: newCat.name.trim(),
      kh: newCat.kh?.trim() || newCat.name.trim(),
      en: newCat.en?.trim() || newCat.name.trim(),
      icon: newCat.icon?.trim() || "🏷️",
      grad: newCat.grad?.trim() || "from-emerald-500 to-teal-600",
      sort_order: typeof newCat.sort_order === "number" ? newCat.sort_order : categories.length,
      description: newCat.description?.trim() || "",
    };

    setCategoriesState((prev) => {
      const existingIdx = prev.findIndex((c) => c.id === slug);
      let updated: Category[];
      if (existingIdx !== -1) {
        updated = prev.map((c, i) => (i === existingIdx ? category : c));
      } else {
        updated = [...prev, category];
      }
      safeSetItem("somphea_categories", JSON.stringify(updated));
      neonSetKey("categories", updated);
      return updated;
    });

    fetch("/api/categories", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(category),
    }).catch(() => {});

    return category;
  }, [categories.length]);

  const updateCategory = useCallback((id: string, updates: Partial<Category>) => {
    setCategoriesState((prev) => {
      const updated = prev.map((c) => (c.id === id ? { ...c, ...updates, id } : c));
      safeSetItem("somphea_categories", JSON.stringify(updated));
      neonSetKey("categories", updated);
      return updated;
    });

    fetch(`/api/categories/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(updates),
    }).catch(() => {});
  }, []);

  const deleteCategory = useCallback((id: string) => {
    if (id === "all") return;
    setCategoriesState((prev) => {
      const updated = prev.filter((c) => c.id !== id);
      safeSetItem("somphea_categories", JSON.stringify(updated));
      neonSetKey("categories", updated);
      return updated;
    });

    fetch(`/api/categories/${id}`, { method: "DELETE" }).catch(() => {});
  }, []);

  const resetCategories = useCallback(() => {
    setCategoriesState(CATEGORIES);
    safeSetItem("somphea_categories", JSON.stringify(CATEGORIES));
    neonSetKey("categories", CATEGORIES);
    fetch("/api/categories", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "reset" }),
    }).catch(() => {});
  }, []);

  // Customer Account & Remember System Operations
  const loginCustomer = useCallback((data: Omit<CustomerAccount, "id" | "createdAt"> & { rememberMe?: boolean }) => {
    const account: CustomerAccount = {
      id: `cust-${Date.now()}`,
      name: data.name.trim(),
      phone: data.phone.trim(),
      telegramHandle: data.telegramHandle ? data.telegramHandle.trim() : "",
      province: data.province || "Phnom Penh",
      address: data.address || "",
      rememberMe: data.rememberMe ?? true,
      createdAt: new Date().toISOString(),
    };
    setCustomerUserState(account);
    if (account.rememberMe) {
      safeSetItem("somphea_customer_account", JSON.stringify(account));
    } else {
      localStorage.removeItem("somphea_customer_account");
    }
    sounds.playFanfare();
    confetti({
      particleCount: 60,
      spread: 70,
      origin: { y: 0.6 },
    });
  }, []);

  const logoutCustomer = useCallback(() => {
    sounds.playPop();
    setCustomerUserState(null);
    localStorage.removeItem("somphea_customer_account");
  }, []);

  const updateCustomerProfile = useCallback((updates: Partial<CustomerAccount>) => {
    setCustomerUserState((prev) => {
      if (!prev) return null;
      const updated = { ...prev, ...updates };
      if (updated.rememberMe) {
        safeSetItem("somphea_customer_account", JSON.stringify(updated));
      }
      return updated;
    });
    sounds.playChime();
  }, []);

  const isCustomerLoggedIn = !!customerUser;

  return (
    <StoreContext.Provider
      value={{
        currency,
        setCurrency,
        toggleCurrency,
        language,
        setLanguage,
        toggleLanguage,
        themeMode,
        toggleTheme,
        soundEnabled,
        toggleSound,
        cart,
        addToCart,
        addCustomBraceletToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        cartCount,
        cartDrawerOpen,
        setCartDrawerOpen,
        quickViewProduct,
        setQuickViewProduct,
        viewer3DProduct,
        setViewer3DProduct,
        rewardsModalOpen,
        setRewardsModalOpen,
        checkoutModalOpen,
        setCheckoutModalOpen,
        selectedCategory,
        setSelectedCategory,
        searchQuery,
        setSearchQuery,
        sortBy,
        setSortBy,
        userPoints,
        addPoints,
        redeemVoucherPoints,
        exchangePointsForVoucher,
        claimedVouchers,
        activeVoucher,
        applyVoucherCode,
        removeVoucher,
        products,
        addProduct,
        updateProduct,
        deleteProduct,
        resetProducts,
        wipeAllProducts,
        charms,
        addCharm,
        updateCharm,
        deleteCharm,
        resetCharms,
        clearCharms,
        orders,
        saveOrder,
        updateOrderStatus,
        updateOrder,
        deleteOrder,
        vouchers,
        addVoucher,
        deleteVoucher,
        categoryBoxes,
        addCategoryBox,
        updateCategoryBox,
        deleteCategoryBox,
        resetCategoryBoxes,
        reorderCategoryBoxes,
        categories,
        addCategory,
        updateCategory,
        deleteCategory,
        resetCategories,
        notifications,
        unreadNotificationCount,
        markNotificationRead,
        clearNotifications,
        latestNotificationToast,
        dismissNotificationToast,
        isAdminLoggedIn,
        setIsAdminLoggedIn,
        isLiveEditMode,
        setLiveEditMode,
        storefrontConfig,
        updateStorefrontConfig,
        editingDirectProduct,
        setEditingDirectProduct,
        copyModalOpen,
        setCopyModalOpen,
        customerUser,
        isCustomerLoggedIn,
        loginCustomer,
        logoutCustomer,
        updateCustomerProfile,
        accountModalOpen,
        setAccountModalOpen,
        orderHistoryModalOpen,
        setOrderHistoryModalOpen,
        selectedReceiptOrder,
        setSelectedReceiptOrder,
        t,
      }}
    >
      {children}
    </StoreContext.Provider>
  );
};

export const useStore = () => {
  const context = useContext(StoreContext);
  if (!context) {
    throw new Error("useStore must be used within a StoreProvider");
  }
  return context;
};
