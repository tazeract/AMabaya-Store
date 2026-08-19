"use client";

import { useState } from "react";
import Link from "next/link";
import { Mail, Phone, MapPin, ArrowRight, Check } from "lucide-react";
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
  { label: "Size & Measurement Guide", href: "/about" },
  { label: "WhatsApp Styling Concierge", href: `https://wa.me/${siteConfig.whatsappNumber}` },
];

const brandLinks = [
  { label: "The AMabaya Story", href: "/about" },
  { label: "Artisanal Craftsmanship", href: "/about" },
  { label: "Contact & Flagship Store", href: "/contact" },
  { label: "Privacy Policy", href: "/contact" },
  { label: "Terms of Service", href: "/contact" },
];

export function Footer() {
  const [email, setEmail] = useState("");
  const [subscribed, setSubscribed] = useState(false);

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
      {/* ─── Newsletter & AMabaya Circle Section ───────────────────────────── */}
      <div className="border-b border-[#E5E7EB] bg-[#FBF9F6] py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto text-center">
          <p className="text-[11px] font-sans font-semibold tracking-[0.25em] text-[#A3845A] uppercase mb-2">
            The Haute Modesty Newsletter
          </p>
          <h2 className="font-serif text-3xl sm:text-4xl text-[#111827] font-normal tracking-tight mb-3">
            Join The AMabaya Circle
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
              Thank you for subscribing to AMabaya Circle. Welcome!
            </p>
          )}
        </div>
      </div>

      {/* ─── Main 4-Column Footer Links ────────────────────────────────────── */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10 lg:gap-12">
          
          {/* Col 1: About & Contact */}
          <div className="space-y-4">
            <Link href="/" className="inline-block">
              <span className="font-serif text-2xl font-medium tracking-[0.25em] text-[#111827]">
                AMABAYA
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
                <span>Shop 14, Main Boulevard, Gulberg III, Lahore, Pakistan</span>
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
          </div>

          {/* Col 2: Shop Categories */}
          <div>
            <h3 className="text-xs font-sans font-semibold text-[#111827] uppercase tracking-[0.18em] mb-5">
              Shop Collections
            </h3>
            <ul className="space-y-3 text-xs font-sans text-[#4B5563]">
              {shopLinks.map((link) => (
                <li key={link.label}>
                  <Link href={link.href} className="hover:text-[#111827] transition-colors">
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
                  <Link href={link.href} className="hover:text-[#111827] transition-colors">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Col 4: Social & WhatsApp Connect */}
          <div>
            <h3 className="text-xs font-sans font-semibold text-[#111827] uppercase tracking-[0.18em] mb-5">
              Follow Our World
            </h3>
            <p className="text-xs text-[#4B5563] font-sans leading-relaxed mb-4">
              Explore styling inspiration and behind-the-scenes glimpses on our official social channels.
            </p>

            <div className="flex items-center gap-2 mb-6">
              <a
                href={siteConfig.socialLinks.instagram}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Instagram"
                className="w-9 h-9 border border-[#D1D5DB] flex items-center justify-center text-[#111827] hover:bg-[#111827] hover:text-white transition-colors"
              >
                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <rect width="20" height="20" x="2" y="2" rx="5" ry="5"/>
                  <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/>
                  <line x1="17.5" x2="17.51" y1="6.5" y2="6.5"/>
                </svg>
              </a>
              <a
                href={siteConfig.socialLinks.facebook}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Facebook"
                className="w-9 h-9 border border-[#D1D5DB] flex items-center justify-center text-[#111827] hover:bg-[#111827] hover:text-white transition-colors"
              >
                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/>
                </svg>
              </a>
              <a
                href={`https://wa.me/${siteConfig.whatsappNumber}`}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="WhatsApp"
                className="w-9 h-9 border border-[#D1D5DB] flex items-center justify-center text-[#111827] hover:bg-emerald-700 hover:text-white hover:border-emerald-700 transition-colors"
              >
                <Phone className="w-4 h-4" />
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

      {/* ─── Bottom Bar with Payment Icons & Copyright ──────────────────────── */}
      <div className="border-t border-[#E5E7EB] bg-[#FBF9F6] py-6 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-[#6B7280] font-sans">
          <p>© {year} {siteConfig.storeName} Modest Wear. All Rights Reserved.</p>

          {/* Payment Badges in Pakistan */}
          <div className="flex items-center flex-wrap gap-2 text-[11px] font-medium text-[#374151]">
            <span className="px-2 py-1 bg-white border border-[#E5E7EB]">Cash on Delivery</span>
            <span className="px-2 py-1 bg-white border border-[#E5E7EB]">Visa</span>
            <span className="px-2 py-1 bg-white border border-[#E5E7EB]">Mastercard</span>
            <span className="px-2 py-1 bg-white border border-[#E5E7EB]">JazzCash</span>
            <span className="px-2 py-1 bg-white border border-[#E5E7EB]">EasyPaisa</span>
          </div>

          <div className="flex items-center gap-4 text-xs">
            <Link href="/contact" className="hover:text-[#111827]">Privacy Policy</Link>
            <span>·</span>
            <Link href="/contact" className="hover:text-[#111827]">Terms & Conditions</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
