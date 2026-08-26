"use client";

import { useRef } from "react";
import { X, Printer, Download, CheckCircle, Package } from "lucide-react";

interface OrderItem {
  id: string;
  product_snapshot: { name: string; images?: string[] };
  quantity: number;
  size?: string;
  color?: string;
  unit_price: number;
}

interface Order {
  id: string;
  user_id: string;
  status: string;
  total: number;
  shipping_cost: number;
  payment_method: string;
  placed_at: string;
  tracking_code?: string;
  notes?: string;
  shipping_address: {
    fullName: string;
    phone: string;
    address: string;
    city: string;
    province: string;
    email?: string;
  };
  order_items: OrderItem[];
}

export function InvoiceModal({ order, onClose }: { order: Order; onClose: () => void }) {
  const printRef = useRef<HTMLDivElement>(null);

  const handlePrint = () => {
    window.print();
  };

  const subtotal = order.order_items.reduce(
    (acc, item) => acc + (item.unit_price || 0) * (item.quantity || 1),
    0
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="bg-white w-full max-w-2xl rounded-2xl shadow-2xl overflow-hidden my-8 border border-[#E5E7EB] flex flex-col max-h-[90vh]">
        {/* Top Header Actions (hidden during print) */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#E5E7EB] bg-[#F9FAFB] print:hidden">
          <div className="flex items-center gap-2">
            <Package className="w-5 h-5 text-[#111827]" />
            <h3 className="font-serif font-medium text-lg text-[#111827]">Order Invoice</h3>
            <span className="text-xs font-mono bg-[#E5E7EB] text-[#374151] px-2 py-0.5 rounded-full font-semibold">
              #{order.id.slice(0, 8).toUpperCase()}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-[#111827] text-white text-xs font-semibold rounded-xl hover:bg-[#1F2937] transition-all shadow-sm"
            >
              <Printer className="w-3.5 h-3.5" />
              Print Receipt
            </button>
            <button
              onClick={onClose}
              className="p-2 text-[#6B7280] hover:text-[#111827] hover:bg-[#E5E7EB] rounded-xl transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Printable Invoice Body */}
        <div ref={printRef} className="p-8 overflow-y-auto space-y-6 text-[#111827] bg-white">
          {/* Invoice Header */}
          <div className="flex justify-between items-start border-b border-[#E5E7EB] pb-6">
            <div>
              <h1 className="font-serif text-3xl font-medium tracking-[0.15em] text-[#111827]">AMABAYA</h1>
              <p className="text-xs text-[#6B7280] mt-1 tracking-wider uppercase">Luxury Modest Couture</p>
              <p className="text-xs text-[#9CA3AF] mt-0.5">Lahore, Pakistan · hello@amabaya.pk</p>
            </div>
            <div className="text-right">
              <span className="text-xs font-bold uppercase tracking-widest text-[#9CA3AF]">Tax Invoice</span>
              <p className="text-sm font-mono font-bold mt-1 text-[#111827]">
                INV-{order.id.slice(0, 8).toUpperCase()}
              </p>
              <p className="text-xs text-[#6B7280] mt-1">
                Date: {new Date(order.placed_at).toLocaleDateString("en-PK", { dateStyle: "medium" })}
              </p>
              <p className="text-xs text-[#6B7280]">
                Payment:{" "}
                <span className="font-semibold uppercase">
                  {order.payment_method === "cod" ? "Cash on Delivery" : "Online Paid"}
                </span>
              </p>
            </div>
          </div>

          {/* Customer & Shipping Details */}
          <div className="grid grid-cols-2 gap-6 bg-[#F9FAFB] p-4 rounded-xl border border-[#F3F4F6]">
            <div>
              <p className="text-[10px] font-bold text-[#9CA3AF] uppercase tracking-wider mb-1.5">Billed & Shipped To</p>
              <p className="text-sm font-semibold text-[#111827]">{order.shipping_address?.fullName}</p>
              <p className="text-xs text-[#4B5563] mt-0.5">{order.shipping_address?.phone}</p>
              {order.shipping_address?.email && (
                <p className="text-xs text-[#4B5563]">{order.shipping_address?.email}</p>
              )}
              <p className="text-xs text-[#4B5563] mt-1 leading-relaxed">
                {order.shipping_address?.address}, {order.shipping_address?.city},{" "}
                {order.shipping_address?.province}
              </p>
            </div>
            <div>
              <p className="text-[10px] font-bold text-[#9CA3AF] uppercase tracking-wider mb-1.5">Order Metadata</p>
              <div className="space-y-1 text-xs">
                <p className="text-[#4B5563]">
                  <span className="font-medium text-[#111827]">Status:</span>{" "}
                  <span className="capitalize font-semibold text-emerald-600">{order.status}</span>
                </p>
                {order.tracking_code && (
                  <p className="text-[#4B5563]">
                    <span className="font-medium text-[#111827]">Tracking Code:</span>{" "}
                    <span className="font-mono">{order.tracking_code}</span>
                  </p>
                )}
                {order.notes && (
                  <p className="text-[#4B5563] italic">
                    <span className="font-medium not-italic text-[#111827]">Notes:</span> {order.notes}
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Items Table */}
          <div className="border border-[#E5E7EB] rounded-xl overflow-hidden">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#F3F4F6] text-[#6B7280] uppercase tracking-wider text-[10px]">
                <tr>
                  <th className="py-3 px-4">Item Details</th>
                  <th className="py-3 px-4 text-center">Qty</th>
                  <th className="py-3 px-4 text-right">Unit Price</th>
                  <th className="py-3 px-4 text-right">Total</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E5E7EB]">
                {order.order_items.map((item, idx) => (
                  <tr key={item.id || idx}>
                    <td className="py-3 px-4">
                      <p className="font-semibold text-[#111827]">{item.product_snapshot?.name || "Product"}</p>
                      <p className="text-[11px] text-[#6B7280]">
                        Size: {item.size || "Standard"} {item.color ? `· Color: ${item.color}` : ""}
                      </p>
                    </td>
                    <td className="py-3 px-4 text-center font-medium">{item.quantity}</td>
                    <td className="py-3 px-4 text-right font-mono">
                      Rs. {item.unit_price.toLocaleString("en-PK")}
                    </td>
                    <td className="py-3 px-4 text-right font-mono font-semibold">
                      Rs. {(item.unit_price * item.quantity).toLocaleString("en-PK")}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pricing Totals */}
          <div className="flex justify-end pt-2">
            <div className="w-64 space-y-2 text-xs">
              <div className="flex justify-between text-[#6B7280]">
                <span>Subtotal:</span>
                <span className="font-mono text-[#111827]">Rs. {subtotal.toLocaleString("en-PK")}</span>
              </div>
              <div className="flex justify-between text-[#6B7280]">
                <span>Shipping Fee:</span>
                <span className="font-mono text-[#111827]">
                  {order.shipping_cost === 0 ? "FREE" : `Rs. ${order.shipping_cost.toLocaleString("en-PK")}`}
                </span>
              </div>
              <div className="flex justify-between text-sm font-bold text-[#111827] pt-2 border-t border-[#E5E7EB]">
                <span>Total Amount:</span>
                <span className="font-mono">Rs. {order.total.toLocaleString("en-PK")}</span>
              </div>
            </div>
          </div>

          {/* Footer note */}
          <div className="border-t border-[#E5E7EB] pt-6 text-center text-[11px] text-[#9CA3AF]">
            <p>Thank you for choosing AMabaya. For any returns or exchanges, please contact support within 7 days.</p>
            <p className="mt-1">WhatsApp: +92 300 1234567 · Website: www.amabaya.pk</p>
          </div>
        </div>
      </div>
    </div>
  );
}
