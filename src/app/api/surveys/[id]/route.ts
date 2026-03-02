import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
    try {
        const { id } = await params;
        const body = await req.json();

        // 1. Fetch current survey to check editable_until and get old values for changelog
        const { data: currentSurvey, error: fetchError } = await supabase
            .from("vendor_surveys")
            .select("survey_cost, editable_until, status")
            .eq("id", id)
            .single();

        if (fetchError || !currentSurvey) {
            return NextResponse.json({ error: "Survey not found" }, { status: 404 });
        }

        if (currentSurvey.status === 'finalized') {
            return NextResponse.json({ error: "Survey is locked (finalized)" }, { status: 403 });
        }

        if (new Date(currentSurvey.editable_until) < new Date()) {
            return NextResponse.json({ error: "Edit window expired." }, { status: 403 });
        }

        // 2. Perform the update
        const updates: any = {};
        const changelogs = [];

        if (body.survey_cost !== undefined && body.survey_cost !== currentSurvey.survey_cost) {
            updates.survey_cost = body.survey_cost;
            changelogs.push({
                survey_id: id,
                changed_by: body.user_id, // Assuming caller passes their ID, or we extract from token
                field_name: "survey_cost",
                old_value: String(currentSurvey.survey_cost),
                new_value: String(body.survey_cost)
            });
        }

        // Apply updates if any
        if (Object.keys(updates).length > 0) {
            const { error: updateError } = await supabase
                .from("vendor_surveys")
                .update(updates)
                .eq("id", id);

            if (updateError) throw updateError;
        }

        // Insert changelogs
        if (changelogs.length > 0) {
            const { error: clError } = await supabase.from("survey_changelogs").insert(changelogs);
            if (clError) console.error("Changelog Error:", clError);
        }

        return NextResponse.json({ success: true, message: "Survey updated" }, { status: 200 });

    } catch (err) {
        console.error(err);
        return NextResponse.json({ error: "Server Error" }, { status: 500 });
    }
}

export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    const { data, error } = await supabase
        .from("vendor_surveys")
        .select(`
            *,
            survey_line_items (*)
        `)
        .eq("id", id)
        .single();

    if (error) return NextResponse.json({ error: "Not found" }, { status: 404 });
    return NextResponse.json({ data }, { status: 200 });
}
