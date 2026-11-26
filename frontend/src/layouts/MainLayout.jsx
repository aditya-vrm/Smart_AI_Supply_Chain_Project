import React from 'react';
import { NavLink, useNavigate, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Package, 
  Boxes, 
  ShoppingCart, 
  TrendingUp, 
  AlertTriangle, 
  Users, 
  FileText, 
  LogOut,
  Zap
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const navigation = [
  { name: 'Dashboard', href: '/', icon: LayoutDashboard },
  { name: 'Products', href: '/products', icon: Package },
  { name: 'Inventory', href: '/inventory', icon: Boxes },
  { name: 'Sales', href: '/sales', icon: ShoppingCart },
  { name: 'Forecasting', href: '/forecasting', icon: TrendingUp },
  { name: 'Alerts', href: '/alerts', icon: AlertTriangle },
  { name: 'Suppliers', href: '/suppliers', icon: Users },
  { name: 'Reports', href: '/reports', icon: FileText },
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
    <div className="min-h-screen bg-[#0A0F18] text-slate-100 flex flex-col font-sans">
      {/* Sleek Top Navigation Header */}
      <header className="sticky top-0 z-40 bg-[#0E1522]/95 backdrop-blur-md border-b border-slate-800 shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5 flex items-center justify-between gap-4">
          
          {/* Brand Logo & Title */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-cobalt flex items-center justify-center text-neon shadow-[0_0_15px_rgba(8,100,232,0.4)]">
              <Zap className="w-5 h-5 fill-current" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-base tracking-tight text-white">
                  Supply<span className="text-neon">AI</span>
                </span>
                <span className="text-[11px] font-mono px-2 py-0.5 rounded-full bg-cobalt/20 text-cobalt-light border border-cobalt/40 font-medium">
                  SaaS
                </span>
              </div>
              <p className="text-[11px] text-slate-400">
                Demand Forecasting & Inventory Optimization
              </p>
            </div>
          </div>

          {/* Clean Navigation Links with Cobalt and Neon Active States */}
          <nav className="hidden md:flex items-center gap-1.5 overflow-x-auto py-1">
            {navigation.map((item) => {
              const Icon = item.icon;
              return (
                <NavLink
                  key={item.name}
                  to={item.href}
                  className={({ isActive }) =>
                    `flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                      isActive
                        ? 'bg-cobalt text-white shadow-md shadow-cobalt/30 font-semibold'
                        : 'text-slate-300 hover:text-white hover:bg-slate-800/80'
                    }`
                  }
                >
                  <Icon className="w-4 h-4 flex-shrink-0" />
                  <span>{item.name}</span>
                </NavLink>
              );
            })}
          </nav>

          {/* User Profile & Logout */}
          <div className="flex items-center gap-3">
            <div className="hidden sm:block text-right">
              <div className="text-xs font-semibold text-white">{user?.username || 'Admin'}</div>
              <div className="text-[11px] text-slate-400 truncate max-w-[140px]">{user?.email}</div>
            </div>
            <button
              onClick={handleLogout}
              title="Sign Out"
              className="p-2 text-slate-400 hover:text-rose-400 hover:bg-slate-800/80 rounded-lg transition-colors border border-transparent hover:border-slate-700"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Mobile Navigation Row */}
        <div className="md:hidden px-4 pb-2.5 pt-1 overflow-x-auto flex items-center gap-1 border-t border-slate-800/60">
          {navigation.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.name}
                to={item.href}
                className={({ isActive }) =>
                  `flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[11px] font-medium whitespace-nowrap ${
                    isActive
                      ? 'bg-cobalt text-white font-semibold'
                      : 'text-slate-400 hover:text-white hover:bg-slate-800'
                  }`
                }
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{item.name}</span>
              </NavLink>
            );
          })}
        </div>
      </header>

      {/* Main Page Body */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {children}
      </main>

      {/* Clean Footer */}
      <footer className="border-t border-slate-800/80 bg-[#080C14] py-4 text-center text-xs text-slate-500">
        SupplyAI Demand Forecasting Platform &bull; Powered by FastAPI & React
      </footer>
    </div>
  );
};

export default MainLayout;
