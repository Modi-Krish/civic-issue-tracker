"use client";

import { useState } from "react";

interface Issue { id: string; status: string; }

interface Biker {
    id: string;
    full_name: string | null;
    email: string | null;
    role: string;
    assigned_issues: Issue[];
}

interface Props {
    bikers: Biker[];
    activeBikers: number;
    tasksPending: number;
}

const AVATAR_STYLES = [
    "linear-gradient(135deg, #0d9488, #06b6d4)",   // teal
    "linear-gradient(135deg, #7c3aed, #6366f1)",   // violet
    "linear-gradient(135deg, #e11d48, #f97316)",   // rose
    "linear-gradient(135deg, #2563eb, #3b82f6)",   // blue
    "linear-gradient(135deg, #059669, #10b981)",   // emerald
];

export default function BikerList({ bikers, activeBikers, tasksPending }: Props) {
    const [search, setSearch] = useState("");

    const filtered = bikers.filter((b) => {
        const q = search.toLowerCase();
        return (b.full_name ?? "").toLowerCase().includes(q) || (b.email ?? "").toLowerCase().includes(q);
    });

    return (
        <>
            <style>{`
                .fw-stat-chip {
                    display: flex; align-items: center; gap: 0.5rem;
                    padding: 0.4rem 0.7rem;
                    background: #111418;
                    border: 1px solid rgba(255,255,255,0.07);
                    border-radius: 999px;
                    font-size: 0.75rem;
                    color: #6b7280;
                    transition: all 0.2s;
                }
                @media (min-width: 640px) {
                    .fw-stat-chip {
                        padding: 0.5rem 0.9rem;
                        font-size: 0.8rem;
                    }
                }
                .fw-stat-chip:hover { border-color: #3b82f6; color: #f0f4ff; }

                .fw-search {
                    width: 100%;
                    background: #111418;
                    border: 1px solid rgba(255,255,255,0.07);
                    border-radius: 10px;
                    padding: 0.65rem 0.9rem 0.65rem 2.5rem;
                    font-family: 'DM Sans', sans-serif;
                    font-size: 0.85rem;
                    color: #f0f4ff;
                    outline: none;
                    transition: all 0.2s;
                }
                .fw-search::placeholder { color: #374151; }
                .fw-search:focus { border-color: rgba(255,255,255,0.15); }

                .fw-card {
                    background: #111418;
                    border: 1px solid rgba(255,255,255,0.07);
                    border-radius: 14px;
                    padding: 1rem;
                    cursor: pointer;
                    transition: all 0.25s cubic-bezier(0.4,0,0.2,1);
                    position: relative;
                    overflow: hidden;
                    animation: fw-slideIn 0.4s ease both;
                }
                @media (min-width: 640px) {
                    .fw-card {
                        border-radius: 16px;
                        padding: 1.5rem;
                    }
                }
                .fw-card:nth-child(2) { animation-delay: 0.08s; }
                .fw-card:nth-child(3) { animation-delay: 0.16s; }
                .fw-card:nth-child(4) { animation-delay: 0.24s; }

                @keyframes fw-slideIn {
                    from { opacity: 0; transform: translateY(16px); }
                    to { opacity: 1; transform: translateY(0); }
                }

                .fw-card::before {
                    content: '';
                    position: absolute;
                    top: 0; left: 0; right: 0;
                    height: 2px;
                    background: linear-gradient(90deg, #3b82f6, #6366f1);
                    transform: scaleX(0);
                    transform-origin: left;
                    transition: transform 0.3s ease;
                }
                .fw-card:hover {
                    border-color: rgba(59,130,246,0.3);
                    transform: translateY(-2px);
                    box-shadow: 0 20px 40px rgba(0,0,0,0.4), 0 0 0 1px rgba(59,130,246,0.1);
                }
                .fw-card:hover::before { transform: scaleX(1); }

                .fw-avatar {
                    width: 36px; height: 36px;
                    border-radius: 10px;
                    display: flex; align-items: center; justify-content: center;
                    font-family: 'Clash Display', sans-serif;
                    font-size: 0.95rem;
                    font-weight: 700;
                    color: white;
                    flex-shrink: 0;
                }
                @media (min-width: 640px) {
                    .fw-avatar {
                        width: 44px; height: 44px;
                        border-radius: 12px;
                        font-size: 1.1rem;
                    }
                }

                .fw-badge-active {
                    display: flex; align-items: center; gap: 5px;
                    padding: 0.3rem 0.7rem;
                    border-radius: 999px;
                    font-size: 0.72rem;
                    font-weight: 500;
                    letter-spacing: 0.06em;
                    text-transform: uppercase;
                    background: rgba(16,185,129,0.12);
                    color: #10b981;
                    border: 1px solid rgba(16,185,129,0.2);
                }
                .fw-badge-active::before {
                    content: '';
                    width: 6px; height: 6px;
                    border-radius: 50%;
                    background: #10b981;
                    animation: fw-pulse 2s infinite;
                }
                @keyframes fw-pulse {
                    0%,100% { opacity: 1; }
                    50% { opacity: 0.4; }
                }

                .fw-metric {
                    background: #181c22;
                    border: 1px solid rgba(255,255,255,0.07);
                    border-radius: 8px;
                    padding: 0.6rem;
                    text-align: center;
                    transition: all 0.2s;
                }
                @media (min-width: 640px) {
                    .fw-metric {
                        border-radius: 10px;
                        padding: 0.85rem;
                    }
                }
                .fw-metric:hover { border-color: rgba(255,255,255,0.15); }

                .fw-metric-value {
                    font-family: 'Clash Display', sans-serif;
                    font-size: 1.15rem;
                    font-weight: 700;
                    line-height: 1;
                    margin-bottom: 3px;
                }
                @media (min-width: 640px) {
                    .fw-metric-value {
                        font-size: 1.5rem;
                        margin-bottom: 4px;
                    }
                }

                .fw-metric-label {
                    font-size: 0.6rem;
                    text-transform: uppercase;
                    letter-spacing: 0.06em;
                    color: #6b7280;
                }
                @media (min-width: 640px) {
                    .fw-metric-label {
                        font-size: 0.68rem;
                        letter-spacing: 0.08em;
                    }
                }

                .fw-dot {
                    width: 7px; height: 7px; border-radius: 50%;
                }
                .fw-dot-green { background: #10b981; box-shadow: 0 0 6px #10b981; }
                .fw-dot-blue { background: #3b82f6; box-shadow: 0 0 6px #3b82f6; }
            `}</style>

            {/* Stats strip */}
            <div className="flex flex-wrap gap-2 sm:gap-4 mb-5 sm:mb-7">
                <div className="fw-stat-chip">
                    <span className="fw-dot fw-dot-green" />
                    {activeBikers} Active Bikers
                </div>
                <div className="fw-stat-chip">
                    <span className="fw-dot fw-dot-blue" />
                    {tasksPending} Tasks Pending
                </div>
            </div>

            {/* Search */}
            <div className="relative mb-5">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[0.9rem]" style={{ color: "#6b7280" }}>🔍</span>
                <input
                    type="text"
                    placeholder="Search workers by name or email..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="fw-search"
                />
            </div>

            {/* Workers list */}
            <div className="flex flex-col gap-4">
                {filtered.length > 0 ? filtered.map((biker, idx) => {
                    const issues = biker.assigned_issues ?? [];
                    const resolved = issues.filter(i => i.status === "resolved").length;
                    const pending = issues.filter(i => i.status !== "resolved").length;
                    const initial = (biker.full_name || biker.email || "?")[0].toUpperCase();
                    const bg = AVATAR_STYLES[idx % AVATAR_STYLES.length];

                    return (
                        <div key={biker.id} className="fw-card">
                            {/* Top */}
                            <div className="flex items-center justify-between mb-3 sm:mb-5">
                                <div className="flex items-center gap-3">
                                    <div className="fw-avatar" style={{ background: bg }}>{initial}</div>
                                    <div>
                                        <h3 className="text-[1rem] font-semibold text-white leading-tight" style={{ fontFamily: "'Clash Display', sans-serif" }}>
                                            {biker.full_name || "Unnamed"}
                                        </h3>
                                        <span className="text-[0.78rem]" style={{ color: "#6b7280" }}>{biker.email}</span>
                                    </div>
                                </div>
                                <div className="fw-badge-active">Active</div>
                            </div>

                            {/* Metrics */}
                            <div className="grid grid-cols-3 gap-3">
                                <div className="fw-metric">
                                    <div className="fw-metric-value" style={{ color: "#f0f4ff" }}>{issues.length}</div>
                                    <div className="fw-metric-label">Total</div>
                                </div>
                                <div className="fw-metric">
                                    <div className="fw-metric-value" style={{ color: "#f59e0b" }}>{pending}</div>
                                    <div className="fw-metric-label">Pending</div>
                                </div>
                                <div className="fw-metric">
                                    <div className="fw-metric-value" style={{ color: "#10b981" }}>{resolved}</div>
                                    <div className="fw-metric-label">Resolved</div>
                                </div>
                            </div>
                        </div>
                    );
                }) : (
                    <div className="h-52 rounded-2xl border border-dashed flex flex-col items-center justify-center gap-2" style={{ borderColor: "rgba(255,255,255,0.07)", color: "#6b7280" }}>
                        <span className="text-2xl opacity-30">🔍</span>
                        <p className="text-sm">{search ? "No workers match your search." : "No field workers registered yet."}</p>
                    </div>
                )}
            </div>
        </>
    );
}
