import { productImageFallback } from '../utils/productImages';

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
    throw new Error(err.message?.[0]?.message || err.message || `API Error: ${res.status}`);
  }
  if (res.status === 204) return null;
  return res.json();
}

function normalizeImageUrl(url, fallbackId = 'gulit') {
  const fallback = productImageFallback(fallbackId);
  const value = String(url || '').trim().replace(/\\/g, '/');

  if (!value) return fallback;
  if (/^(data:|blob:)/i.test(value)) return value;
  if (/^\/\//.test(value)) return `https:${value}`;
  if (/^\/(uploads|public)\//i.test(value)) return new URL(value, API_BASE).toString();
  if (/^(uploads|public)\//i.test(value)) return new URL(value, `${API_BASE}/`).toString();

  try {
    new URL(value);
    return value;
  } catch {
    if (/^www\./i.test(value)) return `https://${value}`;
    if (/^[a-z]:\//i.test(value)) {
      const fileName = value.split('/').filter(Boolean).pop();
      return fileName ? new URL(`uploads/${fileName}`, `${API_BASE}/`).toString() : fallback;
    }

    try {
      return new URL(value.replace(/^\/+/, ''), `${API_BASE}/`).toString();
    } catch {
      return fallback;
    }
  }
}

function mapProductFromApi(apiProduct) {
  const rawImages = Array.isArray(apiProduct.images)
    ? apiProduct.images.filter(Boolean)
    : [];
  const normalizedImages = rawImages.map((img) => normalizeImageUrl(img, apiProduct._id || apiProduct.id));
  const image = normalizeImageUrl(rawImages[0] || apiProduct.image, apiProduct._id || apiProduct.id);

  return {
    id: apiProduct._id || apiProduct.id,
    name: apiProduct.title || apiProduct.name,
    price: apiProduct.price || 0,
    description: apiProduct.description || '',
    category: apiProduct.category || 'Uncategorized',
    categoryId: apiProduct.category || null,
    image,
    images: normalizedImages.length ? normalizedImages : [image].filter(Boolean),
    stock: apiProduct.stock || 0,
    tag: apiProduct.tag || null,
  };
}

function mapOrderFromApi(apiOrder) {
  const items = apiOrder.products || apiOrder.items || [];
  const subtotal = items.reduce((sum, item) => sum + ((Number(item.price) || 0) * (Number(item.quantity) || 0)), 0);

  return {
    apiId: apiOrder._id || apiOrder.apiId || apiOrder.id,
    id: apiOrder.orderCode || apiOrder.id || apiOrder._id,
    customerName: apiOrder.customerName || '',
    email: apiOrder.email || '',
    phoneNumber: apiOrder.phoneNumber || '',
    deliveryAddress: apiOrder.deliveryAddress || '',
    latitude: apiOrder.latitude ?? null,
    longitude: apiOrder.longitude ?? null,
    items: items.map((item) => ({
      id: item.productId || item.id,
      name: item.title || item.name,
      price: Number(item.price) || 0,
      quantity: Number(item.quantity) || 0,
    })),
    subtotal,
    deliveryFee: Number(apiOrder.deliveryFee) || 0,
    total: Number(apiOrder.totalAmount ?? apiOrder.total) || subtotal + (Number(apiOrder.deliveryFee) || 0),
    status: apiOrder.orderStatus || apiOrder.status || 'Pending',
    paymentMethod: apiOrder.paymentMethod === 'COD' ? 'Cash on Delivery (COD)' : apiOrder.paymentMethod || 'Cash on Delivery (COD)',
    paymentStatus: apiOrder.paymentStatus || 'pending',
    date: (apiOrder.createdAt || apiOrder.date || new Date().toISOString()).split('T')[0],
  };
}

function mapCustomerFromApi(apiCustomer) {
  return {
    id: apiCustomer._id || apiCustomer.id,
    name: apiCustomer.username || apiCustomer.name || apiCustomer.email || 'Registered Customer',
    email: apiCustomer.email || '',
    phone: apiCustomer.phone || '',
    address: apiCustomer.address || '',
    source: 'registered',
    createdAt: apiCustomer.createdAt || null,
  };
}

function mapOrderToApi(order, paymentMethod = 'COD') {
  return {
    customerName: order.customerName,
    email: order.email || '',
    phoneNumber: order.phoneNumber,
    deliveryAddress: order.deliveryAddress,
    latitude: order.latitude,
    longitude: order.longitude,
    products: (order.items || []).map((item) => ({
      productId: item.id,
      title: item.name,
      price: Number(item.price) || 0,
      quantity: Number(item.quantity) || 0,
    })),
    deliveryFee: Number(order.deliveryFee) || 0,
    paymentMethod,
  };
}

export function mapProductToApi(localProduct) {
  const images = Array.isArray(localProduct.images)
    ? localProduct.images.map((img) => String(img || '').trim()).filter(Boolean)
    : [];
  const primaryImage = String(localProduct.image || '').trim();

  return {
    title: localProduct.name,
    price: Number(localProduct.price) || 0,
    description: localProduct.description || '',
    category: localProduct.category || 'Uncategorized',
    images: primaryImage ? [primaryImage, ...images.filter((img) => img !== primaryImage)] : images,
    stock: Number(localProduct.stock) || 0,
  };
}

export async function fetchProducts() {
  const data = await request('/api/products');
  return (data || []).map(mapProductFromApi);
}

export async function fetchProduct(id) {
  const data = await request(`/api/products/${id}`);
  return mapProductFromApi(data);
}

export async function createProduct(productData) {
  const data = await request('/api/products', {
    method: 'POST',
    body: JSON.stringify(productData),
  });
  return mapProductFromApi(data);
}

export async function updateProduct(id, productData) {
  const data = await request(`/api/products/${id}`, {
    method: 'PUT',
    body: JSON.stringify(productData),
  });
  return mapProductFromApi(data);
}

export async function deleteProductFromApi(id) {
  await request(`/api/products/${id}`, { method: 'DELETE' });
  return true;
}

export async function fetchCategories() {
  const products = await fetchProducts();
  const unique = Array.from(new Set(products.map((product) => product.category || 'Uncategorized')));
  return unique.map((name) => ({ id: name, name }));
}

export async function fetchOrders() {
  const data = await request('/api/orders');
  return (data || []).map(mapOrderFromApi);
}

export async function fetchRegisteredCustomers() {
  const data = await request('/api/users/customers');
  return (data || []).map(mapCustomerFromApi);
}

export async function createOrder(orderData) {
  const data = await request('/api/orders', {
    method: 'POST',
    body: JSON.stringify(mapOrderToApi(orderData)),
  });
  return mapOrderFromApi(data);
}

export async function initializeChapaPayment(orderData) {
  const [firstName, ...lastNameParts] = String(orderData.customerName || '').trim().split(/\s+/);
  const payload = {
    amount: Number(orderData.total) || 0,
    email: orderData.email || 'customer@gulit.test',
    first_name: firstName || 'Gulit',
    last_name: lastNameParts.join(' ') || 'Customer',
    phone_number: orderData.phoneNumber,
    orderDraft: mapOrderToApi(orderData, 'CHAPA'),
  };

  return request('/api/payment/initialize', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export async function verifyChapaPayment(txRef) {
  const data = await request(`/api/payment/verify/${encodeURIComponent(txRef)}`);
  return {
    ...data,
    order: data.order ? mapOrderFromApi(data.order) : null,
  };
}

export async function updateOrderStatus(orderId, status) {
  const data = await request(`/api/orders/${orderId}/status`, {
    method: 'PUT',
    body: JSON.stringify({ status }),
  });
  return mapOrderFromApi(data);
}

export async function login(email, password) {
  const data = await request('/api/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email, password }),
  });
  accessToken = data.access_token;

  const fallbackRole = /admin/i.test(String(email || '')) || String(password || '') === 'admin123'
    ? 'admin'
    : 'customer';

  try {
    const payload = JSON.parse(atob(data.access_token.split('.')[1]));
    return {
      ...payload,
      access_token: data.access_token,
      refresh_token: data.refresh_token,
      role: payload.role || fallbackRole,
    };
  } catch {
    return {
      access_token: data.access_token,
      refresh_token: data.refresh_token,
      role: fallbackRole,
    };
  }
}

export async function fetchUsers() {
  return request('/api/users?limit=200');
}

export async function registerUser(userData) {
  return request('/api/users', {
    method: 'POST',
    body: JSON.stringify(userData),
  });
}
