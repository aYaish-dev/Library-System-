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
    // release hold
    await prisma.resourceCopy.update({
      where: { id: copy.id },
      data: { status: "available", holdUntil: null },
    });

    await auditLogTx(prisma, {
      actorId: 1, // system actor (use a real system user id in your seed)
      action: "HOLD_RELEASED",
      entity: "ResourceCopy",
      entityId: copy.id,
    });

    // promote next reservation for the resource
    const nextUserId = await promoteFromWaitlist(copy.resourceId, prisma);

    if (nextUserId) {
      const holdUntil = new Date();
      holdUntil.setDate(holdUntil.getDate() + 2);

      await prisma.resourceCopy.update({
        where: { id: copy.id },
        data: { status: "on_hold", holdUntil },
      });

      await enqueueNotification({
        type: "HOLD_READY",
        userId: nextUserId,
        resourceId: copy.resourceId,
        copyId: copy.id,
      });

      await auditLogTx(prisma, {
        actorId: 1,
        action: "HOLD_SET",
        entity: "ResourceCopy",
        entityId: copy.id,
      });
    }
  }

  return { expiredCount: expired.length };
}
