import { Router } from "express";
import { popNotification } from "../services/notify.service";

const router = Router();

// dev endpoint to simulate a worker
router.post("/pop", async (_req, res) => {
  const item = await popNotification();
  res.json({ item });
});

export default router;
