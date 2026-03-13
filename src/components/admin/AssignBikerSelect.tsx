"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import { CheckCircle2, Loader2 } from "lucide-react";

interface Biker {
    id: string;
    full_name: string | null;
    email: string;
}

interface AssignBikerSelectProps {
    issueId: string;
    currentBikerId: string | null;
    bikers: Biker[];
}

export default function AssignBikerSelect({
    issueId,
    currentBikerId,
    bikers,
}: AssignBikerSelectProps) {
    const supabase = createClient();
    const router = useRouter();
    const [saving, setSaving] = useState(false);
    const [saved, setSaved] = useState(false);
    const [value, setValue] = useState(currentBikerId ?? "");

    const handleChange = async (e: React.ChangeEvent<HTMLSelectElement>) => {
        const newValue = e.target.value;
        setValue(newValue);
        setSaving(true);
        setSaved(false);

        await supabase
            .from("issues")
            .update({ assigned_biker_id: newValue || null })
            .eq("id", issueId);

        setSaving(false);
        setSaved(true);
        setTimeout(() => setSaved(false), 2000);
        router.refresh();
    };

    return (
        <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
            <select
                value={value}
                onChange={handleChange}
                disabled={saving}
                style={{
                    background: "#181c22",
                    border: "1px solid rgba(255,255,255,0.07)",
                    borderRadius: "8px",
                    padding: "0.3rem 1.6rem 0.3rem 0.6rem",
                    fontFamily: "'DM Sans', sans-serif",
                    fontSize: "0.78rem",
                    color: "#6b7280",
                    outline: "none",
                    cursor: "pointer",
                    appearance: "none" as const,
                    backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='10' height='10' viewBox='0 0 24 24' fill='none' stroke='%236b7280' stroke-width='2'%3E%3Cpath d='m6 9 6 6 6-6'/%3E%3C/svg%3E")`,
                    backgroundRepeat: "no-repeat",
                    backgroundPosition: "right 0.4rem center",
                    maxWidth: "150px",
                    opacity: saving ? 0.5 : 1,
                }}
            >
                <option value="">— Unassigned —</option>
                {bikers.map((biker) => (
                    <option key={biker.id} value={biker.id}>
                        {biker.full_name || biker.email}
                    </option>
                ))}
            </select>
            {saving && <Loader2 className="w-3 h-3 animate-spin" style={{ color: "#6b7280" }} />}
            {saved && <CheckCircle2 className="w-3 h-3" style={{ color: "#10b981" }} />}
        </div>
    );
}
