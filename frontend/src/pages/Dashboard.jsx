import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/axios';
import KPICard from '../components/KPICard';
import StatusBadge from '../components/StatusBadge';
import { 
  Package, 
  DollarSign, 
  AlertTriangle, 
  TrendingUp, 
  ArrowRight, 
  RefreshCw,
  Zap
} from 'lucide-react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend
} from 'recharts';

const Dashboard = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchDashboardData = async () => {
    try {
      setRefreshing(true);
      const res = await api.get('/dashboard/stats');
      setData(res.data);
    } catch (err) {
      console.error('Failed to load dashboard data:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-80 font-mono text-slate-400 gap-3">
        <div className="w-8 h-8 border-2 border-cobalt border-t-transparent rounded-full animate-spin"></div>
        <span className="text-xs uppercase">Loading Dashboard Data...</span>
      </div>
    );
  }

  const kpis = data?.kpis || {};
  const charts = data?.charts || {};
  const recentAlerts = data?.recent_alerts || [];

  return (
    <div className="space-y-6">
      {/* Page Title & Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-800">
        <div>
          <h2 className="text-xl font-bold tracking-tight text-white flex items-center gap-2">
            Supply Chain Dashboard
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Real-time stock monitoring, revenue metrics, and demand forecasting
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={fetchDashboardData}
            disabled={refreshing}
            className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg border border-slate-800 bg-[#0E1522] text-xs font-medium text-slate-300 hover:text-white hover:border-slate-700 transition-all disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? 'animate-spin text-neon' : 'text-slate-400'}`} />
            <span>Refresh</span>
          </button>
          <Link
            to="/forecasting"
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-lg bg-cobalt hover:bg-cobalt-hover text-white text-xs font-semibold transition-all shadow-md shadow-cobalt/30"
          >
            <TrendingUp className="w-3.5 h-3.5 text-neon" />
            <span>Run Forecast</span>
          </Link>
        </div>
      </div>

      {/* 4 KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <KPICard
          title="Total Products"
          value={kpis.total_products || 0}
          subtitle="Active catalog items"
          icon={Package}
        />
        <KPICard
          title="Monthly Revenue"
          value={`$${(kpis.monthly_revenue || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
          subtitle={`${(kpis.monthly_units_sold || 0).toLocaleString()} units sold (last 30d)`}
          icon={DollarSign}
        />
        <KPICard
          title="Active Stock Alerts"
          value={kpis.active_low_stock_alerts || 0}
          subtitle={`${kpis.total_active_alerts || 0} total alerts flagged`}
          icon={AlertTriangle}
        />
        <KPICard
          title="Next 30-Day Demand"
          value={`${(kpis.next_30_days_forecast || 0).toLocaleString()} units`}
          subtitle="Forecasted requirement"
          icon={TrendingUp}
        />
      </div>

      {/* Visual Analytics Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Continuous Demand Line/Area Chart with Cobalt Blue & Neon Yellow */}
        <div className="lg:col-span-2 bg-[#0E1522] p-6 rounded-xl border border-slate-800 shadow-xl">
          <div className="flex items-center justify-between mb-5">
            <div>
              <h3 className="text-sm font-bold text-white tracking-tight flex items-center gap-2">
                Sales History vs. Predicted Demand
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">30-day historical unit volume vs. forward projection curve</p>
            </div>
            <span className="text-[11px] font-mono text-neon bg-slate-900 border border-slate-700 px-2.5 py-0.5 rounded-md">
              Daily Volume
            </span>
          </div>

          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={charts.historical_vs_forecast || []} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="cobaltGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#0864E8" stopOpacity={0.4}/>
                    <stop offset="95%" stopColor="#0864E8" stopOpacity={0.0}/>
                  </linearGradient>
                  <linearGradient id="neonGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#F5FF00" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#F5FF00" stopOpacity={0.0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#1F2C42" />
                <XAxis 
                  dataKey="date" 
                  tickLine={false} 
                  axisLine={{ stroke: '#334460' }} 
                  tick={{ fill: '#94A3B8', fontSize: 10, fontFamily: 'monospace' }}
                  tickFormatter={(val) => val.slice(5)}
                />
                <YAxis 
                  tickLine={false} 
                  axisLine={{ stroke: '#334460' }} 
                  tick={{ fill: '#94A3B8', fontSize: 10, fontFamily: 'monospace' }}
                />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#0E1522', borderRadius: '8px', border: '1px solid #1F2C42', fontSize: '11px', color: '#F8FAFC' }}
                />
                <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />
                <Area 
                  type="monotone" 
                  dataKey="historical_sales" 
                  name="Historical Sales (Units)" 
                  stroke="#0864E8" 
                  strokeWidth={2.5}
                  fillOpacity={1}
                  fill="url(#cobaltGradient)"
                  dot={{ r: 2, fill: '#0864E8' }}
                />
                <Area 
                  type="monotone" 
                  dataKey="predicted_demand" 
                  name="Projected Demand (Units)" 
                  stroke="#F5FF00" 
                  strokeWidth={2.5}
                  strokeDasharray="4 4"
                  fillOpacity={1}
                  fill="url(#neonGradient)"
                  dot={false}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Category Revenue Distribution (Cobalt Blue Bars) */}
        <div className="bg-[#0E1522] p-6 rounded-xl border border-slate-800 shadow-xl">
          <div className="flex items-center justify-between mb-5">
            <div>
              <h3 className="text-sm font-bold text-white tracking-tight">
                Top Categories by Revenue
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">Aggregate catalog sales</p>
            </div>
          </div>

          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={charts.top_categories || []} margin={{ top: 10, right: 10, left: -15, bottom: 25 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#1F2C42" />
                <XAxis 
                  dataKey="category" 
                  tickLine={false} 
                  axisLine={{ stroke: '#334460' }} 
                  tick={{ fill: '#94A3B8', fontSize: 9 }}
                  interval={0}
                  angle={-20}
                  textAnchor="end"
                />
                <YAxis 
                  tickLine={false} 
                  axisLine={{ stroke: '#334460' }} 
                  tick={{ fill: '#94A3B8', fontSize: 10, fontFamily: 'monospace' }}
                  tickFormatter={(val) => `$${val > 1000 ? (val / 1000).toFixed(0) + 'k' : val}`}
                />
                <Tooltip 
                  formatter={(value) => [`$${Number(value).toLocaleString()}`, 'Revenue']}
                  contentStyle={{ backgroundColor: '#0E1522', borderRadius: '8px', border: '1px solid #1F2C42', fontSize: '11px', color: '#F8FAFC' }}
                />
                <Bar 
                  dataKey="total_revenue" 
                  name="Revenue ($)" 
                  fill="#0864E8" 
                  radius={[4, 4, 0, 0]} 
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Active Alerts Table */}
      <div className="bg-[#0E1522] rounded-xl border border-slate-800 p-6 shadow-xl">
        <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-800">
          <div>
            <h3 className="text-sm font-bold text-white tracking-tight flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-rose-400" />
              Active Stock Alerts
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">Items requiring reorder attention based on forecasted demand</p>
          </div>
          <Link
            to="/alerts"
            className="inline-flex items-center gap-1 text-xs font-semibold text-neon hover:underline"
          >
            View all alerts
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {recentAlerts.length === 0 ? (
          <div className="text-center py-8 text-xs text-slate-500">
            No active alerts detected. All warehouse stock is at optimal levels.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-900 text-slate-400 border-y border-slate-800">
                <tr>
                  <th className="py-2.5 px-4 font-medium">Product / SKU</th>
                  <th className="py-2.5 px-4 font-medium">Alert Type</th>
                  <th className="py-2.5 px-4 font-medium">Recommended Action</th>
                  <th className="py-2.5 px-4 font-medium">Details</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800">
                {recentAlerts.map((alert) => (
                  <tr key={alert.alert_id} className="hover:bg-slate-800/40 transition-colors">
                    <td className="py-3 px-4 text-white">
                      <div className="font-semibold">{alert.product_name}</div>
                      <div className="text-[11px] text-slate-400 font-mono">{alert.sku_code}</div>
                    </td>
                    <td className="py-3 px-4">
                      <StatusBadge status={alert.alert_type} />
                    </td>
                    <td className="py-3 px-4">
                      {alert.recommended_qty > 0 ? (
                        <span className="font-bold text-rose-400 font-mono tabular-nums">
                          Reorder +{alert.recommended_qty} units
                        </span>
                      ) : (
                        <span className="text-slate-400">Hold Purchasing</span>
                      )}
                    </td>
                    <td className="py-3 px-4 text-slate-400 max-w-md truncate">
                      {alert.message}
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

export default Dashboard;
