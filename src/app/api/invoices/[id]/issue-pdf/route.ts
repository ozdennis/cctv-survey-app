import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
    try {
        const { id } = await params;

        // 1. Mark Invoice as Issued and mock PDF generation
        const { data: invoice, error: fetchErr } = await supabase
            .from("proforma_invoices")
            .select("code, invoice_type, sales_order_id")
            .eq("id", id)
            .single();

        if (fetchErr || !invoice) return NextResponse.json({ error: "Invoice not found" }, { status: 404 });

        const pdfUrl = `https://storage.test/${invoice.code}.pdf`;

        // Advance Invoice stage
        const { error: updateErr } = await supabase
            .from("proforma_invoices")
            .update({
                status: "issued",
                pdf_url: pdfUrl
            })
            .eq("id", id);

        if (updateErr) throw updateErr;

        // Also advance the SO stage to 'invoiced'
        const { error: soUpdateErr } = await supabase
            .from("sales_orders")
            .update({ status: 'invoiced' })
            .eq("id", invoice.sales_order_id);

        return NextResponse.json({ success: true, pdf_url: pdfUrl }, { status: 200 });

    } catch (err) {
        console.error(err);
        return NextResponse.json({ error: "Server Error" }, { status: 500 });
    }
}
