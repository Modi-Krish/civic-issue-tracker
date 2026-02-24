"use client";

import { useEffect } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

// Fix for Leaflet default marker icons in Next.js
const DefaultIcon = L.icon({
    iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
    shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
    iconSize: [25, 41],
    iconAnchor: [12, 41],
});

L.Marker.prototype.options.icon = DefaultIcon;

interface MapProps {
    center?: [number, number];
    zoom?: number;
    markers?: {
        id: string;
        lat: number;
        lng: number;
        title: string;
        priority: string;
        status: string;
    }[];
}

function ChangeView({ center, zoom }: { center: [number, number]; zoom: number }) {
    const map = useMap();
    useEffect(() => {
        map.setView(center, zoom);
    }, [center, zoom, map]);
    return null;
}

export default function Map({
    center = [20.5937, 78.9629], // Default to India center
    zoom = 5,
    markers = [],
}: MapProps) {
    return (
        <div className="h-full w-full rounded-2xl overflow-hidden border border-white/10 shadow-lg">
            <MapContainer
                center={center}
                zoom={zoom}
                style={{ height: "100%", width: "100%" }}
                scrollWheelZoom={true}
            >
                <TileLayer
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />
                <ChangeView center={center} zoom={zoom} />
                {markers.map((marker) => (
                    <Marker key={marker.id} position={[marker.lat, marker.lng]}>
                        <Popup>
                            <div className="p-1">
                                <h3 className="font-bold text-slate-900">{marker.title}</h3>
                                <div className="mt-2 space-y-1 text-xs">
                                    <p className="flex justify-between gap-4">
                                        <span className="text-slate-500 font-medium uppercase tracking-wider text-[10px]">Status</span>
                                        <span className={`px-1.5 py-0.5 rounded capitalize ${marker.status === 'resolved' ? 'bg-emerald-100 text-emerald-700' :
                                                marker.status === 'in_progress' ? 'bg-blue-100 text-blue-700' :
                                                    'bg-amber-100 text-amber-700'
                                            }`}>
                                            {marker.status}
                                        </span>
                                    </p>
                                    <p className="flex justify-between gap-4">
                                        <span className="text-slate-500 font-medium uppercase tracking-wider text-[10px]">Priority</span>
                                        <span className={`px-1.5 py-0.5 rounded capitalize ${marker.priority === 'high' ? 'bg-red-100 text-red-700' :
                                                marker.priority === 'medium' ? 'bg-amber-100 text-amber-700' :
                                                    'bg-slate-100 text-slate-700'
                                            }`}>
                                            {marker.priority}
                                        </span>
                                    </p>
                                </div>
                            </div>
                        </Popup>
                    </Marker>
                ))}
            </MapContainer>
        </div>
    );
}
