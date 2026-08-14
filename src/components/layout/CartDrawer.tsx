"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { X, ShoppingBag, Trash2, Plus, Minus, ArrowRight } from "lucide-react";
import { useCart } from "@/context/CartContext";
import { formatPrice } from "@/lib/products";
import siteConfig from "@/lib/siteConfig";

export function CartDrawer() {
  const [isOpen, setIsOpen] = useState(false);
  const { items, removeItem, updateQuantity, itemCount, subtotal } = useCart();

  // Listen for custom open event from Navbar
  useEffect(() => {
    const handleOpen = () => setIsOpen(true);
    document.addEventListener("open-cart", handleOpen);
    return () => document.removeEventListener("open-cart", handleOpen);
  }, []);

  // Lock body scroll
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => { document.body.style.overflow = ""; };
  }, [isOpen]);

  const shippingCost =
    subtotal >= siteConfig.freeShippingThreshold
      ? 0
      : siteConfig.standardShippingCost;

  const total = subtotal + shippingCost;

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            key="backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm"
            onClick={() => setIsOpen(false)}
          />

          {/* Drawer */}
          <motion.div
            key="drawer"
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", damping: 28, stiffness: 220 }}
            className="fixed right-0 top-0 bottom-0 z-50 w-full max-w-md flex flex-col"
            style={{ background: "var(--color-bg)" }}
          >
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-[var(--color-border)]">
              <div className="flex items-center gap-3">
                <ShoppingBag className="w-5 h-5 text-[var(--color-gold)]" />
                <h2 className="font-display text-xl font-semibold text-[var(--color-text-primary)]">
                  Your Cart
                </h2>
                {itemCount > 0 && (
                  <span className="w-5 h-5 bg-[var(--color-gold)] text-white text-xs font-bold rounded-full flex items-center justify-center">
                    {itemCount}
                  </span>
                )}
              </div>
              <button
                onClick={() => setIsOpen(false)}
                aria-label="Close cart"
                className="p-2 rounded-full hover:bg-[var(--color-border)] transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Items */}
            <div className="flex-1 overflow-y-auto py-4 px-6">
              {items.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full gap-4 text-center">
                  <div className="w-20 h-20 rounded-full bg-[var(--color-border)] flex items-center justify-center">
                    <ShoppingBag className="w-8 h-8 text-[var(--color-text-muted)]" />
                  </div>
                  <p className="font-display text-lg text-[var(--color-text-secondary)]">
                    Your cart is empty
                  </p>
                  <p className="text-sm text-[var(--color-text-muted)]">
                    Discover our luxury collection and find your perfect piece.
                  </p>
                  <Link
                    href="/products"
                    onClick={() => setIsOpen(false)}
                    className="mt-2 px-6 py-3 bg-gradient-to-r from-[var(--color-gold)] to-[var(--color-gold-dark)] text-white rounded-full text-sm font-medium"
                  >
                    Explore Collection
                  </Link>
                </div>
              ) : (
                <ul className="space-y-4" role="list" aria-label="Cart items">
                  <AnimatePresence initial={false}>
                    {items.map((item) => (
                      <motion.li
                        key={item.id}
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: 20, height: 0, marginBottom: 0 }}
                        transition={{ duration: 0.25 }}
                        className="flex gap-4 p-4 rounded-2xl bg-white border border-[var(--color-border)] shadow-sm"
                      >
                        {/* Product image */}
                        <div className="w-20 h-24 rounded-xl overflow-hidden bg-[var(--color-border)] shrink-0">
                          {item.product.images?.[0] ? (
                            <img
                              src={item.product.images[0]}
                              alt={item.product.title}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center">
                              <ShoppingBag className="w-6 h-6 text-[var(--color-text-muted)]" />
                            </div>
                          )}
                        </div>

                        {/* Details */}
                        <div className="flex-1 min-w-0">
                          <h3 className="font-display font-medium text-sm text-[var(--color-text-primary)] line-clamp-1">
                            {item.product.title}
                          </h3>
                          <p className="text-xs text-[var(--color-text-muted)] mt-0.5">
                            {item.selectedSize} · {item.selectedColor}
                          </p>
                          <p className="font-sans font-semibold text-[var(--color-gold)] mt-1 text-sm">
                            {formatPrice(item.product.price)}
                          </p>

                          <div className="flex items-center justify-between mt-3">
                            {/* Quantity */}
                            <div className="flex items-center gap-2 border border-[var(--color-border)] rounded-full px-2 py-1">
                              <button
                                onClick={() => updateQuantity(item.id, item.quantity - 1)}
                                aria-label="Decrease quantity"
                                className="w-5 h-5 flex items-center justify-center hover:text-[var(--color-gold)] transition-colors"
                              >
                                <Minus className="w-3 h-3" />
                              </button>
                              <span className="text-sm font-medium w-5 text-center">
                                {item.quantity}
                              </span>
                              <button
                                onClick={() => updateQuantity(item.id, item.quantity + 1)}
                                aria-label="Increase quantity"
                                className="w-5 h-5 flex items-center justify-center hover:text-[var(--color-gold)] transition-colors"
                              >
                                <Plus className="w-3 h-3" />
                              </button>
                            </div>

                            {/* Remove */}
                            <button
                              onClick={() => removeItem(item.id)}
                              aria-label="Remove item"
                              className="p-1.5 text-[var(--color-text-muted)] hover:text-red-500 transition-colors"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      </motion.li>
                    ))}
                  </AnimatePresence>
                </ul>
              )}
            </div>

            {/* Footer */}
            {items.length > 0 && (
              <div className="border-t border-[var(--color-border)] p-6 space-y-4">
                {/* Shipping progress */}
                {subtotal < siteConfig.freeShippingThreshold && (
                  <div>
                    <p className="text-xs text-[var(--color-text-muted)] mb-2">
                      Add{" "}
                      <span className="text-[var(--color-gold)] font-medium">
                        {formatPrice(siteConfig.freeShippingThreshold - subtotal)}
                      </span>{" "}
                      more for free shipping!
                    </p>
                    <div className="h-1.5 bg-[var(--color-border)] rounded-full overflow-hidden">
                      <motion.div
                        className="h-full bg-gradient-to-r from-[var(--color-gold-light)] to-[var(--color-gold)]"
                        initial={{ width: 0 }}
                        animate={{
                          width: `${Math.min(
                            (subtotal / siteConfig.freeShippingThreshold) * 100,
                            100
                          )}%`,
                        }}
                        transition={{ duration: 0.5 }}
                      />
                    </div>
                  </div>
                )}
                {subtotal >= siteConfig.freeShippingThreshold && (
                  <p className="text-xs text-green-600 font-medium text-center">
                    🎉 You qualify for FREE shipping!
                  </p>
                )}

                {/* Totals */}
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between text-[var(--color-text-secondary)]">
                    <span>Subtotal</span>
                    <span>{formatPrice(subtotal)}</span>
                  </div>
                  <div className="flex justify-between text-[var(--color-text-secondary)]">
                    <span>Shipping</span>
                    <span>
                      {shippingCost === 0 ? (
                        <span className="text-green-600 font-medium">FREE</span>
                      ) : (
                        formatPrice(shippingCost)
                      )}
                    </span>
                  </div>
                  <div className="divider-gold" />
                  <div className="flex justify-between font-display font-semibold text-[var(--color-text-primary)] text-base">
                    <span>Total</span>
                    <span className="text-[var(--color-gold)]">{formatPrice(total)}</span>
                  </div>
                </div>

                {/* CTA */}
                <Link
                  href="/checkout"
                  onClick={() => setIsOpen(false)}
                  className="flex items-center justify-center gap-2 w-full py-4 bg-gradient-to-r from-[var(--color-gold)] to-[var(--color-gold-dark)] text-white rounded-2xl font-medium text-sm shadow-[var(--shadow-gold)] hover:shadow-lg transition-all active:scale-98"
                >
                  Proceed to Checkout
                  <ArrowRight className="w-4 h-4" />
                </Link>

                <p className="text-xs text-[var(--color-text-muted)] text-center">
                  Secure checkout · Cash on Delivery available · 7-day returns
                </p>
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
