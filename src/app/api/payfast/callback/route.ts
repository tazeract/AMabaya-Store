import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import { createClient } from "@supabase/supabase-js";

// ─── Supabase admin client (service role) ────────────────────────────────────
function getSupabaseAdmin() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY!;
  if (!url || !key || key === "YOUR_SUPABASE_SERVICE_ROLE_KEY") return null;
  return createClient(url, key);
}

// ─── PayFast signature verification ──────────────────────────────────────────
function verifyPayFastSignature(data: Record<string, string>, receivedSig: string): boolean {
  const passphrase = process.env.PAYFAST_SECURED_KEY ?? "";
  
  // Build query string (exclude signature itself)
  const params = { ...data };
  delete params.signature;

  let queryString = Object.keys(params)
    .filter((k) => params[k] !== "")
    .map((k) => `${k}=${encodeURIComponent(params[k]).replace(/%20/g, "+")}`)
    .join("&");

  if (passphrase) {
    queryString += `&passphrase=${encodeURIComponent(passphrase).replace(/%20/g, "+")}`;
  }

  const hash = crypto.createHash("md5").update(queryString).digest("hex");
  return hash === receivedSig;
}

// ─── POST /api/payfast/callback ───────────────────────────────────────────────
export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const data: Record<string, string> = {};
    formData.forEach((value, key) => { data[key] = value.toString(); });

    const {
      payment_status,
      m_payment_id: orderId,
      signature,
      merchant_id,
    } = data;

    // 1. Verify merchant ID
    const expectedMerchantId = process.env.PAYFAST_MERCHANT_ID;
    if (expectedMerchantId && merchant_id !== expectedMerchantId) {
      console.error("PayFast: merchant_id mismatch");
      return new NextResponse("Forbidden", { status: 403 });
    }

    // 2. Verify signature
    if (signature && !verifyPayFastSignature(data, signature)) {
      console.error("PayFast: invalid signature");
      return new NextResponse("Bad signature", { status: 400 });
    }

    // 3. Update order in Supabase
    const supabase = getSupabaseAdmin();
    if (supabase && orderId) {
      const newStatus = payment_status === "COMPLETE" ? "paid" : "pending_payment";
      const { error } = await supabase
        .from("orders")
        .update({
          status: newStatus,
          payment_status: payment_status,
          payfast_payment_id: data.pf_payment_id ?? null,
        })
        .eq("id", orderId);

      if (error) {
        console.error("PayFast callback — DB update failed:", error.message);
        return new NextResponse("DB error", { status: 500 });
      }
    }

    return new NextResponse("OK", { status: 200 });
  } catch (err) {
    console.error("PayFast callback error:", err);
    return new NextResponse("Internal error", { status: 500 });
  }
}

// PayFast sends GET to verify the endpoint exists
export async function GET() {
  return new NextResponse("PayFast callback endpoint active", { status: 200 });
}
