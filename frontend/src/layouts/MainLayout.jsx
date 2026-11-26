import React, { useState } from 'react';
import { NavLink, useNavigate, useLocation } from 'react-router-dom';
import { 
  Activity, 
  Layers, 
  Cpu, 
  Database, 
  Zap, 
  ShieldAlert, 
  Network, 
  FileTerminal, 
  LogOut,
  Radio,
  Terminal,
  Clock
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const navigation = [
  { name: 'Command Deck', href: '/', icon: Activity },
  { name: 'Item Catalog', href: '/products', icon: Layers },
  { name: 'Stock Telemetry', href: '/inventory', icon: Database },
  { name: 'Order Ledger', href: '/sales', icon: Zap },
  { name: 'AI Demand Matrix', href: '/forecasting', icon: Cpu },
  { name: 'Anomaly Center', href: '/alerts', icon: ShieldAlert },
  { name: 'Vendor Grid', href: '/suppliers', icon: Network },
  { name: 'Intelligence Export', href: '/reports', icon: FileTerminal },
];

const MainLayout = ({ children }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-[#080C14] text-slate-100 flex flex-col font-sans">
      {/* Top Command Telemetry Header */}
      <header className="sticky top-0 z-40 bg-[#0D131F]/90 backdrop-blur-md border-b border-slate-800/80 shadow-md">
        {/* Upper Micro-Status Bar */}
        <div className="border-b border-slate-800/50 px-6 py-2 flex items-center justify-between text-[11px] font-mono text-slate-400">
          <div className="flex items-center gap-5">
            <div className="flex items-center gap-1.5 text-emerald-400">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_8px_#10B981]"></span>
              <span>SYSTEM: ONLINE</span>
            </div>
            <div className="hidden sm:flex items-center gap-1.5 text-cyan-400">
              <Terminal className="w-3 h-3" />
              <span>ML CLUSTER: OPTIMAL</span>
            </div>
            <div className="hidden md:flex items-center gap-1.5 text-slate-400">
              <Database className="w-3 h-3 text-indigo-400" />
              <span>RDBMS: MYSQL ACTIVE</span>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1.5 text-slate-400">
              <Clock className="w-3 h-3" />
              <span>{new Date().toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}</span>
            </div>
            <div className="border-l border-slate-800 pl-4 flex items-center gap-3">
              <span className="text-slate-300 font-semibold">{user?.username || 'Commander'}</span>
              <button
                onClick={handleLogout}
                title="Disconnect Session"
                className="inline-flex items-center gap-1 text-slate-400 hover:text-rose-400 hover:bg-rose-950/40 px-2 py-0.5 rounded transition-colors text-[11px]"
              >
                <LogOut className="w-3 h-3" />
                <span>Exit</span>
              </button>
            </div>
          </div>
        </div>

        {/* Main Branding & Navigation Row */}
        <div className="px-6 py-3 flex flex-col md:flex-row md:items-center justify-between gap-4">
          {/* Logo & Brand */}
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-emerald-500 via-cyan-600 to-indigo-600 p-[1.5px] shadow-[0_0_15px_rgba(16,185,129,0.3)]">
              <div className="w-full h-full bg-[#080C14] rounded-[7px] flex items-center justify-center">
                <Radio className="w-4 h-4 text-emerald-400" />
              </div>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-base tracking-widest text-white uppercase font-mono">
                  VORTEX
                </span>
                <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                  v2.4-AI
                </span>
              </div>
              <span className="text-[10px] font-mono tracking-wider text-slate-500 uppercase block leading-none mt-0.5">
                Autonomous Supply Intelligence
              </span>
            </div>
          </div>

          {/* Horizontal Navigation Pills (Replaces vertical sidebar) */}
          <nav className="flex items-center gap-1 overflow-x-auto py-1 scrollbar-none">
            {navigation.map((item) => {
              const Icon = item.icon;
              return (
                <NavLink
                  key={item.name}
                  to={item.href}
                  className={({ isActive }) =>
                    `flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-mono tracking-wide uppercase transition-all whitespace-nowrap ${
                      isActive
                        ? 'bg-emerald-500/15 text-emerald-300 border border-emerald-500/40 shadow-[0_0_12px_rgba(16,185,129,0.2)] font-semibold'
                        : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60 border border-transparent'
                    }`
                  }
                >
                  <Icon className="w-3.5 h-3.5 flex-shrink-0" />
                  <span>{item.name}</span>
                </NavLink>
              );
            })}
          </nav>
        </div>
      </header>

      {/* Main Content Viewport */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-6 md:p-8">
        {children}
      </main>

      {/* Futuristic Command Deck Footer */}
      <footer className="border-t border-slate-900 bg-[#06090F] py-4 px-6 text-center text-xs font-mono text-slate-600">
        VORTEX SUPPLY CHAIN INTELLIGENCE &bull; RANDOM FOREST & XGBOOST ENSEMBLE ENGINE &bull; ACTIVE NODE
      </footer>
    </div>
  );
};

export default MainLayout;
