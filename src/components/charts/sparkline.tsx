"use client";

import { cn } from "@/lib/utils";
import { useId } from "react";

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

export function Sparkline({
  data,
  className,
  width = 280,
  height = 80,
}: {
  data: number[];
  className?: string;
  width?: number;
  height?: number;
}) {
  const gradientId = useId();
  const path = toPath(data, width, height);
  const fillPath = `${path} L ${width},${height} L 0,${height} Z`;

  return (
    <svg
      viewBox={`0 0 ${width} ${height}`}
      className={cn("h-auto w-full green-glow", className)}
      preserveAspectRatio="none"
      aria-hidden
    >
      <defs>
        <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="rgba(0,255,65,0.35)" />
          <stop offset="100%" stopColor="rgba(0,255,65,0)" />
        </linearGradient>
      </defs>
      <path d={fillPath} fill={`url(#${gradientId})`} />
      <path
        d={path}
        fill="none"
        stroke="#00ff41"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

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
          className="min-w-0 flex-1 rounded-sm bg-danger"
          style={{ height: `${h}%`, opacity: 0.35 + (h / 100) * 0.65 }}
        />
      ))}
    </div>
  );
}
