"use client";

import { useState, useEffect, useMemo, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Filter, X, ChevronRight } from "lucide-react";
import Link from "next/link";
import { getAllProducts } from "@/lib/products";
import { ProductCard } from "@/components/products/ProductCard";
import { FilterSidebar } from "@/components/products/FilterSidebar";
import type { Product, FilterState } from "@/types";

const DEFAULT_FILTERS: FilterState = {
  category: [],
  priceRange: [0, 20000],
  sizes: [],
  colors: [],
  fabrics: [],
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
    sortBy: (searchParams.get("filter") as any) ?? "newest",
  });
  const [showMobileFilters, setShowMobileFilters] = useState(false);

  // ── Sync filters when URL search params change (e.g., clicking different category links) ──
  useEffect(() => {
    const category = searchParams.get("category");
    const q = searchParams.get("q") ?? "";
    const filter = searchParams.get("filter") ?? "newest";
    setFilters((prev) => ({
      ...prev,
      category: category ? [category] : [],
      searchQuery: q,
      sortBy: filter as FilterState["sortBy"],
    }));
  }, [searchParams]);

  useEffect(() => {
    const fetchProds = () => {
      getAllProducts().then(setAllProducts);
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
    if (filters.fabrics.length > 0) {
      result = result.filter((p) =>
        filters.fabrics.some((f) => (p.material || "").toLowerCase().includes(f.toLowerCase()))
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

  const activeCategoryTitle =
    filters.category.length === 1
      ? `${filters.category[0]}s`
      : filters.category.length > 1
      ? "Selected Categories"
      : "All Modest Collections";

  return (
    <div className="min-h-screen bg-white">
      {/* Editorial Header */}
      <div className="bg-[#FBF9F6] border-b border-[#E5E7EB] py-12 lg:py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto text-center">
          {/* Breadcrumb */}
          <nav className="flex justify-center items-center gap-1.5 text-xs text-[#6B7280] uppercase tracking-wider mb-3">
            <Link href="/" className="hover:text-[#111827]">Home</Link>
            <ChevronRight className="w-3 h-3" />
            <span className="text-[#111827] font-medium">Collections</span>
            {filters.category.length === 1 && (
              <>
                <ChevronRight className="w-3 h-3" />
                <span className="text-[#111827] font-semibold">{filters.category[0]}</span>
              </>
            )}
          </nav>

          <h1 className="font-serif text-3xl sm:text-4xl lg:text-5xl text-[#111827] font-normal tracking-tight">
            {activeCategoryTitle}
          </h1>
          <p className="text-xs sm:text-sm text-[#4B5563] font-sans mt-2 max-w-lg mx-auto">
            Discover our complete assortment of handcrafted luxury modest wear tailored in Lahore.
          </p>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="flex gap-8 lg:gap-12">
          
          {/* Desktop Filter Sidebar */}
          <aside className="hidden lg:block w-64 shrink-0">
            <div className="sticky top-28 bg-[#FBF9F6] p-6 border border-[#E5E7EB]">
              <FilterSidebar
                filters={filters}
                onChange={setFilters}
                totalCount={filtered.length}
              />
            </div>
          </aside>

          {/* Product Grid Area */}
          <div className="flex-1 min-w-0">
            {/* Top Toolbar */}
            <div className="flex items-center justify-between pb-4 mb-6 border-b border-[#E5E7EB]">
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setShowMobileFilters(true)}
                  className="lg:hidden flex items-center gap-2 text-xs font-sans uppercase tracking-widest font-semibold border border-[#111827] px-4 py-2 hover:bg-[#111827] hover:text-white transition-colors"
                >
                  <Filter className="w-3.5 h-3.5" />
                  <span>Filter & Sort</span>
                </button>
                <span className="text-xs text-[#6B7280] font-sans tracking-wide">
                  Showing <strong className="text-[#111827]">{filtered.length}</strong> creations
                </span>
              </div>

              {/* Quick Reset if filters active */}
              {(filters.category.length > 0 || filters.sizes.length > 0 || filters.colors.length > 0) && (
                <button
                  onClick={() => setFilters(DEFAULT_FILTERS)}
                  className="text-xs text-[#6B7280] hover:text-[#111827] underline tracking-wider uppercase font-sans"
                >
                  Reset All Filters
                </button>
              )}
            </div>

            {/* Products Grid */}
            <AnimatePresence mode="wait">
              {filtered.length === 0 ? (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="flex flex-col items-center justify-center py-20 text-center border border-[#E5E7EB] bg-[#FBF9F6] p-8"
                >
                  <p className="font-serif text-2xl text-[#111827] mb-2 font-normal">
                    No Matching Silhouettes
                  </p>
                  <p className="text-xs text-[#6B7280] font-sans mb-6 max-w-sm">
                    We could not find any items matching your selected criteria. Try resetting filters.
                  </p>
                  <button
                    onClick={() => setFilters(DEFAULT_FILTERS)}
                    className="luxury-btn-primary"
                  >
                    View All Silhouettes
                  </button>
                </motion.div>
              ) : (
                <motion.div
                  key={`${filters.sortBy}-${filters.category.join("-")}`}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.3 }}
                  className="grid grid-cols-2 md:grid-cols-3 gap-4 sm:gap-6 lg:gap-8"
                >
                  {filtered.map((product, i) => (
                    <ProductCard key={product.slug} product={product} priority={i < 4} />
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
              className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm lg:hidden"
              onClick={() => setShowMobileFilters(false)}
            />
            <motion.div
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ type: "tween", duration: 0.3 }}
              className="fixed left-0 top-0 bottom-0 z-50 w-4/5 max-w-sm bg-white overflow-y-auto p-6 shadow-2xl lg:hidden flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between pb-4 border-b border-[#E5E7EB] mb-6">
                  <h2 className="font-serif text-xl text-[#111827]">Filter & Refine</h2>
                  <button
                    onClick={() => setShowMobileFilters(false)}
                    aria-label="Close filters"
                    className="p-1 text-[#111827] hover:text-[var(--color-gold-dark)]"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
                <FilterSidebar
                  filters={filters}
                  onChange={(f) => setFilters(f)}
                  totalCount={filtered.length}
                />
              </div>

              <button
                onClick={() => setShowMobileFilters(false)}
                className="w-full luxury-btn-primary mt-8"
              >
                Apply ({filtered.length} Results)
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
    <Suspense fallback={<div className="min-h-screen bg-white py-20 text-center text-xs tracking-widest uppercase">Loading Catalogue...</div>}>
      <ProductsPageContent />
    </Suspense>
  );
}
