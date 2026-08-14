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
    default: `${siteConfig.storeName} — ${siteConfig.storeTagline}`,
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
    "AMabaya",
    "eid collection",
    "online shopping Pakistan",
  ],
  authors: [{ name: siteConfig.storeName, url: siteConfig.siteUrl }],
  creator: siteConfig.storeName,
  openGraph: {
    type: "website",
    locale: "en_PK",
    url: siteConfig.siteUrl,
    siteName: siteConfig.storeName,
    title: `${siteConfig.storeName} — ${siteConfig.storeTagline}`,
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
    title: `${siteConfig.storeName} — ${siteConfig.storeTagline}`,
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
    <html lang="en">
      <body className="grain-overlay">
        <AuthProvider>
          <WishlistProvider>
            <CartProvider>
              <Navbar />
              <CartDrawer />
              <main>{children}</main>
              <Footer />
              <Toaster />
            </CartProvider>
          </WishlistProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
