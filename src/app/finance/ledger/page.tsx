"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

type LedgerEntry = {
  id: string;
  code: string;
  transaction_date: string;
  category: "revenue" | "cogs" | "opex" | "withdrawal" | "tax_reserve";
  direction: "in" | "out";
  amount: number;
  description: string;
  related_code: string | null;
  project_name: string | null;
  customer_name: string | null;
  vendor_name: string | null;
};

export default function LedgerPage() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [entries, setEntries] = useState<LedgerEntry[]>([]);
  const [filterCategory, setFilterCategory] = useState<string>("all");
  const [filterDirection, setFilterDirection] = useState<string>("all");

  const refresh = async () => {
    setError(null);
    const { data, error: err } = await supabase
      .schema("finance")
      .from("finance_ledger")
      .select(`
        *,
        projects(name),
        accounts(name),
        vendors(name)
      `)
      .order("transaction_date", { ascending: false });

    if (err) throw err;
    setEntries(
      (data || []).map((d: any) => ({
        ...d,
        project_name: d.projects?.name || null,
        customer_name: d.accounts?.name || null,
        vendor_name: d.vendors?.name || null,
      }))
    );
    setLoading(false);
  };

  useEffect(() => {
    refresh();
  }, []);

  const filtered = entries.filter((e) => {
    if (filterCategory !== "all" && e.category !== filterCategory) return false;
    if (filterDirection !== "all" && e.direction !== filterDirection) return false;
    return true;
  });

  const totals = filtered.reduce(
    (acc, e) => {
      if (e.direction === "in") acc.in += e.amount;
      else acc.out += e.amount;
      return acc;
    },
    { in: 0, out: 0 }
  );

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Finance Ledger</h1>
          <p className="text-sm text-slate-400">All financial transactions</p>
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

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="rounded-xl border border-emerald-900/40 bg-emerald-950/20 p-4">
          <div className="text-xs text-emerald-400">Total In</div>
          <div className="text-xl font-bold text-emerald-300">
            Rp {totals.in.toLocaleString("id-ID")}
          </div>
        </div>
        <div className="rounded-xl border border-rose-900/40 bg-rose-950/20 p-4">
          <div className="text-xs text-rose-400">Total Out</div>
          <div className="text-xl font-bold text-rose-300">
            Rp {totals.out.toLocaleString("id-ID")}
          </div>
        </div>
        <div className="rounded-xl border border-slate-700 bg-slate-800/40 p-4">
          <div className="text-xs text-slate-400">Net</div>
          <div className={`text-xl font-bold ${totals.in - totals.out >= 0 ? "text-emerald-300" : "text-rose-300"}`}>
            Rp {(totals.in - totals.out).toLocaleString("id-ID")}
          </div>
        </div>
      </div>

      <div className="flex gap-2 flex-wrap">
        <select
          value={filterCategory}
          onChange={(e) => setFilterCategory(e.target.value)}
          className="rounded-lg border border-slate-800 bg-slate-950 px-3 py-2 text-slate-200 text-sm"
        >
          <option value="all">All Categories</option>
          <option value="revenue">Revenue</option>
          <option value="cogs">COGS</option>
          <option value="opex">OPEX</option>
          <option value="withdrawal">Withdrawal</option>
          <option value="tax_reserve">Tax Reserve</option>
        </select>
        <select
          value={filterDirection}
          onChange={(e) => setFilterDirection(e.target.value)}
          className="rounded-lg border border-slate-800 bg-slate-950 px-3 py-2 text-slate-200 text-sm"
        >
          <option value="all">All Directions</option>
          <option value="in">In</option>
          <option value="out">Out</option>
        </select>
      </div>

      <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-5">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-800 text-left text-slate-400">
                <th className="pb-3 pr-4 font-medium">Date</th>
                <th className="pb-3 pr-4 font-medium">Code</th>
                <th className="pb-3 pr-4 font-medium">Category</th>
                <th className="pb-3 pr-4 font-medium">Description</th>
                <th className="pb-3 pr-4 font-medium">Related</th>
                <th className="pb-3 pr-4 font-medium text-right">Amount</th>
              </tr>
            </thead>
            <tbody className="text-slate-300">
              {loading ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-slate-400">
                    Loading…
                  </td>
                </tr>
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-slate-400">
                    No entries found.
                  </td>
                </tr>
              ) : (
                filtered.slice(0, 100).map((entry) => (
                  <tr key={entry.id} className="border-b border-slate-800/50">
                    <td className="py-3 pr-4 text-slate-400">{entry.transaction_date}</td>
                    <td className="py-3 pr-4 font-mono text-xs text-slate-500">{entry.code}</td>
                    <td className="py-3 pr-4">
                      <span
                        className={`px-2 py-0.5 rounded-full text-xs ${
                          entry.category === "revenue"
                            ? "bg-emerald-900/40 text-emerald-300"
                            : entry.category === "cogs"
                            ? "bg-amber-900/40 text-amber-300"
                            : entry.category === "opex"
                            ? "bg-slate-700 text-slate-300"
                            : entry.category === "withdrawal"
                            ? "bg-rose-900/40 text-rose-300"
                            : "bg-purple-900/40 text-purple-300"
                        }`}
                      >
                        {entry.category}
                      </span>
                    </td>
                    <td className="py-3 pr-4">{entry.description}</td>
                    <td className="py-3 pr-4 text-xs text-slate-500">
                      {entry.related_code}
                      {entry.project_name && <div className="text-slate-400">{entry.project_name}</div>}
                      {entry.customer_name && <div className="text-slate-400">{entry.customer_name}</div>}
                      {entry.vendor_name && <div className="text-slate-400">{entry.vendor_name}</div>}
                    </td>
                    <td className={`py-3 pr-4 text-right font-semibold ${
                      entry.direction === "in" ? "text-emerald-400" : "text-rose-400"
                    }`}>
                      {entry.direction === "in" ? "+" : "-"} Rp {entry.amount.toLocaleString("id-ID")}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

