import React, { useState, useEffect } from 'react';
import api from '../api/axios';
import { Cpu, Award, Play, AlertCircle, Calendar, BarChart3, Radio } from 'lucide-react';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend
} from 'recharts';

const Forecasting = () => {
  const [products, setProducts] = useState([]);
  const [selectedProductId, setSelectedProductId] = useState('');
  const [horizonDays, setHorizonDays] = useState(30);
  const [forecastResult, setForecastResult] = useState(null);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    const init = async () => {
      try {
        const prodRes = await api.get('/products');
        setProducts(prodRes.data);
        if (prodRes.data.length > 0) {
          setSelectedProductId(prodRes.data[0].product_id);
        }
        const histRes = await api.get('/forecasting/history');
        setHistory(histRes.data);
      } catch (err) {
        console.error('Failed to initialize forecasting matrix:', err);
      }
    };
    init();
  }, []);

  const handleRunForecast = async (e) => {
    if (e) e.preventDefault();
    if (!selectedProductId) return;

    setErrorMsg('');
    setLoading(true);
    setForecastResult(null);

    try {
      const res = await api.post('/forecasting/predict', {
        product_id: parseInt(selectedProductId),
        horizon_days: parseInt(horizonDays),
      });
      setForecastResult(res.data);
      const histRes = await api.get('/forecasting/history');
      setHistory(histRes.data);
    } catch (err) {
      setErrorMsg(err.response?.data?.detail || 'Failed to train and evaluate ML models.');
    } finally {
      setLoading(false);
    }
  };

  const selectedProduct = products.find(p => p.product_id === parseInt(selectedProductId));

  return (
    <div className="space-y-6 font-sans">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-800/80">
        <div>
          <h2 className="text-xl font-bold font-mono tracking-wider text-white uppercase flex items-center gap-2">
            <Cpu className="w-5 h-5 text-cyan-400" />
            AI DEMAND FORECASTING MATRIX
          </h2>
          <p className="text-xs font-mono text-slate-400 mt-1">
            Dual-model ML pipeline (Random Forest vs XGBoost) with 80/20 chronological validation
          </p>
        </div>
      </div>

      {/* Cyber ML Control Console */}
      <div className="bg-[#0D131F]/90 backdrop-blur-md p-6 rounded-xl border border-slate-800 shadow-xl relative overflow-hidden">
        <div className="absolute top-0 inset-x-0 h-[1.5px] bg-gradient-to-r from-cyan-500 via-emerald-500 to-indigo-500"></div>

        <form onSubmit={handleRunForecast} className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end font-mono">
          <div className="md:col-span-2">
            <label className="block text-xs uppercase tracking-wider text-slate-300 mb-1.5">
              Target SKU Designation
            </label>
            <select
              value={selectedProductId}
              onChange={(e) => setSelectedProductId(e.target.value)}
              className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-xs font-mono text-white focus:outline-none focus:ring-2 focus:ring-cyan-500"
            >
              {products.map((p) => (
                <option key={p.product_id} value={p.product_id}>
                  {p.sku_code} — {p.product_name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs uppercase tracking-wider text-slate-300 mb-1.5">
              Projection Horizon
            </label>
            <div className="grid grid-cols-3 gap-1 bg-slate-900 p-1 rounded-lg border border-slate-700">
              {[7, 30, 90].map((days) => (
                <button
                  type="button"
                  key={days}
                  onClick={() => setHorizonDays(days)}
                  className={`py-1.5 text-xs font-mono font-bold rounded transition-all ${
                    horizonDays === days
                      ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shadow-sm'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  {days}d
                </button>
              ))}
            </div>
          </div>

          <div>
            <button
              type="submit"
              disabled={loading || !selectedProductId}
              className="w-full py-2.5 px-4 rounded-lg bg-gradient-to-r from-cyan-400 to-emerald-400 text-slate-950 text-xs font-mono font-bold uppercase tracking-wider hover:from-cyan-300 hover:to-emerald-300 transition-all shadow-[0_0_15px_rgba(6,182,212,0.3)] flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {loading ? (
                <>
                  <div className="w-3.5 h-3.5 border-2 border-slate-950 border-t-transparent rounded-full animate-spin"></div>
                  <span>Training ML Ensembles...</span>
                </>
              ) : (
                <>
                  <Play className="w-3.5 h-3.5 fill-current" />
                  <span>Execute Projection</span>
                </>
              )}
            </button>
          </div>
        </form>

        {errorMsg && (
          <div className="mt-4 p-3 rounded-lg bg-rose-950/60 border border-rose-500/40 text-rose-300 text-xs font-mono flex items-center gap-2">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}
      </div>

      {/* Forecast Output Presentation */}
      {forecastResult && (
        <div className="space-y-6">
          {/* Winner Banner */}
          <div className="p-5 rounded-xl bg-gradient-to-r from-cyan-950/40 via-emerald-950/30 to-indigo-950/40 border border-cyan-500/30 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-xl">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-xl bg-cyan-500/20 text-cyan-400 border border-cyan-500/30">
                <Award className="w-6 h-6" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h4 className="text-sm font-bold font-mono tracking-wider text-white uppercase">
                    CHAMPION MODEL: {forecastResult.recommended_model}
                  </h4>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                    LOWEST RESIDUAL
                  </span>
                </div>
                <p className="text-xs font-mono text-slate-400 mt-1">
                  Optimal chronological validation fit for {horizonDays}-day demand horizon on <b>{forecastResult.product_name}</b>.
                </p>
              </div>
            </div>
            <div className="text-right self-end sm:self-auto font-mono">
              <span className="text-[11px] text-slate-400 uppercase tracking-wider block">Gross Projected Units</span>
              <span className="text-2xl font-bold text-cyan-400 tabular-nums">
                {forecastResult.models.find(m => m.model_name === forecastResult.recommended_model)?.predicted_qty.toLocaleString()} units
              </span>
            </div>
          </div>

          {/* Model Comparison Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {forecastResult.models.map((model) => {
              const isWinner = model.model_name === forecastResult.recommended_model;
              return (
                <div
                  key={model.model_name}
                  className={`bg-[#0D131F]/90 backdrop-blur-md rounded-xl border p-6 transition-all font-mono ${
                    isWinner ? 'border-cyan-500 shadow-[0_0_20px_rgba(6,182,212,0.15)] ring-1 ring-cyan-500/40' : 'border-slate-800'
                  }`}
                >
                  <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                    <div className="flex items-center gap-2">
                      <Cpu className={`w-4 h-4 ${isWinner ? 'text-cyan-400' : 'text-slate-500'}`} />
                      <h4 className="text-sm font-bold text-white uppercase">{model.model_name}</h4>
                    </div>
                    {isWinner && (
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-cyan-500/20 text-cyan-400 border border-cyan-500/30 uppercase tracking-wider">
                        DEPLOYED MODEL
                      </span>
                    )}
                  </div>

                  <div className="grid grid-cols-3 gap-3 my-4">
                    <div className="p-3 bg-slate-900/90 rounded-lg border border-slate-800 text-center">
                      <span className="text-[10px] uppercase font-bold text-slate-500 block">MAE</span>
                      <span className="text-sm font-bold text-white tabular-nums mt-0.5 block">{model.mae}</span>
                    </div>
                    <div className="p-3 bg-slate-900/90 rounded-lg border border-slate-800 text-center">
                      <span className="text-[10px] uppercase font-bold text-slate-500 block">RMSE</span>
                      <span className="text-sm font-bold text-white tabular-nums mt-0.5 block">{model.rmse}</span>
                    </div>
                    <div className="p-3 bg-slate-900/90 rounded-lg border border-slate-800 text-center">
                      <span className="text-[10px] uppercase font-bold text-slate-500 block">MAPE</span>
                      <span className="text-sm font-bold text-emerald-400 tabular-nums mt-0.5 block">{model.mape}%</span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-2 border-t border-slate-800 text-xs">
                    <span className="text-slate-400 uppercase">Horizon Requirement:</span>
                    <span className="font-bold text-white tabular-nums text-sm">
                      {model.predicted_qty.toLocaleString()} units
                    </span>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Interactive Dual-Model Recharts Forecast Graph */}
          <div className="bg-[#0D131F]/90 backdrop-blur-md p-6 rounded-xl border border-slate-800 shadow-xl">
            <div className="flex items-center justify-between mb-5">
              <div>
                <h3 className="text-sm font-bold font-mono tracking-wider text-white uppercase flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse"></span>
                  GROUND TRUTH ACTUALS VS. ML PROJECTIONS
                </h3>
                <p className="text-xs font-mono text-slate-400 mt-0.5">Continuous daily sales plotted against forward Random Forest & XGBoost outputs</p>
              </div>
              <div className="text-[11px] font-mono text-slate-400">
                HORIZON: <span className="font-bold text-cyan-400">{horizonDays} DAYS</span>
              </div>
            </div>

            <div className="h-80 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={forecastResult.chart_data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#1E293B" />
                  <XAxis 
                    dataKey="date" 
                    tickLine={false} 
                    axisLine={{ stroke: '#334155' }} 
                    tick={{ fill: '#94A3B8', fontSize: 10, fontFamily: 'monospace' }}
                    tickFormatter={(val) => val.slice(5)}
                  />
                  <YAxis 
                    tickLine={false} 
                    axisLine={{ stroke: '#334155' }} 
                    tick={{ fill: '#94A3B8', fontSize: 10, fontFamily: 'monospace' }}
                  />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#0D131F', borderRadius: '8px', border: '1px solid #334155', fontSize: '11px', fontFamily: 'monospace', color: '#F8FAFC' }}
                  />
                  <Legend wrapperStyle={{ fontSize: '11px', fontFamily: 'monospace', paddingTop: '10px' }} />
                  <Line 
                    type="monotone" 
                    dataKey="actual" 
                    name="Actual Ground Truth" 
                    stroke="#FFFFFF" 
                    strokeWidth={2}
                    dot={{ r: 2, fill: '#FFFFFF' }}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="rf_predicted" 
                    name="Random Forest Pred." 
                    stroke="#06B6D4" 
                    strokeWidth={2}
                    strokeDasharray="4 4"
                    dot={false}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="xgb_predicted" 
                    name="XGBoost Pred." 
                    stroke="#10B981" 
                    strokeWidth={2}
                    strokeDasharray="2 2"
                    dot={false}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      )}

      {/* Historical Forecast Logs */}
      <div className="bg-[#0D131F]/90 backdrop-blur-md rounded-xl border border-slate-800 overflow-hidden shadow-xl">
        <div className="px-6 py-4 border-b border-slate-800 bg-slate-900/60 flex items-center justify-between">
          <div>
            <h3 className="text-sm font-bold font-mono tracking-wider text-white uppercase">
              MODEL AUDIT REGISTRY
            </h3>
            <p className="text-xs font-mono text-slate-400 mt-0.5">Chronological execution history and cross-validation performance</p>
          </div>
        </div>
        {history.length === 0 ? (
          <div className="text-center py-8 text-xs font-mono text-slate-500">
            NO FORECAST RUNS RECORDED. INITIATE FIRST PROJECTION ABOVE.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs font-mono">
              <thead className="bg-slate-900/80 text-slate-400 border-b border-slate-800 uppercase tracking-wider">
                <tr>
                  <th className="py-3 px-4">Timestamp</th>
                  <th className="py-3 px-4">SKU</th>
                  <th className="py-3 px-4 text-center">Horizon</th>
                  <th className="py-3 px-4">Model Deployed</th>
                  <th className="py-3 px-4 text-center">MAE</th>
                  <th className="py-3 px-4 text-center">RMSE</th>
                  <th className="py-3 px-4 text-center">MAPE</th>
                  <th className="py-3 px-4 text-right">Predicted Demand</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {history.map((h) => (
                  <tr key={h.forecast_id} className="hover:bg-slate-800/40">
                    <td className="py-3 px-4 text-slate-400">
                      {new Date(h.created_at).toLocaleDateString()}
                    </td>
                    <td className="py-3 px-4 font-bold text-cyan-400 tracking-wider">
                      {h.product?.sku_code || 'N/A'}
                    </td>
                    <td className="py-3 px-4 text-center font-bold text-slate-300">
                      {h.horizon_days}d
                    </td>
                    <td className="py-3 px-4 text-white">
                      {h.model_used}
                    </td>
                    <td className="py-3 px-4 text-center tabular-nums text-slate-300">{h.mae}</td>
                    <td className="py-3 px-4 text-center tabular-nums text-slate-300">{h.rmse}</td>
                    <td className="py-3 px-4 text-center tabular-nums text-emerald-400">{h.mape}%</td>
                    <td className="py-3 px-4 text-right font-bold text-cyan-400 tabular-nums">
                      {Math.round(h.predicted_qty).toLocaleString()} units
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

export default Forecasting;
