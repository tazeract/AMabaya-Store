"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ShoppingBag, Heart, Share2, Box, ChevronLeft,
  ChevronRight, Phone, Truck, RefreshCw, Shield,
  Minus, Plus, Zap, Sparkles, Check, ArrowRight,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCart } from "@/context/CartContext";
import { useWishlist } from "@/context/WishlistContext";
import { formatPrice, getStock, getDiscountPercent, getAllProducts, getProductBySlug } from "@/lib/products";
import { StarRating } from "@/components/ui/StarRating";
import { ProductCard } from "@/components/products/ProductCard";
import { toast } from "@/components/ui/Toaster";
import dynamic from "next/dynamic";
import type { Product } from "@/types";
import siteConfig from "@/lib/siteConfig";

const ModelViewer = dynamic(
  () => import("@/components/products/ModelViewer").then((m) => m.ModelViewer),
  { ssr: false }
);

interface ProductDetailClientProps {
  initialProduct: Product | null;
  slug: string;
}

const TABS = ["Description", "Details & Care", "Shipping & Returns"] as const;
type Tab = (typeof TABS)[number];

export function ProductDetailClient({ initialProduct, slug }: ProductDetailClientProps) {
  const router = useRouter();
  const [product, setProduct] = useState<Product | null>(initialProduct);
  const [loading, setLoading] = useState(!initialProduct);

  useEffect(() => {
    if (!product) {
      getProductBySlug(slug).then((res) => {
        setProduct(res);
        setLoading(false);
      });
    }
  }, [slug, product]);

  const colors = product && Array.isArray(product.colors) && product.colors.length > 0
    ? product.colors
    : [{ name: "Midnight Black", hex: "#111827" }];

  const sizes = product && Array.isArray(product.sizes) && product.sizes.length > 0
    ? product.sizes
    : [{ label: "Standard", available: true, measurements: "Free Size" }];

  const images = product && Array.isArray(product.images) && product.images.length > 0
    ? product.images
    : ["/products/classic-noir-abaya/image-1.jpg"];

  const [selectedSize, setSelectedSize] = useState<string>(sizes[0]?.label ?? "Standard");
  const [selectedColor, setSelectedColor] = useState(colors[0]);
  const [quantity, setQuantity] = useState(1);
  const [viewMode, setViewMode] = useState<"photos" | "3d">("photos");
  const [activeImage, setActiveImage] = useState(0);
  const [activeTab, setActiveTab] = useState<Tab>("Description");
  const [relatedProducts, setRelatedProducts] = useState<Product[]>([]);

  const { addItem, isInCart } = useCart();
  const { toggle, isWishlisted } = useWishlist();

  // Keep selected values up to date when product loads
  useEffect(() => {
    if (product) {
      if (product.sizes?.length > 0) setSelectedSize(product.sizes[0].label);
      if (product.colors?.length > 0) setSelectedColor(product.colors[0]);
    }
  }, [product]);

  // Fetch related products
  useEffect(() => {
    if (product) {
      getAllProducts().then((all) => {
        const related = all
          .filter((p) => p.category === product.category && p.slug !== product.slug)
          .slice(0, 4);
        setRelatedProducts(related);
      });
    }
  }, [product]);

  if (loading) {
    return (
      <div className="min-h-[70vh] bg-white flex flex-col items-center justify-center space-y-4">
        <div className="w-8 h-8 border-2 border-[#111827] border-t-transparent rounded-full animate-spin" />
        <p className="text-xs uppercase font-sans tracking-widest text-[#6B7280]">
          Loading Creation...
        </p>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-[70vh] bg-white flex flex-col items-center justify-center p-6 text-center">
        <h2 className="font-serif text-3xl text-[#111827] mb-3">Product Not Found</h2>
        <p className="text-sm text-[#6B7280] font-sans max-w-md mb-8">
          The requested modest silhouette is currently unavailable or has been archived.
        </p>
        <Link href="/products" className="luxury-btn-primary">
          <span>Explore All Collections</span>
          <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
    );
  }

  const stock = getStock(product, selectedSize, selectedColor?.name ?? "");
  const inCart = isInCart(product.slug, selectedSize, selectedColor?.name ?? "Default");
  const wishlisted = isWishlisted(product.slug);
  const discount = product.originalPrice
    ? getDiscountPercent(product.price, product.originalPrice)
    : 0;

  const handleAddToCart = () => {
    if (stock === 0) return;
    addItem(product, selectedSize, selectedColor?.name ?? "Default", quantity);
    toast.success("Added to Bag", `${product.title} (${selectedSize}) ×${quantity}`);
    document.dispatchEvent(new CustomEvent("open-cart"));
  };

  const handleBuyNow = () => {
    if (stock === 0) return;
    addItem(product, selectedSize, selectedColor?.name ?? "Default", quantity);
    router.push("/checkout");
  };

  const handleWhatsApp = () => {
    const productUrl = `${siteConfig.siteUrl}/products/${product.slug}`;
    const message = `Salam! I would like to order from RIWAYAH:\n\n*${product.title}*\nSize: ${selectedSize}\nColor: ${selectedColor?.name || "Standard"}\nQuantity: ${quantity}\nPrice: ${formatPrice(product.price * quantity)}\nProduct Link: ${productUrl}`;
    window.open(`https://wa.me/${siteConfig.whatsappNumber}?text=${encodeURIComponent(message)}`, "_blank");
  };

  const handleShare = async () => {
    const url = typeof window !== "undefined" ? window.location.href : `${siteConfig.siteUrl}/products/${product.slug}`;
    if (navigator.share) {
      await navigator.share({ title: product.title, text: product.description, url });
    } else {
      await navigator.clipboard.writeText(url);
      toast.success("Link Copied", "Product link copied to clipboard");
    }
  };

  const prevImage = () => setActiveImage((i) => (i - 1 + images.length) % images.length);
  const nextImage = () => setActiveImage((i) => (i + 1) % images.length);

  return (
    <div className="min-h-screen bg-white">
      {/* Breadcrumb Bar */}
      <div className="border-b border-[#EAE6DF] bg-[#FAF9F7]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5">
          <nav aria-label="Breadcrumb" className="flex items-center gap-2 text-xs font-sans text-[#6B7280] uppercase tracking-wider">
            <Link href="/" className="hover:text-[#111827]">Home</Link>
            <span>/</span>
            <Link href="/products" className="hover:text-[#111827]">Collections</Link>
            <span>/</span>
            <Link href={`/products?category=${product.category}`} className="hover:text-[#111827]">{product.category}</Link>
            <span>/</span>
            <span className="text-[#111827] font-medium truncate max-w-xs">{product.title}</span>
          </nav>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 lg:py-16">
        <div className="grid lg:grid-cols-12 gap-8 lg:gap-14 items-start">

          {/* ─── LEFT: Gallery (7 Cols) ─── */}
          <div className="lg:col-span-7 space-y-4">
            {product.modelPath && (
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setViewMode("photos")}
                  className={`px-4 py-1.5 text-xs uppercase tracking-widest font-sans font-semibold border rounded ${
                    viewMode === "photos"
                      ? "bg-[#111827] text-white border-[#111827]"
                      : "bg-white text-[#374151] border-[#D1D5DB] hover:border-[#111827]"
                  }`}
                >
                  Photos
                </button>
                <button
                  onClick={() => setViewMode("3d")}
                  className={`px-4 py-1.5 text-xs uppercase tracking-widest font-sans font-semibold border rounded flex items-center gap-1.5 ${
                    viewMode === "3d"
                      ? "bg-[#111827] text-white border-[#111827]"
                      : "bg-white text-[#374151] border-[#D1D5DB] hover:border-[#111827]"
                  }`}
                >
                  <Box className="w-3.5 h-3.5" /> 3D View
                </button>
              </div>
            )}

            {/* Main Image View */}
            <div className="relative aspect-[3/4] w-full bg-[#F6F4EE] border border-[#EAE6DF] rounded-xl overflow-hidden shadow-sm">
              <AnimatePresence mode="wait">
                {viewMode === "3d" && product.modelPath ? (
                  <motion.div key="3d" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="w-full h-full">
                    <ModelViewer src={product.modelPath} alt={product.title} poster={images[0]} className="w-full h-full" autoRotate cameraControls ar />
                  </motion.div>
                ) : (
                  <motion.div key={activeImage} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.25 }} className="w-full h-full relative">
                    <img
                      src={images[activeImage] || "/products/classic-noir-abaya/image-1.jpg"}
                      alt={product.title}
                      className="w-full h-full object-cover object-top"
                    />
                    
                    {/* Badges */}
                    <div className="absolute top-4 left-4 flex flex-col gap-1.5 z-10">
                      {discount > 0 && (
                        <span className="bg-[#DA3F3F] text-white text-[11px] font-bold tracking-wider px-2.5 py-1 uppercase rounded shadow-xs">
                          {discount}% Off
                        </span>
                      )}
                      {product.isBestseller && (
                        <span className="bg-[#9A84C8] text-white text-[11px] font-bold tracking-wider px-2.5 py-1 uppercase rounded shadow-xs">
                          Bestseller
                        </span>
                      )}
                      {product.isNew && !product.isBestseller && (
                        <span className="bg-[#64BF99] text-white text-[11px] font-bold tracking-wider px-2.5 py-1 uppercase rounded shadow-xs">
                          New In
                        </span>
                      )}
                    </div>

                    {/* Image Arrows */}
                    {images.length > 1 && (
                      <>
                        <button
                          onClick={prevImage}
                          aria-label="Previous"
                          className="absolute left-3 top-1/2 -translate-y-1/2 w-10 h-10 bg-white/90 rounded-full border border-[#EAE6DF] flex items-center justify-center text-[#111827] hover:bg-[#111827] hover:text-white transition-colors shadow-sm"
                        >
                          <ChevronLeft className="w-5 h-5" />
                        </button>
                        <button
                          onClick={nextImage}
                          aria-label="Next"
                          className="absolute right-3 top-1/2 -translate-y-1/2 w-10 h-10 bg-white/90 rounded-full border border-[#EAE6DF] flex items-center justify-center text-[#111827] hover:bg-[#111827] hover:text-white transition-colors shadow-sm"
                        >
                          <ChevronRight className="w-5 h-5" />
                        </button>
                        {/* Dot indicators */}
                        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-1.5">
                          {images.map((_, i) => (
                            <button
                              key={i}
                              onClick={() => setActiveImage(i)}
                              className={`h-1.5 rounded-full transition-all ${i === activeImage ? "bg-white w-5" : "bg-white/60 w-1.5"}`}
                            />
                          ))}
                        </div>
                      </>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Thumbnails */}
            {images.length > 1 && (
              <div className="flex gap-3 overflow-x-auto pb-2">
                {images.map((img, i) => (
                  <button
                    key={i}
                    onClick={() => { setViewMode("photos"); setActiveImage(i); }}
                    className={`w-20 flex-shrink-0 aspect-[3/4] rounded-lg bg-[#F6F4EE] border overflow-hidden transition-all ${
                      activeImage === i && viewMode === "photos"
                        ? "border-[#111827] ring-2 ring-[#111827]/20 scale-102"
                        : "border-[#EAE6DF] opacity-70 hover:opacity-100"
                    }`}
                  >
                    <img src={img} alt="" className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}

            {/* Product Details Tabs (Desktop) */}
            <div className="hidden lg:block pt-6">
              <div className="flex border-b border-[#EAE6DF]">
                {TABS.map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    className={`px-6 py-3 text-xs font-sans font-bold uppercase tracking-wider transition-colors ${
                      activeTab === tab
                        ? "border-b-2 border-[#111827] text-[#111827]"
                        : "text-[#6B7280] hover:text-[#111827]"
                    }`}
                  >
                    {tab}
                  </button>
                ))}
              </div>
              <div className="pt-6 text-sm text-[#4B5563] font-sans leading-relaxed">
                {activeTab === "Description" && (
                  <div className="space-y-4">
                    <p>{product.longDescription || product.description}</p>
                    <div className="pt-2">
                      <p className="font-semibold text-[#111827] text-xs uppercase tracking-wider">Material & Craft</p>
                      <p className="mt-1 text-[#374151]">{product.material || "100% Premium Korean Nida"}</p>
                    </div>
                  </div>
                )}
                {activeTab === "Details & Care" && (
                  <ul className="space-y-2.5">
                    {product.careInstructions?.map((ins, idx) => (
                      <li key={idx} className="flex items-start gap-2.5">
                        <span className="w-1.5 h-1.5 mt-2 bg-[#9A84C8] rounded-full flex-shrink-0" />
                        <span>{ins}</span>
                      </li>
                    ))}
                  </ul>
                )}
                {activeTab === "Shipping & Returns" && (
                  <div className="space-y-3">
                    <p>📦 <strong>Free express delivery</strong> across Pakistan on all orders above <strong>Rs. 5,000</strong>.</p>
                    <p>🚚 Fast delivery within <strong>2–4 business days</strong> for major cities (Lahore, Karachi, Islamabad).</p>
                    <p>🔄 <strong>7-Day Hassle-Free Exchange Policy</strong>. Garment must be unworn with original tags attached.</p>
                    <p>💬 Instant sizing support via WhatsApp: <strong>{siteConfig.contactPhone}</strong></p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* ─── RIGHT: Purchase Panel (5 Cols) ─── */}
          <div className="lg:col-span-5 space-y-6 lg:sticky lg:top-28">
            {/* Title & Category */}
            <div>
              <div className="inline-flex items-center gap-2 mb-2">
                <Sparkles className="w-3.5 h-3.5 text-[#9A84C8]" />
                <span className="text-[11px] font-sans font-bold uppercase tracking-[0.2em] text-[#9A84C8]">
                  {product.category} · RIWAYAH Signature
                </span>
              </div>

              <h1 className="font-serif text-3xl sm:text-4xl text-[#111827] font-medium leading-tight">
                {product.title}
              </h1>

              {product.subtitle && (
                <p className="text-sm text-[#6B7280] font-sans mt-1 italic">{product.subtitle}</p>
              )}

              {/* Rating */}
              <div className="flex items-center gap-2 mt-2.5">
                <StarRating rating={product.rating || 5} size="sm" />
                <span className="text-xs text-[#6B7280] font-sans">
                  ({product.reviewCount || 12} customer reviews)
                </span>
              </div>
            </div>

            {/* Price Display */}
            <div className="flex items-baseline gap-3 pb-4 border-b border-[#EAE6DF]">
              <span className="font-sans text-3xl font-bold text-[#DA3F3F]">
                {formatPrice(product.price)}
              </span>
              {product.originalPrice && product.originalPrice > product.price && (
                <span className="font-sans text-base text-[#9CA3AF] line-through">
                  {formatPrice(product.originalPrice)}
                </span>
              )}
              {discount > 0 && (
                <span className="text-xs font-bold text-emerald-800 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
                  Save {discount}%
                </span>
              )}
            </div>

            {/* Short Description */}
            <p className="text-sm text-[#4B5563] font-sans leading-relaxed">
              {product.description}
            </p>

            {/* Color Selector */}
            {colors.length > 0 && (
              <div>
                <label className="block text-xs font-bold text-[#111827] uppercase tracking-wider mb-2">
                  Colour: <span className="font-normal text-[#6B7280]">{selectedColor?.name}</span>
                </label>
                <div className="flex gap-2.5 flex-wrap">
                  {colors.map((color) => (
                    <button
                      key={color.name}
                      onClick={() => setSelectedColor(color)}
                      title={color.name}
                      className={`w-8 h-8 rounded-full border-2 transition-all ${
                        selectedColor?.name === color.name
                          ? "border-[#111827] scale-110 shadow-md ring-2 ring-black/10"
                          : "border-transparent opacity-70 hover:opacity-100 hover:scale-105"
                      }`}
                      style={{ backgroundColor: color.hex || "#111827" }}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* Size Selector */}
            {sizes.length > 0 && (
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-xs font-bold text-[#111827] uppercase tracking-wider">
                    Select Size: <span className="font-normal text-[#6B7280]">{selectedSize}</span>
                  </label>
                  <Link href="/about" className="text-xs text-[#9A84C8] hover:underline uppercase tracking-wider font-semibold">
                    Size Guide
                  </Link>
                </div>
                <div className="grid grid-cols-4 gap-2">
                  {sizes.map((size) => {
                    const isSelected = selectedSize === size.label;
                    return (
                      <button
                        key={size.label}
                        onClick={() => setSelectedSize(size.label)}
                        className={`py-2.5 text-xs font-bold uppercase tracking-wider rounded-lg border transition-all ${
                          isSelected
                            ? "border-[#111827] bg-[#111827] text-white shadow-xs"
                            : "border-[#D1D5DB] text-[#374151] hover:border-[#111827] bg-white"
                        }`}
                      >
                        {size.label}
                      </button>
                    );
                  })}
                </div>
                {selectedSize && (
                  <p className="text-[11px] text-[#6B7280] mt-2">
                    {sizes.find((s) => s.label === selectedSize)?.measurements ?? "Standard Pakistani Cut"}
                  </p>
                )}
              </div>
            )}

            {/* Quantity Selector & Stock Indicator */}
            <div>
              <label className="block text-xs font-bold text-[#111827] uppercase tracking-wider mb-2">
                Quantity
              </label>
              <div className="flex items-center gap-0 border border-[#D1D5DB] rounded-lg w-fit overflow-hidden bg-white">
                <button
                  onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                  disabled={quantity <= 1}
                  className="w-10 h-10 flex items-center justify-center text-[#374151] hover:bg-[#F3F4F6] disabled:opacity-30 transition-colors"
                >
                  <Minus className="w-3.5 h-3.5" />
                </button>
                <span className="w-12 h-10 flex items-center justify-center text-sm font-bold text-[#111827] border-x border-[#D1D5DB]">
                  {quantity}
                </span>
                <button
                  onClick={() => setQuantity((q) => Math.min(q + 1, stock > 0 ? stock : 10))}
                  disabled={quantity >= stock && stock > 0}
                  className="w-10 h-10 flex items-center justify-center text-[#374151] hover:bg-[#F3F4F6] disabled:opacity-30 transition-colors"
                >
                  <Plus className="w-3.5 h-3.5" />
                </button>
              </div>

              {stock > 0 && stock <= 5 && (
                <p className="text-xs text-amber-700 mt-2 font-semibold">⚠️ Limited Stock: Only {stock} pieces remaining</p>
              )}
              {stock === 0 && (
                <p className="text-xs text-red-600 mt-2 font-semibold">Sold Out in this variant</p>
              )}
            </div>

            {/* Primary Action Buttons */}
            <div className="space-y-3 pt-2">
              <button
                onClick={handleAddToCart}
                disabled={stock === 0}
                className="w-full luxury-btn-primary py-4 rounded-lg flex items-center justify-center gap-2 text-sm font-bold tracking-widest uppercase disabled:opacity-40 disabled:cursor-not-allowed shadow-md"
              >
                <ShoppingBag className="w-4 h-4" />
                <span>{inCart ? "In Bag (Add Another)" : "Add To Bag"}</span>
              </button>

              <button
                onClick={handleBuyNow}
                disabled={stock === 0}
                className="w-full bg-[#9A84C8] hover:bg-[#856EB5] text-white font-sans text-xs uppercase tracking-widest font-bold py-4 rounded-lg flex items-center justify-center gap-2 transition-colors disabled:opacity-40 disabled:cursor-not-allowed shadow-md"
              >
                <Zap className="w-4 h-4" />
                <span>Instant Buy Now</span>
              </button>

              <button
                onClick={handleWhatsApp}
                className="w-full border border-emerald-700 text-emerald-900 bg-emerald-50 hover:bg-emerald-700 hover:text-white font-sans text-xs uppercase tracking-widest font-bold py-3.5 rounded-lg flex items-center justify-center gap-2 transition-colors"
              >
                <Phone className="w-4 h-4" />
                <span>Order via WhatsApp Helpline</span>
              </button>

              <div className="flex gap-2">
                <button
                  onClick={() => {
                    toggle(product.slug);
                    if (!wishlisted) toast.success("Saved to Wishlist", product.title);
                    else toast.info("Removed from Wishlist", product.title);
                  }}
                  className="flex-1 py-2.5 border border-[#D1D5DB] hover:border-[#111827] rounded-lg text-xs font-sans font-semibold uppercase tracking-wider text-[#374151] flex items-center justify-center gap-1.5 transition-colors bg-white"
                >
                  <Heart className={`w-3.5 h-3.5 ${wishlisted ? "fill-[#DA3F3F] text-[#DA3F3F]" : ""}`} />
                  <span>{wishlisted ? "Wishlisted" : "Save to Wishlist"}</span>
                </button>
                <button
                  onClick={handleShare}
                  aria-label="Share"
                  className="px-5 py-2.5 border border-[#D1D5DB] hover:border-[#111827] rounded-lg text-[#374151] transition-colors bg-white"
                >
                  <Share2 className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Trust Badges */}
            <div className="grid grid-cols-3 gap-2 pt-4 border-t border-[#EAE6DF] text-center text-xs text-[#4B5563] font-sans">
              {[
                { icon: Truck, title: "Free Delivery", sub: "Over Rs. 5,000" },
                { icon: RefreshCw, title: "7-Day Exchange", sub: "Hassle Free" },
                { icon: Shield, title: "100% Authentic", sub: "Imported Nida" },
              ].map(({ icon: Icon, title, sub }) => (
                <div key={title} className="p-3 bg-[#FAF9F7] border border-[#EAE6DF] rounded-lg">
                  <Icon className="w-4 h-4 mx-auto mb-1 text-[#111827]" />
                  <p className="text-[10px] uppercase font-bold text-[#111827]">{title}</p>
                  <p className="text-[9px] text-[#6B7280]">{sub}</p>
                </div>
              ))}
            </div>

          </div>
        </div>

        {/* Mobile Tabs */}
        <div className="lg:hidden mt-10 border-t border-[#EAE6DF] pt-8">
          <div className="flex border-b border-[#EAE6DF]">
            {TABS.map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`flex-1 py-3 text-[11px] font-bold uppercase tracking-wider transition-colors ${
                  activeTab === tab ? "border-b-2 border-[#111827] text-[#111827]" : "text-[#6B7280]"
                }`}
              >
                {tab}
              </button>
            ))}
          </div>
          <div className="pt-5 text-sm text-[#4B5563] font-sans leading-relaxed">
            {activeTab === "Description" && (
              <div className="space-y-3">
                <p>{product.longDescription || product.description}</p>
                <p className="font-bold text-[#111827] text-xs uppercase tracking-wider mt-3">Material</p>
                <p>{product.material || "100% Premium Korean Nida"}</p>
              </div>
            )}
            {activeTab === "Details & Care" && (
              <ul className="space-y-2">
                {product.careInstructions?.map((ins, i) => (
                  <li key={i} className="flex items-start gap-2">
                    <span className="w-1.5 h-1.5 mt-1.5 bg-[#9A84C8] rounded-full flex-shrink-0" />
                    <span>{ins}</span>
                  </li>
                ))}
              </ul>
            )}
            {activeTab === "Shipping & Returns" && (
              <div className="space-y-2.5">
                <p>📦 Free shipping nationwide over <strong>Rs. 5,000</strong>.</p>
                <p>🚚 Delivery in 2–4 business days.</p>
                <p>🔄 7-day hassle-free exchange policy.</p>
                <p>💬 WhatsApp styling assistance: <strong>{siteConfig.contactPhone}</strong></p>
              </div>
            )}
          </div>
        </div>

        {/* Related Products Showcase */}
        {relatedProducts.length > 0 && (
          <div className="mt-16 pt-12 border-t border-[#EAE6DF]">
            <div className="text-center mb-8">
              <span className="text-[11px] font-sans font-bold uppercase tracking-widest text-[#9A84C8]">
                Curated Recommendations
              </span>
              <h2 className="font-serif text-2xl sm:text-3xl text-[#111827] font-normal mt-1">
                You May Also Love
              </h2>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-6">
              {relatedProducts.map((p) => (
                <ProductCard key={p.slug} product={p} />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
