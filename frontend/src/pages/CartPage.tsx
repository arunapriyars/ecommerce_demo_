import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  Trash2, Plus, Minus, ArrowRight, ShoppingBag, 
  Tag, ShieldCheck, Truck, Sparkles 
} from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

export const CartPage: React.FC = () => {
  const navigate = useNavigate();
  const { items, summary, updateQuantity, removeFromCart, clearCart, loading } = useCart();
  const { isAuthenticated } = useAuth();

  const [promoCode, setPromoCode] = useState('');
  const [discountPercent, setDiscountPercent] = useState<number>(0);

  const handleApplyPromo = (e: React.FormEvent) => {
    e.preventDefault();
    const code = promoCode.trim().toUpperCase();
    if (code === 'VIBE20') {
      setDiscountPercent(20);
      toast.success('🎉 Promo code VIBE20 applied! 20% discount granted.');
    } else if (code === 'COLLEGE10') {
      setDiscountPercent(10);
      toast.success('🎉 Promo code COLLEGE10 applied! 10% discount granted.');
    } else {
      toast.error('Invalid promo code. Try "VIBE20" for 20% off!');
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="max-w-md mx-auto px-4 py-20 text-center space-y-4">
        <div className="w-16 h-16 rounded-3xl bg-purple-50 text-purple-600 flex items-center justify-center mx-auto text-2xl">
          🔒
        </div>
        <h2 className="font-display font-extrabold text-2xl text-slate-900">Your Cart Awaits</h2>
        <p className="text-xs sm:text-sm text-slate-500">
          Please log in to your VibeCart account to view your saved vibe items and checkout.
        </p>
        <Link
          to="/login"
          className="inline-block px-8 py-3 rounded-2xl bg-purple-600 hover:bg-purple-700 text-white font-bold text-sm shadow-vibe transition-all"
        >
          Log In to Continue
        </Link>
      </div>
    );
  }

  const subtotal = summary?.subtotal || items.reduce((acc, i) => acc + i.price * i.quantity, 0);
  const discountAmount = Math.round((subtotal * discountPercent) / 100);
  const discountedSubtotal = subtotal - discountAmount;
  const isFreeShipping = discountedSubtotal >= 999 || items.length === 0;
  const shippingFee = isFreeShipping ? 0 : 99;
  const finalTotal = discountedSubtotal + shippingFee;

  // Free shipping dynamic progress
  const freeShippingThreshold = 999;
  const amountToFreeShipping = Math.max(0, freeShippingThreshold - discountedSubtotal);
  const shippingProgressPercent = Math.min(100, Math.round((discountedSubtotal / freeShippingThreshold) * 100));

  if (items.length === 0) {
    return (
      <div className="max-w-md mx-auto px-4 py-20 text-center space-y-6">
        <div className="w-20 h-20 rounded-full bg-purple-50 text-purple-500 flex items-center justify-center mx-auto text-3xl">
          🛍️
        </div>
        <div>
          <h2 className="font-display font-extrabold text-2xl sm:text-3xl text-slate-900 mb-2">
            Your cart is feeling lonely.
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 max-w-sm mx-auto">
            You haven't added any products to your current vibe yet. Take our quiz or discover trending items!
          </p>
        </div>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link
            to="/quiz"
            className="px-6 py-3 rounded-2xl bg-purple-600 text-white font-bold text-xs sm:text-sm shadow-vibe hover:bg-purple-700 transition-all"
          >
            Take Vibe Quiz ✨
          </Link>
          <Link
            to="/catalog"
            className="px-6 py-3 rounded-2xl bg-white border border-slate-200 text-slate-700 font-bold text-xs sm:text-sm hover:bg-slate-50 transition-all"
          >
            Explore Catalog
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      
      {/* Title */}
      <div>
        <h1 className="font-display font-extrabold text-3xl text-slate-900 tracking-tight">
          Your Vibe Cart ({items.length} {items.length === 1 ? 'item' : 'items'})
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 mt-1">Review your mood picks before finalizing checkout.</p>
      </div>

      {/* Dynamic Free Shipping Notification Progress Bar */}
      <div className="bg-white rounded-3xl p-5 border border-slate-100 shadow-sm space-y-3">
        <div className="flex items-center justify-between text-xs sm:text-sm font-bold text-slate-800">
          <span className="flex items-center gap-2">
            <Truck className="w-4 h-4 text-purple-600" />
            {isFreeShipping ? (
              <span className="text-emerald-600">🎉 You've unlocked FREE Express Shipping!</span>
            ) : (
              <span>You're <strong className="text-purple-600">₹{amountToFreeShipping}</strong> away from FREE shipping 🚚</span>
            )}
          </span>
          <span className="text-xs text-slate-400 font-normal hidden sm:inline">
            Free shipping on orders above ₹999
          </span>
        </div>

        <div className="w-full h-2 rounded-full bg-slate-100 overflow-hidden">
          <div
            className={`h-full transition-all duration-500 rounded-full ${
              isFreeShipping ? 'bg-emerald-500' : 'bg-gradient-to-r from-purple-600 to-indigo-600'
            }`}
            style={{ width: `${shippingProgressPercent}%` }}
          />
        </div>
      </div>

      {/* Main Grid: Cart Items + Order Summary */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Left: Items list */}
        <div className="lg:col-span-8 bg-white rounded-3xl p-6 border border-slate-100 shadow-sm divide-y divide-slate-100 space-y-4">
          <div className="flex items-center justify-between pb-3">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Product Details</span>
            <button
              onClick={clearCart}
              className="text-xs text-rose-500 hover:text-rose-700 font-semibold"
            >
              Clear Cart
            </button>
          </div>

          {items.map((item) => (
            <div key={item.cart_item_id} className="pt-4 flex flex-col sm:flex-row items-center sm:items-start gap-4">
              
              {/* Product Thumbnail */}
              <Link to={`/products/${item.slug || item.product_id}`} className="w-24 h-24 rounded-2xl overflow-hidden bg-slate-50 flex-shrink-0 border border-slate-100">
                <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
              </Link>

              {/* Info */}
              <div className="flex-1 space-y-1 text-center sm:text-left">
                {item.vibe_name && (
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-purple-50 text-purple-700 border border-purple-200">
                    {item.vibe_icon} {item.vibe_name}
                  </span>
                )}
                <Link to={`/products/${item.slug || item.product_id}`} className="block">
                  <h3 className="font-bold text-slate-900 hover:text-purple-600 transition-colors text-sm sm:text-base">
                    {item.name}
                  </h3>
                </Link>
                <div className="flex items-baseline justify-center sm:justify-start gap-2 pt-1">
                  <span className="font-extrabold text-slate-900 text-sm">₹{item.price.toLocaleString()}</span>
                  {item.original_price && item.original_price > item.price && (
                    <span className="text-xs text-slate-400 line-through">₹{item.original_price.toLocaleString()}</span>
                  )}
                </div>
              </div>

              {/* Quantity Controls & Total */}
              <div className="flex items-center sm:flex-col items-end gap-3 justify-between w-full sm:w-auto">
                <div className="flex items-center border border-slate-200 rounded-xl bg-slate-50 overflow-hidden">
                  <button
                    onClick={() => updateQuantity(item.cart_item_id, item.quantity - 1)}
                    className="p-1.5 hover:bg-slate-200 text-slate-600 transition-colors"
                  >
                    <Minus className="w-3.5 h-3.5" />
                  </button>
                  <span className="px-3 text-xs font-bold text-slate-800">{item.quantity}</span>
                  <button
                    onClick={() => updateQuantity(item.cart_item_id, item.quantity + 1)}
                    disabled={item.quantity >= item.stock}
                    className="p-1.5 hover:bg-slate-200 text-slate-600 transition-colors disabled:opacity-30"
                  >
                    <Plus className="w-3.5 h-3.5" />
                  </button>
                </div>

                <div className="flex items-center gap-3">
                  <span className="text-sm font-extrabold text-slate-900">
                    ₹{(item.price * item.quantity).toLocaleString()}
                  </span>
                  <button
                    onClick={() => removeFromCart(item.cart_item_id)}
                    className="text-slate-400 hover:text-rose-500 transition-colors p-1"
                    aria-label="Remove item"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

            </div>
          ))}
        </div>

        {/* Right: Order Summary */}
        <div className="lg:col-span-4 bg-white rounded-3xl p-6 border border-slate-100 shadow-sm space-y-6 sticky top-28">
          <h3 className="font-display font-extrabold text-xl text-slate-900">Checkout Summary</h3>

          {/* Promo code field */}
          <form onSubmit={handleApplyPromo} className="space-y-2">
            <label className="text-xs font-bold text-slate-500 block">Have a promo code?</label>
            <div className="flex gap-2">
              <input
                type="text"
                value={promoCode}
                onChange={(e) => setPromoCode(e.target.value)}
                placeholder="Try VIBE20"
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs uppercase font-bold text-slate-800 outline-none focus:border-purple-500"
              />
              <button
                type="submit"
                className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-purple-600 text-white font-bold text-xs transition-colors"
              >
                Apply
              </button>
            </div>
            {discountPercent > 0 && (
              <p className="text-[11px] font-bold text-emerald-600">✓ {discountPercent}% promo discount applied!</p>
            )}
          </form>

          {/* Price Breakdown */}
          <div className="space-y-2.5 text-xs sm:text-sm text-slate-600 pt-4 border-t border-slate-100">
            <div className="flex justify-between">
              <span>Subtotal ({items.length} items)</span>
              <span className="font-semibold text-slate-900">₹{subtotal.toLocaleString()}</span>
            </div>

            {discountAmount > 0 && (
              <div className="flex justify-between text-emerald-600 font-semibold">
                <span>Vibe Discount ({discountPercent}%)</span>
                <span>-₹{discountAmount.toLocaleString()}</span>
              </div>
            )}

            <div className="flex justify-between">
              <span>Estimated Shipping</span>
              <span>{isFreeShipping ? <strong className="text-emerald-600">FREE</strong> : `₹${shippingFee}`}</span>
            </div>

            <div className="flex justify-between pt-3 border-t border-slate-100 text-base font-extrabold text-slate-900">
              <span>Final Total</span>
              <span className="text-xl text-purple-600">₹{finalTotal.toLocaleString()}</span>
            </div>
          </div>

          {/* Checkout CTA */}
          <button
            onClick={() => {
              navigate('/checkout', { state: { discountAmount } });
            }}
            className="w-full py-4 rounded-2xl bg-purple-600 hover:bg-purple-700 text-white font-bold text-sm shadow-vibe flex items-center justify-center gap-2 transition-all active:scale-95"
          >
            <span>Proceed to Checkout</span>
            <ArrowRight className="w-4 h-4" />
          </button>

          <div className="flex items-center justify-center gap-2 text-[11px] text-slate-400">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
            <span>Simulated Instant Payment • Zero Real Charge</span>
          </div>

        </div>

      </div>

    </div>
  );
};
