import React, { useState, useEffect } from 'react';
import { 
  Plus, Search, Edit2, Trash2, X, Check, 
  Package, AlertTriangle, Sparkles, Filter 
} from 'lucide-react';
import { Product, Category, Vibe } from '../../types';
import { api } from '../../services/api';
import toast from 'react-hot-toast';

export const AdminProductsPage: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [vibes, setVibes] = useState<Vibe[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [search, setSearch] = useState<string>('');

  // Modal State
  const [modalOpen, setModalOpen] = useState<boolean>(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);

  // Form Fields
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: 999,
    original_price: 1499,
    stock: 20,
    category_id: 1,
    vibe_id: 1,
    image: '',
    tags: 'minimal, tech, desk',
    why_like: 'Ergonomic build, Zero distractions, High durability'
  });

  const loadData = async () => {
    try {
      setLoading(true);
      const [prodRes, catRes, vibeRes] = await Promise.all([
        api.getProducts({ limit: 100 }),
        api.getCategories(),
        api.getVibes()
      ]);
      setProducts(prodRes.products);
      setCategories(catRes.categories);
      setVibes(vibeRes.vibes);
    } catch (err) {
      console.error('Error loading admin products:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const openAddModal = () => {
    setEditingProduct(null);
    setFormData({
      name: '',
      description: '',
      price: 999,
      original_price: 1499,
      stock: 20,
      category_id: categories[0]?.id || 1,
      vibe_id: vibes[0]?.id || 1,
      image: 'https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?auto=format&fit=crop&w=800&q=80',
      tags: 'minimal, aesthetic, focus',
      why_like: 'High quality materials, Minimalist aesthetic, Easy maintenance'
    });
    setModalOpen(true);
  };

  const openEditModal = (p: Product) => {
    setEditingProduct(p);
    setFormData({
      name: p.name,
      description: p.description,
      price: p.price,
      original_price: p.original_price || p.price,
      stock: p.stock,
      category_id: p.category_id,
      vibe_id: p.vibe_id,
      image: p.image,
      tags: p.tags.join(', '),
      why_like: p.why_like.join(', ')
    });
    setModalOpen(true);
  };

  const handleDelete = async (id: number, name: string) => {
    if (!window.confirm(`Are you sure you want to delete "${name}" from the database?`)) {
      return;
    }
    try {
      await api.adminDeleteProduct(id);
      toast.success('Product deleted successfully');
      setProducts(prev => prev.filter(p => p.id !== id));
    } catch (err: any) {
      toast.error(err.message || 'Failed to delete product');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const payload = {
        ...formData,
        tags: formData.tags.split(',').map(t => t.trim()).filter(Boolean),
        why_like: formData.why_like.split(',').map(t => t.trim()).filter(Boolean)
      };

      if (editingProduct) {
        const res = await api.adminUpdateProduct(editingProduct.id, payload);
        toast.success(res.message);
      } else {
        const res = await api.adminCreateProduct(payload);
        toast.success(res.message);
      }

      setModalOpen(false);
      await loadData();
    } catch (err: any) {
      toast.error(err.message || 'Error saving product');
    }
  };

  const filteredProducts = products.filter(p => 
    p.name.toLowerCase().includes(search.toLowerCase()) ||
    p.description.toLowerCase().includes(search.toLowerCase()) ||
    (p.vibe_name && p.vibe_name.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <div className="space-y-6">
      
      {/* Header bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div>
          <h2 className="text-2xl font-extrabold text-white font-display">Products Inventory</h2>
          <p className="text-xs text-slate-400 mt-1">Manage catalog pricing, vibes, categories, and warehouse stock.</p>
        </div>
        <button
          onClick={openAddModal}
          className="px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-xs shadow-md transition-all flex items-center gap-1.5"
        >
          <Plus className="w-4 h-4" />
          <span>Add New Product</span>
        </button>
      </div>

      {/* Search Input */}
      <div className="relative max-w-md">
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search products by title, vibe, tags..."
          className="w-full bg-slate-900 border border-slate-800 rounded-xl pl-10 pr-4 py-2.5 text-xs text-white placeholder:text-slate-500 outline-none focus:border-amber-500 transition-colors"
        />
        <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
      </div>

      {/* Products Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-950 text-slate-400 border-b border-slate-800">
              <tr>
                <th className="py-3 px-4 font-semibold">Product</th>
                <th className="py-3 px-4 font-semibold">Vibe & Category</th>
                <th className="py-3 px-4 font-semibold">Price</th>
                <th className="py-3 px-4 font-semibold">Discount</th>
                <th className="py-3 px-4 font-semibold">Stock</th>
                <th className="py-3 px-4 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/80">
              {filteredProducts.map((p) => (
                <tr key={p.id} className="hover:bg-slate-800/40 transition-colors">
                  <td className="py-3 px-4 flex items-center gap-3">
                    <img src={p.image} alt={p.name} className="w-10 h-10 rounded-xl object-cover bg-slate-800 flex-shrink-0" />
                    <div>
                      <p className="font-bold text-slate-200 line-clamp-1 max-w-[200px]">{p.name}</p>
                      <p className="text-[10px] text-slate-500 font-mono">ID: #{p.id}</p>
                    </div>
                  </td>
                  <td className="py-3 px-4">
                    <span className="font-bold px-2 py-0.5 rounded-full text-[10px] bg-slate-800 text-amber-400 border border-amber-500/20 block w-max">
                      {p.vibe_name || 'Vibe'}
                    </span>
                    <span className="text-[10px] text-slate-400 mt-0.5 block">{p.category_name}</span>
                  </td>
                  <td className="py-3 px-4 font-bold text-white font-mono">₹{p.price.toLocaleString()}</td>
                  <td className="py-3 px-4">
                    {p.discount > 0 ? (
                      <span className="text-emerald-400 font-semibold">{p.discount}% OFF</span>
                    ) : (
                      <span className="text-slate-500">-</span>
                    )}
                  </td>
                  <td className="py-3 px-4">
                    <span className={`font-bold px-2 py-0.5 rounded-lg text-[11px] ${
                      p.stock <= 5 ? 'bg-rose-500/20 text-rose-400' : 'bg-slate-800 text-slate-300'
                    }`}>
                      {p.stock} units
                    </span>
                  </td>
                  <td className="py-3 px-4 text-right space-x-2">
                    <button
                      onClick={() => openEditModal(p)}
                      className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-amber-400 transition-colors"
                      title="Edit Product"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => handleDelete(p.id, p.name)}
                      className="p-1.5 rounded-lg bg-slate-800 hover:bg-rose-900/40 text-rose-400 transition-colors"
                      title="Delete Product"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* ADD / EDIT PRODUCT MODAL */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-xl w-full p-6 space-y-4 max-h-[90vh] overflow-y-auto shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h3 className="font-bold text-lg text-white">
                {editingProduct ? `Edit Product #${editingProduct.id}` : 'Create New Vibe Product'}
              </h3>
              <button onClick={() => setModalOpen(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4 text-xs">
              <div>
                <label className="text-slate-400 block mb-1">Product Title *</label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl p-2.5 text-white outline-none focus:border-amber-500"
                />
              </div>

              <div>
                <label className="text-slate-400 block mb-1">Description *</label>
                <textarea
                  required
                  rows={2}
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl p-2.5 text-white outline-none focus:border-amber-500"
                />
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="text-slate-400 block mb-1">Price (₹) *</label>
                  <input
                    type="number"
                    required
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: Number(e.target.value) })}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl p-2.5 text-white outline-none focus:border-amber-500 font-mono"
                  />
                </div>
                <div>
                  <label className="text-slate-400 block mb-1">Original Price (₹)</label>
                  <input
                    type="number"
                    value={formData.original_price}
                    onChange={(e) => setFormData({ ...formData, original_price: Number(e.target.value) })}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl p-2.5 text-white outline-none focus:border-amber-500 font-mono"
                  />
                </div>
                <div>
                  <label className="text-slate-400 block mb-1">Stock Quantity *</label>
                  <input
                    type="number"
                    required
                    value={formData.stock}
                    onChange={(e) => setFormData({ ...formData, stock: Number(e.target.value) })}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl p-2.5 text-white outline-none focus:border-amber-500 font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-slate-400 block mb-1">Assigned Vibe *</label>
                  <select
                    value={formData.vibe_id}
                    onChange={(e) => setFormData({ ...formData, vibe_id: Number(e.target.value) })}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl p-2.5 text-white outline-none focus:border-amber-500"
                  >
                    {vibes.map((v) => (
                      <option key={v.id} value={v.id}>
                        {v.icon} {v.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-slate-400 block mb-1">Category *</label>
                  <select
                    value={formData.category_id}
                    onChange={(e) => setFormData({ ...formData, category_id: Number(e.target.value) })}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl p-2.5 text-white outline-none focus:border-amber-500"
                  >
                    {categories.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="text-slate-400 block mb-1">Image URL *</label>
                <input
                  type="text"
                  required
                  value={formData.image}
                  onChange={(e) => setFormData({ ...formData, image: e.target.value })}
                  placeholder="https://images.unsplash.com/..."
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl p-2.5 text-white outline-none focus:border-amber-500"
                />
              </div>

              <div>
                <label className="text-slate-400 block mb-1">Vibe Tags (comma-separated)</label>
                <input
                  type="text"
                  value={formData.tags}
                  onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
                  placeholder="study, minimal, focus"
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl p-2.5 text-white outline-none focus:border-amber-500"
                />
              </div>

              <div>
                <label className="text-slate-400 block mb-1">"Why you'll like it" Bullets (comma-separated)</label>
                <input
                  type="text"
                  value={formData.why_like}
                  onChange={(e) => setFormData({ ...formData, why_like: e.target.value })}
                  placeholder="Ergonomic grip, Zero flicker, Aerospace build"
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl p-2.5 text-white outline-none focus:border-amber-500"
                />
              </div>

              <div className="pt-3 flex justify-end gap-2 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold shadow-md"
                >
                  {editingProduct ? 'Save Product Changes' : 'Create Product'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
