"use client";

import Link from "next/link";
import { ArrowRight, Tag, Gift, RefreshCw, ShieldCheck } from "lucide-react";

export function DealsAndBundles() {
  return (
    <section className="py-12 sm:py-16 bg-white border-b border-[#F0ECE6] scroll-reveal" aria-label="Deals & Essentials">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6 sm:space-y-8">
        
        {/* Row 1: Split Value Deals (Everything Under 1999 vs Value Bundles) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
          
          {/* Card 1: Everything Under 1999 */}
          <Link
            href="/products?filter=budget"
            className="group relative overflow-hidden rounded-xl bg-[#F4EBE1] border border-[#E7DACC] p-6 sm:p-10 flex flex-col justify-between min-h-[180px] sm:min-h-[220px] transition-all hover:shadow-md"
          >
            <div className="space-y-2">
              <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded bg-[#111827] text-white text-[10px] font-bold uppercase tracking-wider">
                <Tag className="w-3 h-3" />
                <span>Budget Edit</span>
              </div>
              <h3 className="font-serif text-2xl sm:text-4xl text-[#111827] font-bold tracking-tight uppercase leading-tight">
                EVERYTHING<br />UNDER 1999
              </h3>
              <p className="text-xs sm:text-sm text-[#6B7280] font-sans">
                Everyday hijabs, crinkles & inner essentials.
              </p>
            </div>
            <div className="pt-4 flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#111827] group-hover:text-[#DA3F3F] transition-colors">
              <span className="underline underline-offset-4">Shop Deals</span>
              <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
            </div>
          </Link>

          {/* Card 2: Value Bundles */}
          <Link
            href="/products?filter=bundles"
            className="group relative overflow-hidden rounded-xl bg-[#EBE4F2] border border-[#DDD3E6] p-6 sm:p-10 flex flex-col justify-between min-h-[180px] sm:min-h-[220px] transition-all hover:shadow-md"
          >
            <div className="space-y-2">
              <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded bg-[#9A84C8] text-white text-[10px] font-bold uppercase tracking-wider">
                <Gift className="w-3 h-3" />
                <span>Save Up To 30%</span>
              </div>
              <h3 className="font-serif text-2xl sm:text-4xl text-[#111827] font-bold tracking-tight uppercase leading-tight">
                VALUE<br />BUNDLES
              </h3>
              <p className="text-xs sm:text-sm text-[#6B7280] font-sans">
                Curated 3-piece Abaya & Hijab matching sets.
              </p>
            </div>
            <div className="pt-4 flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#111827] group-hover:text-[#9A84C8] transition-colors">
              <span className="underline underline-offset-4">Explore Bundles</span>
              <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
            </div>
          </Link>

        </div>

        {/* Row 2: Bottoms & Accessories (2 Split Photo Cards) */}
        <div className="grid grid-cols-2 gap-3.5 sm:gap-6">
          
          {/* Bottoms */}
          <Link
            href="/products?category=Abaya"
            className="group relative overflow-hidden rounded-xl bg-[#FAF8F5] border border-[#EBE3D8] transition-all hover:shadow-md"
          >
            <div className="relative aspect-[4/5] sm:aspect-[16/11] w-full overflow-hidden">
              <img
                src="/products/classic-noir-abaya/image-2.jpg"
                alt="Modest Bottoms & Trousers"
                className="w-full h-full object-cover object-top transition-transform duration-700 group-hover:scale-106"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent"></div>
              <div className="absolute bottom-4 left-4 right-4 text-white">
                <h4 className="font-serif text-xl sm:text-3xl font-medium tracking-wide">
                  Bottoms
                </h4>
                <p className="text-[11px] text-white/80 font-sans mt-0.5 hidden sm:block">
                  Wide-leg culottes, inner slips & trousers
                </p>
              </div>
            </div>
          </Link>

          {/* Accessories */}
          <Link
            href="/products?category=Dupatta"
            className="group relative overflow-hidden rounded-xl bg-[#FAF8F5] border border-[#EBE3D8] transition-all hover:shadow-md"
          >
            <div className="relative aspect-[4/5] sm:aspect-[16/11] w-full overflow-hidden">
              <img
                src="/products/pearl-embroidered-dupatta/image-1.jpg"
                alt="Hijab Accessories"
                className="w-full h-full object-cover object-center transition-transform duration-700 group-hover:scale-106"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent"></div>
              <div className="absolute bottom-4 left-4 right-4 text-white">
                <h4 className="font-serif text-xl sm:text-3xl font-medium tracking-wide">
                  Accessories
                </h4>
                <p className="text-[11px] text-white/80 font-sans mt-0.5 hidden sm:block">
                  Magnetic pins, velvet scrunchies & caps
                </p>
              </div>
            </div>
          </Link>

        </div>

        {/* Row 3: Return & Guarantee Badges */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
          
          <div className="flex items-center gap-4 p-4 sm:p-5 rounded-xl bg-[#FBF9F6] border border-[#ECE5DB]">
            <div className="w-12 h-12 rounded-full bg-[#111827] text-white flex items-center justify-center shrink-0">
              <RefreshCw className="w-5 h-5" />
            </div>
            <div>
              <h5 className="font-serif text-base font-medium text-[#111827]">
                7 Days Easy Return & Exchange
              </h5>
              <p className="text-xs text-[#6B7280] font-sans mt-0.5">
                Hassle-free size exchange and return policy across Pakistan.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-4 p-4 sm:p-5 rounded-xl bg-[#FBF9F6] border border-[#ECE5DB]">
            <div className="w-12 h-12 rounded-full bg-[#9A84C8] text-white flex items-center justify-center shrink-0">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h5 className="font-serif text-base font-medium text-[#111827]">
                100% Satisfaction Guaranteed
              </h5>
              <p className="text-xs text-[#6B7280] font-sans mt-0.5">
                Premium Korean Nida & genuine fabrics with doorstep cash on delivery.
              </p>
            </div>
          </div>

        </div>

      </div>
    </section>
  );
}
