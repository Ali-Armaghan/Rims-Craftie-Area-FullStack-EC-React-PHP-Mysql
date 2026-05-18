import { useState } from "react";
import { Link } from "react-router-dom";
import { ImageIcon } from "lucide-react";

type BannerSlot = {
  id: string;
  label: string;
  href: string;
  imageSrc: string;
  width: number;
  height: number;
};

const TOP_BANNERS: BannerSlot[] = [
  {
    id: "top-all-bags",
    label: "All Bags",
    href: "/products",
    imageSrc: "/banners/03_4_11zon.webp",
    width: 3228,
    height: 1280,
  },
  {
    id: "top-premium",
    label: "Premium Bags",
    href: "/products",
    imageSrc: "/banners/01_11zon_1.webp",
    width: 3228,
    height: 1280,
  },
];

/** Wide 3228×1280 + square 2300×1824 — 2fr 1fr 1fr columns align row height naturally */
const BOTTOM_BANNERS: BannerSlot[] = [
  {
    id: "bottom-2499",
    label: "Under 2499",
    href: "/products",
    imageSrc: "/banners/04_5_11zon.webp",
    width: 3228,
    height: 1280,
  },
  {
    id: "bottom-1999",
    label: "Under 1999",
    href: "/products",
    imageSrc: "/banners/02_3_11zon_1__jpg.webp",
    width: 2300,
    height: 1824,
  },
  {
    id: "bottom-1499",
    label: "Under 1499",
    href: "/products",
    imageSrc: "/banners/ormee1_1.webp",
    width: 2300,
    height: 1824,
  },
];

function BannerTile({ slot }: { slot: BannerSlot }) {
  const [hasImage, setHasImage] = useState(true);

  return (
    <Link
      to={slot.href}
      className="group block min-w-0 w-full overflow-hidden bg-secondary/60 leading-none"
    >
      {hasImage ? (
        <img
          src={slot.imageSrc}
          alt={slot.label}
          width={slot.width}
          height={slot.height}
          loading="lazy"
          decoding="async"
          className="block h-auto w-full transition-transform duration-500 group-hover:scale-[1.01]"
          onError={() => setHasImage(false)}
        />
      ) : (
        <div className="flex min-h-[120px] w-full flex-col items-center justify-center gap-2 bg-muted/80 p-4 text-center">
          <ImageIcon className="h-8 w-8 text-muted-foreground/50" strokeWidth={1.5} />
          <span className="font-body text-sm font-medium text-muted-foreground">{slot.label}</span>
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
            <BannerTile key={slot.id} slot={slot} />
          ))}
        </div>

        <div className="grid grid-cols-1 gap-1.5 sm:grid-cols-[2fr_1fr_1fr] sm:gap-2">
          {BOTTOM_BANNERS.map((slot, index) => (
            <div key={slot.id} className={index >= 1 ? "hidden md:block" : undefined}>
              <BannerTile slot={slot} />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default HomePromoBanners;
