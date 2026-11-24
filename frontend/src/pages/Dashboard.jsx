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
  Calendar, 
  RefreshCw 
} from 'lucide-react';
import {
  ResponsiveContainer,
  LineChart,
  Line,
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
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  const kpis = data?.kpis || {};
  const charts = data?.charts || {};
  const recentAlerts = data?.recent_alerts || [];

  return (
    <div className="space-y-6">
      {/* Top Banner / Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2">
        <div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight">Executive Supply Overview</h2>
          <p className="text-xs text-slate-500 mt-0.5">Real-time inventory levels, ML forecast models, and stock exceptions</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={fetchDashboardData}
            disabled={refreshing}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 bg-white text-xs font-medium text-slate-700 hover:bg-slate-50 transition-colors shadow-sm disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? 'animate-spin text-blue-600' : ''}`} />
            Refresh Data
          </button>
          <Link
            to="/forecasting"
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-blue-600 text-white text-xs font-semibold hover:bg-blue-700 transition-colors shadow-sm"
          >
            <TrendingUp className="w-3.5 h-3.5" />
            Launch ML Forecaster
          </Link>
        </div>
      </div>

      {/* 4 KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <KPICard
          title="Total Products"
          value={kpis.total_products || 0}
          subtitle="Managed catalog SKUs"
          icon={Package}
        />
        <KPICard
          title="Monthly Revenue"
          value={`$${(kpis.monthly_revenue || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
          subtitle={`${(kpis.monthly_units_sold || 0).toLocaleString()} units sold (last 30d)`}
          icon={DollarSign}
        />
        <KPICard
          title="Active Low-Stock Alerts"
          value={kpis.active_low_stock_alerts || 0}
          subtitle={`${kpis.total_active_alerts || 0} total stock alerts pending`}
          icon={AlertTriangle}
        />
        <KPICard
          title="Next 30-Day Demand"
          value={`${(kpis.next_30_days_forecast || 0).toLocaleString()} units`}
          subtitle="Projected AI requirement"
          icon={TrendingUp}
        />
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Line Chart: Historical vs Forecast (2 Cols) */}
        <div className="lg:col-span-2 bg-white p-6 rounded-xl border border-slate-200">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-bold text-slate-900">Historical Sales vs. Predicted Demand</h3>
              <p className="text-xs text-slate-500 mt-0.5">30-day historical unit volume vs. forward projections</p>
            </div>
            <span className="text-[11px] font-medium text-slate-500 bg-slate-50 border border-slate-200 px-2 py-0.5 rounded-md">
              Daily Granularity
            </span>
          </div>
          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={charts.historical_vs_forecast || []} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
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
                  dataKey="historical_sales" 
                  name="Historical Sales (Units)" 
                  stroke="#2563EB" 
                  strokeWidth={2}
                  dot={{ r: 2 }}
                  activeDot={{ r: 5 }}
                />
                <Line 
                  type="monotone" 
                  dataKey="predicted_demand" 
                  name="Projected Demand (Units)" 
                  stroke="#94A3B8" 
                  strokeWidth={2}
                  strokeDasharray="4 4"
                  dot={false}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Bar Chart: Top Categories (1 Col) */}
        <div className="bg-white p-6 rounded-xl border border-slate-200">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-bold text-slate-900">Top Categories by Revenue</h3>
              <p className="text-xs text-slate-500 mt-0.5">Aggregate catalog performance</p>
            </div>
          </div>
          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={charts.top_categories || []} margin={{ top: 10, right: 10, left: -15, bottom: 25 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F1F5F9" />
                <XAxis 
                  dataKey="category" 
                  tickLine={false} 
                  axisLine={{ stroke: '#E2E8F0' }} 
                  tick={{ fill: '#64748B', fontSize: 10 }}
                  interval={0}
                  angle={-20}
                  textAnchor="end"
                />
                <YAxis 
                  tickLine={false} 
                  axisLine={{ stroke: '#E2E8F0' }} 
                  tick={{ fill: '#64748B', fontSize: 11 }}
                  tickFormatter={(val) => `$${val > 1000 ? (val / 1000).toFixed(0) + 'k' : val}`}
                />
                <Tooltip 
                  formatter={(value) => [`$${Number(value).toLocaleString()}`, 'Revenue']}
                  contentStyle={{ backgroundColor: '#FFFFFF', borderRadius: '8px', border: '1px solid #E2E8F0', fontSize: '12px' }}
                />
                <Bar 
                  dataKey="total_revenue" 
                  name="Revenue ($)" 
                  fill="#2563EB" 
                  radius={[4, 4, 0, 0]} 
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Active Alerts Preview Table */}
      <div className="bg-white rounded-xl border border-slate-200 p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-sm font-bold text-slate-900">Recent Critical Stock Alerts</h3>
            <p className="text-xs text-slate-500 mt-0.5">Exceptions flagged by the smart demand engine</p>
          </div>
          <Link
            to="/alerts"
            className="inline-flex items-center gap-1 text-xs font-semibold text-blue-600 hover:text-blue-700"
          >
            View all alerts
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {recentAlerts.length === 0 ? (
          <div className="text-center py-8 text-xs text-slate-500">
            No active alerts detected. All warehouse stock is at optimal levels!
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-500 border-y border-slate-200">
                <tr>
                  <th className="py-2.5 px-4 font-medium">Product / SKU</th>
                  <th className="py-2.5 px-4 font-medium">Alert Type</th>
                  <th className="py-2.5 px-4 font-medium">Recommended Action</th>
                  <th className="py-2.5 px-4 font-medium">Details</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {recentAlerts.map((alert) => (
                  <tr key={alert.alert_id} className="hover:bg-slate-50/50">
                    <td className="py-3 px-4 font-medium text-slate-900">
                      <div>{alert.product_name}</div>
                      <div className="text-[11px] text-slate-400 font-mono">{alert.sku_code}</div>
                    </td>
                    <td className="py-3 px-4">
                      <StatusBadge status={alert.alert_type} />
                    </td>
                    <td className="py-3 px-4">
                      {alert.recommended_qty > 0 ? (
                        <span className="font-semibold text-rose-600 tabular-nums">
                          Reorder +{alert.recommended_qty} units
                        </span>
                      ) : (
                        <span className="text-slate-500">Hold Purchasing</span>
                      )}
                    </td>
                    <td className="py-3 px-4 text-slate-600 max-w-md truncate">
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
