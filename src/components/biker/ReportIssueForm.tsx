"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import {
    Camera,
    MapPin,
    AlertTriangle,
    Building2,
    Tag,
    Loader2,
    CheckCircle2,
    X,
    LocateFixed,
} from "lucide-react";

interface Department {
    id: string;
    name: string;
}

interface ReportIssueFormProps {
    departments: Department[];
    userId: string;
}

const ISSUE_TYPES = [
    "Pothole",
    "Street Light",
    "Garbage",
    "Water Leakage",
    "Road Damage",
    "Drainage",
    "Tree Fall",
    "Encroachment",
    "Other",
];

const PRIORITIES = [
    { value: "low", label: "Low", color: "text-slate-400 border-slate-500/40 bg-slate-500/10" },
    { value: "medium", label: "Medium", color: "text-amber-400 border-amber-500/40 bg-amber-500/10" },
    { value: "high", label: "High", color: "text-red-400 border-red-500/40 bg-red-500/10" },
];

export default function ReportIssueForm({ departments, userId }: ReportIssueFormProps) {
    const router = useRouter();
    const supabase = createClient();
    const fileInputRef = useRef<HTMLInputElement>(null);

    const [loading, setLoading] = useState(false);
    const [locating, setLocating] = useState(false);
    const [success, setSuccess] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const [title, setTitle] = useState("");
    const [description, setDescription] = useState("");
    const [issueType, setIssueType] = useState("");
    const [departmentId, setDepartmentId] = useState("");
    const [priority, setPriority] = useState("medium");
    const [lat, setLat] = useState<number | null>(null);
    const [lng, setLng] = useState<number | null>(null);
    const [beforeImage, setBeforeImage] = useState<File | null>(null);
    const [afterImage, setAfterImage] = useState<File | null>(null);
    const [beforePreview, setBeforePreview] = useState<string | null>(null);
    const [afterPreview, setAfterPreview] = useState<string | null>(null);
    const [activeImg, setActiveImg] = useState<"before" | "after">("before");

    const getLocation = () => {
        setLocating(true);
        setError(null);
        navigator.geolocation.getCurrentPosition(
            (pos) => {
                setLat(pos.coords.latitude);
                setLng(pos.coords.longitude);
                setLocating(false);
            },
            () => {
                setError("Unable to get your location. Please enable location access.");
                setLocating(false);
            }
        );
    };

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>, type: "before" | "after") => {
        const file = e.target.files?.[0];
        if (!file) return;
        const url = URL.createObjectURL(file);
        if (type === "before") {
            setBeforeImage(file);
            setBeforePreview(url);
        } else {
            setAfterImage(file);
            setAfterPreview(url);
        }
    };

    const uploadImage = async (file: File, path: string): Promise<string | null> => {
        const { data, error } = await supabase.storage
            .from("issue-photos")
            .upload(path, file, { upsert: true });
        if (error) return null;
        const { data: url } = supabase.storage.from("issue-photos").getPublicUrl(data.path);
        return url.publicUrl;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!lat || !lng) {
            setError("Please capture your location first.");
            return;
        }
        if (!departmentId) {
            setError("Please select a department.");
            return;
        }
        setLoading(true);
        setError(null);

        try {
            let beforeUrl: string | null = null;
            let afterUrl: string | null = null;

            if (beforeImage) {
                beforeUrl = await uploadImage(
                    beforeImage,
                    `bikers/${userId}/before_${Date.now()}`
                );
            }
            if (afterImage) {
                afterUrl = await uploadImage(
                    afterImage,
                    `bikers/${userId}/after_${Date.now()}`
                );
            }

            const { error: insertError } = await supabase.from("issues").insert([
                {
                    title: title || `${issueType || "Issue"} reported by biker`,
                    description,
                    lat,
                    lng,
                    priority: priority as "low" | "medium" | "high",
                    department_id: departmentId,
                    status: "pending",
                    photo_url: beforeUrl,
                    reported_by: userId,
                },
            ]);

            if (insertError) throw insertError;

            setSuccess(true);
            setTitle("");
            setDescription("");
            setIssueType("");
            setDepartmentId("");
            setPriority("medium");
            setLat(null);
            setLng(null);
            setBeforeImage(null);
            setAfterImage(null);
            setBeforePreview(null);
            setAfterPreview(null);
            setTimeout(() => setSuccess(false), 3000);
            router.refresh();
        } catch (err: unknown) {
            const msg = err instanceof Error ? err.message : "Failed to submit issue.";
            setError(msg);
        } finally {
            setLoading(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            {/* Success */}
            {success && (
                <div className="flex items-center gap-3 bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 px-4 py-3 rounded-xl text-sm">
                    <CheckCircle2 className="w-5 h-5 flex-shrink-0" />
                    Issue reported successfully!
                </div>
            )}

            {/* Error */}
            {error && (
                <div className="flex items-center gap-3 bg-red-500/10 border border-red-500/30 text-red-300 px-4 py-3 rounded-xl text-sm">
                    <AlertTriangle className="w-5 h-5 flex-shrink-0" />
                    {error}
                </div>
            )}

            {/* Image Upload – Before / After */}
            <div>
                <label className="block text-sm font-semibold text-slate-300 mb-3 flex items-center gap-2">
                    <Camera className="w-4 h-4 text-slate-400" />
                    Upload Images
                </label>
                <div className="flex gap-2 mb-3">
                    {(["before", "after"] as const).map((t) => (
                        <button
                            key={t}
                            type="button"
                            onClick={() => setActiveImg(t)}
                            className={`px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider border transition-all ${activeImg === t
                                    ? "bg-blue-600 border-blue-500 text-white"
                                    : "bg-white/5 border-white/10 text-slate-400 hover:bg-white/10"
                                }`}
                        >
                            {t === "before" ? "Before" : "After (Proof)"}
                        </button>
                    ))}
                </div>

                <div className="relative h-44 rounded-xl border-2 border-dashed border-white/10 bg-white/5 overflow-hidden flex items-center justify-center cursor-pointer hover:border-blue-500/40 transition-colors"
                    onClick={() => {
                        if (fileInputRef.current) {
                            fileInputRef.current.setAttribute("data-type", activeImg);
                            fileInputRef.current.click();
                        }
                    }}>
                    {(activeImg === "before" ? beforePreview : afterPreview) ? (
                        <>
                            <img
                                src={(activeImg === "before" ? beforePreview : afterPreview)!}
                                alt={activeImg}
                                className="w-full h-full object-cover"
                            />
                            <button
                                type="button"
                                className="absolute top-2 right-2 bg-slate-900/80 rounded-full p-1"
                                onClick={(e) => {
                                    e.stopPropagation();
                                    if (activeImg === "before") {
                                        setBeforeImage(null);
                                        setBeforePreview(null);
                                    } else {
                                        setAfterImage(null);
                                        setAfterPreview(null);
                                    }
                                }}
                            >
                                <X className="w-3.5 h-3.5 text-white" />
                            </button>
                        </>
                    ) : (
                        <div className="flex flex-col items-center gap-2 text-slate-500">
                            <Camera className="w-8 h-8 opacity-30" />
                            <span className="text-xs">Tap to upload {activeImg} image</span>
                        </div>
                    )}
                </div>
                <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => {
                        const type = (fileInputRef.current?.getAttribute("data-type") ?? "before") as "before" | "after";
                        handleImageChange(e, type);
                    }}
                />
            </div>

            {/* Location */}
            <div>
                <label className="block text-sm font-semibold text-slate-300 mb-2 flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-slate-400" />
                    Location
                </label>
                <button
                    type="button"
                    onClick={getLocation}
                    disabled={locating}
                    className="w-full flex items-center justify-center gap-2 py-3 rounded-xl border border-white/10 bg-white/5 text-sm text-slate-300 hover:bg-white/10 transition-all disabled:opacity-50"
                >
                    {locating ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                        <LocateFixed className="w-4 h-4 text-blue-400" />
                    )}
                    {locating
                        ? "Getting location..."
                        : lat
                            ? `📍 ${lat.toFixed(5)}, ${lng?.toFixed(5)}`
                            : "Capture My Location"}
                </button>
            </div>

            {/* Issue Type */}
            <div>
                <label className="block text-sm font-semibold text-slate-300 mb-2 flex items-center gap-2">
                    <Tag className="w-4 h-4 text-slate-400" />
                    Issue Type
                </label>
                <div className="flex flex-wrap gap-2">
                    {ISSUE_TYPES.map((type) => (
                        <button
                            key={type}
                            type="button"
                            onClick={() => setIssueType(type)}
                            className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all ${issueType === type
                                    ? "bg-blue-600 border-blue-500 text-white"
                                    : "bg-white/5 border-white/10 text-slate-400 hover:bg-white/10"
                                }`}
                        >
                            {type}
                        </button>
                    ))}
                </div>
            </div>

            {/* Department */}
            <div>
                <label className="block text-sm font-semibold text-slate-300 mb-2 flex items-center gap-2">
                    <Building2 className="w-4 h-4 text-slate-400" />
                    Department
                </label>
                <select
                    value={departmentId}
                    onChange={(e) => setDepartmentId(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/50 text-sm"
                >
                    <option value="" className="bg-slate-900">Select department…</option>
                    {departments.map((d) => (
                        <option key={d.id} value={d.id} className="bg-slate-900">
                            {d.name}
                        </option>
                    ))}
                </select>
            </div>

            {/* Priority */}
            <div>
                <label className="block text-sm font-semibold text-slate-300 mb-2 flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4 text-slate-400" />
                    Priority
                </label>
                <div className="grid grid-cols-3 gap-3">
                    {PRIORITIES.map((p) => (
                        <button
                            key={p.value}
                            type="button"
                            onClick={() => setPriority(p.value)}
                            className={`py-2.5 rounded-xl border text-xs font-bold uppercase tracking-wider transition-all ${priority === p.value
                                    ? p.color + " shadow-lg"
                                    : "bg-white/5 border-white/10 text-slate-500 hover:bg-white/10"
                                }`}
                        >
                            {p.label}
                        </button>
                    ))}
                </div>
            </div>

            {/* Optional title/description */}
            <div>
                <label className="block text-xs font-semibold text-slate-500 mb-1 uppercase tracking-wider">
                    Title (optional)
                </label>
                <input
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="Short description of the issue"
                    className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-blue-500/50 text-sm"
                />
            </div>
            <div>
                <label className="block text-xs font-semibold text-slate-500 mb-1 uppercase tracking-wider">
                    Notes (optional)
                </label>
                <textarea
                    rows={2}
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Additional details..."
                    className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-blue-500/50 text-sm resize-none"
                />
            </div>

            <button
                type="submit"
                disabled={loading}
                className="w-full flex items-center justify-center gap-2 py-3.5 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl transition-all disabled:opacity-50 active:scale-[0.98] shadow-lg shadow-blue-600/20"
            >
                {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <CheckCircle2 className="w-5 h-5" />}
                {loading ? "Submitting..." : "Report Issue"}
            </button>
        </form>
    );
}
