import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function notifyTx(
  params: { userId: number; type: string; message: string }
) {
  const n = await (prisma as any).notification.create({ data: params });
  console.log(`NOTIFY(${params.type}) user=${params.userId}: ${params.message}`);
  return n;
}

