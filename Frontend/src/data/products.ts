import product1 from "@/assets/product1.png";
import product2 from "@/assets/product2.png";
import product3 from "@/assets/product3.png";
import product4 from "@/assets/product4.png";
import product5 from "@/assets/product5.png";
import product6 from "@/assets/product6.png";

export interface Product {
  id: string;
  slug: string;
  name: string;
  price: number;
  originalPrice?: number;
  image: string;
  images: string[];
  video?: string | null;
  videoPosition?: number;
  category: string;
  categories?: string[];
  categoryId?: number;
  categoryIds?: number[];
  description: string;
  shortDescription?: string;
  longDescription?: string;
  details: string[];
  material: string;
  inStock: boolean;
  isSoldOut?: boolean;
  badge?: string;
  variations?: { id: number; name: string }[];
  colors?: { name: string; hex: string }[];
  rating?: string;
  reviewCount?: number;
  stockQuantity?: number;
}

export interface ProductReview {
  id: number;
  reviewer: string;
  reviewer_email: string;
  review: string;
  rating: number;
  date_created: string;
}

export const products: Product[] = [
  {
    id: "eternite-diamond-ring",
    slug: "eternite-diamond-ring",
    name: "Éternité Diamond Ring",
    price: 4850,
    originalPrice: 5200,
    image: product1,
    images: [product1, product1, product1],
    category: "Rings",
    description: "A masterpiece of timeless elegance, the Éternité Diamond Ring features a brilliant-cut center stone embraced by delicate side diamonds, set in 18k yellow gold. Each facet captures light with extraordinary brilliance.",
    details: ["18K Yellow Gold", "0.75ct Center Diamond", "VS1 Clarity, F Color", "Handcrafted in Italy", "Certificate of Authenticity"],
    material: "18K Yellow Gold & Diamond",
    inStock: true,
    badge: "Bestseller",
  },
  {
    id: "celestial-pendant",
    slug: "celestial-pendant",
    name: "Celestial Gold Pendant",
    price: 3200,
    image: product2,
    images: [product2, product2, product2],
    category: "Necklaces",
    description: "Inspired by celestial geometry, this pendant features an intricate filigree design adorned with pavé diamonds, suspended from a fine gold chain. A statement of refined artistry.",
    details: ["18K Yellow Gold", "Pavé Diamond Setting", "42cm Chain Length", "Lobster Clasp", "Gift Box Included"],
    material: "18K Yellow Gold & Diamond",
    inStock: true,
  },
  {
    id: "aurora-studs",
    slug: "aurora-studs",
    name: "Aurora Diamond Studs",
    price: 2750,
    image: product3,
    images: [product3, product3, product3],
    category: "Earrings",
    description: "The Aurora studs radiate with a halo of brilliant diamonds surrounding a central stone. Crafted in platinum for enduring beauty that transitions effortlessly from day to evening.",
    details: ["Platinum 950", "0.50ct Total Weight", "Push-Back Closure", "Conflict-Free Diamonds", "Lifetime Warranty"],
    material: "Platinum & Diamond",
    inStock: true,
    badge: "New",
  },
  {
    id: "sovereign-bracelet",
    slug: "sovereign-bracelet",
    name: "Sovereign Chain Bracelet",
    price: 5600,
    image: product4,
    images: [product4, product4, product4],
    category: "Bracelets",
    description: "Bold yet refined, the Sovereign bracelet features substantial Cuban links in brushed and polished 18k gold. A powerful expression of luxury craftsmanship.",
    details: ["18K Yellow Gold", "20cm Length", "Brushed & Polished Finish", "Safety Clasp", "60g Weight"],
    material: "18K Yellow Gold",
    inStock: true,
  },
  {
    id: "perle-necklace",
    slug: "perle-necklace",
    name: "Perle Royale Necklace",
    price: 6800,
    originalPrice: 7500,
    image: product5,
    images: [product5, product5, product5],
    category: "Necklaces",
    description: "South Sea pearls of exceptional lustre are interspersed with diamond rondelles in this breathtaking necklace. Each pearl is hand-selected for its perfect spherical form.",
    details: ["South Sea Pearls 10-12mm", "Diamond Rondelles", "Sterling Silver Clasp", "45cm Length", "Silk Knotted"],
    material: "Pearl & Diamond",
    inStock: true,
    badge: "Limited",
  },
  {
    id: "rose-gold-timepiece",
    slug: "rose-gold-timepiece",
    name: "Rose Diamond Timepiece",
    price: 12500,
    image: product6,
    images: [product6, product6, product6],
    category: "Watches",
    description: "Where haute horlogerie meets high jewelry. This Swiss-made timepiece features a diamond-set bezel in rose gold, with a sunray dial that shifts between blush and copper tones.",
    details: ["18K Rose Gold Case", "Swiss Automatic Movement", "Diamond Bezel (1.2ct)", "Sapphire Crystal", "Water Resistant 50m"],
    material: "18K Rose Gold & Diamond",
    inStock: true,
    badge: "Exclusive",
  },
];

export const categories = ["All", "Rings", "Necklaces", "Earrings", "Bracelets", "Watches"];
