import fs from "fs";
import path from "path";
import { neon } from "@neondatabase/serverless";
import {
  Product,
  CustomerOrder,
  Voucher,
  OrderNotification,
  StorefrontConfig,
  OrderStatus,
  Charm,
  CategoryBox,
  Category,
} from "@/types/store";
import { PRODUCTS } from "@/data/products";
import { AVAILABLE_VOUCHERS } from "@/data/vouchers";
import { CHARMS, ensureUniqueCharmCodes, generateUniqueCharmCode } from "@/data/charms";
import { DEFAULT_CATEGORY_BOXES } from "@/data/categoryBoxes";
import { CATEGORIES } from "@/data/categories";

export interface DatabaseSchema {
  products: Product[];
  charms: Charm[];
  orders: CustomerOrder[];
  vouchers: Voucher[];
  notifications: OrderNotification[];
  storefrontConfig: StorefrontConfig;
  categoryBoxes: CategoryBox[];
  categories: Category[];
}

const DB_FILE_PATH = path.join(process.cwd(), "src", "data", "testing_db.json");

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

// ==========================================
// NEON POSTGRESQL DRIVER INTEGRATION
// ==========================================
const NEON_DEFAULT_URL =
  "postgresql://neondb_owner:npg_PMLFK18CHxin@ep-autumn-grass-ao3z40da-pooler.c-2.ap-southeast-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require";

function getDatabaseUrl(): string {
  return (
    process.env.DATABASE_URL ||
    process.env.POSTGRES_URL ||
    process.env.NEON_DATABASE_URL ||
    process.env.POSTGRES_PRISMA_URL ||
    NEON_DEFAULT_URL
  );
}

function getNeonSql() {
  const url = getDatabaseUrl();
  try {
    return neon(url);
  } catch (err) {
    console.error("Neon connection error:", err);
    return null;
  }
}

let tableInitialized = false;
// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function ensureNeonTable(sql: any) {
  if (tableInitialized) return;
  try {
    await sql`
      CREATE TABLE IF NOT EXISTS sompheareak_store (
        key VARCHAR(64) PRIMARY KEY,
        value JSONB NOT NULL,
        updated_at TIMESTAMPTZ DEFAULT NOW()
      );
    `;
    tableInitialized = true;
  } catch (err) {
    console.error("Failed to initialize sompheareak_store table in Neon:", err);
  }
}

// In-Memory cache for low-latency lookups and fallback
let memoryDb: DatabaseSchema | null = null;

// Read Database (supports sync fallback and Neon Postgres hydration)
export function getDb(): DatabaseSchema {
  if (memoryDb) {
    return memoryDb;
  }

  try {
    if (fs.existsSync(DB_FILE_PATH)) {
      const raw = fs.readFileSync(DB_FILE_PATH, "utf-8");
      const parsed = JSON.parse(raw);
      const loadedCharms = Array.isArray(parsed.charms) ? parsed.charms : [];
      const guaranteedCharms = ensureUniqueCharmCodes(loadedCharms);
      const categoryBoxes =
        Array.isArray(parsed.categoryBoxes) && parsed.categoryBoxes.length > 0
          ? parsed.categoryBoxes
          : DEFAULT_CATEGORY_BOXES;
      const categories =
        Array.isArray(parsed.categories) && parsed.categories.length > 0
          ? parsed.categories
          : CATEGORIES;

      memoryDb = {
        products: Array.isArray(parsed.products) ? parsed.products : PRODUCTS,
        charms: guaranteedCharms,
        orders: Array.isArray(parsed.orders) ? parsed.orders : INITIAL_DEMO_ORDERS,
        vouchers: Array.isArray(parsed.vouchers) ? parsed.vouchers : AVAILABLE_VOUCHERS,
        notifications: Array.isArray(parsed.notifications) ? parsed.notifications : [],
        storefrontConfig: parsed.storefrontConfig || DEFAULT_STOREFRONT_CONFIG,
        categoryBoxes,
        categories,
      };
      return memoryDb;
    }
  } catch (err) {
    console.error("Error reading test DB file, using clean defaults", err);
  }

  const initialDb: DatabaseSchema = {
    products: PRODUCTS,
    charms: CHARMS,
    orders: INITIAL_DEMO_ORDERS,
    vouchers: AVAILABLE_VOUCHERS,
    notifications: INITIAL_NOTIFICATIONS,
    storefrontConfig: DEFAULT_STOREFRONT_CONFIG,
    categoryBoxes: DEFAULT_CATEGORY_BOXES,
    categories: CATEGORIES,
  };
  memoryDb = initialDb;
  saveDb(initialDb);
  return initialDb;
}

// Save Database to memory, local file, and Neon PostgreSQL
export function saveDb(data: DatabaseSchema): void {
  memoryDb = data;

  // 1. Save to local disk if running in environment with filesystem
  try {
    const dir = path.dirname(DB_FILE_PATH);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    fs.writeFileSync(DB_FILE_PATH, JSON.stringify(data, null, 2), "utf-8");
  } catch (err) {
    // Ephemeral serverless container might not allow writing to disk; ignore gracefully
  }

  // 2. Persist to Neon Postgres in background
  syncAllToNeon(data).catch((err) => {
    console.error("Error syncing data to Neon PostgreSQL:", err);
  });
}

// Neon background sync helper
async function syncAllToNeon(data: DatabaseSchema): Promise<void> {
  const sql = getNeonSql();
  if (!sql) return;

  try {
    await ensureNeonTable(sql);
    const keys: (keyof DatabaseSchema)[] = [
      "products",
      "charms",
      "orders",
      "vouchers",
      "notifications",
      "storefrontConfig",
      "categoryBoxes",
      "categories",
    ];

    for (const key of keys) {
      const val = data[key];
      await sql`
        INSERT INTO sompheareak_store (key, value, updated_at)
        VALUES (${key}, ${JSON.stringify(val)}::jsonb, NOW())
        ON CONFLICT (key) DO UPDATE
        SET value = EXCLUDED.value, updated_at = NOW();
      `;
    }
  } catch (err) {
    console.error("Neon sync error:", err);
  }
}

// Async Hydration from Neon on API routes
export async function getDbAsync(): Promise<DatabaseSchema> {
  const sql = getNeonSql();
  if (!sql) {
    return getDb();
  }

  try {
    await ensureNeonTable(sql);
    const rows = await sql`SELECT key, value FROM sompheareak_store;`;

    if (rows && rows.length > 0) {
      const dbMap = new Map<string, unknown>();
      for (const row of rows) {
        dbMap.set(row.key, row.value);
      }

      const products = (dbMap.get("products") as Product[]) || [];
      const charms = (dbMap.get("charms") as Charm[]) || [];
      const orders = (dbMap.get("orders") as CustomerOrder[]) || [];
      const vouchers = (dbMap.get("vouchers") as Voucher[]) || AVAILABLE_VOUCHERS;
      const notifications = (dbMap.get("notifications") as OrderNotification[]) || [];
      const storefrontConfig = (dbMap.get("storefrontConfig") as StorefrontConfig) || DEFAULT_STOREFRONT_CONFIG;
      const categoryBoxes = (dbMap.get("categoryBoxes") as CategoryBox[]) || DEFAULT_CATEGORY_BOXES;
      const categories = (dbMap.get("categories") as Category[]) || CATEGORIES;

      const loadedDb: DatabaseSchema = {
        products,
        charms: ensureUniqueCharmCodes(charms),
        orders,
        vouchers,
        notifications,
        storefrontConfig,
        categoryBoxes,
        categories,
      };

      memoryDb = loadedDb;
      return loadedDb;
    } else {
      // First time connecting to Neon: seed with clean initialDb
      const current = getDb();
      await syncAllToNeon(current);
      return current;
    }
  } catch (err) {
    console.error("Failed to read from Neon, falling back to local/cached state:", err);
    return getDb();
  }
}

// Single key saver for high performance
async function saveNeonKey<T>(key: keyof DatabaseSchema, value: T): Promise<void> {
  const sql = getNeonSql();
  if (!sql) return;
  try {
    await ensureNeonTable(sql);
    await sql`
      INSERT INTO sompheareak_store (key, value, updated_at)
      VALUES (${key}, ${JSON.stringify(value)}::jsonb, NOW())
      ON CONFLICT (key) DO UPDATE
      SET value = EXCLUDED.value, updated_at = NOW();
    `;
  } catch (err) {
    console.error(`Error saving ${key} to Neon:`, err);
  }
}

// ==========================================
// PRODUCTS OPERATIONS
// ==========================================
export async function getProducts(): Promise<Product[]> {
  const db = await getDbAsync();
  return db.products;
}

export async function getProductById(id: string): Promise<Product | undefined> {
  const products = await getProducts();
  return products.find((p) => p.id === id);
}

export function generateProductCode(): string {
  return `SPK-${Math.floor(1000 + Math.random() * 9000)}`;
}

export async function addProduct(newProduct: Omit<Product, "id"> & { id?: string }): Promise<Product> {
  const db = await getDbAsync();
  const id = newProduct.id || `toy-${Date.now()}`;
  const code = newProduct.code || generateProductCode();
  const product: Product = { ...newProduct, id, code };
  const existingIdx = db.products.findIndex((p) => p.id === id || (p.code && p.code === code));
  if (existingIdx !== -1) {
    db.products[existingIdx] = product;
  } else {
    db.products.unshift(product);
  }
  saveDb(db);
  await saveNeonKey("products", db.products);
  return product;
}

export async function updateProduct(id: string, updates: Partial<Product>): Promise<Product | null> {
  const db = await getDbAsync();
  const idx = db.products.findIndex((p) => p.id === id);
  if (idx === -1) return null;

  db.products[idx] = { ...db.products[idx], ...updates };
  saveDb(db);
  await saveNeonKey("products", db.products);
  return db.products[idx];
}

export async function deleteProduct(id: string): Promise<boolean> {
  const db = await getDbAsync();
  const initialLen = db.products.length;
  db.products = db.products.filter((p) => p.id !== id);
  if (db.products.length !== initialLen) {
    saveDb(db);
    await saveNeonKey("products", db.products);
    return true;
  }
  return false;
}

export async function resetProducts(): Promise<Product[]> {
  const db = await getDbAsync();
  db.products = [];
  saveDb(db);
  await saveNeonKey("products", []);
  return [];
}

export async function wipeAllProducts(): Promise<Product[]> {
  const db = await getDbAsync();
  db.products = [];
  saveDb(db);
  await saveNeonKey("products", []);
  return [];
}

// ==========================================
// ORDERS & NOTIFICATIONS OPERATIONS
// ==========================================
export async function getOrders(): Promise<CustomerOrder[]> {
  const db = await getDbAsync();
  return db.orders;
}

export async function createOrder(order: CustomerOrder): Promise<{ order: CustomerOrder; notification: OrderNotification }> {
  const db = await getDbAsync();
  db.orders.unshift(order);

  const notification: OrderNotification = {
    id: `notif-${Date.now()}`,
    orderRef: order.orderRef,
    title: `New Order Placed: #${order.orderRef}`,
    message: `${order.customerName} placed order #${order.orderRef} (${formatCurrencySimple(order.totalUsd)}) via ${order.paymentMethod.toUpperCase()}. Deliver to ${order.province}.`,
    type: "order_placed",
    read: false,
    createdAt: new Date().toISOString(),
  };

  db.notifications.unshift(notification);
  saveDb(db);
  await Promise.all([
    saveNeonKey("orders", db.orders),
    saveNeonKey("notifications", db.notifications),
  ]);

  return { order, notification };
}

export async function updateOrderStatus(orderId: string, status: OrderStatus): Promise<CustomerOrder | null> {
  const db = await getDbAsync();
  const order = db.orders.find((o) => o.id === orderId);
  if (!order) return null;

  order.status = status;

  if (status === "confirmed" && !order.stockDeducted) {
    let stockChanged = false;
    for (const item of order.items) {
      const prodId = item.product?.id;
      if (prodId) {
        const prod = db.products.find((p) => p.id === prodId);
        if (prod) {
          prod.stock = Math.max(0, (prod.stock || 0) - item.quantity);
          stockChanged = true;
        }
      }
    }
    order.stockDeducted = true;
    order.pointsAwarded = true;
    if (stockChanged) {
      await saveNeonKey("products", db.products);
    }
  } else if ((status === "rejected" || status === "cancelled") && order.stockDeducted) {
    let stockChanged = false;
    for (const item of order.items) {
      const prodId = item.product?.id;
      if (prodId) {
        const prod = db.products.find((p) => p.id === prodId);
        if (prod) {
          prod.stock = (prod.stock || 0) + item.quantity;
          stockChanged = true;
        }
      }
    }
    order.stockDeducted = false;
    if (stockChanged) {
      await saveNeonKey("products", db.products);
    }
  }

  let notifTitle = `Order Status: #${order.orderRef}`;
  let notifMessage = `Order #${order.orderRef} status updated to ${status.toUpperCase()}.`;
  let notifType: OrderNotification["type"] = "system";

  if (status === "confirmed") {
    notifTitle = `Order Confirmed: #${order.orderRef}`;
    notifMessage = `Order #${order.orderRef} for ${order.customerName} has been confirmed. Ready for packing!`;
    notifType = "order_confirmed";
  } else if (status === "packaging") {
    notifTitle = `Packaging Order: #${order.orderRef}`;
    notifMessage = `Warehouse is packaging items for order #${order.orderRef}.`;
  } else if (status === "shipped") {
    notifTitle = `Order Dispatched: #${order.orderRef}`;
    notifMessage = `Order #${order.orderRef} is on delivery route to ${order.address}, ${order.province}.`;
    notifType = "order_shipped";
  } else if (status === "delivered") {
    notifTitle = `Order Delivered: #${order.orderRef}`;
    notifMessage = `Order #${order.orderRef} delivered successfully! +${order.pointsEarned} VIP points active.`;
    notifType = "order_delivered";
  } else if (status === "rejected" || status === "cancelled") {
    notifTitle = `Order Rejected: #${order.orderRef}`;
    notifMessage = `Order #${order.orderRef} was marked as rejected. Customer will be notified via Telegram.`;
    notifType = "order_rejected";
  }

  const notification: OrderNotification = {
    id: `notif-${Date.now()}`,
    orderRef: order.orderRef,
    title: notifTitle,
    message: notifMessage,
    type: notifType,
    read: false,
    createdAt: new Date().toISOString(),
  };

  db.notifications.unshift(notification);
  saveDb(db);
  await Promise.all([
    saveNeonKey("orders", db.orders),
    saveNeonKey("notifications", db.notifications),
  ]);
  return order;
}

export async function deleteOrder(orderId: string): Promise<boolean> {
  const db = await getDbAsync();
  const initialLen = db.orders.length;
  db.orders = db.orders.filter((o) => o.id !== orderId);
  if (db.orders.length !== initialLen) {
    saveDb(db);
    await saveNeonKey("orders", db.orders);
    return true;
  }
  return false;
}

export async function updateOrder(orderId: string, updates: Partial<CustomerOrder>): Promise<CustomerOrder | null> {
  const db = await getDbAsync();
  const idx = db.orders.findIndex((o) => o.id === orderId);
  if (idx === -1) return null;

  db.orders[idx] = { ...db.orders[idx], ...updates };
  saveDb(db);
  await saveNeonKey("orders", db.orders);
  return db.orders[idx];
}

// ==========================================
// NOTIFICATIONS OPERATIONS
// ==========================================
export async function getNotifications(): Promise<OrderNotification[]> {
  const db = await getDbAsync();
  return db.notifications;
}

export async function markNotificationAsRead(id: string): Promise<boolean> {
  const db = await getDbAsync();
  const notif = db.notifications.find((n) => n.id === id);
  if (notif) {
    notif.read = true;
    saveDb(db);
    await saveNeonKey("notifications", db.notifications);
    return true;
  }
  return false;
}

export async function clearNotifications(): Promise<void> {
  const db = await getDbAsync();
  db.notifications = [];
  saveDb(db);
  await saveNeonKey("notifications", []);
}

// ==========================================
// VOUCHERS OPERATIONS
// ==========================================
export async function getVouchers(): Promise<Voucher[]> {
  const db = await getDbAsync();
  return db.vouchers;
}

export async function addVoucher(voucher: Voucher): Promise<Voucher> {
  const db = await getDbAsync();
  db.vouchers = [voucher, ...db.vouchers.filter((v) => v.code !== voucher.code)];
  saveDb(db);
  await saveNeonKey("vouchers", db.vouchers);
  return voucher;
}

export async function deleteVoucher(code: string): Promise<boolean> {
  const db = await getDbAsync();
  const initialLen = db.vouchers.length;
  db.vouchers = db.vouchers.filter((v) => v.code !== code);
  if (db.vouchers.length !== initialLen) {
    saveDb(db);
    await saveNeonKey("vouchers", db.vouchers);
    return true;
  }
  return false;
}

// ==========================================
// CHARMS OPERATIONS (ITALY BRACELET)
// ==========================================
export async function getCharms(): Promise<Charm[]> {
  const db = await getDbAsync();
  return db.charms;
}

export async function getCharmById(id: string): Promise<Charm | undefined> {
  const charms = await getCharms();
  return charms.find((c) => c.id === id);
}

export async function addCharm(newCharm: Omit<Charm, "id"> & { id?: string }): Promise<Charm> {
  const db = await getDbAsync();
  const id = newCharm.id || `charm-${Date.now()}`;
  const code = generateUniqueCharmCode(newCharm, db.charms);
  const charm: Charm = { ...newCharm, id, code };
  const existingIdx = db.charms.findIndex((c) => c.id === id);
  if (existingIdx !== -1) {
    db.charms[existingIdx] = charm;
  } else {
    db.charms.unshift(charm);
  }
  db.charms = ensureUniqueCharmCodes(db.charms);
  saveDb(db);
  await saveNeonKey("charms", db.charms);
  return charm;
}

export async function updateCharm(id: string, updates: Partial<Charm>): Promise<Charm | null> {
  const db = await getDbAsync();
  const idx = db.charms.findIndex((c) => c.id === id);
  if (idx === -1) return null;

  let code = updates.code !== undefined ? updates.code : db.charms[idx].code;
  if (code) {
    code = generateUniqueCharmCode({ ...db.charms[idx], ...updates, id, code }, db.charms);
  }

  db.charms[idx] = { ...db.charms[idx], ...updates, ...(code ? { code } : {}) };
  db.charms = ensureUniqueCharmCodes(db.charms);
  saveDb(db);
  await saveNeonKey("charms", db.charms);
  return db.charms[idx];
}

export async function deleteCharm(id: string): Promise<boolean> {
  const db = await getDbAsync();
  const initialLen = db.charms.length;
  db.charms = db.charms.filter((c) => c.id !== id);
  if (db.charms.length !== initialLen) {
    saveDb(db);
    await saveNeonKey("charms", db.charms);
    return true;
  }
  return false;
}

export async function clearCharms(): Promise<Charm[]> {
  const db = await getDbAsync();
  db.charms = [];
  saveDb(db);
  await saveNeonKey("charms", []);
  return [];
}

export async function resetCharms(): Promise<Charm[]> {
  const db = await getDbAsync();
  db.charms = [];
  saveDb(db);
  await saveNeonKey("charms", []);
  return [];
}

// ==========================================
// STOREFRONT CONFIG (FOR LIVE STORE DIRECT EDIT)
// ==========================================
export async function getStorefrontConfig(): Promise<StorefrontConfig> {
  const db = await getDbAsync();
  return db.storefrontConfig;
}

export async function updateStorefrontConfig(updates: Partial<StorefrontConfig>): Promise<StorefrontConfig> {
  const db = await getDbAsync();
  db.storefrontConfig = { ...db.storefrontConfig, ...updates };
  saveDb(db);
  await saveNeonKey("storefrontConfig", db.storefrontConfig);
  return db.storefrontConfig;
}

// ==========================================
// CATEGORY BENTO BOXES MANAGEMENT
// ==========================================
export async function getCategoryBoxes(): Promise<CategoryBox[]> {
  const db = await getDbAsync();
  return (db.categoryBoxes || DEFAULT_CATEGORY_BOXES).sort((a, b) => a.order - b.order);
}

export async function saveCategoryBoxes(boxes: CategoryBox[]): Promise<CategoryBox[]> {
  const db = await getDbAsync();
  db.categoryBoxes = boxes;
  saveDb(db);
  await saveNeonKey("categoryBoxes", db.categoryBoxes);
  return db.categoryBoxes;
}

export async function addCategoryBox(newBox: Omit<CategoryBox, "id">): Promise<CategoryBox> {
  const db = await getDbAsync();
  const id = `box-${Date.now()}`;
  const box: CategoryBox = { ...newBox, id };
  db.categoryBoxes = [...(db.categoryBoxes || DEFAULT_CATEGORY_BOXES), box];
  saveDb(db);
  await saveNeonKey("categoryBoxes", db.categoryBoxes);
  return box;
}

export async function updateCategoryBox(id: string, updates: Partial<CategoryBox>): Promise<CategoryBox | null> {
  const db = await getDbAsync();
  const current = db.categoryBoxes || DEFAULT_CATEGORY_BOXES;
  const idx = current.findIndex((b) => b.id === id);
  if (idx === -1) return null;
  current[idx] = { ...current[idx], ...updates };
  db.categoryBoxes = current;
  saveDb(db);
  await saveNeonKey("categoryBoxes", db.categoryBoxes);
  return current[idx];
}

export async function deleteCategoryBox(id: string): Promise<boolean> {
  const db = await getDbAsync();
  const current = db.categoryBoxes || DEFAULT_CATEGORY_BOXES;
  db.categoryBoxes = current.filter((b) => b.id !== id);
  saveDb(db);
  await saveNeonKey("categoryBoxes", db.categoryBoxes);
  return true;
}

export async function resetCategoryBoxes(): Promise<CategoryBox[]> {
  const db = await getDbAsync();
  db.categoryBoxes = DEFAULT_CATEGORY_BOXES;
  saveDb(db);
  await saveNeonKey("categoryBoxes", DEFAULT_CATEGORY_BOXES);
  return DEFAULT_CATEGORY_BOXES;
}

// ==========================================
// PRODUCT CATEGORIES / FILTERS MANAGEMENT
// ==========================================
export async function getCategories(): Promise<Category[]> {
  const db = await getDbAsync();
  return (db.categories || CATEGORIES).sort((a, b) => a.sort_order - b.sort_order);
}

export async function saveCategories(categories: Category[]): Promise<Category[]> {
  const db = await getDbAsync();
  db.categories = categories;
  saveDb(db);
  await saveNeonKey("categories", db.categories);
  return db.categories;
}

export async function addCategory(newCat: Omit<Category, "id"> & { id?: string }): Promise<Category> {
  const db = await getDbAsync();
  const current = db.categories || CATEGORIES;
  const slug =
    newCat.id && newCat.id.trim()
      ? newCat.id.trim().toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "")
      : newCat.name.trim().toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "") ||
        `cat-${Date.now()}`;

  const category: Category = {
    id: slug,
    name: newCat.name.trim(),
    kh: newCat.kh?.trim() || newCat.name.trim(),
    en: newCat.en?.trim() || newCat.name.trim(),
    icon: newCat.icon?.trim() || "🏷️",
    grad: newCat.grad?.trim() || "from-emerald-500 to-teal-600",
    sort_order: typeof newCat.sort_order === "number" ? newCat.sort_order : current.length,
    description: newCat.description?.trim() || "",
  };

  const existingIdx = current.findIndex((c) => c.id === slug);
  if (existingIdx !== -1) {
    current[existingIdx] = category;
    db.categories = current;
  } else {
    db.categories = [...current, category];
  }
  saveDb(db);
  await saveNeonKey("categories", db.categories);
  return category;
}

export async function updateCategory(id: string, updates: Partial<Category>): Promise<Category | null> {
  const db = await getDbAsync();
  const current = db.categories || CATEGORIES;
  const idx = current.findIndex((c) => c.id === id);
  if (idx === -1) return null;

  current[idx] = {
    ...current[idx],
    ...updates,
    id: current[idx].id,
  };
  db.categories = current;
  saveDb(db);
  await saveNeonKey("categories", db.categories);
  return current[idx];
}

export async function deleteCategory(id: string): Promise<boolean> {
  if (id === "all") return false;
  const db = await getDbAsync();
  const current = db.categories || CATEGORIES;
  const initialLen = current.length;
  db.categories = current.filter((c) => c.id !== id);
  if (db.categories.length !== initialLen) {
    saveDb(db);
    await saveNeonKey("categories", db.categories);
    return true;
  }
  return false;
}

export async function resetCategories(): Promise<Category[]> {
  const db = await getDbAsync();
  db.categories = CATEGORIES;
  saveDb(db);
  await saveNeonKey("categories", CATEGORIES);
  return CATEGORIES;
}

// Reset Entire DB
export async function resetDb(): Promise<DatabaseSchema> {
  const initialDb: DatabaseSchema = {
    products: [],
    charms: [],
    orders: INITIAL_DEMO_ORDERS,
    vouchers: AVAILABLE_VOUCHERS,
    notifications: INITIAL_NOTIFICATIONS,
    storefrontConfig: DEFAULT_STOREFRONT_CONFIG,
    categoryBoxes: DEFAULT_CATEGORY_BOXES,
    categories: CATEGORIES,
  };
  saveDb(initialDb);
  await syncAllToNeon(initialDb);
  return initialDb;
}

function formatCurrencySimple(amount: number): string {
  return `$${amount.toFixed(2)}`;
}
