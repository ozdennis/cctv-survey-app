import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
    try {
        const { id } = await params;

        // 1. Fetch survey and line items
        const { data: survey, error: surveyError } = await supabase
            .from("vendor_surveys")
            .select("*, survey_line_items(*)")
            .eq("id", id)
            .single();

        if (surveyError || !survey) return NextResponse.json({ error: "Survey not found" }, { status: 404 });
        if (survey.status === 'finalized') return NextResponse.json({ error: "Already finalized" }, { status: 400 });

        // Generate Line Items JSON for invoice snapshots
        const vendorLineItems = survey.survey_line_items.map((li: any) => ({
            desc: li.description || "Item",
            qty: li.quantity || 1,
            unit: Number(li.unit_cost) || 0
        }));

        const itemsTotal = vendorLineItems.reduce((acc: number, li: any) => acc + (li.qty * li.unit), 0);
        const grandTotal = itemsTotal + (survey.include_cost ? Number(survey.survey_cost || 0) : 0);

        // 2. Generate Invoice Codes sequentially to prevent race conditions
        const { data: vCode } = await supabase.rpc("generate_transaction_code", { doc_prefix: "PI" });
        const { data: pCode } = await supabase.rpc("generate_transaction_code", { doc_prefix: "PI" });

        if (!vCode || !pCode) return NextResponse.json({ error: "Code generation failed" }, { status: 500 });

        // 3. Create Immutable Vendor Invoice Snapshot
        const { error: vInvError } = await supabase.from("proforma_invoices").insert({
            sales_order_id: survey.sales_order_id,
            survey_id: survey.id,
            code: vCode,
            invoice_type: "vendor",
            issued_by: survey.vendor_id,
            line_items: vendorLineItems,
            total_amount: grandTotal,
            subtotal: grandTotal,
            payment_terms: "50% DP / 50% completion",
            status: "issued"
        });
        if (vInvError) console.error("Vendor Invoice Error:", vInvError);

        // 4. Create Draft Platform Invoice for Cashier
        const { error: pInvError } = await supabase.from("proforma_invoices").insert({
            sales_order_id: survey.sales_order_id,
            survey_id: survey.id,
            code: pCode,
            invoice_type: "platform",
            issued_by: survey.vendor_id, // System generated nominally by vendor submission
            line_items: vendorLineItems, // Exact copy for Cashier to mutate
            total_amount: grandTotal,
            subtotal: grandTotal,
            payment_terms: "50% DP / 50% completion",
            status: "draft"
        });
        if (pInvError) console.error("Platform Invoice Error:", pInvError);

        // 5. Mark Survey as Finalized
        const { error: updateError } = await supabase
            .from("vendor_surveys")
            .update({
                status: "finalized",
                finalized: true,
                finalized_at: new Date().toISOString()
            })
            .eq("id", id);

        if (updateError) throw updateError;

        // Also update Sales Order status
        await supabase.from("sales_orders").update({ status: "finalized" }).eq("id", survey.sales_order_id);

        return NextResponse.json({ success: true, message: "Survey finalized & invoices generated" }, { status: 200 });

    } catch (err) {
        console.error(err);
        return NextResponse.json({ error: "Server Error" }, { status: 500 });
    }
}
