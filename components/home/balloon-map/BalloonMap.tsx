"use client";

import { MapLoader } from "@/components/ui/loaders/MapLoader";
import { BalloonTrajectory } from "@/lib/utils/balloonData";
import dynamic from "next/dynamic";

const MapWithNoSSR = dynamic<{
  balloonPaths: BalloonTrajectory[];
}>(() => import("./MapComponent"), {
  ssr: false,
  loading: () => <MapLoader />,
});

export default function BalloonMap({
  balloonPaths,
}: {
  balloonPaths: BalloonTrajectory[];
}) {
  return <MapWithNoSSR balloonPaths={balloonPaths} />;
}
