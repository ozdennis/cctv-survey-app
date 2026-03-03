"use client";

import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/lib/supabase";

type Invoice = {
  id: string;
  code: string;
  invoice_type: string;
  status: string;
  total_amount: number;
  issue_date: string;
  due_date: string | null;
};

type Payment = {
  id: string;
  invoice_id: string;
  payment_date: string;
  amount: number;
};

export default function FinancePage() {
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [payments, setPayments] = useState<Payment[]>([]);

  const [payAmountByInvoice, setPayAmountByInvoice] = useState<Record<string, string>>({});
  const [payDateByInvoice, setPayDateByInvoice] = useState<Record<string, string>>({});

  const refresh = async () => {
    setErr(null);
    const [{ data: inv, error: invErr }, { data: pay, error: payErr }] = await Promise.all([
      supabase
        .schema("finance")
        .from("customer_invoices")
        .select("id,code,invoice_type,status,total_amount,issue_date,due_date")
        .order("issue_date", { ascending: false }),
      supabase
        .schema("finance")
        .from("payments_in")
        .select("id,invoice_id,payment_date,amount")
        .order("payment_date", { ascending: false }),
    ]);
    if (invErr) throw invErr;
    if (payErr) throw payErr;
    setInvoices((inv || []) as Invoice[]);
    setPayments((pay || []) as Payment[]);
  };

  useEffect(() => {
    (async () => {
      try {
        await refresh();
      } catch (e: unknown) {
        const msg = e instanceof Error ? e.message : "Failed to load finance data.";
        setErr(msg);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const paidByInvoice = useMemo(() => {
    const m = new Map<string, number>();
    for (const p of payments) {
      m.set(p.invoice_id, (m.get(p.invoice_id) || 0) + Number(p.amount || 0));
    }
    return m;
  }, [payments]);

  const recordPayment = async (invoiceId: string) => {
    setErr(null);
    try {
      const amount = Number(payAmountByInvoice[invoiceId] || 0);
      const payment_date = payDateByInvoice[invoiceId] || new Date().toISOString().slice(0, 10);
      if (!Number.isFinite(amount) || amount <= 0) throw new Error("Payment amount must be > 0.");

      const { data: auth } = await supabase.auth.getUser();
      const recorded_by = auth.user?.id || null;

      const { error } = await supabase.schema("finance").from("payments_in").insert({
        invoice_id: invoiceId,
        payment_date,
        amount,
        method: "bank_transfer",
        reference: null,
        recorded_by,
      });
      if (error) throw error;

      setPayAmountByInvoice((m) => ({ ...m, [invoiceId]: "" }));
      await refresh();
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : "Failed to record payment.";
      setErr(msg);
    }
  };

  return (
    <div className="mx-auto max-w-5xl px-4 py-10 space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">Finance</h1>
        <p className="text-sm text-slate-400">
          Payments are recorded as <strong>one row per payment event</strong> (amount + date). Invoice status is derived
          from the sum of payments.
        </p>
        <p className="mt-2 text-xs text-amber-300">
          Customer invoices and work orders are immutable documents with unique codes. Finance can record payments and
          drive status transitions, but the underlying invoice rows are not edited directly except via admin override
          tools that write to the audit log.
        </p>
      </div>

      {err && (
        <div className="rounded-xl border border-rose-900/40 bg-rose-950/30 px-4 py-3 text-rose-200 text-sm">
          {err}
        </div>
      )}

      {loading ? (
        <div className="text-sm text-slate-400">Loading…</div>
      ) : (
        <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-5 space-y-3">
          <div className="flex items-center justify-between">
            <div className="text-sm font-semibold text-slate-200">Customer invoices</div>
            <button
              onClick={refresh}
              className="text-xs px-3 py-1.5 rounded-lg border border-slate-800 text-slate-200 hover:bg-slate-800"
            >
              Refresh
            </button>
          </div>

          {invoices.length === 0 ? (
            <div className="text-sm text-slate-400">No invoices found.</div>
          ) : (
            <div className="space-y-2">
              {invoices.slice(0, 30).map((inv) => {
                const paid = paidByInvoice.get(inv.id) || 0;
                const remaining = Math.max(0, Number(inv.total_amount || 0) - paid);
                return (
                  <div key={inv.id} className="rounded-xl border border-slate-800 bg-slate-950/40 px-4 py-3 space-y-2">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <div className="font-mono text-xs text-slate-500">{inv.code}</div>
                        <div className="text-sm text-slate-100">
                          Type: <span className="text-slate-300">{inv.invoice_type}</span> · Status:{" "}
                          <span className="text-slate-300">{inv.status}</span>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-sm font-semibold text-slate-100">
                          Rp {Number(inv.total_amount || 0).toLocaleString("id-ID")}
                        </div>
                        <div className="text-xs text-slate-500">
                          Paid: Rp {paid.toLocaleString("id-ID")} · Remaining: Rp {remaining.toLocaleString("id-ID")}
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                      <input
                        type="date"
                        value={payDateByInvoice[inv.id] || new Date().toISOString().slice(0, 10)}
                        onChange={(e) => setPayDateByInvoice((m) => ({ ...m, [inv.id]: e.target.value }))}
                        className="rounded-lg border border-slate-800 bg-slate-950 px-3 py-2 text-slate-200 text-sm"
                      />
                      <input
                        type="number"
                        value={payAmountByInvoice[inv.id] || ""}
                        onChange={(e) => setPayAmountByInvoice((m) => ({ ...m, [inv.id]: e.target.value }))}
                        placeholder="Payment amount"
                        className="rounded-lg border border-slate-800 bg-slate-950 px-3 py-2 text-slate-200 text-sm"
                      />
                      <button
                        onClick={() => recordPayment(inv.id)}
                        className="rounded-lg bg-emerald-600 hover:bg-emerald-700 px-4 py-2 text-white text-sm font-semibold"
                      >
                        Record payment
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

