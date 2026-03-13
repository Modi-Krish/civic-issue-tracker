import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { Bike, Home, Navigation, History, AlertTriangle } from "lucide-react";
import HamburgerSidebar from "@/components/HamburgerSidebar";

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

    // Count urgent (high priority) issues for badge — assigned OR reported
    const { count: assignedUrgent } = await supabase
        .from("issues")
        .select("id", { count: "exact", head: true })
        .eq("assigned_biker_id", user.id)
        .eq("priority", "high")
        .neq("status", "resolved");

    const { count: reportedUrgent } = await supabase
        .from("issues")
        .select("id", { count: "exact", head: true })
        .eq("reported_by", user.id)
        .eq("priority", "high")
        .neq("status", "resolved");

    // Use the higher count (not additive since there could be overlap)
    const urgentCount = Math.max(assignedUrgent ?? 0, reportedUrgent ?? 0);

    const navLinks = [
        { href: "/biker", icon: <Home className="w-4 h-4" />, label: "Home" },
        { href: "/biker/areas", icon: <Navigation className="w-4 h-4" />, label: "Areas" },
        { href: "/biker/history", icon: <History className="w-4 h-4" />, label: "History" },
        {
            href: "/biker/important",
            icon: <AlertTriangle className="w-4 h-4" />,
            label: "Important",
            badge: urgentCount,
        },
    ];

    return (
        <div className="relative h-screen bg-slate-950 text-white">
            <HamburgerSidebar
                title="Biker Panel"
                titleIcon={<Bike className="w-5 h-5" />}
                accentColor="text-emerald-400"
                navLinks={navLinks}
                userEmail={user.email ?? ""}
            />
            {/* Offset for fixed top navbar — top: 56px = h-14 */}
            <main
                className="absolute inset-0 overflow-y-auto"
                style={{ top: "56px" }}
            >
                <div className="max-w-[1200px] mx-auto px-4 py-5 sm:px-8 sm:py-10">{children}</div>
            </main>
        </div>
    );
}
