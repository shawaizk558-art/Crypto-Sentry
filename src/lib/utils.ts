import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

// Combine CSS class names safely.
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// Show a number as dollars, e.g. $1,234.56.
export function formatUsd(value: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: value >= 1 ? 2 : 6,
  }).format(value);
}

// Show a % change, e.g. +2.50% or -1.20%.
export function formatPercent(value: number) {
  const sign = value > 0 ? "+" : "";
  return `${sign}${value.toFixed(2)}%`;
}

// Show how long ago, e.g. "5m ago".
export function timeAgo(date: Date) {
  const seconds = Math.floor((Date.now() - date.getTime()) / 1000);
  if (seconds < 60) return `${seconds}s ago`;
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  return `${Math.floor(hours / 24)}d ago`;
}
