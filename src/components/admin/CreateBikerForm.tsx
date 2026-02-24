"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { UserPlus, Loader2, CheckCircle2, AlertCircle, Eye, EyeOff } from "lucide-react";

export default function CreateBikerForm({ onSuccess }: { onSuccess: () => void }) {
    const supabase = createClient();

    const [fullName, setFullName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState(false);

    const handleCreate = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);
        setSuccess(false);

        const { error: signUpError } = await supabase.auth.signUp({
            email,
            password,
            options: {
                data: {
                    full_name: fullName,
                    role: "biker",
                },
            },
        });

        if (signUpError) {
            setError(signUpError.message);
        } else {
            setSuccess(true);
            setFullName("");
            setEmail("");
            setPassword("");
            onSuccess();
        }

        setLoading(false);
    };

    return (
        <form onSubmit={handleCreate} className="space-y-5">
            {error && (
                <div className="bg-red-500/10 border border-red-500/30 text-red-300 text-sm rounded-xl px-4 py-3 flex items-center gap-3">
                    <AlertCircle className="w-4 h-4 flex-shrink-0" />
                    {error}
                </div>
            )}
            {success && (
                <div className="bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-sm rounded-xl px-4 py-3 flex items-center gap-3">
                    <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
                    Biker account created successfully!
                </div>
            )}

            <div>
                <label className="block text-sm font-medium text-slate-300 mb-1.5">Full Name</label>
                <input
                    type="text"
                    required
                    placeholder="e.g. Ravi Kumar"
                    className="w-full px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                />
            </div>

            <div>
                <label className="block text-sm font-medium text-slate-300 mb-1.5">Email Address</label>
                <input
                    type="email"
                    required
                    placeholder="biker@example.com"
                    className="w-full px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                />
            </div>

            <div>
                <label className="block text-sm font-medium text-slate-300 mb-1.5">Password</label>
                <div className="relative">
                    <input
                        type={showPassword ? "text" : "password"}
                        required
                        minLength={6}
                        placeholder="Min. 6 characters"
                        className="w-full px-4 py-2.5 pr-11 rounded-xl bg-white/5 border border-white/10 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                    />
                    <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-white transition-colors"
                    >
                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                </div>
            </div>

            <button
                type="submit"
                disabled={loading}
                className="w-full flex items-center justify-center gap-2 py-2.5 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white font-semibold rounded-xl transition-colors active:scale-[0.98]"
            >
                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <UserPlus className="w-4 h-4" />}
                {loading ? "Creating..." : "Create Biker Account"}
            </button>
        </form>
    );
}
