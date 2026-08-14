"use client";

import { useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { Eye, EyeOff, ArrowRight, Mail, Lock, User, Phone } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import { toast } from "@/components/ui/Toaster";
import siteConfig from "@/lib/siteConfig";

export default function SignupPage() {
  const [form, setForm] = useState({ name: "", email: "", phone: "", password: "", confirm: "" });
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const { signup } = useAuth();
  const router = useRouter();

  const validate = () => {
    const e: Record<string, string> = {};
    if (!form.name.trim()) e.name = "Name is required";
    if (!form.email.includes("@")) e.email = "Valid email required";
    if (form.password.length < 8) e.password = "Password must be at least 8 characters";
    if (form.password !== form.confirm) e.confirm = "Passwords do not match";
    return e;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length > 0) { setErrors(errs); return; }

    setIsLoading(true);
    try {
      await signup(form.name, form.email, form.password, form.phone || undefined);
      toast.success(`Welcome to ${siteConfig.storeName}!`, `Hi ${form.name}, your account has been created.`);
      router.push("/");
    } catch (err: unknown) {
      toast.error("Sign up failed", err instanceof Error ? err.message : "Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen pt-24 pb-16 flex items-center justify-center px-4"
      style={{ background: "linear-gradient(135deg in oklch, var(--color-bg) 0%, #F0EAE2 100%)" }}
    >
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="w-full max-w-md bg-white p-8 sm:p-10 rounded-2xl shadow-xl shadow-[var(--color-gold)]/5 relative z-10"
      >
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-2 mb-6">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[var(--color-gold-light)] to-[var(--color-gold-dark)] flex items-center justify-center">
              <span className="font-display font-bold text-white">{siteConfig.logoText}</span>
            </div>
            <span className="font-display text-2xl font-semibold text-[var(--color-text-primary)]">
              {siteConfig.storeName}
            </span>
          </Link>
          <h1 className="font-display text-3xl font-semibold text-[var(--color-text-primary)]">
            Join AMabaya
          </h1>
          <p className="text-[var(--color-text-muted)] text-sm mt-2">
            Create your account for a luxury shopping experience
          </p>
        </div>

        <div className="glass rounded-3xl border border-white/50 shadow-xl p-8">
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Name */}
            <div>
              <label htmlFor="signup-name" className="block text-sm font-medium text-[var(--color-text-secondary)] mb-1.5">Full Name</label>
              <div className="relative">
                <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--color-text-muted)]" />
                <input
                  id="signup-name"
                  type="text"
                  value={form.name}
                  onChange={(e) => setForm(p => ({ ...p, name: e.target.value }))}
                  placeholder="Fatima Khan"
                  className={`w-full pl-10 pr-4 py-3 border rounded-xl text-sm outline-none transition-all ${errors.name ? "border-red-400" : "border-[var(--color-border)] focus:border-[var(--color-gold)]"}`}
                />
              </div>
              {errors.name && <p className="text-xs text-red-500 mt-1">{errors.name}</p>}
            </div>

            {/* Email */}
            <div>
              <label htmlFor="signup-email" className="block text-sm font-medium text-[var(--color-text-secondary)] mb-1.5">Email</label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--color-text-muted)]" />
                <input
                  id="signup-email"
                  type="email"
                  value={form.email}
                  onChange={(e) => setForm(p => ({ ...p, email: e.target.value }))}
                  placeholder="your@email.com"
                  className={`w-full pl-10 pr-4 py-3 border rounded-xl text-sm outline-none transition-all ${errors.email ? "border-red-400" : "border-[var(--color-border)] focus:border-[var(--color-gold)]"}`}
                />
              </div>
              {errors.email && <p className="text-xs text-red-500 mt-1">{errors.email}</p>}
            </div>

            {/* Phone */}
            <div>
              <label htmlFor="signup-phone" className="block text-sm font-medium text-[var(--color-text-secondary)] mb-1.5">Phone (optional)</label>
              <div className="relative">
                <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--color-text-muted)]" />
                <input
                  id="signup-phone"
                  type="tel"
                  value={form.phone}
                  onChange={(e) => setForm(p => ({ ...p, phone: e.target.value }))}
                  placeholder="03XX-XXXXXXX"
                  className="w-full pl-10 pr-4 py-3 border border-[var(--color-border)] rounded-xl text-sm outline-none focus:border-[var(--color-gold)] transition-all"
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label htmlFor="signup-password" className="block text-sm font-medium text-[var(--color-text-secondary)] mb-1.5">Password</label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--color-text-muted)]" />
                <input
                  id="signup-password"
                  type={showPassword ? "text" : "password"}
                  value={form.password}
                  onChange={(e) => setForm(p => ({ ...p, password: e.target.value }))}
                  placeholder="Min. 8 characters"
                  className={`w-full pl-10 pr-12 py-3 border rounded-xl text-sm outline-none transition-all ${errors.password ? "border-red-400" : "border-[var(--color-border)] focus:border-[var(--color-gold)]"}`}
                />
                <button type="button" onClick={() => setShowPassword(!showPassword)} aria-label="Toggle password visibility"
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[var(--color-text-muted)]">
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {errors.password && <p className="text-xs text-red-500 mt-1">{errors.password}</p>}
            </div>

            {/* Confirm */}
            <div>
              <label htmlFor="signup-confirm" className="block text-sm font-medium text-[var(--color-text-secondary)] mb-1.5">Confirm Password</label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--color-text-muted)]" />
                <input
                  id="signup-confirm"
                  type={showPassword ? "text" : "password"}
                  value={form.confirm}
                  onChange={(e) => setForm(p => ({ ...p, confirm: e.target.value }))}
                  placeholder="Repeat password"
                  className={`w-full pl-10 pr-4 py-3 border rounded-xl text-sm outline-none transition-all ${errors.confirm ? "border-red-400" : "border-[var(--color-border)] focus:border-[var(--color-gold)]"}`}
                />
              </div>
              {errors.confirm && <p className="text-xs text-red-500 mt-1">{errors.confirm}</p>}
            </div>

            <button
              type="submit"
              disabled={isLoading}
              id="signup-submit-btn"
              className={`flex items-center justify-center gap-2 w-full py-4 rounded-2xl font-semibold text-sm transition-all ${
                isLoading
                  ? "bg-[var(--color-gold)]/60 text-white cursor-wait"
                  : "bg-gradient-to-r from-[var(--color-gold)] to-[var(--color-gold-dark)] text-white shadow-[var(--shadow-gold)] hover:-translate-y-0.5 hover:shadow-xl"
              }`}
            >
              {isLoading ? "Creating account..." : <>Create Account <ArrowRight className="w-4 h-4" /></>}
            </button>
          </form>

          <p className="text-center text-sm text-[var(--color-text-muted)] mt-6">
            Already have an account?{" "}
            <Link href="/auth/login" className="text-[var(--color-gold)] hover:underline font-medium">
              Sign In
            </Link>
          </p>
        </div>
      </motion.div>
    </div>
  );
}
