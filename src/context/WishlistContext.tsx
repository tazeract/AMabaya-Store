"use client";

import {
  createContext,
  useContext,
  useCallback,
  useMemo,
  type ReactNode,
} from "react";
import { useLocalStorage } from "@/hooks/useLocalStorage";
import type { WishlistItem } from "@/types";

interface WishlistContextValue {
  items: WishlistItem[];
  addItem: (slug: string) => void;
  removeItem: (slug: string) => void;
  toggle: (slug: string) => void;
  isWishlisted: (slug: string) => boolean;
  count: number;
}

const WishlistContext = createContext<WishlistContextValue | null>(null);

export function WishlistProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useLocalStorage<WishlistItem[]>(
    "amabaya-wishlist",
    []
  );

  const addItem = useCallback(
    (slug: string) => {
      setItems((prev) => {
        if (prev.some((i) => i.productSlug === slug)) return prev;
        return [...prev, { productSlug: slug, addedAt: new Date().toISOString() }];
      });
    },
    [setItems]
  );

  const removeItem = useCallback(
    (slug: string) => {
      setItems((prev) => prev.filter((i) => i.productSlug !== slug));
    },
    [setItems]
  );

  const toggle = useCallback(
    (slug: string) => {
      setItems((prev) => {
        const exists = prev.some((i) => i.productSlug === slug);
        if (exists) return prev.filter((i) => i.productSlug !== slug);
        return [...prev, { productSlug: slug, addedAt: new Date().toISOString() }];
      });
    },
    [setItems]
  );

  const isWishlisted = useCallback(
    (slug: string) => items.some((i) => i.productSlug === slug),
    [items]
  );

  const count = items.length;

  const value = useMemo(
    () => ({ items, addItem, removeItem, toggle, isWishlisted, count }),
    [items, addItem, removeItem, toggle, isWishlisted, count]
  );

  return (
    <WishlistContext.Provider value={value}>{children}</WishlistContext.Provider>
  );
}

export function useWishlist() {
  const ctx = useContext(WishlistContext);
  if (!ctx) throw new Error("useWishlist must be used within WishlistProvider");
  return ctx;
}
