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
    fetchedAt: string;
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
    });

    if (!res.ok) {
      throw new Error(`API responded with status ${res.status}`);
    }

    const data: BalloonDataResponse = await res.json();
    return data;
  } catch (err) {
    console.error('Failed to fetch balloon data:', err);
    return {
      success: false,
      data: Array(24).fill([]),
      metadata: {
        totalPoints: 0,
        totalBalloons: 0,
        hoursWithData: 0,
        fetchedAt: new Date().toISOString(),
      },
    };
  }
}

export function getBalloonTrajectories(data: BalloonPoint[][]): BalloonTrajectory[] {
    const maxBalloons = Math.max(...data.map(hour => hour.length));

    const trajectories: BalloonTrajectory[] = [];

    for (let i = 0; i < maxBalloons; i++){
        const path: BalloonPoint[] = [];

        for (let hour = 0; hour < data.length; hour++){
            const point = data[hour][i];
            if(point){
                path.push(point);
            }
        }

        if(path.length > 0){
            trajectories.push({ id: i, path})
        }
    }

    return trajectories;
}

export function getAverageDist(trajectories: BalloonTrajectory[]){
  if(!trajectories || trajectories.length === 0) return 0;

  let total = 0;

  for(const traj of trajectories){
    total += calculateTotalDistance(traj.path);
  }

  return total / trajectories.length;
}

export function getMaxAltitude(trajectories: BalloonTrajectory[]){
  if (trajectories.length === 0) {
  return { balloonId: null, altitude: null, maxLat: null, maxLon: null, time: null };
}

  let maxPoint: BalloonPoint | null = null;
  let maxBalloonId: number | null = null;

  for (const traj of trajectories){
    for(const point of traj.path){
      if(!maxPoint || point.alt > maxPoint.alt){
        maxPoint = point;
        maxBalloonId = traj.id;
      }
    }
  }

  return {
    balloonId: maxBalloonId,
    altitude: maxPoint?.alt ?? null, 
    maxLat: maxPoint ? maxPoint.lat : null, 
    maxLon: maxPoint ? maxPoint.lon : null, 
    time: maxPoint ? new Date(maxPoint.timestamp) : null, 
  }
}

export function getMinAltitude(trajectories: BalloonTrajectory[]){
  if (trajectories.length === 0) {
  return { balloonId: null, altitude: null, minLat: null, minLon: null, time: null };
}

  let minPoint: BalloonPoint | null = null;
  let minBalloonId: number | null = null;

  for (const traj of trajectories){
    for(const point of traj.path){
      if(!minPoint || point.alt < minPoint.alt){
        minPoint = point;
        minBalloonId = traj.id;
      }
    }
  }

  return {
    balloonId: minBalloonId,
    altitude: minPoint?.alt ?? null, 
    minLat: minPoint ? minPoint.lat : null, 
    minLon: minPoint ? minPoint.lon : null, 
    time: minPoint ? new Date(minPoint.timestamp) : null, 
  }
}

export function getMaxDistance(trajectories: BalloonTrajectory[]){
  let maxDistance = 0;
  let longestBalloon: BalloonTrajectory | null = null;

  for (const traj of trajectories){
    const distance = calculateTotalDistance(traj.path);

    if(distance > maxDistance) {
      maxDistance = distance;
      longestBalloon = traj;
    }
  }

  return {
    balloon: longestBalloon, 
    distance: maxDistance,
  }
}

export function getMinDistance(trajectories: BalloonTrajectory[]){
  if (!trajectories || trajectories.length === 0) {
    return { balloon: null, distance: 0 };
  }

  let minDistance = Infinity;
  let shortestBalloon: BalloonTrajectory | null = null;

  for (const traj of trajectories){
    const distance = calculateTotalDistance(traj.path);

    if(distance < minDistance){
      minDistance = distance;
      shortestBalloon = traj;
    }
  }

  return {
    balloon: shortestBalloon, 
    distance: minDistance,
  }
}


export function calculateTotalDistance(path: BalloonPoint[]): number {
  let total = 0;

  for(let i = 0; i < path.length - 1; i ++){
    const p1 = path[i];
    const p2 = path[i + 1];
    
    total += getDistance(p1.lat, p2.lat, p1.lon, p2.lon);
  }

  return total;
}

export function getDistance(lat1: number, lat2: number, lon1: number, lon2: number): number {
  const toRad = (deg: number) => deg * (Math.PI / 180);
  const earthsRadius = 6371; //(in km)

  const distLatRad = toRad(lat2 - lat1);
  const distLonRad = toRad(lon2 - lon1);

  const phi1 = toRad(lat1);
  const phi2 = toRad(lat2);

  const a = (Math.sin((distLatRad) / 2) * Math.sin((distLatRad) / 2)) + 
  Math.cos(phi1) * Math.cos(phi2) * (Math.sin((distLonRad) / 2) * Math.sin((distLonRad) / 2));

  const b = Math.asin(
    Math.sqrt(a)
  );

  const distance = (2 * earthsRadius) * b;
  return distance;
}

export function getGlobalCoverageStats(trajectories: BalloonTrajectory[]){
  if(!trajectories || trajectories.length === 0){
    return {
      totalBalloons: 0,
      minLat: null, 
      maxLat: null, 
      minLon: null, 
      maxLon: null, 
      latRange: 0, 
      lonRange: 0, 
    }
  }

  const allPoints = trajectories.flatMap((t) => t.path);

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