import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db/prisma";
import { saveUserAvatar } from "@/lib/profile/avatar-storage";

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const formData = await request.formData();
  const file = formData.get("file");
  if (!file || !(file instanceof File)) {
    return NextResponse.json({ error: "No image file provided" }, { status: 400 });
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { image: true },
  });
  if (!user) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  try {
    const image = await saveUserAvatar(session.user.id, file, user.image);
    const storedUrl = image.split("?")[0];
    await prisma.user.update({
      where: { id: session.user.id },
      data: { image: storedUrl },
    });
    return NextResponse.json({ image });
  } catch (err) {
    const code = err instanceof Error ? err.message : "";
    if (code === "INVALID_TYPE") {
      return NextResponse.json(
        { error: "Use JPEG, PNG, or WebP" },
        { status: 400 }
      );
    }
    if (code === "FILE_TOO_LARGE") {
      return NextResponse.json(
        { error: "Image must be 2 MB or smaller" },
        { status: 400 }
      );
    }
    return NextResponse.json({ error: "Upload failed" }, { status: 500 });
  }
}
