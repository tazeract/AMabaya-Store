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
  Check,
  Phone,
  Truck,
  RefreshCw,
  Shield,
} from "lucide-react";
import Link from "next/link";
import { useCart } from "@/context/CartContext";
import { useWishlist } from "@/context/WishlistContext";
import { formatPrice, getStock, getDiscountPercent } from "@/lib/products";
import { StarRating } from "@/components/ui/StarRating";
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
  const [selectedSize, setSelectedSize] = useState(product.sizes[0]?.label ?? "Free Size");
  const [selectedColor, setSelectedColor] = useState(product.colors[0]);
  const [viewMode, setViewMode] = useState<"photos" | "3d">("photos");
  const [activeImage, setActiveImage] = useState(0);

  const { addItem, isInCart } = useCart();
  const { toggle, isWishlisted } = useWishlist();

  const stock = getStock(product, selectedSize, selectedColor.name);
  const inCart = isInCart(product.slug, selectedSize, selectedColor.name);
  const wishlisted = isWishlisted(product.slug);
  const discount = product.originalPrice
    ? getDiscountPercent(product.price, product.originalPrice)
    : null;

  const handleAddToCart = () => {
    if (stock === 0) return;
    addItem(product, selectedSize, selectedColor.name);
    toast.success("Added to Bag", `${product.title} (${selectedSize})`);
    document.dispatchEvent(new CustomEvent("open-cart"));
  };

  const handleWhatsApp = () => {
    const productUrl = `${siteConfig.siteUrl}/products/${product.slug}`;
    const message = `Salam! I want to order this from AMabaya:\n\n*${product.title}*\nSize: ${selectedSize}\nColor: ${selectedColor.name}\nPrice: ${formatPrice(product.price)}\nURL: ${productUrl}`;
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
      toast.success("Link Copied", "Product link copied to clipboard");
    }
  };

  const prevImage = () => setActiveImage((i) => (i - 1 + product.images.length) % product.images.length);
  const nextImage = () => setActiveImage((i) => (i + 1) % product.images.length);

  return (
    <div className="min-h-screen bg-white">
      {/* Breadcrumb Navigation */}
      <div className="border-b border-[#E5E7EB] bg-[#FBF9F6]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5">
          <nav aria-label="Breadcrumb" className="flex items-center gap-2 text-xs font-sans text-[#6B7280] uppercase tracking-wider">
            <Link href="/" className="hover:text-[#111827]">Home</Link>
            <span>/</span>
            <Link href="/products" className="hover:text-[#111827]">Collections</Link>
            <span>/</span>
            <Link href={`/products?category=${product.category}`} className="hover:text-[#111827]">
              {product.category}
            </Link>
            <span>/</span>
            <span className="text-[#111827] font-medium truncate max-w-xs">{product.title}</span>
          </nav>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 lg:py-16">
        <div className="grid lg:grid-cols-12 gap-10 lg:gap-14 items-start">

          {/* === LEFT: Media Presentation (7 Cols) === */}
          <div className="lg:col-span-7 space-y-4">
            {/* View Mode Toggle if 3D is available */}
            {product.modelPath && (
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setViewMode("photos")}
                  className={`px-4 py-1.5 text-xs uppercase tracking-widest font-sans font-semibold border ${
                    viewMode === "photos"
                      ? "bg-[#111827] text-white border-[#111827]"
                      : "bg-white text-[#374151] border-[#D1D5DB] hover:border-[#111827]"
                  }`}
                >
                  High-Res Photos
                </button>
                <button
                  onClick={() => setViewMode("3d")}
                  className={`px-4 py-1.5 text-xs uppercase tracking-widest font-sans font-semibold border flex items-center gap-1.5 ${
                    viewMode === "3d"
                      ? "bg-[#111827] text-white border-[#111827]"
                      : "bg-white text-[#374151] border-[#D1D5DB] hover:border-[#111827]"
                  }`}
                >
                  <Box className="w-3.5 h-3.5" /> 3D View
                </button>
              </div>
            )}

            {/* Main Image Display */}
            <div className="relative aspect-[3/4] w-full bg-[#F3F4F6] border border-[#E5E7EB] overflow-hidden">
              <AnimatePresence mode="wait">
                {viewMode === "3d" && product.modelPath ? (
                  <motion.div
                    key="3d-viewer"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="w-full h-full"
                  >
                    <ModelViewer
                      src={product.modelPath}
                      alt={product.title}
                      poster={product.images[0]}
                      className="w-full h-full"
                      autoRotate
                      cameraControls
                      ar
                    />
                  </motion.div>
                ) : (
                  <motion.div
                    key={activeImage}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.3 }}
                    className="w-full h-full relative"
                  >
                    <img
                      src={product.images[activeImage] || "/products/classic-noir-abaya/image-1.jpg"}
                      alt={product.title}
                      className="w-full h-full object-cover object-top"
                    />

                    {/* Badges */}
                    <div className="absolute top-4 left-4 flex flex-col gap-1.5 z-10">
                      {discount && (
                        <span className="bg-[#111827] text-white text-[11px] font-sans font-bold tracking-wider px-2.5 py-1 uppercase">
                          -{discount}% Off
                        </span>
                      )}
                      {product.isBestseller && (
                        <span className="bg-[var(--color-gold)] text-white text-[11px] font-sans font-bold tracking-wider px-2.5 py-1 uppercase">
                          Bestseller
                        </span>
                      )}
                    </div>

                    {/* Carousel Nav Arrows */}
                    {product.images.length > 1 && (
                      <>
                        <button
                          onClick={prevImage}
                          aria-label="Previous image"
                          className="absolute left-3 top-1/2 -translate-y-1/2 w-10 h-10 bg-white/90 border border-[#E5E7EB] flex items-center justify-center text-[#111827] hover:bg-[#111827] hover:text-white transition-colors"
                        >
                          <ChevronLeft className="w-4 h-4" />
                        </button>
                        <button
                          onClick={nextImage}
                          aria-label="Next image"
                          className="absolute right-3 top-1/2 -translate-y-1/2 w-10 h-10 bg-white/90 border border-[#E5E7EB] flex items-center justify-center text-[#111827] hover:bg-[#111827] hover:text-white transition-colors"
                        >
                          <ChevronRight className="w-4 h-4" />
                        </button>
                      </>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Thumbnail Strip */}
            {product.images.length > 1 && (
              <div className="flex gap-3 overflow-x-auto pb-1">
                {product.images.map((img, i) => (
                  <button
                    key={i}
                    onClick={() => {
                      setViewMode("photos");
                      setActiveImage(i);
                    }}
                    className={`w-20 aspect-[3/4] bg-[#F3F4F6] border overflow-hidden transition-all ${
                      activeImage === i && viewMode === "photos"
                        ? "border-[#111827] ring-1 ring-[#111827]"
                        : "border-[#E5E7EB] opacity-70 hover:opacity-100"
                    }`}
                  >
                    <img src={img} alt="" className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* === RIGHT: Product Purchase & Details (5 Cols) === */}
          <div className="lg:col-span-5 space-y-6">
            <div>
              <p className="text-[11px] font-sans font-semibold tracking-[0.22em] text-[#A3845A] uppercase mb-1">
                {product.category} · AMabaya Signature
              </p>
              <h1 className="font-serif text-3xl sm:text-4xl text-[#111827] font-normal leading-tight">
                {product.title}
              </h1>
              <p className="text-xs text-[#6B7280] font-sans mt-1">
                SKU: <span className="font-mono">{product.sku}</span>
              </p>
            </div>

            {/* Price Display */}
            <div className="flex items-baseline gap-3 pb-4 border-b border-[#E5E7EB]">
              <span className="font-sans text-2xl sm:text-3xl font-semibold text-[#111827]">
                {formatPrice(product.price)}
              </span>
              {product.originalPrice && (
                <span className="font-sans text-base text-[#9CA3AF] line-through">
                  {formatPrice(product.originalPrice)}
                </span>
              )}
              <span className="text-[11px] text-[#6B7280] font-sans uppercase tracking-wider ml-auto">
                Taxes Included · COD Available
              </span>
            </div>

            {/* Description Summary */}
            <p className="text-sm text-[#4B5563] font-sans leading-relaxed">
              {product.description}
            </p>

            {/* Color Swatch Selector */}
            <div>
              <label className="block text-xs font-sans font-semibold text-[#111827] uppercase tracking-wider mb-2">
                Color: <span className="font-normal text-[#4B5563]">{selectedColor.name}</span>
              </label>
              <div className="flex gap-2.5">
                {product.colors.map((color) => (
                  <button
                    key={color.name}
                    onClick={() => setSelectedColor(color)}
                    title={color.name}
                    aria-label={`Select color ${color.name}`}
                    className={`w-7 h-7 rounded-full border-2 transition-all ${
                      selectedColor.name === color.name
                        ? "border-[#111827] scale-110"
                        : "border-transparent opacity-70 hover:opacity-100"
                    }`}
                    style={{ backgroundColor: color.hex }}
                  />
                ))}
              </div>
            </div>

            {/* Size Selector with Measurement Guide */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-xs font-sans font-semibold text-[#111827] uppercase tracking-wider">
                  Select Size: <span className="font-normal text-[#4B5563]">{selectedSize}</span>
                </label>
                <Link href="/about" className="text-xs text-[#111827] underline uppercase tracking-wider">
                  Size Guide
                </Link>
              </div>

              <div className="grid grid-cols-5 gap-2">
                {product.sizes.map((size) => {
                  const sizeStock = getStock(product, size.label, selectedColor.name);
                  const isOutOfStock = sizeStock === 0;
                  return (
                    <button
                      key={size.label}
                      onClick={() => !isOutOfStock && setSelectedSize(size.label)}
                      disabled={isOutOfStock}
                      className={`py-2.5 text-xs font-sans font-semibold uppercase tracking-wider border transition-all ${
                        isOutOfStock
                          ? "border-[#E5E7EB] text-[#D1D5DB] cursor-not-allowed line-through bg-[#F9FAFB]"
                          : selectedSize === size.label
                          ? "border-[#111827] bg-[#111827] text-white"
                          : "border-[#D1D5DB] text-[#374151] hover:border-[#111827]"
                      }`}
                    >
                      {size.label}
                    </button>
                  );
                })}
              </div>

              {selectedSize && (
                <p className="text-[11px] text-[#6B7280] font-sans mt-2">
                  Fit info: {product.sizes.find((s) => s.label === selectedSize)?.measurements ?? "Standard Pakistani Cut"}
                </p>
              )}
            </div>

            {/* Action Buttons */}
            <div className="space-y-3 pt-2">
              <button
                onClick={handleAddToCart}
                disabled={stock === 0}
                className="w-full luxury-btn-primary py-4 flex items-center justify-center gap-2 text-sm"
              >
                <ShoppingBag className="w-4 h-4" />
                <span>{inCart ? "In Bag (Add Another)" : "Add To Bag"}</span>
              </button>

              <button
                onClick={handleWhatsApp}
                className="w-full border border-emerald-800 text-emerald-900 bg-emerald-50/60 hover:bg-emerald-800 hover:text-white font-sans text-xs uppercase tracking-widest font-semibold py-3.5 flex items-center justify-center gap-2 transition-colors"
              >
                <Phone className="w-4 h-4" />
                <span>Order Directly on WhatsApp</span>
              </button>

              <div className="flex gap-2">
                <button
                  onClick={() => {
                    toggle(product.slug);
                    if (!wishlisted) toast.success("Added to Wishlist", product.title);
                    else toast.info("Removed from Wishlist", product.title);
                  }}
                  className="flex-1 py-2.5 border border-[#D1D5DB] hover:border-[#111827] text-xs font-sans uppercase tracking-wider text-[#374151] flex items-center justify-center gap-1.5 transition-colors"
                >
                  <Heart className={`w-3.5 h-3.5 ${wishlisted ? "fill-red-600 text-red-600" : ""}`} />
                  <span>{wishlisted ? "Wishlisted" : "Save To Wishlist"}</span>
                </button>

                <button
                  onClick={handleShare}
                  aria-label="Share product"
                  className="px-4 py-2.5 border border-[#D1D5DB] hover:border-[#111827] text-[#374151] transition-colors"
                >
                  <Share2 className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Trust Perks */}
            <div className="grid grid-cols-3 gap-2 pt-4 border-t border-[#E5E7EB] text-center text-xs text-[#4B5563] font-sans">
              <div className="p-3 bg-[#FBF9F6] border border-[#E5E7EB]">
                <Truck className="w-4 h-4 mx-auto mb-1 text-[#111827]" />
                <p className="text-[10px] uppercase font-semibold">Free Delivery</p>
                <p className="text-[9px] text-[#6B7280]">Over Rs. 5,000</p>
              </div>
              <div className="p-3 bg-[#FBF9F6] border border-[#E5E7EB]">
                <RefreshCw className="w-4 h-4 mx-auto mb-1 text-[#111827]" />
                <p className="text-[10px] uppercase font-semibold">7 Days</p>
                <p className="text-[9px] text-[#6B7280]">Easy Exchange</p>
              </div>
              <div className="p-3 bg-[#FBF9F6] border border-[#E5E7EB]">
                <Shield className="w-4 h-4 mx-auto mb-1 text-[#111827]" />
                <p className="text-[10px] uppercase font-semibold">100% Pure</p>
                <p className="text-[9px] text-[#6B7280]">Imported Fabrics</p>
              </div>
            </div>

            {/* Extended Details */}
            <div className="space-y-4 pt-4 border-t border-[#E5E7EB]">
              <div>
                <h3 className="font-serif text-lg text-[#111827] mb-1">Fabric & Craftsmanship</h3>
                <p className="text-xs text-[#4B5563] font-sans leading-relaxed">
                  {product.longDescription}
                </p>
                <p className="text-xs text-[#374151] font-sans mt-2 font-medium">
                  Material: <span className="font-normal text-[#6B7280]">{product.material}</span>
                </p>
              </div>

              <div>
                <h3 className="font-serif text-lg text-[#111827] mb-1.5">Garment Care</h3>
                <ul className="space-y-1 text-xs text-[#6B7280] font-sans">
                  {product.careInstructions.map((ins) => (
                    <li key={ins} className="flex items-center gap-2">
                      <span className="w-1 h-1 bg-[#111827] rounded-full" />
                      <span>{ins}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

          </div>

        </div>
      </div>
    </div>
  );
}
