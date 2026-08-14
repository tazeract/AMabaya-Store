/** @type {import('./src/types').SiteConfig} */
const siteConfig = {
  // ─── Brand ────────────────────────────────────────────────────────────────
  storeName: "AMabaya",
  storeTagline: "Draped in Elegance. Born in Culture.",
  storeDescription:
    "Pakistan's premier luxury Abaya brand, crafting timeless abayas, kaftans, and dupattas for the modern South Asian woman.",
  logoText: "AM",
  currency: "PKR",
  currencySymbol: "₨",

  // ─── Contact ──────────────────────────────────────────────────────────────
  contactPhone: "+92-300-1234567",
  whatsappNumber: "923001234567", // No + or dashes for wa.me URL
  contactEmail: "hello@amabaya.pk",
  address: "Shop 12, Gulberg III, Lahore, Punjab, Pakistan",

  // ─── Social Links ─────────────────────────────────────────────────────────
  socialLinks: {
    instagram: "https://instagram.com/amabaya.pk",
    facebook: "https://facebook.com/amabaya.pk",
    tiktok: "https://tiktok.com/@amabaya.pk",
    pinterest: "https://pinterest.com/amabaya",
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
  siteUrl: "https://amabaya.pk",
  ogImage: "/og-image.jpg",
  twitterHandle: "@amabaya_pk",

  // ─── Shipping & Policies ──────────────────────────────────────────────────
  freeShippingThreshold: 5000, // PKR — free shipping above this amount
  standardShippingCost: 250, // PKR
  codAvailable: true,
  returnPolicy: "7-day hassle-free return",
};

module.exports = siteConfig;
