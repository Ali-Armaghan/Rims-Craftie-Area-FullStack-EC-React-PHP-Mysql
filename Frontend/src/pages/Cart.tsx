import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Minus, Plus, X, ShoppingBag } from "lucide-react";
import { useCart } from "@/context/CartContext";
import { getProductUrl } from "@/lib/product-url";

const Cart = () => {
  const { items, updateQuantity, removeFromCart, totalPrice } = useCart();

  if (items.length === 0) {
    return (
      <div className="container py-32 text-center">
        <ShoppingBag size={48} className="mx-auto text-muted-foreground/40 mb-6" />
        <h2 className="font-display text-2xl text-foreground mb-3">Your Bag is Empty</h2>
        <p className="font-body text-lg text-muted-foreground mb-8">Discover our exquisite collections</p>
        <Link
          to="/products"
          className="inline-block bg-foreground text-primary-foreground font-nav text-xs tracking-wide uppercase px-10 py-4 hover:bg-foreground/90 transition-colors"
        >
          Continue Shopping
        </Link>
      </div>
    );
  }

  return (
    <section className="container py-16">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="font-display text-3xl text-foreground mb-12">Shopping Bag</h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          {/* Items */}
          <div className="lg:col-span-2 space-y-6">
            {items.map((item) => (
              <div key={item.product.id} className="flex gap-6 border-b border-border pb-6">
                <Link to={getProductUrl(item.product)} className="w-28 h-28 bg-card flex-shrink-0">
                  <img src={item.product.image} alt={item.product.name} className="w-full h-full object-cover" />
                </Link>
                <div className="flex-1">
                  <div className="flex justify-between">
                    <div>
                      <h3 className="font-display text-lg text-foreground">{item.product.name}</h3>
                      <p className="font-nav text-xs tracking-wider text-muted-foreground">{item.product.material}</p>
                    </div>
                    <button onClick={() => removeFromCart(item.product.id)} className="text-muted-foreground hover:text-foreground transition-colors">
                      <X size={18} />
                    </button>
                  </div>
                  <div className="flex items-center justify-between mt-4">
                    <div className="flex items-center border border-border">
                      <button onClick={() => updateQuantity(item.product.id, item.quantity - 1)} className="p-2 text-muted-foreground hover:text-foreground">
                        <Minus size={14} />
                      </button>
                      <span className="px-4 font-nav text-sm">{item.quantity}</span>
                      <button onClick={() => updateQuantity(item.product.id, item.quantity + 1)} className="p-2 text-muted-foreground hover:text-foreground">
                        <Plus size={14} />
                      </button>
                    </div>
                    <span className="font-display text-lg text-foreground">Rs. {(item.product.price * item.quantity).toLocaleString()}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Summary */}
          <div className="bg-card p-8 h-fit">
            <h3 className="font-nav text-xs tracking-wide uppercase text-foreground mb-6">Order Summary</h3>
            <div className="space-y-3 border-b border-border pb-6 mb-6">
              <div className="flex justify-between font-body text-sm">
                <span className="text-muted-foreground">Subtotal</span>
                <span className="text-foreground">Rs. {totalPrice.toLocaleString()}</span>
              </div>
              <div className="flex justify-between font-body text-sm">
                <span className="text-muted-foreground">Shipping</span>
                <span className="text-foreground">FREE</span>
              </div>
            </div>
            <div className="flex justify-between mb-8">
              <span className="font-nav text-xs tracking-wider uppercase text-foreground">Total</span>
              <span className="font-display text-xl text-foreground">
                Rs. {totalPrice.toLocaleString()}
              </span>
            </div>
            <Link
              to="/checkout"
              className="block w-full text-center bg-foreground text-primary-foreground py-4 font-nav text-xs tracking-wide uppercase hover:bg-foreground/90 transition-colors"
            >
              Proceed to Checkout
            </Link>
            <Link to="/products" className="block text-center mt-4 font-body text-sm text-muted-foreground hover:text-foreground transition-colors">
              Continue Shopping
            </Link>
          </div>
        </div>
      </motion.div>
    </section>
  );
};

export default Cart;
