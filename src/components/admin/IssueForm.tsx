"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import {
    MapPin,
    Save,
    X,
    AlertCircle,
    Loader2
} from "lucide-react";
import dynamic from "next/dynamic";
import { Department, IssuePriority } from "@/types/database";

// Dynamically import Map with no SSR
const Map = dynamic(() => import("@/components/Map"), {
    ssr: false,
    loading: () => (
        <div className="h-[300px] w-full bg-slate-900/50 animate-pulse rounded-xl flex items-center justify-center border border-white/10">
            <MapPin className="w-8 h-8 text-slate-700" />
        </div>
    ),
});

interface IssueFormProps {
    departments: Department[];
}

export default function IssueForm({ departments }: IssueFormProps) {
    const router = useRouter();
    const supabase = createClient();

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const [formData, setFormData] = useState({
        title: "",
        description: "",
        department_id: departments[0]?.id || "",
        priority: "low" as IssuePriority,
        lat: 20.5937,
        lng: 78.9629,
    });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        try {
            const { data: { user } } = await supabase.auth.getUser();

            const { error: insertError } = await supabase
                .from("issues")
                .insert([
                    {
                        ...formData,
                        reported_by: user?.id,
                        status: "pending",
                    },
                ]);

            if (insertError) throw insertError;

            router.push("/admin/issues");
            router.refresh();
        } catch (err: any) {
            setError(err.message || "Something went wrong while creating the issue.");
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

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Details Section */}
                <div className="space-y-5">
                    <div>
                        <label className="block text-sm font-medium text-slate-300 mb-1.5">
                            Issue Title
                        </label>
                        <input
                            type="text"
                            required
                            placeholder="e.g., Pothole on Main Street"
                            className="w-full px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                            value={formData.title}
                            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-slate-300 mb-1.5">
                            Description
                        </label>
                        <textarea
                            rows={4}
                            placeholder="Provide details about the issue..."
                            className="w-full px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 resize-bottom"
                            value={formData.description}
                            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-slate-300 mb-1.5">
                                Department
                            </label>
                            <select
                                className="w-full px-4 py-2.5 rounded-xl bg-slate-800 border border-white/10 text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                                value={formData.department_id}
                                onChange={(e) => setFormData({ ...formData, department_id: e.target.value })}
                            >
                                {departments.map((dept) => (
                                    <option key={dept.id} value={dept.id}>
                                        {dept.name}
                                    </option>
                                ))}
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-300 mb-1.5">
                                Priority Level
                            </label>
                            <select
                                className="w-full px-4 py-2.5 rounded-xl bg-slate-800 border border-white/10 text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                                value={formData.priority}
                                onChange={(e) => setFormData({ ...formData, priority: e.target.value as IssuePriority })}
                            >
                                <option value="low">Low</option>
                                <option value="medium">Medium</option>
                                <option value="high">High</option>
                            </select>
                        </div>
                    </div>
                </div>

                {/* Location Picker Section */}
                <div className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-slate-300 mb-1.5 flex items-center gap-2">
                            <MapPin className="w-4 h-4 text-blue-400" />
                            Select Location on Map
                        </label>
                        <div className="h-[300px] rounded-xl overflow-hidden border border-white/10">
                            <Map
                                center={[formData.lat, formData.lng]}
                                zoom={13}
                                markers={[{
                                    id: 'picker',
                                    lat: formData.lat,
                                    lng: formData.lng,
                                    title: 'Selected Location',
                                    priority: formData.priority,
                                    status: 'pending'
                                }]}
                            />
                        </div>
                        <p className="text-[10px] text-slate-500 mt-2 italic text-center">
                            Note: Map interactive picking is disabled for this proof-of-concept. Using default coordinates.
                        </p>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="text-[10px] text-slate-500 uppercase tracking-wider font-bold mb-1 block">Latitude</label>
                            <input
                                type="number"
                                step="any"
                                className="w-full px-3 py-1.5 rounded-lg bg-white/5 border border-white/10 text-xs text-white"
                                value={formData.lat}
                                onChange={(e) => setFormData({ ...formData, lat: parseFloat(e.target.value) })}
                            />
                        </div>
                        <div>
                            <label className="text-[10px] text-slate-500 uppercase tracking-wider font-bold mb-1 block">Longitude</label>
                            <input
                                type="number"
                                step="any"
                                className="w-full px-3 py-1.5 rounded-lg bg-white/5 border border-white/10 text-xs text-white"
                                value={formData.lng}
                                onChange={(e) => setFormData({ ...formData, lng: parseFloat(e.target.value) })}
                            />
                        </div>
                    </div>
                </div>
            </div>

            <div className="pt-6 border-t border-white/10 flex items-center justify-end gap-4">
                <button
                    type="button"
                    onClick={() => router.back()}
                    className="px-6 py-2.5 rounded-xl text-slate-400 hover:text-white hover:bg-white/5 transition-colors"
                >
                    Cancel
                </button>
                <button
                    type="submit"
                    disabled={loading}
                    className="flex items-center gap-2 px-8 py-2.5 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white font-semibold rounded-xl transition-all shadow-lg shadow-blue-600/20 active:scale-95"
                >
                    {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                    {loading ? "Creating..." : "Create Issue"}
                </button>
            </div>
        </form>
    );
}
