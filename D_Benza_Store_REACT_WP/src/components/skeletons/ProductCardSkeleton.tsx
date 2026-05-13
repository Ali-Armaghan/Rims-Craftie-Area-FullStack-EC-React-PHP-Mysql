import { Skeleton } from "@/components/ui/skeleton";

const ProductCardSkeleton = () => {
  return (
    <div className="flex flex-col gap-4">
      {/* Image Placeholder */}
      <div className="relative aspect-square overflow-hidden rounded-sm">
        <Skeleton className="w-full h-full" />
      </div>
      
      {/* Text Content Placeholders */}
      <div className="space-y-2">
        {/* Title */}
        <Skeleton className="h-6 w-3/4" />
        {/* Category */}
        <Skeleton className="h-4 w-1/4" />
        
        {/* Price Row */}
        <div className="flex items-center gap-2 mt-1">
          <Skeleton className="h-7 w-24" />
          <Skeleton className="h-5 w-20" />
        </div>
      </div>
    </div>
  );
};

export default ProductCardSkeleton;
