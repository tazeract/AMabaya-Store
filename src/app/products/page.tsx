"use client";

import { useState, useEffect, useMemo, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Grid3X3, List, Filter, X } from "lucide-react";
import { getAllProducts } from "@/lib/products";
import { ProductCard } from "@/components/products/ProductCard";
import { FilterSidebar } from "@/components/products/FilterSidebar";
import { AnimatedSection } from "@/components/ui/AnimatedSection";
import type { Product, FilterState } from "@/types";

const DEFAULT_FILTERS: FilterState = {
  category: [],
  priceRange: [0, 20000],
  sizes: [],
  colors: [],
  sortBy: "newest",
  searchQuery: "",
};

function ProductsPageContent() {
  const searchParams = useSearchParams();
  const [allProducts, setAllProducts] = useState<Product[]>([]);
  const [filters, setFilters] = useState<FilterState>({
    ...DEFAULT_FILTERS,
    category: searchParams.get("category") ? [searchParams.get("category")!] : [],
    searchQuery: searchParams.get("q") ?? "",
  });
  const [showMobileFilters, setShowMobileFilters] = useState(false);
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");

  useEffect(() => {
    getAllProducts().then(setAllProducts);
  }, []);

  const filtered = useMemo(() => {
    let result = [...allProducts];

    if (filters.category.length > 0) {
      result = result.filter((p) => filters.category.includes(p.category));
    }
    if (filters.sizes.length > 0) {
      result = result.filter((p) =>
        p.sizes.some((s) => filters.sizes.includes(s.label))
      );
    }
    if (filters.colors.length > 0) {
      result = result.filter((p) =>
        p.colors.some((c) => filters.colors.includes(c.name))
      );
    }
    result = result.filter(
      (p) =>
        p.price >= filters.priceRange[0] && p.price <= filters.priceRange[1]
    );
    if (filters.searchQuery) {
      const q = filters.searchQuery.toLowerCase();
      result = result.filter(
        (p) =>
          p.title.toLowerCase().includes(q) ||
          p.category.toLowerCase().includes(q) ||
          p.tags.some((t) => t.includes(q))
      );
    }

    switch (filters.sortBy) {
      case "price_asc":
        result.sort((a, b) => a.price - b.price);
        break;
      case "price_desc":
        result.sort((a, b) => b.price - a.price);
        break;
      case "rating":
        result.sort((a, b) => b.rating - a.rating);
        break;
      case "bestseller":
        result.sort((a, b) => Number(b.isBestseller) - Number(a.isBestseller));
        break;
      case "newest":
      default:
        result.sort(
          (a, b) =>
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );
    }

    return result;
  }, [allProducts, filters]);

  return (
    <div className="min-h-screen pt-24">
      {/* Page header */}
      <div className="bg-white border-b border-[var(--color-border)]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
          <AnimatedSection>
            <p className="text-[var(--color-gold)] text-xs font-sans uppercase tracking-widest mb-2">
              ✦ Browse
            </p>
            <h1 className="font-display text-4xl sm:text-5xl font-semibold text-[var(--color-text-primary)]">
              {filters.category.length === 1
                ? `${filters.category[0]}s`
                : "All Collections"}
            </h1>
            <p className="text-[var(--color-text-muted)] text-sm mt-2">
              {filtered.length} piece{filtered.length !== 1 ? "s" : ""} found
            </p>
          </AnimatedSection>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        <div className="flex gap-8">
          {/* Desktop Sidebar */}
          <aside className="hidden lg:block w-64 shrink-0">
            <div className="sticky top-24">
              <FilterSidebar
                filters={filters}
                onChange={setFilters}
                totalCount={filtered.length}
              />
            </div>
          </aside>

          {/* Main content */}
          <div className="flex-1 min-w-0">
            {/* Toolbar */}
            <div className="flex items-center justify-between mb-6 pb-4 border-b border-[var(--color-border)]">
              <button
                onClick={() => setShowMobileFilters(true)}
                className="lg:hidden flex items-center gap-2 text-sm font-medium text-[var(--color-text-secondary)] border border-[var(--color-border)] px-4 py-2 rounded-full hover:border-[var(--color-gold)] hover:text-[var(--color-gold)] transition-all"
              >
                <Filter className="w-4 h-4" />
                Filters
              </button>

              <span className="hidden lg:block text-sm text-[var(--color-text-muted)]">
                {filtered.length} results
              </span>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => setViewMode("grid")}
                  aria-label="Grid view"
                  aria-pressed={viewMode === "grid"}
                  className={`p-2 rounded-lg transition-colors ${
                    viewMode === "grid"
                      ? "bg-[var(--color-gold)] text-white"
                      : "text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)]"
                  }`}
                >
                  <Grid3X3 className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setViewMode("list")}
                  aria-label="List view"
                  aria-pressed={viewMode === "list"}
                  className={`p-2 rounded-lg transition-colors ${
                    viewMode === "list"
                      ? "bg-[var(--color-gold)] text-white"
                      : "text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)]"
                  }`}
                >
                  <List className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Product grid */}
            <AnimatePresence mode="wait">
              {filtered.length === 0 ? (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="flex flex-col items-center justify-center py-24 text-center"
                >
                  <p className="font-display text-2xl text-[var(--color-text-secondary)] mb-2">
                    No products found
                  </p>
                  <p className="text-sm text-[var(--color-text-muted)] mb-6">
                    Try adjusting your filters
                  </p>
                  <button
                    onClick={() => setFilters(DEFAULT_FILTERS)}
                    className="px-6 py-3 border border-[var(--color-gold)] text-[var(--color-gold)] rounded-full text-sm font-medium hover:bg-[var(--color-gold)] hover:text-white transition-all"
                  >
                    Clear Filters
                  </button>
                </motion.div>
              ) : (
                <motion.div
                  key={`${filters.sortBy}-${filters.category.join("-")}`}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.3 }}
                  className={
                    viewMode === "grid"
                      ? "grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6"
                      : "flex flex-col gap-4"
                  }
                >
                  {filtered.map((product, i) => (
                    <motion.div
                      key={product.slug}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.05, duration: 0.4 }}
                    >
                      <ProductCard product={product} priority={i < 3} />
                    </motion.div>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>

      {/* Mobile Filter Drawer */}
      <AnimatePresence>
        {showMobileFilters && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 bg-black/50"
              onClick={() => setShowMobileFilters(false)}
            />
            <motion.div
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ type: "spring", damping: 28, stiffness: 250 }}
              className="fixed left-0 top-0 bottom-0 z-50 w-80 bg-[var(--color-bg)] overflow-y-auto p-6"
            >
              <div className="flex items-center justify-between mb-6">
                <h2 className="font-display font-semibold text-lg">Filters</h2>
                <button
                  onClick={() => setShowMobileFilters(false)}
                  aria-label="Close filters"
                  className="p-2 rounded-full hover:bg-[var(--color-border)] transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              <FilterSidebar
                filters={filters}
                onChange={(f) => {
                  setFilters(f);
                }}
                totalCount={filtered.length}
              />
              <button
                onClick={() => setShowMobileFilters(false)}
                className="mt-6 w-full py-4 bg-gradient-to-r from-[var(--color-gold)] to-[var(--color-gold-dark)] text-white rounded-2xl font-medium"
              >
                Show {filtered.length} Results
              </button>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}

export default function ProductsPage() {
  return (
    <Suspense>
      <ProductsPageContent />
    </Suspense>
  );
}
