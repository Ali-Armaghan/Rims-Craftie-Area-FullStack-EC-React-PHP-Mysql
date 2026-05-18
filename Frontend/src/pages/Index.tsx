import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import HeroSlider from "@/components/HeroSlider";
import ProductCard from "@/components/ProductCard";
import { useFeaturedProducts } from "@/hooks/useFeaturedProducts";
import ProductCardSkeleton from "@/components/skeletons/ProductCardSkeleton";
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
  const { products: popular, isLoading } = useFeaturedProducts();

  return (
    <>
      <HeroSlider />

      {/* Category Slider */}
      <section className="border-b border-border bg-background">
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
                <span className="mt-3 font-nav text-xs text-foreground">
                  {category.title}
                </span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Popular Products */}
      <section className="py-20">
        <div className="container">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-14"
          >
            <p className="font-nav text-[10px] tracking-[0.4em] uppercase text-primary mb-3">Curated for You</p>
            <h2 className="font-display text-3xl md:text-4xl text-foreground">Popular Pieces</h2>
          </motion.div>
          <div className="grid grid-cols-2 lg:grid-cols-5 gap-4 md:gap-6">
            {isLoading ? (
              [...Array(5)].map((_, i) => (
                <ProductCardSkeleton key={i} />
              ))
            ) : (
              popular.map((p, i) => (
                <ProductCard key={p.id} product={p} index={i} />
              ))
            )}
          </div>
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="text-center mt-12"
          >
            <Link
              to="/products"
              className="inline-flex items-center gap-2 font-nav text-xs tracking-[0.2em] uppercase text-foreground border-b border-foreground pb-1 hover:text-primary hover:border-primary transition-colors"
            >
              View All Collections <ArrowRight size={14} />
            </Link>
          </motion.div>
        </div>
      </section>

      {/* Categories Banner */}
      <section className="py-20 bg-secondary/50">
        <div className="container">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-14"
          >
            <p className="font-nav text-[10px] tracking-[0.4em] uppercase text-primary mb-3">Explore</p>
            <h2 className="font-display text-3xl md:text-4xl text-foreground">Shop by Category</h2>
          </motion.div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {["Rings", "Necklaces", "Earrings", "Bracelets"].map((cat, i) => (
              <motion.div
                key={cat}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
              >
                <Link
                  to="/products"
                  className="block p-10 text-center border border-border bg-background hover:border-primary hover:luxury-shadow transition-all duration-500 group"
                >
                  <h3 className="font-display text-xl text-foreground group-hover:text-primary transition-colors">{cat}</h3>
                  <p className="font-body text-sm text-muted-foreground mt-1">Discover →</p>
                </Link>
              </motion.div>
            ))}
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
            <p className="font-nav text-[10px] tracking-[0.4em] uppercase text-primary mb-8">Testimonials</p>
            <blockquote className="font-display text-2xl md:text-3xl text-foreground italic leading-relaxed mb-8">
              "The Éternité ring exceeded every expectation. The craftsmanship is extraordinary — a true heirloom piece that will be cherished for generations."
            </blockquote>
            <p className="font-nav text-xs tracking-[0.2em] uppercase text-muted-foreground">— Victoria S., London</p>
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
            <p className="font-nav text-[10px] tracking-[0.4em] uppercase text-gold-light mb-4">The Art of Gifting</p>
            <h2 className="font-display text-3xl md:text-4xl text-primary-foreground mb-6">
              Make Every Moment Precious
            </h2>
            <p className="font-body text-lg text-primary-foreground/60 max-w-lg mx-auto mb-8">
              Each piece arrives in our signature gift box, ready to create unforgettable memories.
            </p>
            <Link
              to="/products"
              className="inline-block border border-primary-foreground/40 text-primary-foreground font-nav text-xs tracking-[0.3em] uppercase px-10 py-4 hover:bg-primary-foreground hover:text-foreground transition-all duration-500"
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
