"use client";

import { useState } from "react";
import Link from "next/link";
import { Eye, ShoppingBag, Heart, ArrowRight } from "lucide-react";
import { useCart } from "@/context/CartContext";
import { useWishlist } from "@/context/WishlistContext";
import { toast } from "@/components/ui/Toaster";
import type { Product } from "@/types";

interface TrendingAbayasProps {
  products?: Product[];
}

const DEFAULT_ABAYAS = [
  {
    id: "ab-1",
    title: "Sage Floral Embroidered Abaya",
    slug: "classic-noir-abaya",
    price: 6490,
    originalPrice: 8500,
    images: [
      "/products/classic-noir-abaya/image-1.jpg",
      "/products/classic-noir-abaya/image-2.jpg",
    ],
    badge: "SALE",
    badgeType: "sale",
    discount: "24% OFF",
    category: "Abaya",
    rating: 4.9,
    reviewCount: 42,
  },
  {
    id: "ab-2",
    title: "Beige Layered Cape Abaya",
    slug: "royal-zahra-kaftan",
    price: 7990,
    originalPrice: 9990,
    images: [
      "/products/royal-zahra-kaftan/image-1.jpg",
      "/products/royal-zahra-kaftan/image-2.jpg",
    ],
    badge: "NEW",
    badgeType: "new",
    discount: "20% OFF",
    category: "Abaya",
    rating: 5.0,
    reviewCount: 28,
  },
  {
    id: "ab-3",
    title: "Plum Velvet Zari Abaya",
    slug: "classic-noir-abaya",
    price: 8990,
    originalPrice: 11500,
    images: [
      "/products/classic-noir-abaya/image-2.jpg",
      "/products/classic-noir-abaya/image-1.jpg",
    ],
    badge: "HOT",
    badgeType: "hot",
    discount: "22% OFF",
    category: "Abaya",
    rating: 4.8,
    reviewCount: 35,
  },
  {
    id: "ab-4",
    title: "Teal Hand-Embroidered Abaya",
    slug: "royal-zahra-kaftan",
    price: 6990,
    originalPrice: 8900,
    images: [
      "/products/royal-zahra-kaftan/image-2.jpg",
      "/products/royal-zahra-kaftan/image-1.jpg",
    ],
    badge: "SALE",
    badgeType: "sale",
    discount: "21% OFF",
    category: "Abaya",
    rating: 4.9,
    reviewCount: 19,
  },
];

export function TrendingAbayas({ products }: TrendingAbayasProps) {
  const { addItem } = useCart();
  const { toggle, isWishlisted } = useWishlist();
  const [hoveredId, setHoveredId] = useState<string | null>(null);

  const displayList = products && products.length > 0 ? products.slice(0, 4) : DEFAULT_ABAYAS;

  const handleQuickAdd = (product: any, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    addItem(
      {
        slug: product.slug,
        title: product.title,
        price: product.price,
        originalPrice: product.originalPrice,
        images: product.images,
        category: product.category || "Abaya",
        sizes: [{ label: "Standard", available: true }],
        colors: ["Default"],
        description: "",
        tags: [],
        rating: 5,
        reviewCount: 1,
        createdAt: new Date().toISOString(),
      } as unknown as Product,
      "Standard",
      "Default",
      1
    );
    toast.success("Added to Bag!", `${product.title} has been added.`);
  };

  return (
    <section className="py-12 sm:py-16 bg-white border-b border-[#F0ECE6]" aria-label="New In Abayas">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-8 gap-4">
          <div>
            <div className="inline-flex items-center gap-2 mb-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-[#DA3F3F]"></span>
              <span className="text-[11px] font-sans font-bold uppercase tracking-[0.2em] text-[#DA3F3F]">
                Fresh Drop · Trending Now
              </span>
            </div>
            <h2 className="font-serif text-2xl sm:text-3xl lg:text-4xl text-[#111827] font-medium tracking-tight">
              NEW IN ABAYAS
            </h2>
          </div>
          <Link
            href="/products?category=Abaya"
            className="inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-[#111827] hover:text-[#9A84C8] transition-colors group"
          >
            <span>View All Abayas</span>
            <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>

        {/* 2-Col Mobile / 4-Col Desktop Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6">
          {displayList.map((item: any) => {
            const isWish = isWishlisted(item.slug);
            const isHovered = hoveredId === item.id || hoveredId === item.slug;

            return (
              <div
                key={item.id || item.slug}
                className="group relative flex flex-col bg-white rounded-lg transition-all duration-300"
                onMouseEnter={() => setHoveredId(item.id || item.slug)}
                onMouseLeave={() => setHoveredId(null)}
              >
                {/* Image Container with 10px radius */}
                <div className="relative aspect-[3/4] w-full overflow-hidden rounded-[10px] bg-[#F5F5F5]">
                  {/* Badges */}
                  <div className="absolute top-2.5 left-2.5 z-10 flex flex-col gap-1.5">
                    {item.badge && (
                      <span
                        className={`text-[10px] font-bold tracking-wider px-2 py-0.5 rounded text-white shadow-sm ${
                          item.badgeType === "sale" || item.badge === "SALE"
                            ? "bg-[#DA3F3F]"
                            : item.badgeType === "new" || item.badge === "NEW"
                            ? "bg-[#64BF99]"
                            : "bg-[#9A84C8]"
                        }`}
                      >
                        {item.badge}
                      </span>
                    )}
                    {item.discount && (
                      <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-black/70 text-white backdrop-blur-xs">
                        {item.discount}
                      </span>
                    )}
                  </div>

                  {/* Wishlist Button */}
                  <button
                    onClick={(e) => {
                      e.preventDefault();
                      toggle(item.slug);
                    }}
                    className={`absolute top-2.5 right-2.5 z-10 w-8 h-8 rounded-full flex items-center justify-center transition-all ${
                      isWish
                        ? "bg-red-50 text-[#DA3F3F]"
                        : "bg-white/80 backdrop-blur-xs text-[#111827] hover:bg-white hover:scale-110"
                    }`}
                    aria-label="Add to Wishlist"
                  >
                    <Heart className={`w-4 h-4 ${isWish ? "fill-[#DA3F3F]" : ""}`} />
                  </button>

                  {/* Primary & Hover Image */}
                  <Link href={`/products/${item.slug}`} className="block w-full h-full">
                    <img
                      src={
                        isHovered && item.images && item.images[1]
                          ? item.images[1]
                          : item.images[0] || "/products/classic-noir-abaya/image-1.jpg"
                      }
                      alt={item.title}
                      className="w-full h-full object-cover object-top transition-transform duration-700 group-hover:scale-105"
                    />
                  </Link>

                  {/* Quick Action Overlay on Desktop Hover */}
                  <div className="absolute inset-x-2 bottom-2 z-10 hidden sm:flex gap-1.5 opacity-0 group-hover:opacity-100 transition-all duration-300 translate-y-2 group-hover:translate-y-0">
                    <button
                      onClick={(e) => handleQuickAdd(item, e)}
                      className="flex-1 py-2.5 bg-[#111827] text-white hover:bg-black text-[11px] font-bold uppercase tracking-wider rounded flex items-center justify-center gap-1.5 shadow-md transition-colors"
                    >
                      <ShoppingBag className="w-3.5 h-3.5" />
                      <span>Quick Add</span>
                    </button>
                    <Link
                      href={`/products/${item.slug}`}
                      className="w-9 h-9 bg-white text-[#111827] hover:bg-[#F3F4F6] rounded flex items-center justify-center shadow-md transition-colors"
                      aria-label="View Details"
                    >
                      <Eye className="w-4 h-4" />
                    </Link>
                  </div>
                </div>

                {/* Content info */}
                <div className="pt-3 pb-1 flex flex-col flex-1 text-left">
                  <Link
                    href={`/products/${item.slug}`}
                    className="font-sans text-xs sm:text-sm font-medium text-[#111827] line-clamp-1 hover:text-[#9A84C8] transition-colors"
                  >
                    {item.title}
                  </Link>

                  {/* Price */}
                  <div className="flex items-center gap-2 mt-1.5">
                    <span className="font-sans font-bold text-sm sm:text-base text-[#DA3F3F]">
                      Rs. {item.price.toLocaleString("en-PK")}
                    </span>
                    {item.originalPrice && item.originalPrice > item.price && (
                      <span className="font-sans text-xs text-[#9CA3AF] line-through">
                        Rs. {item.originalPrice.toLocaleString("en-PK")}
                      </span>
                    )}
                  </div>

                  {/* Mobile Quick Add Button */}
                  <button
                    onClick={(e) => handleQuickAdd(item, e)}
                    className="mt-2.5 sm:hidden w-full py-1.5 bg-[#111827] text-white text-[10px] font-bold uppercase tracking-wider rounded flex items-center justify-center gap-1 active:scale-95 transition-transform"
                  >
                    <ShoppingBag className="w-3 h-3" />
                    <span>Add to Bag</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>

      </div>
    </section>
  );
}
