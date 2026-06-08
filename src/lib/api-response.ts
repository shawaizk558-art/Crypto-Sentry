import { NextResponse } from "next/server";

// Send JSON to the browser and tell it not to cache.
export function jsonLive(data: unknown, status = 200) {
  return NextResponse.json(data, {
    status,
    headers: {
      "Cache-Control": "no-store, no-cache, must-revalidate",
      Pragma: "no-cache",
    },
  });
}
