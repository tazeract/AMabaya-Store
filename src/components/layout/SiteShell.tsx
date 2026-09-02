"use client";

import { usePathname } from "next/navigation";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { CartDrawer } from "@/components/layout/CartDrawer";
import { ScrollRevealInit } from "@/components/ui/ScrollRevealInit";

const AUTH_ROUTES = ["/auth/login", "/auth/signup"];

export function SiteShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isAuthPage = AUTH_ROUTES.some((r) => pathname.startsWith(r));

  if (isAuthPage) {
    // Auth pages: full-screen, no navbar/footer chrome
    return (
      <>
        <ScrollRevealInit />
        <main className="min-h-screen">{children}</main>
      </>
    );
  }

  return (
    <>
      <Navbar />
      <CartDrawer />
      <ScrollRevealInit />
      <main className="flex-1">{children}</main>
      <Footer />
    </>
  );
}
