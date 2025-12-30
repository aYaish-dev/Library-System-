import { Router } from "express";
import { prisma } from "../prisma";
import { requireAuth } from "../middleware/auth";

const router = Router();

/**
 * POST /api/reservations
 * Create reservation (join waitlist)
 */
router.post("/", requireAuth, async (req, res) => {
  try {
    const userId = req.user?.id;
    if (!userId) return res.status(401).json({ error: "Unauthorized" });

    // SAFETY FIX: Convert to Number to prevent "Expected Int, provided String" errors
    const resourceId = Number(req.body.resourceId);

    if (!resourceId || isNaN(resourceId)) {
      return res.status(400).json({ error: "Valid resourceId required" });
    }

    // Check if resource exists first (Prevents FK constraint errors)
    const resource = await prisma.resource.findUnique({ where: { id: resourceId } });
    if (!resource) {
      return res.status(404).json({ error: "Book not found. Please refresh the page." });
    }

    // Check if already reserved (Optional logic, good for UX)
    const existing = await prisma.reservation.findFirst({
      where: { userId, resourceId, isActive: true }
    });

    if (existing) {
      return res.status(400).json({ error: "You have already reserved this book." });
    }

    const reservation = await prisma.reservation.create({
      data: {
        userId,
        resourceId,
        isActive: true
      },
    });

    res.json({ message: "Success! Added to waitlist.", reservation });
  } catch (e: any) {
    console.error("Reservation Error:", e);
    res.status(500).json({ error: "Failed to reserve book." });
  }
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