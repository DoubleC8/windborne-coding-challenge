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
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 30000); // 30 second timeout
    
    const res = await fetch('/api/balloon-data', {
      cache: 'no-store',
      signal: controller.signal,
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
      },
    });

    clearTimeout(timeoutId);

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
        fetchedAt: new Date().toISOString(),
        errors: [errorMessage],
      },
    };
  }
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
  distance: number;
};

export function getMaxDistance(trajectories: BalloonTrajectory[]): DistanceExtreme {
  if (!trajectories || trajectories.length === 0) {
    return { balloon: null, distance: 0 };
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
    distance: maxDistance,
  };
}

export function getMinDistance(trajectories: BalloonTrajectory[]): DistanceExtreme {
  if (!trajectories || trajectories.length === 0) {
    return { balloon: null, distance: 0 };
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