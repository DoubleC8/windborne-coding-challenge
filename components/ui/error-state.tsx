import { Frown, RefreshCcw } from "lucide-react";
import { Button } from "./button";
import { Card, CardContent, CardHeader } from "./card";
import Link from "next/link";

interface ErrorStateProps {
  error: string;
}

export function ErrorState({ error }: ErrorStateProps) {
  return (
    <div className="flex flex-col justify-center h-[100vh]">
      <Card className="md:w-1/2 w-full flex flex-col items-center gap-3 mx-auto justify-center text-center">
        <CardHeader>
          <Frown className="text-[var(--app-green)]" />
        </CardHeader>
        <CardContent className="flex flex-col gap-3">
          <p>
            An Unexpected Error Occurred while Fetching the Balloon Data:{" "}
            {error}
          </p>
          <Button className="w-1/2 mx-auto bg-[var(--app-green)] hover:bg-[var(--app-green)]/85">
            <Link href="/" className="flex items-center gap-3">
              Refresh <RefreshCcw />
            </Link>
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
