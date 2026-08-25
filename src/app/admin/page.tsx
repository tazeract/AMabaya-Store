"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  Package, ChevronDown, RefreshCw, Search,
  CheckCircle, Clock, Truck, PackageCheck, X,
  ShoppingBag, TrendingUp, DollarSign,
  LogOut, Plus, Edit3, Trash2, Upload, Image as ImageIcon,
  AlertCircle, Save, Eye, LayoutGrid,
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";

// ─── Admin Password ───────────────────────────────────────────────────────────
const ADMIN_PASSWORD = process.env.NEXT_PUBLIC_ADMIN_PASSWORD ?? "amabaya2025";

// ─── Types ───────────────────────────────────────────────────────────────────
type OrderStatus = "placed" | "processing" | "shipped" | "delivered" | "cancelled";
type AdminTab = "orders" | "products";

interface OrderItem {
  id: string;
  product_snapshot: { name: string; images?: string[] };
  quantity: number;
  size: string;
  color: string;
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
  material: "",
  rating: 0,
  review_count: 0,
};

const CATEGORIES = ["Abaya", "Kaftan", "Dupatta", "Accessories"];

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
  return new Date(iso).toLocaleDateString("en-PK", { day: "numeric", month: "short", year: "numeric" });
}

// ─── Slug generator ────────────────────────────────────────────────────────────
function toSlug(name: string) {
  return name.toLowerCase().replace(/[^a-z0-9\s-]/g, "").trim().replace(/\s+/g, "-");
}

// ─── Admin Login ──────────────────────────────────────────────────────────────
function AdminLogin({ onLogin }: { onLogin: () => void }) {
  const [pw, setPw] = useState("");
  const [err, setErr] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (pw === ADMIN_PASSWORD) {
      sessionStorage.setItem("amabaya_admin", "1");
      onLogin();
    } else {
      setErr(true);
      setPw("");
    }
  };

  return (
    <div className="min-h-screen bg-[#111827] flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-sm bg-white rounded-2xl shadow-2xl p-8"
      >
        <div className="text-center mb-8">
          <span className="font-serif text-2xl font-medium tracking-[0.2em] text-[#111827]">AMABAYA</span>
          <p className="text-xs text-[#9CA3AF] tracking-widest uppercase mt-1">Admin Panel</p>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-[#6B7280] uppercase tracking-wider mb-1.5">
              Admin Password
            </label>
            <input
              type="password"
              value={pw}
              onChange={(e) => { setPw(e.target.value); setErr(false); }}
              placeholder="Enter password"
              className={`w-full px-4 py-3 border rounded-xl outline-none text-sm transition-all ${err ? "border-red-400 bg-red-50" : "border-[#D1D5DB] focus:border-[#111827]"}`}
              autoFocus
            />
            {err && <p className="text-xs text-red-600 mt-1">Incorrect password</p>}
          </div>
          <button
            type="submit"
            className="w-full py-3 bg-[#111827] text-white rounded-xl text-sm font-semibold hover:bg-[#1F2937] transition-colors"
          >
            Sign In
          </button>
        </form>
      </motion.div>
    </div>
  );
}

// ─── Stat Card ────────────────────────────────────────────────────────────────
function StatCard({ label, value, icon: Icon, color }: { label: string; value: string | number; icon: React.ElementType; color: string }) {
  return (
    <div className="bg-white rounded-2xl border border-[#E5E7EB] p-5 flex items-center gap-4">
      <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${color}`}>
        <Icon className="w-6 h-6" />
      </div>
      <div>
        <p className="text-2xl font-bold text-[#111827]">{value}</p>
        <p className="text-xs text-[#6B7280] font-medium">{label}</p>
      </div>
    </div>
  );
}

// ─── Order Row ────────────────────────────────────────────────────────────────
function OrderRow({ order, onStatusChange }: { order: Order; onStatusChange: (id: string, status: OrderStatus, tracking?: string) => Promise<void> }) {
  const [expanded, setExpanded] = useState(false);
  const [updating, setUpdating] = useState(false);
  const [tracking, setTracking] = useState(order.tracking_code ?? "");
  const cfg = STATUS_CONFIG[order.status];
  const Icon = cfg.icon;

  const handleStatus = async (status: OrderStatus) => {
    setUpdating(true);
    await onStatusChange(order.id, status, tracking);
    setUpdating(false);
  };

  return (
    <div className="bg-white rounded-xl border border-[#E5E7EB] overflow-hidden">
      <div className="flex items-center gap-3 p-4 flex-wrap">
        <button onClick={() => setExpanded(!expanded)} className="mr-1">
          <ChevronDown className={`w-4 h-4 text-[#9CA3AF] transition-transform ${expanded ? "rotate-180" : ""}`} />
        </button>

        <div className="flex-1 min-w-0">
          <p className="text-xs font-mono text-[#9CA3AF]">#{order.id.slice(0, 8).toUpperCase()}</p>
          <p className="text-sm font-semibold text-[#111827] truncate">
            {order.shipping_address?.fullName}
            <span className="text-[#9CA3AF] font-normal ml-2 text-xs">{order.shipping_address?.city}</span>
          </p>
          <p className="text-xs text-[#6B7280]">{formatDate(order.placed_at)}</p>
        </div>

        <p className="text-sm font-bold text-[#111827]">{formatPKR(order.total)}</p>

        <span className={`inline-flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-full border ${cfg.bg} ${cfg.color}`}>
          <Icon className="w-3 h-3" />
          {cfg.label}
        </span>

        <select
          value={order.status}
          onChange={(e) => handleStatus(e.target.value as OrderStatus)}
          disabled={updating}
          className="text-xs border border-[#D1D5DB] rounded-lg px-2 py-1.5 outline-none hover:border-[#9CA3AF] transition-colors disabled:opacity-50 bg-white"
        >
          {ALL_STATUSES.map((s) => (
            <option key={s} value={s}>{STATUS_CONFIG[s].label}</option>
          ))}
        </select>

        {updating && <RefreshCw className="w-4 h-4 animate-spin text-[#9CA3AF]" />}
      </div>

      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="border-t border-[#F3F4F6] p-4 grid sm:grid-cols-2 gap-6">
              <div>
                <p className="text-xs font-semibold text-[#9CA3AF] uppercase tracking-wider mb-3">Items</p>
                <div className="space-y-2">
                  {order.order_items?.map((item) => (
                    <div key={item.id} className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded bg-[#F3F4F6] flex-shrink-0 overflow-hidden">
                        {item.product_snapshot?.images?.[0] && (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img src={item.product_snapshot.images[0]} alt="" className="w-full h-full object-cover" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-medium text-[#111827] truncate">{item.product_snapshot?.name}</p>
                        <p className="text-[10px] text-[#9CA3AF]">{item.size} · {item.color} · ×{item.quantity}</p>
                      </div>
                      <p className="text-xs font-semibold">{formatPKR(item.unit_price * item.quantity)}</p>
                    </div>
                  ))}
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <p className="text-xs font-semibold text-[#9CA3AF] uppercase tracking-wider mb-2">Shipping Address</p>
                  <p className="text-sm text-[#374151]">{order.shipping_address?.fullName}</p>
                  <p className="text-xs text-[#6B7280]">{order.shipping_address?.phone}</p>
                  <p className="text-xs text-[#6B7280]">{order.shipping_address?.address}</p>
                  <p className="text-xs text-[#6B7280]">{order.shipping_address?.city}, {order.shipping_address?.province}</p>
                </div>

                <div>
                  <p className="text-xs font-semibold text-[#9CA3AF] uppercase tracking-wider mb-1">
                    Payment: <span className="font-normal normal-case">{order.payment_method === "cod" ? "Cash on Delivery" : "Online Payment"}</span>
                  </p>
                  {order.notes && <p className="text-xs text-[#6B7280] italic">Note: {order.notes}</p>}
                </div>

                <div>
                  <p className="text-xs font-semibold text-[#9CA3AF] uppercase tracking-wider mb-1">Tracking Code</p>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={tracking}
                      onChange={(e) => setTracking(e.target.value)}
                      placeholder="e.g. TCS-12345678"
                      className="flex-1 px-3 py-1.5 border border-[#D1D5DB] rounded-lg text-xs outline-none focus:border-[#111827] transition-colors"
                    />
                    <button
                      onClick={() => handleStatus(order.status)}
                      className="px-3 py-1.5 bg-[#111827] text-white text-xs rounded-lg hover:bg-[#1F2937] transition-colors"
                    >
                      Save
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ─── Image Upload Component ────────────────────────────────────────────────────
function ImageUploader({
  images,
  onAdd,
  onRemove,
  uploading,
}: {
  images: string[];
  onAdd: (urls: string[]) => void;
  onRemove: (idx: number) => void;
  uploading: boolean;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const supabase = useRef(createClient()).current;
  const [localUploading, setLocalUploading] = useState(false);

  const handleFiles = async (files: FileList | null) => {
    if (!files || files.length === 0) return;
    setLocalUploading(true);
    const urls: string[] = [];

    for (const file of Array.from(files)) {
      const ext = file.name.split(".").pop();
      const path = `products/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
      const { error } = await supabase.storage.from("product-images").upload(path, file, { upsert: true });
      if (!error) {
        const { data } = supabase.storage.from("product-images").getPublicUrl(path);
        urls.push(data.publicUrl);
      }
    }

    onAdd(urls);
    setLocalUploading(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    handleFiles(e.dataTransfer.files);
  };

  return (
    <div>
      <p className="text-xs font-medium text-[#6B7280] uppercase tracking-wider mb-2">Product Images</p>

      {/* Existing images */}
      {images.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-3">
          {images.map((url, idx) => (
            <div key={idx} className="relative group w-20 h-20 rounded-lg overflow-hidden border border-[#E5E7EB]">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={url} alt="" className="w-full h-full object-cover" />
              <button
                type="button"
                onClick={() => onRemove(idx)}
                className="absolute inset-0 bg-black/50 text-white opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity"
              >
                <X className="w-4 h-4" />
              </button>
              {idx === 0 && (
                <span className="absolute bottom-0 left-0 right-0 text-[9px] text-center bg-black/60 text-white py-0.5">
                  Main
                </span>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Upload zone */}
      <div
        onDrop={handleDrop}
        onDragOver={(e) => e.preventDefault()}
        onClick={() => inputRef.current?.click()}
        className="border-2 border-dashed border-[#D1D5DB] rounded-xl p-6 text-center cursor-pointer hover:border-[#9CA3AF] hover:bg-[#F9FAFB] transition-all"
      >
        {localUploading || uploading ? (
          <RefreshCw className="w-6 h-6 animate-spin text-[#9CA3AF] mx-auto mb-2" />
        ) : (
          <Upload className="w-6 h-6 text-[#9CA3AF] mx-auto mb-2" />
        )}
        <p className="text-sm text-[#6B7280]">
          {localUploading ? "Uploading..." : "Drag & drop or click to upload"}
        </p>
        <p className="text-[11px] text-[#9CA3AF] mt-1">JPG, PNG, WebP — Max 5MB each</p>
      </div>
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        multiple
        className="hidden"
        onChange={(e) => handleFiles(e.target.files)}
      />
    </div>
  );
}

// ─── Product Form Modal ────────────────────────────────────────────────────────
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
  const [error, setError] = useState("");
  const [uploading] = useState(false);
  const [tagsInput, setTagsInput] = useState((initial?.tags ?? []).join(", "));

  const isEdit = !!initial;

  const set = (field: keyof ProductFormData, value: unknown) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    if (field === "name" && !isEdit) {
      setForm((prev) => ({ ...prev, name: value as string, slug: toSlug(value as string) }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (!form.name.trim()) { setError("Product name is required"); return; }
    if (!form.slug.trim()) { setError("Slug is required"); return; }
    if (form.price <= 0) { setError("Price must be greater than 0"); return; }
    if (form.images.length === 0) { setError("At least one image is required"); return; }

    setSaving(true);
    try {
      await onSave({ ...form, tags: tagsInput.split(",").map(t => t.trim()).filter(Boolean) });
      onClose();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to save product");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/50 flex items-start justify-center p-4 overflow-y-auto">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-2xl bg-white rounded-2xl shadow-2xl my-8"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#E5E7EB]">
          <h2 className="font-serif text-xl text-[#111827]">
            {isEdit ? "Edit Product" : "Add New Product"}
          </h2>
          <button onClick={onClose} className="p-1.5 text-[#6B7280] hover:text-[#111827]">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {error && (
            <div className="flex items-center gap-2 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl text-sm">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              {error}
            </div>
          )}

          {/* Image Upload */}
          <ImageUploader
            images={form.images}
            onAdd={(urls) => set("images", [...form.images, ...urls])}
            onRemove={(idx) => set("images", form.images.filter((_, i) => i !== idx))}
            uploading={uploading}
          />

          {/* Name + Slug */}
          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-[#6B7280] uppercase tracking-wider mb-1.5">Product Name *</label>
              <input
                type="text"
                value={form.name}
                onChange={(e) => set("name", e.target.value)}
                placeholder="e.g. Royal Velvet Abaya"
                className="w-full px-3 py-2.5 border border-[#D1D5DB] rounded-xl text-sm outline-none focus:border-[#111827] transition-colors"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-[#6B7280] uppercase tracking-wider mb-1.5">Slug *</label>
              <input
                type="text"
                value={form.slug}
                onChange={(e) => set("slug", e.target.value)}
                placeholder="royal-velvet-abaya"
                className="w-full px-3 py-2.5 border border-[#D1D5DB] rounded-xl text-sm outline-none focus:border-[#111827] transition-colors font-mono"
              />
            </div>
          </div>

          {/* Category + Price + Original Price */}
          <div className="grid sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-medium text-[#6B7280] uppercase tracking-wider mb-1.5">Category *</label>
              <select
                value={form.category}
                onChange={(e) => set("category", e.target.value)}
                className="w-full px-3 py-2.5 border border-[#D1D5DB] rounded-xl text-sm outline-none focus:border-[#111827] transition-colors bg-white"
              >
                {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-[#6B7280] uppercase tracking-wider mb-1.5">Price (Rs.) *</label>
              <input
                type="number"
                value={form.price || ""}
                onChange={(e) => set("price", Number(e.target.value))}
                min={0}
                placeholder="5999"
                className="w-full px-3 py-2.5 border border-[#D1D5DB] rounded-xl text-sm outline-none focus:border-[#111827] transition-colors"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-[#6B7280] uppercase tracking-wider mb-1.5">Original Price (Rs.)</label>
              <input
                type="number"
                value={form.original_price || ""}
                onChange={(e) => set("original_price", e.target.value ? Number(e.target.value) : undefined)}
                min={0}
                placeholder="7999"
                className="w-full px-3 py-2.5 border border-[#D1D5DB] rounded-xl text-sm outline-none focus:border-[#111827] transition-colors"
              />
            </div>
          </div>

          {/* Stock + SKU */}
          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-[#6B7280] uppercase tracking-wider mb-1.5">Stock Quantity</label>
              <input
                type="number"
                value={form.stock}
                onChange={(e) => set("stock", Number(e.target.value))}
                min={0}
                className="w-full px-3 py-2.5 border border-[#D1D5DB] rounded-xl text-sm outline-none focus:border-[#111827] transition-colors"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-[#6B7280] uppercase tracking-wider mb-1.5">SKU</label>
              <input
                type="text"
                value={form.sku ?? ""}
                onChange={(e) => set("sku", e.target.value)}
                placeholder="AMB-001"
                className="w-full px-3 py-2.5 border border-[#D1D5DB] rounded-xl text-sm outline-none focus:border-[#111827] transition-colors"
              />
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs font-medium text-[#6B7280] uppercase tracking-wider mb-1.5">Short Description</label>
            <textarea
              value={form.description ?? ""}
              onChange={(e) => set("description", e.target.value)}
              rows={2}
              placeholder="Brief product description..."
              className="w-full px-3 py-2.5 border border-[#D1D5DB] rounded-xl text-sm outline-none focus:border-[#111827] transition-colors resize-none"
            />
          </div>

          {/* Long Description */}
          <div>
            <label className="block text-xs font-medium text-[#6B7280] uppercase tracking-wider mb-1.5">Full Description</label>
            <textarea
              value={form.long_description ?? ""}
              onChange={(e) => set("long_description", e.target.value)}
              rows={4}
              placeholder="Detailed product description, fabric details, care instructions..."
              className="w-full px-3 py-2.5 border border-[#D1D5DB] rounded-xl text-sm outline-none focus:border-[#111827] transition-colors resize-none"
            />
          </div>

          {/* Material + Tags */}
          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-[#6B7280] uppercase tracking-wider mb-1.5">Material</label>
              <input
                type="text"
                value={form.material ?? ""}
                onChange={(e) => set("material", e.target.value)}
                placeholder="Premium Nida Fabric"
                className="w-full px-3 py-2.5 border border-[#D1D5DB] rounded-xl text-sm outline-none focus:border-[#111827] transition-colors"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-[#6B7280] uppercase tracking-wider mb-1.5">Tags (comma separated)</label>
              <input
                type="text"
                value={tagsInput}
                onChange={(e) => setTagsInput(e.target.value)}
                placeholder="abaya, modest, new arrival"
                className="w-full px-3 py-2.5 border border-[#D1D5DB] rounded-xl text-sm outline-none focus:border-[#111827] transition-colors"
              />
            </div>
          </div>

          {/* Sizes */}
          <div>
            <label className="block text-xs font-medium text-[#6B7280] uppercase tracking-wider mb-2">Available Sizes</label>
            <div className="flex flex-wrap gap-2">
              {form.sizes.map((size, idx) => (
                <button
                  key={size.label}
                  type="button"
                  onClick={() => {
                    const newSizes = [...form.sizes];
                    newSizes[idx] = { ...size, available: !size.available };
                    set("sizes", newSizes);
                  }}
                  className={`px-3 py-1.5 text-xs font-medium border rounded-lg transition-colors ${
                    size.available
                      ? "bg-[#111827] text-white border-[#111827]"
                      : "bg-white text-[#9CA3AF] border-[#D1D5DB]"
                  }`}
                >
                  {size.label}
                </button>
              ))}
            </div>
          </div>

          {/* Flags */}
          <div className="flex flex-wrap gap-4">
            {([
              { field: "is_new", label: "New Arrival" },
              { field: "is_bestseller", label: "Bestseller" },
              { field: "featured", label: "Featured on Homepage" },
            ] as const).map(({ field, label }) => (
              <label key={field} className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={form[field] as boolean}
                  onChange={(e) => set(field, e.target.checked)}
                  className="w-4 h-4 accent-[#111827]"
                />
                <span className="text-sm text-[#374151]">{label}</span>
              </label>
            ))}
          </div>

          {/* Footer */}
          <div className="flex justify-end gap-3 pt-2 border-t border-[#F3F4F6]">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 text-sm text-[#6B7280] border border-[#D1D5DB] rounded-xl hover:bg-[#F9FAFB] transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="px-5 py-2.5 text-sm bg-[#111827] text-white rounded-xl hover:bg-[#1F2937] transition-colors disabled:opacity-60 flex items-center gap-2"
            >
              {saving ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
              {saving ? "Saving..." : isEdit ? "Update Product" : "Add Product"}
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
}

// ─── Products Tab ─────────────────────────────────────────────────────────────
function ProductsTab() {
  const supabase = useRef(createClient()).current;
  const [products, setProducts] = useState<ProductRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [modalOpen, setModalOpen] = useState(false);
  const [editProduct, setEditProduct] = useState<ProductRow | undefined>();
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);

  const fetchProducts = useCallback(async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("products")
      .select("*")
      .order("created_at", { ascending: false });
    if (!error && data) setProducts(data as ProductRow[]);
    setLoading(false);
  }, [supabase]);

  useEffect(() => { fetchProducts(); }, [fetchProducts]);

  const handleSave = async (formData: ProductFormData) => {
    if (formData.id) {
      // Update
      const { id, ...rest } = formData;
      const { error } = await supabase.from("products").update(rest).eq("id", id);
      if (error) throw new Error(error.message);
    } else {
      // Insert
      const { id: _id, ...rest } = formData;
      const { error } = await supabase.from("products").insert(rest);
      if (error) throw new Error(error.message);
    }
    await fetchProducts();
  };

  const handleDelete = async (id: string) => {
    setDeleting(true);
    const { error } = await supabase.from("products").delete().eq("id", id);
    if (!error) {
      setProducts((prev) => prev.filter((p) => p.id !== id));
    }
    setDeleteConfirm(null);
    setDeleting(false);
  };

  const filtered = products.filter((p) => {
    const matchCat = categoryFilter === "all" || p.category === categoryFilter;
    const q = search.toLowerCase();
    const matchSearch = !q || p.name.toLowerCase().includes(q) || p.slug.toLowerCase().includes(q);
    return matchCat && matchSearch;
  });

  return (
    <div className="space-y-4">
      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <h2 className="text-xl font-serif font-medium text-[#111827]">Products</h2>
        <div className="flex items-center gap-3 w-full sm:w-auto">
          <div className="relative flex-1 sm:w-56">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[#9CA3AF]" />
            <input
              type="text"
              placeholder="Search products..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-3 py-2 border border-[#D1D5DB] rounded-xl text-sm outline-none focus:border-[#111827] bg-white"
            />
          </div>
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="px-3 py-2 border border-[#D1D5DB] rounded-xl text-sm outline-none bg-white"
          >
            <option value="all">All Categories</option>
            {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
          </select>
          <button
            onClick={fetchProducts}
            className="p-2 text-[#6B7280] hover:text-[#111827] transition-colors"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
          </button>
          <button
            onClick={() => { setEditProduct(undefined); setModalOpen(true); }}
            className="flex items-center gap-2 px-4 py-2 bg-[#111827] text-white rounded-xl text-sm font-medium hover:bg-[#1F2937] transition-colors whitespace-nowrap"
          >
            <Plus className="w-4 h-4" />
            Add Product
          </button>
        </div>
      </div>

      {/* Products Table */}
      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="bg-white rounded-xl border border-[#E5E7EB] p-4 animate-pulse h-16" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-xl border border-[#E5E7EB]">
          <Package className="w-12 h-12 text-[#D1D5DB] mx-auto mb-3" />
          <p className="text-[#6B7280]">
            {search || categoryFilter !== "all" ? "No products match your filter." : "No products yet. Add your first product!"}
          </p>
          {!search && categoryFilter === "all" && (
            <button
              onClick={() => { setEditProduct(undefined); setModalOpen(true); }}
              className="mt-4 inline-flex items-center gap-2 px-4 py-2 bg-[#111827] text-white rounded-xl text-sm font-medium hover:bg-[#1F2937] transition-colors"
            >
              <Plus className="w-4 h-4" /> Add First Product
            </button>
          )}
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-[#E5E7EB] overflow-hidden">
          {/* Table header */}
          <div className="grid grid-cols-[2fr_1fr_1fr_1fr_auto] gap-4 px-4 py-2.5 bg-[#F9FAFB] border-b border-[#E5E7EB] text-[11px] font-semibold text-[#9CA3AF] uppercase tracking-wider">
            <span>Product</span>
            <span>Category</span>
            <span>Price</span>
            <span>Stock</span>
            <span>Actions</span>
          </div>

          <div className="divide-y divide-[#F3F4F6]">
            {filtered.map((p) => (
              <div key={p.id} className="grid grid-cols-[2fr_1fr_1fr_1fr_auto] gap-4 px-4 py-3 items-center hover:bg-[#F9FAFB] transition-colors">
                {/* Product info */}
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-10 h-10 rounded-lg bg-[#F3F4F6] flex-shrink-0 overflow-hidden">
                    {p.images?.[0] ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={p.images[0]} alt="" className="w-full h-full object-cover" />
                    ) : (
                      <ImageIcon className="w-5 h-5 text-[#D1D5DB] m-auto mt-2.5" />
                    )}
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-[#111827] truncate">{p.name}</p>
                    <p className="text-[11px] text-[#9CA3AF] truncate font-mono">{p.slug}</p>
                    <div className="flex gap-1 mt-0.5 flex-wrap">
                      {p.is_new && <span className="text-[9px] px-1.5 py-0.5 bg-emerald-100 text-emerald-700 rounded-full font-semibold">NEW</span>}
                      {p.is_bestseller && <span className="text-[9px] px-1.5 py-0.5 bg-amber-100 text-amber-700 rounded-full font-semibold">BEST</span>}
                      {p.featured && <span className="text-[9px] px-1.5 py-0.5 bg-blue-100 text-blue-700 rounded-full font-semibold">FEATURED</span>}
                    </div>
                  </div>
                </div>

                <span className="text-sm text-[#374151]">{p.category}</span>
                <div>
                  <p className="text-sm font-semibold text-[#111827]">{formatPKR(p.price)}</p>
                  {p.original_price && (
                    <p className="text-[11px] text-[#9CA3AF] line-through">{formatPKR(p.original_price)}</p>
                  )}
                </div>
                <span className={`text-sm font-medium ${p.stock <= 5 ? "text-red-600" : "text-[#374151]"}`}>
                  {p.stock} {p.stock <= 5 && p.stock > 0 ? <span className="text-[10px] text-red-500">(Low)</span> : p.stock === 0 ? <span className="text-[10px] text-red-600">(Out)</span> : null}
                </span>

                {/* Actions */}
                <div className="flex items-center gap-1.5">
                  <a
                    href={`/products/${p.slug}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-1.5 text-[#6B7280] hover:text-[#111827] rounded-lg hover:bg-[#F3F4F6] transition-colors"
                    title="View on site"
                  >
                    <Eye className="w-4 h-4" />
                  </a>
                  <button
                    onClick={() => { setEditProduct(p); setModalOpen(true); }}
                    className="p-1.5 text-[#6B7280] hover:text-[#111827] rounded-lg hover:bg-[#F3F4F6] transition-colors"
                    title="Edit"
                  >
                    <Edit3 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => setDeleteConfirm(p.id)}
                    className="p-1.5 text-[#6B7280] hover:text-red-600 rounded-lg hover:bg-red-50 transition-colors"
                    title="Delete"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Product Form Modal */}
      <AnimatePresence>
        {modalOpen && (
          <ProductFormModal
            initial={editProduct}
            onSave={handleSave}
            onClose={() => { setModalOpen(false); setEditProduct(undefined); }}
          />
        )}
      </AnimatePresence>

      {/* Delete Confirm Modal */}
      <AnimatePresence>
        {deleteConfirm && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4"
          >
            <motion.div
              initial={{ scale: 0.95 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.95 }}
              className="bg-white rounded-2xl p-6 max-w-sm w-full shadow-2xl"
            >
              <div className="flex items-start gap-4 mb-5">
                <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center flex-shrink-0">
                  <Trash2 className="w-5 h-5 text-red-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-[#111827] text-lg">Delete Product?</h3>
                  <p className="text-sm text-[#6B7280] mt-1">
                    This action cannot be undone. The product will be permanently removed from your store.
                  </p>
                </div>
              </div>
              <div className="flex gap-3">
                <button
                  onClick={() => setDeleteConfirm(null)}
                  className="flex-1 py-2.5 border border-[#D1D5DB] rounded-xl text-sm text-[#374151] hover:bg-[#F9FAFB] transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={() => handleDelete(deleteConfirm)}
                  disabled={deleting}
                  className="flex-1 py-2.5 bg-red-600 text-white rounded-xl text-sm font-medium hover:bg-red-700 transition-colors disabled:opacity-60 flex items-center justify-center gap-2"
                >
                  {deleting ? <RefreshCw className="w-4 h-4 animate-spin" /> : null}
                  Delete
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ─── Orders Tab ────────────────────────────────────────────────────────────────
function OrdersTab() {
  const supabase = useRef(createClient()).current;
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<OrderStatus | "all">("all");

  const fetchOrders = useCallback(async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("orders")
      .select(`
        id, user_id, status, total, shipping_cost, payment_method,
        placed_at, tracking_code, notes, shipping_address,
        order_items (id, product_snapshot, quantity, size, color, unit_price)
      `)
      .order("placed_at", { ascending: false });

    if (!error && data) setOrders(data as Order[]);
    setLoading(false);
  }, [supabase]);

  const handleStatusChange = async (id: string, status: OrderStatus, tracking?: string) => {
    const updateData: Record<string, unknown> = { status };
    if (tracking !== undefined) updateData.tracking_code = tracking;

    const { error } = await supabase
      .from("orders")
      .update(updateData)
      .eq("id", id);

    if (!error) {
      setOrders((prev) =>
        prev.map((o) => o.id === id ? { ...o, status, tracking_code: tracking ?? o.tracking_code } : o)
      );
    }
  };

  useEffect(() => { fetchOrders(); }, [fetchOrders]);

  const totalRevenue = orders.filter((o) => o.status !== "cancelled").reduce((sum, o) => sum + o.total, 0);
  const todayOrders = orders.filter((o) => new Date(o.placed_at).toDateString() === new Date().toDateString()).length;

  const filtered = orders.filter((o) => {
    const matchStatus = statusFilter === "all" || o.status === statusFilter;
    const q = search.toLowerCase();
    const matchSearch = !q
      || o.id.toLowerCase().includes(q)
      || o.shipping_address?.fullName?.toLowerCase().includes(q)
      || o.shipping_address?.phone?.includes(q)
      || o.shipping_address?.city?.toLowerCase().includes(q);
    return matchStatus && matchSearch;
  });

  return (
    <div className="space-y-6">
      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Total Orders" value={orders.length} icon={ShoppingBag} color="bg-blue-50 text-blue-600" />
        <StatCard label="Today's Orders" value={todayOrders} icon={TrendingUp} color="bg-amber-50 text-amber-600" />
        <StatCard label="Total Revenue" value={`Rs. ${(totalRevenue / 1000).toFixed(0)}k`} icon={DollarSign} color="bg-emerald-50 text-emerald-600" />
        <StatCard label="Pending" value={orders.filter((o) => o.status === "placed").length} icon={Clock} color="bg-purple-50 text-purple-600" />
      </div>

      {/* Orders Panel */}
      <div>
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-4">
          <h2 className="text-xl font-serif font-medium text-[#111827]">Orders</h2>
          <div className="flex items-center gap-3 w-full sm:w-auto">
            <div className="relative flex-1 sm:w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[#9CA3AF]" />
              <input
                type="text"
                placeholder="Name, phone, city..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-9 pr-3 py-2 border border-[#D1D5DB] rounded-xl text-sm outline-none focus:border-[#111827] bg-white"
              />
            </div>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as OrderStatus | "all")}
              className="px-3 py-2 border border-[#D1D5DB] rounded-xl text-sm outline-none bg-white"
            >
              <option value="all">All</option>
              {ALL_STATUSES.map((s) => (
                <option key={s} value={s}>{STATUS_CONFIG[s].label}</option>
              ))}
            </select>
            <button onClick={fetchOrders} className="p-2 text-[#6B7280] hover:text-[#111827] transition-colors">
              <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
            </button>
          </div>
        </div>

        {loading ? (
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="bg-white rounded-xl border border-[#E5E7EB] p-4 animate-pulse h-20" />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-xl border border-[#E5E7EB]">
            <Package className="w-12 h-12 text-[#D1D5DB] mx-auto mb-3" />
            <p className="text-[#6B7280]">
              {search || statusFilter !== "all" ? "No orders match your filter." : "No orders yet."}
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {filtered.map((order) => (
              <OrderRow key={order.id} order={order} onStatusChange={handleStatusChange} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Admin Dashboard ──────────────────────────────────────────────────────────
function AdminDashboard({ onLogout }: { onLogout: () => void }) {
  const [activeTab, setActiveTab] = useState<AdminTab>("orders");

  const tabs: { id: AdminTab; label: string; icon: React.ElementType }[] = [
    { id: "orders", label: "Orders", icon: ShoppingBag },
    { id: "products", label: "Products", icon: LayoutGrid },
  ];

  return (
    <div className="min-h-screen bg-[#F9FAFB]">
      {/* Top bar */}
      <div className="bg-[#111827] text-white px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-6">
          <div>
            <span className="font-serif text-xl font-medium tracking-[0.2em]">AMABAYA</span>
            <span className="ml-3 text-xs text-white/50 uppercase tracking-widest">Admin</span>
          </div>
          {/* Tab Nav */}
          <nav className="flex items-center gap-1">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-colors ${
                  activeTab === tab.id
                    ? "bg-white/15 text-white"
                    : "text-white/60 hover:text-white hover:bg-white/10"
                }`}
              >
                <tab.icon className="w-4 h-4" />
                {tab.label}
              </button>
            ))}
          </nav>
        </div>
        <button
          onClick={onLogout}
          className="flex items-center gap-2 text-sm text-white/70 hover:text-white transition-colors"
        >
          <LogOut className="w-4 h-4" /> Sign Out
        </button>
      </div>

      {/* Content */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.18 }}
          >
            {activeTab === "orders" ? <OrdersTab /> : <ProductsTab />}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function AdminPage() {
  const [authed, setAuthed] = useState<boolean | null>(null);

  useEffect(() => {
    setAuthed(sessionStorage.getItem("amabaya_admin") === "1");
  }, []);

  const handleLogin = () => setAuthed(true);
  const handleLogout = () => {
    sessionStorage.removeItem("amabaya_admin");
    setAuthed(false);
  };

  if (authed === null) return null; // hydration guard

  if (!authed) return <AdminLogin onLogin={handleLogin} />;

  return <AdminDashboard onLogout={handleLogout} />;
}
