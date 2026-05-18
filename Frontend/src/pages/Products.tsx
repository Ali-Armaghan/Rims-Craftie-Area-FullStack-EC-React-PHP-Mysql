import { useState } from "react";
import { motion } from "framer-motion";
import ProductCard from "@/components/ProductCard";
import { useProducts } from "@/hooks/useProducts";
import ProductCardSkeleton from "@/components/skeletons/ProductCardSkeleton";

const Products = () => {
  const [activeCategory, setActiveCategory] = useState("All");
  const { products, categories, isLoading, error } = useProducts();

  const filtered = activeCategory === "All" ? products : products.filter((p) => p.category === activeCategory);

  return (
    <>
      {/* Hero */}
      <section className="py-16 text-center border-b border-border">
        <div className="container">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <p className="text-label mb-3">Our collections</p>
            <h1 className="font-display text-4xl md:text-5xl text-foreground mb-8">Bags &amp; Accessories</h1>
          </motion.div>
          {/* Category filters */}
          <div className="flex flex-wrap justify-center gap-4">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`font-nav text-xs tracking-wide uppercase px-5 py-2 border transition-all duration-300 ${activeCategory === cat
                  ? "border-primary bg-primary text-primary-foreground"
                  : "border-border text-muted-foreground hover:border-primary hover:text-primary"
                  }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Grid */}
      <section className="py-16">
        <div className="container">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-8 lg:gap-10 rounded-sm">
            {isLoading ? (
              [...Array(8)].map((_, i) => (
                <ProductCardSkeleton key={i} />
              ))
            ) : error ? (
              <div className="col-span-full py-20 text-center text-destructive font-nav text-sm tracking-widest uppercase">
                {error}
              </div>
            ) : filtered.length === 0 ? (
              <div className="col-span-full py-20 text-center text-muted-foreground font-nav text-sm tracking-widest uppercase">
                No products found in this category.
              </div>
            ) : (
              filtered.map((p, i) => (
                <ProductCard key={p.id} product={p} index={i} />
              ))
            )}
          </div>
        </div>
      </section>
    </>
  );
};

export default Products;
