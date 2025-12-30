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

    // FIX 3: Check waitlist FIRST
    const nextUserId = await promoteFromWaitlist(copy.resourceId, tx as unknown as PrismaClient);

    if (nextUserId) {
      // FIX 4: Set status to 'on_hold' AND assign the user
      const holdExpires = new Date();
      holdExpires.setDate(holdExpires.getDate() + 3);

      await tx.resourceCopy.update({
        where: { id: copyId },
        data: { 
          status: "on_hold",
          holdUserId: nextUserId, // <--- CRITICAL FIX
          holdUntil: holdExpires
        },
      });

      await auditLogTx(tx as unknown as PrismaClient, {
        actorId: staffId,
        action: "HOLD_SET",
        entity: "ResourceCopy",
        entityId: copyId,
      });
    } else {
      // Only make available if NO ONE is waiting
      await tx.resourceCopy.update({
        where: { id: copyId },
        data: { 
          status: "available",
          holdUserId: null,
          holdUntil: null
        },
      });

      await auditLogTx(tx as unknown as PrismaClient, {
        actorId: staffId,
        action: "RETURN",
        entity: "ResourceCopy",
        entityId: copyId,
      });
    }

    return nextUserId;
  });
}