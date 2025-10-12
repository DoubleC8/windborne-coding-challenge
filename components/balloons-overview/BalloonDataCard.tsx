import { LucideIcon } from "lucide-react";
import { Card, CardHeader } from "../ui/card";

export default function BalloonDataCard({
  Icon,
  title,
  message,
  kilometers,
  balloonId,
}: {
  Icon: LucideIcon;
  title: string;
  message: string;
  kilometers?: number | null;
  balloonId?: number | null;
}) {
  const safeKm =
    typeof kilometers === "number" && !isNaN(kilometers)
      ? kilometers.toFixed(2)
      : "N/A";
  const safeBalloon =
    typeof balloonId === "number"
      ? balloonId === 0
        ? "Unknown ¯\\_(ツ)_/¯"
        : `#${balloonId}`
      : "Unavailable";

  return (
    <Card className="flex flex-col gap-5 w-[49%] h-[25vh] text-center">
      <CardHeader className="flex flex-col items-center justify-center">
        <Icon className="text-[var(--app-green)] size-6" />
        <p className="font-extrabold">{title}</p>
      </CardHeader>

      <p className="text-muted-foreground">
        {message}: <strong className="text-[var(--app-green)]">{safeKm}</strong>{" "}
        km
        <br />
        {balloonId ? (
          <span className="text-sm text-muted-foreground">
            By Balloon{" "}
            <strong className="text-[var(--app-green)]">{safeBalloon}</strong>
          </span>
        ) : null}
      </p>
    </Card>
  );
}
