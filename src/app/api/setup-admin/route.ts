import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

/**
 * POST /api/setup-admin
 * One-time bootstrap: inserts the currently authenticated user into
 * public.users with role = 'admin'.
 * Blocked if an admin already exists to prevent privilege escalation.
 */
export async function POST() {
    const supabase = await createClient();

    // Must be logged in
    const {
        data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
        return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    // Block if any admin already exists
    const { data: existingAdmin } = await supabase
        .from("users")
        .select("id")
        .eq("role", "admin")
        .limit(1)
        .single();

    if (existingAdmin) {
        return NextResponse.json(
            { error: "An admin already exists. Setup is locked." },
            { status: 403 }
        );
    }

    // Upsert this user as admin
    const { error } = await supabase.from("users").upsert({
        id: user.id,
        email: user.email ?? "",
        role: "admin",
        full_name: user.user_metadata?.full_name ?? "Admin",
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
    });

    if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true });
}
