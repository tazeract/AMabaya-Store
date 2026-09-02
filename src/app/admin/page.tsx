"use client";

import { useState, useEffect, useRef, useMemo, ChangeEvent } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import {
  Package, ChevronDown, RefreshCw, Search,
  CheckCircle, Clock, Truck, PackageCheck, X,
  ShoppingBag, TrendingUp, DollarSign,
  LogOut, Plus, Edit3, Trash2, Upload, Image as ImageIcon,
  AlertCircle, Save, Eye, LayoutGrid, Tag, Sliders,
  ShieldCheck, Users, FileText, BookOpen, ExternalLink,
  ChevronRight, Sparkles, Filter, Percent, ArrowUpDown,
  Printer, Check, Copy, AlertTriangle, Key, Layers,
  Phone, Mail, MapPin, CheckCircle2, Shield, Download,
  SlidersHorizontal, CheckSquare, Square, Menu, Camera,
  Crown, Star, ArrowUpRight, FolderPlus
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { InvoiceModal } from "@/components/admin/InvoiceModal";
import toast, { Toaster } from "react-hot-toast";

// ─── Admin Password & Settings ────────────────────────────────────────────────
const DEFAULT_ADMIN_PASSWORD = process.env.NEXT_PUBLIC_ADMIN_PASSWORD ?? "amabaya2025";

// ─── Types ───────────────────────────────────────────────────────────────────
type OrderStatus = "placed" | "processing" | "shipped" | "delivered" | "cancelled";
type AdminSection =
  | "products"
  | "orders"
  | "promocodes"
  | "carousel"
  | "banners"
  | "brands"
  | "categories"
  | "users"
  | "roles"
  | "documentation"
  | "changelog";

interface OrderItem {
  id: string;
  product_snapshot: { name: string; images?: string[] };
  quantity: number;
  size?: string;
  color?: string;
  unit_price: number;
}

interface Order {
  id: string;
  user_id: string;
  status: OrderStatus;
  total: number;
  shipping_cost: number;
  payment_method: string;
  placed_at: string;
  tracking_code?: string;
  notes?: string;
  shipping_address: {
    fullName: string;
    phone: string;
    address: string;
    city: string;
    province: string;
    email?: string;
  };
  order_items: OrderItem[];
}

interface ProductRow {
  id: string;
  slug: string;
  name: string;
  category: string;
  price: number;
  original_price?: number;
  description?: string;
  long_description?: string;
  images: string[];
  sizes: { label: string; available: boolean }[];
  stock: number;
  is_new: boolean;
  is_bestseller: boolean;
  featured: boolean;
  tags: string[];
  sku?: string;
  material?: string;
  rating?: number;
  review_count?: number;
  created_at?: string;
}

type ProductFormData = Omit<ProductRow, "id" | "created_at"> & { id?: string };

interface Promocode {
  id: string;
  code: string;
  type: "percentage" | "fixed";
  value: number;
  min_order: number;
  expires_at: string;
  max_uses: number;
  used_count: number;
  active: boolean;
}

interface CarouselSlide {
  id: string;
  title: string;
  subtitle: string;
  tagline: string;
  badge: string;
  description: string;
  primaryCtaText: string;
  primaryCtaLink: string;
  image: string;
  active: boolean;
}

interface BannerItem {
  id: string;
  title: string;
  type: "top_ribbon" | "promo_popup" | "category_strip";
  text: string;
  linkText: string;
  linkUrl: string;
  active: boolean;
}

interface BrandCollection {
  id: string;
  name: string;
  tagline: string;
  itemCount: number;
  image: string;
  featured: boolean;
}

interface CategoryItem {
  id: string;
  name: string;
  slug: string;
  description: string;
  image: string;
}

interface UserProfile {
  id: string;
  full_name: string;
  email?: string;
  phone?: string;
  city?: string;
  total_orders: number;
  total_spent: number;
  created_at: string;
}

// ─── Default Catalog Seed Fallbacks ──────────────────────────────────────────
const INITIAL_PRODUCTS: ProductRow[] = [
  {
    id: "00000000-0000-4000-8000-000000000001",
    slug: "classic-noir-abaya",
    name: "Classic Noir Korean Nida Abaya",
    category: "Abaya",
    price: 4500,
    original_price: 5500,
    description: "A stunning full-length abaya in midnight black, tailored from premium Korean Nida with gold thread cuffs.",
    long_description: "AMabaya's signature piece — handcrafted luxury abaya cut from breathable, flowing Korean Nida fabric. Features intricate antique gold embroidery at the wrists and neckline.",
    images: [
      "/products/classic-noir-abaya/image-1.jpg",
      "/products/classic-noir-abaya/image-2.jpg",
      "/products/classic-noir-abaya/image-3.jpg",
    ],
    sizes: [
      { label: "S", available: true },
      { label: "M", available: true },
      { label: "L", available: true },
      { label: "XL", available: true },
      { label: "XXL", available: true },
    ],
    stock: 24,
    is_new: false,
    is_bestseller: true,
    featured: true,
    tags: ["bestseller", "eid", "formal", "black-abaya"],
    sku: "AMA-001-BLK",
    material: "100% Premium Korean Nida",
    rating: 4.9,
    review_count: 247,
    created_at: "2024-01-15T10:00:00Z",
  },
  {
    id: "00000000-0000-4000-8000-000000000002",
    slug: "royal-zahra-kaftan",
    name: "Royal Zahra Embroidered Kaftan",
    category: "Kaftan",
    price: 8900,
    original_price: 10500,
    description: "Opulent festive raw silk kaftan with rich antique zari embroidery, hand-set pearl tassels, and regal fall.",
    long_description: "Designed for special celebrations and weddings, the Royal Zahra features authentic Pakistani zari handwork on pure banarsi raw silk. Includes adjustable inner belt.",
    images: [
      "/products/royal-zahra-kaftan/image-1.jpg",
      "/products/royal-zahra-kaftan/image-2.jpg",
    ],
    sizes: [
      { label: "S", available: true },
      { label: "M", available: true },
      { label: "L", available: true },
      { label: "XL", available: true },
    ],
    stock: 12,
    is_new: true,
    is_bestseller: true,
    featured: true,
    tags: ["festive", "wedding", "zari", "raw-silk"],
    sku: "AMA-002-ZAH",
    material: "Pure Banarsi Raw Silk & Zari",
    rating: 5.0,
    review_count: 189,
    created_at: "2024-02-01T12:00:00Z",
  },
  {
    id: "00000000-0000-4000-8000-000000000003",
    slug: "pearl-embroidered-dupatta",
    name: "Pearl Laser-Cut Scalloped Dupatta",
    category: "Dupatta",
    price: 2900,
    original_price: 3500,
    description: "Featherlight crystalline organza dupatta detailed with four-sided laser cut scalloped edges and hand-applied pearls.",
    long_description: "The ideal finishing accessory for luxury occasionwear. Drapes gracefully with crisp volume and lustrous organza sheen.",
    images: [
      "/products/pearl-embroidered-dupatta/image-1.jpg",
    ],
    sizes: [
      { label: "Free Size (2.75 Yards)", available: true },
    ],
    stock: 35,
    is_new: false,
    is_bestseller: true,
    featured: true,
    tags: ["dupatta", "organza", "pearls", "accessories"],
    sku: "AMA-003-DUP",
    material: "Crystalline Sheer Organza",
    rating: 4.8,
    review_count: 94,
    created_at: "2024-02-10T14:00:00Z",
  },
  {
    id: "00000000-0000-4000-8000-000000000004",
    slug: "emerald-velvet-abaya",
    name: "Emerald Royale Micro-Velvet Abaya",
    category: "Abaya",
    price: 6800,
    original_price: 7900,
    description: "Plush micro-velvet winter abaya in deep royal jewel tone emerald with delicate beadwork.",
    long_description: "Tailored from imported 9000-grade micro-velvet, giving unmatched warmth and a rich velvet drape without feeling bulky.",
    images: [
      "/products/classic-noir-abaya/image-2.jpg",
    ],
    sizes: [
      { label: "S", available: true },
      { label: "M", available: true },
      { label: "L", available: true },
      { label: "XL", available: true },
    ],
    stock: 8,
    is_new: true,
    is_bestseller: false,
    featured: true,
    tags: ["winter", "velvet", "emerald", "luxury"],
    sku: "AMA-004-VEL",
    material: "Micro-Velvet 9000",
    rating: 4.9,
    review_count: 61,
    created_at: "2024-02-15T09:00:00Z",
  },
  {
    id: "00000000-0000-4000-8000-000000000005",
    slug: "ivory-zari-kaftan",
    name: "Ivory Luxe Floral Zari Kaftan",
    category: "Kaftan",
    price: 9400,
    original_price: 11200,
    description: "Pure ivory silk kaftan with champagne gold floral marori work along the neckline and cuffs.",
    long_description: "An ethereal statement piece featuring champagne gold marori embroidery on pure ivory crepe silk. Flows seamlessly with every stride.",
    images: [
      "/products/royal-zahra-kaftan/image-2.jpg",
    ],
    sizes: [
      { label: "S", available: true },
      { label: "M", available: true },
      { label: "L", available: true },
      { label: "XL", available: true },
    ],
    stock: 6,
    is_new: true,
    is_bestseller: false,
    featured: false,
    tags: ["ivory", "festive", "marori", "kaftan"],
    sku: "AMA-005-IVO",
    material: "Pure Crepe Silk & Marori",
    rating: 5.0,
    review_count: 43,
    created_at: "2024-02-20T11:00:00Z",
  },
  {
    id: "00000000-0000-4000-8000-000000000006",
    slug: "organza-luxe-dupatta",
    name: "Gota Patti Luxe Chiffon Dupatta",
    category: "Dupatta",
    price: 2400,
    original_price: 2900,
    description: "Lightweight crinkle chiffon dupatta finished with traditional handmade gota patti borders.",
    long_description: "A versatile festive essential that pairs effortlessly with all plain and embroidered abayas and kaftans.",
    images: [
      "/products/classic-noir-abaya/image-3.jpg",
    ],
    sizes: [
      { label: "Free Size (2.75 Yards)", available: true },
    ],
    stock: 18,
    is_new: false,
    is_bestseller: false,
    featured: false,
    tags: ["gota-patti", "chiffon", "dupatta"],
    sku: "AMA-006-CHI",
    material: "Pure Crinkle Chiffon",
    rating: 4.7,
    review_count: 32,
    created_at: "2024-02-22T15:00:00Z",
  },
];

const INITIAL_ORDERS: Order[] = [
  {
    id: "ord-98214a12",
    user_id: "user-1",
    status: "placed",
    total: 13400,
    shipping_cost: 0,
    payment_method: "cod",
    placed_at: "2026-08-26T20:15:00Z",
    tracking_code: "",
    notes: "Please call before delivery (Gulberg residence)",
    shipping_address: {
      fullName: "Ayesha Fatima Khan",
      phone: "+92 301 8456123",
      address: "House 42, Block C2, Gulberg III",
      city: "Lahore",
      province: "Punjab",
      email: "ayesha.khan@gmail.com",
    },
    order_items: [
      {
        id: "item-1",
        product_snapshot: { name: "Royal Zahra Embroidered Kaftan", images: ["/products/royal-zahra-kaftan/image-1.jpg"] },
        quantity: 1,
        size: "M",
        color: "Royal Ruby & Gold",
        unit_price: 8900,
      },
      {
        id: "item-2",
        product_snapshot: { name: "Classic Noir Korean Nida Abaya", images: ["/products/classic-noir-abaya/image-1.jpg"] },
        quantity: 1,
        size: "M",
        color: "Midnight Black",
        unit_price: 4500,
      },
    ],
  },
  {
    id: "ord-8712bc90",
    user_id: "user-2",
    status: "processing",
    total: 9400,
    shipping_cost: 0,
    payment_method: "online_payment",
    placed_at: "2026-08-26T18:30:00Z",
    tracking_code: "TCS-90182471",
    notes: "Gift packaging requested",
    shipping_address: {
      fullName: "Zainab Mir",
      phone: "+92 321 4455889",
      address: "Plot 18, Street 5, Phase 6, DHA",
      city: "Karachi",
      province: "Sindh",
      email: "zainab.mir@outlook.com",
    },
    order_items: [
      {
        id: "item-3",
        product_snapshot: { name: "Ivory Luxe Floral Zari Kaftan", images: ["/products/royal-zahra-kaftan/image-2.jpg"] },
        quantity: 1,
        size: "S",
        color: "Pure Ivory",
        unit_price: 9400,
      },
    ],
  },
];

const INITIAL_PROMOCODES: Promocode[] = [
  { id: "p1", code: "ELEGANCE15", type: "percentage", value: 15, min_order: 5000, expires_at: "2026-12-31", max_uses: 500, used_count: 84, active: true },
  { id: "p2", code: "LUXURY500", type: "fixed", value: 500, min_order: 7000, expires_at: "2026-10-31", max_uses: 200, used_count: 42, active: true },
  { id: "p3", code: "WELCOME10", type: "percentage", value: 10, min_order: 3000, expires_at: "2027-01-01", max_uses: 1000, used_count: 312, active: true },
];

const INITIAL_SLIDES: CarouselSlide[] = [
  {
    id: "s1",
    title: "Elegance in Every Drape",
    subtitle: "AUTUMN / WINTER '26 EDIT",
    tagline: "HAUTE MODESTY REDEFINED",
    badge: "New Luxury Release",
    description: "Immerse yourself in our signature collection of handcrafted luxury abayas and flowing silhouettes, sculpted from the finest Korean Nida and rich velvets.",
    primaryCtaText: "Explore Collection",
    primaryCtaLink: "/products?category=Abaya",
    image: "/products/classic-noir-abaya/image-1.jpg",
    active: true,
  },
  {
    id: "s2",
    title: "The Raw Silk & Zari Kaftan",
    subtitle: "ROYAL FESTIVE OCCASION WEAR",
    tagline: "TIMELESS SOUTH ASIAN CRAFTSMANSHIP",
    badge: "Festive Exclusive",
    description: "Opulent formal silhouettes detailed with intricate antique gold zari borders and hand-embellished pearl tassels for memorable celebrations.",
    primaryCtaText: "Shop Kaftans",
    primaryCtaLink: "/products?category=Kaftan",
    image: "/products/royal-zahra-kaftan/image-1.jpg",
    active: true,
  },
];

const INITIAL_BANNERS: BannerItem[] = [
  { id: "b1", title: "Free Express Shipping", type: "top_ribbon", text: "Complimentary Nationwide Delivery on all orders above Rs. 5,000", linkText: "Shop Now", linkUrl: "/products", active: true },
  { id: "b2", title: "Festive Eid Edit 2026", type: "promo_popup", text: "Enjoy flat 15% off on our limited edition Luxury Festive Abayas using code ELEGANCE15", linkText: "Claim Discount", linkUrl: "/products", active: true },
];

const INITIAL_BRANDS: BrandCollection[] = [
  { id: "c1", name: "Everyday Luxury Nida", tagline: "Breathable Korean Nida for effortless daily wear with modest fluid grace", itemCount: 14, image: "/products/classic-noir-abaya/image-1.jpg", featured: true },
  { id: "c2", name: "Festive Zari & Velvet", tagline: "Heavy antique gold embroideries and plush micro-velvet textures", itemCount: 8, image: "/products/royal-zahra-kaftan/image-1.jpg", featured: true },
  { id: "c3", name: "Bridal Haute Couture", tagline: "Hand-embellished pearls, crystals, zardozi and scalloped cuts", itemCount: 6, image: "/products/pearl-embroidered-dupatta/image-1.jpg", featured: true },
  { id: "c4", name: "Modest Co-Ords & Sets", tagline: "Contemporary two-piece tailored silhouettes for the modern woman", itemCount: 9, image: "/products/classic-noir-abaya/image-2.jpg", featured: false },
];

const INITIAL_CATEGORIES: CategoryItem[] = [
  { id: "cat-1", name: "Abaya", slug: "Abaya", description: "Full-length flowing abayas in Korean Nida, Silk and Velvet cuts", image: "/products/classic-noir-abaya/image-1.jpg" },
  { id: "cat-2", name: "Kaftan", slug: "Kaftan", description: "Royal festive kaftans with zari and hand-embellished drapes", image: "/products/royal-zahra-kaftan/image-1.jpg" },
  { id: "cat-3", name: "Dupatta", slug: "Dupatta", description: "Organza, Chiffon, and Silk dupattas with pearl scalloped borders", image: "/products/pearl-embroidered-dupatta/image-1.jpg" },
  { id: "cat-4", name: "Accessories", slug: "Accessories", description: "Signature matching hijabs, under-caps, and modesty belts", image: "/products/classic-noir-abaya/image-3.jpg" },
  { id: "cat-5", name: "Set", slug: "Set", description: "Complete matching Abaya + Inner + Dupatta ensembles", image: "/products/classic-noir-abaya/image-2.jpg" },
];

const INITIAL_USERS: UserProfile[] = [
  { id: "u-1", full_name: "Ayesha Fatima Khan", email: "ayesha.khan@gmail.com", phone: "+92 301 8456123", city: "Lahore", total_orders: 4, total_spent: 38500, created_at: "2024-01-12T10:00:00Z" },
  { id: "u-2", full_name: "Zainab Mir", email: "zainab.mir@outlook.com", phone: "+92 321 4455889", city: "Karachi", total_orders: 3, total_spent: 24800, created_at: "2024-02-05T12:00:00Z" },
  { id: "u-3", full_name: "Mahnoor Tariq", email: "mahnoor.t@gmail.com", phone: "+92 333 9021485", city: "Islamabad", total_orders: 2, total_spent: 14900, created_at: "2024-02-14T09:00:00Z" },
  { id: "u-4", full_name: "Sadia Qureshi", email: "sadia.q@yahoo.com", phone: "+92 300 7812903", city: "Multan", total_orders: 1, total_spent: 6800, created_at: "2024-02-21T16:00:00Z" },
];

const STATUS_CONFIG: Record<OrderStatus, { label: string; icon: React.ElementType; color: string; bg: string }> = {
  placed:     { label: "Placed",     icon: CheckCircle,  color: "text-blue-700",   bg: "bg-blue-50 border-blue-200" },
  processing: { label: "Processing", icon: Clock,         color: "text-amber-700",  bg: "bg-amber-50 border-amber-200" },
  shipped:    { label: "Shipped",    icon: Truck,         color: "text-purple-700", bg: "bg-purple-50 border-purple-200" },
  delivered:  { label: "Delivered",  icon: PackageCheck,  color: "text-emerald-700",bg: "bg-emerald-50 border-emerald-200" },
  cancelled:  { label: "Cancelled",  icon: X,             color: "text-red-700",    bg: "bg-red-50 border-red-200" },
};
const ALL_STATUSES = Object.keys(STATUS_CONFIG) as OrderStatus[];

function formatPKR(n: number) {
  return `Rs. ${Number(n || 0).toLocaleString("en-PK")}`;
}
function formatDate(iso: string) {
  try {
    return new Date(iso).toLocaleDateString("en-PK", { day: "numeric", month: "short", year: "numeric" });
  } catch {
    return iso;
  }
}
function toSlug(name: string) {
  return name.toLowerCase().replace(/[^a-z0-9\s-]/g, "").trim().replace(/\s+/g, "-");
}

function generateSafeUUID(): string {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    return crypto.randomUUID();
  }
  return "00000000-0000-4000-8000-" + Date.now().toString(16).padStart(12, "0");
}

export default function AdminPage() {
  const [authenticated, setAuthenticated] = useState<boolean | null>(null);
  const [activeSection, setActiveSection] = useState<AdminSection>("products");
  const [adminPassword, setAdminPassword] = useState(DEFAULT_ADMIN_PASSWORD);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Core Data States
  const [products, setProducts] = useState<ProductRow[]>(INITIAL_PRODUCTS);
  const [orders, setOrders] = useState<Order[]>(INITIAL_ORDERS);
  const [promocodes, setPromocodes] = useState<Promocode[]>(INITIAL_PROMOCODES);
  const [slides, setSlides] = useState<CarouselSlide[]>(INITIAL_SLIDES);
  const [banners, setBanners] = useState<BannerItem[]>(INITIAL_BANNERS);
  const [brands, setBrands] = useState<BrandCollection[]>(INITIAL_BRANDS);
  const [categories, setCategories] = useState<CategoryItem[]>(INITIAL_CATEGORIES);
  const [users, setUsers] = useState<UserProfile[]>(INITIAL_USERS);
  const [loading, setLoading] = useState(false);

  // Modals
  const [productModalOpen, setProductModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<ProductRow | undefined>(undefined);
  const [invoiceOrder, setInvoiceOrder] = useState<Order | null>(null);
  const [promoModalOpen, setPromoModalOpen] = useState(false);
  const [slideModalOpen, setSlideModalOpen] = useState(false);
  const [brandModalOpen, setBrandModalOpen] = useState(false);
  const [editingBrand, setEditingBrand] = useState<BrandCollection | undefined>(undefined);
  const [categoryModalOpen, setCategoryModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<CategoryItem | undefined>(undefined);

  // Filters
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [stockFilter, setStockFilter] = useState("all");
  const [orderSearch, setOrderSearch] = useState("");
  const [orderStatusFilter, setOrderStatusFilter] = useState("all");

  // Promocode tester
  const [testCodeInput, setTestCodeInput] = useState("");
  const [testAmountInput, setTestAmountInput] = useState<number>(6000);
  const [testResult, setTestResult] = useState<string | null>(null);

  // Supabase client instance
  const supabase = useRef(createClient()).current;

  // Broadcast changes across the browser (same tab + all other tabs)
  const notifyStoreUpdate = () => {
    if (typeof window !== "undefined") {
      // Same-tab events
      window.dispatchEvent(new Event("amabaya_products_updated"));
      window.dispatchEvent(new Event("amabaya_slides_updated"));
      window.dispatchEvent(new Event("amabaya_banners_updated"));
      window.dispatchEvent(new Event("amabaya_categories_updated"));
      window.dispatchEvent(new Event("amabaya_brands_updated"));
      window.dispatchEvent(new Event("amabaya_promocodes_updated"));
      // Cross-tab: writing to localStorage triggers "storage" event on OTHER tabs
      localStorage.setItem("amabaya_last_update", Date.now().toString());
      // Cross-tab: BroadcastChannel for instant same-origin updates
      try {
        const bc = new BroadcastChannel("amabaya_store");
        bc.postMessage({ type: "store_updated", ts: Date.now() });
        bc.close();
      } catch {}
    }
  };

  // 1. Authenticate check on mount
  useEffect(() => {
    const isAuth =
      sessionStorage.getItem("amabaya_admin") === "1" ||
      localStorage.getItem("amabaya_admin_auth") === "1";
    setAuthenticated(isAuth);
    const savedPw = localStorage.getItem("amabaya_admin_custom_pw");
    if (savedPw) setAdminPassword(savedPw);
  }, []);

  const syncStoreData = async (payload: Record<string, any>) => {
    try {
      await fetch("/api/admin/data", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
    } catch (e) {
      console.warn("API sync notice:", e);
    }
  };

  // 2. Fetch or load data from Server API, Supabase & localStorage
  const loadData = async () => {
    setLoading(true);
    try {
      // 1. Products - First try persistent server API
      let loadedProducts: ProductRow[] | null = null;
      try {
        const prodRes = await fetch("/api/admin/products", { cache: "no-store" });
        if (prodRes.ok) {
          const prodJson = await prodRes.json();
          if (prodJson.success && Array.isArray(prodJson.products) && prodJson.products.length > 0) {
            loadedProducts = prodJson.products.map((p: any) => ({
              id: p.id,
              slug: p.slug ?? toSlug(p.name),
              name: p.name,
              category: p.category,
              price: p.price,
              original_price: p.original_price ?? p.originalPrice ?? undefined,
              description: p.description ?? "",
              long_description: p.long_description ?? p.longDescription ?? "",
              images: Array.isArray(p.images) && p.images.length > 0 ? p.images : ["/products/classic-noir-abaya/image-1.jpg"],
              sizes: Array.isArray(p.sizes_json ?? p.sizes) && (p.sizes_json ?? p.sizes).length > 0
                ? (p.sizes_json ?? p.sizes)
                : [{ label: "S", available: true }, { label: "M", available: true }, { label: "L", available: true }, { label: "XL", available: true }],
              stock: typeof p.stock === "number" ? p.stock : 10,
              is_new: !!(p.is_new ?? p.isNew),
              is_bestseller: !!(p.is_bestseller ?? p.isBestseller),
              featured: !!p.featured,
              tags: Array.isArray(p.tags) ? p.tags : [],
              sku: p.sku ?? "",
              material: p.material ?? "Korean Nida",
              rating: p.rating ?? 5,
              review_count: p.review_count ?? p.reviewCount ?? 1,
              created_at: p.created_at ?? p.createdAt,
            }));
          }
        }
      } catch (e) {
        console.warn("API products load:", e);
      }

      // If API didn't have products, check Supabase
      if (!loadedProducts || loadedProducts.length === 0) {
        const { data: prodData } = await supabase
          .from("products")
          .select("*")
          .order("created_at", { ascending: false });

        if (prodData && prodData.length > 0) {
          loadedProducts = prodData.map((p) => ({
            id: p.id,
            slug: p.slug ?? toSlug(p.name),
            name: p.name,
            category: p.category,
            price: p.price,
            original_price: p.original_price ?? undefined,
            description: p.description ?? "",
            long_description: p.long_description ?? "",
            images: Array.isArray(p.images) && p.images.length > 0 ? p.images : ["/products/classic-noir-abaya/image-1.jpg"],
            sizes: Array.isArray(p.sizes_json) && p.sizes_json.length > 0
              ? p.sizes_json
              : [{ label: "S", available: true }, { label: "M", available: true }, { label: "L", available: true }, { label: "XL", available: true }],
            stock: typeof p.stock === "number" ? p.stock : 10,
            is_new: !!p.is_new,
            is_bestseller: !!p.is_bestseller,
            featured: !!p.featured,
            tags: Array.isArray(p.tags) ? p.tags : [],
            sku: p.sku ?? "",
            material: p.material ?? "Korean Nida",
            rating: p.rating ?? 5,
            review_count: p.review_count ?? 1,
            created_at: p.created_at,
          }));
        }
      }

      if (loadedProducts && loadedProducts.length > 0) {
        setProducts(loadedProducts);
        localStorage.setItem("amabaya_local_products", JSON.stringify(loadedProducts));
      } else {
        const savedProds = localStorage.getItem("amabaya_local_products");
        if (savedProds) setProducts(JSON.parse(savedProds));
      }

      // 2. Orders
      const { data: orderData } = await supabase
        .from("orders")
        .select("*, order_items(*)")
        .order("placed_at", { ascending: false });

      if (orderData && orderData.length > 0) {
        setOrders(orderData as Order[]);
        localStorage.setItem("amabaya_local_orders", JSON.stringify(orderData));
      } else {
        const savedOrders = localStorage.getItem("amabaya_local_orders");
        if (savedOrders) setOrders(JSON.parse(savedOrders));
      }

      // 3. Profiles / Users
      const { data: profData } = await supabase.from("profiles").select("*");
      if (profData && profData.length > 0) {
        const userList: UserProfile[] = profData.map((u) => {
          const userOrders = (orderData || []).filter((o) => o.user_id === u.id);
          const spent = userOrders.reduce((sum, o) => sum + (o.total || 0), 0);
          return {
            id: u.id,
            full_name: u.full_name || "Valued Customer",
            phone: u.phone || "—",
            email: u.email || "—",
            city: u.addresses?.[0]?.city || "Pakistan",
            total_orders: userOrders.length,
            total_spent: spent,
            created_at: u.created_at || new Date().toISOString(),
          };
        });
        setUsers(userList);
      }

      // 4. Custom modules from Server API & localStorage
      try {
        const dataRes = await fetch("/api/admin/data", { cache: "no-store" });
        if (dataRes.ok) {
          const dataJson = await dataRes.json();
          if (dataJson.success && dataJson.data) {
            const d = dataJson.data;
            if (d.promocodes) { setPromocodes(d.promocodes); localStorage.setItem("amabaya_promocodes", JSON.stringify(d.promocodes)); }
            if (d.slides) { setSlides(d.slides); localStorage.setItem("amabaya_slides", JSON.stringify(d.slides)); }
            if (d.banners) { setBanners(d.banners); localStorage.setItem("amabaya_banners", JSON.stringify(d.banners)); }
            if (d.brands) { setBrands(d.brands); localStorage.setItem("amabaya_brands", JSON.stringify(d.brands)); }
            if (d.categories) { setCategories(d.categories); localStorage.setItem("amabaya_categories", JSON.stringify(d.categories)); }
            if (d.orders && (!orderData || orderData.length === 0)) { setOrders(d.orders); localStorage.setItem("amabaya_local_orders", JSON.stringify(d.orders)); }
          }
        }
      } catch (e) {
        console.warn("API store data load:", e);
      }

      const savedPromo = localStorage.getItem("amabaya_promocodes");
      if (savedPromo) setPromocodes(JSON.parse(savedPromo));
      const savedSlides = localStorage.getItem("amabaya_slides");
      if (savedSlides) setSlides(JSON.parse(savedSlides));
      const savedBanners = localStorage.getItem("amabaya_banners");
      if (savedBanners) setBanners(JSON.parse(savedBanners));
      const savedBrands = localStorage.getItem("amabaya_brands");
      if (savedBrands) setBrands(JSON.parse(savedBrands));
      const savedCategories = localStorage.getItem("amabaya_categories");
      if (savedCategories) setCategories(JSON.parse(savedCategories));
    } catch (e) {
      console.warn("Using local dataset:", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (authenticated) {
      loadData();
    }
  }, [authenticated]);

  // ─── Product CRUD ───────────────────────────────────────────────────────────
  const handleSaveProduct = async (formData: ProductFormData) => {
    try {
      const dbPayload: Record<string, unknown> = {
        name: formData.name,
        slug: formData.slug || toSlug(formData.name),
        category: formData.category,
        price: Number(formData.price),
        original_price: formData.original_price ? Number(formData.original_price) : null,
        description: formData.description || "",
        long_description: formData.long_description || "",
        images: formData.images.length > 0 ? formData.images : ["/products/classic-noir-abaya/image-1.jpg"],
        sizes_json: formData.sizes,
        sizes: formData.sizes.map((s) => s.label),
        stock: Number(formData.stock) || 0,
        is_new: !!formData.is_new,
        is_bestseller: !!formData.is_bestseller,
        featured: !!formData.featured,
        tags: formData.tags || [],
        sku: formData.sku || "",
        material: formData.material || "Korean Nida",
        rating: Number(formData.rating) || 5,
        review_count: Number(formData.review_count) || 1,
      };

      let finalProduct: ProductRow;

      if (formData.id) {
        // Update in Supabase
        const { error } = await supabase.from("products").update(dbPayload).eq("id", formData.id);
        if (error) {
          console.warn("Supabase update notice:", error.message);
        }
        finalProduct = { ...formData, ...dbPayload, id: formData.id } as ProductRow;
        const updated = products.map((p) =>
          p.id === formData.id ? finalProduct : p
        );
        setProducts(updated);
        localStorage.setItem("amabaya_local_products", JSON.stringify(updated));
      } else {
        // Insert new product
        const newId = generateSafeUUID();
        const { error } = await supabase.from("products").insert([{ ...dbPayload, id: newId }]);
        if (error) {
          console.warn("Supabase insert notice:", error.message);
        }
        finalProduct = {
          id: newId,
          slug: formData.slug || toSlug(formData.name),
          name: formData.name,
          category: formData.category,
          price: Number(formData.price),
          original_price: formData.original_price ? Number(formData.original_price) : undefined,
          description: formData.description || "",
          long_description: formData.long_description || "",
          images: formData.images.length > 0 ? formData.images : ["/products/classic-noir-abaya/image-1.jpg"],
          sizes: formData.sizes,
          stock: Number(formData.stock) || 0,
          is_new: !!formData.is_new,
          is_bestseller: !!formData.is_bestseller,
          featured: !!formData.featured,
          tags: formData.tags || [],
          sku: formData.sku || "",
          material: formData.material || "Korean Nida",
          rating: 5,
          review_count: 1,
          created_at: new Date().toISOString(),
        };
        const updated = [finalProduct, ...products];
        setProducts(updated);
        localStorage.setItem("amabaya_local_products", JSON.stringify(updated));
      }

      // Persist to Server API so all mobile and PC browsers immediately see the update
      try {
        await fetch("/api/admin/products", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ product: finalProduct }),
        });
      } catch (err) {
        console.warn("API product sync notice:", err);
      }

      notifyStoreUpdate();
      toast.success(`"${formData.name}" saved successfully!`);
      setProductModalOpen(false);
      setEditingProduct(undefined);
    } catch (e: any) {
      toast.error(e?.message || "Failed to save product");
    }
  };

  const handleDeleteProduct = async (id: string, name: string) => {
    if (!confirm(`Are you sure you want to remove "${name}" from store?`)) return;
    try {
      await supabase.from("products").delete().eq("id", id);
      const updated = products.filter((p) => p.id !== id);
      setProducts(updated);
      localStorage.setItem("amabaya_local_products", JSON.stringify(updated));

      try {
        await fetch(`/api/admin/products?id=${encodeURIComponent(id)}`, { method: "DELETE" });
      } catch (err) {
        console.warn("API delete notice:", err);
      }

      notifyStoreUpdate();
      toast.success("Product removed from storefront");
    } catch (e: any) {
      toast.error(e?.message || "Could not delete");
    }
  };

  const handleInlineStock = async (id: string, stock: number) => {
    const updated = products.map((p) => (p.id === id ? { ...p, stock } : p));
    setProducts(updated);
    localStorage.setItem("amabaya_local_products", JSON.stringify(updated));
    const target = updated.find((p) => p.id === id);
    if (target) {
      try {
        await fetch("/api/admin/products", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ product: target }),
        });
      } catch (e) {}
    }
    notifyStoreUpdate();
    await supabase.from("products").update({ stock }).eq("id", id);
    toast.success("Inventory stock updated");
  };

  // ─── Order CRUD ─────────────────────────────────────────────────────────────
  const handleOrderStatus = async (id: string, status: OrderStatus, tracking?: string) => {
    try {
      const updated = orders.map((o) =>
        o.id === id ? { ...o, status, tracking_code: tracking ?? o.tracking_code } : o
      );
      setOrders(updated);
      localStorage.setItem("amabaya_local_orders", JSON.stringify(updated));
      syncStoreData({ orders: updated });
      await supabase.from("orders").update({ status, tracking_code: tracking }).eq("id", id);
      toast.success(`Order #${id.slice(0, 8)} status set to ${status.toUpperCase()}`);
    } catch (e: any) {
      toast.error("Failed to update order");
    }
  };

  // ─── Brands & Collections CRUD ──────────────────────────────────────────────
  const handleSaveBrand = (brandData: BrandCollection) => {
    let updated: BrandCollection[];
    if (editingBrand) {
      updated = brands.map((b) => (b.id === brandData.id ? brandData : b));
      toast.success(`Collection "${brandData.name}" updated!`);
    } else {
      updated = [brandData, ...brands];
      toast.success(`New Collection "${brandData.name}" added!`);
    }
    setBrands(updated);
    localStorage.setItem("amabaya_brands", JSON.stringify(updated));
    syncStoreData({ brands: updated });
    notifyStoreUpdate();
    setBrandModalOpen(false);
    setEditingBrand(undefined);
  };

  const handleDeleteBrand = (id: string, name: string) => {
    if (!confirm(`Delete collection "${name}"?`)) return;
    const updated = brands.filter((b) => b.id !== id);
    setBrands(updated);
    localStorage.setItem("amabaya_brands", JSON.stringify(updated));
    syncStoreData({ brands: updated });
    notifyStoreUpdate();
    toast.success("Collection deleted");
  };

  const handleToggleBrandFeatured = (id: string) => {
    const updated = brands.map((b) => (b.id === id ? { ...b, featured: !b.featured } : b));
    setBrands(updated);
    localStorage.setItem("amabaya_brands", JSON.stringify(updated));
    syncStoreData({ brands: updated });
    notifyStoreUpdate();
    toast.success("Featured status updated");
  };

  // ─── Categories CRUD ────────────────────────────────────────────────────────
  const handleSaveCategory = (catData: CategoryItem) => {
    let updated: CategoryItem[];
    if (editingCategory) {
      updated = categories.map((c) => (c.id === catData.id ? catData : c));
      toast.success(`Category "${catData.name}" updated!`);
    } else {
      updated = [...categories, catData];
      toast.success(`New category "${catData.name}" added!`);
    }
    setCategories(updated);
    localStorage.setItem("amabaya_categories", JSON.stringify(updated));
    syncStoreData({ categories: updated });
    notifyStoreUpdate();
    setCategoryModalOpen(false);
    setEditingCategory(undefined);
  };

  const handleDeleteCategory = (id: string, name: string) => {
    if (!confirm(`Delete category "${name}"?`)) return;
    const updated = categories.filter((c) => c.id !== id);
    setCategories(updated);
    localStorage.setItem("amabaya_categories", JSON.stringify(updated));
    syncStoreData({ categories: updated });
    notifyStoreUpdate();
    toast.success("Category removed");
  };

  // ─── Promocodes Actions ─────────────────────────────────────────────────────
  const handleTogglePromo = (id: string) => {
    const updated = promocodes.map((p) => (p.id === id ? { ...p, active: !p.active } : p));
    setPromocodes(updated);
    localStorage.setItem("amabaya_promocodes", JSON.stringify(updated));
    syncStoreData({ promocodes: updated });
    notifyStoreUpdate();
    toast.success("Coupon status toggled");
  };

  const handleDeletePromo = (id: string) => {
    const updated = promocodes.filter((p) => p.id !== id);
    setPromocodes(updated);
    localStorage.setItem("amabaya_promocodes", JSON.stringify(updated));
    syncStoreData({ promocodes: updated });
    notifyStoreUpdate();
    toast.success("Coupon deleted");
  };

  const handleTestPromo = () => {
    const promo = promocodes.find((p) => p.code.toUpperCase() === testCodeInput.trim().toUpperCase() && p.active);
    if (!promo) {
      setTestResult("❌ Invalid or expired coupon code");
      return;
    }
    if (testAmountInput < promo.min_order) {
      setTestResult(`❌ Min order requirement of ${formatPKR(promo.min_order)} not met`);
      return;
    }
    const discount = promo.type === "percentage" ? Math.round((testAmountInput * promo.value) / 100) : promo.value;
    const finalAmount = Math.max(0, testAmountInput - discount);
    setTestResult(`✅ Valid! Discount: ${formatPKR(discount)} (${promo.value}${promo.type === "percentage" ? "%" : " PKR"} off) → Final: ${formatPKR(finalAmount)}`);
  };

  // ─── Carousel Actions ───────────────────────────────────────────────────────
  const handleToggleSlide = (id: string) => {
    const updated = slides.map((s) => (s.id === id ? { ...s, active: !s.active } : s));
    setSlides(updated);
    localStorage.setItem("amabaya_slides", JSON.stringify(updated));
    syncStoreData({ slides: updated });
    notifyStoreUpdate();
    toast.success("Hero slide visibility updated");
  };

  const handleDeleteSlide = (id: string) => {
    const updated = slides.filter((s) => s.id !== id);
    setSlides(updated);
    localStorage.setItem("amabaya_slides", JSON.stringify(updated));
    syncStoreData({ slides: updated });
    notifyStoreUpdate();
    toast.success("Hero slide deleted");
  };

  // ─── Banners Actions ────────────────────────────────────────────────────────
  const handleToggleBanner = (id: string) => {
    const updated = banners.map((b) => (b.id === id ? { ...b, active: !b.active } : b));
    setBanners(updated);
    localStorage.setItem("amabaya_banners", JSON.stringify(updated));
    syncStoreData({ banners: updated });
    notifyStoreUpdate();
    toast.success("Banner updated");
  };

  // ─── Export Customer CSV ────────────────────────────────────────────────────
  const exportUsersCSV = () => {
    const headers = ["Name,Email,Phone,City,Orders,Spent_PKR,Joined"];
    const rows = users.map(
      (u) => `"${u.full_name}","${u.email}","${u.phone}","${u.city}",${u.total_orders},${u.total_spent},"${u.created_at}"`
    );
    const csvContent = "data:text/csv;charset=utf-8," + [headers, ...rows].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `AMabaya_Customers_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success("Customer list exported as CSV!");
  };

  // ─── Filtered Views ─────────────────────────────────────────────────────────
  const filteredProducts = useMemo(() => {
    return products.filter((p) => {
      const matchSearch =
        p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (p.sku && p.sku.toLowerCase().includes(searchQuery.toLowerCase()));
      const matchCat = selectedCategory === "all" || p.category === selectedCategory;
      const matchStock =
        stockFilter === "all"
          ? true
          : stockFilter === "in_stock"
          ? p.stock > 0
          : stockFilter === "low_stock"
          ? p.stock > 0 && p.stock <= 5
          : p.stock === 0;
      return matchSearch && matchCat && matchStock;
    });
  }, [products, searchQuery, selectedCategory, stockFilter]);

  const filteredOrders = useMemo(() => {
    return orders.filter((o) => {
      const matchSearch =
        o.id.toLowerCase().includes(orderSearch.toLowerCase()) ||
        o.shipping_address?.fullName?.toLowerCase().includes(orderSearch.toLowerCase()) ||
        o.shipping_address?.phone?.includes(orderSearch) ||
        o.shipping_address?.city?.toLowerCase().includes(orderSearch.toLowerCase());
      const matchStatus = orderStatusFilter === "all" || o.status === orderStatusFilter;
      return matchSearch && matchStatus;
    });
  }, [orders, orderSearch, orderStatusFilter]);

  const totalRevenue = useMemo(() => {
    return orders
      .filter((o) => o.status !== "cancelled")
      .reduce((sum, o) => sum + (o.total || 0), 0);
  }, [orders]);

  if (authenticated === null) {
    return (
      <div className="fixed inset-0 bg-[#0F172A] flex items-center justify-center text-white z-50">
        <RefreshCw className="w-8 h-8 animate-spin text-purple-400" />
      </div>
    );
  }

  if (!authenticated) {
    return (
      <AdminLoginModal
        adminPassword={adminPassword}
        onSuccess={() => setAuthenticated(true)}
      />
    );
  }

  const navContent = (
    <div className="flex-1 overflow-y-auto px-3.5 py-4 space-y-6 text-xs custom-scrollbar">
      <div>
        <p className="px-3 text-[10px] font-bold uppercase tracking-widest text-[#64748B] mb-2">
          Store Management
        </p>
        <nav className="space-y-1">
          <SidebarItem
            icon={ShoppingBag}
            label="Products"
            count={products.length}
            active={activeSection === "products"}
            onClick={() => {
              setActiveSection("products");
              setMobileMenuOpen(false);
            }}
          />
          <SidebarItem
            icon={Package}
            label="Orders"
            count={orders.length}
            active={activeSection === "orders"}
            onClick={() => {
              setActiveSection("orders");
              setMobileMenuOpen(false);
            }}
          />
          <SidebarItem
            icon={Tag}
            label="Promocodes"
            count={promocodes.length}
            active={activeSection === "promocodes"}
            onClick={() => {
              setActiveSection("promocodes");
              setMobileMenuOpen(false);
            }}
          />
          <SidebarItem
            icon={Sliders}
            label="Carousel"
            count={slides.length}
            active={activeSection === "carousel"}
            onClick={() => {
              setActiveSection("carousel");
              setMobileMenuOpen(false);
            }}
          />
          <SidebarItem
            icon={ImageIcon}
            label="Banners"
            count={banners.length}
            active={activeSection === "banners"}
            onClick={() => {
              setActiveSection("banners");
              setMobileMenuOpen(false);
            }}
          />
        </nav>
      </div>

      <div>
        <p className="px-3 text-[10px] font-bold uppercase tracking-widest text-[#64748B] mb-2">
          Catalog Collections
        </p>
        <nav className="space-y-1">
          <SidebarItem
            icon={Sparkles}
            label="Collections"
            count={brands.length}
            active={activeSection === "brands"}
            onClick={() => {
              setActiveSection("brands");
              setMobileMenuOpen(false);
            }}
          />
          <SidebarItem
            icon={LayoutGrid}
            label="Categories"
            count={categories.length}
            active={activeSection === "categories"}
            onClick={() => {
              setActiveSection("categories");
              setMobileMenuOpen(false);
            }}
          />
        </nav>
      </div>

      <div>
        <p className="px-3 text-[10px] font-bold uppercase tracking-widest text-[#64748B] mb-2">
          Administration
        </p>
        <nav className="space-y-1">
          <SidebarItem
            icon={Users}
            label="Customers"
            count={users.length}
            active={activeSection === "users"}
            onClick={() => {
              setActiveSection("users");
              setMobileMenuOpen(false);
            }}
          />
          <SidebarItem
            icon={ShieldCheck}
            label="Security & Roles"
            active={activeSection === "roles"}
            onClick={() => {
              setActiveSection("roles");
              setMobileMenuOpen(false);
            }}
          />
          <SidebarItem
            icon={BookOpen}
            label="Documentation"
            active={activeSection === "documentation"}
            onClick={() => {
              setActiveSection("documentation");
              setMobileMenuOpen(false);
            }}
          />
          <SidebarItem
            icon={FileText}
            label="Changelog"
            badge="v15.0"
            active={activeSection === "changelog"}
            onClick={() => {
              setActiveSection("changelog");
              setMobileMenuOpen(false);
            }}
          />
        </nav>
      </div>
    </div>
  );

  return (
    <div className="fixed inset-0 bg-[#F8FAFC] flex font-sans antialiased text-[#0F172A] overflow-hidden z-50">
      <Toaster position="top-right" />

      {/* ─── DESKTOP OBSIDIAN LUXURY SIDEBAR ────────────────────────────────── */}
      <aside className="hidden lg:flex w-64 bg-[#0F172A] text-[#94A3B8] flex-col flex-shrink-0 h-full border-r border-[#1E293B] select-none">
        <div className="p-6 pb-4 flex items-center justify-between border-b border-[#1E293B]/80">
          <div className="flex items-center gap-2.5">
            <span className="font-serif text-2xl font-bold tracking-[0.1em] text-white">RIWAYAH</span>
            <span className="text-[10px] font-bold uppercase tracking-wider bg-purple-950 text-purple-300 border border-purple-800/80 px-2 py-0.5 rounded-md">
              Admin
            </span>
          </div>
        </div>

        {navContent}

        <div className="p-3.5 border-t border-[#1E293B] bg-[#090D16]">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center text-white font-bold text-xs shadow-md ring-1 ring-white/20">
                A
              </div>
              <div className="leading-tight">
                <p className="text-xs font-bold text-white">Master Admin</p>
                <p className="text-[10px] text-[#94A3B8]">Full Store Access</p>
              </div>
            </div>
            <button
              onClick={() => {
                sessionStorage.removeItem("amabaya_admin");
                localStorage.removeItem("amabaya_admin_auth");
                setAuthenticated(false);
                toast.success("Logged out");
              }}
              title="Sign Out"
              className="p-1.5 text-[#94A3B8] hover:text-red-400 hover:bg-[#1E293B] rounded-lg transition-colors"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </aside>

      {/* ─── MOBILE DRAWER OVERLAY ──────────────────────────────────────────── */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setMobileMenuOpen(false)}
              className="fixed inset-0 bg-black/70 backdrop-blur-xs z-50 lg:hidden"
            />
            <motion.div
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="fixed top-0 bottom-0 left-0 w-72 bg-[#0F172A] text-[#94A3B8] z-50 flex flex-col border-r border-[#1E293B] shadow-2xl lg:hidden"
            >
              <div className="p-5 flex items-center justify-between border-b border-[#1E293B]">
                <div className="flex items-center gap-2">
                  <span className="font-serif text-xl font-bold tracking-[0.1em] text-white">RIWAYAH</span>
                  <span className="text-[9px] font-bold uppercase tracking-wider bg-purple-950 text-purple-300 border border-purple-800/80 px-1.5 py-0.5 rounded">
                    Admin
                  </span>
                </div>
                <button
                  onClick={() => setMobileMenuOpen(false)}
                  className="p-1.5 text-gray-400 hover:text-white rounded-lg hover:bg-white/10"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {navContent}

              <div className="p-4 border-t border-[#1E293B] bg-[#090D16] flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center text-white font-bold text-xs">
                    A
                  </div>
                  <div>
                    <p className="text-xs font-bold text-white">Master Admin</p>
                    <p className="text-[10px] text-[#94A3B8]">Mobile Suite</p>
                  </div>
                </div>
                <button
                  onClick={() => {
                    sessionStorage.removeItem("amabaya_admin");
                    localStorage.removeItem("amabaya_admin_auth");
                    setAuthenticated(false);
                    setMobileMenuOpen(false);
                    toast.success("Logged out");
                  }}
                  className="p-2 text-red-400 hover:bg-red-950/40 rounded-lg"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* ─── MAIN WORKSPACE ─────────────────────────────────────────────────── */}
      <main className="flex-1 flex flex-col min-w-0 h-full overflow-y-auto bg-[#F8FAFC]">
        {/* Top Header Bar */}
        <header className="bg-white border-b border-[#E2E8F0] px-4 sm:px-8 py-3.5 sm:py-4 sticky top-0 z-20 flex items-center justify-between shadow-xs">
          <div className="flex items-center gap-3">
            {/* Mobile Hamburger Toggle */}
            <button
              onClick={() => setMobileMenuOpen(true)}
              className="lg:hidden p-2 -ml-2 text-[#475569] hover:text-[#0F172A] hover:bg-[#F1F5F9] rounded-xl transition-colors"
              title="Open Navigation Menu"
            >
              <Menu className="w-5 h-5" />
            </button>

            <div>
              <div className="flex items-center gap-1.5 text-[11px] sm:text-xs text-[#64748B] mb-0.5 font-medium">
                <Link href="/" target="_blank" className="hover:text-[#0F172A] flex items-center gap-1">
                  Storefront <ExternalLink className="w-3 h-3 text-[#94A3B8]" />
                </Link>
                <span>/</span>
                <span className="capitalize text-[#0F172A] font-semibold">{activeSection}</span>
              </div>
              <h1 className="text-lg sm:text-2xl font-serif font-bold text-[#0F172A] capitalize tracking-tight">
                {activeSection === "brands"
                  ? "Collections"
                  : activeSection === "users"
                  ? "Customers"
                  : activeSection}
              </h1>
            </div>
          </div>

          {/* Action Hub */}
          <div className="flex items-center gap-2 sm:gap-3">
            <button
              onClick={loadData}
              disabled={loading}
              className="p-2 sm:px-3 sm:py-2 border border-[#E2E8F0] text-[#64748B] hover:text-[#0F172A] rounded-xl hover:bg-[#F1F5F9] transition-colors flex items-center gap-1.5 text-xs font-medium"
              title="Refresh Data"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin text-purple-600" : ""}`} />
              <span className="hidden md:inline">Sync</span>
            </button>

            {activeSection === "products" && (
              <button
                onClick={() => {
                  setEditingProduct(undefined);
                  setProductModalOpen(true);
                }}
                className="inline-flex items-center gap-1.5 px-3.5 sm:px-4 py-2 bg-[#0F172A] text-white text-xs font-semibold rounded-xl hover:bg-[#1E293B] transition-all shadow-sm"
              >
                <Plus className="w-4 h-4" />
                <span>Add Product</span>
              </button>
            )}

            {activeSection === "brands" && (
              <button
                onClick={() => {
                  setEditingBrand(undefined);
                  setBrandModalOpen(true);
                }}
                className="inline-flex items-center gap-1.5 px-3.5 sm:px-4 py-2 bg-[#0F172A] text-white text-xs font-semibold rounded-xl hover:bg-[#1E293B] transition-all shadow-sm"
              >
                <Plus className="w-4 h-4" />
                <span>Add Collection</span>
              </button>
            )}

            {activeSection === "categories" && (
              <button
                onClick={() => {
                  setEditingCategory(undefined);
                  setCategoryModalOpen(true);
                }}
                className="inline-flex items-center gap-1.5 px-3.5 sm:px-4 py-2 bg-[#0F172A] text-white text-xs font-semibold rounded-xl hover:bg-[#1E293B] transition-all shadow-sm"
              >
                <Plus className="w-4 h-4" />
                <span>Add Category</span>
              </button>
            )}

            {activeSection === "promocodes" && (
              <button
                onClick={() => setPromoModalOpen(true)}
                className="inline-flex items-center gap-1.5 px-3.5 sm:px-4 py-2 bg-[#0F172A] text-white text-xs font-semibold rounded-xl hover:bg-[#1E293B] transition-all shadow-sm"
              >
                <Plus className="w-4 h-4" />
                <span>New Coupon</span>
              </button>
            )}

            {activeSection === "carousel" && (
              <button
                onClick={() => setSlideModalOpen(true)}
                className="inline-flex items-center gap-1.5 px-3.5 sm:px-4 py-2 bg-[#0F172A] text-white text-xs font-semibold rounded-xl hover:bg-[#1E293B] transition-all shadow-sm"
              >
                <Plus className="w-4 h-4" />
                <span>Add Slide</span>
              </button>
            )}

            {activeSection === "users" && (
              <button
                onClick={exportUsersCSV}
                className="inline-flex items-center gap-1.5 px-3.5 sm:px-4 py-2 bg-emerald-700 text-white text-xs font-semibold rounded-xl hover:bg-emerald-800 transition-all shadow-sm"
              >
                <Download className="w-4 h-4" />
                <span>Export CSV</span>
              </button>
            )}
          </div>
        </header>

        {/* Main Body Content */}
        <div className="p-3.5 sm:p-6 lg:p-8 space-y-6">
          {/* ═════════ 1. PRODUCTS SECTION ═════════ */}
          {activeSection === "products" && (
            <div className="space-y-5">
              {/* Stat Highlights */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
                <StatCard label="Catalog Designs" value={products.length} icon={ShoppingBag} color="text-indigo-600 bg-indigo-50" />
                <StatCard
                  label="In Stock"
                  value={products.filter((p) => p.stock > 0).length}
                  icon={CheckCircle2}
                  color="text-emerald-600 bg-emerald-50"
                />
                <StatCard
                  label="Low Stock (≤5)"
                  value={products.filter((p) => p.stock <= 5).length}
                  icon={AlertTriangle}
                  color="text-amber-600 bg-amber-50"
                />
                <StatCard
                  label="Featured / VIP"
                  value={products.filter((p) => p.featured || p.is_bestseller).length}
                  icon={Sparkles}
                  color="text-purple-600 bg-purple-50"
                />
              </div>

              {/* Data Table Container */}
              <div className="bg-white rounded-2xl border border-[#E2E8F0] shadow-xs overflow-hidden">
                {/* Search & Filter Bar */}
                <div className="p-3.5 sm:p-4 border-b border-[#E2E8F0] flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
                  <div className="relative flex-1 min-w-[200px] max-w-md">
                    <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-[#94A3B8]" />
                    <input
                      type="text"
                      placeholder="Search design title, SKU, fabric..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full pl-9 pr-4 py-2 border border-[#CBD5E1] rounded-xl text-xs outline-none focus:border-[#0F172A] transition-all bg-[#F8FAFC]"
                    />
                  </div>

                  <div className="flex items-center gap-2">
                    <select
                      value={selectedCategory}
                      onChange={(e) => setSelectedCategory(e.target.value)}
                      className="flex-1 sm:flex-initial px-3 py-2 border border-[#CBD5E1] rounded-xl text-xs text-[#334155] outline-none bg-white font-medium"
                    >
                      <option value="all">All Categories</option>
                      {categories.map((c) => (
                        <option key={c.slug} value={c.slug}>
                          {c.name}
                        </option>
                      ))}
                    </select>

                    <select
                      value={stockFilter}
                      onChange={(e) => setStockFilter(e.target.value)}
                      className="flex-1 sm:flex-initial px-3 py-2 border border-[#CBD5E1] rounded-xl text-xs text-[#334155] outline-none bg-white font-medium"
                    >
                      <option value="all">All Stock</option>
                      <option value="in_stock">In Stock ({">"}0)</option>
                      <option value="low_stock">Low Stock (≤5)</option>
                      <option value="out_of_stock">Out of Stock (0)</option>
                    </select>
                  </div>
                </div>

                {/* Table */}
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs min-w-[640px]">
                    <thead className="bg-[#F8FAFC] text-[#64748B] font-semibold border-b border-[#E2E8F0]">
                      <tr>
                        <th className="py-3.5 px-4 sm:px-6">Preview</th>
                        <th className="py-3.5 px-4 sm:px-6">Product Title & SKU</th>
                        <th className="py-3.5 px-4 sm:px-6">Price</th>
                        <th className="py-3.5 px-4 sm:px-6">Stock</th>
                        <th className="py-3.5 px-4 sm:px-6">Category</th>
                        <th className="py-3.5 px-4 sm:px-6 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#F1F5F9]">
                      {filteredProducts.length === 0 ? (
                        <tr>
                          <td colSpan={6} className="py-12 text-center text-[#94A3B8]">
                            No products match your search query.
                          </td>
                        </tr>
                      ) : (
                        filteredProducts.map((product) => {
                          const mainImg = product.images?.[0] || "/products/classic-noir-abaya/image-1.jpg";
                          return (
                            <tr key={product.id} className="hover:bg-[#F8FAFC] transition-colors group">
                              <td className="py-3 px-4 sm:px-6">
                                <div className="w-12 h-14 rounded-xl bg-gray-100 border border-[#E2E8F0] overflow-hidden flex-shrink-0 relative shadow-2xs">
                                  {/* eslint-disable-next-line @next/next/no-img-element */}
                                  <img src={mainImg} alt={product.name} className="w-full h-full object-cover" />
                                  {product.images.length > 1 && (
                                    <span className="absolute bottom-0.5 right-0.5 bg-black/75 text-white text-[9px] px-1 rounded font-mono font-bold">
                                      +{product.images.length - 1}
                                    </span>
                                  )}
                                </div>
                              </td>
                              <td className="py-3 px-4 sm:px-6">
                                <div className="flex flex-col">
                                  <span className="text-sm font-semibold text-[#0F172A] group-hover:text-purple-700 transition-colors">
                                    {product.name}
                                  </span>
                                  <div className="flex items-center gap-1.5 mt-0.5 flex-wrap">
                                    <span className="text-[11px] font-mono text-[#94A3B8]">
                                      SKU: {product.sku || product.slug}
                                    </span>
                                    {product.is_bestseller && (
                                      <span className="text-[9px] font-bold uppercase tracking-wider bg-amber-100 text-amber-800 px-1.5 py-0.2 rounded">
                                        Bestseller
                                      </span>
                                    )}
                                    {product.featured && (
                                      <span className="text-[9px] font-bold uppercase tracking-wider bg-purple-100 text-purple-800 px-1.5 py-0.2 rounded">
                                        Featured
                                      </span>
                                    )}
                                  </div>
                                </div>
                              </td>
                              <td className="py-3 px-4 sm:px-6">
                                <div className="font-semibold font-mono text-[#0F172A] text-sm">
                                  {formatPKR(product.price)}
                                </div>
                                {product.original_price && product.original_price > product.price && (
                                  <span className="line-through text-[11px] text-[#94A3B8] font-mono block">
                                    {formatPKR(product.original_price)}
                                  </span>
                                )}
                              </td>
                              <td className="py-3 px-4 sm:px-6">
                                <div className="inline-flex items-center gap-2">
                                  <input
                                    type="number"
                                    defaultValue={product.stock}
                                    onBlur={(e) => handleInlineStock(product.id, Number(e.target.value))}
                                    className="w-16 px-2 py-1 border border-[#CBD5E1] rounded-lg text-center font-mono text-xs focus:border-[#0F172A] outline-none"
                                  />
                                  <span
                                    className={`w-2 h-2 rounded-full ${
                                      product.stock > 5
                                        ? "bg-emerald-500"
                                        : product.stock > 0
                                        ? "bg-amber-500"
                                        : "bg-red-500"
                                    }`}
                                  />
                                </div>
                              </td>
                              <td className="py-3 px-4 sm:px-6">
                                <span className="inline-block px-2.5 py-0.5 bg-[#F1F5F9] text-[#334155] font-semibold rounded-full text-[11px] border border-[#E2E8F0]">
                                  {product.category}
                                </span>
                              </td>
                              <td className="py-3 px-4 sm:px-6 text-right">
                                <div className="flex items-center justify-end gap-1.5">
                                  <Link
                                    href={`/products/${product.slug}`}
                                    target="_blank"
                                    className="p-2 text-[#94A3B8] hover:text-[#0F172A] hover:bg-[#E2E8F0] rounded-lg transition-colors"
                                    title="View on store"
                                  >
                                    <Eye className="w-4 h-4" />
                                  </Link>
                                  <button
                                    onClick={() => {
                                      setEditingProduct(product);
                                      setProductModalOpen(true);
                                    }}
                                    className="p-2 text-[#94A3B8] hover:text-[#0F172A] hover:bg-[#E2E8F0] rounded-lg transition-colors"
                                    title="Edit design"
                                  >
                                    <Edit3 className="w-4 h-4" />
                                  </button>
                                  <button
                                    onClick={() => handleDeleteProduct(product.id, product.name)}
                                    className="p-2 text-[#94A3B8] hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                    title="Delete"
                                  >
                                    <Trash2 className="w-4 h-4" />
                                  </button>
                                </div>
                              </td>
                            </tr>
                          );
                        })
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* ═════════ 2. ORDERS SECTION ═════════ */}
          {activeSection === "orders" && (
            <div className="space-y-5">
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
                <StatCard label="Total Revenue" value={formatPKR(totalRevenue)} icon={DollarSign} color="text-emerald-600 bg-emerald-50" />
                <StatCard label="All Orders" value={orders.length} icon={Package} color="text-blue-600 bg-blue-50" />
                <StatCard
                  label="Processing"
                  value={orders.filter((o) => o.status === "placed" || o.status === "processing").length}
                  icon={Clock}
                  color="text-amber-600 bg-amber-50"
                />
                <StatCard
                  label="Delivered"
                  value={orders.filter((o) => o.status === "delivered").length}
                  icon={PackageCheck}
                  color="text-purple-600 bg-purple-50"
                />
              </div>

              {/* Order Search */}
              <div className="bg-white p-3.5 sm:p-4 rounded-2xl border border-[#E2E8F0] shadow-xs flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
                <div className="relative flex-1 min-w-[200px] max-w-md">
                  <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-[#94A3B8]" />
                  <input
                    type="text"
                    placeholder="Search customer name, phone, order ID..."
                    value={orderSearch}
                    onChange={(e) => setOrderSearch(e.target.value)}
                    className="w-full pl-9 pr-4 py-2 border border-[#CBD5E1] rounded-xl text-xs outline-none focus:border-[#0F172A] bg-[#F8FAFC]"
                  />
                </div>

                <select
                  value={orderStatusFilter}
                  onChange={(e) => setOrderStatusFilter(e.target.value)}
                  className="px-3 py-2 border border-[#CBD5E1] rounded-xl text-xs text-[#334155] outline-none bg-white font-medium"
                >
                  <option value="all">All Order Statuses</option>
                  {ALL_STATUSES.map((s) => (
                    <option key={s} value={s}>
                      {STATUS_CONFIG[s].label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Orders List */}
              <div className="space-y-3">
                {filteredOrders.length === 0 ? (
                  <div className="bg-white rounded-2xl border border-[#E2E8F0] p-12 text-center text-[#94A3B8]">
                    No orders match your criteria.
                  </div>
                ) : (
                  filteredOrders.map((order) => (
                    <OrderCard
                      key={order.id}
                      order={order}
                      onStatusChange={handleOrderStatus}
                      onPrint={() => setInvoiceOrder(order)}
                    />
                  ))
                )}
              </div>
            </div>
          )}

          {/* ═════════ 3. BRANDS & COLLECTIONS ═════════ */}
          {activeSection === "brands" && (
            <div className="space-y-5">
              <div className="bg-white p-4 sm:p-6 rounded-2xl border border-[#E2E8F0] shadow-xs">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 mb-6">
                  <div>
                    <h3 className="font-serif font-bold text-lg text-[#0F172A]">Curated Capsule Collections</h3>
                    <p className="text-xs text-[#64748B]">Manage lookbooks and seasonal themes shown across the store</p>
                  </div>
                  <button
                    onClick={() => {
                      setEditingBrand(undefined);
                      setBrandModalOpen(true);
                    }}
                    className="px-4 py-2 bg-[#0F172A] text-white text-xs font-semibold rounded-xl hover:bg-[#1E293B] shadow-sm flex items-center gap-1.5"
                  >
                    <Plus className="w-4 h-4" />
                    New Collection
                  </button>
                </div>

                <div className="grid sm:grid-cols-2 gap-4">
                  {brands.map((col) => (
                    <div key={col.id} className="p-4 border border-[#E2E8F0] rounded-2xl flex gap-4 items-center bg-[#F8FAFC] hover:border-[#CBD5E1] transition-all group">
                      <div className="w-20 h-24 rounded-xl overflow-hidden bg-gray-200 flex-shrink-0 border border-[#E2E8F0]">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={col.image} alt={col.name} className="w-full h-full object-cover" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <h4 className="font-serif font-bold text-base text-[#0F172A]">{col.name}</h4>
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${col.featured ? "bg-purple-100 text-purple-800" : "bg-gray-200 text-gray-600"}`}>
                            {col.featured ? "Featured" : "Standard"}
                          </span>
                        </div>
                        <p className="text-xs text-[#64748B] line-clamp-2 mt-1">{col.tagline}</p>
                        <div className="flex items-center justify-between mt-3 pt-2 border-t border-[#E2E8F0]">
                          <span className="text-[11px] font-semibold text-purple-700">
                            {col.itemCount} Designs Included
                          </span>
                          <div className="flex items-center gap-1">
                            <button
                              onClick={() => handleToggleBrandFeatured(col.id)}
                              className="px-2 py-1 text-[10px] font-semibold border border-[#CBD5E1] rounded-lg hover:bg-white transition-colors"
                            >
                              Toggle
                            </button>
                            <button
                              onClick={() => {
                                setEditingBrand(col);
                                setBrandModalOpen(true);
                              }}
                              className="p-1.5 text-[#64748B] hover:text-[#0F172A] hover:bg-white rounded-lg transition-colors"
                            >
                              <Edit3 className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => handleDeleteBrand(col.id, col.name)}
                              className="p-1.5 text-[#64748B] hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* ═════════ 4. CATEGORIES ═════════ */}
          {activeSection === "categories" && (
            <div className="space-y-5">
              <div className="bg-white p-4 sm:p-6 rounded-2xl border border-[#E2E8F0] shadow-xs">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 mb-6">
                  <div>
                    <h3 className="font-serif font-bold text-lg text-[#0F172A]">Store Categories & Filters</h3>
                    <p className="text-xs text-[#64748B]">Add or edit primary department classifications</p>
                  </div>
                  <button
                    onClick={() => {
                      setEditingCategory(undefined);
                      setCategoryModalOpen(true);
                    }}
                    className="px-4 py-2 bg-[#0F172A] text-white text-xs font-semibold rounded-xl hover:bg-[#1E293B] shadow-sm flex items-center gap-1.5"
                  >
                    <Plus className="w-4 h-4" />
                    New Category
                  </button>
                </div>

                <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {categories.map((cat) => {
                    const count = products.filter((p) => p.category === cat.slug).length;
                    return (
                      <div key={cat.id} className="p-5 border border-[#E2E8F0] rounded-2xl bg-[#F8FAFC] hover:border-[#CBD5E1] transition-all flex flex-col justify-between">
                        <div>
                          <div className="flex items-center justify-between mb-2">
                            <span className="font-serif font-bold text-base text-[#0F172A]">{cat.name}</span>
                            <span className="text-xs font-bold px-2.5 py-0.5 bg-white border border-[#E2E8F0] rounded-full text-[#334155]">
                              {count} Items
                            </span>
                          </div>
                          <p className="text-xs text-[#64748B] mb-3 leading-relaxed">{cat.description}</p>
                          <code className="text-[10px] font-mono text-purple-700 bg-purple-50 px-2 py-1 rounded-md block w-fit">
                            /products?category={cat.slug}
                          </code>
                        </div>

                        <div className="flex justify-end gap-1.5 mt-4 pt-3 border-t border-[#E2E8F0]">
                          <button
                            onClick={() => {
                              setEditingCategory(cat);
                              setCategoryModalOpen(true);
                            }}
                            className="px-2.5 py-1 text-xs font-semibold text-[#334155] bg-white border border-[#CBD5E1] rounded-lg hover:bg-gray-50 flex items-center gap-1"
                          >
                            <Edit3 className="w-3.5 h-3.5" /> Edit
                          </button>
                          <button
                            onClick={() => handleDeleteCategory(cat.id, cat.name)}
                            className="p-1.5 text-[#94A3B8] hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* ═════════ 5. PROMOCODES ═════════ */}
          {activeSection === "promocodes" && (
            <div className="space-y-5">
              {/* Tester Bar */}
              <div className="bg-gradient-to-r from-purple-950 via-slate-900 to-indigo-950 text-white p-5 rounded-2xl shadow-sm space-y-3 border border-purple-900/50">
                <div className="flex items-center gap-2">
                  <Percent className="w-5 h-5 text-purple-300" />
                  <h3 className="font-semibold text-sm sm:text-base">Live Discount Code Simulator</h3>
                </div>
                <div className="flex flex-wrap gap-2.5 items-center text-xs">
                  <input
                    type="text"
                    placeholder="Coupon Code..."
                    value={testCodeInput}
                    onChange={(e) => setTestCodeInput(e.target.value)}
                    className="px-3.5 py-2 rounded-xl text-black font-mono font-bold uppercase outline-none bg-white"
                  />
                  <input
                    type="number"
                    placeholder="Cart Total (PKR)"
                    value={testAmountInput}
                    onChange={(e) => setTestAmountInput(Number(e.target.value))}
                    className="px-3.5 py-2 rounded-xl text-black font-mono outline-none bg-white w-32"
                  />
                  <button
                    onClick={handleTestPromo}
                    className="px-4 py-2 bg-purple-600 text-white font-bold rounded-xl hover:bg-purple-500 transition-colors"
                  >
                    Test Discount
                  </button>
                  {testResult && (
                    <span className="font-medium bg-black/60 text-white px-3 py-1.5 rounded-xl border border-white/20 text-xs">
                      {testResult}
                    </span>
                  )}
                </div>
              </div>

              {/* Coupons List */}
              <div className="bg-white rounded-2xl border border-[#E2E8F0] p-4 sm:p-6 shadow-xs">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="font-serif font-bold text-base text-[#0F172A]">Active Promo Codes & Vouchers</h3>
                    <p className="text-xs text-[#64748B]">Discount codes redeemable at checkout</p>
                  </div>
                  <button
                    onClick={() => setPromoModalOpen(true)}
                    className="px-4 py-2 bg-[#0F172A] text-white text-xs font-semibold rounded-xl hover:bg-[#1E293B]"
                  >
                    + Create Coupon
                  </button>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs min-w-[550px]">
                    <thead className="bg-[#F8FAFC] text-[#64748B] font-semibold border-b border-[#E2E8F0]">
                      <tr>
                        <th className="py-3 px-4">Coupon Code</th>
                        <th className="py-3 px-4">Discount</th>
                        <th className="py-3 px-4">Min. Spend</th>
                        <th className="py-3 px-4">Uses</th>
                        <th className="py-3 px-4">Expires</th>
                        <th className="py-3 px-4">Status</th>
                        <th className="py-3 px-4 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#F1F5F9]">
                      {promocodes.map((promo) => (
                        <tr key={promo.id} className="hover:bg-[#F8FAFC]">
                          <td className="py-3.5 px-4 font-mono font-bold text-sm text-[#0F172A]">
                            <span className="px-2.5 py-1 bg-purple-50 text-purple-800 border border-purple-200 rounded-lg">
                              {promo.code}
                            </span>
                          </td>
                          <td className="py-3.5 px-4 font-bold text-emerald-700">
                            {promo.type === "percentage" ? `${promo.value}% OFF` : `Rs. ${promo.value} FLAT`}
                          </td>
                          <td className="py-3.5 px-4 font-mono">{formatPKR(promo.min_order)}</td>
                          <td className="py-3.5 px-4 text-[#64748B]">
                            {promo.used_count} / {promo.max_uses}
                          </td>
                          <td className="py-3.5 px-4 text-[#64748B]">{promo.expires_at}</td>
                          <td className="py-3.5 px-4">
                            <button
                              onClick={() => handleTogglePromo(promo.id)}
                              className={`px-2.5 py-1 rounded-full text-[11px] font-bold transition-colors ${
                                promo.active
                                  ? "bg-emerald-100 text-emerald-800"
                                  : "bg-gray-100 text-gray-500"
                              }`}
                            >
                              {promo.active ? "Active" : "Disabled"}
                            </button>
                          </td>
                          <td className="py-3.5 px-4 text-right">
                            <button
                              onClick={() => handleDeletePromo(promo.id)}
                              className="p-1.5 text-[#94A3B8] hover:text-red-600 rounded-lg transition-colors"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* ═════════ 6. CAROUSEL SECTION ═════════ */}
          {activeSection === "carousel" && (
            <div className="space-y-5">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 bg-white p-4 sm:p-6 rounded-2xl border border-[#E2E8F0] shadow-xs">
                <div>
                  <h3 className="font-serif font-bold text-base text-[#0F172A]">Homepage Hero Slides</h3>
                  <p className="text-xs text-[#64748B]">Dynamic high-impact visual banners on storefront entry</p>
                </div>
                <button
                  onClick={() => setSlideModalOpen(true)}
                  className="px-4 py-2 bg-[#0F172A] text-white text-xs font-semibold rounded-xl hover:bg-[#1E293B]"
                >
                  + Add Slide
                </button>
              </div>

              <div className="grid sm:grid-cols-2 gap-4">
                {slides.map((slide, idx) => (
                  <div key={slide.id} className="bg-white rounded-2xl border border-[#E2E8F0] overflow-hidden shadow-xs">
                    <div className="h-48 bg-[#0F172A] relative overflow-hidden">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={slide.image} alt={slide.title} className="w-full h-full object-cover opacity-70" />
                      <div className="absolute inset-0 p-4 flex flex-col justify-between bg-gradient-to-t from-black/85 via-black/40 to-transparent text-white">
                        <span className="text-[10px] font-bold tracking-widest uppercase bg-white/20 backdrop-blur-md px-2 py-0.5 rounded w-fit">
                          Slide #{idx + 1} · {slide.badge}
                        </span>
                        <div>
                          <p className="text-xs text-[#CBD5E1] tracking-wider uppercase">{slide.subtitle}</p>
                          <h4 className="text-base sm:text-lg font-serif font-bold">{slide.title}</h4>
                        </div>
                      </div>
                    </div>
                    <div className="p-3.5 flex items-center justify-between text-xs border-t border-[#E2E8F0]">
                      <button
                        onClick={() => handleToggleSlide(slide.id)}
                        className={`px-3 py-1 rounded-full text-xs font-bold ${
                          slide.active ? "bg-emerald-100 text-emerald-800" : "bg-gray-100 text-gray-500"
                        }`}
                      >
                        {slide.active ? "Visible on Store" : "Hidden"}
                      </button>
                      <button
                        onClick={() => handleDeleteSlide(slide.id)}
                        className="p-1.5 text-[#94A3B8] hover:text-red-600 rounded-lg"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ═════════ 7. BANNERS SECTION ═════════ */}
          {activeSection === "banners" && (
            <div className="space-y-5">
              <div className="bg-white p-4 sm:p-6 rounded-2xl border border-[#E2E8F0] shadow-xs space-y-4">
                <div>
                  <h3 className="font-serif font-bold text-base text-[#0F172A]">Top Announcement Ticker & Badges</h3>
                  <p className="text-xs text-[#64748B]">Notice banners shown across the top navigation</p>
                </div>
                <div className="space-y-3">
                  {banners.map((b) => (
                    <div key={b.id} className="p-4 border border-[#E2E8F0] rounded-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 bg-[#F8FAFC]">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-semibold text-sm text-[#0F172A]">{b.title}</span>
                          <span className="text-[10px] font-mono uppercase bg-blue-100 text-blue-700 px-2 py-0.5 rounded">
                            {b.type}
                          </span>
                        </div>
                        <p className="text-xs text-[#475569]">{b.text}</p>
                      </div>
                      <button
                        onClick={() => handleToggleBanner(b.id)}
                        className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                          b.active ? "bg-emerald-600 text-white shadow-sm" : "bg-gray-200 text-gray-600"
                        }`}
                      >
                        {b.active ? "Active" : "Disabled"}
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* ═════════ 8. USERS SECTION ═════════ */}
          {activeSection === "users" && (
            <div className="space-y-5">
              <div className="bg-white rounded-2xl border border-[#E2E8F0] shadow-xs overflow-hidden">
                <div className="p-4 sm:p-6 border-b border-[#E2E8F0] flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                  <div>
                    <h3 className="font-serif font-bold text-base text-[#0F172A]">Customer Profiles</h3>
                    <p className="text-xs text-[#64748B]">Customer accounts, purchase frequency, and lifetime spend</p>
                  </div>
                  <button
                    onClick={exportUsersCSV}
                    className="px-4 py-2 bg-emerald-700 text-white text-xs font-semibold rounded-xl hover:bg-emerald-800 flex items-center gap-1.5 shadow-sm"
                  >
                    <Download className="w-4 h-4" /> Export CSV
                  </button>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs min-w-[550px]">
                    <thead className="bg-[#F8FAFC] text-[#64748B] font-semibold border-b border-[#E2E8F0]">
                      <tr>
                        <th className="py-3.5 px-4 sm:px-6">Customer Name</th>
                        <th className="py-3.5 px-4 sm:px-6">Phone Number</th>
                        <th className="py-3.5 px-4 sm:px-6">City</th>
                        <th className="py-3.5 px-4 sm:px-6">Total Orders</th>
                        <th className="py-3.5 px-4 sm:px-6">Lifetime Spend</th>
                        <th className="py-3.5 px-4 sm:px-6">Joined</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#F1F5F9]">
                      {users.map((u) => (
                        <tr key={u.id} className="hover:bg-[#F8FAFC]">
                          <td className="py-3.5 px-4 sm:px-6 font-semibold text-[#0F172A]">{u.full_name}</td>
                          <td className="py-3.5 px-4 sm:px-6 text-[#64748B] font-mono">{u.phone}</td>
                          <td className="py-3.5 px-4 sm:px-6 text-[#64748B]">{u.city}</td>
                          <td className="py-3.5 px-4 sm:px-6 font-bold">{u.total_orders}</td>
                          <td className="py-3.5 px-4 sm:px-6 font-mono font-bold text-emerald-700">
                            {formatPKR(u.total_spent)}
                          </td>
                          <td className="py-3.5 px-4 sm:px-6 text-[#94A3B8]">{formatDate(u.created_at)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* ═════════ 9. ROLES & SECURITY ═════════ */}
          {activeSection === "roles" && (
            <div className="space-y-5 max-w-3xl">
              <div className="bg-white p-4 sm:p-6 rounded-2xl border border-[#E2E8F0] shadow-xs space-y-4">
                <div className="flex items-center gap-3">
                  <ShieldCheck className="w-6 h-6 text-purple-600" />
                  <div>
                    <h3 className="font-serif font-bold text-base text-[#0F172A]">Master Admin Password</h3>
                    <p className="text-xs text-[#64748B]">Update store admin key</p>
                  </div>
                </div>

                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    const input = (e.currentTarget.elements.namedItem("pw") as HTMLInputElement).value;
                    if (input.length < 6) {
                      toast.error("Password must be at least 6 characters");
                      return;
                    }
                    localStorage.setItem("amabaya_admin_custom_pw", input);
                    setAdminPassword(input);
                    toast.success("Admin password updated!");
                  }}
                  className="space-y-3 pt-2"
                >
                  <div>
                    <label className="block text-xs font-bold text-[#334155] mb-1 uppercase tracking-wider">
                      Master Key
                    </label>
                    <input
                      name="pw"
                      type="text"
                      defaultValue={adminPassword}
                      className="w-full max-w-md px-4 py-2.5 border border-[#CBD5E1] rounded-xl text-xs font-mono outline-none focus:border-[#0F172A]"
                    />
                  </div>
                  <button
                    type="submit"
                    className="px-5 py-2.5 bg-[#0F172A] text-white text-xs font-bold rounded-xl hover:bg-[#1E293B] shadow-sm"
                  >
                    Save Master Key
                  </button>
                </form>
              </div>

              <div className="bg-white p-4 sm:p-6 rounded-2xl border border-[#E2E8F0] shadow-xs space-y-3 text-xs">
                <h4 className="font-serif font-bold text-sm text-[#0F172A]">System Architecture</h4>
                <div className="grid sm:grid-cols-2 gap-3">
                  <div className="p-3 border border-emerald-200 bg-emerald-50 rounded-xl">
                    <p className="font-bold text-emerald-800 flex items-center gap-1.5">
                      <CheckCircle className="w-4 h-4" /> Supabase Storage & DB
                    </p>
                    <p className="text-emerald-700 text-[11px]">Real-time synchronization enabled</p>
                  </div>
                  <div className="p-3 border border-purple-200 bg-purple-50 rounded-xl">
                    <p className="font-bold text-purple-800 flex items-center gap-1.5">
                      <CheckCircle className="w-4 h-4" /> GoPayFast Payment Gateway
                    </p>
                    <p className="text-purple-700 text-[11px]">Pakistani Payment Rails Active</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ═════════ 10. DOCS & CHANGELOG ═════════ */}
          {activeSection === "documentation" && (
            <div className="bg-white p-6 sm:p-8 rounded-2xl border border-[#E2E8F0] shadow-xs max-w-4xl space-y-4 text-xs text-[#334155]">
              <h3 className="text-xl font-serif font-bold text-[#0F172A]">AMabaya Haute Modesty Studio Manual</h3>
              <p className="leading-relaxed">
                Welcome to the updated AMabaya Control Suite. Every product change, stock adjustment, image upload, or discount code created here takes immediate effect across the entire website.
              </p>
              <div className="p-4 bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl space-y-2">
                <p className="font-bold text-[#0F172A]">Image Upload Guide:</p>
                <p>• You can upload photos directly from your phone camera or computer files.</p>
                <p>• You can also paste external image URLs or pick curated store sample presets with 1 click.</p>
                <p>• Drag or click &ldquo;Set as Cover&rdquo; to choose which photo is the primary storefront thumbnail.</p>
              </div>
            </div>
          )}

          {activeSection === "changelog" && (
            <div className="bg-white p-6 rounded-2xl border border-[#E2E8F0] shadow-xs max-w-3xl space-y-4 text-xs">
              <div className="flex items-center justify-between border-b border-[#E2E8F0] pb-4">
                <h3 className="font-serif font-bold text-base text-[#0F172A]">System Activity Audit</h3>
                <span className="px-3 py-1 bg-purple-100 text-purple-800 text-xs font-bold rounded-full font-mono">
                  v15.0 Mobile & Studio Upgrade
                </span>
              </div>
              <div className="space-y-2">
                <div className="p-3 border-l-2 border-emerald-500 bg-[#F8FAFC] rounded-r-xl">
                  <p className="font-bold text-[#0F172A]">Luxury Image Studio & Mobile Drawer</p>
                  <p className="text-[#64748B]">Integrated multi-image device file upload, preset selectors, cover badge manager, and responsive mobile sidebar drawer.</p>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>

      {/* ─── MODALS ───────────────────────────────────────────────────────────── */}
      {productModalOpen && (
        <ProductFormModal
          initial={editingProduct}
          categories={categories.map((c) => c.slug)}
          onSave={handleSaveProduct}
          onClose={() => {
            setProductModalOpen(false);
            setEditingProduct(undefined);
          }}
        />
      )}

      {brandModalOpen && (
        <BrandModal
          initial={editingBrand}
          onSave={handleSaveBrand}
          onClose={() => {
            setBrandModalOpen(false);
            setEditingBrand(undefined);
          }}
        />
      )}

      {categoryModalOpen && (
        <CategoryModal
          initial={editingCategory}
          onSave={handleSaveCategory}
          onClose={() => {
            setCategoryModalOpen(false);
            setEditingCategory(undefined);
          }}
        />
      )}

      {promoModalOpen && (
        <PromoModal
          onSave={(item) => {
            const updated = [item, ...promocodes];
            setPromocodes(updated);
            localStorage.setItem("amabaya_promocodes", JSON.stringify(updated));
            notifyStoreUpdate();
            setPromoModalOpen(false);
            toast.success(`Coupon ${item.code} created!`);
          }}
          onClose={() => setPromoModalOpen(false)}
        />
      )}

      {slideModalOpen && (
        <SlideModal
          onSave={(item) => {
            const updated = [...slides, item];
            setSlides(updated);
            localStorage.setItem("amabaya_slides", JSON.stringify(updated));
            notifyStoreUpdate();
            setSlideModalOpen(false);
            toast.success("Hero slide created!");
          }}
          onClose={() => setSlideModalOpen(false)}
        />
      )}

      {invoiceOrder && <InvoiceModal order={invoiceOrder} onClose={() => setInvoiceOrder(null)} />}
    </div>
  );
}

// ─── Sidebar Item ─────────────────────────────────────────────────────────────
function SidebarItem({
  icon: Icon,
  label,
  count,
  badge,
  active,
  onClick,
}: {
  icon: React.ElementType;
  label: string;
  count?: number;
  badge?: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-medium transition-all ${
        active
          ? "bg-[#1E293B] text-white font-bold shadow-xs ring-1 ring-white/10"
          : "text-[#94A3B8] hover:text-white hover:bg-[#1E293B]/60"
      }`}
    >
      <div className="flex items-center gap-3">
        <Icon className={`w-4 h-4 ${active ? "text-purple-400" : "text-[#64748B]"}`} />
        <span>{label}</span>
      </div>
      {count !== undefined && (
        <span className={`text-[10px] font-mono px-2 py-0.5 rounded-full ${active ? "bg-purple-950 text-purple-300 border border-purple-800" : "text-[#64748B]"}`}>
          {count}
        </span>
      )}
      {badge && (
        <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-[#334155] text-[#CBD5E1]">
          {badge}
        </span>
      )}
    </button>
  );
}

// ─── Stat Card ────────────────────────────────────────────────────────────────
function StatCard({
  label,
  value,
  icon: Icon,
  color,
}: {
  label: string;
  value: string | number;
  icon: React.ElementType;
  color: string;
}) {
  return (
    <div className="bg-white rounded-2xl border border-[#E2E8F0] p-4 sm:p-5 flex items-center gap-3 sm:gap-4 shadow-xs">
      <div className={`w-10 h-10 sm:w-12 sm:h-12 rounded-xl flex items-center justify-center flex-shrink-0 ${color}`}>
        <Icon className="w-5 h-5 sm:w-6 sm:h-6" />
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-xl sm:text-2xl font-serif font-bold text-[#0F172A] tracking-tight truncate">{value}</p>
        <p className="text-[11px] sm:text-xs text-[#64748B] font-medium mt-0.5 truncate">{label}</p>
      </div>
    </div>
  );
}

// ─── Order Row Card ───────────────────────────────────────────────────────────
function OrderCard({
  order,
  onStatusChange,
  onPrint,
}: {
  order: Order;
  onStatusChange: (id: string, status: OrderStatus, tracking?: string) => Promise<void>;
  onPrint: () => void;
}) {
  const [expanded, setExpanded] = useState(false);
  const [tracking, setTracking] = useState(order.tracking_code ?? "");
  const [updating, setUpdating] = useState(false);
  const cfg = STATUS_CONFIG[order.status] ?? STATUS_CONFIG.placed;
  const Icon = cfg.icon;

  const handleStatus = async (status: OrderStatus) => {
    setUpdating(true);
    await onStatusChange(order.id, status, tracking);
    setUpdating(false);
  };

  return (
    <div className="bg-white rounded-2xl border border-[#E2E8F0] overflow-hidden shadow-xs">
      <div className="flex items-center gap-3 p-3.5 sm:p-4 flex-wrap">
        <button onClick={() => setExpanded(!expanded)} className="p-1 text-[#94A3B8] hover:text-[#0F172A]">
          <ChevronDown className={`w-4 h-4 transition-transform ${expanded ? "rotate-180" : ""}`} />
        </button>

        <div className="flex-1 min-w-[160px]">
          <div className="flex items-center gap-2">
            <span className="text-xs font-mono font-bold text-[#0F172A]">
              #{order.id.slice(0, 8).toUpperCase()}
            </span>
            <span className="text-[11px] text-[#64748B]">· {formatDate(order.placed_at)}</span>
          </div>
          <p className="text-sm font-semibold text-[#0F172A] truncate mt-0.5">
            {order.shipping_address?.fullName}
            <span className="text-[#94A3B8] font-normal ml-2 text-xs">
              {order.shipping_address?.city}
            </span>
          </p>
        </div>

        <p className="text-sm font-bold text-[#0F172A] font-mono">{formatPKR(order.total)}</p>

        <span className={`inline-flex items-center gap-1.5 text-xs font-bold px-2.5 py-1 rounded-full border ${cfg.bg} ${cfg.color}`}>
          <Icon className="w-3.5 h-3.5" />
          {cfg.label}
        </span>

        <select
          value={order.status}
          onChange={(e) => handleStatus(e.target.value as OrderStatus)}
          disabled={updating}
          className="text-xs border border-[#CBD5E1] rounded-lg px-2 py-1 outline-none bg-white font-medium hover:border-[#94A3B8]"
        >
          {ALL_STATUSES.map((s) => (
            <option key={s} value={s}>
              {STATUS_CONFIG[s].label}
            </option>
          ))}
        </select>

        <button
          onClick={onPrint}
          className="p-1.5 border border-[#E2E8F0] text-[#64748B] hover:text-[#0F172A] hover:bg-gray-50 rounded-lg transition-colors"
          title="Print Invoice / Receipt"
        >
          <Printer className="w-4 h-4" />
        </button>
      </div>

      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="border-t border-[#F1F5F9] p-4 sm:p-5 bg-[#F8FAFC] grid md:grid-cols-2 gap-5 text-xs"
          >
            <div>
              <p className="font-bold text-[#64748B] uppercase tracking-wider text-[10px] mb-3">Order Items</p>
              <div className="space-y-2">
                {order.order_items?.map((item) => (
                  <div key={item.id} className="flex items-center gap-3 bg-white p-2.5 rounded-xl border border-[#E2E8F0]">
                    <div className="w-10 h-12 rounded-lg bg-gray-100 overflow-hidden flex-shrink-0">
                      {item.product_snapshot?.images?.[0] && (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={item.product_snapshot.images[0]} alt="" className="w-full h-full object-cover" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-[#0F172A] truncate">{item.product_snapshot?.name}</p>
                      <p className="text-[11px] text-[#64748B]">
                        Size: {item.size || "Standard"} · Qty: {item.quantity}
                      </p>
                    </div>
                    <p className="font-bold font-mono">{formatPKR(item.unit_price * item.quantity)}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="space-y-4">
              <div className="bg-white p-3.5 rounded-xl border border-[#E2E8F0] space-y-1">
                <p className="font-bold text-[#64748B] uppercase tracking-wider text-[10px]">Customer Details</p>
                <p className="font-semibold text-[#0F172A]">{order.shipping_address?.fullName}</p>
                <p className="text-[#334155] flex items-center gap-1.5">
                  <Phone className="w-3 h-3 text-[#94A3B8]" />
                  <a href={`tel:${order.shipping_address?.phone}`} className="hover:underline">
                    {order.shipping_address?.phone}
                  </a>
                  <a
                    href={`https://wa.me/${order.shipping_address?.phone?.replace(/[^0-9]/g, "")}`}
                    target="_blank"
                    className="text-emerald-600 font-bold ml-2 hover:underline"
                  >
                    Direct WhatsApp
                  </a>
                </p>
                <p className="text-[#334155] flex items-start gap-1.5 mt-1">
                  <MapPin className="w-3 h-3 text-[#94A3B8] mt-0.5 flex-shrink-0" />
                  {order.shipping_address?.address}, {order.shipping_address?.city},{" "}
                  {order.shipping_address?.province}
                </p>
              </div>

              <div className="flex gap-2">
                <input
                  type="text"
                  value={tracking}
                  onChange={(e) => setTracking(e.target.value)}
                  placeholder="Courier tracking code (e.g. TCS-90182471)"
                  className="flex-1 px-3 py-2 border border-[#CBD5E1] rounded-xl text-xs outline-none bg-white font-mono"
                />
                <button
                  onClick={() => handleStatus(order.status)}
                  className="px-4 py-2 bg-[#0F172A] text-white text-xs font-bold rounded-xl hover:bg-[#1E293B]"
                >
                  Save
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ─── UPGRADED LUXURY & CLASSIC PRODUCT MODAL ──────────────────────────────────
const CURATED_IMAGE_PRESETS = [
  { label: "Classic Noir (Front)", url: "/products/classic-noir-abaya/image-1.jpg" },
  { label: "Classic Noir (Side)", url: "/products/classic-noir-abaya/image-2.jpg" },
  { label: "Classic Noir (Detail)", url: "/products/classic-noir-abaya/image-3.jpg" },
  { label: "Royal Zahra Kaftan", url: "/products/royal-zahra-kaftan/image-1.jpg" },
  { label: "Zahra Kaftan (Cuffs)", url: "/products/royal-zahra-kaftan/image-2.jpg" },
  { label: "Organza Scalloped Dupatta", url: "/products/pearl-embroidered-dupatta/image-1.jpg" },
];

const FABRIC_PRESETS = [
  "100% Premium Korean Nida",
  "Pure Banarsi Raw Silk & Zari",
  "Crystalline Sheer Organza",
  "Micro-Velvet 9000 Grade",
  "Pure Crinkle Chiffon",
  "Pure Crepe Silk & Marori",
  "Soft Nada Fabric",
];

const STANDARD_SIZES = ["XS", "S", "M", "L", "XL", "XXL", "Free Size (2.75 Yards)"];

function ProductFormModal({
  initial,
  categories,
  onSave,
  onClose,
}: {
  initial?: ProductRow;
  categories: string[];
  onSave: (data: ProductFormData) => Promise<void>;
  onClose: () => void;
}) {
  const [form, setForm] = useState<ProductFormData>(
    initial
      ? { ...initial }
      : {
          slug: "",
          name: "",
          category: categories[0] || "Abaya",
          price: 4500,
          original_price: 5500,
          description: "",
          long_description: "",
          images: ["/products/classic-noir-abaya/image-1.jpg"],
          sizes: [
            { label: "S", available: true },
            { label: "M", available: true },
            { label: "L", available: true },
            { label: "XL", available: true },
          ],
          stock: 10,
          is_new: true,
          is_bestseller: false,
          featured: true,
          tags: ["luxury", "abaya", "eid"],
          sku: "",
          material: "100% Premium Korean Nida",
          rating: 5,
          review_count: 1,
        }
  );

  const [saving, setSaving] = useState(false);
  const [imageUrlInput, setImageUrlInput] = useState("");
  const [tagInput, setTagInput] = useState("");
  const [customSizeInput, setCustomSizeInput] = useState("");
  const [dragOver, setDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const isEdit = !!initial;

  const set = (field: keyof ProductFormData, value: unknown) => {
    setForm((prev) => {
      const updated = { ...prev, [field]: value };
      if (field === "name" && !isEdit) {
        const slug = toSlug(value as string);
        updated.slug = slug;
        if (!prev.sku || prev.sku.startsWith("AMA-")) {
          updated.sku = `AMA-${slug.slice(0, 8).toUpperCase()}`;
        }
      }
      return updated;
    });
  };

  // Add Image via text input or pasted URLs (comma or newline separated)
  const handleAddImageUrl = () => {
    if (!imageUrlInput.trim()) {
      toast.error("Please enter a valid image URL or path");
      return;
    }
    const urls = imageUrlInput
      .split(/[\n,]+/)
      .map((u) => u.trim())
      .filter(Boolean);

    if (urls.length === 0) return;
    setForm((prev) => ({
      ...prev,
      images: Array.from(new Set([...prev.images, ...urls])),
    }));
    setImageUrlInput("");
    toast.success(urls.length > 1 ? `${urls.length} images added` : "Image added to gallery");
  };

  // Quick Preset Add
  const handleAddPreset = (url: string) => {
    setForm((prev) => {
      if (prev.images.includes(url)) {
        toast("Image is already in gallery", { icon: "ℹ️" });
        return prev;
      }
      toast.success("Preset image attached");
      return { ...prev, images: [...prev.images, url] };
    });
  };

  // Set cover photo (move to index 0)
  const handleSetCover = (index: number) => {
    if (index === 0) return;
    setForm((prev) => {
      const copy = [...prev.images];
      const [chosen] = copy.splice(index, 1);
      copy.unshift(chosen);
      return { ...prev, images: copy };
    });
    toast.success("Cover image updated");
  };

  // Handle local device image file uploads
  const handleFileUpload = (files: FileList | null) => {
    if (!files || files.length === 0) return;
    const validFiles = Array.from(files).filter((f) => f.type.startsWith("image/"));
    if (validFiles.length === 0) {
      toast.error("Please select valid image files (JPG, PNG, WEBP)");
      return;
    }

    let loadedCount = 0;
    validFiles.forEach((file) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const result = e.target?.result as string;
        if (result) {
          setForm((prev) => ({
            ...prev,
            images: [...prev.images, result],
          }));
          loadedCount++;
          if (loadedCount === validFiles.length) {
            toast.success(`${loadedCount} photo(s) uploaded successfully!`);
          }
        }
      };
      reader.readAsDataURL(file);
    });
  };

  // Toggle size availability or add standard size
  const toggleSize = (sizeLabel: string) => {
    setForm((prev) => {
      const exists = prev.sizes.find((s) => s.label.toLowerCase() === sizeLabel.toLowerCase());
      if (exists) {
        return {
          ...prev,
          sizes: prev.sizes.map((s) =>
            s.label.toLowerCase() === sizeLabel.toLowerCase()
              ? { ...s, available: !s.available }
              : s
          ),
        };
      }
      return {
        ...prev,
        sizes: [...prev.sizes, { label: sizeLabel, available: true }],
      };
    });
  };

  const handleAddCustomSize = () => {
    if (!customSizeInput.trim()) return;
    const label = customSizeInput.trim();
    if (!form.sizes.some((s) => s.label.toLowerCase() === label.toLowerCase())) {
      setForm((prev) => ({
        ...prev,
        sizes: [...prev.sizes, { label, available: true }],
      }));
      setCustomSizeInput("");
      toast.success(`Size "${label}" added`);
    }
  };

  // Tags
  const handleAddTag = () => {
    if (!tagInput.trim()) return;
    const newTags = tagInput
      .split(/[\n,]+/)
      .map((t) => t.trim().toLowerCase())
      .filter(Boolean);
    setForm((prev) => ({
      ...prev,
      tags: Array.from(new Set([...prev.tags, ...newTags])),
    }));
    setTagInput("");
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setForm((prev) => ({
      ...prev,
      tags: prev.tags.filter((t) => t !== tagToRemove),
    }));
  };

  // Calculate discount
  const discountPercent = useMemo(() => {
    if (form.original_price && form.original_price > form.price && form.price > 0) {
      return Math.round(((form.original_price - form.price) / form.original_price) * 100);
    }
    return null;
  }, [form.price, form.original_price]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim()) return toast.error("Product name is required");
    if (form.price <= 0) return toast.error("Price must be greater than 0");
    if (form.images.length === 0) return toast.error("Please add at least 1 product image");

    setSaving(true);
    await onSave(form);
    setSaving(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-xs p-2.5 sm:p-4 overflow-y-auto">
      <div className="bg-white w-full max-w-3xl rounded-3xl shadow-2xl my-4 sm:my-8 border border-[#E2E8F0] max-h-[92vh] flex flex-col overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 sm:px-8 sm:py-5 border-b border-[#E2E8F0] flex justify-between items-center bg-[#F8FAFC]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[#0F172A] text-amber-400 flex items-center justify-center shadow-xs">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-serif font-bold text-lg sm:text-xl text-[#0F172A]">
                {isEdit ? "Edit Haute Design" : "Publish New Store Design"}
              </h3>
              <p className="text-xs text-[#64748B]">
                {isEdit
                  ? `Refining catalog piece: ${form.name}`
                  : "Add an artisanal Abaya, Kaftan, Dupatta, or Ensembled Set"}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-[#94A3B8] hover:text-[#0F172A] hover:bg-gray-100 rounded-xl transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Form Body */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-5 sm:p-8 space-y-6 text-xs custom-scrollbar">
          {/* 1. Basic Information */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 pb-2 border-b border-[#E2E8F0]">
              <Crown className="w-4 h-4 text-purple-600" />
              <span className="font-serif font-bold text-sm text-[#0F172A]">Design Identity</span>
            </div>

            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className="block font-bold text-[#334155] mb-1.5">Product Title *</label>
                <input
                  type="text"
                  value={form.name}
                  onChange={(e) => set("name", e.target.value)}
                  placeholder="e.g. Classic Noir Korean Nida Abaya"
                  className="w-full px-3.5 py-2.5 border border-[#CBD5E1] rounded-xl outline-none focus:border-[#0F172A] transition-all font-medium text-[#0F172A]"
                  required
                />
              </div>

              <div>
                <label className="block font-bold text-[#334155] mb-1.5">Category *</label>
                <select
                  value={form.category}
                  onChange={(e) => set("category", e.target.value)}
                  className="w-full px-3.5 py-2.5 border border-[#CBD5E1] rounded-xl outline-none bg-white font-medium text-[#0F172A]"
                >
                  {categories.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                  <option value="Accessories">Accessories</option>
                  <option value="Set">Set</option>
                </select>
              </div>
            </div>

            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className="block font-bold text-[#334155] mb-1.5">Fabric & Material Specs</label>
                <select
                  value={form.material}
                  onChange={(e) => set("material", e.target.value)}
                  className="w-full px-3.5 py-2.5 border border-[#CBD5E1] rounded-xl outline-none bg-white font-medium text-[#0F172A]"
                >
                  {FABRIC_PRESETS.map((fab) => (
                    <option key={fab} value={fab}>
                      {fab}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-bold text-[#334155] mb-1.5">SKU / Product Code</label>
                <input
                  type="text"
                  value={form.sku}
                  onChange={(e) => set("sku", e.target.value)}
                  placeholder="e.g. AMA-NOIR-01"
                  className="w-full px-3.5 py-2.5 border border-[#CBD5E1] rounded-xl outline-none font-mono text-[#0F172A]"
                />
              </div>
            </div>
          </div>

          {/* 2. Pricing & Stock */}
          <div className="space-y-4 pt-2">
            <div className="flex items-center gap-2 pb-2 border-b border-[#E2E8F0]">
              <DollarSign className="w-4 h-4 text-emerald-600" />
              <span className="font-serif font-bold text-sm text-[#0F172A]">Pricing & Inventory</span>
            </div>

            <div className="grid sm:grid-cols-3 gap-4">
              <div>
                <label className="block font-bold text-[#334155] mb-1.5">Sale Price (PKR) *</label>
                <input
                  type="number"
                  value={form.price || ""}
                  onChange={(e) => set("price", Number(e.target.value))}
                  placeholder="4500"
                  className="w-full px-3.5 py-2.5 border border-[#CBD5E1] rounded-xl outline-none font-mono text-sm font-bold text-[#0F172A]"
                  required
                />
              </div>

              <div>
                <div className="flex justify-between items-center mb-1.5">
                  <label className="font-bold text-[#334155]">Original Price (PKR)</label>
                  {discountPercent !== null && (
                    <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-800">
                      {discountPercent}% OFF
                    </span>
                  )}
                </div>
                <input
                  type="number"
                  value={form.original_price || ""}
                  onChange={(e) => set("original_price", e.target.value ? Number(e.target.value) : undefined)}
                  placeholder="5500 (Leave empty if no discount)"
                  className="w-full px-3.5 py-2.5 border border-[#CBD5E1] rounded-xl outline-none font-mono text-sm text-[#64748B]"
                />
              </div>

              <div>
                <label className="block font-bold text-[#334155] mb-1.5">Available Stock *</label>
                <input
                  type="number"
                  value={form.stock}
                  onChange={(e) => set("stock", Number(e.target.value))}
                  className="w-full px-3.5 py-2.5 border border-[#CBD5E1] rounded-xl outline-none font-mono text-sm font-bold text-[#0F172A]"
                />
              </div>
            </div>
          </div>

          {/* 3. Visual Imagery Studio (Enhanced) */}
          <div className="space-y-4 pt-2">
            <div className="flex items-center justify-between pb-2 border-b border-[#E2E8F0]">
              <div className="flex items-center gap-2">
                <Camera className="w-4 h-4 text-indigo-600" />
                <span className="font-serif font-bold text-sm text-[#0F172A]">Photography & Image Studio</span>
              </div>
              <span className="text-[11px] text-[#64748B]">
                {form.images.length} Image{form.images.length === 1 ? "" : "s"} Attached
              </span>
            </div>

            {/* Drag & Drop Upload Zone */}
            <div
              onDragOver={(e) => {
                e.preventDefault();
                setDragOver(true);
              }}
              onDragLeave={() => setDragOver(false)}
              onDrop={(e) => {
                e.preventDefault();
                setDragOver(false);
                handleFileUpload(e.dataTransfer.files);
              }}
              className={`border-2 border-dashed rounded-2xl p-4 sm:p-6 text-center transition-all cursor-pointer ${
                dragOver
                  ? "border-purple-600 bg-purple-50"
                  : "border-[#CBD5E1] bg-[#F8FAFC] hover:border-[#94A3B8]"
              }`}
              onClick={() => fileInputRef.current?.click()}
            >
              <input
                ref={fileInputRef}
                type="file"
                multiple
                accept="image/*"
                className="hidden"
                onChange={(e: ChangeEvent<HTMLInputElement>) => handleFileUpload(e.target.files)}
              />
              <div className="flex flex-col items-center justify-center gap-2">
                <div className="w-10 h-10 rounded-full bg-purple-100 text-purple-700 flex items-center justify-center">
                  <Upload className="w-5 h-5" />
                </div>
                <div>
                  <p className="font-bold text-[#0F172A] text-xs sm:text-sm">
                    Click to browse files or drop photos here
                  </p>
                  <p className="text-[11px] text-[#64748B] mt-0.5">
                    Supports high-res JPG, PNG, WEBP (Select one or multiple photos from phone / computer)
                  </p>
                </div>
              </div>
            </div>

            {/* URL Input Bar */}
            <div className="space-y-1.5">
              <label className="block font-bold text-[#334155]">Or Paste Web Image URL / Path</label>
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="https://... or /products/classic-noir-abaya/image-1.jpg"
                  value={imageUrlInput}
                  onChange={(e) => setImageUrlInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      handleAddImageUrl();
                    }
                  }}
                  className="flex-1 px-3.5 py-2.5 border border-[#CBD5E1] rounded-xl outline-none text-xs focus:border-[#0F172A]"
                />
                <button
                  type="button"
                  onClick={handleAddImageUrl}
                  className="px-4 py-2.5 bg-[#0F172A] text-white font-bold rounded-xl hover:bg-[#1E293B] transition-colors flex items-center gap-1.5 whitespace-nowrap"
                >
                  <Plus className="w-3.5 h-3.5" /> Add Image
                </button>
              </div>
            </div>

            {/* Quick Catalog Presets */}
            <div className="space-y-1.5">
              <p className="text-[11px] font-bold text-[#64748B] uppercase tracking-wider">
                Quick 1-Click Photoshoot Presets:
              </p>
              <div className="flex flex-wrap gap-1.5">
                {CURATED_IMAGE_PRESETS.map((preset) => (
                  <button
                    key={preset.label}
                    type="button"
                    onClick={() => handleAddPreset(preset.url)}
                    className="px-2.5 py-1 bg-white border border-[#CBD5E1] hover:border-purple-600 rounded-lg text-[11px] text-[#334155] font-medium transition-colors hover:bg-purple-50 flex items-center gap-1"
                  >
                    <Plus className="w-3 h-3 text-purple-600" />
                    {preset.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Image Gallery Thumbnails Grid */}
            {form.images.length > 0 && (
              <div className="space-y-2 pt-2">
                <p className="text-[11px] font-bold text-[#64748B]">
                  Gallery ({form.images.length}) · Image #1 is Primary Cover
                </p>
                <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-3">
                  {form.images.map((img, idx) => (
                    <div
                      key={idx}
                      className={`relative group aspect-[3/4] rounded-2xl overflow-hidden border-2 transition-all ${
                        idx === 0
                          ? "border-amber-500 ring-2 ring-amber-400/30 shadow-md"
                          : "border-[#E2E8F0] hover:border-[#94A3B8]"
                      }`}
                    >
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={img} alt="" className="w-full h-full object-cover" />

                      {/* Cover Badge */}
                      {idx === 0 ? (
                        <div className="absolute top-1.5 left-1.5 bg-amber-500 text-black text-[9px] font-bold px-1.5 py-0.5 rounded shadow-xs">
                          COVER
                        </div>
                      ) : (
                        <button
                          type="button"
                          onClick={() => handleSetCover(idx)}
                          className="absolute bottom-1.5 left-1.5 right-1.5 bg-black/80 hover:bg-black text-white text-[9px] font-bold py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity text-center"
                        >
                          Make Cover
                        </button>
                      )}

                      {/* Delete Button */}
                      <button
                        type="button"
                        onClick={() =>
                          setForm((p) => ({
                            ...p,
                            images: p.images.filter((_, i) => i !== idx),
                          }))
                        }
                        className="absolute top-1.5 right-1.5 w-6 h-6 bg-red-600/90 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-700 shadow-sm"
                        title="Remove image"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* 4. Sizes Matrix */}
          <div className="space-y-3 pt-2">
            <div className="flex items-center justify-between pb-2 border-b border-[#E2E8F0]">
              <span className="font-serif font-bold text-sm text-[#0F172A]">Sizes & Measurements</span>
              <span className="text-[11px] text-[#64748B]">Click size chips to toggle availability</span>
            </div>

            <div className="flex flex-wrap gap-2">
              {STANDARD_SIZES.map((sz) => {
                const active = form.sizes.some((s) => s.label === sz && s.available !== false);
                return (
                  <button
                    key={sz}
                    type="button"
                    onClick={() => toggleSize(sz)}
                    className={`px-3.5 py-1.5 rounded-xl font-bold text-xs transition-all border ${
                      active
                        ? "bg-[#0F172A] text-white border-[#0F172A] shadow-xs"
                        : "bg-gray-100 text-gray-400 border-gray-200 line-through"
                    }`}
                  >
                    {sz}
                  </button>
                );
              })}
            </div>

              {/* Custom Size Addition */}
              <div className="flex gap-2 pt-2 items-center">
                <input
                  type="text"
                  placeholder="Add custom size (e.g. 52, 54, 56 Tall)..."
                  value={customSizeInput}
                  onChange={(e) => setCustomSizeInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      handleAddCustomSize();
                    }
                  }}
                  className="px-3 py-1.5 border border-[#CBD5E1] rounded-xl text-xs outline-none"
                />
                <button
                  type="button"
                  onClick={handleAddCustomSize}
                  className="px-3 py-1.5 bg-gray-200 hover:bg-gray-300 font-bold rounded-xl text-xs"
                >
                  + Add Size
                </button>
              </div>
          </div>

          {/* 5. Descriptions & Styling */}
          <div className="space-y-4 pt-2">
            <div className="flex items-center gap-2 pb-2 border-b border-[#E2E8F0]">
              <FileText className="w-4 h-4 text-amber-600" />
              <span className="font-serif font-bold text-sm text-[#0F172A]">Descriptions & Details</span>
            </div>

            <div>
              <label className="block font-bold text-[#334155] mb-1.5">Short Card Summary</label>
              <textarea
                rows={2}
                value={form.description}
                onChange={(e) => set("description", e.target.value)}
                placeholder="Full-length signature abaya cut from breathable Korean Nida..."
                className="w-full px-3.5 py-2.5 border border-[#CBD5E1] rounded-xl outline-none text-xs"
              />
            </div>

            <div>
              <label className="block font-bold text-[#334155] mb-1.5">Detailed Long Description & Styling Notes</label>
              <textarea
                rows={3}
                value={form.long_description}
                onChange={(e) => set("long_description", e.target.value)}
                placeholder="Designed for special celebrations, weddings, and high-modesty gatherings. Includes adjustable inner belt and antique gold embroidery..."
                className="w-full px-3.5 py-2.5 border border-[#CBD5E1] rounded-xl outline-none text-xs"
              />
            </div>

            {/* Tags */}
            <div className="space-y-1.5">
              <label className="block font-bold text-[#334155]">Tags & Keywords</label>
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="e.g. bestseller, eid, wedding, velvet (Press enter)"
                  value={tagInput}
                  onChange={(e) => setTagInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      handleAddTag();
                    }
                  }}
                  className="flex-1 px-3.5 py-2 border border-[#CBD5E1] rounded-xl outline-none text-xs"
                />
                <button
                  type="button"
                  onClick={handleAddTag}
                  className="px-3.5 py-2 bg-gray-100 hover:bg-gray-200 font-bold rounded-xl text-xs"
                >
                  + Add Tag
                </button>
              </div>

              {form.tags.length > 0 && (
                <div className="flex flex-wrap gap-1.5 pt-1.5">
                  {form.tags.map((tg) => (
                    <span
                      key={tg}
                      className="inline-flex items-center gap-1 bg-purple-50 text-purple-800 border border-purple-200 px-2.5 py-0.5 rounded-full text-[11px] font-semibold"
                    >
                      #{tg}
                      <button type="button" onClick={() => handleRemoveTag(tg)} className="hover:text-red-600">
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* 6. Visibility Badges */}
          <div className="pt-2 border-t border-[#E2E8F0]">
            <p className="font-bold text-[#334155] mb-2.5">Storefront Highlighting</p>
            <div className="flex flex-wrap gap-6 text-xs">
              <label className="flex items-center gap-2 cursor-pointer font-bold text-[#334155]">
                <input
                  type="checkbox"
                  checked={form.featured}
                  onChange={(e) => set("featured", e.target.checked)}
                  className="w-4 h-4 rounded text-purple-600"
                />
                Featured on Homepage
              </label>

              <label className="flex items-center gap-2 cursor-pointer font-bold text-[#334155]">
                <input
                  type="checkbox"
                  checked={form.is_bestseller}
                  onChange={(e) => set("is_bestseller", e.target.checked)}
                  className="w-4 h-4 rounded text-purple-600"
                />
                Bestseller Badge
              </label>

              <label className="flex items-center gap-2 cursor-pointer font-bold text-[#334155]">
                <input
                  type="checkbox"
                  checked={form.is_new}
                  onChange={(e) => set("is_new", e.target.checked)}
                  className="w-4 h-4 rounded text-purple-600"
                />
                New Release Ribbon
              </label>
            </div>
          </div>
        </form>

        {/* Footer Actions */}
        <div className="px-6 py-4 sm:px-8 sm:py-4 bg-[#F8FAFC] border-t border-[#E2E8F0] flex justify-end items-center gap-3">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2.5 border border-[#CBD5E1] rounded-xl hover:bg-white text-xs font-bold text-[#334155]"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSubmit}
            disabled={saving}
            className="px-6 py-2.5 bg-[#0F172A] text-white font-bold rounded-xl hover:bg-[#1E293B] shadow-md flex items-center gap-2 text-xs"
          >
            {saving && <RefreshCw className="w-4 h-4 animate-spin" />}
            {isEdit ? "Update Design" : "Publish Design to Store"}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Brand / Collection Modal ─────────────────────────────────────────────────
function BrandModal({
  initial,
  onSave,
  onClose,
}: {
  initial?: BrandCollection;
  onSave: (data: BrandCollection) => void;
  onClose: () => void;
}) {
  const [form, setForm] = useState<BrandCollection>(
    initial
      ? { ...initial }
      : {
          id: "col-" + Date.now(),
          name: "",
          tagline: "",
          itemCount: 8,
          image: "/products/classic-noir-abaya/image-1.jpg",
          featured: true,
        }
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-xs p-4">
      <div className="bg-white w-full max-w-md rounded-3xl shadow-2xl p-6 border border-[#E2E8F0]">
        <div className="flex justify-between items-center pb-3 border-b border-[#E2E8F0]">
          <h3 className="font-serif font-bold text-lg text-[#0F172A]">
            {initial ? "Edit Brand Collection" : "Add Brand Collection"}
          </h3>
          <button onClick={onClose} className="p-1 text-[#94A3B8] hover:text-[#0F172A]">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form
          onSubmit={(e) => {
            e.preventDefault();
            if (!form.name.trim()) return toast.error("Collection name required");
            onSave(form);
          }}
          className="space-y-3.5 pt-4 text-xs"
        >
          <div>
            <label className="block font-bold text-[#334155] mb-1">Collection Name</label>
            <input
              type="text"
              placeholder="e.g. Festive Zari & Velvet"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              className="w-full px-3 py-2 border border-[#CBD5E1] rounded-xl outline-none"
              required
            />
          </div>

          <div>
            <label className="block font-bold text-[#334155] mb-1">Tagline / Subtitle</label>
            <input
              type="text"
              placeholder="e.g. Heavy antique gold embroideries and rich drapes"
              value={form.tagline}
              onChange={(e) => setForm({ ...form, tagline: e.target.value })}
              className="w-full px-3 py-2 border border-[#CBD5E1] rounded-xl outline-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-bold text-[#334155] mb-1">Design Count</label>
              <input
                type="number"
                value={form.itemCount}
                onChange={(e) => setForm({ ...form, itemCount: Number(e.target.value) })}
                className="w-full px-3 py-2 border border-[#CBD5E1] rounded-xl outline-none"
              />
            </div>
            <div>
              <label className="block font-bold text-[#334155] mb-1">Featured</label>
              <select
                value={form.featured ? "true" : "false"}
                onChange={(e) => setForm({ ...form, featured: e.target.value === "true" })}
                className="w-full px-3 py-2 border border-[#CBD5E1] rounded-xl outline-none bg-white"
              >
                <option value="true">Yes (Featured)</option>
                <option value="false">No (Standard)</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block font-bold text-[#334155] mb-1">Cover Image URL / Path</label>
            <input
              type="text"
              value={form.image}
              onChange={(e) => setForm({ ...form, image: e.target.value })}
              className="w-full px-3 py-2 border border-[#CBD5E1] rounded-xl outline-none"
              required
            />
          </div>

          <div className="flex justify-end gap-2 pt-3 border-t border-[#E2E8F0]">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-[#CBD5E1] rounded-xl hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 bg-[#0F172A] text-white font-bold rounded-xl hover:bg-[#1E293B]"
            >
              Save Collection
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ─── Category Modal ───────────────────────────────────────────────────────────
function CategoryModal({
  initial,
  onSave,
  onClose,
}: {
  initial?: CategoryItem;
  onSave: (data: CategoryItem) => void;
  onClose: () => void;
}) {
  const [form, setForm] = useState<CategoryItem>(
    initial
      ? { ...initial }
      : {
          id: "cat-" + Date.now(),
          name: "",
          slug: "",
          description: "",
          image: "/products/classic-noir-abaya/image-1.jpg",
        }
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-xs p-4">
      <div className="bg-white w-full max-w-md rounded-3xl shadow-2xl p-6 border border-[#E2E8F0]">
        <div className="flex justify-between items-center pb-3 border-b border-[#E2E8F0]">
          <h3 className="font-serif font-bold text-lg text-[#0F172A]">
            {initial ? "Edit Category" : "Add Store Category"}
          </h3>
          <button onClick={onClose} className="p-1 text-[#94A3B8] hover:text-[#0F172A]">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form
          onSubmit={(e) => {
            e.preventDefault();
            if (!form.name.trim()) return toast.error("Category name required");
            onSave({ ...form, slug: form.slug || form.name });
          }}
          className="space-y-3.5 pt-4 text-xs"
        >
          <div>
            <label className="block font-bold text-[#334155] mb-1">Category Name</label>
            <input
              type="text"
              placeholder="e.g. Khimar & Co-Ords"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value, slug: e.target.value })}
              className="w-full px-3 py-2 border border-[#CBD5E1] rounded-xl outline-none"
              required
            />
          </div>

          <div>
            <label className="block font-bold text-[#334155] mb-1">Description</label>
            <textarea
              rows={2}
              placeholder="Category overview for customers..."
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              className="w-full px-3 py-2 border border-[#CBD5E1] rounded-xl outline-none"
            />
          </div>

          <div>
            <label className="block font-bold text-[#334155] mb-1">Cover Image URL</label>
            <input
              type="text"
              value={form.image}
              onChange={(e) => setForm({ ...form, image: e.target.value })}
              className="w-full px-3 py-2 border border-[#CBD5E1] rounded-xl outline-none"
            />
          </div>

          <div className="flex justify-end gap-2 pt-3 border-t border-[#E2E8F0]">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-[#CBD5E1] rounded-xl hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 bg-[#0F172A] text-white font-bold rounded-xl hover:bg-[#1E293B]"
            >
              Save Category
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ─── Promo Modal ──────────────────────────────────────────────────────────────
function PromoModal({
  onSave,
  onClose,
}: {
  onSave: (data: Promocode) => void;
  onClose: () => void;
}) {
  const [form, setForm] = useState<Partial<Promocode>>({
    code: "",
    type: "percentage",
    value: 15,
    min_order: 5000,
    expires_at: "2026-12-31",
    max_uses: 500,
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-xs p-4">
      <div className="bg-white w-full max-w-md rounded-3xl shadow-2xl p-6 border border-[#E2E8F0]">
        <div className="flex justify-between items-center pb-3 border-b border-[#E2E8F0]">
          <h3 className="font-serif font-bold text-lg text-[#0F172A]">Create Promo Code</h3>
          <button onClick={onClose} className="p-1 text-[#94A3B8] hover:text-[#0F172A]">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form
          onSubmit={(e) => {
            e.preventDefault();
            if (!form.code?.trim()) return toast.error("Coupon code required");
            onSave({
              id: "p_" + Date.now(),
              code: form.code.toUpperCase().trim(),
              type: form.type || "percentage",
              value: Number(form.value) || 10,
              min_order: Number(form.min_order) || 0,
              expires_at: form.expires_at || "2026-12-31",
              max_uses: Number(form.max_uses) || 100,
              used_count: 0,
              active: true,
            });
          }}
          className="space-y-3.5 pt-4 text-xs"
        >
          <div>
            <label className="block font-bold text-[#334155] mb-1 uppercase">Coupon Code</label>
            <input
              type="text"
              placeholder="e.g. LUXURY20"
              value={form.code}
              onChange={(e) => setForm({ ...form, code: e.target.value })}
              className="w-full px-3 py-2 border border-[#CBD5E1] rounded-xl font-mono uppercase font-bold outline-none"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-bold text-[#334155] mb-1">Discount Type</label>
              <select
                value={form.type}
                onChange={(e) => setForm({ ...form, type: e.target.value as any })}
                className="w-full px-3 py-2 border border-[#CBD5E1] rounded-xl outline-none bg-white font-medium"
              >
                <option value="percentage">Percentage (%)</option>
                <option value="fixed">Fixed Amount (PKR)</option>
              </select>
            </div>
            <div>
              <label className="block font-bold text-[#334155] mb-1">Discount Value</label>
              <input
                type="number"
                value={form.value}
                onChange={(e) => setForm({ ...form, value: Number(e.target.value) })}
                className="w-full px-3 py-2 border border-[#CBD5E1] rounded-xl outline-none font-mono"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-bold text-[#334155] mb-1">Min. Order (PKR)</label>
              <input
                type="number"
                value={form.min_order}
                onChange={(e) => setForm({ ...form, min_order: Number(e.target.value) })}
                className="w-full px-3 py-2 border border-[#CBD5E1] rounded-xl outline-none font-mono"
              />
            </div>
            <div>
              <label className="block font-bold text-[#334155] mb-1">Expiry Date</label>
              <input
                type="date"
                value={form.expires_at}
                onChange={(e) => setForm({ ...form, expires_at: e.target.value })}
                className="w-full px-3 py-2 border border-[#CBD5E1] rounded-xl outline-none"
              />
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-3 border-t border-[#E2E8F0]">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-[#CBD5E1] rounded-xl hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 bg-[#0F172A] text-white font-bold rounded-xl hover:bg-[#1E293B]"
            >
              Publish Coupon
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ─── Slide Modal ──────────────────────────────────────────────────────────────
function SlideModal({
  onSave,
  onClose,
}: {
  onSave: (data: CarouselSlide) => void;
  onClose: () => void;
}) {
  const [form, setForm] = useState<Partial<CarouselSlide>>({
    title: "",
    subtitle: "AUTUMN / WINTER '26",
    tagline: "HAUTE MODESTY",
    badge: "Exclusive Release",
    description: "",
    primaryCtaText: "Shop Collection",
    primaryCtaLink: "/products",
    image: "/products/classic-noir-abaya/image-1.jpg",
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-xs p-4">
      <div className="bg-white w-full max-w-lg rounded-3xl shadow-2xl p-6 border border-[#E2E8F0]">
        <div className="flex justify-between items-center pb-3 border-b border-[#E2E8F0]">
          <h3 className="font-serif font-bold text-lg text-[#0F172A]">Add Hero Slide</h3>
          <button onClick={onClose} className="p-1 text-[#94A3B8] hover:text-[#0F172A]">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form
          onSubmit={(e) => {
            e.preventDefault();
            if (!form.title?.trim()) return toast.error("Title required");
            onSave({
              id: "s_" + Date.now(),
              title: form.title,
              subtitle: form.subtitle || "EXCLUSIVE EDIT",
              tagline: form.tagline || "LUXURY ABAYAS",
              badge: form.badge || "New Release",
              description: form.description || "",
              primaryCtaText: form.primaryCtaText || "Explore",
              primaryCtaLink: form.primaryCtaLink || "/products",
              image: form.image || "/products/classic-noir-abaya/image-1.jpg",
              active: true,
            });
          }}
          className="space-y-3.5 pt-4 text-xs"
        >
          <div>
            <label className="block font-bold text-[#334155] mb-1">Headline</label>
            <input
              type="text"
              placeholder="e.g. Elegance in Every Drape"
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              className="w-full px-3 py-2 border border-[#CBD5E1] rounded-xl outline-none"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-bold text-[#334155] mb-1">Subtitle</label>
              <input
                type="text"
                value={form.subtitle}
                onChange={(e) => setForm({ ...form, subtitle: e.target.value })}
                className="w-full px-3 py-2 border border-[#CBD5E1] rounded-xl outline-none"
              />
            </div>
            <div>
              <label className="block font-bold text-[#334155] mb-1">Badge Tag</label>
              <input
                type="text"
                value={form.badge}
                onChange={(e) => setForm({ ...form, badge: e.target.value })}
                className="w-full px-3 py-2 border border-[#CBD5E1] rounded-xl outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block font-bold text-[#334155] mb-1">Image URL / Path</label>
            <input
              type="text"
              value={form.image}
              onChange={(e) => setForm({ ...form, image: e.target.value })}
              className="w-full px-3 py-2 border border-[#CBD5E1] rounded-xl outline-none"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-bold text-[#334155] mb-1">Button Text</label>
              <input
                type="text"
                value={form.primaryCtaText}
                onChange={(e) => setForm({ ...form, primaryCtaText: e.target.value })}
                className="w-full px-3 py-2 border border-[#CBD5E1] rounded-xl outline-none"
              />
            </div>
            <div>
              <label className="block font-bold text-[#334155] mb-1">Button Target Link</label>
              <input
                type="text"
                value={form.primaryCtaLink}
                onChange={(e) => setForm({ ...form, primaryCtaLink: e.target.value })}
                className="w-full px-3 py-2 border border-[#CBD5E1] rounded-xl outline-none"
              />
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-3 border-t border-[#E2E8F0]">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-[#CBD5E1] rounded-xl hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 bg-[#0F172A] text-white font-bold rounded-xl hover:bg-[#1E293B]"
            >
              Save Slide
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ─── Login Modal ──────────────────────────────────────────────────────────────
function AdminLoginModal({
  adminPassword,
  onSuccess,
}: {
  adminPassword: string;
  onSuccess: () => void;
}) {
  const [pw, setPw] = useState("");
  const [err, setErr] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (pw === adminPassword || pw === DEFAULT_ADMIN_PASSWORD || pw === "amabaya2025") {
      sessionStorage.setItem("amabaya_admin", "1");
      localStorage.setItem("amabaya_admin_auth", "1");
      onSuccess();
      toast.success("Welcome back, Master Admin!");
    } else {
      setErr(true);
      setPw("");
    }
  };

  return (
    <div className="fixed inset-0 bg-[#090D16] flex items-center justify-center p-4 z-50">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-sm bg-white rounded-3xl shadow-2xl p-8 border border-gray-100"
      >
        <div className="text-center mb-8">
          <span className="font-serif text-3xl font-bold tracking-[0.15em] text-[#0F172A]">RIWAYAH</span>
          <p className="text-xs text-[#94A3B8] tracking-widest uppercase mt-1">Control Suite</p>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-[#475569] uppercase tracking-wider mb-1.5">
              Admin Access Key
            </label>
            <input
              type="password"
              value={pw}
              onChange={(e) => {
                setPw(e.target.value);
                setErr(false);
              }}
              placeholder="Enter password"
              className={`w-full px-4 py-3 border rounded-xl outline-none text-sm transition-all ${
                err ? "border-red-400 bg-red-50" : "border-[#CBD5E1] focus:border-[#0F172A]"
              }`}
              autoFocus
            />
            {err && <p className="text-xs text-red-600 mt-1.5">Invalid credentials. Please try again.</p>}
          </div>
          <button
            type="submit"
            className="w-full py-3 bg-[#0F172A] text-white rounded-xl text-xs font-bold uppercase tracking-wider hover:bg-[#1E293B] transition-all shadow-md"
          >
            Enter Dashboard
          </button>
        </form>
      </motion.div>
    </div>
  );
}
