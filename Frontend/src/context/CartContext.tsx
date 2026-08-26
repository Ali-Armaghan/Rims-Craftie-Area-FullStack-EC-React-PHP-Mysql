import React, { createContext, useContext, useState, useCallback, useEffect } from "react";
import { Product } from "@/data/products";
import { trackAddToCart } from "@/lib/meta-pixel";
import { trackGAAddToCart } from "@/lib/google-analytics";

export type SelectedColor = {
  name: string;
  hex: string;
};

export interface CartItem {
  product: Product;
  quantity: number;
  selectedColor?: SelectedColor | null;
}

interface CartContextType {
  items: CartItem[];
  addToCart: (
    product: Product,
    quantity?: number,
    selectedColor?: SelectedColor | null
  ) => void;
  removeFromCart: (productId: string, selectedColor?: SelectedColor | null) => void;
  updateQuantity: (
    productId: string,
    quantity: number,
    selectedColor?: SelectedColor | null
  ) => void;
  clearCart: () => void;
  totalItems: number;
  totalPrice: number;
}

const CART_STORAGE_KEY = "ateeqo_cart";

export function cartLineKey(
  productId: string,
  selectedColor?: SelectedColor | null
) {
  const colorPart = selectedColor?.hex || selectedColor?.name || "default";
  return `${productId}::${colorPart}`;
}

function sameCartLine(
  item: CartItem,
  productId: string,
  selectedColor?: SelectedColor | null
) {
  return cartLineKey(item.product.id, item.selectedColor) ===
    cartLineKey(productId, selectedColor);
}

function isValidCartItem(value: unknown): value is CartItem {
  if (!value || typeof value !== "object") return false;
  const item = value as CartItem;
  const colorOk =
    item.selectedColor == null ||
    (typeof item.selectedColor === "object" &&
      typeof item.selectedColor.name === "string" &&
      typeof item.selectedColor.hex === "string");
  return (
    typeof item.quantity === "number" &&
    item.quantity > 0 &&
    !!item.product &&
    typeof item.product.id === "string" &&
    typeof item.product.name === "string" &&
    typeof item.product.price === "number" &&
    colorOk
  );
}

function loadCartFromStorage(): CartItem[] {
  try {
    const stored = localStorage.getItem(CART_STORAGE_KEY);
    if (!stored) return [];
    const parsed = JSON.parse(stored);
    if (!Array.isArray(parsed)) return [];
    return parsed.filter(isValidCartItem);
  } catch {
    return [];
  }
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [items, setItems] = useState<CartItem[]>(loadCartFromStorage);

  useEffect(() => {
    localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(items));
  }, [items]);

  const addToCart = useCallback(
    (
      product: Product,
      quantity: number = 1,
      selectedColor: SelectedColor | null = null
    ) => {
      const color =
        selectedColor?.name && selectedColor?.hex
          ? { name: selectedColor.name, hex: selectedColor.hex }
          : null;

      setItems((prev) => {
        const existing = prev.find((i) =>
          sameCartLine(i, product.id, color)
        );
        if (existing) {
          return prev.map((i) =>
            sameCartLine(i, product.id, color)
              ? { ...i, quantity: i.quantity + quantity }
              : i
          );
        }
        return [...prev, { product, quantity, selectedColor: color }];
      });

      trackAddToCart(product, quantity, {
        color: color?.name ?? null,
      });
      trackGAAddToCart(product, quantity, {
        color: color?.name ?? null,
      });
    },
    []
  );

  const removeFromCart = useCallback(
    (productId: string, selectedColor: SelectedColor | null = null) => {
      setItems((prev) =>
        prev.filter((i) => !sameCartLine(i, productId, selectedColor))
      );
    },
    []
  );

  const updateQuantity = useCallback(
    (
      productId: string,
      quantity: number,
      selectedColor: SelectedColor | null = null
    ) => {
      if (quantity <= 0) {
        setItems((prev) =>
          prev.filter((i) => !sameCartLine(i, productId, selectedColor))
        );
      } else {
        setItems((prev) =>
          prev.map((i) =>
            sameCartLine(i, productId, selectedColor) ? { ...i, quantity } : i
          )
        );
      }
    },
    []
  );

  const clearCart = useCallback(() => {
    setItems([]);
    localStorage.removeItem(CART_STORAGE_KEY);
  }, []);

  const totalItems = items.reduce((sum, i) => sum + i.quantity, 0);
  const totalPrice = items.reduce((sum, i) => sum + i.product.price * i.quantity, 0);

  return (
    <CartContext.Provider value={{ items, addToCart, removeFromCart, updateQuantity, clearCart, totalItems, totalPrice }}>
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used within CartProvider");
  return ctx;
};
