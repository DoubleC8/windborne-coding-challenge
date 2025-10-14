import React from "react";

export const ALTITUDE_RANGES = [
  {
    color: "#1F51FF",
    label: "Low Altitude",
    range: "< 5 km",
    description: "Near Surface",
  },
  {
    color: "#009E60",
    label: "Medium Altitude",
    range: "5–10 km",
    description: "Lower Troposphere",
  },
  {
    color: "#FFDB58",
    label: "High Altitude",
    range: "10–20 km",
    description: "Upper Troposphere",
  },
  {
    color: "#FF3131",
    label: "Very High Altitude",
    range: "> 20 km",
    description: "Stratospheric",
  },
];

export default function MapLegend() {
  return (
    <div
      className={`absolute  z-[400] top-4 right-4  bg-white/95 backdrop-blur-sm rounded-lg shadow-lg border border-gray-200 p-3`}
    >
      <h3 className="text-xs font-bold text-gray-700 mb-2 uppercase tracking-wide">
        Altitude Legend
      </h3>
      <div className="space-y-1.5">
        {ALTITUDE_RANGES.map((item, index) => (
          <div key={index} className="flex items-start gap-2">
            {/* Color indicator */}
            <div
              className="w-4 h-4 rounded-full border border-white shadow-sm flex-shrink-0 mt-0.5"
              style={{ backgroundColor: item.color }}
            />

            {/* Text content */}
            <div className="flex-1 min-w-0">
              <div className="text-xs font-medium text-gray-800 leading-tight">
                {item.range}
              </div>
              <div className="text-[10px] text-gray-600 leading-tight">
                {item.description}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}



