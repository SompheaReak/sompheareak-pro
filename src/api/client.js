import { Platform, NativeModules } from 'react-native';

const DEFAULT_LAN_HOST = '192.168.1.58';
const API_PORT = '5000';

/**
 * Dynamically extract development server IP from Expo Go bundle URL on physical phones.
 * e.g., if bundle was fetched from http://192.168.1.58:8081, point API to http://192.168.1.58:5000.
 */
function getMobileDevHost() {
  try {
    const scriptURL = NativeModules?.SourceCode?.scriptURL;
    if (scriptURL) {
      const match = scriptURL.match(/^https?:\/\/([^:/]+)/);
      if (match && match[1] && match[1] !== 'localhost' && match[1] !== '127.0.0.1') {
        return match[1];
      }
    }
  } catch (e) {
    // Ignore error
  }
  return DEFAULT_LAN_HOST;
}

function resolveInitialApiBase() {
  if (process.env.EXPO_PUBLIC_API_URL) {
    return process.env.EXPO_PUBLIC_API_URL.replace(/\/+$/, '');
  }
  if (Platform.OS === 'android' || Platform.OS === 'ios') {
    const host = getMobileDevHost();
    return `http://${host}:${API_PORT}`;
  }
  if (Platform.OS === 'web' && typeof window !== 'undefined' && window.location) {
    try {
      if (window.localStorage) {
        const stored = window.localStorage.getItem('SOMPHEAREAK_API_URL');
        if (stored) return stored.replace(/\/+$/, '');
      }
    } catch (e) {}

    const { protocol, hostname, port, origin } = window.location;
    // If served directly by backend Python server on port 5000 / 5001, use same origin
    if (port === '5000' || port === '5001') {
      return origin;
    }
    // If running in development Metro bundler on any port (8081, 8082, 8088, 3000, etc.), connect to API on 5000
    if (hostname === 'localhost' || hostname === '127.0.0.1') {
      return `${protocol}//${hostname}:${API_PORT}`;
    }
    if (origin) {
      return origin;
    }
    if (hostname) {
      return `${protocol}//${hostname}${port ? ':' + port : ''}`;
    }
  }
  return `http://${DEFAULT_LAN_HOST}:${API_PORT}`;
}

let API_BASE = resolveInitialApiBase();

export function setApiBaseUrl(url) {
  if (url) {
    API_BASE = url.replace(/\/+$/, '');
  }
}

export function getApiBaseUrl() {
  return API_BASE;
}

async function request(endpoint, options = {}) {
  const url = `${API_BASE}${endpoint}`;
  const headers = {
    'Accept': 'application/json',
    'Content-Type': 'application/json',
    ...(options.headers || {}),
  };

  const controller = typeof AbortController !== 'undefined' ? new AbortController() : null;
  const timeoutId = controller ? setTimeout(() => controller.abort(), options.timeout || 8000) : null;

  try {
    const res = await fetch(url, {
      ...options,
      headers,
      signal: controller ? controller.signal : undefined,
    });
    if (timeoutId) clearTimeout(timeoutId);

    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      return {
        ok: false,
        status: res.status,
        error: data.error || data.message || `HTTP ${res.status}`,
        code: data.code,
        ...(Array.isArray(data) ? { data } : data),
      };
    }
    if (Array.isArray(data)) {
      return { ok: true, status: res.status, data };
    }
    return { ok: true, status: res.status, ...data };
  } catch (err) {
    if (timeoutId) clearTimeout(timeoutId);
    const isAbort = err.name === 'AbortError';
    const errMsg = isAbort ? 'Request timed out after 8s' : err.message;
    console.warn(`[API] Request failed to ${url}:`, errMsg);
    return {
      ok: false,
      error: `Network error: ${errMsg}. Is backend server running on ${API_BASE}?`,
      networkError: true,
      timedOut: isAbort,
    };
  }
}

export const ApiClient = {
  // System Health
  async getHealth() {
    return request('/api/health');
  },

  // Settings
  async getSettings() {
    const res = await request('/api/settings');
    if (res.ok) {
      const settings = res.settings || (res.site_title !== undefined ? { ...res } : res.data);
      if (settings && typeof settings === 'object') {
        const cleaned = { ...settings };
        delete cleaned.ok;
        delete cleaned.status;
        return { ...res, settings: cleaned };
      }
    }
    return res;
  },
  async updateSettings(settings, adminToken) {
    return request('/api/settings', {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${adminToken}` },
      body: JSON.stringify(settings),
    });
  },

  // Categories
  async getCategories() {
    const res = await request('/api/categories');
    const categories = Array.isArray(res.categories) ? res.categories : (Array.isArray(res.data) ? res.data : []);
    return { ...res, categories };
  },
  async createCategory(category, adminToken) {
    return request('/api/categories', {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${adminToken}` },
      body: JSON.stringify(category),
    });
  },
  async deleteCategory(catId, adminToken) {
    return request(`/api/categories/${encodeURIComponent(catId)}`, {
      method: 'DELETE',
      headers: { 'Authorization': `Bearer ${adminToken}` },
    });
  },

  // Category Filters (Dynamic per category)
  async getCategoryFilters(categoryId = null) {
    const q = categoryId ? `?category_id=${encodeURIComponent(categoryId)}` : '';
    let res = await request(`/api/category-filters${q}`);
    if (!res.ok && (res.status === 404 || res.status === 405)) {
      res = await request(`/api/category-filter${q}`);
    }
    const filters = Array.isArray(res.filters) ? res.filters : (Array.isArray(res.data) ? res.data : []);
    return { ...res, filters };
  },
  async createCategoryFilter(filterData, adminToken) {
    let res = await request('/api/category-filters', {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${adminToken}` },
      body: JSON.stringify(filterData),
    });
    if (!res.ok && (res.status === 404 || res.status === 405)) {
      res = await request('/api/category-filter', {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${adminToken}` },
        body: JSON.stringify(filterData),
      });
    }
    return res;
  },
  async deleteCategoryFilter(filterId, adminToken) {
    let res = await request(`/api/category-filters/${encodeURIComponent(filterId)}`, {
      method: 'DELETE',
      headers: { 'Authorization': `Bearer ${adminToken}` },
    });
    if (!res.ok && (res.status === 404 || res.status === 405)) {
      res = await request(`/api/category-filter/${encodeURIComponent(filterId)}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${adminToken}` },
      });
    }
    return res;
  },

  // Products
  async getProducts() {
    const res = await request('/api/products');
    const products = Array.isArray(res.products) ? res.products : (Array.isArray(res.data) ? res.data : []);
    return { ...res, products };
  },
  async createProduct(product, adminToken) {
    return request('/api/products', {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${adminToken}` },
      body: JSON.stringify(product),
    });
  },
  async updateProductStock(prodId, delta, adminToken) {
    return request(`/api/products/${encodeURIComponent(prodId)}/stock`, {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${adminToken}` },
      body: JSON.stringify({ delta }),
    });
  },
  async deleteProduct(prodId, adminToken) {
    return request(`/api/products/${encodeURIComponent(prodId)}`, {
      method: 'DELETE',
      headers: { 'Authorization': `Bearer ${adminToken}` },
    });
  },
  async seedProducts(adminToken) {
    return request('/api/products/seed', {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${adminToken}` },
    });
  },

  // Charms (Italy bracelet builder)
  async getCharms() {
    const res = await request('/api/charms');
    const charms = Array.isArray(res.charms) ? res.charms : (Array.isArray(res.data) ? res.data : []);
    return { ...res, charms };
  },
  async createCharm(charm, adminToken) {
    return request('/api/charms', {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${adminToken}` },
      body: JSON.stringify(charm),
    });
  },
  async updateCharmStock(charmId, delta, adminToken) {
    return request(`/api/charms/${encodeURIComponent(charmId)}/stock`, {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${adminToken}` },
      body: JSON.stringify({ delta }),
    });
  },
  async deleteCharm(charmId, adminToken) {
    return request(`/api/charms/${encodeURIComponent(charmId)}`, {
      method: 'DELETE',
      headers: { 'Authorization': `Bearer ${adminToken}` },
    });
  },

  // User Authentication & Loyalty
  async registerCustomer(username, phone, password) {
    const res = await request('/api/users/register', {
      method: 'POST',
      body: JSON.stringify({ username, phone, password }),
    });
    if (res.ok) {
      const user = res.user || (res.id ? { ...res } : null);
      if (user) {
        return { ...res, user };
      }
    }
    return res;
  },
  async loginUser(identifier, password = '', phone = '') {
    const res = await request('/api/users/login', {
      method: 'POST',
      body: JSON.stringify({
        username: identifier,
        phone: phone || identifier,
        password,
      }),
    });
    if (res.ok) {
      const user = res.user || (res.id ? { ...res } : null);
      if (user) {
        return { ...res, user };
      }
    }
    return res;
  },
  async recoverCustomerPassword(identifier, newPassword) {
    const res = await request('/api/users/recover', {
      method: 'POST',
      body: JSON.stringify({ identifier, phone: identifier, new_password: newPassword }),
    });
    if (res.ok) {
      const user = res.user || (res.id ? { ...res } : null);
      if (user) {
        return { ...res, user };
      }
    }
    return res;
  },
  async getUser(userId) {
    const res = await request(`/api/users/${encodeURIComponent(userId)}`);
    if (res.ok) {
      const user = res.user || (res.id ? { ...res } : null);
      if (user) {
        return { ...res, user };
      }
    }
    return res;
  },
  async getUsers(adminToken) {
    const res = await request('/api/users', {
      headers: { 'Authorization': `Bearer ${adminToken}` },
    });
    const users = Array.isArray(res.users) ? res.users : (Array.isArray(res.data) ? res.data : []);
    return { ...res, users };
  },
  async adjustUserPoints(userId, delta, reason = '', adminToken) {
    return request(`/api/users/${encodeURIComponent(userId)}/points`, {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${adminToken}` },
      body: JSON.stringify({ delta, reason }),
    });
  },
  async redeemVoucher(userId) {
    return request(`/api/users/${encodeURIComponent(userId)}/redeem-voucher`, {
      method: 'POST',
    });
  },

  // Orders
  async checkout(orderData) {
    return request('/api/checkout', {
      method: 'POST',
      body: JSON.stringify(orderData),
    });
  },
  async getOrders(userId = null, adminToken = null) {
    const headers = {};
    if (adminToken) {
      headers['Authorization'] = `Bearer ${adminToken}`;
    }
    const query = userId ? `?user_id=${encodeURIComponent(userId)}` : '';
    const res = await request(`/api/orders${query}`, { headers });
    let orders = [];
    if (Array.isArray(res)) {
      orders = res;
    } else if (Array.isArray(res.orders)) {
      orders = res.orders;
    } else if (Array.isArray(res.data)) {
      orders = res.data;
    }
    const isOk = res.ok !== false && res.status !== 401 && res.status !== 403 && res.status !== 500;
    return { ...res, ok: isOk, orders };
  },
  async approveOrder(orderId, adminToken) {
    return request(`/api/orders/${encodeURIComponent(orderId)}/approve`, {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${adminToken}` },
    });
  },
  async rejectOrder(orderId, reason = '', adminToken) {
    return request(`/api/orders/${encodeURIComponent(orderId)}/reject`, {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${adminToken}` },
      body: JSON.stringify({ reason }),
    });
  },
  async updateOrderStatus(orderId, status, adminToken) {
    return request(`/api/orders/${encodeURIComponent(orderId)}/status`, {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${adminToken}` },
      body: JSON.stringify({ status }),
    });
  },
  async updateOrder(orderId, updateData, adminToken) {
    return request(`/api/orders/${encodeURIComponent(orderId)}/edit`, {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${adminToken}` },
      body: JSON.stringify(updateData),
    });
  },
  async wipeOrders(mode = 'all', adminToken) {
    return request('/api/orders/wipe', {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${adminToken}` },
      body: JSON.stringify({ mode }),
    });
  },
  async runAutoWipeOrders(adminToken) {
    return request('/api/orders/auto-wipe/run', {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${adminToken}` },
    });
  },
  async generateProductId(prefix = 'PRD', adminToken) {
    return request(`/api/products/generate-id?prefix=${encodeURIComponent(prefix)}`, {
      headers: { 'Authorization': `Bearer ${adminToken}` },
    });
  },

  // Admin PIN Login Gate
  async verifyAdminPin(pin) {
    return request('/api/admin/verify-pin', {
      method: 'POST',
      body: JSON.stringify({ pin }),
    });
  },
};
