import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Star } from "lucide-react";
import { Product } from "@/data/products";
import { cn } from "@/lib/utils";
import { getProductUrl } from "@/lib/product-url";
import { useFavorites } from "@/context/FavoritesContext";
import { FavoriteHeartButton } from "@/components/FavoriteHeartButton";

const ProductCard = ({
  product,
  index = 0,
  compact = false,
}: {
  product: Product;
  index?: number;
  compact?: boolean;
}) => {
  const { isFavorite, toggleFavorite } = useFavorites();
  const favorited = isFavorite(product.id);
  const rating = Number(product.rating ?? 5);
  const reviewCount = product.reviewCount ?? 17;
  const roundedRating = Math.round(rating);
  const discountPercent =
    product.originalPrice && product.originalPrice > product.price
      ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
      : null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.6, delay: index * 0.1 }}
      className="w-full min-w-0 overflow-hidden text-center"
    >
      <div className={cn("relative overflow-hidden", compact ? "mb-1.5" : "mb-4")}>
        {product.isSoldOut || !product.inStock ? (
          <span
            className={cn(
              "absolute left-2 top-2 z-10 rounded-full bg-foreground font-nav font-bold uppercase tracking-normal text-background shadow",
              compact ? "px-2 py-0.5 text-[9px] sm:text-[10px]" : "px-3 py-1 text-[10px] sm:text-xs"
            )}
          >
            {product.isSoldOut ? "Sold Out" : "Out of stock"}
          </span>
        ) : discountPercent != null ? (
          <span
            className={cn(
              "absolute left-2 top-2 z-10 rounded-full bg-primary font-nav font-bold uppercase tracking-normal text-primary-foreground shadow",
              compact ? "px-2 py-0.5 text-[9px] sm:text-[10px]" : "px-3 py-1 text-[10px] sm:text-xs"
            )}
          >
            OFF {discountPercent}%
          </span>
        ) : null}
        <FavoriteHeartButton
          favorited={favorited}
          onToggle={() => toggleFavorite(product)}
          size={16}
          className={cn(
            "absolute right-2 top-2 z-10 h-9 w-9 rounded-full border bg-background/90 transition-colors",
            favorited
              ? "border-red-500/40 text-foreground/70"
              : "border-border text-foreground/70 hover:border-red-400 hover:text-red-400"
          )}
        />
        <Link to={getProductUrl(product)} className="block w-full">
          <div
            className={cn(
              "flex w-full items-center justify-center overflow-hidden bg-background",
              compact ? "aspect-square p-1.5 sm:p-2" : "aspect-[4/3]"
            )}
          >
            <img
              src={product.image}
              alt={product.name}
              className="max-h-full max-w-full object-contain"
            />
          </div>
        </Link>
      </div>

      <Link to={getProductUrl(product)}>
        <h3
          className={cn(
            "font-display font-semibold leading-snug text-foreground",
            compact
              ? "mb-1 line-clamp-2 text-sm md:text-base"
              : "mb-2 min-h-6 text-lg md:text-xl"
          )}
        >
          {product.name}
        </h3>

        {reviewCount > 0 ? (
          <div
            className={cn(
              "flex items-center justify-center gap-0.5 text-amber-400",
              compact ? "mb-1" : "mb-2"
            )}
          >
            {[...Array(5)].map((_, i) => (
              <Star
                key={i}
                size={compact ? 11 : 13}
                className={i < roundedRating ? "fill-current" : "text-muted-foreground/30"}
              />
            ))}
            <span className="ml-1 font-body text-[11px] text-foreground/70 md:text-xs">
              {rating.toFixed(1)} ({reviewCount})
            </span>
          </div>
        ) : (
          <div className={cn("font-body text-xs text-muted-foreground", compact ? "mb-1" : "mb-2")}>
            No reviews yet
          </div>
        )}

        <div className="flex flex-col items-center justify-center gap-0.5">
          {product.originalPrice && product.originalPrice > product.price && (
            <span
              className={cn(
                "font-body text-destructive line-through decoration-destructive/70",
                compact ? "text-xs" : "text-sm"
              )}
            >
              Rs. {product.originalPrice.toLocaleString()}
            </span>
          )}
          <span
            className={cn(
              "font-body font-semibold text-foreground",
              compact ? "text-sm md:text-base" : "text-base md:text-lg"
            )}
          >
            Rs. {product.price.toLocaleString()}
          </span>
        </div>
      </Link>
    </motion.div>
  );
};

export default ProductCard;
