import React, { useEffect } from "react";
import { MapContainer, TileLayer, GeoJSON, Marker, useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

// --- CUSTOM MAP ICONS ---
// Origin Indicator (Clean Blue Pin)
const startIcon = L.divIcon({
    html: `
    <div style="display: flex; justify-content: center; align-items: center; width: 32px; height: 32px; background: #3b82f6; border: 3px solid #fff; border-radius: 50%; box-shadow: 0 4px 6px rgba(0,0,0,0.3);">
      <span style="color: white; font-size: 11px; font-weight: 900; font-family: sans-serif;">A</span>
    </div>`,
    className: "custom-map-marker-start",
    iconSize: [32, 32],
    iconAnchor: [16, 16],
});

// Destination Indicator (Checkered Racing Flag SVG with contrasting dark background)
const finishIcon = L.divIcon({
    html: `
    <div style="display: flex; justify-content: center; align-items: center; width: 36px; height: 36px; background: black; border: 3px solid #fff; border-radius: 50%; box-shadow: 0 4px 10px rgba(0,0,0,0.4); overflow: hidden;">
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M5 21V4.5M5 4.5H19L17 9.5L19 14.5H5" stroke="#ffffff" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/>
        <path d="M5 7.5H18M5 11.5H18M9 4.5V14.5M13 4.5V14.5" stroke="rgba(255,255,255,0.4)" stroke-width="1"/>
      </svg>
    </div>`,
    className: "custom-map-marker-finish",
    iconSize: [36, 36],
    iconAnchor: [18, 18],
});

// Component helper to handle automatic zooming and panning
function ChangeMapView({ bounds }) {
    const map = useMap();
    useEffect(() => {
        if (bounds) {
            map.fitBounds(bounds, { padding: [40, 40] });
        }
    }, [bounds, map]);
    return null;
}

export default function RouteMap({ geometry }) {
    // Center map on Argentina by default
    const defaultCenter = [-38.4161, -63.6167];
    const defaultZoom = 4;

    let geojsonLayer = null;
    let mapBounds = null;
    let startCoords = null;
    let finishCoords = null;

    if (geometry && geometry.coordinates && geometry.coordinates.length > 0) {
        geojsonLayer = {
            type: "Feature",
            properties: {},
            geometry: geometry,
        };

        const leafletGeoJson = L.geoJSON(geojsonLayer);
        mapBounds = leafletGeoJson.getBounds();

        // Map [Lng, Lat] to Leaflet [Lat, Lng]
        const rawStart = geometry.coordinates[0];
        const rawFinish = geometry.coordinates[geometry.coordinates.length - 1];

        startCoords = [rawStart[1], rawStart[0]];
        finishCoords = [rawFinish[1], rawFinish[0]];
    }

    return (
        <div className="hytrac-map-fluid-canvas" style={{
            height: "100%",
            width: "100%",
            borderRadius: "8px",
            overflow: "hidden",
            border: "1px solid #cbd5e1"
        }}>
            <MapContainer
                center={defaultCenter}
                zoom={defaultZoom}
                style={{ height: "100%", width: "100%" }}
                zoomControl={true}
            >
                <TileLayer
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />

                {geojsonLayer && (
                    <GeoJSON
                        key={JSON.stringify(geometry)}
                        data={geojsonLayer}
                        style={{
                            color: "#2563eb",
                            weight: 5,
                            opacity: 0.85,
                        }}
                    />
                )}

                {mapBounds && <ChangeMapView bounds={mapBounds} />}

                {startCoords && <Marker position={startCoords} icon={startIcon} />}
                {finishCoords && <Marker position={finishCoords} icon={finishIcon} />}
            </MapContainer>
        </div>
    );
}