"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
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
  const [payingInvoiceId, setPayingInvoiceId] = useState<string | null>(null);

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
    setPayingInvoiceId(invoiceId);
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
    } finally {
      setPayingInvoiceId(null);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent, invoiceId: string) => {
    if (e.key === 'Enter') {
      recordPayment(invoiceId);
    }
  };

  return (
    <div className="mx-auto max-w-5xl px-4 py-8 space-y-6">
      {/* Page Header */}
      <div className="space-y-2">
        <div className="text-xs text-slate-500">
          <Link href="/" className="hover:text-slate-300 transition-colors">Home</Link>
          <span className="mx-2 text-slate-700">/</span>
          <span className="text-slate-300">Finance</span>
        </div>
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-semibold text-white">Finance Dashboard</h1>
          <button
            onClick={refresh}
            className="text-sm px-4 py-2 rounded-lg border border-slate-700 text-slate-200 hover:border-slate-600 transition-colors focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 focus:ring-offset-slate-900"
          >
            Refresh
          </button>
        </div>
        <p className="text-sm text-slate-400 max-w-3xl">
          Track customer invoices, record payments, and monitor financial status.
          Invoice status is automatically derived from payment totals.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <Link
          href="/finance/invoices/customers"
          className="rounded-lg border border-slate-800 bg-slate-900/60 p-6 hover:border-slate-700 transition-colors focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 focus:ring-offset-slate-900 group"
        >
          <div className="text-sm font-semibold text-slate-200 group-hover:text-white transition-colors">Customer Invoices</div>
          <div className="text-xs text-slate-500 mt-2">Create & manage invoices</div>
        </Link>
        <Link
          href="/finance/invoices/vendors"
          className="rounded-lg border border-slate-800 bg-slate-900/60 p-6 hover:border-slate-700 transition-colors focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 focus:ring-offset-slate-900 group"
        >
          <div className="text-sm font-semibold text-slate-200 group-hover:text-white transition-colors">Vendor Invoices</div>
          <div className="text-xs text-slate-500 mt-2">Review & approve vendor claims</div>
        </Link>
        <Link
          href="/finance/payments/out"
          className="rounded-lg border border-slate-800 bg-slate-900/60 p-6 hover:border-slate-700 transition-colors focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 focus:ring-offset-slate-900 group"
        >
          <div className="text-sm font-semibold text-slate-200 group-hover:text-white transition-colors">Payments Out</div>
          <div className="text-xs text-slate-500 mt-2">Vendor payouts & withdrawals</div>
        </Link>
        <Link
          href="/finance/ledger"
          className="rounded-lg border border-slate-800 bg-slate-900/60 p-6 hover:border-slate-700 transition-colors focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 focus:ring-offset-slate-900 group"
        >
          <div className="text-sm font-semibold text-slate-200 group-hover:text-white transition-colors">Ledger</div>
          <div className="text-xs text-slate-500 mt-2">View all transactions</div>
        </Link>
        <Link
          href="/finance/reports"
          className="rounded-lg border border-slate-800 bg-slate-900/60 p-6 hover:border-slate-700 transition-colors focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 focus:ring-offset-slate-900 group"
        >
          <div className="text-sm font-semibold text-slate-200 group-hover:text-white transition-colors">Reports</div>
          <div className="text-xs text-slate-500 mt-2">P&L, Cash Flow, Tax Reserve</div>
        </Link>
      </div>

      {err && (
        <div className="rounded-lg border border-rose-900/40 bg-rose-950/30 px-4 py-3 text-rose-200 text-sm">
          {err}
        </div>
      )}

      {loading ? (
        <div className="text-sm text-slate-400">Loading…</div>
      ) : (
        <div className="rounded-lg border border-slate-800 bg-slate-900/60 p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold text-slate-200">Customer Invoices</h2>
          </div>

          {invoices.length === 0 ? (
            <div className="text-sm text-slate-400">No invoices found.</div>
          ) : (
            <div className="space-y-2">
              {invoices.slice(0, 30).map((inv) => {
                const paid = paidByInvoice.get(inv.id) || 0;
                const remaining = Math.max(0, Number(inv.total_amount || 0) - paid);
                return (
                  <div key={inv.id} className="rounded-lg border border-slate-800 bg-slate-950/40 px-4 py-4 space-y-3 hover:border-slate-700 transition-colors">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <div className="font-mono text-xs text-slate-500">{inv.code}</div>
                        <div className="text-sm text-slate-300">
                          <span className="capitalize">{inv.invoice_type}</span>
                          <span className="mx-2 text-slate-600">·</span>
                          <span className={remaining <= 0 ? "text-emerald-400" : paid > 0 ? "text-amber-400" : "text-slate-400"}>
                            {inv.status}
                          </span>
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

                    <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                      <input
                        type="date"
                        value={payDateByInvoice[inv.id] || new Date().toISOString().slice(0, 10)}
                        onChange={(e) => setPayDateByInvoice((m) => ({ ...m, [inv.id]: e.target.value }))}
                        className="rounded-lg border border-slate-800 bg-slate-950 px-3 py-2 text-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                        onKeyDown={(e) => handleKeyDown(e, inv.id)}
                      />
                      <input
                        type="number"
                        value={payAmountByInvoice[inv.id] || ""}
                        onChange={(e) => setPayAmountByInvoice((m) => ({ ...m, [inv.id]: e.target.value }))}
                        onKeyDown={(e) => handleKeyDown(e, inv.id)}
                        placeholder="Amount"
                        className="rounded-lg border border-slate-800 bg-slate-950 px-3 py-2 text-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                      />
                      <button
                        onClick={() => recordPayment(inv.id)}
                        disabled={payingInvoiceId === inv.id}
                        className="rounded-lg bg-emerald-600 hover:bg-emerald-700 disabled:bg-emerald-800 px-4 py-2 text-white text-sm font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 focus:ring-offset-slate-900 flex items-center justify-center gap-2"
                      >
                        {payingInvoiceId === inv.id ? (
                          <>
                            <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                            <span>Processing…</span>
                          </>
                        ) : (
                          "Record Payment"
                        )}
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

