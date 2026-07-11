import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

const testimonials = [
  {
    quote:
      "Bohot hi khubsurat bag hai, bilkul waisa jaisa picture mein tha. Quality zabardast hai aur roz office mein use karti hoon.",
    name: "Ayesha Khan",
    city: "Lahore",
  },
  {
    quote:
      "Delivery time pe mili aur packing bhi bohot achi thi. Finish premium lagta hai . friends ne bhi poocha kahan se liya hai.",
    name: "Fatima Raza",
    city: "Karachi",
  },
  {
    quote:
      "Pehli dafa online order kiya tha, thora doubt tha lekin Ateeqo ne impress kar diya. Bag durable hai aur style bhi unique hai.",
    name: "Hira Malik",
    city: "Islamabad",
  },
  {
    quote:
      "Meri wife ko gift kiya tha, unhe bohot pasand aaya. Stitching neat hai aur color bilkul same as shown , 10/10 experience.",
    name: "Ahmed Shah",
    city: "Multan",
  },
  {
    quote:
      "Price ke hisaab se quality outstanding hai. WhatsApp pe response fast mila, shopping experience smooth aur hassle-free raha.",
    name: "Zainab Ali",
    city: "Faisalabad",
  },
];

const TestimonialSlider = () => {
  const [current, setCurrent] = useState(0);

  useEffect(() => {
    const timer = setInterval(
      () => setCurrent((prev) => (prev + 1) % testimonials.length),
      5000
    );
    return () => clearInterval(timer);
  }, []);

  const active = testimonials[current];

  return (
    <section className="py-24">
      <div className="container max-w-3xl text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <p className="text-label mb-8">What our customers say</p>

          <div className="relative min-h-[220px] sm:min-h-[200px]">
            <AnimatePresence mode="wait">
              <motion.div
                key={current}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -16 }}
                transition={{ duration: 0.45, ease: "easeInOut" }}
              >
                <blockquote className="mb-8 font-display text-2xl leading-relaxed text-foreground md:text-3xl">
                  &ldquo;{active.quote}&rdquo;
                </blockquote>
                <p className="font-nav text-xs uppercase tracking-wide text-muted-foreground">
                  — {active.name}, {active.city}
                </p>
              </motion.div>
            </AnimatePresence>
          </div>

          <div className="mt-10 flex justify-center gap-2">
            {testimonials.map((_, i) => (
              <button
                key={i}
                type="button"
                aria-label={`Go to review ${i + 1}`}
                onClick={() => setCurrent(i)}
                className={`h-[2px] transition-all duration-500 ${
                  i === current ? "w-10 bg-primary" : "w-5 bg-primary/35"
                }`}
              />
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default TestimonialSlider;
