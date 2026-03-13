"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import {
    CheckCircle2,
    Clock,
    Camera,
    Save,
    Loader2,
    AlertCircle,
    X,
    UploadCloud
} from "lucide-react";

interface TaskUpdateFormProps {
    issueId: string;
    currentStatus: string;
}

export default function TaskUpdateForm({ issueId, currentStatus }: TaskUpdateFormProps) {
    const router = useRouter();
    const supabase = createClient();

    const [loading, setLoading] = useState(false);
    const [uploading, setUploading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [status, setStatus] = useState(currentStatus);
    const [comment, setComment] = useState("");
    const [photoUrl, setPhotoUrl] = useState("");
    const [photoPreview, setPhotoPreview] = useState<string | null>(null);
    const [photoFile, setPhotoFile] = useState<File | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        setPhotoFile(file);
        setPhotoUrl("");
        const reader = new FileReader();
        reader.onload = () => setPhotoPreview(reader.result as string);
        reader.readAsDataURL(file);
    };

    const clearPhoto = () => {
        setPhotoFile(null);
        setPhotoPreview(null);
        setPhotoUrl("");
        if (fileInputRef.current) fileInputRef.current.value = "";
    };

    const uploadPhoto = async (): Promise<string | null> => {
        if (!photoFile) return null;
        setUploading(true);
        try {
            const ext = photoFile.name.split(".").pop();
            const path = `task-updates/${issueId}/${Date.now()}.${ext}`;
            const { data, error } = await supabase.storage
                .from("issue-photos")
                .upload(path, photoFile, { upsert: true });
            if (error) throw error;
            const { data: urlData } = supabase.storage.from("issue-photos").getPublicUrl(data.path);
            return urlData.publicUrl;
        } finally {
            setUploading(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) throw new Error("Not authenticated");

            // Upload photo if a file was selected
            let finalPhotoUrl = photoUrl || null;
            if (photoFile) {
                const uploaded = await uploadPhoto();
                if (uploaded) finalPhotoUrl = uploaded;
            }

            // 1. Insert into issue_updates (log)
            const { error: updateLogError } = await supabase
                .from("issue_updates")
                .insert([{
                    issue_id: issueId,
                    user_id: user.id,
                    comment,
                    photo_url: finalPhotoUrl,
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
            clearPhoto();
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
                    Photo Proof
                </label>

                {/* Hidden file input */}
                <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleFileChange}
                />

                {photoPreview ? (
                    <div className="relative rounded-xl overflow-hidden border border-white/10">
                        <img src={photoPreview} alt="Preview" className="w-full h-40 object-cover" />
                        <button
                            type="button"
                            onClick={clearPhoto}
                            className="absolute top-2 right-2 p-1 bg-black/60 rounded-full text-white hover:bg-red-600 transition-colors"
                        >
                            <X className="w-4 h-4" />
                        </button>
                        {uploading && (
                            <div className="absolute inset-0 bg-black/50 flex items-center justify-center gap-2 text-white text-sm">
                                <Loader2 className="w-5 h-5 animate-spin" /> Uploading...
                            </div>
                        )}
                    </div>
                ) : (
                    <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        className="w-full flex flex-col items-center justify-center gap-2 py-6 rounded-xl border border-dashed border-white/20 bg-white/5 text-slate-400 hover:bg-white/10 hover:border-white/40 transition-all"
                    >
                        <UploadCloud className="w-7 h-7" />
                        <span className="text-sm">Click to upload a photo</span>
                        <span className="text-xs text-slate-600">JPG, PNG, WEBP up to 10MB</span>
                    </button>
                )}
            </div>

            <button
                type="submit"
                disabled={loading || uploading || (status === currentStatus && !comment && !photoFile && !photoUrl)}
                className="w-full flex items-center justify-center gap-2 py-3 bg-white text-slate-900 font-bold rounded-xl transition-all hover:bg-slate-200 disabled:opacity-50 active:scale-[0.98]"
            >
                {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
                {loading ? "Updating..." : "Save Update"}
            </button>
        </form>
    );
}
