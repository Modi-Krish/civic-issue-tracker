"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import {
    CheckCircle2,
    Clock,
    Camera,
    Save,
    Loader2,
    AlertCircle
} from "lucide-react";

interface TaskUpdateFormProps {
    issueId: string;
    currentStatus: string;
}

export default function TaskUpdateForm({ issueId, currentStatus }: TaskUpdateFormProps) {
    const router = useRouter();
    const supabase = createClient();

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [status, setStatus] = useState(currentStatus);
    const [comment, setComment] = useState("");
    const [photoUrl, setPhotoUrl] = useState("");

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) throw new Error("Not authenticated");

            // 1. Insert into issue_updates (log)
            const { error: updateLogError } = await supabase
                .from("issue_updates")
                .insert([{
                    issue_id: issueId,
                    user_id: user.id,
                    comment,
                    photo_url: photoUrl || null,
                    old_status: currentStatus,
                    new_status: status
                }]);

            if (updateLogError) throw updateLogError;

            // 2. Update the issue itself
            const updatePayload: any = { status, updated_at: new Date().toISOString() };
            if (status === "resolved") {
                updatePayload.resolved_at = new Date().toISOString();
            }

            const { error: issueUpdateError } = await supabase
                .from("issues")
                .update(updatePayload)
                .eq("id", issueId);

            if (issueUpdateError) throw issueUpdateError;

            router.refresh();
            setComment("");
            setPhotoUrl("");
        } catch (err: any) {
            setError(err.message || "Failed to update task.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
                <div className="bg-red-500/10 border border-red-500/30 text-red-300 text-sm rounded-xl px-4 py-3 flex items-start gap-3">
                    <AlertCircle className="w-5 h-5 flex-shrink-0" />
                    <span>{error}</span>
                </div>
            )}

            <div>
                <label className="block text-sm font-medium text-slate-300 mb-3">
                    Update Status
                </label>
                <div className="grid grid-cols-2 gap-3">
                    <button
                        type="button"
                        onClick={() => setStatus("in_progress")}
                        className={`flex items-center justify-center gap-2 py-3 rounded-xl border transition-all ${status === "in_progress"
                                ? "bg-blue-600 border-blue-500 text-white shadow-lg shadow-blue-600/20"
                                : "bg-white/5 border-white/10 text-slate-400 hover:bg-white/10"
                            }`}
                    >
                        <Clock className="w-4 h-4" />
                        In Progress
                    </button>
                    <button
                        type="button"
                        onClick={() => setStatus("resolved")}
                        className={`flex items-center justify-center gap-2 py-3 rounded-xl border transition-all ${status === "resolved"
                                ? "bg-emerald-600 border-emerald-500 text-white shadow-lg shadow-emerald-600/20"
                                : "bg-white/5 border-white/10 text-slate-400 hover:bg-white/10"
                            }`}
                    >
                        <CheckCircle2 className="w-4 h-4" />
                        Resolved
                    </button>
                </div>
            </div>

            <div>
                <label className="block text-sm font-medium text-slate-300 mb-1.5">
                    Comments / Progress Notes
                </label>
                <textarea
                    rows={3}
                    placeholder="Describe what you did..."
                    className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 resize-none"
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                />
            </div>

            <div>
                <label className="block text-sm font-medium text-slate-300 mb-1.5 flex items-center gap-2">
                    <Camera className="w-4 h-4 text-slate-400" />
                    Photo URL (Proof)
                </label>
                <input
                    type="url"
                    placeholder="https://example.com/photo.jpg"
                    className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                    value={photoUrl}
                    onChange={(e) => setPhotoUrl(e.target.value)}
                />
                <p className="text-[10px] text-slate-500 mt-2 italic">
                    Note: Storage integration is coming soon. For now, please use an external image link.
                </p>
            </div>

            <button
                type="submit"
                disabled={loading || status === currentStatus && !comment && !photoUrl}
                className="w-full flex items-center justify-center gap-2 py-3 bg-white text-slate-900 font-bold rounded-xl transition-all hover:bg-slate-200 disabled:opacity-50 active:scale-[0.98]"
            >
                {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
                {loading ? "Updating..." : "Save Update"}
            </button>
        </form>
    );
}
