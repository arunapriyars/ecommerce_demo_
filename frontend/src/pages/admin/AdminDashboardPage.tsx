import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  DollarSign, Package, ShoppingCart, Users, AlertTriangle, 
  TrendingUp, Sparkles, ArrowRight, Eye, CheckCircle2 
} from 'lucide-react';
import { api } from '../../services/api';

export const AdminDashboardPage: React.FC = () => {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    async function loadStats() {
      try {
        setLoading(true);
        const res = await api.getAdminDashboard();
        setData(res);
      } catch (err) {
        console.error('Error loading dashboard stats:', err);
      } finally {
        setLoading(false);
      }
    }
    loadStats();
  }, []);

  if (loading) {
    return (
      <div className="py-20 text-center space-y-3">
        <div className="w-10 h-10 rounded-full border-4 border-amber-400 border-t-amber-600 animate-spin mx-auto" />
        <p className="text-xs text-slate-400">Loading admin analytics & database telemetry...</p>
      </div>
    );
  }

  const stats = data?.stats || {
    totalRevenue: 0,
    totalOrders: 0,
    totalProducts: 0,
    totalUsers: 0,
    lowStockCount: 0
  };

  const lowStock = data?.lowStockProducts || [];
  const recentOrders = data?.recentOrders || [];
  const vibeSales = data?.vibeSales || [];

  return (
    <div className="space-y-8">
      
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div>
          <h2 className="text-2xl font-extrabold text-white font-display">
            Executive Analytics Overview
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Real-time telemetry from active relational database.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Link
            to="/admin/products"
            className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-xs shadow-md transition-all"
          >
            + Add New Product
          </Link>
          <Link
            to="/admin/orders"
            className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs transition-colors"
          >
            Manage Fulfillment
          </Link>
        </div>
      </div>

      {/* 4 Core Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        
        {/* Revenue */}
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400">Total Net Revenue</span>
            <div className="w-8 h-8 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center">
              <DollarSign className="w-4 h-4" />
            </div>
          </div>
          <p className="text-3xl font-extrabold text-white font-display">
            ₹{stats.totalRevenue.toLocaleString()}
          </p>
          <div className="flex items-center gap-1.5 text-[11px] text-emerald-400 font-semibold pt-1">
            <TrendingUp className="w-3.5 h-3.5" />
            <span>Orders active & confirmed</span>
          </div>
        </div>

        {/* Orders */}
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400">Total Orders</span>
            <div className="w-8 h-8 rounded-xl bg-purple-500/10 text-purple-400 flex items-center justify-center">
              <ShoppingCart className="w-4 h-4" />
            </div>
          </div>
          <p className="text-3xl font-extrabold text-white font-display">
            {stats.totalOrders}
          </p>
          <div className="flex items-center gap-1.5 text-[11px] text-purple-400 font-semibold pt-1">
            <span>Fulfillment engine active</span>
          </div>
        </div>

        {/* Products */}
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400">Catalog Inventory</span>
            <div className="w-8 h-8 rounded-xl bg-blue-500/10 text-blue-400 flex items-center justify-center">
              <Package className="w-4 h-4" />
            </div>
          </div>
          <p className="text-3xl font-extrabold text-white font-display">
            {stats.totalProducts}
          </p>
          <div className="flex items-center gap-1.5 text-[11px] text-blue-400 font-semibold pt-1">
            <span>Across 6 core vibes</span>
          </div>
        </div>

        {/* Users */}
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400">Registered Users</span>
            <div className="w-8 h-8 rounded-xl bg-amber-500/10 text-amber-400 flex items-center justify-center">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <p className="text-3xl font-extrabold text-white font-display">
            {stats.totalUsers}
          </p>
          <div className="flex items-center gap-1.5 text-[11px] text-amber-400 font-semibold pt-1">
            <span>Active student profiles</span>
          </div>
        </div>

      </div>

      {/* Analytics Chart & Vibe Breakdown Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* Vibe Sales Bar Visual Chart */}
        <div className="lg:col-span-7 bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-5">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-bold text-base text-white">Sales Distribution by Vibe</h3>
              <p className="text-xs text-slate-400">Relative popularity of each personality aesthetic</p>
            </div>
            <Sparkles className="w-4 h-4 text-amber-400" />
          </div>

          <div className="space-y-3.5 pt-2">
            {vibeSales.length > 0 ? (
              vibeSales.map((item: any, idx: number) => {
                const maxSales = Math.max(...vibeSales.map((v: any) => v.total_sales || 1));
                const barPercent = Math.max(12, Math.round(((item.total_sales || 1) / maxSales) * 100));

                return (
                  <div key={idx} className="space-y-1">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-bold text-slate-300">{item.vibe_name || 'Vibe Item'}</span>
                      <span className="font-mono text-amber-400 font-bold">₹{item.total_sales?.toLocaleString() || 0}</span>
                    </div>
                    <div className="w-full h-2 rounded-full bg-slate-800 overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-amber-500 to-orange-500 rounded-full transition-all duration-500"
                        style={{ width: `${barPercent}%` }}
                      />
                    </div>
                  </div>
                );
              })
            ) : (
              <p className="text-xs text-slate-500 py-6 text-center">No sales data recorded yet.</p>
            )}
          </div>
        </div>

        {/* Low Stock Alerts */}
        <div className="lg:col-span-5 bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-rose-400">
              <AlertTriangle className="w-4 h-4" />
              <h3 className="font-bold text-base text-white">Low-Stock Watchlist</h3>
            </div>
            <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-rose-500/20 text-rose-300 border border-rose-500/30">
              {stats.lowStockCount} items
            </span>
          </div>

          <div className="space-y-2.5 max-h-72 overflow-y-auto pr-1">
            {lowStock.length > 0 ? (
              lowStock.map((prod: any) => (
                <div key={prod.id} className="p-3 rounded-2xl bg-slate-800/60 border border-slate-700/50 flex items-center justify-between gap-3 text-xs">
                  <div className="flex items-center gap-2.5 truncate">
                    <img src={prod.image} alt={prod.name} className="w-9 h-9 rounded-xl object-cover bg-slate-700 flex-shrink-0" />
                    <div className="truncate">
                      <p className="font-bold text-slate-200 truncate">{prod.name}</p>
                      <p className="text-slate-400 font-mono">₹{prod.price}</p>
                    </div>
                  </div>
                  <span className="font-extrabold px-2.5 py-1 rounded-lg bg-rose-500/20 text-rose-400 border border-rose-500/30 flex-shrink-0">
                    {prod.stock} left
                  </span>
                </div>
              ))
            ) : (
              <p className="text-xs text-slate-500 py-6 text-center">All product stocks are healthy (&gt; 5 units).</p>
            )}
          </div>
        </div>

      </div>

      {/* Recent Orders Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-4">
        <div className="flex items-center justify-between pb-2 border-b border-slate-800">
          <div>
            <h3 className="font-bold text-base text-white">Recent Customer Orders</h3>
            <p className="text-xs text-slate-400">Latest transactions across the storefront</p>
          </div>
          <Link to="/admin/orders" className="text-xs font-bold text-amber-400 hover:underline">
            View All Orders →
          </Link>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="text-slate-400 border-b border-slate-800 pb-2">
                <th className="py-2.5 font-semibold">Order ID</th>
                <th className="py-2.5 font-semibold">Customer</th>
                <th className="py-2.5 font-semibold">Total</th>
                <th className="py-2.5 font-semibold">Payment</th>
                <th className="py-2.5 font-semibold">Status</th>
                <th className="py-2.5 font-semibold">Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {recentOrders.map((ord: any) => (
                <tr key={ord.id} className="hover:bg-slate-800/40 transition-colors">
                  <td className="py-3 font-mono font-bold text-amber-400">#{ord.order_number}</td>
                  <td className="py-3">
                    <p className="font-bold text-slate-200">{ord.customer_name}</p>
                    <p className="text-[10px] text-slate-500">{ord.shipping_city}</p>
                  </td>
                  <td className="py-3 font-extrabold text-white">₹{ord.total_amount?.toLocaleString()}</td>
                  <td className="py-3 text-slate-400">{ord.payment_method}</td>
                  <td className="py-3">
                    <span className="font-bold px-2 py-0.5 rounded-full text-[10px] bg-slate-800 text-slate-300 border border-slate-700">
                      {ord.status}
                    </span>
                  </td>
                  <td className="py-3 text-slate-500">
                    {new Date(ord.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
};
