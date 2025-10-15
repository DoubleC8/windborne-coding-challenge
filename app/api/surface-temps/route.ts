import { NextResponse } from "next/server";

type Point = { lat: number; lon: number };
type TempResult = Point & { temperatureC: number | null };
type CacheEntry = { data: TempResult; expires: number };


const CACHE_TTL_MS = 10 * 60 * 1000; // 10 minutes
const cache = new Map<string, CacheEntry>();

const BATCH_SIZE = 5;
const DELAY_MS = 600;

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

type FetchResult = { result: TempResult; fromCache: boolean };

async function fetchTemperature(p: Point): Promise<FetchResult> {
  const key = `${p.lat.toFixed(3)},${p.lon.toFixed(3)}`;
  const cached = cache.get(key);


  if (cached && cached.expires > Date.now()) {
    console.log(`Using cached data for ${key}`);
    return { result: cached.data, fromCache: true };
  }


  try {
    const url = `https://api.open-meteo.com/v1/forecast?latitude=${p.lat}&longitude=${p.lon}&current=temperature_2m&timezone=auto`;
    const res = await fetch(url, { cache: "no-store" });

    if (!res.ok) {
      console.warn(`Bad response at ${p.lat},${p.lon}: ${res.status}`);
      return { result: { ...p, temperatureC: null }, fromCache: false };
    }

    const json = await res.json();
    const temp = json?.current?.temperature_2m ?? null;

    const result: TempResult = {
      lat: p.lat,
      lon: p.lon,
      temperatureC: typeof temp === "number" ? temp : null,
    };

    cache.set(key, {
      data: result,
      expires: Date.now() + CACHE_TTL_MS,
    });

    return { result, fromCache: false };
  } catch (err) {
    console.error(`Error fetching ${p.lat},${p.lon}:`, err);
    return { result: { ...p, temperatureC: null }, fromCache: false };
  }
}


export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => ({}));
    const points: Point[] = Array.isArray(body?.points) ? body.points : [];

    if (points.length === 0) {
      return NextResponse.json({
        success: false,
        message: "No Points Provided.",
      });
    }

    const results: TempResult[] = [];
    const totalPoints = points.length;

    for (let i = 0; i < totalPoints; i += BATCH_SIZE) {
      const batch = points.slice(i, i + BATCH_SIZE);

      const batchResults = await Promise.all(batch.map(fetchTemperature));

      // Store results and see if any API calls were made
      const fromCacheCount = batchResults.filter((r) => r.fromCache).length;
      const hadApiCalls = fromCacheCount < batchResults.length;

      results.push(...batchResults.map((r) => r.result));

      const isLastBatch = i + BATCH_SIZE >= totalPoints;
      if (!isLastBatch && hadApiCalls) {
        console.log(
          `Pausing for ${DELAY_MS}ms after batch ${Math.ceil(
            (i + 1) / BATCH_SIZE
          )} (${fromCacheCount}/${batchResults.length} from cache)`
        );
        await delay(DELAY_MS);
      }
    }

    return NextResponse.json({
      success: true,
      count: results.length,
      results,
      cacheEntries: cache.size,
    });
  } catch (error) {
    console.error("Error while processing request:", error);
    return NextResponse.json(
      { message: "Internal Server Error" },
      { status: 500 }
    );
  }
}