import {
  createContext,
  useCallback,
  useContext,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown } from "lucide-react";
import { useMegaMenuCategories } from "@/hooks/useMegaMenuCategories";
import { cn } from "@/lib/utils";

type CollectionsMenuContextValue = {
  open: boolean;
  setOpen: (open: boolean) => void;
  scheduleClose: () => void;
  cancelClose: () => void;
};

const CollectionsMenuContext = createContext<CollectionsMenuContextValue | null>(null);

function useCollectionsMenu() {
  const ctx = useContext(CollectionsMenuContext);
  if (!ctx) {
    throw new Error("Collections menu components must be used within CollectionsMegaMenuRoot");
  }
  return ctx;
}

export function CollectionsMegaMenuRoot({ children }: { children: ReactNode }) {
  const [open, setOpen] = useState(false);
  const closeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const cancelClose = useCallback(() => {
    if (closeTimer.current) {
      clearTimeout(closeTimer.current);
      closeTimer.current = null;
    }
  }, []);

  const scheduleClose = useCallback(() => {
    cancelClose();
    closeTimer.current = setTimeout(() => setOpen(false), 120);
  }, [cancelClose]);

  return (
    <CollectionsMenuContext.Provider
      value={{ open, setOpen, scheduleClose, cancelClose }}
    >
      {children}
    </CollectionsMenuContext.Provider>
  );
}

export function CollectionsNavTrigger() {
  const { open, setOpen, scheduleClose, cancelClose } = useCollectionsMenu();

  return (
    <div
      className="relative hidden lg:block"
      onMouseEnter={() => {
        cancelClose();
        setOpen(true);
      }}
      onMouseLeave={scheduleClose}
    >
      <button
        type="button"
        className={cn(
          "nav-link inline-flex items-center gap-1 border-0 bg-transparent p-0 text-foreground/80 hover:text-foreground",
          open && "text-foreground"
        )}
        aria-expanded={open}
        aria-haspopup="true"
      >
        Collections
        <ChevronDown
          size={13}
          className={cn("opacity-60 transition-transform duration-200", open && "rotate-180")}
        />
      </button>
    </div>
  );
}

export function CollectionsMegaMenuPanel() {
  const { open, setOpen, scheduleClose, cancelClose } = useCollectionsMenu();
  const { categories, isLoading } = useMegaMenuCategories();

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.15 }}
          className="absolute left-0 right-0 top-full z-50 hidden border-b border-border bg-background lg:block"
          onMouseEnter={() => {
            cancelClose();
            setOpen(true);
          }}
          onMouseLeave={scheduleClose}
        >
          <div className="container py-5">
            <div className="mb-4 flex items-center justify-between gap-4">
              <p className="font-nav text-xs uppercase tracking-wide text-muted-foreground">
                Categories
              </p>
              <Link
                to="/products"
                onClick={() => setOpen(false)}
                className="font-body text-sm text-foreground hover:underline underline-offset-4"
              >
                View all
              </Link>
            </div>

            {isLoading ? (
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 md:grid-cols-6">
                {[...Array(6)].map((_, i) => (
                  <div key={`sk-${i}`} className="h-24 animate-pulse bg-secondary/50" />
                ))}
              </div>
            ) : categories.length > 0 ? (
              <div className="grid grid-cols-2 gap-x-4 gap-y-3 sm:grid-cols-4 md:grid-cols-6">
                {categories.map((cat) => (
                  <Link
                    key={cat.id}
                    to="/products"
                    state={{ category: cat.name }}
                    onClick={() => setOpen(false)}
                    className="group flex flex-col gap-2"
                  >
                    <div className="flex aspect-square items-center justify-center overflow-hidden bg-secondary/50">
                      {cat.image ? (
                        <img
                          src={cat.image}
                          alt={cat.name}
                          className="h-full w-full object-cover transition-opacity duration-200 group-hover:opacity-90"
                        />
                      ) : (
                        <span className="font-display text-lg text-muted-foreground/50">
                          {cat.name.charAt(0)}
                        </span>
                      )}
                    </div>
                    <span className="font-body text-sm text-foreground/90 group-hover:text-foreground">
                      {cat.name}
                    </span>
                  </Link>
                ))}
              </div>
            ) : (
              <p className="font-body text-sm text-muted-foreground">No categories available.</p>
            )}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

export function CollectionsMobileLinks({ onNavigate }: { onNavigate?: () => void }) {
  const { categories, isLoading } = useMegaMenuCategories();
  const [expanded, setExpanded] = useState(false);

  return (
    <div>
      <button
        type="button"
        onClick={() => setExpanded((v) => !v)}
        className="flex w-full items-center justify-between font-nav text-lg tracking-wide uppercase text-foreground/80"
      >
        Collections
        <ChevronDown
          size={18}
          className={cn("opacity-60 transition-transform", expanded && "rotate-180")}
        />
      </button>
      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="mt-3 space-y-2 border-l border-border pl-4">
              <Link
                to="/products"
                onClick={onNavigate}
                className="block font-body text-sm text-foreground/80 hover:text-foreground"
              >
                All products
              </Link>
              {isLoading ? (
                <p className="font-body text-sm text-muted-foreground">Loading…</p>
              ) : (
                categories.map((cat) => (
                  <Link
                    key={cat.id}
                    to="/products"
                    state={{ category: cat.name }}
                    onClick={onNavigate}
                    className="block font-body text-sm text-foreground/80 hover:text-foreground"
                  >
                    {cat.name}
                  </Link>
                ))
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
