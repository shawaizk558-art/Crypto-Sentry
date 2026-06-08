import "server-only";

const BUCKET = "avatars";

function getSupabaseStorageConfig() {
  const url =
    process.env.SUPABASE_URL?.trim() ||
    process.env.NEXT_PUBLIC_SUPABASE_URL?.trim();
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY?.trim();
  if (!url || !serviceKey) return null;
  return { url: url.replace(/\/$/, ""), serviceKey };
}

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
      "Avatar storage is not configured. Set SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY.",
    );
  }

  const objectPath = `${userId}.${ext}`;
  const uploadUrl = `${config.url}/storage/v1/object/${BUCKET}/${objectPath}`;

  const res = await fetch(uploadUrl, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${config.serviceKey}`,
      apikey: config.serviceKey,
      "Content-Type": contentType,
      "x-upsert": "true",
    },
    body: new Uint8Array(buffer),
  });

  if (!res.ok) {
    const detail = await res.text();
    throw new Error(`Supabase upload failed (${res.status}): ${detail}`);
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
