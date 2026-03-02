import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export async function POST(req: Request) {
    try {
        const body = await req.json();

        // Fetch MW Seq
        const { data: codeData } = await supabase.rpc("generate_transaction_code", { doc_prefix: "MW" });
        const newCode = codeData || `MW-TEST-${Date.now()}`;

        // Get user for created_by
        const authHeader = req.headers.get("Authorization") || "";
        let userId = 'U03'; // mock default CS user
        if (authHeader) {
            const parts = authHeader.split(" ");
            if (parts.length === 2 && parts[1].includes("U")) userId = parts[1];
        }

        const payload = {
            code: newCode,
            type: body.type || 'maintenance',
            customer_id: body.customer_id || null,
            contact: body.contact || 'Customer',
            phone: body.phone || '',
            linked_so_id: body.linked_so_id || null,
            issue: body.issue || '',
            stage: 'open',
            notes: body.notes || '',
            created_by: userId
        };

        const { data: mtData, error: mtError } = await supabase
            .from("maintenance_tickets")
            .insert(payload)
            .select("*")
            .single();

        if (mtError) {
            console.error("Maintenance Ticket Error:", mtError);
            return NextResponse.json({ error: "Failed to create ticket" }, { status: 500 });
        }

        return NextResponse.json({ success: true, data: mtData }, { status: 201 });

    } catch (err) {
        console.error(err);
        return NextResponse.json({ error: "Invalid request payload" }, { status: 400 });
    }
}

export async function GET(req: Request) {
    const { data, error } = await supabase
        .from("maintenance_tickets")
        .select("*, customers(name), sales_orders(code)")
        .order("id", { ascending: false });

    if (error) return NextResponse.json({ error: "Failed to fetch tickets" }, { status: 500 });
    return NextResponse.json({ data }, { status: 200 });
}
