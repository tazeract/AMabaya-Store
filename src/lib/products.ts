import type { Product, ProductConfig } from "@/types";

// All product slugs — add new slugs here when you add products to /public/products/
const PRODUCT_SLUGS = [
  "classic-noir-abaya",
  "royal-zahra-kaftan",
  "pearl-embroidered-dupatta",
];

/**
 * Load all product configs. In a real app this would use the filesystem,
 * but for static export we import the JSON directly.
 */
export async function getAllProducts(): Promise<Product[]> {
  const products: Product[] = [];

  for (const slug of PRODUCT_SLUGS) {
    try {
      // Dynamic import for static export compatibility
      const config = await import(
        `../../public/products/${slug}/config.json`
      ).then((m) => m.default as ProductConfig);

      products.push({ ...config, slug });
    } catch (e) {
      console.warn(`Could not load product: ${slug}`, e);
    }
  }

  return products;
}

/**
 * Load a single product by slug.
 */
export async function getProductBySlug(slug: string): Promise<Product | null> {
  try {
    const config = await import(
      `../../public/products/${slug}/config.json`
    ).then((m) => m.default as ProductConfig);
    return { ...config, slug };
  } catch {
    return null;
  }
}

/**
 * Get all unique product slugs (for generateStaticParams).
 */
export function getProductSlugs(): string[] {
  return PRODUCT_SLUGS;
}

/**
 * Format price in PKR with locale formatting.
 */
export function formatPrice(
  price: number,
  currencySymbol = "₨"
): string {
  return `${currencySymbol} ${price.toLocaleString("en-PK")}`;
}

/**
 * Get stock for a specific size-color combination.
 */
export function getStock(
  product: Product,
  size: string,
  color: string
): number {
  const key = `${size}-${color}`;
  return product.stock[key] ?? 0;
}

/**
 * Calculate discount percentage.
 */
export function getDiscountPercent(
  price: number,
  originalPrice: number
): number {
  return Math.round(((originalPrice - price) / originalPrice) * 100);
}
