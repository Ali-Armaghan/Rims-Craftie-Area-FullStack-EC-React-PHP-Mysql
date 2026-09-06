import { useEffect, useMemo, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { useQuery } from "@tanstack/react-query";
import { useCart } from "@/context/CartContext";
import { Lock, ArrowLeft, Loader2, BadgePercent } from "lucide-react";
import { createOrder, convertCheckoutDraft, fetchLoyaltyStatus, OrderPayload, saveCheckoutDraft } from "@/services/api";
import { toast } from "sonner";
import { useAuth } from "@/context/AuthContext";
import { calculateLoyaltyDiscount } from "@/lib/loyalty";
import {
  trackInitiateCheckout,
  trackPurchase,
} from "@/lib/meta-pixel";
import {
  trackGABeginCheckout,
  trackGAPurchase,
} from "@/lib/google-analytics";
import {
  clearCheckoutDraftToken,
  getCheckoutDraftToken,
  isCheckoutDraftPhoneReady,
} from "@/lib/checkout-draft";
import { validatePhoneNumber } from "@/lib/phone-validation";

const Checkout = () => {
  const { items, totalPrice, clearCart } = useCart();
  const { user, login } = useAuth();
  const [placed, setPlaced] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [phoneTouched, setPhoneTouched] = useState(false);
  const submitLockRef = useRef(false);
  const checkoutTrackedRef = useRef(false);
  const draftTokenRef = useRef(getCheckoutDraftToken());
  const formDataRef = useRef({
    fullName: '',
    phone: '',
    address: '',
    city: '',
  });
  const itemsRef = useRef(items);
  const totalPriceRef = useRef(totalPrice);
  const [formData, setFormData] = useState({
    fullName: '',
    phone: '',
    address: '',
    city: '',
  });

  const phoneValidation = useMemo(() => {
    if (!formData.phone && !phoneTouched) {
      return { isValid: true, message: undefined };
    }
    return validatePhoneNumber(formData.phone);
  }, [formData.phone, phoneTouched]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    if (name === "phone") {
      setPhoneTouched(true);
    }
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  useEffect(() => {
    formDataRef.current = formData;
  }, [formData]);

  useEffect(() => {
    itemsRef.current = items;
    totalPriceRef.current = totalPrice;
  }, [items, totalPrice]);

  const buildDraftPayload = () => {
    const current = formDataRef.current;
    const cartItems = itemsRef.current.map((item) => ({
      product_id: Number(item.product.id),
      name: item.product.name,
      price: item.product.price,
      quantity: item.quantity,
      color_name: item.selectedColor?.name ?? null,
      color_hex: item.selectedColor?.hex ?? null,
      image: item.product.image,
    }));

    return {
      draft_token: draftTokenRef.current,
      user_id: user?.id ? Number(user.id) : null,
      full_name: current.fullName.trim(),
      phone: current.phone.trim(),
      email: "",
      address: current.address.trim(),
      city: current.city.trim(),
      cart_json: cartItems,
      cart_total: totalPriceRef.current,
    };
  };

  const flushCheckoutDraft = (keepalive = false) => {
    const current = formDataRef.current;
    if (!isCheckoutDraftPhoneReady(current.phone) || placed) return;
    void saveCheckoutDraft(buildDraftPayload(), { keepalive });
  };

  useEffect(() => {
    if (placed) return;
    if (!isCheckoutDraftPhoneReady(formData.phone)) return;

    const timer = window.setTimeout(() => {
      flushCheckoutDraft(false);
    }, 1500);

    return () => window.clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps -- debounce on form + cart
  }, [formData, items, totalPrice, placed, user?.id]);

  useEffect(() => {
    const onHide = () => {
      if (document.visibilityState === "hidden") {
        flushCheckoutDraft(true);
      }
    };
    const onPageHide = () => flushCheckoutDraft(true);

    document.addEventListener("visibilitychange", onHide);
    window.addEventListener("pagehide", onPageHide);
    return () => {
      document.removeEventListener("visibilitychange", onHide);
      window.removeEventListener("pagehide", onPageHide);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [placed, user?.id]);

  useEffect(() => {
    if (!user) return;
    setFormData((prev) => ({
      ...prev,
      fullName: prev.fullName || user.name,
    }));
  }, [user]);

  useEffect(() => {
    if (checkoutTrackedRef.current || items.length === 0) return;
    checkoutTrackedRef.current = true;

    trackInitiateCheckout({
      contents: items.map((item) => ({
        id: String(item.product.id),
        quantity: item.quantity,
        item_price: item.product.price,
      })),
      value: totalPrice,
      numItems: items.reduce((sum, item) => sum + item.quantity, 0),
    });

    trackGABeginCheckout({
      contents: items.map((item) => ({
        id: String(item.product.id),
        quantity: item.quantity,
        item_price: item.product.price,
      })),
      value: totalPrice,
      numItems: items.reduce((sum, item) => sum + item.quantity, 0),
    });
  }, [items, totalPrice]);

  const { data: loyaltyStatus } = useQuery({
    queryKey: ["loyalty-status", user?.id],
    queryFn: () => fetchLoyaltyStatus(user!.id),
    enabled: !!user?.id,
  });

  const appliedSavings = useMemo(() => {
    if (!user || !loyaltyStatus) {
      return {
        source: "none" as const,
        discountPercent: 0,
        discountAmount: 0,
        totalAfterDiscount: totalPrice,
      };
    }
    const loyalty = calculateLoyaltyDiscount(totalPrice, loyaltyStatus.lifetime_spent);
    return {
      source: loyalty.discountAmount > 0 ? ("loyalty" as const) : ("none" as const),
      discountPercent: loyalty.discountPercent,
      discountAmount: loyalty.discountAmount,
      totalAfterDiscount: loyalty.totalAfterDiscount,
    };
  }, [user, loyaltyStatus, totalPrice]);

  const handlePlaceOrder = async () => {
    setPhoneTouched(true);

    if (!formData.fullName.trim() || !formData.phone.trim() || !formData.address.trim() || !formData.city.trim()) {
      toast.error('Please fill in all required fields.');
      return;
    }

    const phoneValidationResult = validatePhoneNumber(formData.phone);
    if (!phoneValidationResult.isValid) {
      toast.error(phoneValidationResult.message || 'Please enter a valid contact number.');
      return;
    }

    // Sync lock — React state alone can miss fast double-clicks
    if (submitLockRef.current || isSubmitting) return;
    submitLockRef.current = true;
    setIsSubmitting(true);

    try {
      const orderPayload: OrderPayload = {
        user_id: user?.id ? Number(user.id) : null,
        subtotal: totalPrice,
        total: appliedSavings.totalAfterDiscount,
        apply_loyalty: Boolean(user),
        shipping_address: {
          full_name: formData.fullName.trim(),
          address: formData.address.trim(),
          city: formData.city.trim(),
          state: "N/A",
          zip: "",
          country: 'PK',
          email: 'no-email@cod.com',
          phone: formData.phone.trim(),
        },
        items: items.map(item => ({
          product_id: parseInt(item.product.id),
          name: item.product.name,
          price: item.product.price,
          quantity: item.quantity,
          color_name: item.selectedColor?.name ?? null,
          color_hex: item.selectedColor?.hex ?? null,
        })),
      };

      const orderResult = await createOrder(orderPayload);

      if (!orderResult?.success) {
        throw new Error(orderResult?.message || "Failed to place order. Please try again.");
      }

      trackPurchase({
        orderId: orderResult.order_id,
        orderNumber: orderResult.order_number,
        contents: items.map((item) => ({
          id: String(item.product.id),
          quantity: item.quantity,
          item_price: item.product.price,
        })),
        value: Number(orderResult.total ?? appliedSavings.totalAfterDiscount),
        numItems: items.reduce((sum, item) => sum + item.quantity, 0),
      });

      trackGAPurchase({
        orderId: orderResult.order_id,
        orderNumber: orderResult.order_number,
        contents: items.map((item) => ({
          id: String(item.product.id),
          quantity: item.quantity,
          item_price: item.product.price,
        })),
        value: Number(orderResult.total ?? appliedSavings.totalAfterDiscount),
        numItems: items.reduce((sum, item) => sum + item.quantity, 0),
      });

      await convertCheckoutDraft({
        draft_token: draftTokenRef.current,
        order_id: orderResult.order_id ?? null,
      });
      clearCheckoutDraftToken();
      draftTokenRef.current = getCheckoutDraftToken();

      setPlaced(true);
      clearCart();
      toast.success('Order placed successfully!');
    } catch (error: unknown) {
      console.error('Checkout error:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to place order. Please try again.';
      toast.error(errorMessage);
      submitLockRef.current = false;
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
            className="inline-block bg-foreground text-primary-foreground font-nav text-xs tracking-wide uppercase px-10 py-4"
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

  const shipping = 0;
  const orderTotal = appliedSavings.totalAfterDiscount + shipping;

  return (
    <section className="container py-16">
      <Link to="/cart" className="inline-flex items-center gap-2 font-nav text-xs tracking-normal uppercase text-muted-foreground hover:text-foreground transition-colors mb-8">
        <ArrowLeft size={14} /> Back to Bag
      </Link>

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="font-display text-3xl text-foreground mb-3">Checkout</h1>
        <p className="font-body text-sm text-muted-foreground mb-10">
          No login required — place your order as a guest.{" "}
          {!user && (
            <>
              Already have an account?{" "}
              <Link to="/login" className="text-primary underline underline-offset-4">
                Login
              </Link>
            </>
          )}
        </p>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
          {/* Form */}
          <div className="space-y-8">
            <div>
              <h3 className="font-nav text-xs tracking-wide uppercase text-foreground mb-4">Contact Information</h3>
              <div className="space-y-1.5">
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleInputChange}
                  onBlur={() => setPhoneTouched(true)}
                  placeholder="Contact Number (e.g. 0300 1234567)"
                  className={`w-full border bg-transparent px-4 py-3 font-body text-sm placeholder:text-muted-foreground focus:outline-none transition-colors ${
                    phoneTouched && !phoneValidation.isValid
                      ? "border-destructive focus:border-destructive text-destructive"
                      : "border-border focus:border-primary text-foreground"
                  }`}
                />
                {phoneTouched && !phoneValidation.isValid && (
                  <p className="font-body text-xs text-destructive">
                    {phoneValidation.message}
                  </p>
                )}
              </div>
            </div>

            <div>
              <h3 className="font-nav text-xs tracking-wide uppercase text-foreground mb-4">Shipping Address</h3>
              <div className="space-y-4">
                <input type="text" name="fullName" value={formData.fullName} onChange={handleInputChange} placeholder="Full Name" className="w-full border border-border bg-transparent px-4 py-3 font-body text-sm placeholder:text-muted-foreground focus:outline-none focus:border-primary transition-colors" />
                <input type="text" name="address" value={formData.address} onChange={handleInputChange} placeholder="Address" className="w-full border border-border bg-transparent px-4 py-3 font-body text-sm placeholder:text-muted-foreground focus:outline-none focus:border-primary transition-colors" />
                <input type="text" name="city" value={formData.city} onChange={handleInputChange} placeholder="City" className="w-full border border-border bg-transparent px-4 py-3 font-body text-sm placeholder:text-muted-foreground focus:outline-none focus:border-primary transition-colors" />
              </div>
            </div>

            <div>
              <h3 className="font-nav text-xs tracking-wide uppercase text-foreground mb-4">Payment Method</h3>
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
              className="w-full bg-foreground text-primary-foreground py-4 font-nav text-xs tracking-wide uppercase flex items-center justify-center gap-2 hover:bg-foreground/90 transition-colors disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {isSubmitting ? (
                <>
                  <Loader2 size={14} className="animate-spin" /> Processing...
                </>
              ) : (
                <>
                  <Lock size={14} /> Place Order — Rs. {orderTotal.toLocaleString()}
                </>
              )}
            </button>
          </div>

          {/* Order Summary */}
          <div className="bg-card p-8 h-fit">
            <h3 className="font-nav text-xs tracking-wide uppercase text-foreground mb-6">Your Order</h3>
            <div className="space-y-4 border-b border-border pb-6 mb-6">
              {items.map((item) => (
                <div
                  key={`${item.product.id}-${item.selectedColor?.hex ?? "default"}`}
                  className="flex gap-4"
                >
                  <div className="w-16 h-16 bg-secondary flex-shrink-0">
                    <img src={item.product.image} alt={item.product.name} className="w-full h-full object-cover" />
                  </div>
                  <div className="flex-1">
                    <p className="font-display text-sm text-foreground">{item.product.name}</p>
                    {item.selectedColor && (
                      <p className="mt-1 flex items-center gap-1.5 font-body text-xs text-muted-foreground">
                        <span
                          className="inline-block h-3 w-3 rounded-full border border-border"
                          style={{ backgroundColor: item.selectedColor.hex }}
                        />
                        Color: {item.selectedColor.name}
                      </p>
                    )}
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
              {appliedSavings.discountAmount > 0 && (
                <div className="flex justify-between font-body text-sm">
                  <span className="inline-flex items-center gap-1.5 text-emerald-700">
                    <BadgePercent size={14} />
                    Loyalty discount ({appliedSavings.discountPercent}%)
                  </span>
                  <span className="font-semibold text-emerald-700">
                    - Rs. {appliedSavings.discountAmount.toLocaleString()}
                  </span>
                </div>
              )}
              {user && appliedSavings.discountAmount === 0 && loyaltyStatus && loyaltyStatus.lifetime_spent < 5000 && (
                <div className="rounded-md border border-border/70 bg-secondary/30 px-3 py-2 font-body text-xs text-muted-foreground">
                  Spend Rs. {Math.max(0, 5000 - loyaltyStatus.lifetime_spent).toLocaleString()} more while logged in to unlock 5% loyalty savings.{" "}
                  <Link to="/loyalty" className="text-primary underline underline-offset-2">
                    View tiers
                  </Link>
                </div>
              )}
              {!user && (
                <div className="rounded-md border border-border/70 bg-secondary/30 px-3 py-2 font-body text-xs text-muted-foreground">
                  <Link to="/login" className="text-primary underline underline-offset-2">
                    Login
                  </Link>{" "}
                  to unlock automatic loyalty discounts on your order.
                </div>
              )}
              <div className="flex justify-between font-body text-sm">
                <span className="text-muted-foreground">Shipping</span>
                <span className="text-foreground">FREE</span>
              </div>
            </div>
            <div className="border-t border-border pt-4 flex justify-between">
              <span className="font-nav text-xs tracking-wider uppercase text-foreground">Total</span>
              <span className="font-display text-xl text-foreground">Rs. {orderTotal.toLocaleString()}</span>
            </div>
          </div>
        </div>
      </motion.div>
    </section>
  );
};

export default Checkout;
