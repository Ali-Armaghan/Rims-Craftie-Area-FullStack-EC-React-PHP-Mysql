import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import hero1 from "@/assets/hero1.png";
import hero2 from "@/assets/hero2.png";
import hero3 from "@/assets/hero3.png";

const slides = [
  {
    image: hero1,
    subtitle: "New season 2026",
    title: "Everyday\nHandbags",
    cta: "Shop now",
    link: "/products",
  },
  {
    image: hero2,
    subtitle: "Crossbody & shoulder",
    title: "Style That\nMoves With You",
    cta: "View bags",
    link: "/products",
  },
  {
    image: hero3,
    subtitle: "Finishing touches",
    title: "Accessories\nYou'll Love",
    cta: "Explore all",
    link: "/products",
  },
];

const HeroSlider = () => {
  const [current, setCurrent] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => setCurrent((p) => (p + 1) % slides.length), 6000);
    return () => clearInterval(timer);
  }, []);

  return (
    <section className="relative h-[85vh] overflow-hidden">
      <AnimatePresence mode="wait">
        <motion.div
          key={current}
          initial={{ opacity: 0, scale: 1.1 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 1.2, ease: "easeInOut" }}
          className="absolute inset-0"
        >
          <img
            src={slides[current].image}
            alt={slides[current].title}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-foreground/50 via-foreground/20 to-transparent" />
        </motion.div>
      </AnimatePresence>

      {/* Content */}
      <div className="relative z-10 container h-full flex items-center">
        <AnimatePresence mode="wait">
          <motion.div
            key={current}
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.8, delay: 0.3 }}
            className="max-w-xl"
          >
            <p className="font-body text-sm font-medium text-primary-foreground/90 mb-4">
              {slides[current].subtitle}
            </p>
            <h2 className="font-display text-4xl md:text-6xl font-semibold text-primary-foreground leading-[1.15] mb-8 whitespace-pre-line">
              {slides[current].title}
            </h2>
            <Link
              to={slides[current].link}
              className="inline-block border border-primary-foreground/60 text-primary-foreground font-nav text-sm font-medium tracking-wide px-8 py-3 hover:bg-primary-foreground hover:text-foreground transition-all duration-500"
            >
              {slides[current].cta}
            </Link>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Dots */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-10 flex gap-3">
        {slides.map((_, i) => (
          <button
            key={i}
            onClick={() => setCurrent(i)}
            className={`h-[2px] transition-all duration-500 ${
              i === current ? "w-10 bg-primary-foreground" : "w-5 bg-primary-foreground/40"
            }`}
          />
        ))}
      </div>
    </section>
  );
};

export default HeroSlider;
