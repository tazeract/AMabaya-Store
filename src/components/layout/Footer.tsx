"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Mail, Phone, MapPin, ArrowRight, Check, MessageCircle } from "lucide-react";
import siteConfig from "@/lib/siteConfig";

const shopLinks = [
  { label: "Luxury Abayas", href: "/products?category=Abaya" },
  { label: "Royal Kaftans", href: "/products?category=Kaftan" },
  { label: "Organza Dupattas", href: "/products?category=Dupatta" },
  { label: "New In: Festive Edit", href: "/products?filter=new" },
  { label: "Bestseller Silhouettes", href: "/products?filter=bestseller" },
];

const customerCareLinks = [
  { label: "Track Your Order", href: "/order-tracking" },
  { label: "Shipping & Nationwide Delivery", href: "/contact" },
  { label: "7-Day Return & Exchange", href: "/contact" },
  { label: "Size & Measurement Guide", href: "/about#size-guide" },
  { label: "WhatsApp Styling Concierge", href: `https://wa.me/${siteConfig.whatsappNumber}`, external: true },
];

const brandLinks = [
  { label: "The RIWAYAH Story", href: "/about" },
  { label: "Artisanal Craftsmanship", href: "/about" },
  { label: "Contact & Flagship Store", href: "/contact" },
  { label: "Privacy Policy", href: "/contact?ref=privacy" },
  { label: "Terms of Service", href: "/contact?ref=terms" },
];

// Payment method badges config
const paymentMethods = [
  {
    label: "COD",
    fullLabel: "Cash on Delivery",
    bg: "bg-emerald-50",
    text: "text-emerald-800",
    border: "border-emerald-200",
    icon: (
      <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <rect x="1" y="4" width="22" height="16" rx="2" />
        <line x1="1" y1="10" x2="23" y2="10" />
      </svg>
    ),
  },
  {
    label: "JazzCash",
    fullLabel: "JazzCash",
    bg: "bg-red-50",
    text: "text-red-700",
    border: "border-red-200",
    icon: (
      <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="currentColor">
        <circle cx="12" cy="12" r="10" opacity="0.15" />
        <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 14v-4H7l5-8v4h4l-5 8z" />
      </svg>
    ),
  },
  {
    label: "EasyPaisa",
    fullLabel: "EasyPaisa",
    bg: "bg-green-50",
    text: "text-green-700",
    border: "border-green-200",
    icon: (
      <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="currentColor">
        <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm.31-8.86c-1.77-.45-2.34-.94-2.34-1.67 0-.84.79-1.43 2.1-1.43 1.38 0 1.9.66 1.94 1.64h1.71c-.05-1.34-.87-2.57-2.49-2.97V5H10.9v1.69c-1.51.32-2.72 1.3-2.72 2.81 0 1.79 1.49 2.69 3.66 3.21 1.95.46 2.34 1.15 2.34 1.86 0 .53-.39 1.39-2.1 1.39-1.6 0-2.23-.72-2.32-1.64H8.04c.1 1.7 1.36 2.66 2.86 2.97V19h2.34v-1.67c1.52-.29 2.72-1.16 2.73-2.77-.01-2.2-1.9-2.96-3.66-3.42z" />
      </svg>
    ),
  },
  {
    label: "Visa",
    fullLabel: "Visa",
    bg: "bg-blue-50",
    text: "text-blue-700",
    border: "border-blue-200",
    icon: (
      <svg className="w-6 h-3.5" viewBox="0 0 48 16" fill="currentColor">
        <path d="M18.4 0.8L14.8 15.2H11.2L14.8 0.8H18.4ZM30.8 10.1L32.7 4.8L33.8 10.1H30.8ZM35.2 15.2H38.5L35.6 0.8H32.5C31.8 0.8 31.2 1.2 30.9 1.8L25.6 15.2H29.3L30 13.3H34.4L35.2 15.2ZM25.5 10.4C25.5 6.8 20.3 6.6 20.3 5C20.3 4.5 20.8 4 21.9 3.8C23.8 3.7 25.6 4.2 26.9 4.8L27.5 1.5C26.2 1 24.8 0.8 23.2 0.8C19.7 0.8 17.3 2.6 17.3 5.2C17.3 7.2 19.1 8.3 20.5 8.9C21.9 9.5 22.4 9.9 22.4 10.5C22.4 11.4 21.3 11.8 20.2 11.8C18.5 11.8 16.8 11.3 15.7 10.7L15.1 14.1C16.3 14.7 18.2 15.2 20.2 15.2C23.9 15.2 26.5 13.4 26.5 10.5L25.5 10.4ZM12.1 0.8L6.5 15.2H2.8L0 2.2C0.8 3.2 2.6 4.3 4.3 4.8L6.4 0.8H12.1Z" />
      </svg>
    ),
  },
  {
    label: "Mastercard",
    fullLabel: "Mastercard",
    bg: "bg-orange-50",
    text: "text-orange-700",
    border: "border-orange-200",
    icon: (
      <svg className="w-5 h-3.5" viewBox="0 0 38 24" fill="none">
        <rect width="38" height="24" rx="4" fill="transparent" />
        <circle cx="15" cy="12" r="7" fill="#EB001B" opacity="0.9" />
        <circle cx="23" cy="12" r="7" fill="#F79E1B" opacity="0.9" />
        <path d="M19 6.8a7 7 0 0 1 0 10.4A7 7 0 0 1 19 6.8z" fill="#FF5F00" opacity="0.85" />
      </svg>
    ),
  },
];

export function Footer() {
  const pathname = usePathname();
  const [email, setEmail] = useState("");
  const [subscribed, setSubscribed] = useState(false);

  if (pathname?.startsWith("/admin")) {
    return null;
  }

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (email) {
      setSubscribed(true);
      setEmail("");
    }
  };

  const year = new Date().getFullYear();

  return (
    <footer className="bg-white border-t border-[#E5E7EB] text-[#111827]">
      {/* ─── Newsletter & RIWAYAH Circle Section ─────────────────────────── */}
      <div className="border-b border-[#E5E7EB] bg-[#FBF9F6] py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto text-center">
          <p className="text-[11px] font-sans font-semibold tracking-[0.25em] text-[#A3845A] uppercase mb-2">
            The Haute Modesty Newsletter
          </p>
          <h2 className="font-serif text-3xl sm:text-4xl text-[#111827] font-normal tracking-tight mb-3">
            Join The RIWAYAH Circle
          </h2>
          <p className="text-sm text-[#4B5563] font-sans max-w-md mx-auto mb-8">
            Enjoy first access to exclusive limited editions, festive releases, and private styling sessions.
          </p>

          <form onSubmit={handleSubscribe} className="flex flex-col sm:flex-row gap-2 max-w-md mx-auto">
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email address..."
              required
              aria-label="Email address for newsletter"
              className="flex-1 px-4 py-3 bg-white border border-[#D1D5DB] text-sm text-[#111827] placeholder-[#9CA3AF] focus:border-[#111827] focus:outline-none transition-colors"
            />
            <button
              type="submit"
              className="luxury-btn-primary whitespace-nowrap"
            >
              {subscribed ? (
                <span className="flex items-center gap-1">
                  <Check className="w-4 h-4 text-emerald-400" /> Subscribed
                </span>
              ) : (
                <span>Subscribe</span>
              )}
            </button>
          </form>
          {subscribed && (
            <p className="text-xs text-emerald-700 font-sans mt-3">
              Thank you for subscribing to RIWAYAH Circle. Welcome!
            </p>
          )}
        </div>
      </div>

      {/* ─── Main 4-Column Footer Links ─────────────────────────────────── */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10 lg:gap-12">
          
          {/* Col 1: About & Contact */}
          <div className="space-y-4">
            <Link href="/" className="inline-block">
              <span className="font-serif text-2xl font-medium tracking-[0.25em] text-[#111827]">
                RIWAYAH
              </span>
              <p className="text-[9px] text-[#6B7280] tracking-widest uppercase -mt-1">
                Haute Modesty · Lahore, Pakistan
              </p>
            </Link>
            <p className="text-xs text-[#4B5563] font-sans leading-relaxed">
              Pakistan&apos;s luxury modest fashion brand, crafting timeless abayas, royal kaftans, and organza dupattas with heirloom Pakistani craftsmanship.
            </p>

            <div className="space-y-2.5 pt-2 text-xs text-[#4B5563] font-sans">
              <div className="flex items-start gap-2.5">
                <MapPin className="w-4 h-4 text-[#111827] shrink-0 mt-0.5" />
                <span>{siteConfig.address}</span>
              </div>
              <div className="flex items-center gap-2.5">
                <Phone className="w-4 h-4 text-[#111827] shrink-0" />
                <a href={`tel:${siteConfig.contactPhone}`} className="hover:text-[#111827]">
                  {siteConfig.contactPhone}
                </a>
              </div>
              <div className="flex items-center gap-2.5">
                <Mail className="w-4 h-4 text-[#111827] shrink-0" />
                <a href={`mailto:${siteConfig.contactEmail}`} className="hover:text-[#111827]">
                  {siteConfig.contactEmail}
                </a>
              </div>
            </div>

            {/* WhatsApp concierge */}
            <a
              href={`https://wa.me/${siteConfig.whatsappNumber}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 mt-2 px-3 py-2 bg-emerald-900 text-white text-[11px] font-sans font-semibold uppercase tracking-wider hover:bg-emerald-950 transition-colors"
            >
              <MessageCircle className="w-3.5 h-3.5" />
              <span>WhatsApp Concierge</span>
            </a>
          </div>

          {/* Col 2: Shop Categories */}
          <div>
            <h3 className="text-xs font-sans font-semibold text-[#111827] uppercase tracking-[0.18em] mb-5">
              Shop Collections
            </h3>
            <ul className="space-y-3 text-xs font-sans text-[#4B5563]">
              {shopLinks.map((link) => (
                <li key={link.label}>
                  <Link href={link.href} className="hover:text-[#111827] transition-colors flex items-center gap-1.5 group">
                    <ArrowRight className="w-3 h-3 opacity-0 group-hover:opacity-100 text-[#C5A880] transition-all -translate-x-1 group-hover:translate-x-0" />
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Col 3: Customer Care */}
          <div>
            <h3 className="text-xs font-sans font-semibold text-[#111827] uppercase tracking-[0.18em] mb-5">
              Customer Concierge
            </h3>
            <ul className="space-y-3 text-xs font-sans text-[#4B5563]">
              {customerCareLinks.map((link) => (
                <li key={link.label}>
                  <Link
                    href={link.href}
                    target={link.external ? "_blank" : undefined}
                    rel={link.external ? "noopener noreferrer" : undefined}
                    className="hover:text-[#111827] transition-colors flex items-center gap-1.5 group"
                  >
                    <ArrowRight className="w-3 h-3 opacity-0 group-hover:opacity-100 text-[#C5A880] transition-all -translate-x-1 group-hover:translate-x-0" />
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Col 4: Social & Connect */}
          <div>
            <h3 className="text-xs font-sans font-semibold text-[#111827] uppercase tracking-[0.18em] mb-5">
              Follow Our World
            </h3>
            <p className="text-xs text-[#4B5563] font-sans leading-relaxed mb-4">
              Explore styling inspiration and behind-the-scenes glimpses on our official social channels.
            </p>

            <div className="flex items-center gap-2 mb-6">
              {/* Instagram */}
              <a
                href={siteConfig.socialLinks.instagram}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Instagram"
                className="w-9 h-9 border border-[#D1D5DB] flex items-center justify-center text-[#111827] hover:bg-[#E1306C] hover:text-white hover:border-[#E1306C] transition-all"
              >
                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <rect width="20" height="20" x="2" y="2" rx="5" ry="5"/>
                  <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/>
                  <line x1="17.5" x2="17.51" y1="6.5" y2="6.5"/>
                </svg>
              </a>

              {/* Facebook */}
              <a
                href={siteConfig.socialLinks.facebook}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Facebook"
                className="w-9 h-9 border border-[#D1D5DB] flex items-center justify-center text-[#111827] hover:bg-[#1877F2] hover:text-white hover:border-[#1877F2] transition-all"
              >
                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/>
                </svg>
              </a>

              {/* TikTok */}
              <a
                href={siteConfig.socialLinks.tiktok}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="TikTok"
                className="w-9 h-9 border border-[#D1D5DB] flex items-center justify-center text-[#111827] hover:bg-[#010101] hover:text-white hover:border-[#010101] transition-all"
              >
                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-2.88 2.5 2.89 2.89 0 0 1-2.89-2.89 2.89 2.89 0 0 1 2.89-2.89c.28 0 .54.04.79.1V9.01a6.32 6.32 0 0 0-.79-.05 6.34 6.34 0 0 0-6.34 6.34 6.34 6.34 0 0 0 6.34 6.34 6.34 6.34 0 0 0 6.33-6.34V8.69a8.27 8.27 0 0 0 4.83 1.54V6.78a4.85 4.85 0 0 1-1.06-.09z"/>
                </svg>
              </a>

              {/* WhatsApp */}
              <a
                href={`https://wa.me/${siteConfig.whatsappNumber}`}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="WhatsApp"
                className="w-9 h-9 border border-[#D1D5DB] flex items-center justify-center text-[#111827] hover:bg-emerald-700 hover:text-white hover:border-emerald-700 transition-all"
              >
                <MessageCircle className="w-4 h-4" />
              </a>
            </div>

            <div className="bg-[#FBF9F6] p-3 border border-[#E5E7EB]">
              <p className="text-[11px] font-sans font-semibold text-[#111827] uppercase tracking-wider">
                Helpline Hours
              </p>
              <p className="text-[11px] text-[#6B7280] font-sans mt-0.5">
                Mon – Sat: 11:00 AM – 9:00 PM PKT
              </p>
            </div>
          </div>

        </div>
      </div>

      {/* ─── Bottom Bar with Payment Icons & Copyright ───────────────────── */}
      <div className="border-t border-[#E5E7EB] bg-[#FBF9F6] py-6 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-xs text-[#6B7280] font-sans">
            © {year} {siteConfig.storeName} Modest Wear. All Rights Reserved.
          </p>

          {/* Payment Method Trust Badges */}
          <div className="flex items-center flex-wrap gap-1.5">
            {paymentMethods.map((pm) => (
              <span
                key={pm.label}
                title={pm.fullLabel}
                className={`inline-flex items-center gap-1.5 px-2.5 py-1 ${pm.bg} ${pm.text} border ${pm.border} text-[10px] font-semibold font-sans rounded`}
              >
                {pm.icon}
                <span>{pm.label}</span>
              </span>
            ))}
          </div>

          <div className="flex items-center gap-4 text-xs text-[#6B7280] font-sans">
            <Link href="/contact?ref=privacy" className="hover:text-[#111827]">Privacy Policy</Link>
            <span>·</span>
            <Link href="/contact?ref=terms" className="hover:text-[#111827]">Terms & Conditions</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
