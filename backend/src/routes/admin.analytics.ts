import { Router } from "express";
import { prisma } from "../prisma";

const router = Router();

router.get("/top-borrowed", async (_req, res) => {
  // count loans per resource via joins
  const rows = await prisma.loan.groupBy({
    by: ["copyId"],
    _count: { _all: true },
  });

  res.json({ ok: true, rows });
});

router.get("/overdue", async (_req, res) => {
  const now = new Date();
  const overdue = await prisma.loan.findMany({
    where: { returnedAt: null, dueAt: { lt: now } },
    include: { user: true, copy: { include: { resource: true } } },
  });

  res.json({ ok: true, count: overdue.length, overdue });
});

router.get("/waitlist-pressure", async (_req, res) => {
  const pressure = await prisma.reservation.groupBy({
    by: ["resourceId"],
    where: { isActive: true },
    _count: { _all: true },
  });

  res.json({ ok: true, pressure });
});

export default router;
