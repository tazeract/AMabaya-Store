"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ShoppingBag, Heart, Share2, Box, ChevronLeft,
  ChevronRight, Check, Phone, Truck, RefreshCw, Shield,
  Minus, Plus, Zap,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCart } from "@/context/CartContext";
import { useWishlist } from "@/context/WishlistContext";
import { formatPrice, getStock, getDiscountPercent, getAllProducts } from "@/lib/products";
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
  product: Product;
}

// ─── Tab content ─────────────────────────────────────────────────────────────
const TABS = ["Description", "Details & Care", "Shipping & Returns"] as const;
type Tab = (typeof TABS)[number];

export function ProductDetailClient({ product }: ProductDetailClientProps) {
  const router = useRouter();
  const [selectedSize, setSelectedSize] = useState(product.sizes[0]?.label ?? "Free Size");
  const [selectedColor, setSelectedColor] = useState(product.colors[0]);
  const [quantity, setQuantity] = useState(1);
  const [viewMode, setViewMode] = useState<"photos" | "3d">("photos");
  const [activeImage, setActiveImage] = useState(0);
  const [activeTab, setActiveTab] = useState<Tab>("Description");
  const [relatedProducts, setRelatedProducts] = useState<Product[]>([]);

  const { addItem, isInCart } = useCart();
  const { toggle, isWishlisted } = useWishlist();

  const stock = getStock(product, selectedSize, selectedColor?.name ?? "");
  const inCart = isInCart(product.slug, selectedSize, selectedColor?.name ?? "");
  const wishlisted = isWishlisted(product.slug);
  const discount = product.originalPrice
    ? getDiscountPercent(product.price, product.originalPrice)
    : null;

  // Clamp qty to stock
  useEffect(() => {
    if (quantity > stock && stock > 0) setQuantity(stock);
    if (quantity < 1) setQuantity(1);
  }, [stock, quantity]);

  // Fetch related products (same category, different slug)
  useEffect(() => {
    getAllProducts().then((all) => {
      const related = all
        .filter((p) => p.category === product.category && p.slug !== product.slug)
        .slice(0, 4);
      setRelatedProducts(related);
    });
  }, [product.category, product.slug]);

  const handleAddToCart = () => {
    if (stock === 0) return;
    addItem(product, selectedSize, selectedColor.name, quantity);
    toast.success("Added to Bag", `${product.title} (${selectedSize}) ×${quantity}`);
    document.dispatchEvent(new CustomEvent("open-cart"));
  };

  const handleBuyNow = () => {
    if (stock === 0) return;
    addItem(product, selectedSize, selectedColor.name, quantity);
    router.push("/checkout");
  };

  const handleWhatsApp = () => {
    const productUrl = `${siteConfig.siteUrl}/products/${product.slug}`;
    const message = `Salam! I want to order this from RIWAYAH:\n\n*${product.title}*\nSize: ${selectedSize}\nColor: ${selectedColor.name}\nQty: ${quantity}\nPrice: ${formatPrice(product.price * quantity)}\nURL: ${productUrl}`;
    window.open(`https://wa.me/${siteConfig.whatsappNumber}?text=${encodeURIComponent(message)}`, "_blank");
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
      {/* Breadcrumb */}
      <div className="border-b border-[#E5E7EB] bg-[#FBF9F6]">
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

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 lg:py-16">
        <div className="grid lg:grid-cols-12 gap-10 lg:gap-14 items-start">

          {/* ─── LEFT: Gallery (7 Cols) ─── */}
          <div className="lg:col-span-7 space-y-4">
            {product.modelPath && (
              <div className="flex items-center gap-2">
                <button onClick={() => setViewMode("photos")}
                  className={`px-4 py-1.5 text-xs uppercase tracking-widest font-sans font-semibold border ${viewMode === "photos" ? "bg-[#111827] text-white border-[#111827]" : "bg-white text-[#374151] border-[#D1D5DB] hover:border-[#111827]"}`}>
                  Photos
                </button>
                <button onClick={() => setViewMode("3d")}
                  className={`px-4 py-1.5 text-xs uppercase tracking-widest font-sans font-semibold border flex items-center gap-1.5 ${viewMode === "3d" ? "bg-[#111827] text-white border-[#111827]" : "bg-white text-[#374151] border-[#D1D5DB] hover:border-[#111827]"}`}>
                  <Box className="w-3.5 h-3.5" /> 3D View
                </button>
              </div>
            )}

            {/* Main Image */}
            <div className="relative aspect-[3/4] w-full bg-[#F3F4F6] border border-[#E5E7EB] overflow-hidden">
              <AnimatePresence mode="wait">
                {viewMode === "3d" && product.modelPath ? (
                  <motion.div key="3d" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="w-full h-full">
                    <ModelViewer src={product.modelPath} alt={product.title} poster={product.images[0]} className="w-full h-full" autoRotate cameraControls ar />
                  </motion.div>
                ) : (
                  <motion.div key={activeImage} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.25 }} className="w-full h-full relative">
                    <img
                      src={product.images[activeImage] || "/products/classic-noir-abaya/image-1.jpg"}
                      alt={product.title}
                      className="w-full h-full object-cover object-top"
                    />
                    {/* Badges */}
                    <div className="absolute top-4 left-4 flex flex-col gap-1.5 z-10">
                      {discount && <span className="bg-[#111827] text-white text-[11px] font-bold tracking-wider px-2.5 py-1 uppercase">-{discount}% Off</span>}
                      {product.isBestseller && <span className="bg-[var(--color-gold)] text-white text-[11px] font-bold tracking-wider px-2.5 py-1 uppercase">Bestseller</span>}
                      {product.isNew && !product.isBestseller && <span className="bg-[#111827] text-white text-[11px] font-bold tracking-wider px-2.5 py-1 uppercase">New</span>}
                    </div>
                    {/* Arrows */}
                    {product.images.length > 1 && (
                      <>
                        <button onClick={prevImage} aria-label="Previous" className="absolute left-3 top-1/2 -translate-y-1/2 w-10 h-10 bg-white/90 border border-[#E5E7EB] flex items-center justify-center hover:bg-[#111827] hover:text-white transition-colors">
                          <ChevronLeft className="w-4 h-4" />
                        </button>
                        <button onClick={nextImage} aria-label="Next" className="absolute right-3 top-1/2 -translate-y-1/2 w-10 h-10 bg-white/90 border border-[#E5E7EB] flex items-center justify-center hover:bg-[#111827] hover:text-white transition-colors">
                          <ChevronRight className="w-4 h-4" />
                        </button>
                        {/* Dot indicators */}
                        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-1.5">
                          {product.images.map((_, i) => (
                            <button key={i} onClick={() => setActiveImage(i)}
                              className={`w-1.5 h-1.5 rounded-full transition-all ${i === activeImage ? "bg-white w-4" : "bg-white/50"}`} />
                          ))}
                        </div>
                      </>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Thumbnails */}
            {product.images.length > 1 && (
              <div className="flex gap-2.5 overflow-x-auto pb-1">
                {product.images.map((img, i) => (
                  <button key={i} onClick={() => { setViewMode("photos"); setActiveImage(i); }}
                    className={`w-20 flex-shrink-0 aspect-[3/4] bg-[#F3F4F6] border overflow-hidden transition-all ${activeImage === i && viewMode === "photos" ? "border-[#111827] ring-1 ring-[#111827]" : "border-[#E5E7EB] opacity-60 hover:opacity-100"}`}>
                    <img src={img} alt="" className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}

            {/* Description Tabs — below gallery on mobile, here on desktop */}
            <div className="hidden lg:block pt-4">
              <div className="flex border-b border-[#E5E7EB]">
                {TABS.map((tab) => (
                  <button key={tab} onClick={() => setActiveTab(tab)}
                    className={`px-5 py-3 text-xs font-sans font-semibold uppercase tracking-wider transition-colors ${activeTab === tab ? "border-b-2 border-[#111827] text-[#111827]" : "text-[#6B7280] hover:text-[#374151]"}`}>
                    {tab}
                  </button>
                ))}
              </div>
              <div className="pt-5 text-sm text-[#4B5563] font-sans leading-relaxed">
                {activeTab === "Description" && (
                  <div>
                    <p className="mb-3">{product.longDescription || product.description}</p>
                    <p className="font-semibold text-[#111827] text-xs uppercase tracking-wider">Material</p>
                    <p className="mt-1">{product.material}</p>
                  </div>
                )}
                {activeTab === "Details & Care" && (
                  <ul className="space-y-2">
                    {product.careInstructions?.map((ins) => (
                      <li key={ins} className="flex items-start gap-2.5">
                        <span className="w-1.5 h-1.5 mt-1.5 bg-[#111827] rounded-full flex-shrink-0" />
                        {ins}
                      </li>
                    ))}
                  </ul>
                )}
                {activeTab === "Shipping & Returns" && (
                  <div className="space-y-3">
                    <p>📦 Free shipping on orders above <strong>Rs. 5,000</strong>. Standard delivery charge of Rs. 250 on all other orders.</p>
                    <p>🚚 Delivery within <strong>3–7 business days</strong> across Pakistan (1–2 days for major cities).</p>
                    <p>🔄 <strong>7-day hassle-free exchange policy</strong>. Item must be unused, unwashed, with original tags attached.</p>
                    <p>💬 For returns or exchange queries, WhatsApp us at <strong>{siteConfig.contactPhone}</strong>.</p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* ─── RIGHT: Purchase Panel (5 Cols) ─── */}
          <div className="lg:col-span-5 space-y-5 lg:sticky lg:top-28">
            {/* Title Block */}
            <div>
              <p className="text-[11px] font-semibold tracking-[0.22em] text-[#A3845A] uppercase mb-1">
                {product.category} · RIWAYAH Signature
              </p>
              <h1 className="font-serif text-3xl sm:text-4xl text-[#111827] font-normal leading-tight">
                {product.title}
              </h1>
              {product.subtitle && (
                <p className="text-sm text-[#6B7280] font-sans mt-1 italic">{product.subtitle}</p>
              )}
              {/* Rating */}
              {product.rating > 0 && (
                <div className="flex items-center gap-2 mt-2">
                  <StarRating rating={product.rating} size="sm" />
                  <span className="text-xs text-[#6B7280] font-sans">({product.reviewCount} reviews)</span>
                </div>
              )}
            </div>

            {/* Price */}
            <div className="flex items-baseline gap-3 pb-4 border-b border-[#E5E7EB]">
              <span className="font-sans text-2xl sm:text-3xl font-semibold text-[#111827]">{formatPrice(product.price)}</span>
              {product.originalPrice && (
                <span className="font-sans text-base text-[#9CA3AF] line-through">{formatPrice(product.originalPrice)}</span>
              )}
              {discount && (
                <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full">Save {discount}%</span>
              )}
            </div>

            {/* Description */}
            <p className="text-sm text-[#4B5563] font-sans leading-relaxed">{product.description}</p>

            {/* Color Selector */}
            {product.colors?.length > 0 && (
              <div>
                <label className="block text-xs font-semibold text-[#111827] uppercase tracking-wider mb-2">
                  Colour: <span className="font-normal text-[#4B5563]">{selectedColor?.name}</span>
                </label>
                <div className="flex gap-2.5 flex-wrap">
                  {product.colors.map((color) => (
                    <button key={color.name} onClick={() => setSelectedColor(color)} title={color.name}
                      className={`w-8 h-8 rounded-full border-2 transition-all ${selectedColor?.name === color.name ? "border-[#111827] scale-110 shadow-md" : "border-transparent opacity-70 hover:opacity-100 hover:scale-105"}`}
                      style={{ backgroundColor: color.hex }} />
                  ))}
                </div>
              </div>
            )}

            {/* Size Selector */}
            {product.sizes?.length > 0 && (
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-xs font-semibold text-[#111827] uppercase tracking-wider">
                    Size: <span className="font-normal text-[#4B5563]">{selectedSize}</span>
                  </label>
                  <Link href="/about" className="text-xs text-[#111827] underline uppercase tracking-wider">Size Guide</Link>
                </div>
                <div className="grid grid-cols-5 gap-2">
                  {product.sizes.map((size) => {
                    const sizeStock = getStock(product, size.label, selectedColor?.name ?? "");
                    const oos = sizeStock === 0;
                    return (
                      <button key={size.label} onClick={() => !oos && setSelectedSize(size.label)} disabled={oos}
                        title={size.measurements}
                        className={`py-2.5 text-xs font-semibold uppercase tracking-wider border transition-all ${oos ? "border-[#E5E7EB] text-[#D1D5DB] cursor-not-allowed line-through bg-[#F9FAFB]" : selectedSize === size.label ? "border-[#111827] bg-[#111827] text-white" : "border-[#D1D5DB] text-[#374151] hover:border-[#111827]"}`}>
                        {size.label}
                      </button>
                    );
                  })}
                </div>
                {selectedSize && (
                  <p className="text-[11px] text-[#6B7280] mt-2">
                    {product.sizes.find((s) => s.label === selectedSize)?.measurements ?? "Standard Pakistani Cut"}
                  </p>
                )}
              </div>
            )}

            {/* Quantity Selector */}
            <div>
              <label className="block text-xs font-semibold text-[#111827] uppercase tracking-wider mb-2">
                Quantity
              </label>
              <div className="flex items-center gap-0 border border-[#D1D5DB] w-fit">
                <button onClick={() => setQuantity((q) => Math.max(1, q - 1))} disabled={quantity <= 1}
                  className="w-10 h-10 flex items-center justify-center text-[#374151] hover:bg-[#F3F4F6] disabled:opacity-30 transition-colors">
                  <Minus className="w-3.5 h-3.5" />
                </button>
                <span className="w-12 h-10 flex items-center justify-center text-sm font-semibold text-[#111827] border-x border-[#D1D5DB]">
                  {quantity}
                </span>
                <button onClick={() => setQuantity((q) => Math.min(q + 1, stock > 0 ? stock : 10))} disabled={quantity >= stock && stock > 0}
                  className="w-10 h-10 flex items-center justify-center text-[#374151] hover:bg-[#F3F4F6] disabled:opacity-30 transition-colors">
                  <Plus className="w-3.5 h-3.5" />
                </button>
              </div>
              {stock > 0 && stock <= 5 && (
                <p className="text-xs text-amber-700 mt-1.5 font-medium">⚠️ Only {stock} left in stock</p>
              )}
              {stock === 0 && (
                <p className="text-xs text-red-600 mt-1.5 font-medium">Out of stock in this variant</p>
              )}
            </div>

            {/* Action Buttons */}
            <div className="space-y-3 pt-1">
              <button onClick={handleAddToCart} disabled={stock === 0}
                className="w-full luxury-btn-primary py-4 flex items-center justify-center gap-2 text-sm disabled:opacity-40 disabled:cursor-not-allowed">
                <ShoppingBag className="w-4 h-4" />
                <span>{inCart ? "In Bag (Add Another)" : "Add To Bag"}</span>
              </button>

              <button onClick={handleBuyNow} disabled={stock === 0}
                className="w-full bg-[#A3845A] hover:bg-[#8B6E4A] text-white font-sans text-xs uppercase tracking-widest font-semibold py-4 flex items-center justify-center gap-2 transition-colors disabled:opacity-40 disabled:cursor-not-allowed">
                <Zap className="w-4 h-4" />
                <span>Buy Now</span>
              </button>

              <button onClick={handleWhatsApp}
                className="w-full border border-emerald-800 text-emerald-900 bg-emerald-50/60 hover:bg-emerald-800 hover:text-white font-sans text-xs uppercase tracking-widest font-semibold py-3.5 flex items-center justify-center gap-2 transition-colors">
                <Phone className="w-4 h-4" />
                <span>Order via WhatsApp</span>
              </button>

              <div className="flex gap-2">
                <button onClick={() => { toggle(product.slug); if (!wishlisted) toast.success("Saved", product.title); else toast.info("Removed", product.title); }}
                  className="flex-1 py-2.5 border border-[#D1D5DB] hover:border-[#111827] text-xs font-sans uppercase tracking-wider text-[#374151] flex items-center justify-center gap-1.5 transition-colors">
                  <Heart className={`w-3.5 h-3.5 ${wishlisted ? "fill-red-600 text-red-600" : ""}`} />
                  {wishlisted ? "Saved" : "Save"}
                </button>
                <button onClick={handleShare} aria-label="Share"
                  className="px-5 py-2.5 border border-[#D1D5DB] hover:border-[#111827] text-[#374151] transition-colors">
                  <Share2 className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Trust perks */}
            <div className="grid grid-cols-3 gap-2 pt-4 border-t border-[#E5E7EB] text-center text-xs text-[#4B5563] font-sans">
              {[
                { icon: Truck, title: "Free Delivery", sub: "Over Rs. 5,000" },
                { icon: RefreshCw, title: "7-Day Exchange", sub: "Hassle Free" },
                { icon: Shield, title: "100% Authentic", sub: "Imported Fabrics" },
              ].map(({ icon: Icon, title, sub }) => (
                <div key={title} className="p-3 bg-[#FBF9F6] border border-[#E5E7EB]">
                  <Icon className="w-4 h-4 mx-auto mb-1 text-[#111827]" />
                  <p className="text-[10px] uppercase font-semibold">{title}</p>
                  <p className="text-[9px] text-[#6B7280]">{sub}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Description Tabs — mobile only (below the product panel) */}
        <div className="lg:hidden mt-10 border-t border-[#E5E7EB] pt-8">
          <div className="flex border-b border-[#E5E7EB]">
            {TABS.map((tab) => (
              <button key={tab} onClick={() => setActiveTab(tab)}
                className={`flex-1 py-3 text-[11px] font-semibold uppercase tracking-wider transition-colors ${activeTab === tab ? "border-b-2 border-[#111827] text-[#111827]" : "text-[#6B7280]"}`}>
                {tab}
              </button>
            ))}
          </div>
          <div className="pt-5 text-sm text-[#4B5563] font-sans leading-relaxed">
            {activeTab === "Description" && (
              <div>
                <p className="mb-3">{product.longDescription || product.description}</p>
                <p className="font-semibold text-[#111827] text-xs uppercase tracking-wider mt-4">Material</p>
                <p className="mt-1">{product.material}</p>
              </div>
            )}
            {activeTab === "Details & Care" && (
              <ul className="space-y-2">
                {product.careInstructions?.map((ins) => (
                  <li key={ins} className="flex items-start gap-2.5">
                    <span className="w-1.5 h-1.5 mt-1.5 bg-[#111827] rounded-full flex-shrink-0" />
                    {ins}
                  </li>
                ))}
              </ul>
            )}
            {activeTab === "Shipping & Returns" && (
              <div className="space-y-3">
                <p>📦 Free shipping over <strong>Rs. 5,000</strong>. Rs. 250 on all other orders.</p>
                <p>🚚 Delivery within <strong>3–7 business days</strong> nationwide.</p>
                <p>🔄 <strong>7-day exchange policy</strong>. Unused, unwashed with original tags.</p>
                <p>💬 WhatsApp: <strong>{siteConfig.contactPhone}</strong></p>
              </div>
            )}
          </div>
        </div>

        {/* Related Products */}
        {relatedProducts.length > 0 && (
          <div className="mt-16 pt-12 border-t border-[#E5E7EB]">
            <div className="text-center mb-8">
              <h2 className="font-serif text-2xl sm:text-3xl text-[#111827] font-normal">
                You May Also Love
              </h2>
              <p className="text-xs text-[#6B7280] mt-1.5 font-sans">More from our {product.category} collection</p>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6">
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
