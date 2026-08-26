import { HeroSection } from "@/components/home/HeroSection";
import { TrendingAbayas } from "@/components/home/TrendingAbayas";
import { CategoryBannerGrid } from "@/components/home/CategoryBannerGrid";
import { HijabCollectionShowcase } from "@/components/home/HijabCollectionShowcase";
import { LookbookBanners } from "@/components/home/LookbookBanners";
import { DealsAndBundles } from "@/components/home/DealsAndBundles";
import { VideoReelsShowcase } from "@/components/home/VideoReelsShowcase";
import { FeaturedCollection } from "@/components/home/FeaturedCollection";
import { TestimonialsSlider } from "@/components/home/TestimonialsSlider";
import { TrustBadges } from "@/components/home/TrustBadges";
import { getAllProducts } from "@/lib/products";
import Link from "next/link";
import { ArrowRight, Sparkles } from "lucide-react";
import siteConfig from "@/lib/siteConfig";

export default async function HomePage() {
  const products = await getAllProducts();

  return (
    <>
      {/* 1. Hero Carousel Slider (Editorial Photography & Calligraphy Titles) */}
      <HeroSection />

      {/* 2. New In Abayas (2-Col Mobile / 4-Col Desktop Grid with SALE & NEW Badges) */}
      <TrendingAbayas products={products} />

      {/* 3. Category Spotlight Banner + 2x2 Sub-Grid (Everyday, Embroidered, Sets, Khimars) */}
      <CategoryBannerGrid />

      {/* 4. Hijabs Showcase Banner + 4-Card Fabric Grid (Laser Cut, Crinkle, Silk, Chiffon) */}
      <HijabCollectionShowcase />

      {/* 5. Stacked Lookbook Silhouette Banners (Skirt Sets, Long Dresses, Tops, Co-ords) */}
      <LookbookBanners />

      {/* 6. Deals & Bundles (Everything Under 1999, Value Bundles, Bottoms, Accessories, Guarantees) */}
      <DealsAndBundles />

      {/* 7. Watch & Shop Social Video Reels Showcase */}
      <VideoReelsShowcase />

      {/* 8. Featured Bestsellers Collection Grid */}
      <FeaturedCollection />

      {/* 9. Brand Story / Heritage Banner */}
      <section className="py-16 lg:py-24 px-4 sm:px-6 lg:px-8 bg-white border-b border-[#E5E7EB]" aria-label="Brand Story">
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-12 gap-10 lg:gap-16 items-center">
            
            {/* Imagery */}
            <div className="lg:col-span-6 grid grid-cols-2 gap-4 sm:gap-6">
              <div className="aspect-[3/4] bg-[#F3F4F6] rounded-xl overflow-hidden border border-[#E5E7EB]">
                <img
                  src="/products/classic-noir-abaya/image-1.jpg"
                  alt="AMabaya Craftsmanship"
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="aspect-[3/4] bg-[#F3F4F6] rounded-xl overflow-hidden border border-[#E5E7EB] mt-6 sm:mt-10">
                <img
                  src="/products/royal-zahra-kaftan/image-1.jpg"
                  alt="AMabaya Festive Drapes"
                  className="w-full h-full object-cover"
                />
              </div>
            </div>

            {/* Content */}
            <div className="lg:col-span-6 space-y-5">
              <div className="inline-flex items-center gap-2">
                <Sparkles className="w-3.5 h-3.5 text-[#9A84C8]" />
                <span className="text-[11px] font-sans font-semibold tracking-[0.22em] text-[#9A84C8] uppercase">
                  Artisanal Heritage · Made in Pakistan
                </span>
              </div>

              <h2 className="font-serif text-3xl sm:text-4xl lg:text-5xl text-[#111827] font-normal leading-tight tracking-tight">
                Where Modest Sophistication Meets Master Tailoring
              </h2>

              <p className="text-sm sm:text-base text-[#4B5563] font-sans leading-relaxed">
                Founded in Lahore, AMabaya bridges the gap between classic Islamic modesty and contemporary high fashion. Every garment is cut from breathable Korean Nida, pure raw silks, and lightweight crystalline organzas—finished with hand-embellished zardozi, gota, and pearls.
              </p>

              <div className="grid grid-cols-2 gap-6 pt-3 border-t border-[#E5E7EB]">
                <div>
                  <h4 className="font-serif text-lg font-medium text-[#111827]">Heirloom Quality</h4>
                  <p className="text-xs text-[#6B7280] font-sans mt-1">
                    Stitched to withstand seasons while retaining effortless fluid grace.
                  </p>
                </div>
                <div>
                  <h4 className="font-serif text-lg font-medium text-[#111827]">Flawless Cuts</h4>
                  <p className="text-xs text-[#6B7280] font-sans mt-1">
                    Tailored silhouettes specifically engineered for comfort across all body types.
                  </p>
                </div>
              </div>

              <div className="pt-2">
                <Link
                  href="/about"
                  className="luxury-btn-primary group inline-flex items-center gap-2"
                >
                  <span>Read The AMabaya Story</span>
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </Link>
              </div>

            </div>

          </div>
        </div>
      </section>

      {/* 10. Customer Testimonials & Reviews Slider */}
      <TestimonialsSlider />

      {/* 11. WhatsApp Styling Concierge CTA Banner */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-[#111827] text-white">
        <div className="max-w-4xl mx-auto text-center space-y-4">
          <p className="text-[11px] font-sans tracking-[0.25em] text-[#F3C5D0] uppercase font-semibold">
            Need Custom Sizing or Styling Advice?
          </p>
          <h2 className="font-serif text-3xl sm:text-4xl text-white font-normal">
            Connect With Our Lahore Styling Concierge
          </h2>
          <p className="text-sm text-white/70 font-sans max-w-xl mx-auto">
            Our fashion stylists are available via WhatsApp to help you choose the ideal silhouette, customize sleeve lengths, or curate your festive wardrobe.
          </p>
          <div className="pt-4">
            <a
              href={`https://wa.me/${siteConfig.whatsappNumber}?text=Hi%20AMabaya,%20I%20would%20like%20styling%20advice%20for%20an%20order.`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-8 py-3.5 bg-white text-[#111827] hover:bg-[#F3F4F6] text-xs font-semibold uppercase tracking-widest font-sans rounded-md transition-colors"
            >
              <span>Chat on WhatsApp (+92 300 1234567)</span>
              <ArrowRight className="w-4 h-4" />
            </a>
          </div>
        </div>
      </section>
    </>
  );
}
