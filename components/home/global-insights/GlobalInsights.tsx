"use client";

import {
  BalloonDataResponse,
  getBalloonTrajectories,
  getGlobalCoverageStats,
} from "@/lib/utils/balloonData";

export default function GlobalInsights({
  balloonData,
}: {
  balloonData: BalloonDataResponse;
}) {
  const { data } = balloonData;
  const balloonPaths = getBalloonTrajectories(data);
  const coverage = getGlobalCoverageStats(balloonPaths);

  return (
    <div>
      <p>This will be a global insights page of our balloons</p>
    </div>
  );
}
