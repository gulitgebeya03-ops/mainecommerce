// src/context/AppContext.jsx
import { createContext, useState, useEffect, useCallback } from 'react';
import {
  fetchProducts as apiFetchProducts,
  createProduct as apiCreateProduct,
  updateProduct as apiUpdateProduct,
  deleteProductFromApi,
  fetchOrders as apiFetchOrders,
  fetchMyOrders as apiFetchMyOrders,
  fetchRegisteredCustomers as apiFetchRegisteredCustomers,
  createOrder as apiCreateOrder,
  updateOrderStatus as apiUpdateOrderStatus,
  initializeChapaPayment as apiInitializeChapaPayment,
  mapProductToApi,
  setAccessToken,
  fetchWishlist as apiFetchWishlist,
  toggleWishlistItem as apiToggleWishlist,
  checkWishlist as apiCheckWishlist,
  fetchRecentSearches as apiFetchRecentSearches,
  saveSearch as apiSaveSearch,
} from '../services/api';
import { register as apiRegister, login as apiLogin, googleLogin as apiGoogleLogin } from '../services/auth';
import { SEED_PRODUCTS, CATEGORIES } from '../data/Products';

/* eslint-disable react-refresh/only-export-components */
export const AppContext = createContext();

const AUTH_STORAGE_KEY = 'gulit_auth';
const CART_STORAGE_KEY = 'gulit_cart';
const WISHLIST_STORAGE_KEY = 'gulit_wishlist';
const SEARCHES_STORAGE_KEY = 'gulit_recent_searches';
const SESSION_ID_KEY = 'gulit_session_id';

function readStoredAuth() {
  try {
    const stored = JSON.parse(localStorage.getItem(AUTH_STORAGE_KEY) || 'null');
    if (!stored?.token) return null;
    return stored;
  } catch {
    return null;
  }
}

function readStoredCart() {
  try {
    const stored = JSON.parse(localStorage.getItem(CART_STORAGE_KEY) || 'null');
    return Array.isArray(stored) ? stored : [];
  } catch {
    return [];
  }
}

function readStoredWishlist() {
  try {
    const stored = JSON.parse(localStorage.getItem(WISHLIST_STORAGE_KEY) || 'null');
    return Array.isArray(stored) ? stored : [];
  } catch {
    return [];
  }
}

function readStoredSearches() {
  try {
    const stored = JSON.parse(localStorage.getItem(SEARCHES_STORAGE_KEY) || 'null');
    return Array.isArray(stored) ? stored : [];
  } catch {
    return [];
  }
}

function getOrCreateSessionId() {
  let id = localStorage.getItem(SESSION_ID_KEY);
  if (!id) {
    id = `sess_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
    localStorage.setItem(SESSION_ID_KEY, id);
  }
  return id;
}

function normalizePhone(phone) {
  return String(phone || '').replace(/\s+/g, '');
}

function customerKey(customer) {
  const email = String(customer.email || '').trim().toLowerCase();
  const phone = normalizePhone(customer.phone || customer.phoneNumber);

  if (email) return `email:${email}`;
  if (phone) return `phone:${phone}`;
  return `id:${customer.id}`;
}

function customerFromOrder(order, index) {
  return {
    id: `GUEST-${order.id || order.apiId || index}`,
    name: order.customerName || 'Guest Customer',
    email: order.email || '',
    phone: order.phoneNumber || '',
    address: order.deliveryAddress || '',
    source: 'guest checkout',
  };
}

function mergeCustomers(existingCustomers = [], registeredCustomers = [], sourceOrders = []) {
  const customerMap = new Map();

  existingCustomers.forEach((customer) => {
    customerMap.set(customerKey(customer), customer);
  });

  registeredCustomers.forEach((customer) => {
    const key = customerKey(customer);
    customerMap.set(key, {
      ...customerMap.get(key),
      ...customer,
      source: 'registered',
    });
  });

  sourceOrders.forEach((order, index) => {
    const orderCustomer = customerFromOrder(order, index);
    const key = customerKey(orderCustomer);
    const existing = customerMap.get(key);

    customerMap.set(key, {
      ...orderCustomer,
      ...existing,
      email: existing?.email || orderCustomer.email,
      phone: existing?.phone || orderCustomer.phone,
      address: existing?.address || orderCustomer.address,
      source: existing?.source || orderCustomer.source,
    });
  });

  return Array.from(customerMap.values());
}

export const AppProvider = ({ children }) => {
  const [storedAuth] = useState(readStoredAuth);
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [isAdminLoggedIn, setIsAdminLoggedIn] = useState(storedAuth?.user?.role === 'admin');
  const [userRole, setUserRole] = useState(storedAuth?.user?.role || 'guest');
  const [authToken, setAuthToken] = useState(storedAuth?.token || null);
  const [currentCustomer, setCurrentCustomer] = useState(storedAuth?.user || null);
  const [cart, setCart] = useState(readStoredCart);
  const [wishlist, setWishlist] = useState(readStoredWishlist);
  const [recentSearches, setRecentSearches] = useState(readStoredSearches);
  const [deliveryFee, setDeliveryFee] = useState(150);
  const [loading, setLoading] = useState(true);
  const sessionId = getOrCreateSessionId();

  const [orders, setOrders] = useState([
    {
      id: "ORD-101",
      customerName: "Abebe Kebede",
      phoneNumber: "0911223344",
      deliveryAddress: "Bole, Khartoum St, Addis Ababa",
      latitude: 9.0108,
      longitude: 38.7892,
      items: [
        { id: 1, name: "MacBook Pro 14\"", price: 95000, quantity: 1 }
      ],
      subtotal: 95000,
      deliveryFee: 150,
      total: 95150,
      status: "Delivered",
      date: "2026-06-01"
    },
    {
      id: "ORD-102",
      customerName: "Chaltu Ibrahim",
      phoneNumber: "0912345678",
      deliveryAddress: "Megenagna, Ring Road, Addis Ababa",
      latitude: 9.0272,
      longitude: 38.8025,
      items: [
        { id: 13, name: "Nike Air Max 270", price: 8500, quantity: 2 }
      ],
      subtotal: 17000,
      deliveryFee: 150,
      total: 17150,
      status: "Pending",
      date: "2026-06-10"
    }
  ]);

  const [customers, setCustomers] = useState([
    { id: "CUST-1", name: "Abebe Kebede", phone: "0911223344", address: "Bole, Khartoum St, Addis Ababa" },
    { id: "CUST-2", name: "Chaltu Ibrahim", phone: "0912345678", address: "Megenagna, Ring Road, Addis Ababa" }
  ]);

  useEffect(() => {
    if (authToken) {
      setAccessToken(authToken);
    }

    let cancelled = false;
    async function loadData() {
      try {
        const isCustomer = userRole === 'customer';
        const apiCalls = [
          apiFetchProducts(),
          apiFetchRegisteredCustomers(),
        ];
        if (authToken && isCustomer) {
          apiCalls.push(apiFetchMyOrders());
          apiCalls.push(apiFetchWishlist().catch(() => []));
        } else if (authToken) {
          apiCalls.push(apiFetchOrders());
        } else {
          apiCalls.push(Promise.resolve([]));
        }
        const [apiProducts, apiRegisteredCustomersResult, apiOrders, apiWishlistResult] = await Promise.allSettled(apiCalls);
        if (cancelled) return;
        const productsResult = apiProducts.status === 'fulfilled' ? apiProducts.value : [];
        const ordersResult = apiOrders.status === 'fulfilled' ? apiOrders.value : [];
        const registeredCustomers = apiRegisteredCustomersResult.status === 'fulfilled' ? apiRegisteredCustomersResult.value : [];
        const loadedProducts = productsResult?.length ? productsResult : SEED_PRODUCTS;
        setProducts(loadedProducts);
        setCategories(Array.from(new Set(loadedProducts.map(p => p.category || 'Uncategorized'))));
        if (ordersResult?.length) {
          setOrders(ordersResult);
        }
        setCustomers(prev => mergeCustomers(prev, registeredCustomers, ordersResult));

        if (isCustomer && apiWishlistResult?.status === 'fulfilled' && apiWishlistResult.value?.length) {
          setWishlist(apiWishlistResult.value.map((p) => ({ ...p, id: p._id || p.id })));
        }
      } catch (err) {
        console.error('Failed to load API data:', err);
        if (!cancelled) {
          setProducts(SEED_PRODUCTS);
          setCategories(CATEGORIES.filter(c => c !== 'All'));
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    loadData();
    return () => { cancelled = true; };
  }, [authToken, userRole]);

  useEffect(() => {
    localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cart));
  }, [cart]);

  useEffect(() => {
    localStorage.setItem(WISHLIST_STORAGE_KEY, JSON.stringify(wishlist));
  }, [wishlist]);

  useEffect(() => {
    localStorage.setItem(SEARCHES_STORAGE_KEY, JSON.stringify(recentSearches));
  }, [recentSearches]);

  const addToCart = (product, quantity = 1) => {
    setCart((prevCart) => {
      const existing = prevCart.find(item => item.product.id === product.id);
      if (existing) {
        const newQty = existing.quantity + quantity;
        if (newQty > product.stock) return prevCart;
        return prevCart.map(item => item.product.id === product.id ? { ...item, quantity: newQty } : item);
      }
      return [...prevCart, { product, quantity }];
    });
  };

  const updateCartQuantity = (productId, amount) => {
    setCart((prevCart) => {
      return prevCart.map(item => {
        if (item.product.id === productId) {
          const match = products.find(p => p.id === productId);
          const targets = item.quantity + amount;
          if (targets <= 0) return null;
          if (match && targets > match.stock) return item;
          return { ...item, quantity: targets };
        }
        return item;
      }).filter(Boolean);
    });
  };

  const removeFromCart = (productId) => {
    setCart(prev => prev.filter(item => item.product.id !== productId));
  };

  const clearCart = () => setCart([]);

  const persistAuthState = useCallback((token, user, role = 'customer') => {
    setAuthToken(token);
    setAccessToken(token);
    setIsAdminLoggedIn(role === 'admin');
    setUserRole(role);
    setCurrentCustomer(user);
    localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify({ token, user }));
  }, []);

  const refreshProducts = useCallback(async () => {
    try {
      const apiProducts = await apiFetchProducts();
      setProducts(apiProducts || []);
    } catch (err) {
      console.error('Failed to refresh products:', err);
    }
  }, []);

  const applyOrderLocally = (newOrder) => {
    setProducts(prevProducts =>
      prevProducts.map(p => {
        const orderedItem = cart.find(c => c.product.id === p.id);
        if (orderedItem) {
          return { ...p, stock: Math.max(0, p.stock - orderedItem.quantity) };
        }
        return p;
      })
    );

    setOrders(prev => [newOrder, ...prev.filter(order => order.id !== newOrder.id)]);
    setCustomers(prev => mergeCustomers(prev, [], [newOrder]));
    clearCart();
  };

  const buildOrderFromCart = (customerDetails, paymentMethod = "Cash on Delivery (COD)", coords = {}) => {
    const subtotal = cart.reduce((sum, item) => sum + (item.product.price * item.quantity), 0);
    const total = subtotal + deliveryFee;
    const newOrderId = `ORD-${Math.floor(100 + Math.random() * 900)}`;

    return {
      id: newOrderId,
      customerName: customerDetails.name,
      email: customerDetails.email || '',
      phoneNumber: customerDetails.phone,
      deliveryAddress: customerDetails.address,
      latitude: coords.latitude ?? null,
      longitude: coords.longitude ?? null,
      items: cart.map(item => ({
        id: item.product.id,
        name: item.product.name,
        price: item.product.price,
        quantity: item.quantity
      })),
      subtotal,
      deliveryFee,
      total,
      status: "Pending",
      paymentMethod,
      date: new Date().toISOString().split('T')[0]
    };
  };

  const placeOrder = async (customerDetails, coords = {}) => {
    if (!currentCustomer || userRole !== 'customer') {
      throw new Error('Please sign in to place an order.');
    }

    const newOrder = buildOrderFromCart(customerDetails, "Cash on Delivery (COD)", coords);
    try {
      const savedOrder = await apiCreateOrder(newOrder);
      applyOrderLocally(savedOrder);
      return savedOrder.id;
    } catch (err) {
      console.error('Failed to create API order:', err);
      applyOrderLocally(newOrder);
      return newOrder.id;
    }
  };

  const startChapaPayment = async (customerDetails, coords = {}) => {
    if (!currentCustomer || userRole !== 'customer') {
      throw new Error('Please sign in to place an order.');
    }

    const newOrder = buildOrderFromCart(customerDetails, "CHAPA", coords);
    const result = await apiInitializeChapaPayment(newOrder);
    const checkoutUrl = result?.data?.checkout_url || result?.data?.checkoutUrl;
    if (!checkoutUrl) {
      throw new Error('Chapa did not return a checkout URL.');
    }
    clearCart();
    return checkoutUrl;
  };

  const createProduct = async (prodData) => {
    try {
      const apiData = mapProductToApi(prodData);
      const created = await apiCreateProduct(apiData);
      setProducts(prev => [...prev, { ...created, stock: Number(prodData.stock) || 10, tag: prodData.tag || null }]);
      setCategories(prev => Array.from(new Set([...prev, created.category || prodData.category || 'Uncategorized'])));
      return created;
    } catch (err) {
      console.error('Failed to create product:', err);
      const fallback = {
        id: `local-${Date.now()}`,
        name: prodData.name,
        price: Number(prodData.price) || 0,
        stock: Number(prodData.stock) || 0,
        category: prodData.category || 'Uncategorized',
        description: prodData.description || '',
        image: prodData.image || `https://picsum.photos/seed/${Date.now()}/600/400`,
        tag: prodData.tag || null,
      };
      setProducts(prev => [fallback, ...prev]);
      setCategories(prev => Array.from(new Set([...prev, fallback.category])));
      return fallback;
    }
  };

  const updateProduct = async (id, updatedData) => {
    try {
      const apiData = mapProductToApi(updatedData);
      const updated = await apiUpdateProduct(id, apiData);
      setProducts(prev => prev.map(p => p.id === id ? {
        ...updated,
        stock: updatedData.stock !== undefined ? Number(updatedData.stock) : p.stock,
        tag: updatedData.tag ?? p.tag,
      } : p));
      return updated;
    } catch (err) {
      console.error('Failed to update product:', err);
      setProducts(prev => prev.map(p => p.id === id ? { ...p, ...updatedData, price: Number(updatedData.price) || 0, stock: Number(updatedData.stock) || 0 } : p));
      setCategories(prev => Array.from(new Set([...prev, updatedData.category || 'Uncategorized'])));
      return updatedData;
    }
  };

  const deleteProduct = async (id) => {
    try {
      await deleteProductFromApi(id);
      setProducts(prev => prev.filter(p => p.id !== id));
    } catch (err) {
      console.error('Failed to delete product:', err);
      setProducts(prev => prev.filter(p => p.id !== id));
    }
  };

  const updateStockDirectly = (id, newStock) => {
    setProducts(prev => prev.map(p => p.id === id ? { ...p, stock: Math.max(0, Number(newStock)) } : p));
  };

  const updateOrderStatus = async (orderId, newStatus) => {
    const targetOrder = orders.find((order) => order.id === orderId || order.apiId === orderId);
    setOrders((prev) => prev.map((order) => (order.id === orderId || order.apiId === orderId ? { ...order, status: newStatus } : order)));

    if (!targetOrder?.apiId) return;

    try {
      const updatedOrder = await apiUpdateOrderStatus(targetOrder.apiId, newStatus);
      setOrders((prev) => prev.map((order) => {
        if (order.id === orderId || order.apiId === targetOrder.apiId) {
          return { ...order, ...updatedOrder, status: updatedOrder.status || newStatus };
        }
        return order;
      }));
    } catch (err) {
      console.error('Failed to update API order status:', err);
    }
  };

  const handleLogin = async (email, password) => {
    const normalizedEmail = String(email || '').trim().toLowerCase();
    try {
      const result = await apiLogin(normalizedEmail, password);
      const token = result.access_token || result.token || (result.user && result.user.token);
      if (!token) {
        return { success: false, error: 'Login response did not include an access token.' };
      }

      const role = (result.user && result.user.role) || result.role || 'customer';
      const user = result.user || { email: normalizedEmail, role };
      persistAuthState(token, user, role);
      if (role === 'admin') {
        const registeredCustomers = await apiFetchRegisteredCustomers().catch(() => []);
        setCustomers(prev => mergeCustomers(prev, registeredCustomers, orders));
      }
      return { success: true, role, user };
    } catch (err) {
      return { success: false, error: err.message };
    }
  };

  const handleRegister = async (username, email, password, adminCode, role = 'customer') => {
    const normalizedEmail = String(email || '').trim().toLowerCase();
    const normalizedUsername = String(username || '').trim();
    const resolvedRole = ['admin', 'salesman', 'customer'].includes(role) ? role : 'customer';

    try {
      const payload = { username: normalizedUsername, email: normalizedEmail, password, role: resolvedRole };
      if (adminCode && ['admin', 'salesman'].includes(resolvedRole)) {
        payload.adminSecret = adminCode;
      }
      const res = await apiRegister(payload);

      try {
        const loginResult = await apiLogin(normalizedEmail, password);
        const token = loginResult.access_token || loginResult.token || (loginResult.user && loginResult.user.token);
        const loginRole = (loginResult.user && loginResult.user.role) || loginResult.role || 'customer';
        const loginUser = loginResult.user || { id: res.id || res._id, username: normalizedUsername, email: normalizedEmail, role: loginRole };
        if (token) {
          persistAuthState(token, loginUser, loginRole);
          return { success: true, role: loginRole, user: loginUser, data: res };
        }
      } catch (loginErr) {
        console.error('Auto-login after registration failed:', loginErr);
      }

      const fallbackUser = { id: res.id || res._id, username: normalizedUsername, email: normalizedEmail, role: resolvedRole };
      setIsAdminLoggedIn(resolvedRole === 'admin');
      setUserRole(resolvedRole);
      setCurrentCustomer(fallbackUser);
      localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify({ token: null, user: fallbackUser }));
      return { success: true, role: resolvedRole, user: fallbackUser, data: res };
    } catch (err) {
      return { success: false, error: err.message };
    }
  };

  const handleLogout = () => {
    setIsAdminLoggedIn(false);
    setUserRole('guest');
    setAuthToken(null);
    setAccessToken(null);
    setCurrentCustomer(null);
    localStorage.removeItem(AUTH_STORAGE_KEY);
  };

  const handleGoogleLogin = async (idToken) => {
    try {
      const result = await apiGoogleLogin(idToken);
      const token = result.access_token || result.token;
      if (!token) {
        return { success: false, error: 'Google login did not return a token.' };
      }
      const role = result.role || 'customer';
      const user = result.user || { email: result.email, username: result.name, role };
      persistAuthState(token, user, role);
      return { success: true, role, user };
    } catch (err) {
      return { success: false, error: err.message };
    }
  };

  // ── Wishlist ────────────────────────────────────────────────────────────────

  const toggleWishlist = (product) => {
    setWishlist((prev) => {
      const exists = prev.some((p) => p.id === product.id);
      if (exists) return prev.filter((p) => p.id !== product.id);
      return [...prev, product];
    });
    if (authToken && product.apiId) {
      apiToggleWishlist(product.apiId).catch(() => {});
    }
  };

  const isWishlisted = (productId) => wishlist.some((p) => p.id === productId);

  // ── Recent Searches ─────────────────────────────────────────────────────────

  const addRecentSearch = async (query) => {
    if (!query || !query.trim()) return;
    const trimmed = query.trim();
    setRecentSearches((prev) => {
      const filtered = prev.filter((s) => s.toLowerCase() !== trimmed.toLowerCase());
      return [trimmed, ...filtered].slice(0, 10);
    });
    if (authToken) {
      try { await apiSaveSearch(trimmed, sessionId); } catch {}
    }
  };

  const removeRecentSearch = (query) => {
    setRecentSearches((prev) => prev.filter((s) => s !== query));
  };

  const clearRecentSearches = () => setRecentSearches([]);

  return (
    <AppContext.Provider value={{
      products, categories, orders, customers, deliveryFee, setDeliveryFee,
      cart, addToCart, updateCartQuantity, removeFromCart, clearCart, placeOrder, startChapaPayment,
      createProduct, updateProduct, deleteProduct, updateStockDirectly, updateOrderStatus,
      isAdminLoggedIn, setIsAdminLoggedIn, currentCustomer, setCurrentCustomer,
      userRole, authToken, handleLogin, handleRegister, handleLogout, handleGoogleLogin, loading, refreshProducts,
      wishlist, toggleWishlist, isWishlisted,
      recentSearches, addRecentSearch, removeRecentSearch, clearRecentSearches,
    }}>
      {children}
    </AppContext.Provider>
  );
};
