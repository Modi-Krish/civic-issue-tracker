import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { AlertTriangle, Clock, ArrowRight } from "lucide-react";
import Link from "next/link";

export default async function BikerImportantPage() {
    const supabase = await createClient();

    const {
        data: { user },
    } = await supabase.auth.getUser();
    if (!user) redirect("/login");

    // Fetch HIGH priority, non-resolved issues ASSIGNED to this biker
    const { data: assignedIssues } = await supabase
        .from("issues")
        .select("*, departments(name)")
        .eq("assigned_biker_id", user.id)
        .eq("priority", "high")
        .neq("status", "resolved")
        .order("created_at", { ascending: false });

    // Also fetch HIGH priority, non-resolved issues REPORTED by this biker
    const { data: reportedIssues } = await supabase
        .from("issues")
        .select("*, departments(name)")
        .eq("reported_by", user.id)
        .eq("priority", "high")
        .neq("status", "resolved")
        .order("created_at", { ascending: false });

    // Merge and deduplicate
    const seen = new Set<string>();
    const urgentIssues = [...(assignedIssues ?? []), ...(reportedIssues ?? [])].filter((issue) => {
        if (seen.has(issue.id)) return false;
        seen.add(issue.id);
        return true;
    });

    return (
        <div className="max-w-4xl mx-auto">
            {/* Header */}
            <div className="mb-8">
                <h1 className="text-3xl font-bold mb-1 flex items-center gap-2">
                    <AlertTriangle className="w-7 h-7 text-red-400" />
                    Important
                </h1>
                <p className="text-slate-400 text-sm">
                    High priority issues assigned to you that require urgent attention.
                </p>
            </div>

            {/* Count badge */}
            {(urgentIssues?.length ?? 0) > 0 && (
                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-red-500/10 border border-red-500/30 text-red-300 text-sm font-bold mb-6">
                    <AlertTriangle className="w-4 h-4" />
                    {urgentIssues!.length} Urgent Issue{urgentIssues!.length !== 1 ? "s" : ""} Pending
                </div>
            )}

            {/* Issues list */}
            {urgentIssues && urgentIssues.length > 0 ? (
                <div className="space-y-4">
                    {urgentIssues.map((issue, idx) => (
                        <Link
                            key={issue.id}
                            href={`/biker/issues/${issue.id}`}
                            className="group flex items-center justify-between p-5 rounded-2xl bg-red-500/5 border border-red-500/20 hover:bg-red-500/10 hover:border-red-500/40 transition-all"
                        >
                            <div className="flex items-center gap-4">
                                {/* Index indicator */}
                                <div className="w-9 h-9 rounded-full bg-red-500/20 border border-red-500/30 flex items-center justify-center flex-shrink-0">
                                    <span className="text-xs font-bold text-red-400">
                                        #{idx + 1}
                                    </span>
                                </div>
                                <div>
                                    <p className="font-semibold text-slate-200 group-hover:text-red-300 transition-colors mb-1">
                                        {issue.title}
                                    </p>
                                    <div className="flex items-center gap-2 text-[10px] text-slate-500 font-bold uppercase tracking-wider">
                                        <span>{(issue.departments as unknown as { name: string } | null)?.name}</span>
                                        <span>·</span>
                                        <span className="flex items-center gap-1">
                                            <Clock className="w-3 h-3" />
                                            {new Date(issue.created_at).toLocaleDateString()}
                                        </span>
                                    </div>
                                    {issue.description && (
                                        <p className="text-xs text-slate-500 mt-1.5 line-clamp-1 italic">
                                            {issue.description}
                                        </p>
                                    )}
                                </div>
                            </div>

                            <div className="flex items-center gap-3 flex-shrink-0">
                                <span
                                    className={`text-[10px] px-2.5 py-1 rounded-full font-bold uppercase tracking-wider ${issue.status === "pending"
                                        ? "bg-amber-500/10 text-amber-400 border border-amber-500/20"
                                        : "bg-blue-500/10 text-blue-400 border border-blue-500/20"
                                        }`}
                                >
                                    {issue.status.replace("_", " ")}
                                </span>
                                <ArrowRight className="w-4 h-4 text-slate-600 group-hover:text-red-400 transition-colors" />
                            </div>
                        </Link>
                    ))}
                </div>
            ) : (
                <div className="h-[400px] rounded-3xl border-2 border-dashed border-white/5 flex flex-col items-center justify-center text-slate-500 gap-3">
                    <AlertTriangle className="w-12 h-12 opacity-20" />
                    <p className="text-sm font-medium">No urgent issues right now.</p>
                    <p className="text-xs text-slate-600">
                        You're all caught up on high-priority tasks!
                    </p>
                </div>
            )}
        </div>
    );
}
