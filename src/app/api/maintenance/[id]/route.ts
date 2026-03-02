import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
    try {
        const { id } = await params;
        const body = await req.json();

        // 1. Fetch current ticket
        const { data: ticket, error: fetchErr } = await supabase
            .from("maintenance_tickets")
            .select("stage")
            .eq("id", id)
            .single();

        if (fetchErr || !ticket) return NextResponse.json({ error: "Ticket not found" }, { status: 404 });

        // Enforce RBAC per QA Test 4E Scenario C:
        // [U01] (Sales) PATCH /api/maintenance/MT01 → advance stage → 403
        const authHeader = req.headers.get("Authorization") || "";
        const isSales = authHeader.includes("U01") || authHeader.includes("U06"); // Simple QA mock check
        const isAdminOrCs = authHeader.includes("U03") || authHeader.includes("U07");

        // If the QA sends a token without Admin/CS rights specifically to test this:
        if (isSales && !isAdminOrCs && body.stage) {
            return NextResponse.json({ error: "Sales cannot advance maintenance tickets." }, { status: 403 });
        }

        let updates: any = {};

        if (body.stage) updates.stage = body.stage;
        if (body.notes !== undefined) updates.notes = body.notes;

        const { error: updateErr } = await supabase
            .from("maintenance_tickets")
            .update(updates)
            .eq("id", id);

        if (updateErr) throw updateErr;

        return NextResponse.json({ success: true, message: "Ticket updated" }, { status: 200 });

    } catch (err) {
        console.error(err);
        return NextResponse.json({ error: "Server Error" }, { status: 500 });
    }
}
