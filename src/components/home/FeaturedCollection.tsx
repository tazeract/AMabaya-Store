"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { getAllProducts } from "@/lib/products";
import { ProductCard } from "@/components/products/ProductCard";
import type { Product } from "@/types";

const TABS = [
  { label: "All Curations", value: "All" },
  { label: "Abayas", value: "Abaya" },
  { label: "Kaftans", value: "Kaftan" },
  { label: "Dupattas", value: "Dupatta" },
  { label: "Bestsellers", value: "Bestseller" },
] as const;

export function FeaturedCollection() {
  const [activeTab, setActiveTab] = useState<string>("All");
  const [products, setProducts] = useState<Product[]>([]);

  useEffect(() => {
    getAllProducts().then(setProducts);
  }, []);

  const filteredProducts = products.filter((p) => {
    if (activeTab === "All") return true;
    if (activeTab === "Bestseller") return p.isBestseller;
    return p.category === activeTab;
  });

  return (
    <section className="py-20 lg:py-28 px-4 sm:px-6 lg:px-8 bg-[#FBF9F6] border-b border-[#E5E7EB]" aria-label="Featured Collection">
      <div className="max-w-7xl mx-auto">
        
        {/* Header */}
        <div className="text-center max-w-2xl mx-auto mb-12">
          <p className="text-[11px] font-sans font-semibold tracking-[0.25em] text-[#A3845A] uppercase mb-2">
            Haute Modesty
          </p>
          <h2 className="font-serif text-3xl sm:text-4xl lg:text-5xl text-[#111827] font-normal tracking-tight">
            Featured Masterpieces
          </h2>
          <div className="w-12 h-[1px] bg-[#111827] mx-auto mt-4 mb-4" />
          <p className="text-sm text-[#4B5563] font-sans">
            Hand-tailored in Lahore using imported Korean Nida, French Organza, and Pure Raw Silk.
          </p>
        </div>

        {/* Minimal Tab Filter */}
        <div className="flex justify-center mb-12">
          <div className="inline-flex flex-wrap items-center justify-center gap-1 sm:gap-2 p-1 bg-white border border-[#E5E7EB]">
            {TABS.map((tab) => (
              <button
                key={tab.value}
                onClick={() => setActiveTab(tab.value)}
                className={`px-4 sm:px-6 py-2 text-xs font-sans font-medium uppercase tracking-widest transition-all ${
                  activeTab === tab.value
                    ? "bg-[#111827] text-white"
                    : "text-[#4B5563] hover:text-[#111827]"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* 4-Column (Desktop) / 2-Column (Mobile) Sapphire-Style Grid */}
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6 lg:gap-8"
          >
            {filteredProducts.map((product, idx) => (
              <ProductCard
                key={product.slug}
                product={product}
                priority={idx < 4}
              />
            ))}
          </motion.div>
        </AnimatePresence>

        {/* View All Collection CTA */}
        <div className="text-center mt-16">
          <Link
            href="/products"
            className="luxury-btn-primary group"
          >
            <span>View All Collections</span>
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>

      </div>
    </section>
  );
}
