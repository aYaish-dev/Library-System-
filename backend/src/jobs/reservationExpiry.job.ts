import { prisma } from "../prisma";
import { Prisma, PrismaClient } from "@prisma/client";
import { auditLogTx } from "../services/audit.service";
import { promoteFromWaitlist } from "../services/availability.service";

const HOLD_HOURS = 24;

export async function runReservationExpiry() {
  const cutoff = new Date(Date.now() - HOLD_HOURS * 60 * 60 * 1000);

  const expired = await prisma.reservation.findMany({
    where: { isActive: true, createdAt: { lt: cutoff } },
    select: { id: true, userId: true, resourceId: true },
  });

  if (expired.length === 0) return { ok: true, expired: 0 };

  await prisma.$transaction(async (tx) => {
    for (const r of expired) {
      await tx.reservation.update({
        where: { id: r.id },
        data: { isActive: false },
      });

      await auditLogTx(tx as unknown as PrismaClient, {
        actorId: r.userId,
        action: "RESERVATION_EXPIRED",
        entity: "Reservation",
        entityId: r.id,
      });

      // promote next in line (if any)
      await promoteFromWaitlist(r.resourceId, tx as unknown as PrismaClient);
    }
  });

  return { ok: true, expired: expired.length };
}
