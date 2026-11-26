import React, { useState, useEffect } from 'react';
import api from '../api/axios';
import { Cpu, Award, Play, AlertCircle } from 'lucide-react';
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
        console.error('Failed to initialize forecasting:', err);
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
      setErrorMsg(err.response?.data?.detail || 'Failed to generate forecast.');
    } finally {
      setLoading(false);
    }
  };

  const selectedProduct = products.find(p => p.product_id === parseInt(selectedProductId));

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-sand/15">
        <div>
          <h2 className="text-xl font-bold text-sand-50 flex items-center gap-2">
            <Cpu className="w-5 h-5 text-purple" />
            AI Demand Forecasting
          </h2>
          <p className="text-xs text-sand/65 mt-1">
            Machine learning demand prediction comparing Random Forest and XGBoost with historical validation
          </p>
        </div>
      </div>

      {/* Control Console */}
      <div className="glass-card p-6 rounded-2xl shadow-xl relative overflow-hidden">
        <form onSubmit={handleRunForecast} className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
          <div className="md:col-span-2">
            <label className="block text-xs font-semibold text-sand/80 mb-1.5">
              Select Product
            </label>
            <select
              value={selectedProductId}
              onChange={(e) => setSelectedProductId(e.target.value)}
              className="w-full px-3 py-2 glass-input rounded-xl text-xs text-sand focus:outline-none"
            >
              {products.map((p) => (
                <option key={p.product_id} value={p.product_id} className="bg-forest-900 text-sand">
                  {p.sku_code} — {p.product_name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-sand/80 mb-1.5">
              Forecast Horizon
            </label>
            <div className="grid grid-cols-3 gap-1 bg-forest-900/80 p-1 rounded-xl border border-sand/15">
              {[7, 30, 90].map((days) => (
                <button
                  type="button"
                  key={days}
                  onClick={() => setHorizonDays(days)}
                  className={`py-1.5 text-xs font-mono font-bold rounded-lg transition-all ${
                    horizonDays === days
                      ? 'bg-purple text-white shadow-sm'
                      : 'text-sand/70 hover:text-sand-50'
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
              className="w-full py-2.5 px-4 rounded-xl bg-purple text-white text-xs font-semibold hover:bg-purple-hover transition-all shadow-lg shadow-purple/30 flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {loading ? (
                <>
                  <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span>Training Models...</span>
                </>
              ) : (
                <>
                  <Play className="w-3.5 h-3.5 fill-current" />
                  <span>Run Forecast</span>
                </>
              )}
            </button>
          </div>
        </form>

        {errorMsg && (
          <div className="mt-4 p-3 rounded-xl bg-rose-950/70 border border-rose-500/40 text-rose-300 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}
      </div>

      {/* Forecast Output Presentation */}
      {forecastResult && (
        <div className="space-y-6">
          {/* Winner Banner */}
          <div className="p-5 rounded-2xl bg-forest-900/90 border border-purple/40 backdrop-blur-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-xl">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-xl bg-purple/20 text-purple border border-purple/30">
                <Award className="w-6 h-6" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h4 className="text-sm font-bold text-sand-50 uppercase tracking-wider">
                    Recommended Model: {forecastResult.recommended_model}
                  </h4>
                  <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-purple/20 text-purple-light border border-purple/30">
                    Lowest Residual Error
                  </span>
                </div>
                <p className="text-xs text-sand/65 mt-1">
                  Optimal chronological validation fit for {horizonDays}-day demand horizon on <b>{forecastResult.product_name}</b>.
                </p>
              </div>
            </div>
            <div className="text-right self-end sm:self-auto font-mono">
              <span className="text-[11px] text-sand/70 uppercase tracking-wider block">Projected Total Demand</span>
              <span className="text-2xl font-bold text-sand-50 tabular-nums">
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
                  className={`glass-card rounded-2xl p-6 transition-all ${
                    isWinner ? 'border-purple shadow-[0_0_25px_rgba(139,92,246,0.25)] ring-1 ring-purple/40' : 'border-sand/15'
                  }`}
                >
                  <div className="flex items-center justify-between pb-3 border-b border-sand/15">
                    <div className="flex items-center gap-2">
                      <Cpu className={`w-4 h-4 ${isWinner ? 'text-purple' : 'text-sand/50'}`} />
                      <h4 className="text-sm font-bold text-sand-50">{model.model_name}</h4>
                    </div>
                    {isWinner && (
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-purple/20 text-purple-light border border-purple/30 uppercase tracking-wider">
                        Selected Best Fit
                      </span>
                    )}
                  </div>

                  <div className="grid grid-cols-3 gap-3 my-4">
                    <div className="p-3 bg-forest-900/80 rounded-xl border border-sand/15 text-center">
                      <span className="text-[10px] uppercase font-semibold text-sand/60 block">MAE</span>
                      <span className="text-sm font-mono font-bold text-sand-50 tabular-nums mt-0.5 block">{model.mae}</span>
                    </div>
                    <div className="p-3 bg-forest-900/80 rounded-xl border border-sand/15 text-center">
                      <span className="text-[10px] uppercase font-semibold text-sand/60 block">RMSE</span>
                      <span className="text-sm font-mono font-bold text-sand-50 tabular-nums mt-0.5 block">{model.rmse}</span>
                    </div>
                    <div className="p-3 bg-forest-900/80 rounded-xl border border-sand/15 text-center">
                      <span className="text-[10px] uppercase font-semibold text-sand/60 block">MAPE</span>
                      <span className="text-sm font-mono font-bold text-purple-light tabular-nums mt-0.5 block">{model.mape}%</span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-2 border-t border-sand/15 text-xs">
                    <span className="text-sand/70">Total Horizon Prediction:</span>
                    <span className="font-mono font-bold text-sand-50 tabular-nums text-sm">
                      {model.predicted_qty.toLocaleString()} units
                    </span>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Interactive Dual-Model Recharts Forecast Graph */}
          <div className="glass-card p-6 rounded-2xl shadow-xl">
            <div className="flex items-center justify-between mb-5">
              <div>
                <h3 className="text-sm font-bold text-sand-50 flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-purple animate-pulse"></span>
                  Actual Historical Sales vs. AI Demand Forecast
                </h3>
                <p className="text-xs text-sand/65 mt-0.5">Continuous daily sales plotted against Random Forest and XGBoost predictions</p>
              </div>
              <div className="text-[11px] font-mono text-sand/70">
                HORIZON: <span className="font-bold text-purple-light">{horizonDays} DAYS</span>
              </div>
            </div>

            <div className="h-80 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={forecastResult.chart_data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(232, 220, 196, 0.1)" />
                  <XAxis 
                    dataKey="date" 
                    tickLine={false} 
                    axisLine={{ stroke: 'rgba(232, 220, 196, 0.2)' }} 
                    tick={{ fill: '#DAC9A8', fontSize: 10, fontFamily: 'monospace' }}
                    tickFormatter={(val) => val.slice(5)}
                  />
                  <YAxis 
                    tickLine={false} 
                    axisLine={{ stroke: 'rgba(232, 220, 196, 0.2)' }} 
                    tick={{ fill: '#DAC9A8', fontSize: 10, fontFamily: 'monospace' }}
                  />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: '#14281D', 
                      borderRadius: '12px', 
                      border: '1px solid rgba(232, 220, 196, 0.2)', 
                      fontSize: '11px', 
                      fontFamily: 'monospace', 
                      color: '#E8DCC4' 
                    }}
                  />
                  <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />
                  <Line 
                    type="monotone" 
                    dataKey="actual" 
                    name="Actual Sales" 
                    stroke="#E8DCC4" 
                    strokeWidth={2}
                    dot={{ r: 2, fill: '#E8DCC4' }}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="rf_predicted" 
                    name="Random Forest" 
                    stroke="#8B5CF6" 
                    strokeWidth={2}
                    strokeDasharray="4 4"
                    dot={false}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="xgb_predicted" 
                    name="XGBoost" 
                    stroke="#C084FC" 
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
      {history.length > 0 && (
        <div className="glass-card rounded-2xl overflow-hidden shadow-xl">
          <div className="p-4 border-b border-sand/15">
            <h3 className="text-xs font-semibold text-sand/80 uppercase tracking-wider">
              Recent Forecast History
            </h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-forest-900/80 text-sand/70 border-b border-sand/10 uppercase tracking-wider text-[11px]">
                <tr>
                  <th className="py-3 px-4">Timestamp</th>
                  <th className="py-3 px-4">SKU</th>
                  <th className="py-3 px-4">Product Name</th>
                  <th className="py-3 px-4 text-center">Horizon</th>
                  <th className="py-3 px-4">Best Model</th>
                  <th className="py-3 px-4 text-right">Projected Demand</th>
                  <th className="py-3 px-4 text-right">Error (MAPE)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-sand/10 font-sans">
                {history.slice(0, 10).map((h) => (
                  <tr key={h.forecast_id} className="hover:bg-forest-850/50 transition-colors">
                    <td className="py-3 px-4 font-mono text-sand/60">
                      {new Date(h.created_at).toLocaleDateString()}
                    </td>
                    <td className="py-3 px-4 font-mono font-bold text-sand-50">
                      {h.product?.sku_code || 'N/A'}
                    </td>
                    <td className="py-3 px-4 text-sand-50 font-medium">
                      {h.product?.product_name || 'N/A'}
                    </td>
                    <td className="py-3 px-4 text-center font-mono text-sand/80">
                      {h.horizon_days}d
                    </td>
                    <td className="py-3 px-4">
                      <span className="inline-block px-2.5 py-0.5 rounded-lg bg-purple/20 text-purple-light border border-purple/30 text-[11px] font-semibold">
                        {h.model_name}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right font-mono font-bold text-sand-50 tabular-nums">
                      {h.predicted_quantity.toLocaleString()} units
                    </td>
                    <td className="py-3 px-4 text-right font-mono font-bold text-sand/80 tabular-nums">
                      {h.mape_score !== null ? `${h.mape_score}%` : '—'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default Forecasting;
