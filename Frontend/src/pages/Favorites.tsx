import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Heart, ShoppingBag, X } from "lucide-react";
import { useFavorites } from "@/context/FavoritesContext";
import { useCart } from "@/context/CartContext";
import { getProductUrl } from "@/lib/product-url";

const Favorites = () => {
  const { favorites, removeFavorite } = useFavorites();
  const { addToCart } = useCart();

  if (favorites.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="container py-32 text-center"
      >
        <Heart size={48} className="mx-auto mb-6 text-muted-foreground/40" />
        <h2 className="mb-3 font-display text-2xl text-foreground">
          No favorites yet
        </h2>
        <p className="mb-8 font-body text-lg text-muted-foreground">
          Save products you love and find them here anytime.
        </p>
        <Link
          to="/products"
          className="inline-block bg-foreground px-10 py-4 font-nav text-xs uppercase tracking-wide text-primary-foreground transition-colors hover:bg-foreground/90"
        >
          Browse Products
        </Link>
      </motion.div>
    );
  }

  return (
    <section className="container py-16">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="mb-3 font-display text-3xl text-foreground">Favorites</h1>
        <p className="mb-10 font-body text-muted-foreground">
          {favorites.length} saved item{favorites.length === 1 ? "" : "s"}
        </p>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
          {favorites.map((product) => (
            <div
              key={product.id}
              className="overflow-hidden rounded-2xl border border-border bg-card"
            >
              <Link
                to={getProductUrl(product)}
                className="block aspect-square bg-background p-4"
              >
                <img
                  src={product.image}
                  alt={product.name}
                  className="mx-auto h-full max-h-full w-full max-w-full object-contain"
                />
              </Link>
              <div className="p-5">
                <div className="mb-4 flex items-start justify-between gap-3">
                  <div>
                    <Link
                      to={getProductUrl(product)}
                      className="font-display text-lg text-foreground hover:opacity-80"
                    >
                      {product.name}
                    </Link>
                    <p className="mt-1 font-body text-sm text-muted-foreground">
                      {product.category}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => removeFavorite(product.id)}
                    className="text-muted-foreground transition-colors hover:text-foreground"
                    aria-label="Remove from favorites"
                  >
                    <X size={18} />
                  </button>
                </div>

                <div className="flex items-center justify-between gap-3">
                  <span className="font-display text-lg text-foreground">
                    Rs. {product.price.toLocaleString()}
                  </span>
                  <button
                    type="button"
                    onClick={() => addToCart(product, 1)}
                    className="inline-flex items-center gap-2 rounded-full bg-primary px-4 py-2 font-nav text-xs uppercase tracking-wide text-primary-foreground transition-colors hover:bg-primary/90"
                  >
                    <ShoppingBag size={14} />
                    Add to Cart
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </motion.div>
    </section>
  );
};

export default Favorites;
