"use client";

import { useState } from "react";

export default function CreateBikerForm({ onSuccess }: { onSuccess: () => void }) {
    const [fullName, setFullName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [role, setRole] = useState<"biker" | "field_agent">("biker");
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [showToast, setShowToast] = useState(false);
    const [toastName, setToastName] = useState("");
    const [toastEmail, setToastEmail] = useState("");

    const handleCreate = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        const res = await fetch("/api/admin/create-biker", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email, password, fullName, role }),
        });

        const data = await res.json();

        if (!res.ok) {
            setError(data.error ?? "Failed to create account.");
        } else {
            setToastName(fullName + " added!");
            setToastEmail(email);
            setShowToast(true);
            setTimeout(() => setShowToast(false), 3500);
            setFullName(""); setEmail(""); setPassword(""); setRole("biker");
            onSuccess();
        }
        setLoading(false);
    };

    return (
        <>
            <style>{`
                .cfp-panel {
                    background: rgba(255,255,255,0.03);
                    backdrop-filter: blur(16px);
                    -webkit-backdrop-filter: blur(16px);
                    border: 1px solid rgba(255,255,255,0.08);
                    border-radius: 20px;
                    padding: 1.25rem;
                    animation: cfp-fadeUp 0.5s cubic-bezier(0.4, 0, 0.2, 1) 0.1s both;
                    box-shadow: 0 4px 30px rgba(0,0,0,0.2);
                    position: relative;
                    overflow: hidden;
                }
                .cfp-panel::before {
                    content: '';
                    position: absolute;
                    top: 0; left: 0; right: 0;
                    height: 1px;
                    background: linear-gradient(90deg, transparent, rgba(255,255,255,0.08), transparent);
                }
                @media (min-width: 640px) {
                    .cfp-panel {
                        border-radius: 24px;
                        padding: 1.75rem;
                    }
                }
                @keyframes cfp-fadeUp {
                    from { opacity: 0; transform: translateY(20px) scale(0.98); }
                    to { opacity: 1; transform: translateY(0) scale(1); }
                }
                .cfp-input {
                    width: 100%;
                    background: rgba(255,255,255,0.04);
                    backdrop-filter: blur(8px);
                    -webkit-backdrop-filter: blur(8px);
                    border: 1px solid rgba(255,255,255,0.08);
                    border-radius: 12px;
                    padding: 0.7rem 0.9rem;
                    font-family: 'DM Sans', sans-serif;
                    font-size: 0.875rem;
                    color: #f0f4ff;
                    outline: none;
                    transition: all 0.25s ease;
                }
                .cfp-input::placeholder { color: rgba(55,65,81,0.7); }
                .cfp-input:focus {
                    border-color: rgba(59,130,246,0.5);
                    box-shadow: 0 0 0 3px rgba(59,130,246,0.15), 0 0 20px rgba(59,130,246,0.08);
                    background: rgba(255,255,255,0.06);
                }

                .cfp-divider {
                    display: flex; align-items: center; gap: 0.75rem;
                    margin: 1.25rem 0;
                }
                .cfp-divider::before, .cfp-divider::after {
                    content: ''; flex: 1; height: 1px; background: rgba(255,255,255,0.06);
                }

                .cfp-role-option {
                    padding: 0.6rem 0.75rem;
                    border: 1px solid rgba(255,255,255,0.08);
                    border-radius: 10px;
                    background: rgba(255,255,255,0.03);
                    backdrop-filter: blur(6px);
                    -webkit-backdrop-filter: blur(6px);
                    font-size: 0.78rem;
                    color: rgba(107,114,128,0.8);
                    cursor: pointer;
                    text-align: center;
                    transition: all 0.25s ease;
                }
                .cfp-role-option:hover { border-color: rgba(255,255,255,0.15); color: #f0f4ff; }
                .cfp-role-active {
                    border-color: rgba(59,130,246,0.4) !important;
                    color: #60a5fa !important;
                    background: rgba(59,130,246,0.1) !important;
                    box-shadow: 0 0 20px rgba(59,130,246,0.12);
                }

                .cfp-btn {
                    width: 100%;
                    padding: 0.8rem 1rem;
                    background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%);
                    color: white;
                    border: 1px solid rgba(59,130,246,0.3);
                    border-radius: 12px;
                    font-family: 'DM Sans', sans-serif;
                    font-size: 0.875rem;
                    font-weight: 500;
                    cursor: pointer;
                    display: flex; align-items: center; justify-content: center; gap: 0.5rem;
                    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
                    position: relative;
                    overflow: hidden;
                    margin-top: 1.5rem;
                    box-shadow: 0 4px 15px rgba(59,130,246,0.25);
                }
                .cfp-btn:hover {
                    background: linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%);
                    transform: translateY(-2px);
                    box-shadow: 0 8px 30px rgba(59,130,246,0.4), 0 0 40px rgba(59,130,246,0.15);
                }
                .cfp-btn:active { transform: translateY(0); }
                .cfp-btn:disabled { pointer-events: none; opacity: 0.6; }

                .cfp-toast {
                    position: fixed;
                    bottom: 1rem; left: 1rem; right: 1rem;
                    background: rgba(17,20,24,0.9);
                    backdrop-filter: blur(20px);
                    -webkit-backdrop-filter: blur(20px);
                    border: 1px solid rgba(16,185,129,0.2);
                    border-radius: 16px;
                    padding: 0.9rem 1.2rem;
                    display: flex; align-items: center; gap: 0.75rem;
                    box-shadow: 0 20px 50px rgba(0,0,0,0.5), 0 0 30px rgba(16,185,129,0.1);
                    transform: translateY(100px);
                    opacity: 0;
                    transition: all 0.35s cubic-bezier(0.4,0,0.2,1);
                    z-index: 999;
                    min-width: 0;
                }
                @media (min-width: 640px) {
                    .cfp-toast {
                        left: auto;
                        bottom: 2rem; right: 2rem;
                        min-width: 260px;
                    }
                }
                .cfp-toast-show { transform: translateY(0) !important; opacity: 1 !important; }
            `}</style>

            <div className="cfp-panel">
                <div className="mb-6">
                    <h2 className="text-[1.2rem] font-semibold text-white mb-1" style={{ fontFamily: "'Clash Display', sans-serif" }}>Create Field Worker</h2>
                    <p className="text-[0.8rem] leading-relaxed" style={{ color: "#6b7280" }}>The new worker can log in immediately with these credentials.</p>
                </div>

                {error && (
                    <div className="mb-4 text-xs px-4 py-3 rounded-lg flex items-center gap-2" style={{ background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.2)", color: "#f87171" }}>
                        ⚠ {error}
                    </div>
                )}

                <form onSubmit={handleCreate}>
                    {/* Full Name */}
                    <div className="mb-4">
                        <label className="block text-[0.78rem] font-medium mb-1.5" style={{ color: "#9ca3af", letterSpacing: "0.02em" }}>Full Name</label>
                        <input type="text" required placeholder="e.g. Ravi Kumar" className="cfp-input"
                            value={fullName} onChange={e => setFullName(e.target.value)} />
                    </div>

                    {/* Email */}
                    <div className="mb-4">
                        <label className="block text-[0.78rem] font-medium mb-1.5" style={{ color: "#9ca3af", letterSpacing: "0.02em" }}>Email Address</label>
                        <input type="email" required placeholder="biker@example.com" className="cfp-input"
                            value={email} onChange={e => setEmail(e.target.value)} />
                    </div>

                    {/* Password */}
                    <div className="mb-4">
                        <label className="block text-[0.78rem] font-medium mb-1.5" style={{ color: "#9ca3af", letterSpacing: "0.02em" }}>Password</label>
                        <div className="relative">
                            <input type={showPassword ? "text" : "password"} required minLength={6}
                                placeholder="Min. 6 characters" className="cfp-input" style={{ paddingRight: "2.5rem" }}
                                value={password} onChange={e => setPassword(e.target.value)} />
                            <button type="button" tabIndex={-1} onClick={() => setShowPassword(!showPassword)}
                                className="absolute right-3 top-1/2 -translate-y-1/2 bg-transparent border-none cursor-pointer transition-colors"
                                style={{ color: "#6b7280", padding: "4px" }}
                                onMouseEnter={e => (e.currentTarget.style.color = "#f0f4ff")}
                                onMouseLeave={e => (e.currentTarget.style.color = "#6b7280")}>
                                👁
                            </button>
                        </div>
                    </div>

                    {/* Divider with "Role" */}
                    <div className="cfp-divider">
                        <span className="text-[0.72rem] whitespace-nowrap" style={{ color: "#6b7280" }}>Role</span>
                    </div>

                    {/* Role selector */}
                    <div className="grid grid-cols-2 gap-2 mb-4">
                        <button type="button" onClick={() => setRole("biker")}
                            className={`cfp-role-option ${role === "biker" ? "cfp-role-active" : ""}`}>
                            🚲 Biker
                        </button>
                        <button type="button" onClick={() => setRole("field_agent")}
                            className={`cfp-role-option ${role === "field_agent" ? "cfp-role-active" : ""}`}>
                            👷 Field Agent
                        </button>
                    </div>

                    {/* Submit */}
                    <button type="submit" disabled={loading} className="cfp-btn">
                        <span>＋</span>
                        {loading ? "Creating..." : `Create ${role === "biker" ? "Biker" : "Field Agent"} Account`}
                    </button>
                </form>
            </div>

            {/* Toast */}
            <div className={`cfp-toast ${showToast ? "cfp-toast-show" : ""}`}>
                <div className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0"
                    style={{ background: "rgba(16,185,129,0.15)", color: "#10b981", fontSize: "1rem" }}>✓</div>
                <div>
                    <strong className="block text-[0.85rem] text-white">{toastName}</strong>
                    <span className="text-[0.75rem]" style={{ color: "#6b7280" }}>{toastEmail}</span>
                </div>
            </div>
        </>
    );
}
