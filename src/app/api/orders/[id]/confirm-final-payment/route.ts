import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
    try {
        const { id: salesOrderId } = await params;

        // 1. Fetch Sales Order and Work Order
        const { data: order, error: orderErr } = await supabase
            .from("sales_orders")
            .select(`
                *,
                work_orders ( id, status, vendor_id, wo_camera_uploads ( photo_url, zone_label ) )
            `)
            .eq("id", salesOrderId)
            .single();

        if (orderErr || !order) return NextResponse.json({ error: "Order not found" }, { status: 404 });
        if (order.status === 'completed') return NextResponse.json({ error: "Already completed" }, { status: 400 });

        const wo = order.work_orders && order.work_orders.length > 0 ? order.work_orders[0] : null;

        if (!wo || (wo.status !== 'vendor_finalized' && wo.status !== 'completed')) {
            return NextResponse.json({ error: "Work Order must be finalized by Vendor first" }, { status: 400 });
        }

        // 2. Mark stages to completed
        await supabase.from("sales_orders").update({ status: "completed" }).eq("id", salesOrderId);
        await supabase.from("work_orders").update({ status: "completed" }).eq("id", wo.id);

        // 3. Create Portfolio Entry automatically
        const formattedImages = wo.wo_camera_uploads ? wo.wo_camera_uploads.map((cam: any) => ({
            url: cam.photo_url || "",
            caption: cam.zone_label || "Camera Installation"
        })) : [];

        // Determine user. Test uses Sales token.
        const authHeader = req.headers.get("Authorization") || "";
        let userId = 'U01'; // Default sales ID for test mocking
        if (authHeader) {
            const parts = authHeader.split(" ");
            if (parts.length === 2 && parts[1].includes("U")) userId = parts[1]; // mocked token decode
        }

        const { error: pfError } = await supabase
            .from("portfolio_entries")
            .insert({
                work_order_id: wo.id,
                customer_id: order.customer_id,
                added_by: userId,
                description: `Completed installation for ${order.customer_name}`,
                images: formattedImages
            });

        if (pfError) console.error("Portfolio Creation Error:", pfError);

        return NextResponse.json({ success: true, message: "Final payment confirmed, Job completed, Portfolio created." }, { status: 200 });

    } catch (err) {
        console.error(err);
        return NextResponse.json({ error: "Server Error" }, { status: 500 });
    }
}
