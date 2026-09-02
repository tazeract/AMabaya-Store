"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { ArrowRight, Sparkles } from "lucide-react";
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
    const fetchProds = () => {
      getAllProducts().then(setProducts);
    };
    fetchProds();

    window.addEventListener("amabaya_products_updated", fetchProds);
    window.addEventListener("storage", fetchProds);

    // BroadcastChannel for cross-tab admin updates
    let bc: BroadcastChannel | null = null;
    try {
      bc = new BroadcastChannel("amabaya_store");
      bc.onmessage = (e) => { if (e.data?.type === "store_updated") fetchProds(); };
    } catch {}

    return () => {
      window.removeEventListener("amabaya_products_updated", fetchProds);
      window.removeEventListener("storage", fetchProds);
      bc?.close();
    };
  }, []);

  const filteredProducts = products.filter((p) => {
    if (activeTab === "All") return true;
    if (activeTab === "Bestseller") return p.isBestseller;
    return (p.category || "").toLowerCase() === activeTab.toLowerCase();
  });

  return (
    <section className="py-16 sm:py-24 px-4 sm:px-6 lg:px-8 bg-[#FAF9F7] border-b border-[#EAE6DF] scroll-reveal" aria-label="Featured Collection">
      <div className="max-w-7xl mx-auto">
        
        {/* Header */}
        <div className="text-center max-w-2xl mx-auto mb-10">
          <div className="inline-flex items-center gap-2 mb-2">
            <Sparkles className="w-3.5 h-3.5 text-[#9A84C8]" />
            <span className="text-[11px] font-sans font-bold tracking-[0.25em] text-[#9A84C8] uppercase">
              Haute Modesty · Lahore Atelier
            </span>
          </div>
          <h2 className="font-serif text-3xl sm:text-4xl lg:text-5xl text-[#111827] font-normal tracking-tight">
            Featured Masterpieces
          </h2>
          <div className="w-12 h-[1px] bg-[#111827] mx-auto mt-4 mb-4" />
          <p className="text-sm text-[#4B5563] font-sans">
            Handcrafted with precision using imported Korean Nida, French Organza, and Pure Banarsi Raw Silk.
          </p>
        </div>

        {/* Minimal Tab Filter */}
        <div className="flex justify-center mb-10">
          <div className="inline-flex flex-wrap items-center justify-center gap-1.5 p-1.5 bg-white border border-[#EAE6DF] rounded-xl shadow-xs">
            {TABS.map((tab) => (
              <button
                key={tab.value}
                onClick={() => setActiveTab(tab.value)}
                className={`px-4 sm:px-6 py-2 text-xs font-sans font-bold uppercase tracking-widest rounded-lg transition-all ${
                  activeTab === tab.value
                    ? "bg-[#111827] text-white shadow-xs"
                    : "text-[#4B5563] hover:text-[#111827] hover:bg-[#F6F4EE]"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* 4-Column Grid */}
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-6"
          >
            {filteredProducts.map((product, idx) => (
              <ProductCard
                key={product.slug || idx}
                product={product}
                priority={idx < 4}
              />
            ))}
          </motion.div>
        </AnimatePresence>

        {/* View All Collection CTA */}
        <div className="text-center mt-12 sm:mt-16">
          <Link
            href="/products"
            className="luxury-btn-primary group inline-flex items-center gap-2"
          >
            <span>Explore Complete Catalogue</span>
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>

      </div>
    </section>
  );
}
