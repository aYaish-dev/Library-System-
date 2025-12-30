import { prisma } from "../prisma";
import type { Prisma, PrismaClient } from "@prisma/client";

export async function promoteFromWaitlist(
  resourceId: number,
  tx: Prisma.TransactionClient | PrismaClient
) {
  const reservation = await tx.reservation.findFirst({
    where: {
      resourceId,
      isActive: true,
    },
    orderBy: { createdAt: "asc" },
  });

  if (!reservation) return null;

  await tx.reservation.update({
    where: { id: reservation.id },
    data: { isActive: false },
  });

  return reservation.userId;
}
