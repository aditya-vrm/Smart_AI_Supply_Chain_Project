import React, { useState, useEffect } from 'react';
import api from '../api/axios';
import StatusBadge from '../components/StatusBadge';
import { AlertTriangle, CheckCircle, RefreshCw, ShoppingBag } from 'lucide-react';

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
      alert('Failed to trigger alert evaluation');
    } finally {
      setEvaluating(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight">Smart Alerts & Reorder Engine</h2>
          <p className="text-xs text-slate-500 mt-0.5">Automated detection of low-stock and overstock conditions with exact reorder quantities</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={handleEvaluateAll}
            disabled={evaluating}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-blue-600 text-white text-xs font-semibold hover:bg-blue-700 transition-colors shadow-sm disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${evaluating ? 'animate-spin' : ''}`} />
            Evaluate All Inventory
          </button>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center justify-between bg-white p-3 rounded-xl border border-slate-200">
        <div className="flex items-center gap-2">
          {['ACTIVE', 'RESOLVED', 'ALL'].map((tab) => (
            <button
              key={tab}
              onClick={() => setStatusFilter(tab)}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors ${
                statusFilter === tab
                  ? 'bg-blue-50 text-blue-700'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              {tab === 'ACTIVE' ? 'Active Alerts' : tab === 'RESOLVED' ? 'Resolved' : 'All Alerts'}
            </button>
          ))}
        </div>
        <span className="text-xs text-slate-400 font-medium px-2">
          Showing {alerts.length} record(s)
        </span>
      </div>

      {/* Alerts Table */}
      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm">
        {loading ? (
          <div className="flex items-center justify-center h-48">
            <div className="w-7 h-7 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : alerts.length === 0 ? (
          <div className="text-center py-12 text-slate-500 text-xs">
            No alerts found under current filter. All stock is balanced.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-500 border-b border-slate-200 font-medium">
                <tr>
                  <th className="py-3 px-4">Date Triggered</th>
                  <th className="py-3 px-4">Product SKU</th>
                  <th className="py-3 px-4">Product Name</th>
                  <th className="py-3 px-4">Condition</th>
                  <th className="py-3 px-4">Recommended Reorder</th>
                  <th className="py-3 px-4">Alert Reason / Message</th>
                  <th className="py-3 px-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {alerts.map((a) => (
                  <tr key={a.alert_id} className="hover:bg-slate-50/60 transition-colors">
                    <td className="py-3.5 px-4 text-slate-500 whitespace-nowrap">
                      {new Date(a.created_at).toLocaleDateString()}
                    </td>
                    <td className="py-3.5 px-4 font-mono font-medium text-blue-600">
                      {a.product?.sku_code || 'N/A'}
                    </td>
                    <td className="py-3.5 px-4 font-medium text-slate-900">
                      {a.product?.product_name || 'N/A'}
                    </td>
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      <StatusBadge status={a.alert_type} />
                    </td>
                    <td className="py-3.5 px-4 tabular-nums">
                      {a.recommended_qty > 0 ? (
                        <span className="font-bold text-rose-600 flex items-center gap-1">
                          <ShoppingBag className="w-3.5 h-3.5" />
                          Reorder {a.recommended_qty} units
                        </span>
                      ) : (
                        <span className="text-slate-400 font-medium">None required</span>
                      )}
                    </td>
                    <td className="py-3.5 px-4 text-slate-600 max-w-sm">
                      {a.message}
                    </td>
                    <td className="py-3.5 px-4 text-right whitespace-nowrap">
                      {a.status === 'ACTIVE' ? (
                        <button
                          onClick={() => handleResolve(a.alert_id)}
                          className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-emerald-50 text-emerald-700 text-xs font-semibold border border-emerald-200 hover:bg-emerald-100 transition-colors"
                        >
                          <CheckCircle className="w-3.5 h-3.5" />
                          Mark Resolved
                        </button>
                      ) : (
                        <span className="text-[11px] font-medium text-slate-400">Resolved</span>
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
