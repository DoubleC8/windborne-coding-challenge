import DashboardClient from "@/components/home/DashboardClient";
import { Heart } from "lucide-react";

export default function Home() {
  return (
    <div className="min-h-screen w-full flex flex-col justify-between">
      <main className="flex flex-col gap-5 p-5">
        <h1 className="text-2xl font-extrabold text-center text-[var(--app-green)]">
          WindBorne Engineering Challenge
        </h1>
        <DashboardClient />
      </main>
      <footer className="w-full flex h-[10vh] justify-end bg-gray-100 px-5">
        <div className="flex items-center gap-1 text-sm">
          <p>Made With </p>{" "}
          <Heart
            size={12}
            className="text-[var(--app-green)]"
            fill="var(--app-green)"
          />{" "}
          By Chris Cortes |{" "}
          <a
            target="_blank"
            rel="noopener noreferrer"
            href="https://github.com/DoubleC8"
            className="hover:text-[var(--app-green)] ease-in-out duration-200"
          >
            GitHub
          </a>{" "}
          |{" "}
          <a
            target="_blank"
            rel="noopener noreferrer"
            href="https://www.linkedin.com/in/chris-cortes-45b7b6280/"
            className="hover:text-[var(--app-green)] ease-in-out duration-200"
          >
            LinkedIn
          </a>
        </div>
      </footer>
    </div>
  );
}
