import { useState } from "react";
import { Link } from "react-router-dom";
import { ImageIcon } from "lucide-react";
import { cn } from "@/lib/utils";

type BannerSlot = {
  id: string;
  label: string;
  href: string;
  /** Put your image in public/banners/ with this file name */
  imageSrc: string;
};

const TOP_BANNERS: BannerSlot[] = [
  {
    id: "top-all-bags",
    label: "All Bags",
    href: "/products",
    imageSrc: "/banners/top-all-bags.jpg",
  },
  {
    id: "top-premium",
    label: "Premium Bags",
    href: "/products",
    imageSrc: "/banners/top-premium.jpg",
  },
];

const BOTTOM_BANNERS: BannerSlot[] = [
  {
    id: "bottom-2499",
    label: "Under 2499",
    href: "/products",
    imageSrc: "/banners/bottom-2499.jpg",
  },
  {
    id: "bottom-1999",
    label: "Under 1999",
    href: "/products",
    imageSrc: "/banners/bottom-1999.jpg",
  },
  {
    id: "bottom-1499",
    label: "Under 1499",
    href: "/products",
    imageSrc: "/banners/bottom-1499.jpg",
  },
];

function BannerTile({ slot, className }: { slot: BannerSlot; className?: string }) {
  const [hasImage, setHasImage] = useState(true);

  return (
    <Link
      to={slot.href}
      className={cn(
        "group relative block w-full overflow-hidden bg-secondary/60",
        className
      )}
    >
      {hasImage ? (
        <img
          src={slot.imageSrc}
          alt={slot.label}
          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.02]"
          onError={() => setHasImage(false)}
        />
      ) : (
        <div className="flex h-full w-full flex-col items-center justify-center gap-2 bg-muted/80 p-4 text-center">
          <ImageIcon className="h-8 w-8 text-muted-foreground/50" strokeWidth={1.5} />
          <span className="font-body text-sm font-medium text-muted-foreground">{slot.label}</span>
          <span className="max-w-[200px] break-all font-body text-xs text-muted-foreground/70">
            public{slot.imageSrc}
          </span>
        </div>
      )}
    </Link>
  );
}

const HomePromoBanners = () => {
  return (
    <section className="w-full overflow-x-hidden bg-background py-3 md:py-4">
      <div className="w-full space-y-1.5 px-2 sm:space-y-2 sm:px-3 lg:px-4">
        <div className="grid grid-cols-1 gap-1.5 sm:grid-cols-2 sm:gap-2">
          {TOP_BANNERS.map((slot) => (
            <BannerTile
              key={slot.id}
              slot={slot}
              className="aspect-[5/2] sm:aspect-[2/1]"
            />
          ))}
        </div>

        <div className="grid grid-cols-1 gap-1.5 sm:grid-cols-3 sm:gap-2">
          {BOTTOM_BANNERS.map((slot) => (
            <BannerTile
              key={slot.id}
              slot={slot}
              className="aspect-[3/2] sm:aspect-[5/2]"
            />
          ))}
        </div>
      </div>
    </section>
  );
};

export default HomePromoBanners;
