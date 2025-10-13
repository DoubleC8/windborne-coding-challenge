"use client";

import {
  MapContainer,
  Marker,
  Polyline,
  TileLayer,
  Tooltip,
} from "react-leaflet";
import L from "leaflet";
// @ts-expect-error
import "leaflet/dist/leaflet.css";
import { BalloonTrajectory } from "@/lib/utils/balloonData";
import { memo } from "react";
import MapLegend from "./MapLegend";

const MAP_CONFIG = {
  center: [0, 0] as [number, number],
  zoom: 2,
  height: "70vh",
  borderRadius: "16px",
} as const;

const POLYLINE_CONFIG = {
  color: "var(--app-green)",
  weight: 1.5,
  opacity: 0.6,
} as const;

// Fix for default marker icon in Next.js
if (typeof window !== "undefined") {
  delete (L.Icon.Default.prototype as any)._getIconUrl;
  L.Icon.Default.mergeOptions({
    iconRetinaUrl:
      "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png",
    iconUrl:
      "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png",
    shadowUrl:
      "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png",
  });
}

function getMarkerColor(alt: number): string {
  if (alt < 5) return "#1F51FF"; //neon blue
  if (alt < 10) return "#009E60"; //green
  if (alt < 20) return "	#FFDB58"; //yellow
  return "#FF3131"; //red
}

const BalloonTrajectoryLayer = memo(
  ({ balloon }: { balloon: BalloonTrajectory }) => {
    if (!balloon.path.length) return null;

    const positions = balloon.path.map(
      (p) => [p.lat, p.lon] as [number, number]
    );

    const latest = balloon.path[0];

    const color = getMarkerColor(latest.alt);

    const icon = new L.DivIcon({
      className: "custom-marker",
      html: `<div style="
        background:${color};
        width:10px;
        height:10px;
        border-radius:50%;
        border:1px solid white;
        "></div>`,
    });

    return (
      <>
        <Polyline positions={positions} pathOptions={POLYLINE_CONFIG}>
          <Tooltip direction="top">
            <div className="text-sm">
              <strong className="text-[var(--app-green)]">
                Balloon #{balloon.id}
              </strong>
              <br />
              Altitude: {latest.alt.toFixed(1)} km
              <br />
              Position: {latest.lat.toFixed(4)}°, {latest.lon.toFixed(4)}°
            </div>
          </Tooltip>
        </Polyline>

        <Marker position={[latest.lat, latest.lon]} icon={icon}>
          <Tooltip direction="top">
            <div className="text-sm">
              <strong className="text-[var(--app-green)]">
                Balloon #{balloon.id}
              </strong>
              <br />
              Altitude: {latest.alt.toFixed(2)} km
              <br />
              Current Position: {latest.lat.toFixed(4)}°,{" "}
              {latest.lon.toFixed(4)}°
            </div>
          </Tooltip>
        </Marker>
      </>
    );
  }
);

export default function MapComponent({
  balloonPaths,
}: {
  balloonPaths: BalloonTrajectory[];
}) {
  return (
    <div className="relative">
      <MapContainer
        center={MAP_CONFIG.center}
        zoom={MAP_CONFIG.zoom}
        scrollWheelZoom={true}
        style={{
          height: MAP_CONFIG.height,
          width: "100%",
          borderRadius: MAP_CONFIG.borderRadius,
        }}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        {balloonPaths.map((balloon) => (
          <BalloonTrajectoryLayer key={balloon.id} balloon={balloon} />
        ))}
      </MapContainer>

      <MapLegend />
    </div>
  );
}
