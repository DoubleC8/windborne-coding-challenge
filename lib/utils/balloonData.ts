export type BalloonPoint = {
  lat: number;
  lon: number;
  alt: number;
  hourAgo: number;
  timestamp: number;
};

export type BalloonDataResponse = {
  success: boolean;
  data: BalloonPoint[][];
  metadata: {
    totalPoints: number;
    totalBalloons: number;
    hoursWithData: number;
    hoursWithErrors?: number;
    fetchedAt: string;
    errors?: string[];
  };
};

export type BalloonTrajectory = {
  id: number;
  path: BalloonPoint[];
}

export async function fetchBalloonData(): Promise<BalloonDataResponse> {
  try {

    const res = await fetch('/api/balloon-data', {
      cache: 'no-store',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
      },
    });

    if (!res.ok) {
      const errorText = await res.text().catch(() => 'Unknown error');
      throw new Error(`API responded with status ${res.status}: ${errorText}`);
    }

    const data: BalloonDataResponse = await res.json();

    // Validate response structure
    if (!data || typeof data.success !== 'boolean' || !Array.isArray(data.data)) {
      throw new Error('Invalid response format from API');
    }

    return data;
  } catch (err) {
    const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred';
    console.error('Failed to fetch balloon data:', errorMessage);

    return {
      success: false,
      data: Array(24).fill([]),
      metadata: {
        totalPoints: 0,
        totalBalloons: 0,
        hoursWithData: 0,
        hoursWithErrors: 24,
        fetchedAt: new Date().toLocaleTimeString(),
        errors: [errorMessage],
      },
    };
  }
}

export type BalloonWithTemp = BalloonPoint & { temperatureC: number | null };

export async function annotateWithTemperature(points: BalloonPoint[]): Promise<BalloonWithTemp[]> {
  const res = await fetch("/api/surface-temps", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ points })
  });

  const { results } = await res.json();

  return points.map(p => {
    const temp = results.find((r: any) => r.lat === p.lat && r.lon === p.lon)?.temperatureC ?? null;
    return { ...p, temperatureC: temp };
  })
}

export function getBalloonTrajectories(data: BalloonPoint[][]): BalloonTrajectory[] {
  if (!data || data.length === 0) {
    return [];
  }

  // Find the maximum number of balloons across all hours
  const maxBalloons = Math.max(...data.map(hour => hour.length), 0);

  if (maxBalloons === 0) {
    return [];
  }

  const trajectories: BalloonTrajectory[] = [];

  for (let i = 0; i < maxBalloons; i++) {
    const path: BalloonPoint[] = [];

    for (let hour = 0; hour < data.length; hour++) {
      const hourData = data[hour];
      if (hourData && hourData[i]) {
        path.push(hourData[i]);
      }
    }

    // Only include trajectories with at least 2 points for meaningful analysis
    if (path.length >= 2) {
      trajectories.push({ id: i, path });
    }
  }

  return trajectories;
}

export function getAverageDist(trajectories: BalloonTrajectory[]): number {
  if (!trajectories || trajectories.length === 0) {
    return 0;
  }

  const total = trajectories.reduce((sum, traj) => {
    return sum + calculateTotalDistance(traj.path);
  }, 0);

  return total / trajectories.length;
}

export type AltitudeExtreme = {
  balloonId: number | null;
  altitude: number | null;
  lat: number | null;
  lon: number | null;
  time: Date | null;
};

export function getMaxAltitude(trajectories: BalloonTrajectory[]): AltitudeExtreme {
  if (!trajectories || trajectories.length === 0) {
    return { balloonId: null, altitude: null, lat: null, lon: null, time: null };
  }

  let maxPoint: BalloonPoint | null = null;
  let maxBalloonId: number | null = null;

  for (const traj of trajectories) {
    for (const point of traj.path) {
      if (!maxPoint || point.alt > maxPoint.alt) {
        maxPoint = point;
        maxBalloonId = traj.id;
      }
    }
  }

  return {
    balloonId: maxBalloonId,
    altitude: maxPoint?.alt ?? null,
    lat: maxPoint?.lat ?? null,
    lon: maxPoint?.lon ?? null,
    time: maxPoint ? new Date(maxPoint.timestamp) : null,
  };
}

export function getMinAltitude(trajectories: BalloonTrajectory[]): AltitudeExtreme {
  if (!trajectories || trajectories.length === 0) {
    return { balloonId: null, altitude: null, lat: null, lon: null, time: null };
  }

  let minPoint: BalloonPoint | null = null;
  let minBalloonId: number | null = null;

  for (const traj of trajectories) {
    for (const point of traj.path) {
      if (!minPoint || point.alt < minPoint.alt) {
        minPoint = point;
        minBalloonId = traj.id;
      }
    }
  }

  return {
    balloonId: minBalloonId,
    altitude: minPoint?.alt ?? null,
    lat: minPoint?.lat ?? null,
    lon: minPoint?.lon ?? null,
    time: minPoint ? new Date(minPoint.timestamp) : null,
  };
}

export type DistanceExtreme = {
  balloon: BalloonTrajectory | null;
  balloonId: number,
  distance: number;
};

export function getMaxDistance(trajectories: BalloonTrajectory[]): DistanceExtreme {
  if (!trajectories || trajectories.length === 0) {
    return { balloon: null, balloonId: 0, distance: 0 };
  }

  let maxDistance = 0;
  let longestBalloon: BalloonTrajectory | null = null;

  for (const traj of trajectories) {
    const distance = calculateTotalDistance(traj.path);

    if (distance > maxDistance) {
      maxDistance = distance;
      longestBalloon = traj;
    }
  }

  return {
    balloon: longestBalloon,
    balloonId: longestBalloon?.id ?? 0,
    distance: maxDistance,
  };
}

export function getMinDistance(trajectories: BalloonTrajectory[]): DistanceExtreme {
  if (!trajectories || trajectories.length === 0) {
    return { balloon: null, balloonId: 0, distance: 0 };
  }

  let minDistance = Infinity;
  let shortestBalloon: BalloonTrajectory | null = null;

  for (const traj of trajectories) {
    const distance = calculateTotalDistance(traj.path);

    if (distance < minDistance) {
      minDistance = distance;
      shortestBalloon = traj;
    }
  }

  return {
    balloon: shortestBalloon,
    balloonId: shortestBalloon?.id ?? 0,
    distance: minDistance === Infinity ? 0 : minDistance,
  };
}


export function calculateTotalDistance(path: BalloonPoint[]): number {
  if (!path || path.length < 2) {
    return 0;
  }

  let total = 0;

  for (let i = 0; i < path.length - 1; i++) {
    const p1 = path[i];
    const p2 = path[i + 1];

    if (p1 && p2) {
      total += getDistance(p1.lat, p1.lon, p2.lat, p2.lon);
    }
  }

  return total;
}

// Earth's radius in kilometers
const EARTH_RADIUS_KM = 6371;

export function getDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  // Input validation
  if (!isValidCoordinate(lat1) || !isValidCoordinate(lon1) ||
    !isValidCoordinate(lat2) || !isValidCoordinate(lon2)) {
    return 0;
  }

  const toRad = (deg: number) => deg * (Math.PI / 180);

  const distLatRad = toRad(lat2 - lat1);
  const distLonRad = toRad(lon2 - lon1);

  const phi1 = toRad(lat1);
  const phi2 = toRad(lat2);

  // Haversine formula
  const a = Math.sin(distLatRad / 2) * Math.sin(distLatRad / 2) +
    Math.cos(phi1) * Math.cos(phi2) *
    Math.sin(distLonRad / 2) * Math.sin(distLonRad / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distance = EARTH_RADIUS_KM * c;

  return distance;
}

// Helper function for coordinate validation
function isValidCoordinate(value: number): boolean {
  return typeof value === 'number' && !isNaN(value) && isFinite(value);
}

export type GlobalCoverageStats = {
  totalBalloons: number;
  minLat: number | null;
  maxLat: number | null;
  minLon: number | null;
  maxLon: number | null;
  latRange: number;
  lonRange: number;
};

export function getGlobalCoverageStats(trajectories: BalloonTrajectory[]): GlobalCoverageStats {
  if (!trajectories || trajectories.length === 0) {
    return {
      totalBalloons: 0,
      minLat: null,
      maxLat: null,
      minLon: null,
      maxLon: null,
      latRange: 0,
      lonRange: 0,
    };
  }

  const allPoints = trajectories.flatMap((t) => t.path);

  if (allPoints.length === 0) {
    return {
      totalBalloons: trajectories.length,
      minLat: null,
      maxLat: null,
      minLon: null,
      maxLon: null,
      latRange: 0,
      lonRange: 0,
    };
  }

  const lats = allPoints.map((p) => p.lat);
  const lons = allPoints.map((p) => p.lon);

  const minLat = Math.min(...lats);
  const maxLat = Math.max(...lats);
  const minLon = Math.min(...lons);
  const maxLon = Math.max(...lons);

  const latRange = maxLat - minLat;
  const lonRange = maxLon - minLon;

  return {
    totalBalloons: trajectories.length,
    minLat,
    maxLat,
    minLon,
    maxLon,
    latRange,
    lonRange,
  };
}

export function getGlobalDrift(trajectories: BalloonTrajectory[]) {
  if (!trajectories || trajectories.length === 0) {
    return {
      angle: null,
      direction: "N/A",
      avgDeltaLat: 0,
      avgDeltaLon: 0,
    }
  }

  let totalDeltaLat = 0;
  let totalDeltaLon = 0;
  let validCount = 0;

  for (const traj of trajectories) {
    if (traj.path.length < 2) continue;

    const start = traj.path[0];
    const end = traj.path[traj.path.length - 1];

    const dLat = end.lat - start.lat;
    const dLon = end.lon - start.lon;

    totalDeltaLat += dLat;
    totalDeltaLon += dLon;
    validCount++;
  }

  if (validCount === 0) {
    return { angle: null, direction: "N/A", avgDeltaLat: 0, avgDeltaLon: 0 };
  }

  const avgDeltaLat = totalDeltaLat / validCount;
  const avgDeltaLon = totalDeltaLon / validCount;

  const angleRad = Math.atan2(avgDeltaLon, avgDeltaLat);
  const angleDeg = (angleRad * 180) / Math.PI;

  const bearing = (angleDeg + 360) % 360;

  const directions = [
    "North",
    "Northeast",
    "East",
    "Southeast",
    "South",
    "Southwest",
    "West",
    "Northwest",
  ];

  const index = Math.round(bearing / 45) % 8;
  const direction = directions[index];

  return { angle: bearing, direction, avgDeltaLat, avgDeltaLon };
}

export function getLatestPoints(trajectories: BalloonTrajectory[]): BalloonPoint[] {
  if (!Array.isArray(trajectories) || trajectories.length === 0) {
    return [];
  }
  return trajectories?.map(t => t.path[0]).filter(Boolean) ?? [];
}

// Fun Facts Functions

export type SpeedExtreme = {
  balloonId: number;
  averageSpeed: number; // km/h
  totalDistance: number;
  totalTime: number; // hours
};

export function getFastestBalloon(trajectories: BalloonTrajectory[]): SpeedExtreme {
  if (!trajectories || trajectories.length === 0) {
    return { balloonId: 0, averageSpeed: 0, totalDistance: 0, totalTime: 0 };
  }

  let fastestBalloon: BalloonTrajectory | null = null;
  let highestSpeed = 0;

  for (const traj of trajectories) {
    if (traj.path.length < 2) continue;

    const totalDistance = calculateTotalDistance(traj.path);
    const startTime = traj.path[traj.path.length - 1].timestamp; // Oldest point
    const endTime = traj.path[0].timestamp; // Newest point
    const totalTimeHours = (endTime - startTime) / (1000 * 60 * 60); // Convert ms to hours

    if (totalTimeHours > 0) {
      const averageSpeed = totalDistance / totalTimeHours;
      if (averageSpeed > highestSpeed) {
        highestSpeed = averageSpeed;
        fastestBalloon = traj;
      }
    }
  }

  return {
    balloonId: fastestBalloon?.id ?? 0,
    averageSpeed: highestSpeed,
    totalDistance: fastestBalloon ? calculateTotalDistance(fastestBalloon.path) : 0,
    totalTime: fastestBalloon ? (fastestBalloon.path[0].timestamp - fastestBalloon.path[fastestBalloon.path.length - 1].timestamp) / (1000 * 60 * 60) : 0,
  };
}

export type AltitudeRangeExtreme = {
  balloonId: number;
  altitudeRange: number; // km
  maxAltitude: number;
  minAltitude: number;
};

export function getAltitudeExplorer(trajectories: BalloonTrajectory[]): AltitudeRangeExtreme {
  if (!trajectories || trajectories.length === 0) {
    return { balloonId: 0, altitudeRange: 0, maxAltitude: 0, minAltitude: 0 };
  }

  let explorerBalloon: BalloonTrajectory | null = null;
  let biggestRange = 0;

  for (const traj of trajectories) {
    if (traj.path.length === 0) continue;

    const altitudes = traj.path.map(p => p.alt);
    const maxAlt = Math.max(...altitudes);
    const minAlt = Math.min(...altitudes);
    const range = maxAlt - minAlt;

    if (range > biggestRange) {
      biggestRange = range;
      explorerBalloon = traj;
    }
  }

  if (!explorerBalloon) {
    return { balloonId: 0, altitudeRange: 0, maxAltitude: 0, minAltitude: 0 };
  }

  const altitudes = explorerBalloon.path.map(p => p.alt);
  return {
    balloonId: explorerBalloon.id,
    altitudeRange: biggestRange,
    maxAltitude: Math.max(...altitudes),
    minAltitude: Math.min(...altitudes),
  };
}

export type DirectionConsistency = {
  balloonId: number;
  directionConsistency: number; // percentage (0-100)
  totalDirectionChanges: number;
  averageDirectionChange: number; // degrees
};

export function getMrConsistent(trajectories: BalloonTrajectory[]): DirectionConsistency {
  if (!trajectories || trajectories.length === 0) {
    return { balloonId: 0, directionConsistency: 0, totalDirectionChanges: 0, averageDirectionChange: 0 };
  }

  let directionMaster: BalloonTrajectory | null = null;
  let bestConsistency = 0;

  for (const traj of trajectories) {
    if (traj.path.length < 3) continue; // Need at least 3 points to calculate direction changes

    let totalDirectionChange = 0;
    let directionChanges = 0;

    for (let i = 1; i < traj.path.length - 1; i++) {
      const prev = traj.path[i + 1]; // Previous point
      const curr = traj.path[i];     // Current point
      const next = traj.path[i - 1]; // Next point

      // Calculate bearing from prev to curr
      const bearing1 = calculateBearing(prev.lat, prev.lon, curr.lat, curr.lon);
      // Calculate bearing from curr to next
      const bearing2 = calculateBearing(curr.lat, curr.lon, next.lat, next.lon);

      // Calculate the difference in bearings
      let bearingDiff = Math.abs(bearing2 - bearing1);
      if (bearingDiff > 180) {
        bearingDiff = 360 - bearingDiff;
      }

      totalDirectionChange += bearingDiff;
      directionChanges++;
    }

    if (directionChanges > 0) {
      const averageDirectionChange = totalDirectionChange / directionChanges;
      // Consistency is inverse of average direction change (lower change = higher consistency)
      const consistency = Math.max(0, 100 - (averageDirectionChange / 180) * 100);

      if (consistency > bestConsistency) {
        bestConsistency = consistency;
        directionMaster = traj;
      }
    }
  }

  if (!directionMaster) {
    return { balloonId: 0, directionConsistency: 0, totalDirectionChanges: 0, averageDirectionChange: 0 };
  }

  // Recalculate for the best balloon
  let totalDirectionChange = 0;
  let directionChanges = 0;

  for (let i = 1; i < directionMaster.path.length - 1; i++) {
    const prev = directionMaster.path[i + 1];
    const curr = directionMaster.path[i];
    const next = directionMaster.path[i - 1];

    const bearing1 = calculateBearing(prev.lat, prev.lon, curr.lat, curr.lon);
    const bearing2 = calculateBearing(curr.lat, curr.lon, next.lat, next.lon);

    let bearingDiff = Math.abs(bearing2 - bearing1);
    if (bearingDiff > 180) {
      bearingDiff = 360 - bearingDiff;
    }

    totalDirectionChange += bearingDiff;
    directionChanges++;
  }

  return {
    balloonId: directionMaster.id,
    directionConsistency: bestConsistency,
    totalDirectionChanges: directionChanges,
    averageDirectionChange: directionChanges > 0 ? totalDirectionChange / directionChanges : 0,
  };
}

// Helper function to calculate bearing between two points
function calculateBearing(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const toRad = (deg: number) => deg * (Math.PI / 180);
  const toDeg = (rad: number) => rad * (180 / Math.PI);

  const dLon = toRad(lon2 - lon1);
  const lat1Rad = toRad(lat1);
  const lat2Rad = toRad(lat2);

  const y = Math.sin(dLon) * Math.cos(lat2Rad);
  const x = Math.cos(lat1Rad) * Math.sin(lat2Rad) - Math.sin(lat1Rad) * Math.cos(lat2Rad) * Math.cos(dLon);

  let bearing = toDeg(Math.atan2(y, x));
  return (bearing + 360) % 360;
}

export type EverestComparison = {
  totalBalloons: number;
  aboveEverest: number;
  percentage: number;
  everestHeight: number; // km
};

export function getEverestComparison(trajectories: BalloonTrajectory[]): EverestComparison {
  if (!trajectories || trajectories.length === 0) {
    return { totalBalloons: 0, aboveEverest: 0, percentage: 0, everestHeight: 8.849 };
  }

  const EVEREST_HEIGHT_KM = 8.849; // Mount Everest height in kilometers
  let aboveEverestCount = 0;

  for (const traj of trajectories) {
    const maxAltitude = Math.max(...traj.path.map(p => p.alt));
    if (maxAltitude > EVEREST_HEIGHT_KM) {
      aboveEverestCount++;
    }
  }

  return {
    totalBalloons: trajectories.length,
    aboveEverest: aboveEverestCount,
    percentage: trajectories.length > 0 ? (aboveEverestCount / trajectories.length) * 100 : 0,
    everestHeight: EVEREST_HEIGHT_KM,
  };
}

export type PointWithTemp = {
  alt: number;
  temperatureC: number | null;
};

//computes the best-fit line that describes how temperature changes with altitude.
export function computeTempTrend(points: PointWithTemp[]) {
  // Filter out points that are null or missing temperature
  const valid = points.filter(
    (p): p is { alt: number; temperatureC: number } =>
      typeof p.alt === "number" && typeof p.temperatureC === "number"
  );

  if (valid.length === 0) return null; 

  //getting x and y coords array
  const xs = valid.map(p => p.alt);   // xs = [1.2, 2.3, 3.5, ...]  altitudes (km)
  const ys = valid.map(p => p.temperatureC);  // ys = [15.6, 12.1, 7.8, ...] temperatures (°C)

  const mean = (arr: number[]) => arr.reduce((a, b) => a + b, 0) / arr.length;
  const mx = mean(xs);
  const my = mean(ys);

  const numerator = xs.reduce((acc, x, i) => acc + (x - mx) * (ys[i] - my), 0);
  const denominator = xs.reduce((acc, x) => acc + (x - mx) ** 2, 0);

  const slope = numerator / denominator;
  const intercept = my - slope * mx;

  const ssTot = ys.reduce((acc, y) => acc + (y - my) ** 2, 0);
  const ssRes = ys.reduce(
    (acc, y, i) => acc + (y - (slope * xs[i] + intercept)) ** 2,
    0
  );
  const r2 = 1 - ssRes / ssTot;

  return { slope, intercept, r2, n: valid.length };
}
