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
    id: "top-nikkah-collection",
    label: "Nikkah Booklets & Nama",
    href: "/products",
    imageSrc: "/craft/banners/banner_nikkah_collection.jpg",
    width: 1200,
    height: 600,
  },
  {
    id: "top-resin-art",
    label: "Handmade Resin Trays & Platters",
    href: "/products",
    imageSrc: "/craft/banners/banner_resin_art.jpg",
    width: 1200,
    height: 600,
  },
];

const BOTTOM_BANNERS: BannerSlot[] = [
  {
    id: "bottom-preservation",
    label: "Wedding Flower Preservation",
    href: "/products",
    imageSrc: "/craft/banners/banner_preservation.jpg",
    width: 1200,
    height: 600,
  },
  {
    id: "bottom-wedding-gifts",
    label: "Bespoke Wedding Gifts & Pens",
    href: "/products",
    imageSrc: "/craft/banners/banner_wedding_gifts.jpg",
    width: 800,
    height: 600,
  },
  {
    id: "bottom-custom-frames",
    label: "Custom Keepsake Plaques",
    href: "/products",
    imageSrc: "/craft/banners/banner_custom_frames.jpg",
    width: 800,
    height: 600,
  },
];

function BannerTile({ slot }: { slot: BannerSlot }) {
  const [hasImage, setHasImage] = useState(true);

  return (
    <Link
      to={slot.href}
      className="group relative block min-w-0 w-full overflow-hidden rounded-md bg-secondary/60 leading-none shadow-sm transition-shadow hover:shadow-md"
    >
      {hasImage ? (
        <div className="relative aspect-[16/9] w-full overflow-hidden bg-muted">
          <img
            src={slot.imageSrc}
            alt={slot.label}
            width={slot.width}
            height={slot.height}
            loading="lazy"
            decoding="async"
            className="h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
            onError={() => setHasImage(false)}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent opacity-80 transition-opacity group-hover:opacity-90" />
          <div className="absolute bottom-3 left-3 right-3 sm:bottom-4 sm:left-4 sm:right-4">
            <span className="inline-block rounded-full bg-background/90 px-3 py-1 text-xs font-semibold tracking-wide text-foreground backdrop-blur-sm">
              {slot.label}
            </span>
          </div>
        </div>
      ) : (
        <div className="flex min-h-[140px] w-full flex-col items-center justify-center gap-2 bg-muted/80 p-4 text-center">
          <ImageIcon className="h-8 w-8 text-muted-foreground/50" strokeWidth={1.5} />
          <span className="font-body text-sm font-medium text-muted-foreground">{slot.label}</span>
        </div>
      )}
    </Link>
  );
}

const HomePromoBanners = () => {
  return (
    <section className="w-full overflow-x-hidden bg-background py-4 md:py-6">
      <div className="w-full space-y-3 px-3 sm:space-y-4 sm:px-4 lg:px-6">
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-4">
          {TOP_BANNERS.map((slot) => (
            <BannerTile key={slot.id} slot={slot} />
          ))}
        </div>

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3 sm:gap-4">
          {BOTTOM_BANNERS.map((slot) => (
            <div key={slot.id}>
              <BannerTile slot={slot} />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default HomePromoBanners;
