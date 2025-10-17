"use client";

import BalloonDataCard from "@/components/cards/BalloonDataCard";
import TempVsAltitudeChart from "@/components/charts/TempVsAltitudeChart";
import { ErrorState } from "@/components/ui/error-state";
import { GraphLoader } from "@/components/ui/loaders/GraphLoader";
import {
  annotateWithTemperature,
  BalloonTrajectory,
  computeTempTrend,
  getAverageAltitude,
  getGlobalDrift,
  getLatestPoints,
  PointWithTemp,
} from "@/lib/utils/balloonData";

import {
  ChartNoAxesColumn,
  Compass,
  Earth,
  ScatterChart,
  Snowflake,
} from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";

export default function GlobalInsights({
  balloonPaths,
}: {
  balloonPaths: BalloonTrajectory[];
}) {
  const [annotatedPoints, setAnnotatedPoints] = useState<PointWithTemp[]>([]);
  const [sampleSize, setSampleSize] = useState<number>(50);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [cooldown, setCooldown] = useState(false);
  const [remainingTime, setRemainingTime] = useState(0);

  const drift = getGlobalDrift(balloonPaths);
  const tempTrend = computeTempTrend(annotatedPoints);
  const avgAlt = getAverageAltitude(balloonPaths);

  const fetchData = useCallback(async () => {
    if (balloonPaths.length === 0) {
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const latestPoints = getLatestPoints(balloonPaths);
      const sample = latestPoints
        .sort(() => Math.random() - 0.5)
        .slice(0, sampleSize);

      const pointsWithTemp = await annotateWithTemperature(sample);
      setAnnotatedPoints(pointsWithTemp);

      toast.success("Fetched Surface Temp data from Open-Meteo.", {
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
      console.error("Error fetching surface temp data:", err);
      toast.error("Failed to fetch surface temp data", {
        description: "Please check your connection and try again.",
      });
    } finally {
      setLoading(false);
    }
  }, [sampleSize, balloonPaths]);

  // only fetch when balloonPaths first becomes available or sample size changes
  useEffect(() => {
    if (balloonPaths.length === 0) return;
    fetchData();

    const interval = setInterval(fetchData, 600000); // every 10 min
    return () => clearInterval(interval);
  }, [fetchData, balloonPaths.length]); // use length instead of full array

  // sample size change handler with cooldown
  const handleSampleSizeChange = (value: number) => {
    if (cooldown) {
      toast.warning(
        `Please wait ${remainingTime}s before changing sample size again.`
      );
      return;
    }
    setSampleSize(value);
    toast.info(`Updating temperature trend with ${value} samples...`);

    setCooldown(true);
    setRemainingTime(30);

    const timer = setInterval(() => {
      setRemainingTime((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          setCooldown(false);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  if (error) return <ErrorState error={error} />;

  return (
    <div className="flex flex-col gap-3">
      {/* Header */}
      <div className="flex items-center gap-1">
        <Earth className="text-[var(--app-green)]" />
        <h2 className="text-xl font-bold">Global Insights</h2>
      </div>

      {/* Drift + Temp Cards */}
      <div className="lg:grid-cols-3 md:grid-cols-2 grid grid-cols-1 gap-3">
        <BalloonDataCard
          Icon={Compass}
          title="Dominant Wind Drift"
          message={
            <>
              Across all tracked balloons, the constellation drifted
              predominantly{" "}
              <strong className="text-[var(--app-green)]">
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

        {loading ? (
          <BalloonDataCard
            Icon={Snowflake}
            title="Altitude vs Surface Temperature"
            message={
              <>
                <span className="text-[var(--app-green)]">
                  Loading Temperature Data
                </span>
                , this might take awhile... (◞‸◟,)
              </>
            }
          />
        ) : (
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
        )}

        <BalloonDataCard
          Icon={ChartNoAxesColumn}
          title="Average Altitude"
          message={
            <>
              Across all tracked balloons, the average altitude reached today
              was{" "}
              <strong className="text-[var(--app-green)]">
                {avgAlt.toFixed(2)} km
              </strong>{" "}
              .
            </>
          }
        />
      </div>

      {/* Trend Chart */}
      <div className="flex items-center gap-1">
        <ScatterChart className="text-[var(--app-green)]" />
        <h2 className="text-xl font-bold">
          Altitude vs Surface Temperature Trend Line
        </h2>
      </div>

      {/* Sample Size Selector */}
      <div className="flex items-center gap-1">
        <label htmlFor="sample-size" className="text-sm text-muted-foreground">
          Sample Size:
        </label>
        <select
          id="sample-size"
          value={sampleSize}
          onChange={(e) => handleSampleSizeChange(Number(e.target.value))}
          className="bg-background border rounded-md px-2 py-1 text-sm"
        >
          <option value={50}>50</option>
          <option value={100}>100</option>
          <option value={200}>200</option>
        </select>
      </div>

      {/* Chart or Loader */}
      {loading ? (
        <>
          <GraphLoader />
          <span className="text-xs text-muted-foreground">
            Using surface temperature below each balloon as a proxy.
          </span>
        </>
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

      {/* Cooldown display */}
      {cooldown && (
        <p className="text-xs text-muted-foreground">
          Please wait {remainingTime}s before changing sample size again.
        </p>
      )}
    </div>
  );
}
