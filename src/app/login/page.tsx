"use client";

import { Suspense, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Shield, LogIn } from "lucide-react";

function LoginForm() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const supabase = createClient();

    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(
        searchParams.get("error") === "no_profile"
            ? "Your account has no role assigned. Please go to /setup to create an admin account."
            : null
    );

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        const { error: authError } = await supabase.auth.signInWithPassword({
            email,
            password,
        });

        if (authError) {
            setError(authError.message);
            setLoading(false);
            return;
        }

        // Fetch the user's role to redirect to the correct dashboard
        const {
            data: { user },
        } = await supabase.auth.getUser();

        if (user) {
            const { data: profile } = await supabase
                .from("users")
                .select("role")
                .eq("id", user.id)
                .single();

            if (!profile?.role) {
                setError(
                    "Your account has no role assigned. Go to /setup to create an admin account."
                );
                setLoading(false);
                return;
            }

            const dashboardMap: Record<string, string> = {
                admin: "/admin",
                biker: "/biker",
                department: "/department",
            };
            router.refresh(); // Crucial for Server Components to get the new cookies
            router.push(dashboardMap[profile.role] || "/login");
        }

        setLoading(false);
    };

    return (
        <div className="min-h-screen flex items-center justify-center px-4 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
            <div className="w-full max-w-md">
                {/* Header */}
                <div className="text-center mb-6">
                    <div className="flex items-center justify-center gap-2 mb-3">
                        <Shield className="w-8 h-8 text-blue-400" />
                        <span className="text-2xl font-bold text-white">
                            Civic Issue Tracker
                        </span>
                    </div>
                    <p className="text-slate-400 mt-2">Sign in to your dashboard</p>
                </div>

                {/* Card */}
                <form
                    onSubmit={handleLogin}
                    className="bg-white/5 border border-white/10 backdrop-blur-sm rounded-2xl p-8 space-y-5"
                >
                    {error && (
                        <div className="bg-red-500/10 border border-red-500/30 text-red-300 text-sm rounded-lg px-4 py-3">
                            {error}
                        </div>
                    )}

                    <div>
                        <label
                            htmlFor="email"
                            className="block text-sm font-medium text-slate-300 mb-1.5"
                        >
                            Email
                        </label>
                        <input
                            id="email"
                            type="email"
                            required
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="w-full px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-colors"
                            placeholder="you@example.com"
                        />
                    </div>

                    <div>
                        <label
                            htmlFor="password"
                            className="block text-sm font-medium text-slate-300 mb-1.5"
                        >
                            Password
                        </label>
                        <input
                            id="password"
                            type="password"
                            required
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="w-full px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-colors"
                            placeholder="••••••••"
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full flex items-center justify-center gap-2 py-2.5 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white font-semibold rounded-xl transition-colors"
                    >
                        <LogIn className="w-4 h-4" />
                        {loading ? "Signing in…" : "Sign In"}
                    </button>

                    <p className="text-center text-xs text-slate-600 pt-1">
                        First time?{" "}
                        <a href="/setup" className="text-slate-400 hover:text-white underline">
                            Create admin account →
                        </a>
                    </p>
                </form>
            </div>
        </div>
    );
}

// Suspense wrapper required by Next.js for useSearchParams in a client component
export default function LoginPage() {
    return (
        <Suspense>
            <LoginForm />
        </Suspense>
    );
}
