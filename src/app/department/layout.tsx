import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { Building2, ClipboardList, BarChart3 } from "lucide-react";
import HamburgerSidebar from "@/components/HamburgerSidebar";

export default async function DepartmentLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const supabase = await createClient();
    const {
        data: { user },
    } = await supabase.auth.getUser();

    if (!user) redirect("/login");

    // Fetch department name for display
    const { data: profile } = await supabase
        .from("users")
        .select("department_id, departments(name)")
        .eq("id", user.id)
        .single();

    const dept = profile?.departments as unknown as { name: string } | null;
    const departmentName = dept?.name ?? "Department";

    const navLinks = [
        { href: "/department", icon: <ClipboardList className="w-4 h-4" />, label: "Issues" },
        { href: "/department/analytics", icon: <BarChart3 className="w-4 h-4" />, label: "Analytics" },
    ];

    return (
        <div className="relative h-screen bg-slate-950 text-white">
            <HamburgerSidebar
                title={departmentName}
                titleIcon={<Building2 className="w-5 h-5" />}
                accentColor="text-violet-400"
                navLinks={navLinks}
                userEmail={user.email ?? ""}
            />
            {/* Offset for fixed top navbar — top: 56px = h-14 */}
            <main
                className="absolute inset-0 overflow-y-auto"
                style={{ top: "56px" }}
            >
                <div className="max-w-5xl mx-auto px-4 py-5 sm:px-8 sm:py-10">{children}</div>
            </main>
        </div>
    );
}
