import { LoaderCircle } from "lucide-react";
import { Skeleton } from "../skeleton";

export function HomePageLoader() {
  return (
    <div className="flex flex-col justify-center h-full">
      <div className="text-center flex flex-col gap-3 items-center">
        <LoaderCircle
          className="animate-spin text-[var(--app-green)]"
          size={48}
        />
        <p className="text-muted-foreground">Loading balloon data...</p>
      </div>
    </div>
  );
}
