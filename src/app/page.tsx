import { HeroSection } from "@/components/home/HeroSection";
import { CategoryGrid } from "@/components/home/CategoryGrid";
import { FeaturedCollection } from "@/components/home/FeaturedCollection";
import { TrustBadges } from "@/components/home/TrustBadges";
import { TestimonialsSlider } from "@/components/home/TestimonialsSlider";
import Link from "next/link";
import { ArrowRight, Sparkles } from "lucide-react";
import siteConfig from "@/lib/siteConfig";

export default function HomePage() {
  return (
    <>
      {/* 1. Editorial Hero Banner Slider */}
      <HeroSection />

      {/* 2. Curated Categories / Silhouettes */}
      <CategoryGrid />

      {/* 3. Featured Products 4-Column Grid */}
      <FeaturedCollection />

      {/* 4. Luxury Brand Story / Editorial Spotlight Banner */}
      <section className="py-20 lg:py-28 px-4 sm:px-6 lg:px-8 bg-white border-b border-[#E5E7EB]" aria-label="Brand Story">
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-12 gap-10 lg:gap-16 items-center">
            
            {/* Left Imagery Grid */}
            <div className="lg:col-span-6 grid grid-cols-2 gap-4 sm:gap-6">
              <div className="aspect-[3/4] bg-[#F3F4F6] border border-[#E5E7EB] overflow-hidden">
                <img
                  src="/products/classic-noir-abaya/image-1.jpg"
                  alt="AMabaya Craftsmanship"
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="aspect-[3/4] bg-[#F3F4F6] border border-[#E5E7EB] overflow-hidden mt-6 sm:mt-10">
                <img
                  src="/products/royal-zahra-kaftan/image-1.jpg"
                  alt="AMabaya Festive Drapes"
                  className="w-full h-full object-cover"
                />
              </div>
            </div>

            {/* Right Editorial Story */}
            <div className="lg:col-span-6 space-y-6">
              <div className="inline-flex items-center gap-2">
                <Sparkles className="w-3.5 h-3.5 text-[#A3845A]" />
                <span className="text-[11px] font-sans font-semibold tracking-[0.22em] text-[#A3845A] uppercase">
                  Artisanal Heritage · Made in Pakistan
                </span>
              </div>

              <h2 className="font-serif text-3xl sm:text-4xl lg:text-5xl text-[#111827] font-normal leading-tight tracking-tight">
                Where Modest Sophistication Meets Master Tailoring
              </h2>

              <p className="text-sm sm:text-base text-[#4B5563] font-sans leading-relaxed">
                Founded in Lahore, AMabaya bridges the gap between classic Islamic modesty and contemporary high fashion. Every garment is cut from breathable Korean Nida, pure raw silks, and lightweight crystalline organzas—finished with hand-embellished zardozi, gota, and pearls.
              </p>

              <div className="grid grid-cols-2 gap-6 pt-4 border-t border-[#E5E7EB] text-left">
                <div>
                  <h4 className="font-serif text-xl text-[#111827]">Heirloom Quality</h4>
                  <p className="text-xs text-[#6B7280] font-sans mt-1">
                    Stitched to withstand seasons while retaining effortless fluid grace.
                  </p>
                </div>
                <div>
                  <h4 className="font-serif text-xl text-[#111827]">Flawless Cuts</h4>
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

      {/* 5. Value Proposition & Trust Badges */}
      <TrustBadges />

      {/* 6. Customer Testimonials & Reviews */}
      <TestimonialsSlider />

      {/* 7. WhatsApp Styling Concierge Banner */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-[#111827] text-white">
        <div className="max-w-4xl mx-auto text-center space-y-4">
          <p className="text-[11px] font-sans tracking-[0.25em] text-[var(--color-gold)] uppercase font-semibold">
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
              className="inline-flex items-center gap-2 px-8 py-3.5 bg-white text-[#111827] hover:bg-[#F3F4F6] text-xs font-semibold uppercase tracking-widest font-sans transition-colors"
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
