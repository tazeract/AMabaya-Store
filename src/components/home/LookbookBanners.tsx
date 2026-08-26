"use client";

import Link from "next/link";
import { ArrowRight } from "lucide-react";

interface LookbookItem {
  id: string;
  title: string;
  subtitle: string;
  description: string;
  ctaText: string;
  href: string;
  image: string;
  theme: "light" | "dark" | "rose" | "warm";
}

const LOOKBOOK_BANNERS: LookbookItem[] = [
  {
    id: "skirt-sets",
    title: "Skirt Sets",
    subtitle: "MODEST & MODERN FITS",
    description: "Coordinated modest skirts and tailored blouses designed for effortless everyday grace.",
    ctaText: "Shop Skirt Sets",
    href: "/products?category=Set",
    image: "/products/royal-zahra-kaftan/image-1.jpg",
    theme: "warm",
  },
  {
    id: "long-dresses",
    title: "Long Dresses",
    subtitle: "FLOWING FESTIVE SILHOUETTES",
    description: "Maxi-length regal kaftans and abaya gowns embellished with fine gold zari and pearl accents.",
    ctaText: "Shop Long Dresses",
    href: "/products?category=Kaftan",
    image: "/products/royal-zahra-kaftan/image-2.jpg",
    theme: "dark",
  },
  {
    id: "tops-collection",
    title: "Tops Collection",
    subtitle: "CHIC MODEST TUNICS",
    description: "Button-down loose silhouettes and embroidered shirts made for warm Pakistani seasons.",
    ctaText: "Shop Tops & Tunics",
    href: "/products?category=Abaya",
    image: "/products/classic-noir-abaya/image-2.jpg",
    theme: "light",
  },
  {
    id: "coord-sets",
    title: "Co-ord Sets",
    subtitle: "MATCHING TWO-PIECE ENSEMBLES",
    description: "Monochrome jewel tones and pastel pairings cut in breathable textured fabrics.",
    ctaText: "Shop Co-ord Sets",
    href: "/products?category=Set",
    image: "/products/classic-noir-abaya/image-1.jpg",
    theme: "rose",
  },
];

export function LookbookBanners() {
  return (
    <section className="py-12 sm:py-16 bg-[#FAF9F7] border-b border-[#EAE6DF]" aria-label="Curated Silhouettes">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6 sm:space-y-8">
        
        {/* Section Heading */}
        <div className="text-center max-w-2xl mx-auto mb-8 sm:mb-10">
          <span className="text-[11px] font-sans font-bold uppercase tracking-[0.25em] text-[#9A84C8]">
            Curated Wardrobe Silhouettes
          </span>
          <h2 className="font-serif text-2xl sm:text-4xl text-[#111827] font-medium tracking-tight mt-1">
            Explore By Silhouette
          </h2>
        </div>

        {/* Stack of Lookbook Editorial Banners */}
        <div className="space-y-6 sm:space-y-8">
          {LOOKBOOK_BANNERS.map((banner) => {
            const isDark = banner.theme === "dark" || banner.theme === "rose";

            return (
              <div
                key={banner.id}
                className="relative overflow-hidden rounded-xl sm:rounded-2xl min-h-[220px] sm:min-h-[280px] lg:min-h-[320px] flex items-center shadow-xs hover:shadow-md transition-all duration-500 group"
              >
                {/* Background Image */}
                <div className="absolute inset-0 z-0">
                  <img
                    src={banner.image}
                    alt={banner.title}
                    className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-1000"
                  />
                  <div
                    className={`absolute inset-0 ${
                      banner.theme === "dark"
                        ? "bg-gradient-to-r from-black/85 via-black/60 to-black/30"
                        : banner.theme === "rose"
                        ? "bg-gradient-to-r from-[#4A1E2B]/90 via-[#4A1E2B]/60 to-transparent"
                        : banner.theme === "warm"
                        ? "bg-gradient-to-r from-[#EFE8DE]/95 via-[#EFE8DE]/80 to-transparent"
                        : "bg-gradient-to-r from-white/95 via-white/80 to-transparent"
                    }`}
                  ></div>
                </div>

                {/* Banner Content */}
                <div className="relative z-10 p-6 sm:p-10 lg:p-14 max-w-lg space-y-2.5 sm:space-y-3">
                  <span
                    className={`text-[10px] sm:text-[11px] font-sans font-bold uppercase tracking-[0.25em] ${
                      isDark ? "text-[#F8C8D4]" : "text-[#9A84C8]"
                    }`}
                  >
                    {banner.subtitle}
                  </span>

                  <h3
                    className={`font-serif text-3xl sm:text-4xl lg:text-5xl font-normal tracking-wide leading-tight ${
                      isDark ? "text-white" : "text-[#111827]"
                    }`}
                  >
                    {banner.title}
                  </h3>

                  <p
                    className={`text-xs sm:text-sm font-sans line-clamp-2 leading-relaxed ${
                      isDark ? "text-white/80" : "text-[#4B5563]"
                    }`}
                  >
                    {banner.description}
                  </p>

                  <div className="pt-2">
                    <Link
                      href={banner.href}
                      className={`inline-flex items-center gap-2 px-6 py-2.5 text-xs font-bold uppercase tracking-wider rounded-md shadow-xs transition-all ${
                        isDark
                          ? "bg-white text-[#111827] hover:bg-[#F8C8D4]"
                          : "bg-[#111827] text-white hover:bg-black"
                      }`}
                    >
                      <span>{banner.ctaText}</span>
                      <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                    </Link>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

      </div>
    </section>
  );
}
