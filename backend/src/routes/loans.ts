import { Router } from "express";
import { prisma } from "../prisma";
import { requireAuth } from "../middleware/auth";

const router = Router();

router.get("/me", requireAuth, async (req, res) => {
  const userId = req.user!.id;
  const loans = await prisma.loan.findMany({
    where: { userId },
    include: { copy: { include: { resource: true } } },
    orderBy: { dueAt: "asc" },
  });

  // Calculate Real-Time Fines on the fly
  const now = new Date();
  const enrichedLoans = loans.map(loan => {
    let fine = loan.fineAmount;
    if (!loan.returnedAt && now > loan.dueAt) {
      const diffTime = Math.abs(now.getTime() - loan.dueAt.getTime());
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)); 
      fine = diffDays * 0.50; // $0.50 per day
    }
    return { ...loan, calculatedFine: fine };
  });

  res.json(enrichedLoans);
});

export default router;