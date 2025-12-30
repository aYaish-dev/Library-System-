import { prisma } from "../prisma";

export async function addToWaitlist(userId: number, resourceId: number) {
  return prisma.reservation.create({
    data: {
      userId,
      resourceId,
      isActive: true,
    },
  });
}
