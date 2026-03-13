import { createClient } from "@/lib/supabase/server";
import {
    ChevronLeft,
    MapPin,
    Calendar,
    AlertCircle,
    History,
    CheckCircle2,
    Clock,
    ClipboardList,
    ImageOff,
    User,
    Tag,
    Building2,
} from "lucide-react";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import TaskUpdateForm from "@/components/biker/TaskUpdateForm";

interface PageProps {
    params: Promise<{ id: string }>;
}

const STATUS_STYLE: Record<string, string> = {
    pending: "bg-amber-500/10 text-amber-400 border border-amber-500/30",
    in_progress: "bg-blue-500/10 text-blue-400 border border-blue-500/30",
    resolved: "bg-emerald-500/10 text-emerald-400 border border-emerald-500/30",
};

const STATUS_ICON: Record<string, React.ReactNode> = {
    pending: <Clock className="w-3.5 h-3.5" />,
    in_progress: <ClipboardList className="w-3.5 h-3.5" />,
    resolved: <CheckCircle2 className="w-3.5 h-3.5" />,
};

const PRIORITY_STYLE: Record<string, string> = {
    high: "bg-red-500/10 text-red-400 border border-red-500/30",
    medium: "bg-amber-500/10 text-amber-400 border border-amber-500/30",
    low: "bg-slate-500/10 text-slate-400 border border-slate-500/30",
};

export default async function BikerIssueDetailPage({ params }: PageProps) {
    const { id } = await params;
    const supabase = await createClient();

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) redirect("/login");

    // Fetch issue — accessible if reported by OR assigned to this biker
    const { data: issue } = await supabase
        .from("issues")
        .select(`
            *,
            departments(name),
            reported_by_user:users!issues_reported_by_fkey(full_name)
        `)
        .eq("id", id)
        .or(`reported_by.eq.${user.id},assigned_biker_id.eq.${user.id}`)
        .single();

    if (!issue) notFound();

    // Fetch full activity log for this issue
    const { data: updates } = await supabase
        .from("issue_updates")
        .select(`*, users(full_name)`)
        .eq("issue_id", id)
        .order("created_at", { ascending: false });

    const isAssigned = issue.assigned_biker_id === user.id;

    return (
        <div className="max-w-4xl mx-auto pb-20">
            {/* Back */}
            <Link
                href="/biker/history"
                className="inline-flex items-center gap-2 text-sm text-slate-500 hover:text-white transition-colors mb-6 group"
            >
                <ChevronLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
                Back to History
            </Link>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* ── Main Content ── */}
                <div className="lg:col-span-2 space-y-6">

                    {/* Issue Photo */}
                    <div className="rounded-2xl overflow-hidden border border-white/10 bg-white/5">
                        {issue.photo_url ? (
                            <a href={issue.photo_url} target="_blank" rel="noopener noreferrer">
                                <img
                                    src={issue.photo_url}
                                    alt="Issue photo"
                                    className="w-full max-h-80 object-cover hover:opacity-90 transition-opacity"
                                />
                            </a>
                        ) : (
                            <div className="h-44 flex flex-col items-center justify-center gap-3 text-slate-600">
                                <ImageOff className="w-10 h-10 opacity-30" />
                                <span className="text-xs">No photo attached to this issue</span>
                            </div>
                        )}
                    </div>

                    {/* Issue Details Card */}
                    <div className="bg-white/5 border border-white/10 rounded-2xl p-6 shadow-xl space-y-5">
                        {/* Title + Priority */}
                        <div className="flex flex-wrap items-start justify-between gap-3">
                            <h1 className="text-2xl font-bold text-white flex-1">
                                {issue.title || `${issue.issue_type ?? "Issue"} — ${(issue.departments as { name: string } | null)?.name ?? ""}`}
                            </h1>
                            <div className="flex items-center gap-2 flex-wrap">
                                <span className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${STATUS_STYLE[issue.status] ?? ""}`}>
                                    {STATUS_ICON[issue.status]}
                                    {issue.status.replace("_", " ")}
                                </span>
                                <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${PRIORITY_STYLE[issue.priority] ?? ""}`}>
                                    {issue.priority} priority
                                </span>
                            </div>
                        </div>

                        {/* Description */}
                        {issue.description && (
                            <p className="text-slate-300 leading-relaxed border-t border-white/5 pt-4">
                                {issue.description}
                            </p>
                        )}

                        {/* Meta grid */}
                        <div className="grid grid-cols-2 gap-4 text-sm border-t border-white/5 pt-4">
                            <div className="flex items-center gap-3 text-slate-400">
                                <Building2 className="w-4 h-4 text-blue-400 flex-shrink-0" />
                                <span>{(issue.departments as { name: string } | null)?.name ?? "—"}</span>
                            </div>
                            <div className="flex items-center gap-3 text-slate-400">
                                <Tag className="w-4 h-4 text-purple-400 flex-shrink-0" />
                                <span>{issue.issue_type ?? "—"}</span>
                            </div>
                            {issue.lat && issue.lng && (
                                <div className="flex items-center gap-3 text-slate-400">
                                    <MapPin className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                                    <span>{Number(issue.lat).toFixed(5)}, {Number(issue.lng).toFixed(5)}</span>
                                </div>
                            )}
                            <div className="flex items-center gap-3 text-slate-400">
                                <Calendar className="w-4 h-4 text-slate-500 flex-shrink-0" />
                                <span>{new Date(issue.created_at).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}</span>
                            </div>
                            <div className="flex items-center gap-3 text-slate-400 col-span-2">
                                <User className="w-4 h-4 text-slate-500 flex-shrink-0" />
                                <span>Reported by: <span className="text-slate-200">{issue.reported_by_user?.full_name || "Admin"}</span></span>
                            </div>
                            {issue.resolved_at && (
                                <div className="flex items-center gap-3 text-emerald-400 col-span-2">
                                    <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
                                    <span>Resolved on {new Date(issue.resolved_at).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}</span>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Activity Log */}
                    <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
                        <h2 className="text-lg font-semibold mb-6 flex items-center gap-2">
                            <History className="w-5 h-5 text-slate-400" />
                            Activity Log
                        </h2>
                        <div className="space-y-6 relative before:absolute before:inset-0 before:left-[11px] before:w-px before:bg-white/5">
                            {updates?.map((update) => (
                                <div key={update.id} className="relative pl-8">
                                    <div className="absolute left-0 top-1.5 w-[22px] h-[22px] rounded-full bg-slate-800 border-2 border-slate-700 z-10 flex items-center justify-center">
                                        <div className="w-2 h-2 rounded-full bg-blue-500" />
                                    </div>
                                    <div className="text-sm">
                                        <div className="flex items-center justify-between mb-1">
                                            <span className="font-medium text-slate-200">{update.users?.full_name || "System"}</span>
                                            <span className="text-[10px] text-slate-500">{new Date(update.created_at).toLocaleString()}</span>
                                        </div>
                                        {update.comment && (
                                            <p className="text-slate-400 mb-2 italic">"{update.comment}"</p>
                                        )}
                                        {update.old_status !== update.new_status && (
                                            <p className="text-[10px] text-slate-500 mb-2">
                                                Status: <span className="text-slate-300 uppercase">{update.old_status}</span>
                                                {" → "}
                                                <span className="text-blue-400 uppercase font-bold">{update.new_status}</span>
                                            </p>
                                        )}
                                        {/* Update photo — large and clickable */}
                                        {update.photo_url && (
                                            <a
                                                href={update.photo_url}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="block mt-3 rounded-xl overflow-hidden border border-white/10 max-w-sm hover:opacity-90 transition-opacity"
                                            >
                                                <img
                                                    src={update.photo_url}
                                                    alt="Progress proof"
                                                    className="w-full h-auto"
                                                />
                                                <p className="text-[10px] text-slate-500 text-center py-1">Click to open full size</p>
                                            </a>
                                        )}
                                    </div>
                                </div>
                            ))}
                            {(!updates || updates.length === 0) && (
                                <p className="text-sm text-slate-500 text-center py-4 italic">No activity yet.</p>
                            )}
                        </div>
                    </div>
                </div>

                {/* ── Sidebar ── */}
                <div className="space-y-6">
                    {isAssigned ? (
                        <div className="bg-white/5 border border-white/20 rounded-2xl p-6 sticky top-8 shadow-2xl backdrop-blur-sm">
                            <h2 className="text-lg font-bold mb-1">Update Progress</h2>
                            <p className="text-xs text-slate-500 mb-6">Log your actions and change task status</p>
                            <TaskUpdateForm issueId={issue.id} currentStatus={issue.status} />
                        </div>
                    ) : (
                        <div className="bg-white/5 border border-white/10 rounded-2xl p-5 text-center text-slate-400 text-sm">
                            <ClipboardList className="w-8 h-8 mx-auto mb-3 opacity-30" />
                            <p>You reported this issue.</p>
                            <p className="text-xs text-slate-600 mt-1">Updates can be made once you are assigned to it.</p>
                        </div>
                    )}

                    <div className="p-4 rounded-xl bg-blue-500/5 border border-blue-500/20">
                        <div className="flex gap-3">
                            <AlertCircle className="w-5 h-5 text-blue-400 flex-shrink-0" />
                            <div className="text-xs text-blue-300 leading-relaxed">
                                <p className="font-bold mb-1 uppercase tracking-wider">Issue Info</p>
                                <p>Reported by: <span className="text-white">{issue.reported_by_user?.full_name || "Admin"}</span></p>
                                <p className="mt-1">Department: <span className="text-white">{(issue.departments as { name: string } | null)?.name ?? "—"}</span></p>
                                {issue.resolved_at && (
                                    <p className="mt-1 text-emerald-400">✓ Resolved {new Date(issue.resolved_at).toLocaleDateString()}</p>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
