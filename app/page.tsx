import BallonsOverview from "@/components/home/BalloonsOverview";
import { Heart } from "lucide-react";

export default function Home() {
  return (
    <div className="h-screen w-full flex flex-col justify-between">
      <main className="flex flex-col gap-3">
        <h1 className="text-3xl font-extrabold text-center">
          WindBorne Systems Engineering Challenge
        </h1>
        <BallonsOverview />
      </main>
      <footer className="w-full flex justify-end">
        <div className="flex items-center gap-1 text-sm">
          <p>Made With </p> <Heart size={12} /> By Chris Cortes
        </div>
      </footer>
    </div>
  );
}
