"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { ArrowRight, Sparkles } from "lucide-react";

interface SubCategoryCard {
  title: string;
  count: string;
  href: string;
  image: string;
}

const DEFAULT_CATEGORIES: SubCategoryCard[] = [
  {
    title: "Everyday Abayas",
    count: "14+ Designs",
    href: "/products?category=Abaya",
    image: "/products/classic-noir-abaya/image-2.jpg",
  },
  {
    title: "Embroidered Luxury",
    count: "22+ Designs",
    href: "/products?category=Abaya&filter=new",
    image: "/products/royal-zahra-kaftan/image-2.jpg",
  },
  {
    title: "Abaya Sets & Inner Slips",
    count: "8+ Sets",
    href: "/products?category=Set",
    image: "/products/classic-noir-abaya/image-1.jpg",
  },
  {
    title: "Khimars & Flowing Kaftans",
    count: "12+ Styles",
    href: "/products?category=Kaftan",
    image: "/products/royal-zahra-kaftan/image-1.jpg",
  },
];

export function CategoryBannerGrid() {
  const [categoryCards, setCategoryCards] = useState<SubCategoryCard[]>(DEFAULT_CATEGORIES);

  const loadCategories = () => {
    if (typeof window !== "undefined") {
      try {
        const saved = localStorage.getItem("amabaya_categories");
        if (saved) {
          const parsed = JSON.parse(saved);
          if (Array.isArray(parsed) && parsed.length >= 2) {
            setCategoryCards(
              parsed.slice(0, 4).map((c: any) => ({
                title: c.name,
                count: "Curated Styles",
                href: `/products?category=${encodeURIComponent(c.slug || c.name)}`,
                image: c.image || "/products/classic-noir-abaya/image-2.jpg",
              }))
            );
            return;
          }
        }
      } catch (e) {
        console.warn("Could not load categories in grid:", e);
      }
    }
    setCategoryCards(DEFAULT_CATEGORIES);
  };

  useEffect(() => {
    loadCategories();
    const handleUpdate = () => loadCategories();
    window.addEventListener("amabaya_categories_updated", handleUpdate);
    window.addEventListener("storage", handleUpdate);
    return () => {
      window.removeEventListener("amabaya_categories_updated", handleUpdate);
      window.removeEventListener("storage", handleUpdate);
    };
  }, []);

  return (
    <section className="py-12 sm:py-16 bg-[#FAF9F7] border-b border-[#EAE6DF]" aria-label="Abayas Showcase">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8 sm:space-y-10">
        
        {/* Full-width Abayas Spotlight Banner with Editorial Overlay */}
        <div className="relative overflow-hidden rounded-xl sm:rounded-2xl bg-[#2D1B2D] text-white min-h-[220px] sm:min-h-[300px] flex items-center shadow-lg group">
          {/* Background image & gradient overlay */}
          <div className="absolute inset-0 z-0">
            <img
              src="/products/classic-noir-abaya/image-1.jpg"
              alt="Luxury Abayas"
              className="w-full h-full object-cover object-top opacity-40 group-hover:scale-105 transition-transform duration-1000"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-[#1E1120] via-[#2A172D]/90 to-transparent"></div>
          </div>

          {/* Banner Typography */}
          <div className="relative z-10 p-6 sm:p-10 lg:p-14 max-w-2xl space-y-3">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur-xs border border-white/20">
              <Sparkles className="w-3.5 h-3.5 text-[#F3C5D0]" />
              <span className="text-[11px] font-sans font-semibold tracking-widest text-[#F3C5D0] uppercase">
                Signature Collection
              </span>
            </div>

            <h2 className="font-serif text-3xl sm:text-5xl lg:text-6xl text-white font-normal tracking-wide leading-tight">
              Abayas
            </h2>

            <p className="text-xs sm:text-sm text-white/80 font-sans leading-relaxed max-w-md">
              From everyday breathable Korean Nida to masterfully hand-embroidered festive silhouettes.
            </p>

            <div className="pt-2">
              <Link
                href="/products?category=Abaya"
                className="inline-flex items-center gap-2 px-6 py-2.5 bg-white text-[#111827] hover:bg-[#F3C5D0] text-xs font-bold uppercase tracking-wider rounded-md shadow transition-colors"
              >
                <span>Shop All Abayas</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>
        </div>

        {/* 2x2 Sub-Category Cards (4 Split Tiles) */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5 sm:gap-6">
          {categoryCards.map((cat, idx) => (
            <Link
              key={idx}
              href={cat.href}
              className="group flex flex-col bg-white rounded-xl overflow-hidden shadow-xs hover:shadow-md transition-all duration-300 border border-[#EBE6DD]"
            >
              {/* Image Container */}
              <div className="relative aspect-[4/5] w-full overflow-hidden bg-[#F2ECE4]">
                <img
                  src={cat.image}
                  alt={cat.title}
                  className="w-full h-full object-cover object-top transition-transform duration-700 group-hover:scale-108"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent opacity-60 group-hover:opacity-40 transition-opacity"></div>
                <div className="absolute bottom-2.5 left-2.5 right-2.5 flex items-center justify-between text-white sm:hidden">
                  <span className="text-[10px] bg-black/60 backdrop-blur-xs px-2 py-0.5 rounded font-medium">
                    {cat.count}
                  </span>
                </div>
              </div>

              {/* Title label underneath */}
              <div className="p-3.5 sm:p-4 text-center bg-white">
                <h3 className="font-serif text-sm sm:text-base text-[#111827] font-medium group-hover:text-[#9A84C8] transition-colors">
                  {cat.title}
                </h3>
                <p className="hidden sm:block text-[11px] text-[#6B7280] font-sans mt-0.5">
                  {cat.count} · Explore
                </p>
              </div>
            </Link>
          ))}
        </div>

      </div>
    </section>
  );
}
