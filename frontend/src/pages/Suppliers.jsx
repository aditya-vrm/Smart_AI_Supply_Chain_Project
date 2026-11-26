import React, { useState, useEffect } from 'react';
import api from '../api/axios';
import Modal from '../components/Modal';
import { Truck, Plus, Phone, Mail, Clock, Edit2, Trash2 } from 'lucide-react';

const Suppliers = () => {
  const [suppliers, setSuppliers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingSupplier, setEditingSupplier] = useState(null);
  const [formData, setFormData] = useState({
    supplier_name: '',
    contact_person: '',
    phone: '',
    email: '',
    lead_time_days: 7,
  });
  const [formError, setFormError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const fetchSuppliers = async () => {
    try {
      setLoading(true);
      const res = await api.get('/suppliers');
      setSuppliers(res.data);
    } catch (err) {
      console.error('Failed to load suppliers:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSuppliers();
  }, []);

  const openCreateModal = () => {
    setEditingSupplier(null);
    setFormData({
      supplier_name: '',
      contact_person: '',
      phone: '',
      email: '',
      lead_time_days: 7,
    });
    setFormError('');
    setIsModalOpen(true);
  };

  const openEditModal = (supplier) => {
    setEditingSupplier(supplier);
    setFormData({
      supplier_name: supplier.supplier_name,
      contact_person: supplier.contact_person || '',
      phone: supplier.phone || '',
      email: supplier.email || '',
      lead_time_days: supplier.lead_time_days,
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
        ...formData,
        lead_time_days: parseInt(formData.lead_time_days) || 7,
      };

      if (editingSupplier) {
        await api.put(`/suppliers/${editingSupplier.supplier_id}`, payload);
      } else {
        await api.post('/suppliers', payload);
      }

      setIsModalOpen(false);
      fetchSuppliers();
    } catch (err) {
      setFormError(err.response?.data?.detail || 'Error saving supplier');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id, name) => {
    if (!window.confirm(`Delete supplier "${name}"?`)) {
      return;
    }
    try {
      await api.delete(`/suppliers/${id}`);
      fetchSuppliers();
    } catch (err) {
      alert(err.response?.data?.detail || 'Failed to delete supplier');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-sand/15">
        <div>
          <h2 className="text-xl font-bold text-sand-50 flex items-center gap-2">
            <Truck className="w-5 h-5 text-purple" />
            Supplier Directory
          </h2>
          <p className="text-xs text-sand/65 mt-1">Manage vendor partners, lead times, and contact information</p>
        </div>
        <button
          onClick={openCreateModal}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-purple text-white text-xs font-semibold hover:bg-purple-hover transition-all shadow-lg shadow-purple/30 self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Add Supplier</span>
        </button>
      </div>

      {/* Suppliers Table */}
      <div className="glass-card rounded-2xl overflow-hidden shadow-xl">
        {loading ? (
          <div className="flex items-center justify-center h-48">
            <div className="w-8 h-8 border-2 border-purple border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : suppliers.length === 0 ? (
          <div className="text-center py-12 text-sand/60 text-xs">
            No suppliers found. Click "Add Supplier" to register your first vendor.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-forest-900/80 text-sand/70 border-b border-sand/10 uppercase tracking-wider text-[11px]">
                <tr>
                  <th className="py-3 px-4">Supplier Name</th>
                  <th className="py-3 px-4">Contact Person</th>
                  <th className="py-3 px-4">Contact Details</th>
                  <th className="py-3 px-4 text-center">Lead Time</th>
                  <th className="py-3 px-4 text-center">Status</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-sand/10 font-sans">
                {suppliers.map((s) => (
                  <tr key={s.supplier_id} className="hover:bg-forest-850/50 transition-colors">
                    <td className="py-3.5 px-4 font-bold text-sand-50 tracking-wide">
                      {s.supplier_name}
                    </td>
                    <td className="py-3.5 px-4 text-sand/80 font-medium">
                      {s.contact_person || '—'}
                    </td>
                    <td className="py-3.5 px-4 text-sand/70">
                      <div className="space-y-0.5">
                        {s.email && (
                          <div className="flex items-center gap-1.5 text-sand/80">
                            <Mail className="w-3 h-3 text-purple" />
                            <span>{s.email}</span>
                          </div>
                        )}
                        {s.phone && (
                          <div className="flex items-center gap-1.5 text-sand/60 font-mono text-[11px]">
                            <Phone className="w-3 h-3 text-sand/40" />
                            <span>{s.phone}</span>
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="py-3.5 px-4 text-center font-mono text-sand/80">
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-lg bg-forest-900/80 border border-sand/15 text-sand">
                        <Clock className="w-3 h-3 text-purple" />
                        {s.lead_time_days} days
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-center">
                      <span className="inline-block px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-950/60 text-emerald-300 border border-emerald-500/30">
                        Active
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => openEditModal(s)}
                          className="p-1.5 rounded-lg text-sand/60 hover:text-purple hover:bg-forest-850 transition-colors"
                          title="Edit Supplier"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleDelete(s.supplier_id, s.supplier_name)}
                          className="p-1.5 rounded-lg text-sand/60 hover:text-rose-400 hover:bg-forest-850 transition-colors"
                          title="Delete Supplier"
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
        title={editingSupplier ? `Edit Supplier: ${editingSupplier.supplier_name}` : 'Add New Supplier'}
      >
        {formError && (
          <div className="mb-4 p-2.5 rounded-xl bg-rose-950/70 border border-rose-500/40 text-rose-300 text-xs">
            {formError}
          </div>
        )}
        <form onSubmit={handleFormSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-sand/80 mb-1">Supplier / Vendor Name *</label>
            <input
              type="text"
              required
              value={formData.supplier_name}
              onChange={(e) => setFormData({ ...formData, supplier_name: e.target.value })}
              placeholder="e.g. Apex Global Components"
              className="w-full px-3 py-2 glass-input rounded-xl text-xs focus:outline-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-sand/80 mb-1">Contact Person</label>
              <input
                type="text"
                value={formData.contact_person}
                onChange={(e) => setFormData({ ...formData, contact_person: e.target.value })}
                placeholder="e.g. Sarah Jenkins"
                className="w-full px-3 py-2 glass-input rounded-xl text-xs focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-sand/80 mb-1">Delivery Lead Time (Days) *</label>
              <input
                type="number"
                min="1"
                required
                value={formData.lead_time_days}
                onChange={(e) => setFormData({ ...formData, lead_time_days: e.target.value })}
                className="w-full px-3 py-2 glass-input rounded-xl text-xs font-mono tabular-nums focus:outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-sand/80 mb-1">Email</label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                placeholder="supplier@domain.com"
                className="w-full px-3 py-2 glass-input rounded-xl text-xs focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-sand/80 mb-1">Phone</label>
              <input
                type="text"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                placeholder="+1 555-019-2831"
                className="w-full px-3 py-2 glass-input rounded-xl text-xs font-mono focus:outline-none"
              />
            </div>
          </div>

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
              {submitting ? 'Saving...' : editingSupplier ? 'Save Changes' : 'Create Supplier'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default Suppliers;
