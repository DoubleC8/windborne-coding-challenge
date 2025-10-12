"use client";

import {
  BalloonDataResponse,
  fetchBalloonData,
  getAverageDist,
  getBalloonTrajectories,
  getMaxAltitude,
  getMaxDistance,
  getMinAltitude,
  getMinDistance,
} from "@/lib/utils/balloonData";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { ChevronDown, ChevronUp, Plane, Rabbit, Turtle } from "lucide-react";
import BalloonDataCard from "@/components/balloons-overview/BalloonDataCard";

export default function BallonsOverview() {
  const [balloonData, setBalloonData] = useState<BalloonDataResponse | null>(
    null
  );
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setLoading(true);
    fetchBalloonData()
      .then((data) => {
        setBalloonData(data);
        toast.success("Successfully fetched balloon data.", {
          description: `At ${new Date().toLocaleTimeString("en-US")}`,
        });
      })
      .catch((error) => {
        console.error("Error fetching balloon data:", error);
        toast.error(
          "An unexpected error occured while trying to fetch balloon data.",
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
  const balloonPaths = getBalloonTrajectories(data);
  const highestBalloon = getMaxAltitude(balloonPaths);
  const lowestBalloon = getMinAltitude(balloonPaths);
  const longestDistBalloon = getMaxDistance(balloonPaths);
  const shortestDistBalloon = getMinDistance(balloonPaths);
  const averageDistance = getAverageDist(balloonPaths);

  console.log("Data: ", balloonData);
  console.log("Trajectories: ", balloonPaths);
  console.log(
    "Flattened trajectories: ",
    balloonPaths.flatMap((t) => t.path)
  );

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
