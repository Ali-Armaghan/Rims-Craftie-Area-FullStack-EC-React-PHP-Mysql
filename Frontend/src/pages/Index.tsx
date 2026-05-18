import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import HeroSlider from "@/components/HeroSlider";
import HomePromoBanners from "@/components/HomePromoBanners";
import HomeCategoryProductGrid from "@/components/HomeCategoryProductGrid";
import { useHomeCategorySections } from "@/hooks/useHomeCategorySections";
import { useStoreCategories } from "@/hooks/useStoreCategories";
import hero1 from "@/assets/hero1.png";
import hero2 from "@/assets/hero2.png";
import hero3 from "@/assets/hero3.png";
import product1 from "@/assets/product1.png";
import product2 from "@/assets/product2.png";
import product3 from "@/assets/product3.png";
import product4 from "@/assets/product4.png";
import product5 from "@/assets/product5.png";

const categorySlides = [
  { title: "Under 1499", image: product1 },
  { title: "Laptop Bags", image: hero1 },
  { title: "Crossbody", image: product2 },
  { title: "Shoulder Bags", image: product3 },
  { title: "HandBags", image: hero2 },
  { title: "All Bags", image: product4 },
  { title: "Premium Bags", image: hero3 },
  { title: "Under 2499", image: product5 },
];

const loopingCategorySlides = [...categorySlides, ...categorySlides, ...categorySlides];

const Index = () => {
  const { sections: homeSections, isLoading: homeSectionsLoading } = useHomeCategorySections();
  const { categories: shopCategories, isLoading: shopCategoriesLoading } = useStoreCategories(4);

  return (
    <>
      <HeroSlider />

      

      {/* Category Slider */}
      <section className="overflow-x-hidden border-b border-border bg-background">
        <div className="overflow-hidden py-6">
          <div className="category-marquee flex w-max items-start gap-6 md:gap-8">
            {loopingCategorySlides.map((category, i) => (
              <Link
                key={`${category.title}-${i}`}
                to="/products"
                className="flex w-24 shrink-0 flex-col items-center text-center sm:w-28 md:w-32"
              >
                <div className="h-20 w-20 overflow-hidden rounded-full bg-secondary sm:h-24 sm:w-24 md:h-28 md:w-28">
                  <img
                    src={category.image}
                    alt={category.title}
                    className="h-full w-full object-cover"
                  />
                </div>
                <span className="mt-3 font-body text-sm font-medium text-foreground">
                  {category.title}
                </span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <HomePromoBanners />
      
      <div className="w-full space-y-6 overflow-x-hidden pt-10 pb-4 md:space-y-8 md:pt-12 md:pb-6">
        {homeSectionsLoading ? (
          <HomeCategoryProductGrid title="Loading..." categoryName="" products={[]} isLoading />
        ) : (
          homeSections.map((section) => (
            <HomeCategoryProductGrid
              key={section.id}
              title={section.name}
              categoryName={section.name}
              products={section.products}
            />
          ))
        )}
      </div>

      {/* Categories Banner */}
      <section className="py-20 bg-secondary/50">
        <div className="container">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-14"
          >
            <p className="text-label mb-3">Explore</p>
            <h2 className="font-display text-3xl md:text-4xl text-foreground">Shop by Category</h2>
          </motion.div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {shopCategoriesLoading ? (
              [...Array(4)].map((_, i) => (
                <div
                  key={`skeleton-${i}`}
                  className="h-32 animate-pulse rounded-sm border border-border bg-background"
                />
              ))
            ) : shopCategories.length > 0 ? (
              shopCategories.map((cat, i) => (
                <motion.div
                  key={cat.id}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1 }}
                >
                  <Link
                    to="/products"
                    state={{ category: cat.name }}
                    className="group block border border-border bg-background p-10 text-center transition-all duration-500 hover:border-primary hover:luxury-shadow"
                  >
                    <h3 className="font-display text-xl text-foreground transition-colors group-hover:text-primary">
                      {cat.name}
                    </h3>
                    <p className="mt-1 font-body text-sm text-muted-foreground">Discover →</p>
                  </Link>
                </motion.div>
              ))
            ) : (
              <p className="col-span-full py-8 text-center text-sm text-muted-foreground">
                No categories found. Add categories in admin panel.
              </p>
            )}
          </div>
        </div>
      </section>

      {/* Testimonial */}
      <section className="py-24">
        <div className="container max-w-3xl text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <p className="text-label mb-8">What our customers say</p>
            <blockquote className="font-display text-2xl md:text-3xl text-foreground leading-relaxed mb-8">
              &ldquo;Beautiful bag, exactly as shown. The leather feels premium and it goes with everything in my wardrobe.&rdquo;
            </blockquote>
            <p className="font-nav text-xs tracking-wide uppercase text-muted-foreground">— Victoria S., London</p>
          </motion.div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 bg-foreground">
        <div className="container text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <p className="text-label text-gold-light mb-4">Gift-ready packaging</p>
            <h2 className="font-display text-3xl md:text-4xl text-primary-foreground mb-6">
              Carry Style Every Day
            </h2>
            <p className="font-body text-base md:text-lg text-primary-foreground/75 max-w-lg mx-auto mb-8">
              Thoughtful details, everyday practicality, and finishes made to last season after season.
            </p>
            <Link
              to="/products"
              className="inline-block border border-primary-foreground/40 text-primary-foreground font-nav text-xs tracking-wide uppercase px-10 py-4 hover:bg-primary-foreground hover:text-foreground transition-all duration-500"
            >
              Shop Gift Guide
            </Link>
          </motion.div>
        </div>
      </section>
    </>
  );
};

export default Index;
