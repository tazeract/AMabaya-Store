import { createClient } from "@/lib/supabase/client";
import type { Product } from "@/types";

// ─── Supabase row → Product type mapper ──────────────────────────────────────

// Normalize sizes — handle both TEXT[] and JSONB {label, available}[] formats
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function normalizeSizes(raw: any): { label: string; available: boolean }[] {
  if (!Array.isArray(raw)) return [];
  return raw.map((s) => {
    if (typeof s === "string") return { label: s, available: true };
    if (typeof s === "object" && s !== null && "label" in s)
      return { label: s.label, available: s.available !== false };
    return { label: String(s), available: true };
  });
}

function rowToProduct(row: any): Product {
  return {
    slug:             row.slug,
    title:            row.name,
    subtitle:         row.subtitle ?? "",
    description:      row.description ?? "",
    longDescription:  row.long_description ?? "",
    price:            row.price,
    originalPrice:    row.original_price ?? undefined,
    category:         row.category,
    tags:             row.tags ?? [],
    sizes:            normalizeSizes(row.sizes_json ?? row.sizes),
    colors:           Array.isArray(row.colors) ? row.colors : [],
    images:           row.images ?? [],
    modelPath:        row.model_path ?? undefined,
    sku:              row.sku ?? "",
    featured:         row.featured ?? false,
    isNew:            row.is_new ?? false,
    isBestseller:     row.is_bestseller ?? false,
    stock:            typeof row.stock === "object" ? row.stock : {},
    material:         row.material ?? "",
    careInstructions: row.care_instructions ?? [],
    rating:           Number(row.rating) ?? 0,
    reviewCount:      row.review_count ?? 0,
    createdAt:        row.created_at ?? "",
  };
}

/**
 * Fetch all products from Supabase.
 * Merges / falls back to localStorage (admin updates) and local JSON.
 */
export async function getAllProducts(): Promise<Product[]> {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";
  let products: Product[] = [];

  // 1. Try Supabase if configured
  if (supabaseUrl.startsWith("http")) {
    try {
      const supabase = createClient();
      const { data, error } = await supabase
        .from("products")
        .select("*")
        .order("created_at", { ascending: false });

      if (!error && data && data.length > 0) {
        products = data.map(rowToProduct);
      }
    } catch (e) {
      console.warn("Supabase products fetch failed:", e);
    }
  }

  // 2. In browser environments, check localStorage for admin-created or updated products
  if (typeof window !== "undefined") {
    try {
      const localData = localStorage.getItem("amabaya_local_products");
      if (localData) {
        const parsed = JSON.parse(localData);
        if (Array.isArray(parsed) && parsed.length > 0) {
          const localProducts: Product[] = parsed.map((p: any) => ({
            slug: p.slug,
            title: p.name,
            subtitle: p.subtitle || "",
            description: p.description || "",
            longDescription: p.long_description || "",
            price: p.price,
            originalPrice: p.original_price,
            category: p.category,
            tags: Array.isArray(p.tags) ? p.tags : [],
            sizes: normalizeSizes(p.sizes || p.sizes_json),
            colors: Array.isArray(p.colors) ? p.colors : [],
            images: Array.isArray(p.images) && p.images.length > 0 ? p.images : ["/products/classic-noir-abaya/image-1.jpg"],
            modelPath: p.model_path,
            sku: p.sku || "",
            featured: !!p.featured,
            isNew: !!p.is_new,
            isBestseller: !!p.is_bestseller,
            stock: typeof p.stock === "number" ? { "Standard-Default": p.stock } : (p.stock || {}),
            material: p.material || "Korean Nida",
            careInstructions: p.care_instructions || [],
            rating: Number(p.rating) || 5,
            reviewCount: Number(p.review_count) || 1,
            createdAt: p.created_at || new Date().toISOString(),
          }));

          // If we had Supabase products, merge them prioritizing local admin overrides
          if (products.length > 0) {
            const mergedMap = new Map<string, Product>();
            products.forEach((p) => mergedMap.set(p.slug, p));
            localProducts.forEach((p) => mergedMap.set(p.slug, p));
            return Array.from(mergedMap.values());
          }

          return localProducts;
        }
      }
    } catch (e) {
      console.warn("Could not read local products storage:", e);
    }
  }

  // 3. Fallback to bundled seed JSON if no database or local storage products
  if (products.length === 0) {
    return getAllProductsLocal();
  }

  return products;
}

/**
 * Fetch a single product by slug from Supabase, localStorage, or local JSON.
 */
export async function getProductBySlug(slug: string): Promise<Product | null> {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";

  // 1. Try Supabase
  if (supabaseUrl.startsWith("http")) {
    try {
      const supabase = createClient();
      const { data, error } = await supabase
        .from("products")
        .select("*")
        .eq("slug", slug)
        .maybeSingle();

      if (!error && data) {
        return rowToProduct(data);
      }
    } catch (e) {
      console.warn("Supabase single product fetch failed:", e);
    }
  }

  // 2. Try browser localStorage (admin newly added or edited products)
  if (typeof window !== "undefined") {
    try {
      const localData = localStorage.getItem("amabaya_local_products");
      if (localData) {
        const parsed = JSON.parse(localData);
        if (Array.isArray(parsed)) {
          const match = parsed.find((p: any) => p.slug === slug || p.id === slug);
          if (match) {
            return {
              slug: match.slug,
              title: match.name,
              subtitle: match.subtitle || "",
              description: match.description || "",
              longDescription: match.long_description || "",
              price: match.price,
              originalPrice: match.original_price,
              category: match.category,
              tags: Array.isArray(match.tags) ? match.tags : [],
              sizes: normalizeSizes(match.sizes || match.sizes_json),
              colors: Array.isArray(match.colors) ? match.colors : [],
              images: Array.isArray(match.images) && match.images.length > 0 ? match.images : ["/products/classic-noir-abaya/image-1.jpg"],
              modelPath: match.model_path,
              sku: match.sku || "",
              featured: !!match.featured,
              isNew: !!match.is_new,
              isBestseller: !!match.is_bestseller,
              stock: typeof match.stock === "number" ? { "Standard-Default": match.stock } : (match.stock || {}),
              material: match.material || "Korean Nida",
              careInstructions: match.care_instructions || [],
              rating: Number(match.rating) || 5,
              reviewCount: Number(match.review_count) || 1,
              createdAt: match.created_at || new Date().toISOString(),
            };
          }
        }
      }
    } catch (e) {
      console.warn("Could not load product from localStorage:", e);
    }
  }

  // 3. Try bundled local JSON
  return getProductBySlugLocal(slug);
}

/**
 * All product slugs — for generateStaticParams.
 * Note: with Supabase we can't know slugs at build time without a server call,
 * so we keep the local list as a build-time fallback.
 */
export function getProductSlugs(): string[] {
  return PRODUCT_SLUGS;
}

// ─── Local JSON fallbacks ────────────────────────────────────────────────────

const PRODUCT_SLUGS = [
  "classic-noir-abaya",
  "royal-zahra-kaftan",
  "pearl-embroidered-dupatta",
  "emerald-velvet-abaya",
  "ivory-zari-kaftan",
  "organza-luxe-dupatta",
];

async function getAllProductsLocal(): Promise<Product[]> {
  const products: Product[] = [];
  for (const slug of PRODUCT_SLUGS) {
    try {
      const config = await import(
        `../../public/products/${slug}/config.json`
      ).then((m) => m.default);
      products.push({ ...config, slug });
    } catch (e) {
      console.warn(`Could not load product: ${slug}`, e);
    }
  }
  return products;
}

async function getProductBySlugLocal(slug: string): Promise<Product | null> {
  try {
    const config = await import(
      `../../public/products/${slug}/config.json`
    ).then((m) => m.default);
    return { ...config, slug };
  } catch {
    return null;
  }
}

// ─── Utility helpers (unchanged) ─────────────────────────────────────────────

export function formatPrice(price: number, currencyPrefix = "Rs."): string {
  return `${currencyPrefix} ${price.toLocaleString("en-PK")}`;
}

export function getStock(product: Product, size: string, color: string): number {
  const key = `${size}-${color}`;
  return (product.stock as Record<string, number>)[key] ?? 0;
}

export function getDiscountPercent(price: number, originalPrice: number): number {
  return Math.round(((originalPrice - price) / originalPrice) * 100);
}
