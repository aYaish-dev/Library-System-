import { Router } from "express";
import { prisma } from "../prisma";
import { z } from "zod";
import { requireAuth } from "../middleware/auth";
import { requireRole } from "../middleware/rbac";
import { CopyStatus, Role } from "@prisma/client";

export const adminRouter = Router();

adminRouter.use(requireAuth);
adminRouter.use(requireRole(Role.staff, Role.admin));

const statusSchema = z.object({
  status: z.nativeEnum(CopyStatus),
});

adminRouter.patch("/copies/:id/status", async (req, res) => {
  const id = Number(req.params.id);
  const parsed = statusSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: "Invalid status" });

  const updated = await prisma.resourceCopy.update({
    where: { id },
    data: { status: parsed.data.status },
    select: { id: true, status: true },
  });

  const actor = (req as any).user;

  await prisma.auditLog.create({
    data: {
      actorId: actor.sub,
      action: "copy_status_update",
      entity: "resource_copy",
      entityId: String(id),
      meta: { newStatus: updated.status },
    },
  });

  res.json({ ok: true, copy: updated });
});
