import { NextResponse } from 'next/server';

export type BalloonPoint = {
  lat: number;
  lon: number;
  alt: number;
  hourAgo: number;
  timestamp: number;
};

export async function GET() {
  const results: BalloonPoint[][] = [];
  const now = Date.now();
  
  const fetchPromises = Array.from({ length: 24 }, async (_, i) => {
    const hourStr = i.toString().padStart(2, '0');
    const url = `https://a.windbornesystems.com/treasure/${hourStr}.json`;

    try {
      const res = await fetch(url, {
        cache: 'no-store', 
      });
      
      if (!res.ok) {
        throw new Error(`HTTP ${res.status}`);
      }

      const json = await res.json();

      if (!Array.isArray(json)) {
        throw new Error('Response is not an array');
      }

      const points: BalloonPoint[] = json
        .filter((arr: any) => {
          // Robustly handle corrupted data
          return Array.isArray(arr) && 
                 arr.length >= 3 &&
                 typeof arr[0] === 'number' &&
                 typeof arr[1] === 'number' &&
                 typeof arr[2] === 'number' &&
                 !isNaN(arr[0]) &&
                 !isNaN(arr[1]) &&
                 !isNaN(arr[2]) &&
                 arr[0] >= -90 && arr[0] <= 90 && 
                 arr[1] >= -180 && arr[1] <= 180; 
        })
        .map(([lat, lon, alt]) => ({
          lat,
          lon,
          alt,
          hourAgo: i,
          timestamp: now - (i * 60 * 60 * 1000), 
        }));

      return { index: i, points };
    } catch (err) {
      console.warn(`Failed to fetch ${hourStr}.json:`, err);
      return { index: i, points: [] };
    }
  });

  const fetchedData = await Promise.all(fetchPromises);
  
  fetchedData.sort((a, b) => a.index - b.index);
  fetchedData.forEach(({ points }) => results.push(points));

  const totalPoints = results.flat().length;
  const hoursWithData = results.filter(arr => arr.length > 0).length;

  return NextResponse.json({
    success: true,
    data: results,
    metadata: {
      totalPoints,
      hoursWithData,
      fetchedAt: new Date().toISOString(),
    },
  });
}