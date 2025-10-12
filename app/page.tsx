import DashboardClient from "@/components/home/DashboardClient";
import { Heart } from "lucide-react";

export default function Home() {
  return (
    <div className="min-h-screen w-full flex flex-col justify-between">
      <main className="flex-1 p-4">
        <DashboardClient />
      </main>
      <footer className="w-full flex justify-end p-4">
        <div className="flex items-center gap-1 text-sm">
          <p>Made With </p> <Heart size={12} /> By Chris Cortes
        </div>
      </footer>
    </div>
  );
}
