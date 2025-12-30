import { prisma } from "../prisma";
import { promoteFromWaitlist } from "../services/availability.service";
import { enqueueNotification } from "../services/notify.service";
import { auditLogTx } from "../services/audit.service";

export async function runHoldExpirySweep() {
  const now = new Date();

  const expired = await prisma.resourceCopy.findMany({
    where: {
      status: "on_hold",
      holdUntil: { lte: now },
    },
  });

  for (const copy of expired) {
    // Check for next person in line
    const nextUserId = await promoteFromWaitlist(copy.resourceId, prisma);

    if (nextUserId) {
      // Rotate hold to next user
      const holdUntil = new Date();
      holdUntil.setDate(holdUntil.getDate() + 2);

      await prisma.resourceCopy.update({
        where: { id: copy.id },
        data: { 
          status: "on_hold", 
          holdUntil,
          holdUserId: nextUserId // <--- CRITICAL FIX
        },
      });

      await enqueueNotification({
        type: "HOLD_READY",
        userId: nextUserId,
        resourceId: copy.resourceId,
        copyId: copy.id,
      });

      await auditLogTx(prisma, {
        actorId: 1, 
        action: "HOLD_ROTATED",
        entity: "ResourceCopy",
        entityId: copy.id,
      });
    } else {
      // No one else waiting, release to available
      await prisma.resourceCopy.update({
        where: { id: copy.id },
        data: { status: "available", holdUntil: null, holdUserId: null },
      });

      await auditLogTx(prisma, {
        actorId: 1, 
        action: "HOLD_RELEASED",
        entity: "ResourceCopy",
        entityId: copy.id,
      });
    }
  }

  return { expiredCount: expired.length };
}