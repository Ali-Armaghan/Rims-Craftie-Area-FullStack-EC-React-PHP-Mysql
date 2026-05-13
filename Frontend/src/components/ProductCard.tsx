import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ShoppingBag, Heart } from "lucide-react";
import { Product } from "@/data/products";
import { useCart } from "@/context/CartContext";

const ProductCard = ({ product, index = 0 }: { product: Product; index?: number }) => {
  const { addToCart } = useCart();

  // Calculate discount percentage
  let discountBadge = null;
  if (product?.originalPrice && product.originalPrice > product.price) {
    const discount = Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100);
    discountBadge = `-${discount}% OFF`;
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.6, delay: index * 0.1 }}
      className="group"
    >
      <div className="relative overflow-hidden bg-card mb-4 rounded-sm">
        {product.badge && (
          <span className="absolute top-4 left-4 z-10 font-nav text-[10px] tracking-[0.2em] uppercase bg-primary text-primary-foreground px-3 py-1">
            {product.badge}
          </span>
        )}
        <Link to={`/product/${product.id}`}>
          <div className="aspect-square overflow-hidden rounded-sm">
            <img
              src={product.image}
              alt={product.name}
              className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
            />
          </div>
        </Link>
        {/* Quick actions */}
        <div className="absolute bottom-0 left-0 right-0 p-4 flex gap-2 translate-y-full group-hover:translate-y-0 transition-transform duration-500">
          <button
            onClick={() => addToCart(product)}
            className="flex-1 bg-foreground/90 text-primary-foreground py-3 font-nav text-[10px] tracking-[0.2em] uppercase flex items-center justify-center gap-2 hover:bg-foreground transition-colors"
          >
            <ShoppingBag size={14} />
            Add to Bag
          </button>
          <button className="bg-foreground/90 text-primary-foreground p-3 hover:bg-foreground transition-colors">
            <Heart size={14} />
          </button>
        </div>
      </div>
      <Link to={`/product/${product.id}`}>
        <h3 className="font-display text-lg text-foreground mb-1 group-hover:text-primary transition-colors">
          {product.name}
        </h3>
        <p className="font-nav text-xs tracking-wider text-muted-foreground mb-2">{product.category}</p>
        <div className="flex items-center gap-2 mt-1">
          <span className="font-display text-xl font-bold text-foreground leading-none">Rs. {product.price.toLocaleString()}</span>
          {product.originalPrice && (
            <>
              <span className="font-body text-sm font-medium text-muted-foreground line-through decoration-muted-foreground/60 decoration-1 leading-none self-end pb-[1px]">
                Rs. {product.originalPrice.toLocaleString()}
              </span>
              {discountBadge && (
                <span className="bg-[#f0f0f0] text-[#111111] font-body text-[10px] uppercase px-2 py-0.5 rounded-full font-bold ml-1 self-center">
                  {discountBadge}
                </span>
              )}
            </>
          )}
        </div>
      </Link>
    </motion.div>
  );
};

export default ProductCard;
