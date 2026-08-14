"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { useCart } from "@/context/CartContext";
import { formatPrice } from "@/lib/products";
import { AnimatedSection } from "@/components/ui/AnimatedSection";
import { toast } from "@/components/ui/Toaster";
import { Shield, Truck, RefreshCw, CheckCircle, Package } from "lucide-react";
import siteConfig from "@/lib/siteConfig";
import type { Order, ShippingAddress } from "@/types";

// Pakistan phone regex
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
      e.phone = "Enter a valid Pakistani mobile number (e.g. 0300-1234567)";
    if (!form.address.trim()) e.address = "Address is required";
    if (!form.city.trim()) e.city = "City is required";
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
      // Create order object
      const order: Order = {
        id: `ORD-${Date.now()}`,
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

      // Save to localStorage
      const existingOrders = JSON.parse(localStorage.getItem("amabaya-orders") || "[]");
      existingOrders.push(order);
      localStorage.setItem("amabaya-orders", JSON.stringify(existingOrders));

      // Try to send email (non-blocking)
      if (form.email) {
        try {
          const { sendOrderConfirmation } = await import("@/lib/emailjs");
          await sendOrderConfirmation(order);
        } catch (err) {
          console.warn("Email sending failed:", err);
        }
      }

      clearCart();
      toast.success("Order Placed!", `Your order ${order.id} has been confirmed.`);
      router.push(`/order-tracking?orderId=${order.id}`);
    } catch {
      toast.error("Something went wrong", "Please try again or contact us on WhatsApp.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (items.length === 0) {
    return (
      <div className="min-h-screen pt-32 flex items-center justify-center">
        <div className="text-center">
          <h1 className="font-display text-2xl text-[var(--color-text-primary)] mb-4">
            Your cart is empty
          </h1>
          <a href="/products" className="text-[var(--color-gold)] hover:underline">
            Continue Shopping
          </a>
        </div>
      </div>
    );
  }

  const Field = ({
    label,
    name,
    type = "text",
    placeholder,
    required = false,
    children,
  }: {
    label: string;
    name: string;
    type?: string;
    placeholder?: string;
    required?: boolean;
    children?: React.ReactNode;
  }) => (
    <div>
      <label htmlFor={name} className="block text-sm font-medium text-[var(--color-text-secondary)] mb-1.5">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      {children ?? (
        <input
          id={name}
          name={name}
          type={type}
          placeholder={placeholder}
          value={(form as unknown as Record<string, string>)[name]}
          onChange={(e) => {
            setForm((prev) => ({ ...prev, [name]: e.target.value }));
            if (errors[name]) setErrors((prev) => ({ ...prev, [name]: "" }));
          }}
          className={`w-full px-4 py-3 border rounded-xl text-sm outline-none transition-all ${
            errors[name]
              ? "border-red-400 bg-red-50"
              : "border-[var(--color-border)] focus:border-[var(--color-gold)] focus:ring-2 focus:ring-[var(--color-gold)]/20"
          }`}
        />
      )}
      {errors[name] && (
        <p className="text-xs text-red-500 mt-1">{errors[name]}</p>
      )}
    </div>
  );

  return (
    <div className="min-h-screen pt-24">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-12">
        <AnimatedSection>
          <h1 className="font-display text-4xl font-semibold text-[var(--color-text-primary)] mb-2">
            Checkout
          </h1>
          <p className="text-[var(--color-text-muted)] text-sm mb-8">
            Complete your order securely
          </p>
        </AnimatedSection>

        <form onSubmit={handleSubmit}>
          <div className="grid lg:grid-cols-3 gap-10">
            {/* Form Column */}
            <div className="lg:col-span-2 space-y-8">
              {/* Contact Info */}
              <AnimatedSection className="bg-white rounded-3xl border border-[var(--color-border)] p-6">
                <h2 className="font-display text-xl font-semibold text-[var(--color-text-primary)] mb-6">
                  Contact Information
                </h2>
                <div className="grid sm:grid-cols-2 gap-5">
                  <Field label="Full Name" name="fullName" placeholder="e.g. Fatima Khan" required />
                  <Field label="Phone Number" name="phone" type="tel" placeholder="03XX-XXXXXXX" required />
                  <div className="sm:col-span-2">
                    <Field label="Email (for order confirmation)" name="email" type="email" placeholder="your@email.com" />
                  </div>
                </div>
              </AnimatedSection>

              {/* Shipping Address */}
              <AnimatedSection delay={0.1} className="bg-white rounded-3xl border border-[var(--color-border)] p-6">
                <h2 className="font-display text-xl font-semibold text-[var(--color-text-primary)] mb-6">
                  Shipping Address
                </h2>
                <div className="grid sm:grid-cols-2 gap-5">
                  <div className="sm:col-span-2">
                    <Field label="Full Address" name="address" placeholder="House #, Street, Area" required />
                  </div>
                  <Field label="City" name="city" placeholder="e.g. Lahore" required />
                  <div>
                    <label htmlFor="province" className="block text-sm font-medium text-[var(--color-text-secondary)] mb-1.5">
                      Province <span className="text-red-500">*</span>
                    </label>
                    <select
                      id="province"
                      value={form.province}
                      onChange={(e) => setForm((prev) => ({ ...prev, province: e.target.value }))}
                      className="w-full px-4 py-3 border border-[var(--color-border)] rounded-xl text-sm outline-none focus:border-[var(--color-gold)] transition-all bg-white"
                    >
                      {PROVINCES.map((p) => (
                        <option key={p}>{p}</option>
                      ))}
                    </select>
                  </div>
                  <Field label="Postal Code (optional)" name="postalCode" placeholder="e.g. 54000" />
                  <div className="sm:col-span-2">
                    <label htmlFor="notes" className="block text-sm font-medium text-[var(--color-text-secondary)] mb-1.5">
                      Order Notes (optional)
                    </label>
                    <textarea
                      id="notes"
                      value={form.notes}
                      onChange={(e) => setForm((prev) => ({ ...prev, notes: e.target.value }))}
                      placeholder="Special instructions, delivery notes..."
                      rows={3}
                      className="w-full px-4 py-3 border border-[var(--color-border)] rounded-xl text-sm outline-none focus:border-[var(--color-gold)] transition-all resize-none"
                    />
                  </div>
                </div>
              </AnimatedSection>

              {/* Payment */}
              <AnimatedSection delay={0.15} className="bg-white rounded-3xl border border-[var(--color-border)] p-6">
                <h2 className="font-display text-xl font-semibold text-[var(--color-text-primary)] mb-6">
                  Payment Method
                </h2>
                <div className="grid sm:grid-cols-2 gap-4">
                  {[
                    { id: "cod" as const, label: "Cash on Delivery", desc: "Pay when you receive your order", icon: Package },
                    { id: "bank_transfer" as const, label: "Bank Transfer", desc: "Transfer before shipping", icon: Shield },
                  ].map((method) => (
                    <button
                      key={method.id}
                      type="button"
                      onClick={() => setPaymentMethod(method.id)}
                      aria-pressed={paymentMethod === method.id}
                      className={`flex items-start gap-4 p-4 rounded-2xl border-2 text-left transition-all ${
                        paymentMethod === method.id
                          ? "border-[var(--color-gold)] bg-[var(--color-gold)]/5"
                          : "border-[var(--color-border)] hover:border-[var(--color-gold)]/40"
                      }`}
                    >
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                        paymentMethod === method.id
                          ? "bg-[var(--color-gold)] text-white"
                          : "bg-[var(--color-border)] text-[var(--color-text-muted)]"
                      }`}>
                        <method.icon className="w-5 h-5" />
                      </div>
                      <div>
                        <p className="font-medium text-sm text-[var(--color-text-primary)]">{method.label}</p>
                        <p className="text-xs text-[var(--color-text-muted)] mt-0.5">{method.desc}</p>
                      </div>
                    </button>
                  ))}
                </div>
              </AnimatedSection>
            </div>

            {/* Order Summary */}
            <div>
              <AnimatedSection direction="right" className="bg-white rounded-3xl border border-[var(--color-border)] p-6 sticky top-24">
                <h2 className="font-display text-xl font-semibold text-[var(--color-text-primary)] mb-6">
                  Order Summary
                </h2>

                <ul className="space-y-4 mb-6">
                  {items.map((item) => (
                    <li key={item.id} className="flex gap-3">
                      <div className="w-14 h-14 rounded-lg overflow-hidden bg-[var(--color-border)] shrink-0">
                        {item.product.images[0] && (
                          <img src={item.product.images[0]} alt={item.product.title} className="w-full h-full object-cover" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-medium text-[var(--color-text-primary)] line-clamp-1">{item.product.title}</p>
                        <p className="text-[10px] text-[var(--color-text-muted)]">{item.selectedSize} · {item.selectedColor} · ×{item.quantity}</p>
                      </div>
                      <p className="text-xs font-semibold text-[var(--color-gold)] shrink-0">
                        {formatPrice(item.product.price * item.quantity)}
                      </p>
                    </li>
                  ))}
                </ul>

                <div className="space-y-3 text-sm">
                  <div className="flex justify-between text-[var(--color-text-secondary)]">
                    <span>Subtotal</span><span>{formatPrice(subtotal)}</span>
                  </div>
                  <div className="flex justify-between text-[var(--color-text-secondary)]">
                    <span>Shipping</span>
                    <span className={shippingCost === 0 ? "text-green-600 font-medium" : ""}>
                      {shippingCost === 0 ? "FREE" : formatPrice(shippingCost)}
                    </span>
                  </div>
                  <div className="divider-gold" />
                  <div className="flex justify-between font-display font-bold text-[var(--color-text-primary)] text-lg">
                    <span>Total</span>
                    <span className="text-[var(--color-gold)]">{formatPrice(total)}</span>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  id="place-order-btn"
                  className={`flex items-center justify-center gap-2 w-full py-4 mt-6 rounded-2xl font-bold text-sm shadow-[var(--shadow-gold)] transition-all ${
                    isSubmitting
                      ? "bg-[var(--color-gold)]/60 text-white cursor-wait"
                      : "bg-gradient-to-r from-[var(--color-gold)] to-[var(--color-gold-dark)] text-white hover:shadow-xl hover:-translate-y-0.5"
                  }`}
                >
                  <CheckCircle className="w-4 h-4" />
                  {isSubmitting ? "Placing Order..." : "Place Order"}
                </button>

                {/* Trust badges */}
                <div className="flex items-center justify-center gap-4 mt-4">
                  {[
                    { icon: Shield, label: "Secure" },
                    { icon: Truck, label: "Fast Delivery" },
                    { icon: RefreshCw, label: "Easy Returns" },
                  ].map((b) => (
                    <div key={b.label} className="flex flex-col items-center gap-1 text-[10px] text-[var(--color-text-muted)]">
                      <b.icon className="w-4 h-4 text-[var(--color-gold)]" />
                      {b.label}
                    </div>
                  ))}
                </div>
              </AnimatedSection>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
