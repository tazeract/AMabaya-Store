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
} from "lucide-react";
import { useCart } from "@/context/CartContext";
import { useWishlist } from "@/context/WishlistContext";
import { useAuth } from "@/context/AuthContext";
import { SearchDrawer } from "@/components/products/SearchDrawer";
import siteConfig from "@/lib/siteConfig";

const navLinks = [
  { href: "/", label: "Home" },
  {
    href: "/products",
    label: "Collections",
    sub: [
      { href: "/products?category=Abaya", label: "Abayas" },
      { href: "/products?category=Kaftan", label: "Kaftans" },
      { href: "/products?category=Dupatta", label: "Dupattas" },
      { href: "/products?category=Set", label: "Sets" },
    ],
  },
  { href: "/about", label: "About" },
  { href: "/contact", label: "Contact" },
];

export function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
  const pathname = usePathname();
  const { itemCount, items: cartItems } = useCart();
  const { count: wishlistCount } = useWishlist();
  const { user, logout } = useAuth();
  const dropdownRef = useRef<HTMLDivElement>(null);
  const [cartBump, setCartBump] = useState(false);

  // Scroll detection
  useEffect(() => {
    const onScroll = () => setIsScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Cart bump animation on item add
  useEffect(() => {
    if (itemCount > 0) {
      setCartBump(true);
      const t = setTimeout(() => setCartBump(false), 400);
      return () => clearTimeout(t);
    }
  }, [itemCount]);

  // Close mobile menu on route change
  useEffect(() => {
    setIsMobileOpen(false);
    setActiveDropdown(null);
  }, [pathname]);

  const isHome = pathname === "/";
  const isTransparent = isHome && !isScrolled && !isMobileOpen;

  return (
    <>
      <motion.header
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
          isTransparent
            ? "bg-transparent"
            : "glass border-b border-[var(--color-border)]"
        }`}
        style={{ height: "var(--nav-height)" }}
      >
        {/* Top announcement bar */}
        <div
          className={`text-center py-1 text-xs font-sans font-medium tracking-widest uppercase transition-all duration-500 ${
            isTransparent
              ? "text-white/70"
              : "text-[var(--color-gold)] bg-[var(--color-bg)]"
          }`}
          style={{ fontSize: "10px" }}
        >
          ✦ Free Shipping on Orders Above ₨5,000 · Cash on Delivery Available ✦
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 flex items-center justify-between h-full">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-3 group" aria-label={siteConfig.storeName}>
            <div className="w-9 h-9 rounded-full bg-gradient-to-br from-[var(--color-gold-light)] to-[var(--color-gold-dark)] flex items-center justify-center shadow-md group-hover:shadow-[var(--shadow-gold)] transition-shadow duration-300">
              <span className="font-display font-bold text-white text-sm">
                {siteConfig.logoText}
              </span>
            </div>
            <div>
              <span
                className={`font-display font-semibold text-xl leading-none tracking-tight transition-colors duration-300 ${
                  isTransparent ? "text-white" : "text-[var(--color-text-primary)]"
                }`}
              >
                {siteConfig.storeName}
              </span>
            </div>
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center gap-1" ref={dropdownRef}>
            {navLinks.map((link) => (
              <div
                key={link.href}
                className="relative"
                onMouseEnter={() => link.sub && setActiveDropdown(link.label)}
                onMouseLeave={() => setActiveDropdown(null)}
              >
                <Link
                  href={link.href}
                  className={`flex items-center gap-1 px-4 py-2 text-sm font-medium font-sans rounded-full transition-all duration-200 ${
                    pathname === link.href
                      ? "text-[var(--color-gold)]"
                      : isTransparent
                      ? "text-white/85 hover:text-white"
                      : "text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)]"
                  }`}
                >
                  {link.label}
                  {link.sub && (
                    <ChevronDown className="w-3 h-3 opacity-60" />
                  )}
                </Link>

                {/* Dropdown */}
                {link.sub && (
                  <AnimatePresence>
                    {activeDropdown === link.label && (
                      <motion.div
                        initial={{ opacity: 0, y: 8, scale: 0.96 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 8, scale: 0.96 }}
                        transition={{ duration: 0.18 }}
                        className="absolute top-full left-0 mt-2 py-2 min-w-[160px] glass rounded-xl shadow-lg border border-[var(--color-border)]"
                      >
                        {link.sub.map((sub) => (
                          <Link
                            key={sub.href}
                            href={sub.href}
                            className="block px-4 py-2 text-sm text-[var(--color-text-secondary)] hover:text-[var(--color-gold)] hover:bg-[var(--color-gold-light)]/10 transition-colors"
                          >
                            {sub.label}
                          </Link>
                        ))}
                      </motion.div>
                    )}
                  </AnimatePresence>
                )}
              </div>
            ))}
          </nav>

          {/* Actions */}
          <div className="flex items-center gap-1">
            {/* Search */}
            <button
              onClick={() => setIsSearchOpen(true)}
              aria-label="Search"
              className={`p-2.5 rounded-full transition-all duration-200 ${
                isTransparent
                  ? "text-white/85 hover:text-white hover:bg-white/10"
                  : "text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] hover:bg-[var(--color-border)]"
              }`}
            >
              <Search className="w-5 h-5" />
            </button>

            {/* Wishlist */}
            <Link
              href="/wishlist"
              aria-label={`Wishlist (${wishlistCount} items)`}
              className={`relative p-2.5 rounded-full transition-all duration-200 ${
                isTransparent
                  ? "text-white/85 hover:text-white hover:bg-white/10"
                  : "text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] hover:bg-[var(--color-border)]"
              }`}
            >
              <Heart className="w-5 h-5" />
              {wishlistCount > 0 && (
                <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-[var(--color-gold)] text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                  {wishlistCount}
                </span>
              )}
            </Link>

            {/* Cart */}
            <button
              id="cart-open-btn"
              aria-label={`Cart (${itemCount} items)`}
              onClick={() => {
                document.dispatchEvent(new CustomEvent("open-cart"));
              }}
              className={`relative p-2.5 rounded-full transition-all duration-200 ${
                isTransparent
                  ? "text-white/85 hover:text-white hover:bg-white/10"
                  : "text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] hover:bg-[var(--color-border)]"
              }`}
            >
              <motion.div
                animate={cartBump ? { scale: [1, 1.35, 1] } : {}}
                transition={{ duration: 0.35 }}
              >
                <ShoppingBag className="w-5 h-5" />
              </motion.div>
              {itemCount > 0 && (
                <motion.span
                  key={itemCount}
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-[var(--color-gold)] text-white text-[10px] font-bold rounded-full flex items-center justify-center"
                >
                  {itemCount > 9 ? "9+" : itemCount}
                </motion.span>
              )}
            </button>

            {/* Auth */}
            <div className="hidden sm:block">
              {user ? (
                <div className="relative group">
                  <button
                    className={`flex items-center gap-2 px-3 py-2 rounded-full text-sm font-medium transition-all ${
                      isTransparent
                        ? "text-white/85 hover:text-white hover:bg-white/10"
                        : "text-[var(--color-text-secondary)] hover:bg-[var(--color-border)]"
                    }`}
                  >
                    <User className="w-4 h-4" />
                    <span className="max-w-[80px] truncate">{user.name.split(" ")[0]}</span>
                  </button>
                  <div className="absolute right-0 top-full mt-2 py-2 min-w-[160px] glass rounded-xl shadow-lg border border-[var(--color-border)] opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200">
                    <Link href="/account" className="block px-4 py-2 text-sm text-[var(--color-text-secondary)] hover:text-[var(--color-gold)]">
                      My Account
                    </Link>
                    <Link href="/order-tracking" className="block px-4 py-2 text-sm text-[var(--color-text-secondary)] hover:text-[var(--color-gold)]">
                      Track Order
                    </Link>
                    <hr className="my-1 border-[var(--color-border)]" />
                    <button
                      onClick={logout}
                      className="w-full text-left px-4 py-2 text-sm text-red-500 hover:text-red-600"
                    >
                      Sign Out
                    </button>
                  </div>
                </div>
              ) : (
                <Link
                  href="/auth/login"
                  className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-all border ${
                    isTransparent
                      ? "border-white/30 text-white/85 hover:bg-white/10 hover:border-white/50"
                      : "border-[var(--color-border)] text-[var(--color-text-secondary)] hover:border-[var(--color-gold)] hover:text-[var(--color-gold)]"
                  }`}
                >
                  <User className="w-4 h-4" />
                  Sign In
                </Link>
              )}
            </div>

            {/* Mobile menu toggle */}
            <button
              onClick={() => setIsMobileOpen(!isMobileOpen)}
              aria-label="Toggle menu"
              className={`md:hidden p-2.5 rounded-full transition-all duration-200 ${
                isTransparent
                  ? "text-white/85 hover:text-white hover:bg-white/10"
                  : "text-[var(--color-text-secondary)] hover:bg-[var(--color-border)]"
              }`}
            >
              {isMobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </motion.header>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isMobileOpen && (
          <motion.div
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", damping: 28, stiffness: 250 }}
            className="fixed inset-0 z-40 glass pt-20"
          >
            <nav className="p-6 flex flex-col gap-2">
              {navLinks.map((link) => (
                <div key={link.href}>
                  <Link
                    href={link.href}
                    onClick={() => setIsMobileOpen(false)}
                    className={`block px-4 py-3 text-lg font-display font-medium rounded-xl transition-all ${
                      pathname === link.href
                        ? "text-[var(--color-gold)] bg-[var(--color-gold)]/10"
                        : "text-[var(--color-text-primary)] hover:bg-[var(--color-border)]"
                    }`}
                  >
                    {link.label}
                  </Link>
                  {link.sub && (
                    <div className="ml-4 mt-1 flex flex-col gap-1">
                      {link.sub.map((sub) => (
                        <Link
                          key={sub.href}
                          href={sub.href}
                          onClick={() => setIsMobileOpen(false)}
                          className="block px-4 py-2 text-sm text-[var(--color-text-secondary)] hover:text-[var(--color-gold)] rounded-lg transition-colors"
                        >
                          {sub.label}
                        </Link>
                      ))}
                    </div>
                  )}
                </div>
              ))}
              <div className="divider-gold my-4" />
              <a
                href={`tel:${siteConfig.contactPhone}`}
                className="flex items-center gap-3 px-4 py-3 text-[var(--color-text-secondary)]"
              >
                <Phone className="w-4 h-4 text-[var(--color-gold)]" />
                {siteConfig.contactPhone}
              </a>
              {!user && (
                <div className="flex gap-3 mt-2">
                  <Link
                    href="/auth/login"
                    onClick={() => setIsMobileOpen(false)}
                    className="flex-1 text-center py-3 rounded-xl border border-[var(--color-border)] text-sm font-medium text-[var(--color-text-secondary)]"
                  >
                    Sign In
                  </Link>
                  <Link
                    href="/auth/signup"
                    onClick={() => setIsMobileOpen(false)}
                    className="flex-1 text-center py-3 rounded-xl bg-gradient-to-r from-[var(--color-gold)] to-[var(--color-gold-dark)] text-white text-sm font-medium"
                  >
                    Join AMabaya
                  </Link>
                </div>
              )}
            </nav>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Search Drawer */}
      <SearchDrawer isOpen={isSearchOpen} onClose={() => setIsSearchOpen(false)} />
    </>
  );
}
