"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { useCart } from "@/context/CartContext";
import { formatPrice } from "@/lib/products";
import { toast } from "@/components/ui/Toaster";
import { Shield, Truck, Lock, CheckCircle2 } from "lucide-react";
import siteConfig from "@/lib/siteConfig";
import type { Order, ShippingAddress } from "@/types";

const PK_PHONE_REGEX = /^(\+92|0)[3][0-9]{9}$/;
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const PROVINCES = [
  "Punjab",
  "Sindh",
  "Khyber Pakhtunkhwa",
  "Balochistan",
  "Gilgit-Baltistan",
  "Azad Kashmir",
  "Islamabad Capital Territory",
];

export default function CheckoutPage() {
  const { items, subtotal, clearCart } = useCart();
  const router = useRouter();

  const shippingCost = subtotal >= siteConfig.freeShippingThreshold ? 0 : siteConfig.standardShippingCost;
  const total = subtotal + shippingCost;

  const [form, setForm] = useState<ShippingAddress & { email: string; notes: string }>({
    fullName: "",
    phone: "",
    address: "",
    city: "",
    province: "Punjab",
    postalCode: "",
    email: "",
    notes: "",
  });
  const [paymentMethod, setPaymentMethod] = useState<"cod" | "bank_transfer">("cod");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const validate = () => {
    const e: Record<string, string> = {};
    if (!form.fullName.trim()) e.fullName = "Full name is required";
    if (!PK_PHONE_REGEX.test(form.phone))
      e.phone = "Enter a valid Pakistani mobile number (e.g. 03001234567)";
    if (!form.address.trim()) e.address = "Complete shipping address is required";
    if (!form.city.trim()) e.city = "City name is required";
    if (form.email && !EMAIL_REGEX.test(form.email))
      e.email = "Enter a valid email address";
    return e;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const validationErrors = validate();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    setIsSubmitting(true);
    try {
      const order: Order = {
        id: `AMA-${Date.now().toString().slice(-6)}`,
        items,
        total,
        shippingCost,
        status: "placed",
        customerName: form.fullName,
        customerPhone: form.phone,
        customerEmail: form.email || undefined,
        shippingAddress: {
          fullName: form.fullName,
          phone: form.phone,
          address: form.address,
          city: form.city,
          province: form.province,
          postalCode: form.postalCode || undefined,
        },
        paymentMethod,
        placedAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        notes: form.notes || undefined,
      };

      const existingOrders = JSON.parse(localStorage.getItem("amabaya-orders") || "[]");
      existingOrders.push(order);
      localStorage.setItem("amabaya-orders", JSON.stringify(existingOrders));

      if (form.email) {
        try {
          const { sendOrderConfirmation } = await import("@/lib/emailjs");
          await sendOrderConfirmation(order);
        } catch (err) {
          console.warn("Email sending failed:", err);
        }
      }

      clearCart();
      toast.success("Order Confirmed", `Order #${order.id} has been placed successfully.`);
      router.push(`/order-tracking?orderId=${order.id}`);
    } catch {
      toast.error("Checkout issue", "Please contact us via WhatsApp for instant manual booking.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center p-6 text-center">
        <div>
          <h1 className="font-serif text-3xl text-[#111827] mb-2 font-normal">Your Bag Is Empty</h1>
          <p className="text-xs text-[#6B7280] font-sans mb-6">Please add items to your cart before proceeding to checkout.</p>
          <a href="/products" className="luxury-btn-primary">
            Explore Collections
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <div className="bg-[#FBF9F6] border-b border-[#E5E7EB] py-12 px-4 sm:px-6 lg:px-8 text-center">
        <h1 className="font-serif text-3xl sm:text-4xl text-[#111827] font-normal">
          Checkout & Dispatch
        </h1>
        <p className="text-xs text-[#6B7280] font-sans mt-1">
          Complete your delivery details for express nationwide delivery
        </p>
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <form onSubmit={handleSubmit}>
          <div className="grid lg:grid-cols-12 gap-10 lg:gap-14">
            
            {/* Left: Shipping & Details (7 Cols) */}
            <div className="lg:col-span-7 space-y-8">
              {/* Contact Info */}
              <div className="p-6 sm:p-8 bg-[#FBF9F6] border border-[#E5E7EB]">
                <h2 className="font-serif text-2xl text-[#111827] font-medium mb-5">
                  1. Contact Information
                </h2>
                <div className="grid sm:grid-cols-2 gap-4 text-xs font-sans">
                  <div>
                    <label htmlFor="fullName" className="block font-semibold text-[#111827] uppercase tracking-wider mb-1.5">
                      Full Name *
                    </label>
                    <input
                      id="fullName"
                      type="text"
                      placeholder="e.g. Fatima Khan"
                      value={form.fullName}
                      onChange={(e) => {
                        setForm((p) => ({ ...p, fullName: e.target.value }));
                        if (errors.fullName) setErrors((p) => ({ ...p, fullName: "" }));
                      }}
                      className={`w-full px-4 py-3 bg-white border outline-none ${
                        errors.fullName ? "border-red-500" : "border-[#D1D5DB] focus:border-[#111827]"
                      }`}
                    />
                    {errors.fullName && <p className="text-[11px] text-red-600 mt-1">{errors.fullName}</p>}
                  </div>

                  <div>
                    <label htmlFor="phone" className="block font-semibold text-[#111827] uppercase tracking-wider mb-1.5">
                      Mobile Number (for COD / Courier) *
                    </label>
                    <input
                      id="phone"
                      type="tel"
                      placeholder="0300 1234567"
                      value={form.phone}
                      onChange={(e) => {
                        setForm((p) => ({ ...p, phone: e.target.value }));
                        if (errors.phone) setErrors((p) => ({ ...p, phone: "" }));
                      }}
                      className={`w-full px-4 py-3 bg-white border outline-none ${
                        errors.phone ? "border-red-500" : "border-[#D1D5DB] focus:border-[#111827]"
                      }`}
                    />
                    {errors.phone && <p className="text-[11px] text-red-600 mt-1">{errors.phone}</p>}
                  </div>

                  <div className="sm:col-span-2">
                    <label htmlFor="email" className="block font-semibold text-[#111827] uppercase tracking-wider mb-1.5">
                      Email Address (Optional for Order Updates)
                    </label>
                    <input
                      id="email"
                      type="email"
                      placeholder="fatima@example.com"
                      value={form.email}
                      onChange={(e) => {
                        setForm((p) => ({ ...p, email: e.target.value }));
                        if (errors.email) setErrors((p) => ({ ...p, email: "" }));
                      }}
                      className={`w-full px-4 py-3 bg-white border outline-none ${
                        errors.email ? "border-red-500" : "border-[#D1D5DB] focus:border-[#111827]"
                      }`}
                    />
                  </div>
                </div>
              </div>

              {/* Shipping Address */}
              <div className="p-6 sm:p-8 bg-[#FBF9F6] border border-[#E5E7EB]">
                <h2 className="font-serif text-2xl text-[#111827] font-medium mb-5">
                  2. Shipping Address
                </h2>
                <div className="grid sm:grid-cols-2 gap-4 text-xs font-sans">
                  <div className="sm:col-span-2">
                    <label htmlFor="address" className="block font-semibold text-[#111827] uppercase tracking-wider mb-1.5">
                      Complete House / Street Address *
                    </label>
                    <input
                      id="address"
                      type="text"
                      placeholder="House #, Street name, Block / Sector"
                      value={form.address}
                      onChange={(e) => {
                        setForm((p) => ({ ...p, address: e.target.value }));
                        if (errors.address) setErrors((p) => ({ ...p, address: "" }));
                      }}
                      className={`w-full px-4 py-3 bg-white border outline-none ${
                        errors.address ? "border-red-500" : "border-[#D1D5DB] focus:border-[#111827]"
                      }`}
                    />
                    {errors.address && <p className="text-[11px] text-red-600 mt-1">{errors.address}</p>}
                  </div>

                  <div>
                    <label htmlFor="city" className="block font-semibold text-[#111827] uppercase tracking-wider mb-1.5">
                      City *
                    </label>
                    <input
                      id="city"
                      type="text"
                      placeholder="e.g. Lahore, Karachi, Islamabad"
                      value={form.city}
                      onChange={(e) => {
                        setForm((p) => ({ ...p, city: e.target.value }));
                        if (errors.city) setErrors((p) => ({ ...p, city: "" }));
                      }}
                      className={`w-full px-4 py-3 bg-white border outline-none ${
                        errors.city ? "border-red-500" : "border-[#D1D5DB] focus:border-[#111827]"
                      }`}
                    />
                    {errors.city && <p className="text-[11px] text-red-600 mt-1">{errors.city}</p>}
                  </div>

                  <div>
                    <label htmlFor="province" className="block font-semibold text-[#111827] uppercase tracking-wider mb-1.5">
                      Province / Territory *
                    </label>
                    <select
                      id="province"
                      value={form.province}
                      onChange={(e) => setForm((p) => ({ ...p, province: e.target.value }))}
                      className="w-full px-4 py-3 bg-white border border-[#D1D5DB] focus:border-[#111827] outline-none"
                    >
                      {PROVINCES.map((prov) => (
                        <option key={prov}>{prov}</option>
                      ))}
                    </select>
                  </div>

                  <div className="sm:col-span-2">
                    <label htmlFor="notes" className="block font-semibold text-[#111827] uppercase tracking-wider mb-1.5">
                      Special Delivery Instructions (Optional)
                    </label>
                    <textarea
                      id="notes"
                      rows={3}
                      placeholder="e.g., Please call before arrival, deliver after 2 PM"
                      value={form.notes}
                      onChange={(e) => setForm((p) => ({ ...p, notes: e.target.value }))}
                      className="w-full px-4 py-3 bg-white border border-[#D1D5DB] focus:border-[#111827] outline-none resize-none"
                    />
                  </div>
                </div>
              </div>

              {/* Payment Method */}
              <div className="p-6 sm:p-8 bg-[#FBF9F6] border border-[#E5E7EB]">
                <h2 className="font-serif text-2xl text-[#111827] font-medium mb-5">
                  3. Payment Method
                </h2>
                <div className="space-y-3">
                  <label
                    className={`flex items-start gap-4 p-4 bg-white border cursor-pointer transition-colors ${
                      paymentMethod === "cod" ? "border-[#111827] ring-1 ring-[#111827]" : "border-[#D1D5DB]"
                    }`}
                  >
                    <input
                      type="radio"
                      name="paymentMethod"
                      value="cod"
                      checked={paymentMethod === "cod"}
                      onChange={() => setPaymentMethod("cod")}
                      className="mt-1 accent-[#111827]"
                    />
                    <div>
                      <p className="font-serif text-lg font-medium text-[#111827]">
                        Cash on Delivery (COD)
                      </p>
                      <p className="text-xs text-[#6B7280] font-sans mt-0.5">
                        Pay in cash upon doorstep delivery anywhere in Pakistan.
                      </p>
                    </div>
                  </label>

                  <label
                    className={`flex items-start gap-4 p-4 bg-white border cursor-pointer transition-colors ${
                      paymentMethod === "bank_transfer" ? "border-[#111827] ring-1 ring-[#111827]" : "border-[#D1D5DB]"
                    }`}
                  >
                    <input
                      type="radio"
                      name="paymentMethod"
                      value="bank_transfer"
                      checked={paymentMethod === "bank_transfer"}
                      onChange={() => setPaymentMethod("bank_transfer")}
                      className="mt-1 accent-[#111827]"
                    />
                    <div>
                      <p className="font-serif text-lg font-medium text-[#111827]">
                        Direct Bank Transfer / Raast / JazzCash
                      </p>
                      <p className="text-xs text-[#6B7280] font-sans mt-0.5">
                        Transfer details and IBAN will be provided upon order submission.
                      </p>
                    </div>
                  </label>
                </div>
              </div>
            </div>

            {/* Right: Order Summary (5 Cols) */}
            <div className="lg:col-span-5">
              <div className="bg-[#FBF9F6] border border-[#E5E7EB] p-6 sm:p-8 sticky top-28 space-y-6">
                <h3 className="font-serif text-2xl text-[#111827] font-medium pb-4 border-b border-[#E5E7EB]">
                  Bag Summary
                </h3>

                {/* Items preview */}
                <div className="max-h-72 overflow-y-auto divide-y divide-[#E5E7EB] pr-1">
                  {items.map((item) => (
                    <div key={item.id} className="py-3 flex gap-3 items-center">
                      <div className="w-12 aspect-[3/4] bg-white border border-[#E5E7EB] shrink-0 overflow-hidden">
                        <img src={item.product.images[0]} alt={item.product.title} className="w-full h-full object-cover" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-serif text-sm text-[#111827] truncate">{item.product.title}</p>
                        <p className="text-[11px] text-[#6B7280] font-sans">
                          {item.selectedSize} · {item.selectedColor} × {item.quantity}
                        </p>
                      </div>
                      <p className="font-sans font-semibold text-xs text-[#111827]">
                        {formatPrice(item.product.price * item.quantity)}
                      </p>
                    </div>
                  ))}
                </div>

                {/* Cost breakdown */}
                <div className="border-t border-[#E5E7EB] pt-4 space-y-2 text-xs font-sans">
                  <div className="flex justify-between text-[#4B5563]">
                    <span>Items Subtotal</span>
                    <span className="font-medium text-[#111827]">{formatPrice(subtotal)}</span>
                  </div>
                  <div className="flex justify-between text-[#4B5563]">
                    <span>Nationwide Shipping</span>
                    <span>
                      {shippingCost === 0 ? (
                        <span className="text-emerald-700 font-semibold uppercase">Free</span>
                      ) : (
                        formatPrice(shippingCost)
                      )}
                    </span>
                  </div>
                  <div className="border-t border-[#E5E7EB] pt-3 flex justify-between font-serif text-xl text-[#111827] font-medium">
                    <span>Payable Total</span>
                    <span>{formatPrice(total)}</span>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full luxury-btn-primary py-4 text-xs tracking-widest font-sans flex items-center justify-center gap-2"
                >
                  <Lock className="w-3.5 h-3.5" />
                  <span>{isSubmitting ? "Confirming Order..." : "Confirm & Place Order"}</span>
                </button>

                <div className="pt-4 border-t border-[#E5E7EB] text-[11px] text-[#6B7280] font-sans space-y-1 text-center">
                  <p>✦ 7-Day Doorstep Exchanges</p>
                  <p>✦ Order confirmation will be sent via SMS / WhatsApp</p>
                </div>
              </div>
            </div>

          </div>
        </form>
      </div>
    </div>
  );
}
