import { useState } from 'react';
import { Link, useLocation } from 'wouter';
import SEOHead from '@/components/SEOHead';
import { Breadcrumbs } from '@/components/Layout';
import { useCart } from '@/contexts/CartContext';
import { useAuth } from '@/contexts/AuthContext';
import { canadianProvinces, FREE_SHIPPING_THRESHOLD, MINIMUM_ORDER } from '@/lib/data';
import { Lock, Truck, Gift, AlertCircle, CheckCircle, ArrowRight, CreditCard, Shield } from 'lucide-react';
import { motion } from 'framer-motion';
import { toast } from 'sonner';

export default function Checkout() {
  const { items, subtotal, shippingRate, shippingProvince, setShippingProvince, total, isFreeShipping, pointsToEarn, meetsMinimum, rewardDiscount, clearCart } = useCart();
  const { user, isAuthenticated } = useAuth();
  const [, navigate] = useLocation();
  const [step, setStep] = useState(1);
  const [orderPlaced, setOrderPlaced] = useState(false);
  const [form, setForm] = useState({
    email: user?.email || '', firstName: user?.firstName || '', lastName: user?.lastName || '',
    phone: user?.phone || '', address: '', city: '', province: shippingProvince, postalCode: '', notes: '',
  });

  if (!meetsMinimum && !orderPlaced) {
    return (
      <>
        <SEOHead title="Checkout" description="Complete your order." noindex />
        <section className="container py-20 text-center">
          <AlertCircle size={48} className="text-red-500 mx-auto mb-4" />
          <h1 className="font-display text-2xl text-[#4B2D8E] mb-2">MINIMUM ORDER NOT MET</h1>
          <p className="text-gray-500 font-body mb-6">The minimum order is ${MINIMUM_ORDER}. Please add more items.</p>
          <Link href="/shop" className="inline-flex items-center gap-2 bg-[#F15929] text-white font-display py-3 px-8 rounded-full">CONTINUE SHOPPING</Link>
        </section>
      </>
    );
  }

  if (orderPlaced) {
    return (
      <>
        <SEOHead title="Order Confirmed" description="Your order has been placed successfully." noindex />
        <section className="container py-20 text-center max-w-lg mx-auto">
          <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} className="w-20 h-20 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-6">
            <CheckCircle size={40} className="text-green-600" />
          </motion.div>
          <h1 className="font-display text-2xl text-[#4B2D8E] mb-3">ORDER CONFIRMED!</h1>
          <p className="text-gray-600 font-body mb-2">Order #MLG-{Date.now().toString().slice(-6)}</p>
          <p className="text-gray-500 font-body text-sm mb-6">
            Thank you for your order! Please send your e-Transfer to <strong className="text-[#4B2D8E]">payments@mylegacycannabis.ca</strong> to complete your purchase. Your order will be processed once payment is received.
          </p>
          <div className="bg-[#F5F5F5] rounded-xl p-4 mb-6 text-left">
            <h3 className="font-display text-sm text-[#4B2D8E] mb-2">E-TRANSFER DETAILS</h3>
            <p className="text-sm font-body text-gray-600">Email: <strong>payments@mylegacycannabis.ca</strong></p>
            <p className="text-sm font-body text-gray-600">Amount: <strong>${total.toFixed(2)}</strong></p>
            <p className="text-xs text-gray-400 font-body mt-2">Include your order number in the e-Transfer message.</p>
          </div>
          <div className="bg-[#4B2D8E]/5 rounded-xl p-4 mb-6 flex items-center gap-3">
            <Gift size={18} className="text-[#F15929] shrink-0" />
            <p className="text-sm font-body text-[#4B2D8E]">You earned <strong>{pointsToEarn} points</strong> with this order!</p>
          </div>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link href="/shop" className="bg-[#F15929] text-white font-display py-3 px-8 rounded-full hover:bg-[#d94d22] transition-all">CONTINUE SHOPPING</Link>
            {isAuthenticated && <Link href="/account/orders" className="bg-[#4B2D8E] text-white font-display py-3 px-8 rounded-full hover:bg-[#3a2270] transition-all">VIEW ORDERS</Link>}
          </div>
        </section>
      </>
    );
  }

  const handlePlaceOrder = () => {
    if (!form.email || !form.firstName || !form.lastName || !form.address || !form.city || !form.postalCode) {
      toast.error('Please fill in all required fields');
      return;
    }
    if (isAuthenticated && user && user.idVerificationStatus !== 'approved') {
      toast.error('Please complete ID verification before placing an order');
      return;
    }
    setOrderPlaced(true);
    clearCart();
    toast.success('Order placed successfully!');
  };

  return (
    <>
      <SEOHead title="Checkout" description="Complete your cannabis order with e-Transfer payment." noindex />
      <section className="bg-white py-6 md:py-10">
        <div className="container">
          <Breadcrumbs items={[{ label: 'Home', href: '/' }, { label: 'Cart', href: '/cart' }, { label: 'Checkout' }]} />
          <h1 className="font-display text-2xl md:text-3xl text-[#4B2D8E] mb-6">CHECKOUT</h1>

          {/* ID Verification Warning */}
          {isAuthenticated && user && user.idVerificationStatus !== 'approved' && (
            <div className="bg-orange-50 border border-orange-200 rounded-xl p-4 mb-6 flex items-start gap-3">
              <Shield size={20} className="text-orange-500 shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-body text-orange-700 font-medium">ID Verification Required</p>
                <p className="text-xs font-body text-orange-600 mt-1">You must verify your ID (19+) before placing an order.</p>
                <Link href="/account/verify-id" className="text-xs font-display text-[#F15929] hover:underline mt-2 inline-block">VERIFY NOW →</Link>
              </div>
            </div>
          )}

          {!isAuthenticated && (
            <div className="bg-[#4B2D8E]/5 border border-[#4B2D8E]/10 rounded-xl p-4 mb-6 flex items-start gap-3">
              <Lock size={20} className="text-[#4B2D8E] shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-body text-[#4B2D8E] font-medium">Have an account?</p>
                <p className="text-xs font-body text-gray-600 mt-1">Sign in to earn rewards points and track your orders.</p>
                <Link href="/account/login" className="text-xs font-display text-[#F15929] hover:underline mt-2 inline-block">SIGN IN →</Link>
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Form */}
            <div className="lg:col-span-2 space-y-6">
              {/* Contact */}
              <div className="bg-[#F5F5F5] rounded-2xl p-6">
                <h2 className="font-display text-lg text-[#4B2D8E] mb-4">1. CONTACT INFORMATION</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs text-gray-500 font-body block mb-1">First Name *</label>
                    <input type="text" value={form.firstName} onChange={e => setForm({...form, firstName: e.target.value})}
                      className="w-full bg-white rounded-lg px-4 py-3 text-sm font-body border-none focus:ring-2 focus:ring-[#4B2D8E]" required />
                  </div>
                  <div>
                    <label className="text-xs text-gray-500 font-body block mb-1">Last Name *</label>
                    <input type="text" value={form.lastName} onChange={e => setForm({...form, lastName: e.target.value})}
                      className="w-full bg-white rounded-lg px-4 py-3 text-sm font-body border-none focus:ring-2 focus:ring-[#4B2D8E]" required />
                  </div>
                  <div>
                    <label className="text-xs text-gray-500 font-body block mb-1">Email *</label>
                    <input type="email" value={form.email} onChange={e => setForm({...form, email: e.target.value})}
                      className="w-full bg-white rounded-lg px-4 py-3 text-sm font-body border-none focus:ring-2 focus:ring-[#4B2D8E]" required />
                  </div>
                  <div>
                    <label className="text-xs text-gray-500 font-body block mb-1">Phone</label>
                    <input type="tel" value={form.phone} onChange={e => setForm({...form, phone: e.target.value})}
                      className="w-full bg-white rounded-lg px-4 py-3 text-sm font-body border-none focus:ring-2 focus:ring-[#4B2D8E]" />
                  </div>
                </div>
              </div>

              {/* Shipping Address */}
              <div className="bg-[#F5F5F5] rounded-2xl p-6">
                <h2 className="font-display text-lg text-[#4B2D8E] mb-4">2. SHIPPING ADDRESS</h2>
                <div className="space-y-4">
                  <div>
                    <label className="text-xs text-gray-500 font-body block mb-1">Street Address *</label>
                    <input type="text" value={form.address} onChange={e => setForm({...form, address: e.target.value})}
                      className="w-full bg-white rounded-lg px-4 py-3 text-sm font-body border-none focus:ring-2 focus:ring-[#4B2D8E]" required />
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div>
                      <label className="text-xs text-gray-500 font-body block mb-1">City *</label>
                      <input type="text" value={form.city} onChange={e => setForm({...form, city: e.target.value})}
                        className="w-full bg-white rounded-lg px-4 py-3 text-sm font-body border-none focus:ring-2 focus:ring-[#4B2D8E]" required />
                    </div>
                    <div>
                      <label className="text-xs text-gray-500 font-body block mb-1">Province *</label>
                      <select value={form.province} onChange={e => { setForm({...form, province: e.target.value}); setShippingProvince(e.target.value); }}
                        className="w-full bg-white rounded-lg px-4 py-3 text-sm font-body border-none focus:ring-2 focus:ring-[#4B2D8E]">
                        {canadianProvinces.map(p => <option key={p.code} value={p.code}>{p.name}</option>)}
                      </select>
                    </div>
                    <div>
                      <label className="text-xs text-gray-500 font-body block mb-1">Postal Code *</label>
                      <input type="text" value={form.postalCode} onChange={e => setForm({...form, postalCode: e.target.value})}
                        className="w-full bg-white rounded-lg px-4 py-3 text-sm font-body border-none focus:ring-2 focus:ring-[#4B2D8E]" required />
                    </div>
                  </div>
                  <div>
                    <label className="text-xs text-gray-500 font-body block mb-1">Order Notes (optional)</label>
                    <textarea value={form.notes} onChange={e => setForm({...form, notes: e.target.value})} rows={3}
                      className="w-full bg-white rounded-lg px-4 py-3 text-sm font-body border-none focus:ring-2 focus:ring-[#4B2D8E] resize-none" />
                  </div>
                </div>
              </div>

              {/* Payment */}
              <div className="bg-[#F5F5F5] rounded-2xl p-6">
                <h2 className="font-display text-lg text-[#4B2D8E] mb-4">3. PAYMENT METHOD</h2>
                <div className="bg-white rounded-xl p-4 border-2 border-[#4B2D8E]">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-10 h-10 rounded-full bg-[#4B2D8E] flex items-center justify-center">
                      <CreditCard size={18} className="text-white" />
                    </div>
                    <div>
                      <p className="font-display text-sm text-[#4B2D8E]">INTERAC E-TRANSFER</p>
                      <p className="text-xs text-gray-500 font-body">Send payment after placing your order</p>
                    </div>
                  </div>
                  <p className="text-xs text-gray-600 font-body bg-[#F5F5F5] rounded-lg p-3">
                    After placing your order, send an e-Transfer to <strong>payments@mylegacycannabis.ca</strong>. Include your order number in the message. Your order will be processed once payment is received.
                  </p>
                </div>
              </div>
            </div>

            {/* Order Summary Sidebar */}
            <div className="lg:col-span-1">
              <div className="bg-[#F5F5F5] rounded-2xl p-6 sticky top-28">
                <h2 className="font-display text-lg text-[#4B2D8E] mb-4">ORDER SUMMARY</h2>
                <div className="space-y-3 max-h-60 overflow-y-auto mb-4">
                  {items.map(item => (
                    <div key={item.product.id} className="flex items-center gap-3">
                      <img src={item.product.image} alt={item.product.name} className="w-12 h-12 rounded-lg object-cover" />
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-display text-[#333] truncate">{item.product.name}</p>
                        <p className="text-[10px] text-gray-500 font-body">Qty: {item.quantity}</p>
                      </div>
                      <span className="text-xs font-mono-legacy text-[#333]">${(item.product.price * item.quantity).toFixed(2)}</span>
                    </div>
                  ))}
                </div>
                <div className="space-y-2 text-sm font-body border-t border-gray-200 pt-4 mb-4">
                  <div className="flex justify-between"><span className="text-gray-500">Subtotal</span><span>${subtotal.toFixed(2)}</span></div>
                  {rewardDiscount > 0 && <div className="flex justify-between text-[#F15929]"><span>Rewards</span><span>-${rewardDiscount.toFixed(2)}</span></div>}
                  <div className="flex justify-between"><span className="text-gray-500">Shipping</span><span className={isFreeShipping ? 'text-[#F15929]' : ''}>{isFreeShipping ? 'FREE' : `$${shippingRate.toFixed(2)}`}</span></div>
                  <div className="flex justify-between"><span className="text-gray-500">Tax</span><span>$0.00</span></div>
                </div>
                <div className="flex justify-between font-display text-lg border-t border-gray-200 pt-4 mb-4">
                  <span className="text-[#4B2D8E]">TOTAL</span>
                  <span className="text-[#4B2D8E]">${total.toFixed(2)}</span>
                </div>
                <p className="text-xs text-[#4B2D8E] font-body mb-4 flex items-center gap-1">
                  <Gift size={12} className="text-[#F15929]" /> Earn <strong>{pointsToEarn} points</strong>
                </p>
                <button onClick={handlePlaceOrder}
                  className="w-full bg-[#F15929] hover:bg-[#d94d22] text-white font-display py-3.5 rounded-full transition-all hover:scale-[1.02] active:scale-95 flex items-center justify-center gap-2">
                  <Lock size={16} /> PLACE ORDER
                </button>
                <p className="text-[10px] text-gray-400 font-body text-center mt-3">By placing your order, you confirm you are 19+ and agree to our Terms & Conditions.</p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
