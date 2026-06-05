import "server-only";

import { prisma } from "@/lib/db/prisma";

export type UiDensity = "compact" | "expanded";

export type UserSettingsData = {
  alert_threshold: number;
  aggressive_polling: boolean;
  ui_density: UiDensity;
  email_reports: boolean;
};

export const DEFAULT_USER_SETTINGS: UserSettingsData = {
  alert_threshold: -2,
  aggressive_polling: false,
  ui_density: "compact",
  email_reports: true,
};

export function parseUiDensity(value: string | null | undefined): UiDensity {
  return value === "expanded" ? "expanded" : "compact";
}

export async function getOrCreateUserSettings(
  userId: string,
): Promise<UserSettingsData> {
  const row =
    (await prisma.userSettings.findUnique({ where: { user_id: userId } })) ??
    (await prisma.userSettings.create({ data: { user_id: userId } }));

  return {
    alert_threshold: row.alert_threshold,
    aggressive_polling: row.aggressive_polling,
    ui_density: parseUiDensity(row.ui_density),
    email_reports: row.email_reports,
  };
}

export async function updateUserSettings(
  userId: string,
  patch: Partial<UserSettingsData>,
): Promise<UserSettingsData> {
  await getOrCreateUserSettings(userId);

  const data: Partial<{
    alert_threshold: number;
    aggressive_polling: boolean;
    ui_density: string;
    email_reports: boolean;
  }> = {};

  if (patch.alert_threshold !== undefined) {
    data.alert_threshold = patch.alert_threshold;
  }
  if (patch.aggressive_polling !== undefined) {
    data.aggressive_polling = patch.aggressive_polling;
  }
  if (patch.ui_density !== undefined) {
    data.ui_density = patch.ui_density;
  }
  if (patch.email_reports !== undefined) {
    data.email_reports = patch.email_reports;
  }

  const row = await prisma.userSettings.update({
    where: { user_id: userId },
    data,
  });

  return {
    alert_threshold: row.alert_threshold,
    aggressive_polling: row.aggressive_polling,
    ui_density: parseUiDensity(row.ui_density),
    email_reports: row.email_reports,
  };
}
