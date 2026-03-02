import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export async function POST(req: Request) {
    try {
        const body = await req.json();

        // Input validation according to QA doc (Section 8)
        if (!body.customer || typeof body.customer !== "string" || body.customer.trim().length === 0) {
            return NextResponse.json({ error: "Customer name is required" }, { status: 400 });
        }
        if (body.customer.length > 100) {
            return NextResponse.json({ error: "Customer name too long (max 100 chars)" }, { status: 400 });
        }
        if (body.camera_count_est !== undefined) {
            if (typeof body.camera_count_est !== "number" || body.camera_count_est < 1) {
                return NextResponse.json({ error: "Camera count must be positive integer" }, { status: 400 });
            }
        }

        // Generate SO code securely using Postgres RPC atomic sequence to pass Load Test 3A
        const { data: codeData, error: rpcError } = await supabase.rpc("generate_transaction_code", { doc_prefix: "SO" });
        if (rpcError) {
            console.error("RPC Error:", rpcError);
            return NextResponse.json({ error: "Failed to generate sequence code" }, { status: 500 });
        }
        const newCode = codeData as string;

        // First, create the customer record (since QA says SO has customer_id)
        const { data: customerData, error: customerError } = await supabase
            .from("customers")
            .insert({
                name: body.customer,
                email: body.email,
                phone: body.phone,
                address: body.address || 'TBD',
                site_type: body.site_type || 'commercial'
            })
            .select("id")
            .single();

        if (customerError) {
            console.error("Customer Insert Error:", customerError);
            return NextResponse.json({ error: "Failed to create customer record" }, { status: 500 });
        }

        // Now create the Sales Order
        const { data: soData, error: soError } = await supabase
            .from("sales_orders")
            .insert({
                code: newCode,
                customer_id: customerData.id,
                sales_rep_id: body.sales_rep_id || null,
                order_type: body.order_type || 'installation',
                camera_count_est: body.camera_count_est || 0,
                requirements: body.requirements || '',
                status: 'inquiry'  // QA uses 'inquiry' as initial stage in Test 4A
            })
            .select("*")
            .single();

        if (soError) {
            console.error("SO Insert Error:", soError);
            return NextResponse.json({ error: "Failed to create sales order" }, { status: 500 });
        }

        return NextResponse.json({ success: true, code: newCode, data: soData }, { status: 201 });
    } catch (err) {
        return NextResponse.json({ error: "Invalid request payload" }, { status: 400 });
    }
}

export async function GET(req: Request) {
    const { searchParams } = new URL(req.url);
    const statusFilter = searchParams.get("status");

    let query = supabase.from("sales_orders").select(`
        *,
        customers ( name, email, phone, address, site_type ),
        users!sales_rep_id ( name, email )
     `).order("created_at", { ascending: false });

    if (statusFilter) {
        query = query.eq("status", statusFilter);
    }

    const { data, error } = await query;

    if (error) {
        console.error("GET SO Error:", error);
        return NextResponse.json({ error: "Failed to fetch orders" }, { status: 500 });
    }

    return NextResponse.json({ data }, { status: 200 });
}
