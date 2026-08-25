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
 * Falls back to JSON imports if Supabase is not configured.
 */
export async function getAllProducts(): Promise<Product[]> {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";
  
  // Fallback to local JSON if Supabase not configured
  if (!supabaseUrl.startsWith("http")) {
    return getAllProductsLocal();
  }

  const supabase = createClient();
  const { data, error } = await supabase
    .from("products")
    .select("*")
    .order("created_at", { ascending: false });

  if (error || !data?.length) {
    console.warn("Supabase products fetch failed, falling back to local:", error?.message);
    return getAllProductsLocal();
  }

  return data.map(rowToProduct);
}

/**
 * Fetch a single product by slug from Supabase.
 */
export async function getProductBySlug(slug: string): Promise<Product | null> {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";

  if (!supabaseUrl.startsWith("http")) {
    return getProductBySlugLocal(slug);
  }

  const supabase = createClient();
  const { data, error } = await supabase
    .from("products")
    .select("*")
    .eq("slug", slug)
    .single();

  if (error || !data) {
    return getProductBySlugLocal(slug);
  }

  return rowToProduct(data);
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
