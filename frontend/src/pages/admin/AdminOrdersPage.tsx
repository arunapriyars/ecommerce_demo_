import React, { useState, useEffect } from 'react';
import { 
  ShoppingCart, Search, Filter, CheckCircle2, 
  MapPin, Phone, Mail, User, ChevronDown 
} from 'lucide-react';
import { Order } from '../../types';
import { api } from '../../services/api';
import toast from 'react-hot-toast';

export const AdminOrdersPage: React.FC = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [search, setSearch] = useState<string>('');

  const loadOrders = async () => {
    try {
      setLoading(true);
      const res = await api.getAdminOrders({
        status: statusFilter !== 'all' ? statusFilter : undefined,
        search: search.trim() || undefined
      });
      setOrders(res.orders);
    } catch (err) {
      console.error('Error fetching admin orders:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadOrders();
  }, [statusFilter]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    loadOrders();
  };

  const handleStatusChange = async (orderId: number, newStatus: string) => {
    try {
      const res = await api.updateOrderStatus(orderId, newStatus);
      toast.success(res.message);
      setOrders(prev => prev.map(o => o.id === orderId ? { ...o, status: newStatus as any } : o));
    } catch (err: any) {
      toast.error(err.message || 'Failed to update order status');
    }
  };

  const statuses = [
    'Order Placed',
    'Processing',
    'Shipped',
    'Out for Delivery',
    'Delivered',
    'Cancelled'
  ];

  return (
    <div className="space-y-6">
      
      {/* Header bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div>
          <h2 className="text-2xl font-extrabold text-white font-display">
            Order Fulfillment Pipeline
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Real-time orders queue, customer coordinates, and status dispatch control.
          </p>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        
        {/* Search */}
        <form onSubmit={handleSearchSubmit} className="relative w-full sm:max-w-md">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by order ID, customer name, email..."
            className="w-full bg-slate-900 border border-slate-800 rounded-xl pl-10 pr-4 py-2.5 text-xs text-white placeholder:text-slate-500 outline-none focus:border-amber-500"
          />
          <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
        </form>

        {/* Status Filter */}
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <span className="text-xs text-slate-400 font-semibold">Filter Status:</span>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="bg-slate-900 border border-slate-800 text-xs rounded-xl px-3 py-2 text-white outline-none focus:border-amber-500 font-semibold cursor-pointer"
          >
            <option value="all">All Statuses ({orders.length})</option>
            {statuses.map(s => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
        </div>

      </div>

      {/* Orders List */}
      {loading ? (
        <div className="py-20 text-center space-y-3">
          <div className="w-10 h-10 rounded-full border-4 border-amber-400 border-t-amber-600 animate-spin mx-auto" />
          <p className="text-xs text-slate-400">Loading order fulfillment pipeline...</p>
        </div>
      ) : orders.length === 0 ? (
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-12 text-center text-slate-400">
          <p className="font-bold text-white text-base mb-1">No orders found</p>
          <p className="text-xs">No customer orders matching the current filter criteria.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {orders.map((order) => (
            <div
              key={order.id}
              className="bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-4 hover:border-slate-700 transition-colors"
            >
              {/* Order Header */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-800/80">
                <div className="flex items-center gap-3">
                  <span className="font-mono font-extrabold text-amber-400 text-base">
                    #{order.order_number}
                  </span>
                  <span className="text-xs text-slate-500">
                    {new Date(order.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>

                {/* Status Update Dropdown */}
                <div className="flex items-center gap-2">
                  <span className="text-xs text-slate-400 font-semibold">Status:</span>
                  <select
                    value={order.status}
                    onChange={(e) => handleStatusChange(order.id, e.target.value)}
                    className="bg-slate-800 border border-slate-700 text-xs rounded-xl px-3 py-1.5 font-bold text-amber-300 outline-none focus:border-amber-500 cursor-pointer"
                  >
                    {statuses.map(st => (
                      <option key={st} value={st}>{st}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Customer & Address Details */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs bg-slate-950/60 p-4 rounded-2xl border border-slate-800/60">
                <div className="space-y-1">
                  <span className="text-slate-500 block">Customer</span>
                  <p className="font-bold text-white">{order.shipping_name}</p>
                  <p className="text-slate-400">{order.shipping_email}</p>
                </div>

                <div className="space-y-1">
                  <span className="text-slate-500 block">Contact & Destination</span>
                  <p className="text-slate-300">{order.shipping_phone}</p>
                  <p className="text-slate-400">{order.shipping_address}, {order.shipping_city}, {order.shipping_state} - {order.shipping_postal_code}</p>
                </div>

                <div className="space-y-1 md:text-right">
                  <span className="text-slate-500 block">Payment Mode & Total</span>
                  <p className="font-semibold text-slate-300">{order.payment_method}</p>
                  <p className="text-base font-extrabold text-white">₹{order.total_amount?.toLocaleString()}</p>
                </div>
              </div>

              {/* Items List */}
              <div className="space-y-2">
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                  Items Ordered
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2">
                  {order.items && order.items.map((item) => (
                    <div key={item.id} className="p-2.5 rounded-xl bg-slate-800/40 border border-slate-700/40 flex items-center gap-2.5 text-xs">
                      <img src={item.product_image} alt={item.product_name} className="w-8 h-8 rounded-lg object-cover bg-slate-700 flex-shrink-0" />
                      <div className="truncate flex-1">
                        <p className="font-bold text-slate-200 truncate">{item.product_name}</p>
                        <p className="text-[10px] text-slate-500 font-mono">Qty: {item.quantity} × ₹{item.price}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

            </div>
          ))}
        </div>
      )}

    </div>
  );
};
