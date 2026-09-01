"use client";

import { useState } from "react";
import Link from "next/link";
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
  const colors = Array.isArray(product.colors) && product.colors.length > 0
    ? product.colors
    : [{ name: "Midnight Black", hex: "#111827" }];

  const sizes = Array.isArray(product.sizes) && product.sizes.length > 0
    ? product.sizes
    : [{ label: "Standard", available: true }];

  const [selectedColor, setSelectedColor] = useState(colors[0]);
  const [selectedSize, setSelectedSize] = useState(sizes[0]?.label ?? "Standard");
  const [isAdding, setIsAdding] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  const { addItem, isInCart } = useCart();
  const { toggle, isWishlisted } = useWishlist();

  const wishlisted = isWishlisted(product.slug);
  const currentColorName = selectedColor?.name ?? "Default";
  const inCart = isInCart(product.slug, selectedSize, currentColorName);
  const discount = product.originalPrice
    ? getDiscountPercent(product.price, product.originalPrice)
    : 0;

  const images = Array.isArray(product.images) && product.images.length > 0
    ? product.images
    : ["/products/classic-noir-abaya/image-1.jpg"];

  const mainImage = images[0] || "/products/classic-noir-abaya/image-1.jpg";
  const hoverImage = images[1] || mainImage;

  const handleQuickAdd = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsAdding(true);
    addItem(product, selectedSize, currentColorName);
    toast.success("Added to Bag", `${product.title} (${selectedSize})`);

    setTimeout(() => {
      setIsAdding(false);
      document.dispatchEvent(new CustomEvent("open-cart"));
    }, 300);
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
      className="group relative flex flex-col bg-white border border-[#EBE7DF] hover:border-[#C5A880] rounded-lg overflow-hidden transition-all duration-500 hover:shadow-[0_12px_40px_-8px_rgba(0,0,0,0.12)] hover:-translate-y-1"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="relative aspect-[3/4] w-full overflow-hidden bg-[#F6F4EE]">
        {/* Badges in Top Left */}
        <div className="absolute top-2.5 left-2.5 flex flex-col gap-1.5 z-10 pointer-events-none">
          {discount > 0 ? (
            <span className="bg-[#DA3F3F] text-white text-[10px] font-sans font-bold tracking-wider px-2 py-0.5 rounded uppercase shadow-xs">
              {discount}% OFF
            </span>
          ) : null}
          {product.isBestseller ? (
            <span className="bg-[#9A84C8] text-white text-[10px] font-sans font-bold tracking-wider px-2 py-0.5 rounded uppercase shadow-xs">
              Bestseller
            </span>
          ) : null}
          {product.isNew && !product.isBestseller && discount === 0 ? (
            <span className="bg-[#64BF99] text-white text-[10px] font-sans font-bold tracking-wider px-2 py-0.5 rounded uppercase shadow-xs">
              New In
            </span>
          ) : null}
        </div>

        {/* Minimal Wishlist Button in Top Right */}
        <button
          onClick={handleWishlistToggle}
          aria-label={wishlisted ? "Remove from wishlist" : "Add to wishlist"}
          className={`absolute top-2.5 right-2.5 z-10 w-8 h-8 rounded-full flex items-center justify-center transition-all ${
            wishlisted
              ? "bg-red-50 text-[#DA3F3F]"
              : "bg-white/90 backdrop-blur-xs text-[#111827] hover:bg-white hover:scale-110 shadow-xs"
          }`}
        >
          <Heart
            className={`w-4 h-4 transition-colors ${
              wishlisted ? "fill-[#DA3F3F]" : ""
            }`}
          />
        </button>

        {/* Product Image Link */}
        <Link href={`/products/${product.slug}`} className="block w-full h-full">
          <img
            src={isHovered && hoverImage !== mainImage ? hoverImage : mainImage}
            alt={product.title}
            className="w-full h-full object-cover object-top transition-transform duration-700 ease-out group-hover:scale-105"
            loading={priority ? "eager" : "lazy"}
            style={{ aspectRatio: "3/4" }}
          />
        </Link>

        {/* Size pills — slide up on hover (desktop) */}
        {sizes.length > 1 && (
          <div className="hidden sm:flex absolute inset-x-2 top-2 z-10 gap-1 opacity-0 group-hover:opacity-100 transition-all duration-300 -translate-y-1 group-hover:translate-y-0 justify-center pointer-events-none">
            {sizes.slice(0, 5).map((s) => (
              <span
                key={s.label}
                className="px-1.5 py-0.5 bg-white/90 backdrop-blur-xs text-[9px] font-bold text-[#111827] rounded shadow-xs border border-white/50"
              >
                {s.label}
              </span>
            ))}
          </div>
        )}

        {/* Slide-Up Quick Add Overlay on Desktop Hover */}
        <div className="hidden sm:flex absolute inset-x-2 bottom-2 z-10 gap-1.5 opacity-0 group-hover:opacity-100 transition-all duration-300 translate-y-2 group-hover:translate-y-0">
          <button
            onClick={handleQuickAdd}
            disabled={isAdding}
            className="flex-1 py-2.5 bg-[#111827] text-white hover:bg-black text-[11px] font-bold uppercase tracking-wider rounded flex items-center justify-center gap-1.5 shadow-md transition-colors"
          >
            {isAdding ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-400" />
                <span>Added</span>
              </>
            ) : inCart ? (
              <>
                <ShoppingBag className="w-3.5 h-3.5" />
                <span>In Bag (+1)</span>
              </>
            ) : (
              <>
                <ShoppingBag className="w-3.5 h-3.5" />
                <span>Quick Add</span>
              </>
            )}
          </button>
          <Link
            href={`/products/${product.slug}`}
            className="w-9 h-9 bg-white text-[#111827] hover:bg-[#F3F4F6] rounded flex items-center justify-center shadow-md transition-colors shrink-0"
            aria-label="View Details"
          >
            <Eye className="w-4 h-4" />
          </Link>
        </div>
      </div>

      {/* Product Information */}
      <div className="p-3 sm:p-4 flex flex-col flex-1 bg-white">
        {/* Category & Color Swatches */}
        <div className="flex items-center justify-between mb-1">
          <div className="flex items-center gap-1.5">
            <span className="text-[10px] font-sans uppercase font-bold tracking-widest text-[#9A84C8]">
              {product.category || "Abaya"}
            </span>
            {product.material && (
              <span className="text-[9px] text-[#C5A880] font-sans hidden sm:inline">
                · {product.material.split(" ").slice(0, 2).join(" ")}
              </span>
            )}
          </div>

          {/* Color swatches */}
          {colors.length > 1 && (
            <div className="flex items-center gap-1">
              {colors.slice(0, 4).map((color) => (
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
                    selectedColor?.name === color.name
                      ? "border-[#111827] scale-125 shadow-xs"
                      : "border-transparent opacity-60 hover:opacity-100"
                  }`}
                  style={{ backgroundColor: color.hex || "#111827" }}
                />
              ))}
            </div>
          )}
        </div>

        {/* Product Title */}
        <Link
          href={`/products/${product.slug}`}
          className="font-serif text-sm sm:text-base text-[#111827] font-medium leading-snug line-clamp-1 hover:text-[#9A84C8] transition-colors"
        >
          {product.title}
        </Link>

        {/* Size pills inline (compact) */}
        {sizes.length > 0 && (
          <div className="mt-1 flex items-center gap-1 flex-wrap">
            {sizes.slice(0, 4).map((s) => (
              <button
                key={s.label}
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  setSelectedSize(s.label);
                }}
                className={`text-[9px] px-1.5 py-0.5 border rounded font-sans font-semibold transition-all ${
                  selectedSize === s.label
                    ? "border-[#111827] bg-[#111827] text-white"
                    : "border-[#E5E7EB] text-[#6B7280] hover:border-[#C5A880] hover:text-[#A3845A]"
                }`}
              >
                {s.label}
              </button>
            ))}
          </div>
        )}

        {/* Pricing */}
        <div className="mt-2 flex items-baseline gap-2">
          <span className="font-sans font-bold text-sm sm:text-base text-[#DA3F3F]">
            {formatPrice(product.price)}
          </span>
          {product.originalPrice && product.originalPrice > product.price && (
            <span className="font-sans text-xs text-[#9CA3AF] line-through">
              {formatPrice(product.originalPrice)}
            </span>
          )}
        </div>

        {/* Mobile Quick Add Button */}
        <button
          onClick={handleQuickAdd}
          disabled={isAdding}
          aria-label="Add to bag"
          className="mt-2.5 sm:hidden w-full py-1.5 bg-[#111827] text-white text-[10px] font-bold uppercase tracking-wider rounded flex items-center justify-center gap-1 active:scale-95 transition-transform"
        >
          <ShoppingBag className="w-3 h-3" />
          <span>{inCart ? "In Bag (+1)" : "Add to Bag"}</span>
        </button>
      </div>
    </article>
  );
}
