"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { ShoppingBag, ArrowRight } from "lucide-react";
import { useCart } from "@/context/CartContext";
import { formatPrice } from "@/lib/products";
import { AnimatedSection } from "@/components/ui/AnimatedSection";
import siteConfig from "@/lib/siteConfig";

export default function CartPage() {
  const { items, removeItem, updateQuantity, subtotal, itemCount } = useCart();
  const shippingCost = subtotal >= siteConfig.freeShippingThreshold ? 0 : siteConfig.standardShippingCost;
  const total = subtotal + shippingCost;

  if (items.length === 0) {
    return (
      <div className="min-h-screen pt-32 flex flex-col items-center justify-center text-center px-4">
        <div className="w-24 h-24 rounded-full bg-[var(--color-border)] flex items-center justify-center mb-6">
          <ShoppingBag className="w-10 h-10 text-[var(--color-text-muted)]" />
        </div>
        <h1 className="font-display text-3xl font-semibold text-[var(--color-text-primary)] mb-3">
          Your cart is empty
        </h1>
        <p className="text-[var(--color-text-muted)] mb-8 max-w-sm">
          Discover our luxury collection and find your perfect abaya.
        </p>
        <Link
          href="/products"
          className="flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-[var(--color-gold)] to-[var(--color-gold-dark)] text-white rounded-full font-medium"
        >
          Shop Now <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-24">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-12">
        <AnimatedSection>
          <h1 className="font-display text-4xl font-semibold text-[var(--color-text-primary)] mb-8">
            Shopping Cart ({itemCount} item{itemCount !== 1 ? "s" : ""})
          </h1>
        </AnimatedSection>

        <div className="grid lg:grid-cols-3 gap-10">
          {/* Items list */}
          <div className="lg:col-span-2 space-y-4">
            {items.map((item) => (
              <motion.div
                key={item.id}
                layout
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="flex gap-5 p-5 bg-white rounded-2xl border border-[var(--color-border)] shadow-sm"
              >
                <div className="w-24 h-28 rounded-xl overflow-hidden bg-[var(--color-border)] shrink-0">
                  {item.product.images[0] && (
                    <img src={item.product.images[0]} alt={item.product.title} className="w-full h-full object-cover" />
                  )}
                </div>
                <div className="flex-1">
                  <Link href={`/products/${item.product.slug}`} className="font-display font-medium text-[var(--color-text-primary)] hover:text-[var(--color-gold)] transition-colors">
                    {item.product.title}
                  </Link>
                  <p className="text-xs text-[var(--color-text-muted)] mt-1">
                    {item.selectedSize} · {item.selectedColor}
                  </p>
                  <p className="font-sans font-semibold text-[var(--color-gold)] mt-2">
                    {formatPrice(item.product.price)}
                  </p>
                  <div className="flex items-center justify-between mt-4">
                    <div className="flex items-center gap-3 border border-[var(--color-border)] rounded-full px-3 py-1.5">
                      <button onClick={() => updateQuantity(item.id, item.quantity - 1)} aria-label="Decrease">−</button>
                      <span className="text-sm font-medium">{item.quantity}</span>
                      <button onClick={() => updateQuantity(item.id, item.quantity + 1)} aria-label="Increase">+</button>
                    </div>
                    <button onClick={() => removeItem(item.id)} className="text-xs text-red-400 hover:text-red-600 transition-colors">
                      Remove
                    </button>
                  </div>
                </div>
                <div className="text-right shrink-0">
                  <p className="font-sans font-bold text-[var(--color-text-primary)]">
                    {formatPrice(item.product.price * item.quantity)}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>

          {/* Summary */}
          <AnimatedSection direction="right">
            <div className="bg-white rounded-3xl border border-[var(--color-border)] p-6 shadow-sm sticky top-24">
              <h2 className="font-display text-xl font-semibold text-[var(--color-text-primary)] mb-6">
                Order Summary
              </h2>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between text-[var(--color-text-secondary)]">
                  <span>Subtotal ({itemCount} items)</span>
                  <span>{formatPrice(subtotal)}</span>
                </div>
                <div className="flex justify-between text-[var(--color-text-secondary)]">
                  <span>Shipping</span>
                  <span className={shippingCost === 0 ? "text-green-600 font-medium" : ""}>
                    {shippingCost === 0 ? "FREE" : formatPrice(shippingCost)}
                  </span>
                </div>
                {subtotal < siteConfig.freeShippingThreshold && (
                  <p className="text-[10px] text-[var(--color-text-muted)]">
                    Add {formatPrice(siteConfig.freeShippingThreshold - subtotal)} more for free shipping
                  </p>
                )}
                <div className="divider-gold my-2" />
                <div className="flex justify-between font-display font-bold text-[var(--color-text-primary)] text-lg">
                  <span>Total</span>
                  <span className="text-[var(--color-gold)]">{formatPrice(total)}</span>
                </div>
              </div>
              <Link
                href="/checkout"
                className="flex items-center justify-center gap-2 w-full py-4 mt-6 bg-gradient-to-r from-[var(--color-gold)] to-[var(--color-gold-dark)] text-white rounded-2xl font-semibold shadow-[var(--shadow-gold)] hover:-translate-y-0.5 transition-all"
              >
                Proceed to Checkout <ArrowRight className="w-4 h-4" />
              </Link>
              <Link href="/products" className="block text-center text-sm text-[var(--color-text-muted)] mt-4 hover:text-[var(--color-gold)] transition-colors">
                Continue Shopping
              </Link>
            </div>
          </AnimatedSection>
        </div>
      </div>
    </div>
  );
}
