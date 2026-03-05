"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

type VendorInvoice = {
  id: string;
  code: string;
  vendor_name: string;
  total_amount: number;
  status: string;
};

type PaymentOut = {
  id: string;
  type: "vendor_payout" | "withdrawal";
  amount: number;
  payment_date: string;
  method: string;
  reference: string | null;
  vendor_invoice_id: string | null;
  vendor_code: string | null;
};

export default function PaymentsOutPage() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [payments, setPayments] = useState<PaymentOut[]>([]);
  const [approvedInvoices, setApprovedInvoices] = useState<VendorInvoice[]>([]);

  const [form, setForm] = useState({
    type: "vendor_payout" as "vendor_payout" | "withdrawal",
    invoice_id: "",
    amount: "",
    payment_date: new Date().toISOString().slice(0, 10),
    method: "bank_transfer",
    reference: "",
  });

  const refresh = async () => {
    setError(null);
    const { data, error: err } = await supabase
      .schema("finance")
      .from("payments_out")
      .select(`
        *,
        vendor_invoices(code)
      `)
      .order("payment_date", { ascending: false });

    if (err) throw err;
    setPayments(
      (data || []).map((d: any) => ({
        ...d,
        vendor_code: d.vendor_invoices?.code || null,
      }))
    );
    setLoading(false);
  };

  const loadApprovedInvoices = async () => {
    const { data, error: err } = await supabase
      .schema("finance")
      .from("vendor_invoices")
      .select(`
        id, code, total_amount, status,
        vendors(name)
      `)
      .eq("status", "approved");

    if (err) return;
    setApprovedInvoices(
      (data || []).map((d: any) => ({
        id: d.id,
        code: d.code,
        total_amount: d.total_amount,
        status: d.status,
        vendor_name: d.vendors?.name,
      }))
    );
  };

  useEffect(() => {
    refresh();
    loadApprovedInvoices();
  }, []);

  const submitPayment = async () => {
    setError(null);
    try {
      const amount = Number(form.amount);
      if (!Number.isFinite(amount) || amount <= 0) {
        throw new Error("Payment amount must be > 0");
      }

      const { error } = await supabase.schema("finance").from("payments_out").insert({
        type: form.type,
        vendor_invoice_id: form.type === "vendor_payout" ? form.invoice_id || null : null,
        amount,
        payment_date: form.payment_date,
        method: form.method,
        reference: form.reference || null,
        recorded_by: (await supabase.auth.getUser()).data.user?.id || null,
        approved_by: (await supabase.auth.getUser()).data.user?.id || null,
      });

      if (error) throw error;

      if (form.type === "vendor_payout" && form.invoice_id) {
        await supabase
          .schema("finance")
          .from("vendor_invoices")
          .update({ status: "paid" })
          .eq("id", form.invoice_id);
      }

      setForm({
        type: "vendor_payout",
        invoice_id: "",
        amount: "",
        payment_date: new Date().toISOString().slice(0, 10),
        method: "bank_transfer",
        reference: "",
      });
      await refresh();
      await loadApprovedInvoices();
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Failed to record payment");
    }
  };

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">Payments Out</h1>
        <p className="text-sm text-slate-400">Record vendor payouts and withdrawals</p>
      </div>

      {error && (
        <div className="rounded-xl border border-rose-900/40 bg-rose-950/30 px-4 py-3 text-rose-200 text-sm">
          {error}
        </div>
      )}

      <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-5 space-y-4">
        <h2 className="text-sm font-semibold text-slate-200">New Payment</h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs text-slate-400 mb-1">Type</label>
            <select
              value={form.type}
              onChange={(e) => setForm({ ...form, type: e.target.value as any, invoice_id: "" })}
              className="w-full rounded-lg border border-slate-800 bg-slate-950 px-3 py-2 text-slate-200 text-sm"
            >
              <option value="vendor_payout">Vendor Payout</option>
              <option value="withdrawal">Withdrawal (Owner)</option>
            </select>
          </div>

          {form.type === "vendor_payout" && (
            <div>
              <label className="block text-xs text-slate-400 mb-1">Vendor Invoice</label>
              <select
                value={form.invoice_id}
                onChange={(e) => {
                  const inv = approvedInvoices.find((i) => i.id === e.target.value);
                  setForm({
                    ...form,
                    invoice_id: e.target.value,
                    amount: inv ? String(inv.total_amount) : "",
                  });
                }}
                className="w-full rounded-lg border border-slate-800 bg-slate-950 px-3 py-2 text-slate-200 text-sm"
              >
                <option value="">Select invoice...</option>
                {approvedInvoices.map((inv) => (
                  <option key={inv.id} value={inv.id}>
                    {inv.code} - {inv.vendor_name} - Rp {inv.total_amount.toLocaleString("id-ID")}
                  </option>
                ))}
              </select>
            </div>
          )}

          <div>
            <label className="block text-xs text-slate-400 mb-1">Amount</label>
            <input
              type="number"
              value={form.amount}
              onChange={(e) => setForm({ ...form, amount: e.target.value })}
              className="w-full rounded-lg border border-slate-800 bg-slate-950 px-3 py-2 text-slate-200 text-sm"
              placeholder="0"
            />
          </div>

          <div>
            <label className="block text-xs text-slate-400 mb-1">Payment Date</label>
            <input
              type="date"
              value={form.payment_date}
              onChange={(e) => setForm({ ...form, payment_date: e.target.value })}
              className="w-full rounded-lg border border-slate-800 bg-slate-950 px-3 py-2 text-slate-200 text-sm"
            />
          </div>

          <div>
            <label className="block text-xs text-slate-400 mb-1">Method</label>
            <select
              value={form.method}
              onChange={(e) => setForm({ ...form, method: e.target.value })}
              className="w-full rounded-lg border border-slate-800 bg-slate-950 px-3 py-2 text-slate-200 text-sm"
            >
              <option value="bank_transfer">Bank Transfer</option>
              <option value="cash">Cash</option>
              <option value="check">Check</option>
            </select>
          </div>

          <div>
            <label className="block text-xs text-slate-400 mb-1">Reference</label>
            <input
              type="text"
              value={form.reference}
              onChange={(e) => setForm({ ...form, reference: e.target.value })}
              className="w-full rounded-lg border border-slate-800 bg-slate-950 px-3 py-2 text-slate-200 text-sm"
              placeholder="Bank ref / check number"
            />
          </div>
        </div>

        <button
          onClick={submitPayment}
          className="w-full md:w-auto px-6 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-semibold"
        >
          Record Payment
        </button>
      </div>

      <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-5 space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-semibold text-slate-200">Payment History</h2>
          <button
            onClick={refresh}
            className="text-xs px-3 py-1.5 rounded-lg border border-slate-800 text-slate-200 hover:bg-slate-800"
          >
            Refresh
          </button>
        </div>

        {loading ? (
          <div className="text-sm text-slate-400">Loading…</div>
        ) : payments.length === 0 ? (
          <div className="text-sm text-slate-400">No payments recorded.</div>
        ) : (
          <div className="space-y-2">
            {payments.slice(0, 50).map((pay) => (
              <div
                key={pay.id}
                className="rounded-xl border border-slate-800 bg-slate-950/40 px-4 py-3 flex items-center justify-between"
              >
                <div>
                  <div className="text-sm text-slate-100">
                    {pay.type === "vendor_payout" ? "Vendor Payout" : "Withdrawal"}
                    {pay.vendor_code && <span className="text-slate-500"> · {pay.vendor_code}</span>}
                  </div>
                  <div className="text-xs text-slate-500">
                    {pay.payment_date} · {pay.method}
                    {pay.reference && ` · Ref: ${pay.reference}`}
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-sm font-semibold text-rose-300">
                    - Rp {pay.amount.toLocaleString("id-ID")}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

</contents>