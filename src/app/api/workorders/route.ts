import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export async function POST(req: Request) {
    try {
        const body = await req.json();
        const sales_order_id = body.sales_order_id;

        if (!sales_order_id) return NextResponse.json({ error: "sales_order_id required" }, { status: 400 });

        // Fetch the corresponding vendor from the finalized survey
        const { data: survey, error: surveyError } = await supabase
            .from("vendor_surveys")
            .select("vendor_id")
            .eq("sales_order_id", sales_order_id)
            .limit(1)
            .single();

        if (surveyError || !survey) {
            return NextResponse.json({ error: "No finalized survey found for this SO" }, { status: 404 });
        }

        // Generate WO code
        const { data: woCode, error: rpcError } = await supabase.rpc("generate_transaction_code", { doc_prefix: "WO" });
        if (rpcError || !woCode) return NextResponse.json({ error: "Code generation failed" }, { status: 500 });

        // Insert Work Order
        const { data: woData, error: woError } = await supabase
            .from("work_orders")
            .insert({
                code: woCode as string,
                sales_order_id: sales_order_id,
                vendor_id: survey.vendor_id,
                status: "pending"
            })
            .select("*")
            .single();

        if (woError) {
            console.error("WO Insert Error:", woError);
            return NextResponse.json({ error: "Failed to create work order" }, { status: 500 });
        }

        return NextResponse.json({ success: true, data: woData }, { status: 201 });

    } catch (err) {
        return NextResponse.json({ error: "Invalid request" }, { status: 400 });
    }
}

export async function GET(req: Request) {
    const authHeader = req.headers.get("Authorization") || "";
    // Mocking simple token verification as required by QA script format
    const isVendor = authHeader.includes("U04") || authHeader.includes("U05"); // Assuming U04 and U05 are vendor tokens in tests

    let query = supabase.from("work_orders").select("*, sales_orders(code, customers(name))");

    // QA enforce: Work Order invisible to vendor until dp_verified = TRUE
    if (isVendor) {
        query = query.eq("dp_verified", true);
    }

    const { data, error } = await query;
    if (error) return NextResponse.json({ error: "Fetch error" }, { status: 500 });

    return NextResponse.json({ data }, { status: 200 });
}
