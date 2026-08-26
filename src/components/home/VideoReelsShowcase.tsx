"use client";

import { useState } from "react";
import Link from "next/link";
import { Play, Sparkles, ShoppingBag, Eye } from "lucide-react";
import { useCart } from "@/context/CartContext";
import { toast } from "@/components/ui/Toaster";
import type { Product } from "@/types";

interface ReelItem {
  id: string;
  title: string;
  subtitle: string;
  price: number;
  slug: string;
  image: string;
  badge: string;
}

const SOCIAL_REELS: ReelItem[] = [
  {
    id: "reel-1",
    title: "Hand-Embroidered Velvet Drape",
    subtitle: "Plum Zari & Pearl Embellishments",
    price: 8990,
    slug: "classic-noir-abaya",
    image: "/products/classic-noir-abaya/image-1.jpg",
    badge: "VIRAL ON INSTAGRAM",
  },
  {
    id: "reel-2",
    title: "Royal Zahra Silk Kaftan",
    subtitle: "Festive Flowing Sleeves",
    price: 7990,
    slug: "royal-zahra-kaftan",
    image: "/products/royal-zahra-kaftan/image-2.jpg",
    badge: "CUSTOMER FAVORITE",
  },
];

export function VideoReelsShowcase() {
  const { addItem } = useCart();

  const handleQuickAdd = (item: ReelItem, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    addItem(
      {
        slug: item.slug,
        title: item.title,
        price: item.price,
        images: [item.image],
        category: "Abaya",
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
    toast.success("Added to Bag!", `${item.title} added to your cart.`);
  };

  return (
    <section className="py-12 sm:py-16 bg-[#161319] text-white border-b border-[#2A2330]" aria-label="Social Lookbook">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8 sm:space-y-10">
        
        {/* Header */}
        <div className="text-center max-w-2xl mx-auto space-y-2">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 text-[#F3C5D0] text-[10px] font-bold uppercase tracking-widest">
            <Sparkles className="w-3 h-3" />
            <span>Watch & Shop Live Drapes</span>
          </div>
          <h2 className="font-serif text-2xl sm:text-4xl text-white font-normal tracking-wide">
            Trending On Social Lookbook
          </h2>
          <p className="text-xs sm:text-sm text-white/70 font-sans">
            See our artisanal embroidery and graceful drapes in real motion.
          </p>
        </div>

        {/* 2 Reel Showcase Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 lg:gap-8 max-w-4xl mx-auto">
          {SOCIAL_REELS.map((reel) => (
            <div
              key={reel.id}
              className="relative aspect-[9/14] sm:aspect-[9/13] rounded-2xl overflow-hidden bg-[#241E2B] shadow-xl group border border-white/10"
            >
              {/* Cover Image / Video Preview */}
              <img
                src={reel.image}
                alt={reel.title}
                className="w-full h-full object-cover object-top transition-transform duration-1000 group-hover:scale-105"
              />

              {/* Gradient Overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-black/20"></div>

              {/* Top Tag Badge */}
              <div className="absolute top-4 left-4 z-10">
                <span className="text-[10px] font-bold tracking-wider px-2.5 py-1 rounded-full bg-white/20 backdrop-blur-md text-white border border-white/20">
                  {reel.badge}
                </span>
              </div>

              {/* Play Button Icon */}
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <div className="w-14 h-14 rounded-full bg-white/30 backdrop-blur-md flex items-center justify-center text-white border border-white/40 shadow-lg group-hover:scale-110 transition-transform">
                  <Play className="w-6 h-6 fill-white ml-0.5" />
                </div>
              </div>

              {/* Bottom Product Overlay Card */}
              <div className="absolute bottom-4 inset-x-4 z-10 p-4 rounded-xl bg-black/70 backdrop-blur-md border border-white/15 flex items-center justify-between gap-3">
                <div className="min-w-0 flex-1">
                  <h4 className="font-serif text-sm font-medium text-white truncate">
                    {reel.title}
                  </h4>
                  <p className="text-[11px] text-white/70 font-sans truncate">
                    {reel.subtitle}
                  </p>
                  <p className="text-xs font-bold text-[#F3C5D0] mt-0.5">
                    Rs. {reel.price.toLocaleString("en-PK")}
                  </p>
                </div>

                <div className="flex items-center gap-1.5 shrink-0">
                  <button
                    onClick={(e) => handleQuickAdd(reel, e)}
                    className="px-3 py-2 bg-white text-[#111827] hover:bg-[#F3C5D0] text-[11px] font-bold uppercase rounded-md shadow flex items-center gap-1 transition-colors"
                  >
                    <ShoppingBag className="w-3.5 h-3.5" />
                    <span className="hidden xs:inline">Add</span>
                  </button>
                  <Link
                    href={`/products/${reel.slug}`}
                    className="w-8 h-8 rounded-md bg-white/20 hover:bg-white/30 text-white flex items-center justify-center transition-colors"
                    aria-label="View Product"
                  >
                    <Eye className="w-4 h-4" />
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
}
