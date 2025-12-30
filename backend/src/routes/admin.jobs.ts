import { Router } from "express";
import { runReservationExpiry } from "../jobs/reservationExpiry.job";

const router = Router();

router.post("/run-reservation-expiry", async (_req, res) => {
  const result = await runReservationExpiry();
  res.json(result);
});

export default router;
