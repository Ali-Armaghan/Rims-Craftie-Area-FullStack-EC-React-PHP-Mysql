import { useRef, useState, useCallback } from "react";
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

const DISPLAY_COUNT = 8;

const mobileSlideClass =
  "w-[40vw] max-w-[168px] shrink-0 snap-start sm:w-[36vw] sm:max-w-[180px]";

const HomeCategoryProductGrid = ({
  title,
  categoryName,
  products,
  isLoading = false,
}: HomeCategoryProductGridProps) => {
  const displayProducts = products.slice(0, DISPLAY_COUNT);
  const scrollRef = useRef<HTMLDivElement>(null);
  const [activeIndex, setActiveIndex] = useState(0);
  const slideCount = isLoading ? DISPLAY_COUNT : displayProducts.length;

  const updateActiveIndex = useCallback(() => {
    const el = scrollRef.current;
    if (!el) return;
    const firstSlide = el.querySelector<HTMLElement>("[data-product-slide]");
    if (!firstSlide) return;
    const step = firstSlide.offsetWidth + 8;
    if (step <= 0) return;
    const index = Math.round(el.scrollLeft / step);
    setActiveIndex(Math.max(0, Math.min(index, slideCount - 1)));
  }, [slideCount]);

  const scrollToSlide = (index: number) => {
    const slide = scrollRef.current?.querySelector<HTMLElement>(
      `[data-product-slide="${index}"]`
    );
    slide?.scrollIntoView({ behavior: "smooth", inline: "start", block: "nearest" });
    setActiveIndex(index);
  };

  const mobileSlider = isLoading
    ? [...Array(DISPLAY_COUNT)].map((_, i) => (
        <div key={i} data-product-slide={i} className={mobileSlideClass}>
          <ProductCardSkeleton compact />
        </div>
      ))
    : displayProducts.map((product, i) => (
        <div key={product.id} data-product-slide={i} className={mobileSlideClass}>
          <ProductCard product={product} index={i} compact />
        </div>
      ));

  const desktopGrid = isLoading
    ? [...Array(DISPLAY_COUNT)].map((_, i) => <ProductCardSkeleton key={i} compact />)
    : displayProducts.map((product, i) => (
        <ProductCard key={product.id} product={product} index={i} compact />
      ));

  return (
    <section className="w-full overflow-x-hidden">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="mb-5 px-3 text-center sm:px-4 md:mb-6 lg:px-5"
      >
        <h2 className="font-display text-3xl text-foreground md:text-4xl">{title}</h2>
      </motion.div>

      <div className="w-full px-2 sm:px-3 lg:px-4">
        {isLoading || displayProducts.length > 0 ? (
          <>
            <div className="lg:hidden">
              <div
                ref={scrollRef}
                onScroll={updateActiveIndex}
                className="-mx-1 overflow-x-auto pb-1 snap-x snap-mandatory [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden"
              >
                <div className="flex w-max gap-2 px-1">{mobileSlider}</div>
              </div>
              {slideCount > 0 && (
                <div className="mt-3 flex justify-center gap-1.5 px-2">
                  {[...Array(slideCount)].map((_, i) => (
                    <button
                      key={i}
                      type="button"
                      aria-label={`Go to product ${i + 1}`}
                      onClick={() => scrollToSlide(i)}
                      className={`h-[2px] transition-all duration-500 ${
                        i === activeIndex ? "w-8 bg-primary" : "w-4 bg-primary/35"
                      }`}
                    />
                  ))}
                </div>
              )}
            </div>
            <div className="hidden w-full gap-1.5 lg:grid lg:grid-cols-[repeat(5,minmax(0,1fr))]">
              {desktopGrid}
            </div>
          </>
        ) : (
          <p className="py-12 text-center text-sm text-muted-foreground">
            No products in this category yet.
          </p>
        )}
      </div>

      {!isLoading && displayProducts.length > 0 && (
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
