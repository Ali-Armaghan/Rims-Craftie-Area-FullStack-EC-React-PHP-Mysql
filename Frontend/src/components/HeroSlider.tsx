import { useState, useEffect, useCallback } from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, ChevronRight, Sparkles, ArrowRight } from "lucide-react";

interface SlideData {
  image: string;
  badge: string;
  title: string;
  highlight?: string;
  subtitle: string;
  primaryBtn: { text: string; link: string };
  secondaryBtn?: { text: string; link: string };
}

const slides: SlideData[] = [
  {
    image: "/Hero.webp",
    badge: "Bespoke Handcrafted Luxury",
    title: "Handmade Resin Art &",
    highlight: "Bridal Keepsakes",
    subtitle: "Custom resin trays, signature Nikkah booklets, preserved floral memories & personalized gifts.",
    primaryBtn: { text: "Shop Collection", link: "/products" },
    secondaryBtn: { text: "Explore All", link: "/products" },
  },
  {
    image: "/craft/banners/banner_nikkah_collection.jpg",
    badge: "Wedding & Nikkah Stationery",
    title: "Luxury Nikkah Nama &",
    highlight: "Signature Pens",
    subtitle: "Celebrate your sacred moments with elegant velvet certificates and bespoke crystal pens.",
    primaryBtn: { text: "View Nikkah Sets", link: "/products" },
    secondaryBtn: { text: "Custom Orders", link: "/products" },
  },
  {
    image: "/craft/banners/banner_resin_art.jpg",
    badge: "Artisan Home & Event Decor",
    title: "Handmade Resin Platters &",
    highlight: "Vanity Trays",
    subtitle: "Elevate your space with timeless handcrafted resin pieces with gold flakes and crystal gloss finish.",
    primaryBtn: { text: "Discover Trays", link: "/products" },
    secondaryBtn: { text: "Shop Gifts", link: "/products" },
  },
];

const HeroSlider = () => {
  const [current, setCurrent] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  const nextSlide = useCallback(() => {
    setCurrent((prev) => (prev + 1) % slides.length);
  }, []);

  const prevSlide = useCallback(() => {
    setCurrent((prev) => (prev - 1 + slides.length) % slides.length);
  }, []);

  useEffect(() => {
    if (isPaused || slides.length <= 1) return;
    const timer = setInterval(nextSlide, 5500);
    return () => clearInterval(timer);
  }, [isPaused, nextSlide]);

  const activeSlide = slides[current];

  return (
    <section
      className="relative h-[60vh] min-h-[380px] max-h-[500px] w-full overflow-hidden bg-foreground sm:h-[58vh] sm:min-h-[420px] sm:max-h-[560px] md:h-[62vh] md:max-h-[600px] lg:h-[68vh] lg:max-h-[660px] xl:h-[70vh] xl:max-h-[700px]"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      <AnimatePresence mode="wait">
        <motion.div
          key={current}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.8, ease: "easeInOut" }}
          className="absolute inset-0"
        >
          {/* Background Image with subtle zoom effect */}
          <motion.img
            src={activeSlide.image}
            alt={activeSlide.title}
            initial={{ scale: 1.08 }}
            animate={{ scale: 1 }}
            transition={{ duration: 6, ease: "easeOut" }}
            className="h-full w-full object-cover object-center"
          />

          {/* Premium Gradient Overlay */}
          <div className="absolute inset-0 bg-gradient-to-r from-black/85 via-black/50 to-black/25 sm:from-black/80 sm:via-black/45 sm:to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-black/30" />
        </motion.div>
      </AnimatePresence>

      {/* Floating Animated Content */}
      <div className="container relative z-10 flex h-full items-center px-4 sm:px-6 lg:px-8">
        <div className="max-w-xl py-4 sm:max-w-2xl sm:py-6">
          <AnimatePresence mode="wait">
            <motion.div
              key={`content-${current}`}
              initial="hidden"
              animate="visible"
              exit="exit"
              variants={{
                hidden: { opacity: 0 },
                visible: {
                  opacity: 1,
                  transition: { staggerChildren: 0.12, delayChildren: 0.1 },
                },
                exit: { opacity: 0, transition: { duration: 0.3 } },
              }}
              className="space-y-2.5 sm:space-y-3.5"
            >
              {/* Badge */}
              <motion.div
                variants={{
                  hidden: { opacity: 0, y: -12 },
                  visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
                }}
                className="inline-flex items-center gap-1.5 rounded-full border border-gold/40 bg-black/40 px-3 py-1 text-[11px] font-medium tracking-wider uppercase text-gold-light backdrop-blur-md sm:px-3.5 sm:py-1 sm:text-xs"
              >
                <Sparkles className="h-3 w-3 text-gold" />
                <span>{activeSlide.badge}</span>
              </motion.div>

              {/* Title */}
              <motion.h1
                variants={{
                  hidden: { opacity: 0, y: 18 },
                  visible: { opacity: 1, y: 0, transition: { duration: 0.6 } },
                }}
                className="font-display text-2xl font-bold tracking-tight text-white sm:text-3xl md:text-4xl lg:text-5xl leading-tight drop-shadow-md"
              >
                {activeSlide.title} {activeSlide.highlight}
              </motion.h1>

              {/* Subtitle */}
              <motion.p
                variants={{
                  hidden: { opacity: 0, y: 15 },
                  visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
                }}
                className="font-body text-xs text-white/90 sm:text-sm md:text-base max-w-lg leading-relaxed line-clamp-2 sm:line-clamp-3 drop-shadow-sm"
              >
                {activeSlide.subtitle}
              </motion.p>

              {/* Action Buttons */}
              <motion.div
                variants={{
                  hidden: { opacity: 0, y: 15 },
                  visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
                }}
                className="flex flex-wrap items-center gap-2.5 pt-1.5 sm:gap-3 sm:pt-2"
              >
                <Link
                  to={activeSlide.primaryBtn.link}
                  className="group inline-flex items-center gap-1.5 rounded-sm bg-primary px-4 py-2 text-xs font-semibold tracking-wide text-primary-foreground shadow-md transition-all duration-300 hover:bg-primary/90 hover:shadow-lg sm:px-6 sm:py-2.5 sm:text-sm"
                >
                  <span>{activeSlide.primaryBtn.text}</span>
                  <ArrowRight className="h-3.5 w-3.5 transition-transform duration-300 group-hover:translate-x-1" />
                </Link>

                {activeSlide.secondaryBtn && (
                  <Link
                    to={activeSlide.secondaryBtn.link}
                    className="inline-flex items-center rounded-sm border border-white/40 bg-white/10 px-4 py-2 text-xs font-semibold tracking-wide text-white backdrop-blur-md transition-all duration-300 hover:bg-white/25 hover:border-white/70 sm:px-5 sm:py-2.5 sm:text-sm"
                  >
                    {activeSlide.secondaryBtn.text}
                  </Link>
                )}
              </motion.div>
            </motion.div>
          </AnimatePresence>
        </div>
      </div>

      {/* Navigation Arrows (Desktop / Tablet) */}
      {slides.length > 1 && (
        <>
          <button
            type="button"
            onClick={prevSlide}
            aria-label="Previous slide"
            className="absolute left-2 top-1/2 z-20 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full border border-white/20 bg-black/30 text-white/80 backdrop-blur-md transition-all hover:bg-black/60 hover:text-white sm:left-4 sm:h-10 sm:w-10"
          >
            <ChevronLeft className="h-5 w-5" />
          </button>
          <button
            type="button"
            onClick={nextSlide}
            aria-label="Next slide"
            className="absolute right-2 top-1/2 z-20 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full border border-white/20 bg-black/30 text-white/80 backdrop-blur-md transition-all hover:bg-black/60 hover:text-white sm:right-4 sm:h-10 sm:w-10"
          >
            <ChevronRight className="h-5 w-5" />
          </button>
        </>
      )}

      {/* Slide Indicators */}
      {slides.length > 1 && (
        <div className="absolute bottom-3 left-1/2 z-20 flex -translate-x-1/2 items-center gap-2 sm:bottom-5">
          {slides.map((_, i) => (
            <button
              key={i}
              type="button"
              aria-label={`Go to slide ${i + 1}`}
              onClick={() => setCurrent(i)}
              className={`h-1.5 rounded-full transition-all duration-500 ${
                i === current
                  ? "w-8 bg-gold-light"
                  : "w-2 bg-white/40 hover:bg-white/70"
              }`}
            />
          ))}
        </div>
      )}
    </section>
  );
};

export default HeroSlider;
