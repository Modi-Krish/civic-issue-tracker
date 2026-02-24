"use client";

import dynamic from "next/dynamic";
import { MapPin } from "lucide-react";

const Map = dynamic(() => import("@/components/Map"), {
    ssr: false,
    loading: () => (
        <div className="h-full w-full bg-slate-900/50 animate-pulse rounded-2xl flex items-center justify-center border border-white/10">
            <MapPin className="w-8 h-8 text-slate-700" />
        </div>
    ),
});

interface Marker {
    id: string;
    lat: number;
    lng: number;
    title: string;
    priority: string;
    status: string;
}

export default function BikerMapView({ markers }: { markers?: Marker[] }) {
    return (
        <Map
            center={[20.5937, 78.9629]}
            zoom={5}
            markers={markers}
        />
    );
}
