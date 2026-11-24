import React, { useState, useEffect } from 'react';
import api from '../api/axios';
import { TrendingUp, Cpu, Award, Play, AlertCircle, Calendar, BarChart3 } from 'lucide-react';
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
      // Refresh history log
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
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight">AI Demand Forecasting Engine</h2>
          <p className="text-xs text-slate-500 mt-0.5">Dual-model ML pipeline (Random Forest vs XGBoost) with 80/20 chronological validation</p>
        </div>
      </div>

      {/* Control Panel Card */}
      <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
        <form onSubmit={handleRunForecast} className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
          <div className="md:col-span-2">
            <label className="block text-xs font-medium text-slate-700 mb-1.5">
              Select Target Product Catalog SKU
            </label>
            <select
              value={selectedProductId}
              onChange={(e) => setSelectedProductId(e.target.value)}
              className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs bg-white text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-600 font-medium"
            >
              {products.map((p) => (
                <option key={p.product_id} value={p.product_id}>
                  {p.sku_code} — {p.product_name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1.5">
              Forecast Horizon
            </label>
            <div className="grid grid-cols-3 gap-1 bg-slate-100 p-1 rounded-lg border border-slate-200">
              {[7, 30, 90].map((days) => (
                <button
                  type="button"
                  key={days}
                  onClick={() => setHorizonDays(days)}
                  className={`py-1.5 text-xs font-semibold rounded-md transition-colors ${
                    horizonDays === days
                      ? 'bg-white text-blue-600 shadow-sm'
                      : 'text-slate-600 hover:text-slate-900'
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
              className="w-full py-2.5 px-4 rounded-lg bg-blue-600 text-white text-xs font-semibold hover:bg-blue-700 transition-colors shadow-sm flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {loading ? (
                <>
                  <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span>Training ML Models...</span>
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
          <div className="mt-4 p-3 rounded-lg bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}
      </div>

      {/* Forecast Output Presentation */}
      {forecastResult && (
        <div className="space-y-6">
          {/* Winner Banner */}
          <div className="p-4 rounded-xl bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-lg bg-blue-600 text-white">
                <Award className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-slate-900">
                  Recommended Model: {forecastResult.recommended_model}
                </h4>
                <p className="text-xs text-slate-600 mt-0.5">
                  Achieved lowest validation error on {horizonDays}-day demand projection for <b>{forecastResult.product_name}</b>.
                </p>
              </div>
            </div>
            <div className="text-right self-end sm:self-auto">
              <span className="text-[11px] text-slate-500 font-medium block">Total Forecast Demand</span>
              <span className="text-xl font-bold text-blue-700 tabular-nums">
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
                  className={`bg-white rounded-xl border p-6 transition-all ${
                    isWinner ? 'border-blue-500 ring-1 ring-blue-500 shadow-sm' : 'border-slate-200'
                  }`}
                >
                  <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                    <div className="flex items-center gap-2">
                      <Cpu className={`w-4 h-4 ${isWinner ? 'text-blue-600' : 'text-slate-500'}`} />
                      <h4 className="text-sm font-bold text-slate-900">{model.model_name}</h4>
                    </div>
                    {isWinner && (
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-blue-100 text-blue-700 uppercase tracking-wide">
                        Selected Best Fit
                      </span>
                    )}
                  </div>

                  <div className="grid grid-cols-3 gap-3 my-4">
                    <div className="p-2.5 bg-slate-50 rounded-lg border border-slate-100">
                      <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider">MAE</span>
                      <span className="text-sm font-bold text-slate-900 tabular-nums">{model.mae}</span>
                    </div>
                    <div className="p-2.5 bg-slate-50 rounded-lg border border-slate-100">
                      <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider">RMSE</span>
                      <span className="text-sm font-bold text-slate-900 tabular-nums">{model.rmse}</span>
                    </div>
                    <div className="p-2.5 bg-slate-50 rounded-lg border border-slate-100">
                      <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider">MAPE</span>
                      <span className="text-sm font-bold text-slate-900 tabular-nums">{model.mape}%</span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-2 border-t border-slate-100 text-xs">
                    <span className="text-slate-500">Projected {horizonDays}-Day Volume:</span>
                    <span className="font-bold text-slate-900 tabular-nums text-sm">
                      {model.predicted_qty.toLocaleString()} units
                    </span>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Interactive Recharts Forecast Graph */}
          <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-sm font-bold text-slate-900">Actual vs. ML Model Projections</h3>
                <p className="text-xs text-slate-500 mt-0.5">Historical daily demand alongside forward Random Forest & XGBoost outputs</p>
              </div>
              <div className="text-[11px] text-slate-500">
                Horizon: <span className="font-semibold text-slate-900">{horizonDays} Days</span>
              </div>
            </div>

            <div className="h-80 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={forecastResult.chart_data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F1F5F9" />
                  <XAxis 
                    dataKey="date" 
                    tickLine={false} 
                    axisLine={{ stroke: '#E2E8F0' }} 
                    tick={{ fill: '#64748B', fontSize: 11 }}
                    tickFormatter={(val) => val.slice(5)}
                  />
                  <YAxis 
                    tickLine={false} 
                    axisLine={{ stroke: '#E2E8F0' }} 
                    tick={{ fill: '#64748B', fontSize: 11 }}
                  />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#FFFFFF', borderRadius: '8px', border: '1px solid #E2E8F0', fontSize: '12px' }}
                  />
                  <Legend wrapperStyle={{ fontSize: '12px', paddingTop: '10px' }} />
                  <Line 
                    type="monotone" 
                    dataKey="actual" 
                    name="Actual Sales" 
                    stroke="#0F172A" 
                    strokeWidth={2}
                    dot={{ r: 2 }}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="rf_predicted" 
                    name="Random Forest Pred." 
                    stroke="#2563EB" 
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
      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm">
        <div className="px-6 py-4 border-b border-slate-200 bg-white">
          <h3 className="text-sm font-bold text-slate-900">Saved Forecast Records</h3>
          <p className="text-xs text-slate-500 mt-0.5">Chronological audit log of model executions and validation errors</p>
        </div>
        {history.length === 0 ? (
          <div className="text-center py-8 text-xs text-slate-500">
            No forecast runs logged yet. Execute your first projection above!
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-500 border-b border-slate-200 font-medium">
                <tr>
                  <th className="py-3 px-4">Date Run</th>
                  <th className="py-3 px-4">Product SKU</th>
                  <th className="py-3 px-4 text-center">Horizon</th>
                  <th className="py-3 px-4">Best Model</th>
                  <th className="py-3 px-4 text-center">MAE</th>
                  <th className="py-3 px-4 text-center">RMSE</th>
                  <th className="py-3 px-4 text-center">MAPE</th>
                  <th className="py-3 px-4 text-right">Predicted Demand</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {history.map((h) => (
                  <tr key={h.forecast_id} className="hover:bg-slate-50/60">
                    <td className="py-3 px-4 text-slate-500">
                      {new Date(h.created_at).toLocaleDateString()}
                    </td>
                    <td className="py-3 px-4 font-mono font-medium text-blue-600">
                      {h.product?.sku_code || 'N/A'}
                    </td>
                    <td className="py-3 px-4 text-center font-semibold text-slate-700">
                      {h.horizon_days}d
                    </td>
                    <td className="py-3 px-4 font-medium text-slate-900">
                      {h.model_used}
                    </td>
                    <td className="py-3 px-4 text-center tabular-nums text-slate-600">{h.mae}</td>
                    <td className="py-3 px-4 text-center tabular-nums text-slate-600">{h.rmse}</td>
                    <td className="py-3 px-4 text-center tabular-nums text-slate-600">{h.mape}%</td>
                    <td className="py-3 px-4 text-right font-bold text-slate-900 tabular-nums">
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
