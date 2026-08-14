import emailjs from "@emailjs/browser";
import type { Order } from "@/types";
import siteConfig from "@/lib/siteConfig";

/**
 * Initialize EmailJS. Call this once in the app root.
 */
export function initEmailJS() {
  emailjs.init(siteConfig.emailjs.publicKey);
}

/**
 * Send an order confirmation email to the customer.
 */
export async function sendOrderConfirmation(order: Order): Promise<void> {
  const itemsList = order.items
    .map(
      (item) =>
        `• ${item.product.title} (${item.selectedSize}, ${item.selectedColor}) x${item.quantity} — ₨ ${(
          item.product.price * item.quantity
        ).toLocaleString()}`
    )
    .join("\n");

  const templateParams = {
    to_name: order.customerName,
    to_email: order.customerEmail || "",
    order_id: order.id,
    order_date: new Date(order.placedAt).toLocaleDateString("en-PK", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    }),
    items_list: itemsList,
    subtotal: `₨ ${(order.total - order.shippingCost).toLocaleString()}`,
    shipping_cost:
      order.shippingCost === 0 ? "FREE" : `₨ ${order.shippingCost}`,
    total: `₨ ${order.total.toLocaleString()}`,
    payment_method: order.paymentMethod === "cod" ? "Cash on Delivery" : "Bank Transfer",
    shipping_address: `${order.shippingAddress.address}, ${order.shippingAddress.city}, ${order.shippingAddress.province}`,
    phone: order.customerPhone,
    store_name: siteConfig.storeName,
    store_phone: siteConfig.contactPhone,
    store_whatsapp: `https://wa.me/${siteConfig.whatsappNumber}`,
  };

  await emailjs.send(
    siteConfig.emailjs.serviceId,
    siteConfig.emailjs.templateId,
    templateParams
  );
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
  await emailjs.send(
    siteConfig.emailjs.serviceId,
    "template_contact", // Create a separate contact template in EmailJS
    {
      from_name: params.name,
      from_email: params.email,
      from_phone: params.phone,
      subject: params.subject,
      message: params.message,
      store_name: siteConfig.storeName,
    }
  );
}
