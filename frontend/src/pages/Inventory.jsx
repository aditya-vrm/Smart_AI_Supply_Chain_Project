import React, { useState, useEffect } from 'react';
import api from '../api/axios';
import Modal from '../components/Modal';
import StatusBadge from '../components/StatusBadge';
import { Database, PlusCircle, Sliders } from 'lucide-react';

const Inventory = () => {
  const [inventory, setInventory] = useState([]);
  const [loading, setLoading] = useState(true);

  const [restockModalOpen, setRestockModalOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const [restockQty, setRestockQty] = useState(50);

  const [limitsModalOpen, setLimitsModalOpen] = useState(false);
  const [limitForm, setLimitForm] = useState({
    reorder_level: 20,
    max_stock: 200,
    current_stock: 0,
  });

  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const fetchInventory = async () => {
    try {
      setLoading(true);
      const res = await api.get('/inventory');
      setInventory(res.data);
    } catch (err) {
      console.error('Failed to load inventory:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInventory();
  }, []);

  const openRestockModal = (item) => {
    setSelectedItem(item);
    setRestockQty(50);
    setErrorMsg('');
    setRestockModalOpen(true);
  };

  const handleRestockSubmit = async (e) => {
    e.preventDefault();
    if (!selectedItem) return;
    setSubmitting(true);
    setErrorMsg('');
    try {
      await api.post(`/inventory/${selectedItem.inventory_id}/restock`, {
        quantity: parseInt(restockQty),
      });
      setRestockModalOpen(false);
      fetchInventory();
    } catch (err) {
      setErrorMsg(err.response?.data?.detail || 'Failed to restock units');
    } finally {
      setSubmitting(false);
    }
  };

  const openLimitsModal = (item) => {
    setSelectedItem(item);
    setLimitForm({
      reorder_level: item.reorder_level,
      max_stock: item.max_stock,
      current_stock: item.current_stock,
    });
    setErrorMsg('');
    setLimitsModalOpen(true);
  };

  const handleLimitsSubmit = async (e) => {
    e.preventDefault();
    if (!selectedItem) return;
    setSubmitting(true);
    setErrorMsg('');
    try {
      await api.put(`/inventory/${selectedItem.inventory_id}`, {
        reorder_level: parseInt(limitForm.reorder_level),
        max_stock: parseInt(limitForm.max_stock),
        current_stock: parseInt(limitForm.current_stock),
      });
      setLimitsModalOpen(false);
      fetchInventory();
    } catch (err) {
      setErrorMsg(err.response?.data?.detail || 'Failed to update stock limits');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-sand/15">
        <div>
          <h2 className="text-xl font-bold text-sand-50 flex items-center gap-2">
            <Database className="w-5 h-5 text-purple" />
            Inventory Management
          </h2>
          <p className="text-xs text-sand/65 mt-1">Real-time stock counts, reorder thresholds, and warehouse capacities</p>
        </div>
      </div>

      {/* Table Card */}
      <div className="glass-card rounded-2xl overflow-hidden shadow-xl">
        {loading ? (
          <div className="flex items-center justify-center h-48">
            <div className="w-8 h-8 border-2 border-purple border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : inventory.length === 0 ? (
          <div className="text-center py-12 text-sand/60 text-xs">
            No inventory records found.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-forest-900/80 text-sand/70 border-b border-sand/10 uppercase tracking-wider text-[11px]">
                <tr>
                  <th className="py-3 px-4">SKU Code</th>
                  <th className="py-3 px-4">Product Name</th>
                  <th className="py-3 px-4 text-center">Current Stock</th>
                  <th className="py-3 px-4 text-center">Reorder Level</th>
                  <th className="py-3 px-4 text-center">Max Capacity</th>
                  <th className="py-3 px-4 text-center">Status</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-sand/10 font-sans">
                {inventory.map((item) => {
                  const percent = Math.min(100, Math.round((item.current_stock / item.max_stock) * 100));
                  return (
                    <tr key={item.inventory_id} className="hover:bg-forest-850/50 transition-colors">
                      <td className="py-3.5 px-4 font-mono font-bold text-sand-50 tracking-wider">
                        {item.product?.sku_code || 'N/A'}
                      </td>
                      <td className="py-3.5 px-4 font-medium text-sand-50">
                        {item.product?.product_name || 'N/A'}
                      </td>
                      <td className="py-3.5 px-4 text-center">
                        <span className="text-sm font-mono font-bold text-sand-50 tabular-nums">
                          {item.current_stock.toLocaleString()}
                        </span>
                        <div className="w-24 bg-forest-950 h-1.5 rounded-full mx-auto mt-1.5 overflow-hidden border border-sand/10">
                          <div 
                            className={`h-full rounded-full transition-all ${
                              item.health_status === 'LOW_STOCK'
                                ? 'bg-rose-500' 
                                : item.health_status === 'OVERSTOCK' 
                                ? 'bg-amber-400' 
                                : 'bg-purple'
                            }`}
                            style={{ width: `${percent}%` }}
                          ></div>
                        </div>
                      </td>
                      <td className="py-3.5 px-4 text-center font-mono tabular-nums text-sand/80">
                        {item.reorder_level} units
                      </td>
                      <td className="py-3.5 px-4 text-center font-mono tabular-nums text-sand/80">
                        {item.max_stock} units
                      </td>
                      <td className="py-3.5 px-4 text-center">
                        <StatusBadge status={item.health_status} />
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => openRestockModal(item)}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-purple/20 text-purple-light text-xs font-semibold border border-purple/40 hover:bg-purple/30 transition-all"
                          >
                            <PlusCircle className="w-3.5 h-3.5" />
                            Restock
                          </button>
                          <button
                            onClick={() => openLimitsModal(item)}
                            className="p-1.5 rounded-lg text-sand/60 hover:text-sand-50 hover:bg-forest-850 transition-colors"
                            title="Adjust thresholds"
                          >
                            <Sliders className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Restock Modal */}
      <Modal
        isOpen={restockModalOpen}
        onClose={() => setRestockModalOpen(false)}
        title={`Restock Product: ${selectedItem?.product?.sku_code}`}
      >
        {errorMsg && (
          <div className="mb-4 p-2.5 rounded-xl bg-rose-950/70 border border-rose-500/40 text-rose-300 text-xs">
            {errorMsg}
          </div>
        )}
        <form onSubmit={handleRestockSubmit} className="space-y-4">
          <div className="p-3 bg-forest-900/80 rounded-xl border border-sand/15">
            <p className="text-xs text-sand/70">
              Product: <span className="font-semibold text-sand-50">{selectedItem?.product?.product_name}</span>
            </p>
            <p className="text-xs text-sand/70 mt-1">
              Current Stock: <span className="font-mono font-bold text-purple-light tabular-nums">{selectedItem?.current_stock} units</span>
            </p>
          </div>

          <div>
            <label className="block text-xs font-semibold text-sand/80 mb-1">
              Units to Add *
            </label>
            <input
              type="number"
              min="1"
              required
              value={restockQty}
              onChange={(e) => setRestockQty(e.target.value)}
              className="w-full px-3 py-2 glass-input rounded-xl text-xs font-mono tabular-nums focus:outline-none"
            />
          </div>

          <div className="flex justify-end gap-2 pt-3 border-t border-sand/15">
            <button
              type="button"
              onClick={() => setRestockModalOpen(false)}
              className="px-3.5 py-2 rounded-xl border border-sand/20 text-xs text-sand/70 hover:text-sand-50 hover:bg-forest-850"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-4 py-2 rounded-xl bg-purple hover:bg-purple-hover text-white text-xs font-semibold shadow-lg shadow-purple/30 disabled:opacity-50"
            >
              {submitting ? 'Updating...' : 'Confirm Restock'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Adjust Limits Modal */}
      <Modal
        isOpen={limitsModalOpen}
        onClose={() => setLimitsModalOpen(false)}
        title={`Adjust Stock Limits: ${selectedItem?.product?.sku_code}`}
      >
        {errorMsg && (
          <div className="mb-4 p-2.5 rounded-xl bg-rose-950/70 border border-rose-500/40 text-rose-300 text-xs">
            {errorMsg}
          </div>
        )}
        <form onSubmit={handleLimitsSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-sand/80 mb-1">Current Stock Count</label>
            <input
              type="number"
              min="0"
              required
              value={limitForm.current_stock}
              onChange={(e) => setLimitForm({ ...limitForm, current_stock: e.target.value })}
              className="w-full px-3 py-2 glass-input rounded-xl text-xs font-mono tabular-nums focus:outline-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-sand/80 mb-1">Reorder Level (Alert Threshold)</label>
              <input
                type="number"
                min="0"
                required
                value={limitForm.reorder_level}
                onChange={(e) => setLimitForm({ ...limitForm, reorder_level: e.target.value })}
                className="w-full px-3 py-2 glass-input rounded-xl text-xs font-mono tabular-nums focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-sand/80 mb-1">Maximum Capacity</label>
              <input
                type="number"
                min="1"
                required
                value={limitForm.max_stock}
                onChange={(e) => setLimitForm({ ...limitForm, max_stock: e.target.value })}
                className="w-full px-3 py-2 glass-input rounded-xl text-xs font-mono tabular-nums focus:outline-none"
              />
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-3 border-t border-sand/15">
            <button
              type="button"
              onClick={() => setLimitsModalOpen(false)}
              className="px-3.5 py-2 rounded-xl border border-sand/20 text-xs text-sand/70 hover:text-sand-50 hover:bg-forest-850"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-4 py-2 rounded-xl bg-purple hover:bg-purple-hover text-white text-xs font-semibold shadow-lg shadow-purple/30 disabled:opacity-50"
            >
              {submitting ? 'Saving...' : 'Save Limits'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default Inventory;
