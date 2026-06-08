import { redirect } from "next/navigation";

// Redirects legacy /signup URL to /auth/signup.
export default function SignupRedirect() {
  redirect("/auth/signup");
}
