"use client";

import { Truck, ShieldCheck, RefreshCw, Headphones } from "lucide-react";

const pillars = [
  {
    icon: Truck,
    title: "Nationwide Express Delivery",
    subtitle: "Complimentary shipping on orders above Rs. 5,000 across Pakistan.",
  },
  {
    icon: ShieldCheck,
    title: "100% Authentic Fabrics",
    subtitle: "Imported Korean Nida, pure raw silk, and artisanal hand embroidery.",
  },
  {
    icon: RefreshCw,
    title: "7-Day Easy Exchange",
    subtitle: "Hassle-free size and product exchanges with door-to-door pickup.",
  },
  {
    icon: Headphones,
    title: "Styling & WhatsApp Helpline",
    subtitle: "Direct one-on-one styling guidance and instant order assistance.",
  },
];

export function TrustBadges() {
  return (
    <section
      className="py-16 lg:py-20 px-4 sm:px-6 lg:px-8 bg-white border-b border-[#E5E7EB]"
      aria-label="Why Choose AMabaya"
    >
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-10">
          {pillars.map((item) => {
            const Icon = item.icon;
            return (
              <div
                key={item.title}
                className="flex flex-col items-center lg:items-start text-center lg:text-left p-6 bg-[#FBF9F6] border border-[#E5E7EB] hover:border-[#D1D5DB] transition-colors group"
              >
                <div className="w-12 h-12 mb-4 flex items-center justify-center border border-[#111827] text-[#111827] bg-white group-hover:bg-[#111827] group-hover:text-white transition-colors duration-300">
                  <Icon className="w-5 h-5 stroke-[1.5]" />
                </div>
                <h3 className="font-serif text-lg text-[#111827] font-medium mb-1.5">
                  {item.title}
                </h3>
                <p className="text-xs text-[#6B7280] font-sans leading-relaxed">
                  {item.subtitle}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
