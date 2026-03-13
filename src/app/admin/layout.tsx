import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import {
    LayoutDashboard,
    MapPin,
    Users,
    Building2,
    ClipboardList,
} from "lucide-react";
import HamburgerSidebar from "@/components/HamburgerSidebar";

export default async function AdminLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const supabase = await createClient();
    const {
        data: { user },
    } = await supabase.auth.getUser();

    if (!user) redirect("/login");

    const navLinks = [
        { href: "/admin", icon: <ClipboardList className="w-4 h-4" />, label: "Dashboard" },
        { href: "/admin/issues", icon: <MapPin className="w-4 h-4" />, label: "Issues" },
        { href: "/admin/bikers", icon: <Users className="w-4 h-4" />, label: "Bikers" },
        { href: "/admin/departments", icon: <Building2 className="w-4 h-4" />, label: "Departments" },
    ];

    return (
        <div className="relative h-screen text-white overflow-hidden" style={{ background: "linear-gradient(135deg, #050508 0%, #0a0e17 40%, #060a12 100%)" }}>
            {/* Ambient Glow Orbs */}
            <div className="glow-orb glow-orb-blue hidden sm:block" style={{ top: "-15%", left: "-8%", width: "55%", height: "55%" }} />
            <div className="glow-orb glow-orb-emerald hidden sm:block" style={{ bottom: "-12%", right: "-8%", width: "45%", height: "45%" }} />
            <div className="glow-orb glow-orb-purple hidden sm:block" style={{ top: "40%", right: "10%", width: "30%", height: "30%", opacity: 0.3 }} />

            <HamburgerSidebar
                title="Admin Panel"
                titleIcon={<LayoutDashboard className="w-5 h-5" />}
                accentColor="text-blue-400"
                navLinks={navLinks}
                userEmail={user.email ?? ""}
            />
            {/* Offset for fixed top navbar — top: 56px = h-14 */}
            <main
                className="absolute inset-0 overflow-y-auto"
                style={{ top: "56px", zIndex: 1 }}
            >
                <div className="max-w-[1300px] mx-auto px-4 py-5 sm:px-8 sm:py-8">{children}</div>
            </main>
        </div>
    );
}
