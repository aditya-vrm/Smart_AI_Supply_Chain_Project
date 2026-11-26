import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
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
  Sparkles
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

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-forest text-sand flex flex-col font-sans">
      {/* Clean Glass Navigation Bar */}
      <header className="sticky top-0 z-40 glass-nav shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5 flex items-center justify-between gap-4">
          
          {/* Brand Logo & Title */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-purple/20 border border-purple/40 flex items-center justify-center text-purple shadow-[0_0_15px_rgba(139,92,246,0.3)]">
              <Sparkles className="w-5 h-5 fill-current" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-base tracking-tight text-sand-50">
                  Supply<span className="text-purple">AI</span>
                </span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-purple/20 text-purple-light border border-purple/30 font-semibold uppercase tracking-wider">
                  Glass
                </span>
              </div>
              <p className="text-[11px] text-sand/60">
                Demand Forecasting & Inventory Optimization
              </p>
            </div>
          </div>

          {/* Clean Navigation Links with Electric Purple Active States */}
          <nav className="hidden md:flex items-center gap-1.5 overflow-x-auto py-1">
            {navigation.map((item) => {
              const Icon = item.icon;
              return (
                <NavLink
                  key={item.name}
                  to={item.href}
                  className={({ isActive }) =>
                    `flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs transition-all ${
                      isActive
                        ? 'bg-purple text-white shadow-md shadow-purple/30 font-semibold'
                        : 'text-sand/80 hover:text-sand-50 hover:bg-forest-850/60 border border-transparent hover:border-sand/15'
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
              <div className="text-xs font-semibold text-sand-50">{user?.username || 'Admin'}</div>
              <div className="text-[11px] text-sand/60 truncate max-w-[140px]">{user?.email}</div>
            </div>
            <button
              onClick={handleLogout}
              title="Sign Out"
              className="p-2 text-sand/70 hover:text-rose-400 hover:bg-forest-850/80 rounded-xl transition-colors border border-sand/15 hover:border-rose-500/40"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Mobile Navigation Row */}
        <div className="md:hidden px-4 pb-2.5 pt-1 overflow-x-auto flex items-center gap-1.5 border-t border-sand/10">
          {navigation.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.name}
                to={item.href}
                className={({ isActive }) =>
                  `flex items-center gap-1.5 px-3 py-1 rounded-lg text-[11px] whitespace-nowrap transition-all ${
                    isActive
                      ? 'bg-purple text-white font-semibold shadow-sm'
                      : 'text-sand/70 hover:text-sand-50 hover:bg-forest-850/60'
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

      {/* Clean Glass Footer */}
      <footer className="glass-nav py-4 text-center text-xs text-sand/60 mt-auto">
        SupplyAI Platform &bull; Forest & Sand Glass Edition
      </footer>
    </div>
  );
};

export default MainLayout;
