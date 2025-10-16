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
  points: { alt: number; temperatureC: number | null }[];
  slope: number;
  intercept: number;
}

export default function TempVsAltitudeChart({
  points,
  slope,
  intercept,
}: TempVsAltitudeChartProps) {
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

  return (
    <div className="h-60 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <ScatterChart margin={{ top: 10, right: 10, bottom: 10, left: 10 }}>
          <CartesianGrid strokeDasharray={"3 3"} />
          <XAxis
            type="number"
            dataKey={"alt"}
            name="Altitude"
            unit=" km"
            domain={[minAlt, maxAlt]}
            tick={{ fontSize: 12 }}
            tickFormatter={(value) => value.toFixed(2)}
          />
          <YAxis
            type="number"
            dataKey={"temperatureC"}
            name="Temperature"
            unit="°C"
            tick={{ fontSize: 12 }}
          />
          <Tooltip cursor={{ strokeDasharray: "3 3" }} />
          <Scatter
            name="Ballloons"
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
