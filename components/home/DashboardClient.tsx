"use client";

import { useEffect, useState, useCallback } from "react";
import {
  BalloonDataResponse,
  fetchBalloonData,
  getBalloonTrajectories,
} from "@/lib/utils/balloonData";
import { toast } from "sonner";
import BalloonMap from "./balloon-map/BalloonMap";
import GlobalInsights from "./global-insights/GlobalInsights";
import { ChevronLeft, ChevronRight } from "lucide-react";
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

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 600000); // 10 minutes
    return () => clearInterval(interval);
  }, [fetchData]);

  const balloonPaths = balloonData
    ? getBalloonTrajectories(balloonData.data)
    : [];

  const pagination = usePagination(balloonPaths.length, BALLOONS_PER_PAGE);

  const paginatedPaths = balloonPaths.slice(
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
        <h2 className="text-xl font-bold">Balloon Map</h2>
        <p className="text-sm text-muted-foreground">
          Tracking{" "}
          <strong className="text-[var(--app-green)] text-lg">
            {balloonData.metadata.totalBalloons.toLocaleString()}
          </strong>{" "}
          balloons worldwide.
        </p>
        <BalloonMap balloonPaths={paginatedPaths} />

        {/* Pagination Controls */}

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
          <div className="flex flex-col gap-3">
            <p className="text-xs sm:text-sm text-muted-foreground text-center">
              Showing <strong>{pagination.startIndex + 1}</strong> –{" "}
              <strong>{pagination.endIndex}</strong> of{" "}
              <strong>{balloonPaths.length}</strong>
            </p>
            <p className="text-xs text-muted-foreground text-center">
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

      <BallonsOverview balloonData={balloonData} />
    </div>
  );
}
