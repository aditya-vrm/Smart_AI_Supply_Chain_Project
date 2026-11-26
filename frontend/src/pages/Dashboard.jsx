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
  Sparkles
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
  Tooltip
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
      <div className="flex flex-col items-center justify-center h-80 font-mono text-sand/60 gap-3">
        <div className="w-8 h-8 border-2 border-purple border-t-transparent rounded-full animate-spin"></div>
        <span className="text-xs uppercase tracking-wider">Loading Dashboard Data...</span>
      </div>
    );
  }

  const kpis = data?.kpis || {};
  const charts = data?.charts || {};
  const recentAlerts = data?.recent_alerts || [];

  return (
    <div className="space-y-6">
      {/* Page Title & Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-sand/15">
        <div>
          <h2 className="text-xl font-bold tracking-tight text-sand-50 flex items-center gap-2">
            Supply Chain Dashboard
          </h2>
          <p className="text-xs text-sand/65 mt-1">
            Real-time stock monitoring, revenue metrics, and demand forecasting
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={fetchDashboardData}
            disabled={refreshing}
            className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-xl border border-sand/20 glass-card text-xs font-medium text-sand hover:text-sand-50 hover:border-sand/40 transition-all disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? 'animate-spin text-purple' : 'text-sand/60'}`} />
            <span>Refresh</span>
          </button>
          <Link
            to="/forecasting"
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-xl bg-purple hover:bg-purple-hover text-white text-xs font-semibold transition-all shadow-md shadow-purple/30"
          >
            <TrendingUp className="w-3.5 h-3.5" />
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
          title="30-Day Revenue"
          value={`$${(kpis.monthly_revenue || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
          subtitle={`${(kpis.monthly_units_sold || 0).toLocaleString()} units transacted`}
          icon={DollarSign}
        />
        <KPICard
          title="Active Alerts"
          value={kpis.active_low_stock_alerts || 0}
          subtitle={`${kpis.total_active_alerts || 0} total exceptions flagged`}
          icon={AlertTriangle}
        />
        <KPICard
          title="Projected 30D Demand"
          value={`${(kpis.next_30_days_forecast || 0).toLocaleString()} units`}
          subtitle="AI Machine Learning Vector"
          icon={TrendingUp}
        />
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Demand Trend (2 Cols) */}
        <div className="lg:col-span-2 glass-card rounded-2xl p-6 shadow-xl relative overflow-hidden">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-bold text-sand-50 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-purple"></span>
                Sales Trend & Projected Demand
              </h3>
              <p className="text-xs text-sand/60 mt-0.5">Historical sales alongside ML predicted forecast curve</p>
            </div>
            <div className="flex items-center gap-3 text-xs">
              <span className="flex items-center gap-1.5 text-sand/70">
                <span className="w-3 h-1 bg-purple rounded"></span> Actual
              </span>
              <span className="flex items-center gap-1.5 text-sand/70">
                <span className="w-3 h-1 bg-sand border-b border-dashed border-sand"></span> Projected
              </span>
            </div>
          </div>

          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={charts.historical_vs_forecast || []} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="purpleGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#8B5CF6" stopOpacity={0.4}/>
                    <stop offset="95%" stopColor="#8B5CF6" stopOpacity={0.0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(232, 220, 196, 0.1)" />
                <XAxis 
                  dataKey="date" 
                  tickLine={false} 
                  axisLine={{ stroke: 'rgba(232, 220, 196, 0.2)' }} 
                  tick={{ fill: '#DAC9A8', fontSize: 11, fontFamily: 'monospace' }}
                  tickFormatter={(val) => val ? val.slice(5) : ''}
                />
                <YAxis 
                  tickLine={false} 
                  axisLine={{ stroke: 'rgba(232, 220, 196, 0.2)' }} 
                  tick={{ fill: '#DAC9A8', fontSize: 11, fontFamily: 'monospace' }}
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
                <Area 
                  type="monotone" 
                  dataKey="historical_sales" 
                  name="Actual Sales" 
                  stroke="#8B5CF6" 
                  strokeWidth={2.5}
                  fillOpacity={1} 
                  fill="url(#purpleGradient)" 
                />
                <Area 
                  type="monotone" 
                  dataKey="predicted_demand" 
                  name="Projected Demand" 
                  stroke="#E8DCC4" 
                  strokeWidth={2}
                  strokeDasharray="4 4"
                  fill="none" 
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Top Selling Categories BarChart (1 Col) */}
        <div className="glass-card rounded-2xl p-6 shadow-xl flex flex-col justify-between">
          <div>
            <h3 className="text-sm font-bold text-sand-50 mb-1">
              Top Categories by Revenue
            </h3>
            <p className="text-xs text-sand/60 mb-4">Gross sales revenue across product categories</p>

            <div className="h-60 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={charts.top_categories || []} margin={{ top: 10, right: 10, left: -10, bottom: 25 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(232, 220, 196, 0.1)" />
                  <XAxis 
                    dataKey="category" 
                    tickLine={false} 
                    axisLine={{ stroke: 'rgba(232, 220, 196, 0.2)' }} 
                    tick={{ fill: '#DAC9A8', fontSize: 10 }}
                    interval={0}
                    angle={-20}
                    textAnchor="end"
                  />
                  <YAxis 
                    tickLine={false} 
                    axisLine={{ stroke: 'rgba(232, 220, 196, 0.2)' }} 
                    tick={{ fill: '#DAC9A8', fontSize: 10, fontFamily: 'monospace' }}
                    tickFormatter={(val) => `$${val >= 1000 ? (val / 1000).toFixed(0) + 'k' : val}`}
                  />
                  <Tooltip 
                    formatter={(value) => [`$${Number(value).toLocaleString()}`, 'Revenue']}
                    contentStyle={{ 
                      backgroundColor: '#14281D', 
                      borderRadius: '12px', 
                      border: '1px solid rgba(232, 220, 196, 0.2)', 
                      fontSize: '11px', 
                      color: '#E8DCC4' 
                    }}
                  />
                  <Bar dataKey="total_revenue" name="Total Revenue ($)" fill="#8B5CF6" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="pt-3 border-t border-sand/15 text-center">
            <Link to="/products" className="text-xs text-purple-light hover:text-white font-medium inline-flex items-center gap-1">
              <span>View complete product catalog</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </div>

      {/* Stock Health & Recent Alerts */}
      <div className="glass-card rounded-2xl p-6 shadow-xl">
        <div className="flex items-center justify-between mb-4 pb-2 border-b border-sand/15">
          <div>
            <h3 className="text-sm font-bold text-sand-50 flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-purple" />
              Recent Restock Alerts
            </h3>
            <p className="text-xs text-sand/60 mt-0.5">Items flagged by the automated inventory replenishment engine</p>
          </div>
          <Link to="/alerts" className="text-xs text-purple-light hover:text-white font-medium inline-flex items-center gap-1">
            <span>View all alerts</span>
            <ArrowRight className="w-3 h-3" />
          </Link>
        </div>

        {recentAlerts.length === 0 ? (
          <div className="text-center py-8 text-sand/60 text-xs">
            No active restock alerts. Inventory levels are optimal.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-forest-900/60 text-sand/70 uppercase tracking-wider text-[11px] border-b border-sand/10">
                <tr>
                  <th className="py-2.5 px-3">SKU</th>
                  <th className="py-2.5 px-3">Product Name</th>
                  <th className="py-2.5 px-3">Status</th>
                  <th className="py-2.5 px-3 text-right">Recommended Reorder</th>
                  <th className="py-2.5 px-3">Message</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-sand/10 font-sans">
                {recentAlerts.map((alert) => (
                  <tr key={alert.alert_id} className="hover:bg-forest-850/50 transition-colors">
                    <td className="py-3 px-3 font-mono font-bold text-sand-50">
                      {alert.sku_code || alert.product?.sku_code || 'N/A'}
                    </td>
                    <td className="py-3 px-3 font-medium text-sand-50">
                      {alert.product_name || alert.product?.product_name || 'N/A'}
                    </td>
                    <td className="py-3 px-3">
                      <StatusBadge status={alert.alert_type} />
                    </td>
                    <td className="py-3 px-3 text-right font-mono font-bold text-rose-300">
                      {alert.recommended_qty > 0 ? `${alert.recommended_qty} units` : '—'}
                    </td>
                    <td className="py-3 px-3 text-sand/70 max-w-xs truncate">
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
