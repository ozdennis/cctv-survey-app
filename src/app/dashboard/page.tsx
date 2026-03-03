"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

export default function DashboardPage() {
  const [email, setEmail] = useState<string>("");

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      setEmail(data.user?.email || "");
    });
  }, []);

  return (
    <div className="mx-auto max-w-4xl px-4 py-10 space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">Dashboard</h1>
        <p className="text-sm text-slate-400">
          This is a minimal landing page. For portal usage, open the correct subdomain (`portal.*`, `sales.*`, `vendor.*`, `finance.*`, `support.*`).
        </p>
        <div className="mt-2 text-sm text-slate-300">Signed in: {email || "-"}</div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <Link className="rounded-xl border border-slate-800 bg-slate-900/60 p-4 hover:bg-slate-900" href="/login">
          <div className="text-sm font-semibold text-slate-100">Login / Register</div>
          <div className="text-xs text-slate-500">Portal entry point</div>
        </Link>
        <Link className="rounded-xl border border-slate-800 bg-slate-900/60 p-4 hover:bg-slate-900" href="/pending">
          <div className="text-sm font-semibold text-slate-100">Pending</div>
          <div className="text-xs text-slate-500">Default-deny holding page</div>
        </Link>
        <Link className="rounded-xl border border-slate-800 bg-slate-900/60 p-4 hover:bg-slate-900" href="/dashboard/settings/users">
          <div className="text-sm font-semibold text-slate-100">Admin: Users</div>
          <div className="text-xs text-slate-500">Approve users + assign roles</div>
        </Link>
        <Link className="rounded-xl border border-slate-800 bg-slate-900/60 p-4 hover:bg-slate-900" href="/">
          <div className="text-sm font-semibold text-slate-100">Home</div>
          <div className="text-xs text-slate-500">Subdomain router rewrites this</div>
        </Link>
      </div>
    </div>
  );
}

