import { mkdir, unlink, writeFile } from "fs/promises";
import path from "path";

const UPLOAD_DIR = path.join(process.cwd(), "public", "uploads", "avatars");
export const AVATAR_MAX_BYTES = 2 * 1024 * 1024;
const ALLOWED_TYPES = new Set(["image/jpeg", "image/png", "image/webp"]);

export function avatarExtension(mime: string): string {
  if (mime === "image/jpeg") return "jpg";
  if (mime === "image/png") return "png";
  return "webp";
}

export function isLocalAvatarUrl(url: string | null | undefined): url is string {
  return Boolean(url?.startsWith("/uploads/avatars/"));
}

export async function saveUserAvatar(
  userId: string,
  file: File,
  previousImage: string | null | undefined
): Promise<string> {
  if (!ALLOWED_TYPES.has(file.type)) {
    throw new Error("INVALID_TYPE");
  }
  if (file.size > AVATAR_MAX_BYTES) {
    throw new Error("FILE_TOO_LARGE");
  }

  await mkdir(UPLOAD_DIR, { recursive: true });

  const ext = avatarExtension(file.type);
  const filename = `${userId}.${ext}`;
  const diskPath = path.join(UPLOAD_DIR, filename);
  const buffer = Buffer.from(await file.arrayBuffer());
  await writeFile(diskPath, buffer);

  if (previousImage && isLocalAvatarUrl(previousImage)) {
    const oldPath = path.join(process.cwd(), "public", previousImage);
    if (oldPath !== diskPath) {
      await unlink(oldPath).catch(() => undefined);
    }
  }

  return `/uploads/avatars/${filename}?v=${Date.now()}`;
}
