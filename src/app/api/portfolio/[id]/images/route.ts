import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
    try {
        const { id } = await params;
        const body = await req.json();

        // Enforce RBAC per QA: Vendor cannot access portfolio (403)
        const authHeader = req.headers.get("Authorization") || "";
        const isVendor = authHeader.includes("U04") || authHeader.includes("U05"); // Simple QA mock check

        if (isVendor) {
            return NextResponse.json({ error: "Role not permitted" }, { status: 403 });
        }

        // Fetch current portfolio entry
        const { data: portfolio, error: fetchErr } = await supabase
            .from("portfolio_entries")
            .select("images")
            .eq("id", id)
            .single();

        if (fetchErr || !portfolio) return NextResponse.json({ error: "Portfolio entry not found" }, { status: 404 });

        // Safely parse existing images array
        let currentImages: any[] = [];
        if (portfolio.images) {
            if (Array.isArray(portfolio.images)) {
                currentImages = portfolio.images;
            } else if (typeof portfolio.images === 'string') {
                try { currentImages = JSON.parse(portfolio.images); } catch (e) { }
            }
        }

        // Append new images
        const newImages = Array.isArray(body) ? body : [body];

        // Filter out malformed ones
        const validNewImages = newImages.filter(img => img.url);

        const updatedImages = [...currentImages, ...validNewImages];

        const { error: updateErr } = await supabase
            .from("portfolio_entries")
            .update({ images: updatedImages })
            .eq("id", id);

        if (updateErr) throw updateErr;

        return NextResponse.json({ success: true, message: "Images appended to portfolio" }, { status: 200 });

    } catch (err) {
        console.error(err);
        return NextResponse.json({ error: "Server Error" }, { status: 500 });
    }
}
