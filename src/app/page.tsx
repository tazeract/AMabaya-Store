import { HeroSection } from "@/components/home/HeroSection";
import { FeaturedCollection } from "@/components/home/FeaturedCollection";
import { TrustBadges } from "@/components/home/TrustBadges";
import { TestimonialsSlider } from "@/components/home/TestimonialsSlider";
import { AnimatedSection } from "@/components/ui/AnimatedSection";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import siteConfig from "@/lib/siteConfig";

export default function HomePage() {
  return (
    <>
      {/* Hero */}
      <HeroSection />

      {/* Featured Collection */}
      <FeaturedCollection />

      {/* Trust Badges */}
      <TrustBadges />

      {/* Testimonials */}
      <TestimonialsSlider />

      {/* CTA Band */}
      <section
        className="py-20 px-4 sm:px-6"
        style={{
          background:
            "linear-gradient(135deg in oklch, var(--color-gold-light) 0%, var(--color-gold) 50%, var(--color-gold-dark) 100%)",
        }}
      >
        <div className="max-w-4xl mx-auto text-center">
          <AnimatedSection>
            <h2 className="font-display text-4xl sm:text-5xl font-bold text-white mb-4">
              Your Perfect Abaya Awaits
            </h2>
            <p className="text-white/80 text-base mb-8 max-w-xl mx-auto">
              Shop our latest collection and enjoy free delivery, easy returns, and
              the finest Pakistani craftsmanship.
            </p>
            <div className="flex flex-wrap gap-4 justify-center">
              <Link
                href="/products"
                className="group flex items-center gap-2 px-8 py-4 bg-white text-[var(--color-gold-dark)] rounded-full font-semibold text-sm hover:bg-[var(--color-bg)] transition-all shadow-lg"
              >
                Shop Now
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </Link>
              <a
                href={`https://wa.me/${siteConfig.whatsappNumber}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 px-8 py-4 border-2 border-white text-white rounded-full font-semibold text-sm hover:bg-white/10 transition-all"
              >
                WhatsApp Us
              </a>
            </div>
          </AnimatedSection>
        </div>
      </section>
    </>
  );
}
