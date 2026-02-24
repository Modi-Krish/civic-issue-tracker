import { createClient } from "@/lib/supabase/server";
import {
    AlertTriangle,
    CheckCircle2,
    Clock,
    TrendingUp,
    MapPin,
    ArrowRight,
} from "lucide-react";
import AdminMapView from "@/components/admin/AdminMapView";
import Link from "next/link";

export default async function AdminDashboard() {
    const supabase = await createClient();

    // Fetch basic stats
    const { count: totalIssues } = await supabase
        .from("issues")
        .select("*", { count: "exact", head: true });

    const { count: pendingIssues } = await supabase
        .from("issues")
        .select("*", { count: "exact", head: true })
        .eq("status", "pending");

    const { count: resolvedIssues } = await supabase
        .from("issues")
        .select("*", { count: "exact", head: true })
        .eq("status", "resolved");

    const { count: highPriority } = await supabase
        .from("issues")
        .select("*", { count: "exact", head: true })
        .eq("priority", "high");

    // Fetch recent issues including department data
    const { data: recentIssues } = await supabase
        .from("issues")
        .select(`
            *,
            departments(name)
        `)
        .order("created_at", { ascending: false })
        .limit(5);

    // Fetch all issues for the map
    const { data: allIssues } = await supabase
        .from("issues")
        .select("id, lat, lng, title, priority, status");

    return (
        <div className="max-w-7xl mx-auto">
            <div className="flex items-center justify-between mb-8">
                <h1 className="text-3xl font-bold">Admin Dashboard</h1>
                <Link
                    href="/admin/issues"
                    className="flex items-center gap-2 text-sm text-blue-400 hover:text-blue-300 transition-colors"
                >
                    View all issues <ArrowRight className="w-4 h-4" />
                </Link>
            </div>

            {/* Stat Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
                <StatCard
                    icon={<TrendingUp className="w-5 h-5 text-blue-400" />}
                    label="Total Issues"
                    value={totalIssues ?? 0}
                    color="blue"
                />
                <StatCard
                    icon={<Clock className="w-5 h-5 text-amber-400" />}
                    label="Pending"
                    value={pendingIssues ?? 0}
                    color="amber"
                />
                <StatCard
                    icon={<CheckCircle2 className="w-5 h-5 text-emerald-400" />}
                    label="Resolved"
                    value={resolvedIssues ?? 0}
                    color="emerald"
                />
                <StatCard
                    icon={<AlertTriangle className="w-5 h-5 text-red-400" />}
                    label="High Priority"
                    value={highPriority ?? 0}
                    color="red"
                />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 h-[600px]">
                {/* Recent Issues List */}
                <div className="rounded-2xl border border-white/10 bg-white/5 p-6 flex flex-col">
                    <h2 className="text-lg font-semibold mb-6 flex items-center gap-2">
                        Recent Issues
                    </h2>
                    <div className="flex-1 overflow-y-auto space-y-4 pr-2 custom-scrollbar">
                        {recentIssues?.map((issue) => (
                            <div
                                key={issue.id}
                                className="p-4 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 transition-colors"
                            >
                                <div className="flex justify-between items-start mb-2">
                                    <h3 className="font-medium text-slate-200 line-clamp-1">
                                        {issue.title}
                                    </h3>
                                    <span className={`px-2 py-0.5 rounded-full text-[10px] uppercase tracking-wider font-bold ${issue.priority === 'high' ? 'bg-red-500/20 text-red-400' :
                                        issue.priority === 'medium' ? 'bg-amber-500/20 text-amber-400' :
                                            'bg-slate-500/20 text-slate-400'
                                        }`}>
                                        {issue.priority}
                                    </span>
                                </div>
                                <div className="flex items-center gap-3 text-xs text-slate-500">
                                    <span className="bg-white/10 px-2 py-0.5 rounded text-slate-300">
                                        {issue.departments?.name}
                                    </span>
                                    <span>•</span>
                                    <span>{new Date(issue.created_at).toLocaleDateString()}</span>
                                    <span className="ml-auto capitalize px-2 py-0.5 rounded-full bg-blue-500/10 text-blue-400">
                                        {issue.status.replace('_', ' ')}
                                    </span>
                                </div>
                            </div>
                        ))}
                        {(!recentIssues || recentIssues.length === 0) && (
                            <div className="h-full flex flex-col items-center justify-center text-slate-500 py-20">
                                <p>No issues reported yet.</p>
                            </div>
                        )}
                    </div>
                </div>

                <div className="rounded-2xl border border-white/10 overflow-hidden bg-white/5">
                    <AdminMapView
                        markers={allIssues?.map(i => ({
                            id: i.id,
                            lat: i.lat,
                            lng: i.lng,
                            title: i.title,
                            priority: i.priority,
                            status: i.status
                        }))}
                    />
                </div>
            </div>
        </div>
    );
}

function StatCard({
    icon,
    label,
    value,
    color,
}: {
    icon: React.ReactNode;
    label: string;
    value: number;
    color: string;
}) {
    const bgMap: Record<string, string> = {
        blue: "bg-blue-500/10 border-blue-500/20",
        amber: "bg-amber-500/10 border-amber-500/20",
        emerald: "bg-emerald-500/10 border-emerald-500/20",
        red: "bg-red-500/10 border-red-500/20",
    };

    return (
        <div
            className={`rounded-2xl border p-5 ${bgMap[color] ?? "bg-white/5 border-white/10"}`}
        >
            <div className="flex items-center gap-3 mb-3">{icon}</div>
            <p className="text-3xl font-bold">{value}</p>
            <p className="text-sm text-slate-400 mt-1">{label}</p>
        </div>
    );
}

