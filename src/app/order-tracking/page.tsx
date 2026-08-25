"use client";

import { useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import { Search, Package, Truck, CheckCircle2, Clock, X } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

type OrderStatus = "placed" | "processing" | "shipped" | "delivered" | "cancelled";

const STEPS: { status: OrderStatus; label: string; icon: React.ElementType; desc: string }[] = [
  { status: "placed",     label: "Order Received",              icon: Package,    desc: "Order confirmed at AMabaya Atelier" },
  { status: "processing", label: "Tailoring & Quality Check",   icon: Clock,      desc: "Garment inspection & packaging" },
  { status: "shipped",    label: "With Courier (TCS / Leopard)", icon: Truck,     desc: "In transit across Pakistan" },
  { status: "delivered",  label: "Delivered",                   icon: CheckCircle2, desc: "Delivered to your doorstep" },
];

const STATUS_ORDER: OrderStatus[] = ["placed", "processing", "shipped", "delivered"];

interface SupabaseOrder {
  id: string;
  status: OrderStatus;
  total: number;
  shipping_cost: number;
  payment_method: string;
  tracking_code?: string;
  placed_at: string;
  shipping_address: {
    fullName: string;
    phone: string;
    address: string;
    city: string;
    province: string;
  };
  order_items?: {
    id: string;
    product_snapshot: { name: string; images?: string[] };
    quantity: number;
    size?: string;
    color?: string;
    unit_price: number;
  }[];
}

function formatPKR(n: number) {
  return `Rs. ${n.toLocaleString("en-PK")}`;
}

function OrderTrackingContent() {
  const searchParams = useSearchParams();
  const initialOrderId = searchParams.get("orderId") ?? "";
  const initialStatus = searchParams.get("status") ?? "";

  const [orderId, setOrderId] = useState(initialOrderId);
  const [phone, setPhone] = useState("");
  const [order, setOrder] = useState<SupabaseOrder | null>(null);
  const [notFound, setNotFound] = useState(false);
  const [loading, setLoading] = useState(false);
  const [autoLoaded, setAutoLoaded] = useState(false);

  const supabase = createClient();

  // Auto-load order if orderId is in URL (from PayFast callback)
  const searchOrder = async (searchId: string, searchPhone: string) => {
    setLoading(true);
    setNotFound(false);
    setOrder(null);

    let query = supabase
      .from("orders")
      .select(`
        id, status, total, shipping_cost, payment_method, tracking_code, placed_at, shipping_address,
        order_items (id, product_snapshot, quantity, size, color, unit_price)
      `);

    if (searchId.trim()) {
      query = query.eq("id", searchId.trim());
    } else if (searchPhone.trim()) {
      // Search by phone in shipping_address JSONB
      query = query.contains("shipping_address", { phone: searchPhone.trim() });
    } else {
      setLoading(false);
      return;
    }

    const { data, error } = await query.maybeSingle();

    if (error || !data) {
      setNotFound(true);
    } else {
      setOrder(data as SupabaseOrder);
    }

    setLoading(false);
  };

  // Auto-search if orderId comes from URL
  if (initialOrderId && !autoLoaded && !loading) {
    setAutoLoaded(true);
    searchOrder(initialOrderId, "");
  }

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    searchOrder(orderId, phone);
  };

  const currentStep = order ? STATUS_ORDER.indexOf(order.status) : -1;
  const isCancelled = order?.status === "cancelled";

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <div className="bg-[#FBF9F6] border-b border-[#E5E7EB] py-12 px-4 sm:px-6 lg:px-8 text-center">
        <p className="text-[11px] font-sans font-semibold tracking-[0.25em] text-[#A3845A] uppercase mb-1">
          Delivery Status
        </p>
        <h1 className="font-serif text-3xl sm:text-4xl text-[#111827] font-normal">
          Track Your Package
        </h1>
        <p className="text-xs text-[#6B7280] font-sans mt-1">
          Enter your Order Reference ID or mobile number to track real-time delivery status.
        </p>
      </div>

      {/* PayFast success banner */}
      {initialStatus === "success" && order && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-emerald-50 border-b border-emerald-200 px-4 py-3 text-center"
        >
          <p className="text-sm text-emerald-800 font-medium flex items-center justify-center gap-2">
            <CheckCircle2 className="w-4 h-4" />
            Payment confirmed! Your order has been placed successfully.
          </p>
        </motion.div>
      )}

      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Search form */}
        <div className="bg-[#FBF9F6] border border-[#E5E7EB] p-6 sm:p-8 mb-10">
          <form onSubmit={handleSearch} className="space-y-4">
            <div>
              <label htmlFor="track-order-id" className="block text-xs font-sans font-semibold text-[#111827] uppercase tracking-wider mb-1.5">
                Order Reference ID
              </label>
              <input
                id="track-order-id"
                type="text"
                value={orderId}
                onChange={(e) => setOrderId(e.target.value)}
                placeholder="Paste your Order ID (UUID)"
                className="w-full px-4 py-3 bg-white border border-[#D1D5DB] focus:border-[#111827] text-xs font-sans outline-none font-mono"
              />
            </div>

            <div className="flex items-center gap-4">
              <div className="flex-1 h-px bg-[#E5E7EB]" />
              <span className="text-[10px] uppercase font-sans tracking-widest text-[#9CA3AF]">OR</span>
              <div className="flex-1 h-px bg-[#E5E7EB]" />
            </div>

            <div>
              <label htmlFor="track-phone" className="block text-xs font-sans font-semibold text-[#111827] uppercase tracking-wider mb-1.5">
                Mobile Number Used in Order
              </label>
              <input
                id="track-phone"
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="e.g. 0300 1234567"
                className="w-full px-4 py-3 bg-white border border-[#D1D5DB] focus:border-[#111827] text-xs font-sans outline-none"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full luxury-btn-primary py-3.5 text-xs flex items-center justify-center gap-2 disabled:opacity-60"
            >
              {loading ? (
                <span className="animate-pulse">Searching...</span>
              ) : (
                <>
                  <Search className="w-4 h-4" />
                  <span>Track Dispatch Status</span>
                </>
              )}
            </button>
          </form>
        </div>

        {/* Not found */}
        {notFound && (
          <div className="p-6 bg-[#FBF9F6] border border-amber-300 text-center space-y-2 mb-8">
            <p className="font-serif text-xl text-[#111827]">Order Not Found</p>
            <p className="text-xs text-[#6B7280] font-sans">
              We couldn&apos;t find an order matching that ID or phone number. Please check for typos or contact our WhatsApp helpline.
            </p>
          </div>
        )}

        {/* Order Details */}
        {order && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-[#FBF9F6] border border-[#E5E7EB] p-6 sm:p-8 space-y-8"
          >
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-4 border-b border-[#E5E7EB]">
              <div>
                <span className="text-[10px] uppercase tracking-widest text-[#A3845A] font-semibold">
                  Verified Booking
                </span>
                <h2 className="font-serif text-xl text-[#111827] font-medium">
                  Order #{order.id.slice(0, 8).toUpperCase()}
                </h2>
                <p className="text-xs text-[#6B7280] mt-0.5">
                  {new Date(order.placed_at).toLocaleDateString("en-PK", { day: "numeric", month: "long", year: "numeric" })}
                </p>
              </div>
              <div className="text-right">
                <span className={`inline-block px-3 py-1 text-xs font-semibold uppercase tracking-wider rounded-full ${
                  isCancelled ? "bg-red-100 text-red-700" : "bg-[#111827] text-white"
                }`}>
                  {order.status}
                </span>
                <p className="text-sm font-bold text-[#111827] mt-1">{formatPKR(order.total)}</p>
              </div>
            </div>

            {/* Tracking code */}
            {order.tracking_code && (
              <div className="bg-emerald-50 border border-emerald-200 rounded-xl px-4 py-3 flex items-center gap-3">
                <Truck className="w-5 h-5 text-emerald-600 flex-shrink-0" />
                <div>
                  <p className="text-xs font-semibold text-emerald-800 uppercase tracking-wider">Tracking Number</p>
                  <p className="text-sm font-mono font-bold text-emerald-900">{order.tracking_code}</p>
                  <p className="text-[10px] text-emerald-700">Use this on TCS / Leopard / Call Courier website</p>
                </div>
              </div>
            )}

            {/* Step Progress */}
            {isCancelled ? (
              <div className="flex items-center gap-3 p-4 bg-red-50 border border-red-200 rounded-xl">
                <X className="w-5 h-5 text-red-600 flex-shrink-0" />
                <p className="text-sm text-red-700 font-medium">This order has been cancelled.</p>
              </div>
            ) : (
              <div className="relative pl-6 sm:pl-8 space-y-8 before:absolute before:left-3 before:top-3 before:bottom-3 before:w-0.5 before:bg-[#E5E7EB]">
                {STEPS.map((step, idx) => {
                  const isComplete = idx <= currentStep;
                  const isCurrent = idx === currentStep;
                  const Icon = step.icon;
                  return (
                    <div key={step.status} className="relative flex items-start gap-4">
                      <div
                        className={`absolute -left-6 sm:-left-8 w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold transition-colors ${
                          isComplete ? "bg-[#111827] text-white" : "bg-white border border-[#D1D5DB] text-[#9CA3AF]"
                        }`}
                      >
                        <Icon className="w-3.5 h-3.5" />
                      </div>
                      <div>
                        <p className={`font-serif text-lg ${isCurrent ? "text-[#111827] font-semibold" : "text-[#4B5563]"}`}>
                          {step.label}
                        </p>
                        <p className="text-xs text-[#6B7280] font-sans mt-0.5">{step.desc}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {/* Shipping Address */}
            <div className="pt-6 border-t border-[#E5E7EB] grid sm:grid-cols-2 gap-4 text-xs font-sans">
              <div>
                <p className="text-[#9CA3AF] uppercase tracking-wider font-semibold mb-1">Recipient</p>
                <p className="font-medium text-[#111827]">{order.shipping_address?.fullName}</p>
                <p className="text-[#6B7280]">{order.shipping_address?.phone}</p>
              </div>
              <div>
                <p className="text-[#9CA3AF] uppercase tracking-wider font-semibold mb-1">Delivery Destination</p>
                <p className="text-[#111827]">{order.shipping_address?.address}</p>
                <p className="text-[#6B7280]">{order.shipping_address?.city}, {order.shipping_address?.province}</p>
              </div>
            </div>

            {/* Order Items */}
            {order.order_items && order.order_items.length > 0 && (
              <div className="pt-6 border-t border-[#E5E7EB]">
                <p className="text-xs font-semibold text-[#9CA3AF] uppercase tracking-wider mb-3">Items Ordered</p>
                <div className="space-y-3">
                  {order.order_items.map((item) => (
                    <div key={item.id} className="flex items-center gap-3">
                      <div className="w-12 h-12 bg-[#F3F4F6] rounded-lg flex-shrink-0 overflow-hidden">
                        {item.product_snapshot?.images?.[0] && (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img src={item.product_snapshot.images[0]} alt="" className="w-full h-full object-cover" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-[#111827] truncate">{item.product_snapshot?.name}</p>
                        <p className="text-xs text-[#9CA3AF]">
                          {[item.size, item.color].filter(Boolean).join(" · ")} × {item.quantity}
                        </p>
                      </div>
                      <p className="text-sm font-semibold text-[#111827]">{formatPKR(item.unit_price * item.quantity)}</p>
                    </div>
                  ))}
                </div>
                <div className="flex justify-between items-center mt-4 pt-3 border-t border-[#E5E7EB]">
                  <p className="text-xs text-[#6B7280]">
                    {order.shipping_cost === 0 ? "Free Shipping" : `Shipping: ${formatPKR(order.shipping_cost)}`}
                  </p>
                  <p className="text-sm font-bold text-[#111827]">Total: {formatPKR(order.total)}</p>
                </div>
              </div>
            )}
          </motion.div>
        )}
      </div>
    </div>
  );
}

export default function OrderTrackingPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-white py-20 text-center text-xs uppercase tracking-widest">Loading Tracker...</div>}>
      <OrderTrackingContent />
    </Suspense>
  );
}
