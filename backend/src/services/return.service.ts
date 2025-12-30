import type { PrismaClient } from "@prisma/client";
import { prisma } from "../prisma";
import { promoteFromWaitlist } from "./availability.service";
import { auditLogTx } from "./audit.service";

export async function returnCopy(copyId: number, staffId: number) {
  return prisma.$transaction(async (tx) => {
    const copy = await tx.resourceCopy.findUnique({
      where: { id: copyId },
    });

    if (!copy) throw new Error("Copy not found");

    await tx.resourceCopy.update({
      where: { id: copyId },
      data: { status: "available" },
    });

    await auditLogTx(tx as unknown as PrismaClient, {
      actorId: staffId,
      action: "RETURN",
      entity: "ResourceCopy",
      entityId: copyId,
    });

    const userId = await promoteFromWaitlist(copy.resourceId, tx as unknown as PrismaClient);

    if (userId) {
      await tx.resourceCopy.update({
        where: { id: copyId },
        data: { status: "on_hold" },
      });

      await auditLogTx(tx as unknown as PrismaClient, {
        actorId: staffId,
        action: "HOLD_SET",
        entity: "ResourceCopy",
        entityId: copyId,
      });
    }

    return userId;
  });
}
