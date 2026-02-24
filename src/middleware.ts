import { type NextRequest, NextResponse } from "next/server";
import { updateSession } from "@/lib/supabase/middleware";

/**
 * RBAC Middleware
 *
 * 1. Refreshes the Supabase auth session (keeps cookies alive).
 * 2. Redirects unauthenticated users to /login.
 * 3. Checks the user's role from public.users and restricts access:
 *    - Admin  → can access everything
 *    - Biker  → can only access /biker/*
 *    - Department → can only access /department/*
 */
export async function middleware(request: NextRequest) {
    const { supabase, user, supabaseResponse } = await updateSession(request);

    const pathname = request.nextUrl.pathname;

    // ── Protected route prefixes ──
    const protectedPrefixes = ["/admin", "/biker", "/department"];
    const publicPaths = ["/login", "/setup", "/api/setup-admin"];
    const isProtected =
        protectedPrefixes.some((prefix) => pathname.startsWith(prefix)) &&
        !publicPaths.some((p) => pathname.startsWith(p));

    // If the route is not protected, let it through
    if (!isProtected) {
        return supabaseResponse;
    }

    // ── Not authenticated → redirect to /login ──
    if (!user) {
        const loginUrl = request.nextUrl.clone();
        loginUrl.pathname = "/login";
        loginUrl.searchParams.set("redirect", pathname);
        return NextResponse.redirect(loginUrl);
    }

    // ── Fetch user role from public.users ──
    const { data: profile } = await supabase
        .from("users")
        .select("role")
        .eq("id", user.id)
        .single();

    // If no profile found in public.users, redirect to /login
    if (!profile?.role) {
        const loginUrl = request.nextUrl.clone();
        loginUrl.pathname = "/login";
        loginUrl.searchParams.set("error", "no_profile");
        return NextResponse.redirect(loginUrl);
    }
    const role = profile.role;

    // ── Role-based access control ──
    const roleRouteMap: Record<string, string> = {
        admin: "/admin",
        biker: "/biker",
        department: "/department",
    };

    // Admins can access everything
    if (role === "admin") {
        return supabaseResponse;
    }

    // Non-admins: check if they're accessing their own section
    const allowedPrefix = roleRouteMap[role];
    if (allowedPrefix && pathname.startsWith(allowedPrefix)) {
        return supabaseResponse;
    }

    // ── Unauthorized → redirect to their own dashboard ──
    const redirectUrl = request.nextUrl.clone();
    redirectUrl.pathname = allowedPrefix || "/login";
    return NextResponse.redirect(redirectUrl);
}

export const config = {
    matcher: [
        /*
         * Match all request paths except:
         * - _next/static (static files)
         * - _next/image (image optimization files)
         * - favicon.ico (favicon file)
         * - public folder assets
         */
        "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
    ],
};
