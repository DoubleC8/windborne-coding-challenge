import { NextResponse } from "next/server";

type TempResult = { lat: number; lon: number; temperatureC: number | null };

export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => ({}));
    const points = Array.isArray(body?.points) ? body.points : [];

    if (points.length === 0) {
      return NextResponse.json({ success: false, message: "No Points Provided." });
    }

    const results: TempResult[] = await Promise.all(
      points.map(async (p: { lat: number; lon: number }) => {
        try {
          const openMeteoUrl = `https://api.open-meteo.com/v1/forecast?latitude=${p.lat}&longitude=${p.lon}&current=temperature_2m&timezone=auto`;

          const res = await fetch(openMeteoUrl, { cache: "no-store" });
          if (!res.ok) {
            console.warn(`Bad response at ${p.lat}, ${p.lon}: ${res.status} ${res.statusText}`);
            return { lat: p.lat, lon: p.lon, temperatureC: null };
          }

          const json = await res.json();
          const temp = json?.current?.temperature_2m ?? null;

          return { lat: p.lat, lon: p.lon, temperatureC: typeof temp === "number" ? temp : null };
        } catch (error) {
          console.error(`Error fetching data for ${p.lat}, ${p.lon}:`, error);
          return { lat: p.lat, lon: p.lon, temperatureC: null };
        }
      })
    );

    return NextResponse.json({ success: true, count: results.length, results });
  } catch (error) {
    console.error("Error while fetching data from Open-Meteo:", error);
    return NextResponse.json({ message: "Internal Server Error" }, { status: 500 });
  }
}