import React, { useState, useEffect } from 'react';
import api from '../api/axios';
import StatusBadge from '../components/StatusBadge';
import { AlertTriangle, CheckCircle, RefreshCw, ShoppingCart } from 'lucide-react';

const Alerts = () => {
  const [alerts, setAlerts] = useState([]);
  const [statusFilter, setStatusFilter] = useState('ACTIVE');
  const [loading, setLoading] = useState(true);
  const [evaluating, setEvaluating] = useState(false);

  const fetchAlerts = async () => {
    try {
      setLoading(true);
      const res = await api.get('/alerts', {
        params: { status: statusFilter !== 'ALL' ? statusFilter : undefined },
      });
      setAlerts(res.data);
    } catch (err) {
      console.error('Failed to load alerts:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAlerts();
  }, [statusFilter]);

  const handleResolve = async (alertId) => {
    try {
      await api.put(`/alerts/${alertId}/resolve`);
      fetchAlerts();
    } catch (err) {
      alert('Failed to resolve alert');
    }
  };

  const handleEvaluateAll = async () => {
    try {
      setEvaluating(true);
      await api.post('/alerts/evaluate');
      fetchAlerts();
    } catch (err) {
      alert('Failed to evaluate inventory');
    } finally {
      setEvaluating(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-sand/15">
        <div>
          <h2 className="text-xl font-bold text-sand-50 flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-purple" />
            Stock Alerts & Reorder Engine
          </h2>
          <p className="text-xs text-sand/65 mt-1">
            Automated stock level monitoring and algorithmic purchase quantities
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={handleEvaluateAll}
            disabled={evaluating}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-purple text-white text-xs font-semibold hover:bg-purple-hover transition-all shadow-lg shadow-purple/30 disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${evaluating ? 'animate-spin' : ''}`} />
            <span>Evaluate Inventory</span>
          </button>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center justify-between glass-card p-3 rounded-2xl border border-sand/15">
        <div className="flex items-center gap-2">
          {['ACTIVE', 'RESOLVED', 'ALL'].map((tab) => (
            <button
              key={tab}
              onClick={() => setStatusFilter(tab)}
              className={`px-3.5 py-1.5 text-xs font-semibold rounded-xl transition-all ${
                statusFilter === tab
                  ? 'bg-purple text-white shadow-md shadow-purple/30'
                  : 'text-sand/70 hover:text-sand-50 hover:bg-forest-850/60'
              }`}
            >
              {tab === 'ACTIVE' ? 'Active Alerts' : tab === 'RESOLVED' ? 'Resolved' : 'All Alerts'}
            </button>
          ))}
        </div>
        <span className="text-xs text-sand/70 px-2 font-mono">
          Total: <span className="text-sand-50 font-bold">{alerts.length}</span>
        </span>
      </div>

      {/* Alerts Table */}
      <div className="glass-card rounded-2xl overflow-hidden shadow-xl">
        {loading ? (
          <div className="flex items-center justify-center h-48">
            <div className="w-8 h-8 border-2 border-purple border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : alerts.length === 0 ? (
          <div className="text-center py-12 text-sand/60 text-xs">
            No alerts found. Inventory is within normal limits.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-forest-900/80 text-sand/70 border-b border-sand/10 uppercase tracking-wider text-[11px]">
                <tr>
                  <th className="py-3 px-4">Date</th>
                  <th className="py-3 px-4">SKU Code</th>
                  <th className="py-3 px-4">Product Name</th>
                  <th className="py-3 px-4">Alert Level</th>
                  <th className="py-3 px-4">Recommended Reorder</th>
                  <th className="py-3 px-4">Details</th>
                  <th className="py-3 px-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-sand/10 font-sans">
                {alerts.map((a) => (
                  <tr key={a.alert_id} className="hover:bg-forest-850/50 transition-colors">
                    <td className="py-3.5 px-4 font-mono text-sand/60 whitespace-nowrap">
                      {new Date(a.created_at).toLocaleDateString()}
                    </td>
                    <td className="py-3.5 px-4 font-mono font-bold text-sand-50 tracking-wider">
                      {a.product?.sku_code || 'N/A'}
                    </td>
                    <td className="py-3.5 px-4 font-medium text-sand-50">
                      {a.product?.product_name || 'N/A'}
                    </td>
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      <StatusBadge status={a.alert_type} />
                    </td>
                    <td className="py-3.5 px-4 tabular-nums">
                      {a.recommended_qty > 0 ? (
                        <span className="font-mono font-bold text-rose-300 flex items-center gap-1">
                          <ShoppingCart className="w-3.5 h-3.5" />
                          Reorder {a.recommended_qty} units
                        </span>
                      ) : (
                        <span className="text-sand/50">Normal</span>
                      )}
                    </td>
                    <td className="py-3.5 px-4 text-sand/70 max-w-sm">
                      {a.message}
                    </td>
                    <td className="py-3.5 px-4 text-right whitespace-nowrap">
                      {a.status === 'ACTIVE' ? (
                        <button
                          onClick={() => handleResolve(a.alert_id)}
                          className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-emerald-500/15 text-emerald-300 text-xs font-semibold border border-emerald-500/30 hover:bg-emerald-500/25 transition-all"
                        >
                          <CheckCircle className="w-3.5 h-3.5" />
                          Resolve
                        </button>
                      ) : (
                        <span className="text-[11px] font-semibold text-sand/50 uppercase">Resolved</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default Alerts;
