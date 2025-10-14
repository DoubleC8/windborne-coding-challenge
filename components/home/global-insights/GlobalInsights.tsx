"use client";

import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { BalloonTrajectory, getGlobalDrift } from "@/lib/utils/balloonData";
import { Compass } from "lucide-react";

export default function GlobalInsights({
  balloonPaths,
}: {
  balloonPaths: BalloonTrajectory[];
}) {
  const drift = getGlobalDrift(balloonPaths);

  return (
    <Card className="md:w-1/3 gap-3">
      <CardHeader>
        <div className="flex flex-col items-center gap-3">
          <Compass className="text-[var(--app-green)]" />
          <p className="text-xl font-bold">Dominant Wind Drift</p>
        </div>
      </CardHeader>
      <CardContent>
        <p className="text-muted-foreground">
          Across all tracked balloons, the constellation drifted predominantly
          <strong className="text-[var(--app-green)]">
            {" "}
            {drift.direction}
          </strong>{" "}
          (~{drift.angle?.toFixed(1)}° average bearing).
        </p>
      </CardContent>
    </Card>
  );
}
