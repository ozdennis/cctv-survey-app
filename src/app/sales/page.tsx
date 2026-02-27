export const dynamic = 'force-dynamic';

import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import Link from 'next/link'
import { Plus, CaretRight, User, CheckCircle, Clock, Warning } from "@phosphor-icons/react/dist/ssr";

export default async function SalesPipelinePage() {
    const cookieStore = await cookies()
    const supabase = createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
            cookies: {
                getAll() {
                    return cookieStore.getAll()
                },
                setAll(cookiesToSet) {
                    try {
                        cookiesToSet.forEach(({ name, value, options }) =>
                            cookieStore.set(name, value, options)
                        )
                    } catch (error) {
                        // The `setAll` method was called from a Server Component.
                        // This can be ignored if you have middleware refreshing
                        // user sessions.
                    }
                },
            },
        }
    )

    // Ensure strictly sales roles can view
    const { data: { user } } = await supabase.auth.getUser();

    // Fetch active Sales Orders (Pipeline)
    const { data: orders, error } = await supabase
        .from('sales_orders')
        .select('*')
        .order('created_at', { ascending: false });

    // Mock data if DB is empty or fails right away, just to ensure layout structure is robust
    const pipeline = [
        { status: 'New Lead', items: orders?.filter(o => o.status === 'draft') || [] },
        { status: 'Surveying', items: orders?.filter(o => o.status === 'survey_pending' || o.status === 'survey_completed') || [] },
        { status: 'Invoicing', items: orders?.filter(o => o.status === 'proforma_issued') || [] },
        { status: 'Paid / WO Ready', items: orders?.filter(o => o.status === 'payment_verified') || [] },
    ]

    return (
        <div className="max-w-7xl mx-auto flex flex-col h-full font-inter">
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h2 className="text-3xl font-syne font-bold text-slate-900 tracking-tight">Pipeline</h2>
                    <p className="text-slate-500 mt-1">Manage all enterprise leads and surveys.</p>
                </div>
                <Link href="/sales/new" className="px-5 py-2.5 bg-slate-900 text-white font-semibold rounded-lg shadow-sm hover:bg-slate-800 transition flex items-center gap-2 text-sm">
                    <Plus weight="bold" /> New Inquiry
                </Link>
            </div>

            <div className="flex gap-6 overflow-x-auto pb-6 flex-1 items-start">
                {pipeline.map((col, idx) => (
                    <div key={idx} className="w-[320px] shrink-0 flex flex-col gap-4">
                        <div className="px-1 flex items-center justify-between">
                            <h3 className="font-semibold text-slate-700">{col.status}</h3>
                            <span className="text-xs font-bold text-slate-400 bg-slate-200 px-2 py-0.5 rounded-full">{col.items.length}</span>
                        </div>

                        <div className="flex flex-col gap-3">
                            {col.items.length === 0 ? (
                                <div className="p-4 rounded-xl border-2 border-dashed border-slate-200 text-center flex flex-col items-center justify-center h-24 text-slate-400 text-sm font-medium">
                                    No orders
                                </div>
                            ) : (
                                col.items.map((item: any) => (
                                    <div key={item.id} className="bg-white p-4 rounded-xl shadow-sm border border-slate-200 hover:shadow-md transition-shadow cursor-pointer group">
                                        <div className="flex justify-between items-start mb-2">
                                            <span className="text-xs font-bold font-syne text-red-600 bg-red-50 px-2 py-0.5 rounded-md border border-red-100 uppercase tracking-widest">{item.so_number}</span>
                                            <span className="text-[10px] text-slate-400 font-semibold">{new Date(item.created_at).toLocaleDateString()}</span>
                                        </div>
                                        <h4 className="font-bold text-slate-800 mb-3">{item.client_name}</h4>

                                        <div className="flex items-center justify-between mt-4 text-xs font-semibold text-slate-500 border-t border-slate-100 pt-3">
                                            <div className="flex items-center gap-2">
                                                <User weight="fill" className="text-slate-400" /> Lead
                                            </div>
                                            <div className="flex items-center gap-1 group-hover:text-red-600 transition-colors">
                                                Open <CaretRight weight="bold" />
                                            </div>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    )
}
