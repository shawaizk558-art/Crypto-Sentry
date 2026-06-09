import { signOut } from "@/auth";

// Signs the user out and redirects to the login page.
export async function GET() {
  return signOut({ redirectTo: "/auth/login" });
}

export async function POST() {
  return signOut({ redirectTo: "/auth/login" });
}
