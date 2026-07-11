import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import HeroSlider from "@/components/HeroSlider";
import HomePromoBanners from "@/components/HomePromoBanners";
import HomeCategoryProductGrid from "@/components/HomeCategoryProductGrid";
import TestimonialSlider from "@/components/TestimonialSlider";
import { useHomeCategorySections } from "@/hooks/useHomeCategorySections";
import { useStoreCategories } from "@/hooks/useStoreCategories";

const categorySlides = [
  { title: "Under 1499", image: "/sliders/1499_c11d8b4e-1884-4246-9895-4d0a5c7b016e-424378_300x300.avif" },
  { title: "Under 1999", image: "/sliders/04-686859_300x300.avif" },
  { title: "Under 2499", image: "/sliders/05-148189_300x300.avif" },
  { title: "Laptop Bags", image: "/sliders/13.1-619880_300x300.jpg" },
  { title: "Shoulder Bags", image: "/sliders/7d58bbc0-6f73-4d0c-9897-dbdec998c397-909777_300x300.avif" },
  { title: "HandBags", image: "/sliders/hand_6180fef1-bc90-403e-ab5e-a4b2de6ad0c8-680402_300x300.avif" },
  { title: "Crossbody", image: "/sliders/SAVE-20211214-065611-444689_300x300.avif" },
  { title: "All Bags", image: "/sliders/WhatsApp_Image_2022-01-03_at_6.33.11_PM-796593_300x300.avif" },
  { title: "Premium Bags", image: "/sliders/WhatsApp_Image_2023-02-02_at_5.36.23_PM-771757_300x300.avif" },
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
      
      <div className="w-full min-w-0 space-y-6 overflow-x-clip pt-10 pb-4 md:space-y-8 md:pt-12 md:pb-6">
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

      <TestimonialSlider />

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
