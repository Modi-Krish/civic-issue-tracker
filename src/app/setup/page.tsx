"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Shield, Loader2, CheckCircle2, AlertCircle } from "lucide-react";

export default function SetupPage() {
    const router = useRouter();
    const supabase = createClient();

    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const [status, setStatus] = useState<"idle" | "success" | "error">("idle");
    const [message, setMessage] = useState("");

    const handleSetup = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setStatus("idle");
        setMessage("");

        // Sign in with existing credentials
        const { data: signInData, error: signInError } =
            await supabase.auth.signInWithPassword({ email, password });

        if (signInError || !signInData.user) {
            setStatus("error");
            setMessage(
                signInError?.message ??
                "Sign in failed. Create the user first in Supabase Dashboard → Authentication → Users."
            );
            setLoading(false);
            return;
        }


        // Step 2: Call setup-admin API
        const res = await fetch("/api/setup-admin", { method: "POST" });
        const json = await res.json();

        if (!res.ok) {
            setStatus("error");
            setMessage(json.error ?? "Setup failed.");
            setLoading(false);
            return;
        }

        setStatus("success");
        setMessage("Admin account ready! Redirecting to dashboard…");
        setTimeout(() => router.push("/admin"), 1500);
        setLoading(false);
    };

    return (
        <div className="min-h-screen flex items-center justify-center px-4 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
            <div className="w-full max-w-md">
                {/* Header */}
                <div className="text-center mb-8">
                    <div className="flex items-center justify-center gap-2 mb-3">
                        <Shield className="w-8 h-8 text-violet-400" />
                        <span className="text-2xl font-bold text-white">
                            First-Time Setup
                        </span>
                    </div>
                    <p className="text-slate-400 text-sm">
                        First create the user in{" "}
                        <a href="https://app.supabase.com" target="_blank" className="underline text-violet-400">Supabase Dashboard → Auth → Users</a>,
                        then sign in here to assign the admin role.
                    </p>
                </div>

                {/* Card */}
                <form
                    onSubmit={handleSetup}
                    className="bg-white/5 border border-white/10 backdrop-blur-sm rounded-2xl p-8 space-y-5"
                >
                    {status === "error" && (
                        <div className="bg-red-500/10 border border-red-500/30 text-red-300 text-sm rounded-xl px-4 py-3 flex items-center gap-3">
                            <AlertCircle className="w-4 h-4 flex-shrink-0" />
                            {message}
                        </div>
                    )}
                    {status === "success" && (
                        <div className="bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-sm rounded-xl px-4 py-3 flex items-center gap-3">
                            <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
                            {message}
                        </div>
                    )}

                    <div>
                        <label className="block text-sm font-medium text-slate-300 mb-1.5">
                            Admin Email
                        </label>
                        <input
                            type="email"
                            required
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="admin@example.com"
                            className="w-full px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-violet-500/50 focus:border-violet-500 transition-colors"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-slate-300 mb-1.5">
                            Password
                        </label>
                        <input
                            type="password"
                            required
                            minLength={6}
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="Min. 6 characters"
                            className="w-full px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-violet-500/50 focus:border-violet-500 transition-colors"
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={loading || status === "success"}
                        className="w-full flex items-center justify-center gap-2 py-2.5 bg-violet-600 hover:bg-violet-500 disabled:opacity-50 text-white font-semibold rounded-xl transition-colors"
                    >
                        {loading ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                            <Shield className="w-4 h-4" />
                        )}
                        {loading ? "Setting up…" : "Create Admin Account"}
                    </button>

                    <p className="text-center text-xs text-slate-600 pt-1">
                        Already set up?{" "}
                        <a href="/login" className="text-slate-400 hover:text-white underline">
                            Sign in
                        </a>
                    </p>
                </form>
            </div>
        </div>
    );
}
