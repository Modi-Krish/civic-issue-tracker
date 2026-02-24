import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import {
    LayoutDashboard,
    MapPin,
    Users,
    Building2,
    LogOut,
    ClipboardList,
} from "lucide-react";

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

    return (
        <div className="flex h-screen bg-slate-950 text-white">
            {/* Sidebar */}
            <aside className="w-64 border-r border-white/10 bg-slate-900/50 flex flex-col">
                <div className="p-6 border-b border-white/10">
                    <h2 className="text-lg font-bold flex items-center gap-2">
                        <LayoutDashboard className="w-5 h-5 text-blue-400" />
                        Admin Panel
                    </h2>
                    <p className="text-xs text-slate-500 mt-1">{user.email}</p>
                </div>

                <nav className="flex-1 p-4 space-y-1">
                    <SidebarLink
                        href="/admin"
                        icon={<ClipboardList className="w-4 h-4" />}
                        label="Dashboard"
                    />
                    <SidebarLink
                        href="/admin/issues"
                        icon={<MapPin className="w-4 h-4" />}
                        label="Issues"
                    />
                    <SidebarLink
                        href="/admin/bikers"
                        icon={<Users className="w-4 h-4" />}
                        label="Bikers"
                    />
                    <SidebarLink
                        href="/admin/departments"
                        icon={<Building2 className="w-4 h-4" />}
                        label="Departments"
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
}: {
    href: string;
    icon: React.ReactNode;
    label: string;
}) {
    return (
        <Link
            href={href}
            className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-slate-300 hover:bg-white/5 hover:text-white transition-colors"
        >
            {icon}
            {label}
        </Link>
    );
}
