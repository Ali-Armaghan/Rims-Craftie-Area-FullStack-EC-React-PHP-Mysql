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
      <section className="border-b border-border py-16 text-center">
        <div className="container">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <p className="text-label mb-3">Our collections</p>
            <h1 className="mb-8 font-display text-4xl text-foreground md:text-5xl">Bags &amp; Accessories</h1>
          </motion.div>
          {/* Category filters */}
          <div className="flex flex-wrap justify-center gap-4">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`font-nav text-xs uppercase tracking-wide border px-5 py-2 transition-all duration-300 ${
                  activeCategory === cat
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
      <section className="w-full overflow-x-hidden py-12 md:py-16">
        <div className="w-full px-2 sm:px-3 lg:px-4">
          <div className="grid w-full grid-cols-2 gap-1 sm:gap-1.5 lg:grid-cols-[repeat(5,minmax(0,1fr))] lg:gap-1.5">
            {isLoading ? (
              [...Array(10)].map((_, i) => (
                <ProductCardSkeleton key={i} compact />
              ))
            ) : error ? (
              <div className="col-span-full py-20 text-center font-nav text-sm uppercase tracking-wide text-destructive">
                {error}
              </div>
            ) : filtered.length === 0 ? (
              <div className="col-span-full py-20 text-center font-nav text-sm uppercase tracking-wide text-muted-foreground">
                No products found in this category.
              </div>
            ) : (
              filtered.map((p, i) => (
                <ProductCard key={p.id} product={p} index={i} compact />
              ))
            )}
          </div>
        </div>
      </section>
    </>
  );
};

export default Products;
