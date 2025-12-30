import { Router } from "express";
import { z } from "zod";
import { requireAuth } from "../middleware/auth";
import { requireRole } from "../middleware/rbac";
import { checkoutCopy } from "../services/checkout.service";
import { Role } from "@prisma/client";

const checkoutRouter = Router();

// Only staff and admins can perform checkouts
checkoutRouter.use(requireAuth);
checkoutRouter.use(requireRole(Role.staff, Role.admin));

const checkoutSchema = z.object({
  userId: z.coerce.number(), // Handles string-to-number conversion automatically
  copyId: z.coerce.number(),
});

checkoutRouter.post("/", async (req, res) => {
  const parsed = checkoutSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: "Invalid input" });

  const { userId, copyId } = parsed.data;
  
  // Get the ID of the staff member performing the action
  const staffId = (req as any).user.sub; 

  try {
    const loan = await checkoutCopy({ userId, copyId, staffId });
    res.json(loan);
  } catch (e: any) {
    res.status(400).json({ error: e.message });
  }
});

export default checkoutRouter;