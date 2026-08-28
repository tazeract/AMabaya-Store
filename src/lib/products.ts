import { createClient } from "@/lib/supabase/client";
import type { Product } from "@/types";

// ─── Normalization Helpers ───────────────────────────────────────────────────

function normalizeColors(raw: any): { name: string; hex: string }[] {
  if (Array.isArray(raw) && raw.length > 0) {
    return raw.map((c) => {
      if (typeof c === "string") return { name: c, hex: "#111827" };
      if (typeof c === "object" && c !== null && "name" in c) {
        return { name: c.name, hex: c.hex || "#111827" };
      }
      return { name: String(c), hex: "#111827" };
    });
  }
  return [{ name: "Midnight Black", hex: "#111827" }];
}

function normalizeSizes(raw: any): { label: string; available: boolean; measurements?: string }[] {
  if (!Array.isArray(raw) || raw.length === 0) {
    return [
      { label: "S", available: true, measurements: "Chest 38\", Length 54\"" },
      { label: "M", available: true, measurements: "Chest 42\", Length 56\"" },
      { label: "L", available: true, measurements: "Chest 46\", Length 58\"" },
      { label: "XL", available: true, measurements: "Chest 50\", Length 60\"" },
    ];
  }
  return raw.map((s) => {
    if (typeof s === "string") return { label: s, available: true };
    if (typeof s === "object" && s !== null && "label" in s) {
      return {
        label: s.label,
        available: s.available !== false,
        measurements: s.measurements,
      };
    }
    return { label: String(s), available: true };
  });
}

function normalizeImages(raw: any): string[] {
  if (Array.isArray(raw) && raw.length > 0) {
    return raw.filter((img) => typeof img === "string" && img.trim().length > 0);
  }
  return ["/products/classic-noir-abaya/image-1.jpg"];
}

function rowToProduct(row: any): Product {
  return {
    slug: row.slug || toSlug(row.name || row.title || "product"),
    title: row.name || row.title || "Luxury Abaya",
    subtitle: row.subtitle ?? "",
    description: row.description ?? "",
    longDescription: row.long_description ?? row.longDescription ?? "",
    price: Number(row.price) || 0,
    originalPrice: row.original_price ?? row.originalPrice ?? undefined,
    category: row.category || "Abaya",
    tags: Array.isArray(row.tags) ? row.tags : [],
    sizes: normalizeSizes(row.sizes_json ?? row.sizes),
    colors: normalizeColors(row.colors),
    images: normalizeImages(row.images),
    modelPath: row.model_path ?? row.modelPath ?? undefined,
    sku: row.sku ?? "",
    featured: Boolean(row.featured),
    isNew: Boolean(row.is_new ?? row.isNew),
    isBestseller: Boolean(row.is_bestseller ?? row.isBestseller),
    stock: typeof row.stock === "object" && row.stock !== null ? row.stock : { "Standard-Default": Number(row.stock) || 10 },
    material: row.material || "100% Premium Korean Nida",
    careInstructions: Array.isArray(row.care_instructions ?? row.careInstructions)
      ? (row.care_instructions ?? row.careInstructions)
      : ["Dry clean or hand wash gently with cold water", "Steam iron inside out on low heat", "Hang to dry in shaded area"],
    rating: Number(row.rating) || 5.0,
    reviewCount: Number(row.review_count ?? row.reviewCount) || 12,
    createdAt: row.created_at ?? row.createdAt ?? new Date().toISOString(),
  };
}

export function toSlug(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-");
}

// ─── Local JSON Seed Fallbacks ───────────────────────────────────────────────

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
      products.push({
        ...config,
        slug,
        colors: normalizeColors(config.colors),
        sizes: normalizeSizes(config.sizes),
        images: normalizeImages(config.images),
      });
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
    return {
      ...config,
      slug,
      colors: normalizeColors(config.colors),
      sizes: normalizeSizes(config.sizes),
      images: normalizeImages(config.images),
    };
  } catch {
    return null;
  }
}

/**
 * Fetch all products merging Supabase, browser localStorage, and static seed JSON.
 */
export async function getAllProducts(): Promise<Product[]> {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";
  const productMap = new Map<string, Product>();

  // 1. Load baseline seed JSON
  const seedProducts = await getAllProductsLocal();
  seedProducts.forEach((p) => productMap.set(p.slug, p));

  // 2. Try Supabase if configured
  if (supabaseUrl.startsWith("http")) {
    try {
      const supabase = createClient();
      const { data, error } = await supabase
        .from("products")
        .select("*")
        .order("created_at", { ascending: false });

      if (!error && data && data.length > 0) {
        data.map(rowToProduct).forEach((p) => productMap.set(p.slug, p));
      }
    } catch (e) {
      console.warn("Supabase products fetch failed:", e);
    }
  }

  // 3. In browser environments, check localStorage for admin-created or updated products
  if (typeof window !== "undefined") {
    try {
      const localData = localStorage.getItem("amabaya_local_products");
      if (localData) {
        const parsed = JSON.parse(localData);
        if (Array.isArray(parsed) && parsed.length > 0) {
          parsed.forEach((raw: any) => {
            const prod = rowToProduct(raw);
            productMap.set(prod.slug, prod);
          });
        }
      }
    } catch (e) {
      console.warn("Could not read local products storage:", e);
    }
  }

  return Array.from(productMap.values()).sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );
}

/**
 * Fetch a single product by slug from Supabase, localStorage, or local JSON.
 */
export async function getProductBySlug(slug: string): Promise<Product | null> {
  const cleanSlug = slug.toLowerCase().trim();

  // 1. Try browser localStorage first on client
  if (typeof window !== "undefined") {
    try {
      const localData = localStorage.getItem("amabaya_local_products");
      if (localData) {
        const parsed = JSON.parse(localData);
        if (Array.isArray(parsed)) {
          const match = parsed.find(
            (p: any) =>
              (p.slug && p.slug.toLowerCase() === cleanSlug) ||
              (p.id && String(p.id) === cleanSlug) ||
              (p.name && toSlug(p.name) === cleanSlug)
          );
          if (match) {
            return rowToProduct(match);
          }
        }
      }
    } catch (e) {
      console.warn("Could not load product from localStorage:", e);
    }
  }

  // 2. Try Supabase
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";
  if (supabaseUrl.startsWith("http")) {
    try {
      const supabase = createClient();
      const { data, error } = await supabase
        .from("products")
        .select("*")
        .eq("slug", cleanSlug)
        .maybeSingle();

      if (!error && data) {
        return rowToProduct(data);
      }
    } catch (e) {
      console.warn("Supabase single product fetch failed:", e);
    }
  }

  // 3. Try bundled local JSON
  return getProductBySlugLocal(cleanSlug);
}

export function getProductSlugs(): string[] {
  return PRODUCT_SLUGS;
}

// ─── Utility helpers ─────────────────────────────────────────────────────────

export function formatPrice(price: number, currencyPrefix = "Rs."): string {
  return `${currencyPrefix} ${Number(price || 0).toLocaleString("en-PK")}`;
}

export function getStock(product: Product, size?: string, color?: string): number {
  if (!product.stock) return 10;
  if (typeof product.stock === "number") return product.stock;
  if (typeof product.stock === "object") {
    if (size && color) {
      const key = `${size}-${color}`;
      if (typeof product.stock[key] === "number") return product.stock[key];
    }
    const values = Object.values(product.stock).filter((v) => typeof v === "number");
    if (values.length > 0) return values.reduce((sum, v) => sum + v, 0);
  }
  return 10;
}

export function getDiscountPercent(price: number, originalPrice: number): number {
  if (!originalPrice || originalPrice <= price) return 0;
  return Math.round(((originalPrice - price) / originalPrice) * 100);
}
