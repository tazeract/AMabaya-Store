import Link from "next/link";
import { Home, ShoppingBag, ArrowRight } from "lucide-react";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Page Not Found — RIWAYAH",
};

export default function NotFound() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center text-center px-4 bg-[#FBF9F6]">
      {/* Decorative blurred orbs */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 rounded-full bg-[#C5A880]/8 blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-80 h-80 rounded-full bg-[#D4AF37]/8 blur-3xl" />
      </div>

      <div className="relative z-10 max-w-lg">
        {/* Large 404 numerals */}
        <div
          className="font-serif text-[160px] sm:text-[200px] font-medium leading-none select-none"
          style={{
            background: "linear-gradient(135deg, #C5A880 0%, #111827 50%, #A3845A 100%)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            backgroundClip: "text",
            opacity: 0.18,
          }}
        >
          404
        </div>

        <div className="-mt-10 sm:-mt-14">
          {/* Brand mark */}
          <div className="w-20 h-20 rounded-full bg-gradient-to-br from-[#EADBCC] to-[#A3845A] flex items-center justify-center mx-auto mb-6 shadow-[0_8px_32px_rgba(163,132,90,0.3)]"
            style={{ animation: "riwayahFloat 3s ease-in-out infinite" }}>
            <span className="font-serif font-bold text-white text-2xl tracking-widest">R</span>
          </div>

          <div className="inline-flex items-center gap-2 mb-3">
            <span className="h-px w-8 bg-[#C5A880]" />
            <span className="text-[10px] font-sans font-semibold tracking-[0.3em] text-[#A3845A] uppercase">
              Riwayah · Haute Modesty
            </span>
            <span className="h-px w-8 bg-[#C5A880]" />
          </div>

          <h1 className="font-serif text-3xl sm:text-4xl font-normal text-[#111827] mb-4 leading-tight">
            This Page Has Flown Away
          </h1>
          <p className="text-[#4B5563] text-sm font-sans mb-8 leading-relaxed max-w-sm mx-auto">
            We couldn&apos;t find the page you&apos;re looking for. It may have moved or never existed. Let&apos;s guide you back to our atelier.
          </p>

          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link
              href="/"
              className="flex items-center justify-center gap-2 px-7 py-3.5 bg-[#111827] text-white font-sans text-xs font-semibold uppercase tracking-[0.15em] hover:bg-[#27272A] hover:-translate-y-0.5 transition-all duration-300 shadow-md"
            >
              <Home className="w-4 h-4" />
              Return Home
            </Link>
            <Link
              href="/products"
              className="flex items-center justify-center gap-2 px-7 py-3.5 border border-[#C5A880] text-[#A3845A] font-sans text-xs font-semibold uppercase tracking-[0.15em] hover:bg-[#111827] hover:text-white hover:border-[#111827] transition-all duration-300"
            >
              <ShoppingBag className="w-4 h-4" />
              Browse Collection
            </Link>
          </div>

          {/* Quick links */}
          <div className="mt-8 flex items-center justify-center gap-4 text-[11px] text-[#9CA3AF] font-sans">
            <Link href="/products?category=Abaya" className="hover:text-[#111827] transition-colors flex items-center gap-1">
              <ArrowRight className="w-3 h-3" /> Abayas
            </Link>
            <Link href="/products?category=Kaftan" className="hover:text-[#111827] transition-colors flex items-center gap-1">
              <ArrowRight className="w-3 h-3" /> Kaftans
            </Link>
            <Link href="/contact" className="hover:text-[#111827] transition-colors flex items-center gap-1">
              <ArrowRight className="w-3 h-3" /> Contact
            </Link>
          </div>
        </div>
      </div>

      {/* Floating animation keyframes injected inline */}
      <style>{`
        @keyframes riwayahFloat {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-8px); }
        }
      `}</style>
    </div>
  );
}
