import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function POST(req: NextRequest) {
    // 1. Authenticate caller — must be a department user or admin
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { data: profile } = await supabase
        .from("users")
        .select("role, department_id")
        .eq("id", user.id)
        .single();

    if (profile?.role !== "department" && profile?.role !== "admin") {
        return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // 2. Parse body
    const { issueId } = await req.json();
    if (!issueId) {
        return NextResponse.json({ error: "issueId is required" }, { status: 400 });
    }

    // 3. Load the issue to verify ownership
    const { data: issue, error: issueErr } = await supabase
        .from("issues")
        .select("id, title, status, department_id, reported_by")
        .eq("id", issueId)
        .single();

    if (issueErr || !issue) {
        return NextResponse.json({ error: "Issue not found" }, { status: 404 });
    }

    // Department users can only solve issues for their own department
    if (profile.role === "department" && issue.department_id !== profile.department_id) {
        return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    if (issue.status === "resolved") {
        return NextResponse.json({ error: "Issue is already resolved" }, { status: 400 });
    }

    // 4. Update the issue to resolved using the authenticated client
    //    (RLS policy must allow department users to update their department's issues)
    const { error: updateErr } = await supabase
        .from("issues")
        .update({
            status: "resolved",
            resolved_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
        })
        .eq("id", issueId);

    if (updateErr) {
        return NextResponse.json({ error: updateErr.message }, { status: 500 });
    }

    return NextResponse.json({ success: true }, { status: 200 });
}
