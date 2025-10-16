"use client";

import BalloonDataCard from "@/components/cards/BalloonDataCard";
import TempVsAltitudeChart from "@/components/charts/TempVsAltitudeChart";
import { ErrorState } from "@/components/ui/error-state";
import { GraphLoader } from "@/components/ui/loaders/GraphLoader";
import {
  annotateWithTemperature,
  BalloonTrajectory,
  computeTempTrend,
  getGlobalDrift,
  getLatestPoints,
  PointWithTemp,
} from "@/lib/utils/balloonData";
import { Compass, Earth, ScatterChart, Snowflake } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";

export default function GlobalInsights({
  balloonPaths,
}: {
  balloonPaths: BalloonTrajectory[];
}) {
  const [annotatedPoints, setAnnotatedPoints] = useState<PointWithTemp[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const drift = getGlobalDrift(balloonPaths);
  const tempTrend = computeTempTrend(annotatedPoints);

  const fetchData = useCallback(async () => {
    // Don't fetch if no balloon paths available
    if (balloonPaths.length === 0) {
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const latestPoints = getLatestPoints(balloonPaths);
      const pointsWithTemp = await annotateWithTemperature(
        latestPoints.slice(0, 100)
      );
      setAnnotatedPoints(pointsWithTemp);
      toast.success("Successfully fetched Surface Temp data from Open-Meteo.", {
        description: `At ${new Date().toLocaleTimeString("en-US", {
          hour: "2-digit",
          minute: "2-digit",
          hour12: true,
        })}`,
      });
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Failed to load surface temp data";
      setError(errorMessage);
      console.error(
        "Unexpected error occurred while fetching surface temp data: ",
        err
      );
      toast.error("Failed to fetch surface temp data", {
        description: "Please check your connection and try again.",
      });
    } finally {
      setLoading(false);
    }
  }, [balloonPaths]);

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 600000); // 10 minutes
    return () => clearInterval(interval);
  }, [fetchData]);

  if (error) {
    return <ErrorState error={error} />;
  }

  return (
    <div className="flex flex-col gap-3">
      <div className="flex  items-center gap-1">
        <Earth className="text-[var(--app-green)]" />
        <h2 className="text-xl font-bold">Global Insights</h2>
      </div>

      <div
        className="lg:grid-cols-3 md:grid-cols-2
      grid grid-cols-1 gap-3"
      >
        <BalloonDataCard
          Icon={Compass}
          title="Dominant Wind Drift"
          message={
            <>
              Across all tracked balloons, the constellation drifted
              predominantly
              <strong className="text-[var(--app-green)]">
                {" "}
                {drift.direction}
              </strong>{" "}
              (~
              <strong className="text-[var(--app-green)]">
                {drift.angle?.toFixed(1)}°
              </strong>{" "}
              average bearing)
            </>
          }
        />
        <BalloonDataCard
          Icon={Snowflake}
          title="Altitude vs Surface Temperature"
          message={
            tempTrend ? (
              <>
                Decrease in Temperature:
                <br />{" "}
                <strong className="text-[var(--app-green)]">
                  {tempTrend.slope.toFixed(2)}
                </strong>{" "}
                °C/km (R² ={" "}
                <strong className="text-[var(--app-green)]">
                  {tempTrend.r2.toFixed(2)}
                </strong>
                , n ={" "}
                <strong className="text-[var(--app-green)]">
                  {tempTrend.n}
                </strong>
                )
                <br />
                <span className="text-xs text-muted-foreground">
                  Using surface temperature below each balloon as a proxy.
                </span>
              </>
            ) : (
              <span className="text-muted-foreground text-sm">
                Not enough data to determine trend. (◞‸◟,)
              </span>
            )
          }
        />
      </div>

      <div className="flex  items-center gap-1">
        <ScatterChart className="text-[var(--app-green)]" />
        <h2 className="text-xl font-bold">
          Altitude vs Surface Temperature Trend Line
        </h2>
      </div>
      {loading ? (
        <GraphLoader />
      ) : (
        <>
          <TempVsAltitudeChart
            points={annotatedPoints}
            slope={tempTrend?.slope ?? 0}
            intercept={tempTrend?.intercept ?? 0}
          />
          <span className="text-xs text-muted-foreground">
            Using surface temperature below each balloon as a proxy.
          </span>
        </>
      )}
    </div>
  );
}
