import { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import {
  ChevronRight,
  Heart,
  LayoutDashboard,
  LogOut,
  Menu,
  MessageCircle,
  ShoppingBag,
  User,
  X,
} from "lucide-react";
import NavSearch from "@/components/NavSearch";
import { useCart } from "@/context/CartContext";
import { useFavorites } from "@/context/FavoritesContext";
import { useAuth } from "@/context/AuthContext";
import { motion, AnimatePresence } from "framer-motion";
import PurchaseNotificationToast from "@/components/PurchaseNotificationToast";
import WhatsAppButton from "@/components/WhatsAppButton";
import SocialLinks from "@/components/SocialLinks";
import { CONTACT } from "@/lib/contact";

const navLinks = [
  { label: "Home", path: "/" },
  { label: "Collections", path: "/products" },
  { label: "Loyalty", path: "/loyalty" },
  { label: "Rewards", path: "/rewards" },
  { label: "Contact", path: "/contact" },
];

const footerCustomerCareLinks = [
  { label: "Contact Us", path: "/contact" },
  { label: "Book Appointment", path: "/contact" },
  { label: "Size & Care Guide", path: "/size-care" },
  { label: "Shipping & Returns", path: "/policies#shipping" },
  { label: "Policies & FAQ", path: "/policies" },
];

const ANNOUNCEMENT_SLIDES = [
  "LIMITED TIME OFFER: 50% OFF ON ALL ORDERS",
  "FREE DELIVERY ON ORDERS ABOVE RS. 2,999",
  "NEW ARRIVALS — SHOP HANDBAGS",
  "USE RESALE CODE FOR REWARDS",
];

const Layout = ({ children }: { children: React.ReactNode }) => {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [announcementIndex, setAnnouncementIndex] = useState(0);
  const { totalItems } = useCart();
  const { totalFavorites } = useFavorites();
  const { user, logout } = useAuth();
  const location = useLocation();

  const handleLogoClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    if (location.pathname === "/") {
      e.preventDefault();
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    setMobileOpen(false);
    window.scrollTo(0, 0);
  }, [location]);

  useEffect(() => {
    const timer = setInterval(
      () => setAnnouncementIndex((i) => (i + 1) % ANNOUNCEMENT_SLIDES.length),
      2500
    );
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    if (!mobileOpen) return;
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prevOverflow;
    };
  }, [mobileOpen]);

  const closeMobileMenu = () => setMobileOpen(false);

  const isNavActive = (path: string) =>
    path === "/" ? location.pathname === "/" : location.pathname.startsWith(path);

  return (
    <div className="flex min-h-screen flex-col overflow-x-hidden">
      {/* Announcement Bar */}
      <div
        className="bg-foreground py-2 text-center"
        aria-live="polite"
        aria-atomic="true"
      >
        <div className="relative mx-auto flex h-5 max-w-4xl items-center justify-center overflow-hidden px-4">
          <AnimatePresence mode="wait">
            <motion.p
              key={announcementIndex}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.35, ease: "easeInOut" }}
              className="absolute inset-x-4 font-nav text-sm font-medium tracking-wide text-primary-foreground"
            >
              {ANNOUNCEMENT_SLIDES[announcementIndex]}
            </motion.p>
          </AnimatePresence>
        </div>
      </div>

      {/* Navigation */}
      <header
        className={`top-0 z-50 relative transition-all duration-500 ${
          scrolled ? "bg-background/95 backdrop-blur-md luxury-shadow" : "bg-background"
        }`}
      >
        {/* Top nav row */}
        <div className="border-b border-border/50">
          <div className="container relative flex items-center py-3 lg:py-4">
            <div className="z-10 flex w-[4.5rem] shrink-0 items-center justify-start sm:w-20 lg:w-auto lg:flex-1">
              <button
                type="button"
                onClick={() => setMobileOpen(true)}
                className="lg:hidden text-foreground"
                aria-label="Open menu"
              >
                <Menu size={22} />
              </button>
              <nav className="hidden lg:flex items-center gap-8">
                {navLinks.map((link) => (
                  <Link key={link.label} to={link.path} className="nav-link text-foreground/80 hover:text-foreground">
                    {link.label}
                  </Link>
                ))}
              </nav>
            </div>

            {/* Center Logo — z-30 so side nav does not block clicks */}
            <Link
              to="/"
              onClick={handleLogoClick}
              aria-label="Ateeqo home"
              className="relative z-30 min-w-0 flex-1 px-1 pointer-events-auto lg:absolute lg:left-1/2 lg:flex-none lg:-translate-x-1/2 lg:px-0"
            >
              <div className="text-center">
                <h1 className="truncate font-display text-xl font-semibold text-foreground sm:text-2xl md:text-3xl">
                  ATEEQO
                </h1>
                <p className="font-nav text-[10px] tracking-wide text-muted-foreground -mt-0.5 sm:text-xs">
                  Wear your story
                </p>
              </div>
            </Link>

            <div className="z-10 flex w-[4.5rem] shrink-0 items-center justify-end gap-2 sm:w-24 sm:gap-2.5 lg:w-auto lg:gap-5">
              <NavSearch className="inline-flex items-center justify-center" />
              <Link
                to="/favorites"
                className="relative hidden text-foreground/70 transition-colors hover:text-foreground md:inline-flex"
                aria-label="Favorites"
              >
                <Heart size={20} />
                {totalFavorites > 0 && (
                  <span className="absolute -top-2 -right-2 flex h-5 w-5 items-center justify-center rounded-full bg-primary text-[10px] font-nav text-primary-foreground">
                    {totalFavorites}
                  </span>
                )}
              </Link>
              <Link to="/cart" className="relative text-foreground/70 hover:text-foreground transition-colors" aria-label="Cart">
                <ShoppingBag size={20} />
                {totalItems > 0 && (
                  <span className="absolute -top-2 -right-2 w-5 h-5 bg-primary text-primary-foreground text-[10px] font-nav flex items-center justify-center rounded-full">
                    {totalItems}
                  </span>
                )}
              </Link>
              {user ? (
                <div className="flex items-center gap-2 lg:gap-3">
                  <span className="hidden max-w-[7rem] truncate font-nav text-xs uppercase tracking-normal text-foreground/70 lg:inline">
                    {user.name}
                  </span>
                  <Link
                    to="/account"
                    aria-label="Account dashboard"
                    className="text-foreground/70 hover:text-foreground transition-colors"
                  >
                    <LayoutDashboard size={20} />
                  </Link>
                </div>
              ) : (
                <Link
                  to="/login"
                  aria-label="Login"
                  className="inline-flex items-center text-foreground/70 hover:text-foreground transition-colors"
                >
                  <User size={20} />
                </Link>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Mobile Menu */}
      <AnimatePresence>
        {mobileOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.25 }}
              className="fixed inset-0 z-50 bg-foreground/40 backdrop-blur-[2px] lg:hidden"
              onClick={closeMobileMenu}
              aria-hidden
            />
            <motion.aside
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ type: "spring", damping: 28, stiffness: 320 }}
              className="fixed inset-y-0 left-0 z-50 flex w-[min(320px,88vw)] flex-col border-r border-border bg-background shadow-[8px_0_40px_hsl(30_68%_11%/0.12)] lg:hidden"
              role="dialog"
              aria-modal="true"
              aria-label="Navigation menu"
            >
              {/* Header */}
              <div className="flex items-center justify-between border-b border-border/60 px-5 py-4">
                <div>
                  <p className="font-display text-xl font-semibold text-foreground">ATEEQO</p>
                  <p className="font-nav text-[10px] tracking-wide text-muted-foreground">
                    Wear your story
                  </p>
                </div>
                <button
                  type="button"
                  onClick={closeMobileMenu}
                  className="flex h-10 w-10 items-center justify-center rounded-full border border-border text-foreground transition-colors hover:bg-secondary"
                  aria-label="Close menu"
                >
                  <X size={20} />
                </button>
              </div>

              <div className="flex min-h-0 flex-1 flex-col overflow-y-auto overscroll-contain">
                {/* Search */}
                <div className="border-b border-border/60 px-5 py-4">
                  <NavSearch className="inline-flex" onNavigate={closeMobileMenu} />
                  <p className="mt-2 font-body text-xs text-muted-foreground">
                    Search bags, collections & more
                  </p>
                </div>

                {/* Quick actions */}
                <div className="grid grid-cols-2 gap-2 border-b border-border/60 px-5 py-4">
                  <Link
                    to="/cart"
                    onClick={closeMobileMenu}
                    className="flex items-center gap-2.5 rounded-xl border border-border bg-secondary/40 px-3 py-3 transition-colors hover:border-primary/30 hover:bg-secondary"
                  >
                    <ShoppingBag size={18} className="shrink-0 text-foreground/70" />
                    <div className="min-w-0">
                      <p className="font-nav text-[11px] uppercase tracking-wide text-foreground">Cart</p>
                      <p className="font-body text-xs text-muted-foreground">
                        {totalItems > 0 ? `${totalItems} item${totalItems > 1 ? "s" : ""}` : "Empty"}
                      </p>
                    </div>
                  </Link>
                  <Link
                    to="/favorites"
                    onClick={closeMobileMenu}
                    className="flex items-center gap-2.5 rounded-xl border border-border bg-secondary/40 px-3 py-3 transition-colors hover:border-primary/30 hover:bg-secondary"
                  >
                    <Heart size={18} className="shrink-0 text-foreground/70" />
                    <div className="min-w-0">
                      <p className="font-nav text-[11px] uppercase tracking-wide text-foreground">Saved</p>
                      <p className="font-body text-xs text-muted-foreground">
                        {totalFavorites > 0 ? `${totalFavorites} item${totalFavorites > 1 ? "s" : ""}` : "No items"}
                      </p>
                    </div>
                  </Link>
                </div>

                {/* Main nav */}
                <nav className="px-3 py-4">
                  <p className="mb-2 px-2 font-nav text-[10px] uppercase tracking-widest text-muted-foreground">
                    Menu
                  </p>
                  <ul className="space-y-1">
                    {navLinks.map((link) => {
                      const active = isNavActive(link.path);
                      return (
                        <li key={link.label}>
                          <Link
                            to={link.path}
                            onClick={closeMobileMenu}
                            className={`flex items-center justify-between rounded-lg px-3 py-3 font-nav text-sm uppercase tracking-wide transition-colors ${
                              active
                                ? "bg-foreground text-primary-foreground"
                                : "text-foreground/80 hover:bg-secondary hover:text-foreground"
                            }`}
                          >
                            {link.label}
                            <ChevronRight
                              size={16}
                              className={active ? "text-primary-foreground/70" : "text-muted-foreground/50"}
                            />
                          </Link>
                        </li>
                      );
                    })}
                  </ul>
                </nav>

                {/* Account */}
                <div className="border-t border-border/60 px-3 py-4">
                  <p className="mb-2 px-2 font-nav text-[10px] uppercase tracking-widest text-muted-foreground">
                    Account
                  </p>
                  {user ? (
                    <div className="space-y-2">
                      <div className="rounded-xl border border-border bg-secondary/30 px-4 py-3">
                        <p className="font-body text-xs text-muted-foreground">Signed in as</p>
                        <p className="truncate font-nav text-sm text-foreground">{user.name}</p>
                      </div>
                      <Link
                        to="/account"
                        onClick={closeMobileMenu}
                        className="flex items-center justify-between rounded-lg px-3 py-3 font-nav text-sm uppercase tracking-wide text-foreground/80 transition-colors hover:bg-secondary hover:text-foreground"
                      >
                        <span className="flex items-center gap-2">
                          <LayoutDashboard size={16} />
                          Dashboard
                        </span>
                        <ChevronRight size={16} className="text-muted-foreground/50" />
                      </Link>
                      <button
                        type="button"
                        onClick={() => {
                          logout();
                          closeMobileMenu();
                        }}
                        className="flex w-full items-center gap-2 rounded-lg px-3 py-3 text-left font-nav text-sm uppercase tracking-wide text-foreground/80 transition-colors hover:bg-secondary hover:text-foreground"
                      >
                        <LogOut size={16} />
                        Logout
                      </button>
                    </div>
                  ) : (
                    <div className="grid grid-cols-2 gap-2">
                      <Link
                        to="/login"
                        onClick={closeMobileMenu}
                        className="rounded-lg border border-border px-3 py-3 text-center font-nav text-xs uppercase tracking-wide text-foreground transition-colors hover:bg-secondary"
                      >
                        Login
                      </Link>
                      <Link
                        to="/signup"
                        onClick={closeMobileMenu}
                        className="rounded-lg bg-foreground px-3 py-3 text-center font-nav text-xs uppercase tracking-wide text-primary-foreground transition-opacity hover:opacity-90"
                      >
                        Sign Up
                      </Link>
                    </div>
                  )}
                </div>

                {/* Help links */}
                <div className="border-t border-border/60 px-3 py-4">
                  <p className="mb-2 px-2 font-nav text-[10px] uppercase tracking-widest text-muted-foreground">
                    Help
                  </p>
                  <ul className="space-y-1">
                    {footerCustomerCareLinks.slice(0, 3).map(({ label, path }) => (
                      <li key={label}>
                        <Link
                          to={path}
                          onClick={closeMobileMenu}
                          className="flex items-center justify-between rounded-lg px-3 py-2.5 font-body text-sm text-foreground/75 transition-colors hover:bg-secondary hover:text-foreground"
                        >
                          {label}
                          <ChevronRight size={14} className="text-muted-foreground/40" />
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* Footer */}
              <div className="shrink-0 border-t border-border/60 bg-secondary/20 px-5 py-4">
                <a
                  href={CONTACT.whatsapp.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mb-4 flex items-center justify-center gap-2 rounded-xl bg-foreground px-4 py-3 font-nav text-xs uppercase tracking-wide text-primary-foreground transition-opacity hover:opacity-90"
                >
                  <MessageCircle size={16} />
                  Chat on WhatsApp
                </a>
                <SocialLinks
                  className="justify-center"
                  iconClassName="flex h-9 w-9 items-center justify-center rounded-full border border-border text-foreground/60 transition-colors hover:border-primary hover:text-primary"
                />
              </div>
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {/* Main */}
      <main className="flex-1 overflow-x-hidden">{children}</main>

      <PurchaseNotificationToast />
      <WhatsAppButton />

      {/* Footer */}
      <footer className="bg-foreground text-primary-foreground">
        <div className="container py-16">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-12">
            <div>
              <h3 className="font-display text-xl mb-4">Ateeqo</h3>
              <p className="font-body text-sm text-primary-foreground/70 leading-relaxed mb-5">
                Stylish handwear your story for every occasion — quality you can see and feel.
              </p>
              <SocialLinks />
              <a
                href={CONTACT.email.mailto}
                className="mt-4 inline-block font-body text-sm text-primary-foreground/70 transition-colors hover:text-primary-foreground"
              >
                {CONTACT.email.address}
              </a>
            </div>
            <div>
              <h4 className="font-nav text-xs tracking-wide uppercase mb-4">Quick Links</h4>
              <div className="flex flex-col gap-2">
                {["New Arrivals", "Bestsellers", "Loyalty Points", "Gift Guide"].map((l) => (
                  l === "Loyalty Points" ? (
                    <Link
                      key={l}
                      to="/loyalty"
                      className="font-body text-sm text-primary-foreground/60 transition-colors hover:text-primary-foreground"
                    >
                      {l}
                    </Link>
                  ) : (
                    <span key={l} className="font-body text-sm text-primary-foreground/60 hover:text-primary-foreground cursor-pointer transition-colors">{l}</span>
                  )
                ))}
              </div>
            </div>
            <div>
              <h4 className="font-nav text-xs tracking-wide uppercase mb-4">Customer Care</h4>
              <div className="flex flex-col gap-2">
                {footerCustomerCareLinks.map(({ label, path }) => (
                  <Link
                    key={label}
                    to={path}
                    className="font-body text-sm text-primary-foreground/60 transition-colors hover:text-primary-foreground"
                  >
                    {label}
                  </Link>
                ))}
                <a
                  href={CONTACT.whatsapp.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-body text-sm text-primary-foreground/60 transition-colors hover:text-primary-foreground"
                >
                  WhatsApp: {CONTACT.whatsapp.display}
                </a>
                <a
                  href={CONTACT.location.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-body text-sm text-primary-foreground/60 transition-colors hover:text-primary-foreground"
                >
                  Store Location
                </a>
              </div>
            </div>
            <div>
              <h4 className="font-nav text-xs tracking-wide uppercase mb-4">Newsletter</h4>
              <p className="font-body text-sm text-primary-foreground/60 mb-4">Be the first to discover new collections.</p>
              <div className="flex">
                <input
                  type="email"
                  placeholder="Your email"
                  className="flex-1 bg-primary-foreground/10 border border-primary-foreground/20 px-4 py-2 text-sm font-body text-primary-foreground placeholder:text-primary-foreground/40 focus:outline-none focus:border-primary-foreground/40"
                />
                <button className="bg-primary text-primary-foreground px-4 py-2 font-nav text-xs tracking-wider uppercase">
                  Join
                </button>
              </div>
            </div>
          </div>
          <div className="border-t border-primary-foreground/10 mt-12 pt-8 text-center">
            <p className="font-body text-xs text-primary-foreground/50">© 2026 Ateeqo Wear your story. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Layout;
