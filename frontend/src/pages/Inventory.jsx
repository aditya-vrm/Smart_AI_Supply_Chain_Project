import React, { useState, useEffect } from 'react';
import api from '../api/axios';
import Modal from '../components/Modal';
import StatusBadge from '../components/StatusBadge';
import { Boxes, PlusCircle, Edit3, AlertCircle } from 'lucide-react';

const Inventory = () => {
  const [inventory, setInventory] = useState([]);
  const [loading, setLoading] = useState(true);

  // Restock Modal
  const [restockModalOpen, setRestockModalOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const [restockQty, setRestockQty] = useState(50);

  // Edit Limits Modal
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
      setErrorMsg(err.response?.data?.detail || 'Failed to update thresholds');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight">Real-Time Inventory Health</h2>
          <p className="text-xs text-slate-500 mt-0.5">Live warehouse stock counts, reorder boundaries, and health state badges</p>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm">
        {loading ? (
          <div className="flex items-center justify-center h-48">
            <div className="w-7 h-7 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : inventory.length === 0 ? (
          <div className="text-center py-12 text-slate-500 text-xs">
            No inventory records registered.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-500 border-b border-slate-200 font-medium">
                <tr>
                  <th className="py-3 px-4">SKU Code</th>
                  <th className="py-3 px-4">Product Name</th>
                  <th className="py-3 px-4 text-center">Current Stock</th>
                  <th className="py-3 px-4 text-center">Reorder Threshold</th>
                  <th className="py-3 px-4 text-center">Max Capacity</th>
                  <th className="py-3 px-4 text-center">Health Status</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {inventory.map((item) => (
                  <tr key={item.inventory_id} className="hover:bg-slate-50/60 transition-colors">
                    <td className="py-3.5 px-4 font-mono font-medium text-blue-600">
                      {item.product?.sku_code || 'N/A'}
                    </td>
                    <td className="py-3.5 px-4 font-medium text-slate-900">
                      {item.product?.product_name || 'N/A'}
                    </td>
                    <td className="py-3.5 px-4 text-center font-bold text-slate-900 tabular-nums">
                      {item.current_stock.toLocaleString()}
                    </td>
                    <td className="py-3.5 px-4 text-center tabular-nums text-slate-600">
                      {item.reorder_level} units
                    </td>
                    <td className="py-3.5 px-4 text-center tabular-nums text-slate-600">
                      {item.max_stock} units
                    </td>
                    <td className="py-3.5 px-4 text-center">
                      <StatusBadge status={item.health_status} />
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => openRestockModal(item)}
                          className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-blue-50 text-blue-700 text-xs font-semibold border border-blue-200 hover:bg-blue-100 transition-colors"
                        >
                          <PlusCircle className="w-3.5 h-3.5" />
                          Restock
                        </button>
                        <button
                          onClick={() => openLimitsModal(item)}
                          className="p-1 rounded-md text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
                          title="Edit stock levels"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
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

      {/* Quick Restock Modal */}
      <Modal
        isOpen={restockModalOpen}
        onClose={() => setRestockModalOpen(false)}
        title={`Quick Restock: ${selectedItem?.product?.sku_code}`}
      >
        {errorMsg && (
          <div className="mb-4 p-2.5 rounded-lg bg-rose-50 border border-rose-200 text-rose-700 text-xs">
            {errorMsg}
          </div>
        )}
        <form onSubmit={handleRestockSubmit} className="space-y-4">
          <div>
            <p className="text-xs text-slate-600 mb-2">
              Product: <b>{selectedItem?.product?.product_name}</b>
            </p>
            <p className="text-xs text-slate-600 mb-4">
              Current Stock: <span className="font-bold text-slate-900">{selectedItem?.current_stock} units</span>
            </p>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1">
              Quantity to Add *
            </label>
            <input
              type="number"
              min="1"
              required
              value={restockQty}
              onChange={(e) => setRestockQty(e.target.value)}
              className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs tabular-nums focus:outline-none focus:ring-2 focus:ring-blue-600"
            />
          </div>

          <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setRestockModalOpen(false)}
              className="px-3.5 py-2 rounded-lg border border-slate-200 text-xs font-medium text-slate-700 hover:bg-slate-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-4 py-2 rounded-lg bg-blue-600 text-white text-xs font-semibold hover:bg-blue-700 disabled:opacity-50"
            >
              {submitting ? 'Updating...' : 'Confirm Restock'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Edit Thresholds Modal */}
      <Modal
        isOpen={limitsModalOpen}
        onClose={() => setLimitsModalOpen(false)}
        title={`Adjust Stock Limits: ${selectedItem?.product?.sku_code}`}
      >
        {errorMsg && (
          <div className="mb-4 p-2.5 rounded-lg bg-rose-50 border border-rose-200 text-rose-700 text-xs">
            {errorMsg}
          </div>
        )}
        <form onSubmit={handleLimitsSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1">Override Current Stock</label>
            <input
              type="number"
              min="0"
              required
              value={limitForm.current_stock}
              onChange={(e) => setLimitForm({ ...limitForm, current_stock: e.target.value })}
              className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs tabular-nums"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">Reorder Threshold</label>
              <input
                type="number"
                min="0"
                required
                value={limitForm.reorder_level}
                onChange={(e) => setLimitForm({ ...limitForm, reorder_level: e.target.value })}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs tabular-nums"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">Max Capacity</label>
              <input
                type="number"
                min="1"
                required
                value={limitForm.max_stock}
                onChange={(e) => setLimitForm({ ...limitForm, max_stock: e.target.value })}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs tabular-nums"
              />
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setLimitsModalOpen(false)}
              className="px-3.5 py-2 rounded-lg border border-slate-200 text-xs font-medium text-slate-700 hover:bg-slate-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-4 py-2 rounded-lg bg-blue-600 text-white text-xs font-semibold hover:bg-blue-700 disabled:opacity-50"
            >
              {submitting ? 'Saving...' : 'Save Settings'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default Inventory;
