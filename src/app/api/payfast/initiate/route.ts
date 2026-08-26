import { NextRequest, NextResponse } from "next/server";

// ─── POST /api/payfast/initiate ───────────────────────────────────────────────
// Integrates with Pakistani PayFast (GoPayFast / APPS — https://gopayfast.com)
// Supports Pakistani payment methods: JazzCash, EasyPaisa, Debit/Credit Card, Bank Accounts, UnionPay.
export async function POST(request: NextRequest) {
  try {
    const { orderId, amount, customerName, customerEmail, customerPhone } =
      await request.json();

    const merchantId   = process.env.PAYFAST_MERCHANT_ID   ?? "";
    const securedKey   = process.env.PAYFAST_SECURED_KEY   ?? "";
    const merchantName = process.env.PAYFAST_MERCHANT_NAME ?? "AMabaya";
    const isSandbox    = process.env.PAYFAST_SANDBOX !== "false";

    // Base URL for callbacks
    const baseUrl = process.env.NEXT_PUBLIC_SITE_URL
      ?? (request.headers.get("origin") ?? "http://localhost:3000");

    // GoPayFast Pakistan Endpoints
    // UAT / Sandbox vs Production (Live)
    const tokenUrl = isSandbox
      ? "https://ipguat.apps.net.pk/Ecommerce/api/Transaction/GetAccessToken"
      : "https://ipg.apps.net.pk/Ecommerce/api/Transaction/GetAccessToken";

    const postTransactionUrl = isSandbox
      ? "https://ipguat.apps.net.pk/Ecommerce/api/Transaction/PostTransaction"
      : "https://ipg.apps.net.pk/Ecommerce/api/Transaction/PostTransaction";

    // Format transaction amount in PKR (e.g. "8500.00")
    const formattedAmount = Number(amount).toFixed(2);
    const orderDesc = `AMabaya Order #${orderId ? orderId.slice(0, 8).toUpperCase() : "CART"}`;
    const cleanPhone = (customerPhone ?? "").replace(/\D/g, "");

    const successCallbackUrl = `${baseUrl}/api/payfast/callback?status=success&orderId=${orderId}`;
    const failureCallbackUrl = `${baseUrl}/api/payfast/callback?status=failed&orderId=${orderId}`;
    const checkoutUrl = `${baseUrl}/checkout`;

    let accessToken = "";

    // 1. Request GoPayFast Access Token (Server-to-Server)
    try {
      const tokenPayload = {
        MERCHANT_ID: merchantId,
        SECURED_KEY: securedKey,
        BASKET_ID: orderId,
        TXNAMT: formattedAmount,
        CURRENCY_CODE: "PKR",
        TXNDESC: orderDesc,
        SUCCESS_URL: successCallbackUrl,
        FAILURE_URL: failureCallbackUrl,
        CHECKOUT_URL: checkoutUrl,
        CUSTOMER_EMAIL_ADDRESS: customerEmail || "customer@amabaya.pk",
        CUSTOMER_MOBILE_NO: cleanPhone || "03001234567",
      };

      const tokenRes = await fetch(tokenUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Accept": "application/json",
        },
        body: JSON.stringify(tokenPayload),
      });

      if (tokenRes.ok) {
        const tokenData = await tokenRes.json();
        accessToken = tokenData.ACCESS_TOKEN || tokenData.token || tokenData.Token || "";
      } else {
        console.warn("GoPayFast GetAccessToken returned non-200:", tokenRes.status);
      }
    } catch (tokenErr) {
      console.warn("GoPayFast GetAccessToken request failed (will fallback to direct POST fields):", tokenErr);
    }

    // 2. Prepare payload for GoPayFast PostTransaction redirect form
    const formFields: Record<string, string> = {
      MERCHANT_ID: merchantId,
      MERCHANT_NAME: merchantName,
      TOKEN: accessToken,
      ACCESS_TOKEN: accessToken,
      BASKET_ID: orderId,
      TXNAMT: formattedAmount,
      CURRENCY_CODE: "PKR",
      TXNDESC: orderDesc,
      SUCCESS_URL: successCallbackUrl,
      FAILURE_URL: failureCallbackUrl,
      CHECKOUT_URL: checkoutUrl,
      CUSTOMER_NAME: customerName || "Valued Customer",
      CUSTOMER_EMAIL_ADDRESS: customerEmail || "",
      CUSTOMER_MOBILE_NO: cleanPhone || "",
      ORDER_DATE: new Date().toISOString().replace("T", " ").substring(0, 19),
    };

    return NextResponse.json({
      url: postTransactionUrl,
      token: accessToken,
      fields: formFields,
    });
  } catch (err) {
    console.error("GoPayFast initiate error:", err);
    return NextResponse.json({ error: "Failed to initiate payment" }, { status: 500 });
  }
}

