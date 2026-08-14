"use client";

import { AnimatedSection, StaggeredContainer, staggerItemVariants } from "@/components/ui/AnimatedSection";
import { motion } from "framer-motion";
import { Heart, Star, Users, Award } from "lucide-react";
import siteConfig from "@/lib/siteConfig";

const timeline = [
  { year: "2018", title: "The Beginning", desc: "AMabaya was founded in Lahore with a simple vision: to make luxury modest fashion accessible to every Pakistani woman." },
  { year: "2020", title: "Artisan Partnerships", desc: "We partnered with master craftswomen across Punjab and Sindh, bringing traditional hand-embroidery techniques to modern silhouettes." },
  { year: "2022", title: "Digital Expansion", desc: "Launched our online store, bringing AMabaya to customers across all 4 provinces and the diaspora worldwide." },
  { year: "2024", title: "3D Innovation", desc: "Became Pakistan's first abaya brand to offer interactive 3D product previews, revolutionizing how women shop modest fashion online." },
];

const team = [
  { name: "Amna Malik", role: "Founder & Creative Director", initials: "AM" },
  { name: "Saba Hussain", role: "Head of Design", initials: "SH" },
  { name: "Nadia Iqbal", role: "Master Embroiderer", initials: "NI" },
];

export function AboutPageContent() {
  return (
    <div className="min-h-screen pt-24">
      {/* Hero */}
      <section
        className="py-24 px-4 sm:px-6 text-center relative overflow-hidden"
        style={{ background: "linear-gradient(135deg in oklch, #0E0B09 0%, #2A1F17 100%)" }}
      >
        <div className="absolute inset-0 opacity-5" style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='%23C9956C' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/svg%3E")`,
        }} />
        <div className="relative z-10 max-w-3xl mx-auto">
          <AnimatedSection>
            <span className="text-[var(--color-gold)] text-xs uppercase tracking-widest font-medium block mb-4">✦ Our Story</span>
            <h1 className="font-display text-5xl sm:text-6xl font-bold text-white mb-6">
              Born in Culture,<br />Crafted with Love
            </h1>
            <p className="text-white/60 text-base leading-relaxed">
              {siteConfig.storeDescription}
            </p>
          </AnimatedSection>
        </div>
      </section>

      {/* Stats */}
      <section className="py-16 px-4 sm:px-6 bg-white border-b border-[var(--color-border)]">
        <StaggeredContainer className="max-w-4xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
          {[
            { icon: Users, num: "5,000+", label: "Happy Customers" },
            { icon: Heart, num: "50+", label: "Artisan Partners" },
            { icon: Star, num: "4.9★", label: "Average Rating" },
            { icon: Award, num: "6+", label: "Years of Excellence" },
          ].map((stat) => (
            <motion.div key={stat.label} variants={staggerItemVariants} className="flex flex-col items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[var(--color-gold-light)] to-[var(--color-gold-dark)] flex items-center justify-center">
                <stat.icon className="w-5 h-5 text-white" />
              </div>
              <p className="font-display text-3xl font-bold text-gradient">{stat.num}</p>
              <p className="text-xs text-[var(--color-text-muted)] uppercase tracking-wider">{stat.label}</p>
            </motion.div>
          ))}
        </StaggeredContainer>
      </section>

      {/* Timeline */}
      <section className="py-24 px-4 sm:px-6">
        <div className="max-w-4xl mx-auto">
          <AnimatedSection className="text-center mb-16">
            <h2 className="font-display text-4xl font-semibold text-[var(--color-text-primary)] mb-4">Our Journey</h2>
            <div className="divider-gold w-24 mx-auto" />
          </AnimatedSection>

          <div className="relative">
            <div className="absolute left-8 top-0 bottom-0 w-px bg-gradient-to-b from-[var(--color-gold)] to-transparent" />
            <div className="space-y-12">
              {timeline.map((item, i) => (
                <AnimatedSection key={item.year} delay={i * 0.1} direction="left" className="flex gap-8">
                  <div className="flex-shrink-0 w-16 h-16 rounded-full bg-gradient-to-br from-[var(--color-gold-light)] to-[var(--color-gold-dark)] flex items-center justify-center shadow-[var(--shadow-gold)]">
                    <span className="font-display font-bold text-white text-xs">{item.year}</span>
                  </div>
                  <div className="flex-1 pt-3">
                    <h3 className="font-display text-xl font-semibold text-[var(--color-text-primary)] mb-2">{item.title}</h3>
                    <p className="text-[var(--color-text-secondary)] text-sm leading-relaxed">{item.desc}</p>
                  </div>
                </AnimatedSection>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Team */}
      <section className="py-24 px-4 sm:px-6 bg-[var(--color-bg)]">
        <div className="max-w-4xl mx-auto">
          <AnimatedSection className="text-center mb-16">
            <h2 className="font-display text-4xl font-semibold text-[var(--color-text-primary)] mb-4">The People Behind AMabaya</h2>
            <p className="text-[var(--color-text-secondary)] text-sm">
              A passionate team of designers, artisans, and fashion lovers.
            </p>
          </AnimatedSection>

          <StaggeredContainer className="grid sm:grid-cols-3 gap-8">
            {team.map((member) => (
              <motion.div
                key={member.name}
                variants={staggerItemVariants}
                className="text-center luxury-card p-8"
              >
                <div className="w-20 h-20 rounded-full bg-gradient-to-br from-[var(--color-gold-light)] to-[var(--color-gold-dark)] flex items-center justify-center mx-auto mb-5 text-2xl font-display font-bold text-white shadow-[var(--shadow-gold)]">
                  {member.initials}
                </div>
                <h3 className="font-display font-semibold text-[var(--color-text-primary)] mb-1">{member.name}</h3>
                <p className="text-xs text-[var(--color-text-muted)]">{member.role}</p>
              </motion.div>
            ))}
          </StaggeredContainer>
        </div>
      </section>
    </div>
  );
}
