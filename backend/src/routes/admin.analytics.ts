import { Role } from "@prisma/client";
import { Router } from "express";
import { requireAuth } from "../middleware/auth";
import { requireRole } from "../middleware/rbac";
import { prisma } from "../prisma";

const router = Router();

router.use(requireAuth);
router.use(requireRole(Role.staff, Role.admin));

// 1. Top Borrowed Books (Returns Array of { title, _count: { loans } })
router.get("/top-borrowed", async (_req, res) => {
  // Group loans by Copy ID first
  const loanCounts = await prisma.loan.groupBy({
    by: ["copyId"],
    _count: { _all: true },
  });

  // Calculate totals per Resource (Book)
  const resourceMap = new Map<number, number>();

  for (const item of loanCounts) {
    // Fetch the copy to know which resource it belongs to
    const copy = await prisma.resourceCopy.findUnique({
      where: { id: item.copyId },
      select: { resourceId: true }
    });

    if (copy) {
      const current = resourceMap.get(copy.resourceId) || 0;
      resourceMap.set(copy.resourceId, current + item._count._all);
    }
  }

  // Fetch titles for the top resources
  const results = [];
  for (const [resourceId, count] of resourceMap.entries()) {
    const resource = await prisma.resource.findUnique({
      where: { id: resourceId },
      select: { title: true }
    });
    if (resource) {
      results.push({ title: resource.title, _count: { loans: count } });
    }
  }

  // Sort by count descending and take top 5
  const top5 = results.sort((a, b) => b._count.loans - a._count.loans).slice(0, 5);

  res.json(top5); // Send direct Array
});

// 2. Overdue Loans (Returns Array of Loans)
router.get("/overdue", async (_req, res) => {
  const now = new Date();
  const overdue = await prisma.loan.findMany({
    where: { returnedAt: null, dueAt: { lt: now } },
    include: { user: true, copy: { include: { resource: true } } },
  });

  res.json(overdue); // Send direct Array
});

// 3. Waitlist Pressure (Returns Array of { title, _count: { id } })
router.get("/waitlist-pressure", async (_req, res) => {
  const pressure = await prisma.reservation.groupBy({
    by: ["resourceId"],
    where: { isActive: true },
    _count: { _all: true }, // Using _all as alias for counting IDs
  });

  const results = [];
  
  for (const item of pressure) {
    const resource = await prisma.resource.findUnique({
      where: { id: item.resourceId },
      select: { title: true }
    });

    if (resource) {
      results.push({ 
        title: resource.title, 
        _count: { id: item._count._all } // Match frontend format
      });
    }
  }

  res.json(results); // Send direct Array
});

export default router;