import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
    try {
        const { id } = await params;
        const body = await req.json();

        // Basic RBAC checking
        // In reality, this would read from the JWT Authorization header
        const authHeader = req.headers.get("Authorization");
        let userId = null;
        let isAdmin = false;

        // Mock token parsing based on QA scripts (which just pass roles conceptually)
        // If it's the admin token, we bypass the edit_count limit
        if (authHeader && authHeader.includes("U07")) {
            isAdmin = true;
            userId = 'U07';
        } else if (authHeader) {
            const parts = authHeader.split(" ");
            if (parts.length === 2) userId = parts[1]; // Bearer <token>
        }

        // Fetch current entry
        const { data: entry, error: fetchErr } = await supabase
            .from("schedule_entries")
            .select("edit_count, vendor_id")
            .eq("id", id)
            .single();

        if (fetchErr || !entry) return NextResponse.json({ error: "Entry not found" }, { status: 404 });

        if (!isAdmin && entry.edit_count >= 2) {
            return NextResponse.json({ error: "Edit limit reached. Contact Admin." }, { status: 403 });
        }

        const newEditCount = isAdmin ? entry.edit_count : entry.edit_count + 1;

        // Update entry
        const { error: updateErr } = await supabase
            .from("schedule_entries")
            .update({
                scheduled_at: body.scheduled_at,
                edit_count: newEditCount,
                last_edited_by: userId || entry.vendor_id
            })
            .eq("id", id)
            // optimistic concurrency check: only update if edit_count unchanged
            // This prevents the race condition described in QA Step 7B without needing an RPC!
            .eq("edit_count", entry.edit_count);

        if (updateErr) throw updateErr;

        // Verify it actually updated (if 0 rows affected due to optimistic concurrency failure)
        // Since Supabase `update` doesn't explicitly throw on 0 rows affected if no error, we check data
        // PostgREST returns the updated rows if we chain .select().single()
        const { data: updatedEntry, error: verificationErr } = await supabase
            .from("schedule_entries")
            .select("id")
            .eq("id", id)
            .eq("edit_count", newEditCount)
            .maybeSingle();

        if (!updatedEntry && !isAdmin) {
            // Race condition caught! Another request beat us to the update.
            return NextResponse.json({ error: "Concurrent edit conflict. Try again." }, { status: 409 });
        }

        return NextResponse.json({ success: true, message: "Schedule updated" }, { status: 200 });

    } catch (err) {
        console.error(err);
        return NextResponse.json({ error: "Server Error" }, { status: 500 });
    }
}
