import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";

// ─── POST /api/payfast/initiate ───────────────────────────────────────────────
// Creates a PayFast payment form data and returns redirect URL + fields.
export async function POST(request: NextRequest) {
  try {
    const { orderId, amount, customerName, customerEmail, customerPhone } =
      await request.json();

    const merchantId   = process.env.PAYFAST_MERCHANT_ID   ?? "";
    const merchantKey  = process.env.PAYFAST_SECURED_KEY    ?? "";
    const merchantName = process.env.PAYFAST_MERCHANT_NAME  ?? "AMabaya";
    const isSandbox    = process.env.PAYFAST_SANDBOX !== "false";

    // Base URL for callbacks
    const baseUrl = process.env.NEXT_PUBLIC_SITE_URL
      ?? (request.headers.get("origin") ?? "http://localhost:3000");

    const pfData: Record<string, string> = {
      merchant_id:    merchantId,
      merchant_key:   merchantKey,
      return_url:     `${baseUrl}/order-tracking?orderId=${orderId}&status=success`,
      cancel_url:     `${baseUrl}/checkout?cancelled=1&orderId=${orderId}`,
      notify_url:     `${baseUrl}/api/payfast/callback`,
      name_first:     customerName.split(" ")[0] ?? customerName,
      name_last:      customerName.split(" ").slice(1).join(" ") || "-",
      email_address:  customerEmail ?? "",
      cell_number:    customerPhone?.replace(/\D/g, "") ?? "",
      m_payment_id:   orderId,
      amount:         (amount / 100).toFixed(2), // PayFast uses PKR, amount in rupees
      item_name:      `AMabaya Order #${orderId.slice(0, 8).toUpperCase()}`,
      item_description: "Luxury modest wear from AMabaya",
    };

    // Build signature
    const queryString = Object.keys(pfData)
      .filter((k) => pfData[k] !== "")
      .map((k) => `${k}=${encodeURIComponent(pfData[k]).replace(/%20/g, "+")}`)
      .join("&") + (merchantKey ? `&passphrase=${encodeURIComponent(merchantKey)}` : "");

    const signature = crypto.createHash("md5").update(queryString).digest("hex");

    const payfastUrl = isSandbox
      ? "https://sandbox.payfast.co.za/eng/process"
      : "https://www.payfast.co.za/eng/process";

    return NextResponse.json({
      url: payfastUrl,
      fields: { ...pfData, signature },
    });
  } catch (err) {
    console.error("PayFast initiate error:", err);
    return NextResponse.json({ error: "Failed to initiate payment" }, { status: 500 });
  }
}
