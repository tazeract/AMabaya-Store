"use client";

import Link from "next/link";
import { ArrowRight } from "lucide-react";

interface HijabType {
  title: string;
  count: string;
  priceFrom: string;
  image: string;
  href: string;
}

const HIJAB_TYPES: HijabType[] = [
  {
    title: "Laser Cut Hijabs",
    count: "18 Colors",
    priceFrom: "Rs. 1,490",
    image: "/products/pearl-embroidered-dupatta/image-1.jpg",
    href: "/products?category=Dupatta",
  },
  {
    title: "Crinkle Cotton Hijabs",
    count: "24 Colors",
    priceFrom: "Rs. 990",
    image: "/products/pearl-embroidered-dupatta/image-2.jpg",
    href: "/products?category=Dupatta",
  },
  {
    title: "Pure Silk Hijabs",
    count: "12 Designs",
    priceFrom: "Rs. 2,190",
    image: "/products/pearl-embroidered-dupatta/image-1.jpg",
    href: "/products?category=Dupatta",
  },
  {
    title: "Luxury Georgette Chiffon",
    count: "30+ Shades",
    priceFrom: "Rs. 1,290",
    image: "/products/pearl-embroidered-dupatta/image-2.jpg",
    href: "/products?category=Dupatta",
  },
];

export function HijabCollectionShowcase() {
  return (
    <section className="py-12 sm:py-16 bg-white border-b border-[#F0ECE6] scroll-reveal" aria-label="Hijabs Collection">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8 sm:space-y-10">
        
        {/* Full-width Hijabs Spotlight Banner */}
        <div className="relative overflow-hidden rounded-xl sm:rounded-2xl bg-[#E8DDD5] min-h-[200px] sm:min-h-[280px] flex items-center justify-center text-center shadow-xs group">
          {/* Subtle background image */}
          <div className="absolute inset-0 z-0">
            <img
              src="/products/pearl-embroidered-dupatta/image-1.jpg"
              alt="Premium Hijabs & Dupattas"
              className="w-full h-full object-cover opacity-25 group-hover:scale-105 transition-transform duration-1000"
            />
            <div className="absolute inset-0 bg-gradient-to-b from-[#F5EBE6]/60 via-[#E8DDD5]/80 to-[#E8DDD5]"></div>
          </div>

          <div className="relative z-10 p-6 sm:p-10 max-w-xl space-y-2.5">
            <span className="text-[10px] sm:text-[11px] font-sans font-bold uppercase tracking-[0.25em] text-[#8B6B58]">
              Non-Slip · Breathable · Premium Drapes
            </span>

            <h2 className="font-serif text-3xl sm:text-5xl lg:text-6xl text-[#111827] font-normal tracking-wide">
              Hijabs
            </h2>

            <p className="text-xs sm:text-sm text-[#4B5563] font-sans leading-relaxed">
              Curated everyday neutrals, luxury occasion satins, and lightweight breathable weaves.
            </p>

            <div className="pt-2">
              <Link
                href="/products?category=Dupatta"
                className="inline-flex items-center gap-2 px-6 py-2 bg-[#111827] text-white hover:bg-black text-xs font-bold uppercase tracking-wider rounded-md transition-colors"
              >
                <span>Shop All Hijabs</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>
        </div>

        {/* 4 Category Grid Cards (Laser Cut, Crinkle, Silk, Luxury Chiffon) */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5 sm:gap-6">
          {HIJAB_TYPES.map((hijab, idx) => (
            <Link
              key={idx}
              href={hijab.href}
              className="group flex flex-col bg-[#FAF8F5] rounded-xl overflow-hidden shadow-xs hover:shadow-md transition-all duration-300 border border-[#EBE3D8]"
            >
              {/* Image Container with 4:5 aspect ratio */}
              <div className="relative aspect-[4/5] w-full overflow-hidden bg-[#F0EAE1]">
                <img
                  src={hijab.image}
                  alt={hijab.title}
                  className="w-full h-full object-cover object-center transition-transform duration-700 group-hover:scale-108"
                />
                <div className="absolute top-2.5 right-2.5 bg-white/90 backdrop-blur-xs text-[#111827] text-[10px] font-bold px-2 py-0.5 rounded shadow-xs">
                  {hijab.priceFrom}
                </div>
              </div>

              {/* Title & Count */}
              <div className="p-3.5 sm:p-4 text-center bg-white">
                <h3 className="font-serif text-sm sm:text-base text-[#111827] font-medium group-hover:text-[#9A84C8] transition-colors">
                  {hijab.title}
                </h3>
                <p className="text-[11px] text-[#6B7280] font-sans mt-0.5">
                  {hijab.count}
                </p>
              </div>
            </Link>
          ))}
        </div>

      </div>
    </section>
  );
}
