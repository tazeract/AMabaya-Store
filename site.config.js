/** @type {import('./src/types').SiteConfig} */
const siteConfig = {
  // ─── Brand ────────────────────────────────────────────────────────────────
  storeName: "RIWAYAH",
  storeTagline: "Draped in Elegance. Born in Culture.",
  storeDescription:
    "Pakistan's premier luxury Abaya & Modest Fashion brand, crafting timeless abayas, kaftans, and dupattas for the modern South Asian woman.",
  logoText: "RIWAYAH",
  currency: "PKR",
  currencySymbol: "₨",

  // ─── Contact ──────────────────────────────────────────────────────────────
  contactPhone: "+92 328 6900066",
  whatsappNumber: "923286900066", // No + or dashes for wa.me URL
  contactEmail: "hello@riwayah.pk",
  address: "Shop 12, Gulberg III, Lahore, Punjab, Pakistan",

  // ─── Social Links ─────────────────────────────────────────────────────────
  socialLinks: {
    instagram: "https://instagram.com/riwayah.pk",
    facebook: "https://facebook.com/riwayah.pk",
    tiktok: "https://tiktok.com/@riwayah.pk",
    pinterest: "https://pinterest.com/riwayah",
  },

  // ─── EmailJS Config ───────────────────────────────────────────────────────
  // Get your keys at https://www.emailjs.com/
  emailjs: {
    serviceId: "YOUR_EMAILJS_SERVICE_ID",
    orderTemplateId: "YOUR_ORDER_TEMPLATE_ID",
    contactTemplateId: "YOUR_CONTACT_TEMPLATE_ID",
    publicKey: "YOUR_EMAILJS_PUBLIC_KEY",
  },

  // ─── reCAPTCHA ────────────────────────────────────────────────────────────
  // Get your site key at https://www.google.com/recaptcha/
  recaptchaSiteKey: "YOUR_RECAPTCHA_SITE_KEY",

  // ─── SEO / OpenGraph ──────────────────────────────────────────────────────
  siteUrl: "https://riwayah.pk",
  ogImage: "/og-image.jpg",
  twitterHandle: "@riwayah_pk",

  // ─── Shipping & Policies ──────────────────────────────────────────────────
  freeShippingThreshold: 5000, // PKR — free shipping above this amount
  standardShippingCost: 250, // PKR
  codAvailable: true,
  returnPolicy: "7-day hassle-free return",
};

module.exports = siteConfig;
