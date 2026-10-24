import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  Package, Truck, CheckCircle2, Clock, 
  MapPin, ChevronRight, ShoppingBag, ArrowRight 
} from 'lucide-react';
import { Order } from '../types';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';

export const OrdersPage: React.FC = () => {
  const { isAuthenticated } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    async function fetchOrders() {
      if (!isAuthenticated) return;
      try {
        setLoading(true);
        const data = await api.getOrders();
        setOrders(data.orders);
      } catch (err) {
        console.error('Error fetching orders:', err);
      } finally {
        setLoading(false);
      }
    }
    fetchOrders();
  }, [isAuthenticated]);

  if (!isAuthenticated) {
    return (
      <div className="max-w-md mx-auto px-4 py-20 text-center space-y-4">
        <div className="w-16 h-16 rounded-3xl bg-purple-50 text-purple-600 flex items-center justify-center mx-auto text-2xl">
          📦
        </div>
        <h2 className="font-display font-extrabold text-2xl text-slate-900">Track Your Orders</h2>
        <p className="text-xs sm:text-sm text-slate-500">
          Please log in to your account to view past orders and live tracking.
        </p>
        <Link to="/login" className="inline-block px-8 py-3 rounded-2xl bg-purple-600 text-white font-bold text-sm shadow-vibe">
          Log In
        </Link>
      </div>
    );
  }

  const statusSteps = [
    'Order Placed',
    'Processing',
    'Shipped',
    'Out for Delivery',
    'Delivered'
  ];

  const getStepIndex = (status: string) => {
    const idx = statusSteps.findIndex(s => s.toLowerCase() === status.toLowerCase());
    return idx >= 0 ? idx : 0;
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Delivered':
        return 'bg-emerald-50 text-emerald-700 border-emerald-200';
      case 'Shipped':
      case 'Out for Delivery':
        return 'bg-indigo-50 text-indigo-700 border-indigo-200';
      case 'Processing':
        return 'bg-amber-50 text-amber-700 border-amber-200';
      case 'Cancelled':
        return 'bg-rose-50 text-rose-700 border-rose-200';
      case 'Order Placed':
      default:
        return 'bg-purple-50 text-purple-700 border-purple-200';
    }
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      <div>
        <h1 className="font-display font-extrabold text-3xl text-slate-900 tracking-tight">
          Your Vibe Order History
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 mt-1">
          Live fulfillment tracking and receipts for all your aesthetic essentials.
        </p>
      </div>

      {loading ? (
        <div className="py-20 text-center space-y-3">
          <div className="w-10 h-10 rounded-full border-4 border-purple-200 border-t-purple-600 animate-spin mx-auto" />
          <p className="text-xs font-semibold text-slate-500">Fetching order history...</p>
        </div>
      ) : orders.length === 0 ? (
        <div className="bg-white rounded-3xl p-12 border border-slate-100 shadow-sm text-center max-w-md mx-auto space-y-4">
          <div className="w-16 h-16 rounded-full bg-purple-50 text-purple-600 flex items-center justify-center mx-auto text-3xl">
            📦
          </div>
          <h3 className="font-display font-bold text-xl text-slate-900">No Orders Yet</h3>
          <p className="text-xs text-slate-500">
            You haven't placed any orders yet. Discover items tuned to your vibe today!
          </p>
          <Link
            to="/catalog"
            className="inline-block px-6 py-2.5 rounded-2xl bg-purple-600 text-white font-bold text-xs shadow-vibe hover:bg-purple-700"
          >
            Explore Catalog
          </Link>
        </div>
      ) : (
        <div className="space-y-6">
          {orders.map((order) => {
            const currentStep = getStepIndex(order.status);
            const isCancelled = order.status === 'Cancelled';

            return (
              <div
                key={order.id}
                className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-100 shadow-sm space-y-6 transition-all hover:shadow-md"
              >
                {/* Header row */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-extrabold text-slate-900 text-base">
                        #{order.order_number}
                      </span>
                      <span className={`text-xs font-bold px-2.5 py-0.5 rounded-full border ${getStatusColor(order.status)}`}>
                        {order.status}
                      </span>
                    </div>
                    <p className="text-xs text-slate-400 mt-1">
                      Placed on {new Date(order.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                    </p>
                  </div>

                  <div className="text-left sm:text-right">
                    <span className="text-xs text-slate-400 block">Total Amount</span>
                    <span className="text-lg font-extrabold text-slate-900">₹{order.total_amount?.toLocaleString()}</span>
                  </div>
                </div>

                {/* VISUAL ORDER PROGRESS TRACKER */}
                {!isCancelled && (
                  <div className="py-2">
                    <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-4">
                      Live Delivery Progress
                    </p>
                    <div className="relative">
                      {/* Background Bar */}
                      <div className="absolute top-1/2 left-0 right-0 -translate-y-1/2 h-1 bg-slate-100 -z-0" />
                      {/* Active Progress Bar */}
                      <div
                        className="absolute top-1/2 left-0 -translate-y-1/2 h-1 bg-purple-600 transition-all duration-500 -z-0"
                        style={{ width: `${(currentStep / (statusSteps.length - 1)) * 100}%` }}
                      />

                      {/* Steps Icons */}
                      <div className="flex items-center justify-between relative z-10">
                        {statusSteps.map((stepName, sIdx) => {
                          const isDone = sIdx <= currentStep;
                          const isCurrent = sIdx === currentStep;

                          return (
                            <div key={stepName} className="flex flex-col items-center">
                              <div
                                className={`w-7 h-7 sm:w-8 sm:h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all shadow-sm ${
                                  isDone
                                    ? 'bg-purple-600 text-white ring-4 ring-purple-100'
                                    : 'bg-white text-slate-300 border-2 border-slate-200'
                                }`}
                              >
                                {isDone ? <CheckCircle2 className="w-4 h-4" /> : sIdx + 1}
                              </div>
                              <span
                                className={`text-[10px] sm:text-xs mt-2 font-semibold text-center hidden sm:block max-w-[80px] ${
                                  isCurrent ? 'text-purple-700 font-extrabold' : isDone ? 'text-slate-800' : 'text-slate-400'
                                }`}
                              >
                                {stepName}
                              </span>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                )}

                {/* Items ordered preview */}
                <div className="space-y-3 pt-2">
                  <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider">Ordered Vibe Items</h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {order.items && order.items.map((item) => (
                      <div key={item.id} className="p-3 rounded-2xl bg-slate-50 flex items-center gap-3">
                        <img
                          src={item.product_image}
                          alt={item.product_name}
                          className="w-12 h-12 rounded-xl object-cover bg-white flex-shrink-0"
                        />
                        <div className="truncate flex-1">
                          <p className="text-xs font-bold text-slate-900 truncate">{item.product_name}</p>
                          <p className="text-[11px] text-slate-400">Qty: {item.quantity} • ₹{item.price?.toLocaleString()} each</p>
                        </div>
                        <span className="text-xs font-extrabold text-slate-900">
                          ₹{(item.price * item.quantity).toLocaleString()}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Shipping & Payment summary */}
                <div className="pt-4 border-t border-slate-100 flex flex-col sm:flex-row justify-between text-xs text-slate-500 gap-2">
                  <div className="flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5 text-purple-600" />
                    <span>Shipping to {order.shipping_name}, {order.shipping_city}</span>
                  </div>
                  <div>
                    <span>Payment: <strong className="text-slate-700">{order.payment_method}</strong> ({order.payment_status})</span>
                  </div>
                </div>

              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
