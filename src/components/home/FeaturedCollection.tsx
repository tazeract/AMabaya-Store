"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { getAllProducts } from "@/lib/products";
import { ProductCard } from "@/components/products/ProductCard";
import { AnimatedSection, StaggeredContainer, staggerItemVariants } from "@/components/ui/AnimatedSection";
import type { Product } from "@/types";

const TABS = ["All", "Abaya", "Kaftan", "Dupatta"] as const;
type Tab = (typeof TABS)[number];

export function FeaturedCollection() {
  const [activeTab, setActiveTab] = useState<Tab>("All");
  const [products, setProducts] = useState<Product[]>([]);

  useEffect(() => {
    getAllProducts().then((all) =>
      setProducts(all.filter((p) => p.featured))
    );
  }, []);

  const filtered =
    activeTab === "All"
      ? products
      : products.filter((p) => p.category === activeTab);

  return (
    <section className="py-24 px-4 sm:px-6" aria-label="Featured Collection">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <AnimatedSection className="text-center mb-12">
          <span className="inline-block text-[var(--color-gold)] text-xs font-sans uppercase tracking-[0.3em] font-medium mb-4">
            ✦ Curated For You
          </span>
          <h2 className="font-display text-4xl sm:text-5xl font-semibold text-[var(--color-text-primary)] mb-4">
            Featured Collection
          </h2>
          <div className="divider-gold w-24 mx-auto mb-4" />
          <p className="text-[var(--color-text-secondary)] max-w-xl mx-auto text-sm leading-relaxed">
            Handpicked pieces that embody the essence of AMabaya — where tradition meets contemporary design.
          </p>
        </AnimatedSection>

        {/* Tabs */}
        <AnimatedSection delay={0.1} className="flex justify-center mb-12">
          <div className="flex items-center gap-1 p-1.5 bg-white border border-[var(--color-border)] rounded-full shadow-sm">
            {TABS.map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                aria-pressed={activeTab === tab}
                className={`relative px-6 py-2.5 rounded-full text-sm font-medium transition-all duration-300 ${
                  activeTab === tab
                    ? "text-white"
                    : "text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)]"
                }`}
              >
                {activeTab === tab && (
                  <motion.div
                    layoutId="active-tab"
                    className="absolute inset-0 bg-gradient-to-r from-[var(--color-gold)] to-[var(--color-gold-dark)] rounded-full"
                    transition={{ type: "spring", damping: 25, stiffness: 280 }}
                  />
                )}
                <span className="relative z-10">{tab}</span>
              </button>
            ))}
          </div>
        </AnimatedSection>

        {/* Product Grid */}
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.35 }}
          >
            {filtered.length === 0 ? (
              <div className="text-center py-16 text-[var(--color-text-muted)]">
                <p className="font-display text-xl">Coming soon...</p>
              </div>
            ) : (
              <StaggeredContainer className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {filtered.map((product) => (
                  <motion.div key={product.slug} variants={staggerItemVariants}>
                    <ProductCard product={product} />
                  </motion.div>
                ))}
              </StaggeredContainer>
            )}
          </motion.div>
        </AnimatePresence>

        {/* View All CTA */}
        <AnimatedSection delay={0.2} className="text-center mt-14">
          <Link
            href="/products"
            className="group inline-flex items-center gap-3 px-8 py-4 border-2 border-[var(--color-gold)] text-[var(--color-gold)] rounded-full font-medium text-sm hover:bg-[var(--color-gold)] hover:text-white transition-all duration-300"
          >
            View Entire Collection
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </Link>
        </AnimatedSection>
      </div>
    </section>
  );
}
