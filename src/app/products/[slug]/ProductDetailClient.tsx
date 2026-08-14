"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ShoppingBag,
  Heart,
  Share2,
  ZoomIn,
  Box,
  ChevronLeft,
  ChevronRight,
  AlertCircle,
  Check,
  MessageCircle,
  Truck,
  RefreshCw,
  Shield,
} from "lucide-react";
import Link from "next/link";
import { useCart } from "@/context/CartContext";
import { useWishlist } from "@/context/WishlistContext";
import { formatPrice, getStock, getDiscountPercent } from "@/lib/products";
import { StarRating } from "@/components/ui/StarRating";
import { AnimatedSection } from "@/components/ui/AnimatedSection";
import { toast } from "@/components/ui/Toaster";
import dynamic from "next/dynamic";
import type { Product } from "@/types";
import siteConfig from "@/lib/siteConfig";

const ModelViewer = dynamic(
  () => import("@/components/products/ModelViewer").then((m) => m.ModelViewer),
  { ssr: false }
);

interface ProductDetailClientProps {
  product: Product;
}

export function ProductDetailClient({ product }: ProductDetailClientProps) {
  const [selectedSize, setSelectedSize] = useState(product.sizes[0]?.label ?? "");
  const [selectedColor, setSelectedColor] = useState(product.colors[0]);
  const [viewMode, setViewMode] = useState<"photos" | "3d">("photos");
  const [activeImage, setActiveImage] = useState(0);
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);

  const { addItem, isInCart } = useCart();
  const { toggle, isWishlisted } = useWishlist();

  const stock = getStock(product, selectedSize, selectedColor.name);
  const inCart = isInCart(product.slug, selectedSize, selectedColor.name);
  const wishlisted = isWishlisted(product.slug);
  const discount = product.originalPrice
    ? getDiscountPercent(product.price, product.originalPrice)
    : null;

  const stockStatus =
    stock === 0
      ? { label: "Out of Stock", color: "text-red-500", bg: "bg-red-50" }
      : stock <= 3
      ? { label: `Only ${stock} left!`, color: "text-amber-600", bg: "bg-amber-50" }
      : { label: "In Stock", color: "text-green-600", bg: "bg-green-50" };

  const handleAddToCart = () => {
    if (stock === 0) return;
    addItem(product, selectedSize, selectedColor.name);
    toast.success("Added to cart!", `${product.title} (${selectedSize}, ${selectedColor.name})`);
    document.dispatchEvent(new CustomEvent("open-cart"));
  };

  const handleWhatsApp = () => {
    const productUrl = `${siteConfig.siteUrl}/products/${product.slug}`;
    const message = `Hi! I'd like to order:\n\n*${product.title}*\nSize: ${selectedSize}\nColor: ${selectedColor.name}\nPrice: ${formatPrice(product.price)}\n\n${productUrl}`;
    window.open(
      `https://wa.me/${siteConfig.whatsappNumber}?text=${encodeURIComponent(message)}`,
      "_blank"
    );
  };

  const handleShare = async () => {
    const url = `${siteConfig.siteUrl}/products/${product.slug}`;
    if (navigator.share) {
      await navigator.share({ title: product.title, text: product.description, url });
    } else {
      await navigator.clipboard.writeText(url);
      toast.success("Link copied!", "Product link copied to clipboard");
    }
  };

  const prevImage = () => setActiveImage((i) => (i - 1 + product.images.length) % product.images.length);
  const nextImage = () => setActiveImage((i) => (i + 1) % product.images.length);

  return (
    <div className="min-h-screen pt-24">
      {/* Breadcrumb */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4">
        <nav aria-label="Breadcrumb" className="flex items-center gap-2 text-xs text-[var(--color-text-muted)]">
          <Link href="/" className="hover:text-[var(--color-gold)] transition-colors">Home</Link>
          <span>/</span>
          <Link href="/products" className="hover:text-[var(--color-gold)] transition-colors">Collections</Link>
          <span>/</span>
          <span className="text-[var(--color-text-secondary)]">{product.title}</span>
        </nav>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 pb-16">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16">

          {/* === LEFT: Media === */}
          <div className="space-y-4">
            {/* View Toggle */}
            {product.modelPath && (
              <div className="flex items-center gap-2">
                {(["photos", "3d"] as const).map((mode) => (
                  <button
                    key={mode}
                    onClick={() => setViewMode(mode)}
                    aria-pressed={viewMode === mode}
                    className={`flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-medium border transition-all ${
                      viewMode === mode
                        ? "bg-[var(--color-gold)] border-[var(--color-gold)] text-white"
                        : "border-[var(--color-border)] text-[var(--color-text-secondary)] hover:border-[var(--color-gold)] hover:text-[var(--color-gold)]"
                    }`}
                  >
                    {mode === "photos" ? (
                      <><ZoomIn className="w-3.5 h-3.5" />Photos</>
                    ) : (
                      <><Box className="w-3.5 h-3.5" />3D View</>
                    )}
                  </button>
                ))}
              </div>
            )}

            {/* Main media */}
            <AnimatePresence mode="wait">
              {viewMode === "3d" && product.modelPath ? (
                <motion.div
                  key="3d"
                  initial={{ opacity: 0, scale: 0.96 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.4 }}
                  className="relative h-[500px] sm:h-[600px] rounded-3xl overflow-hidden bg-[var(--color-border)]"
                >
                  <ModelViewer
                    src={product.modelPath}
                    alt={`Interactive 3D model of ${product.title}`}
                    poster={product.images[0]}
                    className="w-full h-full"
                    autoRotate
                    cameraControls
                    ar
                    exposure={0.8}
                    shadowIntensity={1}
                  />
                </motion.div>
              ) : (
                <motion.div
                  key="photos"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.3 }}
                  className="space-y-4"
                >
                  {/* Main photo */}
                  <div className="relative h-[500px] sm:h-[600px] rounded-3xl overflow-hidden bg-[var(--color-border)] group cursor-zoom-in"
                    onClick={() => setIsLightboxOpen(true)}
                  >
                    {product.images[activeImage] ? (
                      <img
                        src={product.images[activeImage]}
                        alt={`${product.title} - view ${activeImage + 1}`}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-[var(--color-gold-light)]/20 to-[var(--color-gold)]/10">
                        <span className="font-display text-3xl text-[var(--color-gold)] opacity-40 italic">
                          {product.title}
                        </span>
                      </div>
                    )}

                    {/* Badges */}
                    <div className="absolute top-4 left-4 flex flex-col gap-2">
                      {product.isBestseller && (
                        <span className="px-3 py-1 bg-[var(--color-champagne)] text-white text-xs font-bold rounded-full">Bestseller</span>
                      )}
                      {product.isNew && (
                        <span className="px-3 py-1 bg-[var(--color-gold)] text-white text-xs font-bold rounded-full">New Arrival</span>
                      )}
                      {discount && (
                        <span className="px-3 py-1 bg-red-500 text-white text-xs font-bold rounded-full">-{discount}% OFF</span>
                      )}
                    </div>

                    {/* Zoom hint */}
                    <div className="absolute top-4 right-4 w-9 h-9 rounded-full bg-white/80 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                      <ZoomIn className="w-4 h-4 text-[var(--color-text-secondary)]" />
                    </div>

                    {/* Navigation arrows */}
                    {product.images.length > 1 && (
                      <>
                        <button
                          onClick={(e) => { e.stopPropagation(); prevImage(); }}
                          aria-label="Previous image"
                          className="absolute left-3 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-white/80 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all hover:bg-white"
                        >
                          <ChevronLeft className="w-4 h-4" />
                        </button>
                        <button
                          onClick={(e) => { e.stopPropagation(); nextImage(); }}
                          aria-label="Next image"
                          className="absolute right-3 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-white/80 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all hover:bg-white"
                        >
                          <ChevronRight className="w-4 h-4" />
                        </button>
                      </>
                    )}
                  </div>

                  {/* Thumbnail strip */}
                  {product.images.length > 1 && (
                    <div className="flex gap-3 overflow-x-auto pb-1">
                      {product.images.map((img, i) => (
                        <button
                          key={i}
                          onClick={() => setActiveImage(i)}
                          aria-label={`View image ${i + 1}`}
                          className={`shrink-0 w-20 h-20 rounded-xl overflow-hidden border-2 transition-all ${
                            i === activeImage
                              ? "border-[var(--color-gold)] shadow-[var(--shadow-gold)]"
                              : "border-transparent opacity-60 hover:opacity-100"
                          }`}
                        >
                          <img src={img} alt="" className="w-full h-full object-cover" />
                        </button>
                      ))}
                    </div>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* === RIGHT: Product Info === */}
          <AnimatedSection direction="right" className="space-y-6">
            {/* Category + SKU */}
            <div className="flex items-center justify-between">
              <span className="text-[var(--color-gold)] text-xs font-sans uppercase tracking-widest font-medium">
                {product.category}
              </span>
              <span className="text-[10px] text-[var(--color-text-muted)] font-mono">
                SKU: {product.sku}
              </span>
            </div>

            {/* Title */}
            <div>
              <h1 className="font-display text-3xl sm:text-4xl font-semibold text-[var(--color-text-primary)] leading-tight">
                {product.title}
              </h1>
              <p className="text-[var(--color-text-secondary)] italic font-display mt-1">
                {product.subtitle}
              </p>
            </div>

            {/* Rating */}
            <StarRating
              rating={product.rating}
              reviewCount={product.reviewCount}
              size="md"
            />

            {/* Price */}
            <div className="flex items-baseline gap-4">
              <span className="font-sans text-3xl font-bold text-[var(--color-gold)]">
                {formatPrice(product.price)}
              </span>
              {product.originalPrice && (
                <>
                  <span className="text-[var(--color-text-muted)] line-through text-lg">
                    {formatPrice(product.originalPrice)}
                  </span>
                  <span className="px-2 py-0.5 bg-red-50 text-red-500 text-sm font-bold rounded-lg">
                    Save {discount}%
                  </span>
                </>
              )}
            </div>

            <div className="divider-gold" />

            {/* Color Selector */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <label className="text-sm font-semibold text-[var(--color-text-primary)]">
                  Color
                </label>
                <span className="text-sm text-[var(--color-text-secondary)]">
                  {selectedColor.name}
                </span>
              </div>
              <div className="flex gap-3">
                {product.colors.map((color) => (
                  <button
                    key={color.name}
                    onClick={() => setSelectedColor(color)}
                    aria-label={color.name}
                    aria-pressed={selectedColor.name === color.name}
                    title={color.name}
                    className={`relative w-10 h-10 rounded-full border-3 transition-all hover:scale-110 ${
                      selectedColor.name === color.name
                        ? "border-[var(--color-gold)] scale-110 shadow-[var(--shadow-gold)]"
                        : "border-[var(--color-border)]"
                    }`}
                    style={{ backgroundColor: color.hex }}
                  >
                    {color.hex === "#FFFFFF" && (
                      <span className="absolute inset-0.5 rounded-full border border-[var(--color-border)]" />
                    )}
                    {selectedColor.name === color.name && (
                      <span className="absolute -bottom-1 -right-1 w-4 h-4 bg-[var(--color-gold)] rounded-full flex items-center justify-center">
                        <Check className="w-2.5 h-2.5 text-white" />
                      </span>
                    )}
                  </button>
                ))}
              </div>
            </div>

            {/* Size Selector */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <label className="text-sm font-semibold text-[var(--color-text-primary)]">
                  Size
                </label>
                <button className="text-xs text-[var(--color-gold)] hover:underline">
                  Size Guide
                </button>
              </div>
              <div className="flex flex-wrap gap-2">
                {product.sizes.map((size) => {
                  const sizeStock = getStock(product, size.label, selectedColor.name);
                  const isOutOfStock = sizeStock === 0;
                  return (
                    <button
                      key={size.label}
                      onClick={() => !isOutOfStock && setSelectedSize(size.label)}
                      aria-pressed={selectedSize === size.label}
                      aria-label={`Size ${size.label}${isOutOfStock ? " - Out of stock" : ""}`}
                      disabled={isOutOfStock}
                      title={size.measurements}
                      className={`relative px-4 py-2 rounded-xl text-sm font-medium border-2 transition-all ${
                        isOutOfStock
                          ? "border-[var(--color-border)] text-[var(--color-text-muted)] opacity-40 cursor-not-allowed line-through"
                          : selectedSize === size.label
                          ? "border-[var(--color-gold)] bg-[var(--color-gold)] text-white shadow-[var(--shadow-gold)]"
                          : "border-[var(--color-border)] text-[var(--color-text-secondary)] hover:border-[var(--color-gold)] hover:text-[var(--color-gold)]"
                      }`}
                    >
                      {size.label}
                    </button>
                  );
                })}
              </div>
              {selectedSize && (
                <p className="text-xs text-[var(--color-text-muted)] mt-2">
                  {product.sizes.find((s) => s.label === selectedSize)?.measurements}
                </p>
              )}
            </div>

            {/* Stock Status */}
            <div className={`flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-medium ${stockStatus.bg} ${stockStatus.color}`}>
              <AlertCircle className="w-4 h-4" />
              {stockStatus.label}
              {stock > 0 && (
                <span className="text-[var(--color-text-muted)] font-normal ml-1">
                  · {stock} units available
                </span>
              )}
            </div>

            {/* CTA Buttons */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <button
                onClick={handleAddToCart}
                disabled={stock === 0}
                id="add-to-cart-btn"
                className={`flex items-center justify-center gap-2 py-4 rounded-2xl font-semibold text-sm transition-all ${
                  stock === 0
                    ? "bg-[var(--color-border)] text-[var(--color-text-muted)] cursor-not-allowed"
                    : inCart
                    ? "bg-[var(--color-gold)]/20 border-2 border-[var(--color-gold)] text-[var(--color-gold)]"
                    : "bg-gradient-to-r from-[var(--color-gold)] to-[var(--color-gold-dark)] text-white shadow-[var(--shadow-gold)] hover:shadow-xl hover:-translate-y-0.5"
                }`}
              >
                <ShoppingBag className="w-4 h-4" />
                {inCart ? "In Cart ✓" : "Add to Cart"}
              </button>

              <button
                onClick={handleWhatsApp}
                id="whatsapp-order-btn"
                className="whatsapp-btn flex items-center justify-center gap-2 py-4 rounded-2xl font-semibold text-sm text-white"
              >
                <MessageCircle className="w-4 h-4" />
                Order via WhatsApp
              </button>
            </div>

            {/* Wishlist + Share */}
            <div className="flex gap-3">
              <button
                onClick={() => {
                  toggle(product.slug);
                  toast.info(
                    wishlisted ? "Removed from wishlist" : "Added to wishlist",
                    product.title
                  );
                }}
                className="flex-1 flex items-center justify-center gap-2 py-3 rounded-2xl border border-[var(--color-border)] text-sm font-medium text-[var(--color-text-secondary)] hover:border-[var(--color-gold)] hover:text-[var(--color-gold)] transition-all"
                aria-pressed={wishlisted}
              >
                <Heart
                  className={`w-4 h-4 ${wishlisted ? "fill-[var(--color-gold)] text-[var(--color-gold)]" : ""}`}
                />
                {wishlisted ? "Wishlisted" : "Add to Wishlist"}
              </button>
              <button
                onClick={handleShare}
                className="flex items-center justify-center gap-2 px-4 py-3 rounded-2xl border border-[var(--color-border)] text-sm font-medium text-[var(--color-text-secondary)] hover:border-[var(--color-gold)] hover:text-[var(--color-gold)] transition-all"
                aria-label="Share product"
              >
                <Share2 className="w-4 h-4" />
              </button>
            </div>

            {/* Shipping info */}
            <div className="grid grid-cols-3 gap-3">
              {[
                { icon: Truck, text: "Free shipping above ₨5,000" },
                { icon: RefreshCw, text: "7-day easy returns" },
                { icon: Shield, text: "100% authentic fabric" },
              ].map((item) => (
                <div key={item.text} className="flex flex-col items-center text-center gap-2 p-3 rounded-xl bg-[var(--color-bg)] border border-[var(--color-border)]">
                  <item.icon className="w-4 h-4 text-[var(--color-gold)]" />
                  <p className="text-[10px] text-[var(--color-text-muted)] leading-tight">{item.text}</p>
                </div>
              ))}
            </div>

            {/* Product details */}
            <div className="pt-4 border-t border-[var(--color-border)] space-y-3">
              <h2 className="font-display font-semibold text-[var(--color-text-primary)]">
                Product Details
              </h2>
              <p className="text-sm text-[var(--color-text-secondary)] leading-relaxed">
                {product.longDescription}
              </p>
              <div className="grid grid-cols-2 gap-2 text-xs text-[var(--color-text-muted)]">
                <div>
                  <span className="font-medium text-[var(--color-text-secondary)]">Material: </span>
                  {product.material}
                </div>
                <div>
                  <span className="font-medium text-[var(--color-text-secondary)]">SKU: </span>
                  {product.sku}
                </div>
              </div>
            </div>

            {/* Care instructions */}
            <div className="pt-4 border-t border-[var(--color-border)]">
              <h2 className="font-display font-semibold text-[var(--color-text-primary)] mb-3">
                Care Instructions
              </h2>
              <ul className="space-y-1.5">
                {product.careInstructions.map((instruction) => (
                  <li key={instruction} className="flex items-center gap-2 text-xs text-[var(--color-text-muted)]">
                    <span className="w-1.5 h-1.5 rounded-full bg-[var(--color-gold)] shrink-0" />
                    {instruction}
                  </li>
                ))}
              </ul>
            </div>
          </AnimatedSection>
        </div>
      </div>
    </div>
  );
}
