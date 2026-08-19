"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowUpRight } from "lucide-react";

interface CategoryTile {
  id: string;
  name: string;
  count: string;
  href: string;
  image: string;
  tagline: string;
}

const categories: CategoryTile[] = [
  {
    id: "abayas",
    name: "Luxury Abayas",
    tagline: "Nida, Linen & Velvet",
    count: "18+ Designs",
    href: "/products?category=Abaya",
    image: "/products/classic-noir-abaya/image-1.jpg",
  },
  {
    id: "kaftans",
    name: "Royal Kaftans",
    tagline: "Pure Raw Silk & Zari",
    count: "12+ Designs",
    href: "/products?category=Kaftan",
    image: "/products/royal-zahra-kaftan/image-1.jpg",
  },
  {
    id: "dupattas",
    name: "Organza Dupattas",
    tagline: "Cutwork & Pearls",
    count: "14+ Designs",
    href: "/products?category=Dupatta",
    image: "/products/pearl-embroidered-dupatta/image-1.jpg",
  },
  {
    id: "festive",
    name: "Festive Edit",
    tagline: "Handcrafted Zardozi",
    count: "Exclusive",
    href: "/products?filter=new",
    image: "/products/classic-noir-abaya/image-1.jpg",
  },
];

export function CategoryGrid() {
  return (
    <section className="py-20 px-4 sm:px-6 lg:px-8 bg-white" aria-label="Curated Categories">
      <div className="max-w-7xl mx-auto">
        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto mb-14">
          <p className="text-[11px] font-sans font-semibold tracking-[0.25em] text-[#A3845A] uppercase mb-2">
            Curated Categories
          </p>
          <h2 className="font-serif text-3xl sm:text-4xl text-[#111827] font-normal tracking-tight">
            Shop By Signature Silhouette
          </h2>
          <div className="w-12 h-[1px] bg-[#111827] mx-auto mt-4" />
        </div>

        {/* 4-Column Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          {categories.map((cat, index) => (
            <motion.div
              key={cat.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
            >
              <Link
                href={cat.href}
                className="group block relative overflow-hidden bg-[#F3F4F6] aspect-[3/4] border border-[#E5E7EB]"
              >
                {/* Image */}
                <img
                  src={cat.image}
                  alt={cat.name}
                  className="w-full h-full object-cover object-center group-hover:scale-108 transition-transform duration-700 ease-out"
                />

                {/* Dark bottom gradient for crisp text readability */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/20 to-transparent opacity-85 group-hover:opacity-95 transition-opacity" />

                {/* Content Overlay at the bottom */}
                <div className="absolute inset-x-0 bottom-0 p-4 sm:p-6 text-white flex flex-col justify-end">
                  <span className="text-[10px] tracking-[0.2em] uppercase text-white/80 font-sans mb-1">
                    {cat.tagline}
                  </span>
                  
                  <div className="flex items-center justify-between">
                    <h3 className="font-serif text-xl sm:text-2xl text-white font-medium group-hover:text-[var(--color-gold-light)] transition-colors">
                      {cat.name}
                    </h3>
                    <div className="w-8 h-8 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center group-hover:bg-white group-hover:text-[#111827] transition-all">
                      <ArrowUpRight className="w-4 h-4 text-white group-hover:text-[#111827] transition-colors" />
                    </div>
                  </div>

                  <p className="text-[11px] text-white/70 font-sans tracking-wider mt-1 uppercase">
                    {cat.count}
                  </p>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
