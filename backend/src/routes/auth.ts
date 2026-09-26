// src/routes/auth.ts
import { Router } from "express";
import { register, login } from "../services/auth";
import { authenticate } from "../middleware/authenticate";

const router = Router();

// Register a new user
router.post("/register", async (req, res) => {
  const { name, email, password } = req.body;
  try {
    const result = await register(name, email, password);
    res.status(201).json(result);
  } catch (err: any) {
    res.status(err.status || 500).json({ error: err.message || "Server error" });
  }
});

// Login existing user
router.post("/login", async (req, res) => {
  const { email, password } = req.body;
  try {
    const result = await login(email, password);
    res.json(result);
  } catch (err: any) {
    res.status(err.status || 500).json({ error: err.message || "Server error" });
  }
});

// Example protected endpoint
router.get("/me", authenticate, async (req, res) => {
  // In a real app you would fetch user info from DB using req.userId
  res.json({ message: "Authenticated", userId: (req as any).userId });
});

export default router;
