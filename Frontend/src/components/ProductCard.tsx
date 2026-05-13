import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Star } from "lucide-react";
import { Product } from "@/data/products";

const ProductCard = ({ product, index = 0 }: { product: Product; index?: number }) => {
  const rating = Number(product.rating ?? 5);
  const reviewCount = product.reviewCount ?? 17;
  const roundedRating = Math.round(rating);

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.6, delay: index * 0.1 }}
      className="text-center"
    >
      <div className="mb-4 overflow-hidden">
        <Link to={`/product/${product.id}`}>
          <div className="aspect-[4/3] overflow-hidden">
            <img
              src={product.image}
              alt={product.name}
              className="h-full w-full object-contain"
            />
          </div>
        </Link>
      </div>
      <Link to={`/product/${product.id}`}>
        <h3 className="mb-2 min-h-6 font-display text-base font-semibold uppercase tracking-[0.18em] text-foreground md:text-lg">
          {product.name}
        </h3>
        {reviewCount > 0 ? (
          <div className="mb-2 flex items-center justify-center gap-0.5 text-amber-400">
            {[...Array(5)].map((_, i) => (
              <Star
                key={i}
                size={13}
                className={i < roundedRating ? "fill-current" : "text-muted-foreground/30"}
              />
            ))}
            <span className="ml-1 font-body text-xs text-foreground/70">
              {rating.toFixed(1)} ({reviewCount})
            </span>
          </div>
        ) : (
          <div className="mb-2 font-body text-xs text-muted-foreground">
            No reviews yet
          </div>
        )}
        <div className="flex items-end justify-center gap-2">
          <span className="font-nav text-base font-bold tracking-wide text-foreground md:text-lg">
            Rs. {product.price.toLocaleString()}
          </span>
        </div>
      </Link>
    </motion.div>
  );
};

export default ProductCard;
