import { useContext, useEffect, useMemo, useState } from "react";
import { AppContext } from "../context/AppContext";
import { CheckCircle, Edit3, PackagePlus, Save, Trash2, X } from "lucide-react";
import { handleProductImageError, productImageFallback } from "../utils/productImages";

const emptyForm = {
  name: "",
  price: "",
  stock: "",
  category: "",
  description: "",
  image: "",
  tag: "",
};

function readFileAsDataUrl(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result || "");
    reader.onerror = () => reject(new Error("Could not read the selected image."));
    reader.readAsDataURL(file);
  });
}

function resizeImageDataUrl(dataUrl, maxSize = 1200, quality = 0.85) {
  return new Promise((resolve) => {
    const image = new Image();
    image.onload = () => {
      const scale = Math.min(1, maxSize / Math.max(image.width, image.height));
      const canvas = document.createElement("canvas");
      canvas.width = Math.max(1, Math.round(image.width * scale));
      canvas.height = Math.max(1, Math.round(image.height * scale));
      const context = canvas.getContext("2d");

      if (!context) {
        resolve(dataUrl);
        return;
      }

      context.drawImage(image, 0, 0, canvas.width, canvas.height);
      resolve(canvas.toDataURL("image/jpeg", quality));
    };
    image.onerror = () => resolve(dataUrl);
    image.src = dataUrl;
  });
}

const Products = () => {
  const { products, categories, createProduct, updateProduct, deleteProduct, updateStockDirectly } = useContext(AppContext);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [formOpen, setFormOpen] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [saving, setSaving] = useState(false);

  const categoryOptions = useMemo(() => {
    return Array.from(new Set([...(categories || []), ...products.map((p) => p.category).filter(Boolean)]));
  }, [categories, products]);

  useEffect(() => {
    if (!success) return undefined;
    const timer = setTimeout(() => setSuccess(""), 5000);
    return () => clearTimeout(timer);
  }, [success]);

  const resetForm = () => {
    setForm(emptyForm);
    setEditingId(null);
    setFormOpen(false);
    setError("");
  };

  const openNewForm = () => {
    setForm(emptyForm);
    setEditingId(null);
    setFormOpen(true);
    setError("");
    setSuccess("");
  };

  const openEditForm = (product) => {
    setForm({
      name: product.name || "",
      price: product.price || "",
      stock: product.stock || "",
      category: product.category || "",
      description: product.description || "",
      image: product.image || "",
      tag: product.tag || "",
    });
    setEditingId(product.id);
    setFormOpen(true);
    setError("");
    setSuccess("");
  };

  const handleChange = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleImageFileChange = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setError("Please choose a valid image file.");
      return;
    }

    try {
      const dataUrl = await readFileAsDataUrl(file);
      const image = /^image\/(png|jpe?g|webp)$/i.test(file.type)
        ? await resizeImageDataUrl(dataUrl)
        : dataUrl;
      setForm((prev) => ({ ...prev, image }));
      setError("");
    } catch (err) {
      setError(err.message || "Could not read the selected image.");
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");
    setSuccess("");

    if (!form.name.trim()) {
      setError("Product name is required.");
      return;
    }

    if (!form.price || Number(form.price) <= 0) {
      setError("Enter a valid product price.");
      return;
    }

    setSaving(true);
    const payload = {
      name: form.name.trim(),
      price: Number(form.price),
      stock: Number(form.stock) || 0,
      category: form.category.trim() || "Uncategorized",
      description: form.description.trim(),
      image: form.image.trim(),
      tag: form.tag.trim(),
    };

    try {
      if (editingId) {
        await updateProduct(editingId, payload);
        setSuccess(`${payload.name} was updated successfully.`);
      } else {
        await createProduct(payload);
        setSuccess(`${payload.name} was added successfully.`);
      }
      resetForm();
    } catch (err) {
      setError(err.message || "Failed to save product.");
    } finally {
      setSaving(false);
    }
  };

  const inputCls = "mt-1 w-full border border-border-light rounded-lg p-2.5 text-sm bg-surface focus:outline-none focus:ring-2 focus:ring-gold/30 focus:border-gold";

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-dark tracking-tight">Product Management</h1>
          <p className="text-sm text-text-muted">Create products, update categories, and keep stock current.</p>
        </div>
        <button
          type="button"
          onClick={openNewForm}
          className="inline-flex items-center justify-center gap-2 bg-dark text-white px-4 py-2 rounded-lg hover:bg-gray-800 text-sm font-semibold"
        >
          <PackagePlus size={16} /> Add Product
        </button>
      </div>

      {success && (
        <div className="mb-6 bg-green-50 border border-green-200 text-green-600 rounded-lg p-3 flex items-center justify-between gap-3 text-sm">
          <span className="flex items-center gap-2 font-semibold">
            <CheckCircle size={18} className="shrink-0" />
            {success}
          </span>
          <button type="button" onClick={() => setSuccess("")} className="p-1 rounded-md hover:bg-green-100" aria-label="Dismiss success message">
            <X size={16} />
          </button>
        </div>
      )}

      {formOpen && (
        <form onSubmit={handleSubmit} className="bg-white border border-border-light rounded-xl p-4 mb-6 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-dark">{editingId ? "Update product" : "Create product"}</h2>
            <button type="button" onClick={resetForm} className="p-1.5 rounded-lg hover:bg-surface text-text-muted" aria-label="Close product form">
              <X size={18} />
            </button>
          </div>

          {error && <p className="bg-red-50 border border-red-200 text-red-600 text-sm rounded-lg p-3 mb-4">{error}</p>}

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <label className="text-xs font-semibold uppercase text-text-muted tracking-wider">
              Product name
              <input value={form.name} onChange={(e) => handleChange("name", e.target.value)} className={inputCls} />
            </label>
            <label className="text-xs font-semibold uppercase text-text-muted tracking-wider">
              Price
              <input type="number" min="0" value={form.price} onChange={(e) => handleChange("price", e.target.value)} className={inputCls} />
            </label>
            <label className="text-xs font-semibold uppercase text-text-muted tracking-wider">
              Stock quantity
              <input type="number" min="0" value={form.stock} onChange={(e) => handleChange("stock", e.target.value)} className={inputCls} />
            </label>
            <label className="text-xs font-semibold uppercase text-text-muted tracking-wider">
              Category
              <input list="product-categories" value={form.category} onChange={(e) => handleChange("category", e.target.value)} className={inputCls} />
              <datalist id="product-categories">
                {categoryOptions.map((category) => <option value={category} key={category} />)}
              </datalist>
            </label>
            <label className="text-xs font-semibold uppercase text-text-muted tracking-wider">
              Image URL
              <input value={form.image} onChange={(e) => handleChange("image", e.target.value)} placeholder="Paste image URL or choose a file below" className={inputCls} />
            </label>
            <label className="text-xs font-semibold uppercase text-text-muted tracking-wider">
              Upload image
              <input type="file" accept="image/*" onChange={handleImageFileChange} className="mt-1 w-full border border-border-light rounded-lg p-2.5 text-sm bg-surface focus:outline-none focus:ring-2 focus:ring-gold/30 focus:border-gold file:mr-3 file:border-0 file:bg-gold/10 file:text-gold file:font-semibold file:rounded file:px-3 file:py-1 file:text-xs" />
            </label>
            <label className="text-xs font-semibold uppercase text-text-muted tracking-wider">
              Label
              <input placeholder="New, Hot, Sale" value={form.tag} onChange={(e) => handleChange("tag", e.target.value)} className={inputCls} />
            </label>
            {form.image && (
              <div className="text-xs font-semibold uppercase text-text-muted tracking-wider">
                Preview
                <img
                  src={form.image}
                  alt="Product preview"
                  onError={(event) => handleProductImageError(event, form.name || "preview")}
                  className="mt-1 w-full h-32 rounded-lg object-cover bg-surface border border-border-light"
                />
              </div>
            )}
            <label className="md:col-span-2 lg:col-span-3 text-xs font-semibold uppercase text-text-muted tracking-wider">
              Description
              <textarea rows="3" value={form.description} onChange={(e) => handleChange("description", e.target.value)} className={`${inputCls} resize-none`} />
            </label>
          </div>

          <div className="flex justify-end gap-2 mt-4">
            <button type="button" onClick={resetForm} className="px-4 py-2 rounded-lg border border-border-light text-sm font-semibold text-text-muted hover:bg-surface">Cancel</button>
            <button type="submit" disabled={saving} className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-dark text-white text-sm font-semibold hover:bg-gray-800 disabled:opacity-50">
              <Save size={16} /> {saving ? "Saving..." : "Save Product"}
            </button>
          </div>
        </form>
      )}

      <div className="bg-white rounded-xl border border-border-light shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-surface">
              <tr>
                <th className="p-4 text-left text-xs font-semibold uppercase text-text-muted tracking-wider">Product</th>
                <th className="p-4 text-left text-xs font-semibold uppercase text-text-muted tracking-wider">Category</th>
                <th className="p-4 text-left text-xs font-semibold uppercase text-text-muted tracking-wider">Price</th>
                <th className="p-4 text-left text-xs font-semibold uppercase text-text-muted tracking-wider">Stock</th>
                <th className="p-4 text-right text-xs font-semibold uppercase text-text-muted tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody>
              {products.map((product) => (
                <tr key={product.id} className="border-t border-border-light hover:bg-surface/50">
                  <td className="p-4">
                    <div className="flex items-center gap-3">
                      <img
                        src={product.image || productImageFallback(product.name)}
                        alt={product.name}
                        onError={(event) => handleProductImageError(event, product.name)}
                        className="w-14 h-14 rounded-lg object-cover bg-surface border border-border-light"
                      />
                      <div>
                        <p className="font-semibold text-dark">{product.name}</p>
                        <p className="text-xs text-text-muted max-w-sm truncate">{product.description || "No description"}</p>
                      </div>
                    </div>
                  </td>
                  <td className="p-4 text-text-muted">{product.category}</td>
                  <td className="p-4 font-semibold text-dark">ETB {(Number(product.price) || 0).toLocaleString()}</td>
                  <td className="p-4">
                    <input
                      type="number"
                      min="0"
                      value={product.stock || 0}
                      onChange={(e) => updateStockDirectly(product.id, e.target.value)}
                      className="w-20 border border-border-light rounded-lg px-2 py-1.5 text-sm bg-surface focus:outline-none focus:ring-2 focus:ring-gold/30 focus:border-gold"
                      aria-label={`Stock for ${product.name}`}
                    />
                  </td>
                  <td className="p-4">
                    <div className="flex justify-end gap-2">
                      <button type="button" onClick={() => openEditForm(product)} className="p-2 rounded-lg bg-amber-50 text-amber-600 hover:bg-amber-100" aria-label={`Edit ${product.name}`}>
                        <Edit3 size={16} />
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          if (confirm(`Delete ${product.name}?`)) deleteProduct(product.id);
                        }}
                        className="p-2 rounded-lg bg-red-50 text-red-500 hover:bg-red-100"
                        aria-label={`Delete ${product.name}`}
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {products.length === 0 && (
                <tr>
                  <td colSpan="5" className="p-10 text-center text-text-muted">No products yet.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Products;
