"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { X, ShoppingBag, Trash2, Plus, Minus, ArrowRight, Truck } from "lucide-react";
import { useCart } from "@/context/CartContext";
import { formatPrice } from "@/lib/products";
import siteConfig from "@/lib/siteConfig";

export function CartDrawer() {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);
  const { items, removeItem, updateQuantity, itemCount, subtotal } = useCart();

  if (pathname?.startsWith("/admin")) {
    return null;
  }

  // Listen for custom open event from Navbar & ProductCard
  useEffect(() => {
    const handleOpen = () => setIsOpen(true);
    document.addEventListener("open-cart", handleOpen);
    return () => document.removeEventListener("open-cart", handleOpen);
  }, []);

  // Lock body scroll when open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  const shippingCost =
    subtotal >= siteConfig.freeShippingThreshold
      ? 0
      : siteConfig.standardShippingCost;

  const total = subtotal + shippingCost;
  const remainingForFreeShipping = siteConfig.freeShippingThreshold - subtotal;

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
            className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm"
            onClick={() => setIsOpen(false)}
          />

          {/* Drawer */}
          <motion.div
            key="drawer"
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "tween", duration: 0.3 }}
            className="fixed right-0 top-0 bottom-0 z-50 w-full max-w-md bg-white flex flex-col shadow-2xl border-l border-[#E5E7EB]"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-5 border-b border-[#E5E7EB] bg-[#FBF9F6]">
              <div className="flex items-center gap-2.5">
                <ShoppingBag className="w-5 h-5 text-[#111827]" />
                <h2 className="font-serif text-xl font-medium tracking-wider text-[#111827] uppercase">
                  Shopping Bag
                </h2>
                {itemCount > 0 && (
                  <span className="px-2 py-0.5 bg-[#111827] text-white text-xs font-sans font-bold">
                    {itemCount}
                  </span>
                )}
              </div>
              <button
                onClick={() => setIsOpen(false)}
                aria-label="Close cart"
                className="p-1.5 text-[#111827] hover:text-[var(--color-gold-dark)] transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Free Shipping Progress Indicator */}
            <div className="bg-[#F3F4F6] px-5 py-3 border-b border-[#E5E7EB] text-xs font-sans">
              {remainingForFreeShipping > 0 ? (
                <div>
                  <p className="text-[#374151] flex items-center justify-between mb-1.5">
                    <span>
                      Add <strong className="text-[#111827]">{formatPrice(remainingForFreeShipping)}</strong> for Free Shipping
                    </span>
                    <Truck className="w-4 h-4 text-[#A3845A]" />
                  </p>
                  <div className="h-1.5 bg-[#E5E7EB] overflow-hidden">
                    <motion.div
                      className="h-full bg-[#111827]"
                      initial={{ width: 0 }}
                      animate={{
                        width: `${Math.min((subtotal / siteConfig.freeShippingThreshold) * 100, 100)}%`,
                      }}
                      transition={{ duration: 0.4 }}
                    />
                  </div>
                </div>
              ) : (
                <p className="text-emerald-700 font-medium text-center flex items-center justify-center gap-1.5">
                  <span>✦ You unlocked Complimentary Nationwide Shipping!</span>
                </p>
              )}
            </div>

            {/* Cart Items List */}
            <div className="flex-1 overflow-y-auto py-4 px-5">
              {items.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full gap-4 text-center py-12">
                  <div className="w-16 h-16 border border-[#D1D5DB] flex items-center justify-center text-[#9CA3AF]">
                    <ShoppingBag className="w-8 h-8 stroke-[1.2]" />
                  </div>
                  <div>
                    <p className="font-serif text-xl text-[#111827] font-medium">
                      Your Bag Is Empty
                    </p>
                    <p className="text-xs text-[#6B7280] font-sans mt-1 max-w-xs">
                      Explore our handcrafted Pakistani abayas and luxury kaftans.
                    </p>
                  </div>
                  <Link
                    href="/products"
                    onClick={() => setIsOpen(false)}
                    className="luxury-btn-primary mt-2"
                  >
                    Explore Collections
                  </Link>
                </div>
              ) : (
                <ul className="space-y-4 divide-y divide-[#F3F4F6]" role="list">
                  <AnimatePresence initial={false}>
                    {items.map((item) => (
                      <motion.li
                        key={item.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, height: 0, overflow: "hidden" }}
                        className="flex gap-4 pt-4 first:pt-0"
                      >
                        {/* Product Image */}
                        <div className="w-20 h-24 bg-[#F3F4F6] border border-[#E5E7EB] shrink-0 overflow-hidden">
                          <img
                            src={item.product.images?.[0] || "/products/classic-noir-abaya/image-1.jpg"}
                            alt={item.product.title}
                            className="w-full h-full object-cover"
                          />
                        </div>

                        {/* Product Info */}
                        <div className="flex-1 min-w-0 flex flex-col justify-between">
                          <div>
                            <div className="flex items-start justify-between gap-2">
                              <h3 className="font-serif text-base text-[#111827] font-medium line-clamp-1">
                                {item.product.title}
                              </h3>
                              <button
                                onClick={() => removeItem(item.id)}
                                aria-label="Remove item"
                                className="text-[#9CA3AF] hover:text-red-600 transition-colors p-1"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                            <p className="text-xs text-[#6B7280] font-sans mt-0.5">
                              Size: <span className="font-medium text-[#111827]">{item.selectedSize}</span> · Color: <span className="font-medium text-[#111827]">{item.selectedColor}</span>
                            </p>
                          </div>

                          <div className="flex items-center justify-between mt-2 pt-2">
                            {/* Quantity Controls */}
                            <div className="flex items-center border border-[#D1D5DB]">
                              <button
                                onClick={() => updateQuantity(item.id, item.quantity - 1)}
                                aria-label="Decrease quantity"
                                className="w-7 h-7 flex items-center justify-center text-[#4B5563] hover:bg-[#F3F4F6] transition-colors"
                              >
                                <Minus className="w-3 h-3" />
                              </button>
                              <span className="text-xs font-sans font-semibold w-7 text-center">
                                {item.quantity}
                              </span>
                              <button
                                onClick={() => updateQuantity(item.id, item.quantity + 1)}
                                aria-label="Increase quantity"
                                className="w-7 h-7 flex items-center justify-center text-[#4B5563] hover:bg-[#F3F4F6] transition-colors"
                              >
                                <Plus className="w-3 h-3" />
                              </button>
                            </div>

                            <span className="font-sans font-semibold text-sm text-[#111827]">
                              {formatPrice(item.product.price * item.quantity)}
                            </span>
                          </div>
                        </div>
                      </motion.li>
                    ))}
                  </AnimatePresence>
                </ul>
              )}
            </div>

            {/* Footer Summary & Checkout */}
            {items.length > 0 && (
              <div className="border-t border-[#E5E7EB] p-5 bg-[#FBF9F6] space-y-4">
                <div className="space-y-2 text-xs font-sans">
                  <div className="flex justify-between text-[#4B5563]">
                    <span>Subtotal</span>
                    <span className="font-medium text-[#111827]">{formatPrice(subtotal)}</span>
                  </div>
                  <div className="flex justify-between text-[#4B5563]">
                    <span>Nationwide Shipping</span>
                    <span>
                      {shippingCost === 0 ? (
                        <span className="text-emerald-700 font-semibold uppercase">Free</span>
                      ) : (
                        formatPrice(shippingCost)
                      )}
                    </span>
                  </div>
                  <div className="border-t border-[#E5E7EB] pt-2 flex justify-between font-serif text-lg text-[#111827] font-medium">
                    <span>Estimated Total</span>
                    <span>{formatPrice(total)}</span>
                  </div>
                </div>

                <div className="space-y-2">
                  <Link
                    href="/checkout"
                    onClick={() => setIsOpen(false)}
                    className="w-full luxury-btn-primary flex items-center justify-center gap-2 py-3.5"
                  >
                    <span>Proceed To Checkout</span>
                    <ArrowRight className="w-4 h-4" />
                  </Link>

                  <Link
                    href="/cart"
                    onClick={() => setIsOpen(false)}
                    className="w-full block text-center text-xs font-sans tracking-wider uppercase text-[#4B5563] hover:text-[#111827] py-1"
                  >
                    View Bag Details
                  </Link>
                </div>

                <p className="text-[10px] text-[#9CA3AF] text-center font-sans tracking-wider uppercase">
                  Cash on Delivery · 100% Secure Checkout
                </p>
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
