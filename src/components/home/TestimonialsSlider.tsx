"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, ChevronRight, Star, CheckCircle2 } from "lucide-react";
import { testimonials } from "@/lib/testimonials";

export function TestimonialsSlider() {
  const [current, setCurrent] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const total = testimonials.length;

  const prev = () => setCurrent((c) => (c - 1 + total) % total);
  const next = () => setCurrent((c) => (c + 1) % total);

  // Auto-advance
  useEffect(() => {
    if (isPaused) return;
    const t = setInterval(next, 6000);
    return () => clearInterval(t);
  }, [isPaused, current]);

  const item = testimonials[current];

  return (
    <section
      className="py-20 lg:py-28 px-4 sm:px-6 lg:px-8 bg-[#FBF9F6] border-b border-[#E5E7EB]"
      aria-label="Customer Reviews and Testimonials"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      <div className="max-w-4xl mx-auto text-center">
        {/* Section Header */}
        <p className="text-[11px] font-sans font-semibold tracking-[0.25em] text-[#A3845A] uppercase mb-2">
          Customer Stories
        </p>
        <h2 className="font-serif text-3xl sm:text-4xl text-[#111827] font-normal tracking-tight mb-4">
          Loved by Over 5,000+ Women
        </h2>
        <div className="w-12 h-[1px] bg-[#111827] mx-auto mb-12" />

        {/* Testimonial Card */}
        <div className="relative bg-white border border-[#E5E7EB] p-8 sm:p-14 shadow-sm min-h-[300px] flex flex-col justify-center">
          <AnimatePresence mode="wait">
            <motion.div
              key={current}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.4 }}
              className="space-y-6"
            >
              {/* Gold 5 Stars */}
              <div className="flex justify-center gap-1 text-[var(--color-gold)]">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-4 h-4 fill-current" />
                ))}
              </div>

              {/* Quote */}
              <blockquote className="font-serif text-lg sm:text-2xl text-[#111827] italic leading-relaxed max-w-2xl mx-auto font-light">
                &ldquo;{item.text}&rdquo;
              </blockquote>

              {/* Author & Verification */}
              <div className="pt-2">
                <div className="flex items-center justify-center gap-1.5 font-sans font-medium text-sm text-[#111827]">
                  <span>{item.name}</span>
                  {item.verified && (
                    <span className="inline-flex items-center gap-1 text-[11px] text-[#A3845A] font-normal">
                      <CheckCircle2 className="w-3.5 h-3.5 fill-[var(--color-gold-light)] text-[#A3845A]" />
                      Verified Buyer
                    </span>
                  )}
                </div>
                <p className="text-xs text-[#6B7280] font-sans mt-0.5">
                  {item.city}, Pakistan · Purchased: <span className="font-medium text-[#374151]">{item.productBought}</span>
                </p>
              </div>
            </motion.div>
          </AnimatePresence>

          {/* Navigation Controls */}
          <div className="flex items-center justify-between absolute inset-x-4 top-1/2 -translate-y-1/2 pointer-events-none">
            <button
              onClick={prev}
              aria-label="Previous testimonial"
              className="pointer-events-auto w-10 h-10 rounded-full border border-[#E5E7EB] bg-white text-[#111827] flex items-center justify-center hover:bg-[#111827] hover:text-white transition-colors shadow-sm"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={next}
              aria-label="Next testimonial"
              className="pointer-events-auto w-10 h-10 rounded-full border border-[#E5E7EB] bg-white text-[#111827] flex items-center justify-center hover:bg-[#111827] hover:text-white transition-colors shadow-sm"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Indicators */}
        <div className="flex justify-center gap-1.5 mt-6">
          {testimonials.map((_, idx) => (
            <button
              key={idx}
              onClick={() => setCurrent(idx)}
              aria-label={`Go to review ${idx + 1}`}
              className={`h-1 transition-all duration-300 ${
                idx === current ? "w-6 bg-[#111827]" : "w-2 bg-[#D1D5DB]"
              }`}
            />
          ))}
        </div>

        {/* Trust Stats Bar */}
        <div className="grid grid-cols-3 gap-4 sm:gap-8 mt-16 pt-12 border-t border-[#E5E7EB] max-w-xl mx-auto">
          <div>
            <p className="font-serif text-2xl sm:text-3xl text-[#111827] font-medium">4.9 / 5.0</p>
            <p className="text-[11px] font-sans text-[#6B7280] tracking-wider uppercase mt-1">Average Rating</p>
          </div>
          <div>
            <p className="font-serif text-2xl sm:text-3xl text-[#111827] font-medium">5,000+</p>
            <p className="text-[11px] font-sans text-[#6B7280] tracking-wider uppercase mt-1">Abayas Delivered</p>
          </div>
          <div>
            <p className="font-serif text-2xl sm:text-3xl text-[#111827] font-medium">98%</p>
            <p className="text-[11px] font-sans text-[#6B7280] tracking-wider uppercase mt-1">Repeat Clients</p>
          </div>
        </div>

      </div>
    </section>
  );
}
