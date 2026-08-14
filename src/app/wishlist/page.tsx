"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Heart, ShoppingBag, Trash2 } from "lucide-react";
import { useWishlist } from "@/context/WishlistContext";
import { useCart } from "@/context/CartContext";
import { getAllProducts, formatPrice } from "@/lib/products";
import { AnimatedSection, StaggeredContainer, staggerItemVariants } from "@/components/ui/AnimatedSection";
import { toast } from "@/components/ui/Toaster";
import { motion } from "framer-motion";
import type { Product } from "@/types";

export default function WishlistPage() {
  const { items: wishlistItems, removeItem } = useWishlist();
  const { addItem } = useCart();
  const [products, setProducts] = useState<Product[]>([]);

  useEffect(() => {
    getAllProducts().then((all) => {
      const slugs = wishlistItems.map((i) => i.productSlug);
      setProducts(all.filter((p) => slugs.includes(p.slug)));
    });
  }, [wishlistItems]);

  if (wishlistItems.length === 0) {
    return (
      <div className="min-h-screen pt-32 flex flex-col items-center justify-center text-center px-4">
        <div className="w-24 h-24 rounded-full bg-[var(--color-border)] flex items-center justify-center mb-6">
          <Heart className="w-10 h-10 text-[var(--color-text-muted)]" />
        </div>
        <h1 className="font-display text-3xl font-semibold text-[var(--color-text-primary)] mb-3">
          Your Wishlist is Empty
        </h1>
        <p className="text-[var(--color-text-muted)] mb-8 max-w-sm text-sm">
          Save pieces you love by tapping the heart icon on any product.
        </p>
        <Link
          href="/products"
          className="px-8 py-4 bg-gradient-to-r from-[var(--color-gold)] to-[var(--color-gold-dark)] text-white rounded-full font-medium"
        >
          Explore Collection
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12">
        <AnimatedSection>
          <h1 className="font-display text-4xl font-semibold text-[var(--color-text-primary)] mb-2">
            My Wishlist
          </h1>
          <p className="text-[var(--color-text-muted)] text-sm mb-8">
            {products.length} saved piece{products.length !== 1 ? "s" : ""}
          </p>
        </AnimatedSection>

        <StaggeredContainer className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {products.map((product) => (
            <motion.div key={product.slug} variants={staggerItemVariants} className="luxury-card overflow-hidden">
              <div className="relative h-64">
                <Link href={`/products/${product.slug}`}>
                  {product.images[0] ? (
                    <img src={product.images[0]} alt={product.title} className="w-full h-full object-cover product-card-img" />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-[var(--color-gold-light)]/20 to-[var(--color-gold)]/10 flex items-center justify-center">
                      <span className="font-display text-xl text-[var(--color-gold)]/40 italic">{product.title}</span>
                    </div>
                  )}
                </Link>
                <button
                  onClick={() => {
                    removeItem(product.slug);
                    toast.info("Removed from wishlist", product.title);
                  }}
                  aria-label="Remove from wishlist"
                  className="absolute top-3 right-3 w-8 h-8 rounded-full bg-white/90 flex items-center justify-center text-red-400 hover:text-red-600 transition-colors shadow-sm"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
              <div className="p-4">
                <Link href={`/products/${product.slug}`}>
                  <h3 className="font-display font-medium text-[var(--color-text-primary)] hover:text-[var(--color-gold)] transition-colors">
                    {product.title}
                  </h3>
                </Link>
                <p className="text-xs text-[var(--color-text-muted)] mt-0.5">{product.category}</p>
                <div className="flex items-center justify-between mt-3">
                  <span className="font-sans font-semibold text-[var(--color-gold)]">
                    {formatPrice(product.price)}
                  </span>
                  <button
                    onClick={() => {
                      addItem(product, product.sizes[0]?.label ?? "Free Size", product.colors[0]?.name ?? "Default");
                      toast.success("Added to cart!", product.title);
                    }}
                    className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium bg-gradient-to-r from-[var(--color-gold)] to-[var(--color-gold-dark)] text-white rounded-full"
                  >
                    <ShoppingBag className="w-3 h-3" />
                    Add to Cart
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
        </StaggeredContainer>
      </div>
    </div>
  );
}
