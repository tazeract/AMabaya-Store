"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  ShoppingBag,
  Heart,
  Search,
  Menu,
  X,
  User,
  ChevronDown,
  Phone,
  ArrowRight,
  LogOut,
  LayoutDashboard,
} from "lucide-react";
import { useCart } from "@/context/CartContext";
import { useWishlist } from "@/context/WishlistContext";
import { useAuth } from "@/context/AuthContext";
import { SearchDrawer } from "@/components/products/SearchDrawer";
import siteConfig from "@/lib/siteConfig";

const announcements = [
  "FREE SHIPPING OVER RS. 5,000 | CASH ON DELIVERY AVAILABLE ALL OVER PAKISTAN",
  "NEW ARRIVALS: FESTIVE LUXURY MODEST EDIT NOW LIVE",
  "EXCHANGE WITHIN 7 DAYS · DIRECT WHATSAPP STYLING HELPLINE",
];

const mainNavLinks = [
  {
    href: "/products?category=Abaya",
    label: "Abayas",
    featured: "Classic & Velvet Abayas",
    sub: [
      { href: "/products?category=Abaya", label: "All Abayas" },
      { href: "/products?category=Abaya&filter=bestseller", label: "Bestseller Cuts" },
      { href: "/products?category=Abaya&filter=new", label: "Festive Embroidered" },
      { href: "/products?category=Abaya", label: "Everyday Minimal" },
    ],
  },
  {
    href: "/products?category=Kaftan",
    label: "Kaftans",
    featured: "Silk & Georgette Drapes",
    sub: [
      { href: "/products?category=Kaftan", label: "All Kaftans" },
      { href: "/products?category=Kaftan&filter=bestseller", label: "Royal Raw Silk" },
      { href: "/products?category=Kaftan&filter=new", label: "Zari Embellished" },
    ],
  },
  {
    href: "/products?category=Dupatta",
    label: "Dupattas",
    featured: "Organza & Chiffon",
    sub: [
      { href: "/products?category=Dupatta", label: "All Dupattas" },
      { href: "/products?category=Dupatta&filter=bestseller", label: "Scalloped Organza" },
      { href: "/products?category=Dupatta", label: "Pearl Embroidered" },
    ],
  },
  { href: "/products?filter=new", label: "New In", isHighlight: true },
  { href: "/products?filter=bestseller", label: "Best Sellers" },
  { href: "/about", label: "About" },
  { href: "/contact", label: "Contact" },
];

// ─── UserNav: avatar badge + dropdown ────────────────────────────────────────
function UserNav() {
  const { user, logout } = useAuth();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  // Close on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  if (!user) {
    return (
      <Link
        href="/auth/login"
        aria-label="Customer Login Account"
        className="p-2 text-[#374151] hover:text-black transition-colors duration-300 group flex items-center justify-center cursor-pointer"
        title="Customer Login Account"
      >
        <User className="w-6 h-6 stroke-[1.6] group-hover:scale-125 group-hover:-translate-y-0.5 transition-all duration-300 ease-out" />
      </Link>
    );
  }

  const initials = user.name
    .split(" ")
    .map((w) => w[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen((o) => !o)}
        aria-label="Customer Account menu"
        aria-expanded={open}
        className="flex items-center gap-1.5 p-1 rounded-full hover:bg-[#F9FAFB] transition-all duration-300 group cursor-pointer"
        title={`Customer Account (${user.name})`}
      >
        <span className="w-8 h-8 rounded-full bg-gradient-to-br from-[var(--color-gold-light)] to-[var(--color-gold-dark)] flex items-center justify-center text-white text-[11px] font-bold tracking-wide shadow-sm group-hover:scale-105 group-hover:shadow-md transition-all duration-300">
          {initials}
        </span>
        <ChevronDown
          className={`w-3.5 h-3.5 text-[#6B7280] group-hover:text-[#111827] transition-transform duration-300 ease-out ${open ? "rotate-180" : ""}`}
        />
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 8, scale: 0.97 }}
            transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
            className="absolute top-full right-0 mt-2 w-52 bg-white/98 backdrop-blur-md border border-[#E5E7EB] rounded-xl shadow-[0_12px_32px_rgba(0,0,0,0.1)] overflow-hidden z-50"
          >
            {/* User info header */}
            <div className="px-4 py-3 border-b border-[#F3F4F6]">
              <p className="text-sm font-semibold text-[#111827] truncate">{user.name}</p>
              <p className="text-[11px] text-[#9CA3AF] truncate">{user.email}</p>
            </div>

            {/* Menu items */}
            <div className="py-1">
              <Link
                href="/account"
                onClick={() => setOpen(false)}
                className="flex items-center gap-3 px-4 py-2.5 text-sm text-[#374151] hover:bg-[#F9FAFB] hover:text-[#111827] transition-colors"
              >
                <LayoutDashboard className="w-4 h-4 text-[#9CA3AF]" />
                Customer Account
              </Link>
              <button
                onClick={async () => {
                  setOpen(false);
                  await logout();
                }}
                className="flex items-center gap-3 w-full px-4 py-2.5 text-sm text-[#374151] hover:bg-[#FEF2F2] hover:text-red-600 transition-colors"
              >
                <LogOut className="w-4 h-4 text-[#9CA3AF]" />
                Sign Out
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ─── Navbar ───────────────────────────────────────────────────────────────────
export function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
  const [announcementIdx, setAnnouncementIdx] = useState(0);
  const pathname = usePathname();

  if (pathname?.startsWith("/admin")) {
    return null;
  }
  const { itemCount } = useCart();
  const { count: wishlistCount } = useWishlist();
  const { user, logout } = useAuth();
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Rotating Announcement
  useEffect(() => {
    const timer = setInterval(() => {
      setAnnouncementIdx((prev) => (prev + 1) % announcements.length);
    }, 4500);
    return () => clearInterval(timer);
  }, []);

  // Scroll detection
  useEffect(() => {
    const onScroll = () => setIsScrolled(window.scrollY > 15);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Close mobile menu on route change
  useEffect(() => {
    setIsMobileOpen(false);
    setActiveDropdown(null);
  }, [pathname]);

  // Scroll lock when mobile menu open + close on Escape
  useEffect(() => {
    if (isMobileOpen) {
      document.body.style.overflow = "hidden";
      const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") setIsMobileOpen(false); };
      document.addEventListener("keydown", onKey);
      return () => {
        document.body.style.overflow = "";
        document.removeEventListener("keydown", onKey);
      };
    } else {
      document.body.style.overflow = "";
    }
  }, [isMobileOpen]);

  const handleOpenCart = () => {
    document.dispatchEvent(new CustomEvent("open-cart"));
  };

  return (
    <>
      <header className="fixed top-0 left-0 right-0 z-50 bg-white shadow-sm transition-all duration-300">
        {/* Top Announcement Bar */}
        <div className="bg-[#111827] text-white py-2 px-4 border-b border-white/10 overflow-hidden">
          <div className="max-w-7xl mx-auto flex items-center justify-between text-[11px] font-sans tracking-[0.18em] uppercase">
            <div className="hidden lg:flex items-center gap-3 text-white/70">
              <span>LAHORE · KARACHI · ISLAMABAD</span>
              <span>•</span>
              <a
                href={`https://wa.me/${siteConfig.whatsappNumber}`}
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-[var(--color-gold)] transition-colors flex items-center gap-1"
              >
                <Phone className="w-3 h-3" /> WhatsApp Helpline
              </a>
            </div>

            <div className="w-full lg:w-auto text-center flex-1 mx-2 h-4 overflow-hidden relative">
              <AnimatePresence mode="wait">
                <motion.p
                  key={announcementIdx}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.35 }}
                  className="font-medium text-white/95 truncate"
                >
                  {announcements[announcementIdx]}
                </motion.p>
              </AnimatePresence>
            </div>

            <div className="hidden lg:flex items-center gap-4 text-white/70">
              <Link href="/order-tracking" className="hover:text-white transition-colors">
                Track Order
              </Link>
              <span>•</span>
              <span>PKR (₨)</span>
            </div>
          </div>
        </div>

        {/* Main Sticky Header */}
        <div
          className={`border-b border-[#E5E7EB] transition-all duration-300 ${
            isScrolled ? "py-3 bg-white/95 backdrop-blur-md" : "py-4 bg-white"
          }`}
        >
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between">
            {/* Mobile Menu Toggle & Search */}
            <div className="flex items-center gap-2 lg:hidden">
              <button
                onClick={() => setIsMobileOpen(!isMobileOpen)}
                aria-label="Toggle menu"
                className="p-2 text-[#111827] hover:text-[var(--color-gold)] transition-colors"
              >
                {isMobileOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </button>
              <button
                onClick={() => setIsSearchOpen(true)}
                aria-label="Search"
                className="p-2 text-[#111827] hover:text-[var(--color-gold)] transition-colors"
              >
                <Search className="w-5 h-5" />
              </button>
            </div>

            {/* Brand Logo */}
            <div className="flex-shrink-0 text-center lg:text-left">
              <Link href="/" className="group inline-flex flex-col items-center lg:items-start" aria-label="RIWAYAH Home">
                <span className="font-serif text-2xl sm:text-3xl font-medium tracking-[0.28em] text-[#111827] group-hover:tracking-[0.32em] group-hover:text-[var(--color-gold-dark)] transition-all duration-500 ease-out">
                  RIWAYAH
                </span>
                <span className="text-[8px] font-sans tracking-[0.35em] text-[#6B7280] group-hover:text-[#111827] uppercase -mt-0.5 transition-colors duration-300">
                  Haute Modesty · Pakistan
                </span>
              </Link>
            </div>

            {/* Desktop Center Navigation */}
            <nav className="hidden lg:flex items-center gap-1.5 lg:gap-2 xl:gap-5" ref={dropdownRef}>
              {mainNavLinks.map((link) => (
                <div
                  key={link.label}
                  className="relative group"
                  onMouseEnter={() => link.sub && setActiveDropdown(link.label)}
                  onMouseLeave={() => setActiveDropdown(null)}
                >
                  <Link
                    href={link.href}
                    className={`relative px-3 lg:px-3.5 xl:px-4 py-2 text-[12.5px] xl:text-[13px] font-medium tracking-[0.1em] uppercase transition-all duration-300 ease-out inline-flex items-center gap-1.5 whitespace-nowrap hover:-translate-y-0.5 ${
                      pathname === link.href
                        ? "text-[#111827] font-semibold"
                        : link.isHighlight
                        ? "text-[var(--color-gold-dark)] hover:text-[#111827]"
                        : "text-[#374151] hover:text-[#111827]"
                    }`}
                  >
                    <span className="transition-colors duration-200">{link.label}</span>
                    {link.sub && (
                      <ChevronDown className="w-3.5 h-3.5 opacity-50 group-hover:opacity-100 group-hover:rotate-180 group-hover:text-[var(--color-gold-dark)] transition-all duration-300 ease-out" />
                    )}

                    {/* Classic Center-Expanding Animated Underline */}
                    <span className="absolute bottom-0 left-3 lg:left-3.5 xl:left-4 right-3 lg:right-3.5 xl:right-4 h-[2px] bg-gradient-to-r from-[var(--color-gold)] via-[#111827] to-[var(--color-gold)] scale-x-0 group-hover:scale-x-100 transition-transform duration-300 ease-out origin-center rounded-full" />
                  </Link>

                  {/* Mega / Minimal Dropdown with Smooth Reveal */}
                  {link.sub && (
                    <AnimatePresence>
                      {activeDropdown === link.label && (
                        <motion.div
                          initial={{ opacity: 0, y: 12, scale: 0.98 }}
                          animate={{ opacity: 1, y: 0, scale: 1 }}
                          exit={{ opacity: 0, y: 8, scale: 0.98 }}
                          transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
                          className="absolute top-full left-0 mt-1 min-w-[230px] bg-white/98 backdrop-blur-md border border-[#E5E7EB] shadow-[0_12px_32px_rgba(0,0,0,0.08)] py-3 z-50"
                        >
                          <div className="px-4 py-1.5 mb-2 border-b border-[#F3F4F6]">
                            <p className="text-[10px] uppercase tracking-widest text-[#9CA3AF] font-semibold">
                              {link.featured}
                            </p>
                          </div>
                          {link.sub.map((item) => (
                            <Link
                              key={item.label}
                              href={item.href}
                              className="group/item flex items-center justify-between px-4 py-2.5 text-[13px] text-[#4B5563] hover:text-[#111827] hover:bg-[#FBF9F6] transition-all duration-200"
                            >
                              <span className="group-hover/item:translate-x-1 transition-transform duration-200">
                                {item.label}
                              </span>
                              <ArrowRight className="w-3 h-3 opacity-0 -translate-x-1 group-hover/item:opacity-100 group-hover/item:translate-x-0 text-[var(--color-gold-dark)] transition-all duration-200" />
                            </Link>
                          ))}
                        </motion.div>
                      )}
                    </AnimatePresence>
                  )}
                </div>
              ))}
            </nav>

            {/* Right Quick Action Icons */}
            <div className="flex items-center gap-2 sm:gap-3 lg:gap-4">
              {/* Desktop Search Button */}
              <button
                onClick={() => setIsSearchOpen(true)}
                aria-label="Search"
                className="hidden lg:flex items-center gap-2.5 px-4 py-2 w-44 xl:w-56 text-xs text-[#6B7280] hover:text-[#111827] bg-[#F9FAFB] hover:bg-white rounded-full border border-[#E5E7EB] hover:border-[#111827] transition-all duration-300 ease-out hover:shadow-md hover:-translate-y-0.5 group cursor-pointer"
              >
                <Search className="w-4 h-4 text-[#6B7280] group-hover:text-[#111827] group-hover:scale-110 group-hover:rotate-6 flex-shrink-0 transition-all duration-300 ease-out" />
                <span className="font-sans text-[11px] tracking-wider uppercase truncate">Search...</span>
              </button>

              {/* Customer Account / Login */}
              <UserNav />

              {/* Wishlist Link (Hover changes to Blue with Heartbeat animation) */}
              <Link
                href="/wishlist"
                aria-label="Wishlist"
                className="p-2 text-[#374151] hover:text-blue-600 transition-colors duration-300 relative group flex items-center justify-center"
                title="Wishlist"
              >
                <Heart className="w-6 h-6 stroke-[1.6] group-hover:scale-125 group-hover:-rotate-6 transition-all duration-300 ease-out" />
                {wishlistCount > 0 && (
                  <span className="absolute top-0.5 right-0.5 w-4 h-4 bg-blue-600 text-white text-[10px] font-bold rounded-full flex items-center justify-center shadow-xs transition-transform duration-300 group-hover:scale-110">
                    {wishlistCount}
                  </span>
                )}
              </Link>

              {/* Cart Drawer Trigger Button (Hover changes to Red with Bag Tilt animation) */}
              <button
                onClick={handleOpenCart}
                aria-label="Shopping Cart"
                className="p-2 text-[#374151] hover:text-red-600 transition-colors duration-300 relative flex items-center justify-center group cursor-pointer"
                title="Shopping Cart"
              >
                <ShoppingBag className="w-6 h-6 stroke-[1.6] group-hover:scale-125 group-hover:-rotate-12 transition-all duration-300 ease-out" />
                {itemCount > 0 && (
                  <span className="w-4 h-4 bg-red-600 text-white text-[10px] font-bold rounded-full flex items-center justify-center absolute top-0.5 right-0.5 shadow-xs transition-transform duration-300 group-hover:scale-110">
                    {itemCount}
                  </span>
                )}
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Spacing element for sticky header */}
      <div className="h-[112px] lg:h-[118px]" />

      {/* Mobile Drawer Navigation */}
      <AnimatePresence>
        {isMobileOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm lg:hidden"
              onClick={() => setIsMobileOpen(false)}
            />
            <motion.div
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ type: "tween", duration: 0.3 }}
              className="fixed top-0 bottom-0 left-0 w-4/5 max-w-sm bg-white z-50 flex flex-col shadow-2xl lg:hidden"
            >
              {/* Header */}
              <div className="p-5 border-b border-[#E5E7EB] flex items-center justify-between bg-[#FBF9F6]">
                <div>
                  <span className="font-serif text-xl font-medium tracking-[0.25em] text-[#111827]">
                    RIWAYAH
                  </span>
                  <p className="text-[9px] text-[#6B7280] tracking-widest uppercase">Luxury Modest Wear</p>
                </div>
                <button
                  onClick={() => setIsMobileOpen(false)}
                  aria-label="Close menu"
                  className="p-1.5 text-[#111827] hover:text-[var(--color-gold)]"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Mobile user section */}
              {user ? (
                <div className="px-5 py-3 bg-[#FFFBF5] border-b border-[#F3F4F6] flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-full bg-gradient-to-br from-[var(--color-gold-light)] to-[var(--color-gold-dark)] flex items-center justify-center text-white text-xs font-bold">
                      {user.name
                        .split(" ")
                        .map((w) => w[0])
                        .join("")
                        .slice(0, 2)
                        .toUpperCase()}
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-[#111827]">{user.name}</p>
                      <p className="text-[10px] text-[#9CA3AF]">{user.email}</p>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="px-5 py-3 bg-[#FFFBF5] border-b border-[#F3F4F6]">
                  <Link
                    href="/auth/login"
                    className="flex items-center gap-2 text-sm font-medium text-[var(--color-gold)]"
                  >
                    <User className="w-4 h-4" /> Sign In / Create Account
                  </Link>
                </div>
              )}

              {/* Nav links */}
              <div className="flex-1 overflow-y-auto py-4 px-5 divide-y divide-[#F3F4F6]">
                <div className="pb-4 space-y-1">
                  {mainNavLinks.map((link) => (
                    <div key={link.label} className="py-2">
                      <Link
                        href={link.href}
                        className="flex items-center justify-between text-sm font-medium uppercase tracking-wider text-[#111827] hover:text-[var(--color-gold)]"
                      >
                        <span>{link.label}</span>
                        <ArrowRight className="w-3.5 h-3.5 opacity-40" />
                      </Link>
                    </div>
                  ))}
                </div>

                <div className="py-4 space-y-2 text-xs text-[#4B5563]">
                  {user && (
                    <Link href="/account" className="block py-1 hover:text-[#111827] font-medium">
                      My Account
                    </Link>
                  )}
                  <Link href="/order-tracking" className="block py-1 hover:text-[#111827]">
                    Track Your Order
                  </Link>
                  <Link href="/contact" className="block py-1 hover:text-[#111827]">
                    Customer Helpline
                  </Link>
                  <a
                    href={`https://wa.me/${siteConfig.whatsappNumber}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block py-1 text-emerald-700 font-medium"
                  >
                    WhatsApp Helpline (+92 300 1234567)
                  </a>
                  {user && (
                    <button
                      onClick={() => logout()}
                      className="block py-1 text-red-500 hover:text-red-700 font-medium text-left"
                    >
                      Sign Out
                    </button>
                  )}
                </div>
              </div>

              {/* Footer info */}
              <div className="p-4 bg-[#FBF9F6] border-t border-[#E5E7EB] text-center text-xs text-[#6B7280]">
                <p>Free Delivery over Rs. 5,000</p>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Global Search Drawer */}
      <SearchDrawer isOpen={isSearchOpen} onClose={() => setIsSearchOpen(false)} />
    </>
  );
}
