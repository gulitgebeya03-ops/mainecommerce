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

    const timer = setTimeout(() => {
      setSuccess("");
    }, 5000);

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

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-6">
        <div>
          <h1 className="text-2xl font-black text-gray-900">Product Management</h1>
          <p className="text-sm text-gray-500">Create products, update categories, and keep stock current.</p>
        </div>
        <button
          type="button"
          onClick={openNewForm}
          className="inline-flex items-center justify-center gap-2 bg-orange-600 text-white px-4 py-2 rounded-lg hover:bg-orange-700 text-sm font-bold"
        >
          <PackagePlus size={16} /> Add Product
        </button>
      </div>

      {success && (
        <div className="mb-6 bg-green-50 border border-green-100 text-green-800 rounded-lg p-3 flex items-center justify-between gap-3 text-sm">
          <span className="flex items-center gap-2 font-semibold">
            <CheckCircle size={18} className="text-green-600 shrink-0" />
            {success}
          </span>
          <button type="button" onClick={() => setSuccess("")} className="p-1 rounded-md hover:bg-green-100" aria-label="Dismiss success message">
            <X size={16} />
          </button>
        </div>
      )}

      {formOpen && (
        <form onSubmit={handleSubmit} className="bg-white border border-gray-100 rounded-lg p-4 mb-6 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-bold text-gray-900">{editingId ? "Update product" : "Create product"}</h2>
            <button type="button" onClick={resetForm} className="p-1.5 rounded-md hover:bg-gray-100 text-gray-500" aria-label="Close product form">
              <X size={18} />
            </button>
          </div>

          {error && <p className="bg-red-50 border border-red-100 text-red-700 text-sm rounded-lg p-3 mb-4">{error}</p>}

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <label className="text-xs font-bold uppercase text-gray-500">
              Product name
              <input value={form.name} onChange={(e) => handleChange("name", e.target.value)} className="mt-1 w-full border border-gray-200 rounded-lg p-2.5 text-sm normal-case font-normal focus:outline-none focus:ring-2 focus:ring-orange-500" />
            </label>
            <label className="text-xs font-bold uppercase text-gray-500">
              Price
              <input type="number" min="0" value={form.price} onChange={(e) => handleChange("price", e.target.value)} className="mt-1 w-full border border-gray-200 rounded-lg p-2.5 text-sm normal-case font-normal focus:outline-none focus:ring-2 focus:ring-orange-500" />
            </label>
            <label className="text-xs font-bold uppercase text-gray-500">
              Stock quantity
              <input type="number" min="0" value={form.stock} onChange={(e) => handleChange("stock", e.target.value)} className="mt-1 w-full border border-gray-200 rounded-lg p-2.5 text-sm normal-case font-normal focus:outline-none focus:ring-2 focus:ring-orange-500" />
            </label>
            <label className="text-xs font-bold uppercase text-gray-500">
              Category
              <input list="product-categories" value={form.category} onChange={(e) => handleChange("category", e.target.value)} className="mt-1 w-full border border-gray-200 rounded-lg p-2.5 text-sm normal-case font-normal focus:outline-none focus:ring-2 focus:ring-orange-500" />
              <datalist id="product-categories">
                {categoryOptions.map((category) => <option value={category} key={category} />)}
              </datalist>
            </label>
            <label className="text-xs font-bold uppercase text-gray-500">
              Image URL
              <input value={form.image} onChange={(e) => handleChange("image", e.target.value)} placeholder="Paste image URL or choose a file below" className="mt-1 w-full border border-gray-200 rounded-lg p-2.5 text-sm normal-case font-normal focus:outline-none focus:ring-2 focus:ring-orange-500" />
            </label>
            <label className="text-xs font-bold uppercase text-gray-500">
              Upload image
              <input type="file" accept="image/*" onChange={handleImageFileChange} className="mt-1 w-full border border-gray-200 rounded-lg p-2.5 text-sm normal-case font-normal focus:outline-none focus:ring-2 focus:ring-orange-500 file:mr-3 file:border-0 file:bg-orange-50 file:text-orange-700 file:font-bold" />
            </label>
            <label className="text-xs font-bold uppercase text-gray-500">
              Label
              <input placeholder="New, Hot, Sale" value={form.tag} onChange={(e) => handleChange("tag", e.target.value)} className="mt-1 w-full border border-gray-200 rounded-lg p-2.5 text-sm normal-case font-normal focus:outline-none focus:ring-2 focus:ring-orange-500" />
            </label>
            {form.image && (
              <div className="text-xs font-bold uppercase text-gray-500">
                Preview
                <img
                  src={form.image}
                  alt="Product preview"
                  onError={(event) => handleProductImageError(event, form.name || "preview")}
                  className="mt-1 w-full h-32 rounded-lg object-cover bg-gray-100 border border-gray-200"
                />
              </div>
            )}
            <label className="md:col-span-2 lg:col-span-3 text-xs font-bold uppercase text-gray-500">
              Description
              <textarea rows="3" value={form.description} onChange={(e) => handleChange("description", e.target.value)} className="mt-1 w-full border border-gray-200 rounded-lg p-2.5 text-sm normal-case font-normal focus:outline-none focus:ring-2 focus:ring-orange-500" />
            </label>
          </div>

          <div className="flex justify-end gap-2 mt-4">
            <button type="button" onClick={resetForm} className="px-4 py-2 rounded-lg border border-gray-200 text-sm font-bold text-gray-600 hover:bg-gray-50">Cancel</button>
            <button type="submit" disabled={saving} className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-gray-900 text-white text-sm font-bold hover:bg-black disabled:opacity-50">
              <Save size={16} /> {saving ? "Saving..." : "Save Product"}
            </button>
          </div>
        </form>
      )}

      <div className="bg-white rounded-lg border border-gray-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50">
              <tr>
                <th className="p-4 text-left text-xs uppercase text-gray-400">Product</th>
                <th className="p-4 text-left text-xs uppercase text-gray-400">Category</th>
                <th className="p-4 text-left text-xs uppercase text-gray-400">Price</th>
                <th className="p-4 text-left text-xs uppercase text-gray-400">Stock</th>
                <th className="p-4 text-right text-xs uppercase text-gray-400">Actions</th>
              </tr>
            </thead>
            <tbody>
              {products.map((product) => (
                <tr key={product.id} className="border-t border-gray-100 hover:bg-gray-50">
                  <td className="p-4">
                    <div className="flex items-center gap-3">
                      <img
                        src={product.image || productImageFallback(product.name)}
                        alt={product.name}
                        onError={(event) => handleProductImageError(event, product.name)}
                        className="w-14 h-14 rounded-lg object-cover bg-gray-100"
                      />
                      <div>
                        <p className="font-bold text-gray-900">{product.name}</p>
                        <p className="text-xs text-gray-500 max-w-sm truncate">{product.description || "No description"}</p>
                      </div>
                    </div>
                  </td>
                  <td className="p-4 text-gray-600">{product.category}</td>
                  <td className="p-4 font-semibold text-gray-900">ETB {(Number(product.price) || 0).toLocaleString()}</td>
                  <td className="p-4">
                    <input
                      type="number"
                      min="0"
                      value={product.stock || 0}
                      onChange={(e) => updateStockDirectly(product.id, e.target.value)}
                      className="w-20 border border-gray-200 rounded-lg px-2 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
                      aria-label={`Stock for ${product.name}`}
                    />
                  </td>
                  <td className="p-4">
                    <div className="flex justify-end gap-2">
                      <button type="button" onClick={() => openEditForm(product)} className="p-2 rounded-lg bg-amber-50 text-amber-700 hover:bg-amber-100" aria-label={`Edit ${product.name}`}>
                        <Edit3 size={16} />
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          if (confirm(`Delete ${product.name}?`)) deleteProduct(product.id);
                        }}
                        className="p-2 rounded-lg bg-red-50 text-red-700 hover:bg-red-100"
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
                  <td colSpan="5" className="p-10 text-center text-gray-400">No products yet.</td>
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
