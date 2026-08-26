import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

// ─── Supabase admin client (service role) ────────────────────────────────────
function getSupabaseAdmin() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY!;
  if (!url || !key || key === "YOUR_SUPABASE_SERVICE_ROLE_KEY") return null;
  return createClient(url, key);
}

// Helper to determine if GoPayFast transaction is successful
function isGoPayFastSuccess(errCode?: string | null, status?: string | null): boolean {
  if (errCode && (errCode === "000" || errCode === "00" || errCode === "0")) return true;
  if (status && ["success", "complete", "approved", "paid", "00", "000"].includes(status.toLowerCase())) return true;
  return false;
}

// ─── POST /api/payfast/callback ───────────────────────────────────────────────
// GoPayFast Pakistan posts transaction status back upon payment completion
export async function POST(request: NextRequest) {
  try {
    const url = new URL(request.url);
    const baseUrl = process.env.NEXT_PUBLIC_SITE_URL ?? `${url.protocol}//${url.host}`;

    let data: Record<string, string> = {};

    const contentType = request.headers.get("content-type") ?? "";
    if (contentType.includes("application/json")) {
      data = await request.json();
    } else {
      const formData = await request.formData();
      formData.forEach((val, key) => {
        data[key] = val.toString();
      });
    }

    // Extract GoPayFast Pakistan return parameters
    const orderId =
      data.basket_id ||
      data.Basket_Id ||
      data.BASKET_ID ||
      data.m_payment_id ||
      data.orderId ||
      url.searchParams.get("orderId") ||
      "";

    const errCode = data.err_code || data.errCode || data.code || "";
    const errMsg = data.err_msg || data.error_msg || data.response_message || data.status_msg || "";
    const transactionId =
      data.transaction_id ||
      data.Transaction_Id ||
      data.txnid ||
      data.rd ||
      data.pf_payment_id ||
      "";

    const queryStatus = url.searchParams.get("status");
    const statusParam = data.payment_status || data.status || queryStatus || "";

    const isSuccess = isGoPayFastSuccess(errCode, statusParam);

    // Update order in Supabase
    const supabase = getSupabaseAdmin();
    if (supabase && orderId) {
      const newStatus = isSuccess ? "paid" : "pending_payment";
      const paymentStatus = isSuccess ? "completed" : (errMsg || "failed");

      const { error } = await supabase
        .from("orders")
        .update({
          status: newStatus,
          payment_status: paymentStatus,
          payfast_payment_id: transactionId || null,
        })
        .eq("id", orderId);

      if (error) {
        console.error("GoPayFast callback — Supabase update error:", error.message);
      }
    }

    // If request is from browser navigation / form POST redirect, redirect to customer-facing page
    const acceptHeader = request.headers.get("accept") ?? "";
    const isBrowserNavigation =
      acceptHeader.includes("text/html") || request.headers.get("sec-fetch-mode") === "navigate";

    if (isBrowserNavigation || url.searchParams.has("orderId")) {
      const destination = isSuccess
        ? `${baseUrl}/order-tracking?orderId=${orderId}&status=success`
        : `${baseUrl}/order-tracking?orderId=${orderId}&status=failed&msg=${encodeURIComponent(errMsg || "Payment was not completed")}`;

      return NextResponse.redirect(destination, 303);
    }

    return NextResponse.json({
      success: true,
      message: isSuccess ? "Payment marked as completed" : "Payment marked as pending/failed",
      orderId,
      transactionId,
    });
  } catch (err) {
    console.error("GoPayFast callback error:", err);
    return NextResponse.json({ error: "Internal error processing callback" }, { status: 500 });
  }
}

// ─── GET /api/payfast/callback ────────────────────────────────────────────────
// GoPayFast Pakistan redirect URL (when customer is redirected via browser GET)
export async function GET(request: NextRequest) {
  try {
    const url = new URL(request.url);
    const baseUrl = process.env.NEXT_PUBLIC_SITE_URL ?? `${url.protocol}//${url.host}`;

    const orderId = url.searchParams.get("orderId") || url.searchParams.get("basket_id") || "";
    const errCode = url.searchParams.get("err_code") || url.searchParams.get("code") || "";
    const statusParam = url.searchParams.get("status") || "";
    const errMsg = url.searchParams.get("err_msg") || url.searchParams.get("msg") || "";
    const transactionId = url.searchParams.get("transaction_id") || url.searchParams.get("rd") || "";

    const isSuccess = isGoPayFastSuccess(errCode, statusParam);

    // Update order status if orderId is present
    const supabase = getSupabaseAdmin();
    if (supabase && orderId) {
      const newStatus = isSuccess ? "paid" : "pending_payment";
      const paymentStatus = isSuccess ? "completed" : (errMsg || "failed");

      await supabase
        .from("orders")
        .update({
          status: newStatus,
          payment_status: paymentStatus,
          payfast_payment_id: transactionId || null,
        })
        .eq("id", orderId);
    }

    if (orderId) {
      const destination = isSuccess
        ? `${baseUrl}/order-tracking?orderId=${orderId}&status=success`
        : `${baseUrl}/order-tracking?orderId=${orderId}&status=failed&msg=${encodeURIComponent(errMsg || "Payment was not completed")}`;

      return NextResponse.redirect(destination, 307);
    }

    return new NextResponse("GoPayFast Pakistan callback endpoint is active.", { status: 200 });
  } catch (err) {
    console.error("GoPayFast GET callback error:", err);
    return new NextResponse("Internal error", { status: 500 });
  }
}

