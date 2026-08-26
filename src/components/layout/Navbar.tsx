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
        aria-label="Sign In"
        className="p-2 text-[#374151] hover:text-[#111827] transition-colors"
        title="Sign In"
      >
        <User className="w-5 h-5 stroke-[1.5]" />
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
        aria-label="Account menu"
        aria-expanded={open}
        className="flex items-center gap-1.5 p-1 rounded-full hover:bg-[#F9FAFB] transition-colors"
        title={user.name}
      >
        <span className="w-8 h-8 rounded-full bg-gradient-to-br from-[var(--color-gold-light)] to-[var(--color-gold-dark)] flex items-center justify-center text-white text-[11px] font-bold tracking-wide shadow-sm">
          {initials}
        </span>
        <ChevronDown
          className={`w-3 h-3 text-[#6B7280] transition-transform duration-200 ${open ? "rotate-180" : ""}`}
        />
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 8, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 8, scale: 0.97 }}
            transition={{ duration: 0.15 }}
            className="absolute top-full right-0 mt-2 w-52 bg-white border border-[#E5E7EB] rounded-xl shadow-xl overflow-hidden z-50"
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
                My Account
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
              <Link href="/" className="group inline-flex flex-col items-center lg:items-start" aria-label="AMabaya Home">
                <span className="font-serif text-2xl sm:text-3xl font-medium tracking-[0.28em] text-[#111827] group-hover:text-[var(--color-gold)] transition-colors duration-300">
                  AMABAYA
                </span>
                <span className="text-[8px] font-sans tracking-[0.35em] text-[#6B7280] uppercase -mt-0.5">
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
                    className={`relative px-3 lg:px-3.5 xl:px-4 py-2 text-[12.5px] xl:text-[13px] font-medium tracking-[0.1em] uppercase transition-colors duration-200 inline-flex items-center gap-1.5 whitespace-nowrap ${
                      pathname === link.href
                        ? "text-[#111827] font-semibold"
                        : link.isHighlight
                        ? "text-[var(--color-gold-dark)] hover:text-[#111827]"
                        : "text-[#374151] hover:text-[#111827]"
                    }`}
                  >
                    <span>{link.label}</span>
                    {link.sub && <ChevronDown className="w-3.5 h-3.5 opacity-50 group-hover:rotate-180 transition-transform duration-200" />}

                    {/* Subtle underline indicator on hover */}
                    <span className="absolute bottom-0 left-3 lg:left-3.5 xl:left-4 right-3 lg:right-3.5 xl:right-4 h-[2px] bg-[#111827] scale-x-0 group-hover:scale-x-100 transition-transform duration-200 origin-left" />
                  </Link>

                  {/* Mega / Minimal Dropdown */}
                  {link.sub && (
                    <AnimatePresence>
                      {activeDropdown === link.label && (
                        <motion.div
                          initial={{ opacity: 0, y: 8 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: 8 }}
                          transition={{ duration: 0.18 }}
                          className="absolute top-full left-0 mt-1 min-w-[220px] bg-white border border-[#E5E7EB] shadow-xl rounded-none py-3 z-50"
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
                              className="block px-4 py-2 text-[13px] text-[#4B5563] hover:text-[#111827] hover:bg-[#F9FAFB] transition-colors"
                            >
                              {item.label}
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
            <div className="flex items-center space-x-1 sm:space-x-2">
              {/* Desktop Search Button */}
              <button
                onClick={() => setIsSearchOpen(true)}
                aria-label="Search"
                className="hidden lg:flex items-center gap-2 px-3 py-1.5 text-xs text-[#6B7280] hover:text-[#111827] rounded-full border border-[#E5E7EB] hover:border-[#9CA3AF] transition-all"
              >
                <Search className="w-3.5 h-3.5" />
                <span className="font-sans text-[11px] tracking-wider uppercase">Search...</span>
              </button>

              {/* Account */}
              <UserNav />

              {/* Wishlist Link */}
              <Link
                href="/wishlist"
                aria-label="Wishlist"
                className="p-2 text-[#374151] hover:text-[#111827] transition-colors relative"
              >
                <Heart className="w-5 h-5 stroke-[1.5]" />
                {wishlistCount > 0 && (
                  <span className="absolute top-1 right-1 w-4 h-4 bg-[var(--color-gold)] text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                    {wishlistCount}
                  </span>
                )}
              </Link>

              {/* Cart Drawer Trigger Button */}
              <button
                onClick={handleOpenCart}
                aria-label="Shopping Cart"
                className="p-2 text-[#374151] hover:text-[#111827] transition-colors relative flex items-center gap-1.5 group"
              >
                <ShoppingBag className="w-5 h-5 stroke-[1.5] group-hover:scale-105 transition-transform" />
                {itemCount > 0 && (
                  <span className="w-4 h-4 bg-[#111827] text-white text-[10px] font-bold rounded-full flex items-center justify-center">
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
                    AMABAYA
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
