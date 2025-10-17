"use client";

import {
  BalloonDataResponse,
  getAverageDist,
  getBalloonTrajectories,
  getMaxAltitude,
  getMaxDistance,
  getMinAltitude,
  getMinDistance,
  getFastestBalloon,
  getAltitudeExplorer,
  getEverestComparison,
  getMrConsistent,
} from "@/lib/utils/balloonData";

import {
  ChartNoAxesColumn,
  ChevronDown,
  ChevronUp,
  Frown,
  Mountain,
  Plane,
  Rabbit,
  RefreshCcw,
  Rocket,
  Route,
  Turtle,
  Zap,
} from "lucide-react";
import BalloonDataCard from "@/components/cards/BalloonDataCard";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function BallonsOverview({
  balloonData,
}: {
  balloonData: BalloonDataResponse;
}) {
  if (!balloonData)
    return (
      <div className="flex flex-col justify-center h-full">
        <Card className="flex flex-col items-center gap-3 w-1/2 mx-auto justify-center">
          <CardHeader>
            <Frown className="text-[var(--app-green)]" />
          </CardHeader>
          <CardContent className="flex flex-col gap-3">
            <p>An Unexpected Error Occurred while Fetching the Balloon Data</p>
            <Button className="w-1/2 mx-auto bg-[var(--app-green)] hover:bg-[var(--app-green)]/85">
              <Link href={"/"} className="flex items-center gap-3">
                Refresh <RefreshCcw />
              </Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );

  const { data } = balloonData;
  const balloonPaths = getBalloonTrajectories(data || []);
  const highestBalloon = getMaxAltitude(balloonPaths);
  const lowestBalloon = getMinAltitude(balloonPaths);
  const longestDistBalloon = getMaxDistance(balloonPaths);
  const shortestDistBalloon = getMinDistance(balloonPaths);
  const averageDistance = getAverageDist(balloonPaths);

  // New fun facts
  const fastestBalloon = getFastestBalloon(balloonPaths);
  const altitudeExplorer = getAltitudeExplorer(balloonPaths);
  const directionMaster = getMrConsistent(balloonPaths);
  const everestComparison = getEverestComparison(balloonPaths);

  // Safe fallback values
  const safeDistance = (distance: number) =>
    isNaN(distance) || !isFinite(distance) ? 0 : distance;
  const safeAltitude = (altitude: number | null) =>
    altitude === null || isNaN(altitude) || !isFinite(altitude) ? 0 : altitude;
  const safeBalloonId = (id: number | null) => (id === null ? "N/A" : `#${id}`);

  const balloonCards = [
    {
      Icon: Rabbit,
      title: "Longest Distance",
      message: (
        <>
          The longest distance traveled today was{" "}
          <strong className="text-[var(--app-green)]">
            {safeDistance(longestDistBalloon.distance).toFixed(2)} km
          </strong>{" "}
          by Balloon{" "}
          <strong className="text-[var(--app-green)]">
            {safeBalloonId(longestDistBalloon.balloonId)}
          </strong>
        </>
      ),
    },
    {
      Icon: Turtle,
      title: "Shortest Distance",
      message: (
        <>
          The shortest distance traveled today was{" "}
          <strong className="text-[var(--app-green)]">
            {safeDistance(shortestDistBalloon.distance).toFixed(2)} km
          </strong>{" "}
          by Balloon{" "}
          <strong className="text-[var(--app-green)]">
            {safeBalloonId(shortestDistBalloon.balloonId)}
          </strong>
        </>
      ),
    },
    {
      Icon: Plane,
      title: "Average Distance Traveled",
      message: (
        <>
          The average distance traveled today was{" "}
          <strong className="text-[var(--app-green)]">
            {safeDistance(averageDistance).toFixed(2)} km
          </strong>
        </>
      ),
    },
    {
      Icon: ChevronUp,
      title: "Highest Altitude",
      message: (
        <>
          The highest altitude recorded today was{" "}
          <strong className="text-[var(--app-green)]">
            {safeAltitude(highestBalloon?.altitude).toFixed(2)} km
          </strong>{" "}
          by Balloon{" "}
          <strong className="text-[var(--app-green)]">
            {safeBalloonId(highestBalloon?.balloonId)}
          </strong>
        </>
      ),
    },
    {
      Icon: ChevronDown,
      title: "Lowest Altitude",
      message: (
        <>
          The lowest altitude recorded today was{" "}
          <strong className="text-[var(--app-green)]">
            {safeAltitude(lowestBalloon?.altitude).toFixed(2)} km
          </strong>{" "}
          by Balloon{" "}
          <strong className="text-[var(--app-green)]">
            {safeBalloonId(lowestBalloon?.balloonId)}
          </strong>
        </>
      ),
    },
    {
      Icon: Rocket,
      title: "Biggest Change in Altitude",
      message: (
        <>
          Balloon{" "}
          <strong className="text-[var(--app-green)]">
            #{altitudeExplorer.balloonId}
          </strong>{" "}
          had the biggest altitude increase, ranging{" "}
          <strong className="text-[var(--app-green)]">
            {safeDistance(altitudeExplorer.altitudeRange).toFixed(2)} km
          </strong>{" "}
          from {safeAltitude(altitudeExplorer.minAltitude).toFixed(2)} km to{" "}
          {safeAltitude(altitudeExplorer.maxAltitude).toFixed(2)} km
        </>
      ),
    },
    {
      Icon: Zap,
      title: "Fastest Balloon",
      message: (
        <>
          The fastest balloon of the day was Balloon{" "}
          <strong className="text-[var(--app-green)]">
            #{fastestBalloon.balloonId}
          </strong>{" "}
          with an average speed of{" "}
          <strong className="text-[var(--app-green)]">
            {safeDistance(fastestBalloon.averageSpeed).toFixed(2)} km/h
          </strong>
        </>
      ),
    },

    {
      Icon: Route,
      title: "Mr. Consistent",
      message: (
        <>
          Balloon{" "}
          <strong className="text-[var(--app-green)]">
            #{directionMaster.balloonId}
          </strong>{" "}
          was the most focused flyer with{" "}
          <strong className="text-[var(--app-green)]">
            {directionMaster.directionConsistency.toFixed(1)}%
          </strong>{" "}
          direction consistency
        </>
      ),
    },
    {
      Icon: Mountain,
      title: "Vs. Mount Everest",
      message: (
        <>
          <strong className="text-[var(--app-green)]">
            {everestComparison.aboveEverest}
          </strong>{" "}
          out of {everestComparison.totalBalloons} balloons flew higher than
          Mount Everest{" "}
          <strong className="text-[var(--app-green)]">
            ({everestComparison.everestHeight} km)
          </strong>{" "}
          that&apos;s {everestComparison.percentage.toFixed(1)}%
        </>
      ),
    },
  ];

  return (
    <div className="flex flex-col gap-3">
      <div className="flex gap-1">
        <ChartNoAxesColumn className="text-[var(--app-green)]" />
        <h2 className="text-xl font-bold">Balloons Overview (Fun Facts)</h2>
      </div>
      <div
        className="lg:grid-cols-3 md:grid-cols-2
      grid grid-cols-1 gap-3"
      >
        {balloonCards.map(({ Icon, title, message }, idx) => (
          <BalloonDataCard
            key={idx}
            Icon={Icon}
            title={title}
            message={message}
          />
        ))}
      </div>
    </div>
  );
}
