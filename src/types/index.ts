// ─── Product Types ─────────────────────────────────────────────────────────

export interface ProductConfig {
  slug: string;
  title: string;
  subtitle: string;
  description: string;
  longDescription: string;
  price: number;
  originalPrice?: number;
  category: "Abaya" | "Kaftan" | "Dupatta" | "Set";
  tags: string[];
  sizes: ProductSize[];
  colors: ProductColor[];
  images: string[];
  modelPath?: string; // Path to .glb file, e.g. /products/slug/model.glb
  sku: string;
  featured: boolean;
  isNew: boolean;
  isBestseller: boolean;
  stock: Record<string, number>; // key: "size-color", value: stock count
  material: string;
  careInstructions: string[];
  rating: number;
  reviewCount: number;
  createdAt: string;
}

export interface ProductSize {
  label: string; // "S" | "M" | "L" | "XL" | "XXL" | "Free Size"
  measurements?: string; // e.g. "Bust: 36-38 inches"
}

export interface ProductColor {
  name: string;
  hex: string;
}

export interface Product extends ProductConfig {
  slug: string;
}

// ─── Cart Types ────────────────────────────────────────────────────────────

export interface CartItem {
  product: Product;
  quantity: number;
  selectedSize: string;
  selectedColor: string;
  id: string; // unique: slug-size-color
}

// ─── Wishlist Types ────────────────────────────────────────────────────────

export interface WishlistItem {
  productSlug: string;
  addedAt: string;
}

// ─── Auth Types ────────────────────────────────────────────────────────────

export interface SavedAddress {
  id: string;
  label: string;         // e.g. "Home", "Office"
  fullName: string;
  phone: string;
  address: string;
  city: string;
  province: string;
  postalCode?: string;
  isDefault: boolean;
}

export interface User {
  id: string;
  name: string;
  email: string;
  phone?: string;
  avatarUrl?: string;
  addresses?: SavedAddress[];
  createdAt: string;
}

export interface AuthState {
  user: User | null;
  isLoading: boolean;
}

// ─── Order Types ───────────────────────────────────────────────────────────

export type OrderStatus = "placed" | "processing" | "shipped" | "delivered";

export interface Order {
  id: string;
  items: CartItem[];
  total: number;
  shippingCost: number;
  status: OrderStatus;
  customerName: string;
  customerPhone: string;
  customerEmail?: string;
  shippingAddress: ShippingAddress;
  paymentMethod: "cod" | "bank_transfer";
  placedAt: string;
  updatedAt: string;
  trackingCode?: string;
  notes?: string;
}

export interface ShippingAddress {
  fullName: string;
  phone: string;
  address: string;
  city: string;
  province: string;
  postalCode?: string;
}

// ─── Filter Types ──────────────────────────────────────────────────────────

export interface FilterState {
  category: string[];
  priceRange: [number, number];
  sizes: string[];
  colors: string[];
  sortBy: "newest" | "price_asc" | "price_desc" | "rating" | "bestseller";
  searchQuery: string;
}

// ─── Site Config Type ──────────────────────────────────────────────────────

export interface SiteConfig {
  storeName: string;
  storeTagline: string;
  storeDescription: string;
  logoText: string;
  currency: string;
  currencySymbol: string;
  contactPhone: string;
  whatsappNumber: string;
  contactEmail: string;
  address: string;
  socialLinks: {
    instagram: string;
    facebook: string;
    tiktok: string;
    pinterest: string;
  };
  emailjs: {
    serviceId: string;
    templateId: string;
    publicKey: string;
  };
  recaptchaSiteKey: string;
  siteUrl: string;
  ogImage: string;
  twitterHandle: string;
  freeShippingThreshold: number;
  standardShippingCost: number;
  codAvailable: boolean;
  returnPolicy: string;
}

// ─── Testimonial ───────────────────────────────────────────────────────────

export interface Testimonial {
  id: string;
  name: string;
  city: string;
  rating: number;
  text: string;
  productBought: string;
  avatar: string;
  verified: boolean;
}
