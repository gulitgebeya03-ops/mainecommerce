// src/data/Products.js

export const CATEGORIES = ["All", "Electronics", "Fashion", "Home", "Sports", "Books"];

export const SORT_OPTIONS = ["Featured", "Price: Low to High", "Price: High to Low", "In Stock"];

export const SEED_PRODUCTS = [
  {
    id: "seed-1",
    name: "Samsung Galaxy A55",
    price: 38500,
    stock: 8,
    category: "Electronics",
    description: "128GB storage, bright AMOLED display, dual SIM support, and all-day battery.",
    image: "https://images.unsplash.com/photo-1598327105666-5b89351aff97?auto=format&fit=crop&w=800&q=80",
    tag: "New",
  },
  {
    id: "seed-2",
    name: "Leather Crossbody Bag",
    price: 4200,
    stock: 14,
    category: "Fashion",
    description: "Compact everyday bag with adjustable strap and secure zip pockets.",
    image: "https://images.unsplash.com/photo-1594223274512-ad4803739b7c?auto=format&fit=crop&w=800&q=80",
  },
  {
    id: "seed-3",
    name: "Ceramic Dinner Set",
    price: 6800,
    stock: 5,
    category: "Home",
    description: "Durable 16-piece dinner set for family meals and small gatherings.",
    image: "https://images.unsplash.com/photo-1603199506016-b9a594b593c0?auto=format&fit=crop&w=800&q=80",
  },
  {
    id: "seed-4",
    name: "Running Shoes",
    price: 7900,
    stock: 10,
    category: "Sports",
    description: "Lightweight road running shoes with breathable mesh upper.",
    image: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=800&q=80",
    tag: "Hot",
  },
  {
    id: "seed-5",
    name: "Atomic Habits",
    price: 1250,
    stock: 20,
    category: "Books",
    description: "Practical guide to building better habits and improving daily systems.",
    image: "https://images.unsplash.com/photo-1512820790803-83ca734da794?auto=format&fit=crop&w=800&q=80",
  },
  {
    id: "seed-6",
    name: "Bluetooth Speaker",
    price: 3600,
    stock: 3,
    category: "Electronics",
    description: "Portable speaker with clear sound, USB-C charging, and splash resistance.",
    image: "https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?auto=format&fit=crop&w=800&q=80",
  },
];

export function formatPrice(n) {
  return "ETB " + n.toLocaleString();
}
