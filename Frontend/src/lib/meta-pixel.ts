import type { Product } from "@/data/products";

export const META_PIXEL_ID = "2704153523295578";

export type MetaPixelContent = {
  id: string;
  quantity?: number;
  item_price?: number;
};

type FbqFunction = {
  (...args: unknown[]): void;
  callMethod?: (...args: unknown[]) => void;
  queue?: unknown[];
  loaded?: boolean;
  version?: string;
  push?: (...args: unknown[]) => void;
};

declare global {
  interface Window {
    fbq?: FbqFunction;
    _fbq?: FbqFunction;
  }
}

const CURRENCY = "PKR";

function fbq(...args: unknown[]) {
  if (typeof window === "undefined" || typeof window.fbq !== "function") {
    return;
  }
  window.fbq(...args);
}

export function trackMetaEvent(
  event: string,
  params?: Record<string, unknown>,
  eventId?: string
) {
  if (eventId) {
    fbq("track", event, params ?? {}, { eventID: eventId });
    return;
  }
  fbq("track", event, params ?? {});
}

export function trackMetaCustomEvent(
  event: string,
  params?: Record<string, unknown>
) {
  fbq("trackCustom", event, params ?? {});
}

export function trackMetaPageView() {
  trackMetaEvent("PageView");
}

function productContents(
  product: Pick<Product, "id" | "price">,
  quantity = 1
): MetaPixelContent[] {
  return [
    {
      id: String(product.id),
      quantity,
      item_price: Number(product.price) || 0,
    },
  ];
}

export function trackViewContent(product: Product) {
  trackMetaEvent("ViewContent", {
    content_ids: [String(product.id)],
    content_name: product.name,
    content_type: "product",
    content_category: product.category,
    contents: productContents(product, 1),
    currency: CURRENCY,
    value: Number(product.price) || 0,
  });
}

export function trackSearch(searchString: string) {
  const trimmed = searchString.trim();
  if (!trimmed) return;
  trackMetaEvent("Search", {
    search_string: trimmed,
    content_category: "product",
  });
}

export function trackAddToCart(
  product: Product,
  quantity = 1,
  extras?: { color?: string | null }
) {
  const qty = Math.max(1, quantity);
  trackMetaEvent("AddToCart", {
    content_ids: [String(product.id)],
    content_name: product.name,
    content_type: "product",
    content_category: product.category,
    contents: productContents(product, qty),
    currency: CURRENCY,
    value: (Number(product.price) || 0) * qty,
    num_items: qty,
    ...(extras?.color ? { color: extras.color } : {}),
  });
}

export function trackAddToWishlist(product: Product) {
  trackMetaEvent("AddToWishlist", {
    content_ids: [String(product.id)],
    content_name: product.name,
    content_type: "product",
    content_category: product.category,
    contents: productContents(product, 1),
    currency: CURRENCY,
    value: Number(product.price) || 0,
  });
}

export function trackInitiateCheckout(params: {
  contents: MetaPixelContent[];
  value: number;
  numItems: number;
}) {
  trackMetaEvent("InitiateCheckout", {
    content_ids: params.contents.map((item) => item.id),
    content_type: "product",
    contents: params.contents,
    currency: CURRENCY,
    value: params.value,
    num_items: params.numItems,
  });
}

export function trackPurchase(params: {
  orderId?: string | number | null;
  orderNumber?: string | null;
  contents: MetaPixelContent[];
  value: number;
  numItems: number;
}) {
  const eventId = params.orderId
    ? `purchase_${params.orderId}`
    : params.orderNumber
      ? `purchase_${params.orderNumber}`
      : undefined;

  trackMetaEvent(
    "Purchase",
    {
      content_ids: params.contents.map((item) => item.id),
      content_type: "product",
      contents: params.contents,
      currency: CURRENCY,
      value: params.value,
      num_items: params.numItems,
      ...(params.orderId != null ? { order_id: String(params.orderId) } : {}),
      ...(params.orderNumber ? { order_number: params.orderNumber } : {}),
    },
    eventId
  );
}

export function trackCompleteRegistration(method = "email") {
  trackMetaEvent("CompleteRegistration", {
    content_name: "Ateeqo Account",
    status: true,
    method,
  });
}

export function trackContact() {
  trackMetaEvent("Contact");
}

export function trackLead() {
  trackMetaEvent("Lead");
}
