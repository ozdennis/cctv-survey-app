import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export async function POST(req: Request) {
    try {
        const body = await req.json();

        if (!body.sales_order_id) return NextResponse.json({ error: "sales_order_id required" }, { status: 400 });
        if (!body.vendor_id) return NextResponse.json({ error: "vendor_id required" }, { status: 400 });

        // QA requirement: 0 line items -> 400: at least one camera required
        if (!body.line_items || !Array.isArray(body.line_items) || body.line_items.length === 0) {
            return NextResponse.json({ error: "At least one camera required" }, { status: 400 });
        }

        // Create survey with 72h edit window (stored as TIMESTAMPTZ)
        const d = new Date();
        d.setHours(d.getHours() + 72);

        const { data: surveyData, error: surveyError } = await supabase
            .from("vendor_surveys")
            .insert({
                sales_order_id: body.sales_order_id,
                vendor_id: body.vendor_id,
                site_map_url: body.site_map_url || null,
                survey_cost: body.survey_cost || 0,
                include_cost: body.include_cost !== false,
                status: 'draft',
                editable_until: d.toISOString()
            })
            .select("id")
            .single();

        if (surveyError) {
            console.error("Survey Insert Error:", surveyError);
            return NextResponse.json({ error: "Failed to create survey" }, { status: 500 });
        }

        const surveyId = surveyData.id;

        // Insert Line Items
        const lineItemsToInsert = body.line_items.map((item: any) => ({
            survey_id: surveyId,
            item_type: item.item_type || 'camera',
            description: item.description,
            quantity: item.quantity,
            unit_cost: item.unit_cost,
            placement: item.placement,
            mount_height: item.mount_height,
            fov_angle: item.fov_angle,
            power_method: item.power_method
        }));

        const { error: liError } = await supabase.from("survey_line_items").insert(lineItemsToInsert);
        if (liError) console.error("Line Items Insert Error:", liError);

        // Update Sales Order stage to 'survey_done' (Wait, QA Step 7 says SO becomes 'survey_done'?? 
        // Actually QA Step 7 doesn't explicitly name SO stage, just says Survey saved).

        return NextResponse.json({ success: true, id: surveyId }, { status: 201 });

    } catch (err) {
        console.error(err);
        return NextResponse.json({ error: "Invalid request payload" }, { status: 400 });
    }
}

export async function GET(req: Request) {
    const { searchParams } = new URL(req.url);
    const vendorFilter = searchParams.get("vendor_id");

    let query = supabase.from("vendor_surveys").select(`
        *,
        sales_orders ( code, customer_id, customers ( name, address ) )
     `).order("created_at", { ascending: false });

    if (vendorFilter) {
        query = query.eq("vendor_id", vendorFilter);
    }

    const { data, error } = await query;

    if (error) {
        console.error("GET Surveys Error:", error);
        return NextResponse.json({ error: "Failed to fetch surveys" }, { status: 500 });
    }

    return NextResponse.json({ data }, { status: 200 });
}
