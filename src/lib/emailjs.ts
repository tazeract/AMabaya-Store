import emailjs from "@emailjs/browser";
import siteConfig from "@/lib/siteConfig";

// ─── Type for order email (Supabase shape) ────────────────────────────────────
interface OrderEmailData {
  id: string;
  customerName: string;
  customerEmail?: string;
  customerPhone: string;
  items: Array<{
    product: { title: string; price: number };
    quantity: number;
    selectedSize: string;
    selectedColor: string;
  }>;
  total: number;
  shippingCost: number;
  paymentMethod: string;
  shippingAddress: {
    fullName: string;
    phone: string;
    address: string;
    city: string;
    province: string;
  };
  placedAt: string;
}

/**
 * Initialize EmailJS — call once in app root (layout.tsx).
 */
export function initEmailJS() {
  if (!siteConfig.emailjs.publicKey || siteConfig.emailjs.publicKey.startsWith("YOUR_")) return;
  emailjs.init(siteConfig.emailjs.publicKey);
}

/**
 * Send order confirmation email to customer.
 * Silently fails if EmailJS is not configured.
 */
export async function sendOrderConfirmation(order: OrderEmailData): Promise<void> {
  const { serviceId, orderTemplateId, publicKey } = siteConfig.emailjs;

  // Skip if not configured
  if (!serviceId || serviceId.startsWith("YOUR_") || !order.customerEmail) return;

  const itemsList = order.items
    .map(
      (item) =>
        `• ${item.product.title} (${item.selectedSize}, ${item.selectedColor}) x${item.quantity} — Rs. ${(
          item.product.price * item.quantity
        ).toLocaleString("en-PK")}`
    )
    .join("\n");

  const templateParams = {
    to_name:          order.customerName,
    to_email:         order.customerEmail,
    order_id:         order.id.slice(0, 8).toUpperCase(),
    order_date:       new Date(order.placedAt).toLocaleDateString("en-PK", {
                        weekday: "long", year: "numeric", month: "long", day: "numeric",
                      }),
    items_list:       itemsList,
    subtotal:         `Rs. ${(order.total - order.shippingCost).toLocaleString("en-PK")}`,
    shipping_cost:    order.shippingCost === 0 ? "FREE" : `Rs. ${order.shippingCost.toLocaleString("en-PK")}`,
    total:            `Rs. ${order.total.toLocaleString("en-PK")}`,
    payment_method:   order.paymentMethod === "cod" ? "Cash on Delivery" : "Bank Transfer",
    shipping_address: `${order.shippingAddress.address}, ${order.shippingAddress.city}, ${order.shippingAddress.province}`,
    phone:            order.customerPhone,
    store_name:       siteConfig.storeName,
    store_phone:      siteConfig.contactPhone,
    store_whatsapp:   `https://wa.me/${siteConfig.whatsappNumber}`,
  };

  await emailjs.send(serviceId, orderTemplateId, templateParams, publicKey);
}

/**
 * Send a contact form message.
 */
export async function sendContactMessage(params: {
  name: string;
  email: string;
  phone: string;
  subject: string;
  message: string;
}): Promise<void> {
  const { serviceId, contactTemplateId, publicKey } = siteConfig.emailjs;
  if (!serviceId || serviceId.startsWith("YOUR_")) return;

  await emailjs.send(
    serviceId,
    contactTemplateId,
    {
      from_name:  params.name,
      from_email: params.email,
      from_phone: params.phone,
      subject:    params.subject,
      message:    params.message,
      store_name: siteConfig.storeName,
    },
    publicKey
  );
}
