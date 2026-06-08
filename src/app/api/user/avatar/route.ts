import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { requireSessionUser } from "@/lib/auth/session";
import { prisma } from "@/lib/db/prisma";
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

    const ext = file.type.split("/")[1]?.replace("jpeg", "jpg") ?? "jpg";
    const dir = path.join(process.cwd(), "public", "uploads", "avatars");
    await mkdir(dir, { recursive: true });

    const filename = `${user.id}.${ext}`;
    const filepath = path.join(dir, filename);
    const buffer = Buffer.from(await file.arrayBuffer());
    await writeFile(filepath, buffer);

    const imageUrl = `/uploads/avatars/${filename}?t=${Date.now()}`;

    await prisma.user.update({
      where: { id: user.id },
      data: { image: imageUrl },
    });

    return NextResponse.json({ imageUrl });
  } catch (err) {
    if (err instanceof Error && err.message === "Unauthorized") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    return NextResponse.json({ error: "Could not upload avatar." }, { status: 500 });
  }
}
