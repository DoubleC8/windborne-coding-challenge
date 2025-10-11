"use client";

import {
  BalloonDataResponse,
  balloonTrajectories,
  fetchBalloonData,
  getAverageDist,
  getMaxAltitude,
  getMaxDistance,
  getMinAltitude,
  getMinDistance,
} from "@/lib/utils/balloonData";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Card, CardHeader } from "../ui/card";
import {
  ChevronDown,
  ChevronUp,
  Crosshair,
  MountainSnow,
  Plane,
  Rabbit,
  Turtle,
} from "lucide-react";
import BalloonDataCard from "../balloons-overview/BalloonDataCard";

export default function BallonsOverview() {
  const [balloonData, setBalloonData] = useState<BalloonDataResponse | null>(
    null
  );
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    fetchBalloonData()
      .then((data) => {
        console.log("Fetched balloon data:", data);
        setBalloonData(data);
        toast.success("Successfully fetched balloon data.", {
          description: `At ${new Date().toLocaleTimeString("en-US")}`,
        });
      })
      .catch((err) => {
        console.error("Error fetching balloon data:", err);
        toast.error(
          "An Unexpected Error has Occured while trying to get balloon data.",
          {
            description: "Please try again later.",
          }
        );
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  if (!balloonData) {
    return <div>No balloon data available :(</div>;
  }

  const { data, metadata } = balloonData;
  const balloonPaths = balloonTrajectories(data);
  const highestBalloon = getMaxAltitude(balloonPaths);
  const lowestBalloon = getMinAltitude(balloonPaths);
  const longestDistBalloon = getMaxDistance(balloonPaths);
  const shortestDistBalloon = getMinDistance(balloonPaths);
  const averageDistance = getAverageDist(balloonPaths);

  console.log("Data: ", data);
  console.log("The longest distance was: ", longestDistBalloon.distance);

  return (
    <div className="flex flex-wrap gap-5 justify-between">
      <BalloonDataCard
        Icon={Rabbit}
        title={"Longest Distance"}
        message={"The longest distance traveled today was"}
        kilometers={longestDistBalloon.distance ?? 0}
        balloonId={longestDistBalloon.balloon?.id ?? 0}
      />
      <BalloonDataCard
        Icon={Turtle}
        title={"Shortest Distance"}
        message={"The shortest distance traveled today was"}
        kilometers={shortestDistBalloon.distance ?? 0}
        balloonId={shortestDistBalloon.balloon?.id ?? 0}
      />
      <BalloonDataCard
        Icon={ChevronUp}
        title={"Highest Altitude"}
        message={"The highest altitude recorded today was"}
        kilometers={highestBalloon?.altitude ?? 0}
        balloonId={highestBalloon.balloonId ?? 0}
      />
      <BalloonDataCard
        Icon={ChevronDown}
        title={"Lowest Altitude"}
        message={"The lowest altitude recorded today was"}
        kilometers={lowestBalloon?.altitude ?? 0}
        balloonId={lowestBalloon.balloonId ?? 0}
      />
      <BalloonDataCard
        Icon={Plane}
        title={"Average Distance Traveled"}
        message={"The average distance traveled today was"}
        kilometers={averageDistance ?? 0}
      />
    </div>
  );
}
