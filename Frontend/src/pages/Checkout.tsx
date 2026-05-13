import { useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { useCart } from "@/context/CartContext";
import { Lock, ArrowLeft, Loader2 } from "lucide-react";
import { createOrder, OrderPayload } from "@/services/api";
import { toast } from "sonner";
import { useAuth } from "@/context/AuthContext";

const Checkout = () => {
  const { items, totalPrice, clearCart } = useCart();
  const { user } = useAuth();
  const [placed, setPlaced] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    fullName: '',
    phone: '',
    email: '',
    address: '',
    city: '',
    state: '',
    zip: '',
    referralCode: '',
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handlePlaceOrder = async () => {
    if (!user) {
      toast.error('Please login before placing an order.');
      return;
    }

    // Basic validation
    if (!formData.fullName || !formData.phone || !formData.address || !formData.city || !formData.state) {
      toast.error('Please fill in all required fields.');
      return;
    }

    setIsSubmitting(true);

    try {
      const orderPayload: OrderPayload = {
        user_id: Number(user.id),
        subtotal: totalPrice,
        total: totalPrice,
        referred_by_code: formData.referralCode || undefined,
        shipping_address: {
          full_name: formData.fullName,
          address: formData.address,
          city: formData.city,
          state: formData.state,
          zip: formData.zip,
          country: 'PK',
          email: formData.email || 'no-email@cod.com',
          phone: formData.phone,
        },
        items: items.map(item => ({
          product_id: parseInt(item.product.id),
          name: item.product.name,
          price: item.product.price,
          quantity: item.quantity,
        })),
      };

      await createOrder(orderPayload);

      setPlaced(true);
      clearCart();
      toast.success('Order placed successfully!');
    } catch (error: unknown) {
      console.error('Checkout error:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to place order. Please try again.';
      toast.error(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };


  if (placed) {
    return (
      <div className="container py-32 text-center">
        <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}>
          <div className="w-16 h-16 border-2 border-primary rounded-full flex items-center justify-center mx-auto mb-6">
            <span className="text-primary text-2xl">✓</span>
          </div>
          <h2 className="font-display text-3xl text-foreground mb-3">Thank You</h2>
          <p className="font-body text-lg text-muted-foreground mb-8">Your order has been placed successfully.</p>
          <Link
            to="/"
            className="inline-block bg-foreground text-primary-foreground font-nav text-xs tracking-[0.2em] uppercase px-10 py-4"
          >
            Return Home
          </Link>
        </motion.div>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="container py-32 text-center">
        <h2 className="font-display text-2xl text-foreground mb-3">Nothing to Checkout</h2>
        <Link to="/products" className="mt-4 inline-block font-nav text-sm text-primary underline">Browse Collections</Link>
      </div>
    );
  }

  const shipping = 0; // FREE shipping for COD in Pakistan

  if (!user) {
    return (
      <div className="container py-32 text-center">
        <h2 className="font-display text-2xl text-foreground mb-3">Login Required</h2>
        <p className="font-body text-muted-foreground mb-6">
          Please login to place an order and track it from your dashboard.
        </p>
        <Link
          to="/login"
          className="inline-block bg-foreground text-primary-foreground font-nav text-xs tracking-[0.2em] uppercase px-10 py-4"
        >
          Login to Checkout
        </Link>
      </div>
    );
  }

  return (
    <section className="container py-16">
      <Link to="/cart" className="inline-flex items-center gap-2 font-nav text-xs tracking-[0.15em] uppercase text-muted-foreground hover:text-foreground transition-colors mb-8">
        <ArrowLeft size={14} /> Back to Bag
      </Link>

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="font-display text-3xl text-foreground mb-12">Checkout</h1>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
          {/* Form */}
          <div className="space-y-8">
            <div>
              <h3 className="font-nav text-xs tracking-[0.2em] uppercase text-foreground mb-4">Contact Information</h3>
              <div className="space-y-4">
                <input type="text" name="phone" value={formData.phone} onChange={handleInputChange} placeholder="Contact Number (Required)" className="w-full border border-border bg-transparent px-4 py-3 font-body text-sm placeholder:text-muted-foreground focus:outline-none focus:border-primary transition-colors" />
                <input type="email" name="email" value={formData.email} onChange={handleInputChange} placeholder="Email Address (Optional)" className="w-full border border-border bg-transparent px-4 py-3 font-body text-sm placeholder:text-muted-foreground focus:outline-none focus:border-primary transition-colors" />
              </div>
            </div>

            <div>
              <h3 className="font-nav text-xs tracking-[0.2em] uppercase text-foreground mb-4">Shipping Address</h3>
              <div className="space-y-4">
                <input type="text" name="fullName" value={formData.fullName} onChange={handleInputChange} placeholder="Full Name" className="w-full border border-border bg-transparent px-4 py-3 font-body text-sm placeholder:text-muted-foreground focus:outline-none focus:border-primary transition-colors" />
                <input type="text" name="address" value={formData.address} onChange={handleInputChange} placeholder="Address" className="w-full border border-border bg-transparent px-4 py-3 font-body text-sm placeholder:text-muted-foreground focus:outline-none focus:border-primary transition-colors" />
                <div className="grid grid-cols-3 gap-4">
                  <input type="text" name="city" value={formData.city} onChange={handleInputChange} placeholder="City" className="w-full border border-border bg-transparent px-4 py-3 font-body text-sm placeholder:text-muted-foreground focus:outline-none focus:border-primary transition-colors" />
                  <input type="text" name="state" value={formData.state} onChange={handleInputChange} placeholder="State" className="w-full border border-border bg-transparent px-4 py-3 font-body text-sm placeholder:text-muted-foreground focus:outline-none focus:border-primary transition-colors" />
                  <input type="text" name="zip" value={formData.zip} onChange={handleInputChange} placeholder="ZIP" className="w-full border border-border bg-transparent px-4 py-3 font-body text-sm placeholder:text-muted-foreground focus:outline-none focus:border-primary transition-colors" />
                </div>
                <input type="text" name="referralCode" value={formData.referralCode} onChange={handleInputChange} placeholder="Referral / ReSale Code (Optional)" className="w-full border border-border bg-transparent px-4 py-3 font-body text-sm placeholder:text-muted-foreground focus:outline-none focus:border-primary transition-colors" />
              </div>
            </div>

            <div>
              <h3 className="font-nav text-xs tracking-[0.2em] uppercase text-foreground mb-4">Payment Method</h3>
              <div className="bg-secondary/50 p-6 rounded-md border border-border">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-4 h-4 rounded-full border-4 border-foreground bg-background"></div>
                  <span className="font-body text-sm font-bold text-foreground">Cash on Delivery (COD)</span>
                </div>
                <p className="font-body text-xs text-muted-foreground ml-7 leading-relaxed">
                  Pay with cash upon delivery. Enjoy FREE shipping on all orders.
                </p>
              </div>
            </div>

            <button
              onClick={handlePlaceOrder}
              disabled={isSubmitting}
              className="w-full bg-foreground text-primary-foreground py-4 font-nav text-xs tracking-[0.2em] uppercase flex items-center justify-center gap-2 hover:bg-foreground/90 transition-colors disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {isSubmitting ? (
                <>
                  <Loader2 size={14} className="animate-spin" /> Processing...
                </>
              ) : (
                <>
                  <Lock size={14} /> Place Order — Rs. {(totalPrice + shipping).toLocaleString()}
                </>
              )}
            </button>
          </div>

          {/* Order Summary */}
          <div className="bg-card p-8 h-fit">
            <h3 className="font-nav text-xs tracking-[0.2em] uppercase text-foreground mb-6">Your Order</h3>
            <div className="space-y-4 border-b border-border pb-6 mb-6">
              {items.map((item) => (
                <div key={item.product.id} className="flex gap-4">
                  <div className="w-16 h-16 bg-secondary flex-shrink-0">
                    <img src={item.product.image} alt={item.product.name} className="w-full h-full object-cover" />
                  </div>
                  <div className="flex-1">
                    <p className="font-display text-sm text-foreground">{item.product.name}</p>
                    <p className="font-body text-xs text-muted-foreground">Qty: {item.quantity}</p>
                  </div>
                  <span className="font-body text-sm text-foreground">Rs. {(item.product.price * item.quantity).toLocaleString()}</span>
                </div>
              ))}
            </div>
            <div className="space-y-2 mb-4">
              <div className="flex justify-between font-body text-sm">
                <span className="text-muted-foreground">Subtotal</span>
                <span className="text-foreground">Rs. {totalPrice.toLocaleString()}</span>
              </div>
              <div className="flex justify-between font-body text-sm">
                <span className="text-muted-foreground">Shipping</span>
                <span className="text-foreground">FREE</span>
              </div>
            </div>
            <div className="border-t border-border pt-4 flex justify-between">
              <span className="font-nav text-xs tracking-wider uppercase text-foreground">Total</span>
              <span className="font-display text-xl text-foreground">Rs. {(totalPrice + shipping).toLocaleString()}</span>
            </div>
          </div>
        </div>
      </motion.div>
    </section>
  );
};

export default Checkout;
