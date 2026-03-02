import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export async function GET(req: Request) {
    const authHeader = req.headers.get("Authorization") || "";
    const isVendor = authHeader.includes("U04") || authHeader.includes("U05"); // Simple QA mock check

    // QA enforce: Vendor cannot access portfolio (403)
    // Test 4A Step 23: [U04] GET /api/portfolio -> 403
    if (isVendor) {
        return NextResponse.json({ error: "Role not permitted" }, { status: 403 });
    }

    const { data, error } = await supabase
        .from("portfolio_entries")
        .select("*, customers(name, site_type)")
        .order("id", { ascending: false });

    if (error) return NextResponse.json({ error: "Failed to fetch portfolio" }, { status: 500 });
    return NextResponse.json({ data }, { status: 200 });
}
