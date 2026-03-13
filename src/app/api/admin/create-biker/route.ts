import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";

export async function POST(req: NextRequest) {
    // 1. Verify the caller is an authenticated admin
    const supabase = await createClient();
    const {
        data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { data: profile } = await supabase
        .from("users")
        .select("role")
        .eq("id", user.id)
        .single();

    if (profile?.role !== "admin") {
        return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // 2. Parse request body
    const { email, password, fullName, role } = await req.json();
    const assignedRole = role === "field_agent" ? "field_agent" : "biker";

    if (!email || !password || !fullName) {
        return NextResponse.json(
            { error: "email, password, and fullName are required" },
            { status: 400 }
        );
    }

    // 3. Create the user with the service-role admin client
    const adminSupabase = createAdminClient();
    const { data, error } = await adminSupabase.auth.admin.createUser({
        email,
        password,
        email_confirm: true,   // skip email confirmation
        user_metadata: {
            full_name: fullName,
            role: assignedRole,
        },
    });

    if (error) {
        return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json({ user: data.user }, { status: 201 });
}
