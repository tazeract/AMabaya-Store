"use client";

import { useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import { Search, Package, Truck, CheckCircle2, Clock, MapPin } from "lucide-react";
import { formatPrice } from "@/lib/products";
import type { Order, OrderStatus } from "@/types";

const STEPS: { status: OrderStatus; label: string; icon: React.ElementType; desc: string }[] = [
  { status: "placed", label: "Order Received", icon: Package, desc: "Order confirmed at AMabaya Atelier" },
  { status: "processing", label: "Tailoring & Quality Check", icon: Clock, desc: "Garment inspection & packaging" },
  { status: "shipped", label: "With Courier (TCS / Leopard / Call Courier)", icon: Truck, desc: "In transit across Pakistan" },
  { status: "delivered", label: "Delivered", icon: CheckCircle2, desc: "Delivered to your doorstep" },
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
                placeholder="e.g. AMA-123456"
                className="w-full px-4 py-3 bg-white border border-[#D1D5DB] focus:border-[#111827] text-xs font-sans outline-none"
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
              className="w-full luxury-btn-primary py-3.5 text-xs flex items-center justify-center gap-2"
            >
              <Search className="w-4 h-4" />
              <span>Track Dispatch Status</span>
            </button>
          </form>
        </div>

        {/* Not found message */}
        {notFound && (
          <div className="p-6 bg-[#FBF9F6] border border-amber-300 text-center space-y-2 mb-8">
            <p className="font-serif text-xl text-[#111827]">Order Not Found</p>
            <p className="text-xs text-[#6B7280] font-sans">
              We couldn&apos;t find an order matching that ID or phone number. Please check for typos or contact our WhatsApp helpline.
            </p>
          </div>
        )}

        {/* Order Details Display */}
        {order && (
          <div className="bg-[#FBF9F6] border border-[#E5E7EB] p-6 sm:p-8 space-y-8">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-4 border-b border-[#E5E7EB]">
              <div>
                <span className="text-[10px] uppercase tracking-widest text-[#A3845A] font-semibold">
                  Verified Booking
                </span>
                <h2 className="font-serif text-2xl text-[#111827]">Order #{order.id}</h2>
              </div>
              <span className="px-3 py-1 bg-[#111827] text-white text-xs font-sans uppercase tracking-widest font-semibold w-fit">
                {order.status}
              </span>
            </div>

            {/* Step Progress Tracker */}
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

            {/* Recipient Details */}
            <div className="pt-6 border-t border-[#E5E7EB] grid sm:grid-cols-2 gap-4 text-xs font-sans">
              <div>
                <p className="text-[#9CA3AF] uppercase tracking-wider font-semibold">Recipient</p>
                <p className="font-medium text-[#111827] mt-1">{order.customerName}</p>
                <p className="text-[#6B7280]">{order.customerPhone}</p>
              </div>
              <div>
                <p className="text-[#9CA3AF] uppercase tracking-wider font-semibold">Delivery Destination</p>
                <p className="text-[#111827] mt-1">{order.shippingAddress.address}, {order.shippingAddress.city}</p>
                <p className="text-[#6B7280]">{order.shippingAddress.province}</p>
              </div>
            </div>
          </div>
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
