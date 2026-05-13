import { useParams, Link, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { ShoppingBag, ChevronLeft, ChevronRight } from "lucide-react";
import { useProduct } from "@/hooks/useProduct";
import { useCart } from "@/context/CartContext";
import ProductCard from "@/components/ProductCard";
import { useState, useEffect, useMemo } from "react";
import { useProductReviews, useSubmitReview } from "@/hooks/useProductReviews";
import { Star } from "lucide-react";
import ProductDetailSkeleton from "@/components/skeletons/ProductDetailSkeleton";
import { Skeleton } from "@/components/ui/skeleton";

const ProductDetail = () => {
  const { id } = useParams();
  const { addToCart } = useCart();
  const { product, isLoading, error } = useProduct(id);
  const { data: reviews = [], isLoading: isLoadingReviews } = useProductReviews(id);
  const submitReviewMutation = useSubmitReview();
  const navigate = useNavigate();

  // All Hooks must be at the top level
  const [added, setAdded] = useState(false);
  const [quantity, setQuantity] = useState(1);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [slideDirection, setSlideDirection] = useState(1);
  const [selectedOption, setSelectedOption] = useState("Large");

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
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-start">

            {/* Left Column - Image Gallery */}
            <motion.div
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6 }}
              className="relative rounded-2xl overflow-hidden aspect-square lg:sticky lg:top-8 group bg-card"
            >
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
                  className="w-full h-full object-cover"
                />
              </AnimatePresence>

              {/* Carousel Navigation Arrows */}
              {images.length > 1 && (
                <>
                  <button
                    onClick={handlePrevImage}
                    className="absolute left-6 top-1/2 -translate-y-1/2 w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300 hover:scale-110 active:scale-95 z-10 text-foreground"
                    aria-label="Previous image"
                  >
                    <ChevronLeft size={20} strokeWidth={1.5} />
                  </button>
                  <button
                    onClick={handleNextImage}
                    className="absolute right-6 top-1/2 -translate-y-1/2 w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300 hover:scale-110 active:scale-95 z-10 text-foreground"
                    aria-label="Next image"
                  >
                    <ChevronRight size={20} strokeWidth={1.5} />
                  </button>
                </>
              )}

              {/* Carousel Indicators (Dots) */}
              {images.length > 1 && (
                <div className="absolute bottom-8 left-0 right-0 flex justify-center gap-2.5 z-10">
                  {images.map((_, idx) => (
                    <button
                      key={idx}
                      onClick={() => {
                        setSlideDirection(idx > currentImageIndex ? 1 : -1);
                        setCurrentImageIndex(idx);
                      }}
                      className={`h-1.5 transition-all duration-300 rounded-full ${currentImageIndex === idx ? "w-4 bg-foreground" : "w-1.5 bg-foreground/30 hover:bg-foreground/50"
                        }`}
                      aria-label={`View image ${idx + 1}`}
                    />
                  ))}
                </div>
              )}
            </motion.div>

            {/* Right Column - Product Info */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="flex flex-col py-2"
            >
              {/* Category / Brand Note & Stock */}
              <div className="flex items-center gap-3 mb-4">
                <p className="font-nav text-[11px] tracking-[0.2em] font-bold uppercase text-muted-foreground">
                  {product.category || "LUXURY"}
                </p>
                <span className="text-muted-foreground/50 text-[10px]">|</span>
                <p className="font-nav text-[12px] tracking-[0.1em] font-extrabold uppercase text-foreground">
                  {product.inStock
                    ? (product.stockQuantity !== undefined ? `Stock Left: ${product.stockQuantity}` : "In Stock")
                    : "Out of Stock"
                  }
                </p>
              </div>

              {/* Title */}
              <h1 className="font-display text-4xl lg:text-[44px] text-foreground mb-4 leading-[1.15]">
                {product.name}
              </h1>

              {/* Stars & Reviews */}
              <div className="flex items-center gap-2 mb-6">
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
              </div>

              {/* Price Line */}
              <div className="flex items-center gap-4 mb-8">
                <span className="font-display text-[44px] font-bold text-foreground leading-none">
                  Rs. {product.price.toLocaleString()}
                </span>
                {product.originalPrice && (
                  <>
                    <span className="font-body text-[24px] font-medium text-muted-foreground line-through decoration-muted-foreground/60 decoration-2 leading-none self-end pb-1.5">
                      Rs. {product.originalPrice.toLocaleString()}
                    </span>
                    {discountBadge && (
                      <span className="bg-[#f0f0f0] text-[#111111] font-body text-[13px] uppercase px-3.5 py-1.5 rounded-full font-bold ml-1 self-center">
                        {discountBadge}
                      </span>
                    )}
                  </>
                )}
              </div>

              {/* Options */}
              {product.variations && product.variations.length > 0 && (
                <div className="mb-8">
                  <p className="font-nav text-[10px] tracking-[0.15em] font-bold uppercase text-[#1a1a1a] mb-3">Select Option</p>
                  <div className="flex flex-wrap gap-2.5">
                    {product.variations.map((opt) => (
                      <button
                        key={opt.id}
                        onClick={() => setSelectedOption(opt.name)}
                        className={`px-8 py-2.5 font-body text-[13px] font-medium transition-colors border ${selectedOption === opt.name
                          ? "bg-[#222222] border-[#222222] text-white"
                          : "bg-white border-border text-[#222222] hover:border-[#222222]"
                          }`}
                      >
                        {opt.name}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Actions */}
              <div className="flex flex-col gap-5 mb-12">
                <div className="flex items-center gap-4">
                  <div className="flex items-center border border-border">
                    <button
                      onClick={() => setQuantity(Math.max(1, quantity - 1))}
                      className="w-12 h-12 flex items-center justify-center text-foreground hover:bg-secondary transition-colors"
                      aria-label="Decrease quantity"
                      disabled={!product.inStock || quantity <= 1}
                    >
                      -
                    </button>
                    <span className="w-12 h-12 flex items-center justify-center font-display text-lg font-bold">
                      {quantity}
                    </span>
                    <button
                      onClick={() => {
                        if (product.stockQuantity !== undefined) {
                          setQuantity(Math.min(product.stockQuantity, quantity + 1));
                        } else {
                          setQuantity(quantity + 1);
                        }
                      }}
                      className="w-12 h-12 flex items-center justify-center text-foreground hover:bg-secondary transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                      aria-label="Increase quantity"
                      disabled={!product.inStock || (product.stockQuantity !== undefined && quantity >= product.stockQuantity)}
                    >
                      +
                    </button>
                  </div>
                </div>

                <div className="flex flex-col gap-3">
                  <button
                    onClick={handleAdd}
                    disabled={!product.inStock}
                    className={`w-full py-4 font-nav text-xs tracking-[0.2em] uppercase flex items-center justify-center gap-2 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed ${added
                      ? "bg-[#ffb800] text-[#1a1a1a]"
                      : "bg-[#222222] text-white hover:bg-black"
                      }`}
                  >
                    <ShoppingBag size={15} strokeWidth={1.5} />
                    {added ? "Added ✓" : "Add to Cart"}
                  </button>
                  <button
                    onClick={handleBuyNow}
                    disabled={!product.inStock}
                    className="w-full py-4 font-nav text-xs tracking-[0.2em] uppercase flex items-center justify-center transition-all bg-[#0a0a0a] text-white hover:bg-black/90 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Buy Now
                  </button>
                </div>

                {/* Short Description */}
                {product.shortDescription && (
                  <div className="mt-6 font-body text-sm text-muted-foreground leading-relaxed italic border-l-2 border-primary/20 pl-4 py-1">
                    {product.shortDescription}
                  </div>
                )}
              </div>

              {/* Separator */}
              <hr className="border-border/60 mb-8" />

              {/* Details Grid (similar to Perfume Notes) */}
              <div className="grid grid-cols-2 lg:grid-cols-3 gap-y-8 gap-x-6">
                {product.details && product.details.length > 0 ? (
                  product.details.map((detailStr, i) => {
                    // Try to parse out the WooCommerce "Name: Value" text safely
                    const parts = detailStr.split(':');
                    const label = parts.length > 1 ? parts[0].trim() : `Feature ${i + 1}`;
                    const value = parts.length > 1 ? parts.slice(1).join(':').trim() : detailStr;

                    return (
                      <div key={i} className="flex flex-col gap-2 relative">
                        <span className="font-nav text-[9px] tracking-[0.15em] font-bold uppercase text-[#c8a14d]">{label}</span>
                        <span className="font-body text-xs text-[#222222] leading-relaxed pr-2">{value}</span>
                      </div>
                    );
                  })
                ) : (
                  // Fallback content if Product object has no details map
                  <>
                    <div className="flex flex-col gap-2">
                      <span className="font-nav text-[9px] tracking-[0.15em] font-bold uppercase text-[#c8a14d]">Material</span>
                      <span className="font-body text-xs text-[#222222] leading-relaxed">{product.material || "Premium Quality"}</span>
                    </div>
                  </>
                )}
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
                        <span className="font-body text-[10px] text-muted-foreground">{new Date(rev.date_created).toLocaleDateString()}</span>
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
              <h3 className="font-nav text-xs tracking-[0.2em] uppercase text-foreground mb-6">Write a Review</h3>
              <form onSubmit={handleReviewSubmit} className="space-y-4">
                <div>
                  <label className="block font-nav text-[10px] tracking-wider uppercase text-muted-foreground mb-2">Rating</label>
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
                  className="w-full bg-foreground text-primary-foreground py-4 font-nav text-[10px] tracking-[0.2em] uppercase hover:bg-foreground/90 transition-colors disabled:opacity-50"
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
