import React, { useState } from 'react';
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { 
  LayoutDashboard, Package, ShoppingCart, Users, ArrowLeft, 
  ShieldAlert, Sparkles, LogOut, Menu, X, Bell 
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export const AdminLayout: React.FC = () => {
  const { user, isAdmin, isAuthenticated, logout, loginAsDemoAdmin } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  if (!isAuthenticated || !isAdmin) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-slate-800 border border-slate-700 rounded-3xl p-8 text-center text-white shadow-2xl">
          <div className="w-16 h-16 rounded-2xl bg-amber-500/20 text-amber-400 flex items-center justify-center mx-auto mb-4 border border-amber-500/30">
            <ShieldAlert className="w-8 h-8" />
          </div>
          <h2 className="text-2xl font-bold font-display mb-2">Admin Portal Restricted</h2>
          <p className="text-sm text-slate-400 mb-6">
            You need administrator privileges to access the inventory, revenue metrics, and order fulfillment engine.
          </p>
          <div className="space-y-3">
            <button
              onClick={async () => {
                await loginAsDemoAdmin();
                navigate('/admin');
              }}
              className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 font-bold text-white shadow-lg transition-all"
            >
              ⚡ Quick Login as Demo Admin (admin@vibecart.com)
            </button>
            <Link
              to="/"
              className="block w-full py-2.5 px-4 rounded-xl bg-slate-700 hover:bg-slate-600 text-sm font-semibold text-slate-300 transition-colors"
            >
              Return to Customer Storefront
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const navItems = [
    { label: 'Overview & Analytics', path: '/admin', icon: LayoutDashboard },
    { label: 'Products Inventory', path: '/admin/products', icon: Package },
    { label: 'Order Fulfillment', path: '/admin/orders', icon: ShoppingCart },
    { label: 'Registered Customers', path: '/admin/users', icon: Users },
  ];

  const isActive = (path: string) => {
    if (path === '/admin') return location.pathname === '/admin';
    return location.pathname.startsWith(path);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex">
      {/* Sidebar for Desktop */}
      <aside className="hidden md:flex flex-col w-64 bg-slate-900 border-r border-slate-800 p-5 justify-between">
        <div>
          {/* Logo */}
          <div className="flex items-center gap-2.5 mb-8 px-2">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-amber-500 to-orange-500 flex items-center justify-center text-white shadow-sm">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <span className="font-display font-extrabold text-xl text-white tracking-tight">
                Vibe<span className="text-amber-400">Admin</span>
              </span>
              <p className="text-[9px] uppercase tracking-wider text-amber-500 font-bold">Command Center</p>
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="space-y-1.5">
            {navItems.map((item) => {
              const Icon = item.icon;
              const active = isActive(item.path);
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-semibold transition-all ${
                    active
                      ? 'bg-amber-500 text-slate-950 shadow-md font-bold'
                      : 'text-slate-400 hover:text-white hover:bg-slate-800/80'
                  }`}
                >
                  <Icon className={`w-4 h-4 ${active ? 'text-slate-950' : 'text-slate-400'}`} />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Bottom Actions */}
        <div className="pt-6 border-t border-slate-800 space-y-2">
          <Link
            to="/"
            className="flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl text-xs font-semibold text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Customer Storefront</span>
          </Link>
          <button
            onClick={logout}
            className="w-full flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl text-xs font-semibold text-rose-400 hover:bg-rose-500/10 transition-colors text-left"
          >
            <LogOut className="w-4 h-4" />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-y-auto">
        {/* Top Header */}
        <header className="h-16 bg-slate-900/80 backdrop-blur-md border-b border-slate-800 px-6 flex items-center justify-between sticky top-0 z-40">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="md:hidden p-2 rounded-lg bg-slate-800 text-slate-300"
            >
              <Menu className="w-5 h-5" />
            </button>
            <h1 className="text-base font-bold text-white hidden sm:block">
              {navItems.find(i => isActive(i.path))?.label || 'Admin Dashboard'}
            </h1>
          </div>

          <div className="flex items-center gap-4">
            <span className="hidden sm:inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-amber-500/10 text-amber-400 border border-amber-500/20">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
              Live Database Connected
            </span>
            <div className="flex items-center gap-2">
              <img
                src={user?.avatar || `https://api.dicebear.com/7.x/adventurer/svg?seed=${user?.name || 'Admin'}`}
                alt={user?.name || 'Admin'}
                className="w-8 h-8 rounded-full border border-amber-400/30 object-cover"
              />
              <span className="text-xs font-semibold text-slate-300 hidden md:inline">{user?.name}</span>
            </div>
          </div>
        </header>

        {/* Mobile Sidebar Modal */}
        {sidebarOpen && (
          <div className="fixed inset-0 z-50 md:hidden bg-slate-950/80 backdrop-blur-sm flex">
            <div className="w-64 bg-slate-900 h-full p-5 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-6">
                  <span className="font-bold text-lg text-white">VibeAdmin</span>
                  <button onClick={() => setSidebarOpen(false)} className="text-slate-400">
                    <X className="w-5 h-5" />
                  </button>
                </div>
                <nav className="space-y-2">
                  {navItems.map((item) => {
                    const Icon = item.icon;
                    return (
                      <Link
                        key={item.path}
                        to={item.path}
                        onClick={() => setSidebarOpen(false)}
                        className="flex items-center gap-3 px-3 py-2 rounded-xl text-sm font-semibold text-slate-300 hover:bg-slate-800"
                      >
                        <Icon className="w-4 h-4" />
                        <span>{item.label}</span>
                      </Link>
                    );
                  })}
                </nav>
              </div>
              <div className="pt-4 border-t border-slate-800">
                <Link to="/" className="text-xs text-slate-400 block mb-2">Back to Store</Link>
                <button onClick={logout} className="text-xs text-rose-400">Log Out</button>
              </div>
            </div>
          </div>
        )}

        {/* Content Body */}
        <main className="p-4 sm:p-6 lg:p-8 flex-1">
          <Outlet />
        </main>
      </div>
    </div>
  );
};
