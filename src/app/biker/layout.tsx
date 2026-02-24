import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { Bike, Home, Navigation, History, AlertTriangle, LogOut } from "lucide-react";

export default async function BikerLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const supabase = await createClient();
    const {
        data: { user },
    } = await supabase.auth.getUser();

    if (!user) redirect("/login");

    // Count urgent (high priority) issues for badge
    const { count: urgentCount } = await supabase
        .from("issues")
        .select("id", { count: "exact", head: true })
        .eq("assigned_biker_id", user.id)
        .eq("priority", "high")
        .neq("status", "resolved");

    return (
        <div className="flex h-screen bg-slate-950 text-white">
            {/* Sidebar */}
            <aside className="w-64 border-r border-white/10 bg-slate-900/50 flex flex-col">
                <div className="p-6 border-b border-white/10">
                    <h2 className="text-lg font-bold flex items-center gap-2">
                        <Bike className="w-5 h-5 text-emerald-400" />
                        Biker Panel
                    </h2>
                    <p className="text-xs text-slate-500 mt-1">{user.email}</p>
                </div>

                <nav className="flex-1 p-4 space-y-1">
                    <SidebarLink
                        href="/biker"
                        icon={<Home className="w-4 h-4" />}
                        label="Home"
                    />
                    <SidebarLink
                        href="/biker/areas"
                        icon={<Navigation className="w-4 h-4" />}
                        label="Areas"
                    />
                    <SidebarLink
                        href="/biker/history"
                        icon={<History className="w-4 h-4" />}
                        label="History"
                    />
                    <SidebarLink
                        href="/biker/important"
                        icon={<AlertTriangle className="w-4 h-4" />}
                        label="Important"
                        badge={urgentCount ?? 0}
                    />
                </nav>

                <div className="p-4 border-t border-white/10">
                    <form action="/auth/signout" method="post">
                        <button
                            type="submit"
                            className="flex items-center gap-2 text-sm text-slate-400 hover:text-white transition-colors w-full"
                        >
                            <LogOut className="w-4 h-4" />
                            Sign Out
                        </button>
                    </form>
                </div>
            </aside>

            {/* Main content */}
            <main className="flex-1 overflow-y-auto p-8">{children}</main>
        </div>
    );
}

function SidebarLink({
    href,
    icon,
    label,
    badge,
}: {
    href: string;
    icon: React.ReactNode;
    label: string;
    badge?: number;
}) {
    return (
        <Link
            href={href}
            className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-slate-300 hover:bg-white/5 hover:text-white transition-colors"
        >
            {icon}
            <span className="flex-1">{label}</span>
            {badge && badge > 0 ? (
                <span className="text-[10px] font-bold bg-red-500 text-white px-1.5 py-0.5 rounded-full min-w-[18px] text-center">
                    {badge}
                </span>
            ) : null}
        </Link>
    );
}
