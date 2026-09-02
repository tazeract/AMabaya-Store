"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight, Sparkles } from "lucide-react";
import { useState, useEffect } from "react";

interface ExploreType {
  label: string;
  slug: string;
  tagline: string;
  image: string;
  color: string;
}

const EXPLORE_TYPES: ExploreType[] = [
  {
    label: "Abayas",
    slug: "Abaya",
    tagline: "Everyday & Festive",
    image: "/products/classic-noir-abaya/image-1.jpg",
    color: "#2D1B2D",
  },
  {
    label: "Kaftans",
    slug: "Kaftan",
    tagline: "Royal Occasion Wear",
    image: "/products/royal-zahra-kaftan/image-1.jpg",
    color: "#1A1E2D",
  },
  {
    label: "Dupattas",
    slug: "Dupatta",
    tagline: "Organza & Silk",
    image: "/products/pearl-embroidered-dupatta/image-1.jpg",
    color: "#1E2A1A",
  },
  {
    label: "Sets & Co-ords",
    slug: "Set",
    tagline: "Complete Ensembles",
    image: "/products/classic-noir-abaya/image-2.jpg",
    color: "#1A1A1A",
  },
  {
    label: "Accessories",
    slug: "Accessories",
    tagline: "Finishing Touches",
    image: "/products/classic-noir-abaya/image-3.jpg",
    color: "#2A1A10",
  },
];

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.09, delayChildren: 0.1 },
  },
};

const item = {
  hidden: { opacity: 0, y: 30 },
  show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" as const } },
};

export function ExploreTypes() {
  const [types, setTypes] = useState<ExploreType[]>(EXPLORE_TYPES);

  // Load custom categories from admin if available
  useEffect(() => {
    const loadCategories = () => {
      try {
        const saved = localStorage.getItem("amabaya_categories");
        if (saved) {
          const parsed = JSON.parse(saved);
          if (Array.isArray(parsed) && parsed.length >= 3) {
            const mapped = parsed.map((c: any, idx: number) => ({
              label: c.name,
              slug: c.slug || c.name,
              tagline: c.description ? c.description.split(" ").slice(0, 4).join(" ") + "…" : "Curated Collection",
              image: c.image || EXPLORE_TYPES[idx % EXPLORE_TYPES.length]?.image || "/products/classic-noir-abaya/image-1.jpg",
              color: EXPLORE_TYPES[idx % EXPLORE_TYPES.length]?.color || "#1A1A1A",
            }));
            setTypes(mapped);
            return;
          }
        }
      } catch {}
      setTypes(EXPLORE_TYPES);
    };

    loadCategories();
    window.addEventListener("amabaya_categories_updated", loadCategories);
    window.addEventListener("storage", loadCategories);
    return () => {
      window.removeEventListener("amabaya_categories_updated", loadCategories);
      window.removeEventListener("storage", loadCategories);
    };
  }, []);

  return (
    <section
      className="py-14 sm:py-20 bg-white border-b border-[#EAE6DF] scroll-reveal"
      aria-label="Explore by Style"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section header */}
        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 mb-8 sm:mb-10">
          <div>
            <div className="inline-flex items-center gap-2 mb-2">
              <Sparkles className="w-3.5 h-3.5 text-[#9A84C8]" />
              <span className="text-[11px] font-sans font-bold tracking-[0.25em] text-[#9A84C8] uppercase">
                Discover Your Style
              </span>
            </div>
            <h2 className="font-serif text-3xl sm:text-4xl text-[#111827] font-normal tracking-tight">
              Explore All Types
            </h2>
          </div>
          <Link
            href="/products"
            className="inline-flex items-center gap-1.5 text-xs font-sans font-semibold uppercase tracking-widest text-[#6B7280] hover:text-[#111827] transition-colors group"
          >
            <span>View All</span>
            <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>

        {/* Cards grid */}
        <motion.div
          variants={container}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: "-60px" }}
          className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3.5 sm:gap-5"
        >
          {types.map((type) => (
            <motion.div key={type.slug} variants={item}>
              <Link
                href={`/products?category=${encodeURIComponent(type.slug)}`}
                className="group relative block overflow-hidden rounded-2xl aspect-[3/4] bg-[#F2ECE4] border border-[#EAE6DF] shadow-sm hover:shadow-xl transition-all duration-500"
              >
                {/* Background image */}
                <img
                  src={type.image}
                  alt={type.label}
                  className="absolute inset-0 w-full h-full object-cover object-top transition-transform duration-700 group-hover:scale-105"
                />

                {/* Gradient overlay */}
                <div
                  className="absolute inset-0 transition-opacity duration-500"
                  style={{
                    background: `linear-gradient(to top, ${type.color}EE 0%, ${type.color}88 50%, transparent 100%)`,
                  }}
                />
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors duration-500" />

                {/* Text content */}
                <div className="absolute bottom-0 left-0 right-0 p-4 text-white">
                  <p className="text-[10px] font-sans tracking-widest uppercase text-white/70 mb-1">
                    {type.tagline}
                  </p>
                  <h3 className="font-serif text-lg font-medium leading-tight group-hover:text-[#F3C5D0] transition-colors duration-300">
                    {type.label}
                  </h3>
                  <div className="mt-2 flex items-center gap-1.5 text-[11px] font-sans font-semibold uppercase tracking-wider opacity-0 group-hover:opacity-100 translate-y-2 group-hover:translate-y-0 transition-all duration-300">
                    <span>Explore</span>
                    <ArrowRight className="w-3 h-3" />
                  </div>
                </div>

                {/* Subtle top badge on hover */}
                <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  <span className="bg-white/20 backdrop-blur-md text-white text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-full border border-white/30">
                    Shop
                  </span>
                </div>
              </Link>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
