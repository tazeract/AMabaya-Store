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

  const hasActiveFilters =
    filters.category.length > 0 ||
    filters.sizes.length > 0 ||
    filters.colors.length > 0 ||
    filters.priceRange[1] < MAX_PRICE;

  const clearAll = () => {
    onChange({
      category: [],
      priceRange: [0, MAX_PRICE],
      sizes: [],
      colors: [],
      sortBy: "newest",
      searchQuery: "",
    });
  };

  const Section = ({
    title,
    id,
    children,
  }: {
    title: string;
    id: keyof typeof openSections;
    children: React.ReactNode;
  }) => (
    <div className="border-b border-[var(--color-border)] py-5">
      <button
        onClick={() => toggle(id)}
        className="flex items-center justify-between w-full text-left"
        aria-expanded={openSections[id]}
      >
        <span className="text-sm font-semibold text-[var(--color-text-primary)] font-sans uppercase tracking-wider">
          {title}
        </span>
        {openSections[id] ? (
          <ChevronUp className="w-4 h-4 text-[var(--color-text-muted)]" />
        ) : (
          <ChevronDown className="w-4 h-4 text-[var(--color-text-muted)]" />
        )}
      </button>
      <AnimatePresence initial={false}>
        {openSections[id] && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="overflow-hidden"
          >
            <div className="pt-4">{children}</div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );

  return (
    <aside
      aria-label="Product filters"
      className="w-full"
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <SlidersHorizontal className="w-4 h-4 text-[var(--color-gold)]" />
          <h2 className="font-sans font-semibold text-[var(--color-text-primary)] text-sm">
            Filters
          </h2>
          <span className="text-xs text-[var(--color-text-muted)]">
            ({totalCount} items)
          </span>
        </div>
        {hasActiveFilters && (
          <button
            onClick={clearAll}
            className="flex items-center gap-1 text-xs text-red-500 hover:text-red-600 transition-colors"
          >
            <X className="w-3 h-3" />
            Clear all
          </button>
        )}
      </div>

      {/* Sort */}
      <Section title="Sort By" id="sort">
        <div className="space-y-1">
          {SORT_OPTIONS.map((opt) => (
            <label key={opt.value} className="flex items-center gap-2.5 cursor-pointer group">
              <input
                type="radio"
                name="sort"
                value={opt.value}
                checked={filters.sortBy === opt.value}
                onChange={() => update({ sortBy: opt.value })}
                className="accent-[var(--color-gold)] w-4 h-4"
              />
              <span className="text-sm text-[var(--color-text-secondary)] group-hover:text-[var(--color-text-primary)] transition-colors">
                {opt.label}
              </span>
            </label>
          ))}
        </div>
      </Section>

      {/* Category */}
      <Section title="Category" id="category">
        <div className="space-y-1">
          {CATEGORIES.map((cat) => (
            <label key={cat} className="flex items-center gap-2.5 cursor-pointer group">
              <input
                type="checkbox"
                checked={filters.category.includes(cat)}
                onChange={() => toggleCategory(cat)}
                className="accent-[var(--color-gold)] w-4 h-4 rounded"
              />
              <span className="text-sm text-[var(--color-text-secondary)] group-hover:text-[var(--color-text-primary)] transition-colors">
                {cat}
              </span>
            </label>
          ))}
        </div>
      </Section>

      {/* Price Range */}
      <Section title="Price Range" id="price">
        <div className="space-y-4">
          <div className="flex items-center justify-between text-sm">
            <span className="text-[var(--color-text-muted)]">
              ₨ {filters.priceRange[0].toLocaleString()}
            </span>
            <span className="text-[var(--color-gold)] font-medium">
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
        </div>
      </Section>

      {/* Size */}
      <Section title="Size" id="size">
        <div className="flex flex-wrap gap-2">
          {SIZES.map((size) => (
            <button
              key={size}
              onClick={() => toggleSize(size)}
              aria-pressed={filters.sizes.includes(size)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-all ${
                filters.sizes.includes(size)
                  ? "bg-[var(--color-gold)] border-[var(--color-gold)] text-white"
                  : "border-[var(--color-border)] text-[var(--color-text-secondary)] hover:border-[var(--color-gold)] hover:text-[var(--color-gold)]"
              }`}
            >
              {size}
            </button>
          ))}
        </div>
      </Section>

      {/* Color */}
      <Section title="Color" id="color">
        <div className="flex flex-wrap gap-3">
          {COLORS.map((color) => (
            <button
              key={color.name}
              onClick={() => toggleColor(color.name)}
              aria-label={color.name}
              aria-pressed={filters.colors.includes(color.name)}
              title={color.name}
              className={`relative w-7 h-7 rounded-full border-2 transition-all hover:scale-110 ${
                filters.colors.includes(color.name)
                  ? "border-[var(--color-gold)] scale-110 shadow-[var(--shadow-gold)]"
                  : "border-[var(--color-border)]"
              }`}
              style={{ backgroundColor: color.hex }}
            >
              {color.hex === "#FFFFFF" && (
                <span className="absolute inset-0 rounded-full border border-[var(--color-border)]" />
              )}
            </button>
          ))}
        </div>
      </Section>
    </aside>
  );
}
