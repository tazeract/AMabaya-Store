"use client";

import { useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { SlidersHorizontal, ChevronDown, ChevronUp, X } from "lucide-react";
import type { FilterState } from "@/types";

interface FilterSidebarProps {
  filters: FilterState;
  onChange: (filters: FilterState) => void;
  totalCount: number;
}

const CATEGORIES = ["Abaya", "Kaftan", "Dupatta", "Set"];
const SIZES = ["S", "M", "L", "XL", "XXL", "Free Size"];
const COLORS = [
  { name: "Black", hex: "#0A0A0A" },
  { name: "White", hex: "#FFFFFF" },
  { name: "Beige", hex: "#D2B48C" },
  { name: "Navy", hex: "#1B2A4A" },
  { name: "Burgundy", hex: "#6D1A36" },
  { name: "Green", hex: "#1B4332" },
  { name: "Gold", hex: "#C9A84C" },
  { name: "Pink", hex: "#FFB6C1" },
];

const FABRICS = [
  { label: "Korean Nida", desc: "Premium matte imported fabric" },
  { label: "Pure Silk", desc: "Banarsi raw & pure silk" },
  { label: "Organza", desc: "Lightweight French organza" },
  { label: "Velvet", desc: "Soft crushed velvet" },
  { label: "Chiffon", desc: "Flowy chiffon georgette" },
  { label: "Banarsi", desc: "Handwoven Banarsi brocade" },
];

const SORT_OPTIONS: { value: FilterState["sortBy"]; label: string }[] = [
  { value: "newest", label: "Newest First" },
  { value: "price_asc", label: "Price: Low to High" },
  { value: "price_desc", label: "Price: High to Low" },
  { value: "rating", label: "Top Rated" },
  { value: "bestseller", label: "Bestsellers" },
];

const MAX_PRICE = 20000;

export function FilterSidebar({ filters, onChange, totalCount }: FilterSidebarProps) {
  const [openSections, setOpenSections] = useState({
    category: true,
    price: true,
    size: true,
    color: true,
    fabric: true,
    sort: true,
  });

  const toggle = (section: keyof typeof openSections) => {
    setOpenSections((prev) => ({ ...prev, [section]: !prev[section] }));
  };

  const update = useCallback(
    (updates: Partial<FilterState>) => {
      onChange({ ...filters, ...updates });
    },
    [filters, onChange]
  );

  const toggleCategory = (cat: string) => {
    const cats = filters.category.includes(cat)
      ? filters.category.filter((c) => c !== cat)
      : [...filters.category, cat];
    update({ category: cats });
  };

  const toggleSize = (size: string) => {
    const sizes = filters.sizes.includes(size)
      ? filters.sizes.filter((s) => s !== size)
      : [...filters.sizes, size];
    update({ sizes });
  };

  const toggleColor = (color: string) => {
    const colors = filters.colors.includes(color)
      ? filters.colors.filter((c) => c !== color)
      : [...filters.colors, color];
    update({ colors });
  };

  const toggleFabric = (fabric: string) => {
    const fabrics = (filters.fabrics || []).includes(fabric)
      ? (filters.fabrics || []).filter((f) => f !== fabric)
      : [...(filters.fabrics || []), fabric];
    update({ fabrics });
  };

  const hasActiveFilters =
    filters.category.length > 0 ||
    filters.sizes.length > 0 ||
    filters.colors.length > 0 ||
    (filters.fabrics || []).length > 0 ||
    filters.priceRange[1] < MAX_PRICE;

  const clearAll = () => {
    onChange({
      category: [],
      priceRange: [0, MAX_PRICE],
      sizes: [],
      colors: [],
      fabrics: [],
      sortBy: "newest",
      searchQuery: "",
    });
  };

  const Section = ({
    title,
    id,
    children,
    count,
  }: {
    title: string;
    id: keyof typeof openSections;
    children: React.ReactNode;
    count?: number;
  }) => (
    <div className="border-b border-[#E5E7EB] py-4">
      <button
        onClick={() => toggle(id)}
        className="flex items-center justify-between w-full text-left group"
        aria-expanded={openSections[id]}
      >
        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold text-[#111827] font-sans uppercase tracking-[0.12em]">
            {title}
          </span>
          {count !== undefined && count > 0 && (
            <span className="px-1.5 py-0.5 bg-[#111827] text-white text-[9px] font-bold rounded">
              {count}
            </span>
          )}
        </div>
        {openSections[id] ? (
          <ChevronUp className="w-3.5 h-3.5 text-[#9CA3AF] group-hover:text-[#111827] transition-colors" />
        ) : (
          <ChevronDown className="w-3.5 h-3.5 text-[#9CA3AF] group-hover:text-[#111827] transition-colors" />
        )}
      </button>
      <AnimatePresence initial={false}>
        {openSections[id] && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.22, ease: "easeInOut" }}
            className="overflow-hidden"
          >
            <div className="pt-3">{children}</div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );

  return (
    <aside aria-label="Product filters" className="w-full">
      {/* Header */}
      <div className="flex items-center justify-between mb-1 pb-3 border-b border-[#E5E7EB]">
        <div className="flex items-center gap-2">
          <SlidersHorizontal className="w-4 h-4 text-[#A3845A]" />
          <span className="font-sans font-semibold text-[#111827] text-sm">
            Refine Results
          </span>
          <span className="text-xs text-[#6B7280]">({totalCount})</span>
        </div>
        {hasActiveFilters && (
          <button
            onClick={clearAll}
            className="flex items-center gap-1 text-[11px] text-red-500 hover:text-red-700 transition-colors font-medium"
          >
            <X className="w-3 h-3" />
            Clear All
          </button>
        )}
      </div>

      {/* Sort By */}
      <Section title="Sort By" id="sort">
        <div className="space-y-2">
          {SORT_OPTIONS.map((opt) => (
            <label key={opt.value} className="flex items-center gap-2.5 cursor-pointer group">
              <input
                type="radio"
                name="sort"
                value={opt.value}
                checked={filters.sortBy === opt.value}
                onChange={() => update({ sortBy: opt.value })}
                className="accent-[#111827] w-3.5 h-3.5"
              />
              <span className="text-xs text-[#4B5563] group-hover:text-[#111827] transition-colors font-sans">
                {opt.label}
              </span>
            </label>
          ))}
        </div>
      </Section>

      {/* Category */}
      <Section title="Category" id="category" count={filters.category.length}>
        <div className="space-y-2">
          {CATEGORIES.map((cat) => (
            <label key={cat} className="flex items-center gap-2.5 cursor-pointer group">
              <input
                type="checkbox"
                checked={filters.category.includes(cat)}
                onChange={() => toggleCategory(cat)}
                className="accent-[#111827] w-3.5 h-3.5 rounded"
              />
              <span className="text-xs text-[#4B5563] group-hover:text-[#111827] transition-colors font-sans">
                {cat}
              </span>
            </label>
          ))}
        </div>
      </Section>

      {/* Fabric Type */}
      <Section title="Fabric Type" id="fabric" count={(filters.fabrics || []).length}>
        <div className="space-y-2">
          {FABRICS.map((fabric) => {
            const selected = (filters.fabrics || []).includes(fabric.label);
            return (
              <label key={fabric.label} className="flex items-start gap-2.5 cursor-pointer group">
                <input
                  type="checkbox"
                  checked={selected}
                  onChange={() => toggleFabric(fabric.label)}
                  className="accent-[#111827] w-3.5 h-3.5 rounded mt-0.5 shrink-0"
                />
                <div>
                  <span className="text-xs text-[#4B5563] group-hover:text-[#111827] transition-colors font-sans font-medium">
                    {fabric.label}
                  </span>
                  <p className="text-[10px] text-[#9CA3AF] font-sans leading-tight">{fabric.desc}</p>
                </div>
              </label>
            );
          })}
        </div>
      </Section>

      {/* Price Range */}
      <Section title="Price Range" id="price">
        <div className="space-y-3">
          <div className="flex items-center justify-between text-xs font-sans">
            <span className="text-[#6B7280]">₨ {filters.priceRange[0].toLocaleString()}</span>
            <span className="text-[#A3845A] font-semibold">
              ₨ {filters.priceRange[1].toLocaleString()}
            </span>
          </div>
          <input
            type="range"
            min={0}
            max={MAX_PRICE}
            step={500}
            value={filters.priceRange[1]}
            onChange={(e) =>
              update({ priceRange: [filters.priceRange[0], Number(e.target.value)] })
            }
            aria-label="Maximum price filter"
            style={{
              "--range-progress": `${(filters.priceRange[1] / MAX_PRICE) * 100}%`,
            } as React.CSSProperties}
            className="w-full"
          />
          <div className="flex gap-2">
            {[5000, 10000, 15000, 20000].map((val) => (
              <button
                key={val}
                onClick={() => update({ priceRange: [0, val] })}
                className={`flex-1 text-[10px] py-1 border rounded font-sans transition-all ${
                  filters.priceRange[1] === val
                    ? "bg-[#111827] text-white border-[#111827]"
                    : "border-[#E5E7EB] text-[#6B7280] hover:border-[#C5A880]"
                }`}
              >
                {val >= 1000 ? `${val / 1000}k` : val}
              </button>
            ))}
          </div>
        </div>
      </Section>

      {/* Size */}
      <Section title="Size" id="size" count={filters.sizes.length}>
        <div className="flex flex-wrap gap-1.5">
          {SIZES.map((size) => (
            <button
              key={size}
              onClick={() => toggleSize(size)}
              aria-pressed={filters.sizes.includes(size)}
              className={`px-3 py-1.5 text-[11px] font-medium border transition-all rounded ${
                filters.sizes.includes(size)
                  ? "bg-[#111827] border-[#111827] text-white"
                  : "border-[#D1D5DB] text-[#6B7280] hover:border-[#A3845A] hover:text-[#A3845A]"
              }`}
            >
              {size}
            </button>
          ))}
        </div>
      </Section>

      {/* Color */}
      <Section title="Colour" id="color" count={filters.colors.length}>
        <div className="flex flex-wrap gap-2.5">
          {COLORS.map((color) => (
            <button
              key={color.name}
              onClick={() => toggleColor(color.name)}
              aria-label={color.name}
              aria-pressed={filters.colors.includes(color.name)}
              title={color.name}
              className={`relative w-7 h-7 rounded-full border-2 transition-all hover:scale-110 ${
                filters.colors.includes(color.name)
                  ? "border-[#111827] scale-110 shadow-md ring-2 ring-offset-1 ring-[#111827]/20"
                  : "border-[#D1D5DB]"
              }`}
              style={{ backgroundColor: color.hex }}
            >
              {color.hex === "#FFFFFF" && (
                <span className="absolute inset-0 rounded-full border border-[#D1D5DB]" />
              )}
            </button>
          ))}
        </div>
      </Section>
    </aside>
  );
}
