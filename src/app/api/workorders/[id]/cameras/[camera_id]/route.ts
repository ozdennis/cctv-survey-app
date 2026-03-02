import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export async function POST(req: Request, { params }: { params: Promise<{ id: string, camera_id: string }> }) {
    try {
        const { id: workOrderId, camera_id } = await params;
        const cameraNumber = parseInt(camera_id);
        const body = await req.json();

        if (isNaN(cameraNumber)) return NextResponse.json({ error: "Invalid camera ID" }, { status: 400 });

        // Check if an entry already exists for this WO and camera_number
        const { data: existing, error: checkErr } = await supabase
            .from("wo_camera_uploads")
            .select("id")
            .eq("work_order_id", workOrderId)
            .eq("camera_number", cameraNumber)
            .maybeSingle();

        if (checkErr) throw checkErr;

        const payload = {
            work_order_id: workOrderId,
            camera_number: cameraNumber,
            photo_url: body.photo_url || null,
            zone_label: body.zone_label || `Camera ${cameraNumber}`,
            image_quality_ok: !!body.image_quality_ok,
            night_vision_ok: !!body.night_vision_ok,
            recording_ok: !!body.recording_ok,
            remote_access_ok: !!body.remote_access_ok,
            customer_demo_ok: !!body.customer_demo_ok
        };

        if (existing) {
            const { error: updateErr } = await supabase
                .from("wo_camera_uploads")
                .update(payload)
                .eq("id", existing.id);
            if (updateErr) throw updateErr;
        } else {
            const { error: insertErr } = await supabase
                .from("wo_camera_uploads")
                .insert([payload]);
            if (insertErr) throw insertErr;
        }

        return NextResponse.json({ success: true, message: "Camera data stored" }, { status: 200 });

    } catch (err) {
        console.error(err);
        return NextResponse.json({ error: "Server Error" }, { status: 500 });
    }
}
