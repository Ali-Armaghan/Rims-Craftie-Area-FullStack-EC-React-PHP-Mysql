import { Skeleton } from "@/components/ui/skeleton";
import { ChevronLeft } from "lucide-react";

const ProductDetailSkeleton = () => {
  return (
    <div className="bg-background min-h-screen pb-20">
      {/* Top Navigation */}
      <div className="container py-8">
        <div className="inline-flex items-center gap-2 opacity-50">
          <ChevronLeft size={16} strokeWidth={1.5} />
          <Skeleton className="h-4 w-32" />
        </div>
      </div>

      <section className="container">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-start">
          
          {/* Left Column - Image Placeholder */}
          <div className="relative rounded-2xl overflow-hidden aspect-square">
            <Skeleton className="w-full h-full" />
          </div>

          {/* Right Column - Info Placeholder */}
          <div className="flex flex-col py-2 space-y-8">
            <div className="space-y-4">
              {/* Category & Stock */}
              <div className="flex items-center gap-3">
                <Skeleton className="h-3 w-20" />
                <span className="text-muted-foreground/50 text-[10px]">|</span>
                <Skeleton className="h-3 w-24" />
              </div>
              
              {/* Title */}
              <Skeleton className="h-12 w-full" />
              <Skeleton className="h-12 w-2/3" />
              
              {/* Rating */}
              <div className="flex items-center gap-2">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-4 w-32" />
              </div>
            </div>

            {/* Price Line */}
            <div className="flex items-center gap-4">
              <Skeleton className="h-[44px] w-48" />
              <Skeleton className="h-[24px] w-32" />
            </div>

            {/* Actions */}
            <div className="space-y-4">
              {/* Quantity Selector */}
              <Skeleton className="h-12 w-36" />
              
              {/* Buttons */}
              <div className="flex flex-col gap-3">
                <Skeleton className="h-12 w-full" />
                <Skeleton className="h-12 w-full" />
              </div>
            </div>

            {/* Details Grid */}
            <div className="grid grid-cols-2 lg:grid-cols-3 gap-y-8 gap-x-6 pt-8 border-t border-border/60">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="flex flex-col gap-2">
                  <Skeleton className="h-3 w-16" />
                  <Skeleton className="h-4 w-24" />
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default ProductDetailSkeleton;
