const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5252';

let accessToken = null;

export function setAccessToken(token) {
  accessToken = token;
}

export function getAccessToken() {
  return accessToken;
}

async function request(endpoint, options = {}) {
  const headers = {
    'Content-Type': 'application/json',
    ...options.headers,
  };
  if (accessToken) {
    headers['Authorization'] = `Bearer ${accessToken}`;
  }
  const res = await fetch(`${API_BASE}${endpoint}`, { ...options, headers });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.message || `API Error: ${res.status}`);
  }
  if (res.status === 204) return null;
  return res.json();
}

// ── Auth ──────────────────────────────────────────────────────────────────────

export async function loginAdmin(email, password) {
  const data = await request('/api/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email, password }),
  });
  if (data.user?.role !== 'admin') {
    throw new Error('Access denied: admin accounts only.');
  }
  accessToken = data.access_token;
  return { token: data.access_token, user: data.user };
}

// ── Admin stats ───────────────────────────────────────────────────────────────

export async function fetchStats() {
  return request('/api/admin/stats');
}

// ── Admin reports ─────────────────────────────────────────────────────────────
// range: '30' | '90' | '365' | 'all'

export async function fetchReports(range = '365') {
  return request(`/api/admin/reports?range=${range}`);
}

// ── Admin settings ────────────────────────────────────────────────────────────

export async function fetchSettings() {
  return request('/api/admin/settings');
}

export async function saveSettings(data) {
  return request('/api/admin/settings', {
    method: 'PUT',
    body: JSON.stringify(data),
  });
}

// ── Products ──────────────────────────────────────────────────────────────────

function normalizeImageUrl(url) {
  const value = String(url || '').trim().replace(/\\/g, '/');
  if (!value) return '';
  if (/^(data:|blob:|https?:)/i.test(value)) return value;
  if (/^\/(uploads|public)\//i.test(value)) return `${API_BASE}${value}`;
  if (/^(uploads|public)\//i.test(value)) return `${API_BASE}/${value}`;
  return value;
}

export function mapProductFromApi(p) {
  const rawImages = Array.isArray(p.images) ? p.images.filter(Boolean) : [];
  const image = normalizeImageUrl(rawImages[0] || p.image || '');
  return {
    id: p._id || p.id,
    name: p.title || p.name || '',
    description: p.description || '',
    price: Number(p.price) || 0,
    stock: Number(p.stock) || 0,
    category: p.category || 'Uncategorized',
    image,
    images: rawImages.map(normalizeImageUrl),
  };
}

export async function fetchProducts() {
  const data = await request('/api/products');
  return (data || []).map(mapProductFromApi);
}

export async function createProduct(productData) {
  const payload = {
    title: productData.name,
    description: productData.description,
    price: Number(productData.price),
    stock: Number(productData.stock),
    category: productData.category,
    images: productData.images || (productData.image ? [productData.image] : []),
  };
  const data = await request('/api/products', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
  return mapProductFromApi(data);
}

export async function updateProduct(id, productData) {
  const payload = {
    title: productData.name,
    description: productData.description,
    price: Number(productData.price),
    stock: Number(productData.stock),
    category: productData.category,
    images: productData.images || (productData.image ? [productData.image] : []),
  };
  const data = await request(`/api/products/${id}`, {
    method: 'PUT',
    body: JSON.stringify(payload),
  });
  return mapProductFromApi(data);
}

export async function deleteProduct(id) {
  await request(`/api/products/${id}`, { method: 'DELETE' });
  return true;
}

// ── Orders ────────────────────────────────────────────────────────────────────

export function mapOrderFromApi(o) {
  return {
    id: o._id || o.id,
    orderCode: o.orderCode || `#${String(o._id).slice(-6).toUpperCase()}`,
    customer: o.customerName || o.customer || 'Unknown',
    email: o.email || '',
    phone: o.phoneNumber || '',
    address: o.deliveryAddress || '',
    latitude: o.latitude != null ? Number(o.latitude) : null,
    longitude: o.longitude != null ? Number(o.longitude) : null,
    total: Number(o.totalAmount) || 0,
    status: o.orderStatus || 'Pending',
    paymentStatus: o.paymentStatus || 'pending',
    paymentMethod: o.paymentMethod || 'COD',
    products: o.products || [],
    date: o.createdAt ? new Date(o.createdAt).toLocaleDateString() : '',
    createdAt: o.createdAt || null,
  };
}

export async function fetchOrders() {
  const data = await request('/api/orders');
  return (data || []).map(mapOrderFromApi);
}

export async function updateOrderStatus(id, status) {
  const data = await request(`/api/orders/${id}/status`, {
    method: 'PUT',
    body: JSON.stringify({ status }),
  });
  return mapOrderFromApi(data);
}

export async function deleteOrder(id) {
  await request(`/api/orders/${id}`, { method: 'DELETE' });
  return true;
}

// ── Customers ─────────────────────────────────────────────────────────────────

export function mapCustomerFromApi(u) {
  return {
    id: u._id || u.id,
    name: u.username || u.name || u.email?.split('@')[0] || 'Unknown',
    email: u.email || '',
    phone: u.phone || u.phoneNumber || '—',
    city: u.city || '—',
    orders: u.orderCount ?? 0,
    joinedAt: u.createdAt ? new Date(u.createdAt).toLocaleDateString() : '',
  };
}

export async function fetchCustomers() {
  const data = await request('/api/users/customers');
  return (data || []).map(mapCustomerFromApi);
}
