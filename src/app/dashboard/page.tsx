"use client";

import { Building, Factory, Home, Store, FileText } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

export default function DashboardPage() {
    const [counts, setCounts] = useState({ total: 0, warehouse: 0, residential: 0, shop: 0, factory: 0 });
    const [recent, setRecent] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const loadDashboard = async () => {
            const { data, error } = await supabase.from('projects').select('*').order('created_at', { ascending: false });
            if (data && !error) {
                let warehouse = 0, residential = 0, factory = 0, shop = 0;
                data.forEach(p => {
                    if (p.category === 'Warehouse') warehouse++;
                    else if (p.category === 'Residential') residential++;
                    else if (p.category === 'Factory') factory++;
                    else if (p.category === 'Shop') shop++;
                });
                setCounts({ total: data.length, warehouse, residential, factory, shop });
                setRecent(data.slice(0, 5));
            }
            setLoading(false);
        };
        loadDashboard();
    }, []);

    const stats = [
        { name: "Total Projects", value: counts.total, icon: Building, color: "text-blue-400", bg: "bg-blue-500/10" },
        { name: "Warehouse Surveys", value: counts.warehouse, icon: Factory, color: "text-orange-400", bg: "bg-orange-500/10" },
        { name: "Residential", value: counts.residential, icon: Home, color: "text-green-400", bg: "bg-green-500/10" },
        { name: "Shop", value: counts.shop, icon: Store, color: "text-purple-400", bg: "bg-purple-500/10" },
    ];

    return (
        <div className="max-w-6xl mx-auto space-y-8">
            <div>
                <h1 className="text-3xl font-bold text-white tracking-tight">Overview Dashboard</h1>
                <p className="mt-2 text-sm text-slate-400">Welcome back to the CCTV Project Survey Portal.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {stats.map((stat) => {
                    const Icon = stat.icon;
                    return (
                        <div key={stat.name} className="bg-slate-900 rounded-xl shadow-lg border border-slate-800 p-6 flex flex-col justify-between hover:border-slate-700 transition-colors">
                            <div className="flex items-center gap-4">
                                <div className={`p-3 rounded-lg ${stat.bg} ${stat.color}`}>
                                    <Icon className="w-6 h-6" />
                                </div>
                                <div>
                                    <p className="text-sm font-medium text-slate-400">{stat.name}</p>
                                    <p className="text-2xl font-semibold text-white">{loading ? "-" : stat.value}</p>
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>

            <div className="bg-slate-900 rounded-xl shadow-lg border border-slate-800 overflow-hidden">
                <div className="px-6 py-5 border-b border-slate-800 flex justify-between items-center bg-slate-900/50">
                    <h3 className="text-lg font-semibold text-white">Recent Surveys</h3>
                    <Link href="/dashboard/projects" className="text-sm font-medium text-primary hover:text-primary/80 hover:underline transition-colors">
                        View All
                    </Link>
                </div>
                {loading ? (
                    <div className="p-6 text-center text-slate-400 text-sm bg-slate-900">Loading recent surveys...</div>
                ) : recent.length === 0 ? (
                    <div className="p-6 text-center text-slate-400 text-sm bg-slate-900">
                        No recent surveys found. Click 'View All' to create one.
                    </div>
                ) : (
                    <div className="divide-y divide-slate-800">
                        {recent.map((curr) => (
                            <div key={curr.id} className="p-4 bg-slate-900 hover:bg-slate-800/50 transition-colors flex justify-between items-center">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center text-primary border border-slate-700">
                                        <FileText className="w-5 h-5" />
                                    </div>
                                    <div>
                                        <p className="text-sm font-medium text-white">{curr.client_name}</p>
                                        <p className="text-xs text-slate-400">{curr.category} - {new Date(curr.created_at).toLocaleDateString()}</p>
                                    </div>
                                </div>
                                <div>
                                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border bg-slate-800 text-slate-300 border-slate-700">
                                        {curr.status}
                                    </span>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
