import { createClient } from "@/lib/supabase/server";
import {
    MapPin,
    User,
    Calendar,
    ClipboardList,
    ImageOff,
} from "lucide-react";
import Link from "next/link";
import SolveButton from "@/components/department/SolveButton";

interface SearchParams {
    status?: string;
    priority?: string;
}

export default async function DepartmentDashboard({
    searchParams,
}: {
    searchParams: Promise<SearchParams>;
}) {
    const { status, priority } = await searchParams;
    const supabase = await createClient();

    const {
        data: { user },
    } = await supabase.auth.getUser();

    // Get the department_id for this user
    const { data: profile } = await supabase
        .from("users")
        .select(`
            department_id,
            departments:department_id (name)
        `)
        .eq("id", user?.id ?? "")
        .single();

    // @ts-expect-error - The join returns an object or array of objects depending on the relation
    const dept = profile?.departments as { name: string } | null;
    const departmentId = profile?.department_id;
    const departmentName = dept?.name ?? "Your Department";

    // Fetch ALL issues for this department with reporter info
    const { data: allIssues } = await supabase
        .from("issues")
        .select(
            `
            id,
            title,
            description,
            photo_url,
            status,
            priority,
            lat,
            lng,
            created_at,
            resolved_at,
            reporter:reported_by(full_name, email, avatar_url),
            biker:assigned_biker_id(full_name, email)
        `
        )
        .eq("department_id", departmentId ?? "")
        .order("created_at", { ascending: false });

    // Stat counts
    const pending = allIssues?.filter((i) => i.status === "pending") ?? [];
    const inProgress = allIssues?.filter((i) => i.status === "in_progress") ?? [];
    const resolved = allIssues?.filter((i) => i.status === "resolved") ?? [];

    // Apply client-side filters from URL params
    let filteredIssues = allIssues ?? [];
    if (status && status !== "all") {
        filteredIssues = filteredIssues.filter((i) => i.status === status);
    }
    if (priority && priority !== "all") {
        filteredIssues = filteredIssues.filter((i) => i.priority === priority);
    }

    const statusFilters = [
        { label: "All", value: "all" },
        { label: "Pending", value: "pending" },
        { label: "In Progress", value: "in_progress" },
        { label: "Resolved", value: "resolved" },
    ];

    const priorityFilters = [
        { label: "All Priority", value: "all" },
        { label: "High", value: "high" },
        { label: "Medium", value: "medium" },
        { label: "Low", value: "low" },
    ];

    function buildUrl(newStatus?: string, newPriority?: string) {
        const params = new URLSearchParams();
        const s = newStatus ?? status ?? "all";
        const p = newPriority ?? priority ?? "all";
        if (s && s !== "all") params.set("status", s);
        if (p && p !== "all") params.set("priority", p);
        const qs = params.toString();
        return `/department${qs ? `?${qs}` : ""}`;
    }

    const totalCount = allIssues?.length ?? 0;

    return (
        <>
            <style>{`
                .dept-title {
                    font-family: 'Clash Display', sans-serif;
                    font-size: 2.2rem;
                    font-weight: 700;
                    letter-spacing: -0.02em;
                    margin-bottom: 0.4rem;
                    color: #f0f4ff;
                }
                .dept-sub {
                    color: #6b7280;
                    font-size: 0.9rem;
                    font-weight: 300;
                    margin-bottom: 2rem;
                }

                /* Stat cards */
                .dept-stat-row {
                    display: grid;
                    grid-template-columns: repeat(2, 1fr);
                    gap: 0.6rem;
                    margin-bottom: 1.75rem;
                }
                @media (min-width: 640px) {
                    .dept-stat-row {
                        grid-template-columns: repeat(4, 1fr);
                        gap: 1rem;
                    }
                }
                .dept-stat-card {
                    background: #111418;
                    border: 1px solid rgba(255,255,255,0.07);
                    border-radius: 16px;
                    padding: 1.1rem 1.25rem;
                    display: flex;
                    flex-direction: column;
                    gap: 0.3rem;
                    transition: all 0.25s;
                    text-decoration: none;
                    color: inherit;
                }
                .dept-stat-card:nth-child(1) { animation: deptSlideIn 0.4s ease 0.05s both; }
                .dept-stat-card:nth-child(2) { animation: deptSlideIn 0.4s ease 0.10s both; }
                .dept-stat-card:nth-child(3) { animation: deptSlideIn 0.4s ease 0.15s both; }
                .dept-stat-card:nth-child(4) { animation: deptSlideIn 0.4s ease 0.20s both; }
                .dept-stat-card:hover {
                    border-color: rgba(59,130,246,0.3);
                    transform: translateY(-2px);
                    box-shadow: 0 20px 40px rgba(0,0,0,0.3);
                }
                .dept-stat-icon { font-size: 0.9rem; }
                .dept-stat-value {
                    font-family: 'Clash Display', sans-serif;
                    font-size: 1.9rem;
                    font-weight: 700;
                    line-height: 1;
                }
                .dept-sv-blue   { color: #3b82f6; }
                .dept-sv-amber  { color: #f59e0b; }
                .dept-sv-purple { color: #8b5cf6; }
                .dept-sv-green  { color: #10b981; }
                .dept-stat-label {
                    font-size: 0.72rem;
                    text-transform: uppercase;
                    letter-spacing: 0.07em;
                    color: #6b7280;
                    font-weight: 300;
                }

                @keyframes deptSlideIn {
                    from { opacity: 0; transform: translateY(14px); }
                    to { opacity: 1; transform: translateY(0); }
                }

                /* Filter chips */
                .dept-filter-row {
                    display: flex;
                    gap: 0.4rem;
                    margin-bottom: 0.75rem;
                    align-items: center;
                    flex-wrap: wrap;
                }
                .dept-filter-icon {
                    font-size: 0.85rem;
                    color: #6b7280;
                    margin-right: 0.15rem;
                }
                .dept-chip {
                    padding: 0.28rem 0.75rem;
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
                .dept-chip:hover {
                    background: #181c22;
                    color: #f0f4ff;
                }
                .dept-chip-active-green {
                    background: #10b981 !important;
                    color: #0a0c0f !important;
                    border-color: #10b981 !important;
                    font-weight: 600;
                }
                .dept-chip-active-purple {
                    background: #8b5cf6 !important;
                    color: white !important;
                    border-color: #8b5cf6 !important;
                    font-weight: 600;
                }

                .dept-issues-count {
                    font-size: 0.78rem;
                    font-weight: 600;
                    color: #6b7280;
                    letter-spacing: 0.07em;
                    text-transform: uppercase;
                    margin-bottom: 1rem;
                }

                /* Issue rows */
                .dept-issue-list {
                    display: flex;
                    flex-direction: column;
                    gap: 0.75rem;
                }
                .dept-issue-row {
                    background: #111418;
                    border: 1px solid rgba(255,255,255,0.07);
                    border-radius: 16px;
                    padding: 1.1rem 1.25rem;
                    display: flex;
                    align-items: center;
                    gap: 1rem;
                    transition: all 0.25s;
                    animation: deptSlideIn 0.4s ease 0.05s both;
                }
                .dept-issue-row:hover {
                    border-color: rgba(59,130,246,0.3);
                    transform: translateX(2px);
                    box-shadow: 0 8px 30px rgba(0,0,0,0.3);
                }

                .dept-img-placeholder {
                    width: 52px;
                    height: 52px;
                    border-radius: 10px;
                    background: #181c22;
                    border: 1px solid rgba(255,255,255,0.07);
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    color: #374151;
                    flex-shrink: 0;
                    overflow: hidden;
                }
                .dept-img-placeholder img {
                    width: 100%;
                    height: 100%;
                    object-fit: cover;
                }
                .dept-row-info {
                    flex: 1;
                    min-width: 0;
                }
                .dept-row-name {
                    font-family: 'Clash Display', sans-serif;
                    font-size: 0.95rem;
                    font-weight: 600;
                    color: #f0f4ff;
                    margin-bottom: 0.25rem;
                }
                .dept-row-desc {
                    font-size: 0.78rem;
                    color: #6b7280;
                    margin-bottom: 0.4rem;
                    overflow: hidden;
                    text-overflow: ellipsis;
                    white-space: nowrap;
                }
                .dept-row-meta {
                    display: flex;
                    align-items: center;
                    gap: 0.75rem;
                    flex-wrap: wrap;
                    font-size: 0.75rem;
                    color: #6b7280;
                }
                .dept-row-meta-item {
                    display: flex;
                    align-items: center;
                    gap: 0.25rem;
                }
                .dept-row-status {
                    margin-top: 0.45rem;
                    display: flex;
                    align-items: center;
                    gap: 0.5rem;
                    flex-wrap: wrap;
                }

                .dept-badge {
                    display: inline-flex;
                    align-items: center;
                    gap: 5px;
                    padding: 0.22rem 0.6rem;
                    border-radius: 999px;
                    font-size: 0.68rem;
                    font-weight: 500;
                    letter-spacing: 0.05em;
                    text-transform: uppercase;
                }
                .dept-badge::before {
                    content: '';
                    width: 5px;
                    height: 5px;
                    border-radius: 50%;
                    background: currentColor;
                }
                .dept-badge-green {
                    background: rgba(16,185,129,0.12);
                    color: #10b981;
                    border: 1px solid rgba(16,185,129,0.2);
                }
                .dept-badge-amber {
                    background: rgba(245,158,11,0.12);
                    color: #f59e0b;
                    border: 1px solid rgba(245,158,11,0.2);
                }
                .dept-badge-blue {
                    background: rgba(59,130,246,0.12);
                    color: #3b82f6;
                    border: 1px solid rgba(59,130,246,0.2);
                }
                .dept-resolved-date {
                    font-size: 0.72rem;
                    color: #374151;
                }

                .dept-row-priority {
                    font-size: 0.78rem;
                    font-weight: 700;
                    letter-spacing: 0.06em;
                    text-align: right;
                    white-space: nowrap;
                    flex-shrink: 0;
                    text-transform: uppercase;
                }
                .dept-rp-high   { color: #ef4444; }
                .dept-rp-medium { color: #f59e0b; }
                .dept-rp-low    { color: #6b7280; }

                /* Empty state */
                .dept-empty-area {
                    border: 1px dashed rgba(255,255,255,0.07);
                    border-radius: 16px;
                    padding: 4rem 2rem;
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    justify-content: center;
                    text-align: center;
                    min-height: 280px;
                    animation: deptSlideIn 0.4s ease 0.1s both;
                }
                .dept-empty-icon {
                    font-size: 2.5rem;
                    opacity: 0.2;
                    margin-bottom: 1rem;
                }
                .dept-empty-text {
                    font-size: 0.9rem;
                    color: #6b7280;
                    margin-bottom: 0.75rem;
                }
                .dept-clear-link {
                    color: #3b82f6;
                    font-size: 0.875rem;
                    font-weight: 500;
                    cursor: pointer;
                    text-decoration: none;
                    transition: opacity 0.2s;
                }
                .dept-clear-link:hover { opacity: 0.7; }

                /* High priority alert */
                .dept-alert-bar {
                    display: flex;
                    align-items: center;
                    gap: 0.75rem;
                    background: rgba(239,68,68,0.08);
                    border: 1px solid rgba(239,68,68,0.15);
                    border-radius: 14px;
                    padding: 0.75rem 1.25rem;
                    margin-bottom: 1.25rem;
                    font-size: 0.85rem;
                    color: #fca5a5;
                    animation: deptSlideIn 0.35s ease 0.12s both;
                }
                .dept-alert-bar a {
                    margin-left: auto;
                    color: #ef4444;
                    font-size: 0.78rem;
                    font-weight: 600;
                    text-decoration: none;
                    white-space: nowrap;
                }
                .dept-alert-bar a:hover { opacity: 0.7; }

                @media (max-width: 640px) {
                    .dept-title { font-size: 1.6rem; }
                    .dept-stat-row { gap: 0.5rem; }
                    .dept-stat-value { font-size: 1.5rem; }
                    .dept-stat-card { padding: 0.85rem 1rem; min-width: 0; }
                    .dept-stat-label { font-size: 0.65rem; }
                    .dept-issue-row { flex-direction: column; align-items: flex-start; gap: 0.75rem; padding: 1rem; }
                    .dept-img-placeholder { width: 100%; height: 140px; border-radius: 8px; }
                    .dept-row-priority { align-self: flex-end; }
                    .dept-sub { font-size: 0.8rem; margin-bottom: 1.5rem; }
                }
            `}</style>

            <h1 className="dept-title">{departmentName}</h1>
            <p className="dept-sub">Reported issues assigned to your department by field workers.</p>

            {/* Stat Cards */}
            <div className="dept-stat-row">
                <Link href={buildUrl("all", priority)} className="dept-stat-card">
                    <div className="dept-stat-icon">📈</div>
                    <div className="dept-stat-value dept-sv-blue">{totalCount}</div>
                    <div className="dept-stat-label">Total</div>
                </Link>
                <Link href={buildUrl("pending", priority)} className="dept-stat-card">
                    <div className="dept-stat-icon">🕐</div>
                    <div className="dept-stat-value dept-sv-amber">{pending.length}</div>
                    <div className="dept-stat-label">Pending</div>
                </Link>
                <Link href={buildUrl("in_progress", priority)} className="dept-stat-card">
                    <div className="dept-stat-icon">📋</div>
                    <div className="dept-stat-value dept-sv-purple">{inProgress.length}</div>
                    <div className="dept-stat-label">In Progress</div>
                </Link>
                <Link href={buildUrl("resolved", priority)} className="dept-stat-card">
                    <div className="dept-stat-icon">✅</div>
                    <div className="dept-stat-value dept-sv-green">{resolved.length}</div>
                    <div className="dept-stat-label">Resolved</div>
                </Link>
            </div>

            {/* High Priority Alert */}
            {(allIssues?.filter((i) => i.priority === "high" && i.status !== "resolved") ?? []).length > 0 && (
                <div className="dept-alert-bar">
                    <span>⚠️</span>
                    <span>
                        <strong>{allIssues!.filter((i) => i.priority === "high" && i.status !== "resolved").length} high-priority</strong>{" "}
                        {allIssues!.filter((i) => i.priority === "high" && i.status !== "resolved").length === 1 ? "issue requires" : "issues require"} immediate attention.
                    </span>
                    <Link href={buildUrl(status, "high")}>View →</Link>
                </div>
            )}

            {/* Filter Row — Status */}
            <div className="dept-filter-row">
                <span className="dept-filter-icon">▼</span>
                {statusFilters.map((f) => {
                    const active = (status ?? "all") === f.value;
                    return (
                        <Link
                            key={f.value}
                            href={buildUrl(f.value, priority)}
                            className={`dept-chip ${active ? "dept-chip-active-green" : ""}`}
                        >
                            {f.label}
                        </Link>
                    );
                })}
                {/* Priority filters inline */}
                {priorityFilters.map((f) => {
                    const active = (priority ?? "all") === f.value;
                    return (
                        <Link
                            key={f.value}
                            href={buildUrl(status, f.value)}
                            className={`dept-chip ${active ? "dept-chip-active-purple" : ""}`}
                        >
                            {f.label}
                        </Link>
                    );
                })}
            </div>

            {/* Results count */}
            <div className="dept-issues-count">
                {filteredIssues.length} ISSUE{filteredIssues.length !== 1 ? "S" : ""} FOUND
            </div>

            {/* Issues List */}
            {filteredIssues.length > 0 ? (
                <div className="dept-issue-list">
                    {filteredIssues.map((issue) => {
                        const reporter = issue.reporter as unknown as {
                            full_name: string | null;
                            email: string;
                        } | null;
                        const biker = issue.biker as unknown as {
                            full_name: string | null;
                            email: string;
                        } | null;

                        const STATUS_BADGE: Record<string, string> = {
                            pending: "dept-badge-amber",
                            in_progress: "dept-badge-blue",
                            resolved: "dept-badge-green",
                        };

                        const PRIORITY_COLOR: Record<string, string> = {
                            high: "dept-rp-high",
                            medium: "dept-rp-medium",
                            low: "dept-rp-low",
                        };

                        return (
                            <div key={issue.id} className="dept-issue-row">
                                {/* Photo / Thumbnail */}
                                <div className="dept-img-placeholder">
                                    {issue.photo_url ? (
                                        <img src={issue.photo_url} alt={issue.title ?? "Issue photo"} />
                                    ) : (
                                        <ImageOff className="w-5 h-5" />
                                    )}
                                </div>

                                {/* Content */}
                                <div className="dept-row-info">
                                    <div className="dept-row-name">
                                        {issue.title || "Issue reported"}
                                    </div>
                                    {issue.description && (
                                        <div className="dept-row-desc">{issue.description}</div>
                                    )}
                                    <div className="dept-row-meta">
                                        {/* Reporter */}
                                        <span className="dept-row-meta-item">
                                            <User className="w-3 h-3" />
                                            {reporter?.full_name ?? reporter?.email ?? "Unknown reporter"}
                                        </span>
                                        {/* Location */}
                                        {issue.lat != null && (
                                            <span className="dept-row-meta-item">
                                                <MapPin className="w-3 h-3" />
                                                {issue.lat.toFixed(4)}, {issue.lng?.toFixed(4)}
                                            </span>
                                        )}
                                        {/* Date */}
                                        <span className="dept-row-meta-item">
                                            <Calendar className="w-3 h-3" />
                                            {new Date(issue.created_at).toLocaleDateString("en-IN", {
                                                day: "numeric",
                                                month: "short",
                                                year: "numeric",
                                            })}
                                        </span>
                                        {/* Assigned biker */}
                                        {biker && (
                                            <span className="dept-row-meta-item" style={{ color: "#8b5cf6" }}>
                                                <ClipboardList className="w-3 h-3" />
                                                {biker.full_name ?? biker.email}
                                            </span>
                                        )}
                                    </div>

                                    {/* Status badge + Solve button */}
                                    <div className="dept-row-status">
                                        <span className={`dept-badge ${STATUS_BADGE[issue.status] ?? ""}`}>
                                            {issue.status.replace("_", " ")}
                                        </span>

                                        {issue.status === "resolved" && issue.resolved_at && (
                                            <span className="dept-resolved-date">
                                                Resolved{" "}
                                                {new Date(issue.resolved_at).toLocaleDateString("en-IN", {
                                                    day: "numeric",
                                                    month: "short",
                                                })}
                                            </span>
                                        )}

                                        {/* Solve button — only for non-resolved issues */}
                                        {issue.status !== "resolved" && (
                                            <SolveButton
                                                issueId={issue.id}
                                                issueTitle={issue.title ?? ""}
                                            />
                                        )}
                                    </div>
                                </div>

                                {/* Priority */}
                                <div className={`dept-row-priority ${PRIORITY_COLOR[issue.priority] ?? "dept-rp-low"}`}>
                                    {issue.priority.toUpperCase()}
                                </div>
                            </div>
                        );
                    })}
                </div>
            ) : (
                <div className="dept-empty-area">
                    <div className="dept-empty-icon">📋</div>
                    <div className="dept-empty-text">No issues found for the selected filters.</div>
                    <Link href="/department" className="dept-clear-link">
                        Clear filters →
                    </Link>
                </div>
            )}
        </>
    );
}
