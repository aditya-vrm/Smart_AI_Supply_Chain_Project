import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/axios';
import KPICard from '../components/KPICard';
import StatusBadge from '../components/StatusBadge';
import { 
  Layers, 
  DollarSign, 
  ShieldAlert, 
  Cpu, 
  ArrowRight, 
  RefreshCw,
  Terminal,
  Activity,
  Zap,
  TrendingUp
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
        <div className="w-10 h-10 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin"></div>
        <span className="text-xs tracking-widest uppercase">INITIALIZING VORTEX TELEMETRY...</span>
      </div>
    );
  }

  const kpis = data?.kpis || {};
  const charts = data?.charts || {};
  const recentAlerts = data?.recent_alerts || [];

  return (
    <div className="space-y-6">
      {/* Top Header Command Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-800/80">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-bold font-mono tracking-wider text-white uppercase flex items-center gap-2">
              <Activity className="w-5 h-5 text-emerald-400" />
              GLOBAL OPERATIONS TELEMETRY
            </h2>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-mono bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
              LIVE FEED
            </span>
          </div>
          <p className="text-xs font-mono text-slate-400 mt-1">
            Real-time stock equilibrium &bull; Dual-model AI trajectory &bull; Inventory risk mitigations
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={fetchDashboardData}
            disabled={refreshing}
            className="inline-flex items-center gap-2 px-3.5 py-2 rounded-lg border border-slate-800 bg-[#0D131F] text-xs font-mono text-slate-300 hover:text-white hover:border-slate-700 transition-all disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? 'animate-spin text-emerald-400' : 'text-slate-400'}`} />
            <span>SYNC CLUSTER</span>
          </button>
          <Link
            to="/forecasting"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-gradient-to-r from-emerald-500 to-cyan-500 text-slate-950 text-xs font-mono font-bold uppercase tracking-wider hover:from-emerald-400 hover:to-cyan-400 transition-all shadow-[0_0_15px_rgba(16,185,129,0.3)]"
          >
            <Cpu className="w-3.5 h-3.5 text-slate-950" />
            <span>EXECUTE AI MODEL</span>
          </Link>
        </div>
      </div>

      {/* 4 Telemetry KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <KPICard
          title="MANAGED CATALOG"
          value={kpis.total_products || 0}
          subtitle="SKU Registry Active"
          icon={Layers}
        />
        <KPICard
          title="30-DAY SALES VOLUME"
          value={`$${(kpis.monthly_revenue || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
          subtitle={`${(kpis.monthly_units_sold || 0).toLocaleString()} units transacted`}
          icon={DollarSign}
        />
        <KPICard
          title="STOCK ANOMALIES"
          value={kpis.active_low_stock_alerts || 0}
          subtitle={`${kpis.total_active_alerts || 0} total exceptions flagged`}
          icon={ShieldAlert}
        />
        <KPICard
          title="PROJECTED 30D DEMAND"
          value={`${(kpis.next_30_days_forecast || 0).toLocaleString()} units`}
          subtitle="Machine Learning Vector"
          icon={Cpu}
        />
      </div>

      {/* Visual Analytics Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Continuous Demand Trajectory Area Chart (2 Cols) */}
        <div className="lg:col-span-2 bg-[#0D131F]/90 backdrop-blur-md p-6 rounded-xl border border-slate-800 shadow-xl relative overflow-hidden">
          <div className="flex items-center justify-between mb-5">
            <div>
              <h3 className="text-sm font-bold font-mono tracking-wider text-white uppercase flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                HISTORICAL TRANSACTIONS VS. DEMAND MATRIX
              </h3>
              <p className="text-xs font-mono text-slate-400 mt-0.5">Continuous 30-day actuals mapped with forward predictive vectors</p>
            </div>
            <span className="text-[10px] font-mono font-medium text-emerald-400 bg-emerald-950/60 border border-emerald-500/30 px-2.5 py-1 rounded-md">
              DAILY RESOLUTION
            </span>
          </div>

          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={charts.historical_vs_forecast || []} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="emeraldGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10B981" stopOpacity={0.35}/>
                    <stop offset="95%" stopColor="#10B981" stopOpacity={0.0}/>
                  </linearGradient>
                  <linearGradient id="cyanGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#06B6D4" stopOpacity={0.35}/>
                    <stop offset="95%" stopColor="#06B6D4" stopOpacity={0.0}/>
                  </linearGradient>
                </defs>
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
                <Area 
                  type="monotone" 
                  dataKey="historical_sales" 
                  name="Historical Sales (Units)" 
                  stroke="#10B981" 
                  strokeWidth={2}
                  fillOpacity={1}
                  fill="url(#emeraldGradient)"
                  dot={{ r: 2, fill: '#10B981' }}
                />
                <Area 
                  type="monotone" 
                  dataKey="predicted_demand" 
                  name="Projected Requirement (Units)" 
                  stroke="#06B6D4" 
                  strokeWidth={2}
                  strokeDasharray="4 4"
                  fillOpacity={1}
                  fill="url(#cyanGradient)"
                  dot={false}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Category Revenue Distribution (1 Col) */}
        <div className="bg-[#0D131F]/90 backdrop-blur-md p-6 rounded-xl border border-slate-800 shadow-xl">
          <div className="flex items-center justify-between mb-5">
            <div>
              <h3 className="text-sm font-bold font-mono tracking-wider text-white uppercase">
                CATEGORY YIELD MATRIX
              </h3>
              <p className="text-xs font-mono text-slate-400 mt-0.5">Aggregate revenue distribution</p>
            </div>
          </div>

          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={charts.top_categories || []} margin={{ top: 10, right: 10, left: -15, bottom: 25 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#1E293B" />
                <XAxis 
                  dataKey="category" 
                  tickLine={false} 
                  axisLine={{ stroke: '#334155' }} 
                  tick={{ fill: '#94A3B8', fontSize: 9, fontFamily: 'monospace' }}
                  interval={0}
                  angle={-20}
                  textAnchor="end"
                />
                <YAxis 
                  tickLine={false} 
                  axisLine={{ stroke: '#334155' }} 
                  tick={{ fill: '#94A3B8', fontSize: 10, fontFamily: 'monospace' }}
                  tickFormatter={(val) => `$${val > 1000 ? (val / 1000).toFixed(0) + 'k' : val}`}
                />
                <Tooltip 
                  formatter={(value) => [`$${Number(value).toLocaleString()}`, 'Yield']}
                  contentStyle={{ backgroundColor: '#0D131F', borderRadius: '8px', border: '1px solid #334155', fontSize: '11px', fontFamily: 'monospace', color: '#F8FAFC' }}
                />
                <Bar 
                  dataKey="total_revenue" 
                  name="Gross Yield ($)" 
                  fill="#06B6D4" 
                  radius={[4, 4, 0, 0]} 
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Anomaly Incidents Ledger */}
      <div className="bg-[#0D131F]/90 backdrop-blur-md rounded-xl border border-slate-800 p-6 shadow-xl">
        <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-800/80">
          <div>
            <h3 className="text-sm font-bold font-mono tracking-wider text-white uppercase flex items-center gap-2">
              <ShieldAlert className="w-4 h-4 text-rose-400" />
              CRITICAL INVENTORY ANOMALIES
            </h3>
            <p className="text-xs font-mono text-slate-400 mt-0.5">Automated heuristics triggered by machine learning threshold variance</p>
          </div>
          <Link
            to="/alerts"
            className="inline-flex items-center gap-1 text-xs font-mono font-semibold text-emerald-400 hover:text-emerald-300"
          >
            VIEW ALL ANOMALIES
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {recentAlerts.length === 0 ? (
          <div className="text-center py-8 text-xs font-mono text-slate-500">
            NO ANOMALIES DETECTED &bull; ALL STOCK OPERATING WITHIN OPTIMAL PARAMETERS
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs font-mono">
              <thead className="bg-slate-900/80 text-slate-400 border-y border-slate-800 uppercase tracking-wider">
                <tr>
                  <th className="py-2.5 px-4 font-medium">SKU / Designation</th>
                  <th className="py-2.5 px-4 font-medium">Classification</th>
                  <th className="py-2.5 px-4 font-medium">Prescribed Action</th>
                  <th className="py-2.5 px-4 font-medium">Telemetry Log</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {recentAlerts.map((alert) => (
                  <tr key={alert.alert_id} className="hover:bg-slate-800/40 transition-colors">
                    <td className="py-3 px-4 text-white">
                      <div className="font-semibold">{alert.product_name}</div>
                      <div className="text-[11px] text-cyan-400 font-mono tracking-wider">{alert.sku_code}</div>
                    </td>
                    <td className="py-3 px-4">
                      <StatusBadge status={alert.alert_type} />
                    </td>
                    <td className="py-3 px-4">
                      {alert.recommended_qty > 0 ? (
                        <span className="font-bold text-rose-400 tabular-nums">
                          REORDER +{alert.recommended_qty} UNITS
                        </span>
                      ) : (
                        <span className="text-slate-400">HOLD PROCUREMENT</span>
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
