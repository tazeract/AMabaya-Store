"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { ShoppingBag, ArrowRight, Trash2, Plus, Minus } from "lucide-react";
import { useCart } from "@/context/CartContext";
import { formatPrice } from "@/lib/products";
import siteConfig from "@/lib/siteConfig";

export default function CartPage() {
  const { items, removeItem, updateQuantity, subtotal, itemCount } = useCart();
  const shippingCost = subtotal >= siteConfig.freeShippingThreshold ? 0 : siteConfig.standardShippingCost;
  const total = subtotal + shippingCost;

  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-white flex flex-col items-center justify-center text-center px-4 py-24">
        <div className="w-16 h-16 border border-[#D1D5DB] flex items-center justify-center mb-4">
          <ShoppingBag className="w-8 h-8 text-[#9CA3AF] stroke-[1.2]" />
        </div>
        <h1 className="font-serif text-3xl text-[#111827] font-normal mb-2">
          Your Shopping Bag Is Empty
        </h1>
        <p className="text-xs text-[#6B7280] font-sans mb-8 max-w-xs">
          Explore our handcrafted Pakistani abayas, raw silk kaftans, and organza dupattas.
        </p>
        <Link
          href="/products"
          className="luxury-btn-primary"
        >
          Explore Collections
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <div className="bg-[#FBF9F6] border-b border-[#E5E7EB] py-12 px-4 sm:px-6 lg:px-8 text-center">
        <h1 className="font-serif text-3xl sm:text-4xl text-[#111827] font-normal">
          Shopping Bag ({itemCount} Piece{itemCount !== 1 ? "s" : ""})
        </h1>
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid lg:grid-cols-12 gap-10">
          {/* Items list */}
          <div className="lg:col-span-8 space-y-4">
            {items.map((item) => (
              <motion.div
                key={item.id}
                layout
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="flex gap-5 p-5 bg-[#FBF9F6] border border-[#E5E7EB]"
              >
                <div className="w-24 aspect-[3/4] bg-white border border-[#E5E7EB] shrink-0 overflow-hidden">
                  {item.product.images[0] && (
                    <img src={item.product.images[0]} alt={item.product.title} className="w-full h-full object-cover" />
                  )}
                </div>
                <div className="flex-1 flex flex-col justify-between">
                  <div>
                    <div className="flex justify-between items-start">
                      <Link href={`/products/${item.product.slug}`} className="font-serif text-lg text-[#111827] font-medium hover:text-[var(--color-gold-dark)] transition-colors">
                        {item.product.title}
                      </Link>
                      <button onClick={() => removeItem(item.id)} className="text-[#9CA3AF] hover:text-red-600 transition-colors p-1" aria-label="Remove item">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                    <p className="text-xs text-[#6B7280] font-sans mt-0.5">
                      Size: <span className="font-semibold text-[#111827]">{item.selectedSize}</span> · Color: <span className="font-semibold text-[#111827]">{item.selectedColor}</span>
                    </p>
                    <p className="font-sans font-semibold text-[#111827] text-sm mt-2">
                      {formatPrice(item.product.price)}
                    </p>
                  </div>

                  <div className="flex items-center justify-between mt-4 pt-2 border-t border-[#E5E7EB]">
                    <div className="flex items-center border border-[#D1D5DB] bg-white">
                      <button
                        onClick={() => updateQuantity(item.id, item.quantity - 1)}
                        className="w-7 h-7 flex items-center justify-center text-[#4B5563] hover:bg-[#F3F4F6]"
                        aria-label="Decrease"
                      >
                        <Minus className="w-3 h-3" />
                      </button>
                      <span className="text-xs font-sans font-bold w-7 text-center">{item.quantity}</span>
                      <button
                        onClick={() => updateQuantity(item.id, item.quantity + 1)}
                        className="w-7 h-7 flex items-center justify-center text-[#4B5563] hover:bg-[#F3F4F6]"
                        aria-label="Increase"
                      >
                        <Plus className="w-3 h-3" />
                      </button>
                    </div>

                    <p className="font-sans font-bold text-sm text-[#111827]">
                      {formatPrice(item.product.price * item.quantity)}
                    </p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>

          {/* Summary */}
          <div className="lg:col-span-4">
            <div className="bg-[#FBF9F6] border border-[#E5E7EB] p-6 sticky top-28 space-y-4">
              <h2 className="font-serif text-xl text-[#111827] font-medium pb-3 border-b border-[#E5E7EB]">
                Order Summary
              </h2>

              <div className="space-y-2.5 text-xs font-sans">
                <div className="flex justify-between text-[#4B5563]">
                  <span>Subtotal</span>
                  <span className="font-semibold text-[#111827]">{formatPrice(subtotal)}</span>
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
                <div className="border-t border-[#E5E7EB] pt-3 flex justify-between font-serif text-lg text-[#111827] font-medium">
                  <span>Total Amount</span>
                  <span>{formatPrice(total)}</span>
                </div>
              </div>

              <Link
                href="/checkout"
                className="w-full luxury-btn-primary py-4 flex items-center justify-center gap-2 text-xs"
              >
                <span>Proceed To Checkout</span>
                <ArrowRight className="w-4 h-4" />
              </Link>

              <p className="text-[10px] text-[#9CA3AF] text-center font-sans tracking-wider uppercase">
                Cash on Delivery Available Across Pakistan
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
