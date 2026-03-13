import { createClient } from "@/lib/supabase/server";
import {
    Search,
    Plus,
    MapPin,
    MoreVertical,
} from "lucide-react";
import Link from "next/link";
import AssignBikerSelect from "@/components/admin/AssignBikerSelect";

interface PageProps {
    searchParams: Promise<{
        search?: string;
        status?: string;
        priority?: string;
        department?: string;
    }>;
}

export default async function AdminIssuesPage({ searchParams }: PageProps) {
    const supabase = await createClient();
    const params = await searchParams;

    // Fetch departments for the filter dropdown
    const { data: departments } = await supabase
        .from("departments")
        .select("id, name");

    // Build the query
    let query = supabase
        .from("issues")
        .select(`
            *,
            departments(name),
            users!issues_assigned_biker_id_fkey(full_name, email)
        `);

    // Apply filters
    if (params.search) {
        query = query.ilike('title', `%${params.search}%`);
    }
    if (params.status && params.status !== 'all') {
        query = query.eq('status', params.status);
    }
    if (params.priority && params.priority !== 'all') {
        query = query.eq('priority', params.priority);
    }
    if (params.department && params.department !== 'all') {
        query = query.eq('department_id', params.department);
    }

    // Fetch bikers for the assignment dropdown
    const { data: bikers } = await supabase
        .from("users")
        .select("id, full_name, email")
        .eq("role", "biker")
        .order("full_name");

    const { data: issues } = await query.order('created_at', { ascending: false });

    return (
        <>
            <style>{`
                /* Issues Management Page — Glassmorphism */
                .ism-header {
                    display: flex;
                    align-items: flex-start;
                    justify-content: space-between;
                    margin-bottom: 2.25rem;
                    gap: 1rem;
                    flex-wrap: wrap;
                }
                .ism-header h1 {
                    font-family: 'Clash Display', sans-serif;
                    font-size: 2.2rem;
                    font-weight: 700;
                    letter-spacing: -0.02em;
                    line-height: 1.1;
                    color: #f0f4ff;
                    text-shadow: 0 2px 20px rgba(59,130,246,0.12);
                }
                .ism-header p {
                    margin-top: 0.4rem;
                    color: rgba(107,114,128,0.8);
                    font-size: 0.9rem;
                    font-weight: 300;
                }

                .ism-btn-create {
                    display: inline-flex;
                    align-items: center;
                    gap: 0.4rem;
                    padding: 0.65rem 1.3rem;
                    background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%);
                    color: white;
                    border: 1px solid rgba(59,130,246,0.3);
                    border-radius: 12px;
                    font-family: 'DM Sans', sans-serif;
                    font-size: 0.875rem;
                    font-weight: 500;
                    cursor: pointer;
                    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
                    white-space: nowrap;
                    text-decoration: none;
                    box-shadow: 0 4px 15px rgba(59,130,246,0.25);
                }
                .ism-btn-create:hover {
                    background: linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%);
                    transform: translateY(-2px);
                    box-shadow: 0 8px 30px rgba(59,130,246,0.4), 0 0 40px rgba(59,130,246,0.15);
                }
                .ism-btn-create:active { transform: translateY(0); }

                /* Filter bar */
                .ism-filter-bar {
                    display: flex;
                    gap: 0.75rem;
                    margin-bottom: 1.5rem;
                    flex-wrap: wrap;
                    align-items: center;
                }
                .ism-search-wrap {
                    position: relative;
                    flex: 1;
                    min-width: 200px;
                }
                .ism-search-icon {
                    position: absolute;
                    left: 0.85rem;
                    top: 50%;
                    transform: translateY(-50%);
                    color: rgba(107,114,128,0.6);
                }
                .ism-search-input {
                    width: 100%;
                    background: rgba(255,255,255,0.035);
                    backdrop-filter: blur(10px);
                    -webkit-backdrop-filter: blur(10px);
                    border: 1px solid rgba(255,255,255,0.08);
                    border-radius: 12px;
                    padding: 0.65rem 0.9rem 0.65rem 2.4rem;
                    font-family: 'DM Sans', sans-serif;
                    font-size: 0.875rem;
                    color: #f0f4ff;
                    outline: none;
                    transition: all 0.25s ease;
                }
                .ism-search-input::placeholder { color: rgba(55,65,81,0.8); }
                .ism-search-input:focus {
                    border-color: rgba(59,130,246,0.5);
                    box-shadow: 0 0 0 3px rgba(59,130,246,0.15), 0 0 20px rgba(59,130,246,0.08);
                    background: rgba(255,255,255,0.05);
                }

                .ism-filter-select {
                    background: rgba(255,255,255,0.035);
                    backdrop-filter: blur(10px);
                    -webkit-backdrop-filter: blur(10px);
                    border: 1px solid rgba(255,255,255,0.08);
                    border-radius: 12px;
                    padding: 0.65rem 2rem 0.65rem 0.9rem;
                    font-family: 'DM Sans', sans-serif;
                    font-size: 0.82rem;
                    color: #94a3b8;
                    outline: none;
                    cursor: pointer;
                    appearance: none;
                    background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%236b7280' stroke-width='2'%3E%3Cpath d='m6 9 6 6 6-6'/%3E%3C/svg%3E");
                    background-repeat: no-repeat;
                    background-position: right 0.7rem center;
                    transition: all 0.25s ease;
                }
                .ism-filter-select:focus {
                    border-color: rgba(59,130,246,0.5);
                    box-shadow: 0 0 0 3px rgba(59,130,246,0.15), 0 0 20px rgba(59,130,246,0.08);
                    color: #f0f4ff;
                }

                /* Table — Glass */
                .ism-table-card {
                    background: rgba(255,255,255,0.025);
                    backdrop-filter: blur(14px);
                    -webkit-backdrop-filter: blur(14px);
                    border: 1px solid rgba(255,255,255,0.07);
                    border-radius: 20px;
                    overflow: hidden;
                    box-shadow: 0 4px 30px rgba(0,0,0,0.2);
                    position: relative;
                }
                .ism-table-card::before {
                    content: '';
                    position: absolute;
                    top: 0; left: 0; right: 0;
                    height: 1px;
                    background: linear-gradient(90deg, transparent, rgba(255,255,255,0.06), transparent);
                }
                .ism-table {
                    width: 100%;
                    border-collapse: collapse;
                }
                .ism-table th {
                    padding: 0.85rem 1.25rem;
                    text-align: left;
                    font-size: 0.7rem;
                    font-weight: 600;
                    letter-spacing: 0.08em;
                    text-transform: uppercase;
                    color: rgba(148,163,184,0.6);
                    background: rgba(255,255,255,0.02);
                    border-bottom: 1px solid rgba(255,255,255,0.06);
                }
                .ism-table td {
                    padding: 1rem 1.25rem;
                    border-bottom: 1px solid rgba(255,255,255,0.05);
                    font-size: 0.875rem;
                    vertical-align: middle;
                }
                .ism-table tr:last-child td { border-bottom: none; }
                .ism-table tbody tr {
                    transition: all 0.2s ease;
                    cursor: pointer;
                }
                .ism-table tbody tr:hover td { background: rgba(255,255,255,0.025); }

                @keyframes ismSlideIn {
                    from { opacity: 0; transform: translateY(10px); }
                    to { opacity: 1; transform: translateY(0); }
                }
                .ism-table tbody tr:nth-child(1) { animation: ismSlideIn 0.35s ease 0.04s both; }
                .ism-table tbody tr:nth-child(2) { animation: ismSlideIn 0.35s ease 0.08s both; }
                .ism-table tbody tr:nth-child(3) { animation: ismSlideIn 0.35s ease 0.12s both; }
                .ism-table tbody tr:nth-child(4) { animation: ismSlideIn 0.35s ease 0.16s both; }
                .ism-table tbody tr:nth-child(5) { animation: ismSlideIn 0.35s ease 0.20s both; }
                .ism-table tbody tr:nth-child(6) { animation: ismSlideIn 0.35s ease 0.24s both; }
                .ism-table tbody tr:nth-child(7) { animation: ismSlideIn 0.35s ease 0.28s both; }
                .ism-table tbody tr:nth-child(8) { animation: ismSlideIn 0.35s ease 0.32s both; }

                .ism-issue-name {
                    font-weight: 600;
                    color: #f0f4ff;
                    margin-bottom: 3px;
                    font-size: 0.875rem;
                }
                .ism-issue-coords {
                    font-size: 0.75rem;
                    color: rgba(107,114,128,0.7);
                    display: flex;
                    align-items: center;
                    gap: 0.25rem;
                }

                .ism-badge {
                    display: inline-flex;
                    align-items: center;
                    gap: 5px;
                    padding: 0.3rem 0.7rem;
                    border-radius: 999px;
                    font-size: 0.7rem;
                    font-weight: 500;
                    letter-spacing: 0.05em;
                    text-transform: uppercase;
                }
                .ism-badge::before {
                    content: '';
                    width: 5px;
                    height: 5px;
                    border-radius: 50%;
                    background: currentColor;
                    box-shadow: 0 0 6px currentColor;
                }
                .ism-badge-green {
                    background: rgba(16,185,129,0.1);
                    color: #34d399;
                    border: 1px solid rgba(16,185,129,0.2);
                    box-shadow: 0 0 12px rgba(16,185,129,0.1);
                }
                .ism-badge-amber {
                    background: rgba(245,158,11,0.1);
                    color: #fbbf24;
                    border: 1px solid rgba(245,158,11,0.2);
                    box-shadow: 0 0 12px rgba(245,158,11,0.1);
                }
                .ism-badge-blue {
                    background: rgba(59,130,246,0.1);
                    color: #60a5fa;
                    border: 1px solid rgba(59,130,246,0.2);
                    box-shadow: 0 0 12px rgba(59,130,246,0.1);
                }

                .ism-priority-high   { color: #f87171; font-weight: 700; font-size: 0.8rem; text-shadow: 0 0 8px rgba(239,68,68,0.3); }
                .ism-priority-medium { color: #fbbf24; font-weight: 700; font-size: 0.8rem; text-shadow: 0 0 8px rgba(245,158,11,0.3); }
                .ism-priority-low    { color: #34d399; font-weight: 700; font-size: 0.8rem; text-shadow: 0 0 8px rgba(16,185,129,0.3); }

                .ism-dept-tag {
                    font-size: 0.82rem;
                    color: #94a3b8;
                    background: rgba(255,255,255,0.04);
                    padding: 0.25rem 0.65rem;
                    border-radius: 8px;
                    border: 1px solid rgba(255,255,255,0.06);
                }

                .ism-action-btn {
                    background: none;
                    border: none;
                    color: rgba(107,114,128,0.6);
                    cursor: pointer;
                    padding: 5px 7px;
                    border-radius: 8px;
                    transition: all 0.2s ease;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                }
                .ism-action-btn:hover {
                    background: rgba(255,255,255,0.06);
                    color: #f0f4ff;
                }

                .ism-empty {
                    padding: 5rem 2rem;
                    text-align: center;
                    color: rgba(107,114,128,0.5);
                    font-size: 0.9rem;
                }

                @media (max-width: 900px) {
                    .ism-col-assign, .ism-col-actions { display: none; }
                }
                @media (max-width: 640px) {
                    .ism-header h1 { font-size: 1.6rem; }
                    .ism-col-dept { display: none; }
                    .ism-table th, .ism-table td { padding: 0.7rem 0.75rem; }
                    .ism-filter-bar { gap: 0.5rem; }
                    .ism-filter-select { font-size: 0.75rem; }
                }
            `}</style>

            {/* Page Header */}
            <div className="ism-header">
                <div>
                    <h1>Issues Management</h1>
                    <p>Monitor and manage all reported civic issues</p>
                </div>
                <Link href="/admin/issues/new" className="ism-btn-create">
                    <Plus className="w-4 h-4" />
                    Create Issue
                </Link>
            </div>

            {/* Filters Bar */}
            <div className="ism-filter-bar">
                <div className="ism-search-wrap">
                    <Search className="ism-search-icon w-4 h-4" />
                    <input
                        type="text"
                        placeholder="Search issues..."
                        className="ism-search-input"
                    />
                </div>

                <select className="ism-filter-select">
                    <option value="all">All Statuses</option>
                    <option value="pending">Pending</option>
                    <option value="in_progress">In Progress</option>
                    <option value="resolved">Resolved</option>
                </select>

                <select className="ism-filter-select">
                    <option value="all">All Priorities</option>
                    <option value="high">High</option>
                    <option value="medium">Medium</option>
                    <option value="low">Low</option>
                </select>

                <select className="ism-filter-select">
                    <option value="all">All Departments</option>
                    {departments?.map(dept => (
                        <option key={dept.id} value={dept.id}>{dept.name}</option>
                    ))}
                </select>
            </div>

            {/* Issues Table */}
            <div className="ism-table-card">
                <div style={{ overflowX: "auto" }}>
                    <table className="ism-table" style={{ minWidth: "700px" }}>
                        <thead>
                            <tr>
                                <th>Issue</th>
                                <th>Status</th>
                                <th>Priority</th>
                                <th className="ism-col-dept">Department</th>
                                <th className="ism-col-assign">Assigned To</th>
                                <th className="ism-col-actions" style={{ textAlign: "right" }}>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {issues?.map((issue) => {
                                const STATUS_BADGE: Record<string, string> = {
                                    pending: "ism-badge-amber",
                                    in_progress: "ism-badge-blue",
                                    resolved: "ism-badge-green",
                                };

                                const PRIORITY_CLASS: Record<string, string> = {
                                    high: "ism-priority-high",
                                    medium: "ism-priority-medium",
                                    low: "ism-priority-low",
                                };

                                return (
                                    <tr key={issue.id}>
                                        <td>
                                            <div className="ism-issue-name">{issue.title}</div>
                                            <div className="ism-issue-coords">
                                                <MapPin className="w-3 h-3" />
                                                {issue.lat.toFixed(4)}, {issue.lng.toFixed(4)}
                                            </div>
                                        </td>
                                        <td>
                                            <span className={`ism-badge ${STATUS_BADGE[issue.status] ?? ""}`}>
                                                {issue.status.replace('_', ' ')}
                                            </span>
                                        </td>
                                        <td>
                                            <span className={PRIORITY_CLASS[issue.priority] ?? "ism-priority-low"}>
                                                {issue.priority.charAt(0).toUpperCase() + issue.priority.slice(1)}
                                            </span>
                                        </td>
                                        <td className="ism-col-dept">
                                            <span className="ism-dept-tag">
                                                {issue.departments?.name}
                                            </span>
                                        </td>
                                        <td className="ism-col-assign">
                                            <AssignBikerSelect
                                                issueId={issue.id}
                                                currentBikerId={issue.assigned_biker_id ?? null}
                                                bikers={bikers ?? []}
                                            />
                                        </td>
                                        <td className="ism-col-actions" style={{ textAlign: "right" }}>
                                            <button className="ism-action-btn">
                                                <MoreVertical className="w-4 h-4" />
                                            </button>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>

                {(!issues || issues.length === 0) && (
                    <div className="ism-empty">
                        No issues found matching your criteria.
                    </div>
                )}
            </div>
        </>
    );
}
