import { useCallback, useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import { CheckCircle2, X } from "lucide-react";
import { useProducts } from "@/hooks/useProducts";
import type { Product } from "@/data/products";
import { getProductUrl } from "@/lib/product-url";

const PAKISTANI_NAMES = [
  "Fatima",
  "Ayesha",
  "Zainab",
  "Maryam",
  "Hira",
  "Sana",
  "Amna",
  "Khadija",
  "Noor",
  "Hafsa",
  "Areeba",
  "Mahnoor",
  "Iqra",
  "Rabia",
  "Sadia",
  "Nida",
  "Bushra",
  "Saima",
  "Laiba",
  "Mariam",
] as const;

const PAKISTANI_CITIES = [
  "Karachi",
  "Lahore",
  "Islamabad",
  "Rawalpindi",
  "Faisalabad",
  "Multan",
  "Peshawar",
  "Quetta",
  "Sialkot",
  "Gujranwala",
  "Hyderabad",
  "Abbottabad",
  "Sukkur",
  "Bahawalpur",
  "Mardan",
  "Gujrat",
  "Mirpur",
  "Sargodha",
] as const;

const TIME_AGO_PHRASES = [
  "just now",
  "a few seconds ago",
  "30 seconds ago",
  "1 min ago",
  "2 min ago",
  "a minute ago",
] as const;

const DISMISS_MS = 6000;

type Notification = {
  id: number;
  name: string;
  city: string;
  timeAgo: string;
  product: Product;
};

function pickRandom<T>(arr: readonly T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

function buildNotification(products: Product[]): Notification | null {
  if (products.length === 0) return null;
  return {
    id: Date.now() + Math.random(),
    name: pickRandom(PAKISTANI_NAMES),
    city: pickRandom(PAKISTANI_CITIES),
    timeAgo: pickRandom(TIME_AGO_PHRASES),
    product: pickRandom(products),
  };
}

function randomIntervalMs() {
  return 22000 + Math.floor(Math.random() * 18000);
}

function getInitial(name: string) {
  return name.charAt(0).toUpperCase();
}

const PurchaseNotificationToast = () => {
  const { products, isLoading } = useProducts();
  const [notification, setNotification] = useState<Notification | null>(null);
  const dismissTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const scheduleTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const clearDismissTimer = useCallback(() => {
    if (dismissTimerRef.current) {
      clearTimeout(dismissTimerRef.current);
      dismissTimerRef.current = null;
    }
  }, []);

  const dismiss = useCallback(() => {
    clearDismissTimer();
    setNotification(null);
  }, [clearDismissTimer]);

  const showNext = useCallback(() => {
    const next = buildNotification(products);
    if (!next) return;
    setNotification(next);
    clearDismissTimer();
    dismissTimerRef.current = setTimeout(() => {
      setNotification(null);
    }, DISMISS_MS);
  }, [products, clearDismissTimer]);

  useEffect(() => {
    if (isLoading || products.length === 0) return;

    const schedule = () => {
      scheduleTimerRef.current = setTimeout(() => {
        showNext();
        schedule();
      }, randomIntervalMs());
    };

    const initialDelay = setTimeout(() => {
      showNext();
      schedule();
    }, 10000);

    return () => {
      clearTimeout(initialDelay);
      if (scheduleTimerRef.current) clearTimeout(scheduleTimerRef.current);
      clearDismissTimer();
    };
  }, [isLoading, products, showNext, clearDismissTimer]);

  return (
    <div
      className="pointer-events-none fixed top-24 right-3 z-[100] w-[min(calc(100vw-1.5rem),16.75rem)] sm:top-28 sm:right-5"
      aria-live="polite"
    >
      <AnimatePresence mode="wait">
        {notification && (
          <motion.div
            key={notification.id}
            initial={{ opacity: 0, x: 20, y: 6 }}
            animate={{ opacity: 1, x: 0, y: 0 }}
            exit={{ opacity: 0, x: 20, y: 6, scale: 0.98 }}
            transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
            className="purchase-toast pointer-events-auto overflow-hidden rounded-xl bg-background"
          >
            <div className="flex bg-foreground text-primary-foreground">
              <div className="flex min-w-0 flex-1 items-center gap-2 px-2.5 py-1.5">
                <span className="relative flex h-1.5 w-1.5 shrink-0">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-50" />
                  <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-emerald-400" />
                </span>
                <span className="truncate font-nav text-[9px] font-semibold uppercase tracking-wide">
                  Someone just ordered
                </span>
              </div>
              <button
                type="button"
                onClick={dismiss}
                className="purchase-toast__close flex w-8 shrink-0 items-center justify-center text-white transition-all"
                aria-label="Dismiss notification"
              >
                <X size={14} strokeWidth={2.5} />
              </button>
            </div>

            <Link
              to={getProductUrl(notification.product)}
              className="group block p-2.5 transition-colors hover:bg-secondary/30"
            >
              <div className="mb-2 flex items-center gap-2">
                <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-primary/10 font-nav text-[11px] font-bold text-primary">
                  {getInitial(notification.name)}
                </span>
                <div className="min-w-0 flex-1">
                  <p className="truncate font-body text-[11px] font-semibold leading-none text-foreground">
                    {notification.name}
                  </p>
                  <p className="mt-0.5 truncate font-body text-[9px] text-muted-foreground">
                    {notification.city} · {notification.timeAgo}
                  </p>
                </div>
                <CheckCircle2
                  size={13}
                  className="shrink-0 text-emerald-500/90"
                  strokeWidth={2}
                  aria-hidden
                />
              </div>

              <div className="flex items-center gap-2.5 rounded-lg border border-border/60 bg-secondary/20 p-1.5 transition-colors group-hover:border-primary/20 group-hover:bg-secondary/35">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center overflow-hidden rounded-md bg-background p-1">
                  <img
                    src={notification.product.image}
                    alt={notification.product.name}
                    className="max-h-full max-w-full object-contain"
                  />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate font-display text-xs font-medium leading-tight text-foreground group-hover:text-primary">
                    {notification.product.name}
                  </p>
                  <div className="mt-1 flex flex-wrap items-baseline gap-x-1.5">
                    <span className="font-body text-[11px] font-bold text-foreground">
                      Rs. {notification.product.price.toLocaleString()}
                    </span>
                    {notification.product.originalPrice &&
                      notification.product.originalPrice > notification.product.price && (
                        <span className="font-body text-[9px] text-destructive/90 line-through">
                          Rs. {notification.product.originalPrice.toLocaleString()}
                        </span>
                      )}
                  </div>
                </div>
              </div>
            </Link>

            <div className="h-[2px] w-full overflow-hidden bg-border/40">
              <motion.div
                key={`progress-${notification.id}`}
                className="purchase-toast__progress h-full origin-left"
                initial={{ scaleX: 1 }}
                animate={{ scaleX: 0 }}
                transition={{ duration: DISMISS_MS / 1000, ease: "linear" }}
              />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default PurchaseNotificationToast;
