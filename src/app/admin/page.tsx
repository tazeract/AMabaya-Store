"use client";

import { useState, useEffect, useRef, useMemo } from "react";
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
  Phone, Mail, MapPin, CheckCircle2, Shield
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

// ─── Default Fallback Seeds ──────────────────────────────────────────────────
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
    description: "Immerse yourself in our signature collection of handcrafted luxury abayas and flowing silhouettes.",
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
    description: "Opulent formal silhouettes detailed with intricate antique gold zari borders and hand-embellished pearl tassels.",
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
  { id: "c1", name: "Everyday Luxury Nida", tagline: "Breathable Korean Nida for effortless daily wear", itemCount: 14, image: "/products/classic-noir-abaya/image-1.jpg", featured: true },
  { id: "c2", name: "Festive Zari & Velvet", tagline: "Heavy antique gold embroideries and raw silk textures", itemCount: 8, image: "/products/royal-zahra-kaftan/image-1.jpg", featured: true },
  { id: "c3", name: "Bridal Haute Couture", tagline: "Hand-embellished pearls, crystals and scalloped cuts", itemCount: 6, image: "/products/scalloped-organza-dupatta/image-1.jpg", featured: true },
  { id: "c4", name: "Modest Co-Ords & Sets", tagline: "Contemporary two-piece tailored silhouettes", itemCount: 9, image: "/products/classic-noir-abaya/image-2.jpg", featured: false },
];

const CATEGORIES = ["Abaya", "Kaftan", "Dupatta", "Accessories", "Set"];

const EMPTY_PRODUCT: ProductFormData = {
  slug: "",
  name: "",
  category: "Abaya",
  price: 0,
  original_price: undefined,
  description: "",
  long_description: "",
  images: [],
  sizes: [
    { label: "XS", available: true },
    { label: "S", available: true },
    { label: "M", available: true },
    { label: "L", available: true },
    { label: "XL", available: true },
    { label: "XXL", available: false },
  ],
  stock: 10,
  is_new: false,
  is_bestseller: false,
  featured: false,
  tags: [],
  sku: "",
  material: "Korean Nida",
  rating: 5,
  review_count: 1,
};

const STATUS_CONFIG: Record<OrderStatus, { label: string; icon: React.ElementType; color: string; bg: string }> = {
  placed:     { label: "Placed",     icon: CheckCircle,  color: "text-blue-700",   bg: "bg-blue-50 border-blue-200" },
  processing: { label: "Processing", icon: Clock,         color: "text-amber-700",  bg: "bg-amber-50 border-amber-200" },
  shipped:    { label: "Shipped",    icon: Truck,         color: "text-purple-700", bg: "bg-purple-50 border-purple-200" },
  delivered:  { label: "Delivered",  icon: PackageCheck,  color: "text-emerald-700",bg: "bg-emerald-50 border-emerald-200" },
  cancelled:  { label: "Cancelled",  icon: X,             color: "text-red-700",    bg: "bg-red-50 border-red-200" },
};
const ALL_STATUSES = Object.keys(STATUS_CONFIG) as OrderStatus[];

function formatPKR(n: number) {
  return `Rs. ${n.toLocaleString("en-PK")}`;
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

// ─── Main Admin Component ────────────────────────────────────────────────────
export default function AdminPage() {
  const [authenticated, setAuthenticated] = useState<boolean | null>(null);
  const [activeSection, setActiveSection] = useState<AdminSection>("products");
  const [adminPassword, setAdminPassword] = useState(DEFAULT_ADMIN_PASSWORD);

  // Data states
  const [products, setProducts] = useState<ProductRow[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [promocodes, setPromocodes] = useState<Promocode[]>(INITIAL_PROMOCODES);
  const [slides, setSlides] = useState<CarouselSlide[]>(INITIAL_SLIDES);
  const [banners, setBanners] = useState<BannerItem[]>(INITIAL_BANNERS);
  const [brands, setBrands] = useState<BrandCollection[]>(INITIAL_BRANDS);
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);

  // Product Modals & Filters
  const [productModalOpen, setProductModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<ProductRow | undefined>(undefined);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [stockFilter, setStockFilter] = useState("all");

  // Order Filters & Invoices
  const [orderSearch, setOrderSearch] = useState("");
  const [orderStatusFilter, setOrderStatusFilter] = useState("all");
  const [invoiceOrder, setInvoiceOrder] = useState<Order | null>(null);

  // Promocode Modal
  const [promoModalOpen, setPromoModalOpen] = useState(false);
  const [newPromo, setNewPromo] = useState<Partial<Promocode>>({
    code: "",
    type: "percentage",
    value: 10,
    min_order: 3000,
    expires_at: "2026-12-31",
    max_uses: 100,
    active: true,
  });

  // Carousel Modal
  const [slideModalOpen, setSlideModalOpen] = useState(false);
  const [newSlide, setNewSlide] = useState<Partial<CarouselSlide>>({
    title: "",
    subtitle: "",
    tagline: "",
    badge: "New Release",
    description: "",
    primaryCtaText: "Shop Now",
    primaryCtaLink: "/products",
    image: "",
    active: true,
  });

  // Supabase client instance
  const supabase = useRef(createClient()).current;

  // 1. Auth check
  useEffect(() => {
    const isAuth = sessionStorage.getItem("amabaya_admin") === "1";
    setAuthenticated(isAuth);
    const savedPw = localStorage.getItem("amabaya_admin_custom_pw");
    if (savedPw) setAdminPassword(savedPw);
  }, []);

  // 2. Fetch all store data
  const fetchData = async () => {
    setLoading(true);
    try {
      // Products
      const { data: prodData } = await supabase
        .from("products")
        .select("*")
        .order("created_at", { ascending: false });

      if (prodData && prodData.length > 0) {
        const formatted: ProductRow[] = prodData.map((p) => {
          let sizesArr: { label: string; available: boolean }[] = [];
          if (Array.isArray(p.sizes_json) && p.sizes_json.length > 0) {
            sizesArr = p.sizes_json;
          } else if (Array.isArray(p.sizes)) {
            sizesArr = p.sizes.map((s: string) => ({ label: s, available: true }));
          } else {
            sizesArr = [
              { label: "XS", available: true },
              { label: "S", available: true },
              { label: "M", available: true },
              { label: "L", available: true },
              { label: "XL", available: true },
            ];
          }
          return {
            id: p.id,
            slug: p.slug ?? toSlug(p.name),
            name: p.name,
            category: p.category,
            price: p.price,
            original_price: p.original_price ?? undefined,
            description: p.description ?? "",
            long_description: p.long_description ?? "",
            images: Array.isArray(p.images) ? p.images : [],
            sizes: sizesArr,
            stock: p.stock ?? 0,
            is_new: !!p.is_new,
            is_bestseller: !!p.is_bestseller,
            featured: !!p.featured,
            tags: Array.isArray(p.tags) ? p.tags : [],
            sku: p.sku ?? "",
            material: p.material ?? "Korean Nida",
            rating: p.rating ?? 5,
            review_count: p.review_count ?? 1,
            created_at: p.created_at,
          };
        });
        setProducts(formatted);
      }

      // Orders
      const { data: orderData } = await supabase
        .from("orders")
        .select("*, order_items(*)")
        .order("placed_at", { ascending: false });

      if (orderData && orderData.length > 0) {
        setOrders(orderData as Order[]);
      }

      // Profiles / Users
      const { data: profData } = await supabase
        .from("profiles")
        .select("*")
        .order("created_at", { ascending: false });

      if (profData && profData.length > 0) {
        const userList: UserProfile[] = profData.map((u) => {
          const userOrders = (orderData || []).filter((o) => o.user_id === u.id);
          const spent = userOrders.reduce((sum, o) => sum + (o.total || 0), 0);
          return {
            id: u.id,
            full_name: u.full_name || "Guest Customer",
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

      // Load local config overrides if present
      const savedPromo = localStorage.getItem("amabaya_promocodes");
      if (savedPromo) setPromocodes(JSON.parse(savedPromo));
      const savedSlides = localStorage.getItem("amabaya_slides");
      if (savedSlides) setSlides(JSON.parse(savedSlides));
      const savedBanners = localStorage.getItem("amabaya_banners");
      if (savedBanners) setBanners(JSON.parse(savedBanners));
      const savedBrands = localStorage.getItem("amabaya_brands");
      if (savedBrands) setBrands(JSON.parse(savedBrands));
    } catch (e) {
      console.error("Admin data load error:", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (authenticated) {
      fetchData();
    }
  }, [authenticated]);

  // ─── Product Actions ────────────────────────────────────────────────────────
  const handleSaveProduct = async (formData: ProductFormData) => {
    try {
      const payload: Record<string, unknown> = {
        name: formData.name,
        slug: formData.slug,
        category: formData.category,
        price: formData.price,
        original_price: formData.original_price || null,
        description: formData.description,
        long_description: formData.long_description,
        images: formData.images,
        sizes_json: formData.sizes,
        sizes: formData.sizes.map((s) => s.label),
        stock: formData.stock,
        is_new: formData.is_new,
        is_bestseller: formData.is_bestseller,
        featured: formData.featured,
        tags: formData.tags,
        sku: formData.sku,
        material: formData.material,
        rating: formData.rating,
        review_count: formData.review_count,
      };

      if (formData.id) {
        // Update
        const { error } = await supabase.from("products").update(payload).eq("id", formData.id);
        if (error) throw error;
        toast.success("Product updated successfully!");
      } else {
        // Insert
        const { error } = await supabase.from("products").insert([payload]);
        if (error) throw error;
        toast.success("New product published!");
      }

      setProductModalOpen(false);
      setEditingProduct(undefined);
      fetchData();
    } catch (e: any) {
      toast.error(e.message || "Failed to save product");
    }
  };

  const handleDeleteProduct = async (id: string, name: string) => {
    if (!confirm(`Are you sure you want to delete "${name}"?`)) return;
    try {
      const { error } = await supabase.from("products").delete().eq("id", id);
      if (error) throw error;
      toast.success("Product removed");
      setProducts((prev) => prev.filter((p) => p.id !== id));
    } catch (e: any) {
      toast.error(e.message || "Could not delete product");
    }
  };

  const handleQuickStockUpdate = async (id: string, newStock: number) => {
    try {
      const { error } = await supabase.from("products").update({ stock: newStock }).eq("id", id);
      if (error) throw error;
      setProducts((prev) => prev.map((p) => (p.id === id ? { ...p, stock: newStock } : p)));
      toast.success("Stock updated");
    } catch (e: any) {
      toast.error(e.message || "Failed to update stock");
    }
  };

  // ─── Order Actions ──────────────────────────────────────────────────────────
  const handleOrderStatus = async (id: string, status: OrderStatus, tracking?: string) => {
    try {
      const updateData: Record<string, unknown> = { status, updated_at: new Date().toISOString() };
      if (tracking !== undefined) updateData.tracking_code = tracking;

      const { error } = await supabase.from("orders").update(updateData).eq("id", id);
      if (error) throw error;

      setOrders((prev) =>
        prev.map((o) => (o.id === id ? { ...o, status, tracking_code: tracking ?? o.tracking_code } : o))
      );
      toast.success(`Order status updated to ${status}`);
    } catch (e: any) {
      toast.error(e.message || "Failed to update order");
    }
  };

  // ─── Promocodes Actions ─────────────────────────────────────────────────────
  const handleSavePromocode = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPromo.code?.trim()) {
      toast.error("Please enter a coupon code");
      return;
    }
    const item: Promocode = {
      id: "p_" + Date.now(),
      code: newPromo.code.toUpperCase().trim(),
      type: newPromo.type || "percentage",
      value: Number(newPromo.value) || 10,
      min_order: Number(newPromo.min_order) || 0,
      expires_at: newPromo.expires_at || "2026-12-31",
      max_uses: Number(newPromo.max_uses) || 100,
      used_count: 0,
      active: true,
    };
    const updated = [item, ...promocodes];
    setPromocodes(updated);
    localStorage.setItem("amabaya_promocodes", JSON.stringify(updated));
    setPromoModalOpen(false);
    toast.success(`Promocode ${item.code} created!`);
  };

  const handleTogglePromo = (id: string) => {
    const updated = promocodes.map((p) => (p.id === id ? { ...p, active: !p.active } : p));
    setPromocodes(updated);
    localStorage.setItem("amabaya_promocodes", JSON.stringify(updated));
  };

  const handleDeletePromo = (id: string) => {
    const updated = promocodes.filter((p) => p.id !== id);
    setPromocodes(updated);
    localStorage.setItem("amabaya_promocodes", JSON.stringify(updated));
    toast.success("Promocode deleted");
  };

  // ─── Carousel Actions ───────────────────────────────────────────────────────
  const handleSaveSlide = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSlide.title?.trim()) {
      toast.error("Slide title required");
      return;
    }
    const item: CarouselSlide = {
      id: "s_" + Date.now(),
      title: newSlide.title,
      subtitle: newSlide.subtitle || "NEW COLLECTION",
      tagline: newSlide.tagline || "EXCLUSIVE EDIT",
      badge: newSlide.badge || "Featured",
      description: newSlide.description || "",
      primaryCtaText: newSlide.primaryCtaText || "Explore",
      primaryCtaLink: newSlide.primaryCtaLink || "/products",
      image: newSlide.image || "/products/classic-noir-abaya/image-1.jpg",
      active: true,
    };
    const updated = [...slides, item];
    setSlides(updated);
    localStorage.setItem("amabaya_slides", JSON.stringify(updated));
    setSlideModalOpen(false);
    toast.success("Hero slide created!");
  };

  const handleToggleSlide = (id: string) => {
    const updated = slides.map((s) => (s.id === id ? { ...s, active: !s.active } : s));
    setSlides(updated);
    localStorage.setItem("amabaya_slides", JSON.stringify(updated));
  };

  const handleDeleteSlide = (id: string) => {
    const updated = slides.filter((s) => s.id !== id);
    setSlides(updated);
    localStorage.setItem("amabaya_slides", JSON.stringify(updated));
    toast.success("Slide removed");
  };

  // ─── Banner Actions ─────────────────────────────────────────────────────────
  const handleToggleBanner = (id: string) => {
    const updated = banners.map((b) => (b.id === id ? { ...b, active: !b.active } : b));
    setBanners(updated);
    localStorage.setItem("amabaya_banners", JSON.stringify(updated));
    toast.success("Banner state updated");
  };

  // ─── Filtered Data ──────────────────────────────────────────────────────────
  const filteredProducts = useMemo(() => {
    return products.filter((p) => {
      const matchesSearch =
        p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (p.sku && p.sku.toLowerCase().includes(searchQuery.toLowerCase()));
      const matchesCat = selectedCategory === "all" || p.category === selectedCategory;
      const matchesStock =
        stockFilter === "all"
          ? true
          : stockFilter === "in_stock"
          ? p.stock > 0
          : stockFilter === "low_stock"
          ? p.stock > 0 && p.stock <= 5
          : p.stock === 0;
      return matchesSearch && matchesCat && matchesStock;
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

  // Total Metrics
  const totalRevenue = useMemo(() => {
    return orders
      .filter((o) => o.status !== "cancelled")
      .reduce((sum, o) => sum + (o.total || 0), 0);
  }, [orders]);

  if (authenticated === null) {
    return <div className="min-h-screen bg-[#111827] flex items-center justify-center text-white">Loading...</div>;
  }

  if (!authenticated) {
    return (
      <AdminLoginModal
        adminPassword={adminPassword}
        onSuccess={() => setAuthenticated(true)}
      />
    );
  }

  return (
    <div className="min-h-screen bg-[#F3F4F6] flex font-sans antialiased text-[#111827]">
      <Toaster position="top-right" />

      {/* ─── DARK SLATE LEFT SIDEBAR (Matching reference image) ───────────────── */}
      <aside className="w-64 bg-[#111827] text-[#9CA3AF] flex flex-col flex-shrink-0 min-h-screen border-r border-[#1F2937] z-30">
        {/* Brand Header */}
        <div className="p-6 pb-4 flex items-center justify-between border-b border-[#1F2937]/60">
          <div className="flex items-center gap-2.5">
            <span className="font-serif text-2xl font-bold tracking-tight text-white">AMabaya</span>
            <span className="text-[10px] font-semibold uppercase tracking-wider bg-purple-900/60 text-purple-300 border border-purple-700/50 px-2 py-0.5 rounded-full">
              Admin
            </span>
          </div>
        </div>

        {/* Navigation Sections */}
        <div className="flex-1 overflow-y-auto px-4 py-4 space-y-6 text-xs">
          {/* Main Navigation Group */}
          <div>
            <p className="px-3 text-[11px] font-semibold uppercase tracking-widest text-[#6B7280] mb-2">
              Navigation
            </p>
            <nav className="space-y-1">
              <SidebarItem
                icon={ShoppingBag}
                label="Products"
                count={products.length}
                active={activeSection === "products"}
                onClick={() => setActiveSection("products")}
              />
              <SidebarItem
                icon={Package}
                label="Orders"
                count={orders.length}
                active={activeSection === "orders"}
                onClick={() => setActiveSection("orders")}
              />
              <SidebarItem
                icon={Tag}
                label="Promocodes"
                count={promocodes.length}
                active={activeSection === "promocodes"}
                onClick={() => setActiveSection("promocodes")}
              />
              <SidebarItem
                icon={Sliders}
                label="Carousel"
                count={slides.length}
                active={activeSection === "carousel"}
                onClick={() => setActiveSection("carousel")}
              />
              <SidebarItem
                icon={ImageIcon}
                label="Banners"
                count={banners.length}
                active={activeSection === "banners"}
                onClick={() => setActiveSection("banners")}
              />
            </nav>
          </div>

          {/* Details Group */}
          <div>
            <p className="px-3 text-[11px] font-semibold uppercase tracking-widest text-[#6B7280] mb-2">
              Details
            </p>
            <nav className="space-y-1">
              <SidebarItem
                icon={Tag}
                label="Brands & Collections"
                count={brands.length}
                active={activeSection === "brands"}
                onClick={() => setActiveSection("brands")}
              />
              <SidebarItem
                icon={LayoutGrid}
                label="Categories"
                count={CATEGORIES.length}
                active={activeSection === "categories"}
                onClick={() => setActiveSection("categories")}
              />
            </nav>
          </div>

          {/* Access Controls Group */}
          <div>
            <p className="px-3 text-[11px] font-semibold uppercase tracking-widest text-[#6B7280] mb-2">
              Access Controls
            </p>
            <nav className="space-y-1">
              <SidebarItem
                icon={Users}
                label="Users"
                count={users.length}
                active={activeSection === "users"}
                onClick={() => setActiveSection("users")}
              />
              <SidebarItem
                icon={ShieldCheck}
                label="Roles & Security"
                active={activeSection === "roles"}
                onClick={() => setActiveSection("roles")}
              />
            </nav>
          </div>

          {/* Docs & Changelog */}
          <div>
            <p className="px-3 text-[11px] font-semibold uppercase tracking-widest text-[#6B7280] mb-2">
              Docs
            </p>
            <nav className="space-y-1">
              <SidebarItem
                icon={BookOpen}
                label="Documentation"
                active={activeSection === "documentation"}
                onClick={() => setActiveSection("documentation")}
              />
              <SidebarItem
                icon={FileText}
                label="Changelog"
                badge="14.9.1"
                active={activeSection === "changelog"}
                onClick={() => setActiveSection("changelog")}
              />
            </nav>
          </div>
        </div>

        {/* Bottom User Card (Matching Reference) */}
        <div className="p-4 border-t border-[#1F2937] bg-[#0B0F17]/80">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-purple-600 to-indigo-500 flex items-center justify-center text-white font-bold text-sm shadow-md">
                A
              </div>
              <div className="leading-tight">
                <p className="text-sm font-semibold text-white">admin</p>
                <p className="text-[11px] text-[#9CA3AF]">Super Admin</p>
              </div>
            </div>
            <button
              onClick={() => {
                sessionStorage.removeItem("amabaya_admin");
                setAuthenticated(false);
                toast.success("Logged out");
              }}
              title="Sign Out"
              className="p-1.5 text-[#9CA3AF] hover:text-red-400 hover:bg-[#1F2937] rounded-lg transition-colors"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </aside>

      {/* ─── MAIN WORKSPACE (Light gray/white matching reference) ─────────────── */}
      <main className="flex-1 flex flex-col min-w-0 overflow-y-auto">
        {/* Top Breadcrumbs & Header Bar */}
        <div className="bg-white border-b border-[#E5E7EB] px-8 py-4 sticky top-0 z-20 flex items-center justify-between shadow-xs">
          <div>
            <div className="flex items-center gap-1.5 text-xs text-[#6B7280] mb-1 font-medium">
              <Link href="/" target="_blank" className="hover:text-[#111827] flex items-center gap-1">
                Home <ExternalLink className="w-3 h-3 text-[#9CA3AF]" />
              </Link>
              <span>/</span>
              <span className="capitalize text-[#111827] font-semibold">{activeSection}</span>
            </div>
            <h1 className="text-2xl font-bold text-[#111827] capitalize tracking-tight">
              {activeSection === "brands" ? "Brands & Collections" : activeSection}
            </h1>
          </div>

          {/* Quick Actions at Top Right */}
          <div className="flex items-center gap-3">
            <button
              onClick={fetchData}
              disabled={loading}
              className="p-2 border border-[#E5E7EB] text-[#6B7280] hover:text-[#111827] rounded-xl hover:bg-[#F9FAFB] transition-colors"
              title="Refresh Store Data"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin text-purple-600" : ""}`} />
            </button>

            {activeSection === "products" && (
              <button
                onClick={() => {
                  setEditingProduct(undefined);
                  setProductModalOpen(true);
                }}
                className="inline-flex items-center gap-2 px-4 py-2 bg-[#111827] text-white text-xs font-semibold rounded-xl hover:bg-[#1F2937] transition-all shadow-sm"
              >
                <Plus className="w-4 h-4" />
                Add Product
              </button>
            )}

            {activeSection === "promocodes" && (
              <button
                onClick={() => setPromoModalOpen(true)}
                className="inline-flex items-center gap-2 px-4 py-2 bg-[#111827] text-white text-xs font-semibold rounded-xl hover:bg-[#1F2937] transition-all shadow-sm"
              >
                <Plus className="w-4 h-4" />
                New Promocode
              </button>
            )}

            {activeSection === "carousel" && (
              <button
                onClick={() => setSlideModalOpen(true)}
                className="inline-flex items-center gap-2 px-4 py-2 bg-[#111827] text-white text-xs font-semibold rounded-xl hover:bg-[#1F2937] transition-all shadow-sm"
              >
                <Plus className="w-4 h-4" />
                Add Hero Slide
              </button>
            )}
          </div>
        </div>

        {/* Dynamic Section Contents */}
        <div className="p-8 space-y-6">
          {/* ═════════ SECTION: PRODUCTS ═════════ */}
          {activeSection === "products" && (
            <div className="space-y-6">
              {/* Stat Highlights */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <StatCard label="Total Products" value={products.length} icon={ShoppingBag} color="text-indigo-600 bg-indigo-50" />
                <StatCard
                  label="In Stock Items"
                  value={products.filter((p) => p.stock > 0).length}
                  icon={CheckCircle2}
                  color="text-emerald-600 bg-emerald-50"
                />
                <StatCard
                  label="Low / Out of Stock"
                  value={products.filter((p) => p.stock <= 5).length}
                  icon={AlertTriangle}
                  color="text-amber-600 bg-amber-50"
                />
                <StatCard
                  label="Featured Pieces"
                  value={products.filter((p) => p.featured || p.is_bestseller).length}
                  icon={Sparkles}
                  color="text-purple-600 bg-purple-50"
                />
              </div>

              {/* Table Container Card (Matching reference photo styling) */}
              <div className="bg-white rounded-2xl border border-[#E5E7EB] shadow-xs overflow-hidden">
                {/* Search and Filters Bar */}
                <div className="p-4 border-b border-[#E5E7EB] flex flex-wrap items-center justify-between gap-3 bg-white">
                  <div className="relative flex-1 min-w-[240px] max-w-md">
                    <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-[#9CA3AF]" />
                    <input
                      type="text"
                      placeholder="Filter by product name, category, SKU..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full pl-9 pr-4 py-2 border border-[#E5E7EB] rounded-xl text-xs outline-none focus:border-[#111827] focus:ring-1 focus:ring-[#111827] transition-all"
                    />
                  </div>

                  <div className="flex items-center gap-2">
                    <select
                      value={selectedCategory}
                      onChange={(e) => setSelectedCategory(e.target.value)}
                      className="px-3 py-2 border border-[#E5E7EB] rounded-xl text-xs text-[#374151] outline-none bg-white hover:border-[#D1D5DB]"
                    >
                      <option value="all">All Categories</option>
                      {CATEGORIES.map((c) => (
                        <option key={c} value={c}>
                          {c}
                        </option>
                      ))}
                    </select>

                    <select
                      value={stockFilter}
                      onChange={(e) => setStockFilter(e.target.value)}
                      className="px-3 py-2 border border-[#E5E7EB] rounded-xl text-xs text-[#374151] outline-none bg-white hover:border-[#D1D5DB]"
                    >
                      <option value="all">All Stock Status</option>
                      <option value="in_stock">In Stock ({">"}0)</option>
                      <option value="low_stock">Low Stock (≤5)</option>
                      <option value="out_of_stock">Out of Stock (0)</option>
                    </select>
                  </div>
                </div>

                {/* Table Content */}
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-[#F9FAFB] text-[#6B7280] font-semibold border-b border-[#E5E7EB]">
                      <tr>
                        <th className="py-3.5 px-6">Image</th>
                        <th className="py-3.5 px-6">
                          <span className="inline-flex items-center gap-1">
                            <Filter className="w-3 h-3 text-[#9CA3AF]" /> Name
                          </span>
                        </th>
                        <th className="py-3.5 px-6">
                          <span className="inline-flex items-center gap-1">
                            <Filter className="w-3 h-3 text-[#9CA3AF]" /> Price
                          </span>
                        </th>
                        <th className="py-3.5 px-6">
                          <span className="inline-flex items-center gap-1">
                            <Filter className="w-3 h-3 text-[#9CA3AF]" /> Old price
                          </span>
                        </th>
                        <th className="py-3.5 px-6">Stock</th>
                        <th className="py-3.5 px-6">Category</th>
                        <th className="py-3.5 px-6 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#F3F4F6]">
                      {filteredProducts.length === 0 ? (
                        <tr>
                          <td colSpan={7} className="py-12 text-center text-[#9CA3AF]">
                            No products found matching your filter.
                          </td>
                        </tr>
                      ) : (
                        filteredProducts.map((product) => {
                          const mainImg = product.images?.[0] || "/products/classic-noir-abaya/image-1.jpg";
                          return (
                            <tr key={product.id} className="hover:bg-[#F9FAFB] transition-colors group">
                              {/* Image */}
                              <td className="py-3 px-6">
                                <div className="w-12 h-14 rounded-lg bg-[#F3F4F6] border border-[#E5E7EB] overflow-hidden flex-shrink-0">
                                  {/* eslint-disable-next-line @next/next/no-img-element */}
                                  <img src={mainImg} alt={product.name} className="w-full h-full object-cover" />
                                </div>
                              </td>

                              {/* Name & SKU */}
                              <td className="py-3 px-6 font-medium text-[#111827]">
                                <div className="flex flex-col">
                                  <span className="text-sm font-semibold hover:text-purple-600 transition-colors">
                                    {product.name}
                                  </span>
                                  <span className="text-[11px] font-mono text-[#9CA3AF]">
                                    SKU: {product.sku || product.slug}
                                  </span>
                                </div>
                              </td>

                              {/* Price */}
                              <td className="py-3 px-6 font-semibold font-mono text-[#111827] text-sm">
                                {formatPKR(product.price)}
                              </td>

                              {/* Old Price */}
                              <td className="py-3 px-6 font-mono text-[#9CA3AF]">
                                {product.original_price ? (
                                  <span className="line-through">{formatPKR(product.original_price)}</span>
                                ) : (
                                  "—"
                                )}
                              </td>

                              {/* Stock */}
                              <td className="py-3 px-6">
                                <div className="inline-flex items-center gap-2">
                                  <input
                                    type="number"
                                    defaultValue={product.stock}
                                    onBlur={(e) => handleQuickStockUpdate(product.id, Number(e.target.value))}
                                    className="w-16 px-2 py-1 border border-[#E5E7EB] rounded-lg text-center font-mono text-xs focus:border-[#111827] outline-none"
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

                              {/* Category */}
                              <td className="py-3 px-6">
                                <span className="inline-block px-2.5 py-0.5 bg-[#F3F4F6] text-[#374151] font-medium rounded-full text-[11px] border border-[#E5E7EB]">
                                  {product.category}
                                </span>
                              </td>

                              {/* Actions */}
                              <td className="py-3 px-6 text-right">
                                <div className="flex items-center justify-end gap-1.5">
                                  <Link
                                    href={`/products/${product.slug}`}
                                    target="_blank"
                                    className="p-1.5 text-[#9CA3AF] hover:text-[#111827] hover:bg-[#E5E7EB] rounded-lg transition-colors"
                                    title="View on store"
                                  >
                                    <Eye className="w-4 h-4" />
                                  </Link>
                                  <button
                                    onClick={() => {
                                      setEditingProduct(product);
                                      setProductModalOpen(true);
                                    }}
                                    className="p-1.5 text-[#9CA3AF] hover:text-[#111827] hover:bg-[#E5E7EB] rounded-lg transition-colors"
                                    title="Edit product"
                                  >
                                    <Edit3 className="w-4 h-4" />
                                  </button>
                                  <button
                                    onClick={() => handleDeleteProduct(product.id, product.name)}
                                    className="p-1.5 text-[#9CA3AF] hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                    title="Delete product"
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

          {/* ═════════ SECTION: ORDERS ═════════ */}
          {activeSection === "orders" && (
            <div className="space-y-6">
              {/* Order Stats */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <StatCard label="Total Revenue" value={formatPKR(totalRevenue)} icon={DollarSign} color="text-emerald-600 bg-emerald-50" />
                <StatCard label="All Orders" value={orders.length} icon={Package} color="text-blue-600 bg-blue-50" />
                <StatCard
                  label="Pending / Processing"
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

              {/* Order Filter Bar */}
              <div className="bg-white p-4 rounded-2xl border border-[#E5E7EB] shadow-xs flex flex-wrap items-center justify-between gap-3">
                <div className="relative flex-1 min-w-[240px] max-w-md">
                  <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-[#9CA3AF]" />
                  <input
                    type="text"
                    placeholder="Search by customer name, phone, order ID..."
                    value={orderSearch}
                    onChange={(e) => setOrderSearch(e.target.value)}
                    className="w-full pl-9 pr-4 py-2 border border-[#E5E7EB] rounded-xl text-xs outline-none focus:border-[#111827]"
                  />
                </div>

                <div className="flex items-center gap-2">
                  <select
                    value={orderStatusFilter}
                    onChange={(e) => setOrderStatusFilter(e.target.value)}
                    className="px-3 py-2 border border-[#E5E7EB] rounded-xl text-xs text-[#374151] outline-none bg-white"
                  >
                    <option value="all">All Order Statuses</option>
                    {ALL_STATUSES.map((s) => (
                      <option key={s} value={s}>
                        {STATUS_CONFIG[s].label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Orders List */}
              <div className="space-y-3">
                {filteredOrders.length === 0 ? (
                  <div className="bg-white rounded-2xl border border-[#E5E7EB] p-12 text-center text-[#9CA3AF]">
                    No orders found.
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

          {/* ═════════ SECTION: PROMOCODES ═════════ */}
          {activeSection === "promocodes" && (
            <div className="space-y-6">
              <div className="bg-white rounded-2xl border border-[#E5E7EB] p-6 shadow-xs">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="font-semibold text-base text-[#111827]">Active Promo & Discount Codes</h3>
                    <p className="text-xs text-[#6B7280]">Customers can enter these coupon codes during checkout</p>
                  </div>
                  <button
                    onClick={() => setPromoModalOpen(true)}
                    className="px-4 py-2 bg-[#111827] text-white text-xs font-semibold rounded-xl hover:bg-[#1F2937]"
                  >
                    + Create Coupon
                  </button>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-[#F9FAFB] text-[#6B7280] font-semibold border-b border-[#E5E7EB]">
                      <tr>
                        <th className="py-3 px-4">Coupon Code</th>
                        <th className="py-3 px-4">Discount</th>
                        <th className="py-3 px-4">Min. Spend</th>
                        <th className="py-3 px-4">Uses</th>
                        <th className="py-3 px-4">Expiry</th>
                        <th className="py-3 px-4">Status</th>
                        <th className="py-3 px-4 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#F3F4F6]">
                      {promocodes.map((promo) => (
                        <tr key={promo.id} className="hover:bg-[#F9FAFB]">
                          <td className="py-3.5 px-4 font-mono font-bold text-sm text-[#111827]">
                            <span className="px-2.5 py-1 bg-purple-50 text-purple-700 border border-purple-200 rounded-lg">
                              {promo.code}
                            </span>
                          </td>
                          <td className="py-3.5 px-4 font-semibold text-emerald-700">
                            {promo.type === "percentage" ? `${promo.value}% OFF` : `Rs. ${promo.value} FLAT`}
                          </td>
                          <td className="py-3.5 px-4 font-mono">{formatPKR(promo.min_order)}</td>
                          <td className="py-3.5 px-4 text-[#6B7280]">
                            {promo.used_count} / {promo.max_uses}
                          </td>
                          <td className="py-3.5 px-4 text-[#6B7280]">{promo.expires_at}</td>
                          <td className="py-3.5 px-4">
                            <button
                              onClick={() => handleTogglePromo(promo.id)}
                              className={`px-2.5 py-1 rounded-full text-[11px] font-semibold transition-colors ${
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
                              className="p-1.5 text-[#9CA3AF] hover:text-red-600 rounded-lg transition-colors"
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

          {/* ═════════ SECTION: CAROUSEL ═════════ */}
          {activeSection === "carousel" && (
            <div className="space-y-6">
              <div className="flex justify-between items-center bg-white p-6 rounded-2xl border border-[#E5E7EB] shadow-xs">
                <div>
                  <h3 className="font-semibold text-base text-[#111827]">Homepage Hero Carousel Slides</h3>
                  <p className="text-xs text-[#6B7280]">Control high-impact editorial slides showcased on your home page</p>
                </div>
                <button
                  onClick={() => setSlideModalOpen(true)}
                  className="px-4 py-2 bg-[#111827] text-white text-xs font-semibold rounded-xl hover:bg-[#1F2937]"
                >
                  + Add Slide
                </button>
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                {slides.map((slide, idx) => (
                  <div key={slide.id} className="bg-white rounded-2xl border border-[#E5E7EB] overflow-hidden shadow-xs">
                    <div className="h-48 bg-[#111827] relative overflow-hidden">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={slide.image} alt={slide.title} className="w-full h-full object-cover opacity-70" />
                      <div className="absolute inset-0 p-5 flex flex-col justify-between bg-gradient-to-t from-black/80 via-black/30 to-transparent text-white">
                        <span className="text-[10px] font-bold tracking-widest uppercase bg-white/20 backdrop-blur-md px-2 py-0.5 rounded w-fit">
                          Slide #{idx + 1} · {slide.badge}
                        </span>
                        <div>
                          <p className="text-xs text-[#E5E7EB] tracking-wider uppercase">{slide.subtitle}</p>
                          <h4 className="text-lg font-bold">{slide.title}</h4>
                        </div>
                      </div>
                    </div>
                    <div className="p-4 flex items-center justify-between text-xs border-t border-[#E5E7EB]">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleToggleSlide(slide.id)}
                          className={`px-3 py-1 rounded-full text-xs font-semibold ${
                            slide.active ? "bg-emerald-100 text-emerald-800" : "bg-gray-100 text-gray-500"
                          }`}
                        >
                          {slide.active ? "Visible on Home" : "Hidden"}
                        </button>
                      </div>
                      <button
                        onClick={() => handleDeleteSlide(slide.id)}
                        className="p-1.5 text-[#9CA3AF] hover:text-red-600 rounded-lg"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ═════════ SECTION: BANNERS ═════════ */}
          {activeSection === "banners" && (
            <div className="space-y-6">
              <div className="bg-white p-6 rounded-2xl border border-[#E5E7EB] shadow-xs space-y-4">
                <div>
                  <h3 className="font-semibold text-base text-[#111827]">Announcement Bars & Promo Ribbons</h3>
                  <p className="text-xs text-[#6B7280]">Toggle top announcements, sales banners, and sticky promo tickers</p>
                </div>
                <div className="space-y-3">
                  {banners.map((b) => (
                    <div key={b.id} className="p-4 border border-[#E5E7EB] rounded-xl flex items-center justify-between bg-[#F9FAFB]">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-semibold text-sm text-[#111827]">{b.title}</span>
                          <span className="text-[10px] font-mono uppercase bg-blue-100 text-blue-700 px-2 py-0.5 rounded">
                            {b.type}
                          </span>
                        </div>
                        <p className="text-xs text-[#4B5563]">{b.text}</p>
                      </div>
                      <button
                        onClick={() => handleToggleBanner(b.id)}
                        className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                          b.active ? "bg-emerald-600 text-white shadow-sm" : "bg-gray-200 text-gray-600"
                        }`}
                      >
                        {b.active ? "Live / Active" : "Disabled"}
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* ═════════ SECTION: BRANDS & COLLECTIONS ═════════ */}
          {activeSection === "brands" && (
            <div className="space-y-6">
              <div className="bg-white p-6 rounded-2xl border border-[#E5E7EB] shadow-xs">
                <div className="flex justify-between items-center mb-6">
                  <div>
                    <h3 className="font-semibold text-base text-[#111827]">Curated Collections & Brand Lookbooks</h3>
                    <p className="text-xs text-[#6B7280]">Manage capsule lines, festive releases, and signature edits</p>
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  {brands.map((col) => (
                    <div key={col.id} className="p-4 border border-[#E5E7EB] rounded-xl flex gap-4 items-center bg-[#F9FAFB]">
                      <div className="w-16 h-20 rounded-lg overflow-hidden bg-gray-200 flex-shrink-0">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={col.image} alt={col.name} className="w-full h-full object-cover" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="font-semibold text-sm text-[#111827]">{col.name}</h4>
                        <p className="text-xs text-[#6B7280] line-clamp-2 mt-0.5">{col.tagline}</p>
                        <span className="inline-block mt-2 text-[11px] font-medium text-purple-700 bg-purple-50 px-2 py-0.5 rounded">
                          {col.itemCount} Designs Attached
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* ═════════ SECTION: CATEGORIES ═════════ */}
          {activeSection === "categories" && (
            <div className="space-y-6">
              <div className="bg-white p-6 rounded-2xl border border-[#E5E7EB] shadow-xs">
                <h3 className="font-semibold text-base text-[#111827] mb-1">Product Categories</h3>
                <p className="text-xs text-[#6B7280] mb-6">Active storefront categories and catalog item counts</p>

                <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {CATEGORIES.map((cat) => {
                    const count = products.filter((p) => p.category === cat).length;
                    return (
                      <div key={cat} className="p-5 border border-[#E5E7EB] rounded-2xl bg-[#F9FAFB] hover:border-[#D1D5DB] transition-all">
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-base text-[#111827]">{cat}</span>
                          <span className="text-xs font-semibold px-2.5 py-1 bg-white border border-[#E5E7EB] rounded-full text-[#374151]">
                            {count} Items
                          </span>
                        </div>
                        <p className="text-xs text-[#6B7280] mt-2">
                          Direct category filter on storefront: <code className="text-[11px] text-purple-600">/products?category={cat}</code>
                        </p>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* ═════════ SECTION: USERS ═════════ */}
          {activeSection === "users" && (
            <div className="space-y-6">
              <div className="bg-white rounded-2xl border border-[#E5E7EB] shadow-xs overflow-hidden">
                <div className="p-6 border-b border-[#E5E7EB]">
                  <h3 className="font-semibold text-base text-[#111827]">Registered Customers & Profiles</h3>
                  <p className="text-xs text-[#6B7280]">Customer directory synced with Supabase Auth</p>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-[#F9FAFB] text-[#6B7280] font-semibold border-b border-[#E5E7EB]">
                      <tr>
                        <th className="py-3.5 px-6">Customer Name</th>
                        <th className="py-3.5 px-6">Phone</th>
                        <th className="py-3.5 px-6">City</th>
                        <th className="py-3.5 px-6">Total Orders</th>
                        <th className="py-3.5 px-6">Lifetime Spend</th>
                        <th className="py-3.5 px-6">Joined Date</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#F3F4F6]">
                      {users.length === 0 ? (
                        <tr>
                          <td colSpan={6} className="py-10 text-center text-[#9CA3AF]">
                            No registered customers yet.
                          </td>
                        </tr>
                      ) : (
                        users.map((u) => (
                          <tr key={u.id} className="hover:bg-[#F9FAFB]">
                            <td className="py-3.5 px-6 font-semibold text-[#111827]">{u.full_name}</td>
                            <td className="py-3.5 px-6 text-[#6B7280] font-mono">{u.phone}</td>
                            <td className="py-3.5 px-6 text-[#6B7280]">{u.city}</td>
                            <td className="py-3.5 px-6 font-semibold">{u.total_orders}</td>
                            <td className="py-3.5 px-6 font-mono font-semibold text-emerald-700">
                              {formatPKR(u.total_spent)}
                            </td>
                            <td className="py-3.5 px-6 text-[#9CA3AF]">{formatDate(u.created_at)}</td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* ═════════ SECTION: ROLES & SECURITY ═════════ */}
          {activeSection === "roles" && (
            <div className="space-y-6 max-w-4xl">
              {/* Credentials card */}
              <div className="bg-white p-6 rounded-2xl border border-[#E5E7EB] shadow-xs space-y-4">
                <div className="flex items-center gap-3">
                  <ShieldCheck className="w-6 h-6 text-purple-600" />
                  <div>
                    <h3 className="font-semibold text-base text-[#111827]">Admin Access Credentials</h3>
                    <p className="text-xs text-[#6B7280]">Update store admin password and authentication settings</p>
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
                    <label className="block text-xs font-semibold text-[#374151] mb-1 uppercase tracking-wider">
                      Current / New Password
                    </label>
                    <input
                      name="pw"
                      type="text"
                      defaultValue={adminPassword}
                      className="w-full max-w-md px-4 py-2.5 border border-[#D1D5DB] rounded-xl text-xs font-mono outline-none focus:border-[#111827]"
                    />
                  </div>
                  <button
                    type="submit"
                    className="px-5 py-2.5 bg-[#111827] text-white text-xs font-semibold rounded-xl hover:bg-[#1F2937] transition-all"
                  >
                    Save New Password
                  </button>
                </form>
              </div>

              {/* Service Integrations Health */}
              <div className="bg-white p-6 rounded-2xl border border-[#E5E7EB] shadow-xs space-y-4">
                <h3 className="font-semibold text-base text-[#111827]">Store Integrations Status</h3>
                <div className="grid sm:grid-cols-3 gap-4 text-xs">
                  <div className="p-4 border border-emerald-200 bg-emerald-50 rounded-xl space-y-1">
                    <p className="font-bold text-emerald-800 flex items-center gap-1.5">
                      <CheckCircle className="w-4 h-4" /> Supabase Database
                    </p>
                    <p className="text-emerald-700 text-[11px]">Connected & RLS Synced</p>
                  </div>
                  <div className="p-4 border border-purple-200 bg-purple-50 rounded-xl space-y-1">
                    <p className="font-bold text-purple-800 flex items-center gap-1.5">
                      <CheckCircle className="w-4 h-4" /> PayFast Gateway
                    </p>
                    <p className="text-purple-700 text-[11px]">Sandbox / Live Ready</p>
                  </div>
                  <div className="p-4 border border-blue-200 bg-blue-50 rounded-xl space-y-1">
                    <p className="font-bold text-blue-800 flex items-center gap-1.5">
                      <CheckCircle className="w-4 h-4" /> EmailJS Notification
                    </p>
                    <p className="text-blue-700 text-[11px]">Order Dispatches Active</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ═════════ SECTION: DOCUMENTATION ═════════ */}
          {activeSection === "documentation" && (
            <div className="space-y-6 max-w-4xl">
              <div className="bg-white p-8 rounded-2xl border border-[#E5E7EB] shadow-xs space-y-6 text-xs text-[#374151]">
                <div className="border-b border-[#E5E7EB] pb-4">
                  <h3 className="text-xl font-serif font-bold text-[#111827]">AMabaya Store Administration Manual</h3>
                  <p className="text-xs text-[#6B7280] mt-1">Quick operational guidelines for the store owner</p>
                </div>

                <div className="space-y-4">
                  <h4 className="font-bold text-sm text-[#111827]">1. Managing Products & Images</h4>
                  <p className="leading-relaxed">
                    You can upload multiple high-resolution photos for each Abaya or Kaftan. The first image is always treated as the primary thumbnail. Use standard aspect ratios (3:4 or 4:5 vertical portrait recommended for fashion cataloguing).
                  </p>

                  <h4 className="font-bold text-sm text-[#111827]">2. Order Fulfilment & Courier Tracking</h4>
                  <p className="leading-relaxed">
                    When you dispatch an order through TCS, Leopards, Trax, or CallCourier, paste the tracking number into the order card and update the status to <strong>Shipped</strong>. Customers can track their parcels live via the <code>/order-tracking</code> page.
                  </p>

                  <h4 className="font-bold text-sm text-[#111827]">3. Promotional Discounts</h4>
                  <p className="leading-relaxed">
                    Create percentage or flat PKR off codes under the <strong>Promocodes</strong> tab. You can set minimum cart thresholds (e.g. Free delivery on orders over Rs. 5,000).
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* ═════════ SECTION: CHANGELOG ═════════ */}
          {activeSection === "changelog" && (
            <div className="space-y-6 max-w-3xl">
              <div className="bg-white p-6 rounded-2xl border border-[#E5E7EB] shadow-xs space-y-4">
                <div className="flex items-center justify-between border-b border-[#E5E7EB] pb-4">
                  <div>
                    <h3 className="font-semibold text-base text-[#111827]">System Activity & Version Audit</h3>
                    <p className="text-xs text-[#6B7280]">Recent system updates and store event triggers</p>
                  </div>
                  <span className="px-3 py-1 bg-purple-100 text-purple-800 text-xs font-bold rounded-full font-mono">
                    v14.9.1
                  </span>
                </div>

                <div className="space-y-3 text-xs">
                  <div className="p-3 border-l-2 border-purple-500 bg-[#F9FAFB] rounded-r-xl">
                    <p className="font-semibold text-[#111827]">Admin Panel Control Suite v14.9.1</p>
                    <p className="text-[#6B7280]">Added Promocodes, Carousel management, printable Tax Invoices, and quick stock editor.</p>
                  </div>
                  <div className="p-3 border-l-2 border-emerald-500 bg-[#F9FAFB] rounded-r-xl">
                    <p className="font-semibold text-[#111827]">PayFast Online Checkout Gateway</p>
                    <p className="text-[#6B7280]">Integrated debit/credit card and mobile wallet checkout flow with instant webhook callbacks.</p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>

      {/* ─── MODALS ───────────────────────────────────────────────────────────── */}
      {/* 1. Add / Edit Product Modal */}
      {productModalOpen && (
        <ProductFormModal
          initial={editingProduct}
          onSave={handleSaveProduct}
          onClose={() => {
            setProductModalOpen(false);
            setEditingProduct(undefined);
          }}
        />
      )}

      {/* 2. Add Promocode Modal */}
      {promoModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl p-6 border border-[#E5E7EB]">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-semibold text-base text-[#111827]">Create New Promo Code</h3>
              <button onClick={() => setPromoModalOpen(false)} className="text-[#9CA3AF] hover:text-[#111827]">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleSavePromocode} className="space-y-4 text-xs">
              <div>
                <label className="block font-medium text-[#374151] mb-1 uppercase">Coupon Code</label>
                <input
                  type="text"
                  placeholder="e.g. FESTIVE20"
                  value={newPromo.code}
                  onChange={(e) => setNewPromo({ ...newPromo, code: e.target.value })}
                  className="w-full px-3 py-2 border border-[#D1D5DB] rounded-xl font-mono uppercase focus:border-[#111827] outline-none"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-medium text-[#374151] mb-1">Discount Type</label>
                  <select
                    value={newPromo.type}
                    onChange={(e) => setNewPromo({ ...newPromo, type: e.target.value as any })}
                    className="w-full px-3 py-2 border border-[#D1D5DB] rounded-xl outline-none"
                  >
                    <option value="percentage">Percentage (%)</option>
                    <option value="fixed">Fixed Amount (PKR)</option>
                  </select>
                </div>
                <div>
                  <label className="block font-medium text-[#374151] mb-1">Discount Value</label>
                  <input
                    type="number"
                    value={newPromo.value}
                    onChange={(e) => setNewPromo({ ...newPromo, value: Number(e.target.value) })}
                    className="w-full px-3 py-2 border border-[#D1D5DB] rounded-xl outline-none"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-medium text-[#374151] mb-1">Min. Order (PKR)</label>
                  <input
                    type="number"
                    value={newPromo.min_order}
                    onChange={(e) => setNewPromo({ ...newPromo, min_order: Number(e.target.value) })}
                    className="w-full px-3 py-2 border border-[#D1D5DB] rounded-xl outline-none"
                  />
                </div>
                <div>
                  <label className="block font-medium text-[#374151] mb-1">Expiry Date</label>
                  <input
                    type="date"
                    value={newPromo.expires_at}
                    onChange={(e) => setNewPromo({ ...newPromo, expires_at: e.target.value })}
                    className="w-full px-3 py-2 border border-[#D1D5DB] rounded-xl outline-none"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-3">
                <button
                  type="button"
                  onClick={() => setPromoModalOpen(false)}
                  className="px-4 py-2 border border-[#D1D5DB] rounded-xl hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-[#111827] text-white font-semibold rounded-xl hover:bg-[#1F2937]"
                >
                  Publish Coupon
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 3. Add Carousel Slide Modal */}
      {slideModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-white w-full max-w-lg rounded-2xl shadow-2xl p-6 border border-[#E5E7EB]">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-semibold text-base text-[#111827]">Add Homepage Hero Slide</h3>
              <button onClick={() => setSlideModalOpen(false)} className="text-[#9CA3AF] hover:text-[#111827]">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleSaveSlide} className="space-y-3 text-xs">
              <div>
                <label className="block font-medium text-[#374151] mb-1">Headline Title</label>
                <input
                  type="text"
                  placeholder="e.g. Elegance in Every Drape"
                  value={newSlide.title}
                  onChange={(e) => setNewSlide({ ...newSlide, title: e.target.value })}
                  className="w-full px-3 py-2 border border-[#D1D5DB] rounded-xl outline-none"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-medium text-[#374151] mb-1">Subtitle / Season</label>
                  <input
                    type="text"
                    placeholder="e.g. AUTUMN / WINTER '26"
                    value={newSlide.subtitle}
                    onChange={(e) => setNewSlide({ ...newSlide, subtitle: e.target.value })}
                    className="w-full px-3 py-2 border border-[#D1D5DB] rounded-xl outline-none"
                  />
                </div>
                <div>
                  <label className="block font-medium text-[#374151] mb-1">Badge Tag</label>
                  <input
                    type="text"
                    placeholder="e.g. New Luxury Release"
                    value={newSlide.badge}
                    onChange={(e) => setNewSlide({ ...newSlide, badge: e.target.value })}
                    className="w-full px-3 py-2 border border-[#D1D5DB] rounded-xl outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block font-medium text-[#374151] mb-1">Slide Image URL / Path</label>
                <input
                  type="text"
                  placeholder="/products/classic-noir-abaya/image-1.jpg or https://..."
                  value={newSlide.image}
                  onChange={(e) => setNewSlide({ ...newSlide, image: e.target.value })}
                  className="w-full px-3 py-2 border border-[#D1D5DB] rounded-xl outline-none"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-medium text-[#374151] mb-1">Button Text</label>
                  <input
                    type="text"
                    value={newSlide.primaryCtaText}
                    onChange={(e) => setNewSlide({ ...newSlide, primaryCtaText: e.target.value })}
                    className="w-full px-3 py-2 border border-[#D1D5DB] rounded-xl outline-none"
                  />
                </div>
                <div>
                  <label className="block font-medium text-[#374151] mb-1">Button Target Link</label>
                  <input
                    type="text"
                    value={newSlide.primaryCtaLink}
                    onChange={(e) => setNewSlide({ ...newSlide, primaryCtaLink: e.target.value })}
                    className="w-full px-3 py-2 border border-[#D1D5DB] rounded-xl outline-none"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-3">
                <button
                  type="button"
                  onClick={() => setSlideModalOpen(false)}
                  className="px-4 py-2 border border-[#D1D5DB] rounded-xl hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-[#111827] text-white font-semibold rounded-xl hover:bg-[#1F2937]"
                >
                  Save Hero Slide
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 4. Invoice Print Modal */}
      {invoiceOrder && <InvoiceModal order={invoiceOrder} onClose={() => setInvoiceOrder(null)} />}
    </div>
  );
}

// ─── Sidebar Navigation Item Component ───────────────────────────────────────
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
          ? "bg-[#1E293B] text-white font-semibold shadow-xs"
          : "text-[#9CA3AF] hover:text-white hover:bg-[#1E293B]/50"
      }`}
    >
      <div className="flex items-center gap-3">
        <Icon className={`w-4 h-4 ${active ? "text-purple-400" : "text-[#6B7280]"}`} />
        <span>{label}</span>
      </div>
      {count !== undefined && (
        <span className={`text-[11px] font-mono px-2 py-0.5 rounded-full ${active ? "bg-purple-950/70 text-purple-300 border border-purple-800/40" : "text-[#6B7280]"}`}>
          {count}
        </span>
      )}
      {badge && (
        <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-[#374151] text-[#D1D5DB]">
          {badge}
        </span>
      )}
    </button>
  );
}

// ─── Stat Card Component ──────────────────────────────────────────────────────
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
    <div className="bg-white rounded-2xl border border-[#E5E7EB] p-5 flex items-center gap-4 shadow-xs">
      <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${color}`}>
        <Icon className="w-6 h-6" />
      </div>
      <div>
        <p className="text-2xl font-bold text-[#111827] tracking-tight">{value}</p>
        <p className="text-xs text-[#6B7280] font-medium mt-0.5">{label}</p>
      </div>
    </div>
  );
}

// ─── Order Row Card Component ─────────────────────────────────────────────────
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
    <div className="bg-white rounded-2xl border border-[#E5E7EB] overflow-hidden shadow-xs">
      <div className="flex items-center gap-3 p-4 flex-wrap">
        <button onClick={() => setExpanded(!expanded)} className="p-1 text-[#9CA3AF] hover:text-[#111827]">
          <ChevronDown className={`w-4 h-4 transition-transform ${expanded ? "rotate-180" : ""}`} />
        </button>

        <div className="flex-1 min-w-[200px]">
          <div className="flex items-center gap-2">
            <span className="text-xs font-mono font-bold text-[#111827]">
              #{order.id.slice(0, 8).toUpperCase()}
            </span>
            <span className="text-[11px] text-[#6B7280]">· {formatDate(order.placed_at)}</span>
          </div>
          <p className="text-sm font-semibold text-[#111827] truncate mt-0.5">
            {order.shipping_address?.fullName}
            <span className="text-[#9CA3AF] font-normal ml-2 text-xs">
              {order.shipping_address?.city}, {order.shipping_address?.phone}
            </span>
          </p>
        </div>

        <p className="text-sm font-bold text-[#111827] font-mono">{formatPKR(order.total)}</p>

        <span className={`inline-flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-full border ${cfg.bg} ${cfg.color}`}>
          <Icon className="w-3.5 h-3.5" />
          {cfg.label}
        </span>

        <select
          value={order.status}
          onChange={(e) => handleStatus(e.target.value as OrderStatus)}
          disabled={updating}
          className="text-xs border border-[#D1D5DB] rounded-lg px-2.5 py-1.5 outline-none bg-white font-medium hover:border-[#9CA3AF]"
        >
          {ALL_STATUSES.map((s) => (
            <option key={s} value={s}>
              {STATUS_CONFIG[s].label}
            </option>
          ))}
        </select>

        <button
          onClick={onPrint}
          className="p-1.5 border border-[#E5E7EB] text-[#6B7280] hover:text-[#111827] hover:bg-gray-50 rounded-lg transition-colors"
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
            className="border-t border-[#F3F4F6] p-5 bg-[#F9FAFB] grid md:grid-cols-2 gap-6 text-xs"
          >
            <div>
              <p className="font-semibold text-[#6B7280] uppercase tracking-wider text-[10px] mb-3">Order Items</p>
              <div className="space-y-2">
                {order.order_items?.map((item) => (
                  <div key={item.id} className="flex items-center gap-3 bg-white p-2.5 rounded-xl border border-[#E5E7EB]">
                    <div className="w-10 h-12 rounded-lg bg-[#F3F4F6] overflow-hidden flex-shrink-0">
                      {item.product_snapshot?.images?.[0] && (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={item.product_snapshot.images[0]} alt="" className="w-full h-full object-cover" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-[#111827] truncate">{item.product_snapshot?.name}</p>
                      <p className="text-[11px] text-[#6B7280]">
                        Size: {item.size || "Standard"} · Qty: {item.quantity}
                      </p>
                    </div>
                    <p className="font-semibold font-mono">{formatPKR(item.unit_price * item.quantity)}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="space-y-4">
              <div className="bg-white p-3.5 rounded-xl border border-[#E5E7EB] space-y-1">
                <p className="font-semibold text-[#6B7280] uppercase tracking-wider text-[10px]">Customer Details</p>
                <p className="font-semibold text-[#111827]">{order.shipping_address?.fullName}</p>
                <p className="text-[#4B5563] flex items-center gap-1.5">
                  <Phone className="w-3 h-3 text-[#9CA3AF]" />
                  <a href={`tel:${order.shipping_address?.phone}`} className="hover:underline">
                    {order.shipping_address?.phone}
                  </a>
                  <a
                    href={`https://wa.me/${order.shipping_address?.phone?.replace(/[^0-9]/g, "")}`}
                    target="_blank"
                    className="text-emerald-600 font-bold ml-2 hover:underline"
                  >
                    WhatsApp
                  </a>
                </p>
                <p className="text-[#4B5563] flex items-start gap-1.5 mt-1">
                  <MapPin className="w-3 h-3 text-[#9CA3AF] mt-0.5 flex-shrink-0" />
                  {order.shipping_address?.address}, {order.shipping_address?.city},{" "}
                  {order.shipping_address?.province}
                </p>
              </div>

              <div className="flex gap-2">
                <input
                  type="text"
                  value={tracking}
                  onChange={(e) => setTracking(e.target.value)}
                  placeholder="Courier tracking code (TCS-12345678)"
                  className="flex-1 px-3 py-2 border border-[#D1D5DB] rounded-xl text-xs outline-none bg-white"
                />
                <button
                  onClick={() => handleStatus(order.status)}
                  className="px-4 py-2 bg-[#111827] text-white text-xs font-semibold rounded-xl hover:bg-[#1F2937]"
                >
                  Save Tracking
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ─── Product Form Modal Component ─────────────────────────────────────────────
function ProductFormModal({
  initial,
  onSave,
  onClose,
}: {
  initial?: ProductRow;
  onSave: (data: ProductFormData) => Promise<void>;
  onClose: () => void;
}) {
  const [form, setForm] = useState<ProductFormData>(
    initial ? { ...initial } : { ...EMPTY_PRODUCT }
  );
  const [saving, setSaving] = useState(false);
  const [imageUrlInput, setImageUrlInput] = useState("");
  const isEdit = !!initial;

  const set = (field: keyof ProductFormData, value: unknown) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    if (field === "name" && !isEdit) {
      setForm((prev) => ({ ...prev, name: value as string, slug: toSlug(value as string) }));
    }
  };

  const handleAddImageUrl = () => {
    if (!imageUrlInput.trim()) return;
    setForm((prev) => ({ ...prev, images: [...prev.images, imageUrlInput.trim()] }));
    setImageUrlInput("");
  };

  const handleRemoveImage = (idx: number) => {
    setForm((prev) => ({ ...prev, images: prev.images.filter((_, i) => i !== idx) }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim()) return toast.error("Product name is required");
    if (!form.slug.trim()) return toast.error("Product slug is required");
    if (form.price <= 0) return toast.error("Price must be greater than 0");

    setSaving(true);
    await onSave(form);
    setSaving(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="bg-white w-full max-w-2xl rounded-2xl shadow-2xl p-6 my-8 border border-[#E5E7EB] max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center pb-4 border-b border-[#E5E7EB]">
          <div>
            <h3 className="font-semibold text-lg text-[#111827]">
              {isEdit ? "Edit Product" : "Publish New Product"}
            </h3>
            <p className="text-xs text-[#6B7280]">
              {isEdit ? `Updating #${form.sku || form.slug}` : "Add an Abaya, Kaftan, or Accessory to catalog"}
            </p>
          </div>
          <button onClick={onClose} className="p-1 text-[#9CA3AF] hover:text-[#111827] rounded-lg">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 pt-4 text-xs">
          {/* Name & Category */}
          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="block font-semibold text-[#374151] mb-1">Product Title</label>
              <input
                type="text"
                value={form.name}
                onChange={(e) => set("name", e.target.value)}
                placeholder="e.g. Classic Noir Korean Nida Abaya"
                className="w-full px-3 py-2 border border-[#D1D5DB] rounded-xl outline-none focus:border-[#111827]"
                required
              />
            </div>
            <div>
              <label className="block font-semibold text-[#374151] mb-1">Category</label>
              <select
                value={form.category}
                onChange={(e) => set("category", e.target.value)}
                className="w-full px-3 py-2 border border-[#D1D5DB] rounded-xl outline-none bg-white"
              >
                {CATEGORIES.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Pricing & Stock */}
          <div className="grid sm:grid-cols-3 gap-4">
            <div>
              <label className="block font-semibold text-[#374151] mb-1">Sale Price (PKR)</label>
              <input
                type="number"
                value={form.price || ""}
                onChange={(e) => set("price", Number(e.target.value))}
                placeholder="7500"
                className="w-full px-3 py-2 border border-[#D1D5DB] rounded-xl outline-none"
                required
              />
            </div>
            <div>
              <label className="block font-semibold text-[#374151] mb-1">Original Price (PKR)</label>
              <input
                type="number"
                value={form.original_price || ""}
                onChange={(e) => set("original_price", e.target.value ? Number(e.target.value) : undefined)}
                placeholder="9500"
                className="w-full px-3 py-2 border border-[#D1D5DB] rounded-xl outline-none"
              />
            </div>
            <div>
              <label className="block font-semibold text-[#374151] mb-1">Inventory Stock</label>
              <input
                type="number"
                value={form.stock}
                onChange={(e) => set("stock", Number(e.target.value))}
                className="w-full px-3 py-2 border border-[#D1D5DB] rounded-xl outline-none"
              />
            </div>
          </div>

          {/* Image URLs */}
          <div>
            <label className="block font-semibold text-[#374151] mb-1">Product Images</label>
            <div className="flex gap-2 mb-2">
              <input
                type="text"
                placeholder="Enter image URL or path (/products/classic-noir-abaya/image-1.jpg)"
                value={imageUrlInput}
                onChange={(e) => setImageUrlInput(e.target.value)}
                className="flex-1 px-3 py-2 border border-[#D1D5DB] rounded-xl outline-none"
              />
              <button
                type="button"
                onClick={handleAddImageUrl}
                className="px-4 py-2 bg-[#111827] text-white rounded-xl hover:bg-[#1F2937]"
              >
                + Add
              </button>
            </div>

            {form.images.length > 0 && (
              <div className="flex flex-wrap gap-2 pt-2">
                {form.images.map((img, idx) => (
                  <div key={idx} className="relative group w-16 h-20 rounded-lg overflow-hidden border border-[#E5E7EB]">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={img} alt="" className="w-full h-full object-cover" />
                    <button
                      type="button"
                      onClick={() => handleRemoveImage(idx)}
                      className="absolute inset-0 bg-black/60 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <X className="w-4 h-4" />
                    </button>
                    {idx === 0 && (
                      <span className="absolute bottom-0 inset-x-0 bg-black/70 text-[8px] text-white text-center py-0.5">
                        Primary
                      </span>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Description */}
          <div>
            <label className="block font-semibold text-[#374151] mb-1">Short Description</label>
            <textarea
              rows={2}
              value={form.description}
              onChange={(e) => set("description", e.target.value)}
              placeholder="Features premium Korean Nida drape, tailored cuffs..."
              className="w-full px-3 py-2 border border-[#D1D5DB] rounded-xl outline-none"
            />
          </div>

          {/* Badges and Toggles */}
          <div className="flex flex-wrap gap-6 pt-2 border-t border-[#E5E7EB]">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={form.featured}
                onChange={(e) => set("featured", e.target.checked)}
                className="w-4 h-4 rounded text-purple-600 focus:ring-purple-500"
              />
              <span className="font-medium text-[#374151]">Featured on Home</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={form.is_bestseller}
                onChange={(e) => set("is_bestseller", e.target.checked)}
                className="w-4 h-4 rounded text-purple-600 focus:ring-purple-500"
              />
              <span className="font-medium text-[#374151]">Bestseller Badge</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={form.is_new}
                onChange={(e) => set("is_new", e.target.checked)}
                className="w-4 h-4 rounded text-purple-600 focus:ring-purple-500"
              />
              <span className="font-medium text-[#374151]">New Arrival Badge</span>
            </label>
          </div>

          {/* Footer Actions */}
          <div className="flex justify-end gap-2 pt-4 border-t border-[#E5E7EB]">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-[#D1D5DB] rounded-xl hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="px-6 py-2 bg-[#111827] text-white font-semibold rounded-xl hover:bg-[#1F2937] transition-all flex items-center gap-2"
            >
              {saving && <RefreshCw className="w-3.5 h-3.5 animate-spin" />}
              {isEdit ? "Update Product" : "Publish Product"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ─── Admin Login Component ────────────────────────────────────────────────────
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
      onSuccess();
      toast.success("Welcome back, Admin!");
    } else {
      setErr(true);
      setPw("");
    }
  };

  return (
    <div className="min-h-screen bg-[#0F172A] flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-sm bg-white rounded-3xl shadow-2xl p-8 border border-gray-100"
      >
        <div className="text-center mb-8">
          <span className="font-serif text-3xl font-bold tracking-[0.15em] text-[#111827]">AMABAYA</span>
          <p className="text-xs text-[#9CA3AF] tracking-widest uppercase mt-1">Store Admin Suite</p>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-[#6B7280] uppercase tracking-wider mb-1.5">
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
                err ? "border-red-400 bg-red-50" : "border-[#D1D5DB] focus:border-[#111827]"
              }`}
              autoFocus
            />
            {err && <p className="text-xs text-red-600 mt-1.5">Invalid credentials. Try again.</p>}
          </div>
          <button
            type="submit"
            className="w-full py-3 bg-[#111827] text-white rounded-xl text-xs font-bold uppercase tracking-wider hover:bg-[#1F2937] transition-all shadow-md"
          >
            Access Dashboard
          </button>
        </form>
      </motion.div>
    </div>
  );
}
