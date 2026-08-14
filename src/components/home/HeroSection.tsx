"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { motion, useScroll, useTransform, AnimatePresence } from "framer-motion";
import { ArrowRight, Play, ChevronDown } from "lucide-react";
import dynamic from "next/dynamic";
import siteConfig from "@/lib/siteConfig";

const ModelViewer = dynamic(
  () => import("@/components/products/ModelViewer").then((m) => m.ModelViewer),
  { ssr: false }
);

const words = ["Elegance", "Grace", "Heritage", "Luxury", "Culture"];

export function HeroSection() {
  const sectionRef = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start start", "end start"],
  });

  const y = useTransform(scrollYProgress, [0, 1], ["0%", "30%"]);
  const opacity = useTransform(scrollYProgress, [0, 0.7], [1, 0]);
  const scale = useTransform(scrollYProgress, [0, 1], [1, 1.08]);

  const [wordIndex, setWordIndex] = useState(0);
  const [show3D, setShow3D] = useState(false);

  // Cycle through words
  useEffect(() => {
    const interval = setInterval(() => {
      setWordIndex((i) => (i + 1) % words.length);
    }, 2500);
    return () => clearInterval(interval);
  }, []);

  // Show 3D after 1 second
  useEffect(() => {
    const t = setTimeout(() => setShow3D(true), 1000);
    return () => clearTimeout(t);
  }, []);

  return (
    <section
      ref={sectionRef}
      className="relative min-h-screen flex items-center overflow-hidden"
      aria-label="AMabaya Hero"
    >
      {/* Parallax background */}
      <motion.div
        style={{ scale, y }}
        className="absolute inset-0 z-0"
      >
        <div
          className="absolute inset-0"
          style={{
            background:
              "linear-gradient(135deg in oklch, #0E0B09 0%, #1A1410 40%, #2A1F17 70%, #0E0B09 100%)",
          }}
        />
        {/* Decorative circles */}
        <div className="absolute top-1/4 right-1/4 w-96 h-96 rounded-full opacity-10 blur-3xl bg-[var(--color-gold)]" />
        <div className="absolute bottom-1/4 left-1/4 w-80 h-80 rounded-full opacity-8 blur-3xl bg-[var(--color-champagne)]" />
        {/* Arabesque pattern overlay */}
        <div
          className="absolute inset-0 opacity-5"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23C9956C' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
          }}
        />
      </motion.div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 py-24 w-full">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-8 items-center">
          {/* Text Column */}
          <motion.div
            style={{ opacity }}
            className="text-center lg:text-left"
          >
            {/* Tag line */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.2 }}
              className="inline-flex items-center gap-2 mb-6"
            >
              <div className="h-px w-12 bg-[var(--color-gold)]" />
              <span className="text-[var(--color-gold)] text-xs font-sans uppercase tracking-[0.25em] font-medium">
                Pakistan&apos;s Finest Abaya Brand
              </span>
              <div className="h-px w-12 bg-[var(--color-gold)]" />
            </motion.div>

            {/* Brand name */}
            <motion.h1
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.35 }}
              className="font-display text-6xl sm:text-7xl lg:text-8xl font-bold text-white leading-[0.95] mb-4"
            >
              {siteConfig.storeName.slice(0, 2)}
              <span className="text-gradient">{siteConfig.storeName.slice(2)}</span>
            </motion.h1>

            {/* Animated word */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.5 }}
              className="flex items-center gap-3 justify-center lg:justify-start mb-6"
            >
              <span className="font-display text-xl sm:text-2xl text-white/60 italic">
                Draped in
              </span>
              <div className="h-9 overflow-hidden">
                <AnimatePresence mode="wait">
                  <motion.span
                    key={wordIndex}
                    initial={{ y: 40, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    exit={{ y: -40, opacity: 0 }}
                    transition={{ duration: 0.45, ease: "easeOut" }}
                    className="block font-display text-xl sm:text-2xl font-semibold text-gradient"
                  >
                    {words[wordIndex]}
                  </motion.span>
                </AnimatePresence>
              </div>
            </motion.div>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.65 }}
              className="text-white/55 text-sm sm:text-base leading-relaxed max-w-md mx-auto lg:mx-0 mb-10"
            >
              Discover timeless abayas, kaftans & dupattas crafted for the modern South Asian woman. Premium fabrics, exquisite embroidery, delivered to your door.
            </motion.p>

            {/* CTA Buttons */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.8 }}
              className="flex flex-wrap gap-4 justify-center lg:justify-start"
            >
              <Link
                href="/products"
                className="group flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-[var(--color-gold-light)] to-[var(--color-gold-dark)] text-white rounded-full font-medium text-sm shadow-[var(--shadow-gold)] hover:shadow-xl hover:-translate-y-0.5 transition-all duration-300"
              >
                Explore Collection
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </Link>
              <Link
                href="/about"
                className="flex items-center gap-2 px-8 py-4 border border-white/25 text-white/80 rounded-full font-medium text-sm hover:bg-white/10 hover:border-white/40 transition-all duration-300"
              >
                Our Story
              </Link>
            </motion.div>

            {/* Trust pills */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.7, delay: 1.0 }}
              className="flex flex-wrap gap-2 justify-center lg:justify-start mt-10"
            >
              {["Free Shipping", "Cash on Delivery", "7-Day Returns", "Premium Fabric"].map(
                (badge) => (
                  <span
                    key={badge}
                    className="px-3 py-1 text-[10px] font-medium text-white/50 border border-white/15 rounded-full uppercase tracking-wider"
                  >
                    {badge}
                  </span>
                )
              )}
            </motion.div>
          </motion.div>

          {/* 3D Model Column */}
          <motion.div
            initial={{ opacity: 0, scale: 0.85 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1.0, delay: 0.4, ease: "easeOut" }}
            className="relative flex items-center justify-center"
          >
            <div className="relative w-full max-w-md mx-auto">
              {/* Glow ring */}
              <div className="absolute inset-8 rounded-full bg-gradient-to-br from-[var(--color-gold)]/20 to-[var(--color-champagne)]/10 blur-2xl animate-float" />

              {/* 3D viewer / Placeholder card */}
              <div className="relative z-10 h-[500px] sm:h-[580px] rounded-3xl overflow-hidden border border-white/10 shadow-2xl bg-white/5 backdrop-blur-sm">
                {show3D ? (
                  <ModelViewer
                    src="/products/classic-noir-abaya/model.glb"
                    alt="Interactive 3D view of Classic Noir Abaya"
                    className="w-full h-full"
                    autoRotate
                    cameraControls
                    ar={false}
                    exposure={0.6}
                    shadowIntensity={0.8}
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <div className="animate-pulse-gold w-20 h-20 rounded-full bg-gradient-to-br from-[var(--color-gold-light)] to-[var(--color-gold-dark)]" />
                  </div>
                )}

                {/* Floating product badge */}
                <div className="absolute bottom-6 left-6 right-6">
                  <div className="glass-dark rounded-2xl p-4">
                    <p className="text-white/50 text-[10px] uppercase tracking-widest mb-1">
                      Featured
                    </p>
                    <p className="font-display text-white font-semibold">
                      Classic Noir Abaya
                    </p>
                    <div className="flex items-center justify-between mt-2">
                      <span className="text-[var(--color-gold)] font-semibold text-sm">
                        ₨ 4,500
                      </span>
                      <Link
                        href="/products/classic-noir-abaya"
                        className="flex items-center gap-1 text-xs text-white/60 hover:text-[var(--color-gold)] transition-colors"
                      >
                        View Details
                        <ArrowRight className="w-3 h-3" />
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Scroll indicator */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.5 }}
        style={{ opacity }}
        className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 text-white/40"
      >
        <span className="text-[10px] uppercase tracking-widest">Scroll</span>
        <motion.div
          animate={{ y: [0, 8, 0] }}
          transition={{ duration: 1.5, repeat: Infinity }}
        >
          <ChevronDown className="w-5 h-5" />
        </motion.div>
      </motion.div>
    </section>
  );
}
