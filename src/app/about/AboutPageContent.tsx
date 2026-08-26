"use client";

import { motion } from "framer-motion";
import { Heart, Star, Users, Award, Sparkles } from "lucide-react";
import siteConfig from "@/lib/siteConfig";

const timeline = [
  {
    year: "2018",
    title: "The Vision Born in Lahore",
    desc: "RIWAYAH was founded with an ambition: to create bespoke luxury modest wear tailored from premier fabrics for Pakistani women.",
  },
  {
    year: "2020",
    title: "Master Artisan Collaborations",
    desc: "Partnered with master zardozi, tilla, and dabka artisans in Punjab and Sindh to elevate abaya embellishments.",
  },
  {
    year: "2022",
    title: "Nationwide Express Shipping",
    desc: "Expanded seamless Cash On Delivery fulfillment to all major cities and remote towns across Pakistan.",
  },
  {
    year: "2024",
    title: "Interactive 3D & Virtual Modesty",
    desc: "Introduced interactive 3D silhouette views and personalized WhatsApp concierge styling.",
  },
];

const team = [
  { name: "Amna Malik", role: "Founder & Creative Director", initials: "AM" },
  { name: "Saba Hussain", role: "Head of Modest Design", initials: "SH" },
  { name: "Nadia Iqbal", role: "Master Artisan & Zari Head", initials: "NI" },
];

export function AboutPageContent() {
  return (
    <div className="min-h-screen bg-white">
      {/* Hero Header */}
      <section className="py-16 lg:py-24 px-4 sm:px-6 lg:px-8 text-center bg-[#FBF9F6] border-b border-[#E5E7EB]">
        <div className="max-w-3xl mx-auto space-y-4">
          <div className="inline-flex items-center gap-2">
            <Sparkles className="w-3.5 h-3.5 text-[#A3845A]" />
            <span className="text-[11px] font-sans font-semibold tracking-[0.25em] text-[#A3845A] uppercase">
              Our Heritage & Philosophy
            </span>
          </div>
          <h1 className="font-serif text-4xl sm:text-5xl lg:text-6xl text-[#111827] font-normal leading-tight">
            Born in Culture, Crafted for Elegance
          </h1>
          <p className="text-sm sm:text-base text-[#4B5563] font-sans leading-relaxed max-w-2xl mx-auto">
            {siteConfig.storeDescription}
          </p>
        </div>
      </section>

      {/* Stats Counter */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-white border-b border-[#E5E7EB]">
        <div className="max-w-6xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
          {[
            { icon: Users, num: "5,000+", label: "Happy Customers" },
            { icon: Heart, num: "50+", label: "Master Artisans" },
            { icon: Star, num: "4.9★", label: "Average Rating" },
            { icon: Award, num: "6+ Years", label: "Of Craftsmanship" },
          ].map((stat) => (
            <div key={stat.label} className="p-6 bg-[#FBF9F6] border border-[#E5E7EB]">
              <div className="w-10 h-10 mx-auto mb-3 border border-[#111827] flex items-center justify-center text-[#111827] bg-white">
                <stat.icon className="w-4 h-4" />
              </div>
              <p className="font-serif text-3xl font-medium text-[#111827]">{stat.num}</p>
              <p className="text-[11px] text-[#6B7280] font-sans uppercase tracking-wider mt-1">{stat.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Timeline */}
      <section className="py-20 lg:py-24 px-4 sm:px-6 lg:px-8 bg-white">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-16">
            <p className="text-[11px] font-sans font-semibold tracking-[0.25em] text-[#A3845A] uppercase mb-2">
              The Journey
            </p>
            <h2 className="font-serif text-3xl sm:text-4xl text-[#111827] font-normal">
              Milestones in Modesty
            </h2>
            <div className="w-12 h-[1px] bg-[#111827] mx-auto mt-4" />
          </div>

          <div className="space-y-8">
            {timeline.map((item) => (
              <div key={item.year} className="flex gap-6 sm:gap-8 items-start p-6 bg-[#FBF9F6] border border-[#E5E7EB]">
                <div className="w-14 h-14 bg-[#111827] text-white flex items-center justify-center shrink-0 font-serif text-base font-semibold">
                  {item.year}
                </div>
                <div className="flex-1">
                  <h3 className="font-serif text-xl text-[#111827] font-medium mb-1.5">{item.title}</h3>
                  <p className="text-xs sm:text-sm text-[#4B5563] font-sans leading-relaxed">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Team */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-[#FBF9F6] border-t border-[#E5E7EB]">
        <div className="max-w-4xl mx-auto text-center">
          <p className="text-[11px] font-sans font-semibold tracking-[0.25em] text-[#A3845A] uppercase mb-2">
            Leadership
          </p>
          <h2 className="font-serif text-3xl sm:text-4xl text-[#111827] font-normal mb-12">
            The Artisans Behind AMabaya
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            {team.map((member) => (
              <div key={member.name} className="p-8 bg-white border border-[#E5E7EB] text-center">
                <div className="w-16 h-16 rounded-full border border-[#D1D5DB] flex items-center justify-center mx-auto mb-4 bg-[#FBF9F6]">
                  <span className="font-serif text-xl font-medium text-[#111827]">{member.initials}</span>
                </div>
                <h4 className="font-serif text-lg text-[#111827] font-medium">{member.name}</h4>
                <p className="text-xs text-[#6B7280] font-sans mt-1">{member.role}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
