import "server-only";

import { prisma } from "@/lib/db/prisma";

export type UiDensity = "compact" | "expanded";

export type UserSettingsData = {
  alert_threshold: number;
  ui_density: UiDensity;
};

export const DEFAULT_USER_SETTINGS: UserSettingsData = {
  alert_threshold: -2,
  ui_density: "compact",
};

// Turn saved value into "compact" or "expanded".
export function parseUiDensity(value: string | null | undefined): UiDensity {
  return value === "expanded" ? "expanded" : "compact";
}

// Get user settings. Create defaults if first time.
export async function getOrCreateUserSettings(
  userId: string,
): Promise<UserSettingsData> {
  const row =
    (await prisma.userSettings.findUnique({ where: { user_id: userId } })) ??
    (await prisma.userSettings.create({ data: { user_id: userId } }));

  return {
    alert_threshold: row.alert_threshold,
    ui_density: parseUiDensity(row.ui_density),
  };
}

// Update some user settings and return the new values.
export async function updateUserSettings(
  userId: string,
  patch: Partial<UserSettingsData>,
): Promise<UserSettingsData> {
  await getOrCreateUserSettings(userId);

  const data: Partial<{
    alert_threshold: number;
    ui_density: string;
  }> = {};

  if (patch.alert_threshold !== undefined) {
    data.alert_threshold = patch.alert_threshold;
  }
  if (patch.ui_density !== undefined) {
    data.ui_density = patch.ui_density;
  }

  const row = await prisma.userSettings.update({
    where: { user_id: userId },
    data,
  });

  return {
    alert_threshold: row.alert_threshold,
    ui_density: parseUiDensity(row.ui_density),
  };
}
