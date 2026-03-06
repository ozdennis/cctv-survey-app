 "use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

type AuditRow = {
  id: string;
  occurred_at: string;
  actor_user_id: string | null;
  actor_role: string | null;
  category: string | null;
  entity_table: string | null;
  entity_id: string | null;
  entity_code: string | null;
  operation: string | null;
  summary: string | null;
  reason: string | null;
};

type UserRow = {
  id: string;
  email: string | null;
};

const CATEGORIES = ["all", "finance", "sales", "vendor", "support", "core", "auth"] as const;

export default function AdminLogsPage() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [rows, setRows] = useState<AuditRow[]>([]);
  const [usersById, setUsersById] = useState<Record<string, string>>({});

  const [category, setCategory] = useState<(typeof CATEGORIES)[number]>("all");
  const [searchCode, setSearchCode] = useState("");

  useEffect(() => {
    const load = async () => {
      setError(null);
      setLoading(true);
      try {
        const q = supabase
          .schema("core")
          .from("audit_log")
          .select(
            "id,occurred_at,actor_user_id,actor_role,category,entity_table,entity_id,entity_code,operation,summary,reason",
          )
          .order("occurred_at", { ascending: false })
          .limit(100);

        const { data, error: auditErr } = await q;
        if (auditErr) throw auditErr;

        const auditRows = ((data as AuditRow[] | null) || []) as AuditRow[];
        setRows(auditRows);

        const actorIds = Array.from(new Set(auditRows.map((r) => r.actor_user_id).filter(Boolean))) as string[];
        if (actorIds.length) {
          const { data: userRows, error: userErr } = await supabase
            .schema("core")
            .from("users")
            .select("id,email")
            .in("id", actorIds);
          if (userErr) throw userErr;
          const map: Record<string, string> = {};
          for (const u of (userRows as UserRow[] | null) || []) {
            if (u.id) {
              map[u.id] = u.email || u.id;
            }
          }
          setUsersById(map);
        } else {
          setUsersById({});
        }
      } catch (e: unknown) {
        const msg = e instanceof Error ? e.message : "Failed to load audit log.";
        setError(msg);
      } finally {
        setLoading(false);
      }
    };

    void load();
  }, []);

  const filteredRows = rows.filter((row) => {
    if (category !== "all" && row.category !== category) return false;
    if (searchCode && !((row.entity_code || "").toLowerCase().includes(searchCode.toLowerCase()))) return false;
    return true;
  });

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-bold text-white">Admin Logs</h1>
        <p className="text-sm text-slate-400">
          Read-only view of sensitive changes recorded in <code className="font-mono text-xs">core.audit_log</code>.
          Only admins should be able to access this screen.
        </p>
      </div>

      <div className="rounded-xl border border-slate-800 bg-slate-950/60 px-4 py-3 flex flex-col md:flex-row gap-3 md:items-center md:justify-between">
        <div className="flex items-center gap-2 text-xs text-slate-400">
          <span className="font-semibold text-slate-200">Filters:</span>
          <select
            className="rounded-lg border border-slate-800 bg-slate-950 px-2 py-1 text-xs text-slate-200"
            value={category}
            onChange={(e) => setCategory(e.target.value as (typeof CATEGORIES)[number])}
          >
            {CATEGORIES.map((c) => (
              <option key={c} value={c}>
                {c === "all" ? "All categories" : c}
              </option>
            ))}
          </select>
          <input
            type="text"
            placeholder="Search by entity code (e.g. CI-...)"
            className="rounded-lg border border-slate-800 bg-slate-950 px-2 py-1 text-xs text-slate-200 w-48"
            value={searchCode}
            onChange={(e) => setSearchCode(e.target.value)}
          />
        </div>
        <div className="text-[11px] text-slate-500">
          Logs are immutable and used for investigation of admin overrides on invoices, work orders, and other entities.
        </div>
      </div>

      {error && (
        <div className="rounded-xl border border-rose-900/40 bg-rose-950/30 px-4 py-3 text-rose-200 text-sm">
          {error}
        </div>
      )}

      {loading ? (
        <div className="text-sm text-slate-400">Loading audit log…</div>
      ) : filteredRows.length === 0 ? (
        <div className="text-sm text-slate-400">No audit entries match the current filters.</div>
      ) : (
        <div className="overflow-x-auto rounded-xl border border-slate-800 bg-slate-950/60">
          <table className="min-w-full text-left text-[11px] text-slate-300">
            <thead>
              <tr className="border-b border-slate-800 text-slate-400">
                <th className="px-3 py-2">Time</th>
                <th className="px-3 py-2">Category</th>
                <th className="px-3 py-2">Actor</th>
                <th className="px-3 py-2">Operation</th>
                <th className="px-3 py-2">Entity</th>
                <th className="px-3 py-2">Summary</th>
                <th className="px-3 py-2">Reason</th>
              </tr>
            </thead>
            <tbody>
              {filteredRows.map((row) => (
                <tr key={row.id} className="border-b border-slate-900 last:border-0 align-top">
                  <td className="px-3 py-2 whitespace-nowrap">
                    {new Date(row.occurred_at).toLocaleString(undefined, {
                      dateStyle: "short",
                      timeStyle: "short",
                    })}
                  </td>
                  <td className="px-3 py-2 whitespace-nowrap">
                    <span className="inline-flex items-center rounded-full bg-slate-800 px-2 py-0.5 text-[10px] uppercase tracking-wide">
                      {row.category || "-"}
                    </span>
                  </td>
                  <td className="px-3 py-2 whitespace-nowrap">
                    <div className="flex flex-col">
                      <span>{(row.actor_user_id && usersById[row.actor_user_id]) || row.actor_user_id || "-"}</span>
                      <span className="text-[10px] text-slate-500">{row.actor_role || ""}</span>
                    </div>
                  </td>
                  <td className="px-3 py-2 whitespace-nowrap">
                    <span className="inline-flex items-center rounded-full bg-slate-800 px-2 py-0.5 text-[10px] uppercase tracking-wide">
                      {row.operation || "-"}
                    </span>
                  </td>
                  <td className="px-3 py-2 whitespace-nowrap">
                    <div className="flex flex-col">
                      <span>{row.entity_table || "-"}</span>
                      {row.entity_code && (
                        <span className="text-[10px] text-slate-500">{row.entity_code}</span>
                      )}
                    </div>
                  </td>
                  <td className="px-3 py-2 max-w-xs">
                    <div className="line-clamp-3">{row.summary || "-"}</div>
                  </td>
                  <td className="px-3 py-2 max-w-xs">
                    <div className="line-clamp-3 text-slate-400">{row.reason || "-"}</div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

