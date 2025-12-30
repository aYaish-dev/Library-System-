import { Router } from "express";
import { prisma } from "../prisma";
import { promoteFromWaitlist } from "../services/availability.service";

const router = Router();

/**
 * POST /api/returns/:copyId
 * Staff returns a copy
 */
router.post("/:copyId", async (req, res) => {
  const copyId = Number(req.params.copyId);

  const copy = await prisma.resourceCopy.findUnique({
    where: { id: copyId },
    include: { resource: true },
  });

  if (!copy) {
    return res.status(404).json({ error: "Copy not found" });
  }
  
  // Mark copy available
  await prisma.resourceCopy.update({
    where: { id: copyId },
    data: { status: "available" },
  });

  // Try to promote next user
  const userId = await promoteFromWaitlist(copy.resourceId, prisma);

  if (userId) {
    await prisma.resourceCopy.update({
      where: { id: copyId },
      data: { status: "on_hold" },
    });
  }

  res.json({
    ok: true,
    promotedUserId: userId ?? null,
  });
});

export default router;
