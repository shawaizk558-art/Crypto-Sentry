import bcrypt from "bcrypt";

const SALT_ROUNDS = 12;

// Turn a password into a safe hash for storage.
export async function hashPassword(plain: string): Promise<string> {
  return bcrypt.hash(plain, SALT_ROUNDS);
}

// Check if a password matches the stored hash.
export async function verifyPassword(plain: string, hash: string): Promise<boolean> {
  return bcrypt.compare(plain, hash);
}
