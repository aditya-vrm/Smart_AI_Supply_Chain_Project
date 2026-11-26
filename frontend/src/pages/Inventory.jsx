import React, { useState, useEffect } from 'react';
import api from '../api/axios';
import Modal from '../components/Modal';
import StatusBadge from '../components/StatusBadge';
import { Database, PlusCircle, Sliders, ShieldCheck } from 'lucide-react';

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
      setErrorMsg(err.response?.data?.detail || 'Failed to update thresholds');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6 font-sans">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-800/80">
        <div>
          <h2 className="text-xl font-bold font-mono tracking-wider text-white uppercase flex items-center gap-2">
            <Database className="w-5 h-5 text-emerald-400" />
            STOCK TELEMETRY & CAPACITIES
          </h2>
          <p className="text-xs font-mono text-slate-400 mt-1">Real-time physical unit counts, safety buffers, and saturation ratios</p>
        </div>
      </div>

      <div className="bg-[#0D131F]/90 backdrop-blur-md rounded-xl border border-slate-800 overflow-hidden shadow-xl">
        {loading ? (
          <div className="flex items-center justify-center h-48">
            <div className="w-8 h-8 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : inventory.length === 0 ? (
          <div className="text-center py-12 text-slate-500 text-xs font-mono">
            NO INVENTORY NODES LOGGED.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs font-mono">
              <thead className="bg-slate-900/80 text-slate-400 border-b border-slate-800 uppercase tracking-wider">
                <tr>
                  <th className="py-3 px-4">SKU Designation</th>
                  <th className="py-3 px-4">Catalog Item</th>
                  <th className="py-3 px-4 text-center">Current Stock</th>
                  <th className="py-3 px-4 text-center">Safety Reorder Buffer</th>
                  <th className="py-3 px-4 text-center">Max Ceiling</th>
                  <th className="py-3 px-4 text-center">Equilibrium Status</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {inventory.map((item) => {
                  const percent = Math.min(100, Math.round((item.current_stock / item.max_stock) * 100));
                  return (
                    <tr key={item.inventory_id} className="hover:bg-slate-800/40 transition-colors">
                      <td className="py-3.5 px-4 font-bold text-cyan-400 tracking-wider">
                        {item.product?.sku_code || 'N/A'}
                      </td>
                      <td className="py-3.5 px-4 font-medium text-white">
                        {item.product?.product_name || 'N/A'}
                      </td>
                      <td className="py-3.5 px-4 text-center">
                        <span className="text-base font-bold text-white tabular-nums">
                          {item.current_stock.toLocaleString()}
                        </span>
                        <div className="w-24 bg-slate-800 h-1 rounded-full mx-auto mt-1 overflow-hidden">
                          <div 
                            className={`h-full ${item.health_status === 'LOW_STOCK' ? 'bg-rose-500' : item.health_status === 'OVERSTOCK' ? 'bg-amber-500' : 'bg-emerald-500'}`}
                            style={{ width: `${percent}%` }}
                          ></div>
                        </div>
                      </td>
                      <td className="py-3.5 px-4 text-center tabular-nums text-slate-300">
                        {item.reorder_level} units
                      </td>
                      <td className="py-3.5 px-4 text-center tabular-nums text-slate-300">
                        {item.max_stock} units
                      </td>
                      <td className="py-3.5 px-4 text-center">
                        <StatusBadge status={item.health_status} />
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => openRestockModal(item)}
                            className="inline-flex items-center gap-1 px-2.5 py-1 rounded bg-emerald-500/15 text-emerald-300 text-xs font-mono font-semibold border border-emerald-500/40 hover:bg-emerald-500/25 transition-all shadow-sm"
                          >
                            <PlusCircle className="w-3.5 h-3.5" />
                            RESTOCK
                          </button>
                          <button
                            onClick={() => openLimitsModal(item)}
                            className="p-1 rounded text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
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

      {/* Dark Restock Modal */}
      <Modal
        isOpen={restockModalOpen}
        onClose={() => setRestockModalOpen(false)}
        title={`INTAKE REPLENISHMENT: ${selectedItem?.product?.sku_code}`}
      >
        {errorMsg && (
          <div className="mb-4 p-2.5 rounded-lg bg-rose-950/60 border border-rose-500/40 text-rose-300 text-xs font-mono">
            {errorMsg}
          </div>
        )}
        <form onSubmit={handleRestockSubmit} className="space-y-4 font-mono">
          <div className="p-3 bg-slate-900 rounded-lg border border-slate-800">
            <p className="text-xs text-slate-400">
              Target SKU: <span className="font-bold text-white">{selectedItem?.product?.product_name}</span>
            </p>
            <p className="text-xs text-slate-400 mt-1">
              Active Stock: <span className="font-bold text-emerald-400 tabular-nums">{selectedItem?.current_stock} units</span>
            </p>
          </div>

          <div>
            <label className="block text-xs text-slate-300 mb-1 uppercase">
              Units to Inject into Warehouse *
            </label>
            <input
              type="number"
              min="1"
              required
              value={restockQty}
              onChange={(e) => setRestockQty(e.target.value)}
              className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-xs font-mono text-white tabular-nums focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          <div className="flex justify-end gap-2 pt-3 border-t border-slate-800">
            <button
              type="button"
              onClick={() => setRestockModalOpen(false)}
              className="px-3.5 py-2 rounded-lg border border-slate-700 text-xs font-mono text-slate-400 hover:text-white hover:bg-slate-800"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-4 py-2 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-mono font-bold uppercase tracking-wider disabled:opacity-50"
            >
              {submitting ? 'Updating...' : 'Confirm Replenishment'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Dark Edit Limits Modal */}
      <Modal
        isOpen={limitsModalOpen}
        onClose={() => setLimitsModalOpen(false)}
        title={`CALIBRATE THRESHOLDS: ${selectedItem?.product?.sku_code}`}
      >
        {errorMsg && (
          <div className="mb-4 p-2.5 rounded-lg bg-rose-950/60 border border-rose-500/40 text-rose-300 text-xs font-mono">
            {errorMsg}
          </div>
        )}
        <form onSubmit={handleLimitsSubmit} className="space-y-4 font-mono">
          <div>
            <label className="block text-xs text-slate-300 mb-1 uppercase">Manual Stock Override</label>
            <input
              type="number"
              min="0"
              required
              value={limitForm.current_stock}
              onChange={(e) => setLimitForm({ ...limitForm, current_stock: e.target.value })}
              className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-xs font-mono text-white tabular-nums"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs text-slate-300 mb-1 uppercase">Reorder Boundary</label>
              <input
                type="number"
                min="0"
                required
                value={limitForm.reorder_level}
                onChange={(e) => setLimitForm({ ...limitForm, reorder_level: e.target.value })}
                className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-xs font-mono text-white tabular-nums"
              />
            </div>
            <div>
              <label className="block text-xs text-slate-300 mb-1 uppercase">Capacity Ceiling</label>
              <input
                type="number"
                min="1"
                required
                value={limitForm.max_stock}
                onChange={(e) => setLimitForm({ ...limitForm, max_stock: e.target.value })}
                className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-xs font-mono text-white tabular-nums"
              />
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-3 border-t border-slate-800">
            <button
              type="button"
              onClick={() => setLimitsModalOpen(false)}
              className="px-3.5 py-2 rounded-lg border border-slate-700 text-xs font-mono text-slate-400 hover:text-white hover:bg-slate-800"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-4 py-2 rounded-lg bg-cyan-500 hover:bg-cyan-400 text-slate-950 text-xs font-mono font-bold uppercase tracking-wider disabled:opacity-50"
            >
              {submitting ? 'Writing...' : 'Save Parameters'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default Inventory;
