"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { ArrowRight, Sparkles } from "lucide-react";
import { getAllProducts } from "@/lib/products";
import { ProductCard } from "@/components/products/ProductCard";
import type { Product } from "@/types";

interface TrendingAbayasProps {
  products?: Product[];
}

export function TrendingAbayas({ products: initialProducts }: TrendingAbayasProps) {
  const [products, setProducts] = useState<Product[]>(initialProducts || []);

  const loadLatest = () => {
    getAllProducts().then((res) => {
      if (res && res.length > 0) {
        setProducts(res);
      }
    });
  };

  useEffect(() => {
    loadLatest();

    const handleUpdate = () => {
      loadLatest();
    };

    window.addEventListener("amabaya_products_updated", handleUpdate);
    window.addEventListener("storage", handleUpdate);

    // BroadcastChannel for cross-tab admin updates
    let bc: BroadcastChannel | null = null;
    try {
      bc = new BroadcastChannel("amabaya_store");
      bc.onmessage = (e) => { if (e.data?.type === "store_updated") handleUpdate(); };
    } catch {}

    return () => {
      window.removeEventListener("amabaya_products_updated", handleUpdate);
      window.removeEventListener("storage", handleUpdate);
      bc?.close();
    };
  }, []);

  // Filter Abayas or return latest items
  const abayas = products.filter(
    (p) => !p.category || p.category.toLowerCase().includes("abaya") || p.category === "Abaya"
  );
  const displayList = (abayas.length > 0 ? abayas : products).slice(0, 4);

  return (
    <section className="py-12 sm:py-16 bg-white border-b border-[#EAE6DF] scroll-reveal" aria-label="New In Abayas">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-8 gap-4">
          <div>
            <div className="inline-flex items-center gap-2 mb-1.5">
              <span className="w-2 h-2 rounded-full bg-[#DA3F3F] animate-pulse"></span>
              <span className="text-[11px] font-sans font-bold uppercase tracking-[0.2em] text-[#DA3F3F]">
                Fresh Drop · Trending Now
              </span>
            </div>
            <h2 className="font-serif text-2xl sm:text-3xl lg:text-4xl text-[#111827] font-medium tracking-tight">
              NEW IN ABAYAS
            </h2>
          </div>
          <Link
            href="/products?category=Abaya"
            className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-[#111827] hover:text-[#9A84C8] transition-colors group"
          >
            <span>View All Abayas</span>
            <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>

        {/* 2-Col Mobile / 4-Col Desktop Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6">
          {displayList.map((product, idx) => (
            <ProductCard
              key={product.slug || idx}
              product={product}
              priority={idx < 2}
            />
          ))}
        </div>

      </div>
    </section>
  );
}
