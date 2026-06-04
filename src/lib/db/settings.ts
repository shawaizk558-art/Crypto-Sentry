import "server-only";
import { prisma } from "@/lib/db/prisma";

export async function getOrCreateUserSettings(userId: string) {
  return prisma.userSettings.upsert({
    where: { user_id: userId },
    create: { user_id: userId },
    update: {},
  });
}

export async function updateUserSettings(
  userId: string,
  data: {
    alert_threshold?: number;
    aggressive_polling?: boolean;
    ui_density?: string;
    email_reports?: boolean;
  },
) {
  await getOrCreateUserSettings(userId);
  return prisma.userSettings.update({
    where: { user_id: userId },
    data,
  });
}
