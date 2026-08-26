import type { Product } from "@/data/products";

export const GA_MEASUREMENT_ID = "G-X4PYPTKP9P";

export type GAItem = {
  item_id: string;
  item_name?: string;
  item_category?: string;
  price?: number;
  quantity?: number;
  item_variant?: string;
};

type GtagFunction = (...args: unknown[]) => void;

declare global {
  interface Window {
    dataLayer?: unknown[];
    gtag?: GtagFunction;
  }
}

const CURRENCY = "PKR";

/**
 * Safe wrapper around window.gtag
 */
export function gtag(...args: unknown[]) {
  if (typeof window === "undefined") {
    return;
  }
  if (typeof window.gtag === "function") {
    window.gtag(...args);
  } else if (Array.isArray(window.dataLayer)) {
    window.dataLayer.push(args);
  }
}

/**
 * Fires page_view / config event for Google Analytics 4.
 * Essential for SPA route changes.
 */
export function trackGAPageView(pagePath?: string, pageTitle?: string) {
  const path =
    pagePath ??
    (typeof window !== "undefined"
      ? window.location.pathname + window.location.search
      : "");
  const title =
    pageTitle ?? (typeof document !== "undefined" ? document.title : "");

  gtag("config", GA_MEASUREMENT_ID, {
    page_path: path,
    page_title: title,
    page_location: typeof window !== "undefined" ? window.location.href : "",
  });
}

/**
 * General GA event dispatcher
 */
export function trackGAEvent(
  eventName: string,
  params?: Record<string, unknown>
) {
  gtag("event", eventName, params ?? {});
}

/**
 * Product detail view (view_item)
 */
export function trackGAViewItem(product: Product) {
  trackGAEvent("view_item", {
    currency: CURRENCY,
    value: Number(product.price) || 0,
    items: [
      {
        item_id: String(product.id),
        item_name: product.name,
        item_category: product.category,
        price: Number(product.price) || 0,
        quantity: 1,
      },
    ],
  });
}

/**
 * Search event (search)
 */
export function trackGASearch(searchQuery: string) {
  const query = searchQuery.trim();
  if (!query) return;
  trackGAEvent("search", {
    search_term: query,
  });
}

/**
 * Add to cart (add_to_cart)
 */
export function trackGAAddToCart(
  product: Product,
  quantity = 1,
  extras?: { color?: string | null }
) {
  const qty = Math.max(1, quantity);
  trackGAEvent("add_to_cart", {
    currency: CURRENCY,
    value: (Number(product.price) || 0) * qty,
    items: [
      {
        item_id: String(product.id),
        item_name: product.name,
        item_category: product.category,
        price: Number(product.price) || 0,
        quantity: qty,
        item_variant: extras?.color || undefined,
      },
    ],
  });
}

/**
 * Add to wishlist (add_to_wishlist)
 */
export function trackGAAddToWishlist(product: Product) {
  trackGAEvent("add_to_wishlist", {
    currency: CURRENCY,
    value: Number(product.price) || 0,
    items: [
      {
        item_id: String(product.id),
        item_name: product.name,
        item_category: product.category,
        price: Number(product.price) || 0,
        quantity: 1,
      },
    ],
  });
}

/**
 * Initiate checkout (begin_checkout)
 */
export function trackGABeginCheckout(params: {
  contents: Array<{ id: string; quantity?: number; item_price?: number }>;
  value: number;
  numItems?: number;
}) {
  trackGAEvent("begin_checkout", {
    currency: CURRENCY,
    value: params.value,
    items: params.contents.map((item) => ({
      item_id: item.id,
      price: item.item_price || 0,
      quantity: item.quantity || 1,
    })),
  });
}

/**
 * Purchase event (purchase)
 */
export function trackGAPurchase(params: {
  orderId?: string | number | null;
  orderNumber?: string | null;
  contents: Array<{ id: string; quantity?: number; item_price?: number }>;
  value: number;
  numItems?: number;
}) {
  const transactionId =
    params.orderNumber ||
    (params.orderId ? String(params.orderId) : `order_${Date.now()}`);

  trackGAEvent("purchase", {
    transaction_id: transactionId,
    currency: CURRENCY,
    value: params.value,
    items: params.contents.map((item) => ({
      item_id: item.id,
      price: item.item_price || 0,
      quantity: item.quantity || 1,
    })),
  });
}

/**
 * User sign up (sign_up)
 */
export function trackGASignUp(method = "email") {
  trackGAEvent("sign_up", {
    method,
  });
}

/**
 * Contact form or lead generation (generate_lead)
 */
export function trackGALead(leadType = "contact_form") {
  trackGAEvent("generate_lead", {
    lead_type: leadType,
  });
}
