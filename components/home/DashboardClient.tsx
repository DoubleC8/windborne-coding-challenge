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
import { ChevronLeft, ChevronRight, Frown, RefreshCcw } from "lucide-react";
import { Button } from "../ui/button";
import { Card, CardContent, CardHeader } from "../ui/card";
import Link from "next/link";
import { HomePageLoader } from "../ui/loaders/HomePageLoader";

const BALLOONS_PER_PAGE = 200;

function usePagination(totalItems: number, itemsPerPage: number) {
  const [page, setPage] = useState(0);

  const totalPages = Math.ceil(totalItems / itemsPerPage);
  const canGoNext = page < totalPages - 1;
  const canGoPrev = page > 0;

  const goNext = useCallback(() => {
    if (canGoNext) setPage((p) => p + 1);
  }, [canGoNext]);

  const goPrev = useCallback(() => {
    if (canGoPrev) setPage((p) => p - 1);
  }, [canGoPrev]);

  const reset = useCallback(() => setPage(0), []);

  return {
    page,
    canGoNext,
    canGoPrev,
    goNext,
    goPrev,
    reset,
    startIndex: page * itemsPerPage,
    endIndex: Math.min((page + 1) * itemsPerPage, totalItems),
  };
}

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
  }, []);

  const balloonPaths = balloonData
    ? getBalloonTrajectories(balloonData.data)
    : [];

  const pagination = usePagination(balloonPaths.length, BALLOONS_PER_PAGE);

  const paginatedPaths = balloonPaths.slice(
    pagination.startIndex,
    pagination.endIndex
  );

  if (loading) return <HomePageLoader />;
  if (error || !balloonData)
    return (
      <div className="flex flex-col justify-center h-full">
        <Card className="flex flex-col items-center gap-3 w-1/2 mx-auto justify-center">
          <CardHeader>
            <Frown className="text-[var(--app-green)]" />
          </CardHeader>
          <CardContent className="flex flex-col gap-3">
            <p>
              An Unexpected Error Occurred while Fetching the Balloon Data:{" "}
              {error}
            </p>
            <Button className="w-1/2 mx-auto bg-[var(--app-green)] hover:bg-[var(--app-green)]/85">
              <Link href={"/"} className="flex items-center gap-3">
                Refresh <RefreshCcw />
              </Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );

  return (
    <div className="flex flex-col justify-center h-full">
      <div className="flex flex-col gap-4">
        <p className="text-sm text-muted-foreground">
          Tracking{" "}
          <strong className="text-[var(--app-green)] text-lg">
            {balloonData.metadata.totalBalloons.toLocaleString()}
          </strong>{" "}
          balloons worldwide
        </p>

        <BalloonMap balloonPaths={paginatedPaths} />

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

          <p className="text-xs sm:text-sm text-muted-foreground text-center">
            Showing <strong>{pagination.startIndex + 1}</strong> –{" "}
            <strong>{pagination.endIndex}</strong> of{" "}
            <strong>{balloonPaths.length}</strong>
          </p>

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

      <GlobalInsights balloonData={balloonData} />
    </div>
  );
}
