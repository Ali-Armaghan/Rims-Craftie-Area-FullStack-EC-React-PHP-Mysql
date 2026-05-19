import { useParams, Link, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  AlertTriangle,
  ChevronLeft,
  ChevronRight,
  CreditCard,
  Heart,
  PackageCheck,
  RotateCcw,
  ShieldCheck,
  ShoppingBag,
  Truck,
  type LucideIcon,
} from "lucide-react";
import { useProduct } from "@/hooks/useProduct";
import { useCart } from "@/context/CartContext";
import ProductCard from "@/components/ProductCard";
import { useState, useEffect, useMemo } from "react";
import { useProductReviews, useSubmitReview } from "@/hooks/useProductReviews";
import { Star } from "lucide-react";
import ProductDetailSkeleton from "@/components/skeletons/ProductDetailSkeleton";
import { Skeleton } from "@/components/ui/skeleton";
import { useQuery } from "@tanstack/react-query";
import { fetchSaleCountdown } from "@/services/api";

function formatDeliveryStepDate(date: Date) {
  return date.toLocaleDateString("en-PK", {
    day: "numeric",
    month: "short",
  });
}

type DeliveryStep = {
  label: string;
  icon: LucideIcon;
  date: string;
  iconClass: string;
  ringClass: string;
  glow?: boolean;
};

function buildDeliverySteps(): DeliveryStep[] {
  const today = new Date();
  const addDays = (days: number) => {
    const next = new Date(today);
    next.setDate(today.getDate() + days);
    return next;
  };

  return [
    {
      label: "Order",
      icon: ShoppingBag,
      date: formatDeliveryStepDate(today),
      iconClass: "text-amber-600",
      ringClass: "border-amber-300/70 bg-amber-50",
      glow: true,
    },
    {
      label: "Shipped",
      icon: Truck,
      date: formatDeliveryStepDate(addDays(1)),
      iconClass: "text-sky-600",
      ringClass: "border-sky-300/60 bg-sky-50",
    },
    {
      label: "Delivered",
      icon: PackageCheck,
      date: formatDeliveryStepDate(addDays(3)),
      iconClass: "text-emerald-600",
      ringClass: "border-emerald-300/60 bg-emerald-50",
    },
  ];
}

const CountdownValue = ({ value }: { value: string }) => (
  <span className="inline-flex min-w-[1.8ch] justify-center align-baseline">
    <motion.span
      key={value}
      initial={{ y: 8, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.22, ease: "easeOut" }}
      className="inline-block leading-normal"
    >
      {value}
    </motion.span>
  </span>
);

const ProductDetail = () => {
  const { id } = useParams();
  const { addToCart } = useCart();
  const { product, isLoading, error } = useProduct(id);
  const { data: reviews = [], isLoading: isLoadingReviews } = useProductReviews(id);
  const { data: saleCountdown } = useQuery({
    queryKey: ["sale-countdown"],
    queryFn: fetchSaleCountdown,
    refetchInterval: 60000,
  });
  const submitReviewMutation = useSubmitReview();
  const navigate = useNavigate();

  // All Hooks must be at the top level
  const [added, setAdded] = useState(false);
  const [quantity, setQuantity] = useState(1);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [slideDirection, setSlideDirection] = useState(1);
  const [selectedOption, setSelectedOption] = useState("Large");
  const [now, setNow] = useState(() => Date.now());

  // Review form state
  const [reviewForm, setReviewForm] = useState({
    rating: 5,
    reviewer: "",
    reviewer_email: "",
    review: ""
  });

  const displayRating = useMemo(() => {
    if (!product) return 0;
    if (reviews.length === 0) return parseFloat(product.rating || "0");
    const sum = reviews.reduce((acc: any, rev: any) => acc + rev.rating, 0);
    return sum / reviews.length;
  }, [reviews, product]);

  const displayReviewCount = useMemo(() => {
    if (!product) return 0;
    return Math.max(reviews.length, product.reviewCount || 0);
  }, [reviews.length, product?.reviewCount]);

  const images = product?.images?.length ? product.images : (product ? [product.image] : []);

  const lowStockCount = useMemo(() => {
    if (!id) return 8;
    return Math.floor(Math.random() * 19) + 1;
  }, [id]);

  const deliverySteps = useMemo(() => buildDeliverySteps(), []);

  // Reset states when 'id' changes
  useEffect(() => {
    setCurrentImageIndex(0);
    // Auto-select the first variation if available, otherwise fallback to a generic string.
    if (product?.variations && product.variations.length > 0) {
      setSelectedOption(product.variations[0].name);
    } else {
      setSelectedOption("Default");
    }
  }, [id, product?.variations]);

  // Auto-sliding Carousel Effect
  useEffect(() => {
    if (images.length <= 1) return;

    const intervalId = setInterval(() => {
      setSlideDirection(1);
      setCurrentImageIndex((prev) => (prev === images.length - 1 ? 0 : prev + 1));
    }, 5000); // Change image every 5 seconds

    return () => clearInterval(intervalId);
  }, [images.length]); // Intentionally removed currentImageIndex from deps to avoid rapid resetting if user clicks

  useEffect(() => {
    const intervalId = window.setInterval(() => setNow(Date.now()), 1000);
    return () => window.clearInterval(intervalId);
  }, []);

  // Early returns
  if (isLoading) {
    return <ProductDetailSkeleton />;
  }

  if (error) {
    return (
      <div className="container py-32 text-center text-destructive font-nav text-sm tracking-widest uppercase">
        {error}
      </div>
    );
  }

  if (!product) {
    return (
      <div className="container py-32 text-center">
        <h2 className="font-display text-2xl text-foreground">Product not found</h2>
        <Link to="/products" className="mt-4 inline-block font-nav text-sm text-primary underline">Back to Collections</Link>
      </div>
    );
  }

  // Temporarily removing Related Products because the single product fetched doesn't have the whole catalog.
  // Can be reimplemented via a separate fetchFeaturedProducts() query if desired.
  const related: any[] = [];
  const trustBadges = [
    { icon: Truck, title: "Fast Delivery", desc: "Quick dispatch nationwide" },
    { icon: RotateCcw, title: "Easy Returns", desc: "Hassle-free return support" },
    { icon: ShieldCheck, title: "Secure Checkout", desc: "Protected payment process" },
    { icon: CreditCard, title: "Cash / Card", desc: "Flexible payment options" },
  ];
  const saleEndsAt = saleCountdown?.ends_at
    ? new Date(saleCountdown.ends_at).getTime()
    : 0;
  const saleRemaining = saleEndsAt - now;
  const showSaleCountdown = Boolean(
    saleCountdown?.enabled && saleEndsAt && saleRemaining > 0
  );
  const saleDays = Math.floor(saleRemaining / 86400000);
  const saleHours = Math.floor((saleRemaining % 86400000) / 3600000);
  const saleMinutes = Math.floor((saleRemaining % 3600000) / 60000);
  const saleSeconds = Math.floor((saleRemaining % 60000) / 1000);
  const saleCountdownParts = {
    days: String(saleDays),
    hours: String(saleHours).padStart(2, "0"),
    minutes: String(saleMinutes).padStart(2, "0"),
    seconds: String(saleSeconds).padStart(2, "0"),
  };

  const handleNextImage = () => {
    setSlideDirection(1);
    setCurrentImageIndex((prev) => (prev === images.length - 1 ? 0 : prev + 1));
  };

  const handlePrevImage = () => {
    setSlideDirection(-1);
    setCurrentImageIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1));
  };

  const handleAdd = () => {
    addToCart(product, quantity);
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  };

  const handleBuyNow = () => {
    addToCart(product, quantity);
    navigate("/checkout");
  };

  const handleReviewSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!product || !id) return;

    submitReviewMutation.mutate({
      product_id: parseInt(id),
      ...reviewForm
    });

    // Reset form after submission start (optional, mutation onsuccess handles it better but let's reset)
    setReviewForm({
      rating: 5,
      reviewer: "",
      reviewer_email: "",
      review: ""
    });
  };

  // Calculate discount percentage
  let discountBadge = null;
  if (product.originalPrice && product.originalPrice > product.price) {
    const discount = Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100);
    discountBadge = `-${discount}% OFF`;
  }

  // Animation variants for smooth sliding
  const slideVariants: any = {
    hidden: (direction: number) => ({
      x: direction > 0 ? 50 : -50,
      opacity: 0,
    }),
    visible: {
      x: 0,
      opacity: 1,
      transition: {
        x: { type: "spring", stiffness: 300, damping: 30 },
        opacity: { duration: 0.4 },
      }
    },
    exit: (direction: number) => ({
      x: direction > 0 ? -50 : 50,
      opacity: 0,
      transition: { duration: 0.3 }
    })
  };

  return (
    <>
      <div className="bg-background min-h-screen pb-20">
        {/* Top Navigation */}
        <div className="container py-8">
          <Link to="/products" className="inline-flex items-center gap-2 font-body text-sm text-foreground hover:opacity-70 transition-colors">
            <ChevronLeft size={16} strokeWidth={1.5} /> Back to Collection
          </Link>
        </div>

        <section className="container">
          <div className="grid grid-cols-1 gap-10 lg:grid-cols-[minmax(0,1.05fr)_minmax(420px,0.95fr)] lg:gap-14 items-start">

            {/* Left Column - Image Gallery */}
            <div className="lg:sticky lg:top-8">
              <motion.div
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.6 }}
                className="relative aspect-square overflow-hidden rounded-[2rem] border border-border/70 bg-card/70 group"
              >
                {discountBadge && (
                  <span className="absolute left-5 top-5 z-10 rounded-full bg-primary px-4 py-2 font-nav text-xs font-bold uppercase tracking-normal text-primary-foreground shadow">
                    {discountBadge}
                  </span>
                )}

                <AnimatePresence initial={false} custom={slideDirection} mode="wait">
                  <motion.img
                    key={currentImageIndex}
                    src={images[currentImageIndex]}
                    alt={product.name}
                    custom={slideDirection}
                    variants={slideVariants}
                    initial="hidden"
                    animate="visible"
                    exit="exit"
                    className="h-full w-full object-contain p-5 md:p-8"
                  />
                </AnimatePresence>

                {images.length > 1 && (
                  <>
                    <button
                      onClick={handlePrevImage}
                      className="absolute left-5 top-1/2 z-10 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full bg-background/90 text-foreground shadow-md transition hover:bg-background"
                      aria-label="Previous image"
                    >
                      <ChevronLeft size={20} strokeWidth={1.5} />
                    </button>
                    <button
                      onClick={handleNextImage}
                      className="absolute right-5 top-1/2 z-10 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full bg-background/90 text-foreground shadow-md transition hover:bg-background"
                      aria-label="Next image"
                    >
                      <ChevronRight size={20} strokeWidth={1.5} />
                    </button>
                  </>
                )}
              </motion.div>

              {images.length > 1 && (
                <div className="mt-4 grid grid-cols-5 gap-3">
                  {images.slice(0, 5).map((image, idx) => (
                    <button
                      key={`${image}-${idx}`}
                      onClick={() => {
                        setSlideDirection(idx > currentImageIndex ? 1 : -1);
                        setCurrentImageIndex(idx);
                      }}
                      className={`aspect-square overflow-hidden rounded-2xl border bg-card transition ${
                        currentImageIndex === idx
                          ? "border-primary ring-2 ring-primary/20"
                          : "border-border/60 hover:border-primary/50"
                      }`}
                      aria-label={`View image ${idx + 1}`}
                    >
                      <img
                        src={image}
                        alt={`${product.name} ${idx + 1}`}
                        className="h-full w-full object-contain p-2"
                      />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Right Column - Product Info */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="flex flex-col"
            >
              <motion.div className="mb-4 flex flex-wrap items-center gap-3">
                <span className="rounded-full border border-primary/20 bg-primary/5 px-3 py-1 font-nav text-xs font-bold uppercase tracking-normal text-primary">
                  {product.category || "LUXURY"}
                </span>
                {product.inStock ? (
                  <span className="inline-flex animate-pulse items-center gap-1.5 rounded-full border border-red-500/60 bg-red-600 px-3 py-1 font-nav text-xs font-bold uppercase tracking-wide text-white">
                    <AlertTriangle size={13} className="shrink-0" />
                    Only {lowStockCount} left
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 rounded-full bg-destructive/10 px-3 py-1 font-body text-xs font-semibold text-destructive">
                    Out of stock
                  </span>
                )}
              </motion.div>

              <h1 className="mb-4 font-display text-4xl leading-[1.08] text-foreground md:text-5xl">
                {product.name}
              </h1>

              <div className="mb-6 flex flex-wrap items-center gap-3">
                <div className="flex text-[#ffb800]">
                  {"★★★★★".split("").map((star, i) => (
                    <span key={i} className="text-sm">
                      {i < Math.round(displayRating) ? "★" : "☆"}
                    </span>
                  ))}
                </div>
                <span className="font-body text-sm text-muted-foreground ml-1">
                  {displayRating.toFixed(1)} ({displayReviewCount} reviews)
                </span>
                <span className="hidden h-4 w-px bg-border sm:block" />
                <span className="font-body text-sm text-muted-foreground">
                  {product.inStock ? "Available for order" : "Out of stock"}
                </span>
              </div>

              <div className="mb-6 rounded-3xl border border-border/70 bg-card/50 px-5 py-4 shadow-sm">
                <div className={`grid gap-4 ${showSaleCountdown ? "sm:grid-cols-[1fr_auto_1fr]" : ""} sm:items-stretch`}>
                  <div className="flex min-w-0 flex-col justify-center">
                    <div className="flex flex-wrap items-end gap-3">
                      <span className="font-display text-4xl font-bold leading-none text-foreground md:text-[46px]">
                        Rs. {product.price.toLocaleString()}
                      </span>
                      {product.originalPrice && (
                        <span className="pb-1 font-body text-xl font-medium text-muted-foreground line-through decoration-muted-foreground/60 decoration-2">
                          Rs. {product.originalPrice.toLocaleString()}
                        </span>
                      )}
                    </div>
                    <p className="mt-3 line-clamp-2 font-body text-sm leading-snug text-muted-foreground">
                      {product.shortDescription || product.description || "Premium product with carefully selected materials and refined finishing."}
                    </p>
                  </div>
                  {showSaleCountdown && (
                    <>
                      <div className="hidden min-h-24 w-px bg-border sm:block" />
                      <div className="flex min-w-0 flex-col justify-center py-1 sm:items-center sm:text-center">
                        <p className="whitespace-nowrap font-nav text-xs font-bold uppercase leading-6 tracking-wide text-muted-foreground md:text-sm md:leading-7 md:tracking-normal">
                          Sales ends in
                        </p>
                        <p className="mt-0 flex items-center justify-center font-sans text-2xl font-semibold tabular-nums leading-[1.25] text-foreground md:text-4xl">
                          {saleDays > 0 && (
                            <>
                              <CountdownValue value={saleCountdownParts.days} />
                              <span className="mx-1 text-sm font-medium uppercase text-muted-foreground md:text-lg">
                                d
                              </span>
                            </>
                          )}
                          <CountdownValue value={saleCountdownParts.hours} />
                          <span className="mx-1 text-muted-foreground">:</span>
                          <CountdownValue value={saleCountdownParts.minutes} />
                          <span className="mx-1 text-muted-foreground">:</span>
                          <CountdownValue value={saleCountdownParts.seconds} />
                        </p>
                      </div>
                    </>
                  )}
                </div>
              </div>

              {product.variations && product.variations.length > 0 && (
                <div className="mb-6">
                  <p className="mb-3 font-nav text-xs font-bold uppercase tracking-normal text-foreground">Select Option</p>
                  <div className="flex flex-wrap gap-2.5">
                    {product.variations.map((opt) => (
                      <button
                        key={opt.id}
                        onClick={() => setSelectedOption(opt.name)}
                        className={`rounded-full border px-6 py-2.5 font-body text-sm font-semibold transition-colors ${selectedOption === opt.name
                          ? "bg-primary border-primary text-primary-foreground"
                          : "bg-background border-border text-foreground hover:border-primary"
                          }`}
                      >
                        {opt.name}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              <div className="mb-6 rounded-3xl border border-border bg-background p-5 shadow-sm">
                <div className="mb-5 flex items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <button
                      type="button"
                      className="flex h-11 w-11 items-center justify-center rounded-full border border-border text-foreground transition hover:border-primary"
                      aria-label="Add to wishlist"
                    >
                      <Heart size={18} />
                    </button>
                    <div>
                      <p className="font-nav text-xs font-bold uppercase tracking-wide text-muted-foreground">
                        Quantity
                      </p>
                      <p className="mt-1 font-body text-sm text-foreground">
                        Select how many you need
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center overflow-hidden rounded-full border border-border">
                  <button
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="flex h-11 w-11 items-center justify-center text-foreground transition-colors hover:bg-secondary"
                    aria-label="Decrease quantity"
                    disabled={!product.inStock || quantity <= 1}
                  >
                    -
                  </button>
                  <span className="flex h-11 w-12 items-center justify-center font-display text-lg font-bold">
                    {quantity}
                  </span>
                  <button
                    onClick={() => setQuantity(Math.min(lowStockCount, quantity + 1))}
                    className="flex h-11 w-11 items-center justify-center text-foreground transition-colors hover:bg-secondary disabled:cursor-not-allowed disabled:opacity-50"
                    aria-label="Increase quantity"
                    disabled={!product.inStock || quantity >= lowStockCount}
                  >
                    +
                  </button>
                  </div>
                </div>

                <div className="grid gap-3">
                  <button
                    onClick={handleAdd}
                    disabled={!product.inStock}
                    className={`w-full rounded-full py-4 font-nav text-xs uppercase tracking-wide flex items-center justify-center gap-2 transition-all duration-300 disabled:cursor-not-allowed disabled:opacity-50 ${added
                      ? "bg-[#ffb800] text-foreground"
                      : "bg-primary text-primary-foreground hover:bg-primary/90"
                      }`}
                  >
                    <ShoppingBag size={15} strokeWidth={1.5} />
                    {added ? "Added ✓" : "Add to Cart"}
                  </button>
                </div>

                <button
                    onClick={handleBuyNow}
                    disabled={!product.inStock}
                  className={`mt-3 flex w-full items-center justify-center rounded-full bg-foreground py-4 font-nav text-xs uppercase tracking-wide text-primary-foreground transition-colors hover:bg-foreground/90 disabled:cursor-not-allowed disabled:opacity-50 ${
                    product.inStock ? "animate-buy-now-shake" : ""
                  }`}
                  >
                    Buy Now
                  </button>
              </div>

              <div className="delivery-steps-card mb-6">
                <div className="delivery-steps-card__inner">
                <div className="relative grid grid-cols-3 gap-1">
                  <div
                    className="delivery-steps-line pointer-events-none absolute left-[18%] right-[18%] top-[18px] hidden h-[2px] sm:block"
                    aria-hidden
                  />
                  {deliverySteps.map((step) => (
                    <div key={step.label} className="relative z-10 flex flex-col items-center gap-1 text-center">
                      <span
                        className={`relative flex h-9 w-9 items-center justify-center rounded-full border shadow-sm ${step.ringClass} ${
                          step.glow
                            ? "animate-pulse shadow-[0_0_0_2px_rgba(245,158,11,0.45),0_0_6px_4px_rgba(251,191,36,0.22),0_0_20px_6px_rgba(245,158,11,0.18)]"
                            : ""
                        }`}
                      >
                        {step.glow && (
                          <span
                            className="pointer-events-none absolute -inset-1.5 rounded-full bg-amber-400/20 blur-md"
                            aria-hidden
                          />
                        )}
                        <step.icon
                          size={16}
                          strokeWidth={1.75}
                          className={`relative z-10 ${step.iconClass}`}
                          aria-hidden
                        />
                      </span>
                      <span className="font-nav text-[10px] font-bold uppercase tracking-wide text-foreground">
                        {step.label}
                      </span>
                      <span className="font-body text-[11px] leading-none text-muted-foreground">
                        {step.date}
                      </span>
                    </div>
                  ))}
                </div>
                </div>
              </div>

              <div className="mb-8 grid grid-cols-1 gap-3 sm:grid-cols-2">
                {trustBadges.map((badge) => (
                  <div key={badge.title} className="flex gap-3 rounded-2xl border border-border/70 bg-card/40 p-4">
                    <badge.icon className="mt-0.5 h-5 w-5 shrink-0 text-primary" />
                    <div>
                      <p className="font-nav text-xs font-bold uppercase tracking-normal text-foreground">
                        {badge.title}
                      </p>
                      <p className="mt-1 font-body text-xs text-muted-foreground">
                        {badge.desc}
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="rounded-3xl border border-border/70 bg-card/40 p-5">
                <h2 className="mb-4 font-nav text-[11px] font-bold uppercase tracking-wide text-foreground">
                  Product Highlights
                </h2>
              <div className="grid grid-cols-2 gap-x-6 gap-y-5">
                {product.details && product.details.length > 0 ? (
                  product.details.map((detailStr, i) => {
                    // Try to parse out the WooCommerce "Name: Value" text safely
                    const parts = detailStr.split(':');
                    const label = parts.length > 1 ? parts[0].trim() : `Feature ${i + 1}`;
                    const value = parts.length > 1 ? parts.slice(1).join(':').trim() : detailStr;

                    return (
                      <div key={i} className="flex flex-col gap-2 relative">
                        <span className="font-nav text-xs tracking-normal font-bold uppercase text-primary">{label}</span>
                        <span className="font-body text-xs text-foreground leading-relaxed pr-2">{value}</span>
                      </div>
                    );
                  })
                ) : (
                  // Fallback content if Product object has no details map
                  <>
                    <div className="flex flex-col gap-2">
                      <span className="font-nav text-xs tracking-normal font-bold uppercase text-primary">Material</span>
                      <span className="font-body text-xs text-foreground leading-relaxed">{product.material || "Premium Quality"}</span>
                    </div>
                  </>
                )}
              </div>
              </div>

            </motion.div>
          </div>
        </section>

        {/* Reviews Section */}
        <section className="container pt-24 pb-12">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 border-t border-border/40 pt-16">
            {/* Left: Product Reviews */}
            <div className="lg:col-span-7">
              <h2 className="font-display text-2xl text-foreground mb-8">Customer Reviews</h2>

              {isLoadingReviews ? (
                <div className="space-y-6">
                  {[...Array(2)].map((_, i) => (
                    <div key={i} className="space-y-3">
                      <div className="flex justify-between">
                        <Skeleton className="h-4 w-24" />
                        <Skeleton className="h-4 w-20" />
                      </div>
                      <Skeleton className="h-3 w-16" />
                      <Skeleton className="h-12 w-full" />
                    </div>
                  ))}
                </div>
              ) : reviews.length > 0 ? (
                <div className="space-y-8">
                  {reviews.map((rev: any) => (
                    <div key={rev.id} className="border-b border-border/40 pb-6 last:border-0">
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-nav text-xs font-bold tracking-wider uppercase text-foreground">{rev.reviewer}</span>
                        <span className="font-body text-xs text-muted-foreground">{new Date(rev.date_created).toLocaleDateString()}</span>
                      </div>
                      <div className="flex text-[#ffb800] mb-3">
                        {[...Array(5)].map((_, i) => (
                          <Star key={i} size={12} fill={i < rev.rating ? "#ffb800" : "none"} strokeWidth={1} />
                        ))}
                      </div>
                      <p className="font-body text-sm text-[#444] leading-relaxed italic">"{rev.review.replace(/<[^>]+>/g, '')}"</p>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="font-body text-sm text-muted-foreground italic">No reviews yet. Be the first to share your experience.</p>
              )}
            </div>

            {/* Right: Add Review */}
            <div className="lg:col-span-5 bg-card/30 p-8 rounded-xl border border-border/40">
              <h3 className="font-nav text-xs tracking-wide uppercase text-foreground mb-6">Write a Review</h3>
              <form onSubmit={handleReviewSubmit} className="space-y-4">
                <div>
                  <label className="block font-nav text-xs tracking-wider uppercase text-muted-foreground mb-2">Rating</label>
                  <div className="flex gap-2">
                    {[1, 2, 3, 4, 5].map((num) => (
                      <button
                        key={num}
                        type="button"
                        onClick={() => setReviewForm(prev => ({ ...prev, rating: num }))}
                        className={`transition-colors ${reviewForm.rating >= num ? "text-[#ffb800]" : "text-muted-foreground/30"}`}
                      >
                        <Star size={20} fill={reviewForm.rating >= num ? "#ffb800" : "none"} />
                      </button>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <input
                    type="text"
                    required
                    placeholder="Your Name"
                    value={reviewForm.reviewer}
                    onChange={(e) => setReviewForm(prev => ({ ...prev, reviewer: e.target.value }))}
                    className="bg-transparent border border-border/60 px-4 py-3 text-sm font-body focus:outline-none focus:border-primary transition-colors w-full"
                  />
                  <input
                    type="email"
                    required
                    placeholder="Your Email"
                    value={reviewForm.reviewer_email}
                    onChange={(e) => setReviewForm(prev => ({ ...prev, reviewer_email: e.target.value }))}
                    className="bg-transparent border border-border/60 px-4 py-3 text-sm font-body focus:outline-none focus:border-primary transition-colors w-full"
                  />
                </div>

                <textarea
                  required
                  rows={4}
                  placeholder="Share your experience with this piece..."
                  value={reviewForm.review}
                  onChange={(e) => setReviewForm(prev => ({ ...prev, review: e.target.value }))}
                  className="bg-transparent border border-border/60 px-4 py-3 text-sm font-body focus:outline-none focus:border-primary transition-colors w-full resize-none"
                />

                <button
                  type="submit"
                  disabled={submitReviewMutation.isPending}
                  className="w-full bg-foreground text-primary-foreground py-4 font-nav text-xs tracking-wide uppercase hover:bg-foreground/90 transition-colors disabled:opacity-50"
                >
                  {submitReviewMutation.isPending ? "Submitting..." : "Submit Review"}
                </button>
              </form>
            </div>
          </div>
        </section>

        {/* Related */}
        {related.length > 0 && (
          <section className="pt-24 pb-12 mt-12 bg-transparent border-t border-border/40">
            <div className="container">
              <h2 className="font-display text-3xl text-center text-foreground mb-12">You May Also Love</h2>
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8">
                {related.map((p, i) => (
                  <ProductCard key={p.id} product={p} index={i} />
                ))}
              </div>
            </div>
          </section>
        )}
      </div>
    </>
  );
};

export default ProductDetail;
