import { createClient } from "@/lib/supabase/server";
import AdminMapView from "@/components/admin/AdminMapView";
import Link from "next/link";

export default async function AdminDashboard() {
    const supabase = await createClient();

    // Fetch basic stats
    const { count: totalIssues } = await supabase
        .from("issues")
        .select("*", { count: "exact", head: true });

    const { count: pendingIssues } = await supabase
        .from("issues")
        .select("*", { count: "exact", head: true })
        .eq("status", "pending");

    const { count: resolvedIssues } = await supabase
        .from("issues")
        .select("*", { count: "exact", head: true })
        .eq("status", "resolved");

    const { count: highPriority } = await supabase
        .from("issues")
        .select("*", { count: "exact", head: true })
        .eq("priority", "high");

    // Fetch recent issues including department data
    const { data: recentIssues } = await supabase
        .from("issues")
        .select(`
            *,
            departments(name)
        `)
        .order("created_at", { ascending: false })
        .limit(5);

    // Fetch all issues for the map
    const { data: allIssues } = await supabase
        .from("issues")
        .select("id, lat, lng, title, priority, status");

    return (
        <>
            <style>{`
                /* Admin Dashboard — Glassmorphism */
                .adm-header {
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                    margin-bottom: 2.25rem;
                    flex-wrap: wrap;
                    gap: 0.75rem;
                }
                .adm-title {
                    font-family: 'Clash Display', sans-serif;
                    font-size: 2rem;
                    font-weight: 700;
                    letter-spacing: -0.02em;
                    color: #f0f4ff;
                    text-shadow: 0 2px 20px rgba(59,130,246,0.12);
                }
                .adm-view-all {
                    color: #60a5fa;
                    font-size: 0.875rem;
                    font-weight: 500;
                    text-decoration: none;
                    transition: all 0.25s;
                    padding: 0.4rem 1rem;
                    border-radius: 10px;
                    border: 1px solid rgba(59,130,246,0.15);
                    background: rgba(59,130,246,0.06);
                }
                .adm-view-all:hover {
                    background: rgba(59,130,246,0.12);
                    border-color: rgba(59,130,246,0.3);
                    color: #93bbfc;
                    box-shadow: 0 0 20px rgba(59,130,246,0.15);
                }

                /* Stat cards — Glass */
                .adm-stat-row {
                    display: grid;
                    grid-template-columns: repeat(4, 1fr);
                    gap: 1.25rem;
                    margin-bottom: 2rem;
                }
                .adm-stat-card {
                    background: rgba(255,255,255,0.03);
                    backdrop-filter: blur(16px);
                    -webkit-backdrop-filter: blur(16px);
                    border: 1px solid rgba(255,255,255,0.07);
                    border-radius: 20px;
                    padding: 1.5rem;
                    display: flex;
                    flex-direction: column;
                    gap: 0.4rem;
                    transition: all 0.35s cubic-bezier(0.4, 0, 0.2, 1);
                    position: relative;
                    overflow: hidden;
                }
                /* Subtle inner shimmer */
                .adm-stat-card::before {
                    content: '';
                    position: absolute;
                    top: 0; left: 0; right: 0;
                    height: 1px;
                    background: linear-gradient(90deg, transparent, rgba(255,255,255,0.08), transparent);
                }
                .adm-stat-card:hover {
                    border-color: rgba(255,255,255,0.14);
                    transform: translateY(-4px);
                }
                /* Accent glow per card */
                .adm-stat-card:nth-child(1):hover {
                    box-shadow: 0 8px 40px rgba(59,130,246,0.15), 0 0 60px rgba(59,130,246,0.08);
                }
                .adm-stat-card:nth-child(2):hover {
                    box-shadow: 0 8px 40px rgba(245,158,11,0.15), 0 0 60px rgba(245,158,11,0.08);
                }
                .adm-stat-card:nth-child(3):hover {
                    box-shadow: 0 8px 40px rgba(16,185,129,0.15), 0 0 60px rgba(16,185,129,0.08);
                }
                .adm-stat-card:nth-child(4):hover {
                    box-shadow: 0 8px 40px rgba(239,68,68,0.15), 0 0 60px rgba(239,68,68,0.08);
                }

                .adm-stat-icon {
                    font-size: 1.1rem;
                    margin-bottom: 0.35rem;
                    filter: drop-shadow(0 0 6px rgba(255,255,255,0.1));
                }
                .adm-stat-value {
                    font-family: 'Clash Display', sans-serif;
                    font-size: 2.4rem;
                    font-weight: 700;
                    line-height: 1;
                }
                .adm-sv-blue   { color: #60a5fa; text-shadow: 0 0 30px rgba(59,130,246,0.3); }
                .adm-sv-amber  { color: #fbbf24; text-shadow: 0 0 30px rgba(245,158,11,0.3); }
                .adm-sv-green  { color: #34d399; text-shadow: 0 0 30px rgba(16,185,129,0.3); }
                .adm-sv-red    { color: #f87171; text-shadow: 0 0 30px rgba(239,68,68,0.3); }
                .adm-stat-label {
                    font-size: 0.78rem;
                    color: rgba(148,163,184,0.7);
                    font-weight: 400;
                    letter-spacing: 0.02em;
                }

                @keyframes admSlideIn {
                    from { opacity: 0; transform: translateY(18px) scale(0.98); }
                    to { opacity: 1; transform: translateY(0) scale(1); }
                }
                .adm-stat-card:nth-child(1) { animation: admSlideIn 0.5s cubic-bezier(0.4, 0, 0.2, 1) 0.05s both; }
                .adm-stat-card:nth-child(2) { animation: admSlideIn 0.5s cubic-bezier(0.4, 0, 0.2, 1) 0.12s both; }
                .adm-stat-card:nth-child(3) { animation: admSlideIn 0.5s cubic-bezier(0.4, 0, 0.2, 1) 0.19s both; }
                .adm-stat-card:nth-child(4) { animation: admSlideIn 0.5s cubic-bezier(0.4, 0, 0.2, 1) 0.26s both; }

                /* Dashboard grid */
                .adm-dash-grid {
                    display: grid;
                    grid-template-columns: 1fr 1fr;
                    gap: 1.5rem;
                }

                /* Panel — Glass */
                .adm-panel {
                    background: rgba(255,255,255,0.025);
                    backdrop-filter: blur(14px);
                    -webkit-backdrop-filter: blur(14px);
                    border: 1px solid rgba(255,255,255,0.07);
                    border-radius: 20px;
                    overflow: hidden;
                    animation: admSlideIn 0.5s cubic-bezier(0.4, 0, 0.2, 1) 0.3s both;
                    box-shadow: 0 4px 30px rgba(0,0,0,0.2);
                    position: relative;
                }
                .adm-panel::before {
                    content: '';
                    position: absolute;
                    top: 0; left: 0; right: 0;
                    height: 1px;
                    background: linear-gradient(90deg, transparent, rgba(255,255,255,0.06), transparent);
                }
                .adm-panel-head {
                    padding: 1.1rem 1.5rem;
                    font-family: 'Clash Display', sans-serif;
                    font-size: 0.95rem;
                    font-weight: 600;
                    border-bottom: 1px solid rgba(255,255,255,0.06);
                    color: #e2e8f0;
                    background: rgba(255,255,255,0.015);
                    letter-spacing: 0.01em;
                }

                /* Issue rows */
                .adm-issue-row {
                    padding: 0.9rem 1.5rem;
                    border-bottom: 1px solid rgba(255,255,255,0.05);
                    display: flex;
                    align-items: flex-start;
                    justify-content: space-between;
                    transition: all 0.2s ease;
                    cursor: pointer;
                    gap: 1rem;
                }
                .adm-issue-row:last-child { border-bottom: none; }
                .adm-issue-row:hover {
                    background: rgba(255,255,255,0.03);
                }

                .adm-issue-name {
                    font-size: 0.875rem;
                    font-weight: 500;
                    color: #f0f4ff;
                    margin-bottom: 4px;
                }
                .adm-issue-meta {
                    font-size: 0.75rem;
                    color: #6b7280;
                    display: flex;
                    align-items: center;
                    gap: 0.4rem;
                    flex-wrap: wrap;
                }
                .adm-dot-sep {
                    width: 3px;
                    height: 3px;
                    border-radius: 50%;
                    background: rgba(55,65,81,0.8);
                    display: inline-block;
                }

                /* Status badges with glow */
                .adm-s-resolved {
                    color: #34d399;
                    font-size: 0.72rem;
                    font-weight: 600;
                    text-shadow: 0 0 10px rgba(16,185,129,0.4);
                }
                .adm-s-pending {
                    color: #fbbf24;
                    font-size: 0.72rem;
                    font-weight: 600;
                    text-shadow: 0 0 10px rgba(245,158,11,0.4);
                }
                .adm-s-progress {
                    color: #60a5fa;
                    font-size: 0.72rem;
                    font-weight: 600;
                    text-shadow: 0 0 10px rgba(59,130,246,0.4);
                }

                .adm-priority-tag {
                    font-size: 0.72rem;
                    font-weight: 700;
                    letter-spacing: 0.06em;
                    white-space: nowrap;
                    text-transform: uppercase;
                    flex-shrink: 0;
                    padding: 0.2rem 0.6rem;
                    border-radius: 8px;
                }
                .adm-pt-high   { color: #f87171; background: rgba(239,68,68,0.1); border: 1px solid rgba(239,68,68,0.15); }
                .adm-pt-medium { color: #fbbf24; background: rgba(245,158,11,0.1); border: 1px solid rgba(245,158,11,0.15); }
                .adm-pt-low    { color: #34d399; background: rgba(16,185,129,0.1); border: 1px solid rgba(16,185,129,0.15); }

                /* Map panel — Glass */
                .adm-map-panel {
                    background: rgba(255,255,255,0.025);
                    backdrop-filter: blur(14px);
                    -webkit-backdrop-filter: blur(14px);
                    border: 1px solid rgba(255,255,255,0.07);
                    border-radius: 20px;
                    overflow: hidden;
                    animation: admSlideIn 0.5s cubic-bezier(0.4, 0, 0.2, 1) 0.35s both;
                    display: flex;
                    flex-direction: column;
                    box-shadow: 0 4px 30px rgba(0,0,0,0.2);
                    position: relative;
                }
                .adm-map-panel::before {
                    content: '';
                    position: absolute;
                    top: 0; left: 0; right: 0;
                    height: 1px;
                    background: linear-gradient(90deg, transparent, rgba(255,255,255,0.06), transparent);
                    z-index: 1;
                }
                .adm-map-panel .adm-panel-head {
                    border-bottom: 1px solid rgba(255,255,255,0.06);
                }
                .adm-map-wrap {
                    flex: 1;
                    min-height: 420px;
                }

                .adm-empty {
                    padding: 3rem;
                    text-align: center;
                    color: rgba(107,114,128,0.6);
                    font-size: 0.9rem;
                }

                @media (max-width: 960px) {
                    .adm-stat-row { grid-template-columns: repeat(2, 1fr); }
                    .adm-dash-grid { grid-template-columns: 1fr; }
                }
                @media (max-width: 640px) {
                    .adm-title { font-size: 1.5rem; }
                    .adm-stat-value { font-size: 1.75rem; }
                    .adm-stat-card { padding: 1.15rem; border-radius: 16px; }
                }
            `}</style>

            {/* Header */}
            <div className="adm-header">
                <h1 className="adm-title">Admin Dashboard</h1>
                <Link href="/admin/issues" className="adm-view-all">
                    View all issues →
                </Link>
            </div>

            {/* Stat Cards */}
            <div className="adm-stat-row">
                <div className="adm-stat-card">
                    <div className="adm-stat-icon">📈</div>
                    <div className="adm-stat-value adm-sv-blue">{totalIssues ?? 0}</div>
                    <div className="adm-stat-label">Total Issues</div>
                </div>
                <div className="adm-stat-card">
                    <div className="adm-stat-icon">🕐</div>
                    <div className="adm-stat-value adm-sv-amber">{pendingIssues ?? 0}</div>
                    <div className="adm-stat-label">Pending</div>
                </div>
                <div className="adm-stat-card">
                    <div className="adm-stat-icon">✅</div>
                    <div className="adm-stat-value adm-sv-green">{resolvedIssues ?? 0}</div>
                    <div className="adm-stat-label">Resolved</div>
                </div>
                <div className="adm-stat-card">
                    <div className="adm-stat-icon">⚠️</div>
                    <div className="adm-stat-value adm-sv-red">{highPriority ?? 0}</div>
                    <div className="adm-stat-label">High Priority</div>
                </div>
            </div>

            {/* Dashboard Grid: Recent Issues + Map */}
            <div className="adm-dash-grid">
                {/* Recent Issues Panel */}
                <div className="adm-panel">
                    <div className="adm-panel-head">Recent Issues</div>
                    {recentIssues && recentIssues.length > 0 ? (
                        recentIssues.map((issue) => {
                            const deptName = (issue.departments as { name: string } | null)?.name ?? "";
                            const PRIORITY_CLASS: Record<string, string> = {
                                high: "adm-pt-high",
                                medium: "adm-pt-medium",
                                low: "adm-pt-low",
                            };
                            const STATUS_CLASS: Record<string, string> = {
                                resolved: "adm-s-resolved",
                                pending: "adm-s-pending",
                                in_progress: "adm-s-progress",
                            };
                            const STATUS_DOT: Record<string, string> = {
                                resolved: "●",
                                pending: "●",
                                in_progress: "●",
                            };

                            return (
                                <div key={issue.id} className="adm-issue-row">
                                    <div>
                                        <div className="adm-issue-name">{issue.title}</div>
                                        <div className="adm-issue-meta">
                                            {deptName}
                                            <span className="adm-dot-sep"></span>
                                            {new Date(issue.created_at).toLocaleDateString()}
                                            <span className="adm-dot-sep"></span>
                                            <span className={STATUS_CLASS[issue.status] ?? ""}>
                                                {STATUS_DOT[issue.status]} {issue.status.replace("_", " ").replace(/\b\w/g, (l: string) => l.toUpperCase())}
                                            </span>
                                        </div>
                                    </div>
                                    <span className={`adm-priority-tag ${PRIORITY_CLASS[issue.priority] ?? "adm-pt-low"}`}>
                                        {issue.priority.toUpperCase()}
                                    </span>
                                </div>
                            );
                        })
                    ) : (
                        <div className="adm-empty">No issues reported yet.</div>
                    )}
                </div>

                {/* Map Panel */}
                <div className="adm-map-panel">
                    <div className="adm-panel-head">Issue Locations</div>
                    <div className="adm-map-wrap">
                        <AdminMapView
                            markers={allIssues?.map(i => ({
                                id: i.id,
                                lat: i.lat,
                                lng: i.lng,
                                title: i.title,
                                priority: i.priority,
                                status: i.status,
                            }))}
                        />
                    </div>
                </div>
            </div>
        </>
    );
}
