"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  User,
  Package,
  MapPin,
  ChevronDown,
  ChevronRight,
  Edit3,
  Save,
  Plus,
  Trash2,
  CheckCircle,
  Clock,
  Truck,
  PackageCheck,
  LogOut,
  X,
  RefreshCw,
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { createClient } from "@/lib/supabase/client";
import { toast } from "@/components/ui/Toaster";
import { useRouter } from "next/navigation";
import type { SavedAddress } from "@/types";

// ─── Types ───────────────────────────────────────────────────────────────────

interface OrderItem {
  id: string;
  product_snapshot: {
    name: string;
    slug?: string;
    images?: string[];
  };
  quantity: number;
  size: string;
  color: string;
  unit_price: number;
}

interface Order {
  id: string;
  status: "placed" | "processing" | "shipped" | "delivered" | "cancelled";
  total: number;
  shipping_cost: number;
  payment_method: string;
  placed_at: string;
  tracking_code?: string;
  shipping_address: {
    fullName: string;
    phone: string;
    address: string;
    city: string;
    province: string;
  };
  order_items: OrderItem[];
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

const STATUS_CONFIG = {
  placed:     { label: "Order Placed",  icon: CheckCircle,  color: "text-blue-600 bg-blue-50 border-blue-200" },
  processing: { label: "Processing",   icon: Clock,         color: "text-amber-600 bg-amber-50 border-amber-200" },
  shipped:    { label: "Shipped",       icon: Truck,         color: "text-purple-600 bg-purple-50 border-purple-200" },
  delivered:  { label: "Delivered",     icon: PackageCheck,  color: "text-emerald-600 bg-emerald-50 border-emerald-200" },
  cancelled:  { label: "Cancelled",     icon: X,             color: "text-red-600 bg-red-50 border-red-200" },
};

function formatPKR(amount: number) {
  return `Rs. ${amount.toLocaleString("en-PK")}`;
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-PK", {
    day: "numeric", month: "long", year: "numeric",
  });
}

// ─── Tabs ─────────────────────────────────────────────────────────────────────

const TABS = [
  { id: "profile",   label: "Profile",    icon: User },
  { id: "orders",   label: "My Orders",  icon: Package },
  { id: "addresses", label: "Addresses", icon: MapPin },
] as const;
type TabId = (typeof TABS)[number]["id"];

// ─── ProfileTab ───────────────────────────────────────────────────────────────

function ProfileTab() {
  const { user, updateProfile, logout } = useAuth();
  const router = useRouter();
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({ name: user?.name ?? "", phone: user?.phone ?? "" });
  const [saving, setSaving] = useState(false);

  // Keep form in sync if user loads after mount
  useEffect(() => {
    setForm({ name: user?.name ?? "", phone: user?.phone ?? "" });
  }, [user]);

  const handleSave = async () => {
    setSaving(true);
    try {
      await updateProfile({ full_name: form.name, phone: form.phone });
      toast.success("Profile updated", "Your changes have been saved.");
      setEditing(false);
    } catch (err: unknown) {
      toast.error("Update failed", err instanceof Error ? err.message : "Please try again.");
    } finally {
      setSaving(false);
    }
  };

  const handleLogout = async () => {
    await logout();
    router.push("/");
  };

  if (!user) return null;

  const initials = user.name.split(" ").map((w) => w[0]).join("").slice(0, 2).toUpperCase();

  return (
    <div className="space-y-6">
      {/* Avatar banner */}
      <div className="flex items-center gap-5 p-6 bg-gradient-to-r from-[#FFFBF5] to-[#FDF6EC] rounded-2xl border border-[#F3EAE0]">
        <div className="w-16 h-16 rounded-full bg-gradient-to-br from-[var(--color-gold-light)] to-[var(--color-gold-dark)] flex items-center justify-center text-white text-xl font-bold shadow-md flex-shrink-0">
          {initials}
        </div>
        <div>
          <h2 className="text-lg font-semibold text-[#111827]">{user.name}</h2>
          <p className="text-sm text-[#6B7280]">{user.email}</p>
          <p className="text-xs text-[#9CA3AF] mt-0.5">Member since {formatDate(user.createdAt)}</p>
        </div>
      </div>

      {/* Edit form */}
      <div className="bg-white rounded-2xl border border-[#E5E7EB] overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#F3F4F6]">
          <h3 className="font-semibold text-[#111827]">Personal Information</h3>
          {!editing ? (
            <button onClick={() => setEditing(true)} className="flex items-center gap-1.5 text-sm text-[var(--color-gold)] hover:text-[var(--color-gold-dark)] transition-colors">
              <Edit3 className="w-3.5 h-3.5" /> Edit
            </button>
          ) : (
            <div className="flex items-center gap-3">
              <button onClick={() => { setEditing(false); setForm({ name: user.name, phone: user.phone ?? "" }); }} className="text-sm text-[#6B7280] hover:text-[#374151]">Cancel</button>
              <button onClick={handleSave} disabled={saving} className="flex items-center gap-1.5 text-sm font-medium text-white bg-[var(--color-gold)] hover:bg-[var(--color-gold-dark)] px-3 py-1.5 rounded-lg transition-colors disabled:opacity-60">
                <Save className="w-3.5 h-3.5" />
                {saving ? "Saving..." : "Save"}
              </button>
            </div>
          )}
        </div>
        <div className="grid sm:grid-cols-2 gap-5 p-6">
          {[
            { label: "Full Name", key: "name", type: "text", placeholder: "Your name" },
            { label: "Phone Number", key: "phone", type: "tel", placeholder: "03XX-XXXXXXX" },
          ].map(({ label, key, type, placeholder }) => (
            <div key={key}>
              <label className="block text-xs font-medium text-[#6B7280] uppercase tracking-wider mb-1.5">{label}</label>
              {editing ? (
                <input type={type} value={form[key as keyof typeof form]} onChange={(e) => setForm((p) => ({ ...p, [key]: e.target.value }))} placeholder={placeholder}
                  className="w-full px-3.5 py-2.5 border border-[#D1D5DB] rounded-xl text-sm outline-none focus:border-[var(--color-gold)] focus:ring-2 focus:ring-[var(--color-gold)]/20 transition-all" />
              ) : (
                <p className="text-sm text-[#111827] font-medium">{form[key as keyof typeof form] || <span className="text-[#9CA3AF]">Not set</span>}</p>
              )}
            </div>
          ))}
          <div>
            <label className="block text-xs font-medium text-[#6B7280] uppercase tracking-wider mb-1.5">Email</label>
            <p className="text-sm text-[#111827] font-medium">{user.email}</p>
            <p className="text-[10px] text-[#9CA3AF] mt-0.5">Email cannot be changed here</p>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-[#E5E7EB] p-6">
        <h3 className="font-semibold text-[#111827] mb-4">Account Actions</h3>
        <button onClick={handleLogout} className="flex items-center gap-2 text-sm text-red-600 hover:text-red-700 font-medium transition-colors">
          <LogOut className="w-4 h-4" /> Sign Out
        </button>
      </div>
    </div>
  );
}

// ─── OrdersTab ────────────────────────────────────────────────────────────────

function OrdersTab() {
  const { user } = useAuth();
  const supabase = useRef(createClient()).current;
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState<string | null>(null);

  const fetchOrders = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    const { data, error } = await supabase
      .from("orders")
      .select(`
        id, status, total, shipping_cost, payment_method,
        placed_at, tracking_code, shipping_address,
        order_items (
          id, quantity, size, color, unit_price, product_snapshot
        )
      `)
      .eq("user_id", user.id)
      .order("placed_at", { ascending: false });

    if (error) {
      console.error("Orders fetch error:", error);
      toast.error("Could not load orders", error.message);
    } else {
      setOrders((data as Order[]) ?? []);
    }
    setLoading(false);
  }, [user, supabase]);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  if (loading) {
    return (
      <div className="space-y-4">
        {[1, 2].map((i) => (
          <div key={i} className="bg-white rounded-2xl border border-[#E5E7EB] p-5 animate-pulse">
            <div className="h-4 bg-[#F3F4F6] rounded w-1/3 mb-2" />
            <div className="h-3 bg-[#F3F4F6] rounded w-1/4" />
          </div>
        ))}
      </div>
    );
  }

  if (orders.length === 0) {
    return (
      <div className="text-center py-16">
        <Package className="w-12 h-12 text-[#D1D5DB] mx-auto mb-4" />
        <h3 className="text-base font-semibold text-[#374151] mb-2">No orders yet</h3>
        <p className="text-sm text-[#6B7280] mb-4">Your order history will appear here once you place an order while signed in.</p>
        <button onClick={fetchOrders} className="flex items-center gap-2 text-sm text-[var(--color-gold)] mx-auto">
          <RefreshCw className="w-3.5 h-3.5" /> Refresh
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between mb-2">
        <p className="text-sm text-[#6B7280]">{orders.length} order{orders.length !== 1 ? "s" : ""}</p>
        <button onClick={fetchOrders} className="flex items-center gap-1.5 text-xs text-[#9CA3AF] hover:text-[var(--color-gold)] transition-colors">
          <RefreshCw className="w-3 h-3" /> Refresh
        </button>
      </div>

      {orders.map((order) => {
        const cfg = STATUS_CONFIG[order.status] ?? STATUS_CONFIG.placed;
        const StatusIcon = cfg.icon;
        const isOpen = expanded === order.id;

        return (
          <div key={order.id} className="bg-white rounded-2xl border border-[#E5E7EB] overflow-hidden">
            <button
              onClick={() => setExpanded(isOpen ? null : order.id)}
              className="w-full flex items-center justify-between p-5 hover:bg-[#FAFAFA] transition-colors text-left"
            >
              <div>
                <p className="text-xs text-[#9CA3AF] font-mono mb-0.5">#{order.id.slice(0, 8).toUpperCase()}</p>
                <p className="text-sm font-semibold text-[#111827]">{formatPKR(order.total)}</p>
                <p className="text-xs text-[#6B7280] mt-0.5">{formatDate(order.placed_at)}</p>
              </div>
              <div className="flex items-center gap-3">
                <span className={`inline-flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-full border ${cfg.color}`}>
                  <StatusIcon className="w-3 h-3" />
                  {cfg.label}
                </span>
                <ChevronDown className={`w-4 h-4 text-[#9CA3AF] transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`} />
              </div>
            </button>

            <AnimatePresence>
              {isOpen && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.2 }}
                  className="overflow-hidden"
                >
                  <div className="border-t border-[#F3F4F6] px-5 py-4 space-y-3">
                    {order.order_items?.map((item) => (
                      <div key={item.id} className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-[#F9FAFB] flex items-center justify-center flex-shrink-0 overflow-hidden">
                          {item.product_snapshot?.images?.[0] ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img src={item.product_snapshot.images[0]} alt={item.product_snapshot.name} className="w-full h-full object-cover rounded-lg" />
                          ) : (
                            <Package className="w-5 h-5 text-[#D1D5DB]" />
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-[#111827] truncate">{item.product_snapshot?.name}</p>
                          <p className="text-xs text-[#6B7280]">{item.size} · {item.color} · Qty {item.quantity}</p>
                        </div>
                        <p className="text-sm font-semibold text-[#374151] flex-shrink-0">{formatPKR(item.unit_price * item.quantity)}</p>
                      </div>
                    ))}

                    <div className="pt-3 border-t border-[#F3F4F6] space-y-1.5">
                      <div className="flex justify-between text-xs text-[#6B7280]">
                        <span>Shipping</span>
                        <span>{order.shipping_cost === 0 ? "Free" : formatPKR(order.shipping_cost)}</span>
                      </div>
                      <div className="flex justify-between text-sm font-semibold text-[#111827]">
                        <span>Total</span>
                        <span>{formatPKR(order.total)}</span>
                      </div>
                      <div className="flex justify-between text-xs text-[#6B7280]">
                        <span>Payment</span>
                        <span>{order.payment_method === "cod" ? "Cash on Delivery" : "Bank Transfer"}</span>
                      </div>
                      {order.tracking_code && (
                        <div className="flex justify-between text-xs">
                          <span className="text-[#6B7280]">Tracking</span>
                          <span className="font-mono text-[var(--color-gold)]">{order.tracking_code}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        );
      })}
    </div>
  );
}

// ─── AddressesTab ─────────────────────────────────────────────────────────────

function AddressesTab() {
  const { user, updateProfile } = useAuth();
  const [addresses, setAddresses] = useState<SavedAddress[]>(user?.addresses ?? []);
  const [showForm, setShowForm] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState<Omit<SavedAddress, "id" | "isDefault">>({
    label: "Home", fullName: "", phone: "", address: "", city: "", province: "", postalCode: "",
  });

  useEffect(() => {
    setAddresses(user?.addresses ?? []);
  }, [user]);

  const handleAdd = async () => {
    if (!form.fullName || !form.address || !form.city) {
      toast.error("Missing fields", "Please fill in required fields.");
      return;
    }
    setSaving(true);
    const newAddr: SavedAddress = { ...form, id: `addr_${Date.now()}`, isDefault: addresses.length === 0 };
    const updated = [...addresses, newAddr];
    try {
      await updateProfile({ addresses: updated });
      setAddresses(updated);
      setShowForm(false);
      setForm({ label: "Home", fullName: "", phone: "", address: "", city: "", province: "", postalCode: "" });
      toast.success("Address saved", "");
    } catch (err: unknown) {
      toast.error("Save failed", err instanceof Error ? err.message : "Please try again.");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    const updated = addresses.filter((a) => a.id !== id);
    try {
      await updateProfile({ addresses: updated });
      setAddresses(updated);
      toast.success("Address removed", "");
    } catch {
      toast.error("Remove failed", "Please try again.");
    }
  };

  const handleSetDefault = async (id: string) => {
    const updated = addresses.map((a) => ({ ...a, isDefault: a.id === id }));
    try {
      await updateProfile({ addresses: updated });
      setAddresses(updated);
    } catch {
      toast.error("Update failed", "");
    }
  };

  return (
    <div className="space-y-4">
      {addresses.length === 0 && !showForm && (
        <div className="text-center py-12">
          <MapPin className="w-10 h-10 text-[#D1D5DB] mx-auto mb-3" />
          <p className="text-sm text-[#6B7280]">No saved addresses yet.</p>
        </div>
      )}

      {addresses.map((addr) => (
        <div key={addr.id} className={`relative bg-white rounded-2xl border p-5 transition-all ${addr.isDefault ? "border-[var(--color-gold)] shadow-sm" : "border-[#E5E7EB]"}`}>
          {addr.isDefault && (
            <span className="absolute top-4 right-4 text-[10px] font-semibold text-[var(--color-gold)] bg-[#FFF8F0] px-2 py-0.5 rounded-full border border-[var(--color-gold)]/30">Default</span>
          )}
          <p className="text-xs font-semibold text-[#9CA3AF] uppercase tracking-wider mb-1">{addr.label}</p>
          <p className="font-semibold text-[#111827]">{addr.fullName}</p>
          <p className="text-sm text-[#6B7280]">{addr.address}</p>
          <p className="text-sm text-[#6B7280]">{addr.city}, {addr.province} {addr.postalCode}</p>
          <p className="text-sm text-[#6B7280]">{addr.phone}</p>
          <div className="flex items-center gap-3 mt-3 pt-3 border-t border-[#F3F4F6]">
            {!addr.isDefault && (
              <button onClick={() => handleSetDefault(addr.id)} className="text-xs text-[var(--color-gold)] hover:underline">Set as Default</button>
            )}
            <button onClick={() => handleDelete(addr.id)} className="ml-auto flex items-center gap-1 text-xs text-red-400 hover:text-red-600 transition-colors">
              <Trash2 className="w-3 h-3" /> Remove
            </button>
          </div>
        </div>
      ))}

      {showForm ? (
        <div className="bg-white rounded-2xl border border-[#E5E7EB] p-5 space-y-4">
          <h4 className="font-semibold text-[#111827]">New Address</h4>
          <div className="grid sm:grid-cols-2 gap-4">
            {[
              { key: "label", label: "Label", placeholder: "Home / Office" },
              { key: "fullName", label: "Full Name *", placeholder: "Recipient name" },
              { key: "phone", label: "Phone", placeholder: "03XX-XXXXXXX" },
              { key: "address", label: "Street Address *", placeholder: "House / flat / street", span: true },
              { key: "city", label: "City *", placeholder: "Lahore" },
              { key: "province", label: "Province", placeholder: "Punjab" },
              { key: "postalCode", label: "Postal Code", placeholder: "54000" },
            ].map(({ key, label, placeholder, span }) => (
              <div key={key} className={span ? "sm:col-span-2" : ""}>
                <label className="block text-xs font-medium text-[#6B7280] mb-1">{label}</label>
                <input type="text" value={form[key as keyof typeof form]} onChange={(e) => setForm((p) => ({ ...p, [key]: e.target.value }))} placeholder={placeholder}
                  className="w-full px-3 py-2.5 border border-[#D1D5DB] rounded-xl text-sm outline-none focus:border-[var(--color-gold)] transition-all" />
              </div>
            ))}
          </div>
          <div className="flex gap-3 pt-1">
            <button onClick={handleAdd} disabled={saving}
              className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-[var(--color-gold)] to-[var(--color-gold-dark)] text-white rounded-xl text-sm font-semibold disabled:opacity-60 hover:-translate-y-0.5 transition-all">
              <Save className="w-4 h-4" />
              {saving ? "Saving..." : "Save Address"}
            </button>
            <button onClick={() => setShowForm(false)} className="px-4 py-2.5 text-sm text-[#6B7280] hover:text-[#374151] transition-colors">Cancel</button>
          </div>
        </div>
      ) : (
        <button onClick={() => setShowForm(true)}
          className="flex items-center gap-2 w-full justify-center py-4 border-2 border-dashed border-[#D1D5DB] rounded-2xl text-sm text-[#6B7280] hover:border-[var(--color-gold)] hover:text-[var(--color-gold)] transition-all">
          <Plus className="w-4 h-4" /> Add New Address
        </button>
      )}
    </div>
  );
}

// ─── AccountClient (main) ─────────────────────────────────────────────────────

export function AccountClient() {
  const { user, isLoading } = useAuth();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<TabId>("profile");

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!isLoading && !user) {
      router.push("/auth/login?redirect=/account");
    }
  }, [user, isLoading, router]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-2 border-[var(--color-gold)] border-t-transparent rounded-full animate-spin" />
          <p className="text-sm text-[#6B7280]">Loading your account...</p>
        </div>
      </div>
    );
  }

  if (!user) return null;

  return (
    <div className="min-h-screen bg-[#FAFAFA] pt-8 pb-16">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Page header */}
        <div className="mb-8">
          <nav className="flex items-center gap-2 text-xs text-[#9CA3AF] mb-4">
            <a href="/" className="hover:text-[#374151] transition-colors">Home</a>
            <ChevronRight className="w-3 h-3" />
            <span className="text-[#374151]">My Account</span>
          </nav>
          <h1 className="text-3xl font-serif font-medium tracking-wide text-[#111827]">My Account</h1>
          <p className="text-sm text-[#6B7280] mt-1">Manage your profile, orders, and saved addresses.</p>
        </div>

        <div className="flex flex-col lg:flex-row gap-6">
          {/* Sidebar */}
          <aside className="w-full lg:w-56 flex-shrink-0">
            <nav className="bg-white rounded-2xl border border-[#E5E7EB] overflow-hidden">
              {TABS.map((tab) => {
                const Icon = tab.icon;
                const active = activeTab === tab.id;
                return (
                  <button key={tab.id} onClick={() => setActiveTab(tab.id)}
                    className={`flex items-center gap-3 w-full px-5 py-3.5 text-sm font-medium transition-all text-left ${
                      active
                        ? "bg-gradient-to-r from-[#FFF8F0] to-[#FFFBF5] text-[var(--color-gold)] border-l-2 border-[var(--color-gold)]"
                        : "text-[#374151] hover:bg-[#F9FAFB] border-l-2 border-transparent"
                    }`}
                  >
                    <Icon className={`w-4 h-4 ${active ? "text-[var(--color-gold)]" : "text-[#9CA3AF]"}`} />
                    {tab.label}
                  </button>
                );
              })}
            </nav>
          </aside>

          {/* Tab content */}
          <main className="flex-1 min-w-0">
            <AnimatePresence mode="wait">
              <motion.div key={activeTab} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -12 }} transition={{ duration: 0.2 }}>
                {activeTab === "profile"   && <ProfileTab />}
                {activeTab === "orders"   && <OrdersTab />}
                {activeTab === "addresses" && <AddressesTab />}
              </motion.div>
            </AnimatePresence>
          </main>
        </div>
      </div>
    </div>
  );
}
