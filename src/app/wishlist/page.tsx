"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Heart, ShoppingBag, Trash2 } from "lucide-react";
import { useWishlist } from "@/context/WishlistContext";
import { useCart } from "@/context/CartContext";
import { getAllProducts, formatPrice } from "@/lib/products";
import { toast } from "@/components/ui/Toaster";
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
      <div className="min-h-screen bg-white flex flex-col items-center justify-center text-center px-4 py-24">
        <div className="w-16 h-16 border border-[#D1D5DB] flex items-center justify-center mb-4">
          <Heart className="w-8 h-8 text-[#9CA3AF] stroke-[1.2]" />
        </div>
        <h1 className="font-serif text-3xl text-[#111827] font-normal mb-2">
          Your Wishlist Is Empty
        </h1>
        <p className="text-xs text-[#6B7280] font-sans mb-8 max-w-xs">
          Explore our collection and click the heart icon on any silhouette to save it.
        </p>
        <Link
          href="/products"
          className="luxury-btn-primary"
        >
          Explore Collections
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <div className="bg-[#FBF9F6] border-b border-[#E5E7EB] py-12 px-4 sm:px-6 lg:px-8 text-center">
        <h1 className="font-serif text-3xl sm:text-4xl text-[#111827] font-normal">
          My Saved Wishlist ({products.length} Piece{products.length !== 1 ? "s" : ""})
        </h1>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
          {products.map((product) => (
            <div key={product.slug} className="flex flex-col bg-white border border-[#E5E7EB]">
              <div className="relative aspect-[3/4] w-full bg-[#F3F4F6] overflow-hidden">
                <Link href={`/products/${product.slug}`}>
                  <img src={product.images[0]} alt={product.title} className="w-full h-full object-cover" />
                </Link>
                <button
                  onClick={() => {
                    removeItem(product.slug);
                    toast.info("Removed from Wishlist", product.title);
                  }}
                  aria-label="Remove from wishlist"
                  className="absolute top-2.5 right-2.5 w-8 h-8 rounded-full bg-white/90 flex items-center justify-center text-[#111827] hover:text-red-600 transition-colors shadow-sm"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>

              <div className="p-4 flex flex-col flex-1 justify-between">
                <div>
                  <span className="text-[10px] uppercase tracking-widest text-[#6B7280] font-sans">
                    {product.category}
                  </span>
                  <Link href={`/products/${product.slug}`}>
                    <h3 className="font-serif text-base text-[#111827] font-medium hover:text-[var(--color-gold-dark)] transition-colors mt-0.5 line-clamp-1">
                      {product.title}
                    </h3>
                  </Link>
                  <p className="font-sans font-semibold text-sm text-[#111827] mt-1.5">
                    {formatPrice(product.price)}
                  </p>
                </div>

                <button
                  onClick={() => {
                    addItem(product, product.sizes[0]?.label ?? "Free Size", product.colors[0]?.name ?? "Default");
                    toast.success("Added to Bag", product.title);
                    document.dispatchEvent(new CustomEvent("open-cart"));
                  }}
                  className="w-full mt-4 luxury-btn-outline py-2.5 text-xs flex items-center justify-center gap-1.5"
                >
                  <ShoppingBag className="w-3.5 h-3.5" />
                  <span>Move to Bag</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
