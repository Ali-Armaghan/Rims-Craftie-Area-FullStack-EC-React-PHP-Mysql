import { useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { useNavigate } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowRight, Search, Sparkles, X } from "lucide-react";
import { useProducts } from "@/hooks/useProducts";
import { cn } from "@/lib/utils";

const QUICK_SEARCHES = ["Handbag", "Tote", "Crossbody", "Wallet"];

type NavSearchProps = {
  className?: string;
  iconClassName?: string;
  onNavigate?: () => void;
};

const backdrop = {
  hidden: { opacity: 0 },
  visible: { opacity: 1 },
};

const panel = {
  hidden: { opacity: 0, y: -28, scale: 0.96 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { type: "spring" as const, stiffness: 380, damping: 32 },
  },
  exit: {
    opacity: 0,
    y: -16,
    scale: 0.98,
    transition: { duration: 0.2, ease: "easeIn" as const },
  },
};

const stagger = {
  visible: { transition: { staggerChildren: 0.06, delayChildren: 0.04 } },
};

const fadeUp = {
  hidden: { opacity: 0, y: 10 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.25, ease: "easeOut" as const } },
};

const NavSearch = ({ className, iconClassName, onNavigate }: NavSearchProps) => {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const navigate = useNavigate();
  const inputRef = useRef<HTMLInputElement>(null);
  const { products } = useProducts();

  useEffect(() => {
    if (!open) {
      setQuery("");
      return;
    }
    const timer = window.setTimeout(() => inputRef.current?.focus(), 120);
    return () => window.clearTimeout(timer);
  }, [open]);

  useEffect(() => {
    if (!open) return;

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };

    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", onKeyDown);

    return () => {
      document.body.style.overflow = prevOverflow;
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [open]);

  const suggestions = useMemo(() => {
    const trimmed = query.trim().toLowerCase();
    if (trimmed.length < 2) return [];

    return products
      .filter(
        (p) =>
          p.name.toLowerCase().includes(trimmed) ||
          (p.categories ?? [p.category]).some((category) =>
            category.toLowerCase().includes(trimmed)
          ) ||
          (p.description?.toLowerCase().includes(trimmed) ?? false)
      )
      .slice(0, 5);
  }, [products, query]);

  const close = () => setOpen(false);

  const goToSearch = (term: string) => {
    const trimmed = term.trim();
    if (!trimmed) return;
    close();
    onNavigate?.();
    navigate(`/products?q=${encodeURIComponent(trimmed)}`);
  };

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    goToSearch(query);
  };

  const openProduct = (productId: string) => {
    close();
    onNavigate?.();
    navigate(`/product/${productId}`);
  };

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className={cn(
          "text-foreground/70 transition-colors hover:text-foreground",
          className
        )}
        aria-label="Search products"
      >
        <Search size={20} className={iconClassName} />
      </button>

      {typeof document !== "undefined" &&
        createPortal(
          <AnimatePresence>
            {open && (
              <div className="fixed inset-0 z-[200]" role="dialog" aria-modal="true" aria-label="Search products">
                <motion.button
                  type="button"
                  aria-label="Close search"
                  className="absolute inset-0 bg-foreground/25 backdrop-blur-md"
                  variants={backdrop}
                  initial="hidden"
                  animate="visible"
                  exit="hidden"
                  transition={{ duration: 0.25 }}
                  onClick={close}
                />

                <motion.div
                  className="pointer-events-none absolute inset-x-0 top-0 flex justify-center px-4 pt-[max(1rem,env(safe-area-inset-top))] sm:pt-8"
                  variants={panel}
                  initial="hidden"
                  animate="visible"
                  exit="exit"
                >
                  <motion.div
                    className="pointer-events-auto w-full max-w-xl overflow-hidden rounded-2xl border border-border/60 bg-background shadow-[0_24px_80px_-12px_rgba(47,28,9,0.22)]"
                    variants={stagger}
                    initial="hidden"
                    animate="visible"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <div className="border-b border-border/50 bg-gradient-to-b from-muted/40 to-background px-5 py-4 sm:px-6">
                      <motion.div variants={fadeUp} className="mb-4 flex items-center justify-between gap-3">
                        <div className="flex items-center gap-2">
                          <span className="flex h-9 w-9 items-center justify-center rounded-full bg-primary/10 text-primary">
                            <Sparkles size={16} />
                          </span>
                          <div>
                            <p className="font-display text-lg leading-tight text-foreground">Find something you love</p>
                            <p className="font-body text-xs text-muted-foreground">Search our bags &amp; accessories</p>
                          </div>
                        </div>
                        <button
                          type="button"
                          onClick={close}
                          className="flex h-9 w-9 items-center justify-center rounded-full border border-border/70 text-muted-foreground transition-colors hover:border-primary/30 hover:bg-muted/50 hover:text-foreground"
                          aria-label="Close"
                        >
                          <X size={16} />
                        </button>
                      </motion.div>

                      <motion.form variants={fadeUp} onSubmit={handleSubmit} className="relative">
                        <Search
                          size={18}
                          className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground"
                        />
                        <input
                          ref={inputRef}
                          type="search"
                          value={query}
                          onChange={(e) => setQuery(e.target.value)}
                          placeholder="Try handbag, tote, wallet..."
                          className="w-full rounded-full border border-border/80 bg-background py-3.5 pl-11 pr-28 font-body text-sm text-foreground shadow-sm transition-[border-color,box-shadow] placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/15"
                          aria-label="Search query"
                        />
                        <button
                          type="submit"
                          disabled={!query.trim()}
                          className="absolute right-1.5 top-1/2 flex -translate-y-1/2 items-center gap-1 rounded-full bg-foreground px-4 py-2 font-nav text-[10px] uppercase tracking-wide text-primary-foreground transition-all hover:bg-foreground/90 disabled:cursor-not-allowed disabled:opacity-40"
                        >
                          Search
                          <ArrowRight size={12} />
                        </button>
                      </motion.form>
                    </div>

                    <motion.div variants={fadeUp} className="px-5 py-4 sm:px-6">
                      {query.trim().length < 2 ? (
                        <>
                          <p className="mb-2 font-nav text-[10px] font-bold uppercase tracking-wide text-muted-foreground">
                            Popular searches
                          </p>
                          <div className="flex flex-wrap gap-2">
                            {QUICK_SEARCHES.map((term, index) => (
                              <motion.button
                                key={term}
                                type="button"
                                initial={{ opacity: 0, scale: 0.92 }}
                                animate={{ opacity: 1, scale: 1 }}
                                transition={{ delay: 0.08 + index * 0.05 }}
                                onClick={() => goToSearch(term)}
                                className="rounded-full border border-border/70 bg-muted/30 px-3 py-1.5 font-body text-xs text-foreground transition-colors hover:border-primary/40 hover:bg-primary/5"
                              >
                                {term}
                              </motion.button>
                            ))}
                          </div>
                        </>
                      ) : suggestions.length > 0 ? (
                        <ul className="space-y-1">
                          <AnimatePresence mode="popLayout">
                            {suggestions.map((product, index) => (
                              <motion.li
                                key={product.id}
                                layout
                                initial={{ opacity: 0, x: -8 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: 8 }}
                                transition={{ delay: index * 0.04 }}
                              >
                                <button
                                  type="button"
                                  onClick={() => openProduct(product.id)}
                                  className="flex w-full items-center gap-3 rounded-xl px-2 py-2 text-left transition-colors hover:bg-muted/50"
                                >
                                  <span className="flex h-11 w-11 shrink-0 items-center justify-center overflow-hidden rounded-lg border border-border/60 bg-muted/20">
                                    <img
                                      src={product.image}
                                      alt=""
                                      className="max-h-full max-w-full object-contain p-1"
                                    />
                                  </span>
                                  <span className="min-w-0 flex-1">
                                    <span className="block truncate font-body text-sm font-medium text-foreground">
                                      {product.name}
                                    </span>
                                    <span className="block truncate font-body text-xs text-muted-foreground">
                                      {(product.categories ?? [product.category]).join(', ')} · Rs. {product.price.toLocaleString()}
                                    </span>
                                  </span>
                                  <ArrowRight size={14} className="shrink-0 text-muted-foreground" />
                                </button>
                              </motion.li>
                            ))}
                          </AnimatePresence>
                        </ul>
                      ) : (
                        <motion.p
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          className="py-2 font-body text-sm text-muted-foreground"
                        >
                          No matches yet. Press Search to view all results.
                        </motion.p>
                      )}
                    </motion.div>

                    <motion.div
                      variants={fadeUp}
                      className="border-t border-border/50 bg-muted/20 px-5 py-2.5 sm:px-6"
                    >
                      <p className="font-body text-[11px] text-muted-foreground">
                        <kbd className="rounded border border-border bg-background px-1.5 py-0.5 font-mono text-[10px]">Enter</kbd>{" "}
                        to search ·{" "}
                        <kbd className="rounded border border-border bg-background px-1.5 py-0.5 font-mono text-[10px]">Esc</kbd>{" "}
                        to close
                      </p>
                    </motion.div>
                  </motion.div>
                </motion.div>
              </div>
            )}
          </AnimatePresence>,
          document.body
        )}
    </>
  );
};

export default NavSearch;
