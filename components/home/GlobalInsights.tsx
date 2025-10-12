"use client";

import {
  BalloonDataResponse,
  getBalloonTrajectories,
  getGlobalCoverageStats,
} from "@/lib/utils/balloonData";

interface GlobalInsightsProps {
  balloonData: BalloonDataResponse;
}

export default function GlobalInsights({ balloonData }: GlobalInsightsProps) {
  const { data } = balloonData;
  const balloonPaths = getBalloonTrajectories(data);
  const coverage = getGlobalCoverageStats(balloonPaths);

  return (
    <div>
      <p>This will be a global insights page of our balloons</p>
    </div>
  );
}
