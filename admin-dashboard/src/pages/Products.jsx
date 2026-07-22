import { useState, useEffect, useRef } from 'react';
import { Plus, Search, Edit2, Trash2, X, ImagePlus, Loader2, AlertCircle, PackageSearch } from 'lucide-react';
import { fetchProducts, createProduct, updateProduct, deleteProduct } from '../services/api';

const EMPTY_FORM = {
  name: '',
  description: '',
  price: '',
  stock: '',
  category: '',
  image: '',
};

function FormField({ label, error, children }) {
  return (
    <div>
      <label className="block text-sm font-medium text-text-primary mb-1">{label}</label>
      {children}
      {error && <p className="text-red-500 text-xs mt-1">{error}</p>}
    </div>
  );
}

function validate(form) {
  const errors = {};
  if (!form.name.trim())              errors.name     = 'Name is required';
  if (!form.price || isNaN(Number(form.price)) || Number(form.price) < 0)
                                       errors.price    = 'Valid price is required';
  if (!form.stock || isNaN(Number(form.stock)) || Number(form.stock) < 0)
                                       errors.stock    = 'Valid stock is required';
  if (!form.category.trim())           errors.category = 'Category is required';
  return errors;
}

function ProductModal({ product, onClose, onSaved }) {
  const [form, setForm] = useState(product
    ? { name: product.name, description: product.description, price: String(product.price),
        stock: String(product.stock), category: product.category, image: product.image || '' }
    : EMPTY_FORM
  );
  const [errors, setErrors]     = useState({});
  const [saving, setSaving]     = useState(false);
  const [apiError, setApiError] = useState('');
  const fileRef                 = useRef();

  const set = (field, value) => {
    setForm(prev => ({ ...prev, [field]: value }));
    setErrors(prev => ({ ...prev, [field]: undefined }));
  };

  const handleImageFile = (file) => {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (e) => set('image', e.target.result);
    reader.readAsDataURL(file);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errs = validate(form);
    if (Object.keys(errs).length) { setErrors(errs); return; }

    setSaving(true);
    setApiError('');
    try {
      const payload = {
        name:        form.name.trim(),
        description: form.description.trim(),
        price:       Number(form.price),
        stock:       Number(form.stock),
        category:    form.category.trim(),
        images:      form.image ? [form.image] : [],
      };
      const saved = product
        ? await updateProduct(product.id, payload)
        : await createProduct(payload);
      onSaved(saved, !!product);
    } catch (err) {
      setApiError(err.message || 'Something went wrong.');
    } finally {
      setSaving(false);
    }
  };

  const inputCls = "w-full px-3 py-2.5 bg-surface border border-border-light rounded-lg text-dark placeholder-text-muted focus:ring-2 focus:ring-gold/30 focus:border-gold text-sm";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-dark/30 backdrop-blur-sm">
      <div className="bg-white rounded-2xl w-full max-w-lg shadow-xl max-h-[90vh] flex flex-col border border-border-light">
        <div className="flex items-center justify-between px-6 py-4 border-b border-border-light">
          <h2 className="text-lg font-semibold text-dark">
            {product ? 'Edit Product' : 'Add New Product'}
          </h2>
          <button onClick={onClose} className="text-text-muted hover:text-dark transition">
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="overflow-y-auto flex-1 px-6 py-5 space-y-4">
          {apiError && (
            <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm">
              <AlertCircle size={16} className="shrink-0" />
              {apiError}
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-text-primary mb-2">Product Image</label>
            <div
              onClick={() => fileRef.current?.click()}
              className="relative w-full h-36 rounded-lg border-2 border-dashed border-border-light hover:border-gold transition cursor-pointer flex items-center justify-center overflow-hidden bg-surface"
            >
              {form.image ? (
                <>
                  <img src={form.image} alt="preview" className="w-full h-full object-cover" />
                  <div className="absolute inset-0 bg-dark/50 flex items-center justify-center opacity-0 hover:opacity-100 transition">
                    <p className="text-white text-xs font-medium">Click to change</p>
                  </div>
                </>
              ) : (
                <div className="flex flex-col items-center gap-2 text-text-muted">
                  <ImagePlus size={28} />
                  <p className="text-xs">Click to upload image</p>
                </div>
              )}
            </div>
            <input
              ref={fileRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => handleImageFile(e.target.files[0])}
            />
            <input
              type="text"
              value={form.image.startsWith('data:') ? '' : form.image}
              onChange={(e) => set('image', e.target.value)}
              placeholder="Or paste an image URL..."
              className={`${inputCls} mt-2`}
            />
          </div>

          <FormField label="Product Name *" error={errors.name}>
            <input
              type="text"
              value={form.name}
              onChange={(e) => set('name', e.target.value)}
              placeholder='e.g. MacBook Pro 14"'
              className={inputCls}
            />
          </FormField>

          <FormField label="Description" error={errors.description}>
            <textarea
              value={form.description}
              onChange={(e) => set('description', e.target.value)}
              placeholder="Short product description..."
              rows={3}
              className={`${inputCls} resize-none`}
            />
          </FormField>

          <div className="grid grid-cols-2 gap-4">
            <FormField label="Price (ETB) *" error={errors.price}>
              <input
                type="number"
                min="0"
                step="0.01"
                value={form.price}
                onChange={(e) => set('price', e.target.value)}
                placeholder="0.00"
                className={inputCls}
              />
            </FormField>

            <FormField label="Stock *" error={errors.stock}>
              <input
                type="number"
                min="0"
                step="1"
                value={form.stock}
                onChange={(e) => set('stock', e.target.value)}
                placeholder="0"
                className={inputCls}
              />
            </FormField>
          </div>

          <FormField label="Category *" error={errors.category}>
            <input
              type="text"
              value={form.category}
              onChange={(e) => set('category', e.target.value)}
              placeholder="e.g. Electronics, Clothing..."
              className={inputCls}
            />
          </FormField>
        </form>

        <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-border-light">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-sm text-text-muted hover:text-dark transition"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={saving}
            className="flex items-center gap-2 px-5 py-2 bg-dark hover:bg-gray-800 disabled:bg-gray-400 text-white text-sm font-semibold rounded-lg transition"
          >
            {saving && <Loader2 size={16} className="animate-spin" />}
            {saving ? 'Saving...' : product ? 'Save Changes' : 'Add Product'}
          </button>
        </div>
      </div>
    </div>
  );
}

function DeleteModal({ product, onClose, onDeleted }) {
  const [deleting, setDeleting] = useState(false);
  const [apiError, setApiError] = useState('');

  const handleDelete = async () => {
    setDeleting(true);
    setApiError('');
    try {
      await deleteProduct(product.id);
      onDeleted(product.id);
    } catch (err) {
      setApiError(err.message || 'Delete failed.');
      setDeleting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-dark/30 backdrop-blur-sm">
      <div className="bg-white rounded-2xl w-full max-w-sm shadow-xl p-6 border border-border-light">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2 bg-red-50 rounded-lg">
            <Trash2 size={20} className="text-red-500" />
          </div>
          <h2 className="text-lg font-semibold text-dark">Delete Product</h2>
        </div>
        <p className="text-text-muted text-sm mb-2">
          Are you sure you want to delete <span className="text-dark font-medium">"{product.name}"</span>?
          This action cannot be undone.
        </p>
        {apiError && (
          <p className="text-red-500 text-sm mt-2 mb-2">{apiError}</p>
        )}
        <div className="flex gap-3 mt-6">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-2 text-sm text-text-muted border border-border-light hover:border-dark hover:text-dark rounded-lg transition"
          >
            Cancel
          </button>
          <button
            onClick={handleDelete}
            disabled={deleting}
            className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-red-500 hover:bg-red-600 disabled:bg-red-300 text-white text-sm font-semibold rounded-lg transition"
          >
            {deleting && <Loader2 size={16} className="animate-spin" />}
            {deleting ? 'Deleting...' : 'Delete'}
          </button>
        </div>
      </div>
    </div>
  );
}

function ProductCard({ product, onEdit, onDelete }) {
  const [imgError, setImgError] = useState(false);

  return (
    <div className="bg-white border border-border-light rounded-xl overflow-hidden hover:shadow-md transition-shadow duration-200 flex flex-col">
      <div className="w-full h-40 bg-surface flex items-center justify-center overflow-hidden">
        {product.image && !imgError ? (
          <img
            src={product.image}
            alt={product.name}
            onError={() => setImgError(true)}
            className="w-full h-full object-cover"
          />
        ) : (
          <PackageSearch size={40} className="text-text-muted/30" />
        )}
      </div>
      <div className="p-4 flex flex-col flex-1">
        <h3 className="text-base font-semibold text-dark mb-1 line-clamp-1">{product.name}</h3>
        <p className="text-text-muted text-xs mb-3 line-clamp-1">{product.category}</p>
        {product.description && (
          <p className="text-text-muted text-xs mb-3 line-clamp-2">{product.description}</p>
        )}
        <div className="mt-auto">
          <div className="flex items-center justify-between mb-4">
            <p className="text-lg font-bold text-dark">
              ETB {Number(product.price).toLocaleString()}
            </p>
            <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
              product.stock > 10
                ? 'bg-green-50 text-green-600'
                : product.stock > 0
                ? 'bg-amber-50 text-amber-600'
                : 'bg-red-50 text-red-500'
            }`}>
              {product.stock > 0 ? `Stock: ${product.stock}` : 'Out of stock'}
            </span>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => onEdit(product)}
              className="flex-1 flex items-center justify-center gap-2 bg-surface hover:bg-border-light text-dark py-2 rounded-lg transition text-sm font-medium"
            >
              <Edit2 size={14} />
              Edit
            </button>
            <button
              onClick={() => onDelete(product)}
              className="flex-1 flex items-center justify-center gap-2 bg-red-50 hover:bg-red-100 text-red-500 py-2 rounded-lg transition text-sm font-medium"
            >
              <Trash2 size={14} />
              Delete
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function Products() {
  const [products, setProducts]           = useState([]);
  const [loadingProducts, setLoadingProducts] = useState(true);
  const [fetchError, setFetchError]       = useState('');
  const [search, setSearch]               = useState('');
  const [modalProduct, setModalProduct]   = useState(undefined);
  const [deleteTarget, setDeleteTarget]   = useState(null);

  useEffect(() => {
    let cancelled = false;
    setLoadingProducts(true);
    fetchProducts()
      .then((data) => { if (!cancelled) { setProducts(data); setFetchError(''); } })
      .catch((err) => { if (!cancelled) setFetchError(err.message || 'Failed to load products.'); })
      .finally(() => { if (!cancelled) setLoadingProducts(false); });
    return () => { cancelled = true; };
  }, []);

  const filtered = products.filter((p) => {
    const q = search.toLowerCase();
    return p.name.toLowerCase().includes(q) || p.category.toLowerCase().includes(q);
  });

  const handleSaved = (saved, isEdit) => {
    if (isEdit) {
      setProducts((prev) => prev.map((p) => p.id === saved.id ? saved : p));
    } else {
      setProducts((prev) => [saved, ...prev]);
    }
    setModalProduct(undefined);
  };

  const handleDeleted = (id) => {
    setProducts((prev) => prev.filter((p) => p.id !== id));
    setDeleteTarget(null);
  };

  return (
    <div className="p-8 min-h-screen">
      <div className="max-w-7xl mx-auto">

        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold text-dark tracking-tight">Products</h1>
            <p className="text-text-muted text-sm mt-1">
              {loadingProducts ? 'Loading...' : `${products.length} product${products.length !== 1 ? 's' : ''} total`}
            </p>
          </div>
          <button
            onClick={() => setModalProduct(null)}
            className="flex items-center gap-2 bg-dark hover:bg-gray-800 text-white px-4 py-2 rounded-lg transition text-sm font-semibold"
          >
            <Plus size={18} />
            Add Product
          </button>
        </div>

        <div className="mb-6">
          <div className="relative max-w-md">
            <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by name or category..."
              className="w-full pl-10 pr-4 py-2 bg-white border border-border-light rounded-lg text-dark placeholder-text-muted focus:ring-2 focus:ring-gold/30 focus:border-gold text-sm"
            />
          </div>
        </div>

        {loadingProducts ? (
          <div className="flex items-center justify-center py-24 gap-3 text-text-muted">
            <Loader2 size={24} className="animate-spin" />
            <span>Loading products...</span>
          </div>
        ) : fetchError ? (
          <div className="flex flex-col items-center justify-center py-24 gap-3 text-red-500">
            <AlertCircle size={32} />
            <p className="font-medium">{fetchError}</p>
            <button
              onClick={() => window.location.reload()}
              className="text-sm text-gold hover:underline"
            >
              Retry
            </button>
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 gap-3 text-text-muted/50">
            <PackageSearch size={40} />
            <p className="font-medium text-text-muted">
              {search ? 'No products match your search.' : 'No products yet. Add one to get started.'}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
            {filtered.map((product) => (
              <ProductCard
                key={product.id}
                product={product}
                onEdit={(p) => setModalProduct(p)}
                onDelete={(p) => setDeleteTarget(p)}
              />
            ))}
          </div>
        )}
      </div>

      {modalProduct !== undefined && (
        <ProductModal
          product={modalProduct}
          onClose={() => setModalProduct(undefined)}
          onSaved={handleSaved}
        />
      )}

      {deleteTarget && (
        <DeleteModal
          product={deleteTarget}
          onClose={() => setDeleteTarget(null)}
          onDeleted={handleDeleted}
        />
      )}
    </div>
  );
}
