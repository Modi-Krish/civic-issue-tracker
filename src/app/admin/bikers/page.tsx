import { createClient } from "@/lib/supabase/server";
import { Users, CheckCircle2, Clock, Bike } from "lucide-react";
import CreateBikerSection from "@/components/admin/CreateBikerSection";

export default async function AdminBikersPage() {
    const supabase = await createClient();

    // Fetch all bikers with their assigned issue counts
    const { data: bikers } = await supabase
        .from("users")
        .select(`
            id,
            full_name,
            email,
            created_at,
            assigned_issues:issues!issues_assigned_biker_id_fkey(id, status)
        `)
        .eq("role", "biker")
        .order("created_at", { ascending: false });

    return (
        <div className="max-w-6xl mx-auto">
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h1 className="text-3xl font-bold">Field Workers</h1>
                    <p className="text-slate-400 mt-1">Manage biker accounts and view their task statistics.</p>
                </div>
                <div className="flex items-center gap-2 bg-blue-500/10 border border-blue-500/20 rounded-xl px-4 py-2">
                    <Bike className="w-5 h-5 text-blue-400" />
                    <span className="text-blue-300 font-medium">{bikers?.length ?? 0} Bikers</span>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Biker List */}
                <div className="lg:col-span-2 space-y-4">
                    {bikers && bikers.length > 0 ? (
                        bikers.map((biker) => {
                            const issues = (biker.assigned_issues as any[]) ?? [];
                            const resolved = issues.filter((i) => i.status === "resolved").length;
                            const pending = issues.filter((i) => i.status !== "resolved").length;

                            return (
                                <div
                                    key={biker.id}
                                    className="bg-white/5 border border-white/10 rounded-2xl p-5 hover:border-white/20 transition-colors"
                                >
                                    <div className="flex items-start justify-between gap-4">
                                        <div className="flex items-center gap-4">
                                            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-emerald-500 flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
                                                {(biker.full_name || biker.email || "?")[0].toUpperCase()}
                                            </div>
                                            <div>
                                                <p className="font-semibold text-white">
                                                    {biker.full_name || "Unnamed Biker"}
                                                </p>
                                                <p className="text-sm text-slate-400">{biker.email}</p>
                                            </div>
                                        </div>
                                        <span className="text-[10px] px-2 py-0.5 rounded-full bg-blue-500/10 text-blue-400 font-bold uppercase tracking-wider border border-blue-500/20">
                                            Active
                                        </span>
                                    </div>

                                    <div className="grid grid-cols-3 gap-3 mt-5 pt-4 border-t border-white/5">
                                        <div className="text-center">
                                            <p className="text-2xl font-bold text-white">{issues.length}</p>
                                            <p className="text-[10px] text-slate-500 uppercase tracking-wider mt-0.5">Total</p>
                                        </div>
                                        <div className="text-center">
                                            <div className="flex items-center justify-center gap-1">
                                                <Clock className="w-3 h-3 text-amber-400" />
                                                <p className="text-2xl font-bold text-amber-400">{pending}</p>
                                            </div>
                                            <p className="text-[10px] text-slate-500 uppercase tracking-wider mt-0.5">Pending</p>
                                        </div>
                                        <div className="text-center">
                                            <div className="flex items-center justify-center gap-1">
                                                <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                                                <p className="text-2xl font-bold text-emerald-400">{resolved}</p>
                                            </div>
                                            <p className="text-[10px] text-slate-500 uppercase tracking-wider mt-0.5">Resolved</p>
                                        </div>
                                    </div>
                                </div>
                            );
                        })
                    ) : (
                        <div className="h-64 rounded-2xl border-2 border-dashed border-white/5 flex flex-col items-center justify-center text-slate-500 gap-3">
                            <Users className="w-10 h-10 opacity-20" />
                            <p className="text-sm">No bikers registered yet.</p>
                            <p className="text-xs text-slate-600">Use the form to create the first one →</p>
                        </div>
                    )}
                </div>

                {/* Create Biker Sidebar */}
                <div className="lg:col-span-1">
                    <div className="bg-white/5 border border-white/10 rounded-2xl p-6 sticky top-0">
                        <h2 className="text-lg font-bold mb-1">Create Field Worker</h2>
                        <p className="text-xs text-slate-500 mb-6">
                            The new worker can log in immediately with these credentials.
                        </p>
                        <CreateBikerSection />
                    </div>
                </div>
            </div>
        </div>
    );
}
