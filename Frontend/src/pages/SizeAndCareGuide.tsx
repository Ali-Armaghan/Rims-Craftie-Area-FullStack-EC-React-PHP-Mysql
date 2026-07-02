import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Droplets, Package, Ruler, Sparkles, ShieldCheck } from "lucide-react";

const measurementGuide = [
  {
    label: "Length (L)",
    description: "The measurement across the bottom of the bag from side to side.",
  },
  {
    label: "Height (H)",
    description: "The measurement from the bottom of the bag to the top edge (excluding handles/straps).",
  },
  {
    label: "Width (W)",
    description: "The depth of the bag measured from front to back at the base.",
  },
  {
    label: "Strap Drop",
    description: "The distance from the top of the handle/strap to the top of the bag.",
  },
];

const sizingChart = [
  {
    category: "Mini / Clutch",
    dimensions: '5" – 8" (L) x 4" – 6" (H)',
    usage: "Essentials: Smartphone, keys, lip gloss, and cards.",
  },
  {
    category: "Small / Crossbody",
    dimensions: '8" – 11" (L) x 6" – 9" (H)',
    usage: "Everyday carry: Wallet, phone, sunglasses, and makeup.",
  },
  {
    category: "Medium / Tote",
    dimensions: '11" – 14" (L) x 9" – 12" (H)',
    usage: "Daily essentials: Tablet, diary, water bottle, and wallet.",
  },
  {
    category: "Large / Work Bag",
    dimensions: '14"+ (L) x 12"+ (H)',
    usage: 'Work/Travel: Laptop (up to 15"), folders, books, and daily essentials.',
  },
];

const choosingTips = [
  "Visualize the Scale: If you aren't sure, grab a measuring tape and compare these dimensions to a bag you already own and love.",
  "Check the Product Page: Every product description includes its specific dimensions. If a bag fits a laptop or a specific tablet, it will be noted there.",
  "Measurement Note: Please allow for a 0.5–1 inch variance in measurements, as all our bags are handcrafted with care.",
];

const careSections = [
  {
    icon: Sparkles,
    title: "General Maintenance",
    tips: [
      "Keep it Clean: Wipe the surface of your bag regularly with a soft, dry cloth to remove dust and debris.",
      "Avoid Moisture: If your bag gets wet, wipe it immediately with a soft, lint-free cloth and let it air dry in a cool, shaded area. Never use a hair dryer or direct heat, as this can crack or warp the material.",
      "Storage Matters: When not in use, store your bag in a cool, dry place. Ideally, keep it in a dust bag to protect it from scratches and environmental factors.",
      "Maintain Shape: Stuff your bag with acid-free tissue paper or a soft cloth when storing it to help it maintain its original shape. Avoid using newspapers, as the ink can transfer to the inner lining.",
    ],
  },
  {
    icon: Droplets,
    title: "Handling Stains & Spills",
    tips: [
      "Immediate Action: For minor spills, blot (do not rub) the area immediately with a clean, slightly damp cloth.",
      "Harsh Chemicals: Avoid using alcohol, acetone, oils, or harsh chemical cleaners. These can strip the finish, cause discoloration, and damage the material surface.",
      "Professional Cleaning: For deep stains or complex materials, we recommend seeking a professional leather or handbag cleaning service.",
    ],
  },
  {
    icon: ShieldCheck,
    title: "Hardware & Straps",
    tips: [
      "Avoid Overloading: While your bag is built for daily use, please be mindful of the weight you carry. Overstuffing can put unnecessary stress on the straps, handles, and zippers.",
      "Gentle Handling: Keep perfumes, lotions, and makeup products sealed tightly. Direct contact with these substances can cause permanent staining or hardware tarnishing.",
    ],
  },
];

const SizeAndCareGuide = () => {
  return (
    <>
      <section className="border-b border-border bg-gradient-to-b from-muted/40 to-background py-16 md:py-20">
        <div className="container">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mx-auto max-w-3xl text-center"
          >
            <p className="text-label mb-3">Product guide</p>
            <h1 className="mb-5 font-display text-4xl text-foreground md:text-5xl">
              Size &amp; Care Guide
            </h1>
            <p className="font-body text-base leading-relaxed text-muted-foreground md:text-lg">
              At Ateeqo, we want to make sure you choose the bag that fits your lifestyle
              perfectly. Use this guide to understand our sizing and keep your bag looking its
              best for years to come.
            </p>
          </motion.div>
        </div>
      </section>

      <section className="container py-14 md:py-16">
        <div className="mx-auto max-w-4xl">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-10 flex flex-wrap justify-center gap-2"
          >
            {[
              { label: "How We Measure", href: "#measure" },
              { label: "Sizing Chart", href: "#sizing" },
              { label: "Choosing Tips", href: "#tips" },
              { label: "Care Guide", href: "#care" },
            ].map((item) => (
              <a
                key={item.href}
                href={item.href}
                className="rounded-full border border-border px-4 py-1.5 font-nav text-[10px] uppercase tracking-wide text-foreground/80 transition-colors hover:border-primary hover:text-primary"
              >
                {item.label}
              </a>
            ))}
          </motion.div>

          <div id="measure" className="scroll-mt-28 mb-14">
            <div className="mb-6 flex items-center gap-3">
              <Ruler className="text-primary" size={22} strokeWidth={1.75} />
              <h2 className="font-display text-3xl text-foreground">How We Measure</h2>
            </div>
            <p className="mb-6 font-body text-sm leading-relaxed text-muted-foreground md:text-base">
              To ensure accuracy, we measure our bags based on the following dimensions:
            </p>
            <div className="grid gap-4 sm:grid-cols-2">
              {measurementGuide.map((item, index) => (
                <motion.div
                  key={item.label}
                  initial={{ opacity: 0, y: 12 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.06 }}
                  className="rounded-xl border border-border bg-background p-5"
                >
                  <h3 className="mb-2 font-nav text-xs font-bold uppercase tracking-wide text-primary">
                    {item.label}
                  </h3>
                  <p className="font-body text-sm leading-relaxed text-muted-foreground">
                    {item.description}
                  </p>
                </motion.div>
              ))}
            </div>
          </div>

          <div id="sizing" className="scroll-mt-28 mb-14">
            <h2 className="mb-6 font-display text-3xl text-foreground">Ateeqo Sizing Chart</h2>
            <div className="overflow-hidden rounded-2xl border border-border">
              <div className="hidden md:grid md:grid-cols-[1.1fr_1fr_1.4fr] bg-secondary/50">
                {["Bag Size Category", "Dimensions (Approx.)", "Capacity & Usage"].map((h) => (
                  <div
                    key={h}
                    className="px-5 py-4 font-nav text-[11px] font-bold uppercase tracking-wide text-foreground"
                  >
                    {h}
                  </div>
                ))}
              </div>
              {sizingChart.map((row, index) => (
                <div
                  key={row.category}
                  className={`border-t border-border/70 p-5 md:grid md:grid-cols-[1.1fr_1fr_1.4fr] md:gap-4 md:p-0 ${
                    index % 2 === 0 ? "bg-background" : "bg-secondary/15"
                  }`}
                >
                  <div className="md:px-5 md:py-4">
                    <p className="mb-1 font-nav text-[10px] uppercase tracking-wide text-muted-foreground md:hidden">
                      Category
                    </p>
                    <p className="font-display text-base text-foreground">{row.category}</p>
                  </div>
                  <div className="mt-3 md:mt-0 md:px-5 md:py-4">
                    <p className="mb-1 font-nav text-[10px] uppercase tracking-wide text-muted-foreground md:hidden">
                      Dimensions
                    </p>
                    <p className="font-body text-sm text-foreground">{row.dimensions}</p>
                  </div>
                  <div className="mt-3 md:mt-0 md:px-5 md:py-4">
                    <p className="mb-1 font-nav text-[10px] uppercase tracking-wide text-muted-foreground md:hidden">
                      Capacity
                    </p>
                    <p className="font-body text-sm leading-relaxed text-muted-foreground">
                      {row.usage}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div id="tips" className="scroll-mt-28">
            <h2 className="mb-6 font-display text-3xl text-foreground">Quick Tips for Choosing</h2>
            <ul className="space-y-4 rounded-2xl border border-primary/20 bg-primary/5 p-6 md:p-8">
              {choosingTips.map((tip) => (
                <li
                  key={tip}
                  className="font-body text-sm leading-relaxed text-muted-foreground before:mr-2 before:text-primary before:content-['•']"
                >
                  {tip}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      <section id="care" className="scroll-mt-28 border-t border-border bg-muted/15 py-14 md:py-16">
        <div className="container">
          <div className="mx-auto max-w-4xl">
            <div className="mb-8 flex items-center gap-3">
              <Package className="text-primary" size={22} strokeWidth={1.75} />
              <h2 className="font-display text-3xl text-foreground">Product Care Guide</h2>
            </div>
            <p className="mb-10 font-body text-sm leading-relaxed text-muted-foreground md:text-base">
              To keep your Ateeqo bag looking its best for years to come, please follow these
              care and maintenance tips. Proper care ensures the longevity of the materials,
              hardware, and structural integrity of your accessory.
            </p>
            <div className="space-y-6">
              {careSections.map((section, index) => (
                <motion.div
                  key={section.title}
                  initial={{ opacity: 0, y: 16 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.06 }}
                  className="rounded-2xl border border-border bg-background p-6 md:p-8"
                >
                  <div className="mb-4 flex items-center gap-3">
                    <section.icon className="text-primary" size={20} strokeWidth={1.75} />
                    <h3 className="font-display text-xl text-foreground">{section.title}</h3>
                  </div>
                  <ul className="space-y-3">
                    {section.tips.map((tip) => (
                      <li
                        key={tip}
                        className="font-body text-sm leading-relaxed text-muted-foreground before:mr-2 before:text-primary before:content-['•']"
                      >
                        {tip}
                      </li>
                    ))}
                  </ul>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="container pb-16 pt-4">
        <div className="mx-auto max-w-3xl rounded-2xl border border-primary/20 bg-primary/5 px-6 py-8 text-center md:px-10">
          <p className="font-body text-sm text-muted-foreground md:text-base">
            Need help choosing the right size? Browse our collection or get in touch.
          </p>
          <div className="mt-4 flex flex-wrap items-center justify-center gap-4">
            <Link
              to="/products"
              className="font-nav text-xs uppercase tracking-wide text-primary hover:underline"
            >
              Shop collections
            </Link>
            <Link
              to="/contact"
              className="font-nav text-xs uppercase tracking-wide text-primary hover:underline"
            >
              Contact us
            </Link>
          </div>
        </div>
      </section>
    </>
  );
};

export default SizeAndCareGuide;
