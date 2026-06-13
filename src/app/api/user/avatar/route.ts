import { requireSessionUser } from "@/lib/auth/session";
import { saveAvatarToDatabase } from "@/lib/storage/avatars";
import { NextResponse } from "next/server";

const MAX_BYTES = 2 * 1024 * 1024;
const ACCEPTED = new Set(["image/jpeg", "image/png", "image/webp", "image/gif"]);

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

    const buffer = Buffer.from(await file.arrayBuffer());
    const imageUrl = await saveAvatarToDatabase(user.id, buffer, file.type);

    return NextResponse.json({ imageUrl });
  } catch (err) {
    if (err instanceof Error && err.message === "Unauthorized") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    console.error("[POST /api/user/avatar]", err);
    return NextResponse.json({ error: "Could not upload avatar." }, { status: 500 });
  }
}
