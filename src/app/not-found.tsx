import Link from "next/link";
import { Home, Search, ShoppingBag } from "lucide-react";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Page Not Found",
};

export default function NotFound() {
  return (
    <div
      className="min-h-screen flex flex-col items-center justify-center text-center px-4"
      style={{ background: "linear-gradient(135deg in oklch, var(--color-bg) 0%, #F0EAE2 100%)" }}
    >
      {/* Decorative */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 rounded-full bg-[var(--color-gold)]/5 blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-80 h-80 rounded-full bg-[var(--color-champagne)]/5 blur-3xl" />
      </div>

      <div className="relative z-10 max-w-md">
        {/* 404 display */}
        <div className="font-display text-[160px] sm:text-[200px] font-bold leading-none text-gradient opacity-20 select-none">
          404
        </div>

        <div className="-mt-12">
          <div className="w-20 h-20 rounded-full bg-gradient-to-br from-[var(--color-gold-light)] to-[var(--color-gold-dark)] flex items-center justify-center mx-auto mb-6 animate-float shadow-[var(--shadow-gold)]">
            <span className="font-display font-bold text-white text-2xl">AM</span>
          </div>

          <h1 className="font-display text-3xl sm:text-4xl font-bold text-[var(--color-text-primary)] mb-4">
            This Page Has Flown Away
          </h1>
          <p className="text-[var(--color-text-secondary)] text-sm mb-8 leading-relaxed">
            We couldn&apos;t find the page you&apos;re looking for. Perhaps it was moved, or maybe it never existed. Let&apos;s get you back on track.
          </p>

          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link
              href="/"
              className="flex items-center justify-center gap-2 px-6 py-3.5 bg-gradient-to-r from-[var(--color-gold)] to-[var(--color-gold-dark)] text-white rounded-full font-medium text-sm shadow-[var(--shadow-gold)] hover:-translate-y-0.5 transition-all"
            >
              <Home className="w-4 h-4" />
              Go Home
            </Link>
            <Link
              href="/products"
              className="flex items-center justify-center gap-2 px-6 py-3.5 border-2 border-[var(--color-gold)] text-[var(--color-gold)] rounded-full font-medium text-sm hover:bg-[var(--color-gold)] hover:text-white transition-all"
            >
              <ShoppingBag className="w-4 h-4" />
              Browse Collection
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
