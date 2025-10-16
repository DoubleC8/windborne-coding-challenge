import { Compass, HeartCrack, LucideIcon } from "lucide-react";
import { Card, CardContent, CardHeader } from "../ui/card";
import React, { JSX } from "react";

export default function BalloonDataCard({
  Icon,
  title,
  message,
}: {
  Icon: LucideIcon;
  title: string;
  message: string | JSX.Element;
}) {
  // Safe fallbacks for props
  const safeIcon = Icon || HeartCrack;
  const safeTitle = title || "No Data Available";
  const safeMessage =
    message || "Unable to load data at this time. ¯\\_(ツ)_/¯";

  return (
    <Card className="flex flex-col gap-3">
      <CardHeader>
        <div className="flex flex-col items-center gap-1">
          {React.createElement(safeIcon, {
            className: "text-[var(--app-green)]",
          })}
          <p className="text-xl font-bold">{safeTitle}</p>
        </div>
      </CardHeader>
      <CardContent className="text-center">
        <p className="text-muted-foreground">{safeMessage}</p>
      </CardContent>
    </Card>
  );
}
