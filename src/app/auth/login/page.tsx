"use client";

import { useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { Eye, EyeOff, ArrowRight, Mail, Lock } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import { toast } from "@/components/ui/Toaster";
import siteConfig from "@/lib/siteConfig";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { login } = useAuth();
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

  return (
    <div
      className="min-h-screen pt-24 pb-16 flex items-center justify-center px-4"
      style={{ background: "linear-gradient(135deg in oklch, var(--color-bg) 0%, #F0EAE2 100%)" }}
    >
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="w-full max-w-md bg-white p-8 sm:p-10 rounded-2xl shadow-xl shadow-[var(--color-gold)]/5 relative z-10"
      >
        {/* Brand header */}
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
            Welcome Back
          </h1>
          <p className="text-[var(--color-text-muted)] text-sm mt-2">
            Sign in to your {siteConfig.storeName} account
          </p>
        </div>

        {/* Glass card */}
        <div className="glass rounded-3xl border border-white/50 shadow-xl p-8">
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Email */}
            <div>
              <label htmlFor="login-email" className="block text-sm font-medium text-[var(--color-text-secondary)] mb-1.5">
                Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--color-text-muted)]" />
                <input
                  id="login-email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="your@email.com"
                  required
                  autoComplete="email"
                  className="w-full pl-10 pr-4 py-3 border border-[var(--color-border)] rounded-xl text-sm outline-none focus:border-[var(--color-gold)] focus:ring-2 focus:ring-[var(--color-gold)]/20 transition-all"
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label htmlFor="login-password" className="text-sm font-medium text-[var(--color-text-secondary)]">
                  Password
                </label>
                <button type="button" className="text-xs text-[var(--color-gold)] hover:underline">
                  Forgot password?
                </button>
              </div>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--color-text-muted)]" />
                <input
                  id="login-password"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Your password"
                  required
                  autoComplete="current-password"
                  className="w-full pl-10 pr-12 py-3 border border-[var(--color-border)] rounded-xl text-sm outline-none focus:border-[var(--color-gold)] focus:ring-2 focus:ring-[var(--color-gold)]/20 transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  aria-label="Toggle password visibility"
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[var(--color-text-muted)] hover:text-[var(--color-text-secondary)] transition-colors"
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
              className={`flex items-center justify-center gap-2 w-full py-4 rounded-2xl font-semibold text-sm transition-all ${
                isLoading
                  ? "bg-[var(--color-gold)]/60 text-white cursor-wait"
                  : "bg-gradient-to-r from-[var(--color-gold)] to-[var(--color-gold-dark)] text-white shadow-[var(--shadow-gold)] hover:-translate-y-0.5 hover:shadow-xl"
              }`}
            >
              {isLoading ? "Signing in..." : <>Sign In <ArrowRight className="w-4 h-4" /></>}
            </button>
          </form>

          {/* Divider */}
          <div className="flex items-center gap-4 my-6">
            <div className="flex-1 h-px bg-[var(--color-border)]" />
            <span className="text-xs text-[var(--color-text-muted)]">Don&apos;t have an account?</span>
            <div className="flex-1 h-px bg-[var(--color-border)]" />
          </div>

          <Link
            href="/auth/signup"
            className="flex items-center justify-center gap-2 w-full py-3.5 border-2 border-[var(--color-gold)] text-[var(--color-gold)] rounded-2xl font-semibold text-sm hover:bg-[var(--color-gold)] hover:text-white transition-all duration-300"
          >
            Create Account
          </Link>
        </div>
      </motion.div>
    </div>
  );
}
