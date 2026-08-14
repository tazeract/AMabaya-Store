"use client";

import { useRef, useState, useEffect } from "react";
import { motion, useAnimationControls } from "framer-motion";
import { ChevronLeft, ChevronRight, Quote, BadgeCheck } from "lucide-react";
import { testimonials } from "@/lib/testimonials";
import { StarRating } from "@/components/ui/StarRating";
import { AnimatedSection } from "@/components/ui/AnimatedSection";

export function TestimonialsSlider() {
  const [current, setCurrent] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const controls = useAnimationControls();
  const total = testimonials.length;

  const prev = () => setCurrent((c) => (c - 1 + total) % total);
  const next = () => setCurrent((c) => (c + 1) % total);

  // Auto-advance
  useEffect(() => {
    if (isPaused) return;
    const t = setInterval(next, 5000);
    return () => clearInterval(t);
  }, [isPaused, current]);

  return (
    <section
      className="py-24 px-4 sm:px-6 relative overflow-hidden"
      style={{
        background: "linear-gradient(135deg in oklch, #0E0B09 0%, #1A1410 50%, #0E0B09 100%)",
      }}
      aria-label="Customer testimonials"
    >
      {/* Decorative */}
      <div className="absolute top-0 left-1/4 w-64 h-64 rounded-full bg-[var(--color-gold)]/5 blur-3xl" />
      <div className="absolute bottom-0 right-1/4 w-80 h-80 rounded-full bg-[var(--color-champagne)]/5 blur-3xl" />

      <div className="max-w-7xl mx-auto relative z-10">
        {/* Header */}
        <AnimatedSection className="text-center mb-16">
          <span className="text-[var(--color-gold)] text-xs font-sans uppercase tracking-[0.3em] font-medium mb-4 block">
            ✦ Real Stories
          </span>
          <h2 className="font-display text-4xl sm:text-5xl font-semibold text-white mb-4">
            What Our Customers Say
          </h2>
          <div className="divider-gold w-24 mx-auto" />
        </AnimatedSection>

        {/* Slider */}
        <div
          className="relative"
          onMouseEnter={() => setIsPaused(true)}
          onMouseLeave={() => setIsPaused(false)}
        >
          {/* Main card */}
          <div className="max-w-3xl mx-auto">
            <motion.div
              key={current}
              initial={{ opacity: 0, y: 24, scale: 0.96 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, x: -32 }}
              transition={{ duration: 0.5, ease: "easeOut" }}
              className="glass-dark rounded-3xl p-8 sm:p-12 relative"
            >
              {/* Quote icon */}
              <div className="absolute -top-4 left-10">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[var(--color-gold-light)] to-[var(--color-gold-dark)] flex items-center justify-center shadow-lg">
                  <Quote className="w-4 h-4 text-white" />
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-6 items-start">
                {/* Avatar */}
                <div className="flex-shrink-0">
                  <div className="w-16 h-16 rounded-full overflow-hidden border-2 border-[var(--color-gold)]/40 bg-gradient-to-br from-[var(--color-gold-light)]/20 to-[var(--color-gold)]/20 flex items-center justify-center">
                    <span className="font-display text-2xl font-bold text-[var(--color-gold)]">
                      {testimonials[current].name[0]}
                    </span>
                  </div>
                </div>

                {/* Content */}
                <div className="flex-1">
                  <StarRating
                    rating={testimonials[current].rating}
                    size="md"
                    showCount={false}
                  />
                  <blockquote className="mt-3 font-display text-lg sm:text-xl text-white/80 leading-relaxed italic">
                    &ldquo;{testimonials[current].text}&rdquo;
                  </blockquote>
                  <div className="mt-5 flex items-center gap-3">
                    <div>
                      <div className="flex items-center gap-1.5">
                        <p className="font-sans font-semibold text-white text-sm">
                          {testimonials[current].name}
                        </p>
                        {testimonials[current].verified && (
                          <BadgeCheck className="w-4 h-4 text-[var(--color-gold)]" />
                        )}
                      </div>
                      <p className="text-xs text-white/40">
                        {testimonials[current].city} · Bought: {testimonials[current].productBought}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>

          {/* Navigation */}
          <div className="flex items-center justify-center gap-4 mt-8">
            <button
              onClick={prev}
              aria-label="Previous testimonial"
              className="w-10 h-10 rounded-full border border-white/20 flex items-center justify-center text-white/60 hover:border-[var(--color-gold)] hover:text-[var(--color-gold)] transition-all"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>

            {/* Dots */}
            <div className="flex gap-2">
              {testimonials.map((_, i) => (
                <button
                  key={i}
                  onClick={() => setCurrent(i)}
                  aria-label={`Go to testimonial ${i + 1}`}
                  className="relative transition-all"
                >
                  <div
                    className={`h-1.5 rounded-full transition-all duration-300 ${
                      i === current
                        ? "w-8 bg-[var(--color-gold)]"
                        : "w-1.5 bg-white/20 hover:bg-white/40"
                    }`}
                  />
                  {i === current && (
                    <motion.div
                      layoutId="testimonial-dot"
                      className="absolute inset-0 h-1.5 bg-[var(--color-gold)] rounded-full"
                    />
                  )}
                </button>
              ))}
            </div>

            <button
              onClick={next}
              aria-label="Next testimonial"
              className="w-10 h-10 rounded-full border border-white/20 flex items-center justify-center text-white/60 hover:border-[var(--color-gold)] hover:text-[var(--color-gold)] transition-all"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-6 mt-16 max-w-2xl mx-auto">
          {[
            { num: "5,000+", label: "Happy Customers" },
            { num: "4.9★", label: "Average Rating" },
            { num: "98%", label: "Repeat Buyers" },
          ].map((stat) => (
            <AnimatedSection key={stat.num} delay={0.1} className="text-center">
              <p className="font-display text-3xl sm:text-4xl font-bold text-gradient mb-1">
                {stat.num}
              </p>
              <p className="text-xs text-white/40 uppercase tracking-wider">
                {stat.label}
              </p>
            </AnimatedSection>
          ))}
        </div>
      </div>
    </section>
  );
}
