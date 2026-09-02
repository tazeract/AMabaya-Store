"use client";

import { useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { Eye, EyeOff, ArrowRight, Mail, Lock, User, Phone, CheckCircle, Star, Gift } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import { toast } from "@/components/ui/Toaster";

const PERKS = [
  { icon: Gift, text: "Exclusive member-only early access" },
  { icon: Star, text: "Earn loyalty points on every order" },
  { icon: CheckCircle, text: "Free returns within 7 days" },
];

const TESTIMONIAL = {
  quote: "Shopping on RIWAYAH feels like stepping into a Lahore atelier. The craftsmanship is unreal.",
  author: "Mahnoor T.",
  location: "Islamabad",
};

type FieldErrors = Record<string, string>;

export default function SignupPage() {
  const [form, setForm] = useState({ name: "", email: "", phone: "", password: "", confirm: "" });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<FieldErrors>({});
  const [focusedField, setFocusedField] = useState<string | null>(null);
  const { signup } = useAuth();
  const router = useRouter();

  const update = (key: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm((p) => ({ ...p, [key]: e.target.value }));
    if (errors[key]) setErrors((prev) => { const n = { ...prev }; delete n[key]; return n; });
  };

  const validate = (): FieldErrors => {
    const e: FieldErrors = {};
    if (!form.name.trim()) e.name = "Full name is required";
    if (!form.email.includes("@")) e.email = "Enter a valid email address";
    if (form.password.length < 8) e.password = "Minimum 8 characters required";
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
      toast.success("Welcome to RIWAYAH!", `Hi ${form.name}, your account is ready.`);
      router.push("/");
    } catch (err: unknown) {
      toast.error("Sign up failed", err instanceof Error ? err.message : "Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const inputBase =
    "w-full py-3.5 text-sm text-[#111827] placeholder-[#9CA3AF] outline-none transition-all duration-200 bg-[#FAFAFA] focus:bg-white border rounded-xl";
  const inputClass = (field: string) =>
    `${inputBase} ${errors[field] ? "border-red-400 focus:border-red-400 focus:ring-2 focus:ring-red-400/10" : "border-[#E5E7EB] focus:border-[#C5A880] focus:ring-2 focus:ring-[#C5A880]/15"}`;

  return (
    <div className="min-h-screen flex">
      {/* ── Left Panel — Brand Visual ───────────────────────────────── */}
      <div className="hidden lg:flex lg:w-[48%] xl:w-[50%] relative overflow-hidden flex-col">
        {/* Full bleed image */}
        <div className="absolute inset-0">
          <img
            src="/products/classic-noir-abaya/image-1.jpg"
            alt="RIWAYAH Luxury Collection"
            className="w-full h-full object-cover object-top"
          />
          {/* Rich dark veil */}
          <div className="absolute inset-0 bg-gradient-to-b from-[#0B0908]/60 via-[#110D0A]/75 to-[#0B0908]/90" />
          {/* Subtle warm shimmer band */}
          <div className="absolute inset-0 bg-gradient-to-tr from-[#C5A880]/10 via-transparent to-transparent" />
        </div>

        {/* Foreground content */}
        <div className="relative z-10 flex flex-col h-full px-12 xl:px-16 py-12">
          {/* Brand mark */}
          <Link href="/" className="group inline-block">
            <span className="font-serif text-[28px] font-medium tracking-[0.3em] text-white group-hover:text-[#C5A880] transition-colors duration-500">
              RIWAYAH
            </span>
            <div className="h-px w-0 group-hover:w-full bg-[#C5A880] transition-all duration-500 mt-0.5" />
            <p className="text-[9px] font-sans tracking-[0.42em] text-white/40 uppercase mt-0.5">
              Haute Modesty · Pakistan
            </p>
          </Link>

          {/* Mid content */}
          <div className="my-auto space-y-7">
            <div className="w-8 h-px bg-[#C5A880]" />
            <div>
              <p className="text-[11px] font-sans font-semibold tracking-[0.22em] text-[#C5A880] uppercase mb-3">
                Create Your Account
              </p>
              <h2 className="font-serif text-4xl xl:text-[44px] text-white font-normal leading-[1.15] tracking-tight">
                Become Part of<br />
                Our <span className="italic text-[#C5A880]">Inner Circle</span>
              </h2>
            </div>
            <p className="text-sm text-white/55 font-sans leading-relaxed max-w-[340px]">
              Join thousands of discerning women who trust RIWAYAH for handcrafted luxury abayas, kaftans, and modest wear from Lahore's finest atelier.
            </p>

            {/* Perks */}
            <div className="space-y-3 pt-1">
              {PERKS.map(({ icon: Icon, text }) => (
                <div key={text} className="flex items-center gap-3">
                  <div className="w-6 h-6 rounded-full bg-[#C5A880]/15 border border-[#C5A880]/30 flex items-center justify-center shrink-0">
                    <Icon className="w-3 h-3 text-[#C5A880]" />
                  </div>
                  <span className="text-[12.5px] font-sans text-white/65">{text}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Testimonial at bottom */}
          <div className="border-t border-white/10 pt-7">
            <div className="flex gap-0.5 mb-2.5">
              {Array.from({ length: 5 }).map((_, i) => (
                <Star key={i} className="w-3 h-3 fill-[#C5A880] text-[#C5A880]" />
              ))}
            </div>
            <p className="text-[12.5px] text-white/65 italic font-sans leading-relaxed mb-3">
              &quot;{TESTIMONIAL.quote}&quot;
            </p>
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#C5A880] to-[#8B6840] flex items-center justify-center text-white text-[11px] font-bold">
                {TESTIMONIAL.author[0]}
              </div>
              <div>
                <p className="text-[12px] font-semibold text-white">{TESTIMONIAL.author}</p>
                <p className="text-[10px] text-white/40">{TESTIMONIAL.location}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── Right Panel — Signup Form ─────────────────────────────── */}
      <div className="flex-1 flex flex-col items-center justify-center px-6 sm:px-10 lg:px-12 xl:px-16 bg-white overflow-y-auto min-h-screen py-10">

        {/* Mobile logo */}
        <div className="lg:hidden mb-7 text-center">
          <Link href="/" className="inline-flex flex-col items-center gap-0.5">
            <span className="font-serif text-2xl font-medium tracking-[0.28em] text-[#111827]">RIWAYAH</span>
            <span className="text-[8px] font-sans tracking-[0.4em] text-[#9CA3AF] uppercase">Haute Modesty · Pakistan</span>
          </Link>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 22 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
          className="w-full max-w-[430px]"
        >
          {/* Heading */}
          <div className="mb-7">
            <h1 className="font-serif text-3xl sm:text-[34px] text-[#111827] font-normal tracking-tight mb-1.5">
              Create Account
            </h1>
            <p className="text-sm text-[#6B7280] font-sans">
              Already have an account?{" "}
              <Link href="/auth/login" className="text-[#C5A880] hover:text-[#A3845A] font-semibold transition-colors">
                Sign In
              </Link>
            </p>
          </div>

          <form onSubmit={handleSubmit} noValidate className="space-y-4">
            {/* Full Name */}
            <div>
              <label htmlFor="signup-name" className="block text-[11px] font-bold uppercase tracking-widest text-[#374151] mb-1.5">
                Full Name
              </label>
              <div className="relative">
                <User className={`absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 transition-colors duration-200 ${focusedField === "name" ? "text-[#C5A880]" : "text-[#9CA3AF]"}`} />
                <input
                  id="signup-name"
                  type="text"
                  value={form.name}
                  onChange={update("name")}
                  onFocus={() => setFocusedField("name")}
                  onBlur={() => setFocusedField(null)}
                  placeholder="Fatima Khan"
                  autoComplete="name"
                  className={`${inputClass("name")} pl-11 pr-4`}
                />
              </div>
              <AnimatePresence>
                {errors.name && (
                  <motion.p initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                    className="text-[11px] text-red-500 mt-1">
                    {errors.name}
                  </motion.p>
                )}
              </AnimatePresence>
            </div>

            {/* Email */}
            <div>
              <label htmlFor="signup-email" className="block text-[11px] font-bold uppercase tracking-widest text-[#374151] mb-1.5">
                Email Address
              </label>
              <div className="relative">
                <Mail className={`absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 transition-colors duration-200 ${focusedField === "email" ? "text-[#C5A880]" : "text-[#9CA3AF]"}`} />
                <input
                  id="signup-email"
                  type="email"
                  value={form.email}
                  onChange={update("email")}
                  onFocus={() => setFocusedField("email")}
                  onBlur={() => setFocusedField(null)}
                  placeholder="your@email.com"
                  autoComplete="email"
                  className={`${inputClass("email")} pl-11 pr-4`}
                />
              </div>
              <AnimatePresence>
                {errors.email && (
                  <motion.p initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                    className="text-[11px] text-red-500 mt-1">
                    {errors.email}
                  </motion.p>
                )}
              </AnimatePresence>
            </div>

            {/* Phone */}
            <div>
              <label htmlFor="signup-phone" className="block text-[11px] font-bold uppercase tracking-widest text-[#374151] mb-1.5">
                Phone <span className="normal-case font-normal text-[#9CA3AF]">(optional)</span>
              </label>
              <div className="relative">
                <Phone className={`absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 transition-colors duration-200 ${focusedField === "phone" ? "text-[#C5A880]" : "text-[#9CA3AF]"}`} />
                <input
                  id="signup-phone"
                  type="tel"
                  value={form.phone}
                  onChange={update("phone")}
                  onFocus={() => setFocusedField("phone")}
                  onBlur={() => setFocusedField(null)}
                  placeholder="03XX-XXXXXXX"
                  autoComplete="tel"
                  className={`${inputClass("phone")} pl-11 pr-4`}
                />
              </div>
            </div>

            {/* Password row — side by side on wider screens */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Password */}
              <div>
                <label htmlFor="signup-password" className="block text-[11px] font-bold uppercase tracking-widest text-[#374151] mb-1.5">
                  Password
                </label>
                <div className="relative">
                  <Lock className={`absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 transition-colors duration-200 ${focusedField === "password" ? "text-[#C5A880]" : "text-[#9CA3AF]"}`} />
                  <input
                    id="signup-password"
                    type={showPassword ? "text" : "password"}
                    value={form.password}
                    onChange={update("password")}
                    onFocus={() => setFocusedField("password")}
                    onBlur={() => setFocusedField(null)}
                    placeholder="Min. 8 chars"
                    autoComplete="new-password"
                    className={`${inputClass("password")} pl-11 pr-11`}
                  />
                  <button type="button" onClick={() => setShowPassword(!showPassword)} aria-label="Toggle"
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#9CA3AF] hover:text-[#374151] transition-colors">
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                <AnimatePresence>
                  {errors.password && (
                    <motion.p initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                      className="text-[11px] text-red-500 mt-1">
                      {errors.password}
                    </motion.p>
                  )}
                </AnimatePresence>
              </div>

              {/* Confirm */}
              <div>
                <label htmlFor="signup-confirm" className="block text-[11px] font-bold uppercase tracking-widest text-[#374151] mb-1.5">
                  Confirm
                </label>
                <div className="relative">
                  <Lock className={`absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 transition-colors duration-200 ${focusedField === "confirm" ? "text-[#C5A880]" : "text-[#9CA3AF]"}`} />
                  <input
                    id="signup-confirm"
                    type={showConfirm ? "text" : "password"}
                    value={form.confirm}
                    onChange={update("confirm")}
                    onFocus={() => setFocusedField("confirm")}
                    onBlur={() => setFocusedField(null)}
                    placeholder="Repeat password"
                    autoComplete="new-password"
                    className={`${inputClass("confirm")} pl-11 pr-11`}
                  />
                  <button type="button" onClick={() => setShowConfirm(!showConfirm)} aria-label="Toggle"
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#9CA3AF] hover:text-[#374151] transition-colors">
                    {showConfirm ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                <AnimatePresence>
                  {errors.confirm && (
                    <motion.p initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                      className="text-[11px] text-red-500 mt-1">
                      {errors.confirm}
                    </motion.p>
                  )}
                </AnimatePresence>
              </div>
            </div>

            {/* Submit */}
            <div className="pt-2">
              <button
                type="submit"
                disabled={isLoading}
                id="signup-submit-btn"
                className="flex items-center justify-center gap-2 w-full py-3.5 rounded-xl font-semibold text-sm bg-[#111827] text-white hover:bg-[#1C1917] hover:-translate-y-0.5 hover:shadow-lg disabled:opacity-60 disabled:cursor-wait disabled:transform-none transition-all duration-200"
              >
                {isLoading ? (
                  <span className="flex items-center gap-2">
                    <svg className="w-4 h-4 animate-spin" viewBox="0 0 24 24" fill="none">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                    </svg>
                    Creating account…
                  </span>
                ) : (
                  <><span>Create My Account</span><ArrowRight className="w-4 h-4" /></>
                )}
              </button>
            </div>
          </form>

          {/* Footer */}
          <p className="mt-6 text-center text-[11px] text-[#9CA3AF] font-sans leading-relaxed">
            By creating an account you agree to our{" "}
            <Link href="/about" className="underline hover:text-[#374151] transition-colors">Terms</Link>
            {" "}and{" "}
            <Link href="/about" className="underline hover:text-[#374151] transition-colors">Privacy Policy</Link>
          </p>
        </motion.div>
      </div>
    </div>
  );
}
