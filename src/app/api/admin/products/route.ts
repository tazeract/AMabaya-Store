import { NextRequest, NextResponse } from "next/server";
import fs from "fs";
import path from "path";
import { createClient } from "@/lib/supabase/client";

const DATA_DIR = path.join(process.cwd(), "src", "data");
const PRODUCTS_FILE = path.join(DATA_DIR, "products.json");

// Helper to ensure data directory and file exist
function getLocalProducts(): any[] {
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    if (fs.existsSync(PRODUCTS_FILE)) {
      const content = fs.readFileSync(PRODUCTS_FILE, "utf-8");
      const parsed = JSON.parse(content);
      if (Array.isArray(parsed)) return parsed;
    }
  } catch (e) {
    console.error("Error reading local products file:", e);
  }
  return [];
}

function saveLocalProducts(products: any[]) {
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    fs.writeFileSync(PRODUCTS_FILE, JSON.stringify(products, null, 2), "utf-8");
  } catch (e) {
    console.error("Error saving local products file:", e);
  }
}

// Fallback seed products
const SEED_SLUGS = [
  "classic-noir-abaya",
  "royal-zahra-kaftan",
  "pearl-embroidered-dupatta",
  "emerald-velvet-abaya",
  "ivory-zari-kaftan",
  "organza-luxe-dupatta",
];

function getSeedProducts(): any[] {
  const list: any[] = [];
  for (const slug of SEED_SLUGS) {
    try {
      const configPath = path.join(process.cwd(), "public", "products", slug, "config.json");
      if (fs.existsSync(configPath)) {
        const raw = JSON.parse(fs.readFileSync(configPath, "utf-8"));
        list.push({
          id: raw.id || slug,
          slug,
          name: raw.title || raw.name,
          category: raw.category || "Abaya",
          price: raw.price || 0,
          original_price: raw.originalPrice || raw.original_price,
          description: raw.description || "",
          long_description: raw.longDescription || raw.long_description || "",
          images: raw.images || [],
          sizes: raw.sizes || [{ label: "Standard", available: true }],
          sizes_json: raw.sizes,
          colors: raw.colors || [{ name: "Midnight Black", hex: "#111827" }],
          stock: typeof raw.stock === "number" ? raw.stock : 10,
          is_new: Boolean(raw.isNew || raw.is_new),
          is_bestseller: Boolean(raw.isBestseller || raw.is_bestseller),
          featured: Boolean(raw.featured),
          tags: raw.tags || [],
          sku: raw.sku || "",
          material: raw.material || "Korean Nida",
          rating: raw.rating || 5,
          review_count: raw.reviewCount || raw.review_count || 12,
          created_at: raw.createdAt || raw.created_at || new Date().toISOString(),
        });
      }
    } catch (err) {
      console.warn("Could not load seed config for slug:", slug, err);
    }
  }
  return list;
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const slugQuery = searchParams.get("slug")?.toLowerCase().trim();

    let products = getLocalProducts();

    // If local products file is empty, initialize with seeds or Supabase
    if (products.length === 0) {
      // Try Supabase first
      const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";
      if (supabaseUrl.startsWith("http")) {
        try {
          const supabase = createClient();
          const { data, error } = await supabase
            .from("products")
            .select("*")
            .order("created_at", { ascending: false });

          if (!error && data && data.length > 0) {
            products = data;
          }
        } catch (err) {
          console.warn("Supabase fetch in API:", err);
        }
      }

      if (products.length === 0) {
        products = getSeedProducts();
      }

      if (products.length > 0) {
        saveLocalProducts(products);
      }
    }

    if (slugQuery) {
      const match = products.find(
        (p: any) =>
          (p.slug && p.slug.toLowerCase() === slugQuery) ||
          (p.id && String(p.id).toLowerCase() === slugQuery) ||
          (p.name && p.name.toLowerCase().replace(/[^a-z0-9\s-]/g, "").trim().replace(/\s+/g, "-") === slugQuery)
      );
      return NextResponse.json({ success: true, product: match || null });
    }

    return NextResponse.json({ success: true, products });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error?.message || "Failed to load products" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const productData = body.product;
    if (!productData) {
      return NextResponse.json({ success: false, error: "Product payload missing" }, { status: 400 });
    }

    let products = getLocalProducts();
    if (products.length === 0) {
      products = getSeedProducts();
    }

    const existingIndex = products.findIndex(
      (p: any) =>
        (productData.id && p.id === productData.id) ||
        (productData.slug && p.slug === productData.slug)
    );

    if (existingIndex >= 0) {
      products[existingIndex] = {
        ...products[existingIndex],
        ...productData,
        id: products[existingIndex].id || productData.id,
      };
    } else {
      products = [
        {
          ...productData,
          id: productData.id || `prod_${Date.now()}`,
          created_at: productData.created_at || new Date().toISOString(),
        },
        ...products,
      ];
    }

    saveLocalProducts(products);

    // Also attempt Supabase sync in background
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";
    if (supabaseUrl.startsWith("http")) {
      try {
        const supabase = createClient();
        if (productData.id) {
          await supabase.from("products").upsert(productData);
        }
      } catch (err) {
        console.warn("Supabase background upsert notice:", err);
      }
    }

    return NextResponse.json({ success: true, products });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error?.message || "Failed to save product" }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");
    if (!id) {
      return NextResponse.json({ success: false, error: "Missing product ID" }, { status: 400 });
    }

    let products = getLocalProducts();
    products = products.filter((p: any) => p.id !== id && p.slug !== id);
    saveLocalProducts(products);

    // Supabase background delete
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";
    if (supabaseUrl.startsWith("http")) {
      try {
        const supabase = createClient();
        await supabase.from("products").delete().eq("id", id);
      } catch (err) {
        console.warn("Supabase delete notice:", err);
      }
    }

    return NextResponse.json({ success: true, products });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error?.message || "Failed to delete product" }, { status: 500 });
  }
}
