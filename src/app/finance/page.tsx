"use client";

import { useState } from "react";

// ─── MOCK DATA ────────────────────────────────────────────────────────────────
const LEDGER = [
    { id: "FE-20250201-0001", date: "2025-02-01", code: "SO-20250201-0001", customer: "PT Maju Jaya", category: "revenue", amount: 9200000, description: "Platform invoice — full payment" },
    { id: "FE-20250201-0002", date: "2025-02-01", code: "SO-20250201-0001", customer: "PT Maju Jaya", category: "cogs", amount: 4100000, description: "Vendor payment + materials" },
    { id: "FE-20250205-0003", date: "2025-02-05", code: "SO-20250205-0002", customer: "Toko Sukses Mandiri", category: "revenue", amount: 5500000, description: "Platform invoice — DP 50%" },
    { id: "FE-20250205-0004", date: "2025-02-05", code: "SO-20250205-0002", customer: "Toko Sukses Mandiri", category: "cogs", amount: 2800000, description: "Vendor DP disbursement" },
    { id: "FE-20250210-0005", date: "2025-02-10", code: "SO-20250210-0003", customer: "Kantor CV Berkah", category: "revenue", amount: 7800000, description: "Platform invoice — full payment" },
    { id: "FE-20250210-0006", date: "2025-02-10", code: "SO-20250210-0003", customer: "Kantor CV Berkah", category: "cogs", amount: 3600000, description: "Vendor payment + materials" },
    { id: "FE-20250215-0007", date: "2025-02-15", code: "SO-20250215-0004", customer: "Perumahan Griya Asri", category: "revenue", amount: 4200000, description: "Platform invoice — DP 50%" },
    { id: "FE-20250215-0008", date: "2025-02-15", code: "SO-20250215-0004", customer: "Perumahan Griya Asri", category: "cogs", amount: 1900000, description: "Vendor DP disbursement" },
    { id: "FE-20250218-0009", date: "2025-02-18", code: "OPEX", customer: "—", category: "opex", amount: 1200000, description: "Office & software monthly" },
    { id: "FE-20250220-0010", date: "2025-02-20", code: "WDRW", customer: "—", category: "withdrawal", amount: 3000000, description: "Owner withdrawal — Feb" },
];

const PROJECTS = [
    { code: "SO-20250201-0001", customer: "PT Maju Jaya", revenue: 9200000, cogs: 4100000, status: "completed" },
    { code: "SO-20250205-0002", customer: "Toko Sukses Mandiri", revenue: 5500000, cogs: 2800000, status: "in_progress" },
    { code: "SO-20250210-0003", customer: "Kantor CV Berkah", revenue: 7800000, cogs: 3600000, status: "completed" },
    { code: "SO-20250215-0004", customer: "Perumahan Griya Asri", revenue: 4200000, cogs: 1900000, status: "in_progress" },
];

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
const SPARKLINE = [18, 24, 19, 32, 28, 22, 35, 30, 27, 38, 41, 45].map((v, i) => ({ m: MONTHS[i], v }));

const CATS: any = {
    revenue: { label: "Revenue", color: "#34D399", bg: "#052e16" },
    cogs: { label: "COGS", color: "#FCD34D", bg: "#2d1f00" },
    opex: { label: "Op. Expense", color: "#F87171", bg: "#2d0a0a" },
    withdrawal: { label: "Withdrawal", color: "#A78BFA", bg: "#1a0d2e" },
};

const fmt = (n: number) => "Rp " + n.toLocaleString("id-ID");
const fmtShort = (n: number) => n >= 1e6 ? `${(n / 1e6).toFixed(1)}jt` : n >= 1e3 ? `${(n / 1e3).toFixed(0)}rb` : n;

// ─── COMPUTED ─────────────────────────────────────────────────────────────────
const totalRevenue = LEDGER.filter(l => l.category === "revenue").reduce((s, l) => s + l.amount, 0);
const totalCOGS = LEDGER.filter(l => l.category === "cogs").reduce((s, l) => s + l.amount, 0);
const totalOpex = LEDGER.filter(l => l.category === "opex").reduce((s, l) => s + l.amount, 0);
const totalWithdrawal = LEDGER.filter(l => l.category === "withdrawal").reduce((s, l) => s + l.amount, 0);
const grossMargin = totalRevenue - totalCOGS;
const netIncome = grossMargin - totalOpex;
const taxReserve = Math.round(totalRevenue * 0.005);

// ─── MINI CHART ───────────────────────────────────────────────────────────────
function Sparkline({ data, color }: any) {
    const max = Math.max(...data.map((d: any) => d.v));
    const pts = data.map((d: any, i: number) => {
        const x = (i / (data.length - 1)) * 280;
        const y = 40 - (d.v / max) * 36;
        return `${x},${y}`;
    }).join(" ");
    return (
        <svg width="280" height="44" style={{ overflow: "visible" }}>
            <polyline fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" points={pts} />
            {data.map((d: any, i: number) => {
                const x = (i / (data.length - 1)) * 280;
                const y = 40 - (d.v / max) * 36;
                return <circle key={i} cx={x} cy={y} r="2.5" fill={color} />;
            })}
        </svg>
    );
}

function MarginBar({ pct, color }: any) {
    return (
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <div style={{ flex: 1, height: 4, background: "#1E293B", borderRadius: 2, overflow: "hidden" }}>
                <div style={{ width: `${pct}%`, height: "100%", background: color, borderRadius: 2, transition: "width 0.6s ease" }} />
            </div>
            <span style={{ fontSize: 12, color, fontWeight: 700, width: 40, textAlign: "right" }}>{pct.toFixed(1)}%</span>
        </div>
    );
}

// ─── TABS ─────────────────────────────────────────────────────────────────────
const TABS = ["Overview", "Ledger", "Projects", "Tax Reserve"];

export default function FinanceDashboard() {
    const [tab, setTab] = useState("Overview");
    const [catFilter, setCatFilter] = useState("all");

    const filteredLedger = catFilter === "all" ? LEDGER : LEDGER.filter(l => l.category === catFilter);

    return (
        <div style={{ minHeight: "100vh", background: "#07090F", fontFamily: "'DM Mono','Courier New',monospace", color: "#E2E8F0" }}>
            <style>{`
        * { box-sizing:border-box; }
        ::-webkit-scrollbar{width:5px;height:5px}
        ::-webkit-scrollbar-track{background:#0d1117}
        ::-webkit-scrollbar-thumb{background:#1e293b;border-radius:3px}
      `}</style>

            {/* Header */}
            <div style={{ background: "#0B0E18", borderBottom: "1px solid #0F172A", padding: "18px 28px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
                    <div style={{ width: 36, height: 36, background: "linear-gradient(135deg,#F59E0B,#D97706)", borderRadius: 10, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18 }}>₿</div>
                    <div>
                        <div style={{ fontFamily: "Syne,sans-serif", fontWeight: 800, fontSize: 18, color: "#FEF3C7", letterSpacing: "-0.02em" }}>Finance</div>
                        <div style={{ fontSize: 10, color: "#374151", letterSpacing: "0.1em" }}>FINANCE.YOURDOMAIN.COM · FEB 2025</div>
                    </div>
                </div>
                <div style={{ display: "flex", gap: 2, background: "#0F172A", padding: 3, borderRadius: 10, border: "1px solid #1E293B" }}>
                    {TABS.map(t => (
                        <button key={t} onClick={() => setTab(t)} style={{
                            padding: "6px 14px", borderRadius: 8, border: "none", cursor: "pointer", fontSize: 11, fontWeight: 600,
                            background: tab === t ? "#F59E0B" : "transparent",
                            color: tab === t ? "#07090F" : "#475569",
                            transition: "all 0.15s",
                        }}>{t}</button>
                    ))}
                </div>
            </div>

            <div style={{ padding: "24px 28px", maxWidth: 1100, margin: "0 auto" }}>

                {/* OVERVIEW */}
                {tab === "Overview" && (<>
                    {/* KPI Cards */}
                    <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 12, marginBottom: 20 }}>
                        {[
                            { label: "Revenue", val: totalRevenue, color: "#34D399", bg: "#052e16", icon: "↑" },
                            { label: "COGS", val: totalCOGS, color: "#FCD34D", bg: "#2d1f00", icon: "↓" },
                            { label: "Gross Margin", val: grossMargin, color: "#60A5FA", bg: "#0d1f35", icon: "=" },
                            { label: "Net Income", val: netIncome, color: "#F472B6", bg: "#2d0a1e", icon: "★" },
                        ].map(c => (
                            <div key={c.label} style={{ background: c.bg, border: `1px solid ${c.color}22`, borderRadius: 12, padding: "16px 18px" }}>
                                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                                    <span style={{ fontSize: 10, color: `${c.color}99`, textTransform: "uppercase", letterSpacing: "0.08em" }}>{c.label}</span>
                                    <span style={{ color: c.color, fontSize: 16 }}>{c.icon}</span>
                                </div>
                                <div style={{ fontFamily: "Syne,sans-serif", fontWeight: 800, fontSize: 20, color: c.color, marginTop: 6 }}>{fmtShort(c.val)}</div>
                                <div style={{ fontSize: 10, color: `${c.color}66`, marginTop: 2 }}>{fmt(c.val)}</div>
                            </div>
                        ))}
                    </div>

                    {/* Revenue sparkline + CoA */}
                    <div style={{ display: "grid", gridTemplateColumns: "1.4fr 1fr", gap: 12, marginBottom: 20 }}>
                        <div style={{ background: "#0B0E18", border: "1px solid #1E293B", borderRadius: 12, padding: "20px 24px" }}>
                            <div style={{ fontSize: 11, color: "#64748B", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 14 }}>Revenue Trend (YTD)</div>
                            <Sparkline data={SPARKLINE} color="#F59E0B" />
                            <div style={{ display: "flex", justifyContent: "space-between", marginTop: 6 }}>
                                {SPARKLINE.filter((_, i) => i % 2 === 0).map(d => (
                                    <span key={d.m} style={{ fontSize: 9, color: "#334155" }}>{d.m}</span>
                                ))}
                            </div>
                        </div>
                        <div style={{ background: "#0B0E18", border: "1px solid #1E293B", borderRadius: 12, padding: "20px 24px" }}>
                            <div style={{ fontSize: 11, color: "#64748B", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 14 }}>Chart of Accounts</div>
                            {[
                                { label: "Revenue", val: totalRevenue, color: "#34D399", pct: 100 },
                                { label: "COGS", val: totalCOGS, color: "#FCD34D", pct: (totalCOGS / totalRevenue) * 100 },
                                { label: "Op. Expense", val: totalOpex, color: "#F87171", pct: (totalOpex / totalRevenue) * 100 },
                                { label: "Withdrawal", val: totalWithdrawal, color: "#A78BFA", pct: (totalWithdrawal / totalRevenue) * 100 },
                                { label: "Tax Reserve", val: taxReserve, color: "#FB923C", pct: (taxReserve / totalRevenue) * 100 },
                            ].map(row => (
                                <div key={row.label} style={{ marginBottom: 12 }}>
                                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
                                        <span style={{ fontSize: 11, color: "#94A3B8" }}>{row.label}</span>
                                        <span style={{ fontSize: 11, color: row.color, fontWeight: 600 }}>{fmtShort(row.val)}</span>
                                    </div>
                                    <MarginBar pct={row.pct} color={row.color} />
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Bottom summary */}
                    <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 12 }}>
                        {[
                            { label: "Gross Margin %", val: `${((grossMargin / totalRevenue) * 100).toFixed(1)}%`, color: "#60A5FA", sub: "Revenue minus COGS" },
                            { label: "Tax Reserve", val: fmt(taxReserve), color: "#FB923C", sub: "0.5% of revenue — restricted" },
                            { label: "Withdrawals", val: fmt(totalWithdrawal), color: "#A78BFA", sub: "Owner draws this period" },
                        ].map(c => (
                            <div key={c.label} style={{ background: "#0B0E18", border: `1px solid ${c.color}22`, borderRadius: 12, padding: "16px 20px" }}>
                                <div style={{ fontSize: 10, color: `${c.color}88`, textTransform: "uppercase", letterSpacing: "0.07em", marginBottom: 8 }}>{c.label}</div>
                                <div style={{ fontFamily: "Syne,sans-serif", fontWeight: 800, fontSize: 22, color: c.color }}>{c.val}</div>
                                <div style={{ fontSize: 10, color: "#334155", marginTop: 4 }}>{c.sub}</div>
                            </div>
                        ))}
                    </div>
                </>)}

                {/* LEDGER */}
                {tab === "Ledger" && (<>
                    <div style={{ display: "flex", gap: 8, marginBottom: 16, flexWrap: "wrap" }}>
                        {["all", ...Object.keys(CATS)].map(k => {
                            const c = CATS[k];
                            const active = catFilter === k;
                            return (
                                <button key={k} onClick={() => setCatFilter(k)} style={{
                                    padding: "5px 14px", borderRadius: 6, border: `1px solid ${active && c ? c.color + "44" : "#1E293B"}`,
                                    background: active && c ? c.bg : "#0B0E18",
                                    color: active && c ? c.color : "#475569",
                                    fontSize: 11, fontWeight: 600, cursor: "pointer", textTransform: "uppercase", letterSpacing: "0.06em",
                                }}>{k === "all" ? "All" : c.label}</button>
                            );
                        })}
                    </div>
                    <div style={{ background: "#0B0E18", border: "1px solid #1E293B", borderRadius: 12, overflow: "hidden" }}>
                        <div style={{ display: "grid", gridTemplateColumns: "1.6fr 0.9fr 1fr 1.2fr 1fr", padding: "10px 16px", borderBottom: "1px solid #0F172A", background: "#060810" }}>
                            {["Code", "Date", "Category", "Description", "Amount"].map(h => (
                                <span key={h} style={{ fontSize: 10, color: "#334155", textTransform: "uppercase", letterSpacing: "0.08em" }}>{h}</span>
                            ))}
                        </div>
                        {filteredLedger.map((row, i) => {
                            const cat = CATS[row.category];
                            const taxR = row.category === "revenue" ? Math.round(row.amount * 0.005) : null;
                            return (
                                <div key={row.id} style={{
                                    display: "grid", gridTemplateColumns: "1.6fr 0.9fr 1fr 1.2fr 1fr",
                                    padding: "12px 16px", borderBottom: "1px solid #0F172A",
                                    background: i % 2 === 0 ? "transparent" : "#06080F",
                                    alignItems: "center",
                                }}>
                                    <span style={{ fontFamily: "'Courier New',monospace", fontSize: 11, color: "#475569" }}>{row.id}</span>
                                    <span style={{ fontSize: 12, color: "#64748B" }}>{row.date.slice(5)}</span>
                                    <span style={{ background: cat.bg, color: cat.color, fontSize: 10, padding: "2px 8px", borderRadius: 4, fontWeight: 700, letterSpacing: "0.05em", display: "inline-block", textTransform: "uppercase", border: `1px solid ${cat.color}33` }}>{cat.label}</span>
                                    <span style={{ fontSize: 12, color: "#94A3B8" }}>{row.description}</span>
                                    <div>
                                        <div style={{ fontSize: 13, color: row.category === "revenue" ? "#34D399" : "#F87171", fontWeight: 600 }}>
                                            {row.category === "withdrawal" || row.category === "cogs" || row.category === "opex" ? "−" : "+"}{fmtShort(row.amount)}
                                        </div>
                                        {taxR && <div style={{ fontSize: 10, color: "#FB923C66" }}>tax: {fmtShort(taxR)}</div>}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </>)}

                {/* PROJECTS */}
                {tab === "Projects" && (
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                        {PROJECTS.map(p => {
                            const margin = p.revenue - p.cogs;
                            const pct = (margin / p.revenue) * 100;
                            const done = p.status === "completed";
                            return (
                                <div key={p.code} style={{ background: "#0B0E18", border: "1px solid #1E293B", borderRadius: 12, padding: "18px 20px" }}>
                                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 12 }}>
                                        <div>
                                            <div style={{ fontFamily: "'Courier New',monospace", fontSize: 11, color: "#475569", marginBottom: 3 }}>{p.code}</div>
                                            <div style={{ fontFamily: "Syne,sans-serif", fontWeight: 700, fontSize: 15, color: "#F1F5F9" }}>{p.customer}</div>
                                        </div>
                                        <span style={{
                                            fontSize: 10, fontWeight: 700, padding: "3px 10px", borderRadius: 4,
                                            background: done ? "#052e16" : "#1a1200",
                                            color: done ? "#34D399" : "#FCD34D",
                                            border: `1px solid ${done ? "#34D39944" : "#FCD34D44"}`,
                                            textTransform: "uppercase",
                                        }}>{done ? "✓ Done" : "In Progress"}</span>
                                    </div>
                                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 8, marginBottom: 14 }}>
                                        {[
                                            { l: "Revenue", v: p.revenue, c: "#34D399" },
                                            { l: "COGS", v: p.cogs, c: "#FCD34D" },
                                            { l: "Margin", v: margin, c: "#60A5FA" },
                                        ].map(x => (
                                            <div key={x.l} style={{ background: "#060810", borderRadius: 8, padding: "8px 10px" }}>
                                                <div style={{ fontSize: 9, color: "#334155", textTransform: "uppercase", letterSpacing: "0.07em", marginBottom: 3 }}>{x.l}</div>
                                                <div style={{ fontSize: 13, color: x.c, fontWeight: 700 }}>{fmtShort(x.v)}</div>
                                            </div>
                                        ))}
                                    </div>
                                    <div style={{ fontSize: 10, color: "#64748B", marginBottom: 5 }}>Gross Margin</div>
                                    <MarginBar pct={pct} color={pct > 50 ? "#34D399" : pct > 35 ? "#FCD34D" : "#F87171"} />
                                </div>
                            );
                        })}
                    </div>
                )}

                {/* TAX RESERVE */}
                {tab === "Tax Reserve" && (
                    <div style={{ maxWidth: 560 }}>
                        <div style={{ background: "#150800", border: "1px solid #FB923C33", borderRadius: 14, padding: "28px 28px", marginBottom: 16 }}>
                            <div style={{ fontSize: 11, color: "#FB923C88", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 8 }}>Monthly Tax Reserve — RESTRICTED</div>
                            <div style={{ fontFamily: "Syne,sans-serif", fontWeight: 800, fontSize: 40, color: "#FB923C" }}>{fmt(taxReserve)}</div>
                            <div style={{ fontSize: 12, color: "#475569", marginTop: 6 }}>0.5% × {fmt(totalRevenue)} total revenue</div>
                            <div style={{ marginTop: 20, padding: "12px 16px", background: "#1a0a00", borderRadius: 8, border: "1px solid #FB923C22", fontSize: 12, color: "#B45309", lineHeight: 1.7 }}>
                                ⚠ This amount is reserved for tax obligations and must not be spent on operations, vendor payments, or owner withdrawals.
                            </div>
                        </div>
                        <div style={{ background: "#0B0E18", border: "1px solid #1E293B", borderRadius: 12, overflow: "hidden" }}>
                            <div style={{ padding: "12px 18px", borderBottom: "1px solid #0F172A", fontSize: 10, color: "#334155", textTransform: "uppercase", letterSpacing: "0.08em" }}>
                                Revenue Entries (Auto-calculated)
                            </div>
                            {LEDGER.filter(l => l.category === "revenue").map(l => (
                                <div key={l.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "12px 18px", borderBottom: "1px solid #0F172A" }}>
                                    <div>
                                        <div style={{ fontSize: 12, color: "#CBD5E1", fontWeight: 600 }}>{l.customer}</div>
                                        <div style={{ fontSize: 10, color: "#334155" }}>{l.date} · {l.code}</div>
                                    </div>
                                    <div style={{ textAlign: "right" }}>
                                        <div style={{ fontSize: 13, color: "#34D399" }}>{fmt(l.amount)}</div>
                                        <div style={{ fontSize: 11, color: "#FB923C", fontWeight: 600 }}>reserve: {fmt(Math.round(l.amount * 0.005))}</div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

            </div>
        </div>
    );
}
