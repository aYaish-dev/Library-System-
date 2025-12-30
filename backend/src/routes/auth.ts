import { Router } from "express";
import { prisma } from "../prisma";
import bcrypt from "bcrypt";
import { z } from "zod";
import { signAccessToken, signRefreshToken } from "../utils/jwt";
import { requireAuth } from "../middleware/auth";
import { Role } from "@prisma/client";

export const authRouter = Router();

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
});

const registerSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
  name: z.string().min(2),
});

// --- LOGIN ---
authRouter.post("/login", async (req, res) => {
  const parsed = loginSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: "Invalid input" });

  const { email, password } = parsed.data;

  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) return res.status(401).json({ error: "Invalid credentials" });

  const ok = await bcrypt.compare(password, user.passwordHash);
  if (!ok) return res.status(401).json({ error: "Invalid credentials" });

  const accessToken = signAccessToken({ sub: user.id, role: user.role, email: user.email });
  const refreshToken = signRefreshToken({ sub: user.id, role: user.role });

  res.json({
    accessToken,
    refreshToken,
    user: { id: user.id, email: user.email, role: user.role, name: user.name },
  });
});

// --- REGISTER ---
authRouter.post("/register", async (req, res) => {
  const parsed = registerSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: "Invalid input. Password must be 6+ chars." });

  const { email, password, name } = parsed.data;

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) return res.status(400).json({ error: "User already exists" });

  const passwordHash = await bcrypt.hash(password, 10);

  // FIX: Added 'name' to the data object below
  const user = await prisma.user.create({
    data: {
      email,
      passwordHash,
      role: Role.student,
      name: name, 
    },
  });

  const accessToken = signAccessToken({ sub: user.id, role: user.role, email: user.email });
  
  res.json({
    message: "Registration successful",
    accessToken,
    user: { id: user.id, email: user.email, role: user.role, name: user.name }
  });
});

authRouter.get("/me", requireAuth, async (req, res) => {
  const userId = req.user?.id;
  if (!userId) return res.status(401).json({ error: "Unauthorized" });

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { id: true, email: true, role: true, name: true },
  });

  if (!user) return res.status(404).json({ error: "User not found" });

  res.json({ user });
});