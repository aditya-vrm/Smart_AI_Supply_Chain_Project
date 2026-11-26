import React, { useState, useEffect } from 'react';
import api from '../api/axios';
import Modal from '../components/Modal';
import { Package, Plus, Search, Edit2, Trash2, Filter } from 'lucide-react';

const Products = () => {
  const [products, setProducts] = useState([]);
  const [suppliers, setSuppliers] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [formData, setFormData] = useState({
    sku_code: '',
    product_name: '',
    category: '',
    unit_price: '',
    supplier_id: '',
    initial_stock: 50,
    reorder_level: 20,
    max_stock: 200,
  });
  const [formError, setFormError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [prodRes, suppRes, catRes] = await Promise.all([
        api.get('/products', {
          params: {
            search: search || undefined,
            category: selectedCategory !== 'All' ? selectedCategory : undefined,
          },
        }),
        api.get('/suppliers'),
        api.get('/products/categories'),
      ]);
      setProducts(prodRes.data);
      setSuppliers(suppRes.data);
      setCategories(catRes.data);
    } catch (err) {
      console.error('Failed to load products:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [selectedCategory]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchData();
  };

  const openCreateModal = () => {
    setEditingProduct(null);
    setFormData({
      sku_code: '',
      product_name: '',
      category: categories[0] || 'Electronics',
      unit_price: '',
      supplier_id: suppliers[0]?.supplier_id || '',
      initial_stock: 50,
      reorder_level: 20,
      max_stock: 200,
    });
    setFormError('');
    setIsModalOpen(true);
  };

  const openEditModal = (product) => {
    setEditingProduct(product);
    setFormData({
      sku_code: product.sku_code,
      product_name: product.product_name,
      category: product.category,
      unit_price: product.unit_price,
      supplier_id: product.supplier_id || '',
    });
    setFormError('');
    setIsModalOpen(true);
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    setFormError('');
    setSubmitting(true);

    try {
      const payload = {
        sku_code: formData.sku_code.trim().toUpperCase(),
        product_name: formData.product_name.trim(),
        category: formData.category.trim(),
        unit_price: parseFloat(formData.unit_price),
        supplier_id: formData.supplier_id ? parseInt(formData.supplier_id) : null,
      };

      if (editingProduct) {
        await api.put(`/products/${editingProduct.product_id}`, payload);
      } else {
        payload.initial_stock = parseInt(formData.initial_stock) || 0;
        payload.reorder_level = parseInt(formData.reorder_level) || 20;
        payload.max_stock = parseInt(formData.max_stock) || 200;
        await api.post('/products', payload);
      }

      setIsModalOpen(false);
      fetchData();
    } catch (err) {
      setFormError(err.response?.data?.detail || 'Error saving product');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (productId, sku) => {
    if (!window.confirm(`Delete product ${sku}? This will remove its inventory entry.`)) {
      return;
    }
    try {
      await api.delete(`/products/${productId}`);
      fetchData();
    } catch (err) {
      alert(err.response?.data?.detail || 'Failed to delete product');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-sand/15">
        <div>
          <h2 className="text-xl font-bold text-sand-50 flex items-center gap-2">
            <Package className="w-5 h-5 text-purple" />
            Product Catalog
          </h2>
          <p className="text-xs text-sand/65 mt-1">Manage SKUs, unit pricing, categories, and supplier assignments</p>
        </div>
        <button
          onClick={openCreateModal}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-purple text-white text-xs font-semibold hover:bg-purple-hover transition-all shadow-lg shadow-purple/30 self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Add Product</span>
        </button>
      </div>

      {/* Filter & Search Bar */}
      <div className="glass-card p-4 rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-4">
        <form onSubmit={handleSearchSubmit} className="relative w-full sm:w-80">
          <Search className="w-4 h-4 absolute left-3 top-2.5 text-sand/50" />
          <input
            type="text"
            placeholder="Search SKU or product name..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-2 glass-input rounded-xl text-xs placeholder-sand/40 focus:outline-none"
          />
        </form>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <Filter className="w-4 h-4 text-purple flex-shrink-0" />
          <span className="text-xs text-sand/70">Category:</span>
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="px-3 py-1.5 glass-input rounded-xl text-xs text-sand focus:outline-none"
          >
            <option value="All" className="bg-forest-900 text-sand">All Categories ({categories.length})</option>
            {categories.map((c) => (
              <option key={c} value={c} className="bg-forest-900 text-sand">{c}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Products Table */}
      <div className="glass-card rounded-2xl overflow-hidden shadow-xl">
        {loading ? (
          <div className="flex items-center justify-center h-48">
            <div className="w-8 h-8 border-2 border-purple border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : products.length === 0 ? (
          <div className="text-center py-12 text-sand/60 text-xs">
            No products found matching your search.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-forest-900/80 text-sand/70 border-b border-sand/10 uppercase tracking-wider text-[11px]">
                <tr>
                  <th className="py-3 px-4">SKU Code</th>
                  <th className="py-3 px-4">Product Name</th>
                  <th className="py-3 px-4">Category</th>
                  <th className="py-3 px-4 text-right">Unit Price</th>
                  <th className="py-3 px-4">Supplier</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-sand/10 font-sans">
                {products.map((p) => (
                  <tr key={p.product_id} className="hover:bg-forest-850/50 transition-colors">
                    <td className="py-3.5 px-4 font-mono font-bold text-sand-50 tracking-wider">
                      {p.sku_code}
                    </td>
                    <td className="py-3.5 px-4 font-medium text-sand-50">
                      {p.product_name}
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="inline-block px-2.5 py-0.5 rounded-lg bg-forest-900/80 text-sand/80 text-[11px] border border-sand/15">
                        {p.category}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-right font-mono font-bold text-sand-50">
                      ${p.unit_price.toFixed(2)}
                    </td>
                    <td className="py-3.5 px-4 text-sand/70">
                      {p.supplier?.supplier_name || <span className="text-sand/40 italic">None</span>}
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => openEditModal(p)}
                          className="p-1.5 rounded-lg text-sand/60 hover:text-purple hover:bg-forest-850 transition-colors"
                          title="Edit Product"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleDelete(p.product_id, p.sku_code)}
                          className="p-1.5 rounded-lg text-sand/60 hover:text-rose-400 hover:bg-forest-850 transition-colors"
                          title="Delete Product"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Add / Edit Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingProduct ? `Edit Product: ${editingProduct.sku_code}` : 'Add New Product'}
      >
        {formError && (
          <div className="mb-4 p-2.5 rounded-xl bg-rose-950/70 border border-rose-500/40 text-rose-300 text-xs">
            {formError}
          </div>
        )}

        <form onSubmit={handleFormSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-sand/80 mb-1">SKU Code *</label>
              <input
                type="text"
                required
                value={formData.sku_code}
                onChange={(e) => setFormData({ ...formData, sku_code: e.target.value })}
                placeholder="SKU-XXX-001"
                className="w-full px-3 py-2 glass-input rounded-xl text-xs font-mono uppercase focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-sand/80 mb-1">Category *</label>
              <input
                type="text"
                required
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                placeholder="e.g. Electronics"
                className="w-full px-3 py-2 glass-input rounded-xl text-xs focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-sand/80 mb-1">Product Name *</label>
            <input
              type="text"
              required
              value={formData.product_name}
              onChange={(e) => setFormData({ ...formData, product_name: e.target.value })}
              placeholder="e.g. Wireless Noise Canceling Headphones"
              className="w-full px-3 py-2 glass-input rounded-xl text-xs focus:outline-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-sand/80 mb-1">Unit Price ($) *</label>
              <input
                type="number"
                step="0.01"
                min="0"
                required
                value={formData.unit_price}
                onChange={(e) => setFormData({ ...formData, unit_price: e.target.value })}
                placeholder="29.99"
                className="w-full px-3 py-2 glass-input rounded-xl text-xs font-mono tabular-nums focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-sand/80 mb-1">Supplier</label>
              <select
                value={formData.supplier_id}
                onChange={(e) => setFormData({ ...formData, supplier_id: e.target.value })}
                className="w-full px-3 py-2 glass-input rounded-xl text-xs focus:outline-none"
              >
                <option value="" className="bg-forest-900 text-sand">No Supplier Assigned</option>
                {suppliers.map((s) => (
                  <option key={s.supplier_id} value={s.supplier_id} className="bg-forest-900 text-sand">{s.supplier_name}</option>
                ))}
              </select>
            </div>
          </div>

          {!editingProduct && (
            <div className="pt-2 border-t border-sand/15">
              <span className="text-[11px] font-semibold text-sand/80 uppercase tracking-wider block mb-2">Initial Stock Setup</span>
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-[11px] text-sand/70 mb-1">Initial Stock</label>
                  <input
                    type="number"
                    min="0"
                    value={formData.initial_stock}
                    onChange={(e) => setFormData({ ...formData, initial_stock: e.target.value })}
                    className="w-full px-2.5 py-1.5 glass-input rounded-lg text-xs"
                  />
                </div>
                <div>
                  <label className="block text-[11px] text-sand/70 mb-1">Reorder Level</label>
                  <input
                    type="number"
                    min="1"
                    value={formData.reorder_level}
                    onChange={(e) => setFormData({ ...formData, reorder_level: e.target.value })}
                    className="w-full px-2.5 py-1.5 glass-input rounded-lg text-xs"
                  />
                </div>
                <div>
                  <label className="block text-[11px] text-sand/70 mb-1">Max Capacity</label>
                  <input
                    type="number"
                    min="1"
                    value={formData.max_stock}
                    onChange={(e) => setFormData({ ...formData, max_stock: e.target.value })}
                    className="w-full px-2.5 py-1.5 glass-input rounded-lg text-xs"
                  />
                </div>
              </div>
            </div>
          )}

          <div className="flex justify-end gap-2 pt-3 border-t border-sand/15">
            <button
              type="button"
              onClick={() => setIsModalOpen(false)}
              className="px-3.5 py-2 rounded-xl border border-sand/20 text-xs text-sand/70 hover:text-sand-50 hover:bg-forest-850"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-4 py-2 rounded-xl bg-purple hover:bg-purple-hover text-white text-xs font-semibold shadow-lg shadow-purple/30 disabled:opacity-50"
            >
              {submitting ? 'Saving...' : editingProduct ? 'Save Changes' : 'Create Product'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default Products;
