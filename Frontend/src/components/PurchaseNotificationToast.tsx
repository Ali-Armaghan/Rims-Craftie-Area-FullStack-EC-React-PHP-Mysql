import { useCallback, useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import { X } from "lucide-react";
import { useProducts } from "@/hooks/useProducts";
import type { Product } from "@/data/products";

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
  "just 1 min ago",
  "2 min ago",
  "just 2 min ago",
  "a minute ago",
] as const;

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
    }, 6000);
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
      className="pointer-events-none fixed top-24 right-4 z-[100] w-[min(100vw-2rem,22rem)] sm:top-28 sm:right-6"
      aria-live="polite"
    >
      <AnimatePresence mode="wait">
        {notification && (
          <motion.div
            key={notification.id}
            initial={{ opacity: 0, x: 24, y: -8 }}
            animate={{ opacity: 1, x: 0, y: 0 }}
            exit={{ opacity: 0, x: 24, y: -8 }}
            transition={{ duration: 0.35, ease: "easeOut" }}
            className="pointer-events-auto relative overflow-hidden rounded-lg border border-[#E0D4C8] bg-[#F5EBE0] shadow-lg"
          >
            <div className="flex gap-3 p-3">
              <Link
                to={`/product/${notification.product.id}`}
                className="shrink-0 overflow-hidden rounded-md border border-[#E0D4C8] bg-white"
              >
                <img
                  src={notification.product.image}
                  alt={notification.product.name}
                  className="h-14 w-14 object-contain sm:h-16 sm:w-16"
                />
              </Link>
              <div className="min-w-0 flex-1 pr-6">
                <p className="font-body text-xs leading-snug text-foreground sm:text-sm">
                  <span className="font-semibold">{notification.name}</span>{" "}
                  <span className="text-muted-foreground">just bought</span>
                </p>
                <Link
                  to={`/product/${notification.product.id}`}
                  className="mt-0.5 block truncate font-nav text-[11px] font-medium uppercase tracking-wide text-foreground hover:text-primary sm:text-xs"
                >
                  {notification.product.name}
                </Link>
                <p className="mt-1 font-body text-[10px] text-muted-foreground sm:text-xs">
                  from <span className="text-foreground/80">{notification.city}</span>
                  <span className="mx-1 text-border">·</span>
                  <span>{notification.timeAgo}</span>
                </p>
              </div>
              <button
                type="button"
                onClick={dismiss}
                className="absolute right-2 top-2 rounded p-0.5 text-muted-foreground transition-colors hover:text-foreground"
                aria-label="Dismiss notification"
              >
                <X size={14} />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default PurchaseNotificationToast;
