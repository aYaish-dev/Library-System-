import { PrismaClient } from "@prisma/client";

export function auditLogTx(
  tx: PrismaClient,
  params: {
    actorId: number;
    action: string;
    entity: string;
    entityId: number;
  }
) {
  return tx.auditLog.create({
    data: params,
  });
}
