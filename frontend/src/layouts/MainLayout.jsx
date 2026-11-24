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
  FileSpreadsheet, 
  LogOut,
  Bell
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const navigation = [
  { name: 'Dashboard', href: '/', icon: LayoutDashboard },
  { name: 'Products', href: '/products', icon: Package },
  { name: 'Inventory', href: '/inventory', icon: Boxes },
  { name: 'Sales', href: '/sales', icon: ShoppingCart },
  { name: 'AI Demand Forecasting', href: '/forecasting', icon: TrendingUp },
  { name: 'Smart Alerts & Reorder', href: '/alerts', icon: AlertTriangle },
  { name: 'Suppliers', href: '/suppliers', icon: Users },
  { name: 'Reports & Analytics', href: '/reports', icon: FileSpreadsheet },
];

const MainLayout = ({ children }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const currentPage = navigation.find(item => item.href === location.pathname)?.name || 'Supply Chain Portal';

  return (
    <div className="min-h-screen bg-slate-50 flex">
      {/* Fixed Left Sidebar (240px) */}
      <aside className="w-60 bg-white border-r border-slate-200 flex flex-col fixed inset-y-0 z-30">
        {/* App Brand Header */}
        <div className="h-16 flex items-center px-6 border-b border-slate-200">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center text-white font-bold text-sm shadow-sm">
              AI
            </div>
            <div>
              <span className="font-semibold text-sm tracking-tight text-slate-900 block leading-tight">SupplyMind AI</span>
              <span className="text-[10px] text-slate-500 font-medium tracking-wide uppercase">Forecasting SaaS</span>
            </div>
          </div>
        </div>

        {/* Navigation Items */}
        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
          {navigation.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.name}
                to={item.href}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                    isActive
                      ? 'bg-blue-50 text-blue-600 font-semibold'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                  }`
                }
              >
                <Icon className="w-4 h-4 flex-shrink-0" />
                <span className="truncate">{item.name}</span>
              </NavLink>
            );
          })}
        </nav>

        {/* User Profile & Logout */}
        <div className="p-3 border-t border-slate-200 bg-white">
          <div className="flex items-center justify-between p-2 rounded-lg bg-slate-50 border border-slate-100">
            <div className="min-w-0 pr-2">
              <p className="text-xs font-semibold text-slate-900 truncate">
                {user?.username || 'Admin User'}
              </p>
              <p className="text-[11px] text-slate-500 truncate">
                {user?.email || 'admin@sbu.edu'}
              </p>
            </div>
            <button
              onClick={handleLogout}
              title="Logout"
              className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-white rounded-md transition-colors"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="pl-60 flex-1 flex flex-col min-w-0">
        {/* Top Header Bar */}
        <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-8 sticky top-0 z-20">
          <div>
            <h1 className="text-lg font-semibold text-slate-900">{currentPage}</h1>
          </div>
          <div className="flex items-center gap-4">
            <div className="hidden sm:flex items-center gap-2 text-xs text-slate-500 bg-slate-100 px-2.5 py-1 rounded-full font-medium">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              FastAPI ML Engine Connected
            </div>
          </div>
        </header>

        {/* Page Content Body */}
        <main className="p-8 flex-1">
          {children}
        </main>
      </div>
    </div>
  );
};

export default MainLayout;
