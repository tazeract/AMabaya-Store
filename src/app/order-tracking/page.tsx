"use client";

import { useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import { Search, Package, Truck, CheckCircle, Clock, MapPin } from "lucide-react";
import { AnimatedSection } from "@/components/ui/AnimatedSection";
import type { Order, OrderStatus } from "@/types";

const STEPS: { status: OrderStatus; label: string; icon: React.ElementType; desc: string }[] = [
  { status: "placed", label: "Order Placed", icon: Package, desc: "We've received your order" },
  { status: "processing", label: "Processing", icon: Clock, desc: "Preparing your package" },
  { status: "shipped", label: "Shipped", icon: Truck, desc: "On its way to you" },
  { status: "delivered", label: "Delivered", icon: CheckCircle, desc: "Package delivered" },
];

const STATUS_ORDER: OrderStatus[] = ["placed", "processing", "shipped", "delivered"];

function OrderTrackingContent() {
  const searchParams = useSearchParams();
  const [orderId, setOrderId] = useState(searchParams.get("orderId") ?? "");
  const [phone, setPhone] = useState("");
  const [order, setOrder] = useState<Order | null>(null);
  const [notFound, setNotFound] = useState(false);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setNotFound(false);
    const orders: Order[] = JSON.parse(localStorage.getItem("amabaya-orders") || "[]");
    const found = orders.find(
      (o) =>
        o.id === orderId.trim() ||
        (phone && o.customerPhone === phone.trim())
    );
    if (found) {
      setOrder(found);
    } else {
      setOrder(null);
      setNotFound(true);
    }
  };

  const currentStep = order ? STATUS_ORDER.indexOf(order.status) : -1;

  return (
    <div className="min-h-screen pt-24">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-12">
        <AnimatedSection className="text-center mb-12">
          <span className="text-[var(--color-gold)] text-xs uppercase tracking-widest font-medium block mb-3">✦ Track</span>
          <h1 className="font-display text-4xl sm:text-5xl font-semibold text-[var(--color-text-primary)] mb-4">
            Order Tracking
          </h1>
          <p className="text-[var(--color-text-secondary)] max-w-md mx-auto text-sm">
            Enter your Order ID or phone number to track your package.
          </p>
        </AnimatedSection>

        {/* Search form */}
        <AnimatedSection delay={0.1} className="bg-white rounded-3xl border border-[var(--color-border)] p-8 shadow-sm mb-8">
          <form onSubmit={handleSearch} className="space-y-5">
            <div>
              <label htmlFor="track-order-id" className="block text-sm font-medium text-[var(--color-text-secondary)] mb-2">
                Order ID
              </label>
              <input
                id="track-order-id"
                type="text"
                value={orderId}
                onChange={(e) => setOrderId(e.target.value)}
                placeholder="e.g. ORD-1234567890"
                className="w-full px-4 py-3 border border-[var(--color-border)] rounded-xl text-sm outline-none focus:border-[var(--color-gold)] transition-all"
              />
            </div>
            <div className="flex items-center gap-4">
              <div className="flex-1 h-px bg-[var(--color-border)]" />
              <span className="text-xs text-[var(--color-text-muted)]">OR</span>
              <div className="flex-1 h-px bg-[var(--color-border)]" />
            </div>
            <div>
              <label htmlFor="track-phone" className="block text-sm font-medium text-[var(--color-text-secondary)] mb-2">
                Phone Number
              </label>
              <input
                id="track-phone"
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="e.g. 0300-1234567"
                className="w-full px-4 py-3 border border-[var(--color-border)] rounded-xl text-sm outline-none focus:border-[var(--color-gold)] transition-all"
              />
            </div>
            <button
              type="submit"
              className="flex items-center justify-center gap-2 w-full py-4 bg-gradient-to-r from-[var(--color-gold)] to-[var(--color-gold-dark)] text-white rounded-2xl font-medium shadow-[var(--shadow-gold)] hover:-translate-y-0.5 transition-all"
            >
              <Search className="w-4 h-4" />
              Track My Order
            </button>
          </form>
        </AnimatedSection>

        {/* Not found */}
        {notFound && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center py-8 text-[var(--color-text-muted)]"
          >
            <p className="font-display text-xl text-[var(--color-text-secondary)] mb-2">Order not found</p>
            <p className="text-sm">Please check your Order ID or phone number and try again.</p>
          </motion.div>
        )}

        {/* Order found */}
        {order && (
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="space-y-6"
          >
            {/* Order header */}
            <div className="bg-white rounded-3xl border border-[var(--color-border)] p-6">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <p className="text-xs text-[var(--color-text-muted)] uppercase tracking-wider">Order ID</p>
                  <p className="font-mono font-bold text-[var(--color-text-primary)]">{order.id}</p>
                </div>
                <span className={`px-4 py-1.5 rounded-full text-xs font-bold capitalize ${
                  order.status === "delivered"
                    ? "bg-green-100 text-green-700"
                    : order.status === "shipped"
                    ? "bg-blue-100 text-blue-700"
                    : order.status === "processing"
                    ? "bg-amber-100 text-amber-700"
                    : "bg-[var(--color-gold)]/10 text-[var(--color-gold)]"
                }`}>
                  {order.status}
                </span>
              </div>

              {/* Progress steps */}
              <div className="relative mt-8">
                {/* Progress line */}
                <div className="absolute top-5 left-5 right-5 h-0.5 bg-[var(--color-border)]">
                  <motion.div
                    className="h-full bg-[var(--color-gold)]"
                    initial={{ width: 0 }}
                    animate={{ width: `${(currentStep / (STEPS.length - 1)) * 100}%` }}
                    transition={{ duration: 1, delay: 0.3 }}
                  />
                </div>

                <div className="relative flex justify-between">
                  {STEPS.map((step, i) => {
                    const isComplete = i <= currentStep;
                    const isCurrent = i === currentStep;
                    const Icon = step.icon;
                    return (
                      <div key={step.status} className="flex flex-col items-center gap-2 w-20">
                        <motion.div
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          transition={{ delay: 0.3 + i * 0.15, type: "spring" }}
                          className={`relative z-10 w-10 h-10 rounded-full flex items-center justify-center border-2 transition-all ${
                            isComplete
                              ? "bg-[var(--color-gold)] border-[var(--color-gold)] text-white"
                              : "bg-white border-[var(--color-border)] text-[var(--color-text-muted)]"
                          } ${isCurrent ? "animate-pulse-gold" : ""}`}
                        >
                          <Icon className="w-4 h-4" />
                        </motion.div>
                        <p className={`text-[10px] font-medium text-center leading-tight ${
                          isComplete ? "text-[var(--color-text-primary)]" : "text-[var(--color-text-muted)]"
                        }`}>
                          {step.label}
                        </p>
                        {isCurrent && (
                          <p className="text-[9px] text-[var(--color-gold)] text-center">{step.desc}</p>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Order details */}
            <div className="bg-white rounded-3xl border border-[var(--color-border)] p-6">
              <h2 className="font-display font-semibold text-[var(--color-text-primary)] mb-4">Order Details</h2>
              <div className="space-y-3">
                {order.items.map((item) => (
                  <div key={item.id} className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-lg overflow-hidden bg-[var(--color-border)] shrink-0">
                      {item.product.images[0] && <img src={item.product.images[0]} alt={item.product.title} className="w-full h-full object-cover" />}
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-[var(--color-text-primary)]">{item.product.title}</p>
                      <p className="text-xs text-[var(--color-text-muted)]">{item.selectedSize} · {item.selectedColor} · ×{item.quantity}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Shipping address */}
            <div className="bg-white rounded-3xl border border-[var(--color-border)] p-6">
              <div className="flex items-start gap-3">
                <MapPin className="w-4 h-4 text-[var(--color-gold)] mt-0.5 shrink-0" />
                <div>
                  <h2 className="font-display font-semibold text-[var(--color-text-primary)] mb-1">Shipping Address</h2>
                  <p className="text-sm text-[var(--color-text-secondary)]">{order.shippingAddress.fullName}</p>
                  <p className="text-sm text-[var(--color-text-muted)]">
                    {order.shippingAddress.address}, {order.shippingAddress.city}, {order.shippingAddress.province}
                  </p>
                  <p className="text-sm text-[var(--color-text-muted)]">{order.customerPhone}</p>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}

export default function OrderTrackingPage() {
  return (
    <Suspense>
      <OrderTrackingContent />
    </Suspense>
  );
}
