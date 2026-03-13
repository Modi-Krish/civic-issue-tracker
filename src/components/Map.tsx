"use client";

import { useEffect, useRef } from "react";

interface Marker {
    id: string;
    lat: number;
    lng: number;
    title: string;
    priority: string;
    status: string;
}

interface MapProps {
    center?: [number, number];
    zoom?: number;
    markers?: Marker[];
    height?: string;
}

export default function Map({
    center = [20.5937, 78.9629],
    zoom = 5,
    markers = [],
    height = "480px",
}: MapProps) {
    const mapRef = useRef<HTMLDivElement>(null);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const leafletMapRef = useRef<any>(null);

    useEffect(() => {
        if (typeof window === "undefined" || !mapRef.current) return;

        // cancelled flag prevents the async import from running after cleanup
        let cancelled = false;

        // Dynamically import Leaflet so it only runs client-side
        import("leaflet").then((L) => {
            if (cancelled || !mapRef.current) return;

            // Inject Leaflet CSS once
            if (!document.getElementById("leaflet-css")) {
                const link = document.createElement("link");
                link.id = "leaflet-css";
                link.rel = "stylesheet";
                link.href = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.css";
                document.head.appendChild(link);
            }

            // Fix default icon paths
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            delete (L.Icon.Default.prototype as any)._getIconUrl;
            L.Icon.Default.mergeOptions({
                iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
                iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
                shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
            });

            const container = mapRef.current!;

            // Clear stale _leaflet_id if any (from previous removal)
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            (container as any)._leaflet_id = undefined;

            const map = L.map(container, { center, zoom });
            leafletMapRef.current = map;

            L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
                attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
            }).addTo(map);

            markers.forEach((marker) => {
                if (!marker.lat || !marker.lng) return;

                const color =
                    marker.priority === "high" ? "#ef4444"
                        : marker.priority === "medium" ? "#f59e0b"
                            : "#64748b";

                const icon = L.divIcon({
                    className: "",
                    html: `<div style="
                        width:14px;height:14px;border-radius:50%;
                        background:${color};border:2.5px solid white;
                        box-shadow:0 0 6px ${color}80;
                    "></div>`,
                    iconSize: [14, 14],
                    iconAnchor: [7, 7],
                });

                L.marker([marker.lat, marker.lng], { icon })
                    .addTo(map)
                    .bindPopup(`
                        <div style="font-family:sans-serif;min-width:160px">
                            <p style="font-weight:700;margin:0 0 6px">${marker.title || "Issue"}</p>
                            <div style="font-size:11px;color:#555">
                                <span style="text-transform:uppercase;font-size:9px;color:#999">Status</span>
                                <span style="float:right;font-weight:600">${marker.status.replace("_", " ")}</span>
                            </div>
                            <div style="font-size:11px;color:#555;margin-top:4px">
                                <span style="text-transform:uppercase;font-size:9px;color:#999">Priority</span>
                                <span style="float:right;font-weight:600;color:${color}">${marker.priority}</span>
                            </div>
                        </div>
                    `);
            });

            // Auto-fit bounds if markers exist
            const validMarkers = markers.filter((m) => m.lat && m.lng);
            if (validMarkers.length > 0) {
                const bounds = L.latLngBounds(validMarkers.map((m) => [m.lat, m.lng]));
                map.fitBounds(bounds, { padding: [50, 50], maxZoom: 14 });
            }
        });

        return () => {
            cancelled = true; // stop async init if it hasn't run yet
            if (leafletMapRef.current) {
                try { leafletMapRef.current.remove(); } catch (_) { /* already removed */ }
                leafletMapRef.current = null;
            }
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    return (
        <div
            ref={mapRef}
            style={{ height, width: "100%", borderRadius: "1rem", overflow: "hidden" }}
        />
    );
}
