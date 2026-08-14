"use client";

import {
  createContext,
  useContext,
  useCallback,
  useMemo,
  type ReactNode,
} from "react";
import { useLocalStorage } from "@/hooks/useLocalStorage";
import type { CartItem, Product } from "@/types";

interface CartContextValue {
  items: CartItem[];
  addItem: (product: Product, size: string, color: string, quantity?: number) => void;
  removeItem: (id: string) => void;
  updateQuantity: (id: string, quantity: number) => void;
  clearCart: () => void;
  itemCount: number;
  subtotal: number;
  isInCart: (slug: string, size: string, color: string) => boolean;
}

const CartContext = createContext<CartContextValue | null>(null);

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useLocalStorage<CartItem[]>("amabaya-cart", []);

  const addItem = useCallback(
    (product: Product, size: string, color: string, quantity = 1) => {
      const id = `${product.slug}-${size}-${color}`;
      setItems((prev) => {
        const existing = prev.find((i) => i.id === id);
        if (existing) {
          return prev.map((i) =>
            i.id === id
              ? { ...i, quantity: Math.min(i.quantity + quantity, 10) }
              : i
          );
        }
        return [
          ...prev,
          { id, product, quantity, selectedSize: size, selectedColor: color },
        ];
      });
    },
    [setItems]
  );

  const removeItem = useCallback(
    (id: string) => {
      setItems((prev) => prev.filter((i) => i.id !== id));
    },
    [setItems]
  );

  const updateQuantity = useCallback(
    (id: string, quantity: number) => {
      if (quantity <= 0) {
        setItems((prev) => prev.filter((i) => i.id !== id));
      } else {
        setItems((prev) =>
          prev.map((i) => (i.id === id ? { ...i, quantity } : i))
        );
      }
    },
    [setItems]
  );

  const clearCart = useCallback(() => setItems([]), [setItems]);

  const itemCount = useMemo(
    () => items.reduce((sum, i) => sum + i.quantity, 0),
    [items]
  );

  const subtotal = useMemo(
    () => items.reduce((sum, i) => sum + i.product.price * i.quantity, 0),
    [items]
  );

  const isInCart = useCallback(
    (slug: string, size: string, color: string) => {
      const id = `${slug}-${size}-${color}`;
      return items.some((i) => i.id === id);
    },
    [items]
  );

  const value = useMemo(
    () => ({
      items,
      addItem,
      removeItem,
      updateQuantity,
      clearCart,
      itemCount,
      subtotal,
      isInCart,
    }),
    [items, addItem, removeItem, updateQuantity, clearCart, itemCount, subtotal, isInCart]
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used within CartProvider");
  return ctx;
}
