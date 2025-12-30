import { Router } from "express";
import { z } from "zod";
import { requireAuth } from "../middleware/auth";
import { requireRole } from "../middleware/rbac";
import { Role } from "@prisma/client";
import { checkoutCopy } from "../services/checkout.service";

const router = Router();

const checkoutSchema = z.object({
  userId: z.number(),
  copyId: z.number(),
});

router.post("/", requireAuth, requireRole(Role.staff, Role.admin), async (req, res) => {
  const parsed = checkoutSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: "Invalid input" });

  const staffId = req.user?.id;
  if (!staffId) return res.status(401).json({ error: "Unauthorized" });

  try {
    const loan = await checkoutCopy({ ...parsed.data, staffId });
    res.json(loan);
  } catch (e: any) {
    res.status(400).json({ error: e.message || "Checkout failed" });
  }
});

export default router;