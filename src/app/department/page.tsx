import { createClient } from "@/lib/supabase/server";
import {
    AlertTriangle,
    CheckCircle2,
    Clock,
    MapPin,
} from "lucide-react";

export default async function DepartmentDashboard() {
    const supabase = await createClient();

    const {
        data: { user },
    } = await supabase.auth.getUser();

    // Get the department_id for this user
    const { data: profile } = await supabase
        .from("users")
        .select("department_id, departments(name)")
        .eq("id", user?.id ?? "")
        .single();

    const dept = profile?.departments as unknown as { name: string } | null;
    const departmentId = profile?.department_id;
    const departmentName = dept?.name ?? "Your Department";

    // Fetch issues for this department
    const { data: issues } = await supabase
        .from("issues")
        .select("*")
        .eq("department_id", departmentId ?? "")
        .order("created_at", { ascending: false });

    const pending = issues?.filter((i) => i.status === "pending") ?? [];
    const inProgress = issues?.filter((i) => i.status === "in_progress") ?? [];
    const resolved = issues?.filter((i) => i.status === "resolved") ?? [];
    const highPriority = issues?.filter((i) => i.priority === "high") ?? [];

    return (
        <div>
            <h1 className="text-3xl font-bold mb-2">{departmentName} Dashboard</h1>
            <p className="text-slate-400 mb-8">
                Issues specific to your department.
            </p>

            {/* Stat Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
                <StatCard
                    icon={<Clock className="w-5 h-5 text-amber-400" />}
                    label="Pending"
                    value={pending.length}
                    color="amber"
                />
                <StatCard
                    icon={<MapPin className="w-5 h-5 text-blue-400" />}
                    label="In Progress"
                    value={inProgress.length}
                    color="blue"
                />
                <StatCard
                    icon={<CheckCircle2 className="w-5 h-5 text-emerald-400" />}
                    label="Resolved"
                    value={resolved.length}
                    color="emerald"
                />
                <StatCard
                    icon={<AlertTriangle className="w-5 h-5 text-red-400" />}
                    label="High Priority"
                    value={highPriority.length}
                    color="red"
                />
            </div>

            {/* Issue list */}
            <div className="rounded-2xl border border-white/10 bg-white/5 p-6">
                <h2 className="text-lg font-semibold mb-4">Department Issues</h2>
                {issues && issues.length > 0 ? (
                    <div className="space-y-3">
                        {issues.map((issue) => (
                            <div
                                key={issue.id}
                                className="flex items-center justify-between p-4 rounded-xl bg-white/5 border border-white/5"
                            >
                                <div>
                                    <p className="font-medium">{issue.title}</p>
                                    <p className="text-xs text-slate-500">
                                        {issue.priority} priority •{" "}
                                        {issue.lat != null ? issue.lat.toFixed(4) : "N/A"},{" "}
                                        {issue.lng != null ? issue.lng.toFixed(4) : "N/A"}
                                    </p>
                                </div>
                                <span
                                    className={`text-xs px-3 py-1 rounded-full font-medium ${issue.status === "pending"
                                        ? "bg-amber-500/20 text-amber-300"
                                        : issue.status === "in_progress"
                                            ? "bg-blue-500/20 text-blue-300"
                                            : "bg-emerald-500/20 text-emerald-300"
                                        }`}
                                >
                                    {issue.status.replace("_", " ")}
                                </span>
                            </div>
                        ))}
                    </div>
                ) : (
                    <p className="text-sm text-slate-500">
                        No issues reported for your department yet.
                    </p>
                )}
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
            <p className="text-2xl font-bold">{value}</p>
            <p className="text-sm text-slate-400 mt-1">{label}</p>
        </div>
    );
}
