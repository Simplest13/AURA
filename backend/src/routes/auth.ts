// src/routes/auth.ts
import { Router } from "express";
import { register, login, getUserById } from "../services/auth";
import { authenticate, AuthenticatedRequest } from "../middleware/authenticate";

const router = Router();

// Register a new account → JWT + safe user (auto sign-in flow)
router.post("/register", async (req, res) => {
  const { name, email, password } = req.body ?? {};
  try {
    const result = await register(name, email, password);
    res.status(201).json(result);
  } catch (err: any) {
    res.status(err.status || 500).json({ error: err.message || "Server error" });
  }
});

// Login existing user → JWT + safe user
router.post("/login", async (req, res) => {
  const { email, password } = req.body ?? {};
  try {
    const result = await login(email, password);
    res.json(result);
  } catch (err: any) {
    res.status(err.status || 500).json({ error: err.message || "Server error" });
  }
});

// Session check: validate the token and return the real user from the database.
// The mobile app calls this on startup (restoreSession) and on 401 recovery.
router.get("/me", authenticate, async (req, res) => {
  try {
    const user = await getUserById((req as AuthenticatedRequest).userId!);
    if (!user) return res.status(401).json({ error: "Account no longer exists" });
    res.json({ user });
  } catch (err: any) {
    res.status(500).json({ error: err.message || "Server error" });
  }
});

// Explicit logout endpoint. JWTs are stateless, so the client discards the token;
// this endpoint exists so the client can notify the server and stay future-proof
// for a token blocklist.
router.post("/logout", authenticate, async (_req, res) => {
  res.json({ ok: true, message: "Session closed. Discard the token client-side." });
});

export default router;
