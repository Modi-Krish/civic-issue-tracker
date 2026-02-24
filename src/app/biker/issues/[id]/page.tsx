import { createClient } from "@/lib/supabase/server";
import {
    ChevronLeft,
    MapPin,
    Calendar,
    AlertCircle,
    History
} from "lucide-react";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import TaskUpdateForm from "@/components/biker/TaskUpdateForm";

interface PageProps {
    params: Promise<{ id: string }>;
}

export default async function BikerIssueDetailPage({ params }: PageProps) {
    const { id } = await params;
    const supabase = await createClient();

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) redirect("/login");

    // Fetch issue details
    const { data: issue } = await supabase
        .from("issues")
        .select(`
            *,
            departments(name),
            reported_by_user:users!issues_reported_by_fkey(full_name)
        `)
        .eq("id", id)
        .eq("assigned_biker_id", user.id)
        .single();

    if (!issue) notFound();

    // Fetch update history for this issue
    const { data: updates } = await supabase
        .from("issue_updates")
        .select(`
            *,
            users(full_name)
        `)
        .eq("issue_id", id)
        .order("created_at", { ascending: false });

    return (
        <div className="max-w-4xl mx-auto pb-20">
            <Link
                href="/biker"
                className="flex items-center gap-2 text-sm text-slate-500 hover:text-white transition-colors mb-6 group"
            >
                <ChevronLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
                Back to Dashboard
            </Link>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Main Content */}
                <div className="lg:col-span-2 space-y-6">
                    <div className="bg-white/5 border border-white/10 rounded-2xl p-6 shadow-xl">
                        <div className="flex justify-between items-start gap-4 mb-4">
                            <h1 className="text-2xl font-bold text-white">{issue.title}</h1>
                            <span className={`px-2.5 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${issue.priority === 'high' ? 'bg-red-500/10 text-red-400' :
                                    issue.priority === 'medium' ? 'bg-amber-500/10 text-amber-400' :
                                        'bg-slate-500/10 text-slate-400'
                                }`}>
                                {issue.priority}
                            </span>
                        </div>

                        <p className="text-slate-300 leading-relaxed mb-6">
                            {issue.description || "No description provided."}
                        </p>

                        <div className="grid grid-cols-2 gap-4 text-sm">
                            <div className="flex items-center gap-3 text-slate-400">
                                <MapPin className="w-4 h-4 text-blue-400" />
                                <span>{issue.lat.toFixed(4)}, {issue.lng.toFixed(4)}</span>
                            </div>
                            <div className="flex items-center gap-3 text-slate-400">
                                <Calendar className="w-4 h-4 text-blue-400" />
                                <span>{new Date(issue.created_at).toLocaleDateString()}</span>
                            </div>
                        </div>
                    </div>

                    {/* Update History */}
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
                                        <div className="flex items-center gap-2">
                                            {update.old_status !== update.new_status && (
                                                <span className="text-[10px] text-slate-500">
                                                    Changed status: <span className="text-slate-300 uppercase">{update.old_status}</span> → <span className="text-blue-400 uppercase font-bold">{update.new_status}</span>
                                                </span>
                                            )}
                                        </div>
                                        {update.photo_url && (
                                            <div className="mt-3 rounded-lg overflow-hidden border border-white/10 max-w-[200px]">
                                                <img
                                                    src={update.photo_url}
                                                    alt="Progress Proof"
                                                    className="w-full h-auto"
                                                />
                                            </div>
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

                {/* Sidebar - Update Form */}
                <div className="space-y-6">
                    <div className="bg-white/5 border border-white/20 rounded-2xl p-6 sticky top-8 shadow-2xl backdrop-blur-sm">
                        <h2 className="text-lg font-bold mb-1">Update Progress</h2>
                        <p className="text-xs text-slate-500 mb-6">Log your actions and change task status</p>
                        <TaskUpdateForm issueId={issue.id} currentStatus={issue.status} />
                    </div>

                    <div className="p-4 rounded-xl bg-blue-500/5 border border-blue-500/20">
                        <div className="flex gap-3">
                            <AlertCircle className="w-5 h-5 text-blue-400 flex-shrink-0" />
                            <div className="text-xs text-blue-300 leading-tight">
                                <p className="font-bold mb-1 uppercase tracking-wider">Department Contact</p>
                                <p>Reported by: {issue.reported_by_user?.full_name || "Admin"}</p>
                                <p className="mt-1">Assigned Department: {issue.departments?.name}</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
