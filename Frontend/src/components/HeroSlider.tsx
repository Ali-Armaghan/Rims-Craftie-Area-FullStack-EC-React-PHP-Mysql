import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";

const slides = [
  {
    image: "/5_0c8c2112-0b85-42c8-813f-2383eb7b4a38.webp",
    alt: "Ateeqo banner",
    link: "/products",
  },
  {
    image: "/3_1d5c15e7-a904-48fc-845a-bf2b67e05724.webp",
    alt: "Ateeqo collection banner",
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
    <section className="relative h-[38vh] min-h-[165px] max-h-[220px] w-full overflow-hidden sm:h-[48vh] sm:max-h-none sm:min-h-[200px] md:h-[62vh] lg:h-[80vh]">
      <AnimatePresence mode="wait">
        <motion.div
          key={current}
          initial={{ opacity: 0, scale: 1.05 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 1.2, ease: "easeInOut" }}
          className="absolute inset-0"
        >
          <Link to={slides[current].link} className="block h-full w-full">
            <img
              src={slides[current].image}
              alt={slides[current].alt}
              className="absolute left-1/2 top-1/2 h-full w-auto max-w-none -translate-x-1/2 -translate-y-1/2 sm:left-0 sm:top-0 sm:h-full sm:w-full sm:translate-x-0 sm:translate-y-0 sm:object-cover sm:object-center"
            />
          </Link>
        </motion.div>
      </AnimatePresence>

      <div className="absolute bottom-3 left-1/2 z-10 flex -translate-x-1/2 gap-2 sm:bottom-6 md:bottom-8 md:gap-3">
        {slides.map((_, i) => (
          <button
            key={i}
            type="button"
            aria-label={`Go to slide ${i + 1}`}
            onClick={() => setCurrent(i)}
            className={`h-[2px] transition-all duration-500 ${
              i === current ? "w-10 bg-foreground" : "w-5 bg-foreground/40"
            }`}
          />
        ))}
      </div>
    </section>
  );
};

export default HeroSlider;
