import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { CheckCircle2, Calendar, Filter, ExternalLink } from "lucide-react";
import Link from "next/link";

interface SearchParams {
    filter?: string;
}

export default async function BikerHistoryPage({
    searchParams,
}: {
    searchParams: Promise<SearchParams>;
}) {
    const { filter } = await searchParams;
    const supabase = await createClient();

    const {
        data: { user },
    } = await supabase.auth.getUser();
    if (!user) redirect("/login");

    // Fetch resolved/completed issues for this biker
    let query = supabase
        .from("issues")
        .select("*, departments(name)")
        .eq("assigned_biker_id", user.id)
        .eq("status", "resolved")
        .order("resolved_at", { ascending: false });

    if (filter === "today") {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        query = query.gte("resolved_at", today.toISOString());
    } else if (filter === "week") {
        const weekAgo = new Date();
        weekAgo.setDate(weekAgo.getDate() - 7);
        query = query.gte("resolved_at", weekAgo.toISOString());
    } else if (filter === "month") {
        const monthAgo = new Date();
        monthAgo.setMonth(monthAgo.getMonth() - 1);
        query = query.gte("resolved_at", monthAgo.toISOString());
    }

    const { data: resolvedIssues } = await query;

    const FILTERS = [
        { label: "All Time", value: "" },
        { label: "Today", value: "today" },
        { label: "This Week", value: "week" },
        { label: "This Month", value: "month" },
    ];

    return (
        <div className="max-w-5xl mx-auto">
            {/* Header */}
            <div className="mb-6 flex items-start justify-between">
                <div>
                    <h1 className="text-3xl font-bold mb-1 flex items-center gap-2">
                        <CheckCircle2 className="w-7 h-7 text-emerald-400" />
                        History
                    </h1>
                    <p className="text-slate-400 text-sm">
                        Your completed and resolved issues.
                    </p>
                </div>
                <div className="text-right">
                    <p className="text-2xl font-bold text-emerald-400">
                        {resolvedIssues?.length ?? 0}
                    </p>
                    <p className="text-xs text-slate-500 uppercase tracking-wider">
                        Resolved
                    </p>
                </div>
            </div>

            {/* Filter Tabs */}
            <div className="flex items-center gap-2 mb-6">
                <Filter className="w-4 h-4 text-slate-500" />
                <div className="flex gap-2 flex-wrap">
                    {FILTERS.map((f) => (
                        <Link
                            key={f.value}
                            href={f.value ? `/biker/history?filter=${f.value}` : "/biker/history"}
                            className={`px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider border transition-all ${(filter ?? "") === f.value
                                ? "bg-emerald-600 border-emerald-500 text-white"
                                : "bg-white/5 border-white/10 text-slate-400 hover:bg-white/10"
                                }`}
                        >
                            {f.label}
                        </Link>
                    ))}
                </div>
            </div>

            {/* Issues Grid */}
            {resolvedIssues && resolvedIssues.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {resolvedIssues.map((issue) => (
                        <Link
                            key={issue.id}
                            href={`/biker/issues/${issue.id}`}
                            className="group block bg-white/5 border border-white/10 rounded-2xl overflow-hidden hover:border-emerald-500/30 hover:bg-white/8 transition-all"
                        >
                            {/* Photo or placeholder */}
                            {issue.photo_url ? (
                                <div className="h-36 overflow-hidden">
                                    <img
                                        src={issue.photo_url}
                                        alt={issue.title}
                                        className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                                    />
                                </div>
                            ) : (
                                <div className="h-36 bg-emerald-900/20 flex items-center justify-center border-b border-white/5">
                                    <CheckCircle2 className="w-10 h-10 text-emerald-700" />
                                </div>
                            )}

                            <div className="p-4">
                                <div className="flex items-start justify-between gap-2 mb-2">
                                    <p className="font-semibold text-sm text-slate-200 group-hover:text-emerald-400 transition-colors line-clamp-2 flex-1">
                                        {issue.title}
                                    </p>
                                    <ExternalLink className="w-3.5 h-3.5 text-slate-600 group-hover:text-emerald-400 flex-shrink-0 mt-0.5 transition-colors" />
                                </div>

                                <div className="flex items-center gap-2 text-[10px] text-slate-500 font-bold uppercase tracking-wider mb-3">
                                    <span>{(issue.departments as unknown as { name: string } | null)?.name}</span>
                                    <span>·</span>
                                    <span className={
                                        issue.priority === "high"
                                            ? "text-red-400"
                                            : issue.priority === "medium"
                                                ? "text-amber-400"
                                                : "text-slate-500"
                                    }>{issue.priority}</span>
                                </div>

                                {issue.resolved_at && (
                                    <div className="flex items-center gap-1.5 text-[10px] text-slate-600">
                                        <Calendar className="w-3 h-3" />
                                        Resolved {new Date(issue.resolved_at).toLocaleDateString()}
                                    </div>
                                )}
                            </div>
                        </Link>
                    ))}
                </div>
            ) : (
                <div className="h-[400px] rounded-3xl border-2 border-dashed border-white/5 flex flex-col items-center justify-center text-slate-500 gap-3">
                    <CheckCircle2 className="w-12 h-12 opacity-20" />
                    <p className="text-sm">No resolved issues for this period.</p>
                    <Link
                        href="/biker/areas"
                        className="text-blue-400 hover:underline text-xs font-medium"
                    >
                        View your assigned tasks →
                    </Link>
                </div>
            )}
        </div>
    );
}
