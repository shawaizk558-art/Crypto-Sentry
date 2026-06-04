import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import {
  getOrCreateUserSettings,
  updateUserSettings,
} from "@/lib/db/settings";

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const settings = await getOrCreateUserSettings(session.user.id);
  return NextResponse.json({
    alertThreshold: settings.alert_threshold,
    aggressivePolling: settings.aggressive_polling,
    uiDensity: settings.ui_density,
    emailReports: settings.email_reports,
  });
}

export async function PATCH(request: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const settings = await updateUserSettings(session.user.id, {
    alert_threshold:
      typeof body.alertThreshold === "number" ? body.alertThreshold : undefined,
    aggressive_polling:
      typeof body.aggressivePolling === "boolean"
        ? body.aggressivePolling
        : undefined,
    ui_density:
      body.uiDensity === "compact" || body.uiDensity === "expanded"
        ? body.uiDensity
        : undefined,
    email_reports:
      typeof body.emailReports === "boolean" ? body.emailReports : undefined,
  });

  return NextResponse.json({
    alertThreshold: settings.alert_threshold,
    aggressivePolling: settings.aggressive_polling,
    uiDensity: settings.ui_density,
    emailReports: settings.email_reports,
  });
}
