"use client";

import { useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { Eye, EyeOff, ArrowRight, Mail, Lock, Sparkles, CheckCircle, Star } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import { toast } from "@/components/ui/Toaster";
import siteConfig from "@/lib/siteConfig";

const TRUST_BADGES = [
  "Free Returns Within 7 Days",
  "Cash On Delivery Nationwide",
  "100% Authentic Fabrics",
];

const TESTIMONIAL = {
  quote: "The quality is absolutely stunning — I wear my abaya every day and it still looks brand new after months.",
  author: "Ayesha K.",
  location: "Lahore",
  stars: 5,
};

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [showForgot, setShowForgot] = useState(false);
  const [forgotEmail, setForgotEmail] = useState("");
  const [isForgotLoading, setIsForgotLoading] = useState(false);
  const [emailFocused, setEmailFocused] = useState(false);
  const [passwordFocused, setPasswordFocused] = useState(false);
  const { login, resetPassword } = useAuth();
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      await login(email, password);
      toast.success("Welcome back!", "You've signed in successfully.");
      router.push("/");
    } catch (err: unknown) {
      toast.error("Sign in failed", err instanceof Error ? err.message : "Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!forgotEmail) return;
    setIsForgotLoading(true);
    try {
      await resetPassword(forgotEmail);
      toast.success("Reset email sent!", "Check your inbox for the password reset link.");
      setShowForgot(false);
    } catch (err: unknown) {
      toast.error("Failed to send", err instanceof Error ? err.message : "Please try again.");
    } finally {
      setIsForgotLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex">
      {/* ─── Left Panel — Brand Story ─────────────────────────────── */}
      <div className="hidden lg:flex lg:w-[52%] relative overflow-hidden flex-col">
        {/* Background image */}
        <div className="absolute inset-0">
          <img
            src="/products/royal-zahra-kaftan/image-1.jpg"
            alt="RIWAYAH Luxury Collection"
            className="w-full h-full object-cover object-center"
          />
          {/* Layered gradient overlay */}
          <div className="absolute inset-0 bg-gradient-to-br from-[#0D0C0A]/80 via-[#1A1208]/70 to-[#0A0806]/85" />
          {/* Subtle gold pattern overlay */}
          <div
            className="absolute inset-0 opacity-[0.04]"
            style={{
              backgroundImage:
                "repeating-linear-gradient(45deg, #C5A880 0px, #C5A880 1px, transparent 1px, transparent 40px)",
            }}
          />
        </div>

        {/* Content */}
        <div className="relative z-10 flex flex-col h-full p-12 xl:p-16">
          {/* Logo */}
          <Link href="/" className="group inline-flex flex-col gap-0.5 mb-auto">
            <span className="font-serif text-3xl font-medium tracking-[0.28em] text-white group-hover:text-[#C5A880] transition-colors duration-500">
              RIWAYAH
            </span>
            <span className="text-[9px] font-sans tracking-[0.4em] text-white/50 uppercase">
              Haute Modesty · Pakistan
            </span>
          </Link>

          {/* Central copy */}
          <div className="space-y-6 my-auto">
            <div className="inline-flex items-center gap-2">
              <Sparkles className="w-3.5 h-3.5 text-[#C5A880]" />
              <span className="text-[11px] font-sans font-semibold tracking-[0.22em] text-[#C5A880] uppercase">
                Exclusive Members Access
              </span>
            </div>
            <h1 className="font-serif text-4xl xl:text-5xl text-white font-normal leading-tight tracking-tight">
              Where Modesty Meets<br />
              <span className="italic text-[#C5A880]">Master Tailoring</span>
            </h1>
            <p className="text-sm text-white/60 font-sans leading-relaxed max-w-sm">
              Sign in to access your exclusive wishlist, track orders, and unlock member-only early access to our limited festive collections.
            </p>

            {/* Trust badges */}
            <div className="space-y-2.5 pt-2">
              {TRUST_BADGES.map((badge) => (
                <div key={badge} className="flex items-center gap-2.5">
                  <CheckCircle className="w-3.5 h-3.5 text-[#C5A880] shrink-0" />
                  <span className="text-[12px] font-sans text-white/70">{badge}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Testimonial */}
          <div className="mt-auto border-t border-white/10 pt-8">
            <div className="flex gap-0.5 mb-3">
              {Array.from({ length: TESTIMONIAL.stars }).map((_, i) => (
                <Star key={i} className="w-3 h-3 fill-[#C5A880] text-[#C5A880]" />
              ))}
            </div>
            <p className="text-[13px] text-white/75 font-sans italic leading-relaxed mb-3">
              &quot;{TESTIMONIAL.quote}&quot;
            </p>
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-full bg-gradient-to-br from-[#C5A880] to-[#A3845A] flex items-center justify-center text-white text-[10px] font-bold">
                {TESTIMONIAL.author[0]}
              </div>
              <div>
                <p className="text-[12px] font-semibold text-white">{TESTIMONIAL.author}</p>
                <p className="text-[10px] text-white/50">{TESTIMONIAL.location}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ─── Right Panel — Form ───────────────────────────────────── */}
      <div className="flex-1 flex flex-col items-center justify-center px-6 sm:px-10 lg:px-14 xl:px-20 bg-white min-h-screen">
        
        {/* Mobile logo */}
        <div className="lg:hidden mb-8 text-center">
          <Link href="/" className="inline-flex flex-col items-center gap-0.5">
            <span className="font-serif text-2xl font-medium tracking-[0.28em] text-[#111827]">
              RIWAYAH
            </span>
            <span className="text-[8px] font-sans tracking-[0.4em] text-[#9CA3AF] uppercase">
              Haute Modesty · Pakistan
            </span>
          </Link>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.55, ease: [0.16, 1, 0.3, 1] }}
          className="w-full max-w-[420px]"
        >
          {/* Header */}
          <div className="mb-8">
            <h2 className="font-serif text-3xl sm:text-4xl text-[#111827] font-normal tracking-tight mb-2">
              {showForgot ? "Reset Password" : "Welcome Back"}
            </h2>
            <p className="text-sm text-[#6B7280] font-sans">
              {showForgot
                ? "Enter your email to receive a reset link."
                : `Sign in to your ${siteConfig.storeName} account`}
            </p>
          </div>

          <AnimatePresence mode="wait">
            {showForgot ? (
              /* ── Forgot Password Form ── */
              <motion.form
                key="forgot"
                initial={{ opacity: 0, x: 16 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -16 }}
                transition={{ duration: 0.3 }}
                onSubmit={handleForgotPassword}
                className="space-y-5"
              >
                {/* Email field */}
                <div className="space-y-1.5">
                  <label htmlFor="forgot-email" className="block text-[12px] font-semibold uppercase tracking-widest text-[#374151]">
                    Email Address
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#9CA3AF]" />
                    <input
                      id="forgot-email"
                      type="email"
                      value={forgotEmail}
                      onChange={(e) => setForgotEmail(e.target.value)}
                      placeholder="your@email.com"
                      required
                      className="w-full pl-11 pr-4 py-3.5 border border-[#E5E7EB] rounded-xl text-sm text-[#111827] placeholder-[#9CA3AF] outline-none focus:border-[#C5A880] focus:ring-2 focus:ring-[#C5A880]/15 transition-all duration-200 bg-[#FAFAFA] focus:bg-white"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isForgotLoading}
                  className="flex items-center justify-center gap-2 w-full py-3.5 rounded-xl font-semibold text-sm bg-[#111827] text-white hover:bg-[#27272A] hover:-translate-y-0.5 hover:shadow-lg disabled:opacity-60 disabled:cursor-wait disabled:transform-none transition-all duration-200"
                >
                  {isForgotLoading ? "Sending…" : <><span>Send Reset Link</span><ArrowRight className="w-4 h-4" /></>}
                </button>

                <button
                  type="button"
                  onClick={() => setShowForgot(false)}
                  className="w-full text-sm text-[#6B7280] hover:text-[#111827] text-center transition-colors py-1"
                >
                  ← Back to Sign In
                </button>
              </motion.form>

            ) : (
              /* ── Login Form ── */
              <motion.form
                key="login"
                initial={{ opacity: 0, x: -16 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 16 }}
                transition={{ duration: 0.3 }}
                onSubmit={handleSubmit}
                className="space-y-5"
              >
                {/* Email */}
                <div className="space-y-1.5">
                  <label htmlFor="login-email" className="block text-[12px] font-semibold uppercase tracking-widest text-[#374151]">
                    Email Address
                  </label>
                  <div className="relative">
                    <Mail
                      className={`absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 transition-colors duration-200 ${emailFocused ? "text-[#C5A880]" : "text-[#9CA3AF]"}`}
                    />
                    <input
                      id="login-email"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      onFocus={() => setEmailFocused(true)}
                      onBlur={() => setEmailFocused(false)}
                      placeholder="your@email.com"
                      required
                      autoComplete="email"
                      className="w-full pl-11 pr-4 py-3.5 border border-[#E5E7EB] rounded-xl text-sm text-[#111827] placeholder-[#9CA3AF] outline-none focus:border-[#C5A880] focus:ring-2 focus:ring-[#C5A880]/15 transition-all duration-200 bg-[#FAFAFA] focus:bg-white"
                    />
                  </div>
                </div>

                {/* Password */}
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <label htmlFor="login-password" className="block text-[12px] font-semibold uppercase tracking-widest text-[#374151]">
                      Password
                    </label>
                    <button
                      type="button"
                      onClick={() => setShowForgot(true)}
                      className="text-[11px] text-[#C5A880] hover:text-[#A3845A] transition-colors font-medium"
                    >
                      Forgot password?
                    </button>
                  </div>
                  <div className="relative">
                    <Lock
                      className={`absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 transition-colors duration-200 ${passwordFocused ? "text-[#C5A880]" : "text-[#9CA3AF]"}`}
                    />
                    <input
                      id="login-password"
                      type={showPassword ? "text" : "password"}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      onFocus={() => setPasswordFocused(true)}
                      onBlur={() => setPasswordFocused(false)}
                      placeholder="Your password"
                      required
                      autoComplete="current-password"
                      className="w-full pl-11 pr-12 py-3.5 border border-[#E5E7EB] rounded-xl text-sm text-[#111827] placeholder-[#9CA3AF] outline-none focus:border-[#C5A880] focus:ring-2 focus:ring-[#C5A880]/15 transition-all duration-200 bg-[#FAFAFA] focus:bg-white"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      aria-label="Toggle password visibility"
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-[#9CA3AF] hover:text-[#374151] transition-colors"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                {/* Submit */}
                <button
                  type="submit"
                  disabled={isLoading}
                  id="login-submit-btn"
                  className="flex items-center justify-center gap-2 w-full py-3.5 rounded-xl font-semibold text-sm bg-[#111827] text-white hover:bg-[#27272A] hover:-translate-y-0.5 hover:shadow-lg disabled:opacity-60 disabled:cursor-wait disabled:transform-none transition-all duration-200"
                >
                  {isLoading ? (
                    <span className="flex items-center gap-2">
                      <svg className="w-4 h-4 animate-spin" viewBox="0 0 24 24" fill="none">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                      </svg>
                      Signing in…
                    </span>
                  ) : (
                    <><span>Sign In</span><ArrowRight className="w-4 h-4" /></>
                  )}
                </button>

                {/* Divider */}
                <div className="flex items-center gap-3 py-1">
                  <div className="flex-1 h-px bg-[#F3F4F6]" />
                  <span className="text-[11px] text-[#9CA3AF] font-sans tracking-wider">NEW TO RIWAYAH?</span>
                  <div className="flex-1 h-px bg-[#F3F4F6]" />
                </div>

                {/* Create account */}
                <Link
                  href="/auth/signup"
                  className="flex items-center justify-center gap-2 w-full py-3.5 border border-[#E5E7EB] rounded-xl text-sm font-semibold text-[#374151] hover:border-[#111827] hover:text-[#111827] hover:bg-[#F9FAFB] transition-all duration-200"
                >
                  Create an Account
                </Link>
              </motion.form>
            )}
          </AnimatePresence>

          {/* Footer micro-copy */}
          <p className="mt-8 text-center text-[11px] text-[#9CA3AF] font-sans leading-relaxed">
            By signing in you agree to our{" "}
            <Link href="/about" className="underline hover:text-[#374151] transition-colors">Terms</Link>
            {" "}and{" "}
            <Link href="/about" className="underline hover:text-[#374151] transition-colors">Privacy Policy</Link>
          </p>
        </motion.div>
      </div>
    </div>
  );
}
