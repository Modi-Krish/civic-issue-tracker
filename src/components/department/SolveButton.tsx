"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { CheckCircle2, Loader2 } from "lucide-react";

interface SolveButtonProps {
    issueId: string;
    issueTitle: string;
}

export default function SolveButton({ issueId, issueTitle }: SolveButtonProps) {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [done, setDone] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleSolve = async () => {
        if (!confirm(`Mark "${issueTitle || "this issue"}" as Resolved?\n\nThis will notify the person who reported it.`)) return;

        setLoading(true);
        setError(null);

        try {
            const res = await fetch("/api/department/solve-issue", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ issueId }),
            });

            const data = await res.json();
            if (!res.ok) {
                setError(data.error ?? "Failed to resolve issue.");
            } else {
                setDone(true);
                router.refresh(); // Refresh server components so counts update
            }
        } catch {
            setError("Network error. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    if (done) {
        return (
            <span className="flex items-center gap-1.5 text-[10px] px-3 py-1 rounded-full font-semibold border uppercase tracking-wider bg-emerald-500/15 text-emerald-300 border-emerald-500/25">
                <CheckCircle2 className="w-3 h-3" />
                Resolved
            </span>
        );
    }

    return (
        <div className="flex items-center gap-2">
            <button
                onClick={handleSolve}
                disabled={loading}
                className="flex items-center gap-1.5 text-[10px] px-3 py-1.5 rounded-full font-semibold uppercase tracking-wider bg-emerald-600 hover:bg-emerald-500 text-white transition-colors disabled:opacity-50 active:scale-95"
            >
                {loading ? (
                    <Loader2 className="w-3 h-3 animate-spin" />
                ) : (
                    <CheckCircle2 className="w-3 h-3" />
                )}
                {loading ? "Solving..." : "Mark Solved"}
            </button>
            {error && <span className="text-red-400 text-[10px]">{error}</span>}
        </div>
    );
}
