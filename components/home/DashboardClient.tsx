"use client";

import { useEffect, useState } from "react";
import { BalloonDataResponse, fetchBalloonData } from "@/lib/utils/balloonData";
import { toast } from "sonner";
import BalloonMap from "./balloon-map/BalloonMap";
import GlobalInsights from "./GlobalInsights";
import { LoaderCircle } from "lucide-react";

export default function DashboardClient() {
  const [balloonData, setBalloonData] = useState<BalloonDataResponse | null>(
    null
  );
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchBalloonData()
      .then((data) => {
        console.log("Fetched balloon data:", data);
        setBalloonData(data);
        toast.success("Successfully fetched balloon data.", {
          description: `At ${new Date().toLocaleTimeString("en-US")}`,
        });
      })
      .catch((error) => {
        console.error("Error fetching balloon data:", error);
        setError("Failed to load balloon data");
        toast.error(
          "An unexpected error occurred while trying to fetch balloon data.",
          {
            description: "Please try again later.",
          }
        );
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  if (loading) {
    return (
      <div className="min-h-[600px] w-full flex items-center justify-center">
        <div className="text-center flex flex-col gap-3 items-center">
          <LoaderCircle className="animate-spin" />
          <p className="text-gray-600">Loading balloon data...</p>
        </div>
      </div>
    );
  }

  if (error || !balloonData) {
    return (
      <div className="min-h-[600px] w-full flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 mb-2">⚠️ {error || "No data available"}</p>
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-3">
      <BalloonMap balloonData={balloonData} />
      <GlobalInsights balloonData={balloonData} />
    </div>
  );
}
