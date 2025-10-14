import { NextRequest, NextResponse } from 'next/server';
import { BalloonPoint, BalloonDataResponse } from '@/lib/utils/balloonData';

// Constants
const WINDBORNE_BASE_URL = 'https://a.windbornesystems.com/treasure';
const TOTAL_HOURS = 24;
const HOUR_IN_MS = 60 * 60 * 1000;

// Coordinate validation constants
const LAT_MIN = -90;
const LAT_MAX = 90;
const LON_MIN = -180;
const LON_MAX = 180;

function isValidCoordinate(value: unknown): value is number {
  return typeof value === 'number' && !isNaN(value);
}

function isValidLatitude(lat: number): boolean {
  return lat >= LAT_MIN && lat <= LAT_MAX;
}

function isValidLongitude(lon: number): boolean {
  return lon >= LON_MIN && lon <= LON_MAX;
}

function isValidBalloonData(arr: unknown): arr is [number, number, number] {
  return (
    Array.isArray(arr) &&
    arr.length >= 3 &&
    isValidCoordinate(arr[0]) &&
    isValidCoordinate(arr[1]) &&
    isValidCoordinate(arr[2]) &&
    isValidLatitude(arr[0]) &&
    isValidLongitude(arr[1])
  );
}

async function fetchHourData(hourIndex: number): Promise<{ index: number; points: BalloonPoint[]; error?: string }> {
  const hourStr = hourIndex.toString().padStart(2, '0');
  const url = `${WINDBORNE_BASE_URL}/${hourStr}.json`;
  
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout
    
    const res = await fetch(url, {
      cache: 'no-store',
      signal: controller.signal,
      headers: {
        'User-Agent': 'Windborne-Coding-Challenge/1.0',
      },
    });
    
    clearTimeout(timeoutId);
    
    if (!res.ok) {
      throw new Error(`HTTP ${res.status}: ${res.statusText}`);
    }

    const json: unknown = await res.json();

    if (!Array.isArray(json)) {
      throw new Error('Response is not an array');
    }

    const now = Date.now();
    const points: BalloonPoint[] = json
      .filter(isValidBalloonData)
      .map(([lat, lon, alt]) => ({
        lat,
        lon,
        alt,
        hourAgo: hourIndex,
        timestamp: now - (hourIndex * HOUR_IN_MS),
      }));

    return { index: hourIndex, points };
  } catch (err) {
    const errorMessage = err instanceof Error ? err.message : 'Unknown error';
    console.warn(`Failed to fetch ${hourStr}.json:`, errorMessage);
    return { index: hourIndex, points: [], error: errorMessage };
  }
}

export async function GET(request: NextRequest): Promise<NextResponse<BalloonDataResponse | { error: string }>> {
  try {
    const cacheControl = request.headers.get('cache-control');
    const shouldCache = cacheControl !== 'no-cache';
    
    const fetchPromises = Array.from({ length: TOTAL_HOURS }, (_, i) => fetchHourData(i));
    const fetchedData = await Promise.all(fetchPromises);
    
    // Sort by hour index to maintain chronological order
    fetchedData.sort((a, b) => a.index - b.index);
    
    const results: BalloonPoint[][] = fetchedData.map(({ points }) => points);
    const errors = fetchedData.filter(({ error }) => error).map(({ index, error }) => `${index}: ${error}`);
    
    // Calculate metadata
    const totalPoints = results.flat().length;
    const totalBalloons = results[0]?.length || 0;
    const hoursWithData = results.filter(arr => arr.length > 0).length;
    const hoursWithErrors = errors.length;

    const response: BalloonDataResponse = {
      success: hoursWithErrors === 0,
      data: results,
      metadata: {
        totalPoints,
        totalBalloons,
        hoursWithData,
        hoursWithErrors,
        fetchedAt: new Date().toLocaleTimeString("en-us", { 
          hour: '2-digit', 
          minute: '2-digit',
          hour12: true 
        }),
        errors: hoursWithErrors > 0 ? errors : undefined,
      },
    };

    return NextResponse.json(response, {
      status: hoursWithErrors === TOTAL_HOURS ? 503 : 200,
      headers: {
        'Cache-Control': shouldCache ? 'public, max-age=300, stale-while-revalidate=60' : 'no-cache',
        'Content-Type': 'application/json',
      },
    });
  } catch (error) {
    console.error('Critical error in balloon data API:', error);
    
    return NextResponse.json(
      { error: 'Internal server error while fetching balloon data' },
      {
        status: 500,
        headers: {
          'Content-Type': 'application/json',
        },
      }
    );
  }
}