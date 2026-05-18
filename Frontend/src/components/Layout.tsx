import { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { LayoutDashboard, ShoppingBag, Menu, X, Search, Heart, User } from "lucide-react";
import { useCart } from "@/context/CartContext";
import { useAuth } from "@/context/AuthContext";
import { motion, AnimatePresence } from "framer-motion";

const navLinks = [
  { label: "Home", path: "/" },
  { label: "Collections", path: "/products" },
];

const Layout = ({ children }: { children: React.ReactNode }) => {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const { totalItems } = useCart();
  const { user, logout } = useAuth();
  const location = useLocation();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    setMobileOpen(false);
    window.scrollTo(0, 0);
  }, [location]);

  return (
    <div className="flex min-h-screen flex-col overflow-x-hidden">
      {/* Announcement Bar */}
      <div className="bg-foreground py-2 text-center">
        <p className="font-nav text-sm font-medium tracking-wide text-primary-foreground">
        LIMITED TIME OFER
        </p>
      </div>

      {/* Navigation */}
      <header
        className={`sticky top-0 z-50 transition-all duration-500 ${scrolled ? "bg-background/95 backdrop-blur-md luxury-shadow" : "bg-background"
          }`}
      >
        {/* Top nav row */}
        <div className="border-b border-border/50">
          <div className="container flex items-center justify-between py-4">
            {/* Left nav links (desktop) */}
            <nav className="hidden lg:flex items-center gap-8">
              {navLinks.map((link) => (
                <Link key={link.label} to={link.path} className="nav-link text-foreground/80 hover:text-foreground">
                  {link.label}
                </Link>
              ))}
            </nav>

            {/* Mobile menu button */}
            <button onClick={() => setMobileOpen(true)} className="lg:hidden text-foreground">
              <Menu size={24} />
            </button>

            {/* Center Logo */}
            <Link to="/" className="absolute left-1/2 -translate-x-1/2">
              <div className="text-center">
                <h1 className="font-display text-2xl md:text-3xl font-semibold text-foreground">
                  D BENZA
                </h1>
                <p className="font-nav text-xs tracking-wide text-muted-foreground -mt-0.5">
                  Bags &amp; Accessories
                </p>
              </div>
            </Link>

            {/* Empty space for flex layout balance if needed, or just let Icons float right */}
            <div className="hidden lg:flex flex-1"></div>

            {/* Icons */}
            <div className="flex items-center gap-5">
              <button className="hidden md:block text-foreground/70 hover:text-foreground transition-colors">
                <Search size={20} />
              </button>
              <button className="hidden md:block text-foreground/70 hover:text-foreground transition-colors">
                <Heart size={20} />
              </button>
              <Link to="/cart" className="relative text-foreground/70 hover:text-foreground transition-colors">
                <ShoppingBag size={20} />
                {totalItems > 0 && (
                  <span className="absolute -top-2 -right-2 w-5 h-5 bg-primary text-primary-foreground text-[10px] font-nav flex items-center justify-center rounded-full">
                    {totalItems}
                  </span>
                )}
              </Link>
              {user ? (
                <div className="flex items-center gap-3">
                  <span className="font-nav text-xs tracking-normal uppercase text-foreground/70">
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
              className="fixed inset-0 bg-foreground/30 z-50"
              onClick={() => setMobileOpen(false)}
            />
            <motion.div
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ type: "tween", duration: 0.3 }}
              className="fixed left-0 top-0 bottom-0 w-80 bg-background z-50 p-8 flex flex-col"
            >
              <button onClick={() => setMobileOpen(false)} className="self-end mb-8 text-foreground">
                <X size={24} />
              </button>
              <nav className="flex flex-col gap-6">
                {navLinks.map((link) => (
                  <Link
                    key={link.label}
                    to={link.path}
                    className="font-nav text-lg tracking-wide uppercase text-foreground/80 hover:text-foreground transition-colors"
                  >
                    {link.label}
                  </Link>
                ))}
                {user ? (
                  <>
                    <div className="font-body text-sm text-muted-foreground">
                      Signed in as {user.name}
                    </div>
                    <Link
                      to="/account"
                      className="font-nav text-lg tracking-wide uppercase text-foreground/80 hover:text-foreground transition-colors"
                    >
                      Dashboard
                    </Link>
                    <button
                      onClick={logout}
                      className="text-left font-nav text-lg tracking-wide uppercase text-foreground/80 hover:text-foreground transition-colors"
                    >
                      Logout
                    </button>
                  </>
                ) : (
                  <>
                    <Link
                      to="/login"
                      className="font-nav text-lg tracking-wide uppercase text-foreground/80 hover:text-foreground transition-colors"
                    >
                      Login
                    </Link>
                    <Link
                      to="/signup"
                      className="font-nav text-lg tracking-wide uppercase text-foreground/80 hover:text-foreground transition-colors"
                    >
                      Sign Up
                    </Link>
                  </>
                )}
              </nav>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Main */}
      <main className="flex-1 overflow-x-hidden">{children}</main>

      {/* Footer */}
      <footer className="bg-foreground text-primary-foreground">
        <div className="container py-16">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-12">
            <div>
              <h3 className="font-display text-xl mb-4">D Benze</h3>
              <p className="font-body text-sm text-primary-foreground/70 leading-relaxed">
                Stylish handbags and accessories for every occasion — quality you can see and feel.
              </p>
            </div>
            <div>
              <h4 className="font-nav text-xs tracking-wide uppercase mb-4">Quick Links</h4>
              <div className="flex flex-col gap-2">
                {["New Arrivals", "Bestsellers", "Gift Guide", "Care Guide"].map((l) => (
                  <span key={l} className="font-body text-sm text-primary-foreground/60 hover:text-primary-foreground cursor-pointer transition-colors">{l}</span>
                ))}
              </div>
            </div>
            <div>
              <h4 className="font-nav text-xs tracking-wide uppercase mb-4">Customer Care</h4>
              <div className="flex flex-col gap-2">
                {["Shipping & Returns", "Size Guide", "FAQs", "Book Appointment"].map((l) => (
                  <span key={l} className="font-body text-sm text-primary-foreground/60 hover:text-primary-foreground cursor-pointer transition-colors">{l}</span>
                ))}
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
            <p className="font-body text-xs text-primary-foreground/50">© 2026 D Benza Bags &amp; Accessories. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Layout;
