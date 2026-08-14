"use client";

import { motion } from "framer-motion";
import { Truck, CreditCard, Shield, RefreshCw, Star, Headphones } from "lucide-react";
import { AnimatedSection, StaggeredContainer, staggerItemVariants } from "@/components/ui/AnimatedSection";

const badges = [
  {
    icon: Truck,
    title: "Free Delivery",
    subtitle: "On orders above ₨ 5,000",
    color: "from-blue-500 to-blue-600",
  },
  {
    icon: CreditCard,
    title: "Cash on Delivery",
    subtitle: "Pay when you receive",
    color: "from-green-500 to-green-600",
  },
  {
    icon: Shield,
    title: "100% Authentic",
    subtitle: "Premium fabric guaranteed",
    color: "from-[var(--color-gold)] to-[var(--color-gold-dark)]",
  },
  {
    icon: RefreshCw,
    title: "7-Day Returns",
    subtitle: "Hassle-free exchange",
    color: "from-purple-500 to-purple-600",
  },
  {
    icon: Star,
    title: "5-Star Rated",
    subtitle: "By 1,000+ happy customers",
    color: "from-amber-500 to-amber-600",
  },
  {
    icon: Headphones,
    title: "WhatsApp Support",
    subtitle: "Always here to help",
    color: "from-emerald-500 to-emerald-600",
  },
];

export function TrustBadges() {
  return (
    <section
      className="py-20 px-4 sm:px-6 bg-white border-y border-[var(--color-border)]"
      aria-label="Trust badges"
    >
      <div className="max-w-7xl mx-auto">
        <AnimatedSection className="text-center mb-12">
          <h2 className="font-display text-3xl sm:text-4xl font-semibold text-[var(--color-text-primary)] mb-2">
            Why Choose AMabaya?
          </h2>
          <p className="text-[var(--color-text-secondary)] text-sm">
            A luxury experience from browse to doorstep
          </p>
        </AnimatedSection>

        <StaggeredContainer className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {badges.map((badge) => {
            const Icon = badge.icon;
            return (
              <motion.div
                key={badge.title}
                variants={staggerItemVariants}
                whileHover={{ y: -4, scale: 1.02 }}
                transition={{ duration: 0.25 }}
                className="flex flex-col items-center text-center p-5 rounded-2xl bg-[var(--color-bg)] border border-[var(--color-border)] hover:border-[var(--color-gold)] hover:shadow-md transition-all duration-300 group cursor-default"
              >
                <div
                  className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${badge.color} flex items-center justify-center mb-3 shadow-md group-hover:scale-110 transition-transform duration-300`}
                >
                  <Icon className="w-5 h-5 text-white" />
                </div>
                <h3 className="font-display font-semibold text-sm text-[var(--color-text-primary)] leading-tight mb-1">
                  {badge.title}
                </h3>
                <p className="text-[10px] text-[var(--color-text-muted)] leading-tight">
                  {badge.subtitle}
                </p>
              </motion.div>
            );
          })}
        </StaggeredContainer>
      </div>
    </section>
  );
}
