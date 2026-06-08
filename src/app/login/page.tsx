import { redirect } from "next/navigation";

// Redirects legacy /login URL to /auth/login.
export default function LoginRedirect() {
  redirect("/auth/login");
}
