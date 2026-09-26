// src/services/auth.ts
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { db } from "../database/repository";
import { config } from "../config";

export interface AuthResult {
  token: string;
  user: any; // user object without password hash
}

export async function register(name: string, email: string, password: string): Promise<AuthResult> {
  // Ensure email not already used
  const existing = await db.findUserByEmail(email);
  if (existing) {
    throw { status: 400, message: "User already exists" };
  }
  const passwordHash = await bcrypt.hash(password, 10);
  const user = {
    id: `usr-${Date.now()}`,
    name,
    email,
    password_hash: passwordHash,
    preferred_tone: "concise",
  };
  const created = await db.createUser(user);
  const token = jwt.sign({ userId: created.id }, config.jwtSecret, { expiresIn: "7d" });
  const { password_hash, ...userWithoutHash } = created;
  return { token, user: userWithoutHash };
}

export async function login(email: string, password: string): Promise<AuthResult> {
  const user = await db.findUserByEmail(email);
  if (!user) {
    throw { status: 400, message: "Invalid credentials" };
  }
  const valid = await bcrypt.compare(password, user.password_hash);
  if (!valid) {
    throw { status: 400, message: "Invalid credentials" };
  }
  const token = jwt.sign({ userId: user.id }, config.jwtSecret, { expiresIn: "7d" });
  const { password_hash, ...userWithoutHash } = user;
  return { token, user: userWithoutHash };
}
