"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { Search, X, ArrowRight } from "lucide-react";
import type { Product } from "@/types";
import { getAllProducts, formatPrice } from "@/lib/products";

interface SearchDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

export function SearchDrawer({ isOpen, onClose }: SearchDrawerProps) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<Product[]>([]);
  const [allProducts, setAllProducts] = useState<Product[]>([]);

  useEffect(() => {
    getAllProducts().then(setAllProducts);
  }, []);

  useEffect(() => {
    if (!query.trim()) {
      setResults([]);
      return;
    }
    const q = query.toLowerCase();
    setResults(
      allProducts.filter(
        (p) =>
          p.title.toLowerCase().includes(q) ||
          p.category.toLowerCase().includes(q) ||
          p.tags.some((t) => t.includes(q)) ||
          p.description.toLowerCase().includes(q)
      )
    );
  }, [query, allProducts]);

  // Close on Escape
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  // Focus input on open
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => {
        document.getElementById("search-input")?.focus();
      }, 150);
    } else {
      setQuery("");
    }
  }, [isOpen]);

  const popularSearches = ["Classic Noir Abaya", "Raw Silk Kaftan", "Organza Dupatta", "Velvet Abaya", "Festive Edit"];

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm"
            onClick={onClose}
          />

          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ type: "tween", duration: 0.25 }}
            className="fixed top-0 left-0 right-0 z-50 bg-white shadow-2xl border-b border-[#E5E7EB]"
          >
            <div className="max-w-4xl mx-auto p-6 sm:p-8">
              {/* Search Header */}
              <div className="flex items-center justify-between mb-4">
                <span className="text-[10px] uppercase font-sans tracking-[0.25em] text-[#A3845A] font-semibold">
                  Search Catalogue
                </span>
                <button
                  onClick={onClose}
                  aria-label="Close search"
                  className="p-1.5 text-[#111827] hover:text-[var(--color-gold-dark)]"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Search Input Bar */}
              <div className="flex items-center gap-3 bg-[#FBF9F6] border border-[#D1D5DB] px-4 py-3.5 focus-within:border-[#111827] transition-colors">
                <Search className="w-5 h-5 text-[#111827] shrink-0" />
                <input
                  id="search-input"
                  type="search"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Type to search abayas, raw silk kaftans, dupattas..."
                  className="flex-1 bg-transparent outline-none text-[#111827] placeholder-[#9CA3AF] text-sm font-sans"
                  aria-label="Search products"
                  autoComplete="off"
                />
                {query && (
                  <button
                    onClick={() => setQuery("")}
                    aria-label="Clear search"
                    className="p-1 text-[#9CA3AF] hover:text-[#111827]"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>

              {/* Suggestions / Popular Searches */}
              {!query && (
                <div className="mt-5">
                  <p className="text-xs font-sans text-[#6B7280] uppercase tracking-wider mb-2.5">
                    Popular Searches:
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {popularSearches.map((term) => (
                      <button
                        key={term}
                        onClick={() => setQuery(term)}
                        className="text-xs font-sans px-3 py-1.5 bg-[#F3F4F6] hover:bg-[#111827] hover:text-white text-[#374151] transition-colors"
                      >
                        {term}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Live Search Results */}
              {query && (
                <div className="mt-6 max-h-96 overflow-y-auto divide-y divide-[#F3F4F6]">
                  {results.length === 0 ? (
                    <p className="text-sm text-[#6B7280] font-sans text-center py-8">
                      No matching modest wear found for &ldquo;{query}&rdquo;
                    </p>
                  ) : (
                    results.map((product) => (
                      <Link
                        key={product.slug}
                        href={`/products/${product.slug}`}
                        onClick={onClose}
                        className="flex items-center gap-4 py-3 group hover:bg-[#FBF9F6] px-2 transition-colors"
                      >
                        <div className="w-12 h-16 bg-[#F3F4F6] border border-[#E5E7EB] shrink-0 overflow-hidden">
                          <img
                            src={product.images[0]}
                            alt={product.title}
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h4 className="font-serif text-base text-[#111827] group-hover:text-[var(--color-gold-dark)] transition-colors truncate">
                            {product.title}
                          </h4>
                          <p className="text-xs text-[#6B7280] font-sans">
                            {product.category} · {formatPrice(product.price)}
                          </p>
                        </div>
                        <ArrowRight className="w-4 h-4 text-[#9CA3AF] group-hover:text-[#111827] group-hover:translate-x-1 transition-all" />
                      </Link>
                    ))
                  )}
                </div>
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
