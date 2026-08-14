"use client";

import Link from "next/link";
import { Mail, Phone, MapPin, Heart } from "lucide-react";
import siteConfig from "@/lib/siteConfig";

const footerLinks = {
  Collections: [
    { label: "Abayas", href: "/products?category=Abaya" },
    { label: "Kaftans", href: "/products?category=Kaftan" },
    { label: "Dupattas", href: "/products?category=Dupatta" },
    { label: "New Arrivals", href: "/products?filter=new" },
    { label: "Bestsellers", href: "/products?filter=bestseller" },
  ],
  "Customer Care": [
    { label: "Size Guide", href: "/size-guide" },
    { label: "Track Your Order", href: "/order-tracking" },
    { label: "Returns & Exchange", href: "/returns" },
    { label: "Shipping Policy", href: "/shipping" },
    { label: "FAQ", href: "/faq" },
  ],
  Company: [
    { label: "Our Story", href: "/about" },
    { label: "Contact Us", href: "/contact" },
    { label: "Privacy Policy", href: "/privacy" },
    { label: "Terms of Service", href: "/terms" },
  ],
};

export function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="bg-[#0E0B09] text-[var(--color-text-on-dark)]">
      {/* Newsletter band */}
      <div className="border-b border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12">
          <div className="grid md:grid-cols-2 gap-8 items-center">
            <div>
              <h2 className="font-display text-3xl font-semibold text-gradient mb-2">
                Join the AMabaya Circle
              </h2>
              <p className="text-white/60 text-sm">
                Be the first to know about new collections, exclusive offers, and styling inspiration.
              </p>
            </div>
            <form
              onSubmit={(e) => e.preventDefault()}
              className="flex gap-3"
            >
              <input
                type="email"
                placeholder="Your email address"
                aria-label="Email address for newsletter"
                className="flex-1 bg-white/10 border border-white/20 rounded-full px-5 py-3 text-sm text-white placeholder-white/40 outline-none focus:border-[var(--color-gold)] transition-colors"
              />
              <button
                type="submit"
                className="px-6 py-3 bg-gradient-to-r from-[var(--color-gold-light)] to-[var(--color-gold-dark)] text-white rounded-full text-sm font-medium whitespace-nowrap hover:opacity-90 transition-opacity"
              >
                Subscribe
              </button>
            </form>
          </div>
        </div>
      </div>

      {/* Main links */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10">
          {/* Brand column */}
          <div className="lg:col-span-2">
            <Link href="/" className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[var(--color-gold-light)] to-[var(--color-gold-dark)] flex items-center justify-center">
                <span className="font-display font-bold text-white">
                  {siteConfig.logoText}
                </span>
              </div>
              <span className="font-display text-2xl font-semibold text-white">
                {siteConfig.storeName}
              </span>
            </Link>
            <p className="text-white/50 text-sm leading-relaxed mb-6 max-w-xs">
              {siteConfig.storeDescription}
            </p>

            {/* Contact info */}
            <div className="space-y-3">
              <a
                href={`tel:${siteConfig.contactPhone}`}
                className="flex items-center gap-3 text-sm text-white/60 hover:text-[var(--color-gold)] transition-colors"
              >
                <Phone className="w-4 h-4 text-[var(--color-gold)]" />
                {siteConfig.contactPhone}
              </a>
              <a
                href={`mailto:${siteConfig.contactEmail}`}
                className="flex items-center gap-3 text-sm text-white/60 hover:text-[var(--color-gold)] transition-colors"
              >
                <Mail className="w-4 h-4 text-[var(--color-gold)]" />
                {siteConfig.contactEmail}
              </a>
              <div className="flex items-start gap-3 text-sm text-white/60">
                <MapPin className="w-4 h-4 text-[var(--color-gold)] shrink-0 mt-0.5" />
                {siteConfig.address}
              </div>
            </div>

            {/* Social links */}
            <div className="flex items-center gap-3 mt-6">
              <a
                href={siteConfig.socialLinks.instagram}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="AMabaya on Instagram"
                className="w-9 h-9 rounded-full border border-white/20 flex items-center justify-center text-white/60 hover:border-[var(--color-gold)] hover:text-[var(--color-gold)] transition-all"
              >
                {/* Instagram icon */}
                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect width="20" height="20" x="2" y="2" rx="5" ry="5"/>
                  <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/>
                  <line x1="17.5" x2="17.51" y1="6.5" y2="6.5"/>
                </svg>
              </a>
              <a
                href={siteConfig.socialLinks.facebook}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="AMabaya on Facebook"
                className="w-9 h-9 rounded-full border border-white/20 flex items-center justify-center text-white/60 hover:border-[var(--color-gold)] hover:text-[var(--color-gold)] transition-all"
              >
                {/* Facebook icon */}
                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/>
                </svg>
              </a>
              <a
                href={`https://wa.me/${siteConfig.whatsappNumber}`}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Chat with AMabaya on WhatsApp"
                className="w-9 h-9 rounded-full border border-white/20 flex items-center justify-center text-white/60 hover:border-green-400 hover:text-green-400 transition-all"
              >
                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                </svg>
              </a>
            </div>
          </div>

          {/* Link columns */}
          {Object.entries(footerLinks).map(([heading, links]) => (
            <div key={heading}>
              <h3 className="font-display text-sm font-semibold text-[var(--color-gold)] uppercase tracking-widest mb-5">
                {heading}
              </h3>
              <ul className="space-y-3">
                {links.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className="text-sm text-white/50 hover:text-white transition-colors"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>

      {/* Bottom bar */}
      <div className="border-t border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-5 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-white/40">
          <p>
            © {year} {siteConfig.storeName}. All rights reserved.
          </p>
          <p className="flex items-center gap-1">
            Made with <Heart className="w-3 h-3 text-[var(--color-gold)] fill-current" /> in Pakistan
          </p>
          <div className="flex items-center gap-3">
            {["Visa", "Mastercard", "EasyPaisa", "JazzCash", "COD"].map((method) => (
              <span
                key={method}
                className="px-2 py-0.5 border border-white/15 rounded text-[10px] text-white/40"
              >
                {method}
              </span>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}
