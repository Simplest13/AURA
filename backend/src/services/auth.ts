// src/services/auth.ts
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { v4 as uuidv4 } from "uuid";
import { db } from "../database/repository";
import { config } from "../config";

export interface AuthResult {
  token: string;
  user: {
    id: string;
    name: string;
    email: string;
    createdAt?: string | Date | null;
  };
}

export type SafeUser = AuthResult["user"];

/** Strip password hashes and internal fields before any user object leaves the server. */
export function toSafeUser(user: any): SafeUser {
  const { password_hash, passwordHash, password, ...safe } = user ?? {};
  return {
    id: String(safe.id),
    name: safe.name ?? "Student",
    email: String(safe.email ?? ""),
    createdAt: safe.created_at ?? safe.createdAt ?? null,
  };
}

export async function register(name: string, email: string, password: string): Promise<AuthResult> {
  const normalizedEmail = String(email ?? "").trim().toLowerCase();
  if (!name?.trim()) throw { status: 400, message: "Name is required" };
  if (!normalizedEmail || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalizedEmail)) {
    throw { status: 400, message: "A valid email is required" };
  }
  if (!password || String(password).length < 8) {
    throw { status: 400, message: "Password must be at least 8 characters" };
  }

  // Duplicate registration check — never create a second account for one email.
  const existing = await db.findUserByEmail(normalizedEmail);
  if (existing) {
    throw {
      status: 409,
      message: "An account with this email already exists. Please sign in instead.",
    };
  }

  const passwordHash = await bcrypt.hash(password, 10);
  const user = {
    id: `usr-${uuidv4()}`, // unique surrogate id — never the email
    name: name.trim(),
    email: normalizedEmail,
    password_hash: passwordHash,
    preferred_tone: "concise",
    created_at: new Date(),
  };
  const created = await db.createUser(user);
  const token = jwt.sign({ userId: created.id }, config.jwtSecret, { expiresIn: "7d" });
  return { token, user: toSafeUser(created) };
}

export async function login(email: string, password: string): Promise<AuthResult> {
  const normalizedEmail = String(email ?? "").trim().toLowerCase();
  const user = await db.findUserByEmail(normalizedEmail);
  if (!user) {
    throw { status: 401, message: "Invalid email or password" };
  }
  const valid = await bcrypt.compare(String(password ?? ""), user.password_hash);
  if (!valid) {
    throw { status: 401, message: "Invalid email or password" };
  }
  const token = jwt.sign({ userId: user.id }, config.jwtSecret, { expiresIn: "7d" });
  return { token, user: toSafeUser(user) };
}

/** Issue a JWT for a user id. Used by demo-login. */
export function signToken(userId: string): string {
  return jwt.sign({ userId }, config.jwtSecret, { expiresIn: "7d" });
}

/** Load the current user from the authenticated user id (never from client input). */
export async function getUserById(userId: string): Promise<SafeUser | null> {
  const user = await db.findUserById(userId);
  return user ? toSafeUser(user) : null;
}
