import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
    try {
        const { id } = await params;
        const body = await req.json();

        // Fetch current invoice
        const { data: invoice, error: fetchErr } = await supabase
            .from("proforma_invoices")
            .select("invoice_type, status")
            .eq("id", id)
            .single();

        if (fetchErr || !invoice) return NextResponse.json({ error: "Invoice not found" }, { status: 404 });

        // Enforce dual invoice isolation (Test 4D)
        if (invoice.invoice_type === "vendor") {
            return NextResponse.json({ error: "Vendor snapshots are immutable" }, { status: 403 });
        }
        if (invoice.status === "issued") {
            return NextResponse.json({ error: "Invoice already issued" }, { status: 403 });
        }

        let updates: any = {};

        if (body.line_items && Array.isArray(body.line_items)) {
            updates.line_items = body.line_items;
            // recompute subtotal and total
            const subtotal = body.line_items.reduce((acc: number, li: any) => acc + (li.qty * li.unit), 0);
            updates.subtotal = subtotal;
            updates.total_amount = subtotal; // assuming no tax for now or tax handled separately
        }

        if (body.payment_terms !== undefined) updates.payment_terms = body.payment_terms;

        const { error: updateErr } = await supabase
            .from("proforma_invoices")
            .update(updates)
            .eq("id", id);

        if (updateErr) throw updateErr;

        return NextResponse.json({ success: true, message: "Invoice updated" }, { status: 200 });

    } catch (err) {
        console.error(err);
        return NextResponse.json({ error: "Server Error" }, { status: 500 });
    }
}

export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    const { data, error } = await supabase
        .from("proforma_invoices")
        .select("*")
        .eq("id", id)
        .single();

    if (error) return NextResponse.json({ error: "Not found" }, { status: 404 });
    return NextResponse.json({ data }, { status: 200 });
}
