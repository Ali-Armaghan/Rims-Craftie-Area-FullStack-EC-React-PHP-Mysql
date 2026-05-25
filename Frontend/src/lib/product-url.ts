import type { Product } from "@/data/products";

export function getProductUrl(product: Pick<Product, "slug" | "id">): string {
  return `/product/${product.slug || product.id}`;
}
