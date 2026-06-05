import { requireSessionUser } from "@/lib/auth/session";
import {
  getOrCreateUserSettings,
  parseUiDensity,
  updateUserSettings,
  type UiDensity,
} from "@/lib/user/settings";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const user = await requireSessionUser();
    const settings = await getOrCreateUserSettings(user.id);
    return NextResponse.json({ settings });
  } catch (err) {
    if (err instanceof Error && err.message === "Unauthorized") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    console.error("[GET /api/user/settings]", err);
    return NextResponse.json({ error: "Could not load settings." }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
  try {
    const user = await requireSessionUser();
    const body = await request.json();

    const patch: Partial<{
      alert_threshold: number;
      aggressive_polling: boolean;
      ui_density: UiDensity;
      email_reports: boolean;
    }> = {};

    if (body.alert_threshold !== undefined) {
      const value = Number(body.alert_threshold);
      if (!Number.isFinite(value) || value > 0 || value < -10) {
        return NextResponse.json(
          { error: "Alert threshold must be between -10 and 0." },
          { status: 400 },
        );
      }
      patch.alert_threshold = value;
    }

    if (body.aggressive_polling !== undefined) {
      patch.aggressive_polling = Boolean(body.aggressive_polling);
    }

    if (body.ui_density !== undefined) {
      const density = body.ui_density?.toString();
      if (density !== "compact" && density !== "expanded") {
        return NextResponse.json(
          { error: "ui_density must be compact or expanded." },
          { status: 400 },
        );
      }
      patch.ui_density = parseUiDensity(density);
    }

    if (body.email_reports !== undefined) {
      patch.email_reports = Boolean(body.email_reports);
    }

    if (Object.keys(patch).length === 0) {
      return NextResponse.json({ error: "No valid fields to update." }, { status: 400 });
    }

    const settings = await updateUserSettings(user.id, patch);
    return NextResponse.json({ settings });
  } catch (err) {
    if (err instanceof Error && err.message === "Unauthorized") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    console.error("[PATCH /api/user/settings]", err);
    return NextResponse.json({ error: "Could not update settings." }, { status: 500 });
  }
}
