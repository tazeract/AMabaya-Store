"use client";

import { useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { Heart, ShoppingBag, Eye, Zap, Star } from "lucide-react";
import { useCart } from "@/context/CartContext";
import { useWishlist } from "@/context/WishlistContext";
import { formatPrice, getDiscountPercent } from "@/lib/products";
import { StarRating } from "@/components/ui/StarRating";
import { toast } from "@/components/ui/Toaster";
import type { Product } from "@/types";
import dynamic from "next/dynamic";

const ModelViewer = dynamic(
  () => import("@/components/products/ModelViewer").then((m) => m.ModelViewer),
  { ssr: false }
);

interface ProductCardProps {
  product: Product;
  priority?: boolean;
}

export function ProductCard({ product, priority = false }: ProductCardProps) {
  const [isHovered, setIsHovered] = useState(false);
  const [show3D, setShow3D] = useState(false);
  const [selectedColor, setSelectedColor] = useState(product.colors[0]);
  const { addItem, isInCart } = useCart();
  const { toggle, isWishlisted } = useWishlist();

  const wishlisted = isWishlisted(product.slug);
  const inCart = isInCart(product.slug, product.sizes[0]?.label, selectedColor.name);
  const discount = product.originalPrice
    ? getDiscountPercent(product.price, product.originalPrice)
    : null;

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    addItem(product, product.sizes[0]?.label ?? "Free Size", selectedColor.name);
    toast.success("Added to cart!", `${product.title} has been added.`);
    document.dispatchEvent(new CustomEvent("open-cart"));
  };

  const handleWishlist = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    toggle(product.slug);
    toast.info(
      wishlisted ? "Removed from wishlist" : "Added to wishlist",
      product.title
    );
  };

  return (
    <motion.article
      className="product-card group relative luxury-card overflow-hidden cursor-pointer"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => { setIsHovered(false); setShow3D(false); }}
      whileHover={{ y: -4 }}
      transition={{ duration: 0.3 }}
    >
      <Link href={`/products/${product.slug}`} aria-label={`View ${product.title}`}>
        {/* Image / 3D area */}
        <div className="relative h-72 overflow-hidden bg-[var(--color-border)] rounded-t-xl">
          <AnimatePresence mode="wait">
            {show3D && product.modelPath ? (
              <motion.div
                key="3d"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.3 }}
                className="absolute inset-0"
                onClick={(e) => e.preventDefault()}
              >
                <ModelViewer
                  src={product.modelPath}
                  alt={`3D view of ${product.title}`}
                  className="w-full h-full"
                  autoRotate
                  cameraControls
                  ar={false}
                />
              </motion.div>
            ) : (
              <motion.div
                key="2d"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.3 }}
                className="absolute inset-0"
              >
                {product.images[0] ? (
                  <img
                    src={product.images[0]}
                    alt={product.title}
                    className="product-card-img w-full h-full object-cover"
                    loading={priority ? "eager" : "lazy"}
                  />
                ) : (
                  <div className="w-full h-full flex flex-col items-center justify-center gap-2 bg-gradient-to-br from-[var(--color-gold-light)]/20 to-[var(--color-gold)]/10">
                    <div className="w-16 h-16 rounded-full bg-gradient-to-br from-[var(--color-gold-light)] to-[var(--color-gold)] opacity-40" />
                    <span className="text-sm text-[var(--color-text-muted)] font-serif italic">
                      {product.title}
                    </span>
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>

          {/* Badges */}
          <div className="absolute top-3 left-3 flex flex-col gap-1.5">
            {product.isBestseller && (
              <span className="px-2.5 py-1 bg-[var(--color-champagne)] text-white text-[10px] font-bold uppercase tracking-wider rounded-full">
                Bestseller
              </span>
            )}
            {product.isNew && (
              <span className="px-2.5 py-1 bg-[var(--color-gold)] text-white text-[10px] font-bold uppercase tracking-wider rounded-full">
                New
              </span>
            )}
            {discount && (
              <span className="px-2.5 py-1 bg-red-500 text-white text-[10px] font-bold uppercase tracking-wider rounded-full">
                -{discount}%
              </span>
            )}
          </div>

          {/* 3D toggle */}
          {product.modelPath && (
            <button
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                setShow3D(!show3D);
              }}
              aria-label={show3D ? "View photos" : "View in 3D"}
              className={`absolute top-3 right-3 px-3 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-wider transition-all border ${
                show3D
                  ? "bg-[var(--color-gold)] border-[var(--color-gold)] text-white"
                  : "bg-white/80 border-white/60 text-[var(--color-text-secondary)] hover:bg-[var(--color-gold)] hover:text-white hover:border-[var(--color-gold)]"
              }`}
            >
              {show3D ? "Photos" : "3D View"}
            </button>
          )}

          {/* Hover actions */}
          <AnimatePresence>
            {isHovered && (
              <motion.div
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 12 }}
                transition={{ duration: 0.2 }}
                className="absolute bottom-3 left-3 right-3 flex gap-2"
              >
                <button
                  onClick={handleAddToCart}
                  aria-label={inCart ? "In cart" : "Add to cart"}
                  className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl text-xs font-medium transition-all ${
                    inCart
                      ? "bg-[var(--color-gold)] text-white"
                      : "bg-white/90 text-[var(--color-text-primary)] hover:bg-[var(--color-gold)] hover:text-white"
                  }`}
                >
                  <ShoppingBag className="w-3.5 h-3.5" />
                  {inCart ? "In Cart" : "Quick Add"}
                </button>
                <Link
                  href={`/products/${product.slug}`}
                  onClick={(e) => e.stopPropagation()}
                  aria-label="View details"
                  className="w-10 h-10 flex items-center justify-center rounded-xl bg-white/90 text-[var(--color-text-secondary)] hover:bg-white transition-colors"
                >
                  <Eye className="w-4 h-4" />
                </Link>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Product info */}
        <div className="p-4">
          {/* Color swatches */}
          <div className="flex items-center gap-1.5 mb-3">
            {product.colors.map((color) => (
              <button
                key={color.name}
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  setSelectedColor(color);
                }}
                aria-label={color.name}
                title={color.name}
                className={`w-4 h-4 rounded-full border-2 transition-all ${
                  selectedColor.name === color.name
                    ? "border-[var(--color-gold)] scale-125"
                    : "border-transparent hover:border-[var(--color-text-muted)] hover:scale-110"
                }`}
                style={{ backgroundColor: color.hex }}
              />
            ))}
          </div>

          <h3 className="font-display font-medium text-[var(--color-text-primary)] leading-snug line-clamp-1">
            {product.title}
          </h3>
          <p className="text-xs text-[var(--color-text-muted)] mt-0.5 font-sans">
            {product.category}
          </p>

          <div className="flex items-center justify-between mt-2">
            <div className="flex items-baseline gap-2">
              <span className="font-sans font-semibold text-[var(--color-gold)]">
                {formatPrice(product.price)}
              </span>
              {product.originalPrice && (
                <span className="text-xs text-[var(--color-text-muted)] line-through">
                  {formatPrice(product.originalPrice)}
                </span>
              )}
            </div>
            <StarRating rating={product.rating} reviewCount={product.reviewCount} size="sm" />
          </div>

          {/* Wishlist */}
          <button
            onClick={handleWishlist}
            aria-label={wishlisted ? "Remove from wishlist" : "Add to wishlist"}
            className="absolute top-3 right-12 p-2 rounded-full bg-white/80 backdrop-blur-sm transition-all hover:scale-110"
            style={{ top: "calc(100% - 72px - 3rem)", right: "1rem" }}
          >
            <Heart
              className={`w-4 h-4 transition-colors ${
                wishlisted
                  ? "fill-[var(--color-gold)] text-[var(--color-gold)]"
                  : "text-[var(--color-text-muted)]"
              }`}
            />
          </button>
        </div>
      </Link>
    </motion.article>
  );
}
