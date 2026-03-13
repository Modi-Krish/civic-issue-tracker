import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import {
    Camera,
    ClipboardList,
    Clock,
    CheckCircle2,
    AlertTriangle,
} from "lucide-react";
import ReportIssueForm from "@/components/biker/ReportIssueForm";

export default async function BikerHomePage() {
    const supabase = await createClient();

    const {
        data: { user },
    } = await supabase.auth.getUser();
    if (!user) redirect("/login");

    // Fetch departments for the form
    const { data: departments } = await supabase
        .from("departments")
        .select("id, name")
        .order("name");

    // Fetch ALL issues this biker is involved with (reported OR assigned)
    const [{ data: reportedIssues }, { data: assignedIssues }] = await Promise.all([
        supabase
            .from("issues")
            .select("id, status, priority")
            .eq("reported_by", user.id),
        supabase
            .from("issues")
            .select("id, status, priority")
            .eq("assigned_biker_id", user.id)
            .neq("reported_by", user.id), // avoid double-counting
    ]);

    const allIssues = [...(reportedIssues ?? []), ...(assignedIssues ?? [])];

    const pending = allIssues.filter((i) => i.status === "pending");
    const inProgress = allIssues.filter((i) => i.status === "in_progress");
    const resolved = allIssues.filter((i) => i.status === "resolved");
    const highPriority = allIssues.filter((i) => i.priority === "high" && i.status !== "resolved");

    return (
        <div>
            {/* Header */}
            <div className="mb-8">
                <h1 className="text-3xl font-bold mb-1">Biker Home</h1>
                <p className="text-slate-400 text-sm">
                    Report a new civic issue or upload completion proof for a solved one.
                </p>
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-8">
                {[
                    { label: "Pending", value: pending.length, icon: <Clock className="w-4 h-4 text-amber-400" />, color: "border-amber-500/20 bg-amber-500/10" },
                    { label: "In Progress", value: inProgress.length, icon: <ClipboardList className="w-4 h-4 text-blue-400" />, color: "border-blue-500/20 bg-blue-500/10" },
                    { label: "Resolved", value: resolved.length, icon: <CheckCircle2 className="w-4 h-4 text-emerald-400" />, color: "border-emerald-500/20 bg-emerald-500/10" },
                    { label: "Urgent", value: highPriority.length, icon: <AlertTriangle className="w-4 h-4 text-red-400" />, color: "border-red-500/20 bg-red-500/10" },
                ].map((stat) => (
                    <div key={stat.label} className={`flex items-center gap-3 rounded-2xl border p-4 ${stat.color}`}>
                        {stat.icon}
                        <div>
                            <p className="text-lg font-bold leading-none">{stat.value}</p>
                            <p className="text-[10px] text-slate-400 mt-0.5 uppercase tracking-wider">{stat.label}</p>
                        </div>
                    </div>
                ))}
            </div>

            {/* Report Form */}
            <div className="rounded-2xl border border-white/10 bg-white/5 p-6">
                <h2 className="text-lg font-bold mb-1 flex items-center gap-2">
                    <Camera className="w-5 h-5 text-blue-400" />
                    Report / Update Issue
                </h2>
                <p className="text-xs text-slate-500 mb-6">
                    Upload before & after images, capture location, and set issue details.
                </p>
                <ReportIssueForm
                    departments={departments ?? []}
                    userId={user.id}
                />
            </div>
        </div>
    );
}
