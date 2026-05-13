import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowRight, Diamond, Shield, Truck, Gift } from "lucide-react";
import HeroSlider from "@/components/HeroSlider";
import ProductCard from "@/components/ProductCard";
import { useFeaturedProducts } from "@/hooks/useFeaturedProducts";
import ProductCardSkeleton from "@/components/skeletons/ProductCardSkeleton";

const features = [
  { icon: Diamond, title: "Ethically Sourced", desc: "Conflict-free gemstones" },
  { icon: Shield, title: "Lifetime Warranty", desc: "Every piece guaranteed" },
  { icon: Truck, title: "Free Shipping", desc: "On orders over $500" },
  { icon: Gift, title: "Luxury Packaging", desc: "Signature gift boxes" },
];

const Index = () => {
  const { products: popular, isLoading } = useFeaturedProducts();

  return (
    <>
      <HeroSlider />

      {/* Features Bar */}
      <section className="border-b border-border">
        <div className="container py-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {features.map((f, i) => (
              <motion.div
                key={f.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="flex items-center gap-3"
              >
                <f.icon size={20} className="text-primary flex-shrink-0" />
                <div>
                  <p className="font-nav text-[10px] tracking-[0.15em] uppercase text-foreground">{f.title}</p>
                  <p className="font-body text-sm text-muted-foreground">{f.desc}</p>
                </div>
              </motion.div>
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
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8">
            {isLoading ? (
              [...Array(4)].map((_, i) => (
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
