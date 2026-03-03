export const dynamic = 'force-dynamic';


import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import Link from 'next/link'
import { CaretLeft, CheckCircle, Clock, FilePdf, Warning, Wrench } from "@phosphor-icons/react/dist/ssr";

export default async function SalesOrderDetailPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
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
                    } catch (error) { }
                },
            },
        }
    )

    const { data: { user } } = await supabase.auth.getUser();

    // Fetch SO details
    const { data: order, error } = await supabase
        .from('sales_orders')
        .select(`
            *,
            vendor_surveys (id, schedule_date, estimated_survey_cost, finalized),
            proforma_invoices (id, code, status, total_amount, down_payment_required),
            work_orders (id, code, status)
        `)
        .eq('id', id)
        .single();

    if (error || !order) {
        console.error("Sales Order Fetch Error:", error);
        return <div className="p-8 text-red-500 font-bold">Sales Order not found.</div>
    }

    const isPaid = order.proforma_invoices?.[0]?.status === 'Paid Full' || order.proforma_invoices?.[0]?.status === 'Paid Partial';
    const hasWorkOrder = order.work_orders && order.work_orders.length > 0;

    return (
        <div className="max-w-4xl mx-auto font-syne dark:text-foreground">
            <Link href="/sales" className="inline-flex items-center gap-2 text-sm font-bold text-muted-foreground hover:text-accent mb-8 transition-colors">
                <CaretLeft weight="bold" /> Back to Pipeline
            </Link>

            <div className="bg-card rounded-2xl shadow-sm border border-border overflow-hidden mb-8">
                {/* Header */}
                <div className="p-8 border-b border-border flex justify-between items-start bg-slate-950 dark:bg-black text-white">
                    <div>
                        <div className="flex items-center gap-3 mb-2">
                            <h2 className="text-3xl font-syne font-bold">{order.code}</h2>
                            <span className="px-3 py-1 bg-red-600/20 text-red-400 text-xs font-bold rounded-full uppercase tracking-widest">{order.status}</span>
                        </div>
                        <p className="text-slate-300 font-medium text-lg">{order.customer_name || 'Client Name'}</p>
                    </div>
                </div>

                {/* Details Grid */}
                <div className="p-8 grid md:grid-cols-2 gap-8">
                    <div>
                        <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-3">Client Details</h4>
                        <div className="space-y-2 text-sm font-medium text-slate-800">
                            <p className="flex justify-between items-center"><span className="text-slate-500">Type:</span> {order.site_type}</p>
                            <p className="flex justify-between items-center"><span className="text-slate-500">Phone:</span> {order.customer_phone || '-'}</p>
                            <p className="flex justify-between items-center"><span className="text-slate-500">Address:</span> {order.customer_address || '-'}</p>
                        </div>
                    </div>

                    <div>
                        <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-3">Survey Status</h4>
                        {order.vendor_surveys?.[0] ? (
                            <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 text-sm font-medium">
                                <p className="mb-2 flex items-center gap-2 text-emerald-600">
                                    <CheckCircle weight="fill" /> Survey Scheduled
                                </p>
                                <p className="text-slate-500 mb-1">Date: {new Date(order.vendor_surveys[0].schedule_date).toLocaleDateString()}</p>
                                <p className="text-slate-500">Finalized: {order.vendor_surveys[0].finalized ? 'Yes' : 'No'}</p>
                            </div>
                        ) : (
                            <div className="p-4 bg-amber-50 rounded-xl border border-amber-200 text-sm font-medium text-amber-700 flex items-center gap-2">
                                <Warning weight="fill" /> No Vendor Survey Assigned
                            </div>
                        )}
                    </div>
                </div>

                {/* Automation & Action Footer */}
                <div className="p-8 bg-slate-50 border-t border-slate-200">
                    <h4 className="text-sm font-bold text-slate-800 mb-4 flex items-center gap-2"><Clock /> Lifecycle Actions</h4>

                    <div className="flex flex-wrap gap-4">
                        {!order.vendor_surveys?.[0] && (
                            <button className="px-5 py-2.5 bg-white border shadow-sm border-slate-300 rounded-lg text-sm font-bold text-slate-700 hover:bg-slate-50 transition">
                                Request Vendor Survey
                            </button>
                        )}

                        {order.vendor_surveys?.[0]?.finalized && !order.proforma_invoices?.[0] && (
                            <button className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white shadow-sm rounded-lg text-sm font-bold transition flex items-center gap-2">
                                <FilePdf weight="fill" /> Generate Proforma Invoice
                            </button>
                        )}

                        {isPaid && !hasWorkOrder && (
                            <form action="/api/actions/create-work-order" method="POST">
                                <input type="hidden" name="sales_order_id" value={order.id} />
                                <button type="submit" className="px-5 py-2.5 bg-red-600 hover:bg-red-700 text-white shadow-sm rounded-lg text-sm font-bold transition flex items-center gap-2">
                                    <Wrench weight="fill" /> Queue Execution Work Order
                                </button>
                            </form>
                        )}

                        {hasWorkOrder && (
                            <div className="px-5 py-2.5 bg-emerald-100 text-emerald-700 border border-emerald-200 rounded-lg text-sm font-bold flex items-center gap-2">
                                <CheckCircle weight="fill" /> Work Order Dispatched: {order.work_orders[0].code}
                            </div>
                        )}
                    </div>

                    {order.proforma_invoices?.[0] && !isPaid && (
                        <p className="mt-4 text-xs font-semibold text-amber-600 flex items-center gap-1">
                            * Work Orders are gated until Finance verifies DP payment on invoice {order.proforma_invoices[0].code}.
                        </p>
                    )}
                </div>
            </div>
        </div>
    )
}
