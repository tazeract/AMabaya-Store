"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowRight, ChevronLeft, ChevronRight, Sparkles, ShoppingBag } from "lucide-react";

interface HeroSlide {
  id: string | number;
  subtitle: string;
  title: string;
  tagline: string;
  description: string;
  primaryCtaText: string;
  primaryCtaLink: string;
  secondaryCtaText?: string;
  secondaryCtaLink?: string;
  badge: string;
  image: string;
  imageAlt?: string;
  active?: boolean;
}

const DEFAULT_SLIDES: HeroSlide[] = [
  {
    id: "1",
    subtitle: "AUTUMN / WINTER '26 EDIT",
    title: "Elegance in Every Drape",
    tagline: "HAUTE MODESTY REDEFINED",
    description:
      "Immerse yourself in our signature collection of handcrafted luxury abayas and flowing silhouettes, sculpted from the finest Korean Nida and rich velvets.",
    primaryCtaText: "Explore Collection",
    primaryCtaLink: "/products?category=Abaya",
    secondaryCtaText: "View Bestsellers",
    secondaryCtaLink: "/products?filter=bestseller",
    badge: "New Luxury Release",
    image: "/products/classic-noir-abaya/image-1.jpg",
    imageAlt: "AMabaya Luxury Modest Wear Collection",
    active: true,
  },
  {
    id: "2",
    subtitle: "ROYAL FESTIVE OCCASION WEAR",
    title: "The Raw Silk & Zari Kaftan",
    tagline: "TIMELESS SOUTH ASIAN CRAFTSMANSHIP",
    description:
      "Opulent formal silhouettes detailed with intricate antique gold zari borders and hand-embellished pearl tassels for memorable celebrations.",
    primaryCtaText: "Shop Kaftans",
    primaryCtaLink: "/products?category=Kaftan",
    secondaryCtaText: "Explore Dupattas",
    secondaryCtaLink: "/products?category=Dupatta",
    badge: "Festive Exclusive",
    image: "/products/royal-zahra-kaftan/image-1.jpg",
    imageAlt: "AMabaya Festive Kaftans",
    active: true,
  },
  {
    id: "3",
    subtitle: "STATEMENT ACCESSORIES",
    title: "Scalloped Organza Dupattas",
    tagline: "DELICATE FINISHING TOUCHES",
    description:
      "Feather-light crystalline dupattas embellished with four-sided laser-cut scalloped borders and hand-applied luminous pearls.",
    primaryCtaText: "Discover Dupattas",
    primaryCtaLink: "/products?category=Dupatta",
    secondaryCtaText: "All Collections",
    secondaryCtaLink: "/products",
    badge: "Signature Craft",
    image: "/products/pearl-embroidered-dupatta/image-1.jpg",
    imageAlt: "AMabaya Organza Dupattas",
    active: true,
  },
];

export function HeroSection() {
  const [slides, setSlides] = useState<HeroSlide[]>(DEFAULT_SLIDES);
  const [current, setCurrent] = useState(0);
  const [isAutoPlay, setIsAutoPlay] = useState(true);

  const loadSlides = () => {
    if (typeof window !== "undefined") {
      try {
        const saved = localStorage.getItem("amabaya_slides");
        if (saved) {
          const parsed = JSON.parse(saved);
          if (Array.isArray(parsed) && parsed.length > 0) {
            const activeOnly = parsed.filter((s: any) => s.active !== false);
            if (activeOnly.length > 0) {
              setSlides(
                activeOnly.map((s: any) => ({
                  id: s.id,
                  subtitle: s.subtitle || "EXCLUSIVE EDIT",
                  title: s.title || "Elegance in Every Drape",
                  tagline: s.tagline || "HAUTE MODESTY",
                  description: s.description || "",
                  primaryCtaText: s.primaryCtaText || "Explore",
                  primaryCtaLink: s.primaryCtaLink || "/products",
                  secondaryCtaText: s.secondaryCtaText || "View All",
                  secondaryCtaLink: s.secondaryCtaLink || "/products",
                  badge: s.badge || "Signature Piece",
                  image: s.image || "/products/classic-noir-abaya/image-1.jpg",
                  imageAlt: s.title,
                }))
              );
              return;
            }
          }
        }
      } catch (e) {
        console.warn("Could not load local slides:", e);
      }
    }
    setSlides(DEFAULT_SLIDES);
  };

  useEffect(() => {
    loadSlides();

    const handleUpdate = () => {
      loadSlides();
    };

    window.addEventListener("amabaya_slides_updated", handleUpdate);
    window.addEventListener("storage", handleUpdate);

    // BroadcastChannel for cross-tab admin updates
    let bc: BroadcastChannel | null = null;
    try {
      bc = new BroadcastChannel("amabaya_store");
      bc.onmessage = (e) => {
        if (e.data?.type === "store_updated") handleUpdate();
      };
    } catch {}

    return () => {
      window.removeEventListener("amabaya_slides_updated", handleUpdate);
      window.removeEventListener("storage", handleUpdate);
      bc?.close();
    };
  }, []);

  const totalSlides = slides.length || 1;

  useEffect(() => {
    if (!isAutoPlay || totalSlides <= 1) return;
    const interval = setInterval(() => {
      setCurrent((prev) => (prev + 1) % totalSlides);
    }, 6500);
    return () => clearInterval(interval);
  }, [isAutoPlay, totalSlides]);

  const prevSlide = () => {
    setIsAutoPlay(false);
    setCurrent((prev) => (prev - 1 + totalSlides) % totalSlides);
  };

  const nextSlide = () => {
    setIsAutoPlay(false);
    setCurrent((prev) => (prev + 1) % totalSlides);
  };

  const slide = slides[current % totalSlides] || DEFAULT_SLIDES[0];

  return (
    <section
      className="relative w-full h-[84vh] min-h-[580px] max-h-[740px] sm:h-[86vh] sm:min-h-[640px] lg:h-[90vh] lg:min-h-[680px] lg:max-h-[860px] bg-[#110E0C] overflow-hidden border-b border-[#EAE6DF]"
      aria-label="Editorial Hero Banner"
      onMouseEnter={() => setIsAutoPlay(false)}
      onMouseLeave={() => setIsAutoPlay(true)}
    >
      {/* ── Background Full-Bleed Imagery ── */}
      <AnimatePresence mode="wait">
        <motion.div
          key={String(slide.id || current)}
          initial={{ opacity: 0, scale: 1.04 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.98 }}
          transition={{ duration: 0.7, ease: "easeInOut" }}
          className="absolute inset-0 w-full h-full"
        >
          <img
            src={slide.image || "/products/classic-noir-abaya/image-1.jpg"}
            alt={slide.imageAlt || slide.title}
            className="w-full h-full object-cover object-top sm:object-center"
          />
        </motion.div>
      </AnimatePresence>

      {/* ── Luxury Gradient Overlays for 100% Readability & Editorial Mood ── */}
      {/* Desktop Left Vignette */}
      <div className="hidden lg:block absolute inset-0 bg-gradient-to-r from-black/90 via-black/55 via-50% to-transparent pointer-events-none" />
      {/* Desktop Top & Bottom Vignettes */}
      <div className="hidden lg:block absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-black/30 pointer-events-none" />
      {/* Mobile Bottom-Up Scrim (covers lower half with smooth dark fade) */}
      <div className="lg:hidden absolute inset-0 bg-gradient-to-t from-black/95 via-black/65 via-55% to-black/25 pointer-events-none" />

      {/* ── Overlaid Editorial Text Content ── */}
      <div className="relative z-10 h-full max-w-7xl mx-auto px-5 sm:px-8 lg:px-12 flex flex-col justify-end lg:justify-center pb-10 sm:pb-14 lg:pb-0">
        <div className="max-w-xl lg:max-w-2xl text-left space-y-3.5 sm:space-y-5">
          <AnimatePresence mode="wait">
            <motion.div
              key={String(slide.id || current)}
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              transition={{ duration: 0.45, ease: "easeOut" }}
              className="space-y-3 sm:space-y-4.5"
            >
              {/* Editorial Subtitle Tag */}
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-[#E8D4B8] text-[10px] sm:text-[11px] font-sans font-bold tracking-[0.22em] uppercase">
                <Sparkles className="w-3.5 h-3.5 text-[#C5A880]" />
                <span>{slide.subtitle}</span>
              </div>

              {/* Main Headline */}
              <h1 className="font-serif text-3xl sm:text-5xl lg:text-6xl text-white font-normal leading-[1.08] tracking-tight drop-shadow-md">
                {slide.title}
              </h1>

              {/* Tagline & Badge */}
              <div className="flex items-center gap-2.5 sm:gap-3 flex-wrap">
                <span className="text-[11px] sm:text-xs font-sans font-bold tracking-[0.28em] text-[#C5A880] uppercase">
                  {slide.tagline}
                </span>
                {slide.badge && (
                  <span className="text-[9.5px] font-sans font-bold tracking-widest bg-white/15 backdrop-blur-md px-2.5 py-0.5 uppercase text-white/95 border border-white/25 rounded-full">
                    {slide.badge}
                  </span>
                )}
              </div>

              {/* Description */}
              <p className="text-xs sm:text-sm lg:text-base text-white/85 max-w-lg font-sans leading-relaxed drop-shadow-sm line-clamp-3 sm:line-clamp-none">
                {slide.description}
              </p>

              {/* Action Buttons */}
              <div className="pt-2 flex flex-wrap items-center gap-3 sm:gap-4">
                <Link
                  href={slide.primaryCtaLink || "/products"}
                  className="inline-flex items-center justify-center gap-2.5 px-6 sm:px-8 py-3.5 sm:py-4 rounded-full bg-white text-[#111827] hover:bg-[#C5A880] hover:text-white transition-all duration-300 font-sans text-xs sm:text-[13px] font-bold uppercase tracking-[0.16em] shadow-xl hover:scale-105 active:scale-95 group"
                >
                  <span>{slide.primaryCtaText || "Explore Collection"}</span>
                  <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                </Link>

                {slide.secondaryCtaLink && (
                  <Link
                    href={slide.secondaryCtaLink}
                    className="inline-flex items-center justify-center gap-2 px-5 sm:px-7 py-3.5 sm:py-4 rounded-full bg-white/10 hover:bg-white/20 text-white border border-white/30 backdrop-blur-md transition-all duration-300 font-sans text-xs sm:text-[13px] font-bold uppercase tracking-[0.16em] active:scale-95"
                  >
                    <span>{slide.secondaryCtaText || "View Bestsellers"}</span>
                  </Link>
                )}
              </div>

              {/* Minimal Atelier Trust Strip */}
              <div className="pt-3 sm:pt-4 border-t border-white/15 flex flex-wrap items-center gap-x-5 gap-y-2 text-[10px] sm:text-[11.5px] text-white/75 uppercase tracking-wider font-sans font-medium">
                <span className="flex items-center gap-1.5">
                  <span className="text-[#C5A880]">✦</span> 100% Pure Fabrics
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="text-[#C5A880]">✦</span> Cash On Delivery
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="text-[#C5A880]">✦</span> Lahore Atelier Tailoring
                </span>
              </div>
            </motion.div>
          </AnimatePresence>
        </div>
      </div>

      {/* ── Carousel Slide Navigation Arrows (Desktop / Tablet) ── */}
      {totalSlides > 1 && (
        <>
          <button
            onClick={prevSlide}
            aria-label="Previous slide"
            className="hidden sm:flex absolute left-4 sm:left-6 top-1/2 -translate-y-1/2 z-20 w-11 h-11 rounded-full bg-black/30 hover:bg-black/60 border border-white/25 backdrop-blur-md text-white items-center justify-center transition-all duration-300 hover:scale-110 shadow-lg cursor-pointer"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <button
            onClick={nextSlide}
            aria-label="Next slide"
            className="hidden sm:flex absolute right-4 sm:right-6 top-1/2 -translate-y-1/2 z-20 w-11 h-11 rounded-full bg-black/30 hover:bg-black/60 border border-white/25 backdrop-blur-md text-white items-center justify-center transition-all duration-300 hover:scale-110 shadow-lg cursor-pointer"
          >
            <ChevronRight className="w-5 h-5" />
          </button>

          {/* ── Slide Indicator Pills & Counter (Bottom Right) ── */}
          <div className="absolute bottom-4 sm:bottom-6 right-5 sm:right-8 z-20 flex items-center gap-2 bg-black/40 backdrop-blur-md px-3.5 py-1.5 rounded-full border border-white/20">
            <span className="text-[11px] font-sans font-semibold text-white/85 tracking-widest">
              0{current + 1} <span className="text-white/40">/</span> 0{totalSlides}
            </span>
            <div className="flex items-center gap-1.5 ml-2">
              {slides.map((_, idx) => (
                <button
                  key={idx}
                  onClick={() => {
                    setIsAutoPlay(false);
                    setCurrent(idx);
                  }}
                  aria-label={`Go to slide ${idx + 1}`}
                  className={`h-1.5 rounded-full transition-all duration-300 ${
                    idx === current ? "w-6 bg-[#C5A880]" : "w-1.5 bg-white/40 hover:bg-white/70"
                  }`}
                />
              ))}
            </div>
          </div>
        </>
      )}
    </section>
  );
}
