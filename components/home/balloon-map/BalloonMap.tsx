"use client";

import { BalloonDataResponse } from "@/lib/utils/balloonData";
import dynamic from "next/dynamic";

const MapWithNoSSR = dynamic<{ balloonData: BalloonDataResponse }>(
  () => import("./MapComponent"),
  {
    ssr: false,
    loading: () => (
      <div className="h-[600px] w-full flex items-center justify-center bg-gray-100 rounded-lg">
        <p className="text-gray-600">Loading map...</p>
      </div>
    ),
  }
);

interface BalloonMapProps {
  balloonData: BalloonDataResponse;
}

export default function BalloonMap({ balloonData }: BalloonMapProps) {
  return <MapWithNoSSR balloonData={balloonData} />;
}
