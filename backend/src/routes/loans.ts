import { Router } from "express";
import { prisma } from "../prisma";
import { requireAuth } from "../middleware/auth";
import type { User } from "@prisma/client";

const router = Router();

/**
 * GET /api/loans/me
 * Current user's active loans
 */
router.get("/me", requireAuth, async (req, res) => {
  const userId = req.user?.id;
  if (!userId) return res.status(401).json({ error: "Unauthorized" });

  const loans = await prisma.loan.findMany({
    where: {
      userId,
      returnedAt: null,
    },
    include: {
      copy: {
        include: {
          resource: true,
        },
      },
    },
    orderBy: { id: "desc" },
  });

  res.json(loans);
});

export default router;
