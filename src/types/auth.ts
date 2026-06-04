import type { DefaultSession } from "next-auth";

declare module "next-auth" {
  interface Session {
    is2FAVerified?: boolean;
    user: {
      id: string;
      twoFactorEnabled: boolean;
      signup2FACompleted: boolean;
      is2FAVerified: boolean;
    } & DefaultSession["user"];
  }

  interface User {
    twoFactorEnabled?: boolean;
  }
}

export type AuthErrorCode =
  | "INVALID_CREDENTIALS"
  | "EMAIL_EXISTS"
  | "2FA_REQUIRED"
  | "INVALID_2FA"
  | "USER_NOT_FOUND";
