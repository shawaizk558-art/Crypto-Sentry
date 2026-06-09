/** Upload and resolve profile avatar images (Supabase in prod, local folder in dev). */

import "server-only";

const BUCKET = "avatars";

// Read Supabase URL and service key from env. Returns null if not set up.
function getSupabaseStorageConfig() {
  const url =
    process.env.SUPABASE_URL?.trim() ||
    process.env.NEXT_PUBLIC_SUPABASE_URL?.trim();
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY?.trim();
  if (!url || !serviceKey) return null;
  return { url: url.replace(/\/$/, ""), serviceKey };
}

// True when the avatar was saved to the local /uploads folder (dev only).
export function isLocalAvatarUrl(url: string): boolean {
  return url.startsWith("/uploads/");
}

// Local /uploads paths only exist on the dev machine — not on Vercel.
export function resolveAvatarUrl(url: string | null | undefined): string | null {
  if (!url || url.length === 0) return null;
  if (isLocalAvatarUrl(url) && process.env.NODE_ENV === "production") {
    return null;
  }
  return url;
}

// Upload avatar to Supabase Storage (public bucket). Returns the public URL.
export async function uploadAvatarToStorage(
  userId: string,
  buffer: Buffer,
  contentType: string,
  ext: string,
): Promise<string> {
  const config = getSupabaseStorageConfig();
  if (!config) {
    throw new Error(
      "STORAGE_NOT_CONFIGURED: Add SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY to Vercel env vars.",
    );
  }

  const objectPath = `${userId}.${ext}`;
  const uploadUrl = `${config.url}/storage/v1/object/${BUCKET}/${objectPath}`;
  const headers = {
    Authorization: `Bearer ${config.serviceKey}`,
    apikey: config.serviceKey,
    "Content-Type": contentType,
    "x-upsert": "true",
    "cache-control": "3600",
  };

  // Supabase upsert expects PUT; fall back to POST for first upload.
  let res = await fetch(uploadUrl, {
    method: "PUT",
    headers,
    body: new Uint8Array(buffer),
  });

  if (!res.ok && res.status === 400) {
    res = await fetch(uploadUrl, {
      method: "POST",
      headers,
      body: new Uint8Array(buffer),
    });
  }

  if (!res.ok) {
    const detail = await res.text();
    if (res.status === 404 || detail.includes("Bucket not found")) {
      throw new Error(
        "BUCKET_NOT_FOUND: Run supabase/avatars-bucket.sql in the Supabase SQL Editor.",
      );
    }
    throw new Error(`SUPABASE_UPLOAD_${res.status}: ${detail}`);
  }

  return `${config.url}/storage/v1/object/public/${BUCKET}/${objectPath}?t=${Date.now()}`;
}

// Dev fallback: write to public/uploads when Supabase is not configured.
export async function uploadAvatarToLocal(
  userId: string,
  buffer: Buffer,
  ext: string,
): Promise<string> {
  const { mkdir, writeFile } = await import("node:fs/promises");
  const path = await import("node:path");

  const dir = path.join(process.cwd(), "public", "uploads", "avatars");
  await mkdir(dir, { recursive: true });

  const filename = `${userId}.${ext}`;
  await writeFile(path.join(dir, filename), buffer);

  return `/uploads/avatars/${filename}?t=${Date.now()}`;
}
