import React, { useState } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { 
  CheckCircle2, CreditCard, QrCode, Banknote, ShieldCheck, 
  Truck, ArrowRight, ArrowLeft, PackageCheck, Sparkles 
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import toast from 'react-hot-toast';

export const CheckoutPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { items, summary, clearCart, refreshCart } = useCart();
  const { user } = useAuth();

  const discountAmount = (location.state as any)?.discountAmount || 0;

  // Step 1: Cart | Step 2: Shipping | Step 3: Payment | Step 4: Confirmation
  const [step, setStep] = useState<number>(2);

  // Form states
  const [shippingData, setShippingData] = useState({
    shipping_name: user?.name || '',
    shipping_email: user?.email || '',
    shipping_phone: user?.phone || '+91 98765 43210',
    shipping_address: user?.address || '404 Innovation Avenue, Indiranagar',
    shipping_city: user?.city || 'Bengaluru',
    shipping_state: user?.state || 'Karnataka',
    shipping_postal_code: user?.postal_code || '560038'
  });

  const [paymentMethod, setPaymentMethod] = useState<string>('UPI (Google Pay / PhonePe)');
  const [upiId, setUpiId] = useState<string>('vibecart@okaxis');
  const [cardNumber, setCardNumber] = useState<string>('4111 2222 3333 4444');
  const [cardExpiry, setCardExpiry] = useState<string>('12/28');
  const [cardCvv, setCardCvv] = useState<string>('789');

  const [processing, setProcessing] = useState<boolean>(false);
  const [confirmedOrder, setConfirmedOrder] = useState<any>(null);

  const subtotal = summary?.subtotal || items.reduce((acc, i) => acc + i.price * i.quantity, 0);
  const discountedSubtotal = Math.max(0, subtotal - discountAmount);
  const shippingFee = discountedSubtotal >= 999 || items.length === 0 ? 0 : 99;
  const finalTotal = discountedSubtotal + shippingFee;

  const handleShippingSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!shippingData.shipping_name || !shippingData.shipping_phone || !shippingData.shipping_address) {
      toast.error('Please fill all required shipping fields.');
      return;
    }
    setStep(3);
  };

  const handlePlaceOrder = async () => {
    try {
      setProcessing(true);
      const res = await api.createOrder({
        ...shippingData,
        payment_method: paymentMethod,
        discount_amount: discountAmount
      });

      setConfirmedOrder(res.order);
      setStep(5);

      // Trigger celebration confetti
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 }
      });

      toast.success('Vibe secured. Order confirmed 🎉', { duration: 5000 });
      await refreshCart();
    } catch (err: any) {
      toast.error(err.message || 'Failed to place order.');
    } finally {
      setProcessing(false);
    }
  };

  // Step 5: Confirmation view
  if (step === 5 && confirmedOrder) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-16 text-center space-y-6">
        <div className="w-24 h-24 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto text-4xl shadow-lg animate-bounce">
          🎉
        </div>

        <div className="space-y-2">
          <span className="text-xs font-bold uppercase tracking-wider text-purple-600 px-3 py-1 rounded-full bg-purple-50 border border-purple-200">
            Order Status: Order Placed
          </span>
          <h1 className="font-display font-extrabold text-3xl sm:text-4xl text-slate-900 tracking-tight">
            Vibe secured. Order confirmed 🎉
          </h1>
          <p className="text-sm text-slate-500">
            Thank you for shopping with VibeCart! Your mood-matched package is now being prepared.
          </p>
        </div>

        {/* Order Details Card */}
        <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm text-left space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100 text-xs sm:text-sm">
            <span className="text-slate-400">Order ID</span>
            <strong className="text-purple-600 font-mono text-sm sm:text-base">{confirmedOrder.order_number}</strong>
          </div>

          <div className="flex items-center justify-between pb-3 border-b border-slate-100 text-xs sm:text-sm">
            <span className="text-slate-400">Payment Mode</span>
            <span className="font-semibold text-slate-800">{confirmedOrder.payment_method}</span>
          </div>

          <div className="flex items-center justify-between pb-3 border-b border-slate-100 text-xs sm:text-sm">
            <span className="text-slate-400">Shipping To</span>
            <span className="font-semibold text-slate-800 text-right truncate max-w-[200px]">
              {confirmedOrder.shipping_name}, {confirmedOrder.shipping_city}
            </span>
          </div>

          <div className="flex items-center justify-between text-base font-extrabold text-slate-900 pt-1">
            <span>Total Amount Paid</span>
            <span className="text-xl text-slate-900">₹{confirmedOrder.total_amount?.toLocaleString()}</span>
          </div>
        </div>

        {/* Action CTAs */}
        <div className="flex flex-col sm:flex-row gap-3 justify-center pt-4">
          <Link
            to="/orders"
            className="px-8 py-3.5 rounded-2xl bg-purple-600 hover:bg-purple-700 text-white font-bold text-sm shadow-vibe transition-all"
          >
            Track Order Status →
          </Link>
          <Link
            to="/catalog"
            className="px-8 py-3.5 rounded-2xl bg-white border border-slate-200 text-slate-700 font-bold text-sm hover:bg-slate-50 transition-all"
          >
            Continue Shopping
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      
      {/* Checkout Steps Wizard */}
      <div className="flex items-center justify-center gap-2 sm:gap-6 text-xs sm:text-sm font-bold">
        <div className="flex items-center gap-2 text-emerald-600">
          <CheckCircle2 className="w-5 h-5 text-emerald-500" />
          <span>1. Cart</span>
        </div>
        <div className="w-8 sm:w-16 h-0.5 bg-slate-200" />
        <div className={`flex items-center gap-2 ${step === 2 ? 'text-purple-600 font-extrabold' : step > 2 ? 'text-emerald-600' : 'text-slate-400'}`}>
          <span className={`w-5 h-5 rounded-full flex items-center justify-center text-xs text-white ${step === 2 ? 'bg-purple-600' : step > 2 ? 'bg-emerald-500' : 'bg-slate-300'}`}>
            2
          </span>
          <span>Shipping Details</span>
        </div>
        <div className="w-8 sm:w-16 h-0.5 bg-slate-200" />
        <div className={`flex items-center gap-2 ${step === 3 ? 'text-purple-600 font-extrabold' : 'text-slate-400'}`}>
          <span className={`w-5 h-5 rounded-full flex items-center justify-center text-xs text-white ${step === 3 ? 'bg-purple-600' : 'bg-slate-300'}`}>
            3
          </span>
          <span>Payment Simulation</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Left Form: Step 2 or Step 3 */}
        <div className="lg:col-span-8 bg-white rounded-3xl p-6 sm:p-8 border border-slate-100 shadow-sm space-y-6">
          
          {step === 2 ? (
            /* STEP 2: SHIPPING ADDRESS */
            <form onSubmit={handleShippingSubmit} className="space-y-4">
              <div>
                <h2 className="font-display font-extrabold text-xl text-slate-900">
                  Where should we ship your vibe?
                </h2>
                <p className="text-xs text-slate-500">Enter delivery address for express fulfillment.</p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-bold text-slate-600 block mb-1">Full Name *</label>
                  <input
                    type="text"
                    required
                    value={shippingData.shipping_name}
                    onChange={(e) => setShippingData({ ...shippingData, shipping_name: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs sm:text-sm text-slate-800 outline-none focus:border-purple-500"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-600 block mb-1">Phone Number *</label>
                  <input
                    type="text"
                    required
                    value={shippingData.shipping_phone}
                    onChange={(e) => setShippingData({ ...shippingData, shipping_phone: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs sm:text-sm text-slate-800 outline-none focus:border-purple-500"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-600 block mb-1">Email Address *</label>
                <input
                  type="email"
                  required
                  value={shippingData.shipping_email}
                  onChange={(e) => setShippingData({ ...shippingData, shipping_email: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs sm:text-sm text-slate-800 outline-none focus:border-purple-500"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-600 block mb-1">Street Address / Flat / Floor *</label>
                <input
                  type="text"
                  required
                  value={shippingData.shipping_address}
                  onChange={(e) => setShippingData({ ...shippingData, shipping_address: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs sm:text-sm text-slate-800 outline-none focus:border-purple-500"
                />
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="text-xs font-bold text-slate-600 block mb-1">City *</label>
                  <input
                    type="text"
                    required
                    value={shippingData.shipping_city}
                    onChange={(e) => setShippingData({ ...shippingData, shipping_city: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs sm:text-sm text-slate-800 outline-none focus:border-purple-500"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-600 block mb-1">State *</label>
                  <input
                    type="text"
                    required
                    value={shippingData.shipping_state}
                    onChange={(e) => setShippingData({ ...shippingData, shipping_state: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs sm:text-sm text-slate-800 outline-none focus:border-purple-500"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-600 block mb-1">PIN Code *</label>
                  <input
                    type="text"
                    required
                    value={shippingData.shipping_postal_code}
                    onChange={(e) => setShippingData({ ...shippingData, shipping_postal_code: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs sm:text-sm text-slate-800 outline-none focus:border-purple-500"
                  />
                </div>
              </div>

              <div className="pt-4 flex justify-between items-center">
                <Link to="/cart" className="text-xs font-bold text-slate-400 hover:text-slate-600 flex items-center gap-1">
                  <ArrowLeft className="w-3.5 h-3.5" />
                  <span>Back to Cart</span>
                </Link>
                <button
                  type="submit"
                  className="px-6 py-3 rounded-2xl bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs sm:text-sm shadow-vibe flex items-center gap-2"
                >
                  <span>Continue to Payment</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </form>
          ) : (
            /* STEP 3: PAYMENT METHOD SELECTION */
            <div className="space-y-6">
              <div>
                <h2 className="font-display font-extrabold text-xl text-slate-900">
                  Select Simulated Payment Method
                </h2>
                <p className="text-xs text-slate-500">
                  College project testing environment — no real money will be deducted.
                </p>
              </div>

              {/* Payment Method Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <button
                  type="button"
                  onClick={() => setPaymentMethod('UPI (Google Pay / PhonePe)')}
                  className={`p-4 rounded-2xl border-2 text-left transition-all ${
                    paymentMethod.includes('UPI')
                      ? 'border-purple-600 bg-purple-50/50 shadow-sm'
                      : 'border-slate-100 bg-slate-50 hover:bg-slate-100'
                  }`}
                >
                  <QrCode className="w-6 h-6 text-purple-600 mb-2" />
                  <p className="font-bold text-sm text-slate-900">UPI Instant</p>
                  <p className="text-[10px] text-slate-400">GPay, PhonePe, Paytm</p>
                </button>

                <button
                  type="button"
                  onClick={() => setPaymentMethod('Credit/Debit Card')}
                  className={`p-4 rounded-2xl border-2 text-left transition-all ${
                    paymentMethod.includes('Card')
                      ? 'border-purple-600 bg-purple-50/50 shadow-sm'
                      : 'border-slate-100 bg-slate-50 hover:bg-slate-100'
                  }`}
                >
                  <CreditCard className="w-6 h-6 text-indigo-600 mb-2" />
                  <p className="font-bold text-sm text-slate-900">Debit / Card</p>
                  <p className="text-[10px] text-slate-400">Visa, MasterCard, RuPay</p>
                </button>

                <button
                  type="button"
                  onClick={() => setPaymentMethod('Cash on Delivery')}
                  className={`p-4 rounded-2xl border-2 text-left transition-all ${
                    paymentMethod.includes('Cash')
                      ? 'border-purple-600 bg-purple-50/50 shadow-sm'
                      : 'border-slate-100 bg-slate-50 hover:bg-slate-100'
                  }`}
                >
                  <Banknote className="w-6 h-6 text-emerald-600 mb-2" />
                  <p className="font-bold text-sm text-slate-900">Cash on Delivery</p>
                  <p className="text-[10px] text-slate-400">Pay at your doorstep</p>
                </button>
              </div>

              {/* Simulated UI Inputs depending on method */}
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80">
                {paymentMethod.includes('UPI') ? (
                  <div className="space-y-3">
                    <div className="flex items-center gap-3">
                      <div className="w-20 h-20 bg-white p-2 rounded-xl border border-slate-200 flex items-center justify-center">
                        <QrCode className="w-16 h-16 text-slate-800" />
                      </div>
                      <div>
                        <p className="text-xs font-bold text-slate-900">Scan QR Code with any UPI App</p>
                        <p className="text-[11px] text-slate-400">Or verify UPI VPA below:</p>
                        <input
                          type="text"
                          value={upiId}
                          onChange={(e) => setUpiId(e.target.value)}
                          className="mt-1 bg-white border border-slate-200 rounded-lg px-2.5 py-1 text-xs font-mono font-bold text-purple-700 outline-none"
                        />
                      </div>
                    </div>
                  </div>
                ) : paymentMethod.includes('Card') ? (
                  <div className="space-y-2">
                    <div>
                      <label className="text-[11px] font-bold text-slate-500 block mb-1">Card Number (Simulated)</label>
                      <input
                        type="text"
                        value={cardNumber}
                        onChange={(e) => setCardNumber(e.target.value)}
                        className="w-full bg-white border border-slate-200 rounded-xl p-2 text-xs font-mono font-bold text-slate-800 outline-none"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="text-[11px] font-bold text-slate-500 block mb-1">Expiry</label>
                        <input
                          type="text"
                          value={cardExpiry}
                          onChange={(e) => setCardExpiry(e.target.value)}
                          className="w-full bg-white border border-slate-200 rounded-xl p-2 text-xs font-mono text-slate-800 outline-none"
                        />
                      </div>
                      <div>
                        <label className="text-[11px] font-bold text-slate-500 block mb-1">CVV</label>
                        <input
                          type="password"
                          value={cardCvv}
                          onChange={(e) => setCardCvv(e.target.value)}
                          className="w-full bg-white border border-slate-200 rounded-xl p-2 text-xs font-mono text-slate-800 outline-none"
                        />
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="text-xs text-slate-600 flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                    <span>Pay ₹{finalTotal.toLocaleString()} in cash or UPI when your vibe delivery arrives.</span>
                  </div>
                )}
              </div>

              {/* Confirm & Place Order CTA */}
              <div className="pt-2 flex justify-between items-center">
                <button
                  type="button"
                  onClick={() => setStep(2)}
                  className="text-xs font-bold text-slate-400 hover:text-slate-600 flex items-center gap-1"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  <span>Back to Address</span>
                </button>

                <button
                  type="button"
                  onClick={handlePlaceOrder}
                  disabled={processing}
                  className="px-8 py-3.5 rounded-2xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white font-bold text-sm shadow-vibe flex items-center gap-2 transition-all active:scale-95 disabled:opacity-50"
                >
                  <Sparkles className="w-4 h-4" />
                  <span>{processing ? 'Securing Your Vibe...' : `Confirm & Place Order (₹${finalTotal.toLocaleString()})`}</span>
                </button>
              </div>
            </div>
          )}

        </div>

        {/* Right Summary Sidebar */}
        <div className="lg:col-span-4 bg-white rounded-3xl p-6 border border-slate-100 shadow-sm space-y-4">
          <h3 className="font-bold text-base text-slate-900 pb-2 border-b border-slate-100">
            Order Review ({items.length} {items.length === 1 ? 'item' : 'items'})
          </h3>

          <div className="space-y-3 max-h-60 overflow-y-auto pr-1">
            {items.map((item) => (
              <div key={item.cart_item_id} className="flex items-center gap-3 text-xs">
                <img src={item.image} alt={item.name} className="w-12 h-12 rounded-xl object-cover bg-slate-50 flex-shrink-0" />
                <div className="flex-1 truncate">
                  <p className="font-bold text-slate-900 truncate">{item.name}</p>
                  <p className="text-slate-400">Qty: {item.quantity}</p>
                </div>
                <span className="font-extrabold text-slate-900">₹{(item.price * item.quantity).toLocaleString()}</span>
              </div>
            ))}
          </div>

          <div className="pt-3 border-t border-slate-100 space-y-2 text-xs text-slate-600">
            <div className="flex justify-between">
              <span>Subtotal</span>
              <span className="font-semibold text-slate-900">₹{subtotal.toLocaleString()}</span>
            </div>
            {discountAmount > 0 && (
              <div className="flex justify-between text-emerald-600 font-semibold">
                <span>Promo Discount</span>
                <span>-₹{discountAmount.toLocaleString()}</span>
              </div>
            )}
            <div className="flex justify-between">
              <span>Shipping</span>
              <span>{shippingFee === 0 ? <strong className="text-emerald-600">FREE</strong> : `₹${shippingFee}`}</span>
            </div>
            <div className="flex justify-between pt-2 border-t border-slate-100 text-sm font-extrabold text-slate-900">
              <span>Total Payable</span>
              <span className="text-purple-600">₹{finalTotal.toLocaleString()}</span>
            </div>
          </div>
        </div>

      </div>

    </div>
  );
};
