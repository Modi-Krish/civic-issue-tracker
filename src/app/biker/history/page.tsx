import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { ImageOff } from "lucide-react";
import Link from "next/link";

interface SearchParams {
    filter?: string;
}

export default async function BikerHistoryPage({
    searchParams,
}: {
    searchParams: Promise<SearchParams>;
}) {
    const { filter } = await searchParams;
    const supabase = await createClient();

    const {
        data: { user },
    } = await supabase.auth.getUser();
    if (!user) redirect("/login");

    // Build date filter
    let since: string | null = null;
    if (filter === "today") {
        const d = new Date(); d.setHours(0, 0, 0, 0);
        since = d.toISOString();
    } else if (filter === "week") {
        const d = new Date(); d.setDate(d.getDate() - 7);
        since = d.toISOString();
    } else if (filter === "month") {
        const d = new Date(); d.setMonth(d.getMonth() - 1);
        since = d.toISOString();
    }

    // Fetch issues REPORTED by this biker (any status)
    let reportedQuery = supabase
        .from("issues")
        .select("*, departments(name)")
        .eq("reported_by", user.id)
        .order("created_at", { ascending: false });

    if (since) reportedQuery = reportedQuery.gte("created_at", since);

    // Fetch issues ASSIGNED to this biker that are resolved
    let assignedQuery = supabase
        .from("issues")
        .select("*, departments(name)")
        .eq("assigned_biker_id", user.id)
        .neq("reported_by", user.id) // avoid duplicates
        .order("created_at", { ascending: false });

    if (since) assignedQuery = assignedQuery.gte("created_at", since);

    const [{ data: reportedIssues }, { data: assignedIssues }] = await Promise.all([
        reportedQuery,
        assignedQuery,
    ]);

    const allIssues = [...(reportedIssues ?? []), ...(assignedIssues ?? [])];
    const resolvedCount = allIssues.filter((i) => i.status === "resolved").length;

    const FILTERS = [
        { label: "All Time", value: "" },
        { label: "Today", value: "today" },
        { label: "This Week", value: "week" },
        { label: "This Month", value: "month" },
    ];

    const DEPT_ICONS: Record<string, string> = {
        "Electricity": "⚡",
        "Road": "🛣️",
        "Garbage": "🗑️",
        "Water": "💧",
        "Sanitation": "🧹",
    };

    return (
        <>
            <style>{`
                /* History page */
                .hist-header {
                    display: flex;
                    align-items: flex-start;
                    justify-content: space-between;
                    margin-bottom: 2rem;
                    flex-wrap: wrap;
                    gap: 1rem;
                }
                .hist-title-row {
                    display: flex;
                    align-items: center;
                    gap: 0.75rem;
                }
                .hist-title-icon { font-size: 1.75rem; color: #10b981; }
                .hist-title {
                    font-family: 'Clash Display', sans-serif;
                    font-size: 2.2rem;
                    font-weight: 700;
                    letter-spacing: -0.02em;
                    color: #f0f4ff;
                }
                .hist-sub {
                    margin-top: 0.4rem;
                    color: #6b7280;
                    font-size: 0.9rem;
                    font-weight: 300;
                }
                .hist-total-block { text-align: right; }
                .hist-total-num {
                    font-family: 'Clash Display', sans-serif;
                    font-size: 2.2rem;
                    font-weight: 700;
                    color: #10b981;
                    line-height: 1;
                }
                .hist-total-label {
                    font-size: 0.72rem;
                    text-transform: uppercase;
                    letter-spacing: 0.08em;
                    color: #6b7280;
                }
                .hist-resolved-count {
                    font-size: 0.85rem;
                    color: #10b981;
                    font-weight: 500;
                    margin-top: 3px;
                }

                /* Filter chips */
                .hist-filter-row {
                    display: flex;
                    gap: 0.5rem;
                    margin-bottom: 1.75rem;
                    align-items: center;
                    flex-wrap: wrap;
                }
                .hist-filter-icon {
                    font-size: 0.85rem;
                    color: #6b7280;
                    margin-right: 0.15rem;
                }
                .hist-chip {
                    padding: 0.3rem 0.85rem;
                    border-radius: 999px;
                    font-size: 0.78rem;
                    font-weight: 500;
                    cursor: pointer;
                    border: 1px solid rgba(255,255,255,0.07);
                    background: transparent;
                    color: #6b7280;
                    transition: all 0.2s;
                    font-family: 'DM Sans', sans-serif;
                    text-decoration: none;
                    display: inline-block;
                }
                .hist-chip:hover {
                    background: #181c22;
                    color: #f0f4ff;
                    border-color: rgba(255,255,255,0.15);
                }
                .hist-chip-active {
                    background: #10b981 !important;
                    color: #0a0c0f !important;
                    border-color: #10b981 !important;
                    font-weight: 600;
                }

                /* Cards grid */
                .hist-cards-grid {
                    display: grid;
                    grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
                    gap: 1.25rem;
                }

                .hist-card {
                    background: #111418;
                    border: 1px solid rgba(255,255,255,0.07);
                    border-radius: 16px;
                    overflow: hidden;
                    cursor: pointer;
                    transition: all 0.25s cubic-bezier(0.4,0,0.2,1);
                    position: relative;
                    text-decoration: none;
                    color: inherit;
                    display: block;
                }
                .hist-card:hover {
                    border-color: rgba(59,130,246,0.3);
                    transform: translateY(-2px);
                    box-shadow: 0 20px 40px rgba(0,0,0,0.4);
                }
                .hist-card:nth-child(1) { animation: histSlideIn 0.4s ease 0.05s both; }
                .hist-card:nth-child(2) { animation: histSlideIn 0.4s ease 0.10s both; }
                .hist-card:nth-child(3) { animation: histSlideIn 0.4s ease 0.15s both; }
                .hist-card:nth-child(4) { animation: histSlideIn 0.4s ease 0.20s both; }
                .hist-card:nth-child(5) { animation: histSlideIn 0.4s ease 0.25s both; }
                .hist-card:nth-child(6) { animation: histSlideIn 0.4s ease 0.30s both; }

                @keyframes histSlideIn {
                    from { opacity: 0; transform: translateY(16px); }
                    to { opacity: 1; transform: translateY(0); }
                }

                .hist-card-img {
                    height: 160px;
                    background: #181c22;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    border-bottom: 1px solid rgba(255,255,255,0.07);
                    position: relative;
                    overflow: hidden;
                }
                .hist-card-img img {
                    width: 100%;
                    height: 100%;
                    object-fit: cover;
                    transition: transform 0.3s;
                }
                .hist-card:hover .hist-card-img img {
                    transform: scale(1.05);
                }
                .hist-card-img-icon {
                    font-size: 3rem;
                    opacity: 0.2;
                }
                .hist-card-ext {
                    position: absolute;
                    top: 0.6rem;
                    right: 0.6rem;
                    background: rgba(10,12,15,0.8);
                    backdrop-filter: blur(8px);
                    border: 1px solid rgba(255,255,255,0.07);
                    border-radius: 6px;
                    padding: 0.2rem 0.5rem;
                    font-size: 0.72rem;
                    color: #6b7280;
                    transition: all 0.15s;
                }
                .hist-card:hover .hist-card-ext {
                    background: #111418;
                    color: #f0f4ff;
                }

                .hist-card-body { padding: 1.1rem; }
                .hist-card-name {
                    font-family: 'Clash Display', sans-serif;
                    font-size: 0.95rem;
                    font-weight: 600;
                    color: #f0f4ff;
                    margin-bottom: 0.5rem;
                    line-height: 1.3;
                }
                .hist-card-tags {
                    display: flex;
                    align-items: center;
                    gap: 0.5rem;
                    margin-bottom: 0.85rem;
                    flex-wrap: wrap;
                }
                .hist-dept-tag {
                    font-size: 0.7rem;
                    font-weight: 600;
                    letter-spacing: 0.08em;
                    text-transform: uppercase;
                    color: #6b7280;
                }
                .hist-dot-sep {
                    width: 3px;
                    height: 3px;
                    border-radius: 50%;
                    background: #374151;
                    display: inline-block;
                }
                .hist-priority-high   { color: #ef4444; font-size: 0.7rem; font-weight: 700; letter-spacing: 0.06em; text-transform: uppercase; }
                .hist-priority-medium { color: #f59e0b; font-size: 0.7rem; font-weight: 700; letter-spacing: 0.06em; text-transform: uppercase; }
                .hist-priority-low    { color: #6b7280; font-size: 0.7rem; font-weight: 700; letter-spacing: 0.06em; text-transform: uppercase; }

                .hist-card-footer {
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                }
                .hist-badge {
                    display: inline-flex;
                    align-items: center;
                    gap: 5px;
                    padding: 0.25rem 0.65rem;
                    border-radius: 999px;
                    font-size: 0.7rem;
                    font-weight: 500;
                    letter-spacing: 0.05em;
                    text-transform: uppercase;
                }
                .hist-badge::before {
                    content: '';
                    width: 5px;
                    height: 5px;
                    border-radius: 50%;
                    background: currentColor;
                }
                .hist-badge-resolved {
                    background: rgba(16,185,129,0.12);
                    color: #10b981;
                    border: 1px solid rgba(16,185,129,0.2);
                }
                .hist-badge-pending {
                    background: rgba(245,158,11,0.12);
                    color: #f59e0b;
                    border: 1px solid rgba(245,158,11,0.2);
                }
                .hist-badge-progress {
                    background: rgba(59,130,246,0.12);
                    color: #3b82f6;
                    border: 1px solid rgba(59,130,246,0.2);
                }
                .hist-card-date {
                    font-size: 0.75rem;
                    color: #6b7280;
                }

                /* Empty */
                .hist-empty {
                    border: 1px dashed rgba(255,255,255,0.07);
                    border-radius: 16px;
                    padding: 4rem 2rem;
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    justify-content: center;
                    text-align: center;
                    min-height: 280px;
                    animation: histSlideIn 0.4s ease 0.1s both;
                }
                .hist-empty-icon {
                    font-size: 2.5rem;
                    opacity: 0.2;
                    margin-bottom: 1rem;
                }
                .hist-empty-text {
                    font-size: 0.9rem;
                    color: #6b7280;
                    margin-bottom: 0.75rem;
                }
                .hist-empty-link {
                    color: #3b82f6;
                    font-size: 0.875rem;
                    font-weight: 500;
                    text-decoration: none;
                    transition: opacity 0.2s;
                }
                .hist-empty-link:hover { opacity: 0.7; }

                @media (max-width: 640px) {
                    .hist-title { font-size: 1.6rem; }
                    .hist-total-num { font-size: 1.6rem; }
                    .hist-cards-grid { grid-template-columns: 1fr; }
                    .hist-sub { font-size: 0.8rem; }
                }
            `}</style>

            {/* Header */}
            <div className="hist-header">
                <div>
                    <div className="hist-title-row">
                        <span className="hist-title-icon">✅</span>
                        <h1 className="hist-title">History</h1>
                    </div>
                    <p className="hist-sub">All issues you have reported or worked on.</p>
                </div>
                <div className="hist-total-block">
                    <div className="hist-total-num">{allIssues.length}</div>
                    <div className="hist-total-label">Total</div>
                    <div className="hist-resolved-count">{resolvedCount} resolved</div>
                </div>
            </div>

            {/* Filter Chips */}
            <div className="hist-filter-row">
                <span className="hist-filter-icon">▼</span>
                {FILTERS.map((f) => (
                    <Link
                        key={f.value}
                        href={f.value ? `/biker/history?filter=${f.value}` : "/biker/history"}
                        className={`hist-chip ${(filter ?? "") === f.value ? "hist-chip-active" : ""}`}
                    >
                        {f.label}
                    </Link>
                ))}
            </div>

            {/* Issues Grid */}
            {allIssues.length > 0 ? (
                <div className="hist-cards-grid">
                    {allIssues.map((issue) => {
                        const deptName = (issue.departments as { name: string } | null)?.name ?? "";
                        const deptIcon = DEPT_ICONS[deptName] ?? "📋";

                        const PRIORITY_CLASS: Record<string, string> = {
                            high: "hist-priority-high",
                            medium: "hist-priority-medium",
                            low: "hist-priority-low",
                        };

                        const BADGE_CLASS: Record<string, string> = {
                            resolved: "hist-badge-resolved",
                            pending: "hist-badge-pending",
                            in_progress: "hist-badge-progress",
                        };

                        return (
                            <Link
                                key={issue.id}
                                href={`/biker/issues/${issue.id}`}
                                className="hist-card"
                            >
                                {/* Photo / Placeholder */}
                                <div className="hist-card-img">
                                    {issue.photo_url ? (
                                        <img src={issue.photo_url} alt={issue.title} />
                                    ) : (
                                        <div className="hist-card-img-icon">{deptIcon}</div>
                                    )}
                                    <div className="hist-card-ext">↗ Open</div>
                                </div>

                                <div className="hist-card-body">
                                    <div className="hist-card-name">
                                        {issue.title || `${issue.issue_type ?? "Issue"} — ${deptName}`}
                                    </div>
                                    <div className="hist-card-tags">
                                        <span className="hist-dept-tag">{deptName}</span>
                                        <span className="hist-dot-sep"></span>
                                        <span className={PRIORITY_CLASS[issue.priority] ?? "hist-priority-low"}>
                                            {issue.priority.charAt(0).toUpperCase() + issue.priority.slice(1)}
                                        </span>
                                    </div>
                                    <div className="hist-card-footer">
                                        <span className={`hist-badge ${BADGE_CLASS[issue.status] ?? ""}`}>
                                            {issue.status.replace("_", " ")}
                                        </span>
                                        <span className="hist-card-date">
                                            📅 {new Date(issue.resolved_at ?? issue.created_at).toLocaleDateString()}
                                        </span>
                                    </div>
                                </div>
                            </Link>
                        );
                    })}
                </div>
            ) : (
                <div className="hist-empty">
                    <div className="hist-empty-icon">✅</div>
                    <div className="hist-empty-text">No issues found for this period.</div>
                    <Link href="/biker" className="hist-empty-link">
                        Report a new issue →
                    </Link>
                </div>
            )}
        </>
    );
}
