"use client";


import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

type VendorInvoice = {
  id: string;
  code: string;
  vendor_id: string;
  vendor_name: string;
  work_order_id: string | null;
  total_amount: number;
  status: "pending" | "approved" | "rejected" | "paid";
  notes: string | null;
  receipt_photo_url: string | null;
  created_at: string;
};

export default function VendorInvoicesPage() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [invoices, setInvoices] = useState<VendorInvoice[]>([]);
  const [filter, setFilter] = useState<"all" | "pending" | "approved" | "rejected" | "paid">("pending");

  const refresh = async () => {
    setError(null);
    const { data, error: err } = await supabase
      .schema("finance")
      .from("vendor_invoices")
      .select(`
        *,
        vendors!inner(name)
      `)
      .order("created_at", { ascending: false });

    if (err) throw err;
    setInvoices(
      (data || []).map((d: any) => ({
        ...d,
        vendor_name: d.vendors?.name,
      }))
    );
    setLoading(false);
  };

  useEffect(() => {
    refresh();
  }, []);

  const approveInvoice = async (invoiceId: string) => {
    setError(null);
    try {
      const { error } = await supabase
        .schema("finance")
        .from("vendor_invoices")
        .update({ status: "approved" })
        .eq("id", invoiceId);

      if (error) throw error;
      await refresh();
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Failed to approve invoice");
    }
  };

  const rejectInvoice = async (invoiceId: string) => {
    setError(null);
    try {
      const { error } = await supabase
        .schema("finance")
        .from("vendor_invoices")
        .update({ status: "rejected" })
        .eq("id", invoiceId);

      if (error) throw error;
      await refresh();
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Failed to reject invoice");
    }
  };

  const filtered = invoices.filter((inv) => filter === "all" || inv.status === filter);

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Vendor Invoices</h1>
          <p className="text-sm text-slate-400">Review and approve vendor claims</p>
        </div>
        <button
          onClick={refresh}
          className="text-xs px-3 py-1.5 rounded-lg border border-slate-800 text-slate-200 hover:bg-slate-800"
        >
          Refresh
        </button>
      </div>

      {error && (
        <div className="rounded-xl border border-rose-900/40 bg-rose-950/30 px-4 py-3 text-rose-200 text-sm">
          {error}
        </div>
      )}

      <div className="flex gap-2">
        {["all", "pending", "approved", "rejected", "paid"].map((s) => (
          <button
            key={s}
            onClick={() => setFilter(s as any)}
            className={`px-3 py-1.5 rounded-lg text-sm font-medium ${
              filter === s
                ? "bg-emerald-600 text-white"
                : "bg-slate-800 text-slate-300 hover:bg-slate-700"
            }`}
          >
            {s.charAt(0).toUpperCase() + s.slice(1)}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="text-sm text-slate-400">Loading…</div>
      ) : filtered.length === 0 ? (
        <div className="text-sm text-slate-400">No invoices found.</div>
      ) : (
        <div className="space-y-3">
          {filtered.map((inv) => (
            <div
              key={inv.id}
              className="rounded-xl border border-slate-800 bg-slate-900/60 p-5 space-y-3"
            >
              <div className="flex items-start justify-between">
                <div>
                  <div className="font-mono text-xs text-slate-500">{inv.code}</div>
                  <div className="text-sm text-slate-100 mt-1">
                    Vendor: <span className="text-slate-300">{inv.vendor_name}</span>
                  </div>
                  {inv.notes && (
                    <div className="text-xs text-slate-400 mt-2">Notes: {inv.notes}</div>
                  )}
                </div>
                <div className="text-right">
                  <div className="text-lg font-semibold text-white">
                    Rp {inv.total_amount.toLocaleString("id-ID")}
                  </div>
                  <div
                    className={`text-xs mt-1 px-2 py-0.5 rounded-full inline-block ${
                      inv.status === "pending"
                        ? "bg-amber-900/40 text-amber-300"
                        : inv.status === "approved"
                        ? "bg-emerald-900/40 text-emerald-300"
                        : inv.status === "rejected"
                        ? "bg-rose-900/40 text-rose-300"
                        : "bg-slate-700 text-slate-300"
                    }`}
                  >
                    {inv.status}
                  </div>
                </div>
              </div>

              {inv.status === "pending" && (
                <div className="flex gap-2 pt-2 border-t border-slate-800">
                  <button
                    onClick={() => approveInvoice(inv.id)}
                    className="px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-semibold"
                  >
                    Approve
                  </button>
                  <button
                    onClick={() => rejectInvoice(inv.id)}
                    className="px-4 py-2 rounded-lg bg-rose-600 hover:bg-rose-700 text-white text-sm font-semibold"
                  >
                    Reject
                  </button>
                </div>
              )}

              {inv.receipt_photo_url && (
                <div className="pt-2 border-t border-slate-800">
                  <a
                    href={inv.receipt_photo_url}
                    target="_blank"
                    rel="noreferrer"
                    className="text-xs text-emerald-400 hover:underline"
                  >
                    📎 View Receipt Photo
                  </a>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

</contents>