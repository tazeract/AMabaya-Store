"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowRight, ChevronLeft, ChevronRight } from "lucide-react";

interface HeroSlide {
  id: number;
  subtitle: string;
  title: string;
  tagline: string;
  description: string;
  primaryCtaText: string;
  primaryCtaLink: string;
  secondaryCtaText: string;
  secondaryCtaLink: string;
  badge: string;
  image: string;
  imageAlt: string;
}

const slides: HeroSlide[] = [
  {
    id: 1,
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
  },
  {
    id: 2,
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
  },
  {
    id: 3,
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
  },
];

export function HeroSection() {
  const [current, setCurrent] = useState(0);
  const [isAutoPlay, setIsAutoPlay] = useState(true);

  useEffect(() => {
    if (!isAutoPlay) return;
    const interval = setInterval(() => {
      setCurrent((prev) => (prev + 1) % slides.length);
    }, 6000);
    return () => clearInterval(interval);
  }, [isAutoPlay]);

  const prevSlide = () => {
    setIsAutoPlay(false);
    setCurrent((prev) => (prev - 1 + slides.length) % slides.length);
  };

  const nextSlide = () => {
    setIsAutoPlay(false);
    setCurrent((prev) => (prev + 1) % slides.length);
  };

  const slide = slides[current];

  return (
    <section
      className="relative bg-[#FBF9F6] border-b border-[#E5E7EB] overflow-hidden"
      aria-label="Editorial Hero Banner"
      onMouseEnter={() => setIsAutoPlay(false)}
      onMouseLeave={() => setIsAutoPlay(true)}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-12 gap-8 lg:gap-12 min-h-[580px] lg:min-h-[640px] items-center py-10 lg:py-16">
          
          {/* Left Text / Editorial Story */}
          <div className="lg:col-span-6 flex flex-col justify-center text-left z-10">
            <AnimatePresence mode="wait">
              <motion.div
                key={slide.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                transition={{ duration: 0.5, ease: "easeOut" }}
                className="space-y-5"
              >
                {/* Minimal Luxury Badge */}
                <div className="inline-flex items-center gap-2">
                  <span className="h-[1px] w-8 bg-[var(--color-gold)]" />
                  <span className="text-[11px] font-sans font-semibold tracking-[0.22em] text-[#A3845A] uppercase">
                    {slide.subtitle}
                  </span>
                </div>

                {/* Main Heading */}
                <h1 className="font-serif text-4xl sm:text-5xl lg:text-6xl text-[#111827] leading-[1.08] tracking-tight font-normal">
                  {slide.title}
                </h1>

                {/* Subtitle / Description */}
                <p className="text-sm sm:text-base text-[#4B5563] max-w-lg font-sans leading-relaxed">
                  {slide.description}
                </p>

                {/* CTAs */}
                <div className="pt-3 flex flex-wrap items-center gap-4">
                  <Link
                    href={slide.primaryCtaLink}
                    className="luxury-btn-primary"
                  >
                    <span>{slide.primaryCtaText}</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>

                  <Link
                    href={slide.secondaryCtaLink}
                    className="luxury-btn-outline"
                  >
                    <span>{slide.secondaryCtaText}</span>
                  </Link>
                </div>

                {/* Minimal Features List */}
                <div className="pt-6 border-t border-[#E5E7EB] flex items-center gap-6 text-[12px] text-[#6B7280] uppercase tracking-wider font-sans">
                  <span>✦ 100% Pure Fabrics</span>
                  <span>✦ Cash On Delivery</span>
                  <span>✦ Bespoke Stitching</span>
                </div>
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Right Fashion Photography Display */}
          <div className="lg:col-span-6 relative">
            <div className="relative w-full aspect-[3/4] max-h-[580px] mx-auto overflow-hidden bg-[#F3F4F6] border border-[#E5E7EB] shadow-lg">
              <AnimatePresence mode="wait">
                <motion.div
                  key={slide.id}
                  initial={{ opacity: 0, scale: 1.04 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.98 }}
                  transition={{ duration: 0.6, ease: "easeInOut" }}
                  className="relative w-full h-full"
                >
                  <img
                    src={slide.image}
                    alt={slide.imageAlt}
                    className="w-full h-full object-cover object-top"
                  />
                  
                  {/* Subtle luxury vignette */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent pointer-events-none" />

                  {/* Corner Brand Stamp */}
                  <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between text-white drop-shadow-md pointer-events-none">
                    <div>
                      <p className="text-[10px] tracking-[0.25em] uppercase font-sans text-white/80">
                        Editorial Spotlight
                      </p>
                      <p className="font-serif text-lg tracking-wide">
                        {slide.tagline}
                      </p>
                    </div>
                    <span className="text-[11px] font-sans tracking-widest bg-white/20 backdrop-blur-md px-3 py-1 uppercase text-white border border-white/30">
                      {slide.badge}
                    </span>
                  </div>
                </motion.div>
              </AnimatePresence>
            </div>

            {/* Slider Navigation Arrows */}
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
                    className={`h-1 transition-all duration-300 ${
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
                  className="w-9 h-9 border border-[#E5E7EB] bg-white flex items-center justify-center text-[#111827] hover:bg-[#111827] hover:text-white transition-colors"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <button
                  onClick={nextSlide}
                  aria-label="Next slide"
                  className="w-9 h-9 border border-[#E5E7EB] bg-white flex items-center justify-center text-[#111827] hover:bg-[#111827] hover:text-white transition-colors"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}
