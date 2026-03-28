import crypto from "node:crypto";

export function hashPassword(password: string) {
  const salt = crypto.randomBytes(16).toString("hex");
  const hash = crypto.pbkdf2Sync(password, salt, 150000, 32, "sha256").toString("hex");
  return `pbkdf2_sha256$150000$${salt}$${hash}`;
}

export function verifyPassword(password: string, stored: string) {
  const parts = String(stored || "").split("$");
  if (parts.length !== 5) return false;
  const [algo, iterStr, , salt, hash] = parts;
  if (algo !== "pbkdf2_sha256") return false;
  const iters = Number(iterStr);
  if (!Number.isFinite(iters) || iters < 10000) return false;
  const computed = crypto.pbkdf2Sync(password, salt, iters, 32, "sha256").toString("hex");
  return crypto.timingSafeEqual(Buffer.from(hash, "hex"), Buffer.from(computed, "hex"));
}
