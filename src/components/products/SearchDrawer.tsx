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

  const popularSearches = ["Abaya", "Kaftan", "Eid Collection", "Embroidered", "Black"];

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
            transition={{ type: "spring", damping: 28, stiffness: 280 }}
            className="fixed top-0 left-0 right-0 z-50 glass shadow-xl border-b border-[var(--color-border)]"
          >
            <div className="max-w-3xl mx-auto p-4 sm:p-6">
              {/* Search input */}
              <div className="flex items-center gap-3 mb-4">
                <div className="flex-1 flex items-center gap-3 bg-white border border-[var(--color-border)] rounded-2xl px-4 py-3 shadow-sm">
                  <Search className="w-5 h-5 text-[var(--color-gold)] shrink-0" />
                  <input
                    id="search-input"
                    type="search"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder="Search abayas, kaftans, dupattas..."
                    className="flex-1 bg-transparent outline-none text-[var(--color-text-primary)] placeholder-[var(--color-text-muted)] text-sm"
                    aria-label="Search products"
                    autoComplete="off"
                  />
                  {query && (
                    <button
                      onClick={() => setQuery("")}
                      aria-label="Clear search"
                      className="text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)] transition-colors"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  )}
                </div>
                <button
                  onClick={onClose}
                  aria-label="Close search"
                  className="px-4 py-3 rounded-2xl border border-[var(--color-border)] text-sm text-[var(--color-text-secondary)] hover:bg-[var(--color-border)] transition-colors"
                >
                  Cancel
                </button>
              </div>

              {/* Popular searches */}
              {!query && (
                <div className="mb-4">
                  <p className="text-xs font-medium text-[var(--color-text-muted)] uppercase tracking-wider mb-2">
                    Popular Searches
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {popularSearches.map((term) => (
                      <button
                        key={term}
                        onClick={() => setQuery(term)}
                        className="px-3 py-1.5 bg-white border border-[var(--color-border)] rounded-full text-sm text-[var(--color-text-secondary)] hover:border-[var(--color-gold)] hover:text-[var(--color-gold)] transition-all"
                      >
                        {term}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Results */}
              {query && (
                <div className="max-h-[50vh] overflow-y-auto space-y-2">
                  {results.length === 0 ? (
                    <p className="text-center text-[var(--color-text-muted)] py-8 text-sm">
                      No results found for &quot;{query}&quot;
                    </p>
                  ) : (
                    <>
                      <p className="text-xs text-[var(--color-text-muted)] mb-3">
                        {results.length} result{results.length !== 1 ? "s" : ""} found
                      </p>
                      {results.map((product) => (
                        <Link
                          key={product.slug}
                          href={`/products/${product.slug}`}
                          onClick={onClose}
                          className="flex items-center gap-4 p-3 rounded-xl bg-white border border-[var(--color-border)] hover:border-[var(--color-gold)] hover:shadow-md transition-all group"
                        >
                          <div className="w-14 h-14 rounded-lg overflow-hidden bg-[var(--color-border)] shrink-0">
                            {product.images[0] && (
                              <img
                                src={product.images[0]}
                                alt={product.title}
                                className="w-full h-full object-cover"
                              />
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="font-display font-medium text-[var(--color-text-primary)] text-sm line-clamp-1">
                              {product.title}
                            </p>
                            <p className="text-xs text-[var(--color-text-muted)]">
                              {product.category}
                            </p>
                            <p className="text-sm font-semibold text-[var(--color-gold)] mt-0.5">
                              {formatPrice(product.price)}
                            </p>
                          </div>
                          <ArrowRight className="w-4 h-4 text-[var(--color-text-muted)] group-hover:text-[var(--color-gold)] group-hover:translate-x-1 transition-all" />
                        </Link>
                      ))}

                      <Link
                        href={`/products?q=${encodeURIComponent(query)}`}
                        onClick={onClose}
                        className="flex items-center justify-center gap-2 p-3 rounded-xl border border-dashed border-[var(--color-border)] text-sm text-[var(--color-text-muted)] hover:border-[var(--color-gold)] hover:text-[var(--color-gold)] transition-all mt-2"
                      >
                        View all results for &quot;{query}&quot;
                        <ArrowRight className="w-4 h-4" />
                      </Link>
                    </>
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
