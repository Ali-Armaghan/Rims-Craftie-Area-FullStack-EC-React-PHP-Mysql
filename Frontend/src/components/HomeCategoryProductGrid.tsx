import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import ProductCard from "@/components/ProductCard";
import ProductCardSkeleton from "@/components/skeletons/ProductCardSkeleton";
import type { Product } from "@/data/products";

type HomeCategoryProductGridProps = {
  title: string;
  categoryName: string;
  products: Product[];
  isLoading?: boolean;
};

const HomeCategoryProductGrid = ({
  title,
  categoryName,
  products,
  isLoading = false,
}: HomeCategoryProductGridProps) => {
  return (
    <section className="w-full overflow-x-hidden">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="mb-5 px-3 text-center sm:px-4 md:mb-6 lg:px-5"
      >
        {/* <p className="text-label mb-2">Shop collection</p> */}
        <h2 className="font-display text-3xl text-foreground md:text-4xl">{title}</h2>
      </motion.div>

      <div className="w-full px-2 sm:px-3 lg:px-4">
        <div className="grid w-full grid-cols-2 gap-1 sm:gap-1.5 lg:grid-cols-[repeat(5,minmax(0,1fr))] lg:gap-1.5">
          {isLoading
            ? [...Array(8)].map((_, i) => <ProductCardSkeleton key={i} compact />)
            : products.length > 0
              ? products.slice(0, 8).map((product, i) => (
                  <ProductCard key={product.id} product={product} index={i} compact />
                ))
              : (
                  <p className="col-span-full py-12 text-center text-sm text-muted-foreground">
                    No products in this category yet.
                  </p>
                )}
        </div>
      </div>

      {!isLoading && products.length > 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="mt-4 px-3 text-center sm:px-4 lg:px-5"
        >
          <Link
            to="/products"
            state={{ category: categoryName }}
            className="inline-flex items-center gap-2 border-b border-foreground pb-1 font-nav text-xs uppercase tracking-wide text-foreground transition-colors hover:border-primary hover:text-primary"
          >
            View all {title} <ArrowRight size={14} />
          </Link>
        </motion.div>
      )}
    </section>
  );
};

export default HomeCategoryProductGrid;
