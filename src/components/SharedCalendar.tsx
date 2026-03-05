"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

type CalendarEntry = {
  id: string;
  entry_type: "survey" | "work_order" | "maintenance" | "meeting" | "other";
  scheduled_at: string;
  title: string;
  description: string | null;
  status: "scheduled" | "completed" | "cancelled" | "no_show";
  vendor_name: string | null;
  customer_name: string | null;
  location_address: string | null;
  edit_count: number;
};

export default function SharedCalendar({ role }: { role: string }) {
  const [entries, setEntries] = useState<CalendarEntry[]>([]);
  const [loading, setLoading] = useState(true);

  const refresh = async () => {
    const today = new Date().toISOString().slice(0, 10);
    const nextWeek = new Date();
    nextWeek.setDate(nextWeek.getDate() + 7);
    const nextWeekStr = nextWeek.toISOString().slice(0, 10);

    let query = supabase
      .from("schedule_entries")
      .select(`
        *,
        vendors(name),
        accounts(name)
      `)
      .gte("scheduled_at", today)
      .lte("scheduled_at", nextWeekStr + "T23:59:59")
      .order("scheduled_at", { ascending: true });

    const { data, error } = await query;
    if (error) {
      console.error("Calendar fetch error:", error);
      setLoading(false);
      return;
    }

    setEntries(
      (data || []).map((d: any) => ({
        ...d,
        vendor_name: d.vendors?.name || null,
        customer_name: d.accounts?.name || null,
      }))
    );
    setLoading(false);
  };

  useEffect(() => {
    refresh();

    const channel = supabase
      .channel("schedule_changes")
      .on(
        "postgres_changes",
        { event: "*", schema: "core", table: "schedule_entries" },
        refresh
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [role]);

  const groupedByDate = entries.reduce((acc, entry) => {
    const date = entry.scheduled_at.slice(0, 10);
    if (!acc[date]) acc[date] = [];
    acc[date].push(entry);
    return acc;
  }, {} as Record<string, CalendarEntry[]>);

  const sortedDates = Object.keys(groupedByDate).sort();

  const getColor = (type: string, status: string) => {
    if (status === "cancelled") return "bg-slate-700 border-slate-600";
    if (status === "completed") return "bg-emerald-900/40 border-emerald-700";
    switch (type) {
      case "survey":
        return "bg-amber-900/40 border-amber-700";
      case "work_order":
        return "bg-emerald-900/40 border-emerald-700";
      case "maintenance":
        return "bg-purple-900/40 border-purple-700";
      default:
        return "bg-slate-800 border-slate-700";
    }
  };

  const getIcon = (type: string) => {
    switch (type) {
      case "survey":
        return "📋";
      case "work_order":
        return "🔧";
      case "maintenance":
        return "⚙️";
      default:
        return "📅";
    }
  };

  return (
    <div className="w-80 border-l border-slate-800 bg-slate-900/40 p-4 overflow-y-auto h-screen sticky top-0">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-semibold text-slate-200">📅 Schedule</h3>
        <button
          onClick={refresh}
          className="text-xs px-2 py-1 rounded border border-slate-700 text-slate-400 hover:bg-slate-800"
        >
          ↻
        </button>
      </div>

      {loading ? (
        <div className="text-xs text-slate-500">Loading...</div>
      ) : sortedDates.length === 0 ? (
        <div className="text-xs text-slate-500">No upcoming events</div>
      ) : (
        <div className="space-y-4">
          {sortedDates.map((date) => {
            const dayEntries = groupedByDate[date];
            const dateObj = new Date(date);
            const dayName = dateObj.toLocaleDateString("en-US", { weekday: "short" });
            const dayNum = dateObj.getDate();
            const month = dateObj.toLocaleDateString("en-US", { month: "short" });

            return (
              <div key={date}>
                <div className="text-xs font-medium text-slate-500 mb-2 flex items-center gap-2">
                  <span className="bg-slate-800 px-2 py-0.5 rounded">
                    {dayName} {dayNum} {month}
                  </span>
                  <span className="flex-1 h-px bg-slate-800" />
                </div>
                <div className="space-y-2">
                  {dayEntries.map((entry) => {
                    const time = entry.scheduled_at.slice(11, 16);
                    return (
                      <div
                        key={entry.id}
                        className={`p-2.5 rounded-lg border ${getColor(
                          entry.entry_type,
                          entry.status
                        )} cursor-pointer hover:scale-[1.02] transition-transform`}
                        title={entry.description || undefined}
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex-1 min-w-0">
                            <div className="text-xs font-medium text-slate-200 truncate">
                              {getIcon(entry.entry_type)} {entry.title}
                            </div>
                            <div className="text-xs text-slate-400 mt-0.5">
                              {time}
                              {entry.customer_name && (
                                <span className="ml-2 text-slate-500">· {entry.customer_name}</span>
                              )}
                            </div>
                            {entry.vendor_name && role !== "vendor" && (
                              <div className="text-xs text-slate-500 mt-1">
                                Vendor: {entry.vendor_name}
                              </div>
                            )}
                            {entry.edit_count > 0 && (
                              <div className="text-xs text-amber-500 mt-1">
                                Edited {entry.edit_count}x
                              </div>
                            )}
                          </div>
                          {entry.status !== "scheduled" && (
                            <span
                              className={`text-xs px-1.5 py-0.5 rounded ${
                                entry.status === "completed"
                                  ? "bg-emerald-800 text-emerald-300"
                                  : "bg-slate-700 text-slate-400"
                              }`}
                            >
                              {entry.status}
                            </span>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      )}

      <div className="mt-6 pt-4 border-t border-slate-800">
        <div className="text-xs text-slate-500 space-y-1">
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded bg-amber-900/40 border border-amber-700" />
            <span>Survey</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded bg-emerald-900/40 border border-emerald-700" />
            <span>Work Order</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded bg-purple-900/40 border border-purple-700" />
            <span>Maintenance</span>
          </div>
        </div>
        {role === "vendor" && (
          <div className="mt-3 text-xs text-amber-500">
            ⚠ You can edit scheduled entries up to 2 times
          </div>
        )}
      </div>
    </div>
  );
}

</contents>