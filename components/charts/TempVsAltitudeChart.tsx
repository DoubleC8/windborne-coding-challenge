"use client";

import {
  ScatterChart,
  Scatter,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Line,
  ResponsiveContainer,
} from "recharts";

interface TempVsAltitudeChartProps {
  points: {
    lat: number;
    lon: number;
    alt: number;
    temperatureC: number | null;
  }[];
  slope: number;
  intercept: number;
}

export default function TempVsAltitudeChart({
  points,
  slope,
  intercept,
}: TempVsAltitudeChartProps) {
  // Filter only points with valid temperatures
  const data = points.filter((p) => p.temperatureC != null);

  if (data.length === 0) {
    return (
      <p className="text-muted-foreground">
        Not enough data to determine trend. (◞‸◟,)
      </p>
    );
  }

  const minAlt = Math.min(...data.map((d) => d.alt));
  const maxAlt = Math.max(...data.map((d) => d.alt));

  const lineData = [
    { alt: minAlt, temperatureC: slope * minAlt + intercept },
    { alt: maxAlt, temperatureC: slope * maxAlt + intercept },
  ];

  // Custom tooltip to show lat/lon
  const CustomTooltip = ({
    active,
    payload,
  }: {
    active?: boolean;
    payload?: Array<{
      payload: { alt: number; temperatureC: number; lat: number; lon: number };
    }>;
  }) => {
    if (active && payload && payload.length) {
      const point = payload[0].payload;
      return (
        <div className="bg-background border rounded-md p-2 text-sm shadow-sm">
          <p>
            <strong>Altitude:</strong> {point.alt.toFixed(2)} km
          </p>
          <p>
            <strong>Temp:</strong> {point.temperatureC.toFixed(2)} °C
          </p>
          <p>
            <strong>Lat:</strong> {point.lat.toFixed(2)}°
          </p>
          <p>
            <strong>Lon:</strong> {point.lon.toFixed(2)}°
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="h-60 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <ScatterChart margin={{ top: 10, right: 10, bottom: 10, left: 10 }}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis
            type="number"
            dataKey="alt"
            name="Altitude"
            unit=" km"
            domain={[minAlt, maxAlt]}
            tick={{ fontSize: 12 }}
            tickFormatter={(value) => value.toFixed(2)}
          />
          <YAxis
            type="number"
            dataKey="temperatureC"
            name="Temperature"
            unit="°C"
            tick={{ fontSize: 12 }}
            tickFormatter={(value) => value.toFixed(2)}
          />
          <Tooltip
            content={<CustomTooltip />}
            cursor={{ strokeDasharray: "3 3" }}
          />
          <Scatter
            name="Balloons"
            data={data}
            fill="var(--app-green)"
            opacity={0.8}
          />
          <Line
            type="linear"
            dataKey="temperatureC"
            data={lineData}
            stroke="var(--app-green)"
            dot={false}
            strokeWidth={2}
            opacity={0.9}
          />
        </ScatterChart>
      </ResponsiveContainer>
    </div>
  );
}
