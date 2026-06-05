import { signOut } from "@/auth";

export async function POST() {
  return signOut({ redirectTo: "/auth/login" });
}
