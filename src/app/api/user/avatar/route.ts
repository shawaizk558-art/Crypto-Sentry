import { requireSessionUser } from "@/lib/auth/session";
import { prisma } from "@/lib/db/prisma";
import {
  uploadAvatarToLocal,
  uploadAvatarToStorage,
} from "@/lib/storage/avatars";
import { NextResponse } from "next/server";

const MAX_BYTES = 2 * 1024 * 1024;
const ACCEPTED = new Set(["image/jpeg", "image/png", "image/webp", "image/gif"]);

// Check if Supabase storage env vars are present on the server.
function hasSupabaseStorage() {
  const url =
    process.env.SUPABASE_URL?.trim() ||
    process.env.NEXT_PUBLIC_SUPABASE_URL?.trim();
  return Boolean(url && process.env.SUPABASE_SERVICE_ROLE_KEY?.trim());
}

// Uploads and saves a new avatar image for the authenticated user.
export async function POST(request: Request) {
  try {
    const user = await requireSessionUser();
    const form = await request.formData();
    const file = form.get("file");

    if (!(file instanceof File)) {
      return NextResponse.json({ error: "No file uploaded." }, { status: 400 });
    }

    if (!ACCEPTED.has(file.type)) {
      return NextResponse.json({ error: "Use a JPEG, PNG, WebP, or GIF image." }, { status: 400 });
    }

    if (file.size > MAX_BYTES) {
      return NextResponse.json({ error: "Image must be 2 MB or smaller." }, { status: 400 });
    }

    const ext = file.type.split("/")[1]?.replace("jpeg", "jpg") ?? "jpg";
    const buffer = Buffer.from(await file.arrayBuffer());

    const imageUrl =
      hasSupabaseStorage() || process.env.NODE_ENV === "production"
        ? await uploadAvatarToStorage(user.id, buffer, file.type, ext)
        : await uploadAvatarToLocal(user.id, buffer, ext);

    await prisma.user.update({
      where: { id: user.id },
      data: { image: imageUrl },
    });

    return NextResponse.json({ imageUrl });
  } catch (err) {
    if (err instanceof Error && err.message === "Unauthorized") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const message = err instanceof Error ? err.message : "Could not upload avatar.";

    if (message.startsWith("STORAGE_NOT_CONFIGURED:")) {
      return NextResponse.json(
        {
          error:
            "Avatar storage is not set up on the server. Add SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in Vercel → Settings → Environment Variables, then redeploy.",
        },
        { status: 503 },
      );
    }

    if (message.startsWith("BUCKET_NOT_FOUND:")) {
      return NextResponse.json(
        {
          error:
            "Avatar bucket missing in Supabase. Open Supabase → SQL Editor and run supabase/avatars-bucket.sql, then try again.",
        },
        { status: 503 },
      );
    }

    console.error("[POST /api/user/avatar]", err);
    return NextResponse.json({ error: "Could not upload avatar." }, { status: 500 });
  }
}
