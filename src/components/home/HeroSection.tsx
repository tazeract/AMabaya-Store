"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowRight, ChevronLeft, ChevronRight, Sparkles } from "lucide-react";

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

    return () => {
      window.removeEventListener("amabaya_slides_updated", handleUpdate);
      window.removeEventListener("storage", handleUpdate);
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
      className="relative bg-[#FAF9F7] border-b border-[#EAE6DF] overflow-hidden"
      aria-label="Editorial Hero Banner"
      onMouseEnter={() => setIsAutoPlay(false)}
      onMouseLeave={() => setIsAutoPlay(true)}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-12 gap-8 lg:gap-12 min-h-[560px] lg:min-h-[620px] items-center py-8 sm:py-12 lg:py-16">
          
          {/* Left Text Story */}
          <div className="lg:col-span-6 flex flex-col justify-center text-left z-10">
            <AnimatePresence mode="wait">
              <motion.div
                key={String(slide.id || current)}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.45, ease: "easeOut" }}
                className="space-y-5"
              >
                {/* Luxury Subtitle Tag */}
                <div className="inline-flex items-center gap-2">
                  <Sparkles className="w-3.5 h-3.5 text-[#9A84C8]" />
                  <span className="text-[11px] font-sans font-bold tracking-[0.22em] text-[#9A84C8] uppercase">
                    {slide.subtitle}
                  </span>
                </div>

                {/* Main Headline */}
                <h1 className="font-serif text-4xl sm:text-5xl lg:text-6xl text-[#111827] leading-[1.08] tracking-tight font-normal">
                  {slide.title}
                </h1>

                {/* Description */}
                <p className="text-sm sm:text-base text-[#4B5563] max-w-lg font-sans leading-relaxed">
                  {slide.description}
                </p>

                {/* Action Buttons */}
                <div className="pt-2 flex flex-wrap items-center gap-3.5">
                  <Link
                    href={slide.primaryCtaLink || "/products"}
                    className="luxury-btn-primary group inline-flex items-center gap-2"
                  >
                    <span>{slide.primaryCtaText || "Explore"}</span>
                    <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                  </Link>

                  {slide.secondaryCtaLink && (
                    <Link
                      href={slide.secondaryCtaLink}
                      className="luxury-btn-outline"
                    >
                      <span>{slide.secondaryCtaText || "View Bestsellers"}</span>
                    </Link>
                  )}
                </div>

                {/* Minimal Atelier Trust Footer */}
                <div className="pt-5 border-t border-[#EAE6DF] flex items-center gap-5 text-[11px] text-[#6B7280] uppercase tracking-wider font-sans font-semibold">
                  <span>✦ 100% Pure Fabrics</span>
                  <span>✦ Cash On Delivery</span>
                  <span>✦ Lahore Tailoring</span>
                </div>
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Right Imagery Showcase */}
          <div className="lg:col-span-6 relative">
            <div className="relative w-full aspect-[3/4] max-h-[560px] mx-auto overflow-hidden rounded-2xl bg-[#F2ECE4] border border-[#EAE6DF] shadow-md">
              <AnimatePresence mode="wait">
                <motion.div
                  key={String(slide.id || current)}
                  initial={{ opacity: 0, scale: 1.03 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.98 }}
                  transition={{ duration: 0.55, ease: "easeInOut" }}
                  className="relative w-full h-full"
                >
                  <img
                    src={slide.image || "/products/classic-noir-abaya/image-1.jpg"}
                    alt={slide.imageAlt || slide.title}
                    className="w-full h-full object-cover object-top"
                  />
                  
                  {/* Subtle Gradient Shadow */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent pointer-events-none" />

                  {/* Corner Callout */}
                  <div className="absolute bottom-4 left-4 right-4 flex items-end justify-between text-white drop-shadow-md pointer-events-none">
                    <div>
                      <p className="text-[10px] tracking-[0.25em] uppercase font-sans text-[#F3C5D0] font-bold">
                        Editorial Spotlight
                      </p>
                      <p className="font-serif text-lg tracking-wide">
                        {slide.tagline}
                      </p>
                    </div>
                    <span className="text-[10px] font-sans font-bold tracking-widest bg-white/20 backdrop-blur-md px-2.5 py-1 uppercase text-white border border-white/30 rounded">
                      {slide.badge}
                    </span>
                  </div>
                </motion.div>
              </AnimatePresence>
            </div>

            {/* Slider Controls */}
            {totalSlides > 1 && (
              <div className="flex items-center justify-between mt-4">
                <div className="flex items-center gap-2">
                  {slides.map((_, idx) => (
                    <button
                      key={idx}
                      onClick={() => {
                        setIsAutoPlay(false);
                        setCurrent(idx);
                      }}
                      aria-label={`Go to slide ${idx + 1}`}
                      className={`h-1 rounded-full transition-all duration-300 ${
                        idx === current
                          ? "w-8 bg-[#111827]"
                          : "w-3 bg-[#D1D5DB] hover:bg-[#9CA3AF]"
                      }`}
                    />
                  ))}
                </div>

                <div className="flex items-center gap-1.5">
                  <button
                    onClick={prevSlide}
                    aria-label="Previous slide"
                    className="w-9 h-9 rounded-full border border-[#EAE6DF] bg-white flex items-center justify-center text-[#111827] hover:bg-[#111827] hover:text-white transition-colors shadow-xs"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                  <button
                    onClick={nextSlide}
                    aria-label="Next slide"
                    className="w-9 h-9 rounded-full border border-[#EAE6DF] bg-white flex items-center justify-center text-[#111827] hover:bg-[#111827] hover:text-white transition-colors shadow-xs"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}
          </div>

        </div>
      </div>
    </section>
  );
}
