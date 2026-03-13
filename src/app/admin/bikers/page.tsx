import { createClient } from "@/lib/supabase/server";
import CreateBikerSection from "@/components/admin/CreateBikerSection";
import BikerList from "@/components/admin/BikerList";

export default async function AdminBikersPage() {
    const supabase = await createClient();

    const { data: bikers } = await supabase
        .from("users")
        .select(`
            id,
            full_name,
            email,
            role,
            created_at,
            assigned_issues:issues!issues_assigned_biker_id_fkey(id, status)
        `)
        .in("role", ["biker", "field_agent"])
        .order("created_at", { ascending: false });

    const allBikers = bikers ?? [];
    const activeBikers = allBikers.length;
    const tasksPending = allBikers.reduce((acc, b) => {
        const issues = (b.assigned_issues as any[]) ?? [];
        return acc + issues.filter((i) => i.status !== "resolved").length;
    }, 0);

    return (
        <>
            {/* Ambient background glows */}
            <div className="pointer-events-none fixed top-[-20%] left-[-10%] w-[60%] h-[60%] z-0 hidden sm:block" style={{ background: "radial-gradient(ellipse, rgba(59,130,246,0.08) 0%, transparent 70%)" }} />
            <div className="pointer-events-none fixed bottom-[-10%] right-[-10%] w-[50%] h-[50%] z-0 hidden sm:block" style={{ background: "radial-gradient(ellipse, rgba(16,185,129,0.06) 0%, transparent 70%)" }} />

            <div className="relative z-[1] grid grid-cols-1 lg:grid-cols-[1fr_380px] gap-6 sm:gap-8 items-start" style={{ fontFamily: "'DM Sans', sans-serif" }}>
                {/* Left column */}
                <div>
                    {/* Page header */}
                    <div className="mb-8">
                        <h1 className="text-[1.6rem] sm:text-[2.2rem] font-bold tracking-tight leading-tight" style={{ fontFamily: "'Clash Display', sans-serif", letterSpacing: "-0.02em" }}>Field Workers</h1>
                        <p className="mt-1 text-[0.8rem] sm:text-[0.9rem] font-light" style={{ color: "#6b7280" }}>Manage biker accounts and monitor their task statistics in real time.</p>
                    </div>

                    <BikerList bikers={allBikers} activeBikers={activeBikers} tasksPending={tasksPending} />
                </div>

                {/* Right column */}
                <div className="lg:sticky lg:top-20">
                    <CreateBikerSection />
                </div>
            </div>
        </>
    );
}
