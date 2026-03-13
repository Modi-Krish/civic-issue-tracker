import Link from "next/link";
import { Shield, MapPin, Camera } from "lucide-react";

export default function HomePage() {
    return (
        <div className="min-h-screen flex flex-col items-center justify-center px-6 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white">
            {/* Hero */}
            <div className="text-center max-w-2xl" style={{ marginBottom: "10px" }}>
                <div className="flex items-center justify-center gap-3 mb-6">
                    <Shield className="w-10 h-10 text-blue-400" style={{ marginBottom: "10px" }} />
                    <h1 className="text-4xl md:text-5xl font-bold tracking-tight" style={{ marginBottom: "10px" }}>
                        Civic Issue Tracker
                    </h1>
                </div>
                <p className="text-lg text-slate-300 mb-10 leading-relaxed" style={{ marginBottom: "10px" }}>
                    Report, track, and resolve civic issues across your city. Powered by
                    real-time maps, role-based dashboards, and image evidence.
                </p>
                <Link
                    href="/login"
                    className="inline-block bg-blue-600 hover:bg-blue-500 text-white font-semibold rounded-xl transition-colors text-lg shadow-lg shadow-blue-600/20"
                    style={{ width: "154px", height: "30px", paddingLeft: "2px", paddingRight: "2px", borderRightWidth: "0px", borderLeftWidth: "0px" }}
                >
                    Get Started →
                </Link>
            </div>

            {/* Feature Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-16 max-w-4xl w-full">
                <FeatureCard
                    icon={<Shield className="w-6 h-6 text-blue-400" />}
                    title="Role-Based Access"
                    description="Admin, Biker, and Department dashboards with granular access control."
                />
                <FeatureCard
                    icon={<MapPin className="w-6 h-6 text-emerald-400" />}
                    title="GIS Monitoring"
                    description="Pin issues on an interactive map and track resolution in real time."
                />
                <FeatureCard
                    icon={<Camera className="w-6 h-6 text-amber-400" />}
                    title="Image Evidence"
                    description="Upload before & after photos to verify issue resolution on the ground."
                />
            </div>
        </div>
    );
}

function FeatureCard({
    icon,
    title,
    description,
}: {
    icon: React.ReactNode;
    title: string;
    description: string;
}) {
    return (
        <div className="p-6 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-sm hover:bg-white/10 transition-colors text-center">
            <div className="mb-3 flex justify-center">
                <span style={{ marginTop: "10px", display: "flex" }}>{icon}</span>
            </div>
            <h3 className="font-semibold text-lg mb-1">{title}</h3>
            <p className="text-sm text-slate-400" style={{ marginLeft: "10px", marginRight: "10px", marginBottom: "10px" }}>{description}</p>
        </div>
    );
}
