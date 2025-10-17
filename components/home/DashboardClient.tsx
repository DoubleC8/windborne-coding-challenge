"use client";

import { useEffect, useState, useCallback, useMemo } from "react";
import {
  BalloonDataResponse,
  fetchBalloonData,
  getBalloonTrajectories,
} from "@/lib/utils/balloonData";
import { toast } from "sonner";
import BalloonMap from "./balloon-map/BalloonMap";
import GlobalInsights from "./global-insights/GlobalInsights";
import { ChevronLeft, ChevronRight, Globe } from "lucide-react";
import { Button } from "../ui/button";
import { PageLoader } from "../ui/loaders/PageLoader";
import { ErrorState } from "../ui/error-state";
import { usePagination } from "@/hooks/use-pagination";
import BallonsOverview from "./balloons-overview/BalloonsOverview";

const BALLOONS_PER_PAGE = 200;

export default function DashboardClient() {
  const [balloonData, setBalloonData] = useState<BalloonDataResponse | null>(
    null
  );
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filters
  const [filters, setFilters] = useState({
    minAlt: 0,
    maxAlt: 25,
    hemisphere: "all",
  });

  const handleFilterChange = (key: string, value: string | number) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  };

  // Fetch data
  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const data = await fetchBalloonData();
      setBalloonData(data);
      toast.success("Successfully Fetched Balloon Data from Windborne.", {
        description: `At ${new Date().toLocaleTimeString("en-US", {
          hour: "2-digit",
          minute: "2-digit",
          hour12: true,
        })}`,
      });
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Failed to load balloon data";
      setError(errorMessage);
      console.error("Unexpected error occurred while fetching data: ", err);
      toast.error("Failed to fetch balloon data", {
        description: "Please check your connection and try again.",
      });
    } finally {
      setLoading(false);
    }
  }, []);

  // Auto-refresƒh
  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 600000); // 10 min
    return () => clearInterval(interval);
  }, [fetchData]);

  // Balloon paths - memoized to prevent unnecessary re-renders in GlobalInsights
  const balloonPaths = useMemo(() => {
    return balloonData ? getBalloonTrajectories(balloonData.data) : [];
  }, [balloonData]);

  // Apply filters
  const filteredPaths = balloonPaths.filter((path) => {
    const latest = path.path[0];
    if (!latest) return false;

    const alt = latest.alt;
    const lat = latest.lat;

    return (
      alt >= filters.minAlt &&
      alt <= filters.maxAlt &&
      (filters.hemisphere === "all" ||
        (filters.hemisphere === "north" && lat > 0) ||
        (filters.hemisphere === "south" && lat < 0))
    );
  });

  // Pagination (applied after filtering)
  const pagination = usePagination(filteredPaths.length, BALLOONS_PER_PAGE);

  const paginatedPaths = filteredPaths.slice(
    pagination.startIndex,
    pagination.endIndex
  );

  if (loading) return <PageLoader />;
  if (error || !balloonData)
    return <ErrorState error={error || "No data available"} />;

  return (
    <div className="flex flex-col gap-5 justify-center h-full">
      {/* Balloon Map Section */}
      <div className="flex flex-col gap-3">
        <div className="flex items-center gap-2">
          <h2 className="text-xl font-bold flex items-center gap-1">
            <Globe className="text-[var(--app-green)]" />
            Balloon Map
          </h2>
        </div>

        <p className="text-sm text-muted-foreground">
          Tracking{" "}
          <strong className="text-[var(--app-green)] text-lg">
            {balloonData.metadata.totalBalloons.toLocaleString()}
          </strong>{" "}
          balloons worldwide.
        </p>

        {/* Filter Controls */}
        <div className="flex flex-col sm:flex-row items-center gap-3 mb-2">
          {/* Hemisphere Filter */}
          <div className="flex items-center gap-2">
            <label className="text-sm text-muted-foreground">Hemisphere:</label>
            <select
              value={filters.hemisphere}
              onChange={(e) => handleFilterChange("hemisphere", e.target.value)}
              className="bg-background border rounded-md px-2 py-1 text-sm"
            >
              <option value="all">All</option>
              <option value="north">Northern</option>
              <option value="south">Southern</option>
            </select>
          </div>

          {/* Altitude Range */}
          <div className="flex items-center gap-2">
            <label className="text-sm text-muted-foreground">
              Altitude (km):
            </label>
            <input
              type="number"
              value={filters.minAlt}
              onChange={(e) =>
                handleFilterChange("minAlt", Number(e.target.value))
              }
              className="w-16 bg-background border rounded-md px-2 py-1 text-sm"
              min={0}
              max={40}
            />
            <span>–</span>
            <input
              type="number"
              value={filters.maxAlt}
              onChange={(e) =>
                handleFilterChange("maxAlt", Number(e.target.value))
              }
              className="w-16 bg-background border rounded-md px-2 py-1 text-sm"
              min={0}
              max={40}
            />
          </div>

          {/* Reset Button */}
          <Button
            onClick={() =>
              setFilters({
                minAlt: 0,
                maxAlt: 25,
                hemisphere: "all",
              })
            }
            variant="outline"
            size="sm"
          >
            Reset Filters
          </Button>
        </div>

        {/* Map */}
        <BalloonMap balloonPaths={paginatedPaths} />

        {/* Pagination */}
        <div className="flex items-center justify-between gap-4 px-2">
          <Button
            onClick={pagination.goPrev}
            disabled={!pagination.canGoPrev}
            variant="outline"
            size="sm"
            className="disabled:opacity-50"
          >
            <ChevronLeft className="h-4 w-4" />
            <span className="hidden sm:inline ml-1">Previous</span>
          </Button>

          <div className="flex flex-col gap-2 text-center">
            <p className="text-xs sm:text-sm text-muted-foreground">
              Showing <strong>{pagination.startIndex + 1}</strong> –{" "}
              <strong>{pagination.endIndex}</strong> of{" "}
              <strong>{filteredPaths.length}</strong> balloons
            </p>

            <p className="text-xs text-muted-foreground">
              Last updated: {balloonData.metadata.fetchedAt}
            </p>
          </div>

          <Button
            onClick={pagination.goNext}
            disabled={!pagination.canGoNext}
            variant="outline"
            size="sm"
            className="disabled:opacity-50"
          >
            <span className="hidden sm:inline mr-1">Next</span>
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Global Insights Section */}
      <GlobalInsights balloonPaths={balloonPaths} />

      {/* Fun Facts Section */}
      <BallonsOverview balloonData={balloonData} />
    </div>
  );
}
