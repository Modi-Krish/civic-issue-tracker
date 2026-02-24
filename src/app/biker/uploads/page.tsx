import { createClient } from "@/lib/supabase/server";
import { Camera, ExternalLink, Calendar, CheckCircle2 } from "lucide-react";
import Link from "next/link";
import { redirect } from "next/navigation";

export default async function BikerUploadsPage() {
    const supabase = await createClient();

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) redirect("/login");

    // Fetch all updates made by this biker
    const { data: updates } = await supabase
        .from("issue_updates")
        .select(`
            *,
            issue:issues(title)
        `)
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

    return (
        <div className="max-w-5xl mx-auto">
            <h1 className="text-3xl font-bold mb-2">My Updates History</h1>
            <p className="text-slate-400 mb-8">
                A historical log of all progress reports and proof you've submitted.
            </p>

            {updates && updates.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {updates.map((update) => (
                        <div
                            key={update.id}
                            className="bg-white/5 border border-white/10 rounded-2xl overflow-hidden hover:border-white/20 transition-all group"
                        >
                            {update.photo_url ? (
                                <div className="h-48 overflow-hidden relative">
                                    <img
                                        src={update.photo_url}
                                        alt="Progress Proof"
                                        className="w-full h-full object-cover transition-transform group-hover:scale-105"
                                    />
                                    <div className="absolute top-3 right-3">
                                        <div className="bg-slate-900/80 backdrop-blur-md p-1.5 rounded-lg border border-white/10">
                                            <Camera className="w-4 h-4 text-white" />
                                        </div>
                                    </div>
                                </div>
                            ) : (
                                <div className="h-48 bg-slate-900/50 flex flex-col items-center justify-center text-slate-600 gap-2 border-b border-white/5">
                                    <Camera className="w-8 h-8 opacity-20" />
                                    <span className="text-[10px] uppercase font-bold tracking-widest">No Image Attached</span>
                                </div>
                            )}

                            <div className="p-5">
                                <div className="flex items-center justify-between mb-3 text-[10px] text-slate-500 font-bold uppercase tracking-wider">
                                    <div className="flex items-center gap-2">
                                        <Calendar className="w-3 h-3" />
                                        <span>{new Date(update.created_at).toLocaleDateString()}</span>
                                    </div>
                                    {update.new_status === 'resolved' && (
                                        <div className="flex items-center gap-1 text-emerald-400">
                                            <CheckCircle2 className="w-3 h-3" />
                                            <span>Resolved</span>
                                        </div>
                                    )}
                                </div>

                                <Link
                                    href={`/biker/issues/${update.issue_id}`}
                                    className="block font-bold text-slate-200 hover:text-blue-400 transition-colors mb-2 line-clamp-1 flex items-center gap-2"
                                >
                                    {update.issue?.title || "Untitled Issue"}
                                    <ExternalLink className="w-3 h-3" />
                                </Link>

                                <p className="text-sm text-slate-400 line-clamp-2 italic mb-1">
                                    {update.comment || "No comment added."}
                                </p>

                                {update.old_status !== update.new_status && (
                                    <div className="mt-4 pt-4 border-t border-white/5">
                                        <span className="text-[10px] text-slate-600 uppercase tracking-widest block mb-1">Status Shift</span>
                                        <div className="flex items-center gap-2">
                                            <span className="text-[10px] bg-slate-800 text-slate-400 px-2 py-0.5 rounded uppercase">{update.old_status}</span>
                                            <span className="text-slate-700">→</span>
                                            <span className="text-[10px] bg-blue-500/10 text-blue-400 px-2 py-0.5 rounded uppercase font-bold">{update.new_status}</span>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                <div className="h-[400px] rounded-3xl border-2 border-dashed border-white/5 flex flex-col items-center justify-center text-slate-500">
                    <p>No activity records found.</p>
                    <Link
                        href="/biker"
                        className="mt-4 text-blue-400 hover:underline text-sm font-medium"
                    >
                        Go find some tasks to complete!
                    </Link>
                </div>
            )}
        </div>
    );
}
