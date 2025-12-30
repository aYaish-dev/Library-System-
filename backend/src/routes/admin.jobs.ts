import { Role } from "@prisma/client";
import { Router } from "express";
import { requireAuth } from "../middleware/auth";
import { requireRole } from "../middleware/rbac";
import { runReservationExpiry } from "../jobs/reservationExpiry.job";

const router = Router();
router.use(requireAuth);
router.use(requireRole(Role.staff, Role.admin));
router.post("/run-reservation-expiry", async (_req, res) => {
  const result = await runReservationExpiry();
  res.json(result);
});

export default router;
