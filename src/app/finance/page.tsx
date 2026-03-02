"use client";

"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { ThemeToggle } from "@/components/ThemeToggle";
import SharedCalendar from "@/components/SharedCalendar";

// ─── INIT DATA ────────────────────────────────────────────────────────────────
const SEED_LEDGER: any[] = [];
const SEED_PROJECTS: any[] = [];

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

// (Computed items moved into component state)

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
            <div style={{ flex: 1, height: 4, background: "var(--portal-border)", borderRadius: 2, overflow: "hidden" }}>
                <div style={{ width: `${pct}%`, height: "100%", background: color, borderRadius: 2, transition: "width 0.6s ease" }} />
            </div>
            <span style={{ fontSize: 12, color, fontWeight: 700, width: 40, textAlign: "right" }}>{pct.toFixed(1)}%</span>
        </div>
    );
}

// ─── TABS ─────────────────────────────────────────────────────────────────────
const TABS = ["Overview", "Ledger", "Projects", "Material Claims", "Tax Reserve"];

export default function FinanceDashboard() {
    const [tab, setTab] = useState("Overview");
    const [catFilter, setCatFilter] = useState("all");
    const [accEmail, setAccEmail] = useState("");
    const [ledger, setLedger] = useState<any[]>([]);
    const [projects, setProjects] = useState<any[]>([]);
    const [claims, setClaims] = useState<any[]>([]);

    const fetchData = async () => {
        try {
            const lRes = await fetch("/api/finance/ledger");
            const lData = await lRes.json();
            if (lData.data) {
                setLedger(lData.data.map((l: any) => ({
                    id: l.code, date: l.transaction_date.slice(0, 10), code: l.related_code || "—",
                    customer: l.customer_id || "—", category: l.category, amount: Number(l.amount), description: l.description
                })));
            }

            const pRes = await fetch("/api/orders");
            const pData = await pRes.json();
            if (pData.data) {
                setProjects(pData.data.map((o: any) => {
                    const pi = o.proforma_invoices?.find((i: any) => i.invoice_type === 'platform');
                    const vi = o.proforma_invoices?.find((i: any) => i.invoice_type === 'vendor');
                    const rev = pi ? pi.line_items.reduce((s: number, i: any) => s + (i.qty * i.unit), 0) : 0;
                    const cogs = vi ? vi.line_items.reduce((s: number, i: any) => s + (i.qty * i.unit), 0) : 0;
                    return { code: o.code, customer: o.customers?.name || "Unknown", revenue: rev, cogs: cogs, status: o.status };
                }).filter((p: any) => p.revenue > 0 || p.cogs > 0));
            }

            // Material Claims (Mock fetch for now until API is built or Supabase fetch is done inline)
            try {
                const { data } = await supabase.from('material_invoices').select('*, work_order:work_orders(code, vendor_id, customers(name))').order('created_at', { ascending: false });
                if (data) setClaims(data);
            } catch (err) { }

        } catch (e) { console.error(e); }
    };

    useEffect(() => {
        supabase.auth.getUser().then(({ data }) => {
            if (data?.user?.email) setAccEmail(data.user.email);
        });
        fetchData();
    }, []);

    const getAvatar = (email: string) => {
        if (!email) return "US";
        const parts = email.split("@");
        const name = parts[0].trim();
        if (name.length === 0) return "US";
        if (name.length === 1) return name.toUpperCase();
        return (name[0] + name[name.length - 1]).toUpperCase();
    };

    const handleClaimAction = async (claimId: string, status: 'approved' | 'rejected') => {
        try {
            await supabase.from('material_invoices').update({ status }).eq('id', claimId);
            setClaims(cc => cc.map(c => c.id === claimId ? { ...c, status } : c));
            alert(`Claim ${status} successfully.`);
            fetchData(); // Refresh ledger in case of approval COGS insert
        } catch (e) {
            console.error(e);
            alert("Failed to update claim.");
        }
    };

    const filteredLedger = catFilter === "all" ? ledger : ledger.filter(l => l.category === catFilter);

    const totalRevenue = ledger.filter(l => l.category === "revenue").reduce((s, l) => s + l.amount, 0);
    const totalCOGS = ledger.filter(l => l.category === "cogs").reduce((s, l) => s + l.amount, 0);
    const totalOpex = ledger.filter(l => l.category === "opex").reduce((s, l) => s + l.amount, 0);
    const totalWithdrawal = ledger.filter(l => l.category === "withdrawal").reduce((s, l) => s + l.amount, 0);
    const grossMargin = totalRevenue - totalCOGS;
    const netIncome = grossMargin - totalOpex;
    const taxReserve = Math.round(totalRevenue * 0.005);

    return (
        <div style={{ minHeight: "100vh", background: "#05060A", fontFamily: "'DM Mono','Courier New',monospace", color: "var(--portal-text)" }}>
            <style>{`
        * { box-sizing:border-box; }
        ::-webkit-scrollbar{width:5px;height:5px}
        ::-webkit-scrollbar-track{background:#0d1117}
        ::-webkit-scrollbar-thumb{background:#1e293b;border-radius:3px}
        @media (max-width: 768px) {
            .mobile-grid { grid-template-columns: 1fr !important; }
            .mobile-grid-2 { grid-template-columns: 1fr 1fr !important; }
            .mobile-flex { flex-direction: column !important; align-items: stretch !important; gap: 12px; }
            .mobile-header-stack { flex-direction: column !important; align-items: flex-start !important; gap: 14px; }
            .ledger-row { grid-template-columns: 1fr !important; padding: 16px !important; gap: 6px; }
            .ledger-header { display: none !important; }
        }
      `}</style>

            {/* Header */}
            <div className="mobile-header-stack" style={{ background: "var(--portal-bg)", borderBottom: "1px solid #1E293B", padding: "18px 28px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
                    <div style={{ width: 36, height: 36, background: "linear-gradient(135deg,#F59E0B,#D97706)", borderRadius: 10, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18 }}>₿</div>
                    <div>
                        <div style={{ fontFamily: "Syne,sans-serif", fontWeight: 800, fontSize: 18, color: "#FEF3C7", letterSpacing: "-0.02em" }}>FINANCE<span style={{ color: "#F59E0B", marginLeft: 6 }}>// LEDGER</span></div>
                        <div style={{ fontSize: 10, color: "var(--portal-faint)", letterSpacing: "0.1em", marginTop: -2 }}>ENTERPRISE PORTAL</div>
                    </div>
                </div>
                <div className="mobile-flex" style={{ display: "flex", alignItems: "center", gap: 12 }}>
                    <ThemeToggle />
                    <div style={{ display: "flex", gap: 2, background: "var(--portal-border-dark)", padding: 3, borderRadius: 10, border: "1px solid #1E293B", overflowX: "auto" }}>
                        {TABS.map(t => (
                            <button key={t} onClick={() => setTab(t)} style={{
                                padding: "6px 14px", borderRadius: 8, border: "none", cursor: "pointer", fontSize: 11, fontWeight: 600,
                                background: tab === t ? "#F59E0B" : "transparent",
                                color: tab === t ? "#07090F" : "var(--portal-faint)",
                                transition: "all 0.15s", whiteSpace: "nowrap"
                            }}>{t}</button>
                        ))}
                    </div>
                    <div style={{ width: 36, height: 36, borderRadius: "50%", background: "var(--portal-border-dark)", border: `1px solid #F59E0B`, color: "#FEF3C7", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 13, fontWeight: 700, flexShrink: 0 }} title={accEmail}>
                        {getAvatar(accEmail)}
                    </div>
                </div>
            </div>

            <div style={{ padding: "24px 28px", maxWidth: 1100, margin: "0 auto" }}>

                {/* OVERVIEW */}
                {tab === "Overview" && (<>
                    {/* KPI Cards */}
                    <div className="mobile-grid-2" style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 12, marginBottom: 20 }}>
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
                    <div className="mobile-grid" style={{ display: "grid", gridTemplateColumns: "1.4fr 1fr", gap: 12, marginBottom: 20 }}>
                        <div style={{ background: "#0B0E18", border: "1px solid #1E293B", borderRadius: 12, padding: "20px 24px", overflow: "hidden" }}>
                            <div style={{ fontSize: 11, color: "var(--portal-muted-dark)", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 14 }}>Revenue Trend (YTD)</div>
                            <Sparkline data={SPARKLINE} color="#F59E0B" />
                            <div style={{ display: "flex", justifyContent: "space-between", marginTop: 6 }}>
                                {SPARKLINE.filter((_, i) => i % 2 === 0).map(d => (
                                    <span key={d.m} style={{ fontSize: 9, color: "var(--portal-faint)" }}>{d.m}</span>
                                ))}
                            </div>
                        </div>
                        <div style={{ background: "#0B0E18", border: "1px solid #1E293B", borderRadius: 12, padding: "20px 24px" }}>
                            <div style={{ fontSize: 11, color: "var(--portal-muted-dark)", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 14 }}>Chart of Accounts</div>
                            {[
                                { label: "Revenue", val: totalRevenue, color: "#34D399", pct: 100 },
                                { label: "COGS", val: totalCOGS, color: "#FCD34D", pct: (totalCOGS / totalRevenue) * 100 },
                                { label: "Op. Expense", val: totalOpex, color: "#F87171", pct: (totalOpex / totalRevenue) * 100 },
                                { label: "Withdrawal", val: totalWithdrawal, color: "#A78BFA", pct: (totalWithdrawal / totalRevenue) * 100 },
                                { label: "Tax Reserve", val: taxReserve, color: "#FB923C", pct: (taxReserve / totalRevenue) * 100 },
                            ].map(row => (
                                <div key={row.label} style={{ marginBottom: 12 }}>
                                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
                                        <span style={{ fontSize: 11, color: "var(--portal-muted)" }}>{row.label}</span>
                                        <span style={{ fontSize: 11, color: row.color, fontWeight: 600 }}>{fmtShort(row.val)}</span>
                                    </div>
                                    <MarginBar pct={row.pct} color={row.color} />
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Bottom summary */}
                    <div className="mobile-grid" style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 12 }}>
                        {[
                            { label: "Gross Margin %", val: `${((grossMargin / totalRevenue) * 100).toFixed(1)}%`, color: "#60A5FA", sub: "Revenue minus COGS" },
                            { label: "Tax Reserve", val: fmt(taxReserve), color: "#FB923C", sub: "0.5% of revenue — restricted" },
                            { label: "Withdrawals", val: fmt(totalWithdrawal), color: "#A78BFA", sub: "Owner draws this period" },
                        ].map(c => (
                            <div key={c.label} style={{ background: "#0B0E18", border: `1px solid ${c.color}22`, borderRadius: 12, padding: "16px 20px" }}>
                                <div style={{ fontSize: 10, color: `${c.color}88`, textTransform: "uppercase", letterSpacing: "0.07em", marginBottom: 8 }}>{c.label}</div>
                                <div style={{ fontFamily: "Syne,sans-serif", fontWeight: 800, fontSize: 22, color: c.color }}>{c.val}</div>
                                <div style={{ fontSize: 10, color: "var(--portal-faint)", marginTop: 4 }}>{c.sub}</div>
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
                                    padding: "5px 14px", borderRadius: 6, border: `1px solid ${active && c ? c.color + "44" : "var(--portal-border)"}`,
                                    background: active && c ? c.bg : "#0B0E18",
                                    color: active && c ? c.color : "var(--portal-faint)",
                                    fontSize: 11, fontWeight: 600, cursor: "pointer", textTransform: "uppercase", letterSpacing: "0.06em",
                                }}>{k === "all" ? "All" : c.label}</button>
                            );
                        })}
                    </div>
                    <div style={{ background: "#0B0E18", border: "1px solid #1E293B", borderRadius: 12, overflow: "hidden" }}>
                        <div style={{ display: "grid", gridTemplateColumns: "1.6fr 0.9fr 1fr 1.2fr 1fr", padding: "10px 16px", borderBottom: "1px solid #0F172A", background: "#060810" }}>
                            {["Code", "Date", "Category", "Description", "Amount"].map(h => (
                                <span key={h} style={{ fontSize: 10, color: "var(--portal-faint)", textTransform: "uppercase", letterSpacing: "0.08em" }}>{h}</span>
                            ))}
                        </div>
                        {filteredLedger.map((row, i) => {
                            const cat = CATS[row.category];
                            const taxR = row.category === "revenue" ? Math.round(row.amount * 0.005) : null;
                            return (
                                <div key={row.id} style={{
                                    display: "grid", gridTemplateColumns: "1.6fr 0.9fr 1fr 1.2fr 1fr",
                                    padding: "12px 16px", borderBottom: "1px solid #0F172A",
                                    background: i % 2 === 0 ? "transparent" : "var(--portal-bg)",
                                    alignItems: "center",
                                }}>
                                    <span style={{ fontFamily: "'Courier New',monospace", fontSize: 11, color: "var(--portal-faint)" }}>{row.id}</span>
                                    <span style={{ fontSize: 12, color: "var(--portal-muted-dark)" }}>{row.date.slice(5)}</span>
                                    <span style={{ background: cat.bg, color: cat.color, fontSize: 10, padding: "2px 8px", borderRadius: 4, fontWeight: 700, letterSpacing: "0.05em", display: "inline-block", textTransform: "uppercase", border: `1px solid ${cat.color}33` }}>{cat.label}</span>
                                    <span style={{ fontSize: 12, color: "var(--portal-muted)" }}>{row.description}</span>
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
                    <div className="mobile-grid" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                        {projects.map(p => {
                            const margin = p.revenue - p.cogs;
                            const pct = (margin / p.revenue) * 100;
                            const done = p.status === "completed";
                            return (
                                <div key={p.code} style={{ background: "#0B0E18", border: "1px solid #1E293B", borderRadius: 12, padding: "18px 20px" }}>
                                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 12 }}>
                                        <div>
                                            <div style={{ fontFamily: "'Courier New',monospace", fontSize: 11, color: "var(--portal-faint)", marginBottom: 3 }}>{p.code}</div>
                                            <div style={{ fontFamily: "Syne,sans-serif", fontWeight: 700, fontSize: 15, color: "var(--portal-text)" }}>{p.customer}</div>
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
                                                <div style={{ fontSize: 9, color: "var(--portal-faint)", textTransform: "uppercase", letterSpacing: "0.07em", marginBottom: 3 }}>{x.l}</div>
                                                <div style={{ fontSize: 13, color: x.c, fontWeight: 700 }}>{fmtShort(x.v)}</div>
                                            </div>
                                        ))}
                                    </div>
                                    <div style={{ fontSize: 10, color: "var(--portal-muted-dark)", marginBottom: 5 }}>Gross Margin</div>
                                    <MarginBar pct={pct} color={pct > 50 ? "#34D399" : pct > 35 ? "#FCD34D" : "#F87171"} />
                                </div>
                            );
                        })}
                    </div>
                )}

                {/* MATERIAL CLAIMS (Cashier Review) */}
                {tab === "Material Claims" && (
                    <div style={{ maxWidth: 800 }}>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
                            <div style={{ fontSize: 13, color: "var(--portal-text)", fontWeight: 600 }}>Vendor Reimbursements</div>
                            <div style={{ fontSize: 11, color: "var(--portal-faint)", background: "var(--portal-border)", padding: "4px 10px", borderRadius: 6 }}>Requires Review</div>
                        </div>

                        {claims.length === 0 ? (
                            <div style={{ textAlign: "center", padding: "40px", color: "var(--portal-faint)", border: "1px dashed #1E293B", borderRadius: 12 }}>No material claims pending.</div>
                        ) : (
                            claims.map(c => (
                                <div key={c.id} style={{ background: "#0B0E18", border: `1px solid ${c.status === 'pending' ? '#F59E0B' : 'var(--portal-border)'}`, borderRadius: 12, padding: "20px", marginBottom: 16 }}>
                                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 12 }}>
                                        <div>
                                            <div style={{ fontSize: 10, color: "var(--portal-faint)", fontFamily: "'Courier New',monospace", marginBottom: 4 }}>WO: {c.work_order?.code || "Unknown"}</div>
                                            <div style={{ fontSize: 15, fontWeight: 700, color: "var(--portal-text)" }}>{fmt(Number(c.total_amount))}</div>
                                        </div>
                                        <span style={{ fontSize: 10, fontWeight: 700, padding: "4px 10px", borderRadius: 6, textTransform: "uppercase", background: c.status === 'approved' ? '#052e16' : c.status === 'rejected' ? '#2d0a0a' : '#2d1f00', color: c.status === 'approved' ? '#34D399' : c.status === 'rejected' ? '#F87171' : '#FBBF24' }}>
                                            {c.status}
                                        </span>
                                    </div>
                                    <div style={{ fontSize: 12, color: "var(--portal-muted)", marginBottom: 16, lineHeight: 1.5 }}>
                                        {c.notes || "No description provided."}
                                    </div>
                                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", paddingTop: 16, borderTop: "1px solid #1E293B" }}>
                                        {c.receipt_photo_url ? (
                                            <a href={c.receipt_photo_url} target="_blank" style={{ fontSize: 12, color: "#60A5FA", textDecoration: "none", display: "flex", alignItems: "center", gap: 6 }}>
                                                <span>📎 View Receipt</span>
                                            </a>
                                        ) : <span style={{ fontSize: 11, color: "var(--portal-faint)" }}>No Receipt</span>}

                                        {c.status === 'pending' && (
                                            <div style={{ display: "flex", gap: 8 }}>
                                                <button onClick={() => handleClaimAction(c.id, 'rejected')} style={{ padding: "6px 14px", background: "transparent", border: "1px solid #F8717144", color: "#F87171", borderRadius: 6, fontSize: 11, cursor: "pointer", fontWeight: 600 }}>Reject</button>
                                                <button onClick={() => handleClaimAction(c.id, 'approved')} style={{ padding: "6px 14px", background: "#052e16", border: "1px solid #34D39944", color: "#34D399", borderRadius: 6, fontSize: 11, cursor: "pointer", fontWeight: 600 }}>Approve & Log COGS</button>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                )}

                {/* TAX RESERVE */}
                {tab === "Tax Reserve" && (
                    <div style={{ maxWidth: 560 }}>
                        <div style={{ background: "#150800", border: "1px solid #FB923C33", borderRadius: 14, padding: "28px 28px", marginBottom: 16 }}>
                            <div style={{ fontSize: 11, color: "#FB923C88", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 8 }}>Monthly Tax Reserve — RESTRICTED</div>
                            <div style={{ fontFamily: "Syne,sans-serif", fontWeight: 800, fontSize: 40, color: "#FB923C" }}>{fmt(taxReserve)}</div>
                            <div style={{ fontSize: 12, color: "var(--portal-faint)", marginTop: 6 }}>0.5% × {fmt(totalRevenue)} total revenue</div>
                            <div style={{ marginTop: 20, padding: "12px 16px", background: "#1a0a00", borderRadius: 8, border: "1px solid #FB923C22", fontSize: 12, color: "#B45309", lineHeight: 1.7 }}>
                                ⚠ This amount is reserved for tax obligations and must not be spent on operations, vendor payments, or owner withdrawals.
                            </div>
                        </div>
                        <div style={{ background: "#0B0E18", border: "1px solid #1E293B", borderRadius: 12, overflow: "hidden" }}>
                            <div style={{ padding: "12px 18px", borderBottom: "1px solid #0F172A", fontSize: 10, color: "var(--portal-faint)", textTransform: "uppercase", letterSpacing: "0.08em" }}>
                                Revenue Entries (Auto-calculated)
                            </div>
                            {ledger.filter(l => l.category === "revenue").map(l => (
                                <div key={l.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "12px 18px", borderBottom: "1px solid #0F172A" }}>
                                    <div>
                                        <div style={{ fontSize: 12, color: "var(--portal-text)", fontWeight: 600 }}>{l.customer}</div>
                                        <div style={{ fontSize: 10, color: "var(--portal-faint)" }}>{l.date} · {l.code}</div>
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
            <SharedCalendar />
        </div>
    );
}
