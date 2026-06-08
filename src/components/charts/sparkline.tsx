"use client";

import { cn } from "@/lib/utils";
import { useId } from "react";

// Converts numeric series into an SVG line path.
function toPath(values: number[], width: number, height: number) {
  const max = Math.max(...values);
  const min = Math.min(...values);
  const range = max - min || 1;
  const step = width / (values.length - 1);

  const points = values.map((v, i) => {
    const x = i * step;
    const y = height - ((v - min) / range) * (height - 8) - 4;
    return `${x},${y}`;
  });

  return `M ${points.join(" L ")}`;
}

// Renders a filled area sparkline chart for price trends.
export function Sparkline({
  data,
  className,
  width = 280,
  height = 80,
  positive = true,
}: {
  data: number[];
  className?: string;
  width?: number;
  height?: number;
  positive?: boolean;
}) {
  const gradientId = useId();
  const path = toPath(data, width, height);
  const fillPath = `${path} L ${width},${height} L 0,${height} Z`;
  const stroke = positive ? "#00f0ff" : "#ff2a6d";
  const fillTop = positive ? "rgba(0,240,255,0.35)" : "rgba(255,42,109,0.35)";

  return (
    <svg
      viewBox={`0 0 ${width} ${height}`}
      className={cn("h-auto w-full", positive ? "cyan-glow" : "magenta-glow", className)}
      preserveAspectRatio="none"
      aria-hidden
    >
      <defs>
        <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={fillTop} />
          <stop offset="100%" stopColor="transparent" />
        </linearGradient>
      </defs>
      <path d={fillPath} fill={`url(#${gradientId})`} />
      <path
        d={path}
        fill="none"
        stroke={stroke}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

// Renders a simple gradient bar chart from percentage heights.
export function BarChart({
  data,
  className,
}: {
  data: number[];
  className?: string;
}) {
  return (
    <div className={cn("flex h-24 items-end gap-[3px]", className)}>
      {data.map((h, i) => (
        <div
          key={i}
          className="min-w-0 flex-1 rounded-sm"
          style={{
            height: `${h}%`,
            opacity: 0.35 + (h / 100) * 0.65,
            background:
              i % 3 === 0
                ? "linear-gradient(180deg, #00f0ff, rgba(0,240,255,0.3))"
                : i % 3 === 1
                  ? "linear-gradient(180deg, #ff2a6d, rgba(255,42,109,0.3))"
                  : "linear-gradient(180deg, #05ffa1, rgba(5,255,161,0.3))",
          }}
        />
      ))}
    </div>
  );
}
