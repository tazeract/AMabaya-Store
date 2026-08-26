import type { Metadata } from "next";
import "./globals.css";
import { CartProvider } from "@/context/CartContext";
import { WishlistProvider } from "@/context/WishlistContext";
import { AuthProvider } from "@/context/AuthContext";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { CartDrawer } from "@/components/layout/CartDrawer";
import { Toaster } from "@/components/ui/Toaster";
import siteConfig from "@/lib/siteConfig";

export const metadata: Metadata = {
  metadataBase: new URL(siteConfig.siteUrl),
  title: {
    default: `${siteConfig.storeName} — Luxury Modest Fashion & Designer Abayas`,
    template: `%s | ${siteConfig.storeName}`,
  },
  description: siteConfig.storeDescription,
  keywords: [
    "abaya",
    "kaftan",
    "dupatta",
    "Pakistani fashion",
    "luxury abaya",
    "designer abaya",
    "modest fashion",
    "RIWAYAH",
    "eid collection",
    "online shopping Pakistan",
    "Sapphire abaya",
    "Asim Jofa modest",
  ],
  authors: [{ name: siteConfig.storeName, url: siteConfig.siteUrl }],
  creator: siteConfig.storeName,
  openGraph: {
    type: "website",
    locale: "en_PK",
    url: siteConfig.siteUrl,
    siteName: siteConfig.storeName,
    title: `${siteConfig.storeName} — Luxury Pakistani Modest Fashion`,
    description: siteConfig.storeDescription,
    images: [
      {
        url: siteConfig.ogImage,
        width: 1200,
        height: 630,
        alt: `${siteConfig.storeName} — Luxury Pakistani Abaya Brand`,
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: `${siteConfig.storeName} — Luxury Pakistani Modest Fashion`,
    description: siteConfig.storeDescription,
    creator: siteConfig.twitterHandle,
    images: [siteConfig.ogImage],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
    },
  },
  icons: {
    icon: "/favicon.svg",
    apple: "/favicon.svg",
  },
  manifest: "/manifest.json",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="scroll-smooth">
      <body className="bg-white text-[#111827] antialiased min-h-screen flex flex-col selection:bg-[#F3EAE1] selection:text-[#111827]">
        <AuthProvider>
          <WishlistProvider>
            <CartProvider>
              <Navbar />
              <CartDrawer />
              <main className="flex-1">{children}</main>
              <Footer />
              <Toaster />
            </CartProvider>
          </WishlistProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
