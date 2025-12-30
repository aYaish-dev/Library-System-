import { Router } from "express";
import { prisma } from "../prisma";
import { requireAuth } from "../middleware/auth";

const router = Router();

/**
 * POST /api/reservations
 * Create reservation (join waitlist)
 */
router.post("/", requireAuth, async (req, res) => {
  const userId = req.user?.id;
  if (!userId) return res.status(401).json({ error: "Unauthorized" });
  const { resourceId } = req.body;

  if (!resourceId) {
    return res.status(400).json({ error: "resourceId required" });
  }

  const reservation = await prisma.reservation.create({
    data: {
      userId,
      resourceId,
    },
  });

  res.json(reservation);
});

/**
 * GET /api/reservations/me
 * Current user's reservations
 */
router.get("/me", requireAuth, async (req, res) => {
  const userId = req.user?.id;
  if (!userId) return res.status(401).json({ error: "Unauthorized" });
  const reservations = await prisma.reservation.findMany({
    where: { userId },
    include: { resource: true },
    orderBy: { createdAt: "desc" },
  });

  res.json(reservations);
});

export default router;
