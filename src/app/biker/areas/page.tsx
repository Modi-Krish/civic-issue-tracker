import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { MapPin, Navigation } from "lucide-react";
import BikerMapView from "@/components/biker/BikerMapView";
import Link from "next/link";

export default async function BikerAreasPage() {
    const supabase = await createClient();

    const {
        data: { user },
    } = await supabase.auth.getUser();
    if (!user) redirect("/login");

    // Fetch all assigned + recent nearby pending issues
    const { data: assignedIssues } = await supabase
        .from("issues")
        .select("id, title, lat, lng, priority, status, departments(name)")
        .eq("assigned_biker_id", user.id)
        .order("created_at", { ascending: false });

    // Fetch nearby/other pending issues (unassigned) for context
    const { data: nearbyIssues } = await supabase
        .from("issues")
        .select("id, title, lat, lng, priority, status, departments(name)")
        .is("assigned_biker_id", null)
        .eq("status", "pending")
        .limit(30);

    const assignedMarkers = (assignedIssues ?? []).map((i) => ({
        id: i.id,
        lat: i.lat,
        lng: i.lng,
        title: i.title,
        priority: i.priority,
        status: i.status,
    }));

    const nearbyMarkers = (nearbyIssues ?? []).map((i) => ({
        id: i.id,
        lat: i.lat,
        lng: i.lng,
        title: `[Nearby] ${i.title}`,
        priority: i.priority,
        status: i.status,
    }));

    const allMarkers = [...assignedMarkers, ...nearbyMarkers];

    return (
        <div className="flex flex-col h-full">
            {/* Header */}
            <div className="mb-6 flex items-start justify-between">
                <div>
                    <h1 className="text-3xl font-bold mb-1 flex items-center gap-2">
                        <Navigation className="w-7 h-7 text-blue-400" />
                        Areas
                    </h1>
                    <p className="text-slate-400 text-sm">
                        Your assigned issues and nearby unassigned reports on the map.
                    </p>
                </div>
                <div className="flex gap-4 text-xs text-slate-400">
                    <span className="flex items-center gap-1.5">
                        <span className="w-2.5 h-2.5 rounded-full bg-blue-500 inline-block" />
                        Assigned ({assignedMarkers.length})
                    </span>
                    <span className="flex items-center gap-1.5">
                        <span className="w-2.5 h-2.5 rounded-full bg-slate-500 inline-block" />
                        Nearby ({nearbyMarkers.length})
                    </span>
                </div>
            </div>

            {/* Map */}
            <div className="rounded-2xl border border-white/10 overflow-hidden bg-white/5 flex-1 min-h-[480px]">
                <BikerMapView markers={allMarkers} />
            </div>

            {/* Assigned list below map */}
            {assignedIssues && assignedIssues.length > 0 && (
                <div className="mt-6">
                    <h2 className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-3 flex items-center gap-2">
                        <MapPin className="w-4 h-4" />
                        Assigned Issues
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        {assignedIssues.map((issue) => (
                            <Link
                                key={issue.id}
                                href={`/biker/issues/${issue.id}`}
                                className="flex items-center justify-between p-4 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 transition-colors group"
                            >
                                <div>
                                    <p className="font-semibold text-sm text-slate-200 group-hover:text-blue-400 transition-colors">
                                        {issue.title}
                                    </p>
                                    <p className="text-[10px] text-slate-500 mt-0.5 uppercase">
                                        {(issue.departments as unknown as { name: string } | null)?.name} · {issue.priority}
                                    </p>
                                </div>
                                <span
                                    className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wider ${issue.status === "pending"
                                        ? "bg-amber-500/10 text-amber-400"
                                        : issue.status === "in_progress"
                                            ? "bg-blue-500/10 text-blue-400"
                                            : "bg-emerald-500/10 text-emerald-400"
                                        }`}
                                >
                                    {issue.status.replace("_", " ")}
                                </span>
                            </Link>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}
