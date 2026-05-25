import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";
import { Product } from "@/data/products";

const FAVORITES_STORAGE_KEY = "ateeqo_favorites";

interface FavoritesContextType {
  favorites: Product[];
  totalFavorites: number;
  isFavorite: (productId: string) => boolean;
  toggleFavorite: (product: Product) => boolean;
  addFavorite: (product: Product) => void;
  removeFavorite: (productId: string) => void;
  clearFavorites: () => void;
}

function isValidProduct(value: unknown): value is Product {
  if (!value || typeof value !== "object") return false;
  const product = value as Product;
  return (
    typeof product.id === "string" &&
    typeof product.name === "string" &&
    typeof product.price === "number" &&
    typeof product.image === "string"
  );
}

function loadFavoritesFromStorage(): Product[] {
  try {
    const stored = localStorage.getItem(FAVORITES_STORAGE_KEY);
    if (!stored) return [];
    const parsed = JSON.parse(stored);
    if (!Array.isArray(parsed)) return [];
    return parsed.filter(isValidProduct);
  } catch {
    return [];
  }
}

const FavoritesContext = createContext<FavoritesContextType | undefined>(
  undefined
);

export const FavoritesProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [favorites, setFavorites] = useState<Product[]>(loadFavoritesFromStorage);

  useEffect(() => {
    localStorage.setItem(FAVORITES_STORAGE_KEY, JSON.stringify(favorites));
  }, [favorites]);

  const isFavorite = useCallback(
    (productId: string) => favorites.some((item) => item.id === productId),
    [favorites]
  );

  const addFavorite = useCallback((product: Product) => {
    setFavorites((prev) => {
      if (prev.some((item) => item.id === product.id)) return prev;
      return [...prev, product];
    });
  }, []);

  const removeFavorite = useCallback((productId: string) => {
    setFavorites((prev) => prev.filter((item) => item.id !== productId));
  }, []);

  const toggleFavorite = useCallback((product: Product) => {
    let added = false;
    setFavorites((prev) => {
      if (prev.some((item) => item.id === product.id)) {
        added = false;
        return prev.filter((item) => item.id !== product.id);
      }
      added = true;
      return [...prev, product];
    });
    return added;
  }, []);

  const clearFavorites = useCallback(() => {
    setFavorites([]);
    localStorage.removeItem(FAVORITES_STORAGE_KEY);
  }, []);

  return (
    <FavoritesContext.Provider
      value={{
        favorites,
        totalFavorites: favorites.length,
        isFavorite,
        toggleFavorite,
        addFavorite,
        removeFavorite,
        clearFavorites,
      }}
    >
      {children}
    </FavoritesContext.Provider>
  );
};

export const useFavorites = () => {
  const ctx = useContext(FavoritesContext);
  if (!ctx) {
    throw new Error("useFavorites must be used within FavoritesProvider");
  }
  return ctx;
};
