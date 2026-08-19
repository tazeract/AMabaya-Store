"use client";

import { useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { Heart, ShoppingBag, Eye, Check } from "lucide-react";
import { useCart } from "@/context/CartContext";
import { useWishlist } from "@/context/WishlistContext";
import { formatPrice, getDiscountPercent } from "@/lib/products";
import { toast } from "@/components/ui/Toaster";
import type { Product } from "@/types";

interface ProductCardProps {
  product: Product;
  priority?: boolean;
}

export function ProductCard({ product, priority = false }: ProductCardProps) {
  const [isHovered, setIsHovered] = useState(false);
  const [selectedColor, setSelectedColor] = useState(product.colors[0]);
  const [selectedSize, setSelectedSize] = useState(product.sizes[0]?.label ?? "Free Size");
  const [isAdding, setIsAdding] = useState(false);

  const { addItem, isInCart } = useCart();
  const { toggle, isWishlisted } = useWishlist();

  const wishlisted = isWishlisted(product.slug);
  const inCart = isInCart(product.slug, selectedSize, selectedColor.name);
  const discount = product.originalPrice
    ? getDiscountPercent(product.price, product.originalPrice)
    : null;

  const handleQuickAdd = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsAdding(true);
    addItem(product, selectedSize, selectedColor.name);
    toast.success("Added to Cart", `${product.title} (${selectedSize})`);
    
    setTimeout(() => {
      setIsAdding(false);
      document.dispatchEvent(new CustomEvent("open-cart"));
    }, 400);
  };

  const handleWishlistToggle = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    toggle(product.slug);
    if (!wishlisted) {
      toast.success("Added to Wishlist", product.title);
    } else {
      toast.info("Removed from Wishlist", product.title);
    }
  };

  return (
    <article
      className="group relative flex flex-col bg-white border border-[#E5E7EB] hover:border-[#D1D5DB] transition-all duration-300"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <Link href={`/products/${product.slug}`} className="block relative overflow-hidden">
        {/* 3:4 Tall Image Container */}
        <div className="relative aspect-[3/4] w-full overflow-hidden bg-[#F9FAFB]">
          <img
            src={product.images[0] || "/products/classic-noir-abaya/image-1.jpg"}
            alt={product.title}
            className="w-full h-full object-cover object-top transition-transform duration-700 ease-out group-hover:scale-105"
            loading={priority ? "eager" : "lazy"}
          />

          {/* Badges in Top Left */}
          <div className="absolute top-2.5 left-2.5 flex flex-col gap-1 z-10">
            {discount && (
              <span className="bg-[#111827] text-white text-[10px] font-sans font-bold tracking-wider px-2 py-0.5 uppercase">
                -{discount}%
              </span>
            )}
            {product.isBestseller && !discount && (
              <span className="bg-[var(--color-gold)] text-white text-[10px] font-sans font-bold tracking-wider px-2 py-0.5 uppercase">
                Bestseller
              </span>
            )}
            {product.isNew && !discount && !product.isBestseller && (
              <span className="bg-[#111827] text-white text-[10px] font-sans font-semibold tracking-wider px-2 py-0.5 uppercase">
                New
              </span>
            )}
          </div>

          {/* Minimal Wishlist Button in Top Right */}
          <button
            onClick={handleWishlistToggle}
            aria-label={wishlisted ? "Remove from wishlist" : "Add to wishlist"}
            className="absolute top-2.5 right-2.5 z-10 w-8 h-8 rounded-full bg-white/90 backdrop-blur-sm flex items-center justify-center text-[#111827] hover:bg-white transition-all shadow-sm"
          >
            <Heart
              className={`w-4 h-4 transition-colors ${
                wishlisted
                  ? "fill-red-600 text-red-600"
                  : "text-[#374151] hover:text-red-600"
              }`}
            />
          </button>

          {/* Slide-Up Quick Add on Desktop Hover */}
          <div className="hidden lg:block absolute inset-x-0 bottom-0 p-3 z-10 translate-y-full group-hover:translate-y-0 transition-transform duration-300 ease-out bg-gradient-to-t from-black/60 to-transparent">
            {/* Quick Size Select if multiple sizes */}
            {product.sizes.length > 1 && (
              <div className="flex justify-center gap-1.5 mb-2">
                {product.sizes.map((size) => (
                  <button
                    key={size.label}
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      setSelectedSize(size.label);
                    }}
                    className={`w-6 h-6 text-[10px] font-bold uppercase transition-all ${
                      selectedSize === size.label
                        ? "bg-white text-[#111827]"
                        : "bg-black/50 text-white hover:bg-white/80 hover:text-black"
                    }`}
                  >
                    {size.label}
                  </button>
                ))}
              </div>
            )}

            <button
              onClick={handleQuickAdd}
              disabled={isAdding}
              aria-label="Add to cart"
              className="w-full bg-[#111827] text-white text-xs font-semibold uppercase tracking-widest py-2.5 flex items-center justify-center gap-2 hover:bg-black transition-colors"
            >
              {isAdding ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Added</span>
                </>
              ) : inCart ? (
                <>
                  <ShoppingBag className="w-3.5 h-3.5" />
                  <span>In Cart (+1)</span>
                </>
              ) : (
                <>
                  <ShoppingBag className="w-3.5 h-3.5" />
                  <span>Quick Add</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Product Details */}
        <div className="p-3.5 sm:p-4 flex flex-col flex-1 bg-white">
          {/* Category & Color Swatches */}
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-[10px] font-sans uppercase tracking-widest text-[#6B7280]">
              {product.category}
            </span>

            {/* Minimal Color Swatches */}
            {product.colors && product.colors.length > 0 && (
              <div className="flex items-center gap-1">
                {product.colors.map((color) => (
                  <button
                    key={color.name}
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      setSelectedColor(color);
                    }}
                    title={color.name}
                    aria-label={`Select color ${color.name}`}
                    className={`w-2.5 h-2.5 rounded-full border transition-all ${
                      selectedColor.name === color.name
                        ? "border-[#111827] scale-125"
                        : "border-transparent opacity-60 hover:opacity-100"
                    }`}
                    style={{ backgroundColor: color.hex }}
                  />
                ))}
              </div>
            )}
          </div>

          {/* Product Title */}
          <h3 className="font-serif text-[15px] sm:text-[16px] text-[#111827] font-medium leading-snug line-clamp-1 group-hover:text-[var(--color-gold-dark)] transition-colors">
            {product.title}
          </h3>

          {/* Pricing in PKR format */}
          <div className="mt-2 flex items-baseline gap-2">
            <span className="font-sans font-semibold text-sm text-[#111827]">
              {formatPrice(product.price)}
            </span>
            {product.originalPrice && (
              <span className="font-sans text-xs text-[#9CA3AF] line-through">
                {formatPrice(product.originalPrice)}
              </span>
            )}
          </div>

          {/* Mobile Quick Add Button */}
          <button
            onClick={handleQuickAdd}
            aria-label="Add to cart"
            className="mt-3 lg:hidden w-full border border-[#111827] text-[#111827] text-[11px] font-semibold uppercase tracking-wider py-1.5 flex items-center justify-center gap-1.5 hover:bg-[#111827] hover:text-white transition-colors"
          >
            <ShoppingBag className="w-3 h-3" />
            <span>{inCart ? "In Cart" : "Add to Cart"}</span>
          </button>
        </div>
      </Link>
    </article>
  );
}
