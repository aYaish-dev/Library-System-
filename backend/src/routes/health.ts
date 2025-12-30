import { Router } from "express";
import { prisma } from "../prisma.js";

export const healthRouter = Router();

healthRouter.get("/", async (req, res) => {
  await prisma.$queryRaw`SELECT 1`;
  res.json({ ok: true, db: true });
});
