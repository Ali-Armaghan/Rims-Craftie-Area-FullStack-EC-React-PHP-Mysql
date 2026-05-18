import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

const ProductCardSkeleton = ({ compact = false }: { compact?: boolean }) => {
  return (
    <div className={cn("flex w-full min-w-0 flex-col", compact ? "gap-1.5" : "gap-4")}>
      <div className="aspect-square w-full overflow-hidden rounded-sm">
        <Skeleton className="h-full w-full" />
      </div>

      <div className="space-y-2">
        <Skeleton className={cn("w-3/4", compact ? "h-4" : "h-6")} />
        <Skeleton className="h-3 w-1/2" />
        <Skeleton className={cn(compact ? "h-5 w-20" : "h-7 w-24")} />
      </div>
    </div>
  );
};

export default ProductCardSkeleton;
