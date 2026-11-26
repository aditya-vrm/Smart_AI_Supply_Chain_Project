import React, { useState, useEffect } from 'react';
import api from '../api/axios';
import StatusBadge from '../components/StatusBadge';
import { ShieldAlert, CheckCircle, RefreshCw, ShoppingBag } from 'lucide-react';

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
      console.error('Failed to load anomaly incidents:', err);
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
      alert('Failed to resolve alert incident');
    }
  };

  const handleEvaluateAll = async () => {
    try {
      setEvaluating(true);
      await api.post('/alerts/evaluate');
      fetchAlerts();
    } catch (err) {
      alert('Failed to trigger heuristic evaluation');
    } finally {
      setEvaluating(false);
    }
  };

  return (
    <div className="space-y-6 font-sans">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-800/80">
        <div>
          <h2 className="text-xl font-bold font-mono tracking-wider text-white uppercase flex items-center gap-2">
            <ShieldAlert className="w-5 h-5 text-rose-400" />
            ANOMALY DETECTION & REORDER COMMAND
          </h2>
          <p className="text-xs font-mono text-slate-400 mt-1">
            Automated detection of inventory variances with exact algorithmic purchase quantities
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={handleEvaluateAll}
            disabled={evaluating}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-gradient-to-r from-emerald-500 to-cyan-500 text-slate-950 text-xs font-mono font-bold uppercase tracking-wider hover:from-emerald-400 hover:to-cyan-400 transition-all shadow-[0_0_15px_rgba(16,185,129,0.3)] disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${evaluating ? 'animate-spin' : ''}`} />
            <span>TRIGGER GLOBAL EVALUATION</span>
          </button>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center justify-between bg-[#0D131F]/90 backdrop-blur-md p-3 rounded-xl border border-slate-800 font-mono">
        <div className="flex items-center gap-2">
          {['ACTIVE', 'RESOLVED', 'ALL'].map((tab) => (
            <button
              key={tab}
              onClick={() => setStatusFilter(tab)}
              className={`px-3.5 py-1.5 text-xs font-bold uppercase tracking-wider rounded-lg transition-all ${
                statusFilter === tab
                  ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shadow-sm'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800'
              }`}
            >
              {tab === 'ACTIVE' ? 'ACTIVE INCIDENTS' : tab === 'RESOLVED' ? 'MITIGATED' : 'ALL INCIDENTS'}
            </button>
          ))}
        </div>
        <span className="text-xs text-slate-500 px-2 font-mono">
          COUNT: <span className="text-white font-bold">{alerts.length}</span>
        </span>
      </div>

      {/* Alerts Table */}
      <div className="bg-[#0D131F]/90 backdrop-blur-md rounded-xl border border-slate-800 overflow-hidden shadow-xl">
        {loading ? (
          <div className="flex items-center justify-center h-48">
            <div className="w-8 h-8 border-2 border-rose-500 border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : alerts.length === 0 ? (
          <div className="text-center py-12 text-slate-500 text-xs font-mono">
            NO ANOMALIES FOUND UNDER SELECTED FILTER &bull; INVENTORY IN EQUILIBRIUM.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs font-mono">
              <thead className="bg-slate-900/80 text-slate-400 border-b border-slate-800 uppercase tracking-wider">
                <tr>
                  <th className="py-3 px-4">Trigger Time</th>
                  <th className="py-3 px-4">Target SKU</th>
                  <th className="py-3 px-4">Product Designation</th>
                  <th className="py-3 px-4">Risk Level</th>
                  <th className="py-3 px-4">Prescribed Reorder</th>
                  <th className="py-3 px-4">Telemetry Detail</th>
                  <th className="py-3 px-4 text-right">Command</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {alerts.map((a) => (
                  <tr key={a.alert_id} className="hover:bg-slate-800/40 transition-colors">
                    <td className="py-3.5 px-4 text-slate-400 whitespace-nowrap">
                      {new Date(a.created_at).toLocaleDateString()}
                    </td>
                    <td className="py-3.5 px-4 font-bold text-cyan-400 tracking-wider">
                      {a.product?.sku_code || 'N/A'}
                    </td>
                    <td className="py-3.5 px-4 font-medium text-white">
                      {a.product?.product_name || 'N/A'}
                    </td>
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      <StatusBadge status={a.alert_type} />
                    </td>
                    <td className="py-3.5 px-4 tabular-nums">
                      {a.recommended_qty > 0 ? (
                        <span className="font-bold text-rose-400 flex items-center gap-1">
                          <ShoppingBag className="w-3.5 h-3.5" />
                          REORDER {a.recommended_qty} UNITS
                        </span>
                      ) : (
                        <span className="text-slate-500">HOLD BUYING</span>
                      )}
                    </td>
                    <td className="py-3.5 px-4 text-slate-400 max-w-sm">
                      {a.message}
                    </td>
                    <td className="py-3.5 px-4 text-right whitespace-nowrap">
                      {a.status === 'ACTIVE' ? (
                        <button
                          onClick={() => handleResolve(a.alert_id)}
                          className="inline-flex items-center gap-1 px-2.5 py-1 rounded bg-emerald-500/15 text-emerald-300 text-xs font-mono font-semibold border border-emerald-500/30 hover:bg-emerald-500/25 transition-all"
                        >
                          <CheckCircle className="w-3.5 h-3.5" />
                          RESOLVE
                        </button>
                      ) : (
                        <span className="text-[11px] font-bold text-slate-500 uppercase">MITIGATED</span>
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
