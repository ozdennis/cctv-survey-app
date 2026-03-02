import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
    return handleDPUpdate(req, (await params).id);
}

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
    return handleDPUpdate(req, (await params).id);
}

async function handleDPUpdate(req: Request, id: string) {
    try {
        const body = await req.json();

        let updatePayload: any = {};
        if (body.customer_dp_image_url !== undefined) {
            updatePayload.customer_dp_image_url = body.customer_dp_image_url;
        } else {
            return NextResponse.json({ error: "Missing customer_dp_image_url" }, { status: 400 });
        }

        const { error } = await supabase
            .from("work_orders")
            .update(updatePayload)
            .eq("id", id);

        if (error) throw error;

        return NextResponse.json({ success: true, message: "Customer DP Updated" }, { status: 200 });

    } catch (err) {
        console.error(err);
        return NextResponse.json({ error: "Server Error" }, { status: 500 });
    }
}
