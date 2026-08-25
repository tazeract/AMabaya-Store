"use client";

import {
  createContext,
  useContext,
  useCallback,
  useMemo,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import { createClient } from "@/lib/supabase/client";
import { useAuth } from "@/context/AuthContext";
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
  isSyncing: boolean;
}

const CartContext = createContext<CartContextValue | null>(null);

// ─── localStorage helpers ─────────────────────────────────────────────────────
const LS_KEY = "amabaya-cart";

function loadLocal(): CartItem[] {
  if (typeof window === "undefined") return [];
  try {
    return JSON.parse(localStorage.getItem(LS_KEY) ?? "[]");
  } catch {
    return [];
  }
}

function saveLocal(items: CartItem[]) {
  if (typeof window === "undefined") return;
  localStorage.setItem(LS_KEY, JSON.stringify(items));
}

// ─── Supabase helpers ─────────────────────────────────────────────────────────
// We store cart in Supabase as a single JSONB column approach using profiles,
// OR we use the cart_items table with product_snapshot.
// Since cart_items needs product_id UUID, we'll use a simpler approach:
// store the entire cart as a JSONB in a dedicated column in profiles.
// This avoids the UUID lookup complexity while keeping data server-side.

async function loadRemoteCart(supabase: ReturnType<typeof createClient>, userId: string): Promise<CartItem[]> {
  const { data } = await supabase
    .from("profiles")
    .select("cart_data")
    .eq("id", userId)
    .single();
  
  if (!data?.cart_data) return [];
  try {
    return JSON.parse(data.cart_data as string);
  } catch {
    return [];
  }
}

async function saveRemoteCart(supabase: ReturnType<typeof createClient>, userId: string, items: CartItem[]) {
  await supabase
    .from("profiles")
    .update({ cart_data: JSON.stringify(items) })
    .eq("id", userId);
}

// ─── Provider ────────────────────────────────────────────────────────────────
export function CartProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const supabase = createClient();
  const [items, setItemsState] = useState<CartItem[]>([]);
  const [isSyncing, setIsSyncing] = useState(false);
  const [initialized, setInitialized] = useState(false);

  // ── On mount: load from localStorage first (instant) ────────────────────
  useEffect(() => {
    const local = loadLocal();
    setItemsState(local);
    setInitialized(true);
  }, []);

  // ── When user logs in: merge localStorage cart with Supabase cart ────────
  useEffect(() => {
    if (!initialized) return;

    if (user) {
      // User just logged in — sync
      (async () => {
        setIsSyncing(true);
        try {
          const remote = await loadRemoteCart(supabase, user.id);
          const local = loadLocal();

          // Merge: local takes priority for quantity, remote items are added if not in local
          const merged = [...local];
          for (const remoteItem of remote) {
            const exists = merged.find((i) => i.id === remoteItem.id);
            if (!exists) merged.push(remoteItem);
          }

          setItemsState(merged);
          saveLocal(merged);
          await saveRemoteCart(supabase, user.id, merged);
        } catch {
          // If sync fails, keep localStorage cart
        } finally {
          setIsSyncing(false);
        }
      })();
    } else {
      // User logged out: load from localStorage only
      const local = loadLocal();
      setItemsState(local);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id, initialized]);

  // ── Persist items to localStorage + Supabase whenever items change ────────
  const setItems = useCallback(
    (updater: CartItem[] | ((prev: CartItem[]) => CartItem[])) => {
      setItemsState((prev) => {
        const next = typeof updater === "function" ? updater(prev) : updater;
        saveLocal(next);
        // Async sync to Supabase (fire and forget)
        if (user) {
          saveRemoteCart(supabase, user.id, next).catch(() => {});
        }
        return next;
      });
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [user?.id]
  );

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

  const clearCart = useCallback(() => {
    setItems([]);
  }, [setItems]);

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
      isSyncing,
    }),
    [items, addItem, removeItem, updateQuantity, clearCart, itemCount, subtotal, isInCart, isSyncing]
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used within CartProvider");
  return ctx;
}
